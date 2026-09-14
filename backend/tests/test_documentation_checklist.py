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
