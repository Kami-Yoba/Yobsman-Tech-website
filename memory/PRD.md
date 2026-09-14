# Yobsman-Tech — Global Corporate Platform — PRD

## Original problem statement
Build a premium, futuristic, monochrome (black/grey/white) corporate website for Yobsman-Tech, a global IT company established in Finland, with: 8 core services, KAGAYO legal-tech subsidiary showcase, quote requests (→ quote@yobsman-tech.com), contact enquiries (→ info@yobsman-tech.com), appointment booking with timezones, user accounts + dashboard, admin dashboard/CMS, careers with applications, leadership, partners, blog/insights, 18-language i18n with Arabic RTL, cookie consent (GDPR), SEO, accessibility, performance, security. Brand logos provided by user.

## User personas
- Prospective corporate/government/SME client requesting quotes, booking consultations
- Individual customer creating an account and managing appointments
- Job applicant browsing and applying for global roles
- Yobsman-Tech administrator managing content, quotes, appointments, users
- Investor/partner evaluating the brand (marketing pages)

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + lenis (smooth scroll), react-router, axios, sonner. Custom i18n context (18 languages, RTL for Arabic, fallback to English). Monochrome design system: Outfit / Plus Jakarta Sans / JetBrains Mono.
- Backend: FastAPI + motor (MongoDB), JWT httpOnly-cookie auth (access 60min + refresh 7d), bcrypt, brute-force lockout, rate limiting, honeypot spam traps, server-side validation, SMTP email service (env-configured), audit logs.
- Database: MongoDB collections — users, quotes, contacts, appointments, applications, notifications, services, leadership, partners, jobs, posts, login_attempts, password_reset_tokens, audit_logs.

## Core requirements (static)
1. Marketing pages: Home, About, Services, Solutions, KAGAYO, Partners, Leadership, Careers, Insights, Contact
2. Quote request system → quote@yobsman-tech.com
3. Contact system → info@yobsman-tech.com
4. Appointment booking: service/date/time/timezone, UTC storage, conflict prevention, cancellation
5. Auth: email/password JWT (OAuth-ready), roles (admin/hr/support/sales/content/user)
6. User dashboard: overview, appointments, quotes, profile, notifications, language
7. Admin command center: stats, triage queues, user roles, content CRUD
8. 18 languages + RTL
9. Cookie consent, SEO (meta, OG, JSON-LD, sitemap, robots, hreflang), reduced-motion support

## Implemented (2026-09-07)
- Full monochrome Awwwards-style design: kinetic masked-line hero, network canvas, editorial marquee, numbered manifesto, light/dark contrast sections, glassmorphism, animated stats
- All marketing pages with seeded content (8 services, 4 leaders, 6 partners, 8 jobs, 3 posts)
- Quote + contact forms with honeypot, rate limit, validation, file upload for quote briefs
- Booking system: live availability, timezone-aware slots, UTC storage, conflict detection, cancellation from dashboard
- Auth: register/login/logout/refresh/forgot/reset, admin seeding, lockout protection
- User dashboard (6 tabs) and admin dashboard (overview, quotes, contacts, appointments, applications, users, content CRUD)
- i18n: 18 languages selectable, Arabic RTL verified, English full coverage, 17 languages auto-seeded core translations with English fallback
- Cookie consent banner (necessary/analytics/marketing), SEO head with JSON-LD + hreflang, robots.txt, sitemap.xml
- Logos: processed user-provided Yobsman-Tech + KAGAYO logos (inverted white variants generated for dark backgrounds)
- 2026-09-07: Full theme inversion to white-dominant design per user request (light sections now default; dark zinc-950 kept as accent for buttons, tiles and contrast cards); original black Yobsman-Tech logo restored and enlarged in navbar (h-11/14) and footer (h-14); KAGAYO hero uses black logo, device mockups keep white logo on black screens
- 2026-09-07: Added On-Board Courier (OBC) partner service — dedicated /obc page with two-milestone payment model (flight cost upfront, service balance after proof of delivery), 6-step process, trust cards; added as SRV-09 in services (DB upsert-by-code), Solutions card, footer link, contact dropdown; quote/book pages pick it up automatically via API
- 2026-09-07 (batch): Fixed Services page CTA overlap — buttons now stacked (Book above Quote). Theme switcher (light/dark) via CSS-inversion engine with data-photo exclusions, persisted in localStorage, toggle in navbar desktop+mobile. Real legal pages: /privacy, /terms, /cookies, /accessibility (GDPR-grade content, linked in footer). MOCKED Google/Facebook sign-in buttons on login/register (toast: rollout pending). OBC quote fields (origin/destination/weight/deadline) appear when OBC selected; OBC quotes auto-create a mission with public tracking link /track/:token (6-stage milestone timeline); courier POD photo upload on tracking page flips quote status to balance_due and notifies quote@ (MOCKED email until SMTP); admin quotes tab shows OBC tracking links and new statuses (flight_paid, in_transit, balance_due)
- 2026-09-07 (batch 2): REAL Google OAuth live via Emergent-managed auth (button redirects to auth.emergentagent.com, /api/auth/google/session exchanges session_id server-side, sets session_token + JWT cookies; logout clears all); Facebook stays MOCKED pending user's Facebook App credentials. Admin one-click OBC milestone advance button (new→in_review→quoted→flight_paid→in_transit→balance_due→closed). Dropdown fixes: mobile nav menu is now a right-anchored 288px scrollable dropdown with per-item hover highlight; language selector right-aligned, scrollable, stronger hover. Translations: all 17 seeded languages now cover legal pages (titles, intros, section headings — bodies remain English) and full OBC page content (verified in Finnish). Legal/OBC translation dictionary in src/i18n/legalObc.js
- 2026-09-10: Leadership reduced to a single profile per user direction: Kami G. Yoba, Founder & Chief Executive Officer, with the user's attached photo (/assets/founder.jpg). All other leader profiles removed from DB and seed. New copy: "The person behind the platform. A leadership that combines AFRO - Nordic engineering culture with global operating experience." Leadership page + Home preview render a single centered card.
- 2026-09-10: Home "OUR SUBSIDIARY" heading now shows the KAGAYO logo image (same black logo as the KAGAYO page) instead of text. Founder bio updated (DB + seed): he is now stated as founder of both Yobsman-Tech and the KAGAYO app.
- 2026-09-10: KAGAYO deep-link live — "Access KAGAYO" and "Open KAGAYO app" CTAs point to https://www.kagayo.app (new tab). Google Play + App Store download badges added on the KAGAYO hero (currently linking to www.kagayo.app until real store listing URLs exist). Facebook page https://www.facebook.com/profile.php?id=61569349950144 wired as the social link in footer + contact page. Facebook LOGIN still MOCKED — user shared a page URL, not an App ID/Secret (needs developers.facebook.com app credentials).
- 2026-09-10: Browser icon set to the user's attached Yobsman bolt mark — favicon.png (trimmed square) + multi-size favicon.ico + apple-touch-icon.png generated; manifest.json created with the icon.
- 2026-09-14: KAGAYO app demo video (user-provided screen recording, compressed 22MB→2.2MB, black intro trimmed, poster frame) now plays inside the phone + browser mockups on the KAGAYO page and the Home KAGAYO section, replacing static mockups. Dark-mode inversion excludes video. Founder photo replaced with the new attached portrait (assets/founder.jpg). New service SRV-10 "Documentation Assistance" (immigration, tax, document drafting, application submission) — auto-appears in Services/Home/Quote/Book via API, plus contact dropdown and footer.

## Verification status (2026-09-07)
- curl-verified: services/jobs content, register, login, me, quote submit, contact submit, availability, booking, my-appointments, admin stats/lists, unauthenticated admin block (401)
- Screenshot-verified: hero, global presence, services, manifesto, KAGAYO page, RTL Arabic, booking flow end-to-end (confirmed), admin login → command center, users tab, mobile nav
- Email delivery: MOCKED (SMTP_HOST empty — emails logged) until user provides SMTP credentials

## Backlog
- P0: Real SMTP credentials (user to provide: SMTP_HOST/PORT/USER/PASS) → live email to info@/quote@yobsman-tech.com
- P1: Google + Facebook OAuth (architecture ready, needs app credentials)
- P1: Full professional translations for all 18 languages (currently core UI only for 17)
- P1: Legal pages content (Privacy Policy, Terms, Cookie Policy, Accessibility statement)
- P2: Calendar sync (Google/Outlook), appointment reschedule flow, email reminders
- P2: AI chat assistant, live chat/WhatsApp/CRM integrations
- P2: Admin WYSIWYG editing UX, image uploads for leadership/partners via CMS
- P2: E2E test suite automation
