# Lellina — Feature List

> **Galz for Galz** — Verified women-only space.
> V1 launch in **Tanzania 🇹🇿 & Kenya 🇰🇪**. Other regions are **Coming soon**.
> Public landing shows "Tanzania & Kenya" — the /join country gate now allows TZ + KE only. Other regions show "Coming soon".
> No men. No bots. Only verified women.

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

## ⚠️ RULES FOR ALL AGENTS

1. **Open Source First** — Always use free, open-source packages when available. Copy patterns from Compass, Duolicious, pH7 CMS where code fits. Reimplement where stack differs.
2. **Free Tools Only** — Never suggest paid tools when free alternatives exist. Every tool must be free or have a free tier.
3. **Landing Page Security** — NEVER expose internal tools, tech stack, or secret methods on any public-facing page. Users see: "We verify women" — they do NOT see: "Gemini API, custom fingerprinting, etc." This is business.
4. **No "Lesbian" Publicly** — NEVER use the word "lesbian" on any public-facing page. Use "Galz for Galz" branding. A real one will understand. Outsiders see a women's social app.
5. **Image Viewer Design** — Must be VERY modern, VERY cute, VERY sexy with modern animations. But NEVER heavy. Speediest code only. No bloated libraries.
6. **modern-face-api** — Use `modern-face-api` (npm package, v0.22.5) for face detection, NOT the old face-api.js. Updated fork with TensorFlow.js 4.22.0. Repo: https://github.com/SujalXplores/modern-face-api
7. **@google/genai** — Use `@google/genai` (npm package, v2.14.0) — the NEW Google GenAI SDK. NOT the old `@google/generative-ai`.
8. **Gemini Models** — Use `gemini-3.1-flash-lite` and `gemini-3.5-flash-lite`. RPM: 15, TPM: 250K, RPD: 500. Test image analysis capability before using for verification. 2 API keys for rotation.
9. **GitHub Push Rule** — NEVER push to GitHub without explicit user approval. Show all changes first. Wait for confirmation. The user decides what gets pushed, when, and to which branch. No exceptions. NEVER push sandbox files, skills/, .zscripts/, mini-services/, db/, tool-results/, or any environment config.
10. **Commit Author** — All commits must use: `cardoverli-FU / 300794432+cardoverli-FU@users.noreply.github.com`
11. **Docs Folder** — All planning docs live in `docs/`. No exceptions.
12. **Psychological Rule** — NEVER say "Premium", "Subscribe", "Upgrade", or "Pay wall" anywhere in the app or docs. Say **"Lelly Pass"**, **"Secure your Lelly Pass"**, **"Unlock"**. Users feel SPECIAL and PROUD. They're not buying a subscription — they're joining an exclusive community of verified women who are serious about real connection.
13. **No Play Store** — Web app first. APK via CapacitorJS later (V2). No app store dependencies.
14. **Payment Last** — Payment integration is the LAST phase of V1. Build everything else first. The payment gateway is TBD (Lemon Squeezy / PayFast / In-app purchases).
15. **Contrast Rule (HARD RULE — see [`docs/CONTRAST-RULE.md`](./CONTRAST-RULE.md))** — On deep/dark backgrounds (`bg-hero-dark`, `bg-section-dark`, `bg-soft-charcoal`, solid deep rose `bg-warm-rose`, `bg-warm-rose-dark`), ALL text MUST be bright — use `text-cream`, `text-white`, `text-gold-light`, or `text-warm-rose-light`. NEVER use `text-soft-charcoal`, `text-warm-rose-dark`, `text-gold-deep`, or `text-muted-foreground` on dark/rose backgrounds. On LIGHT backgrounds (`bg-cream`, `bg-blush-subtle`, `bg-blush-light`), ALL text MUST be dark — use `text-soft-charcoal`, `text-warm-rose-dark`, `text-gold-deep`. NEVER use `text-cream` or `text-white` on light backgrounds. Interactive elements (close X, pass buttons, filter toggles, nav icons) MUST be visible on BOTH themes. NEVER wrap HEX CSS vars in `hsl()` — use `var(--x)` directly. This is a P0 rule. Violation = invisible UI = users leave.

---

## 🔒 HARD COUNTRY ISOLATION

> **TZ users NEVER see anything about Kenya. KE users NEVER see anything about Tanzania.**
> District filters, discover, groups, profiles — ALL country-isolated.
> The API enforces this. **Never mixed. Never cross-country.**

---

## 🌍 PROJECT OVERVIEW

| Field | Value |
|---|---|
| **App Name** | Lellina |
| **Tagline** | Galz for Galz |
| **Market** | Tanzania & Kenya — V1 launch market. Other regions are Coming soon (code is generic, only seed data changed) |
| **Districts** | **31 Tanzania regions + 47 Kenya counties (78 total)** — replaces the 6 Portland quadrants from the earlier Portland pivot plan. More granular districts added in later phases. |
| **Team** | Solo dev + AI only |
| **Distribution** | Web app first → APK via CapacitorJS (V2) |
| **Payment** | LAST phase of V1. Gateway TBD. |
| **V1 Scope** | Group chat (premium feature). No Play Store. |

---

## 🗺️ TANZANIA REGIONS (31)

| # | Region | Country |
|---|---|---|
| 1 | Arusha | Tanzania |
| 2 | Dar es Salaam | Tanzania |
| 3 | Dodoma | Tanzania |
| 4 | Geita | Tanzania |
| 5 | Iringa | Tanzania |
| 6 | Kagera | Tanzania |
| 7 | Kaskazini Pemba | Tanzania |
| 8 | Kaskazini Unguja | Tanzania |
| 9 | Katavi | Tanzania |
| 10 | Kigoma | Tanzania |
| 11 | Kilimanjaro | Tanzania |
| 12 | Kusini Pemba | Tanzania |
| 13 | Kusini Unguja | Tanzania |
| 14 | Lindi | Tanzania |
| 15 | Manyara | Tanzania |
| 16 | Mara | Tanzania |
| 17 | Mbeya | Tanzania |
| 18 | Mjini Magharibi | Tanzania |
| 19 | Morogoro | Tanzania |
| 20 | Mtwara | Tanzania |
| 21 | Mwanza | Tanzania |
| 22 | Njombe | Tanzania |
| 23 | Pwani | Tanzania |
| 24 | Rukwa | Tanzania |
| 25 | Ruvuma | Tanzania |
| 26 | Shinyanga | Tanzania |
| 27 | Simiyu | Tanzania |
| 28 | Singida | Tanzania |
| 29 | Songwe | Tanzania |
| 30 | Tabora | Tanzania |
| 31 | Tanga | Tanzania |

## 🗺️ KENYA COUNTIES (47)

| # | County | Country |
|---|---|---|
| 1 | Baringo | Kenya |
| 2 | Bomet | Kenya |
| 3 | Bungoma | Kenya |
| 4 | Busia | Kenya |
| 5 | Elgeyo-Marakwet | Kenya |
| 6 | Embu | Kenya |
| 7 | Garissa | Kenya |
| 8 | Homa Bay | Kenya |
| 9 | Isiolo | Kenya |
| 10 | Kajiado | Kenya |
| 11 | Kakamega | Kenya |
| 12 | Kericho | Kenya |
| 13 | Kiambu | Kenya |
| 14 | Kilifi | Kenya |
| 15 | Kirinyaga | Kenya |
| 16 | Kisii | Kenya |
| 17 | Kisumu | Kenya |
| 18 | Kitui | Kenya |
| 19 | Kwale | Kenya |
| 20 | Laikipia | Kenya |
| 21 | Lamu | Kenya |
| 22 | Machakos | Kenya |
| 23 | Makueni | Kenya |
| 24 | Mandera | Kenya |
| 25 | Marsabit | Kenya |
| 26 | Meru | Kenya |
| 27 | Migori | Kenya |
| 28 | Mombasa | Kenya |
| 29 | Murang'a | Kenya |
| 30 | Nairobi | Kenya |
| 31 | Nakuru | Kenya |
| 32 | Nandi | Kenya |
| 33 | Narok | Kenya |
| 34 | Nyamira | Kenya |
| 35 | Nyandarua | Kenya |
| 36 | Nyeri | Kenya |
| 37 | Samburu | Kenya |
| 38 | Siaya | Kenya |
| 39 | Taita-Taveta | Kenya |
| 40 | Tana River | Kenya |
| 41 | Tharaka-Nithi | Kenya |
| 42 | Trans-Nzoia | Kenya |
| 43 | Turkana | Kenya |
| 44 | Uasin Gishu | Kenya |
| 45 | Vihiga | Kenya |
| 46 | Wajir | Kenya |
| 47 | West Pokot | Kenya |

---

## 🧭 APP NAVIGATION

```
DISCOVER → CHAT → GROUPS → PROFILE
```

Four tabs. Always visible. Bottom navigation on mobile. Side navigation on desktop.

---

## 💡 CORE STRATEGY: Browse Free, Connect with Lelly Pass

**The Trap:** Users can browse, filter, and match for FREE. They see everything. They find their person. They want to talk. BOOM — paywall. Lelly Pass required to message.

**Why it works:**
- Free users get hooked on the app (unlimited swiping, filtering, matching)
- They find someone they REALLY want to talk to
- The desire to connect is the most powerful motivator
- Lelly Pass doesn't feel like a subscription — it feels like a key to something they already want

---

## V1 FEATURES

---

### 1. Landing Page

**Goal:** Make every visitor feel they've found their space. Immediate sign-up.

**Layout:** Tabbed interface (NOT long-scroll). Six tabs under a sticky header. Brand splash screen on first load — deep rose bg, bright logo, fades after ~1.8s.

**Tabs:**

| # | Tab | Content |
|---|---|---|
| 1 | **Home** | Hero ("Galz for Galz" headline — **geographically NEUTRAL subline, no city/country shown publicly**) + Founding Lelly Pass offer ($5.50 USD) + Live countdown widget showing slots remaining. |
| 2 | **Why** | 4 pillars (Verified / Local / Real / Yours) + Anonymous founder story. |
| 3 | **Gate** | "No Men Will Ever Join" — multi-step verification gate explanation + Trust & Safety promise. |
| 4 | **Galz** | Community CTAs: Telegram group + WhatsApp channel + Share button. |
| 5 | **Lelly** | Pricing (Founding $5.50 USD / Standard $7.50 USD/month via `LivePrice` with live ZAR conversion) + Free vs Lelly comparison + "How You Pay" privacy framing + FAQ. |

> **Note:** After the Tanzania & Kenya pivot, the landing publicly shows **"Tanzania 🇹🇿 & Kenya 🇰🇪"** as the V1 launch market. Other regions appear as "Coming soon" (the code is generic — only seed data changed). The `/join` country gate now allows TZ + KE only. The earlier "Cape Town" tab was REMOVED at the original TZ+ZA dual-launch pivot, and the Portland pivot has now been replaced by the Tanzania & Kenya pivot.

**Components:**

| Component | Purpose |
|---|---|
| `BrandSplash.tsx` | Opening brand intro — deep rose bg, bright logo, fades after ~1.8s. |
| `LandingTabs.tsx` | Tab state management + horizontal pill tab bar under sticky header. |
| `FAQ.tsx` | Frequently asked questions (under Lelly tab). |
| `TrustSafety.tsx` | Safety promise section (under Gate tab). |
| `LivePrice.tsx` | USD primary price + live ZAR conversion via `/api/exchange-rate`. Has `tone` prop for light/dark context (critical for Contrast Rule). |
| `CountdownWidget.tsx` | Live ticking scarcity counter for 500 founding slots. |
| `StickyMobileCTA.tsx` | Mobile-only sticky CTA bar with compact countdown + "Claim" button. |

**Design:**
- Fonts: **Fraunces** (display/headings — editorial luxury serif with optical sizing) + **Inter** (body/UI — professional max-legibility sans), loaded via `next/font/google` in `src/app/layout.tsx`. CSS variables: `--font-fraunces`, `--font-inter`.
- 4-color core palette: Deep Rose, Gold, Ivory, Espresso (+ supporting tints). See Section 16.
- Mobile-first responsive layout
- Framer Motion animations
- VERY CONVERTING — every pixel drives sign-up
- **Contrast Rule (HARD):** On deep/dark backgrounds (`bg-hero-dark`, `bg-section-dark`, `bg-soft-charcoal`, solid `bg-warm-rose`), ALL text MUST be bright — use `text-cream`, `text-white`, `text-gold-light`, or `text-warm-rose-light`. NEVER use dark text on dark/rose backgrounds. See Section 16 + Agent Rule #15.

---

### 2. Verification Gate (BEFORE Registration)

**Goal:** Zero men. Zero bots. Every user must pass verification BEFORE they can register.

**Flow:**

| Step | Method | Details |
|---|---|---|
| **Warning Screen** | UI | "This space is for women only. Verification is mandatory." |
| **Step 1: Selfie** | modern-face-api (v0.22.5) | Live selfie capture. Face detection must confirm a face is present. |
| **Step 2: Voice** | Pitch analysis | Voice recording. Pitch analyzed to confirm female vocal range. |
| **Step 3: Video + Code** | Video + OCR | User holds a randomly generated code on camera. OCR reads the code to confirm liveness. |
| **Step 4: Gemini Analysis** | @google/genai (v2.14.0) | Backend sends verification data to Gemini (gemini-3.5-flash-lite) for IMAGE analysis. Final gate. |

**Nighttime Trap:**

- **When:** 21:00–04:00 SAST
- **What:** Random biometric verification triggered. Mandatory live face scan.
- **Behavior:** Blocking operation. Cannot bypass. Cannot use the app until completed.
- **Failure:** User quarantined → `quarantined_pending_review` status. Cannot access any features.
- **Why:** Late-night hours are highest risk for male infiltration. This is a safety feature.

**Security:**

| Feature | Details |
|---|---|
| Device fingerprinting | Custom fingerprinting (no third-party). Canvas, WebGL, audio, screen, timezone. |
| Device + IP ban | Failed verification → device + IP permanently banned. |
| Attempt limit | 3 verification attempts per device. After 3 failures → permanent ban. |
| No data storage | Verification data flows as binary buffer to Gemini. NEVER written to disk. NEVER stored. |

---

### 3. Registration

**Goal:** Simple, fast registration — only after passing verification.

| Field | Details |
|---|---|
| Email | Required. Gmail recommended for password reset. |
| Password | Required. Min 8 characters. |
| Password reset | Gmail-based via nodemailer. |
| Profile setup | Redirect to wizard after registration. |

---

### 4. Profile Setup Wizard

**Goal:** Onboard new users into the community with a warm, guided experience.

| Step | Field | Details |
|---|---|---|
| 1 | Profile photo | Upload min 1 photo. Modern, cute image viewer for preview. |
| 2 | Display name | Free text. Shown on profile and discover grid. |
| 3 | Age / DOB | Date of birth. Age calculated and displayed. |
| 4 | District | Select from 31 Tanzania regions or 47 Kenya counties. |
| 5 | Street tag | Free text. Neighborhood-level location. |
| 6 | Bio | Free text. Tell the community who you are. |
| 7 | Tribe tags | Select up to **5 tags** from identity/subculture categories. Not mandatory but powerful for matching. |
| 8 | Social handles | Telegram, Instagram, Signal. Hidden until mutual approval. |
| 9 | Completion | Progress bar. Profile must be complete before discover. |

---

### 5. Discover Grid + Filters + Live Search

**Goal:** Browse verified women in Tanzania & Kenya. The heart of the app. EVERYTHING is filterable for FREE. Users can find exactly who they're looking for. But when they want to TALK — that's where Lelly Pass comes in.

**Core Grid:**

| Feature | Details |
|---|---|
| Layout | Grid view with profile photos. Mobile: 2 columns. Desktop: 3–4 columns. |
| Founder profile | Pinned first in the grid. Always visible. |
| Infinite scroll | Load more profiles as user scrolls. |
| Like / Pass | Tap to like. Tap to pass. Mutual like = match. |
| Online status | Sage (#5E7E55) dot = online. Gray dot = offline. |
| Free tier | See 5 likes only. |
| Lelly Pass | See unlimited likes. |

**Filters (ALL FREE — in V1):**

| Filter | Type | Details |
|---|---|---|
| **Age Range** | Slider | Min/max age slider. 18–60 range. |
| **District** | Multi-select | Filter by Tanzania's 31 regions or Kenya's 47 counties. Select one or many. |
| **Tribe Tags** | Multi-select | Filter by identity/subculture tags. Match users who selected the same tribe. |
| **Online Now** | Toggle | Show only online users. |
| **Verified Only** | Toggle | Show only verified users (default: on). |
| **Has Photo** | Toggle | Show only users with profile photos. |
| **Recently Active** | Toggle | Show users active in last 24h. |

**Live Search:**

| Feature | Details |
|---|---|
| **Search bar** | Real-time search as you type. Filters results instantly. |
| **Search fields** | Name, bio, street tag, tribe tags. |
| **Debounced** | 300ms debounce. No API spam. |
| **Combined with filters** | Live search works ON TOP of active filters. Stack them. |
| **Mobile** | Expandable search bar. Pull-down to reveal. |

**The Paywall Moment:**

| Action | Free | Lelly Pass |
|---|---|---|
| Browse & filter profiles | ✅ Unlimited | ✅ Unlimited |
| Live search | ✅ Full access | ✅ Full access |
| Swipe & match | ✅ Unlimited | ✅ Unlimited |
| **Send a message** | ❌ **BOOM — Lelly Pass required** | ✅ Unlocked |

**This is the core strategy:** Let users browse, filter, search, and match for FREE. They get invested. They find someone. They want to talk. That's when Lelly Pass becomes the key — not a paywall, but a gateway to something they already deeply want.

---

### 6. Chat Engine

**Goal:** Real-time messaging between verified women. Secure, private, intentional.

**Architecture:** Socket.io real-time messaging (same server). No separate chat server needed.

| Feature | Details |
|---|---|
| Chat UI | Modern, clean. Framer Motion animations. |
| Handle request system | Social handles (Telegram, Instagram, Signal) hidden until mutual approval. |
| Read receipts | Delivered ✓✓ / Read ✓✓ (blue). |
| Free: Send pics | ✅ Can send photos. |
| Free: Receive pics | ❌ Photos arrive BLURRED. Cannot unblur. |
| Lelly: Receive pics | ✅ Photos unblurred. Screenshot-protected viewer. |
| Lelly: Delete = ghost | Delete a message → it disappears for BOTH parties. No trace. |
| Free: Chat requests | 1 chat request per day. |
| Lelly: Chat requests | Unlimited chat requests. |
| Suggest messengers | In-chat prompt to move to Telegram/WhatsApp/Signal for deeper connection. |
| Image viewer | VERY modern, VERY cute, VERY sexy. Modern animations. NEVER heavy. Speediest code only. |

---

### 7. Group Chat

**Goal:** Connect galz in community spaces. Group chat is the social backbone of Lellina.

**MVP Notes:**
- **Exactly 2 system groups:** "Tanzania Galz" (TZ) and "Kenya Galz" (KE). 1 group per country.
- **No group creation** — users cannot create groups. Only these 2 system groups exist.
- Lelly Pass required to post. Free users can view but not post.
- Users can send pictures in group chat.
- Built on Socket.io with room support.
- Reactions, @mentions, typing indicators, read receipts, group moderation. Lelly Pass = auto-access to their country's group.

| Feature | Details |
|---|---|
| System groups | **2 groups only:** "Tanzania Galz" (TZ) and "Kenya Galz" (KE). 1 per country. |
| No group creation | Users cannot create groups. Only system-defined groups exist. |
| Free: View group | ✅ View group messages (read-only) in their country's group. |
| Lelly: Post | ✅ Post messages in their country's group. |
| Lelly: Send pics | ✅ Send pictures in group chat. |
| Reactions | React to messages with emojis. |
| @mentions | Mention other users in group chat. |
| Typing indicators | See when others are typing. |
| Read receipts | See who read your message. |
| Group moderation | Admins/moderators can moderate members and messages. |
| Lelly Pass auto-access | Lelly Pass = auto-access. User joins their country's group automatically. No invite links needed. |
| Report button | Report inappropriate group messages. |
| Country isolation | Each user sees only their country's group: TZ users → "Tanzania Galz", KE users → "Kenya Galz". |
| Group API | RESTful API + database model for groups. Built on Socket.io with room support. |

**Group Data Model:**

```
Group {
  id: String
  name: String  // "Tanzania Galz" or "Kenya Galz"
  description: String
  country: String  // "TZ" or "KE"
  type: String (system)  // always "system" — no user-created groups
  members: [String] (user IDs)
  reported: Boolean
}
```

---

### 8. Lelly Pass (500 Slot Scarcity + Value Exchange Gating)

**Goal:** Users feel SPECIAL and PROUD to secure their Lelly Pass. It's not a subscription — it's a statement.

**500 Slot Scarcity Logic:**

| Element | Details |
|---|---|
| Global counter | Server-side counter tracking Lelly Pass slots claimed. |
| Founding Lelly Pass | **$5.50 USD** for first 500 users. One-time first month. Live ZAR conversion shown via Frankfurter.app API. |
| Countdown widget | Visible on dashboard and every paywall screen. "Only ___ of 500 Founding spots left." |
| Auto-flip | When 500 slots filled → auto-flip to standard **$7.50 USD/month**. No more founding price. |
| Urgency | Live countdown. Real scarcity. FOMO is real. |

**Value Exchange Gating:**

| Tier | What's Included |
|---|---|
| **Free** | Browse profiles unlimited. Swipe & Match unlimited. ALL filters unlimited. Live search unlimited. See 5 likes. 1 chat request/day. Send pics. View group chat (read-only). |
| **Lelly Pass** | Everything in Free + Texting/Messaging unlocked. Photo viewing unlocked (unblur). Group chat full access (post). Unlimited chat requests. Delete = ghost. See who liked you. Online status visible. Lelly badge on profile. |

**Paywall Messaging (Psychological Rule):**

| Gate | Message |
|---|---|
| **Chat** | "Every connection on Lellina is intentional. Secure your Lelly Pass to unlock direct conversations with verified women who are serious about dating." |
| **Photo** | "Your digital boundary matters. Unlock the Lelly Pass for screenshot-protected, secure photo viewing." |
| **Group Chat** | "Your community is calling. Secure your Lelly Pass to post messages and connect with verified women in your country's group." |

**Lelly Badge:** Gold badge on profile. Visible to all. Signals: "I'm serious about real connection."

---

### 9. Notifications

**Goal:** Keep users engaged. Never miss a connection.

| Feature | Details |
|---|---|
| In-app notification center | Bell icon. Badge count. |
| New match | Push + in-app notification. |
| New message | Push + in-app notification. |
| Handle request | Push + in-app notification. |
| Like received | Push + in-app notification. |
| Lelly: See who liked you | ✅ See the profile of who liked you. |
| Admin broadcast | Founder can send broadcast notifications to all users. |
| Push notifications | Browser push notifications (Web Push API). |

---

### 10. Profile Management

**Goal:** Users own their space. Full control.

| Feature | Details |
|---|---|
| View/edit own profile | Update photos, bio, tags, district, social handles. |
| View other profiles | Full profile view with photos, bio, tags, district. |
| Photo gallery | Cute, modern image viewer. VERY modern. VERY cute. VERY sexy. |
| Tag display | All selected tags displayed beautifully. |
| District display | Tanzania region or Kenya county shown with local area tag. |
| Social handles | Visible only after mutual approval. |
| Block/report user | Block = user disappears from your grid and chat. Report = sends to admin queue. |

---

### 11. Settings

**Goal:** Full control over the experience.

| Section | Options |
|---|---|
| Account | Email, password, delete account. |
| Notifications | Toggle push, in-app, email notifications. |
| Privacy | Online status visibility, profile visibility. |
| Theme | Light / Dark toggle. |
| Delete account | Permanent deletion. All data removed. |
| Logout | End session. |

---

### 12. Location System — Tanzania & Kenya

**Goal:** Hyper-local. Every user is in Tanzania or Kenya. District-level precision.

| Feature | Details |
|---|---|
| District selection | Choose from 31 Tanzania regions or 47 Kenya counties during profile setup. |
| Street tag | Free text. Neighborhood-level. |
| Seed data | All 78 districts pre-seeded in database (31 TZ + 47 KE). |
| Filtering | Discover grid filters by district. |
| Country isolation | District filter is country-isolated: TZ users see only 31 Tanzania regions, KE users see only 47 Kenya counties. Never mixed. |

**Districts (Seed Data):**

- 31 Tanzania regions + 47 Kenya counties (78 total — see tables above)

---

### 13. Tribe Tags System

**Goal:** Express identity. Find your people. Every tag is a signal. Every search is a vibe.

**Tag Rules:**
- Each user selects up to **5 tags** (not mandatory, but recommended)
- Tags are searchable and filterable in Discover
- Tags help users find their community, their tribe, their people

**Tag Categories:**

| Category | Examples |
|---|---|
| **Identity / Tribe** | Femme, Stem, Stud, Chapstick, Soft stud, Androgynous, No label, Questioning, Boi, High femme, Lipstick, Diesel dyke, Granola dyke, Sport dyke |
| **Subculture** | Alternative, Artsy, Corporate, Creative, Bohemian, Sporty, Nerdy, Music lover, Raver, Bookworm, Gamer, Stoner, Spiritual |
| **Relationship Dynamics** | Monogamous, Ethically non-monogamous, Polyamorous, Casual, Long-term, Open to exploring, Situationship, Nesting partner |
| **Desires** | Deep conversation, Adventure partner, Travel buddy, Creative collaboration, Quiet nights, Beach days, Coffee dates, Club nights |
| **Experience Level** | Just discovering, Exploring, Confident, Experienced, Mentor |
| **Local Scene (Tanzania & Kenya)** | Kariakoo, Ilala, Ubungo, Upanga, Msasani, Oysterbay, Mikocheni, Mbezi, Tegeta, Kawe, Sinza, Kijitonyama, Makumbusho, Kimara, Tandale, Mwananyamala, Hananasif, Vingunguti, Mburahati, Buguruni, Keko, Chang'ombe, Mtoni, Chaani, Temeke, Yombo, Kurasini, Pugu, Ukonga, Segerea |

**Tag Data Model:**

```
Tag {
  id: String
  category: String
  label: String
  slug: String
}

UserProfile {
  ...
  tags: String[] (max 5 tag IDs)
}
```

**Discover Filter Integration:**
- Users can filter by ANY tag category
- Multi-select: "Show me Studs + Soft studs in Dar es Salaam + Nairobi"
- Live search matches against tag labels
- The more specific the filter, the more powerful the match

---

### 14. Security & Anti-Abuse

**Goal:** This space stays safe. No exceptions.

| Feature | Details |
|---|---|
| Device fingerprinting | Custom fingerprinting: canvas, WebGL, audio, screen, timezone. No third-party. |
| Device + IP ban | Failed verification → permanent device + IP ban. |
| Nighttime Trap | 21:00–04:00 SAST random biometric verification. Blocking. Cannot bypass. |
| Rate limiting | API rate limiting on all endpoints. Prevent abuse. |
| Report/block user | Block = disappears. Report = admin queue. |
| Content reporting | Report messages in chat. Admin review queue. |
| No men / no bots | Enforced by verification gate. Not a policy — it's code. |
| `is_verified` middleware | Route protection middleware. Every protected route checks `is_verified`. |

---

### 15. Admin Panel

**Goal:** Founder controls everything. Solo dev = full visibility.

| Feature | Details |
|---|---|
| Founder profile | Pinned first in discover grid. |
| Admin toggle | Switch between admin view and user view. |
| Broadcast notification | Send push + in-app notification to all users. |
| User management | View, ban, quarantine users. |
| Verification review queue | Review quarantined users. Approve or reject. |
| Report review queue | Review reported content and users. Take action. |

---

### 16. Design System

**Goal:** Premium $1M feel. Airbnb meets Bumble. Every pixel intentional.

**Design Tokens (4 core + supporting tints):**

| Token | Value | Usage |
|---|---|---|
| Deep Rose | `#9D3B54` | Primary accent, CTAs, highlights (high contrast on ivory) |
| Gold | `#B8923D` | Lelly Pass, badges, scarcity (deeper gold, high contrast on ivory) |
| Ivory | `#F7F4EF` | Backgrounds (warm premium ivory) |
| Espresso | `#1A1614` | Text (max contrast on light backgrounds) |
| Warm Rose Light | `#D4889E` | For DARK backgrounds only |
| Gold Light | `#D4AF37` | For DARK backgrounds only |
| Cream | `#FAF6F0` | Text on dark backgrounds |
| Blush | `#F4E6E9` | Subtle rose tint backgrounds |
| Sage | `#5E7E55` | Supporting accent (deeper) |

**Typography:**

| Font | Usage |
|---|---|
| Fraunces | Display / headings / hero text — editorial luxury serif with optical sizing |
| Inter | Body text / UI / descriptions — professional max-legibility sans |

Loaded via `next/font/google` in `src/app/layout.tsx`. CSS variables: `--font-fraunces` (display), `--font-inter` (body).

**Contrast Rule (HARD — see Agent Rule #15):**

On deep/dark backgrounds (`bg-hero-dark`, `bg-section-dark`, `bg-soft-charcoal`, solid deep rose `bg-warm-rose`), ALL text MUST be bright — use `text-cream`, `text-white`, `text-gold-light`, or `text-warm-rose-light`. NEVER use `text-soft-charcoal`, `text-warm-rose-dark`, `text-gold-deep`, or `text-muted-foreground` on dark/rose backgrounds. Dark text on deep backgrounds is invisible. This is a hard rule.

**Design Principles:**

- Mobile-first responsive
- Framer Motion animations (subtle, elegant, never janky)
- shadcn/ui component library
- Lucide icons
- Very cute logo
- Airbnb warmth + Bumble confidence + Lellina soul
- 4-color core palette (ivory / espresso / deep rose / gold) — premium, high-contrast, never muddy

---

## 📊 FREE vs LELLY PASS COMPARISON

| Feature | Free | Lelly Pass |
|---|---|---|
| Browse profiles | ✅ Unlimited | ✅ Unlimited |
| ALL filters (age, district, tags, etc.) | ✅ Unlimited | ✅ Unlimited |
| Live search | ✅ Full access | ✅ Full access |
| Swipe & Match | ✅ Unlimited | ✅ Unlimited |
| See likes | 5 only | ✅ Unlimited |
| **Send messages** | ❌ **1 per day** | ✅ **Unlimited** |
| Chat requests | 1 per day | ✅ Unlimited |
| Send pics | ✅ | ✅ |
| Receive pics | ❌ (blurred) | ✅ (unblurred) |
| Delete = ghost | ❌ | ✅ |
| See who liked you | ❌ | ✅ |
| Online status visible | ❌ | ✅ |
| Group chat | View only (read) | ✅ Post messages |
| Lelly badge | ❌ | ✅ |

---

## 💰 PRICING

USD is the PRIMARY currency — users send exactly this amount in USD. ZAR is shown only as a live convenience reference via `/api/exchange-rate` (fetches from Frankfurter.app, free, no API key, 1hr server-side cache, fallback rate 18.0 if API unreachable).

| Plan | Price | Notes |
|---|---|---|
| **Founding Lelly Pass** | $5.50 USD (one-time) | First 500 users only. Live ZAR conversion shown via Frankfurter.app API. Scarcity countdown. |
| **Standard Lelly Pass** | $7.50 USD/month | Auto-flips after 500 founding slots filled. Live ZAR conversion shown. |

---

## 🔮 V2 FEATURES (Brief)

These are NOT in V1. Listed for planning only.

| Feature | Notes |
|---|---|
| Events | Events tab with district filtering, category, date. Title-only for free, full details for Lelly Pass. |
| Rate Me | Profile rating feature. |
| Blog system | Content + community stories. |
| Chat enhancements | Typing indicators, voice messages, reactions, search. |
| AI content moderation | Automated moderation via Gemini. |
| APK (CapacitorJS) | Native Android app via CapacitorJS. |
| Push notifications enhanced | Rich notifications, deep linking. |
| Data export & deletion | GDPR-style data controls. |
| Analytics dashboard | User analytics, engagement metrics. |
| Community features | Forums, polls, Q&A. |
| Subscription enhancements | Gift passes, referral credits, seasonal offers. |

---

## 🛠️ TECH STACK

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | Prisma ORM + Turso (SQLite) |
| **Auth** | NextAuth.js v4 |
| **State** | Zustand + TanStack Query |
| **Real-time** | Socket.io (same server) |
| **Animation** | Framer Motion |
| **AI** | @google/genai (v2.14.0) — Gemini |
| **Face Detection** | modern-face-api (v0.22.5) |
| **Email** | Gmail via nodemailer |
| **Media CDN** | Telegram Bot API |
| **Hosting** | Render.com |
| **Payment** | TBD — Lemon Squeezy / PayFast / In-app purchases |
| **Icons** | Lucide |
| **Fonts** | Fraunces + Inter (via next/font/google) |

---

## 🌐 EXTERNAL APIs

| API | Purpose | Auth | Notes |
|---|---|---|---|
| **Frankfurter.app** | Live USD → ZAR currency conversion for `LivePrice` component | None (free, open-source, no API key) | URL: https://frankfurter.app. Endpoint: `https://api.frankfurter.app/latest?from=USD&to=ZAR`. Cached 1hr server-side in `/api/exchange-rate` route. Graceful fallback rate `18.0` if API unreachable. |

---

## 🏗️ BUILD PHASES (V1)

| Phase | Scope | Notes |
|---|---|---|
| **Phase 1** | Landing Page + Design System | ✅ COMPLETE. Converting. Founding offer. Geographically neutral post-pivot. |
| **Phase 2** | Verification Gate + Registration | ✅ COMPLETE. 4-step verification (selfie + voice + video + 3-cloud consensus). Auto-captcha on selfie. Device fingerprinting. Nighttime Trap wired to login (lines 81–97). |
| **Phase 3** | Profile Setup + Tags + Location | ✅ COMPLETE. Wizard (5 steps). Tanzania (31 regions) + Kenya (47 counties) = 78 districts. 90 tribe tags (5 max). Country isolation enforced (TZ + KE at the gate). |
| **Phase 4** | Discover Grid + Filters + Live Search | Grid view. ALL filters (age, district, tags, online). Live search. Like/Match. |
| **Phase 5** | Chat Engine + Image Viewer | Socket.io. Handle requests. Blurred photos for free. |
| **Phase 6** | Group Chat Tab | 2 system groups ("Tanzania Galz", "Kenya Galz"). Socket.io rooms. No group creation. View-only for free. |
| **Phase 7** | Lelly Pass + Value Exchange Gating | 500 slot scarcity. Countdown. Paywall messaging. |
| **Phase 8** | Notifications + Admin Panel | Push notifications. Admin review queues. |
| **Phase 9** | Settings + Profile Management | Full settings. Block/report. Theme toggle. |
| **Phase 10** | Payment Integration | LAST phase. Gateway TBD. Lelly Pass activation. |

---

*Lellina — Galz for Galz. A verified women-only space. Live in Tanzania 🇹🇿 & Kenya 🇰🇪. (Other regions — Coming soon.)*

---

## ════════════════════════════════════════════════════════════════════
## Phase 2 — VERIFIED ANTI-MEN ARCHITECTURE (Post-Planning Session 2)
## ════════════════════════════════════════════════════════════════════
> **Appended: 2026-07-31.** Operational spec for the verification gate.
> Full detail lives in `docs/phases.md` → "Phase 2 — REFINED ARCHITECTURE."
> This section is the quick-reference summary.

### 1. Three-Cloud Consensus (no single AI sees a photo)

| Layer | Cloud | Lane | Free Quota | When |
|-------|-------|------|------------|------|
| L1 | modern-face-api (browser) | Face detect + embedding | Unlimited | Every capture |
| L2 | HuggingFace `rizvandwiki/gender-classification` | Gender verdict | ~300/hr | Initial verify (selfie) |
| L3 | Gemini `gemini-3.5-flash-lite` (`@google/genai@2.14.0`) | Gender + liveness + deepfake (1 frame) | 1000 RPD (2 keys) | Initial verify + night borderline |
| L4 | Sightengine | **Fraud/integrity sniffer** (NOT gender) | 500/day | Borderline/disagreement only |

- **PASS:** L1 face + (L2 OR L3 female) + no L4 fraud. ≥2 of {L2,L3,L4} aligned.
- **BAN:** ≥2 of {L2,L3,L4} say male → device + IP ban.
- **MANUAL:** clouds disagree → appeal flow → admin queue.

### 2. No Video To Cloud

Video = 100% client-side. 1 frame grab → Gemini. HF image-only. Sightengine video paid.
Privacy + speed. Video's job = client-side liveness (read code → OCR local).

### 3. Reference Photo + Embedding (Night-Trap Source of Truth)

At registration: save `referencePhoto` (encrypted AES-256 blob) + `faceEmbedding`
(128-dim vector, encrypted). Both system-only, never on discover/profile. Deleted on
account deletion. Embedding does instant cosine match (free, no cloud); photo is
admin-review backup for borderline cases.

### 4. Nighttime Trap — Expanded

> ⚠️ **STATUS: DEFERRED.** Backend lib (`src/lib/nighttime-trap.ts`) + API route (`src/app/api/verify/night-check/route.ts`) are BUILT to the spec below, but no client-side caller wires the trap into the login flow yet. Public-facing copy that promised this feature has been REMOVED from the landing page. Wiring to login is deferred to Phase 3 (post-login flow). The spec below describes the intended design — not yet user-facing.

- **Window: 21:00–07:00 SAST** (10 hours).
- Trigger: login in window + 24h cooldown + 40% roll.
- Image-only: fresh selfie → embedding cosine vs stored.
  - ≥0.6 pass (instant, free, no cloud).
  - <0.5 block + manual review.
  - 0.5–0.6 borderline → Gemini second opinion + admin photo compare.
- No voice, no video at night.

### 5. Free-Tier Budget (hard cap 80%)

| Cloud | Cap | Realistic Use | Headroom |
|-------|-----|---------------|----------|
| Gemini | 800/day | ~100-300 | ✅ |
| HF | ~2400/day | ~100-300 | ✅ |
| Sightengine | 400/day | ~10-60 (borderline) | ✅ |
| Night trap | 0 cloud | unlimited | ✅ free |

Bottleneck = Gemini 800/day. Launch volume <10% of all quotas.

### 6. Cold-Start Killer

On `/verify` entry → background wake ping to HF (1×1 pixel). Model warm by the time
user positions face. Fallback: 1.5s/3s/6s retry, then skip L2 + require L3+L4 2-of-2 + manual flag.

### 7. Appeal + Admin Manual Verification

Rejection = door not wall. "Tell us we got it wrong" → appeal form (fresh photo+voice+video)
→ `/admin/manual-verification` queue. Admin: Approve/Reject/Request More/Ban Device. Audit logged.
Appeal media auto-deleted 7 days post-review.

### 8. Camera UX — LARGE

Full-bleed viewfinder (min 85vh mobile). Soft oval guide. Real-time L1 feedback bar.
72px capture button. Three-cloud progress dots (trust theatre). Front/back + flash toggles.

### 9. Copy Tone — Funny + Simple + Strict

Warm, witty, never clinical. Gate is ruthless, voice is human.
- "Four breaths. Selfie, voice, code, done. Bots can't buy their way in. Neither can men."
- "Let me see you. Just you. I look, I forget."
- "Three systems checking. None remembering."
- "Late-night hello. One photo, gone in a blink."
- "Not this time. If we got it wrong — tell us."

Never: premium/subscribe/upgrade. Always: Lelly Pass / Secure / Unlock.

### 10. New Tasks Added to Phase 2

- **2.18** `/api/verify/appeal` — appeal submission route
- **2.19** `/admin/manual-verification` — appeal review queue (ships Phase 2; full admin is Phase 8)

---

*End of Phase 2 Architecture append. Original feature list above remains canonical.*

---

## ════════════════════════════════════════════════════════════════════
## Phase 2 — PLANNING SESSION 3 REFINEMENTS (2026-07-31)
## ════════════════════════════════════════════════════════════════════
> Appended. Quick-reference. Full detail in `docs/phases.md` sections L–P.

### 11. Night Verification — 90%+ Confidence Target

- Cosine match (≥0.6) + **Gemini liveness on EVERY night check** (not just borderline).
- Lighting mandatory: low light → capture blocked → "Find good light — we need to see you clearly."
- Honest limit: can't beat lookalikes (sister). Night trap = deterrent (40% random + 2-7 AM unpredictability).
- Flow: cosine ≥0.6 AND Gemini liveness PASS → pass. <0.5 → block. 0.5–0.6 → borderline + admin photo compare. Gemini liveness FAIL → block + manual review.

### 12. Admin Bypass

- Admin (`cardoverli`) logs in via `/login` directly. NO verification gate.
- Pre-seeded: `role: ADMIN`, `isVerified: true`. Credentials in `.env.local`.
- One account, two modes: user view + admin mode toggle.

### 13. Login NOT Gated — Signup IS

- `/login` → open to all registered users. No gate.
- `/register` → FORCES `/verify` (4-step ritual) first. Only path to a new account.
- Night trap fires on login for verified users during 21:00–07:00 SAST.

### 14. No Nudity Blocking — Community Moderation

- No auto-nudity filter on user content. Users post freely (except illegal).
- Sightengine = verification fraud ONLY. NOT content moderation. Saves quota.
- Community Report button on profiles, chat messages, group messages → admin queue.
- Report model: `Report` (reporter, target, reason, status). Admin: Warn/Suspend/Ban/Dismiss.

### 15. New Tasks (2.20–2.22)

- 2.20: Admin user pre-seed in `prisma/seed.ts`
- 2.21: Report button + `/api/report` route
- 2.22: Gemini liveness on every night check (not just borderline)

---

*End of Planning Session 3 append. Original feature list above remains canonical.*
