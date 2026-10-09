# Unread Catchup — Design Specification

> **Precedence**: GEMINI.md always wins over this file. Where they conflict, follow GEMINI.md.

---

## 0. Design Intent

Dark, flat product UI. Near-black canvas with slightly lighter panels, 1px borders for structure. Large left-aligned heading, pill-shaped tabs and chips, a large rounded input card as the main focus, a small floating panel docked bottom-right. Muted grey secondary text, bright text only for active items.

Visual reference: Shipr (look and feel only — not features, branding, sidebar, chat agent, orb, or copy).

---

## 1. Hard Rules

- **No gradients anywhere.** No linear, radial, conic or mesh gradients, no gradient text, no gradient borders, no shimmer. Solid colours only.
- No box shadows, glows, blur, backdrop filters or glassmorphism. Depth is shown with a lighter surface colour and a 1px border.
- No images, no illustrations, no emoji. Icons are inline SVG only.
- No inline `style` attributes and no inline scripts (the CSP forbids them).
- No looping animation: no spinners, no shimmer, no pulsing. Loading is shown with static blocks, text and a determinate progress bar.
- No all-caps labels. Sentence case everywhere.
- No exclamation marks, no arrows appended to button text.
- Colour is never the only signal. Urgency always has a text label and an icon.

---

## 2. Colour Tokens

Dark is the primary design. Light is supported. Default follows system preference, with a manual toggle.

### 2.1 Dark (`:root` default)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#111110` | Page background |
| `--surface` | `#181817` | Top bar, side nav, floating panel |
| `--card` | `#1C1C1A` | Cards, input card |
| `--card-raised` | `#242422` | Hover state, skeleton blocks, chips on hover |
| `--border` | `#2E2E2B` | Default 1px border |
| `--border-strong` | `#44443F` | Hover border, panel border, selected tab border |
| `--ink` | `#F0EFEB` | Primary text, active nav item |
| `--ink-muted` | `#A3A39C` | Secondary text |
| `--ink-faint` | `#8F8F88` | Captions, placeholders (≥ 4.5:1) |
| `--accent` | `#2D9B9B` | Primary button fill, links, focus ring, active indicator |
| `--on-accent` | `#0A1A1A` | Text on the accent fill |
| `--accent-soft` | `#1A3535` | Highlighted source message, drag-over, count badges |
| `--high-fg` | `#FF8A80` | High urgency badge text |
| `--high-bg` | `#2A1716` | High urgency badge background |
| `--medium-fg` | `#F2B84B` | Medium urgency badge text |
| `--medium-bg` | `#2A2212` | Medium urgency badge background |
| `--low-fg` | `#7FC4A8` | Low urgency badge text |
| `--low-bg` | `#14241E` | Low urgency badge background |

### 2.2 Light (`:root[data-theme="light"]` and `@media (prefers-color-scheme: light)` when no saved choice)

| Token | Hex |
|---|---|
| `--bg` | `#F7F7F5` |
| `--surface` | `#FFFFFF` |
| `--card` | `#FFFFFF` |
| `--card-raised` | `#F0F0EC` |
| `--border` | `#E3E3DE` |
| `--border-strong` | `#C9C9C2` |
| `--ink` | `#151514` |
| `--ink-muted` | `#5C5C56` |
| `--ink-faint` | `#6B6B64` |
| `--accent` | `#1F7A7A` |
| `--on-accent` | `#FFFFFF` |
| `--accent-soft` | `#E3F1F0` |
| `--high-fg` | `#B3261E` |
| `--high-bg` | `#FDECEA` |
| `--medium-fg` | `#8A5A00` |
| `--medium-bg` | `#FFF4DB` |
| `--low-fg` | `#1E6B4A` |
| `--low-bg` | `#E3F4EC` |

### 2.3 Colour use rules

- The accent appears only on: the primary button, text links, the focus ring, the active nav indicator, and the small status dot in the privacy badge. Never a large fill.
- Urgency colours appear only on small badges.
- Every text/background pair must pass WCAG AA (4.5:1 for text, 3:1 for icons and borders that carry meaning). Both themes required.

---

## 3. Typography

- One family: **Inter** (variable), self-hosted as woff2 in `/public/fonts`, `font-display: swap`, fallback: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. No external font requests.
- Two weights only: 400 and 600.

| Name | Size / line height | Weight | Use |
|---|---|---|---|
| Display | 32/38 on mobile, 44/50 from 640px | 600 | The one H1 per screen |
| Title | 20/28 | 600 | Section headings, card titles |
| Body | 16/24 | 400 | All paragraphs, message text |
| Small | 14/20 | 400 or 600 | Badges, captions, chips, timestamps |

- Body text is never below 16px. Small is for labels and captions only.
- Line length for prose: 60–75 characters (`max-w-[68ch]`).
- Letter spacing: -0.01em on Display, normal elsewhere. Sentence case everywhere.

---

## 4. Spacing, Radius, Borders

- 8px grid. Allowed steps: 8, 16, 24, 32, 48, 64, 96.
- Page padding: 16 mobile, 24 from 640px, 32 from 1024px.
- Space between cards: ≥ 24. Padding inside cards: 16 mobile, 24 from 640px.
- Radius: **16px** for cards, input card, panels, modals. **12px** for buttons, inputs, icon buttons. **Pill (9999px)** for chips, tabs, badges.
- Borders: 1px solid `--border`. Hover and panels use `--border-strong`.
- Minimum tap target: 44 × 44px.

---

## 5. Components

All built once in `src/components/ui/` and reused everywhere. No one-off styles.

### 5.1 Button

| Variant | Fill | Text | Border | Height |
|---|---|---|---|---|
| Primary | `--accent` | `--on-accent` | None | 44px |
| Secondary | Transparent | `--ink` | 1px `--border-strong` | 44px |
| Text link | None | `--accent` | None | auto |

- Weight 600, radius 12. Hover: one solid step lighter/darker — no effects.
- One primary button per screen.
- Icon button: 44 × 44, radius 12, transparent, hover `--card-raised`. Always has `aria-label`.
- Disabled: 50% opacity, `aria-disabled`, no hover change.
- Full-width on mobile for primary and secondary.

### 5.2 Chip

Pill, 1px `--border`, transparent, height 44, 16px icon, Small text. Hover: `--card-raised`. Used for "Try sample chat" and filters.

### 5.3 Tabs (segmented pills)

Pill tabs in a row. Selected: 1px `--ink` border, `--ink` text, weight 600. Unselected: no border, `--ink-muted` text. Use `role="tablist"`, arrow-key navigation, `aria-selected`.

### 5.4 Badge

Pill, height 28, 16px icon + Small label. Urgency: foreground on urgency background. Count badge: `--accent-soft` fill, `--accent` text.

> **Rule**: Urgency is always conveyed by both the icon shape and the label text. Never colour fill alone.

### 5.5 Card

`--card` fill, 1px `--border`, radius 16, no shadow. Interactive cards: `--border-strong` on hover and a visible focus ring.

### 5.6 Input Card

Large rounded card — `--card` fill, 1px `--border`, radius 16, padding 24. Contains the upload zone.

### 5.7 Upload Zone

Inside the input card, 1px dashed `--border-strong`, radius 12, min-height 192. Icon, one line of text, one line of hint. Drag-over: border `--accent`, fill `--accent-soft`. The entire zone is a button; responds to Enter and Space.

### 5.8 Collapsible Section

Native `<details>` or a button with `aria-expanded`. Title, count badge, chevron. Collapsed by default except Summary and Needs your attention. Content fades in 150–200ms.

### 5.9 Floating Panel (source message viewer)

See section 6.

### 5.10 Privacy Badge

Pill, 1px border, shield icon, text "Processed on your device. Nothing leaves this browser." plus a counter chip "Outbound requests: 0" with a small accent dot. Counter shows only requests to other origins and fetch/XHR/beacon calls after load. Reads 0 in a normal session. Never hard-coded.

### 5.11 Icons

One inline SVG set, 20px, stroke 1.5, round caps and joins, `currentColor`, `aria-hidden` unless the icon stands alone.

| Context | Icon |
|---|---|
| Upload zone | upload cloud |
| Privacy badge | shield |
| High urgency | triangle-alert |
| Medium urgency | clock |
| Low urgency | arrow-down |
| Section: Summary | list |
| Section: Needs attention | bell |
| Section: Decisions | check-circle |
| Section: Action items | clipboard-list |
| Section: Mentions | at-sign |
| Section: Timeline | clock |
| Section collapsed | chevron-right |
| Section expanded | chevron-down |
| Dark mode toggle | moon / sun |
| Help | circle-help |
| Close | x |
| Minimise | minus |

---

## 6. Screens

### Top Bar (all screens)

Height 64, `--surface` fill, 1px bottom border `--border`, content max-width 1120 centred.

- Left: 40px square logo mark (solid `--accent`, radius 12, "UC" in `--on-accent`), name "Unread Catchup" (Title, 600), caption "Local-first briefing" (Small, muted). Mobile: mark and name only.
- Right: Help icon button, theme toggle icon button.

### Landing

Container max-width 880, left-aligned, 96px above heading on desktop, 48 on mobile.

- H1 (Display): "What did I miss?"
- One line (Body, muted, max 60ch): "Get a briefing from a long chat. Everything is processed on your device."
- 32px gap, then the **input card** holding the upload zone.
- 24px below the card: a single chip "Try sample chat" with the caption "Uses fake demo data." (Small, faint) to its right.
- 48px gap, then the privacy badge. Nothing else on this screen.

### Parsing

Same layout as Landing. The input card shows the file name, a determinate progress bar (4px, solid `--accent` on `--card-raised`, pill radius) and the text "Reading messages". `aria-live="polite"`. No spinner. Three static skeleton blocks in `--card-raised` sized like result cards, no animation.

### Results — Desktop (≥ 1024px)

Two columns:

**Left side nav** (240px, `--surface` fill, 1px right border, sticky):
- Items: Summary, Needs your attention (count badge), Decisions, Action items, Mentions, Timeline.
- Active: `--ink` text, weight 600, `--accent-soft` fill, radius 12, 2px `--accent` left bar.
- Inactive: `--ink-muted`.
- Bottom: secondary buttons "Copy summary" and "Clear data".

**Main column** (max-width 720, 32px padding). Content in order:

1. Controls card: "Who are you?" select, "Last seen" date-time input, context line (Small, muted).
2. Summary: Title "Summary", 3–5 sentence TL;DR in Body.
3. Needs your attention: Title, count badge, filter tabs (All, High, Medium, Low). Top 5 attention cards, then secondary button "Show all".
   - Card layout: top row — urgency badge (left), time (right, Small, faint). Message excerpt (Body, max 3 lines). Reason line (Small, muted). Text link "View in chat" in `--accent`. Whole card is clickable.
4. Decisions, Action items (owner and deadline as Small chips), Mentions, Timeline: collapsed by default.

### Results — Mobile and Tablet (< 1024px)

No side nav. Sticky horizontal pill-chip row under the top bar for section jumping (scrolls sideways inside its own container). "Copy summary" and "Clear data" at the end of the page and in the top bar overflow.

### Source Panel (floating panel)

- Desktop: bottom-right, 24px from edges, 420px wide, max-height 60% viewport, `--surface` fill, 1px `--border-strong`, radius 16.
- Header: 48px tall, title "Source message", minimise icon button, close icon button, 1px bottom border.
- Body: scrollable. 5 messages before and after, each with sender, time, text (plain text). Target message: `--accent-soft` fill, 2px `--accent` left bar.
- Mobile: bottom sheet, full width, radius 16 on top corners, max-height 70% viewport, solid `rgb(0 0 0 / 0.6)` scrim behind it. No blur.
- Non-modal on desktop. Esc closes it and returns focus. `role="dialog"` with `aria-label`.
- Open animation: fade + 8px slide, 150–200ms. Nothing else.

### Empty State

Same layout as Results. Card with icon, title "No unread messages", line "Nothing new since your last seen time. Try an earlier time." secondary button "Change last seen".

### Error State

Same layout as Landing. Card with alert icon, plain title "We could not read that file", specific reason "Only WhatsApp .txt exports up to 5 MB are supported.", primary button "Choose another file". `role="alert"`. Calm, not alarming.

### Help Modal

Centred, max-width 480, same style as floating panel, solid scrim. Contents: how to export a WhatsApp chat (iOS and Android, without media), and what stays on the device. Focus trapped while open. Esc closes it. No external links.

---

## 7. Motion

- Motion only in response to a user action: opening the panel, expanding a section, copying, changing tab.
- Allowed: opacity and 8px translate, 150–200ms, ease-out. Hover colour changes: 150ms.
- No entrance animations on page load, no scroll reveals, no parallax, no looping.
- Under `prefers-reduced-motion: reduce`: disable everything.

---

## 8. Copy

Short, plain sentences, sentence case, verbs on buttons.

| Where | Text |
|---|---|
| H1 | What did I miss? |
| Subtext | Get a briefing from a long chat. Everything is processed on your device. |
| Upload zone | Drop your WhatsApp .txt export here, or browse |
| Upload hint | iOS and Android exports, up to 5 MB. |
| Sample chip | Try sample chat |
| Sample caption | Uses fake demo data. |
| Privacy | Processed on your device. Nothing leaves this browser. |
| Counter | Outbound requests: 0 |
| Parsing | Reading messages |
| Urgency labels | High, Medium, Low |
| Actions | Copy summary, Clear data, Show all, View in chat |
| Copy toast | Summary copied. |
| Clear toast | Data cleared. |

---

## 9. Accessibility

- One H1 per screen. Landmarks: `<header>`, `<nav>`, `<main>`, `<aside>` for source panel.
- Visible focus on every control: 2px solid `--accent` outline, 2px offset. Never removed.
- Full keyboard use. Tab order follows reading order. Tabs use arrow keys.
- `aria-live="polite"` for parsing status and toasts.
- Tap targets: minimum 44 × 44px. No horizontal page scroll from 320px up.
- `data-testid` attributes required on: `upload`, `sample-button`, `privacy-badge`, `network-counter`, `results`, `summary`, `attention-list`, `attention-item`, `filter-tab`, `show-all`, `source-panel`, `copy-summary`, `clear-data`, `theme-toggle`, `help-button`.

---

## 10. Implementation Notes

- Define tokens as CSS variables in `src/index.css`: dark under `:root`, light under `:root[data-theme="light"]` and `@media (prefers-color-scheme: light)` for no-saved-choice. Map them in Tailwind v4 `@theme` so classes like `bg-card` and `text-ink-muted` work.
- Check whether `tailwind.config.js` or the Tailwind Vite plugin is actually used; remove the unused one.
- Set theme before first paint using `/public/theme-init.js` (external script, no inline). Store only the theme choice.
- Build UI primitives first (Button, Chip, Tabs, Badge, Card, InputCard, Collapsible, Panel), then restyle each screen.
- Self-host Inter in `/public/fonts`. Preload only the 400 and 600 files.

---

## 11. Acceptance Checklist

- [ ] Search of `src/` and built CSS for `gradient`, `box-shadow`, `backdrop-filter`, `blur(` finds nothing.
- [ ] Search for `style=` in JSX finds nothing.
- [ ] No animation runs on page load. No spinner or shimmer.
- [ ] Both themes match the token tables; every pair passes AA.
- [ ] Landing contains only: top bar, H1, one line, input card, sample chip with caption, privacy badge.
- [ ] Network counter reads 0 on load and after loading sample chat.
- [ ] Urgency shows a label and an icon on every badge.
- [ ] Source panel works with keyboard, returns focus on close, highlights the right message.
- [ ] Screens checked at 360, 390, 768, 1024 and 1440px in light and dark.
- [ ] `npm test`, `npm run build`, `npm run audit`, `npm run lint` all pass. Lighthouse mobile ≥ 95 in all four categories.

---

## 12. Content Rules

- All demo data is labelled fake. No real names, handles, PR numbers or dates.
- Sample data uses names like "Alex (fake)", "Sam (fake)" and labels like "[FAKE]".
- No real people, companies or events referenced anywhere.

---

## 13. Stitch Screen References (for information only)

| # | Screen name | Device | Stitch screen ID |
|---|---|---|---|
| 1 | Landing | Mobile 390px | `4aeebca6d62f4ecf863e06748e28a239` |
| 2 | Landing | Desktop 1440px | `2d22ef8410ef4beea325c4ed81230d28` |
| 3 | Parsing / Loading | Mobile 390px | `271df46992d3486dac3f5440f1eb3200` |
| 4 | Results Briefing | Mobile 390px | `9660c09bbb294f4d9c62b625356881c2` |
| 5 | Results Briefing | Desktop 1440px | `a38ffc09487140cea26dee98be4ef729` |
| 6 | Empty & Error States | Mobile 390px | `ae935bc396cb4b83b96bdda63bd4d6b9` |
| 7 | Results Briefing (Dark) | Desktop 1440px | `c23fcf8a49dd46119c355e54c19d49cc` |

These Stitch screens predate this spec. Where they conflict with section 1–11 above, this spec wins.
