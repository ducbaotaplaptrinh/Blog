---
name: redesign-existing-projects
description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.
---

# Redesign Skill

## How This Works

When applied to an existing project, follow this sequence:

1. **Scan** — Read the codebase. Identify the framework, styling method (Tailwind, vanilla CSS, styled-components, etc.), and current design patterns.
2. **Diagnose** — Run through the audit below. List every generic pattern, weak point, and missing state you find.
3. **Fix** — Apply targeted upgrades working with the existing stack. Do not rewrite from scratch. Improve what's there.

## Design Audit

### Typography
- **Browser default fonts or Inter everywhere.** Replace with a font that has character. For editorial/creative projects, pair a serif header with a sans-serif body.
- **Headlines lack presence.** Increase size for display text, tighten letter-spacing, reduce line-height.
- **Body text too wide.** Limit paragraph width to roughly 65-75 characters. Increase line-height for readability.
- **Missing subtle hierarchy.** Introduce Medium (500) and SemiBold (600) weights.
- **Missing letter-spacing adjustments.** Use negative tracking for large headers, positive tracking for small caps or labels.
- **Orphaned words.** Fix with `text-wrap: balance` or `text-wrap: pretty`.

### Color and Surfaces
- **Pure `#000000` background.** Replace with off-black, dark charcoal, or tinted dark (`#0a0a0a`, `#0f172a`, or `#121212`).
- **Oversaturated accent colors.** Keep saturation below 80%. Desaturate accents so they blend with neutrals.
- **More than one accent color.** Pick one. Remove the rest. Consistency beats variety.
- **Mixing warm and cool grays.** Stick to one gray family.
- **Purple/blue "AI gradient" aesthetic.** Replace with neutral bases and a single, considered accent.
- **Generic box-shadow.** Tint shadows to match background. Use subtle shadows instead of harsh black drops.
- **Card Overload.** Do not wrap every piece of content in a border-radius box with border and shadow. Let typography and layout create structure.
- **Inconsistent lighting direction.** Consistent light source.

### Layout
- **Everything centered and symmetrical.** Break symmetry with offset margins, asymmetric grid, horizontal scroll, or editorial rhythm.
- **Three equal card columns as feature row.** This is the most generic AI layout. Replace with varied hierarchy (e.g. 1 major feature + list of secondary stories).
- **Missing whitespace.** Double the spacing. Let the design breathe.
- **Uniform border-radius on everything.** Vary the radius or use sharp/crisp editorial corners.
