import type { ExtractedItem, UrgencyLevel } from './types'

const HIGH_URGENCY_KEYWORDS = [
  'critical',
  'urgent',
  'immediately',
  'asap',
  'emergency',
  'p0',
  'blocker',
  'broken',
  'failing',
  'due today',
  'today',
  'eod',
  'end of day',
  'stop',
]

const MEDIUM_URGENCY_KEYWORDS = [
  'tomorrow',
  'pending',
  'please review',
  'before lunch',
  'by 2 pm',
  'by 3 pm',
  'by 4 pm',
  'by 5 pm',
  'soon',
  'verify',
  'audit',
  'check',
]

export function computeUrgencyScore(
  item: ExtractedItem,
  chatStartTime?: Date,
  chatEndTime?: Date
): { score: number; level: UrgencyLevel; reason: string } {
  let score = 0
  const reasons: string[] = []
  const textLower = `${item.title} ${item.description}`.toLowerCase()

  // 1. Base score by item type
  if (item.type === 'blocker') {
    if (textLower.includes('block') || textLower.includes('fail') || textLower.includes('cannot')) {
      score += 4
      reasons.push('Active blocker')
    } else {
      score += 2
      reasons.push('Open question')
    }
  } else if (item.type === 'action') {
    score += 2
    reasons.push('Action item')
  } else if (item.type === 'mention') {
    score += 2
    reasons.push('Direct mention')
  } else if (item.type === 'decision') {
    score += 1
  }

  // 2. High urgency keyword matching
  const matchedHigh = HIGH_URGENCY_KEYWORDS.filter((kw) => textLower.includes(kw))
  if (matchedHigh.length > 0) {
    score += 3
    reasons.push(`Contains urgent terms (${matchedHigh.slice(0, 2).join(', ')})`)
  }

  // 3. Medium urgency keyword matching
  const matchedMed = MEDIUM_URGENCY_KEYWORDS.filter((kw) => textLower.includes(kw))
  if (matchedMed.length > 0) {
    score += 1
    reasons.push(`Has scheduled timeline (${matchedMed.slice(0, 2).join(', ')})`)
  }

  // 4. Assignee boost
  if (item.assignee) {
    score += 1
    reasons.push(`Assigned to ${item.assignee}`)
  }

  // 5. Recency boost (items in final quarter of timespan)
  if (chatStartTime && chatEndTime && chatEndTime.getTime() > chatStartTime.getTime()) {
    const totalDuration = chatEndTime.getTime() - chatStartTime.getTime()
    const itemAge = item.timestamp.getTime() - chatStartTime.getTime()
    if (itemAge >= totalDuration * 0.75) {
      score += 1
      reasons.push('Recent update')
    }
  }

  let level: UrgencyLevel = 'Low'
  if (score >= 5) {
    level = 'High'
  } else if (score >= 3) {
    level = 'Medium'
  } else {
    level = 'Low'
  }

  return {
    score,
    level,
    reason: reasons.join(' • ') || 'Standard item',
  }
}

export function rankAttentionItems(
  items: ExtractedItem[],
  chatStartTime?: Date,
  chatEndTime?: Date
): ExtractedItem[] {
  // Score every item deterministically
  const scoredItems: ExtractedItem[] = items.map((item) => {
    const { score, level, reason } = computeUrgencyScore(
      item,
      chatStartTime,
      chatEndTime
    )
    return {
      ...item,
      urgency: level,
      urgencyScore: score,
      urgencyReason: reason,
    }
  })

  // Deduplicate items with similar titles in the same message
  const seenKeys = new Set<string>()
  const deduped: ExtractedItem[] = []

  for (const item of scoredItems) {
    const key = `${item.sourceMessageId}-${item.type}-${item.title.toLowerCase().slice(0, 30)}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      deduped.push(item)
    }
  }

  // Sort deterministically:
  // 1. Urgency score descending
  // 2. Timestamp descending (newer first)
  // 3. Title alphabetical
  return deduped.sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore
    }
    const timeDiff = b.timestamp.getTime() - a.timestamp.getTime()
    if (timeDiff !== 0) return timeDiff
    return a.title.localeCompare(b.title)
  })
}
