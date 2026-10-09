import type { ChatMessage, ExtractedItem } from './types'

// Strip trailing punctuation for clean title display
function cleanSentence(text: string): string {
  return text.trim().replace(/^[-*•\s]+/, '').replace(/[\r\n]+/g, ' ')
}

const DECISION_PATTERNS = [
  /\bdecided\s*:\s*(.+)$/i,
  /\bdecided\s+to\s+(.+)$/i,
  /\bdecision\s*:\s*(.+)$/i,
  /\bfinal\s+decision\s*:\s*(.+)$/i,
  /\bagreed\s+on\s+(.+)$/i,
  /\bagreed\s+to\s+(.+)$/i,
  /\bagreed\s+that\s+(.+)$/i,
  /\bapproved\s*:\s*(.+)$/i,
  /\bapproved\s+(.+)$/i,
  /\bconfirmed\s*:\s*(.+)$/i,
  /\bconfirmed\s+that\s+(.+)$/i,
  /\bwe\s+will\s+go\s+with\s+(.+)$/i,
  /\bsettled\s+on\s+(.+)$/i,
  /\bresolution\s*:\s*(.+)$/i,
]

const ACTION_PATTERNS = [
  /\baction\s+item\s*:\s*(.+)$/i,
  /\btodo\s*:\s*(.+)$/i,
  /@([\w\s()-]+?)\s+please\s+(.+)$/i,
  /\bplease\s+(.+)$/i,
  /\bcan\s+you\s+(.+)$/i,
  /([\w\s()-]+?)\s+will\s+(handle|update|review|verify|check|run|confirm)\s+(.+)$/i,
  /\bneeds\s+to\s+(.+)$/i,
  /\bassigned\s+to\s+([\w\s()-]+?)\s*:\s*(.+)$/i,
  /\bto\s+(confirm|review|verify|audit|update)\s+(.+)$/i,
]

const BLOCKER_PATTERNS = [
  /\bcritical\s+blocker\s*:\s*(.+)$/i,
  /\bblocker\s*:\s*(.+)$/i,
  /\bblocked\s+on\s+(.+)$/i,
  /\bcannot\s+proceed\s*(.*)$/i,
  /\bfailing\s*!?:?\s*(.+)$/i,
  /\bstuck\s+on\s+(.+)$/i,
  /\bwaiting\s+on\s+(.+)$/i,
  /\bwaiting\s+for\s+(.+)$/i,
  /\burgent\s*:\s*(.+)$/i,
]

const URL_REGEX = /https?:\/\/[^\s<>"')]+(?:\([^\s<>"')]*\)|[^\s<>"')]*[^\s<>"'.,;:?!])/gi
const MENTION_REGEX = /@([A-Za-z0-9_.-]+(?:\s*\([^)\n]+\))?)/g

export function extractDecisions(messages: ChatMessage[]): ExtractedItem[] {
  const items: ExtractedItem[] = []

  for (const msg of messages) {
    if (msg.isSystem) continue
    const lines = msg.text.split('\n')

    for (const line of lines) {
      for (const pattern of DECISION_PATTERNS) {
        const match = pattern.exec(line)
        if (match) {
          const detail = cleanSentence(match[1] || line)
          items.push({
            id: `dec-${msg.id}-${items.length + 1}`,
            type: 'decision',
            title: detail.length > 90 ? detail.substring(0, 87) + '...' : detail,
            description: cleanSentence(line),
            sender: msg.sender,
            timestamp: msg.timestamp,
            sourceMessageId: msg.id,
            urgency: 'Low',
            urgencyScore: 1,
            urgencyReason: 'Settled decision',
          })
          break // avoid duplicate matches on the same line
        }
      }
    }
  }

  return items
}

export function extractActionItems(messages: ChatMessage[]): ExtractedItem[] {
  const items: ExtractedItem[] = []

  for (const msg of messages) {
    if (msg.isSystem) continue
    const lines = msg.text.split('\n')

    for (const line of lines) {
      for (const pattern of ACTION_PATTERNS) {
        const match = pattern.exec(line)
        if (match) {
          let assignee = ''
          let task = ''

          if (pattern.source.includes('@([\\w\\s()-]+?)')) {
            assignee = match[1]?.trim()
            task = match[2]?.trim()
          } else if (pattern.source.includes('will\\s+')) {
            assignee = match[1]?.trim()
            task = `${match[2]} ${match[3]}`.trim()
          } else if (pattern.source.includes('assigned\\s+to')) {
            assignee = match[1]?.trim()
            task = match[2]?.trim()
          } else {
            task = match[1]?.trim()
          }

          const cleanTask = cleanSentence(task || line)
          items.push({
            id: `act-${msg.id}-${items.length + 1}`,
            type: 'action',
            title: cleanTask.length > 90 ? cleanTask.substring(0, 87) + '...' : cleanTask,
            description: cleanSentence(line),
            sender: msg.sender,
            timestamp: msg.timestamp,
            sourceMessageId: msg.id,
            urgency: 'Medium',
            urgencyScore: 3,
            urgencyReason: 'Action item pending completion',
            assignee: assignee || undefined,
          })
          break
        }
      }
    }
  }

  return items
}

export function extractBlockersAndQuestions(messages: ChatMessage[]): ExtractedItem[] {
  const items: ExtractedItem[] = []

  for (const msg of messages) {
    if (msg.isSystem) continue
    const lines = msg.text.split('\n')

    for (const line of lines) {
      let isBlocker = false
      let matchedText = ''

      for (const pattern of BLOCKER_PATTERNS) {
        const match = pattern.exec(line)
        if (match) {
          isBlocker = true
          matchedText = cleanSentence(match[1] || line)
          break
        }
      }

      if (isBlocker) {
        items.push({
          id: `blk-${msg.id}-${items.length + 1}`,
          type: 'blocker',
          title:
            matchedText.length > 90
              ? matchedText.substring(0, 87) + '...'
              : matchedText,
          description: cleanSentence(line),
          sender: msg.sender,
          timestamp: msg.timestamp,
          sourceMessageId: msg.id,
          urgency: 'High',
          urgencyScore: 5,
          urgencyReason: 'Active blocker requiring immediate resolution',
        })
      } else if (line.includes('?') || /^(who|what|where|when|why|how|anyone|can someone|is there|are we|does anyone)\b/i.test(line.trim())) {
        const questionText = cleanSentence(line)
        items.push({
          id: `qst-${msg.id}-${items.length + 1}`,
          type: 'blocker',
          title:
            questionText.length > 90
              ? questionText.substring(0, 87) + '...'
              : questionText,
          description: cleanSentence(line),
          sender: msg.sender,
          timestamp: msg.timestamp,
          sourceMessageId: msg.id,
          urgency: 'Medium',
          urgencyScore: 3,
          urgencyReason: 'Open question awaiting team response',
        })
      }
    }
  }

  return items
}

export function extractLinks(messages: ChatMessage[]): ExtractedItem[] {
  const items: ExtractedItem[] = []

  for (const msg of messages) {
    const urls = msg.text.match(URL_REGEX)
    if (urls) {
      for (const url of urls) {
        try {
          const parsed = new URL(url)
          const domain = parsed.hostname.replace(/^www\./, '')
          items.push({
            id: `link-${msg.id}-${items.length + 1}`,
            type: 'link',
            title: domain,
            description: cleanSentence(msg.text),
            sender: msg.sender,
            timestamp: msg.timestamp,
            sourceMessageId: msg.id,
            urgency: 'Low',
            urgencyScore: 1,
            urgencyReason: 'Shared reference link',
            url,
          })
        } catch {
          // If URL parsing fails, skip malformed URL
        }
      }
    }
  }

  return items
}

export function extractMentions(messages: ChatMessage[]): ExtractedItem[] {
  const items: ExtractedItem[] = []

  for (const msg of messages) {
    if (msg.isSystem) continue
    const matches = Array.from(msg.text.matchAll(MENTION_REGEX))
    for (const match of matches) {
      const mentionedName = match[1]?.trim()
      if (mentionedName && mentionedName.length > 1) {
        items.push({
          id: `men-${msg.id}-${items.length + 1}`,
          type: 'mention',
          title: `@${mentionedName}`,
          description: cleanSentence(msg.text),
          sender: msg.sender,
          timestamp: msg.timestamp,
          sourceMessageId: msg.id,
          urgency: 'Medium',
          urgencyScore: 2,
          urgencyReason: `Direct mention of ${mentionedName}`,
          assignee: mentionedName,
        })
      }
    }
  }

  return items
}
