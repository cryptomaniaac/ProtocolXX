import { describe, it, expect } from 'vitest'
import {
  filterMessages,
  filterExtractedItems,
  highlightText,
} from '../lib/filters'
import type { ChatMessage, ExtractedItem, FilterState } from '../lib/types'

describe('Filters and Highlighting', () => {
  it('highlights search queries cleanly as plain text segments without HTML injection', () => {
    const text = 'Critical blocker on postgres database connection'
    const segments = highlightText(text, 'postgres')
    expect(segments).toHaveLength(3)
    expect(segments[0]).toEqual({ text: 'Critical blocker on ', isMatch: false })
    expect(segments[1]).toEqual({ text: 'postgres', isMatch: true })
    expect(segments[2]).toEqual({ text: ' database connection', isMatch: false })

    // Empty query returns single un-highlighted segment
    expect(highlightText(text, '')).toEqual([{ text, isMatch: false }])
  })

  it('filters messages by participant and search query', () => {
    const now = new Date()
    const messages: ChatMessage[] = [
      {
        id: '1',
        sender: 'Alex (fake)',
        text: 'Decided to freeze release',
        timestamp: now,
        isSystem: false,
      },
      {
        id: '2',
        sender: 'Sam (fake)',
        text: 'Reviewing pull request',
        timestamp: now,
        isSystem: false,
      },
    ]

    const filter1: FilterState = {
      timeWindow: 'all',
      selectedParticipants: ['Alex (fake)'],
      searchQuery: '',
    }
    expect(filterMessages(messages, filter1, now)).toHaveLength(1)

    const filter2: FilterState = {
      timeWindow: 'all',
      selectedParticipants: [],
      searchQuery: 'freeze',
    }
    expect(filterMessages(messages, filter2, now)).toHaveLength(1)

    const filter3: FilterState = {
      timeWindow: 'all',
      selectedParticipants: [],
      searchQuery: 'Alex',
    }
    expect(filterMessages(messages, filter3, now)).toHaveLength(1)
  })

  it('filters messages by 24h, 7d, and custom time windows', () => {
    const now = new Date(2026, 9, 8, 12, 0)
    const within24h = new Date(2026, 9, 8, 2, 0)
    const within7d = new Date(2026, 9, 4, 12, 0)
    const older = new Date(2026, 8, 20, 12, 0)

    const messages: ChatMessage[] = [
      { id: '1', sender: 'A', text: 'Recent', timestamp: within24h, isSystem: false },
      { id: '2', sender: 'B', text: 'Mid', timestamp: within7d, isSystem: false },
      { id: '3', sender: 'C', text: 'Old', timestamp: older, isSystem: false },
    ]

    expect(
      filterMessages(messages, { timeWindow: '24h', selectedParticipants: [], searchQuery: '' }, now)
    ).toHaveLength(1)

    expect(
      filterMessages(messages, { timeWindow: '7d', selectedParticipants: [], searchQuery: '' }, now)
    ).toHaveLength(2)

    expect(
      filterMessages(
        messages,
        {
          timeWindow: 'custom',
          selectedParticipants: [],
          searchQuery: '',
          customStart: new Date(2026, 9, 1),
          customEnd: new Date(2026, 9, 5),
        },
        now
      )
    ).toHaveLength(1)
  })

  it('filters extracted items correctly', () => {
    const items: ExtractedItem[] = [
      {
        id: 'i1',
        type: 'action',
        title: 'Review database PR',
        description: 'Review database PR description',
        sender: 'Alex (fake)',
        assignee: 'Sam (fake)',
        timestamp: new Date(),
        sourceMessageId: 'm1',
        urgency: 'Medium',
        urgencyScore: 3,
        urgencyReason: '',
      },
      {
        id: 'i2',
        type: 'decision',
        title: 'Approved release',
        description: 'Approved release',
        sender: 'Taylor (fake)',
        timestamp: new Date(),
        sourceMessageId: 'm2',
        urgency: 'Low',
        urgencyScore: 1,
        urgencyReason: '',
      },
    ]

    const allowedIds = new Set(['m1'])
    const filtered = filterExtractedItems(items, allowedIds, '')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('i1')

    const searchFiltered = filterExtractedItems(items, new Set(['m1', 'm2']), 'database')
    expect(searchFiltered).toHaveLength(1)
    expect(searchFiltered[0].id).toBe('i1')
  })
})
