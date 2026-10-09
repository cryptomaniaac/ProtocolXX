import type { ChatMessage, ParseOptions } from './types'
import { parseWhatsAppExport } from './parser'

export interface ParseWorkerOptions extends ParseOptions {
  timeoutMs?: number
  onProgress?: (progress: number, label: string) => void
}

export function parseChatWithWorker(
  rawText: string,
  options: ParseWorkerOptions = {}
): Promise<ChatMessage[]> {
  const timeoutMs = options.timeoutMs ?? 5000

  // Fallback to synchronous execution if Worker is not supported (e.g., node test environment)
  if (typeof Worker === 'undefined') {
    return new Promise((resolve, reject) => {
      try {
        options.onProgress?.(30, 'Reading chat file...')
        const messages = parseWhatsAppExport(rawText, options)
        options.onProgress?.(100, 'Parsing complete')
        resolve(messages)
      } catch (err) {
        reject(err)
      }
    })
  }

  return new Promise((resolve, reject) => {
    let worker: Worker | null = null
    let timer: ReturnType<typeof setTimeout> | null = null

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      if (worker) {
        worker.terminate()
        worker = null
      }
    }

    try {
      worker = new Worker(
        new URL('../workers/parser.worker.ts', import.meta.url),
        { type: 'module' }
      )

      timer = setTimeout(() => {
        cleanup()
        reject(new Error(`Parsing timed out after ${timeoutMs / 1000} seconds.`))
      }, timeoutMs)

      options.onProgress?.(25, 'Reading file structure...')

      worker.onmessage = (event) => {
        const data = event.data
        if (data?.type === 'SUCCESS') {
          options.onProgress?.(100, 'Parsing complete')
          cleanup()
          // Re-hydrate Date objects if serialized across worker boundary
          const hydratedMessages = (data.messages as ChatMessage[]).map((m) => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
          }))
          resolve(hydratedMessages)
        } else {
          cleanup()
          reject(new Error(data?.error || 'Worker failed to parse chat.'))
        }
      }

      worker.onerror = (error) => {
        cleanup()
        reject(new Error(error.message || 'Worker thread encountered an error.'))
      }

      options.onProgress?.(50, 'Tokenising messages...')
      worker.postMessage({ type: 'PARSE', rawText, options })
    } catch {
      // In case Worker constructor fails (e.g. restricted environment), fallback to sync
      cleanup()
      try {
        const messages = parseWhatsAppExport(rawText, options)
        resolve(messages)
      } catch (err) {
        reject(err)
      }
    }
  })
}
