import React from 'react'
import type { UrgencyLevel } from '../../lib/types'
import { TriangleAlertIcon, ClockIcon, InfoIcon } from './Icons'

export interface BadgeProps {
  level: UrgencyLevel
  label?: string
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ level, label, className = '' }) => {
  const displayLabel = label || level

  let icon: React.ReactNode = null
  let textColour = ''
  let borderTint = ''

  if (level === 'High') {
    icon = <TriangleAlertIcon className="w-3.5 h-3.5 shrink-0 text-[#C96A2E] dark:text-[#E07A3B]" />
    textColour = 'text-[#A04515] dark:text-[#F09060]'
    borderTint = 'border-[#C96A2E]/30 bg-[#C96A2E]/5'
  } else if (level === 'Medium') {
    icon = <ClockIcon className="w-3.5 h-3.5 shrink-0 text-[#1A6B6B] dark:text-[#2D9B9B]" />
    textColour = 'text-[#145555] dark:text-[#52C5C5]'
    borderTint = 'border-[#1A6B6B]/30 bg-[#1A6B6B]/5'
  } else {
    icon = <InfoIcon className="w-3.5 h-3.5 shrink-0 text-[#6B7280] dark:text-[#9CA3AF]" />
    textColour = 'text-[#4B5563] dark:text-[#9CA3AF]'
    borderTint = 'border-[#6B7280]/30 bg-[#6B7280]/5'
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[12px] font-medium rounded border ${borderTint} ${textColour} ${className}`}
      aria-label={`Urgency: ${displayLabel}`}
    >
      {icon}
      <span>{displayLabel}</span>
    </span>
  )
}
