import React from 'react'
import type { UrgencyLevel } from '../../lib/types'
import { TriangleAlertIcon, ClockIcon, ArrowDownIcon } from './Icons'

export interface BadgeProps {
  level?: UrgencyLevel
  label?: string
  count?: number
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ level, label, count, className = '' }) => {
  // Count badge variant
  if (typeof count === 'number') {
    return (
      <span
        className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-sm font-semibold bg-accent-soft text-accent select-none ${className}`}
      >
        {count}
      </span>
    )
  }

  // Urgency badge
  const displayLabel = label || level || 'Low'
  const effectiveLevel = level || 'Low'

  let icon: React.ReactNode = null
  let badgeClasses = ''

  if (effectiveLevel === 'High') {
    icon = <TriangleAlertIcon className="w-4 h-4 shrink-0 text-high-fg" size={16} />
    badgeClasses = 'bg-high-bg text-high-fg'
  } else if (effectiveLevel === 'Medium') {
    icon = <ClockIcon className="w-4 h-4 shrink-0 text-medium-fg" size={16} />
    badgeClasses = 'bg-medium-bg text-medium-fg'
  } else {
    icon = <ArrowDownIcon className="w-4 h-4 shrink-0 text-low-fg" size={16} />
    badgeClasses = 'bg-low-bg text-low-fg'
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-sm font-normal select-none ${badgeClasses} ${className}`}
      aria-label={`Urgency: ${displayLabel}`}
    >
      {icon}
      <span>{displayLabel}</span>
    </span>
  )
}
