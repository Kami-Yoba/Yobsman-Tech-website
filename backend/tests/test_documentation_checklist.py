import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).parents[1] / ".env")

API_BASE = "http://localhost:8001/api"


def test_documentation_checklist_lead_is_stored_and_cleaned_up():
    payload = {
        "name": "Pytest Checklist Lead",
        "email": "pytest.checklist@yobsman-test.com",
        "service_type": "tax",
        "country": "Finland — Finnish Tax Administration",
        "stage": "starting",
        "urgency": "month",
        "checklist": ["Prepare a valid passport or national ID.", "Collect tax identification details."],
        "language": "en",
        "consent": True,
        "website": "",
    }
    response = requests.post(f"{API_BASE}/documentation-checklist", json=payload, timeout=20)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["ok"] is True
    assert body["id"]

    client = MongoClient(os.environ["MONGO_URL"])
    try:
        db = client[os.environ["DB_NAME"]]
        stored = db.documentation_leads.find_one({"id": body["id"]}, {"_id": 0})
        assert stored is not None
        assert stored["email"] == payload["email"]
        assert stored["source"] == "documentation_checklist"
        assert stored["status"] == "new"
        assert stored["user_id"] is None
        db.documentation_leads.delete_one({"id": body["id"]})
    finally:
        client.close()


def test_documentation_checklist_requires_consent():
    payload = {
        "name": "No Consent",
        "email": "no.consent@yobsman-test.com",
        "service_type": "tax",
        "country": "Finland",
        "stage": "starting",
        "urgency": "flexible",
        "checklist": ["Prepare identity document."],
        "language": "en",
        "consent": False,
        "website": "",
    }
    response = requests.post(f"{API_BASE}/documentation-checklist", json=payload, timeout=20)
    assert response.status_code == 422


def test_signed_in_checklist_is_available_from_user_dashboard_api():
    session = requests.Session()
    login = session.post(
        f"{API_BASE}/auth/login",
        json={"email": "demo.client@yobsman-test.com", "password": "DemoClient2026!"},
        timeout=20,
    )
    assert login.status_code == 200, login.text
    user_id = login.json()["id"]
    auth_headers = {"Authorization": f"Bearer {session.cookies.get('access_token')}"}
    payload = {
        "name": "Demo Client",
        "email": "demo.client@yobsman-test.com",
        "service_type": "immigration",
        "country": "Finland — Migri",
        "stage": "ready",
        "urgency": "week",
        "checklist": ["Prepare passport.", "Review residence permit application."],
        "language": "en",
        "consent": True,
        "website": "",
    }
    created = session.post(f"{API_BASE}/documentation-checklist", json=payload, headers=auth_headers, timeout=20)
    assert created.status_code == 200, created.text
    lead_id = created.json()["id"]

    mine = session.get(f"{API_BASE}/my/checklists", headers=auth_headers, timeout=20)
    assert mine.status_code == 200, mine.text
    found = [item for item in mine.json() if item["id"] == lead_id]
    assert found and found[0]["user_id"] == user_id

    client = MongoClient(os.environ["MONGO_URL"])
    try:
        client[os.environ["DB_NAME"]].documentation_leads.delete_one({"id": lead_id})
    finally:
        client.close()
