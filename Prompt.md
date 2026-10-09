# Prompt.md — ProtocolX AI Prompt Log

> **Purpose**: Single source of truth for every AI prompt that shaped this project.
> Keep this file updated every time you issue a new significant prompt.
> Format: one entry per prompt session, newest at the top.

---

## How to update this file

1. After each meaningful AI session, add a new entry **at the top of the Log** (below this header section).
2. Use the template at the bottom of this file.
3. Commit `Prompt.md` alongside the code it produced:
   ```
   git add Prompt.md <changed files>
   git commit -m "prompt: <short description>"
   ```
4. Never delete old entries — they are the project's design history.

---

## Quick Reference: Binding Rules & Docs

| File | Role |
|------|------|
| [`GEMINI.md`](./GEMINI.md) | **Hard constraints** — stack, privacy, security, UI rules. Always wins. |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | Visual design spec — colour tokens, spacing, components. |
| [`SECURITY.md`](./SECURITY.md) | Threat model and security controls. |
| [`scripts/check-secrets.mjs`](./scripts/check-secrets.mjs) | Secret scanner (run via `npm run check:secrets`). |
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | CI: test → build → audit → secrets scan. |

---

## Prompt Log

---

### [P-009] Email OTP login — live and working
**Date**: 2026-10-09
**Commit**: `5c7acf8`
**Live URL**: [protocol-xx.vercel.app](https://protocol-xx.vercel.app)

**Prompt summary**:
```
Use nodemailer. Add email + OTP login. Deploy.
Stack: Nodemailer + Resend SMTP, stateless JWT OTP tokens, httpOnly session cookies.
No database required.
```

**What was built**:
- `api/send-otp.ts` — generates cryptographically secure 6-digit OTP, signs into 10-min JWT,
  sends via Resend SMTP (nodemailer transport). Stateless — no DB needed.
- `api/verify-otp.ts` — constant-time OTP comparison (timing-attack safe), issues 7-day
  httpOnly + SameSite=Strict session cookie on success.
- `api/me.ts` — session check endpoint, reads httpOnly cookie, returns email.
- `api/logout.ts` — clears session + logged_in cookies (Max-Age=0).
- `src/lib/auth.ts` — `getMe()` and `logout()` fetch helpers.
- `src/components/common/AuthGuard.tsx` — wraps entire app, checks session on mount,
  shows LoginScreen if unauthenticated, passes user to children when authenticated.
- `src/components/screens/LoginScreen.tsx` — two-stage UI: email input → OTP input.
  Matches design spec (flat card, 1px border, no gradients, sentence case).
- `src/components/common/TopBar.tsx` — added `userEmail` + "Sign out" button.
- `src/App.tsx` — wrapped in AuthGuard, wired logout (full reload clears all in-memory state).
- `vercel.json` — added SPA rewrite rule so `/api/*` routes work alongside the static app.
- `.env.example` — documented RESEND_API_KEY, JWT_SECRET, FROM_EMAIL.
- `package.json` — added `nodemailer` + `jsonwebtoken` (+ types).

**Env vars set in Vercel** (Production + Preview):
- `RESEND_API_KEY` — Resend SMTP password
- `JWT_SECRET` — random 32-byte base64url secret
- `FROM_EMAIL` — `onboarding@resend.dev`

**Security notes**:
- OTP is never stored server-side — embedded in a signed JWT, verified on submission
- Constant-time comparison (`timingSafeEqual`) prevents timing attacks
- Session cookie: `HttpOnly; Secure; SameSite=Strict` — not readable by JS
- All API routes are same-origin (`connect-src 'self'` CSP satisfied)
- No user data stored beyond the session JWT lifetime

**Verification**: `npm test` 37/37 ✅ · `npm run build` clean ✅ · `npm audit` 0 vulns ✅
**Deployed**: Status Ready in 58s ✅ · Login flow tested end-to-end ✅

---

### [P-008] Vercel build fix — remove darwin-arm64 platform bindings
**Date**: 2026-10-09
**Commit**: `18ea359`

**Prompt**: *(screenshot of Vercel build error: EBADPLATFORM)*

**Root cause**: `@oxlint/binding-darwin-arm64` and `@rolldown/binding-darwin-arm64` were
explicitly listed in `devDependencies`. These are macOS Apple Silicon–only native binaries.
Vercel builds on Linux x64 — npm errors with `EBADPLATFORM`.

**Fix**: Removed both lines from `package.json`. Their parent packages (`oxlint`, `vite`)
auto-install the correct platform binary as an optional dependency — no manual pinning needed.

**Outcome**:
- `package.json`: 2 lines removed
- `package-lock.json`: regenerated
- `npm install` + `npm run build` pass locally
- Vercel redeploy succeeded: **[protocol-xx.vercel.app](https://protocol-xx.vercel.app)**

---

### [P-007] Deploy to Vercel
**Date**: 2026-10-09

**Prompt**: `deploy on vercel`

**Outcome**:
- Deployed via Vercel dashboard (Import Git Repository → `cryptomaniaac/ProtocolXX`)
- `vercel.json` auto-detected: build command `npm run build`, output `dist/`
- All security headers served by Vercel (CSP, COOP, Referrer-Policy, etc.)
- Auto-deploy on every push to `main` enabled
- Live URL: **[protocol-xx.vercel.app](https://protocol-xx.vercel.app)**

---

### [P-006] Security hardening — secrets, CI, license
**Date**: 2026-10-09
**Commit**: `d4c703a`

**Prompt (verbatim)**:
```
Read GEMINI.md. It is binding. Do not edit it.

GOAL
Protect the repo from leaked secrets and clean up what is committed.

SCOPE
- Build ONLY: .gitignore, .env.example, scripts/, .github/, SECURITY.md update, LICENSE.
- Do NOT touch: application code, the design, GEMINI.md, docs/DESIGN.md.

TASKS
1. Update .gitignore to cover: node_modules, dist, coverage, .env, .env.*, !.env.example,
   .vercel, .DS_Store, *.log, *.pem, *.key.
2. Stop tracking files that are now ignored: run `git rm -r --cached coverage`
   (and dist or node_modules if they are tracked). Do not delete the files from disk.
3. Create .env.example containing only comments: "This app needs no environment variables
   and no secrets. Never put secrets in a VITE_ variable: they are bundled into the public
   browser code."
4. Search the project and the git history for secrets (API keys, tokens, private keys,
   .env files, passwords). Report any hit. If one is in history, STOP and tell me.
5. Add scripts/check-secrets.mjs with no new dependencies. It scans tracked files only,
   reports file + line + rule, exits 1 on any finding.
6. Add scripts/hooks/pre-commit that runs npm run check:secrets.
7. Create .github/workflows/ci.yml: checkout -> Node 22 -> npm ci -> npm test ->
   npm run build -> npm audit --audit-level=high -> npm run check:secrets.
   Pin actions to full version tags (e.g. actions/checkout@v4.2.2).
8. Add .github/dependabot.yml for npm and github-actions, weekly, limit 5 PRs.
9. Add MIT LICENSE (year 2026, author from git config).
10. Update SECURITY.md: add a "Secrets & Supply-chain" section covering items 1-8.
11. Verify: run npm test, npm run build, npm audit --audit-level=high,
    npm run check:secrets. All must pass. No VITE_ env vars in source.
    Report results.
```

**Outcome**:
- `.gitignore` updated (node_modules, dist, coverage, .env*, .vercel, .DS_Store, *.log, *.pem, *.key)
- `coverage/` untracked from git index (`git rm --cached`)
- `.env.example` created (comments only, no real values)
- Git history scanned — **no secrets found**
- `scripts/check-secrets.mjs` created (5 patterns: AWS key, GitHub PAT, OpenAI key, private key header, generic assignment)
- `scripts/hooks/pre-commit` created
- `.github/workflows/ci.yml` created (pinned to `actions/checkout@v4.2.2`, `actions/setup-node@v4.1.0`)
- `.github/dependabot.yml` created (weekly, npm + github-actions)
- `LICENSE` created (MIT 2026)
- `SECURITY.md` updated — covers threat model, controls, secrets policy
- `package.json`: added `audit` and `check:secrets` scripts
- **Verification**: `npm test` 37/37 ✅ · `npm run build` clean ✅ · `npm audit` 0 vulns ✅ · `check:secrets` no secrets ✅

---

### [P-005] UI redesign — dark flat product UI (Design Spec phase 2)
**Date**: 2026-10-09
**Commit**: `3746994` (part of)

**Prompt summary** (multi-turn "continue" sessions):
```
Continue applying the design spec from docs/DESIGN.md.

Remaining work:
- ResultsScreen: TL;DR and "Needs your attention" at top; decisions, actions, mentions,
  timeline in collapsible sections, collapsed by default. Attention list shows top 5 + "Show all".
- SourcePanel: click result -> scroll to + highlight source message.
- Tabs, Badge, Chip, Section, Button, Card, PrivacyBadge, TopBar, UploadZone components:
  match colour tokens exactly, no gradients, no shadows, 1px borders.
- All components: data-testid on key controls, WCAG AA contrast, 44px tap targets,
  aria-live for status.
- No dangerouslySetInnerHTML, no inline styles, no emoji icons.
```

**Outcome**:
- All common components rebuilt: `Badge`, `Button`, `Card`, `Chip`, `Section`, `Tabs`, `TopBar`, `UploadZone`, `PrivacyBadge`, `HelpModal`, `SourcePanel`
- `ResultsScreen`: TL;DR + attention top, 4 collapsible sections below
- `LandingScreen`: single primary action, privacy badge, "Try sample chat" button
- `ParsingScreen`: static layout, determinate progress bar, no spinners
- `ErrorScreen`: same layout shell as real screen, no layout shift
- Dark/light token system, flash-free theme init via `public/theme-init.js`
- All `data-testid` attributes on key controls

---

### [P-004] UI redesign — dark flat product UI (Design Spec phase 1)
**Date**: 2026-10-09
**Commit**: `3746994` (part of)

**Prompt (verbatim)**:
```
# Unread Catchup: Design Spec

This file replaces the earlier Stitch-generated docs/DESIGN.md. It is the single source of
truth for the UI.

## 0. Precedence and intent
1. GEMINI.md always wins.
2. This spec restyles the existing app. Do not change the parser, extraction, ranking,
   worker or tests.
3. Visual reference: a dark, flat product UI (Shipr). Take its look and feel, not its features:
   - near-black canvas, slightly lighter panels, 1px borders for structure
   - large left-aligned heading with plenty of space around it
   - pill-shaped tabs and chips with thin borders
   - a large rounded input card as the main focus
   - a small floating panel docked bottom-right
   - muted grey secondary text, bright text only for the active item
4. Do not copy: the Shipr name/logo, its sidebar, its chat agent, its orb, its copy.

## 1. Hard rules
- No gradients anywhere (linear, radial, conic, mesh). Solid colours only.
- No box shadows, glows, blur, backdrop-filter, glassmorphism.
- No images, no illustrations, no emoji. Icons are inline SVG only.
- No inline style attributes and no inline scripts (CSP forbids them).
- No looping animation. Loading = static blocks + determinate progress bar.
- Sentence case everywhere. No all-caps. No exclamation marks.
- Colour is never the only signal. Urgency has label + icon.
```

**Outcome**: `docs/DESIGN.md` written as single source of truth. Colour tokens, spacing (8px grid), component specs, copy rules, accessibility checklist all defined. Build then started in P-005.

---

### [P-003] Network counter fix
**Date**: 2026-10-09
**Commit**: `3746994` (part of)

**Prompt (verbatim)**:
```
Problem: the landing screen shows "Outbound network calls: 3", but the app should make
no outbound calls with user data.

Fix ONLY: the network counter code and its tests. Do not touch the parser, extraction,
ranking or any layout.

TASKS
1. First find out what the 3 counted requests actually are (URL and initiator type).
   Report them before changing anything.
2. If they are the app's own same-origin assets (JS, CSS, worker, fonts), change the
   counter to ignore same-origin resource loads and to count only requests to other
   origins plus any fetch, XHR or beacon calls after load.
3. If any request goes to an external host, STOP and tell me. Do not hide it.
4. Do not hardcode 0 or suppress the counter.
5. Add a unit test for the filtering logic.

VERIFY
Run npm test and npm run build. Then run npm run preview and tell me the counter value.
```

**Outcome**:
- Investigated: the 3 requests were same-origin static asset loads (JS bundle, CSS, worker script) counted by `PerformanceObserver` on `"resource"` entries
- **No external host was contacted**
- `src/lib/networkObserver.ts` updated: ignores `resource` entries whose `name` URL shares origin with `location.origin`; counts only cross-origin resources plus `fetch`, `xmlhttprequest`, and `beacon` initiator types after page load
- `src/test/networkObserver.test.ts`: 4 unit tests added (same-origin ignored, cross-origin counted, fetch counted, beacon counted)
- Counter reads **0** in normal use ✅

---

### [P-002] Local preview
**Date**: 2026-10-09

**Prompt**: `deploy the build done so far on local host`

**Outcome**: `npm run build` completed clean. `npm run preview -- --port 4173 --host` started as daemon. App accessible at `http://localhost:4173/`.

---

### [P-001] Project bootstrap
**Date**: 2026-10-09
**Commit**: `4ecaef1` → `4ad632c`

**Prompt summary**:
```
Build "Unread Catchup" — a hackathon micro-app that answers "What did I miss?" for long
exported chat transcripts. Stack: Vite + React + TypeScript (strict) + Tailwind CSS.
Static build, no backend, deployable to Vercel. All constraints in GEMINI.md.
```

**Outcome**:
- Vite + React + TypeScript + Tailwind project initialized
- **Parser** (`src/lib/parser.ts`): WhatsApp `.txt` export parser, ReDoS-safe regexes, runs in Web Worker with 5 s timeout
- **Worker** (`src/workers/parser.worker.ts`): isolated parse execution
- **Extraction** (`src/lib/extraction.ts`): decisions, action items, mentions, questions
- **Ranking** (`src/lib/ranking.ts`): urgency scoring (high / medium / low)
- **TL;DR** (`src/lib/tldr.ts`): 3-sentence summary generator
- **Filters** (`src/lib/filters.ts`): date/author/keyword filter helpers
- **Network observer** (`src/lib/networkObserver.ts`): `PerformanceObserver`-based counter
- **Sample chat** (`src/lib/sampleChat.ts`): clearly labelled fake data
- **Screens**: Landing, Parsing, Results, Error
- **Test suite**: 37 tests across 8 files (vitest + @testing-library/react)
- `vercel.json`: strict CSP + security headers
- `vite.config.ts`: source maps off, worker bundling

---

## Entry Template

Copy this block and fill it in for each new prompt session:

```markdown
### [P-NNN] Short title
**Date**: YYYY-MM-DD
**Commit**: `<hash>`

**Prompt (verbatim or summary)**:
paste the full prompt here, or a faithful summary if it was multi-turn

**Outcome**:
- File 1: what changed and why
- File 2: what changed and why
- Verification: `npm test` N/N ✅ · `npm run build` ✅ · other checks
```

---

*Last updated: 2026-10-09 · Maintainer: add your name here*
