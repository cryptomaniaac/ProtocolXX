import { parseWhatsAppExport } from '../lib/parser'
import type { ParseOptions } from '../lib/types'

interface ParseRequest {
  type: 'PARSE'
  rawText: string
  options?: ParseOptions
}

self.onmessage = (event: MessageEvent<ParseRequest>) => {
  if (event.data?.type === 'PARSE') {
    try {
      const messages = parseWhatsAppExport(event.data.rawText, event.data.options)
      self.postMessage({ type: 'SUCCESS', messages })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown parsing error'
      self.postMessage({ type: 'ERROR', error: message })
    }
  }
}
