"""Email response monitoring & remote control service.
Monitors incoming candidate communications (Gmail, Outlook, IMAP)
to detect recruiter responses, interview requests, and application progressions,
mirrors updates to local applications and Notion, and executes remote control commands.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import re
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from services.database import SessionLocal, ApplicationRecord, IntegrationRecord, PlatformCredentialRecord
from services import notion

DEFAULT_CANDIDATE_EMAIL = "parejasarronkian@gmail.com"

INTERVIEW_KEYWORDS = [
    "interview", "phone screen", "video call", "chat with our team",
    "next round", "availability for a call", "hiring manager", "speak with you",
    "schedule a time", "invitation to interview", "take-home"
]

OFFER_KEYWORDS = [
    "offer letter", "formal offer", "congratulations", "pleased to offer",
    "welcome to the team", "job offer"
]

REJECTION_KEYWORDS = [
    "not moving forward", "other applicants", "other candidates", "unfortunately",
    "future endeavors", "decided to pursue", "high volume of applications",
    "position has been filled", "not selected"
]

INQUIRY_KEYWORDS = [
    "assessment", "code test", "questionnaire", "quick question",
    "additional information", "work authorization"
]


def classify_email(subject: str, body: str) -> str:
    """Classifies an incoming recruiter email into a standard application status."""
    text = f"{subject} {body}".lower()

    for kw in OFFER_KEYWORDS:
        if kw in text:
            return "offer"

    for kw in INTERVIEW_KEYWORDS:
        if kw in text:
            return "interview"

    for kw in REJECTION_KEYWORDS:
        if kw in text:
            return "rejected"

    for kw in INQUIRY_KEYWORDS:
        if kw in text:
            return "inquiry"

    return "update"


async def process_recruiter_response(
    db: Session,
    company: str,
    subject: str,
    snippet: str,
    sender: str = "",
    status_override: Optional[str] = None
) -> Dict[str, Any]:
    """Processes a detected recruiter email, updates matching application, and syncs to Notion."""
    classification = status_override or classify_email(subject, snippet)

    apps = db.query(ApplicationRecord).all()
    target_app = None
    for a in apps:
        if a.company.lower() in company.lower() or company.lower() in a.company.lower():
            target_app = a
            break

    now_iso = datetime.now(timezone.utc).isoformat()
    app_updated = False
    notion_updated = False

    if target_app:
        target_app.status = classification
        events = list(target_app.events or [])
        events.append({
            "at": now_iso,
            "text": f"Email ({classification.upper()}): {subject}"
        })
        target_app.events = events
        app_updated = True

        notion_rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
        if notion_rec and notion_rec.connected and notion_rec.token and getattr(target_app, "notion_page_id", None):
            try:
                notion_status_label = classification.upper()
                notion_updated = await notion.update_page_status(
                    notion_rec.token,
                    target_app.notion_page_id,
                    notion_status_label
                )
            except Exception:
                notion_updated = False

    db.commit()

    return {
        "ok": True,
        "company": company,
        "subject": subject,
        "classification": classification,
        "matched_application_id": target_app.id if target_app else None,
        "application_updated": app_updated,
        "notion_updated": notion_updated,
        "timestamp": now_iso,
    }


def parse_and_execute_email_command(
    db: Session,
    sender: str,
    subject: str,
    body: str = "",
) -> Dict[str, Any]:
    """Parses incoming candidate control emails (STATUS, PAUSE, RESUME, APPLY) and executes commands."""
    sender_clean = sender.strip().lower()
    command_text = f"{subject.strip()} {body.strip()}".upper()

    now_iso = datetime.now(timezone.utc).isoformat()

    # Determine command keyword
    cmd = "UNKNOWN"
    response_msg = ""
    swarm_state = "RUNNING"

    rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
    if not rec:
        rec = IntegrationRecord(id="email", connected=True)
        db.add(rec)

    settings = dict(rec.settings or {})
    current_paused = settings.get("swarm_paused", False)

    if "STATUS" in command_text:
        cmd = "STATUS"
        total_apps = db.query(ApplicationRecord).count()
        applied_apps = db.query(ApplicationRecord).filter(ApplicationRecord.status == "APPLIED").count()
        response_msg = (
            f"itsLARP Status: {'PAUSED' if current_paused else 'ACTIVE'}. "
            f"Total Applications: {total_apps} ({applied_apps} submitted). "
            f"Monitored candidate email: {DEFAULT_CANDIDATE_EMAIL}."
        )
    elif "PAUSE" in command_text or "STOP" in command_text:
        cmd = "PAUSE"
        settings["swarm_paused"] = True
        response_msg = "itsLARP Swarm Paused. All active application agents have been temporarily halted."
    elif "RESUME" in command_text or "START" in command_text:
        cmd = "RESUME"
        settings["swarm_paused"] = False
        response_msg = "itsLARP Swarm Resumed. Background agents are actively scanning and applying."
    elif "APPLY" in command_text:
        cmd = "APPLY"
        match = re.search(r"APPLY\s+(\d+)", command_text)
        count = int(match.group(1)) if match else 10
        settings["target_application_quota"] = count
        response_msg = f"itsLARP Goal Updated: Swarm targeted to apply for {count} verified matching roles."
    else:
        cmd = "HELP"
        response_msg = "Available itsLARP email commands: STATUS, PAUSE, RESUME, APPLY [COUNT]."

    # Save command to integration log
    cmd_log = list(settings.get("commands_log", []))
    cmd_log.insert(0, {
        "command": cmd,
        "sender": sender,
        "subject": subject,
        "executed_at": now_iso,
        "response": response_msg,
    })
    settings["commands_log"] = cmd_log[:20]
    rec.settings = settings
    flag_modified(rec, "settings")
    rec.last_synced_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "ok": True,
        "command": cmd,
        "acknowledged": True,
        "response_message": response_msg,
        "swarm_paused": settings.get("swarm_paused", False),
        "target_quota": settings.get("target_application_quota", 10),
        "sender": sender,
        "timestamp": now_iso,
    }


def record_device_notification(
    db: Session,
    event_type: str,
    title: str,
    message: str,
    recipient: str = DEFAULT_CANDIDATE_EMAIL,
) -> Dict[str, Any]:
    """Records an alert for desktop/mobile notifications and email monitoring."""
    now_iso = datetime.now(timezone.utc).isoformat()
    rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
    if not rec:
        rec = IntegrationRecord(id="email", connected=True)
        db.add(rec)

    settings = dict(rec.settings or {})
    notifs = list(settings.get("device_notifications", []))
    item = {
        "id": f"notif-{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "event_type": event_type,
        "title": title,
        "message": message,
        "recipient": recipient,
        "timestamp": now_iso,
        "read": False,
    }
    notifs.insert(0, item)
    settings["device_notifications"] = notifs[:30]
    rec.settings = settings
    flag_modified(rec, "settings")
    db.commit()

    return item
