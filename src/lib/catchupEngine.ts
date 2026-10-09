import type { ChatMessage, ParsedChatData } from './types'
import {
  extractDecisions,
  extractActionItems,
  extractBlockersAndQuestions,
  extractLinks,
  extractMentions,
} from './extraction'
import { rankAttentionItems } from './ranking'
import { generateCatchupSummary } from './tldr'

export function processChatMessages(messages: ChatMessage[]): ParsedChatData {
  if (messages.length === 0) {
    throw new Error('No messages provided for processing.')
  }

  const decisions = extractDecisions(messages)
  const actionItems = extractActionItems(messages)
  const blockers = extractBlockersAndQuestions(messages)
  const links = extractLinks(messages)
  const mentions = extractMentions(messages)

  const sortedTimes = messages
    .map((m) => m.timestamp.getTime())
    .filter((t) => t > 0)
    .sort((a, b) => a - b)

  const startDate = sortedTimes.length > 0 ? new Date(sortedTimes[0]) : null
  const endDate =
    sortedTimes.length > 0 ? new Date(sortedTimes[sortedTimes.length - 1]) : null

  // Combine candidates for "Needs your attention"
  // Prioritize blockers/questions, high-impact actions, and direct mentions
  const attentionCandidates = [...blockers, ...actionItems, ...mentions]
  const attentionItems = rankAttentionItems(
    attentionCandidates,
    startDate || undefined,
    endDate || undefined
  )

  const summary = generateCatchupSummary(
    messages,
    decisions,
    actionItems,
    blockers
  )

  const senders = new Set<string>()
  for (const m of messages) {
    if (!m.isSystem && m.sender !== 'System') {
      senders.add(m.sender)
    }
  }

  return {
    messages,
    participants: Array.from(senders),
    startDate,
    endDate,
    decisions,
    actionItems,
    blockers,
    links,
    mentions,
    attentionItems,
    summary,
  }
}
