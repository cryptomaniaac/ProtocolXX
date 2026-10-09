import type { ChatMessage, ExtractedItem, CatchupSummary } from './types'

const STOP_WORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'have', 'from', 'just', 'will', 'what',
  'good', 'team', 'fake', 'project', 'here', 'there', 'about', 'some', 'they',
  'their', 'were', 'been', 'which', 'when', 'more', 'also', 'than', 'them',
  'then', 'into', 'only', 'your', 'need', 'very', 'much', 'know', 'like',
  'make', 'time', 'take', 'come', 'could', 'would', 'should', 'morning', 'afternoon',
  'evening', 'night', 'hello', 'thanks', 'sounds', 'great', 'looks', 'doing',
  'done', 'look', 'going', 'check', 'please', 'today', 'tomorrow', 'yesterday'
])

export function extractActiveTopics(messages: ChatMessage[]): string[] {
  const wordCounts = new Map<string, number>()

  for (const msg of messages) {
    if (msg.isSystem) continue
    // Match alphabetic words of length 4 to 20
    const words = msg.text.toLowerCase().match(/\b[a-z]{4,20}\b/g)
    if (words) {
      for (const w of words) {
        if (!STOP_WORDS.has(w)) {
          wordCounts.set(w, (wordCounts.get(w) || 0) + 1)
        }
      }
    }
  }

  // Sort by frequency descending
  const sorted = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1))

  const topTopics = sorted.slice(0, 3)

  if (topTopics.length === 0) {
    return ['General Discussion', 'Team Sync', 'Updates']
  }

  return topTopics
}

export function formatTimeSpan(startDate: Date, endDate: Date): string {
  const diffMs = Math.max(0, endDate.getTime() - startDate.getTime())
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? '1 minute' : `${diffMinutes} minutes`
  }
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour' : `${diffHours} hours`
  }
  return diffDays === 1 ? '1 day' : `${diffDays} days`
}

export function generateCatchupSummary(
  messages: ChatMessage[],
  decisions: ExtractedItem[],
  actionItems: ExtractedItem[],
  blockers: ExtractedItem[]
): CatchupSummary {
  if (messages.length === 0) {
    const now = new Date()
    return {
      totalMessages: 0,
      participantCount: 0,
      participants: [],
      timeSpanFormatted: '0 minutes',
      startDate: now,
      endDate: now,
      decisionCount: 0,
      actionItemCount: 0,
      questionCount: 0,
      activeTopics: [],
      summaryText: 'No messages to summarize.',
    }
  }

  const senders = new Set<string>()
  for (const m of messages) {
    if (!m.isSystem && m.sender !== 'System') {
      senders.add(m.sender)
    }
  }

  const participants = Array.from(senders)
  const participantCount = participants.length

  const sortedTimestamps = messages
    .map((m) => m.timestamp.getTime())
    .filter((t) => t > 0)
    .sort((a, b) => a - b)

  const startDate =
    sortedTimestamps.length > 0 ? new Date(sortedTimestamps[0]) : new Date()
  const endDate =
    sortedTimestamps.length > 0
      ? new Date(sortedTimestamps[sortedTimestamps.length - 1])
      : new Date()

  const timeSpanFormatted = formatTimeSpan(startDate, endDate)
  const activeTopics = extractActiveTopics(messages)

  const totalMessages = messages.length
  const decisionCount = decisions.length
  const actionItemCount = actionItems.length
  const questionCount = blockers.length

  const summaryText = `${totalMessages} messages from ${participantCount} participants over ${timeSpanFormatted}. ${decisionCount} decisions made, ${actionItemCount} action items pending, ${questionCount} questions open. Primary active topics: ${activeTopics.join(', ')}.`

  return {
    totalMessages,
    participantCount,
    participants,
    timeSpanFormatted,
    startDate,
    endDate,
    decisionCount,
    actionItemCount,
    questionCount,
    activeTopics,
    summaryText,
  }
}
