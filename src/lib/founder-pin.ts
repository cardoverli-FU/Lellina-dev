// ════════════════════════════════════════════════════════════════════
//  Lellina — Founder Pin Helper (Phase 4.4)
//  Sorts profiles so the founder (isFounder=true) is always first.
// ════════════════════════════════════════════════════════════════════

/**
 * Moves the founder profile to the front of the array.
 * If no founder exists, returns the array unchanged.
 * Stable — preserves the existing order of all other profiles.
 */
export function pinFounderFirst<T extends { isFounder?: boolean }>(profiles: T[]): T[] {
  const founder = profiles.find((p) => p.isFounder)
  if (!founder) return profiles
  return [founder, ...profiles.filter((p) => p !== founder)]
}
