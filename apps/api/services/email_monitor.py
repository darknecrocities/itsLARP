"""Email response monitoring service.
Monitors incoming candidate communications (Gmail, Outlook, IMAP)
to detect recruiter responses, interview requests, and application progressions,
and mirrors updates to local applications and Notion.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import re
from sqlalchemy.orm import Session
from services.database import SessionLocal, ApplicationRecord, IntegrationRecord
from services import notion

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

    # Find matching application by company name
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

        # Sync to Notion if page ID exists
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
