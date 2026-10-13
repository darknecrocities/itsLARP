from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
import httpx
from services import notion
from services.database import SessionLocal, ApplicationRecord

router = APIRouter(prefix="/integrations/notion", tags=["notion"])


class NotionToken(BaseModel):
    token: str = Field(min_length=10)


class NotionSync(NotionToken):
    database_id: str
    application: dict


class NotionDb(NotionToken):
    parent_page_id: str


@router.post("/test")
async def notion_test(b: NotionToken):
    return await notion.test_connection(b.token)


@router.post("/database")
async def notion_db(b: NotionDb):
    try:
        return await notion.create_database(b.token, b.parent_page_id)
    except httpx.HTTPError:
        raise HTTPException(502, "Notion request failed. Check your token and page permissions.")


@router.post("/sync")
async def notion_sync(b: NotionSync):
    try:
        return await notion.sync_application(b.token, b.database_id, b.application)
    except httpx.HTTPError:
        raise HTTPException(502, "Notion sync failed. Check database access permissions.")


class NotionAutoSyncIn(BaseModel):
    token: str = Field(min_length=10)
    parent_page_id: Optional[str] = None
    applications: Optional[List[dict]] = None


@router.post("/auto-create-and-sync")
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
