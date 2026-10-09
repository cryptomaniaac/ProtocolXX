import { useState, useEffect } from 'react'

export interface ResourceTimingLike {
  name: string
  initiatorType: string
}

/**
 * Filter resource requests to count only:
 * 1. Requests to other origins (external host calls)
 * 2. Any fetch, XHR, or beacon calls made after load
 *
 * Ignores the app's own same-origin static resource loads (JS, CSS, worker, fonts, icon).
 */
export function isOutboundNetworkRequest(
  entry: ResourceTimingLike,
  currentOrigin: string
): boolean {
  if (!entry.name) return false
  if (entry.name.startsWith('data:') || entry.name.startsWith('blob:')) {
    return false
  }

  let isCrossOrigin = false
  try {
    const parsed = new URL(entry.name, currentOrigin)
    isCrossOrigin = parsed.origin !== currentOrigin
  } catch {
    isCrossOrigin = true
  }

  const initiator = (entry.initiatorType || '').toLowerCase()
  const isDataCall =
    initiator === 'fetch' ||
    initiator === 'xmlhttprequest' ||
    initiator === 'beacon'

  return isCrossOrigin || isDataCall
}

export function useNetworkRequestCount(): number {
  const [requestCount, setRequestCount] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
      return
    }

    try {
      const currentOrigin = window.location.origin

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[]
        let newOutbound = 0

        for (const entry of entries) {
          if (
            isOutboundNetworkRequest(
              { name: entry.name, initiatorType: entry.initiatorType },
              currentOrigin
            )
          ) {
            newOutbound++
          }
        }

        if (newOutbound > 0) {
          setRequestCount((prev) => prev + newOutbound)
        }
      })

      observer.observe({ type: 'resource', buffered: false })

      return () => {
        observer.disconnect()
      }
    } catch {
      return
    }
  }, [])

  return requestCount
}
