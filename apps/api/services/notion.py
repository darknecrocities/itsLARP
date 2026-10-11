"""Notion integration. User supplies their own integration token; never logged or returned.
Provides 1-click self-creating list/database for company name, position, platform, status, match score, etc.
"""
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime

API = "https://api.notion.com/v1"
VERSION = "2022-06-28"


def _h(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Notion-Version": VERSION, "Content-Type": "application/json"}


def mask(token: str) -> str:
    return token[:4] + "…" + token[-4:] if len(token) > 10 else "••••"


async def test_connection(token: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{API}/users/me", headers=_h(token))
    if r.status_code != 200:
        return {"connected": False, "error": "Notion rejected the token."}
    return {"connected": True, "workspace": r.json().get("name")}


async def find_first_page(token: str) -> Optional[str]:
    """Finds the first shared page accessible to the bot token."""
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(f"{API}/search", headers=_h(token), json={"filter": {"value": "page", "property": "object"}, "page_size": 1})
            if r.status_code == 200:
                results = r.json().get("results", [])
                if results:
                    return results[0]["id"]
    except Exception:
        pass
    return None


async def create_database(token: str, parent_page_id: str) -> dict:
    props = {
        "Company Name": {"title": {}},
        "Position": {"rich_text": {}},
        "Platform": {
            "select": {
                "options": [
                    {"name": "LinkedIn", "color": "blue"},
                    {"name": "JobStreet", "color": "purple"},
                    {"name": "Indeed", "color": "green"},
                    {"name": "Glassdoor", "color": "yellow"},
                    {"name": "Direct / Website", "color": "gray"}
                ]
            }
        },
        "Status": {
            "select": {
                "options": [
                    {"name": "SAVED", "color": "gray"},
                    {"name": "ANALYZING", "color": "yellow"},
                    {"name": "READY", "color": "orange"},
                    {"name": "APPLIED", "color": "blue"},
                    {"name": "SCREENING", "color": "purple"},
                    {"name": "INTERVIEW", "color": "pink"},
                    {"name": "OFFER", "color": "green"},
                    {"name": "REJECTED", "color": "red"}
                ]
            }
        },
        "Match Score": {"number": {"format": "percent"}},
        "Resume Format": {"rich_text": {}},
        "Applied Date": {"date": {}},
        "URL": {"url": {}},
        "Notes": {"rich_text": {}}
    }
    body = {
        "parent": {"type": "page_id", "page_id": parent_page_id},
        "title": [{"type": "text", "text": {"content": "HowToLarped Job Applications (1,000 Bots Sync)"}}],
        "properties": props
    }
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{API}/databases", headers=_h(token), json=body)
    r.raise_for_status()
    data = r.json()
    return {"database_id": data["id"], "url": data.get("url", "")}


async def sync_application(token: str, database_id: str, app: dict) -> dict:
    rt = lambda v: {"rich_text": [{"text": {"content": str(v or "")}}]}
    match_val = (app.get("match") or 0) / 100.0 if (app.get("match") or 0) > 1 else app.get("match", 0)

    platform = app.get("platform") or "Direct / Website"
    if any(p.lower() in str(app.get("source", "")).lower() for p in ["linkedin", "jobstreet", "indeed", "glassdoor"]):
        platform = "LinkedIn" if "linkedin" in str(app.get("source", "")).lower() else "JobStreet" if "jobstreet" in str(app.get("source", "")).lower() else "Indeed"

    props = {
        "Company Name": {"title": [{"text": {"content": app.get("company", "Company")}}]},
        "Position": rt(app.get("role") or app.get("title", "Position")),
        "Platform": {"select": {"name": platform}},
        "Status": {"select": {"name": app.get("status", "APPLIED")}},
        "Match Score": {"number": match_val},
        "Resume Format": rt("APA 7th Edition (Evidence Verified)"),
        "Notes": rt(app.get("notes") or "Synchronized via 1,000-bot workforce")
    }

    # Date
    today_str = datetime.now().strftime("%Y-%m-%d")
    props["Applied Date"] = {"date": {"start": today_str}}

    if app.get("url"):
        props["URL"] = {"url": app["url"]}

    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{API}/pages", headers=_h(token), json={"parent": {"database_id": database_id}, "properties": props})
    r.raise_for_status()
    return {"page_id": r.json()["id"]}


async def auto_create_and_sync(token: str, parent_page_id: Optional[str], applications: List[dict]) -> dict:
    """1-click self-creating Notion list and batch synchronizer."""
    # Verify token
    test_res = await test_connection(token)
    if not test_res.get("connected"):
        return {"ok": False, "error": test_res.get("error", "Notion rejected token")}

    # Resolve parent page ID
    page_id = parent_page_id
    if not page_id:
        page_id = await find_first_page(token)
    if not page_id:
        return {"ok": False, "error": "No shared page found in Notion workspace. Please share at least one page with your integration bot."}

    # Clean UUID
    clean_page_id = page_id.replace("-", "").strip()

    # Create Database
    db_res = await create_database(token, clean_page_id)
    db_id = db_res["database_id"]

    # Sync applications
    synced = 0
    errors = []
    for app in applications:
        try:
            await sync_application(token, db_id, app)
            synced += 1
        except Exception as e:
            errors.append(str(e))

    return {
        "ok": True,
        "database_id": db_id,
        "database_url": db_res.get("url", f"https://notion.so/{db_id.replace('-', '')}"),
        "synced_count": synced,
        "total_attempted": len(applications),
        "workspace": test_res.get("workspace", "Notion Workspace")
    }
