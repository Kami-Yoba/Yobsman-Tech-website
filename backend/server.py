from dotenv import load_dotenv
load_dotenv()

import os
import re
import uuid
import secrets
import logging
import smtplib
import asyncio
from datetime import datetime, timezone, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional
from zoneinfo import ZoneInfo

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("yobsman")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Yobsman-Tech API")
api = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
INFO_EMAIL = os.environ.get("INFO_EMAIL", "info@yobsman-tech.com")
QUOTE_EMAIL = os.environ.get("QUOTE_EMAIL", "quote@yobsman-tech.com")
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_UPLOAD_EXT = {".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


def now():
    return datetime.now(timezone.utc)


def new_id():
    return str(uuid.uuid4())


def clean(doc):
    if doc:
        doc.pop("_id", None)
    return doc


# ---------------- Password / JWT ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user: dict) -> str:
    payload = {"sub": user["id"], "email": user["email"], "role": user.get("role", "user"),
               "exp": now() + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": now() + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user: dict):
    response.set_cookie("access_token", create_access_token(user), httponly=True, secure=True,
                        samesite="none", max_age=3600, path="/")
    response.set_cookie("refresh_token", create_refresh_token(user["id"]), httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")


def public_user(user: dict) -> dict:
    user = dict(user)
    user.pop("password_hash", None)
    user.pop("_id", None)
    return user


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(401, "User not found")
    return public_user(user)


async def optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") not in ("admin", "super_admin"):
        raise HTTPException(403, "Administrator access required")
    return user


# ---------------- Rate limiting ----------------
RATE: dict = {}


def rate_limit(key: str, limit: int = 5, window: int = 60):
    ts = now().timestamp()
    hits = [t for t in RATE.get(key, []) if ts - t < window]
    if len(hits) >= limit:
        raise HTTPException(429, "Too many requests. Please try again shortly.")
    hits.append(ts)
    RATE[key] = hits


# ---------------- Email service ----------------
def _send_smtp(to: str, subject: str, html: str):
    host = os.environ.get("SMTP_HOST", "")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASS", "")
    sender = os.environ.get("SMTP_FROM", user or "noreply@yobsman-tech.com")
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Yobsman-Tech <{sender}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP(host, port, timeout=20) as s:
        s.starttls()
        if user:
            s.login(user, password)
        s.sendmail(sender, [to], msg.as_string())


def email_template(title: str, body: str) -> str:
    return f"""<div style="background:#050507;padding:40px 20px;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;background:#0D0D10;border:1px solid #27272A;border-radius:12px;padding:36px;">
<p style="color:#71717A;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">YOBSMAN-TECH</p>
<h1 style="color:#FAFAFA;font-size:22px;margin:0 0 18px;">{title}</h1>
<div style="color:#A1A1AA;font-size:14px;line-height:1.7;">{body}</div>
<hr style="border:none;border-top:1px solid #27272A;margin:28px 0;">
<p style="color:#52525B;font-size:11px;margin:0;">Yobsman-Tech — Espoo/Helsinki, Finland · info@yobsman-tech.com<br>© Yobsman-Tech — All Rights Reserved.</p>
</div></div>"""


async def send_email(to: str, subject: str, html: str) -> str:
    if not os.environ.get("SMTP_HOST"):
        logger.info(f"[EMAIL MOCKED] To: {to} | Subject: {subject}")
        return "mocked"
    try:
        await asyncio.to_thread(_send_smtp, to, subject, html)
        return "sent"
    except Exception as e:
        logger.error(f"Email failed to {to}: {e}")
        return "failed"


# ---------------- Input models ----------------
class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    language: str = Field(default="en", max_length=8)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)


class ProfileIn(BaseModel):
    name: Optional[str] = Field(default=None, max_length=80)
    phone: Optional[str] = Field(default=None, max_length=40)
    company: Optional[str] = Field(default=None, max_length=120)
    country: Optional[str] = Field(default=None, max_length=80)
    language: Optional[str] = Field(default=None, max_length=8)
    notify_email: Optional[bool] = None
    notify_appointments: Optional[bool] = None


class QuoteIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=80)
    company: str = Field(default="", max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    country: str = Field(default="", max_length=80)
    contact_method: str = Field(default="email", max_length=20)
    service: str = Field(min_length=2, max_length=80)
    project_type: str = Field(default="", max_length=80)
    budget: str = Field(default="", max_length=40)
    description: str = Field(min_length=10, max_length=4000)
    timeline: str = Field(default="", max_length=80)
    language: str = Field(default="en", max_length=8)
    attachment: str = Field(default="", max_length=200)
    obc_origin: str = Field(default="", max_length=120)
    obc_destination: str = Field(default="", max_length=120)
    obc_weight: str = Field(default="", max_length=40)
    obc_deadline: str = Field(default="", max_length=40)
    consent: bool
    website: str = ""  # honeypot


class ContactIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    company: str = Field(default="", max_length=120)
    country: str = Field(default="", max_length=80)
    subject: str = Field(min_length=2, max_length=160)
    service: str = Field(default="", max_length=80)
    message: str = Field(min_length=10, max_length=4000)
    contact_method: str = Field(default="email", max_length=20)
    consent: bool
    website: str = ""  # honeypot


class ChecklistLeadIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    service_type: str = Field(min_length=2, max_length=40)
    country: str = Field(min_length=2, max_length=120)
    stage: str = Field(min_length=2, max_length=40)
    urgency: str = Field(min_length=2, max_length=40)
    checklist: list[str] = Field(min_length=1, max_length=30)
    language: str = Field(default="en", max_length=8)
    consent: bool
    website: str = ""  # honeypot


class AppointmentIn(BaseModel):
    service: str = Field(min_length=2, max_length=80)
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    timezone: str = Field(min_length=2, max_length=60)
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    language: str = Field(default="en", max_length=8)
    notes: str = Field(default="", max_length=2000)


# ---------------- Health ----------------
@api.get("/")
async def root():
    return {"message": "Yobsman-Tech API", "status": "operational"}


@api.get("/health")
async def health():
    return {"status": "ok", "time": now().isoformat()}


# ---------------- Auth ----------------
@api.post("/auth/register")
async def register(data: RegisterIn, response: Response, request: Request):
    rate_limit(f"reg:{request.client.host}", 10, 300)
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(409, "An account with this email already exists")
    user = {"id": new_id(), "name": data.name.strip(), "email": email,
            "password_hash": hash_password(data.password), "role": "user",
            "language": data.language, "phone": "", "company": "", "country": "",
            "notify_email": True, "notify_appointments": True,
            "email_verified": False, "created_at": now().isoformat()}
    await db.users.insert_one(user)
    set_auth_cookies(response, user)
    asyncio.create_task(send_email(email, "Welcome to Yobsman-Tech",
        email_template("Account created", f"<p>Hello {user['name']},</p><p>Your Yobsman-Tech account is ready. You can now book appointments, request quotations and manage your engagements from your dashboard.</p>")))
    return public_user(user)


@api.post("/auth/login")
async def login(data: LoginIn, response: Response, request: Request):
    email = data.email.lower()
    ident = f"{request.client.host}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > now():
            raise HTTPException(429, "Account temporarily locked. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(data.password, user["password_hash"]):
        await db.login_attempts.update_one({"identifier": ident},
            {"$inc": {"count": 1}, "$set": {"locked_until": (now() + timedelta(minutes=15)).isoformat()}},
            upsert=True)
        raise HTTPException(401, "Invalid email or password")
    await db.login_attempts.delete_one({"identifier": ident})
    set_auth_cookies(response, user)
    return public_user(user)


@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    import httpx
    body = await request.json()
    session_id = (body.get("session_id") or "").strip()
    if not session_id:
        raise HTTPException(400, "Missing session_id")
    async with httpx.AsyncClient(timeout=15) as http_client:
        r = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(401, "Google sign-in could not be verified")
    data = r.json()
    email = data["email"].lower()
    user = await db.users.find_one({"email": email})
    if not user:
        user = {"id": new_id(), "name": data.get("name") or email.split("@")[0], "email": email,
                "password_hash": "", "role": "user", "language": "en", "phone": "", "company": "",
                "country": "", "notify_email": True, "notify_appointments": True,
                "email_verified": True, "picture": data.get("picture", ""), "oauth_provider": "google",
                "created_at": now().isoformat()}
        await db.users.insert_one(user)
    await db.user_sessions.insert_one({"user_id": user["id"], "session_token": data["session_token"],
        "expires_at": (now() + timedelta(days=7)).isoformat(), "created_at": now().isoformat()})
    response.set_cookie("session_token", data["session_token"], httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")
    set_auth_cookies(response, user)
    return public_user(user)


@api.get("/auth/me")
async def me(request: Request):
    return await get_current_user(request)


@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(401, "User not found")
    response.set_cookie("access_token", create_access_token(user), httponly=True, secure=True,
                        samesite="none", max_age=3600, path="/")
    return {"ok": True}


@api.post("/auth/forgot-password")
async def forgot_password(request: Request):
    body = await request.json()
    email = (body.get("email") or "").lower().strip()
    user = await db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({"token": token, "email": email,
            "expires_at": (now() + timedelta(hours=1)).isoformat(), "used": False})
        frontend = os.environ.get("FRONTEND_URL", "")
        link = f"{frontend}/reset-password?token={token}"
        logger.info(f"Password reset link for {email}: {link}")
        await send_email(email, "Reset your Yobsman-Tech password",
            email_template("Password reset", f"<p>Use the link below to reset your password. It expires in 1 hour.</p><p><a href='{link}' style='color:#FAFAFA;'>{link}</a></p>"))
    return {"ok": True, "message": "If the account exists, a reset link has been sent."}


@api.post("/auth/reset-password")
async def reset_password(data: ResetIn):
    rec = await db.password_reset_tokens.find_one({"token": data.token, "used": False})
    if not rec or datetime.fromisoformat(rec["expires_at"]) < now():
        raise HTTPException(400, "Reset link is invalid or has expired")
    await db.users.update_one({"email": rec["email"]}, {"$set": {"password_hash": hash_password(data.password)}})
    await db.password_reset_tokens.update_one({"token": data.token}, {"$set": {"used": True}})
    return {"ok": True}


# ---------------- Public content ----------------
@api.get("/content/services")
async def get_services():
    return await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(50)


@api.get("/content/leadership")
async def get_leadership():
    return await db.leadership.find({}, {"_id": 0}).sort("order", 1).to_list(50)


@api.get("/content/partners")
async def get_partners():
    return await db.partners.find({}, {"_id": 0}).sort("order", 1).to_list(50)


@api.get("/content/jobs")
async def get_jobs(department: str = "", country: str = "", employment_type: str = "", search: str = ""):
    q = {}
    if department:
        q["department"] = department
    if country:
        q["country"] = country
    if employment_type:
        q["employment_type"] = employment_type
    if search:
        q["title"] = {"$regex": re.escape(search), "$options": "i"}
    return await db.jobs.find(q, {"_id": 0}).sort("posted_at", -1).to_list(100)


@api.get("/content/jobs/{job_id}")
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(404, "Position not found")
    return job


@api.get("/content/posts")
async def get_posts():
    return await db.posts.find({}, {"_id": 0}).sort("published_at", -1).to_list(50)


@api.get("/content/posts/{slug}")
async def get_post(slug: str):
    post = await db.posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(404, "Article not found")
    return post


# ---------------- Quote / Contact ----------------
async def save_upload(file: Optional[UploadFile]) -> str:
    if not file or not file.filename:
        return ""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXT:
        raise HTTPException(400, "File type not allowed")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(400, "File exceeds 5MB limit")
    fname = f"{new_id()}{ext}"
    (UPLOAD_DIR / fname).write_bytes(data)
    return fname


@api.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    rate_limit(f"upload:{request.client.host}", 10, 300)
    fname = await save_upload(file)
    return {"ok": True, "file": fname}


@api.post("/quotes")
async def submit_quote(data: QuoteIn, request: Request):
    rate_limit(f"quote:{request.client.host}", 5, 300)
    if data.website:
        return {"ok": True}  # honeypot: silently drop
    if not data.consent:
        raise HTTPException(422, "Consent to the privacy policy is required")
    doc = data.model_dump()
    doc.pop("website", None)
    doc.update({"id": new_id(), "status": "new", "created_at": now().isoformat()})
    await db.quotes.insert_one(doc)
    body = "".join(f"<p><b>{k.replace('_', ' ').title()}:</b> {v}</p>" for k, v in doc.items()
                   if k not in ("id", "status", "created_at") and v)
    email_status = await send_email(QUOTE_EMAIL, f"Quote request — {doc['service']} — {doc['full_name']}",
                                    email_template("New quotation request", body))
    asyncio.create_task(send_email(doc["email"], "Your quote request — Yobsman-Tech",
        email_template("Request received", "<p>Thank you for contacting Yobsman-Tech. Your quote request has been received. Our team will review your requirements and contact you shortly.</p>")))
    tracking_url = ""
    if "On-Board Courier" in doc["service"]:
        token = secrets.token_urlsafe(16)
        await db.missions.insert_one({
            "id": new_id(), "token": token, "quote_id": doc["id"], "service": doc["service"],
            "full_name": doc["full_name"], "origin": doc.get("obc_origin", ""),
            "destination": doc.get("obc_destination", ""), "weight": doc.get("obc_weight", ""),
            "deadline": doc.get("obc_deadline", ""), "pod_file": "", "pod_note": "", "pod_at": "",
            "created_at": now().isoformat()})
        await db.quotes.update_one({"id": doc["id"]}, {"$set": {"mission_token": token}})
        tracking_url = f"/track/{token}"
    return {"ok": True, "id": doc["id"], "email_status": email_status, "tracking_url": tracking_url,
            "message": "Thank you for contacting Yobsman-Tech. Your quote request has been received. Our team will review your requirements and contact you shortly."}


@api.post("/contact")
async def submit_contact(data: ContactIn, request: Request):
    rate_limit(f"contact:{request.client.host}", 5, 300)
    if data.website:
        return {"ok": True}
    if not data.consent:
        raise HTTPException(422, "Consent to the privacy policy is required")
    doc = data.model_dump()
    doc.pop("website", None)
    doc.update({"id": new_id(), "status": "new", "created_at": now().isoformat()})
    await db.contacts.insert_one(doc)
    body = "".join(f"<p><b>{k.replace('_', ' ').title()}:</b> {v}</p>" for k, v in doc.items()
                   if k not in ("id", "status", "created_at") and v)
    email_status = await send_email(INFO_EMAIL, f"Contact enquiry — {doc['subject']}",
                                    email_template("New contact enquiry", body))
    return {"ok": True, "id": doc["id"], "email_status": email_status,
            "message": "Thank you. Your enquiry has been received — our team will respond shortly."}


@api.post("/documentation-checklist")
async def submit_documentation_checklist(data: ChecklistLeadIn, request: Request):
    rate_limit(f"doc-checklist:{request.client.host}", 5, 300)
    if data.website:
        return {"ok": True}
    if not data.consent:
        raise HTTPException(422, "Consent to the privacy policy is required")
    doc = data.model_dump()
    doc.pop("website", None)
    doc["email"] = doc["email"].lower()
    doc.update({"id": new_id(), "status": "new", "source": "documentation_checklist",
                "created_at": now().isoformat()})
    await db.documentation_leads.insert_one(doc)
    checklist_html = "".join(f"<li>{item}</li>" for item in doc["checklist"])
    summary = (f"<p><b>Name:</b> {doc['name']}</p><p><b>Email:</b> {doc['email']}</p>"
               f"<p><b>Paperwork:</b> {doc['service_type']}</p><p><b>Country/authority:</b> {doc['country']}</p>"
               f"<p><b>Stage:</b> {doc['stage']}</p><p><b>Deadline:</b> {doc['urgency']}</p>"
               f"<p><b>Checklist:</b></p><ol>{checklist_html}</ol>")
    email_status = await send_email(QUOTE_EMAIL,
        f"Documentation checklist lead — {doc['service_type']} — {doc['name']}",
        email_template("New documentation checklist lead", summary))
    asyncio.create_task(send_email(doc["email"], "Your documentation checklist — Yobsman-Tech",
        email_template("Your personalized checklist",
            f"<p>Hello {doc['name']},</p><p>Your personalized Documentation Assistance checklist is ready:</p><ol>{checklist_html}</ol>")))
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"], "email_status": email_status,
            "message": "Your personalized checklist has been saved. Our documentation team can now follow up."}


# ---------------- Appointments ----------------
SLOT_MINUTES = 30
BUSINESS_START, BUSINESS_END = 9, 17


def slot_start_utc(date: str, time_str: str, tz: str) -> datetime:
    day = datetime.strptime(date, "%Y-%m-%d")
    hh, mm = map(int, time_str.split(":"))
    return datetime(day.year, day.month, day.day, hh, mm, tzinfo=ZoneInfo(tz)).astimezone(timezone.utc)


@api.get("/appointments/availability")
async def availability(date: str, tz: str = "UTC"):
    try:
        day = datetime.strptime(date, "%Y-%m-%d").date()
        ZoneInfo(tz)
    except Exception:
        raise HTTPException(400, "Invalid date or timezone")
    booked = set()
    async for a in db.appointments.find({"status": {"$ne": "cancelled"}}, {"start_utc": 1}):
        booked.add(a["start_utc"])
    slots = []
    for minutes in range(BUSINESS_START * 60, BUSINESS_END * 60, SLOT_MINUTES):
        t = f"{minutes // 60:02d}:{minutes % 60:02d}"
        try:
            start = slot_start_utc(date, t, tz)
        except Exception:
            continue
        slots.append({"time": t, "available": start.isoformat() not in booked and start > now()})
    return {"date": date, "timezone": tz, "slots": slots}


@api.post("/appointments")
async def book_appointment(data: AppointmentIn, request: Request):
    rate_limit(f"appt:{request.client.host}", 10, 300)
    try:
        start = slot_start_utc(data.date, data.time, data.timezone)
    except Exception:
        raise HTTPException(400, "Invalid date, time or timezone")
    if start <= now():
        raise HTTPException(400, "Please select a future time slot")
    conflict = await db.appointments.find_one({"start_utc": start.isoformat(), "status": {"$ne": "cancelled"}})
    if conflict:
        raise HTTPException(409, "This time slot has just been taken. Please choose another.")
    user = await optional_user(request)
    doc = data.model_dump()
    doc.update({"id": new_id(), "start_utc": start.isoformat(), "duration_min": SLOT_MINUTES,
                "status": "confirmed", "user_id": user["id"] if user else None,
                "created_at": now().isoformat()})
    await db.appointments.insert_one(doc)
    if user:
        await db.notifications.insert_one({"id": new_id(), "user_id": user["id"],
            "title": "Appointment confirmed",
            "body": f"{data.service} — {data.date} {data.time} ({data.timezone})",
            "read": False, "created_at": now().isoformat()})
    email_status = await send_email(doc["email"], "Appointment confirmed — Yobsman-Tech",
        email_template("Appointment confirmed",
            f"<p>Hello {doc['name']},</p><p>Your appointment is confirmed:</p>"
            f"<p><b>Service:</b> {doc['service']}<br><b>Date:</b> {doc['date']}<br>"
            f"<b>Time:</b> {doc['time']} ({doc['timezone']})<br><b>Duration:</b> 30 minutes</p>"
            f"<p>A Yobsman-Tech specialist will meet you at the scheduled time.</p>"))
    doc.pop("_id", None)
    return {"ok": True, "appointment": doc, "email_status": email_status,
            "message": "Your appointment has been confirmed. A confirmation has been sent to your email."}


# ---------------- User dashboard ----------------
@api.get("/my/overview")
async def my_overview(request: Request):
    user = await get_current_user(request)
    appts = await db.appointments.count_documents({"user_id": user["id"], "status": {"$ne": "cancelled"}})
    upcoming = await db.appointments.count_documents({"user_id": user["id"], "status": "confirmed",
                                                      "start_utc": {"$gte": now().isoformat()}})
    notifications = await db.notifications.count_documents({"user_id": user["id"], "read": False})
    return {"user": user, "appointments": appts, "upcoming": upcoming, "unread_notifications": notifications}


@api.get("/my/appointments")
async def my_appointments(request: Request):
    user = await get_current_user(request)
    email_q = {"$or": [{"user_id": user["id"]}, {"email": user["email"]}]}
    return await db.appointments.find(email_q, {"_id": 0}).sort("start_utc", -1).to_list(100)


@api.patch("/my/appointments/{appt_id}/cancel")
async def cancel_appointment(appt_id: str, request: Request):
    user = await get_current_user(request)
    res = await db.appointments.update_one(
        {"id": appt_id, "$or": [{"user_id": user["id"]}, {"email": user["email"]}]},
        {"$set": {"status": "cancelled", "cancelled_at": now().isoformat()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Appointment not found")
    return {"ok": True}


@api.get("/my/quotes")
async def my_quotes(request: Request):
    user = await get_current_user(request)
    return await db.quotes.find({"email": user["email"]}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api.patch("/my/profile")
async def update_profile(data: ProfileIn, request: Request):
    user = await get_current_user(request)
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
        user.update(updates)
    return user


@api.get("/my/notifications")
async def my_notifications(request: Request):
    user = await get_current_user(request)
    items = await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    await db.notifications.update_many({"user_id": user["id"]}, {"$set": {"read": True}})
    return items


# ---------------- Job applications ----------------
@api.post("/applications")
async def apply_job(request: Request, job_id: str = Form(...), name: str = Form(...),
                    email: str = Form(...), phone: str = Form(""), country: str = Form(""),
                    cover_letter: str = Form(""), portfolio_url: str = Form(""),
                    additional_info: str = Form(""), cv: Optional[UploadFile] = File(None)):
    rate_limit(f"apply:{request.client.host}", 5, 300)
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(404, "Position not found")
    cv_file = await save_upload(cv)
    doc = {"id": new_id(), "job_id": job_id, "job_title": job.get("title", ""),
           "name": name.strip()[:80], "email": email.lower().strip()[:120], "phone": phone[:40],
           "country": country[:80], "cover_letter": cover_letter[:5000], "portfolio_url": portfolio_url[:300],
           "additional_info": additional_info[:2000], "cv_file": cv_file,
           "status": "received", "created_at": now().isoformat()}
    await db.applications.insert_one(doc)
    asyncio.create_task(send_email(doc["email"], f"Application received — {doc['job_title']}",
        email_template("Application received",
            f"<p>Hello {doc['name']},</p><p>Thank you for applying for <b>{doc['job_title']}</b> at Yobsman-Tech. Our talent team will review your application and contact you if your profile matches our requirements.</p>")))
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"], "message": "Your application has been submitted successfully."}


# ---------------- OBC Tracking ----------------
from fastapi.responses import FileResponse


@api.get("/track/{token}")
async def get_mission(token: str):
    m = await db.missions.find_one({"token": token}, {"_id": 0})
    if not m:
        raise HTTPException(404, "Mission not found")
    q = await db.quotes.find_one({"id": m["quote_id"]}, {"status": 1})
    m["status"] = (q or {}).get("status", "new")
    return m


@api.get("/track/{token}/pod-image")
async def pod_image(token: str):
    m = await db.missions.find_one({"token": token})
    if not m or not m.get("pod_file"):
        raise HTTPException(404, "No proof of delivery yet")
    path = UPLOAD_DIR / m["pod_file"]
    if not path.exists():
        raise HTTPException(404, "File missing")
    return FileResponse(path)


@api.post("/track/{token}/pod")
async def upload_pod(token: str, request: Request, photo: UploadFile = File(...), note: str = Form("")):
    rate_limit(f"pod:{request.client.host}", 5, 300)
    m = await db.missions.find_one({"token": token})
    if not m:
        raise HTTPException(404, "Mission not found")
    fname = await save_upload(photo)
    await db.missions.update_one({"token": token},
        {"$set": {"pod_file": fname, "pod_note": note[:500], "pod_at": now().isoformat()}})
    await db.quotes.update_one({"id": m["quote_id"]}, {"$set": {"status": "balance_due"}})
    asyncio.create_task(send_email(QUOTE_EMAIL, f"POD received — balance due — {m['full_name']}",
        email_template("Proof of delivery received",
            f"<p>Mission <b>{m['origin']} → {m['destination']}</b> for <b>{m['full_name']}</b> has been marked delivered.</p>"
            f"<p>The balance invoice can now be issued. Courier note: {note[:500] or '—'}</p>")))
    return {"ok": True}


# ---------------- Admin ----------------
async def audit(admin: dict, action: str, target: str):
    await db.audit_logs.insert_one({"id": new_id(), "admin": admin["email"], "action": action,
                                    "target": target, "created_at": now().isoformat()})


@api.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    counts = {}
    for coll in ("users", "quotes", "contacts", "appointments", "applications", "documentation_leads", "jobs",
                 "leadership", "partners", "posts"):
        counts[coll] = await db[coll].count_documents({})
    counts["quotes_new"] = await db.quotes.count_documents({"status": "new"})
    counts["contacts_new"] = await db.contacts.count_documents({"status": "new"})
    counts["documentation_leads_new"] = await db.documentation_leads.count_documents({"status": "new"})
    counts["appointments_upcoming"] = await db.appointments.count_documents(
        {"status": "confirmed", "start_utc": {"$gte": now().isoformat()}})
    return counts


@api.get("/admin/list/{coll}")
async def admin_list(coll: str, request: Request):
    await require_admin(request)
    allowed = {"quotes", "contacts", "appointments", "applications", "documentation_leads", "users",
               "services", "leadership", "partners", "jobs", "posts", "audit_logs"}
    if coll not in allowed:
        raise HTTPException(404, "Unknown collection")
    proj = {"_id": 0, "password_hash": 0}
    return await db[coll].find({}, proj).sort("created_at", -1).to_list(500)


@api.patch("/admin/item/{coll}/{item_id}")
async def admin_update(coll: str, item_id: str, request: Request):
    admin = await require_admin(request)
    allowed = {"quotes", "contacts", "appointments", "applications", "documentation_leads", "users",
               "services", "leadership", "partners", "jobs", "posts"}
    if coll not in allowed:
        raise HTTPException(404, "Unknown collection")
    body = await request.json()
    body.pop("id", None)
    body.pop("_id", None)
    if coll == "users":
        body = {"role": body.get("role")} if body.get("role") in ("user", "admin", "hr", "support", "sales", "content") else {}
        if not body:
            raise HTTPException(400, "Invalid role")
    res = await db[coll].update_one({"id": item_id}, {"$set": body})
    if res.matched_count == 0:
        raise HTTPException(404, "Item not found")
    await audit(admin, f"update:{coll}", item_id)
    return {"ok": True}


@api.post("/admin/content/{coll}")
async def admin_create(coll: str, request: Request):
    admin = await require_admin(request)
    if coll not in ("services", "leadership", "partners", "jobs", "posts"):
        raise HTTPException(404, "Unknown collection")
    body = await request.json()
    body.pop("_id", None)
    body["id"] = new_id()
    body.setdefault("created_at", now().isoformat())
    if coll == "posts" and not body.get("slug"):
        body["slug"] = re.sub(r"[^a-z0-9]+", "-", body.get("title", "post").lower()).strip("-")
    if coll == "jobs":
        body.setdefault("posted_at", now().isoformat())
    await db[coll].insert_one(body)
    await audit(admin, f"create:{coll}", body["id"])
    body.pop("_id", None)
    return body


@api.delete("/admin/content/{coll}/{item_id}")
async def admin_delete(coll: str, item_id: str, request: Request):
    admin = await require_admin(request)
    if coll not in ("services", "leadership", "partners", "jobs", "posts"):
        raise HTTPException(404, "Unknown collection")
    res = await db[coll].delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Item not found")
    await audit(admin, f"delete:{coll}", item_id)
    return {"ok": True}


# ---------------- Seed ----------------
SERVICES = [
    {"code": "SRV-01", "icon": "Headset", "title": "IT Support / Service Desk",
     "desc": "Professional technical support, troubleshooting, remote assistance, infrastructure support and managed service desk operations."},
    {"code": "SRV-02", "icon": "ChartLineUp", "title": "Data Analysis",
     "desc": "Transform business data into useful insights through analytics, reporting, visualization and data-driven decision making."},
    {"code": "SRV-03", "icon": "Code", "title": "Software Development",
     "desc": "Custom software solutions engineered around your business requirements and operational goals."},
    {"code": "SRV-04", "icon": "Desktop", "title": "Computer Maintenance",
     "desc": "Computer diagnostics, preventive maintenance, optimization, upgrades and hands-on technical support."},
    {"code": "SRV-05", "icon": "Brain", "title": "AI Integration",
     "desc": "Integration of artificial intelligence into business processes, applications and everyday workflows."},
    {"code": "SRV-06", "icon": "DeviceMobile", "title": "Mobile Application Development",
     "desc": "Modern iOS, Android and cross-platform mobile applications designed for performance and scale."},
    {"code": "SRV-07", "icon": "SealCheck", "title": "Quality Assurance & Testing",
     "desc": "Software quality assurance, functional, performance, usability and automated testing."},
    {"code": "SRV-08", "icon": "GlobeHemisphereWest", "title": "Remote IT Consultation",
     "desc": "Professional technology consultation delivered remotely to clients across different countries and time zones."},
    {"code": "SRV-09", "icon": "Plane", "title": "On-Board Courier (OBC)",
     "desc": "Time-critical hand-carry delivery by vetted courier partners. The requester pays the flight cost upfront; all remaining service costs are settled only after proof of delivery."},
    {"code": "SRV-10", "icon": "Files", "title": "Documentation Assistance",
     "desc": "Everyday documentation support for life's important matters: immigration assistance, tax assistance, document drafting and application submission support — handled with care and confidentiality."},
]

LEADERSHIP = [
    {"name": "Kami G. Yoba", "position": "Founder & Chief Executive Officer",
     "bio": "Kami G. Yoba is the founder of Yobsman-Tech and the KAGAYO app. He leads the group's global strategy and technology vision — a leadership that combines Afro-Nordic engineering culture with global operating experience, from the company's Finnish roots to clients across continents.",
     "expertise": "Technology Strategy · Global Operations · AI Systems",
     "photo": "/assets/founder.jpg",
     "linkedin": ""},
]

PARTNERS = [
    {"name": "Nordic Cloud Alliance", "desc": "Cloud infrastructure and hosting partner for the Nordic region.", "url": ""},
    {"name": "FinSec Systems", "desc": "Cybersecurity audit and compliance partner based in Helsinki.", "url": ""},
    {"name": "Baltic Data Group", "desc": "Data engineering and analytics collaboration across the Baltic states.", "url": ""},
    {"name": "Arctic AI Labs", "desc": "Applied AI research partner for machine-learning integration projects.", "url": ""},
    {"name": "EuroNet Solutions", "desc": "Enterprise networking and infrastructure partner across the EU.", "url": ""},
    {"name": "Gulf Tech Ventures", "desc": "Regional delivery partner for MENA technology programs.", "url": ""},
]

JOBS = [
    {"title": "Senior Full-Stack Engineer", "department": "Software Engineering", "location": "Helsinki", "country": "Finland",
     "employment_type": "Full-time", "work_mode": "Hybrid", "deadline": "2026-09-30",
     "responsibilities": "Design and build scalable web applications for international clients. Lead code reviews, mentor engineers and shape architecture decisions across the platform.",
     "requirements": "5+ years of professional software development. Strong TypeScript, React and Python experience. Familiarity with cloud-native deployment.",
     "benefits": "Competitive Nordic salary, flexible hybrid work, learning budget, comprehensive healthcare."},
    {"title": "AI Integration Engineer", "department": "AI", "location": "Espoo", "country": "Finland",
     "employment_type": "Full-time", "work_mode": "Hybrid", "deadline": "2026-10-15",
     "responsibilities": "Integrate LLM and ML capabilities into client products. Build evaluation pipelines, prompt systems and AI-assisted workflows.",
     "requirements": "Experience with production LLM systems, Python, vector databases and API design.",
     "benefits": "Greenfield AI projects, research time, modern hardware, remote-friendly culture."},
    {"title": "IT Support Specialist", "department": "IT Support", "location": "Remote", "country": "Sweden",
     "employment_type": "Full-time", "work_mode": "Remote", "deadline": "2026-08-31",
     "responsibilities": "Operate the international service desk: troubleshoot hardware/software issues, manage tickets and support clients across time zones.",
     "requirements": "2+ years in IT support, excellent English, experience with ticketing systems and remote tooling.",
     "benefits": "Fully remote, shift flexibility, certification sponsorship."},
    {"title": "Data Analyst", "department": "Data Analysis", "location": "Frankfurt", "country": "Germany",
     "employment_type": "Full-time", "work_mode": "Hybrid", "deadline": "2026-09-15",
     "responsibilities": "Turn client data into decision-grade insight: build dashboards, models and reporting pipelines for enterprise engagements.",
     "requirements": "Strong SQL, Python and BI tooling. Experience with data visualization and stakeholder communication.",
     "benefits": "International projects, modern data stack, annual bonus."},
    {"title": "QA Automation Engineer", "department": "QA Testing", "location": "Remote", "country": "Poland",
     "employment_type": "Full-time", "work_mode": "Remote", "deadline": "2026-09-30",
     "responsibilities": "Design automated test suites, performance tests and quality gates across web and mobile products.",
     "requirements": "Playwright/Cypress experience, CI/CD fluency, API testing expertise.",
     "benefits": "Remote-first, equipment allowance, conference budget."},
    {"title": "Mobile Developer (React Native)", "department": "Mobile Development", "location": "Dubai", "country": "UAE",
     "employment_type": "Full-time", "work_mode": "On-site", "deadline": "2026-10-31",
     "responsibilities": "Build and ship cross-platform mobile applications, including features for the KAGAYO legal platform.",
     "requirements": "3+ years React Native, native module experience, published apps on both stores.",
     "benefits": "Relocation support, tax-free salary, premium health cover."},
    {"title": "Project Manager — Technology Delivery", "department": "Project Management", "location": "Nairobi", "country": "Kenya",
     "employment_type": "Full-time", "work_mode": "Hybrid", "deadline": "2026-09-20",
     "responsibilities": "Run multi-country delivery programs: scope, plan and deliver software and IT projects with distributed teams.",
     "requirements": "4+ years managing technical projects, strong client communication, Agile fluency.",
     "benefits": "Regional leadership track, performance bonus, travel opportunities."},
    {"title": "Business Development Manager", "department": "Sales & Business Development", "location": "London", "country": "United Kingdom",
     "employment_type": "Full-time", "work_mode": "Hybrid", "deadline": "2026-10-10",
     "responsibilities": "Grow Yobsman-Tech's client base across the UK and Europe. Own the pipeline from first contact to signed engagement.",
     "requirements": "B2B technology sales experience, consultative selling skills, CRM discipline.",
     "benefits": "Uncapped commission, European travel, equity options."},
]

POSTS = [
    {"slug": "engineering-without-borders", "title": "Engineering Without Borders: Building a Global IT Company from Finland",
     "category": "Company News", "author": "Aleksi Yobsman", "published_at": "2026-06-12",
     "image": "https://images.unsplash.com/photo-1472803828399-39d4ac53c6e5?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
     "excerpt": "Why we built Yobsman-Tech in Espoo — and how Finnish engineering discipline scales to clients on four continents.",
     "content": "Finland taught us that great engineering is quiet, precise and reliable. Yobsman-Tech was founded on the idea that this discipline should not stop at the border.\n\nToday our teams deliver software, AI integration, data platforms and managed IT support to organizations across Europe, the Middle East, Africa and beyond. The model is simple: Nordic quality standards, global delivery capability, and remote-first consultation that meets clients in their own time zone.\n\nThis is only the beginning. As KAGAYO — our legal-technology subsidiary — grows into new markets, the same principle applies: engineering without borders, trust without compromise."},
    {"slug": "ai-integration-practical-guide", "title": "AI Integration That Actually Ships: A Practical Field Guide",
     "category": "AI", "author": "Sara Lindqvist", "published_at": "2026-05-28",
     "image": "https://images.unsplash.com/photo-1639066648921-82d4500abf1a?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
     "excerpt": "Most AI projects fail between the demo and production. Here is the integration discipline we use to get them live.",
     "content": "The gap between an AI demo and an AI feature your business can rely on is engineering discipline.\n\nAt Yobsman-Tech we integrate artificial intelligence into existing workflows with three rules: start with the workflow, not the model; measure everything; and never ship an AI feature without a human-readable audit trail.\n\nThe result is AI that survives contact with production — integrations that reduce cost, speed up decisions and hold up under real-world load."},
    {"slug": "kagayo-the-law-meet", "title": "Introducing KAGAYO: The Law Meet",
     "category": "KAGAYO Updates", "author": "Emma Virtanen", "published_at": "2026-05-02",
     "image": "https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
     "excerpt": "Our legal-technology subsidiary is building the simplest way for people and businesses to meet the law.",
     "content": "KAGAYO — The Law Meet — is Yobsman-Tech's legal-technology subsidiary: a mobile and web application designed to make legal access radically simpler.\n\nBuilt by a cross-border team of engineers and legal professionals, KAGAYO combines secure document workflows, encrypted communication and jurisdiction-aware guidance in one elegant platform.\n\nPrivacy is not a feature of KAGAYO. It is the foundation. The platform is engineered with GDPR-grade data protection from the first commit."},
]


async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@yobsman-tech.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "YobsmanAdmin2026!")
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({"id": new_id(), "name": "Yobsman Administrator", "email": email,
            "password_hash": hash_password(password), "role": "admin", "language": "en",
            "phone": "", "company": "Yobsman-Tech", "country": "Finland",
            "notify_email": True, "notify_appointments": True, "email_verified": True,
            "created_at": now().isoformat()})
        logger.info(f"Admin seeded: {email}")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password), "role": "admin"}})


async def seed_content():
    existing_codes = {s["code"] async for s in db.services.find({}, {"code": 1})}
    new_services = [{**s, "id": new_id(), "order": i + 1} for i, s in enumerate(SERVICES) if s["code"] not in existing_codes]
    if new_services:
        await db.services.insert_many(new_services)
    if await db.leadership.count_documents({}) == 0:
        await db.leadership.insert_many([{**m, "id": new_id(), "order": i + 1} for i, m in enumerate(LEADERSHIP)])
    if await db.partners.count_documents({}) == 0:
        await db.partners.insert_many([{**p, "id": new_id(), "order": i + 1} for i, p in enumerate(PARTNERS)])
    if await db.jobs.count_documents({}) == 0:
        await db.jobs.insert_many([{**j, "id": new_id(), "posted_at": now().isoformat()} for j in JOBS])
    if await db.posts.count_documents({}) == 0:
        await db.posts.insert_many([{**p, "id": new_id()} for p in POSTS])


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.appointments.create_index("start_utc")
    await db.appointments.create_index("email")
    await db.notifications.create_index("user_id")
    await db.jobs.create_index("department")
    await db.jobs.create_index("country")
    await seed_admin()
    await seed_content()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api)

origins = [o for o in [os.environ.get("FRONTEND_URL"), "http://localhost:3000"] if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
