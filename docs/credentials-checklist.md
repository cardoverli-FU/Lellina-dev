# Lellina — Credentials Checklist

> Environment variables and API keys needed for development.
> ⚠️ NEVER commit actual values to this repo. Use `.env` file locally only.
> ⚠️ This file is a checklist — it does NOT contain actual credentials.

---

## 🚨 MANDATORY READ: CONTRAST RULE

> **Before writing ANY UI code, you MUST read [`docs/CONTRAST-RULE.md`](./CONTRAST-RULE.md).**
>
> - **Dark background → bright text** (`text-cream`, `text-white`, `text-gold-light`, `text-warm-rose-light`). NEVER `text-soft-charcoal` / `text-espresso` / `text-warm-rose-dark` on dark.
> - **Light background → dark text** (`text-soft-charcoal`, `text-warm-rose-dark`, `text-gold-deep`). NEVER `text-cream` / `text-white` on light.
> - **Interactive elements** (close X, pass buttons, filter toggles, nav icons) MUST be visible on BOTH light and dark themes.
> - **NEVER** wrap HEX CSS vars in `hsl()` — use `var(--x)` directly.
>
> Violating this rule = broken UI = P0 bug.

---

## Required Environment Variables

| # | Variable Name | Purpose | Status |
|---|---|---|---|
| 1 | `GITHUB_TOKEN` | Push to GitHub repo | ✅ Ready |
| 2 | `RENDER_API_KEY` | Render.com deployment | ✅ Ready |
| 3 | `GMAIL_USER` | Gmail for nodemailer | ✅ Ready |
| 4 | `GMAIL_APP_PASSWORD` | Gmail app password | ✅ Ready |
| 5 | `GEMINI_API_KEY_1` | Gemini API key 1 (rotation) | ✅ Ready |
| 6 | `GEMINI_API_KEY_2` | Gemini API key 2 (rotation) | ✅ Ready |
| 7 | `TELEGRAM_BOT_TOKEN` | Telegram bot | ✅ Ready |
| 8 | `TELEGRAM_CHANNEL_ID` | Telegram channel ID | ✅ Ready |
| 9 | `NEXTAUTH_SECRET` | NextAuth.js secret | ☐ Generate |
| 10 | `NEXTAUTH_URL` | App URL for NextAuth | ✅ Ready |

---

## Tools Signed Up

| # | Tool | Account | Status |
|---|---|---|---|
| 1 | Render.com | API key ready | ✅ |
| 2 | Google Cloud (Gemini) | 2 API keys ready | ✅ |
| 3 | Telegram Bot | lellinamedia_bot created | ✅ |
| 4 | WhatsApp Channel | Channel created | ✅ |
| 5 | GitHub | cardoverli-FU org | ✅ |
| 6 | Payment Gateway | TBD (Lemon Squeezy / PayFast / In-app) | ☐ Decide before Phase 10 |

---

## Channels

| Channel | URL |
|---|---|
| Telegram | https://t.me/lellina_app |
| WhatsApp | https://whatsapp.com/channel/0029Vb8Z7CWInlqOir0f3C1d |

---

## Commit Author Config

```bash
git config user.name "cardoverli-FU"
git config user.email "300794432+cardoverli-FU@users.noreply.github.com"
```

---

## Important Notes

- Gemini API may be region-blocked in some countries. Backend calls from Render.com (US/EU servers) should work fine.
- Payment gateway decision needed before Phase 10. Options: Lemon Squeezy (recommended — Merchant of Record, no business registration needed), PayFast, or in-app purchases.
- Lelly Pass pricing: $7.50 USD/month (standard). Founding member price: $5.50 USD one-time for first 500 users. (Pre-pivot this was R135/month in South African Rand — Tanzania + Kenya pivot moved V1 to USD-primary.)
- Database: Prisma ORM with SQLite for development.
