import type { ChatMessage, ParseOptions } from './types'

// Strip invisible formatting characters common in WhatsApp exports (LTR/RTL markers, BOM)
export function sanitizeLine(line: string): string {
  return line.replace(/[\u200e\u200f\u202a-\u202e\ufeff]/g, '').trimEnd()
}

interface ParsedHeader {
  dateStr: string
  timeStr: string
  rest: string
}

// Bounded linear-time header matchers (strictly ReDoS safe)
const BRACKET_HEADER_RE = /^\[(\d{1,4}[-/.]\d{1,2}[-/.]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s*(.*)$/
const DASH_HEADER_RE = /^(\d{1,4}[-/.]\d{1,2}[-/.]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s+-\s+(.*)$/

export function matchHeader(line: string): ParsedHeader | null {
  const bracketMatch = BRACKET_HEADER_RE.exec(line)
  if (bracketMatch) {
    return {
      dateStr: bracketMatch[1],
      timeStr: bracketMatch[2],
      rest: bracketMatch[3],
    }
  }

  const dashMatch = DASH_HEADER_RE.exec(line)
  if (dashMatch) {
    return {
      dateStr: dashMatch[1],
      timeStr: dashMatch[2],
      rest: dashMatch[3],
    }
  }

  return null
}

export type DateFormatOrder = 'DD/MM' | 'MM/DD' | 'YYYY/MM/DD'

export function detectDateOrder(dates: string[]): DateFormatOrder {
  let sawFirstGt12 = false
  let sawSecondGt12 = false
  let sawYearFirst = false

  for (const d of dates) {
    const parts = d.split(/[-/.]/).map((p) => parseInt(p, 10))
    if (parts.length !== 3 || parts.some(isNaN)) continue

    if (parts[0] > 1000) {
      sawYearFirst = true
      break
    }
    if (parts[0] > 12) sawFirstGt12 = true
    if (parts[1] > 12) sawSecondGt12 = true
  }

  if (sawYearFirst) return 'YYYY/MM/DD'
  if (sawFirstGt12 && !sawSecondGt12) return 'DD/MM'
  if (sawSecondGt12 && !sawFirstGt12) return 'MM/DD'
  return 'DD/MM' // default standard
}

export function parseDate(
  dateStr: string,
  timeStr: string,
  order: DateFormatOrder
): Date {
  const dateParts = dateStr.split(/[-/.]/).map((p) => parseInt(p, 10))
  if (dateParts.length !== 3 || dateParts.some(isNaN)) {
    return new Date(0)
  }

  let day = 1
  let month = 1
  let year = 2026

  if (order === 'YYYY/MM/DD') {
    year = dateParts[0]
    month = dateParts[1]
    day = dateParts[2]
  } else if (order === 'MM/DD') {
    month = dateParts[0]
    day = dateParts[1]
    year = dateParts[2]
  } else {
    // DD/MM
    day = dateParts[0]
    month = dateParts[1]
    year = dateParts[2]
  }

  // Handle 2-digit years
  if (year < 100) {
    year = year < 70 ? 2000 + year : 1900 + year
  }

  // Parse time
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AaPp][Mm]))?$/i
  const timeMatch = timeRegex.exec(timeStr.trim())

  let hours = 0
  let minutes = 0
  let seconds = 0

  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10)
    minutes = parseInt(timeMatch[2], 10)
    if (timeMatch[3]) seconds = parseInt(timeMatch[3], 10)
    const meridian = timeMatch[4]?.toUpperCase()

    if (meridian === 'PM' && hours < 12) {
      hours += 12
    } else if (meridian === 'AM' && hours === 12) {
      hours = 0
    }
  }

  // Month is 0-indexed in JS Date
  const result = new Date(year, month - 1, day, hours, minutes, seconds)
  return isNaN(result.getTime()) ? new Date(0) : result
}

const KNOWN_SYSTEM_PHRASES = [
  'end-to-end encrypted',
  'messages and calls are end-to-end encrypted',
  'created group',
  'added you',
  'left the group',
  'joined using this group',
  'changed the group description',
  'changed the subject',
  'changed this group',
  'security code changed',
  'deleted this message',
  'this message was deleted',
  'changed their phone number',
  'waiting for this message',
]

export function isSystemMessage(senderOrText: string): boolean {
  const lower = senderOrText.toLowerCase()
  return KNOWN_SYSTEM_PHRASES.some((phrase) => lower.includes(phrase))
}

export function parseWhatsAppExport(
  rawText: string,
  options: ParseOptions = {}
): ChatMessage[] {
  if (!rawText || !rawText.trim()) {
    throw new Error('Chat file is empty.')
  }

  const maxMessages = options.maxMessages ?? 50000
  const lines = rawText.split(/\r?\n/)

  // Pass 1: Collect date strings to detect DD/MM vs MM/DD reliably
  const sampleDates: string[] = []
  for (let i = 0; i < Math.min(lines.length, 500); i++) {
    const clean = sanitizeLine(lines[i])
    const header = matchHeader(clean)
    if (header) {
      sampleDates.push(header.dateStr)
    }
  }

  const dateOrder =
    options.dateFormatPreference === 'dd/mm'
      ? 'DD/MM'
      : options.dateFormatPreference === 'mm/dd'
        ? 'MM/DD'
        : detectDateOrder(sampleDates)

  const messages: ChatMessage[] = []
  let currentMessage: ChatMessage | null = null

  for (let i = 0; i < lines.length; i++) {
    const clean = sanitizeLine(lines[i])
    if (!clean && !currentMessage) continue

    const header = matchHeader(clean)

    if (header) {
      if (currentMessage) {
        messages.push(currentMessage)
        if (messages.length >= maxMessages) break
      }

      const timestamp = parseDate(header.dateStr, header.timeStr, dateOrder)
      const rest = header.rest

      // Look for sender delimiter ": "
      const colonIdx = rest.indexOf(': ')
      if (colonIdx !== -1) {
        const potentialSender = rest.substring(0, colonIdx).trim()
        const messageText = rest.substring(colonIdx + 2)

        currentMessage = {
          id: `msg-${messages.length + 1}`,
          timestamp,
          sender: potentialSender || 'Unknown',
          text: messageText,
          isSystem: isSystemMessage(messageText),
          rawLineIndex: i,
        }
      } else {
        // System notification
        currentMessage = {
          id: `msg-${messages.length + 1}`,
          timestamp,
          sender: 'System',
          text: rest,
          isSystem: true,
          rawLineIndex: i,
        }
      }
    } else if (currentMessage) {
      // Continuation line for multi-line message
      currentMessage.text += '\n' + clean
    }
  }

  if (currentMessage && messages.length < maxMessages) {
    messages.push(currentMessage)
  }

  if (messages.length === 0) {
    throw new Error(
      'No chat messages found. Please ensure this file is a valid WhatsApp chat export (.txt).'
    )
  }

  return messages
}
