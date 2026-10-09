# Unread Catchup: Project Rules
Hackathon micro-app answering "What did I miss?" for long chats. Judged on UI/UX (highest weight), then function, privacy and security. Top-10 evaluation is by automated bot.

## Stack
- Vite + React + TypeScript (strict) + Tailwind CSS. Static build, no backend, deployable to Vercel.
- Minimal dependencies. Prefer zero extra runtime deps beyond react and react-dom. If date parsing needs a library, use only chrono-node, pinned to an exact version.
- No analytics, no CDN scripts, no external fonts. Self-host any fonts in /public as woff2.

## Local-first privacy
- No user data ever leaves the browser. No fetch/XHR/WebSocket/beacon calls to any host.
- Chat data lives in memory only. No localStorage/sessionStorage/IndexedDB of chat content. Provide a visible "Clear data" button.
- Header badge: "Processed on your device. Nothing leaves this browser." plus a live counter of network requests made after load, read honestly from PerformanceObserver (expected: 0).

## Security (non-negotiable)
- Never use dangerouslySetInnerHTML, innerHTML, eval, new Function, document.write. Render all chat text as plain text.
- Strict CSP delivered through vercel.json headers: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'. Also add X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer, Permissions-Policy denying camera/microphone/geolocation, Cross-Origin-Opener-Policy: same-origin. Avoid inline scripts and inline style attributes so the CSP needs no 'unsafe-inline'.
- File input: accept .txt only, max 5 MB, validate type and size before reading, cap message count, show friendly errors. Parse inside a Web Worker with a timeout.
- Regexes must be ReDoS-safe (no nested quantifiers or overlapping alternations). Test with adversarial inputs (very long lines, 100k repeated characters).
- Dependencies: commit package-lock.json, pin exact versions, no postinstall scripts, `npm audit --audit-level=high` must pass. No secrets, .env files or API keys anywhere. Disable production source maps.
- Add a SECURITY.md describing the threat model and the controls above.

## Clean UI rules
- Minimal: one primary action per screen. The landing screen has one headline, one short line of subtext, the upload zone, the "Try sample chat" button and the privacy badge. Nothing else.
- Palette: one neutral base, one ink colour, one accent used only for the primary button and focus rings. Urgency colours appear only on small badges, never as large fills.
- Type: one font family (self-hosted), at most 3 sizes in the body area, 2 weights. Line length 60 to 75 characters. Body text at least 16px.
- Spacing: 8px grid. At least 24px between cards and 16px padding inside them. No dense walls of text.
- Cards: one radius value, 1px subtle border, no heavy shadows, no gradients, no glassmorphism, no emoji as icons. One consistent inline SVG icon set.
- Hierarchy: the results page shows the TL;DR and "Needs your attention" first. Decisions, action items, mentions and timeline sit in collapsible sections, collapsed by default.
- Attention list shows the top 5 items with a "Show all" control. Urgency is shown by label AND icon, never colour alone.
- Motion: only fade and slide of 150 to 200ms, disabled under prefers-reduced-motion. No bouncing, parallax or looping animations.
- Copy: short, plain sentences. Buttons are verbs. No jargon, no exclamation marks.
- Loading, empty and error states use the same layout as the real screen, so nothing jumps.
- Reuse the same Button, Card, Badge and Section components everywhere. No one-off styles.
- Light and dark mode (system default plus a persistent toggle storing only the theme choice, no flash on load).
- Click a result to scroll to and highlight the source message. Include "Copy summary" and "Clear data" actions.

## Accessibility and quality
- WCAG AA contrast, semantic landmarks, one H1, visible focus, full keyboard use, aria-live for status, tap targets at least 44px.
- Add stable data-testid attributes on key controls and sections (upload, sample-button, results, attention-list).
- Targets: Lighthouse 95+ on Performance, Accessibility, Best Practices, SEO (mobile). No console errors or warnings. No layout shift.

## Content rules
- Never use real people or data. All demo data is clearly labelled fake.

## Workflow
- Plan first (short checklist), build, verify. Build only what the current phase asks. End each phase with: what was built, file list, assumptions, risks. Then STOP and wait for review.
