# Execom Brand & Design System

**Version 1.0** | Last updated: March 2026

---

## Contents

1. Design Philosophy
2. Logo Usage
3. Color System
4. Typography System
5. Layout System
6. Hero Section Standard
7. Standard Page Architecture
8. Navigation Guidelines
9. UI Components
10. Service Page Pattern
11. Diagram Style
12. Diagram Example Pattern
13. Photography & Imagery
14. Writing Tone & Voice
15. Anti-Patterns
16. Implementation Reference
17. Brand Integrity Rule

---

## 1. Design Philosophy

Execom is a strategy and capital advisory firm. The visual identity must communicate the same qualities the firm delivers to its clients: clarity, authority, and precision.

The design system is governed by three principles.

**Typography-driven hierarchy.** The design relies on type and whitespace to create structure, not decorative graphics, illustrations, or heavy color usage. Headlines carry weight. Body text breathes. Spacing is deliberate. If a layout feels empty, it is working correctly.

**Restrained color.** Color is an instrument of emphasis, not decoration. Most surfaces should feel neutral and calm. When color appears, it should mean something -- a primary action, a structural line in a diagram, a navigational cue. Pages should never feel colorful.

**Institutional credibility.** Every design decision should pass a single test: does this look like it belongs on the website of a firm advising founders on capital structure and corporate architecture? If it looks like a SaaS landing page, a startup marketing site, or a consumer product, it has failed.

The visual references for this system are McKinsey, Sequoia Capital, Benchmark Capital, Stripe's documentation design, and Notion's editorial layouts.

---

## 2. Logo Usage

The Execom logo is retained from the existing identity. It consists of a geometric "E" mark and the lowercase wordmark "execom."

### Logo color contexts

| Context | Mark color | Wordmark color |
|---|---|---|
| On light backgrounds (#F7F6EE, white) | #195E8E | #195E8E |
| On dark backgrounds (#195E8E, #1A1A1A) | #FFFFFF | #FFFFFF |
| Monochrome / print | #1A1A1A | #1A1A1A |

### Clear space

Maintain a minimum clear space around the logo equal to the height of the lowercase "e" in the wordmark on all sides.

### Minimum size

Full logo (mark + wordmark): never smaller than 120px wide on screen or 30mm in print. Mark alone: never smaller than 32px / 8mm.

### Prohibited usage

Do not rotate, skew, stretch, or recolor the logo outside approved contexts. Do not place on busy backgrounds. No drop shadows, gradients, or outlines. Do not animate.

**Critical departure from previous brand board:** The geometric "E" mark may appear in signature cyan (#50C4D2) when used as a standalone brand accent. The full logo (mark + wordmark) should normally appear in deep institutional blue (#195E8E) or white.

---

## 3. Color System

The palette is intentionally restrained. Most of what a visitor sees should be off-white, dark text, and blue used for structural emphasis. Gold appears rarely and deliberately.

### Primary palette

**Deep Institutional Blue**
- Hex: `#195E8E`
- RGB: 25, 94, 142
- Usage: Primary headings, navigation highlights, diagram structural lines, key UI elements, primary buttons, the logo.
- Notes: The single most important color in the system.

**Refined Gold**
- Hex: `#FFC342`
- RGB: 255, 195, 66
- Usage: Call-to-action buttons (sparingly), subtle highlights within diagrams, occasional emphasis markers.
- Notes: Must be used with extreme restraint. A page with more than two gold elements is overusing it.

**Soft Gold**
- Hex: `#FFE3B3`
- RGB: 255, 227, 179
- Usage: Hover states on gold elements, subtle section background tints (rare), table row alternation.

### Brand Accent

**Signature Cyan**
- Hex: `#50C4D2`
- RGB: 80, 196, 210
- Usage: Logo mark accent, occasional diagram emphasis, rare interactive highlight.
- Notes: Cyan is a legacy Execom identity color and should appear sparingly. It exists to create visual distinction from traditional consulting firms, not to dominate the interface.

Cyan must never exceed 1--2% of page surface area.

### Neutral palette

**Warm Off-White (Page Background)**
- Hex: `#F7F6EE`
- Usage: Primary page background across all surfaces. Avoid pure white for page backgrounds.

**Dark Text**
- Hex: `#1A1A1A`
- Usage: All primary body text, headlines, essential content.

**Subtext Grey**
- Hex: `#5A5A5A`
- Usage: Secondary text, captions, metadata, timestamps, micro-labels when not using blue.

**Divider Grey**
- Hex: `#E5E5E5`
- Usage: Horizontal rules, card borders, table dividers, separator lines.

### Removed colors

Cyan (#50C4D2) remains reserved for the Execom logo mark and rare accent usage. It must not be used as a background color, section color, or UI primary.

No bright, saturated, or neon colors are permitted.

### Color ratios

| Color | Approximate surface area |
|---|---|
| Off-white (#F7F6EE) | 70--80% |
| Dark text (#1A1A1A) | 10--15% |
| Blue (#195E8E) | 5--10% |
| Cyan (#50C4D2) | < 1--2% |
| Gold (#FFC342) | < 2% |
| Soft gold (#FFE3B3) | < 3% |

If a page screenshot feels "colorful," something is wrong.

---

## 4. Typography System

### Font stack

| Role | Preferred font | Fallback | Weight range |
|---|---|---|---|
| Headlines | Tiempos Headline | Playfair Display | 400, 700 |
| Body text | Inter | system-ui, sans-serif | 400, 500, 600 |
| Micro-labels | Inter | system-ui, sans-serif | 500, 600 |
| Code / data | JetBrains Mono | Menlo, monospace | 400 |

**Departure:** Cambria and Open Sans are retired. Cambria lacks editorial sharpness. Open Sans is ubiquitous and generic.

### Type scale

| Element | Font | Size | Weight | Line height | Color |
|---|---|---|---|---|---|
| Hero headline | Tiempos/Playfair | 56--72px | 400 | 1.1 | #1A1A1A |
| Section headline (H2) | Tiempos/Playfair | 36--44px | 400 | 1.2 | #1A1A1A |
| Subsection headline (H3) | Inter | 24--28px | 600 | 1.3 | #1A1A1A |
| Body text | Inter | 17--18px | 400 | 1.65 | #1A1A1A |
| Body text (secondary) | Inter | 15--16px | 400 | 1.6 | #5A5A5A |
| Micro-label | Inter | 12--13px | 600 | 1.4 | #195E8E |
| Navigation | Inter | 14--15px | 500 | 1.0 | #1A1A1A |
| Button text | Inter | 14--15px | 600 | 1.0 | varies |

### Headline style

Headlines must be statements, not descriptions. Two lines maximum on desktop. 10--14 words preferred.

### Micro-labels

Small uppercase labels placed above sections. Inter, 12--13px, weight 600, letter-spacing 0.08em, uppercase, color #195E8E. Sits 12--16px above its associated headline.

### Paragraph discipline

Body paragraphs must not exceed 3--4 lines at 640--720px column width. Break longer paragraphs into two.

---

## 5. Layout System

### Content width

| Element | Width |
|---|---|
| Primary text column | 640--720px |
| Maximum page width | 1200--1280px |
| Diagram / figure width | Up to 960px |
| Hero headline max width | 720px |
| Maximum paragraph width | 720px |

### Vertical spacing

| Between... | Spacing |
|---|---|
| Major sections | 100--140px |
| Subsections within a section | 60--80px |
| Headline and body text | 20--28px |
| Paragraphs | 24--32px |
| Micro-label and headline | 12--16px |

### Responsive behavior

Below 768px, all content collapses to single column. 16--24px side padding on mobile. Hero headlines never below 28px. Section headlines never below 24px.

---

## 6. Hero Section Standard

Hero structure:

```
MICRO-LABEL

Headline statement.
Second line of headline (if needed).

Supporting paragraph -- one to two sentences maximum.

[Primary CTA]    [Secondary CTA (optional)]
```

Rules:
- Two lines maximum for headlines.
- Supporting paragraph: two sentences maximum.
- Plain background (#F7F6EE). No gradients, images, or decorative elements.
- Typography and spacing are the only visual elements.

---

## 7. Standard Page Architecture

```
1. Hero statement
2. Concept explanation
3. Framework or diagram
4. Advisory areas
5. Case references or examples
6. Closing call to action
```

Each section communicates one idea only. Sections separated by 100--140px whitespace.

---

## 8. Navigation Guidelines

Flat list of top-level pages. No mega-menus.

- Bar height: 56--64px
- Background: #F7F6EE or #FFFFFF with 1px #E5E5E5 bottom border
- Text: Inter, 14--15px, weight 500, color #1A1A1A
- Active/hover: color shifts to #195E8E. No underlines, no background highlights.
- Fixed on scroll with subtle shadow after hero.
- Mobile: hamburger opens full-screen overlay with vertically stacked links.

---

## 9. UI Components

### Buttons

**Primary:** background #195E8E, color #FFFFFF, Inter 14px weight 600, padding 12px 28px, border-radius 5px. Hover: #144D75.

**Secondary (outline):** transparent background, #195E8E text and 1.5px border, border-radius 5px. Hover: fills blue.

**Gold accent (rare):** background #FFC342, color #1A1A1A. Reserve for single most important CTA if emphasis beyond blue is needed.

Rules: No border-radius > 6px. No shadows. No gradients. Max two CTAs per section.

### Cards

background #FFFFFF, border 1px solid #E5E5E5, border-radius 6px, padding 32px. Subtle hover shadow only.

### Form inputs

border 1.5px solid #E5E5E5, border-radius 4px, padding 12px 16px, Inter 15px. Focus: border-color #195E8E with subtle ring.

---

## 10. Service Page Pattern

```
1. Hero statement
2. Problem framing
3. Structural framework
4. Example scenario
5. When companies engage Execom
6. Call to action
```

Do not use feature lists or icon grids. Use prose, structured text blocks, or diagrams.

---

## 11. Diagram Style

- Lines: 1.5--2px stroke, color #195E8E
- Shapes: Rectangles and circles only. Corner radius 2--4px max.
- Fills: #FFFFFF (primary), #195E8E (emphasis), #FFC342 (accent, one per diagram max), #F7F6EE (secondary)
- Text: Inter, 12--14px, weight 500--600
- Connectors: Straight lines or right-angle only. Small arrow heads (6--8px).
- No iconography. Geometric shapes and text only.
- Cyan (#50C4D2) may be used to highlight a single node when distinguishing the Execom framework from a traditional approach.
- Max 5--7 elements per diagram.
- Export as SVG.

---

## 12. Photography & Imagery

Use sparingly. Permitted: architectural photography, abstract geometric, aerial views, editorial-style portraits. Prohibited: stock photography, illustrations, AI-generated imagery, cliche business imagery.

---

## 13. Writing Tone & Voice

Precise, intelligent, understated. Written for a founder-level audience.

Prefer short, declarative sentences. No exclamation marks.

**Avoid:** unlock, leverage, revolutionary, game-changing, cutting-edge, solution, massive, empower, synergy

**Prefer:** structure, apply, substantial, precise, framework, rigorous, advise, alignment, material difference

Headlines are statements, not descriptions.

---

## 14. Anti-Patterns

Prohibited:
- Gradient backgrounds
- Pill-shaped buttons (border-radius > 6px)
- Emoji in UI or body text
- Icon grids
- Animated counters
- Parallax scrolling
- Hero images with text overlay
- Floating UI elements (chat widgets, floating CTAs)
- Decorative SVG waves or blobs
- Entrance animations > 200ms
- Testimonial carousels
- "Trusted by" logo bars
- Feature comparison tables with checkmarks
- Blog posts with stock header images

---

## 15. Implementation Reference

```css
:root {
  --color-primary: #195E8E;
  --color-primary-dark: #144D75;
  --color-gold: #FFC342;
  --color-gold-soft: #FFE3B3;
  --color-cyan: #50C4D2;
  --color-bg: #F7F6EE;
  --color-surface: #FFFFFF;
  --color-text: #1A1A1A;
  --color-text-secondary: #5A5A5A;
  --color-border: #E5E5E5;

  --font-headline: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', Menlo, monospace;

  --space-section: 120px;
  --space-subsection: 72px;
  --space-element: 32px;
  --space-paragraph: 28px;

  --width-text: 680px;
  --width-content: 960px;
  --width-page: 1240px;

  --radius-sm: 4px;
  --radius-md: 6px;
}
```

Font loading:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

---

## 16. Brand Integrity Rule

**If the element would be common on a SaaS marketing website, it likely does not belong on the Execom site.**

When in doubt: remove decorative elements, increase whitespace, let typography carry the hierarchy.

The Execom site should feel closer to a well-typeset research publication than to a software company's landing page. If a design feels "too quiet," it is probably correct. If a design feels "exciting" or "dynamic," it has almost certainly drifted from the brand.

The most important rule in this document is restraint.
