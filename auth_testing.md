# Auth Testing Playbook (Emergent Google OAuth + JWT cookie auth)

## Flow
1. Login/Register "Google" button redirects to `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin + '/dashboard')}` — REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH.
2. Google returns user to `/dashboard#session_id=...`.
3. `App.js` detects `session_id` in `useLocation().hash` synchronously during render and shows `AuthCallback`.
4. `AuthCallback` POSTs `/api/auth/google/session` {session_id}; backend exchanges it server-side at `https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data` (header `X-Session-ID`), creates/finds the user by email, stores `session_token` in `user_sessions` (7-day expiry), sets httpOnly cookies: `session_token` + our JWT `access_token`/`refresh_token`.
5. Existing `/api/auth/me` keeps working (JWT cookies).

## Manual test steps
1. Create a test session directly in Mongo if needed:
   mongosh "$MONGO_URL" --eval 'use("<DB_NAME>"); db.user_sessions.insertOne({user_id:"test", session_token:"test_session_123", expires_at:new Date(Date.now()+6048e5), created_at:new Date()})'
2. Backend: `curl -X GET "$API/api/auth/me" -H "Authorization: Bearer <jwt>"` returns user or 401.
3. Google happy path requires a real browser Google account: click "Google" on /login, approve, confirm landing on /dashboard with cookies set.
4. Logout: POST /api/auth/logout clears access_token, refresh_token, session_token and deletes the user_sessions record.

## Notes
- Facebook button remains a placeholder (toast) until the user provides Facebook App ID/Secret.
- Password login guard: accounts created via Google have empty password_hash and cannot log in via email/password until they set a password.
