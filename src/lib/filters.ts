import type { ChatMessage, ExtractedItem, FilterState } from './types'

export interface TextSegment {
  text: string
  isMatch: boolean
}

// Safely split text for plain-text React highlighting (zero innerHTML)
export function highlightText(text: string, query: string): TextSegment[] {
  if (!query || !query.trim()) {
    return [{ text, isMatch: false }]
  }

  const cleanQuery = query.trim().toLowerCase()
  const lowerText = text.toLowerCase()
  const segments: TextSegment[] = []
  let lastIndex = 0

  let index = lowerText.indexOf(cleanQuery, lastIndex)
  while (index !== -1) {
    if (index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, index),
        isMatch: false,
      })
    }
    segments.push({
      text: text.substring(index, index + cleanQuery.length),
      isMatch: true,
    })
    lastIndex = index + cleanQuery.length
    index = lowerText.indexOf(cleanQuery, lastIndex)
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isMatch: false,
    })
  }

  return segments
}

export function filterMessages(
  messages: ChatMessage[],
  filters: FilterState,
  latestDate: Date
): ChatMessage[] {
  return messages.filter((msg) => {
    // 1. Participant filter
    if (
      filters.selectedParticipants.length > 0 &&
      !filters.selectedParticipants.includes(msg.sender)
    ) {
      return false
    }

    // 2. Time window filter
    if (filters.timeWindow === '24h') {
      const cutoff = latestDate.getTime() - 24 * 60 * 60 * 1000
      if (msg.timestamp.getTime() < cutoff) return false
    } else if (filters.timeWindow === '7d') {
      const cutoff = latestDate.getTime() - 7 * 24 * 60 * 60 * 1000
      if (msg.timestamp.getTime() < cutoff) return false
    } else if (filters.timeWindow === 'custom') {
      if (filters.customStart && msg.timestamp.getTime() < filters.customStart.getTime()) {
        return false
      }
      if (filters.customEnd && msg.timestamp.getTime() > filters.customEnd.getTime()) {
        return false
      }
    }

    // 3. Search query filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      const textMatch = msg.text.toLowerCase().includes(query)
      const senderMatch = msg.sender.toLowerCase().includes(query)
      if (!textMatch && !senderMatch) return false
    }

    return true
  })
}

export function filterExtractedItems(
  items: ExtractedItem[],
  filteredMessageIds: Set<string>,
  searchQuery: string
): ExtractedItem[] {
  return items.filter((item) => {
    // Must be part of filtered messages
    if (!filteredMessageIds.has(item.sourceMessageId)) {
      return false
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = item.title.toLowerCase().includes(q)
      const descMatch = item.description.toLowerCase().includes(q)
      const senderMatch = item.sender.toLowerCase().includes(q)
      const assigneeMatch = item.assignee?.toLowerCase().includes(q)
      if (!titleMatch && !descMatch && !senderMatch && !assigneeMatch) {
        return false
      }
    }

    return true
  })
}
