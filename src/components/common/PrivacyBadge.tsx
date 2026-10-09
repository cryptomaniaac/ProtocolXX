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
      className={`inline-flex flex-wrap items-center justify-center gap-2 text-[13px] text-ink-muted dark:text-ink-muted-dark ${className}`}
    >
      <div className="inline-flex items-center gap-1.5 font-medium">
        <ShieldIcon className="w-4 h-4 text-[#1A6B6B] dark:text-[#2D9B9B] shrink-0" />
        <span>Processed on your device. Nothing leaves this browser.</span>
      </div>

      {showLiveCounter && (
        <span
          className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded border border-[#1A6B6B]/20 bg-[#1A6B6B]/5 text-[#1A6B6B] dark:text-[#2D9B9B]"
          title="Monitored via PerformanceObserver"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Outbound network calls: {requestCount}</span>
        </span>
      )}
    </div>
  )
}
