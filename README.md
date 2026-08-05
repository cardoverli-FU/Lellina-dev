# Lellina

> **Galz for Galz** — Verified women-only space.

**V1 Launch Market: Portland, Oregon (USA).** Tanzania + South Africa = Coming soon. Public landing is geographically neutral — countries/districts appear only post-login in `/join` and onboarding. No men. No bots. Only verified women.

---

## Overview

Lellina is a dating and social app built exclusively for verified women, launching in **Portland, Oregon (USA)**. Every user passes a multi-step verification gate (selfie with auto-captcha + voice + video, analyzed by a 3-cloud consensus: Gemini + HuggingFace + Sightengine) before joining. No men. No bots. No catfish. Just real women looking for real connection.

## Portland Quadrants (6) — V1 Launch Market

1. Northwest Portland (Pearl District, Nob Hill, Northwest)
2. Southwest Portland (Downtown, Goose Hollow, Hillsdale)
3. Northeast Portland (Alberta Arts, Irvington, Hollywood)
4. Southeast Portland (Hawthorne, Richmond, Mt Tabor)
5. North Portland (Kenton, St Johns, Mississippi)
6. South Portland (Sellwood, Eastmoreland, Brooklyn)

> **Zip codes** will be added in a later phase. For now, quadrants only.
>
> **Future markets:** Tanzania (Dar es Salaam) + South Africa (Cape Town) = Coming soon. The code is generic — swap seed data to expand.

## App Navigation

```
DISCOVER → CHAT → EVENTS → PROFILE
```

## Core Strategy

**Browse Free, Connect with Lelly Pass.**

Users can browse, filter, search, and match for FREE. They find someone they want to talk to. That's where Lelly Pass comes in — not a paywall, but a gateway to something they already deeply want.

## Lelly Pass

| Tier | Price | Notes |
|------|-------|-------|
| **Founding Lelly Pass** | $5 (~R90) | First 500 users only — scarcity countdown |
| **Standard Lelly Pass** | R135/month | Auto-flips when 500 founding slots are filled |

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM + SQLite
- **Auth:** NextAuth.js v4
- **Real-time:** Socket.io
- **Animation:** Framer Motion
- **AI:** Gemini via @google/genai
- **Face Detection:** modern-face-api
- **Fonts:** Fraunces (display) + Inter (body) via next/font/google

## V1 Build Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Landing Page + Design System | ✅ COMPLETE |
| 2 | Verification Gate + Registration | ✅ COMPLETE (Nighttime Trap wired in Phase 3) |
| 3 | Profile Setup + Tribe Tags + Location | ✅ COMPLETE |
| 4 | Discover Grid + Filters + Live Search | 4A ✅ LIVE (12/25 tasks) / 4B ☐ NEXT |
| 5 | Chat Engine + Image Viewer | ☐ |
| 6 | Events Tab | ☐ |
| 7 | Lelly Pass + Value Exchange Gating | ☐ |
| 8 | Notifications + Admin Panel | ☐ |
| 9 | Settings + Profile Management | ☐ |
| 10 | Payment Integration (LAST) | ☐ |
| 11 | V1 Launch — 11.1 Render deploy ✅ LIVE (ephemeral SQLite; Turso credentials ready) | ⚠️ Partial |

## Live URLs

- **App:** https://lellina-dev.onrender.com
- **GitHub:** https://github.com/cardoverli-FU/lellina-dev
- **Latest commit:** Portland pivot — 6 quadrants + dropdown contrast fix

## Getting Started

```bash
bun install
bun run dev
```

## Project Structure

```
docs/           — Planning documents (features, build-phases, fixes, credentials)
src/app/        — Next.js app router pages
src/components/ — React components
src/lib/        — Utility libraries
prisma/         — Database schema
public/         — Static assets
```

---

*Lellina — Galz for Galz. A verified women-only space. Live in Portland, Oregon. Dar es Salaam + Cape Town = Coming soon.*
