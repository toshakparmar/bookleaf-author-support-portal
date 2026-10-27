# BookLeaf Portal — Frontend Design System & UX Architecture

> **Design Direction:** *Editorial Publishing House* — Where traditional craftsmanship meets a modern, data-dense operations console.

---

## 1. Visual Identity & Design Principles

BookLeaf Publishing is a premier self-publishing company processing 1,200+ titles monthly across India and the US. The visual redesign moves completely away from generic, "AI-generated" templates (neon gradients, excessive glassmorphism, rounded-2xl blobs, and centered marketing copy) in favor of a cohesive, human, publishing-native aesthetic:

1. **Editorial Restraint & Typography Hierarchy:** Headings are typeset in **Fraunces** (soft optical-size variable serif), UI and body copy in **Plus Jakarta Sans**, and all identifiers, ISBNs, timestamps, and financial figures in **JetBrains Mono** with `tabular-nums`.
2. **Warm Tactile Surfaces:** Author interfaces use warm paper tones (`#F7F3EA`), hairline rules (`1px` borders at `#E4DDCC`), and a subtle CSS noise texture (`.paper-grain`) reflecting physical book pages.
3. **Data-Dense Utilitarian Admin Console:** Operations screens feature a compact 13–14px typography scale, collapsible navigation sidebar, ⌘K command palette, and immediate visual flags for breached SLAs.
4. **Motion with Purpose:** Animations strictly serve user orientation, status transitions, and data comprehension. Every animation checks `prefers-reduced-motion` via `useReducedMotionSafe`.

---

## 2. Color Tokens & Semantic Mapping

All colors are defined as CSS variables in `app/globals.css` and mapped into Tailwind tokens:

### Base Surfaces & Brand Accents
| Token | Light Theme (Paper & Ink) | Dark Theme (Night Parchment) | Usage |
|---|---|---|---|
| `--background` | `hsl(43 38% 94%)` (`#F7F3EA`) | `hsl(144 14% 6%)` (`#0F1411`) | Root workspace surface |
| `--card` | `hsl(45 100% 99%)` (`#FFFDF8`) | `hsl(137 14% 10%)` (`#161D18`) | Card and panel containers |
| `--foreground` | `hsl(40 7% 10%)` (`#1B1A17`) | `hsl(45 26% 89%)` (`#ECE8DC`) | Editorial typography |
| `--border` | `hsl(42 26% 85%)` (`#E4DDCC`) | `hsl(142 11% 17%)` (`#26302A`) | Hairline rules (1px) |
| `--primary` | `hsl(160 51% 25%)` (`#1F5F4A`) | `hsl(156 43% 56%)` (`#5FBF99`) | BookLeaf leaf-green brand |
| `--accent` | `hsl(41 76% 51%)` (`#E0A526`) | `hsl(42 78% 60%)` (`#E8B84A`) | Saffron accent (rollovers/pending) |

### Semantic Badges (WCAG AA Contrast ≥ 4.5:1)
- **Priority:** Critical (`#C8453A`) · High (`#D98E04`) · Medium (`#3E6FA8`) · Low (`#6B8F7A`). Rendered as a vertical color bar + mono label chip in tables.
- **Status:** Open (`#3E6FA8`) · In Progress (`#D98E04`) · Resolved (`#1F8A5B`) · Closed (`#7A766B`). Rendered with hairline borders and an indicator dot.
- **Category:** Quiet monochrome tag style with category-specific Lucide icons (`Coins`, `Barcode`, `Printer`, `Globe2`, `BookOpen`, `HelpCircle`), avoiding distracting multi-colored tags.

---

## 3. Motion System (`lib/motion.ts` & `lib/gsap.ts`)

- **Timing Constants:**
  - Micro: `150ms` (hover, button clicks, spark bursts)
  - Standard: `300ms` (panel transitions, list staggers, error shakes)
  - Emphasis: `750ms` (CountUp, Stepper progress lines)
- **Easings:**
  - Entrance: `power3.out`
  - Transitions: `power2.inOut`
  - Interactive Pop: `back.out(1.4)`
- **Accessibility Safeguard:** `useReducedMotionSafe()` automatically detects `(prefers-reduced-motion: reduce)`. When active, all GSAP tweens instantly set target values without movement or layout shifts.

---

## 4. Component Architecture & React Bits / GSAP Map

| Component | Library / Engine | Location | Purpose & Implementation |
|---|---|---|---|
| **SplitText** | GSAP (`@gsap/react`) | `components/reactbits/SplitText.tsx` | Staggered character entrance for Fraunces headline on login screen. |
| **AtmosphericBackground** | HTML5 Canvas / 2D Context | `components/reactbits/AtmosphericBackground.tsx` | Lazy-loaded silk threads animation on login brand panel tinted to leaf-green and saffron. |
| **CountUp** | GSAP Tweens | `components/reactbits/CountUp.tsx` | Tabular numeral counter for monetary figures (₹), book counts, and dashboard stats. |
| **SpotlightCard** | React Bits | `components/reactbits/SpotlightCard.tsx` | Mouse-following radial illumination on book cards with genre-coded spine edges. |
| **ProductionStepper** | GSAP Line Draw | `components/shared/ProductionStepper.tsx` | 9-stage book publishing stepper with animated progress line to current stage. |
| **ShinyText** | CSS Gradient Shimmer | `components/reactbits/ShinyText.tsx` | Elegant, non-distracting shimmer animation during AI response synthesis. |
| **ClickSpark** | Canvas / DOM particles | `components/reactbits/ClickSpark.tsx` | Micro-burst celebration on successful ticket creation. |
| **CommandPalette** | `cmdk` | `components/admin/CommandPalette.tsx` | ⌘K quick jump palette for tickets, assignee filters, and theme toggling. |
| **AdminSidebar** | Radix / Custom | `components/admin/AdminSidebar.tsx` | Collapsible operations drawer with live breached SLA counter badges. |
| **AuthorNav & TopBar** | Lucide / Custom | `components/author/AuthorNav.tsx` | Editorial slim top bar with Fraunces logo and handcrafted SVG leaf glyph. |

---

## 5. Screen-by-Screen Redesign Highlights

### 5.1 Login (`/login`)
- **Before:** Generic centered dark box with harsh blue/emerald shadows and full-page inputs.
- **After:** Editorial split layout. Left panel features deep leaf-green background, silk thread atmospheric motion, Fraunces serif headline animated via `SplitText`, and trust stats using `CountUp`. Right card features hairline rules, show/hide password toggle, GSAP error shake on failure, and a collapsible 1-click demo switcher.

### 5.2 Author Catalog (`/author/books`)
- **Before:** Repetitive grid of heavy cards with raw tables and no visual hierarchy.
- **After:** Fraunces page title, summary strip with live `CountUp` and a stacked progress bar showing paid vs pending royalties. Each book card features a left spine accent colored by genre, status badges, tabular mono metrics, platform distribution chips, and the 9-stage `ProductionStepper` for in-production titles.

### 5.3 Author New Query (`/author/tickets/new`)
- **Before:** Single-column long form with basic file input.
- **After:** Two-column layout with left form and sticky "Before You Submit" guidance panel. Features drag-and-drop file upload via `react-dropzone`, character countdowns, and a confirmation view with `ClickSpark` micro-burst.

### 5.4 Author Thread (`/author/tickets/[id]`)
- **Before:** Flat unstyled list of text blocks.
- **After:** Chat-style conversation thread with day separators. Author messages appear in tinted paper bubbles on the right; BookLeaf Support messages appear on the left with brand avatars and "Team BookLeaf" signatures. Sticky composer at bottom for follow-ups.

### 5.5 Admin Queue (`/admin/tickets`)
- **Before:** Unstyled wide table with no visual SLA distinction.
- **After:** Stat cards with `CountUp` (including a prominent terracotta Breached SLA card), sticky multi-select filter bar, vertical color bar priority badges, Lucide category tags, and live arrival banners when new queries arrive via SSE.

### 5.6 Admin Ticket Detail (`/admin/tickets/[id]`)
- **Before:** Crowded single screen with raw JSON and generic textareas.
- **After:** 2-column workspace (7 cols left, 5 cols right). Left pane houses the conversation thread, live database facts panel (author metadata and book financials in tabular mono), and audit timeline. Right pane features triage controls, the AI Response Assistant with editable draft textarea and verification flags, and an internal staff notes panel with amber parchment styling.

---

## 6. Audit & Evidence

Before and after screenshots are preserved in the repository:
- **Before Screenshots:** `docs/design/before/` (10 screenshots at 1440px and 375px)
- **After Screenshots:** `docs/design/after/` (11 screenshots at 1440px, 375px, and dark mode)
