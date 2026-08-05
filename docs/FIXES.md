# Lellina — FIXES

> Error log: every error encountered during development, how it was fixed, referenced by phase.
> New errors are appended at the bottom. Never delete old entries.

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
> Violating this rule = broken UI = P0 bug. The Phase 4A contrast disaster is logged as a permanent error entry below — read it before every UI change.

---

## ⚠️ RULES FOR ALL AGENTS

1. **Open Source First** — Always use free, open-source packages when available. Copy patterns from Compass, Duolicious, pH7 CMS where code fits. Reimplement where stack differs.
2. **Free Tools Only** — Never suggest paid tools when free alternatives exist. Every tool must be free or have a free tier.
3. **Landing Page Security** — NEVER expose internal tools, tech stack, or secret methods on any public-facing page. This is business.
4. **No "Lesbian" Publicly** — NEVER use the word "lesbian" on any public-facing page. Use "Galz for Galz" branding.
5. **Image Viewer Design** — Must be VERY modern, VERY cute, VERY sexy with modern animations. But NEVER heavy. Speediest code only.
6. **modern-face-api** — Use `modern-face-api` (npm, v0.22.5) for face detection. NOT old face-api.js.
7. **@google/genai** — Use `@google/genai` (npm, v2.14.0) — the NEW SDK. NOT old `@google/generative-ai`.
8. **Gemini Models** — `gemini-3.1-flash-lite` and `gemini-3.5-flash-lite`. RPM: 15, TPM: 250K, RPD: 500. 2 API keys for rotation.
9. **GitHub Push Rule** — ⚠️ CRITICAL: Before pushing to GitHub, agent MUST: (1) Identify all project files before building, (2) Build/fix only what's needed, (3) Extract ONLY project files (no sandbox files, no .env, no secrets), (4) Verify no sandbox/config/skills/.zscripts/mini-services/db/tool-results/ files are included, (5) Push to GitHub, (6) Pull and verify pushed files match project files only, (7) Confirm no .env or secrets were exposed. Violation = rebuild from scratch.
10. **Commit Author** — Every commit MUST use: `user.name = "cardoverli-FU"`, `user.email = "300794432+cardoverli-FU@users.noreply.github.com"`. Wrong email = deploy blocked.
11. **Docs Folder** — All planning documents live in `docs/` folder. All agents MUST read this folder before starting work.
12. **Psychological Rule** — NEVER say "Premium", "Subscribe", or "Upgrade". Say "Lelly Pass", "Secure your Lelly Pass", "Unlock". This is branding, not a feature gate.
13. **No Play Store** — Web app first. No Play Store submission in V1. PWA / mobile web only.
14. **Payment Last** — Payment integration is the LAST phase of V1. Build everything else first.
15. **No Group Chat in V1** — V1 is 1-on-1 chat only. Group chat is V2.
16. **No Sandbox Files in Git** — NEVER push skills/, .zscripts/, mini-services/, db/, tool-results/, or any sandbox-specific files to GitHub. Only project source code.

---

## Error Log Format

```
### [Phase N] - Error Title
- **Date:** YYYY-MM-DD
- **Error:** description
- **Fix:** how it was fixed
- **File:** route
```

---

## Phase 1 — Landing Page

### [Phase 1] - Em-dash rendering issue in JSX
- **Date:** 2026-07-30
- **Error:** Em-dashes typed as `—` HTML entity in JSX strings rendered as literal `&mdash;` text instead of the em-dash character, breaking copy in Hero/NoMen sections ("ritual — four steps" was showing as raw entity text).
- **Fix:** Replaced HTML entities with the actual Unicode em-dash character `—` (U+2014) directly in JSX string literals. Next.js + React render Unicode em-dashes correctly without escaping.
- **File:** `src/components/landing/Hero.tsx`, `src/components/landing/NoMenSection.tsx` (all landing components with em-dashes)

### [Phase 1] - Footer overlap with sticky mobile CTA bar
- **Date:** 2026-07-30
- **Error:** On mobile viewports, the sticky bottom CTA bar (`StickyMobileCTA.tsx`, `lg:hidden`, fixed to bottom) covered the last ~80px of footer content, making the bottom row of footer links un-tappable.
- **Fix:** Added bottom padding to the footer inner container: `pb-28 lg:pb-10`. The `pb-28` (112px) clears the mobile sticky bar (height ~72px + safe-area-inset). The `lg:pb-10` resets to standard padding on desktop where the sticky bar is hidden.
- **File:** `src/components/layout/Footer.tsx`

### [Phase 1] - Stale .next cache serving old CSS after file changes
- **Date:** 2026-07-30
- **Error:** After swapping the color palette in `globals.css` (#E8A0BF → #9D3B54) and fonts in `layout.tsx` (Playfair/Cormorant → Fraunces/Inter), the dev server kept serving the OLD compiled CSS — computed styles still showed `#E8A0BF` and the old Playfair font. Hot reload was not picking up the changes.
- **Fix:** Stopped the dev server, deleted the `.next/` directory entirely (`rm -rf .next`), and restarted `bun run dev` fresh. This forced Next.js to recompile CSS + font manifests from scratch. Verified via computed styles: heroH1 font-family now `"Fraunces, Fraunces Fallback"`, foundingBtn bg now `rgb(157,59,84)` = #9D3B54. **Rule of thumb: after swapping fonts or color tokens, ALWAYS clear `.next/` and restart.**
- **File:** `.next/` (cache directory), `src/app/globals.css`, `src/app/layout.tsx`

### [Phase 1] - Low contrast: dark text on dark backgrounds
- **Date:** 2026-07-30
- **Error:** The original design used light pink `#E8A0BF` as both background and text color in several places, producing near-invisible text. After the palette swap to deep rose `#9D3B54` and espresso `#1A1614`, several components had dark/espresso text rendered on dark `bg-section-dark` / `bg-hero-dark` backgrounds — invisible. The `LivePrice` component especially needed to render in both light (ivory bg) and dark (hero/founding bg) contexts but had no tone switch.
- **Fix:** (1) Added a `tone` prop to `LivePrice.tsx` (`'light' | 'dark'`) that switches text color classes between `text-espresso` (light context) and `text-cream` / `text-gold-light` (dark context). (2) Audited every landing component for dark-on-dark violations and swapped offending classes to bright variants (`text-cream`, `text-white`, `text-gold-light`, `text-warm-rose-light`). (3) Codified the fix as a hard rule — see **Contrast Rule** added to Agent Rules (#15 in phases.md, #15 in features.md, applied throughout).
- **File:** `src/components/landing/LivePrice.tsx`, `Hero.tsx`, `NoMenSection.tsx`, `Footer.tsx`, all dark-bg sections

### [Phase 1] - Long scroll UX hurt conversion + cognitive load
- **Date:** 2026-07-30
- **Error:** Original landing was a single long-scroll page with 9 stacked sections (~6700px tall on desktop). Vision agent + UX review flagged: visitors had to scroll past 8 sections to reach pricing/FAQ, drop-off was high, mobile users especially bounced before reaching the Lelly Pass offer. The "How You Pay" and "Lelly Pass Info" sections were buried at the bottom.
- **Fix:** Converted the long-scroll page to a **tabbed interface** (`LandingTabs.tsx`) with 6 pill tabs under a sticky header: Home / Why / Gate / Cape Town / Galz / Lelly. Pricing + FAQ now live in the "Lelly" tab — one tap away from any context. Added a `BrandSplash.tsx` intro (deep rose, ~1.8s fade) for premium first impression. Mobile users can now jump straight to pricing without scrolling.
- **File:** `src/components/landing/LandingTabs.tsx` (new), `src/components/landing/BrandSplash.tsx` (new), `src/app/page.tsx` (recomposed)

---

## Phase 2 — Verification Gate + Registration

(No errors yet)

---

## Phase 3 — Profile Setup + Tribe Tags + Location

(No errors yet)

---

## Phase 4 — Discover Grid + Filters + Live Search

### ❌ P0 — Phase 4A Contrast Disaster (shipped to production)

**Symptom:** Live site (https://lellina-dev.onrender.com) shipped with invisible text and invisible icons on BOTH light and dark themes.
- Light theme: body text was light pink on a light pink background — "swallowed" by the background. Users could not read the landing page.
- Dark theme: the filter panel close button (X) was black on a dark rose background — users could not close the filter panel. They were trapped.
- Dark theme: pass buttons on profile cards used `text-cream/60` (40% transparent) on a dark background — icons nearly invisible.
- Dark theme: founder badge used `text-espresso` (dark brown) on a dark background — invisible.

**Root cause:** `tailwind.config.ts` wrapped CSS vars in `hsl(var(--x))` but the vars in `globals.css` were HEX values (e.g. `--background: #F7F4EF`). `hsl(#F7F4EF)` is invalid CSS — it silently broke EVERY shadcn semantic color (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.) across the entire app. The broken tokens caused shadcn components to inherit `currentColor` or fall back to transparent, making text and icons invisible.

**Fix applied (commit f335a2b):**
1. Changed all `'hsl(var(--x))'` to `'var(--x)'` in `tailwind.config.ts` (15+ color tokens).
2. Added missing `--destructive-foreground` token to `globals.css` (+ `@theme inline` mapping).
3. Fixed landing region banner: now shows 🇿🇦 Cape Town + 🇹🇿 Dar es Salaam with dark text (`text-soft-charcoal`, `text-warm-rose-dark`) on `blush-subtle` bg.
4. Fixed FilterPanel Sheet close X: added `text-cream` to SheetContent (X was inheriting broken `text-foreground` = invisible on dark).
5. Fixed ProfileCard pass button: `text-cream/60` → `text-cream`, `border-cream/15` → `border-cream/25` (stronger contrast).
6. Fixed 3 undefined color classes: `text-espresso` → `text-soft-charcoal`, `text-sage-deep` → `text-sage`, `text-sage-dark` → `text-sage`.

**Prevention rule:** See [`docs/CONTRAST-RULE.md`](./CONTRAST-RULE.md). Every UI commit MUST be browser-verified in BOTH light and dark themes. This is now a P0 rule referenced in all docs.

### ❌ P1 — Filter dropdown options invisible (light theme)

**Symptom:** When opening the district/tag filter dropdowns, the option text was invisible — light cream text on a white (bg-popover) background.

**Root cause:** The shadcn Command component uses `bg-popover` which is #FFFFFF in light theme. The CommandItem text was `text-cream/80` (light). Result: white-on-white = invisible.

**Fix:** Added explicit `bg-[#1A1614] text-cream` to the Command component in both `DistrictFilter.tsx` and `TagFilter.tsx`, overriding the theme-dependent bg-popover. Also added `[&_[cmdk-group-heading]]:text-cream/50` to CommandGroup and `border-cream/15` to CommandInput.

**Prevention:** See docs/CONTRAST-RULE.md — interactive elements must be visible on BOTH themes. Theme-dependent tokens (bg-popover) must be overridden when the surrounding context is always-dark.

---

## Phase 5 — Chat Engine + Image Viewer

(No errors yet)

---

## Phase 6 — Events Tab

(No errors yet)

---

## Phase 7 — Lelly Pass + Value Exchange Gating

(No errors yet)

---

## Phase 8 — Notifications + Admin Panel

(No errors yet)

---

## Phase 9 — Settings + Profile Management + Polish

(No errors yet)

---

## Phase 10 — Payment Integration

(No errors yet)

---

## Phase 11 — V1 Launch

(No errors yet)

---

> Append new errors below as they occur during development.

---

## Phase 2 — Pre-Build Architecture Decisions (No errors — design log)

### [Phase 2] - Architecture planning session 2 (2026-07-31)
- **Date:** 2026-07-31
- **Context:** Pre-build refinement of Phase 2 verification gate. No code written yet. User mandated: 3-cloud anti-men system, reference photo for night checks, Sightengine role clarity, 80% free-tier budget cap, no video to cloud, funny+simple+strict tone, night window 21:00–07:00, appeal + admin manual-verification tab.
- **Decisions:**
  1. **3-cloud consensus:** L1 modern-face-api (browser, embedding) + L2 HuggingFace gender + L3 Gemini reasoning + L4 Sightengine fraud-sniffer (borderline only). No single point of failure. ≥2-of-3 alignment required.
  2. **Sightengine lane = fraud/integrity, NOT gender, NOT pure backup.** Called on borderline/disagreement only → stays under 80% of 500/day. Emergency gender tiebreaker if HF+Gemini both down.
  3. **No video to cloud.** Video 100% client-side. 1 frame grab → Gemini. Reasons: HF image-only, Gemini video burns quota, Sightengine video paid, privacy, speed.
  4. **Reference photo + embedding stored at registration.** `referencePhoto` (AES-256 encrypted blob) + `faceEmbedding` (128-dim, encrypted). Both system-only, never public. Deleted on account deletion. POPIA applies.
  5. **Night window expanded 21:00–07:00 SAST** (was 21:00–04:00). Image-only check. Cosine ≥0.6 pass (free, no cloud), <0.5 block, 0.5–0.6 borderline → Gemini + admin photo compare.
  6. **80% budget cap table** codified. Bottleneck = Gemini 800/day. Launch volume <10% of all quotas.
  7. **HF cold-start killer:** wake ping on `/verify` entry. Fallback: 1.5s/3s/6s retry, then skip L2 + require L3+L4 2-of-2 + manual flag.
  8. **Appeal flow + admin manual-verification tab** (new tasks 2.18, 2.19). Ships with Phase 2 because appeals need a destination. Full admin panel remains Phase 8.
  9. **Camera = full-bleed** (min 85vh mobile), 72px capture button, three-cloud progress dots (trust theatre).
  10. **Copy tone = funny + simple + strict.** Warm/witty, never clinical. "Bots can't buy their way in. Neither can men." Never premium/subscribe/upgrade.
- **File:** `docs/phases.md` (appended "Phase 2 — REFINED ARCHITECTURE" section), `docs/features.md` (appended "Phase 2 — VERIFIED ANTI-MEN ARCHITECTURE" summary)
- **Status:** Planning complete. Awaiting developer "GO" to begin Phase 2 build. No feature code written.
