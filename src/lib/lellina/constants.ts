/**
 * Lellina — Phase 1 Constants
 * Galz for Galz
 *
 * Public landing surfaces are geographically neutral. Pricing lives
 * inside the app (post-login) via FOUNDING_PASS (kept here for in-app use).
 */

// ─── Cape Town Suburbs (8) — South Africa ──────────────────────────────────
// Used internally (post-login / onboarding). NOT shown on the public landing.
export const CAPE_TOWN_SUBS = [
  { name: "Blaauwberg", areas: "Bloubergstrand · Table View · Milnerton" },
  { name: "Cape Flats", areas: "Athlone · Grassy Park · Lansdowne" },
  { name: "Eastern", areas: "Strand · Gordon's Bay · Somerset West" },
  { name: "Helderberg", areas: "Somerset West · Sir Lowry's Pass" },
  { name: "Khayelitsha / Mitchells Plain", areas: "Khayelitsha · Mitchells Plain · Langa" },
  { name: "Northern", areas: "Bellville · Durbanville · Tygervalley" },
  { name: "Southern", areas: "Wynberg · Claremont · Muizenberg" },
  { name: "Table Bay", areas: "De Waterkant · Green Point · Sea Point · Bo-Kaap · Camps Bay" },
] as const;

// ─── Lelly Pass Pricing (USD primary) ──────────────────────────────────────
// In-app only. NOT rendered on the public landing.
export const FOUNDING_PASS = {
  totalSlots: 500,
  // Phase 1: optimistic simulated claim count.
  // Phase 7 will replace this with a real server-side counter.
  claimedSlots: 127,
  // USD is the primary currency — users send exactly this amount
  foundingPriceUSD: 5.5,
  standardPriceUSD: 7.5,
  // Live conversion rate fallback (used by /api/exchange-rate consumer).
  fallbackZarRate: 18.0,
} as const;

export const foundingSpotsRemaining = (): number =>
  Math.max(0, FOUNDING_PASS.totalSlots - FOUNDING_PASS.claimedSlots);

// ─── Community Channels (from .env, with safe fallbacks) ───────────────────
export const TELEGRAM_CHANNEL_URL =
  process.env.TELEGRAM_CHANNEL_URL ?? "https://t.me/lellina_app";

export const WHATSAPP_CHANNEL_URL =
  process.env.WHATSAPP_CHANNEL_URL ??
  "https://whatsapp.com/channel/0029Vb8Z7CWInlqOir0f3C1d";

// ─── App Identity ──────────────────────────────────────────────────────────
export const APP = {
  name: "Lellina",
  tagline: "Galz for Galz",
  // Public landing is geographically neutral — no city shown publicly.
  city: "",
  // Use NEXTAUTH_URL (set on Render) so OG/share links point to the real deploy.
  url: process.env.NEXTAUTH_URL ?? "https://lellina-dev.onrender.com",
} as const;

// ─── Landing Page Section IDs (for smooth-scroll nav) ──────────────────────
export const SECTION_IDS = {
  hero: "hero",
  founding: "founding-pass",
  why: "why-galz",
  noMen: "no-men",
  community: "community",
  founder: "founder-story",
  howYouPay: "how-you-pay",
  lellyPass: "lelly-pass",
} as const;

// ─── Free vs Lelly Pass comparison (for LellyPassInfo section) ─────────────
// In-app only. NOT rendered on the public landing.
export const FREE_VS_LELLY = {
  free: [
    { label: "Browse profiles", value: "Unlimited" },
    { label: "All filters (age, district, tribe)", value: "Unlimited" },
    { label: "Live search", value: "Full access" },
    { label: "Swipe & match", value: "Unlimited" },
    { label: "See who liked you", value: "5 only" },
    { label: "Send messages", value: "1 per day" },
    { label: "Photo viewing", value: "Blurred" },
    { label: "Event details", value: "Title only" },
  ],
  lelly: [
    { label: "Browse profiles", value: "Unlimited" },
    { label: "All filters (age, district, tribe)", value: "Unlimited" },
    { label: "Live search", value: "Full access" },
    { label: "Swipe & match", value: "Unlimited" },
    { label: "See who liked you", value: "Everyone" },
    { label: "Send messages", value: "Unlocked" },
    { label: "Photo viewing", value: "Unblur + protected" },
    { label: "Event details", value: "Full access" },
    { label: "Delete = ghost", value: "Yes" },
    { label: "Lelly badge", value: "Gold" },
  ],
} as const;
