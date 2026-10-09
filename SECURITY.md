# Security and Privacy Policy: Unread Catchup

## 1. Threat Model & Overview
Unread Catchup is a local-first micro-application designed to summarise long exported chat histories (e.g., WhatsApp exports) directly in the user's browser.
Because chat exports inherently contain sensitive personal communications, credentials, and private context, the core security model is **zero data transmission and in-memory execution only**.

### Assets to Protect
1. **Chat Contents & Metadata**: Message bodies, participant phone numbers/names, timestamps, URLs, shared files, and context.
2. **Client Environment Integrity**: Preventing Cross-Site Scripting (XSS), script injection, DOM clobbering, and Denial of Service (DoS) attacks on the client device.

### Threat Vectors Considered
- **Data Exfiltration**: Accidental or malicious exfiltration of parsed messages via network calls (fetch, XHR, WebSockets, beacons, images, prefetching).
- **Injection Attacks (XSS)**: Malformed or malicious text payloads inside exported messages containing `<script>`, `onerror`, `javascript:`, or HTML formatting.
- **Regular Expression Denial of Service (ReDoS)**: Specially crafted adversarial strings (e.g. 100k+ repeated characters or nested brackets) designed to freeze the browser thread via catastrophic backtracking.
- **Worker / Main Thread Resource Exhaustion**: Massive files causing browser freezes or out-of-memory crashes.
- **Persistence Leakage**: Leakage of private message history through `localStorage`, `sessionStorage`, `IndexedDB`, cache storage, or browser histories.

---

## 2. Implemented Security Controls

### 2.1 Local-First Privacy Guarantee
- **Zero Outbound Requests**: All processing, extraction, ranking, and summarization occurs 100% on the client. No analytics, tracking scripts, third-party libraries, or CDN dependencies are loaded.
- **Live Network Audit**: The application monitors outbound network requests using `PerformanceObserver` and displays a live network request counter in the interface header (expected: 0).
- **Ephemeral In-Memory Storage**: Chat data is kept strictly in volatile React component state. No chat records are ever saved to `localStorage`, `sessionStorage`, or `IndexedDB`.
- **Immediate Data Destruction**: A dedicated, prominent "Clear data" button immediately wipes all parsed messages, filters, search states, and active records from memory.

### 2.2 Content Security Policy & Security Headers
Delivered via `vercel.json` for production deployment:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```
- **Self-Hosted Assets**: Fonts are self-hosted in `/public/fonts/` (WOFF2 format), requiring no external CDN or Google Fonts connection.
- **Production Source Maps**: Source maps are disabled in `vite.config.ts` (`sourcemap: false`) to avoid leaking source mapping paths.

### 2.3 Safe Text Rendering (Zero HTML Interpretation)
- `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, and `document.write` are strictly prohibited and absent from the codebase.
- All user content is rendered as React text nodes (`<span>`, `<p>`, `<div>` text children), which browsers treat strictly as plain text, eliminating XSS vectors.

### 2.4 ReDoS Mitigation & Deterministic Parsing
- All regular expressions are verified linear time: strictly no nested quantifiers (e.g. `(a+)+`), no overlapping wildcards, and bounded match operations.
- Regexes are tested with adversarial inputs (including 100,000+ repeated characters, unmatched delimiters, and extreme line lengths).
- Parsing executes within an isolated Web Worker with an enforced execution timeout (5,000ms), preventing long processing loops from locking the UI thread.

### 2.5 Input Validation & Boundary Limits
- File acceptance is constrained to `.txt` files only.
- Strict 5 MB file size limit enforced before reading into memory.
- Messages capped gracefully to prevent DOM exhaustion; large message sets utilize windowing/pagination.

### 2.6 Supply Chain & Dependency Hygiene
- Dependency footprint is minimal (zero extra runtime libraries beyond React and React DOM).
- `package-lock.json` is committed with exact pinned versions.
- Clean audit pipeline: `npm audit --audit-level=high` runs cleanly with 0 high or critical vulnerabilities.
