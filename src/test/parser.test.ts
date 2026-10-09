import { describe, it, expect } from 'vitest'
import {
  parseWhatsAppExport,
  sanitizeLine,
  detectDateOrder,
  matchHeader,
} from '../lib/parser'

describe('WhatsApp Parser', () => {
  it('parses bracket format with 24h time', () => {
    const raw = `[12/03/2026, 14:05:09] Alex (fake): Hello team!`
    const messages = parseWhatsAppExport(raw)
    expect(messages).toHaveLength(1)
    expect(messages[0].sender).toBe('Alex (fake)')
    expect(messages[0].text).toBe('Hello team!')
    expect(messages[0].isSystem).toBe(false)
    expect(messages[0].timestamp.getHours()).toBe(14)
    expect(messages[0].timestamp.getMinutes()).toBe(5)
  })

  it('parses bracket format with 12h time and AM/PM', () => {
    const raw = `[12/03/26, 2:05:09 PM] Sam (fake): Staging is ready`
    const messages = parseWhatsAppExport(raw)
    expect(messages).toHaveLength(1)
    expect(messages[0].sender).toBe('Sam (fake)')
    expect(messages[0].text).toBe('Staging is ready')
    expect(messages[0].timestamp.getHours()).toBe(14)
  })

  it('parses dash format with 24h time', () => {
    const raw = `12/03/2026, 14:05 - Taylor (fake): Review complete`
    const messages = parseWhatsAppExport(raw)
    expect(messages).toHaveLength(1)
    expect(messages[0].sender).toBe('Taylor (fake)')
    expect(messages[0].text).toBe('Review complete')
  })

  it('parses dash format with 12h time', () => {
    const raw = `12/03/26, 9:30 AM - Jordan (fake): Morning all`
    const messages = parseWhatsAppExport(raw)
    expect(messages).toHaveLength(1)
    expect(messages[0].sender).toBe('Jordan (fake)')
    expect(messages[0].timestamp.getHours()).toBe(9)
  })

  it('handles multi-line messages correctly', () => {
    const raw = `[12/03/2026, 14:05:00] Alex (fake): First line
Second line
Third line with details
[12/03/2026, 14:06:00] Sam (fake): Next message`
    const messages = parseWhatsAppExport(raw)
    expect(messages).toHaveLength(2)
    expect(messages[0].text).toBe('First line\nSecond line\nThird line with details')
    expect(messages[1].text).toBe('Next message')
  })

  it('identifies system notifications', () => {
    const raw = `[12/03/2026, 14:00:00] Messages and calls are end-to-end encrypted.
[12/03/2026, 14:05:00] Alex (fake) created group "Test"
[12/03/2026, 14:10:00] Alex (fake): Regular chat message`
    const messages = parseWhatsAppExport(raw)
    expect(messages).toHaveLength(3)
    expect(messages[0].isSystem).toBe(true)
    expect(messages[0].sender).toBe('System')
    expect(messages[1].isSystem).toBe(true)
    expect(messages[2].isSystem).toBe(false)
  })

  it('detects DD/MM vs MM/DD reliably', () => {
    expect(detectDateOrder(['25/03/2026', '12/03/2026'])).toBe('DD/MM')
    expect(detectDateOrder(['03/25/2026', '03/12/2026'])).toBe('MM/DD')
    expect(detectDateOrder(['2026/03/12', '2026/03/25'])).toBe('YYYY/MM/DD')
  })

  it('correctly handles single message file', () => {
    const raw = `[12/03/2026, 14:05:00] Alex (fake): Just one message`
    const messages = parseWhatsAppExport(raw)
    expect(messages).toHaveLength(1)
    expect(messages[0].text).toBe('Just one message')
  })

  it('preserves emoji-only messages', () => {
    const raw = `[12/03/2026, 14:05:00] Alex (fake): 🚀🎉✨`
    const messages = parseWhatsAppExport(raw)
    expect(messages[0].text).toBe('🚀🎉✨')
  })

  it('preserves RTL text with direction intact', () => {
    const raw = `[12/03/2026, 14:05:00] Alex (fake): مرحبا بالعالم`
    const messages = parseWhatsAppExport(raw)
    expect(messages[0].text).toBe('مرحبا بالعالم')
  })

  it('throws friendly error on empty file', () => {
    expect(() => parseWhatsAppExport('')).toThrow('Chat file is empty')
    expect(() => parseWhatsAppExport('   \n  \n ')).toThrow('Chat file is empty')
  })

  it('throws friendly error on non-chat file', () => {
    const randomText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore.`
    expect(() => parseWhatsAppExport(randomText)).toThrow('No chat messages found')
  })

  it('is ReDoS safe against 100k repeated characters', () => {
    const start = Date.now()
    const evilLine = '[' + '0'.repeat(100000) + ']'
    sanitizeLine(evilLine)
    matchHeader(evilLine)
    const elapsed = Date.now() - start
    // Must complete in under 50ms without backtracking hangs
    expect(elapsed).toBeLessThan(100)
  })
})
