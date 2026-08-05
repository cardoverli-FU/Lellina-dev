# Lellina — CONTRAST RULE (HARD RULE, NON-NEGOTIABLE)

> **READ THIS BEFORE WRITING ANY UI CODE.**
> **This is the most broken rule in the project. It MUST be followed on EVERY component, EVERY page, EVERY theme.**
> Violating this rule = broken UI = users cannot see text, buttons, or icons = app looks unfinished = users leave.

---

## ⚠️ WHY THIS EXISTS

Phase 4A shipped with **invisible text and invisible icons** on both light and dark themes. Real examples from production:

1. **Light theme** — body text was light pink on a light pink background. Users could not read the landing page. Text was "swallowed" by the background.
2. **Dark theme** — the filter panel close button (X) was black on a dark rose background. Users could not close the filter panel. They were trapped.
3. **Dark theme** — pass buttons on profile cards used `text-cream/60` (40% transparent) on a dark background. Icons were nearly invisible.
4. **Root cause** — `tailwind.config.ts` wrapped CSS vars in `hsl(var(--x))` but the vars were HEX values. `hsl(#F7F4EF)` is invalid CSS. This broke **every** shadcn semantic color (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.) across the entire app.

This rule exists so this **never happens again**.

---

## THE RULE (memorize this)

### On a DARK / DEEP background → use LIGHT / BRIGHT text. NEVER dark text.

**Dark / deep backgrounds** (use bright text on these):
- `bg-hero-dark`
- `bg-section-dark`
- `bg-soft-charcoal`
- `bg-warm-rose` (solid deep rose — NOT the light tints)
- `bg-warm-rose-dark`
- `bg-cream/5`, `bg-cream/10` (translucent overlays on dark)
- Any background with `bg-*/10`, `bg-*/20` on a dark base

**MUST use bright text** (on dark backgrounds):
- `text-cream`
- `text-white`
- `text-gold-light`
- `text-warm-rose-light`
- `text-cream/80` (80%+ opacity is OK for secondary text)
- `text-cream/65` (65% is the MINIMUM for body text on dark — never lower)

**NEVER use dark text on dark backgrounds** (these are INVISIBLE):
- ❌ `text-soft-charcoal`
- ❌ `text-warm-rose-dark`
- ❌ `text-gold-deep`
- ❌ `text-espresso`
- ❌ `text-sage-deep`
- ❌ `text-sage-dark`
- ❌ `text-cream/40` for body text (only OK for placeholder/hint text)
- ❌ `text-cream/35` for body text (placeholder only)
- ❌ `text-cream/30` or lower (placeholder only)

---

### On a LIGHT / CREAM background → use DARK text. NEVER light text.

**Light backgrounds** (use dark text on these):
- `bg-cream`
- `bg-blush-subtle`
- `bg-blush-light`
- `bg-cream/95`
- Any light tint of rose/gold/sage

**MUST use dark text** (on light backgrounds):
- `text-soft-charcoal`
- `text-espresso`
- `text-warm-rose-dark`
- `text-gold-deep`
- `text-sage-deep`
- `text-soft-charcoal/80` (secondary text)
- `text-soft-charcoal/60` (MINIMUM for body text on light)

**NEVER use light text on light backgrounds** (these are INVISIBLE):
- ❌ `text-cream`
- ❌ `text-white`
- ❌ `text-warm-rose-light` (unless on a dark accent element)
- ❌ `text-gold-light` (unless on a dark accent element)
- ❌ `text-cream/60` or lower

---

## THE GOLDEN TEST

**Before you ship ANY component, ask yourself:**

1. **Light theme**: Can a user with 20/20 vision read every word, see every icon, see every button — on the LIGHTEST possible background?
2. **Dark theme**: Can a user with 20/20 vision read every word, see every icon, see every button — on the DARKEST possible background?
3. **Interactive elements** (X buttons, close buttons, pass buttons, filter toggles, nav icons): Are they visible on BOTH themes? A close button that cannot be seen = a user trapped on that screen.
4. **Borders**: Are borders visible? `border-cream/10` on a dark bg = visible. `border-cream/10` on a light bg = invisible.
5. **Placeholders**: Placeholder text is allowed to be lower contrast (`text-cream/35` on dark, `text-soft-charcoal/40` on light) — but REAL text must always meet the minimums above.

**If you cannot answer YES to all 5 questions, the component is broken. Fix it before committing.**

---

## TECHNICAL RULES (Tailwind + shadcn)

### Rule 1: NEVER wrap HEX CSS vars in `hsl()`

```ts
// ❌ BROKEN — globals.css defines --background as #F7F4EF (hex)
// hsl(#F7F4EF) is invalid CSS and silently breaks the color
background: 'hsl(var(--background))'

// ✅ CORRECT — use the var directly
background: 'var(--background)'
```

If `tailwind.config.ts` has `'hsl(var(--x))'` anywhere, change it to `'var(--x)'`. This single bug broke the entire Phase 4A UI.

### Rule 2: Always define BOTH foreground and background tokens

Every `--background` MUST have a `--background-foreground`. Every `--primary` MUST have a `--primary-foreground`. Every `--destructive` MUST have a `--destructive-foreground`. If a foreground token is missing, shadcn falls back to `currentColor` or inherits a broken value — and text disappears.

### Rule 3: Test in BOTH light and dark mode

Lellina supports light + dark themes via `next-themes`. Every component MUST be tested in BOTH modes before commit. Open the page, toggle the theme, and look with your eyes. If you cannot see something, fix it.

### Rule 4: Use semantic color tokens, not raw values

```tsx
// ❌ BAD — raw hex, easy to mis-contrast
<div className="text-[#3D2B1F] bg-[#F7F4EF]">

// ✅ GOOD — semantic tokens, contrast is enforced by the token system
<div className="text-foreground bg-background">
```

### Rule 5: Interactive elements need EXTRA contrast

Close buttons (X), pass/skip buttons, filter toggles, nav icons — these are the #1 source of contrast bugs. They MUST be visible at a glance. If in doubt, use `text-cream` (on dark) or `text-soft-charcoal` (on light) at full opacity for interactive icons.

---

## ENFORCEMENT

- **Lint will not catch this.** Contrast is a visual problem, not a syntax problem.
- **Every PR / commit that touches UI MUST be browser-verified in BOTH themes.**
- **If a user reports "I can't see X" — that is a P0 bug. Stop everything and fix it.**
- **This rule is referenced in `features.md`, `phases.md`, `credentials-checklist.md`, and `FIXES.md`.** All agents MUST read this file before writing UI code.

---

## QUICK REFERENCE TABLE

| Background | Text color (primary) | Text color (secondary) | Text color (placeholder) | NEVER use |
|---|---|---|---|---|
| `bg-hero-dark` | `text-cream` | `text-cream/80` | `text-cream/40` | `text-soft-charcoal`, `text-espresso` |
| `bg-section-dark` | `text-cream` | `text-cream/80` | `text-cream/40` | `text-soft-charcoal`, `text-espresso` |
| `bg-soft-charcoal` | `text-cream` | `text-cream/80` | `text-cream/40` | `text-soft-charcoal` |
| `bg-warm-rose` (solid) | `text-cream` or `text-white` | `text-cream/85` | `text-cream/50` | `text-warm-rose-dark`, `text-soft-charcoal` |
| `bg-warm-rose-dark` | `text-cream` | `text-cream/85` | `text-cream/50` | `text-warm-rose-dark` |
| `bg-cream/5` on dark base | `text-cream` | `text-cream/70` | `text-cream/35` | `text-soft-charcoal` |
| `bg-cream` (light) | `text-soft-charcoal` | `text-soft-charcoal/70` | `text-soft-charcoal/40` | `text-cream`, `text-white` |
| `bg-blush-subtle` (light) | `text-soft-charcoal` | `text-warm-rose-dark` | `text-soft-charcoal/40` | `text-cream`, `text-white` |
| `bg-blush-light` (light) | `text-soft-charcoal` | `text-warm-rose-dark` | `text-soft-charcoal/40` | `text-cream`, `text-white` |

---

## THE ONE-LINE VERSION

> **Dark background → bright text. Light background → dark text. Interactive elements must be visible on BOTH themes. If you can't see it, the user can't either.**
