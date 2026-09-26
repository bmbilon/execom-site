# execom Brand & Design System

**Version 2.0** | Updated: September 2026 (marketing site revamp, "dark premium")

Version 1.0 (March 2026) described a light, ivory-first editorial system. The marketing site now runs on the dark premium system below. The portal (`/portal/*`) keeps its own light theme and is not covered here.

---

## 1. Direction

Deep navy surfaces, glass panels, cyan light. Institutional, precise, quietly dramatic. Typography carries the hierarchy; light and depth replace decoration.

Every page follows **cut + layer**: the visible layer is short (a title, a one or two sentence summary, one scannable element). Depth lives in collapsible layers that stay in the DOM for search engines. Nothing substantive is deleted; it is moved one click deeper.

## 2. Logo

- The full logo (`/public/execom-logo-full.png`, stacked mark + wordmark) renders white on dark surfaces.
- Do not rotate, skew, stretch, recolor outside approved contexts, or animate.
- The brand name is always lowercase in visible copy: **execom**. The legal entity "Execom Inc." is the only exception (support and legal copy).
- Uppercase labels (eyebrows, table headers) must not capitalize the brand. Wrap it with `brandCase()` from `components/site/brand.tsx`.

## 3. Color

Defined as CSS variables on `.site` in `app/globals.css`.

| Token | Value | Use |
|---|---|---|
| `--bg-1` | `#07111B` | Page background |
| `--bg-0` | `#04090F` | Footer, deepest surfaces |
| `--text-1` | `#EDF2F7` | Headlines, key text |
| `--text-2` | `#A7B6C6` | Body copy |
| `--text-3` | `#74889C` | Meta, captions (13px and up) |
| `--cyan` | `#50C4D2` | Signature accent, primary buttons, active states |
| `--cyan-hi` | `#8BDCE6` | Links and eyebrows on dark |
| `--navy` | `#195E8E` | Glows, gradients, structural light |
| `--gold` | `#FFC342` | "In progress" states only, rare |
| `--line` / `--line-2` | white at 7.5% / 12% | Hairlines, borders |

Tailwind helpers: `ink-*`, `snow`, `haze`, `fog`, `cyan-*`, `navy`.

Rules: cyan is light, not paint. Use it for one primary action per view, active states, and accents. No bright or saturated colors beyond the palette.

## 4. Typography

Self-hosted through `next/font/local` in `app/(marketing)/layout.tsx`.

| Role | Font | Notes |
|---|---|---|
| Display and section headlines | Newsreader (variable, optical size) | Weight 400, tight tracking, `text-wrap: balance` |
| Body and UI | Inter (variable) | 16px base, 1.7 line height for long copy |
| Eyebrows, labels, numbers | JetBrains Mono | 11–12px, uppercase, 0.14em tracking |

Headline accent: wrap one to three words in `*asterisks*` in content strings. They render as the cyan italic accent (`.s-accent`). One accent per headline.

Scale: `.s-display-xl` (home hero), `.s-display-lg` (page heroes), `.s-h2` (sections), `.s-h3`/`.s-h4` (sans subheads), `.s-lede`, `.s-body`, `.s-eyebrow`.

## 5. Layout

- Container: `.s-container` (1200px, 20px gutters on mobile, 32px from md).
- Sections: `.s-section` (72–128px vertical) and `.s-section-tight`.
- Long pages use a 5/7 split: sticky chapter header on the left, content blocks on the right.
- Everything collapses to one column below 1024px. No horizontal scroll at 390px wide.

## 6. Components (`components/site/`)

| Component | Purpose |
|---|---|
| `SiteHeader` | Fixed glass header, mega menu per practice area, mobile drawer, search (Cmd/Ctrl K or /) |
| `CommandPalette` | Search across pages, in-page sections, and actions |
| `SiteFooter` | Footer generated from `lib/site/nav.ts` |
| `PageHero` | Breadcrumbs, eyebrow, headline, lede, CTAs, optional aside |
| `InBrief` | Three-point takeaway card for hero asides |
| `ChapterBar` | Sticky in-page navigation with scroll-spy, progress line, "Expand all" |
| `Disclosure` | "Read the full argument" layers with reading time |
| `Accordion`, `Tabs`, `Matrix` | Collapsible lists, segmented content, comparison tables (mobile column switcher) |
| `CtaBand`, `InlineCta`, `NextSteps` | One closing CTA per page, at most one inline CTA, related pages |
| `advisory/AdvisoryPage` | Renders a long-form page from typed content data |

Surfaces: `.s-glass` (panels), `.s-edge` (gradient hairline card), `.s-spot` (cursor spotlight), `.s-atmo` + `.s-horizon` (hero atmosphere).

Buttons: `.s-btn` + `.s-btn-primary` (cyan, one per view) or `.s-btn-glass`; `.s-link` for inline arrows. Radius 8–12px.

## 7. Navigation and content data

- `lib/site/nav.ts` is the single source for the mega menu, drawer, footer, breadcrumbs, related pages, and search. Items without a live page carry `soon: true` and no `href`; they render as muted "Soon" rows, never as links.
- Long-form pages live in `lib/site/content/*.ts(x)` as `AdvisoryPageData` (see `components/site/advisory/types.ts`) and are registered in `lib/site/content/index.ts`, which also feeds section search.
- Content strings support `**bold**`, `*italic*`, and `[label](/href)`.

## 8. Motion

- Below-the-fold elements marked `data-reveal` fade up once when scrolled into view (`SiteEffects`).
- Hover: 1–2px lift, border brightening, cursor spotlight on cards.
- Collapsibles animate height with `grid-template-rows`.
- `prefers-reduced-motion` disables all of it.

## 9. Writing

- Precise, understated, founder-level. Short declarative sentences; vary rhythm.
- Never use em dashes. Use commas, colons, parentheses, or separate sentences. En dashes only for numeric ranges (15–30%).
- Sentence case for buttons, labels, and navigation chips.
- Avoid: unlock, leverage (as a verb), revolutionary, game-changing, cutting-edge, "It's not X, it's Y", "The reality is", "In today's landscape".
- Never invent figures or claims. Every number on the site must trace to the original copy or the portal.

## 10. Anti-patterns

- Walls of visible text. If a section runs past two short paragraphs, layer it.
- More than one closing CTA panel per page.
- Links to pages that do not exist (use `soon: true` instead).
- Light cards or white panels on the marketing site.
- Stock photography, AI imagery, decorative illustrations.
