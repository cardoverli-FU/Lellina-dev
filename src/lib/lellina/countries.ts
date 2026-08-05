/**
 * Lellina — Country Rollout List
 *
 * Gated country rollout. At launch, Tanzania + Kenya are
 * allowed through to `/verify`. Every other country hits the "Coming soon"
 * screen on `/join` and NO data is stored.
 *
 * This list is intentionally comprehensive (all 54 African countries + major
 * world countries) so that no one feels excluded — they simply see that their
 * country is "coming soon" and are invited to join the community channels.
 *
 * `code`  — ISO 3166-1 alpha-2 country code (uppercase)
 * `name`  — Display name (English)
 * `flag`  — Flag emoji for the dropdown
 * `allowed` — true for Tanzania + Kenya at launch
 */

export type Country = {
  code: string
  name: string
  flag: string
  allowed: boolean
}

// ─── Launch allowlist ──────────────────────────────────────────────────────
// Tanzania + Kenya pass through to /verify.
// To open a new country, flip `allowed` to true here (and update middleware
// / verify logic if a region check is added later).
const ALLOWED_CODES = new Set<string>(["TZ", "KE"])

// ─── Raw country data (alpha-2 code → display name) ────────────────────────
// All 54 African countries + major world countries. Sorted alphabetically
// by display name in the final export.
const RAW_COUNTRIES: ReadonlyArray<readonly [string, string]> = [
  // ── Africa (all 54) ──
  ["DZ", "Algeria"],
  ["AO", "Angola"],
  ["BJ", "Benin"],
  ["BW", "Botswana"],
  ["BF", "Burkina Faso"],
  ["BI", "Burundi"],
  ["CV", "Cabo Verde"],
  ["CM", "Cameroon"],
  ["CF", "Central African Republic"],
  ["TD", "Chad"],
  ["KM", "Comoros"],
  ["CG", "Congo"],
  ["CD", "DR Congo"],
  ["CI", "Côte d'Ivoire"],
  ["DJ", "Djibouti"],
  ["EG", "Egypt"],
  ["GQ", "Equatorial Guinea"],
  ["ER", "Eritrea"],
  ["SZ", "Eswatini"],
  ["ET", "Ethiopia"],
  ["GA", "Gabon"],
  ["GM", "Gambia"],
  ["GH", "Ghana"],
  ["GN", "Guinea"],
  ["GW", "Guinea-Bissau"],
  ["KE", "Kenya"],
  ["LS", "Lesotho"],
  ["LR", "Liberia"],
  ["LY", "Libya"],
  ["MG", "Madagascar"],
  ["MW", "Malawi"],
  ["ML", "Mali"],
  ["MR", "Mauritania"],
  ["MU", "Mauritius"],
  ["MA", "Morocco"],
  ["MZ", "Mozambique"],
  ["NA", "Namibia"],
  ["NE", "Niger"],
  ["NG", "Nigeria"],
  ["RW", "Rwanda"],
  ["ST", "São Tomé and Príncipe"],
  ["SN", "Senegal"],
  ["SC", "Seychelles"],
  ["SL", "Sierra Leone"],
  ["SO", "Somalia"],
  ["ZA", "South Africa"],
  ["SS", "South Sudan"],
  ["SD", "Sudan"],
  ["TZ", "Tanzania"],
  ["TG", "Togo"],
  ["TN", "Tunisia"],
  ["UG", "Uganda"],
  ["ZM", "Zambia"],
  ["ZW", "Zimbabwe"],

  // ── Major world countries (non-African) ──
  ["AE", "United Arab Emirates"],
  ["AR", "Argentina"],
  ["AU", "Australia"],
  ["AT", "Austria"],
  ["BE", "Belgium"],
  ["BR", "Brazil"],
  ["CA", "Canada"],
  ["CL", "Chile"],
  ["CN", "China"],
  ["CO", "Colombia"],
  ["CZ", "Czechia"],
  ["DK", "Denmark"],
  ["EC", "Ecuador"],
  ["FI", "Finland"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["GR", "Greece"],
  ["HU", "Hungary"],
  ["IS", "Iceland"],
  ["IN", "India"],
  ["ID", "Indonesia"],
  ["IE", "Ireland"],
  ["IL", "Israel"],
  ["IT", "Italy"],
  ["JM", "Jamaica"],
  ["JP", "Japan"],
  ["KR", "South Korea"],
  ["KW", "Kuwait"],
  ["MY", "Malaysia"],
  ["MX", "Mexico"],
  ["NL", "Netherlands"],
  ["NZ", "New Zealand"],
  ["NO", "Norway"],
  ["PK", "Pakistan"],
  ["PE", "Peru"],
  ["PH", "Philippines"],
  ["PL", "Poland"],
  ["PT", "Portugal"],
  ["QA", "Qatar"],
  ["RO", "Romania"],
  ["RU", "Russia"],
  ["SA", "Saudi Arabia"],
  ["SG", "Singapore"],
  ["ES", "Spain"],
  ["SE", "Sweden"],
  ["CH", "Switzerland"],
  ["TH", "Thailand"],
  ["TR", "Turkey"],
  ["UA", "Ukraine"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["VN", "Vietnam"],
] as const

/**
 * Convert a region code (e.g. "TZ") into its flag emoji.
 * Works by splitting the alpha-2 code into two letters and offsetting each
 * char to the regional indicator symbol range (U+1F1E6–U+1F1FF).
 */
function codeToFlag(code: string): string {
  if (code.length !== 2) return "🏳️"
  const base = 0x1f1e6 // 'A' regional indicator
  const A = 0x41 // 'A' ASCII
  const chars = code
    .toUpperCase()
    .split("")
    .map((c) => {
      const cp = c.charCodeAt(0)
      if (cp < A || cp > A + 25) return ""
      return String.fromCodePoint(base + (cp - A))
    })
  return chars.join("") || "🏳️"
}

// ─── Final exported list (sorted alphabetically by name) ───────────────────
export const COUNTRIES: readonly Country[] = RAW_COUNTRIES.map(([code, name]) => ({
  code,
  name,
  flag: codeToFlag(code),
  allowed: ALLOWED_CODES.has(code),
})).sort((a, b) => a.name.localeCompare(b.name))

// ─── Convenience helpers ────────────────────────────────────────────────────

/** Countries currently allowed through the gate (launch: Tanzania + Kenya). */
export const ALLOWED_COUNTRIES: readonly Country[] = COUNTRIES.filter((c) => c.allowed)

/** Look up a country by its ISO alpha-2 code. Returns undefined if not found. */
export function findCountry(code: string): Country | undefined {
  const upper = code.toUpperCase()
  return COUNTRIES.find((c) => c.code === upper)
}

/** True if the given ISO alpha-2 code is allowed through the gate at launch. */
export function isCountryAllowed(code: string): boolean {
  return ALLOWED_CODES.has(code.toUpperCase())
}
