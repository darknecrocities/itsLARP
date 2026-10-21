import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_platform_accounts_guardrails_flow():
    # 1. List platform accounts
    res = client.get("/platform-accounts")
    assert res.status_code == 200
    platforms = res.json().get("platforms", [])
    assert len(platforms) >= 4
    platform_ids = [p["id"] for p in platforms]
    assert "linkedin" in platform_ids
    assert "indeed" in platform_ids

    # 2. Connect LinkedIn account with guardrails
    connect_res = client.post("/platform-accounts/connect", json={
        "platform": "linkedin",
        "username": "parejasarronkian",
        "max_daily_applications": 15,
        "min_delay_seconds": 60,
        "max_delay_seconds": 180,
        "allowed_actions": ["easy_apply", "save_job"],
    })
    assert connect_res.status_code == 200
    cdata = connect_res.json()
    assert cdata["ok"] is True
    assert cdata["platform"] == "linkedin"
    assert cdata["guardrails"]["max_daily_applications"] == 15

    # 3. Execute permitted action
    action_res = client.post("/platform-accounts/execute-action", json={
        "platform": "linkedin",
        "company": "Anthropic",
        "role": "Distributed Systems Engineer",
        "action": "easy_apply",
    })
    assert action_res.status_code == 200
    adata = action_res.json()
    assert adata["ok"] is True
    assert adata["applications_today"] >= 1
    assert adata["remaining_today"] <= 14

    # 4. Attempt prohibited action (blocked by guardrails)
    bad_res = client.post("/platform-accounts/execute-action", json={
        "platform": "linkedin",
        "company": "Anthropic",
        "role": "Distributed Systems Engineer",
        "action": "send_unsolicited_dm",
    })
    assert bad_res.status_code == 403
    assert "prohibited" in bad_res.json()["detail"].lower()

    # 5. Disconnect account safely
    disc_res = client.post("/platform-accounts/disconnect", json={"platform": "linkedin"})
    assert disc_res.status_code == 200
    assert disc_res.json()["connected"] is False


def test_email_remote_control_commands_flow():
    candidate_email = "parejasarronkian@gmail.com"

    # 1. Connect candidate email
    c_res = client.post("/integrations/email/connect", json={
        "provider": "gmail",
        "email": candidate_email,
        "monitoring_enabled": True,
    })
    assert c_res.status_code == 200

    # 2. Issue STATUS command
    status_cmd_res = client.post("/integrations/email/command", json={
        "sender": candidate_email,
        "subject": "STATUS",
    })
    assert status_cmd_res.status_code == 200
    sdata = status_cmd_res.json()
    assert sdata["ok"] is True
    assert sdata["command"] == "STATUS"
    assert "itsLARP Status:" in sdata["response_message"]

    # 3. Issue PAUSE command
    pause_cmd_res = client.post("/integrations/email/command", json={
        "sender": candidate_email,
        "subject": "PAUSE",
    })
    assert pause_cmd_res.status_code == 200
    pdata = pause_cmd_res.json()
    assert pdata["command"] == "PAUSE"
    assert pdata["swarm_paused"] is True

    # 4. Issue RESUME command
    resume_cmd_res = client.post("/integrations/email/command", json={
        "sender": candidate_email,
        "subject": "RESUME",
    })
    assert resume_cmd_res.status_code == 200
    rdata = resume_cmd_res.json()
    assert rdata["command"] == "RESUME"
    assert rdata["swarm_paused"] is False

    # 5. Issue APPLY 10 command
    apply_cmd_res = client.post("/integrations/email/command", json={
        "sender": candidate_email,
        "subject": "APPLY 10",
    })
    assert apply_cmd_res.status_code == 200
    apdata = apply_cmd_res.json()
    assert apdata["command"] == "APPLY"
    assert apdata["target_quota"] == 10


def test_device_notifications_flow():
    candidate_email = "parejasarronkian@gmail.com"

    res = client.post("/integrations/email/send-notification", json={
        "event_type": "job_search_complete",
        "title": "Job Search Complete",
        "message": "Discovered 10 high-match positions.",
        "recipient": candidate_email,
    })
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["notification"]["recipient"] == candidate_email
    assert data["notification"]["event_type"] == "job_search_complete"
