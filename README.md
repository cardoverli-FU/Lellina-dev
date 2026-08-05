# Lellina

> **Galz for Galz** — Verified women-only space.

**V1 Launch Market: Tanzania 🇹🇿 & Kenya 🇰🇪.** Public landing is geographically neutral — countries/districts appear only post-login in `/join` and onboarding. No men. No bots. Only verified women.

---

## Overview

Lellina is a dating and social app built exclusively for verified women, launching in **Tanzania & Kenya**. Every user passes a multi-step verification gate (selfie with auto-captcha + voice + video, analyzed by a 3-cloud consensus: Gemini + HuggingFace + Sightengine) before joining. No men. No bots. No catfish. Just real women looking for real connection.

## Launch Districts — V1 Markets

### Tanzania (31 Regions)
Arusha, Dar es Salaam, Dodoma, Geita, Iringa, Kagera, Kaskazini Pemba, Kaskazini Unguja, Katavi, Kigoma, Kilimanjaro, Kusini Pemba, Kusini Unguja, Lindi, Manyara, Mara, Mbeya, Mjini Magharibi, Morogoro, Mtwara, Mwanza, Njombe, Pwani, Rukwa, Ruvuma, Shinyanga, Simiyu, Singida, Songwe, Tabora, Tanga

### Kenya (47 Counties)
Baringo, Bomet, Bungoma, Busia, Elgeyo-Marakwet, Embu, Garissa, Homa Bay, Isiolo, Kajiado, Kakamega, Kericho, Kiambu, Kilifi, Kirinyaga, Kisii, Kisumu, Kitui, Kwale, Laikipia, Lamu, Machakos, Makueni, Mandera, Marsabit, Meru, Migori, Mombasa, Murang'a, Nairobi, Nakuru, Nandi, Narok, Nyamira, Nyandarua, Nyeri, Samburu, Siaya, Taita-Taveta, Tana River, Tharaka-Nithi, Trans-Nzoia, Turkana, Uasin Gishu, Vihiga, Wajir, West Pokot

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
| **Founding Lelly Pass** | $5.50 USD | First 500 users only — scarcity countdown |
| **Standard Lelly Pass** | $7.50 USD/month | Auto-flips when 500 founding slots are filled |

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
| 4 | Discover Grid + Filters + Live Search | 4A ✅ LIVE (12/26 tasks) / 4B ☐ NEXT |
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
- **Latest commit:** Tanzania + Kenya pivot — 78 districts + filter fix

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
src<lib/        — Utility libraries
prisma/         — Database schema
public/         — Static assets
```

---

*Lellina — Galz for Galz. A verified women-only space. Live in Tanzania 🇹🇿 & Kenya 🇰🇪.*
