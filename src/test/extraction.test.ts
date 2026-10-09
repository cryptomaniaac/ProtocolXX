import { describe, it, expect } from 'vitest'
import {
  extractDecisions,
  extractActionItems,
  extractBlockersAndQuestions,
  extractLinks,
  extractMentions,
} from '../lib/extraction'
import type { ChatMessage } from '../lib/types'

function makeMsg(id: string, sender: string, text: string, date = new Date()): ChatMessage {
  return {
    id,
    sender,
    text,
    timestamp: date,
    isSystem: false,
  }
}

describe('Pure Extraction Functions', () => {
  it('extracts decisions accurately', () => {
    const messages: ChatMessage[] = [
      makeMsg('1', 'Alex (fake)', 'Decided: We freeze the branch at 8 PM UTC.'),
      makeMsg('2', 'Sam (fake)', 'Agreed on postponing the export feature to v1.1.'),
      makeMsg('3', 'Taylor (fake)', 'Just a general status update.'),
      makeMsg('4', 'Jordan (fake)', 'Approved: Increase max_client_conn to 500 now.'),
    ]

    const decisions = extractDecisions(messages)
    expect(decisions).toHaveLength(3)
    expect(decisions[0].title).toContain('We freeze the branch')
    expect(decisions[1].title).toContain('postponing the export feature')
    expect(decisions[2].title).toContain('Increase max_client_conn')
  })

  it('extracts action items with assignees', () => {
    const messages: ChatMessage[] = [
      makeMsg('1', 'Alex (fake)', '@Sam (fake) please verify the payment webhook payload by 2 PM.'),
      makeMsg('2', 'Taylor (fake)', 'Taylor (fake) will run the test suite.'),
      makeMsg('3', 'Jordan (fake)', 'Action item: Morgan (fake) to review the database indexing.'),
      makeMsg('4', 'Casey (fake)', 'Looks good to me.'),
    ]

    const actions = extractActionItems(messages)
    expect(actions).toHaveLength(3)
    expect(actions[0].assignee).toContain('Sam (fake)')
    expect(actions[0].title).toContain('verify the payment webhook')
    expect(actions[1].title).toContain('run the test suite')
  })

  it('extracts blockers and questions', () => {
    const messages: ChatMessage[] = [
      makeMsg('1', 'Sam (fake)', 'Critical blocker: Staging SSL certificate expired!'),
      makeMsg('2', 'Taylor (fake)', 'Does anyone know who owns the rate-limiting configuration?'),
      makeMsg('3', 'Jordan (fake)', 'Blocked on DNS token renewal.'),
      makeMsg('4', 'Morgan (fake)', 'Working smoothly.'),
    ]

    const items = extractBlockersAndQuestions(messages)
    expect(items).toHaveLength(3)
    const blocker = items.find((i) => i.urgency === 'High')
    expect(blocker).toBeDefined()
    expect(blocker?.title).toContain('Staging SSL certificate expired')
  })

  it('extracts links with domain parsing', () => {
    const messages: ChatMessage[] = [
      makeMsg('1', 'Morgan (fake)', 'Check spec: https://docs.example-fake.internal/phoenix/spec [FAKE]'),
      makeMsg('2', 'Alex (fake)', 'PR ready at https://github.com/example-fake/protocol-x/pull/142'),
      makeMsg('3', 'Taylor (fake)', 'No link here.'),
    ]

    const links = extractLinks(messages)
    expect(links).toHaveLength(2)
    expect(links[0].url).toContain('https://docs.example-fake.internal')
    expect(links[0].title).toBe('docs.example-fake.internal')
    expect(links[1].title).toBe('github.com')
  })

  it('extracts @mentions', () => {
    const messages: ChatMessage[] = [
      makeMsg('1', 'Alex (fake)', 'Thanks @Sam (fake) and @Taylor (fake) for the review.'),
      makeMsg('2', 'Sam (fake)', 'No mentions here.'),
    ]

    const mentions = extractMentions(messages)
    expect(mentions.length).toBeGreaterThanOrEqual(2)
    expect(mentions.some((m) => m.title.includes('Sam (fake)'))).toBe(true)
  })
})
