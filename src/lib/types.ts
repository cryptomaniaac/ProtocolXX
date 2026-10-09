export type UrgencyLevel = 'High' | 'Medium' | 'Low'

export interface ChatMessage {
  id: string
  timestamp: Date
  sender: string
  text: string
  isSystem: boolean
  rawLineIndex?: number
}

export interface ExtractedItem {
  id: string
  type: 'decision' | 'action' | 'blocker' | 'mention' | 'link'
  title: string
  description: string
  sender: string
  timestamp: Date
  sourceMessageId: string
  urgency: UrgencyLevel
  urgencyScore: number
  urgencyReason: string
  assignee?: string
  url?: string
}

export interface CatchupSummary {
  totalMessages: number
  participantCount: number
  participants: string[]
  timeSpanFormatted: string
  startDate: Date
  endDate: Date
  decisionCount: number
  actionItemCount: number
  questionCount: number
  activeTopics: string[]
  summaryText: string
}

export interface ParsedChatData {
  messages: ChatMessage[]
  participants: string[]
  startDate: Date | null
  endDate: Date | null
  decisions: ExtractedItem[]
  actionItems: ExtractedItem[]
  blockers: ExtractedItem[]
  links: ExtractedItem[]
  mentions: ExtractedItem[]
  attentionItems: ExtractedItem[]
  summary: CatchupSummary
}

export interface ParseOptions {
  maxMessages?: number
  dateFormatPreference?: 'auto' | 'dd/mm' | 'mm/dd'
}

export interface FilterState {
  timeWindow: 'all' | '24h' | '7d' | 'custom'
  customStart?: Date
  customEnd?: Date
  selectedParticipants: string[]
  searchQuery: string
}
