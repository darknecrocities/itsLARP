"""Notion integration. User supplies their own integration token; never logged or returned."""
import httpx

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


async def create_database(token: str, parent_page_id: str) -> dict:
    props = {"Company": {"title": {}}, "Role": {"rich_text": {}}, "URL": {"url": {}},
             "Match": {"number": {}}, "Status": {"select": {}}, "Salary": {"rich_text": {}},
             "Location": {"rich_text": {}}, "Applied": {"date": {}}, "Resume": {"url": {}},
             "Cover Letter": {"url": {}}, "Interview": {"date": {}}, "Notes": {"rich_text": {}}}
    body = {"parent": {"type": "page_id", "page_id": parent_page_id},
            "title": [{"type": "text", "text": {"content": "HowToLarped Applications"}}], "properties": props}
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{API}/databases", headers=_h(token), json=body)
    r.raise_for_status()
    return {"database_id": r.json()["id"]}


async def sync_application(token: str, database_id: str, app: dict) -> dict:
    rt = lambda v: {"rich_text": [{"text": {"content": str(v or "")}}]}
    props = {"Company": {"title": [{"text": {"content": app["company"]}}]}, "Role": rt(app["role"]),
             "Match": {"number": app.get("match")}, "Status": {"select": {"name": app["status"]}},
             "Location": rt(app.get("location")), "Salary": rt(app.get("salary")), "Notes": rt(app.get("notes"))}
    if app.get("url"): props["URL"] = {"url": app["url"]}
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{API}/pages", headers=_h(token),
                         json={"parent": {"database_id": database_id}, "properties": props})
    r.raise_for_status()
    return {"page_id": r.json()["id"]}
