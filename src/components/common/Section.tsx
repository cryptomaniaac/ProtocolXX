import React, { useState } from 'react'
import { ChevronRightIcon, ChevronDownIcon } from './Icons'

export interface SectionProps {
  id: string
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export const Section: React.FC<SectionProps> = ({
  id,
  title,
  count,
  defaultOpen = false,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div
      className={`border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark overflow-hidden transition-all ${className}`}
    >
      <button
        type="button"
        id={`header-${id}`}
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-[48px] px-4 md:px-6 py-3 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#1A6B6B]"
      >
        <div className="flex items-center gap-3">
          <span className="text-ink-muted dark:text-ink-muted-dark">
            {isOpen ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </span>
          <span className="font-semibold text-[16px] text-ink dark:text-ink-dark">
            {title}
          </span>
          {typeof count === 'number' && (
            <span className="text-[13px] font-medium text-ink-muted dark:text-ink-muted-dark bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div
          id={`panel-${id}`}
          role="region"
          aria-labelledby={`header-${id}`}
          className="px-4 md:px-6 pb-6 pt-2 border-t border-border dark:border-border-dark animate-in fade-in duration-200"
        >
          {children}
        </div>
      )}
    </div>
  )
}
