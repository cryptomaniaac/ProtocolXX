import { describe, it, expect } from 'vitest'
import { computeUrgencyScore, rankAttentionItems } from '../lib/ranking'
import type { ExtractedItem } from '../lib/types'

describe('Urgency Ranking System', () => {
  const baseDate = new Date(2026, 9, 6, 12, 0)

  it('classifies critical blockers as High urgency', () => {
    const item: ExtractedItem = {
      id: '1',
      type: 'blocker',
      title: 'Critical blocker: Staging SSL certificate expired',
      description: 'Critical blocker: Staging SSL certificate expired',
      sender: 'Sam (fake)',
      timestamp: baseDate,
      sourceMessageId: 'msg-1',
      urgency: 'Low',
      urgencyScore: 0,
      urgencyReason: '',
    }

    const { score, level } = computeUrgencyScore(item)
    expect(score).toBeGreaterThanOrEqual(5)
    expect(level).toBe('High')
  })

  it('classifies standard action items as Medium urgency', () => {
    const item: ExtractedItem = {
      id: '2',
      type: 'action',
      title: 'Please check the staging logs',
      description: 'Please check the staging logs',
      sender: 'Taylor (fake)',
      timestamp: baseDate,
      sourceMessageId: 'msg-2',
      urgency: 'Low',
      urgencyScore: 0,
      urgencyReason: '',
    }

    const { score, level } = computeUrgencyScore(item)
    expect(score).toBeGreaterThanOrEqual(2)
    expect(level).toBe('Medium')
  })

  it('ranks items deterministically with highest urgency first', () => {
    const items: ExtractedItem[] = [
      {
        id: 'low-1',
        type: 'decision',
        title: 'Settled on font family',
        description: 'Settled on font family',
        sender: 'Alex (fake)',
        timestamp: new Date(2026, 9, 6, 10, 0),
        sourceMessageId: 'm1',
        urgency: 'Low',
        urgencyScore: 1,
        urgencyReason: '',
      },
      {
        id: 'high-1',
        type: 'blocker',
        title: 'Critical blocker: database connection failing immediately',
        description: 'Critical blocker: database connection failing immediately',
        sender: 'Jordan (fake)',
        timestamp: new Date(2026, 9, 6, 11, 0),
        sourceMessageId: 'm2',
        urgency: 'High',
        urgencyScore: 7,
        urgencyReason: '',
      },
      {
        id: 'med-1',
        type: 'action',
        title: 'Please verify the build tomorrow',
        description: 'Please verify the build tomorrow',
        sender: 'Sam (fake)',
        timestamp: new Date(2026, 9, 6, 12, 0),
        sourceMessageId: 'm3',
        urgency: 'Medium',
        urgencyScore: 3,
        urgencyReason: '',
      },
    ]

    const ranked = rankAttentionItems(items)
    expect(ranked[0].id).toBe('high-1')
    expect(ranked[0].urgency).toBe('High')
    expect(ranked[1].id).toBe('med-1')
    expect(ranked[2].id).toBe('low-1')
  })
})
