"""FastAPI router for email response monitoring (Gmail, Outlook) and status tracking."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
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


@router.get("/status")
def get_email_status():
    """Returns the current email monitoring integration status."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if not rec or not rec.connected:
            return {
                "connected": False,
                "provider": "gmail",
                "email": "",
                "monitoring_enabled": False,
                "last_checked_at": None,
                "responses": [],
            }

        settings = rec.settings or {}
        return {
            "connected": True,
            "provider": settings.get("provider", "gmail"),
            "email": settings.get("email", ""),
            "monitoring_enabled": settings.get("monitoring_enabled", True),
            "last_checked_at": rec.last_synced_at.isoformat() if rec.last_synced_at else None,
            "responses": settings.get("responses", []),
        }
    finally:
        db.close()


@router.post("/connect")
def connect_email(b: EmailConnectIn):
    """Configures candidate email for recruiter response monitoring."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "email").first()
        if not rec:
            rec = IntegrationRecord(id="email")
            db.add(rec)

        settings = rec.settings or {}
        settings["provider"] = b.provider
        settings["email"] = b.email
        settings["monitoring_enabled"] = b.monitoring_enabled
        if "responses" not in settings:
            settings["responses"] = []

        rec.settings = settings
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

        # Store in integration record responses history
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
            rec.last_synced_at = datetime.now(timezone.utc)
            db.commit()

        return result
    finally:
        db.close()
