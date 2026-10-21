"""FastAPI router for email response monitoring (Gmail, Outlook), remote control commands, and device alerts."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm.attributes import flag_modified
from services.database import SessionLocal, IntegrationRecord
from services import email_monitor

router = APIRouter(prefix="/integrations/email", tags=["email_monitor"])


class EmailConnectIn(BaseModel):
    provider: str = Field(default="gmail")  # "gmail", "outlook", "custom"
    email: str = Field(min_length=5)
    monitoring_enabled: bool = True


class SimulateResponseIn(BaseModel):
    company: str
    subject: str
    snippet: str
    sender: Optional[str] = ""
    status_override: Optional[str] = None


class EmailCommandIn(BaseModel):
    sender: Optional[str] = email_monitor.DEFAULT_CANDIDATE_EMAIL
    subject: str
    body: Optional[str] = ""


class SendNotificationIn(BaseModel):
    event_type: str = "job_search_complete"
    title: str
    message: str
    recipient: Optional[str] = email_monitor.DEFAULT_CANDIDATE_EMAIL


@router.get("/status")
def get_email_status():
    """Returns the current email monitoring integration status, device notifications, and command log."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        default_email = email_monitor.DEFAULT_CANDIDATE_EMAIL

        if not rec:
            rec = IntegrationRecord(
                id="email",
                connected=True,
                settings={
                    "provider": "gmail",
                    "email": default_email,
                    "monitoring_enabled": True,
                    "device_notifications_enabled": True,
                    "responses": [],
                    "commands_log": [],
                    "device_notifications": [],
                }
            )
            db.add(rec)
            db.commit()

        settings = rec.settings or {}
        email_addr = settings.get("email") or default_email

        return {
            "connected": rec.connected,
            "provider": settings.get("provider", "gmail"),
            "email": email_addr,
            "monitoring_enabled": settings.get("monitoring_enabled", True),
            "device_notifications_enabled": settings.get("device_notifications_enabled", True),
            "swarm_paused": settings.get("swarm_paused", False),
            "last_checked_at": rec.last_synced_at.isoformat() if rec.last_synced_at else None,
            "responses": settings.get("responses", []),
            "commands_log": settings.get("commands_log", []),
            "device_notifications": settings.get("device_notifications", []),
        }
    finally:
        db.close()


@router.post("/connect")
def connect_email(b: EmailConnectIn):
    """Configures candidate email for recruiter response monitoring and remote control."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if not rec:
            rec = IntegrationRecord(id="email")
            db.add(rec)

        settings = dict(rec.settings or {})
        settings["provider"] = b.provider
        settings["email"] = b.email.strip()
        settings["monitoring_enabled"] = b.monitoring_enabled
        if "responses" not in settings:
            settings["responses"] = []
        if "commands_log" not in settings:
            settings["commands_log"] = []
        if "device_notifications" not in settings:
            settings["device_notifications"] = []

        rec.settings = settings
        flag_modified(rec, "settings")
        rec.connected = True
        rec.last_synced_at = datetime.now(timezone.utc)
        db.commit()

        return {
            "ok": True,
            "provider": b.provider,
            "email": b.email,
            "monitoring_enabled": b.monitoring_enabled,
        }
    finally:
        db.close()


@router.post("/disconnect")
def disconnect_email():
    """Disconnects email monitoring."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if rec:
            rec.connected = False
            db.commit()
        return {"ok": True}
    finally:
        db.close()


@router.post("/command")
def execute_email_command(b: EmailCommandIn):
    """Executes a remote control command received via email (STATUS, PAUSE, RESUME, APPLY [COUNT])."""
    db = SessionLocal()
    try:
        sender = b.sender or email_monitor.DEFAULT_CANDIDATE_EMAIL
        result = email_monitor.parse_and_execute_email_command(
            db=db,
            sender=sender,
            subject=b.subject,
            body=b.body or "",
        )
        return result
    finally:
        db.close()


@router.post("/send-notification")
def send_device_notification(b: SendNotificationIn):
    """Emits an alert for device/browser notifications and email logs."""
    db = SessionLocal()
    try:
        item = email_monitor.record_device_notification(
            db=db,
            event_type=b.event_type,
            title=b.title,
            message=b.message,
            recipient=b.recipient or email_monitor.DEFAULT_CANDIDATE_EMAIL,
        )
        return {"ok": True, "notification": item}
    finally:
        db.close()


@router.post("/simulate-response")
async def simulate_recruiter_email(b: SimulateResponseIn):
    """Test harness: simulates an incoming recruiter email to test classification and Notion sync."""
    db = SessionLocal()
    try:
        result = await email_monitor.process_recruiter_response(
            db=db,
            company=b.company,
            subject=b.subject,
            snippet=b.snippet,
            sender=b.sender or "",
            status_override=b.status_override,
        )

        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if rec:
            settings = dict(rec.settings or {})
            responses = list(settings.get("responses", []))
            responses.insert(0, {
                "company": b.company,
                "subject": b.subject,
                "snippet": b.snippet,
                "classification": result["classification"],
                "date": datetime.now(timezone.utc).isoformat(),
            })
            settings["responses"] = responses[:25]
            rec.settings = settings
            flag_modified(rec, "settings")
            rec.last_synced_at = datetime.now(timezone.utc)
            db.commit()

        return result
    finally:
        db.close()
