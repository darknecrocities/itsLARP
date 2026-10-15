import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from main import app
from services.email_monitor import classify_email

client = TestClient(app)


def test_classify_email_heuristics():
    assert classify_email("Invitation to interview: Senior AI Engineer", "We would love to schedule a video call") == "interview"
    assert classify_email("Formal Offer Letter - itsLARP", "Congratulations, we are pleased to offer you the position") == "offer"
    assert classify_email("Update regarding your application", "Unfortunately, we are not moving forward with your candidacy") == "rejected"
    assert classify_email("Quick assessment for candidate", "Please complete this code test questionnaire") == "inquiry"


def test_email_monitor_api_flow():
    # 1. Connect email
    res = client.post("/integrations/email/connect", json={
        "provider": "gmail",
        "email": "candidate@gmail.com",
        "monitoring_enabled": True
    })
    assert res.status_code == 200
    assert res.json()["email"] == "candidate@gmail.com"

    # 2. Check status
    res_status = client.get("/integrations/email/status")
    assert res_status.status_code == 200
    assert res_status.json()["connected"] is True
    assert res_status.json()["provider"] == "gmail"

    # 3. Simulate incoming recruiter response
    sim_res = client.post("/integrations/email/simulate-response", json={
        "company": "Stripe",
        "subject": "Interview Invitation: Lead AI Engineer",
        "snippet": "We reviewed your background and would like to schedule an interview with the hiring manager.",
        "sender": "recruiter@stripe.com"
    })
    assert sim_res.status_code == 200
    data = sim_res.json()
    assert data["ok"] is True
    assert data["classification"] == "interview"
    assert data["company"] == "Stripe"

    # 4. Disconnect email
    dc_res = client.post("/integrations/email/disconnect")
    assert dc_res.status_code == 200
    assert dc_res.json()["ok"] is True

    # 5. Check status is now disconnected
    res_status2 = client.get("/integrations/email/status")
    assert res_status2.json()["connected"] is False
