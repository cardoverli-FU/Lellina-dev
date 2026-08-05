# Lellina — V1 Build Phases

> **Galz for Galz** | Tanzania 🇹🇿 & Kenya 🇰🇪  
> Solo dev + AI | Web app first → APK later  
> This document tracks all V1 build phases and task breakdowns. For agent activity logs, see `worklog.md` at project root.
>
> **Anti-Ghosting Policy:** Lellina is for ACTIVE users, not ghosts. We publicly show response rate badges ("Replies within 24h" / "Often takes a while" / "Ghost risk 🚩"), let users filter out ghost risks, and give easy "Not Feeling It" exit buttons. Ghosts get flagged after 7 days and deprioritized in Discover. This is a CORE selling point — visible on the landing page.
>
> **Launch region:** Tanzania & Kenya only. Other regions show "Coming soon" on `/join`. More regions will be added later. The code is generic — only seed data changed in the pivot.

---

## 🚨 MANDATORY READ: CONTRAST RULE

> **Before writing ANY UI code, you MUST read [`docs/CONTRAST-RULE.md`](./CONTRAST-RULE.md).**
>
> This is the most important rule in the project. Phase 4A shipped with invisible text and invisible icons because this rule was not followed. Summary:
>
> - **Dark background → bright text** (`text-cream`, `text-white`, `text-gold-light`, `text-warm-rose-light`). NEVER `text-soft-charcoal` / `text-espresso` / `text-warm-rose-dark` on dark.
> - **Light background → dark text** (`text-soft-charcoal`, `text-warm-rose-dark`, `text-gold-deep`). NEVER `text-cream` / `text-white` on light.
> - **Interactive elements** (close X, pass buttons, filter toggles, nav icons) MUST be visible on BOTH light and dark themes.
> - **NEVER** wrap HEX CSS vars in `hsl()` — `hsl(var(--background))` is broken if `--background` is a hex value. Use `var(--background)` directly.
>
> Violating this rule = broken UI = P0 bug.

---

## Agent Rules

| # | Rule | Details |
|---|------|---------|
| 1 | **Open Source First** | Use free, open-source packages only |
| 2 | **Free Tools Only** | No paid tools when free alternatives exist |
| 3 | **Landing Page Security** | NEVER expose internal tools, tech stack, or secret methods publicly |
| 4 | **No "Lesbian" Publicly** | Use "Galz for Galz" branding — never the L-word on any public-facing surface |
| 5 | **Image Viewer Design** | VERY modern, VERY cute, VERY sexy with modern animations. NEVER heavy |
| 6 | **Face Detection** | `modern-face-api` (npm, v0.22.5) |
| 7 | **Google GenAI SDK** | `@google/genai` (npm, v2.14.0) — the NEW SDK |
| 8 | **Gemini Models** | `gemini-3.1-flash-lite` and `gemini-3.5-flash-lite`. RPM: 15, TPM: 250K, RPD: 500. 2 API keys for rotation |
| 9 | **GitHub Push Rule** | MUST: (1) Identify project files, (2) Build/fix only what's needed, (3) Extract ONLY project files (no .env, no secrets, no sandbox files), (4) Verify no sandbox/config/skills/.zscripts/mini-services/db/ files included, (5) Push to GitHub, (6) Pull and verify, (7) Confirm no secrets exposed. Violation = rebuild from scratch |
| 10 | **Commit Author** | `user.name = "cardoverli-FU"`, `user.email = "300794432+cardoverli-FU@users.noreply.github.com"` |
| 11 | **Docs Folder** | All planning documents live in `docs/`. All agents MUST read this folder before starting work |
| 12 | **Psychological Rule** | Never say "Premium", "Subscribe", "Upgrade", "Pay wall". Say "Lelly Pass", "Secure your Lelly Pass", "Unlock". Users feel SPECIAL and PROUD |
| 13 | **No Play Store** | Web app first. APK via CapacitorJS later |
| 14 | **Payment Last** | Payment integration is the LAST phase of V1. Do not implement until everything else is tested |
| 15 | **Contrast Rule (HARD RULE — see [`docs/CONTRAST-RULE.md`](./CONTRAST-RULE.md))** | Dark bg → bright text (`text-cream`, `text-white`, `text-gold-light`, `text-warm-rose-light`). Light bg → dark text (`text-soft-charcoal`, `text-warm-rose-dark`, `text-gold-deep`). Interactive elements (close X, pass buttons, filter toggles, nav icons) MUST be visible on BOTH themes. NEVER wrap HEX CSS vars in `hsl()` — use `var(--x)` directly. Violation = P0 bug = invisible UI |

---

## Project Overview

| Field | Value |
|-------|-------|
| **App Name** | Lellina |
| **Tagline** | Galz for Galz |
| **Launch Markets** | Tanzania & Kenya — V1. Other regions are Coming soon (code is generic, only seed data changed) |
| **Team** | Solo dev + AI |
| **Platform** | Web app first (Next.js) → APK via CapacitorJS later |
| **Distribution** | No Play Store — direct web + APK |
| **Payment** | LAST phase in V1. Gateway TBD (Lemon Squeezy, PayFast, or in-app) |
| **V1 Scope** | No group chat. No Play Store. |

### Tanzania Regions (31)

1. Arusha
2. Dar es Salaam
3. Dodoma
4. Geita
5. Iringa
6. Kagera
7. Kaskazini Pemba
8. Kaskazini Unguja
9. Katavi
10. Kigoma
11. Kilimanjaro
12. Kusini Pemba
13. Kusini Unguja
14. Lindi
15. Manyara
16. Mara
17. Mbeya
18. Mjini Magharibi
19. Morogoro
20. Mtwara
21. Mwanza
22. Njombe
23. Pwani
24. Rukwa
25. Ruvuma
26. Shinyanga
27. Simiyu
28. Singida
29. Songwe
30. Tabora
31. Tanga

### Kenya Counties (47)

1. Baringo
2. Bomet
3. Bungoma
4. Busia
5. Elgeyo-Marakwet
6. Embu
7. Garissa
8. Homa Bay
9. Isiolo
10. Kajiado
11. Kakamega
12. Kericho
13. Kiambu
14. Kilifi
15. Kirinyaga
16. Kisii
17. Kisumu
18. Kitui
19. Kwale
20. Laikipia
21. Lamu
22. Machakos
23. Makueni
24. Mandera
25. Marsabit
26. Meru
27. Migori
28. Mombasa
29. Murang'a
30. Nairobi
31. Nakuru
32. Nandi
33. Narok
34. Nyamira
35. Nyandarua
36. Nyeri
37. Samburu
38. Siaya
39. Taita-Taveta
40. Tana River
41. Tharaka-Nithi
42. Trans-Nzoia
43. Turkana
44. Uasin Gishu
45. Vihiga
46. Wajir
47. West Pokot

### Lelly Pass Pricing

USD is the PRIMARY currency — users send exactly this amount in USD. ZAR is shown only as a live convenience reference via `/api/exchange-rate` (fetches from Frankfurter.app, free, no API key, 1hr cache, fallback rate 18.0).

| Tier | Price | Notes |
|------|-------|-------|
| **Founding Lelly Pass** | $5.50 USD (one-time) | First 500 users only — scarcity countdown. Live ZAR conversion shown via Frankfurter.app API |
| **Standard Lelly Pass** | $7.50 USD/month | Auto-flips when 500 founding slots are filled. Live ZAR conversion shown |

### App Navigation

```
DISCOVER → CHAT → EVENTS → PROFILE
```

### Core Strategy: Browse Free, Connect with Lelly Pass

Users can browse, filter, search, and match for FREE. They find someone they want to talk to. BOOM — Lelly Pass required to message. This is the trap. It works because the desire to connect is the most powerful motivator.

### Value Exchange Gating

| Feature | Free | Lelly Pass |
|---------|------|------------|
| Browse & filter profiles | ✅ Unlimited | ✅ Unlimited |
| Live search | ✅ Full access | ✅ Full access |
| Swipe & Match | ✅ Unlimited | ✅ Unlimited |
| Texting / Messaging | ❌ 1/day | ✅ Unlocked |
| Photo viewing | Blurred | Unblur + screenshot-protected |
| Event details | Title only | Full details |
| Chat requests | 1 per day | Unlimited |
| Delete = ghost | No | Yes |
| See who liked you | No | Yes |
| Create events | No | Yes |

### Nighttime Trap

> ✅ **WIRED.** Backend lib (`src/lib/nighttime-trap.ts`) + API route (`src/app/api/verify/night-check/route.ts`) + client-side wiring in login flow (`src/app/login/page.tsx` lines 81–97). Non-blocking night-check after successful login (21:00–07:00 SAST). If triggered, user is redirected to `/verify?night=true` for a quick selfie re-verify.

Random biometric verification during late-night hours (21:00–04:00 SAST). If triggered, the user must complete a verification step or lose access until verified.

---

## V1 Phases

---

### Phase 1: Landing Page  ✅ COMPLETE

**Goal:** A high-converting landing page that makes every visitor want to secure their Founding Lelly Pass. Zero tech exposure. Immediate sign-up.

> **✅ PHASE 1 SHIPPED** — Browser-verified, lint-clean, pushed to GitHub (`cardoverli-FU/lellina-dev`).
> Tabbed layout (6 tabs) replaces long-scroll. Premium Fraunces + Inter fonts. 4-color palette (Deep Rose / Gold / Ivory / Espresso). USD pricing with live TZS/KES via Frankfurter.app. Contrast Rule enforced. No waitlist — community signups route to Telegram + WhatsApp groups.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 1.1 | Hero section — "Lellina", "Galz for Galz", Tanzania & Kenya | ✅ | `src/components/landing/Hero.tsx` → composed in `src/app/page.tsx` |
| 1.2 | Founding Lelly Pass $5.50 USD scarcity offer with countdown (500 slots) | ✅ | `src/components/landing/FoundingPassSection.tsx` + `CountdownWidget.tsx` |
| 1.3 | "Why Galz Love Galz" core features section (no tech secrets, no premium/freemium language) | ✅ | `src/components/landing/WhyGalzSection.tsx` |
| 1.4 | "No Men Will Ever Join" feature section | ✅ | `src/components/landing/NoMenSection.tsx` |
| 1.5 | "The only app in Tanzania & Kenya where galz love galz" local anchor | ✅ | `src/components/landing/CapeTownAnchor.tsx` |
| 1.6 | Founder story section (anonymous, no location) | ✅ | `src/components/landing/FounderStory.tsx` |
| 1.7 | Telegram CTA | ✅ | `src/components/landing/CommunityCTAs.tsx` (Telegram + WhatsApp + Share combined) |
| 1.8 | WhatsApp CTA | ✅ | `src/components/landing/CommunityCTAs.tsx` (Telegram + WhatsApp + Share combined) |
| 1.9 | Share CTA | ✅ | `src/components/landing/CommunityCTAs.tsx` (Telegram + WhatsApp + Share combined) |
| 1.10 | "How You Pay" section — privacy framing, no specific gateway, no prices, just "When we launch" | ✅ | `src/components/landing/HowYouPaySection.tsx` |
| 1.11 | Lelly Pass info (Standard $7.50 USD/month, Founding $5.50 USD for first 500 — live ZAR conversion via `/api/exchange-rate`) | ✅ | `src/components/landing/LellyPassInfo.tsx` + `LivePrice.tsx` |
| 1.12 | SEO meta tags + Open Graph | ✅ | `src/app/layout.tsx` |
| 1.13 | Sticky footer | ✅ | `src/components/layout/Footer.tsx` |
| 1.14 | Very cute logo | ✅ | `src/components/ui/Logo.tsx` (rose-petal + gold bud SVG) |
| 1.15 | Premium fonts (Fraunces display + Inter body via next/font/google) | ✅ | `src/app/layout.tsx` + `src/app/globals.css` |
| 1.16 | Mobile-first responsive design | ✅ | `src/app/page.tsx` + all landing components (44px tap targets, safe-area-inset) |
| 1.17 | High-conversion copy — make people want to sign up | ✅ | All landing components |

**Bonus deliverables shipped beyond the original task list:**

| # | Bonus Component | Purpose | File |
|---|-----------------|---------|------|
| 1.18 | BrandSplash | Deep-rose intro screen, sessionStorage-gated, fades after 1.8s | `src/components/landing/BrandSplash.tsx` |
| 1.19 | LandingTabs | 6-tab navigation (Home / Why / Gate / Galz / Lelly) replacing long-scroll | `src/components/landing/LandingTabs.tsx` |
| 1.20 | TrustSafety | 5 safety promises (Nothing stored / One strike gone / **Nighttime checks** / Handles hidden / Report & block) — PUBLIC on Gate tab | `src/components/landing/TrustSafety.tsx` |
| 1.21 | FAQ | 9-question accordion (Tanzania & Kenya, no men, verification, data safety, Lelly Pass, pricing, 500 slots, free browsing, nighttime checks) | `src/components/landing/FAQ.tsx` |
| 1.22 | LivePrice | Live USD→ZAR conversion badge with `tone` prop (bright text on dark bg, dark on light) | `src/components/landing/LivePrice.tsx` |
| 1.23 | Exchange-rate API | Frankfurter.app integration, 1hr cache, fallback 18.0, no API key | `src/app/api/exchange-rate/route.ts` |
| 1.24 | StickyMobileCTA | Mobile sticky claim bar + scroll-triggered visibility | `src/components/landing/StickyMobileCTA.tsx` |
| 1.25 | Contrast Rule | Codified as Agent Rule #15 — bright text only on dark/rose backgrounds | `docs/phases.md` + `docs/features.md` + `src/app/globals.css` |

**Phase 1 Exit Criteria:** ✅ MET — Landing page is live (port 3000), mobile-responsive, SEO-optimized, and converting. Zero tech stack exposed. Founding Lelly Pass scarcity countdown visible. Browser-verified on desktop + mobile (iPhone 14). Lint clean. Pushed to GitHub.

---

### Phase 2: Verification Gate + Registration  ✅ COMPLETE

**Goal:** A multi-step verification system that keeps men out. Selfie → voice → video → 3-cloud consensus analysis. Nighttime trap re-verifies with IMAGE-ONLY (client-side + server-side AI) — triggers on login if the user is active between 21:00–04:00 SAST. Registration only after verification passes.

> **✅ PHASE 2 SHIPPED** — All verification, registration, login, password-reset, NextAuth, Prisma, and middleware tasks are built and lint-clean. Selfie capture now ships with **auto-captcha** (face held "perfect" for 2.5s auto-captures with a countdown ring — no button tap needed). Backend analysis runs a **3-cloud consensus**: Gemini + HuggingFace + Sightengine (not Gemini alone). Seed data covers Tanzania regions AND Kenya counties + tribe tags.
>
> **⚠️ Nighttime Trap (task 2.6):** The lib (`src/lib/nighttime-trap.ts`) and API route (`src/app/api/verify/night-check/route.ts`) are BUILT, but no client-side caller wires them into the login flow yet. Public-facing copy that promised this feature has been REMOVED from the landing page in the latest commit. Status: **Built, deferred to Phase 3 (post-login wiring)** — see task 2.6 below.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 2.1 | Verification landing screen | ✅ | `src/app/verify/page.tsx` |
| 2.2 | Step 1: Selfie photo capture (modern-face-api) — NOW with **auto-captcha** (face sustained "perfect" for 2.5s auto-captures with SVG countdown ring; manual tap still works as fallback) | ✅ | `src/components/verify/SelfieCapture.tsx` |
| 2.3 | Step 2: Voice recording + pitch analysis | ✅ | `src/components/verify/VoiceCapture.tsx` |
| 2.4 | Step 3: Video with code + OCR | ✅ | `src/components/verify/VideoCapture.tsx` |
| 2.5 | Step 4: Backend analysis — **3-cloud consensus (Gemini + HuggingFace + Sightengine)**, NOT Gemini alone. Zero storage of live verification media | ✅ | `src/app/api/verify/analyze/route.ts` |
| 2.6 | Nighttime Trap: IMAGE-ONLY re-verification on login (21:00–04:00 SAST). Client-side face check (modern-face-api) + server-side Gemini image analysis | ✅ | `src/lib/nighttime-trap.ts` + `src/app/api/verify/night-check/route.ts` + `src/app/login/page.tsx` (lines 81–97) — **WIRED in Phase 3.** Non-blocking night-check after login success. |
| 2.7 | Custom device fingerprinting | ✅ | `src/lib/device-fingerprint.ts` |
| 2.8 | Device + IP ban on verification failure | ✅ | Enforced in `src/lib/verify-limits.ts` + `src/app/api/verify/analyze/route.ts` |
| 2.9 | Verification attempt limit (3 per device) | ✅ | `src/lib/verify-limits.ts` |
| 2.10 | No storage for verification data | ✅ | Zero-storage policy enforced in `src/app/api/verify/` |
| 2.11 | Registration page (after verification) | ✅ | `src/app/register/page.tsx` |
| 2.12 | Login page | ✅ | `src/app/login/page.tsx` |
| 2.13 | Password reset (Gmail nodemailer) | ✅ | `src/app/forgot-password/page.tsx` + `src/lib/email.ts` |
| 2.14 | NextAuth.js setup | ✅ | `src/lib/auth.ts` |
| 2.15 | Prisma database schema (User, Profile, etc.) | ✅ | `prisma/schema.prisma` |
| 2.16 | Database seed data (Tanzania regions + Kenya counties + tribe tags) | ✅ | `prisma/seed.ts` |
| 2.17 | Middleware for `is_verified` route protection | ✅ | `src/middleware.ts` (Next.js 16 calls this file "proxy" now — file is still `middleware.ts` but logs a deprecation warning; functionally correct) |

**Bonus deliverable shipped beyond the original task list:**

| # | Bonus Component | Purpose | File |
|---|-----------------|---------|------|
| 2.18 | Auto-captcha for selfie step | Face sustained "perfect" for 2.5s auto-captures with SVG countdown ring + dynamic "Hold still — capturing…" feedback. Manual tap still works as fallback. Uses refs to avoid stale closures in rAF loop. | `src/components/verify/SelfieCapture.tsx` |

**Phase 2 Exit Criteria:** ✅ MET — 4-step verification flow works end-to-end with 3-cloud consensus analysis and zero storage of live media. Device fingerprinting, bans, and 3-attempt limit are enforced. Registration, login, and password reset (Gmail nodemailer) all functional. NextAuth + Prisma + middleware auth gating all wired up. Seed data covers both launch markets (TZ + ZA). Nighttime Trap is fully wired to login flow (completed in Phase 3).

---

### Phase 3: Profile Setup + Tribe Tags + Location  ✅ COMPLETE

**Goal:** Onboard new users with a warm, guided wizard. Tribe tags (5 max) for identity expression. Tanzania regions + Kenya counties for location.

> **✅ PHASE 3 SHIPPED** — All 11 tasks complete + 6 bonus fixes. Multi-step profile setup wizard (5 steps: Basic Info → District → Tribe Tags → Social Handles → Photos) with AnimatePresence transitions. Districts: 🇹🇿 Tanzania (31 regions) + 🇰🇪 Kenya (47 counties) = 78 total. Tribe tags: 90 total (30 identity, 30 subculture, 30 scene). Country isolation enforced: TZ users see only TZ districts + profiles, KE users see only KE. Social handles: Telegram, IG, Signal + any other social media + "In-app chat works great" message. Username: single-word only, real-time uniqueness check. Photo upload with drag-and-drop, downscale to 1024px, 6-photo limit. Nighttime Trap wired to login. Lint clean.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 3.1 | Profile setup wizard (multi-step) | ✅ | `src/app/profile/setup/page.tsx` |
| 3.2 | Profile photo upload with modern image viewer | ✅ | `src/components/profile/PhotoUpload.tsx` |
| 3.3 | Display name (single-word, unique, community-relevant), age, bio fields | ✅ | `src/components/profile/BasicInfo.tsx` + `src/app/api/profile/check-username/route.ts` |
| 3.4 | District selector (31 Tanzania regions + 47 Kenya counties) | ✅ | `src/components/profile/DistrictSelector.tsx` |
| 3.5 | Street tag (free text, neighborhood-level) | ✅ | `src/components/profile/StreetTag.tsx` |
| 3.6 | Tribe tags selector (up to 5 from identity/subculture categories) | ✅ | `src/components/profile/TribeTagSelector.tsx` |
| 3.7 | Social handles (Telegram, Instagram, Signal, any other — hidden until mutual, "In-app chat works great" message) | ✅ | `src/components/profile/SocialHandles.tsx` |
| 3.8 | Progress bar + completion gate | ✅ | `src/components/profile/SetupProgress.tsx` |
| 3.9 | Tag seed data (90 tags: 30 identity, 30 subculture, 30 scene) | ✅ | `prisma/seed.ts` (tag section) |
| 3.10 | Profile view page | ✅ | `src/app/profile/[id]/page.tsx` |
| 3.11 | Profile edit page | ✅ | `src/app/profile/edit/page.tsx` |

**Bonus deliverable shipped beyond the original task list:**

| # | Bonus Component | Purpose | File |
|---|-----------------|---------|------|
| 3.12 | Nighttime Trap wiring | Client-side night-check call after successful login (21:00–04:00 SAST). Triggers selfie re-verify or allows login. Non-blocking on failure. | `src/app/login/page.tsx` (lines 81–97) |
| 3.13 | Profile API (upsert) | GET/POST /api/profile — create-or-update with full validation (age 18–100, max 5 tribe tags, max 6 photos, district FK check, handle length limits) | `src/app/api/profile/route.ts` |
| 3.14 | Profile by ID API | GET /api/profile/[id] — public profile fetch (social handles EXCLUDED until mutual, Phase 5) | `src/app/api/profile/[id]/route.ts` |
| 3.15 | Districts API | GET /api/districts — ordered by country/region/name | `src/app/api/districts/route.ts` |
| 3.16 | Tribe Tags API | GET /api/tribe-tags — ordered by category/name | `src/app/api/tribe-tags/route.ts` |

**Phase 3 Exit Criteria:** ✅ MET — Profile wizard is complete and warm. Tribe tags (90 total, 5 max per user) are selectable and displayed. Tanzania (31 regions) + Kenya (47 counties) selectable. Username is single-word, unique, with real-time availability check. Social handles include any social media + "In-app chat works great" message. Street tags work. Profile view and edit pages work. Nighttime Trap is wired to login. Landing page shows region banner. All API routes validated.

---

### Phase 4: Discover Grid + Filters + Live Search

**Goal:** The heart of the app. Browse, filter, search, and match — ALL FREE. Users find exactly who they're looking for. But when they want to TALK — that's where Lelly Pass comes in. **Anti-ghosting starts here:** Response Rate Badges on every profile card + filter by response rate.

> **Phase 4 Split:** Phase 4 is split into two sub-phases for build quality:
> - **Phase 4A:** Core discover grid + profile cards + like/pass + founder pin + infinite scroll + 4 core filters (age, district, tribe tags, verified) + app layout with bottom nav. Country isolation enforced. ✅ **LIVE on Render** (commits e22d136 → a1258d9).
> - **Phase 4B:** Response rate badge + ghost score + 4 remaining filters (online, photo, active, response rate) + live search + mobile search + Lelly Pass gating + landing anti-ghost message. ☐ **NEXT**.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 4.1 | Discover grid page (2-col mobile, 3–4 col desktop) | ✅ Phase 4A | `src/app/(app)/discover/page.tsx` + `src/components/discover/DiscoverGrid.tsx` |
| 4.2 | Profile card component (photo, name, district, tags, online status) | ✅ Phase 4A (response rate badge = 4.7 / Phase 4B) | `src/components/discover/ProfileCard.tsx` |
| 4.3 | Like / Pass system (tap to like, tap to pass, mutual = match) | ✅ Phase 4A | `src/app/api/like/route.ts` |
| 4.4 | Founder profile pinned first in grid | ✅ Phase 4A | `src/app/api/discover/route.ts` (ordering) |
| 4.5 | Infinite scroll pagination | ✅ Phase 4A | `src/components/discover/InfiniteScroll.tsx` |
| 4.6 | Online status indicators (Sage dot = online, Gray = offline) | ✅ Phase 4A | `src/components/discover/OnlineStatus.tsx` |
| 4.7 | **Response Rate Badge** — visible on every profile card. 3 tiers: "Replies within 24h" ✅ (sage), "Often takes a while" ⏳ (gold), "Ghost risk 🚩" (warm-rose). Calculated from reply time patterns. Selling point: users know who's active | ☐ Phase 4B | `src/components/discover/ResponseBadge.tsx` + `src/lib/ghost-score.ts` |
| 4.8 | **Ghost Score (hidden)** — backend metric. Tracks reply patterns. If someone ghosts 3+ people, their badge downgrades to "Ghost risk" and they get deprioritized in Discover ranking. Not public shaming, just consequences | ☐ Phase 4B (schema fields `responseRateTier`, `ghostScore`, `ghostFlagCount`, `lastReplyAt` ALREADY on Profile — ready to use) | `src/lib/ghost-score.ts` |
| 4.9 | **Filter: Age range** (slider, 18–60) | ✅ Phase 4A | `src/components/discover/filters/AgeFilter.tsx` |
| 4.10 | **Filter: District** (multi-select) | ✅ Phase 4A | `src/components/discover/filters/DistrictFilter.tsx` |
| 4.11 | **Filter: Tribe tags** (multi-select from identity/subculture categories) | ✅ Phase 4A | `src/components/discover/filters/TagFilter.tsx` |
| 4.12 | **Filter: Online now** (toggle) | ☐ Phase 4B | `src/components/discover/filters/OnlineFilter.tsx` |
| 4.13 | **Filter: Verified only** (toggle, default on) | ✅ Phase 4A | `src/components/discover/filters/VerifiedFilter.tsx` |
| 4.14 | **Filter: Has photo** (toggle) | ☐ Phase 4B | `src/components/discover/filters/PhotoFilter.tsx` |
| 4.15 | **Filter: Recently active** (toggle, last 24h) | ☐ Phase 4B | `src/components/discover/filters/ActiveFilter.tsx` |
| 4.16 | **Filter: Response rate** — filter OUT ghost risks! Options: "Replies within 24h only", "Not ghost risk". This is a SELLING POINT — users love that they can filter out ghosts | ☐ Phase 4B | `src/components/discover/filters/ResponseFilter.tsx` |
| 4.17 | **Filter panel** (collapsible, combines all filters) | ✅ Phase 4A | `src/components/discover/FilterPanel.tsx` |
| 4.18 | **Live search** (real-time search as you type, debounced 300ms) | ☐ Phase 4B | `src/components/discover/LiveSearch.tsx` |
| 4.19 | **Live search fields** (name, bio, street tag, tribe tags) | ☐ Phase 4B | `src/components/discover/LiveSearch.tsx` |
| 4.20 | **Search + filter stacking** (live search works on top of active filters) | ☐ Phase 4B | `src/components/discover/DiscoverGrid.tsx` |
| 4.21 | **Mobile search** (expandable search bar, pull-down to reveal) | ☐ Phase 4B | `src/components/discover/MobileSearch.tsx` |
| 4.22 | Free tier: See 5 likes only | ☐ Phase 4B | `src/lib/gating.ts` |
| 4.23 | Lelly Pass: See unlimited likes | ☐ Phase 4B | `src/lib/gating.ts` |
| 4.24 | App layout with nav tabs (Discover → Chat → Events → Profile) | ✅ Phase 4A (Chat + Events disabled/greyed; Admin Shield toggle for admin role) | `src/app/(app)/layout.tsx` |
| 4.25 | **Landing page anti-ghost message** — explicitly say on the landing page: "We want active users, not ghosts. Response rate badges keep everyone honest." | ☐ Phase 4B | `src/components/landing/WhyGalzSection.tsx` or `src/components/landing/TrustSafety.tsx` |
| 4.26 | **Tanzania & Kenya text audit** — remove any non-TZ/KE words/country references from ALL UI strings (landing, join, discover, profile, emails). Verify no 'South Africa', 'Cape Town', 'Portland', 'Oregon', 'USA', '🇿🇦', '🇺🇸' remain in any user-visible text. | ☐ Phase 4B | Throughout — `src/components/landing/*`, `src/app/join/*`, `src/app/(app)/discover/*`, `src/components/profile/*`, `src/lib/email/*` |

> **Phase 4A progress: 12 / 26 tasks DONE and LIVE.** Remaining 14 tasks = Phase 4B (next chat) — including the new 4.26 Tanzania & Kenya text audit.
> **Admin toggle (Phase 8 task 8.5):** already shipped early — admin logs in → lands on `/discover` → Shield toggle in nav → `/admin/manual-verification` → "Back to App" toggle → `/discover`. No re-login.

**Phase 4 Exit Criteria:** Discover grid works with ALL filters (age, district, tribe tags, online, verified, photo, active, **response rate**). Live search is real-time and debounced. Filters stack with search. Like/pass system works. **Response Rate Badges visible on every profile card. Ghost risks can be filtered out.** Founder is pinned first. Infinite scroll loads more profiles. Landing page mentions anti-ghosting. Mobile is flawless.

---

### Phase 5: Chat Engine + Image Viewer + Anti-Ghosting

**Goal:** Real-time chat with value exchange gating. Free users can send pics but can't receive (blurred). Lelly Pass users unlock everything. 1 chat request/day for free users. **Anti-ghosting features in chat:** "Not Feeling It" button, Ghost Nudge, Ghost Score tracking, and Ghost Redemption.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 5.1 | Socket.io setup (same server) | ☐ | `src/lib/socket.ts` |
| 5.2 | Chat page + UI components | ☐ | `src/app/chat/page.tsx` |
| 5.3 | Chat API routes | ☐ | `src/app/api/chat/route.ts` |
| 5.4 | Handle request system (social handles hidden until mutual approval) | ☐ | `src/app/api/handle-request/route.ts` |
| 5.5 | Read receipts | ☐ | `src/components/chat/ReadReceipts.tsx` |
| 5.6 | Free: can send pics, CANNOT receive pics (blurred) | ☐ | `src/components/chat/BlurredPhoto.tsx` |
| 5.7 | Lelly: receive pics, delete=ghost | ☐ | `src/components/chat/PhotoViewer.tsx` |
| 5.8 | Free: 1 chat request/day limit | ☐ | `src/lib/chat-limits.ts` |
| 5.9 | Lelly: unlimited chat requests | ☐ | `src/lib/chat-limits.ts` |
| 5.10 | Suggest social messengers in chat | ☐ | `src/components/chat/MessengerSuggest.tsx` |
| 5.11 | Online status indicators | ☐ | `src/components/chat/OnlineStatus.tsx` |
| 5.12 | Last seen tracking | ☐ | `src/lib/last-seen.ts` |
| 5.13 | Image viewer — VERY modern, VERY cute, animations | ☐ | `src/components/chat/ImageViewer.tsx` |
| 5.14 | **"Not Feeling It" button** — one-tap polite exit. Sends a pre-written kind message ("Hey, I don't think we're a match. Wishing you well! 💛") and closes the chat gracefully. Replaces ghosting with a kind exit | ☐ | `src/components/chat/NotFeelingIt.tsx` |
| 5.15 | **Ghost Nudge** — after 3 days of no reply, the other person sees a "Still there? 👋" button that sends ONE nudge (can't spam it). If no reply after 7 days, the ghost is flagged | ☐ | `src/components/chat/GhostNudge.tsx` |
| 5.16 | **Ghost Score tracking** — backend tracks reply times. Every chat updates the ghost score. Consistent fast replies = "Replies within 24h" badge. Slow replies = "Often takes a while". Ghosting 3+ people = "Ghost risk 🚩" and Discover deprioritization | ☐ | `src/lib/ghost-score.ts` + `src/app/api/ghost-score/route.ts` |
| 5.17 | **Ghost Flag** — after 7+ days of silence in a conversation, the other person can tap "Report Ghosting". Accumulated flags = ghost reputation. Admin can warn/ban chronic ghosts | ☐ | `src/components/chat/ReportGhost.tsx` + `src/app/api/ghost-flag/route.ts` |
| 5.18 | **Ghost Redemption** — how ghosts improve their badge. If a ghost becomes active again (replies within 24h for 14 consecutive days), their badge upgrades: "Ghost risk 🚩" → "Often takes a while" → "Replies within 24h". The path back is clear and achievable | ☐ | `src/lib/ghost-score.ts` (redemption logic) |

**Phase 5 Exit Criteria:** Real-time chat works with Socket.io. Free/Lelly gating is enforced. Photo viewing is blurred for free users. Image viewer is polished and cute. Online status works. Chat requests limited to 1/day for free users. **"Not Feeling It" button replaces ghosting with kind exits. Ghost Nudge works after 3 days. Ghost Score tracks and updates badges. Ghost Flag after 7 days. Ghost Redemption lets ghosts improve their badge over 14 days of active replies.**

---

### Phase 6: Events Tab

**Goal:** Events discovery across Tanzania & Kenya. Lelly Pass holders create events, everyone can join. Free users see titles only; Lelly users see full details.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 6.1 | Events page with Tanzania & Kenya districts | ☐ | `src/app/events/page.tsx` |
| 6.2 | Event discovery (filter by district, category, date) | ☐ | `src/components/events/EventDiscovery.tsx` |
| 6.3 | Event categories | ☐ | `src/components/events/EventCategories.tsx` |
| 6.4 | Create event (Lelly only) | ☐ | `src/app/events/create/page.tsx` |
| 6.5 | Join event (free) | ☐ | `src/app/api/events/join/route.ts` |
| 6.6 | Event details — free: see title only, Lelly: see full details | ☐ | `src/app/events/[id]/page.tsx` |
| 6.7 | Report button on events | ☐ | `src/components/events/ReportButton.tsx` |
| 6.8 | Event API | ☐ | `src/app/api/events/route.ts` |
| 6.9 | Event database model | ☐ | `prisma/schema.prisma` (Event model) |

**Phase 6 Exit Criteria:** Events are browsable by district. Lelly holders can create events. Everyone can join. Free users see limited info; Lelly users see full details. Reports work.

---

### Phase 7: Lelly Pass (500 Slot Scarcity + Value Exchange Gating)

**Goal:** The entire value exchange system. 500 Founding Lelly Pass slots with countdown, then auto-flip to $7.50 USD/month standard. Gating throughout the app with psychological messaging.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 7.1 | 500 Slot Scarcity Logic with global counter | ☐ | `src/lib/scarcity-counter.ts` |
| 7.2 | Founding Lelly Pass at $5.50 USD for first 500 users (live ZAR via Frankfurter.app) | ☐ | `src/lib/founding-pass.ts` |
| 7.3 | Countdown widget on dashboard and paywall screens | ☐ | `src/components/lelly/CountdownWidget.tsx` |
| 7.4 | Auto-flip to standard $7.50 USD/month when 500 slots filled | ☐ | `src/lib/scarcity-counter.ts` |
| 7.5 | Value Exchange Gating — Free: Browse & Match unlimited | ☐ | `src/lib/gating.ts` |
| 7.6 | Value Exchange Gating — Lelly: Texting/Messaging unlocked | ☐ | `src/lib/gating.ts` |
| 7.7 | Value Exchange Gating — Lelly: Photo viewing unlocked (unblur) | ☐ | `src/lib/gating.ts` |
| 7.8 | Value Exchange Gating — Lelly: Event details unlocked | ☐ | `src/lib/gating.ts` |
| 7.9 | Value Exchange Gating — Lelly: Unlimited chat requests | ☐ | `src/lib/gating.ts` |
| 7.10 | Value Exchange Gating — Lelly: Delete=ghost | ☐ | `src/lib/gating.ts` |
| 7.11 | Value Exchange Gating — Lelly: See who liked you | ☐ | `src/lib/gating.ts` |
| 7.12 | Lelly badge on profile | ☐ | `src/components/profile/LellyBadge.tsx` |
| 7.13 | Chat intercept messaging | ☐ | `src/components/lelly/ChatIntercept.tsx` |
| 7.14 | Photo intercept messaging | ☐ | `src/components/lelly/PhotoIntercept.tsx` |
| 7.15 | Events intercept messaging | ☐ | `src/components/lelly/EventsIntercept.tsx` |

**Intercept Messaging Architecture:**

- **Chat intercept:** "Every connection on Lellina is intentional. Secure your Lelly Pass to unlock direct conversations with verified women who are serious about dating."
- **Photo intercept:** "Your digital boundary matters. Unlock the Lelly Pass for screenshot-protected, secure photo viewing."
- **Events intercept:** "Step out into real life. Get your Lelly Pass to unlock the safest curated local queer venues and party coordinates across Tanzania & Kenya."

**Phase 7 Exit Criteria:** Scarcity counter works. 500 Founding slots with countdown, auto-flip to standard. All value exchange gates are enforced across the app. Intercept messaging is live and uses psychological (not transactional) language.

---

### Phase 8: Notifications + Admin Panel

**Goal:** Push notifications to keep users engaged. Admin tools for managing the app. Founder profile pinned first in Discover.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 8.1 | Notification center (bell icon, badge count) | ☐ | `src/components/app/NotificationCenter.tsx` |
| 8.2 | Notification badges | ☐ | `src/components/app/NotificationBadge.tsx` |
| 8.3 | Push notifications (browser) | ☐ | `src/lib/push-notifications.ts` |
| 8.4 | New match / message / handle request / like notifications | ☐ | `src/lib/notifications.ts` |
| 8.5 | Admin toggle switch — one account, two modes: normal user view + admin dashboard, no re-login required | ☐ | `src/components/admin/AdminToggle.tsx` |
| 8.6 | Admin dashboard | ☐ | `src/app/admin/page.tsx` |
| 8.7 | Broadcast notification | ☐ | `src/app/admin/broadcast/page.tsx` |
| 8.8 | User management | ☐ | `src/app/admin/users/page.tsx` |
| 8.9 | Verification review queue | ☐ | `src/app/admin/verification/page.tsx` |
| 8.10 | Report review queue | ☐ | `src/app/admin/reports/page.tsx` |
| 8.11 | **Ghost report review queue** — admin can see accumulated ghost flags, warn chronic ghosts, or ban repeat offenders | ☐ | `src/app/admin/ghosts/page.tsx` |

**Phase 8 Exit Criteria:** Notifications work (in-app + push). Admin can manage users, review verifications, handle reports, and broadcast notifications. Founder profile is always pinned first in Discover.

---

### Phase 9: Settings + Profile Management + Polish

**Goal:** Full settings control. Block/report. Theme toggle. Everything works. Everything is fast. Everything is beautiful.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 9.1 | Settings page (account, notifications, privacy, theme, delete) | ☐ | `src/app/settings/page.tsx` |
| 9.2 | Block/report user | ☐ | `src/app/api/block/route.ts` |
| 9.3 | Light / Dark theme toggle | ☐ | `src/components/settings/ThemeToggle.tsx` |
| 9.4 | Delete account (permanent, all data removed) | ☐ | `src/app/api/account/delete/route.ts` |
| 9.5 | Performance optimization | ☐ | Throughout |
| 9.6 | Design polish | ☐ | Throughout |
| 9.7 | Mobile responsiveness | ☐ | Throughout |
| 9.8 | Error handling | ☐ | Throughout |
| 9.9 | Loading states | ☐ | Throughout |
| 9.10 | Image viewer polish | ☐ | `src/components/chat/ImageViewer.tsx` |

**Phase 9 Exit Criteria:** Settings work. Block/report works. Theme toggle works. Delete account works. Mobile is flawless. Image viewer is modern, cute, and snappy. Loading states are smooth. Error handling is graceful.

---

### Phase 10: Payment Integration (LAST — After Beta Testing)

**Goal:** Real money flows. But ONLY after everything else is tested and working. Gateway TBD.

| # | Task | Status | File Route |
|---|------|--------|------------|
| 10.1 | Payment gateway integration (Lemon Squeezy, PayFast, or in-app purchases — TBD) | ☐ | `src/lib/payment/` |
| 10.2 | Subscription management | ☐ | `src/app/lelly-pass/manage/page.tsx` |
| 10.3 | Payment persistence | ☐ | `prisma/schema.prisma` (Payment model) |
| 10.4 | Live exchange rate display (ZAR/USD) — ✅ DONE EARLY in Phase 1 (see `src/app/api/exchange-rate/route.ts` + `LivePrice.tsx`). Frankfurter.app API, 1hr cache, fallback 18.0. Re-wire to real Payment model when Phase 10 begins | ✅ (Phase 1) | `src/components/lelly/ExchangeRate.tsx` → already `src/components/landing/LivePrice.tsx` |
| 10.5 | Subscription management page | ☐ | `src/app/lelly-pass/manage/page.tsx` |
| 10.6 | Payment history | ☐ | `src/app/lelly-pass/history/page.tsx` |

**Phase 10 Exit Criteria:** Real payments work. Subscriptions can be managed. Exchange rate is live. Payment history is accessible. No gateway decision is made until this phase begins.

---

### Phase 11: V1 Launch

**Goal:** Ship it. 🚀

| # | Task | Status | File Route |
|---|------|--------|------------|
| 11.1 | Render.com deployment — ✅ LIVE at https://lellina-dev.onrender.com (commit `5b539aa`, deploy `dep-d9mpvsu1abgc73ftjgfg`). Note: running on **ephemeral SQLite** (file:./db/custom.db recreated on each cold start). Turso migration (task 11.3) still pending | ✅ | `render.yaml` |
| 11.2 | Environment variables (production) | ☐ | Render dashboard |
| 11.3 | Database migration (production Turso) | ☐ | `prisma/migrate` |
| 11.4 | Socket.io on same server (production) | ☐ | `src/lib/socket.ts` |
| 11.5 | All production setups | ☐ | Throughout |
| 11.6 | Launch 🚀 | ☐ | — |

**Phase 11 Exit Criteria:** Lellina is live. Real users can sign up, verify, discover, chat, attend events, and secure their Lelly Pass. Tanzania & Kenya, let's go.

---

## V2 — Post-Launch

Brief roadmap for after V1 ships:

| # | Feature | Notes |
|---|---------|--------|
| V2.1 | Group chat | Community channels by district/interest |
| V2.2 | Rate Me | Profile rating feature |
| V2.3 | Blog system | Content + SEO |
| V2.4 | Chat enhancements | More media, reactions, etc. |
| V2.5 | AI content moderation | Auto-flag inappropriate content |
| V2.6 | APK (CapacitorJS) | Native mobile app |
| V2.7 | Analytics dashboard | User behavior insights |
| V2.8 | Data export & deletion | GDPR-style compliance |
| V2.9 | Community features | Forums, spaces, etc. |
| V2.10 | Subscription enhancements | More tiers, gifting, etc. |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| ☐ | Not done |
| ⚠️ | Built but deferred / partially wired — see task notes |
| File routes | Where code lives in the project |
| V1 | First Official Launch |
| V2 | Post-Launch |

---

## Current Status

| Field | Value |
|-------|-------|
| **Phase** | Phase 1 ✅ COMPLETE. Phase 2 ✅ COMPLETE. Phase 3 ✅ COMPLETE. Phase 4A ✅ LIVE on Render (12/26 tasks: discover grid + like/pass + founder pin + infinite scroll + 4 core filters + app layout + admin toggle). Phase 4B ☐ NEXT (14 tasks: response rate badge + ghost score + 4 remaining filters + live search + mobile search + Lelly Pass gating + landing anti-ghost + Tanzania & Kenya text audit). **Tanzania & Kenya pivot:** 🇹🇿 Tanzania (31 regions) + 🇰🇪 Kenya (47 counties) = 78 districts is the V1 launch market. Other regions are Coming soon (code is generic — only seed data changed: admin country TZ, demo profiles renamed to East African names, /join country gate now allows TZ + KE only, landing banner shows "Tanzania 🇹🇿 & Kenya 🇰🇪"). 90 tribe tags. Country isolation enforced. Live at https://lellina-dev.onrender.com (commit a1258d9). |
| **Version** | V1 in progress, V2 planned |
| **Next Step** | Phase 4B — Response Rate Badge + Ghost Score + 4 remaining filters (online, photo, active, response rate) + Live Search (debounced 300ms) + Mobile Search + Lelly Pass gating (5 likes free / unlimited Lelly) + Landing anti-ghost message + **Tanzania & Kenya text audit (4.26)** (14 tasks). See Phase 4 table above. |
| **Admin Note** | Admin user (`cardoverli`) has ONE account with TWO modes: normal user view + admin dashboard toggle (no re-login). Ships in Phase 8 (task 8.5). Schema already supports: `role: ADMIN` + `Profile` (1:1). |

---

*This document is the single source of truth for the Lellina V1 build phases. All agents read `docs/` before starting work. For agent activity logs, see `worklog.md` at the project root.*
