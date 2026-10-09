import React from 'react'
import { ShieldIcon } from './Icons'
import { useNetworkRequestCount } from '../../lib/networkObserver'

export interface PrivacyBadgeProps {
  className?: string
  showLiveCounter?: boolean
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({
  className = '',
  showLiveCounter = true,
}) => {
  const requestCount = useNetworkRequestCount()

  return (
    <div
      data-testid="privacy-badge"
      className={`inline-flex flex-wrap items-center justify-center gap-3 p-2 px-4 rounded-full border border-border bg-card text-sm text-ink-muted select-none ${className}`}
    >
      <div className="inline-flex items-center gap-2">
        <ShieldIcon className="w-4 h-4 text-accent shrink-0" size={16} />
        <span>Processed on your device. Nothing leaves this browser.</span>
      </div>

      {showLiveCounter && (
        <span
          data-testid="network-counter"
          className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-border text-ink-muted text-sm font-normal"
          title="Monitored via PerformanceObserver"
        >
          <span className="w-2 h-2 rounded-full bg-accent shrink-0 inline-block" />
          <span>Outbound requests: {requestCount}</span>
        </span>
      )}
    </div>
  )
}
