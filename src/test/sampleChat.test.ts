import { describe, it, expect } from 'vitest'
import { generateSampleChatText } from '../lib/sampleChat'
import { parseWhatsAppExport } from '../lib/parser'
import { processChatMessages } from '../lib/catchupEngine'

describe('Sample Chat Generator', () => {
  it('generates approximately 150 fake messages', () => {
    const raw = generateSampleChatText()
    const lines = raw.trim().split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(140)
    expect(lines.length).toBeLessThanOrEqual(160)
  })

  it('strictly adheres to fake data labeling rules from GEMINI.md', () => {
    const raw = generateSampleChatText()
    // Every participant name must be labeled (fake)
    expect(raw).toContain('Alex (fake)')
    expect(raw).toContain('Sam (fake)')
    expect(raw).toContain('Taylor (fake)')
    expect(raw).toContain('Jordan (fake)')
    expect(raw).toContain('Morgan (fake)')
    expect(raw).toContain('Casey (fake)')
    // Must contain [FAKE] indicator
    expect(raw).toContain('[FAKE]')
  })

  it('successfully parses and processes through the full catchup engine', () => {
    const raw = generateSampleChatText()
    const messages = parseWhatsAppExport(raw)
    expect(messages.length).toBeGreaterThanOrEqual(140)

    const processed = processChatMessages(messages)
    expect(processed.participants.length).toBeGreaterThanOrEqual(5)
    expect(processed.decisions.length).toBeGreaterThan(0)
    expect(processed.actionItems.length).toBeGreaterThan(0)
    expect(processed.blockers.length).toBeGreaterThan(0)
    expect(processed.attentionItems.length).toBeGreaterThanOrEqual(5)
    expect(processed.summary.summaryText).toContain('messages from')
  })
})
