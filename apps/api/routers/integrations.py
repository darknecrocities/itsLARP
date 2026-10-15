from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import httpx

from services import notion
from services.database import SessionLocal, ApplicationRecord

router = APIRouter(tags=["Analytics & Integrations"])

@router.get("/analytics")
def analytics_get():
    db = SessionLocal()
    try:
        apps = db.query(ApplicationRecord).all()
        sent = [a for a in apps if a.status not in ["SAVED", "ANALYZING", "PREPARING", "READY"]]
        total = len(sent)
        resp = len([a for a in sent if a.status in ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"]])
        interviews = len([a for a in sent if a.status in ["INTERVIEW", "OFFER"]])
        offers = len([a for a in sent if a.status == "OFFER"])

        roles: dict[str, dict] = {}
        for a in sent:
            key = "AI / ML" if any(w in a.role.lower() for w in ["ai", "ml", "learning"]) else "Software / Backend" if any(w in a.role.lower() for w in ["backend", "software", "web"]) else "Other"
            if key not in roles:
                roles[key] = {"applied": 0, "responses": 0, "interviews": 0}
            roles[key]["applied"] += 1
            if a.status in ["SCREENING", "INTERVIEW", "OFFER", "REJECTED"]:
                roles[key]["responses"] += 1
            if a.status in ["INTERVIEW", "OFFER"]:
                roles[key]["interviews"] += 1

        recommendation = "Target more AI-focused roles where candidate skills show 85%+ technical compatibility." if roles.get("AI / ML", {}).get("applied", 0) >= 1 else "Build more applications to generate statistical conversion insights."

        return {
            "total_applications": total,
            "response_rate": round(100 * resp / max(1, total), 1),
            "interview_rate": round(100 * interviews / max(1, total), 1),
            "offer_rate": round(100 * offers / max(1, total), 1),
            "roles": roles,
            "recommendation": recommendation
        }
    finally:
        db.close()

class NotionToken(BaseModel):
    token: str = Field(min_length=10)

class NotionSync(NotionToken):
    database_id: str
    application: dict

class NotionDb(NotionToken):
    parent_page_id: str

@router.post("/integrations/notion/test")
async def notion_test(b: NotionToken):
    return await notion.test_connection(b.token)

@router.post("/integrations/notion/database")
async def notion_db(b: NotionDb):
    try:
        return await notion.create_database(b.token, b.parent_page_id)
    except httpx.HTTPError:
        raise HTTPException(502, "Notion request failed. Check your token and page permissions.")

@router.post("/integrations/notion/sync")
async def notion_sync(b: NotionSync):
    try:
        return await notion.sync_application(b.token, b.database_id, b.application)
    except httpx.HTTPError:
        raise HTTPException(502, "Notion sync failed. Check database access permissions.")

class NotionAutoSyncIn(BaseModel):
    token: str = Field(min_length=10)
    parent_page_id: Optional[str] = None
    applications: Optional[List[dict]] = None

@router.post("/integrations/notion/auto-create-and-sync")
async def notion_auto_create_and_sync(b: NotionAutoSyncIn):
    apps = b.applications
    if apps is None:
        db = SessionLocal()
        try:
            recs = db.query(ApplicationRecord).all()
            apps = [
                {
                    "company": r.company,
                    "role": r.role,
                    "match": r.match,
                    "status": r.status,
                    "notes": (r.events[0]["text"] if r.events else "Applied through HowToLarped OS")
                }
                for r in recs
            ]
        finally:
            db.close()

    result = await notion.auto_create_and_sync(b.token, b.parent_page_id, apps)
    if not result.get("ok"):
        raise HTTPException(400, result.get("error", "Failed to auto-create Notion list"))
    return result
