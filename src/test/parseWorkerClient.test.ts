import { describe, it, expect } from 'vitest'
import { parseChatWithWorker } from '../lib/parseWorkerClient'

describe('Parse Worker Client', () => {
  it('parses chat using parseChatWithWorker (fallback in node env)', async () => {
    const raw = `[12/03/2026, 14:05:00] Alex (fake): Worker test message`
    let progressSeen = false

    const messages = await parseChatWithWorker(raw, {
      onProgress: (p) => {
        if (p > 0) progressSeen = true
      },
    })

    expect(messages).toHaveLength(1)
    expect(messages[0].sender).toBe('Alex (fake)')
    expect(progressSeen).toBe(true)
  })

  it('rejects on invalid chat content', async () => {
    await expect(parseChatWithWorker('')).rejects.toThrow('Chat file is empty')
  })
})
