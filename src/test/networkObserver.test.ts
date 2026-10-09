import { describe, it, expect } from 'vitest'
import { isOutboundNetworkRequest } from '../lib/networkObserver'

describe('Network Observer Filtering Logic', () => {
  const origin = 'http://localhost:4173'

  it('ignores same-origin static assets (fonts, css, js, icons, workers)', () => {
    // Fonts loaded via CSS
    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/fonts/PlusJakartaSans-Regular.woff2`, initiatorType: 'css' },
        origin
      )
    ).toBe(false)

    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/fonts/PlusJakartaSans-SemiBold.woff2`, initiatorType: 'font' },
        origin
      )
    ).toBe(false)

    // Favicon
    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/favicon.svg`, initiatorType: 'other' },
        origin
      )
    ).toBe(false)

    // App scripts and stylesheets
    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/assets/index-abc.js`, initiatorType: 'script' },
        origin
      )
    ).toBe(false)

    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/assets/index-xyz.css`, initiatorType: 'link' },
        origin
      )
    ).toBe(false)

    // Worker bundle
    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/assets/parser.worker-123.js`, initiatorType: 'other' },
        origin
      )
    ).toBe(false)
  })

  it('detects and counts cross-origin requests to other origins', () => {
    // Third-party analytics or tracker script
    expect(
      isOutboundNetworkRequest(
        { name: 'https://cdn.external.com/script.js', initiatorType: 'script' },
        origin
      )
    ).toBe(true)

    // Third-party image pixel
    expect(
      isOutboundNetworkRequest(
        { name: 'https://tracker.external.com/pixel.gif', initiatorType: 'img' },
        origin
      )
    ).toBe(true)

    // External API endpoint
    expect(
      isOutboundNetworkRequest(
        { name: 'https://api.external.com/v1/telemetry', initiatorType: 'fetch' },
        origin
      )
    ).toBe(true)
  })

  it('detects and counts data transmission calls (fetch, XHR, beacon) even to same-origin', () => {
    // Same-origin fetch
    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/api/messages`, initiatorType: 'fetch' },
        origin
      )
    ).toBe(true)

    // Same-origin XHR
    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/api/upload`, initiatorType: 'xmlhttprequest' },
        origin
      )
    ).toBe(true)

    // Same-origin beacon
    expect(
      isOutboundNetworkRequest(
        { name: `${origin}/beacon/log`, initiatorType: 'beacon' },
        origin
      )
    ).toBe(true)
  })

  it('ignores data: and blob: URLs', () => {
    expect(
      isOutboundNetworkRequest(
        { name: 'data:image/svg+xml;base64,PHN2Zz4...', initiatorType: 'img' },
        origin
      )
    ).toBe(false)

    expect(
      isOutboundNetworkRequest(
        { name: 'blob:http://localhost:4173/uuid-1234', initiatorType: 'other' },
        origin
      )
    ).toBe(false)
  })
})
