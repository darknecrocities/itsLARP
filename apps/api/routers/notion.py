from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import httpx
from services import notion
from services.database import SessionLocal, ApplicationRecord, IntegrationRecord

router = APIRouter(prefix="/integrations/notion", tags=["notion"])


class NotionToken(BaseModel):
    token: str = Field(min_length=10)


class NotionDb(NotionToken):
    parent_page_id: str
    title: Optional[str] = "HowToLarped Job Applications"


class NotionConnectIn(BaseModel):
    token: str = Field(min_length=10)
    database_id: Optional[str] = None
    parent_page_id: Optional[str] = None
    create_new: bool = False


class NotionStatusUpdate(BaseModel):
    status: str
    token: Optional[str] = None


@router.get("/status")
def notion_status():
    """Returns saved Notion connection status and metadata."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
        if not rec or not rec.connected:
            return {
                "connected": False,
                "token_masked": "",
                "database_id": "",
                "database_name": "",
                "database_url": "",
                "workspace": "",
                "last_synced_at": None,
                "synced_count": 0
            }
        return {
            "connected": True,
            "token_masked": notion.mask(rec.token) if rec.token else "",
            "database_id": rec.database_id,
            "database_name": rec.database_name or "Notion Job Tracker",
            "database_url": rec.database_url,
            "workspace": rec.workspace,
            "last_synced_at": rec.last_synced_at.isoformat() if rec.last_synced_at else None,
            "synced_count": rec.synced_count
        }
    finally:
        db.close()


@router.post("/test")
async def notion_test(b: NotionToken):
    """Test Notion token validity and fetch workspace name."""
    return await notion.test_connection(b.token)


@router.post("/databases")
async def notion_list_databases(b: NotionToken):
    """Scan and list all existing databases accessible to the integration bot."""
    dbs = await notion.search_databases(b.token)
    return {"ok": True, "databases": dbs}


@router.post("/connect")
async def notion_connect(b: NotionConnectIn):
    """Connect to an existing Notion database or auto-create a dedicated one."""
    test_res = await notion.test_connection(b.token)
    if not test_res.get("connected"):
        raise HTTPException(400, test_res.get("error", "Notion rejected the token."))

    workspace = test_res.get("workspace", "Notion Workspace")
    db_id = b.database_id
    db_name = "Notion Job Tracker"
    db_url = ""

    if b.create_new or not db_id:
        parent_id = b.parent_page_id
        if not parent_id:
            parent_id = await notion.find_first_page(b.token)
        if not parent_id:
            raise HTTPException(400, "No shared page found in your Notion workspace. Please share at least one page with your integration bot.")
        new_db = await notion.create_database(b.token, parent_id.replace("-", "").strip())
        db_id = new_db["database_id"]
        db_url = new_db.get("url", f"https://notion.so/{db_id.replace('-', '')}")
        db_name = "HowToLarped Job Applications"
    else:
        db_id = db_id.replace("-", "").strip()
        db_url = f"https://notion.so/{db_id}"

    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
        if not rec:
            rec = IntegrationRecord(id="notion")
            db.add(rec)
        rec.token = b.token
        rec.database_id = db_id
        rec.database_name = db_name
        rec.database_url = db_url
        rec.workspace = workspace
        rec.connected = True
        rec.last_synced_at = datetime.utcnow()
        db.commit()

        # Run initial bidirectional sync
        sync_result = await notion.bidirectional_sync(b.token, db_id, db)
        return {
            "ok": True,
            "database_id": db_id,
            "database_name": db_name,
            "database_url": db_url,
            "workspace": workspace,
            "sync": sync_result
        }
    finally:
        db.close()


@router.post("/sync")
async def notion_sync():
    """Run full two-way synchronization between local database and Notion."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
        if not rec or not rec.connected or not rec.token or not rec.database_id:
            raise HTTPException(400, "Notion is not configured yet. Connect your Notion database first.")
        return await notion.bidirectional_sync(rec.token, rec.database_id, db)
    finally:
        db.close()


@router.post("/pull")
async def notion_pull():
    """Pull newest entries directly from Notion into local database."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
        if not rec or not rec.connected or not rec.token or not rec.database_id:
            raise HTTPException(400, "Notion is not configured yet.")
        return await notion.pull_from_notion(rec.token, rec.database_id, db)
    finally:
        db.close()


@router.patch("/pages/{page_id}/status")
async def notion_update_page_status(page_id: str, b: NotionStatusUpdate):
    """Update status of a page in Notion."""
    token = b.token
    if not token:
        db = SessionLocal()
        try:
            rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
            if rec and rec.token:
                token = rec.token
        finally:
            db.close()

    if not token:
        raise HTTPException(400, "No Notion token configured.")

    ok = await notion.update_page_status(token, page_id, b.status)
    return {"ok": ok}


@router.post("/disconnect")
def notion_disconnect():
    """Disconnect Notion integration."""
    db = SessionLocal()
    try:
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
        if rec:
            rec.connected = False
            rec.token = ""
            db.commit()
        return {"ok": True}
    finally:
        db.close()


class NotionAutoSyncIn(BaseModel):
    token: str = Field(min_length=10)
    parent_page_id: Optional[str] = None
    applications: Optional[List[dict]] = None


@router.post("/auto-create-and-sync")
async def notion_auto_create_and_sync(b: NotionAutoSyncIn):
    apps = b.applications
    db = SessionLocal()
    try:
        if apps is None:
            recs = db.query(ApplicationRecord).all()
            apps = [
                {
                    "company": r.company,
                    "role": r.role,
                    "match": r.match,
                    "status": r.status,
                    "platform": getattr(r, "platform", "Direct"),
                    "url": getattr(r, "url", ""),
                    "notes": (r.events[0]["text"] if r.events else "Applied through HowToLarped OS")
                }
                for r in recs
            ]
        result = await notion.auto_create_and_sync(b.token, b.parent_page_id, apps)
        if not result.get("ok"):
            raise HTTPException(400, result.get("error", "Failed to auto-create Notion list"))

        # Save to IntegrationRecord
        rec = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
        if not rec:
            rec = IntegrationRecord(id="notion")
            db.add(rec)
        rec.token = b.token
        rec.database_id = result["database_id"]
        rec.database_name = "HowToLarped Job Applications"
        rec.database_url = result.get("database_url", "")
        rec.workspace = result.get("workspace", "Notion Workspace")
        rec.connected = True
        rec.last_synced_at = datetime.utcnow()
        rec.synced_count = result.get("synced_count", len(apps))
        db.commit()

        return result
    finally:
        db.close()

