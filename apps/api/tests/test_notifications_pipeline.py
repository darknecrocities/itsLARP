import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_notification_pipeline_and_anti_spam():
    # 1. Clear out / mark read
    client.post("/notifications/read-all")

    # 2. Emit an urgent test notification (should be in important feed)
    res_urgent = client.post("/notifications/test", json={
        "title": "Interview Request: Scale AI",
        "message": "Invited to screening round for Senior Engineer.",
        "priority": "urgent",
        "event_type": "recruiter_interview",
        "link_url": "/applications"
    })
    assert res_urgent.status_code == 200
    assert res_urgent.json()["ok"] is True
    urgent_id = res_urgent.json()["notification"]["id"]

    # 3. Emit a normal-priority notification (should be filtered out by important_only)
    res_normal = client.post("/notifications/test", json={
        "title": "Routine Crawl Ping",
        "message": "Scanned 5 jobs in background.",
        "priority": "normal",
        "event_type": "crawler_ping",
        "link_url": "/jobs"
    })
    assert res_normal.status_code == 200

    # 4. Check feed with important_only=true
    res_feed = client.get("/notifications/feed?unread_only=true&important_only=true")
    assert res_feed.status_code == 200
    feed_data = res_feed.json()
    assert feed_data["ok"] is True
    notifs = feed_data["notifications"]
    # All items in important feed must have priority 'urgent' or 'high'
    for n in notifs:
        assert n["priority"] in ("urgent", "high")

    # 5. Mark read
    res_read = client.post("/notifications/read", json={"ids": [urgent_id]})
    assert res_read.status_code == 200
    assert res_read.json()["ok"] is True

    # 6. Mark all read
    res_all = client.post("/notifications/read-all")
    assert res_all.status_code == 200
    assert res_all.json()["ok"] is True
