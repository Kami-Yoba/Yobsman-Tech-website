"""Backend tests for TikTok SRV-11 service, /api/my/checklists auth isolation."""
import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).parents[1] / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "http://localhost:8001"
# Use local for pytest (public URL will share the same rate-limit IP bucket regardless)
API = "http://localhost:8001/api"


# --- Services content (SRV-11 TikTok) ---
def test_services_content_has_11_services_with_tiktok_srv11():
    r = requests.get(f"{API}/content/services", timeout=20)
    assert r.status_code == 200
    body = r.json()
    services = body["services"] if isinstance(body, dict) and "services" in body else body
    assert isinstance(services, list)
    assert len(services) == 11, f"expected 11 services, got {len(services)}"
    codes = [s.get("code") for s in services]
    assert "SRV-11" in codes
    srv11 = next(s for s in services if s.get("code") == "SRV-11")
    assert "TikTok" in srv11.get("title", "")


# --- /api/my/checklists auth ---
def test_my_checklists_requires_auth():
    r = requests.get(f"{API}/my/checklists", timeout=20)
    assert r.status_code in (401, 403)


def test_my_checklists_returns_only_owner_data():
    s = requests.Session()
    login = s.post(
        f"{API}/auth/login",
        json={"email": "demo.client@yobsman-test.com", "password": "DemoClient2026!"},
        timeout=20,
    )
    assert login.status_code == 200, login.text
    token = s.cookies.get("access_token")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    r = s.get(f"{API}/my/checklists", headers=headers, timeout=20)
    assert r.status_code == 200, r.text
    items = r.json()
    assert isinstance(items, list)
    user_id = login.json()["id"]
    for it in items:
        assert it["user_id"] == user_id
