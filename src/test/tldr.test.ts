import { describe, it, expect } from 'vitest'
import { generateCatchupSummary, formatTimeSpan, extractActiveTopics } from '../lib/tldr'
import type { ChatMessage, ExtractedItem } from '../lib/types'

describe('TL;DR Generator', () => {
  it('formats time spans accurately', () => {
    const t0 = new Date(2026, 9, 6, 10, 0)
    const t1 = new Date(2026, 9, 6, 10, 35)
    const t2 = new Date(2026, 9, 6, 15, 0)
    const t3 = new Date(2026, 9, 8, 10, 0)

    expect(formatTimeSpan(t0, t1)).toBe('35 minutes')
    expect(formatTimeSpan(t0, t2)).toBe('5 hours')
    expect(formatTimeSpan(t0, t3)).toBe('2 days')
  })

  it('generates summary matching the requested template format', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        sender: 'Alex (fake)',
        text: 'Deploying release to staging and testing postgres database migration.',
        timestamp: new Date(2026, 9, 6, 10, 0),
        isSystem: false,
      },
      {
        id: '2',
        sender: 'Sam (fake)',
        text: 'Postgres database migration finished cleanly. Ready for release.',
        timestamp: new Date(2026, 9, 6, 14, 0),
        isSystem: false,
      },
    ]

    const decisions: ExtractedItem[] = [
      {
        id: 'd1',
        type: 'decision',
        title: 'Release approved',
        description: 'Release approved',
        sender: 'Alex (fake)',
        timestamp: new Date(2026, 9, 6, 10, 30),
        sourceMessageId: '1',
        urgency: 'Low',
        urgencyScore: 1,
        urgencyReason: '',
      },
    ]

    const actionItems: ExtractedItem[] = [
      {
        id: 'a1',
        type: 'action',
        title: 'Run test suite',
        description: 'Run test suite',
        sender: 'Alex (fake)',
        timestamp: new Date(2026, 9, 6, 11, 0),
        sourceMessageId: '1',
        urgency: 'Medium',
        urgencyScore: 3,
        urgencyReason: '',
      },
    ]

    const blockers: ExtractedItem[] = []

    const summary = generateCatchupSummary(messages, decisions, actionItems, blockers)

    expect(summary.totalMessages).toBe(2)
    expect(summary.participantCount).toBe(2)
    expect(summary.decisionCount).toBe(1)
    expect(summary.actionItemCount).toBe(1)
    expect(summary.questionCount).toBe(0)
    expect(summary.summaryText).toContain('2 messages from 2 participants over 4 hours.')
    expect(summary.summaryText).toContain('1 decisions made')
    expect(summary.summaryText).toContain('1 action items pending')
    expect(summary.summaryText).toContain('Primary active topics:')
  })

  it('extracts active topics by frequency', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        sender: 'Alex (fake)',
        text: 'Database schema migration and database indexing.',
        timestamp: new Date(),
        isSystem: false,
      },
      {
        id: '2',
        sender: 'Sam (fake)',
        text: 'Testing database rollback scripts.',
        timestamp: new Date(),
        isSystem: false,
      },
    ]

    const topics = extractActiveTopics(messages)
    expect(topics).toContain('Database')
  })
})
