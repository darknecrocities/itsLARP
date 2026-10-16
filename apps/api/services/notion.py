"""Notion integration. User supplies their own integration token; never logged or returned.
Provides 1-click self-creating list/database for company name, position, platform, status, match score, etc.
"""
import httpx
from typing import Dict, Any, List, Optional, Set
from datetime import datetime
from .company_metadata import get_company_info

API = "https://api.notion.com/v1"
VERSION = "2022-06-28"
DB_PROPS_CACHE: Dict[str, Set[str]] = {}


def _h(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Notion-Version": VERSION, "Content-Type": "application/json"}


def mask(token: str) -> str:
    return token[:4] + "…" + token[-4:] if len(token) > 10 else "••••"


async def get_database_properties(token: str, database_id: str) -> Set[str]:
    """Retrieves and caches the set of properties available in the user's Notion database."""
    clean_id = database_id.replace("-", "").strip()
    if clean_id in DB_PROPS_CACHE:
        return DB_PROPS_CACHE[clean_id]
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(f"{API}/databases/{clean_id}", headers=_h(token))
            if r.status_code == 200:
                props = set(r.json().get("properties", {}).keys())
                DB_PROPS_CACHE[clean_id] = props
                return props
    except Exception:
        pass
    return set()


async def test_connection(token: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{API}/users/me", headers=_h(token))
    if r.status_code != 200:
        return {"connected": False, "error": "Notion rejected the token."}
    data = r.json()
    ws = data.get("bot", {}).get("workspace_name") or data.get("name") or "Notion Workspace"
    return {"connected": True, "workspace": ws}


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
                    {"name": "Wellfound", "color": "orange"},
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
        "Company Background": {"rich_text": {}},
        "Company LinkedIn": {"url": {}},
        "Company Website": {"url": {}},
        "Job Description": {"rich_text": {}},
        "Resume Format": {"rich_text": {}},
        "Resume PDF": {"url": {}},
        "Submission Screenshot": {"url": {}},
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
    clean_id = database_id.replace("-", "").strip()
    db_props = await get_database_properties(token, clean_id)
    rt = lambda v: {"rich_text": [{"text": {"content": str(v or "")}}]}
    match_val = (app.get("match") or 0) / 100.0 if (app.get("match") or 0) > 1 else app.get("match", 0)

    company = app.get("company", "Company")
    info = get_company_info(company)

    platform = app.get("platform") or "Direct / Website"
    if any(p.lower() in str(app.get("source", "")).lower() for p in ["linkedin", "jobstreet", "indeed", "glassdoor", "wellfound"]):
        platform = "LinkedIn" if "linkedin" in str(app.get("source", "")).lower() else "JobStreet" if "jobstreet" in str(app.get("source", "")).lower() else "Indeed" if "indeed" in str(app.get("source", "")).lower() else "Wellfound"

    props = {
        "Company Name": {"title": [{"text": {"content": company}}]}
    }

    if not db_props or "Position" in db_props:
        props["Position"] = rt(app.get("role") or app.get("title", "Position"))
    if not db_props or "Platform" in db_props:
        props["Platform"] = {"select": {"name": platform}}
    if not db_props or "Status" in db_props:
        props["Status"] = {"select": {"name": app.get("status", "APPLIED")}}
    if not db_props or "Match Score" in db_props:
        props["Match Score"] = {"number": match_val}
    if not db_props or "Resume Format" in db_props:
        props["Resume Format"] = rt("APA 7th Edition (Evidence Verified)")
    if not db_props or "Notes" in db_props:
        props["Notes"] = rt(app.get("notes") or f"Tailored application grounded in Career DNA skills for {company}.")
    if not db_props or "Applied Date" in db_props:
        today_str = datetime.now().strftime("%Y-%m-%d")
        props["Applied Date"] = {"date": {"start": app.get("applied_date") or today_str}}
    if not db_props or "URL" in db_props:
        props["URL"] = {"url": app.get("url") or info["careers"]}
    if not db_props or "Submission Screenshot" in db_props:
        scr_val = app.get("screenshot_url") or f"http://localhost:8000/applications/{app.get('id', 'app')}/screenshot"
        props["Submission Screenshot"] = {"url": scr_val}

    # Rich company metadata properties
    if db_props and "Company Background" in db_props:
        props["Company Background"] = rt(app.get("company_background") or info["background"])
    if db_props and "Company LinkedIn" in db_props:
        props["Company LinkedIn"] = {"url": app.get("company_linkedin") or info["linkedin"]}
    if db_props and "Company Website" in db_props:
        props["Company Website"] = {"url": app.get("company_website") or info["website"]}
    if db_props and "Job Description" in db_props:
        props["Job Description"] = rt(app.get("description") or f"Autonomous application staged for {app.get('role', 'Engineering Position')} at {company}.")
    if db_props and "Resume PDF" in db_props:
        props["Resume PDF"] = {"url": app.get("resume_url") or "http://localhost:8000/profile/apa-resume/download?format=html"}

    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{API}/pages", headers=_h(token), json={"parent": {"database_id": clean_id}, "properties": props})
    r.raise_for_status()
    return {"page_id": r.json()["id"]}


async def search_databases(token: str) -> List[dict]:
    """Search for all databases accessible to the integration bot."""
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(
            f"{API}/search",
            headers=_h(token),
            json={"filter": {"value": "database", "property": "object"}, "page_size": 30}
        )
    if r.status_code != 200:
        return []
    results = r.json().get("results", [])
    databases = []
    for db in results:
        title_objs = db.get("title", [])
        title_str = "".join(t.get("plain_text", "") for t in title_objs) or "Untitled Database"
        databases.append({
            "id": db.get("id"),
            "title": title_str,
            "url": db.get("url", f"https://notion.so/{db.get('id', '').replace('-', '')}"),
            "properties": list(db.get("properties", {}).keys()),
            "last_edited_time": db.get("last_edited_time")
        })
    return databases


def _parse_page_props(page: dict) -> dict:
    """Extract standard application fields from arbitrary Notion page properties."""
    props = page.get("properties", {})
    
    # 1. Company Name (title property)
    company = "Company"
    for p_name, p_data in props.items():
        if p_data.get("type") == "title":
            title_list = p_data.get("title", [])
            if title_list:
                company = "".join(t.get("plain_text", "") for t in title_list).strip() or company
            break

    # 2. Position / Role
    role = "Position"
    for candidate in ["Position", "Role", "Job Title", "Title"]:
        if candidate in props and props[candidate].get("type") == "rich_text":
            txt = "".join(t.get("plain_text", "") for t in props[candidate].get("rich_text", [])).strip()
            if txt:
                role = txt
                break

    # 3. Platform
    platform = "Direct"
    for candidate in ["Platform", "Source"]:
        if candidate in props and props[candidate].get("type") == "select":
            sel = props[candidate].get("select")
            if sel and sel.get("name"):
                platform = sel.get("name")
                break

    # 4. Status
    status = "APPLIED"
    if "Status" in props:
        p_stat = props["Status"]
        if p_stat.get("type") == "select" and p_stat.get("select"):
            status = p_stat["select"].get("name", "APPLIED")
        elif p_stat.get("type") == "status" and p_stat.get("status"):
            status = p_stat["status"].get("name", "APPLIED")

    # 5. Match Score
    match_score = 85
    for candidate in ["Match Score", "Match", "Compatibility"]:
        if candidate in props and props[candidate].get("type") == "number":
            num = props[candidate].get("number")
            if num is not None:
                match_score = int(round(num * 100)) if num <= 1.0 else int(round(num))
                break

    # 6. Applied Date
    applied_date = ""
    for candidate in ["Applied Date", "Date"]:
        if candidate in props and props[candidate].get("type") == "date":
            dt = props[candidate].get("date")
            if dt and dt.get("start"):
                applied_date = dt.get("start")
                break

    # 7. URL
    url = ""
    for candidate in ["URL", "Link"]:
        if candidate in props and props[candidate].get("type") == "url":
            url = props[candidate].get("url") or ""
            break

    # 7b. Submission Screenshot
    screenshot_url = ""
    for candidate in ["Submission Screenshot", "Screenshot", "Proof"]:
        if candidate in props and props[candidate].get("type") == "url":
            screenshot_url = props[candidate].get("url") or ""
            break

    # 8. Notes
    notes = ""
    if "Notes" in props and props["Notes"].get("type") == "rich_text":
        notes = "".join(t.get("plain_text", "") for t in props["Notes"].get("rich_text", [])).strip()

    return {
        "notion_page_id": page.get("id"),
        "notion_url": page.get("url", f"https://notion.so/{page.get('id', '').replace('-', '')}"),
        "company": company,
        "role": role,
        "platform": platform,
        "status": status,
        "match": match_score,
        "applied_date": applied_date or datetime.now().strftime("%Y-%m-%d"),
        "url": url,
        "screenshot_url": screenshot_url,
        "notes": notes
    }


async def query_database_applications(token: str, database_id: str, page_size: int = 100) -> List[dict]:
    """Fetch applications currently tracked in the user's Notion database."""
    clean_id = database_id.replace("-", "").strip()
    apps = []
    has_more = True
    start_cursor = None

    async with httpx.AsyncClient(timeout=15) as c:
        while has_more and len(apps) < 200:
            payload: dict = {"page_size": min(page_size, 100)}
            if start_cursor:
                payload["start_cursor"] = start_cursor

            r = await c.post(f"{API}/databases/{clean_id}/query", headers=_h(token), json=payload)
            if r.status_code != 200:
                break
            data = r.json()
            for page in data.get("results", []):
                apps.append(_parse_page_props(page))
            has_more = data.get("has_more", False)
            start_cursor = data.get("next_cursor")

    return apps


async def update_page_status(token: str, page_id: str, new_status: str) -> bool:
    """Update application status in Notion page."""
    clean_id = page_id.replace("-", "").strip()
    body = {
        "properties": {
            "Status": {"select": {"name": new_status}}
        }
    }
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.patch(f"{API}/pages/{clean_id}", headers=_h(token), json=body)
    return r.status_code == 200


async def pull_from_notion(token: str, database_id: str, db) -> dict:
    """Pull remote entries from Notion database into local SQLite records."""
    from .database import ApplicationRecord, IntegrationRecord
    notion_apps = await query_database_applications(token, database_id)
    imported = 0
    updated = 0

    for item in notion_apps:
        page_id = item["notion_page_id"]
        # Look for existing record by notion_page_id or by company+role match
        existing = db.query(ApplicationRecord).filter(
            (ApplicationRecord.notion_page_id == page_id) |
            ((ApplicationRecord.company == item["company"]) & (ApplicationRecord.role == item["role"]))
        ).first()

        if existing:
            existing.status = item["status"]
            existing.match = item["match"]
            existing.platform = item["platform"]
            existing.url = item["url"]
            existing.notion_page_id = page_id
            existing.notion_database_id = database_id
            existing.applied_date = item["applied_date"]
            updated += 1
        else:
            new_app = ApplicationRecord(
                id=f"notion_{page_id.replace('-', '')[:12]}",
                job_id=f"job_{page_id.replace('-', '')[:8]}",
                company=item["company"],
                role=item["role"],
                match=item["match"],
                status=item["status"],
                platform=item["platform"],
                url=item["url"],
                notion_page_id=page_id,
                notion_database_id=database_id,
                applied_date=item["applied_date"],
                events=[{"at": datetime.utcnow().isoformat(), "text": f"Synced from Notion: {item['status']}"}],
                verified=True
            )
            db.add(new_app)
            imported += 1

    # Update IntegrationRecord metadata
    integ = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
    if integ:
        integ.last_synced_at = datetime.utcnow()
        integ.synced_count = db.query(ApplicationRecord).count()
        integ.connected = True
    db.commit()

    return {
        "ok": True,
        "imported": imported,
        "updated": updated,
        "total": len(notion_apps)
    }


async def push_to_notion(token: str, database_id: str, db) -> dict:
    """Push local applications that haven't been synced to Notion yet."""
    from .database import ApplicationRecord, IntegrationRecord
    unsynced = db.query(ApplicationRecord).filter(
        (ApplicationRecord.notion_page_id == None) | (ApplicationRecord.notion_page_id == "")
    ).all()

    synced_count = 0
    for app in unsynced:
        try:
            res = await sync_application(token, database_id, {
                "id": app.id,
                "company": app.company,
                "role": app.role,
                "match": app.match,
                "status": app.status,
                "platform": getattr(app, "platform", "Direct"),
                "url": getattr(app, "url", ""),
                "screenshot_url": getattr(app, "screenshot_url", None) or f"http://localhost:8000/applications/{app.id}/screenshot",
                "notes": app.events[0]["text"] if app.events else "Applied through HowToLarped"
            })
            if res and res.get("page_id"):
                app.notion_page_id = res["page_id"]
                app.notion_database_id = database_id
                synced_count += 1
        except Exception:
            pass

    integ = db.query(IntegrationRecord).filter(IntegrationRecord.id == "notion").first()
    if integ:
        integ.last_synced_at = datetime.utcnow()
        integ.synced_count = db.query(ApplicationRecord).count()
    db.commit()

    return {"ok": True, "pushed": synced_count, "total_attempted": len(unsynced)}


async def bidirectional_sync(token: str, database_id: str, db) -> dict:
    """Two-way sync: Backfill empty columns on remote Notion pages, pull remote changes, and push staged local applications."""
    from .dna_sync import backfill_notion_pages
    try:
        await backfill_notion_pages(token, database_id)
    except Exception:
        pass
    pull_res = await pull_from_notion(token, database_id, db)
    push_res = await push_to_notion(token, database_id, db)
    return {
        "ok": True,
        "pull": pull_res,
        "push": push_res,
        "last_synced_at": datetime.utcnow().isoformat()
    }


async def auto_create_and_sync(token: str, parent_page_id: Optional[str], applications: List[dict]) -> dict:
    """1-click self-creating Notion list and batch synchronizer."""
    test_res = await test_connection(token)
    if not test_res.get("connected"):
        return {"ok": False, "error": test_res.get("error", "Notion rejected token")}

    page_id = parent_page_id
    if not page_id:
        page_id = await find_first_page(token)
    if not page_id:
        return {"ok": False, "error": "No shared page found in Notion workspace. Please share at least one page with your integration bot."}

    clean_page_id = page_id.replace("-", "").strip()
    db_res = await create_database(token, clean_page_id)
    db_id = db_res["database_id"]

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

