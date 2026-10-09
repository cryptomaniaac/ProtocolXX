import React, { useState } from 'react'
import { ChevronRightIcon, ChevronDownIcon } from './Icons'
import { Badge } from './Badge'

export interface SectionProps {
  id: string
  title: string
  count?: number
  defaultOpen?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const Section: React.FC<SectionProps> = ({
  id,
  title,
  count,
  defaultOpen = false,
  icon,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section
      id={id}
      className={`border border-border rounded-2xl bg-card overflow-hidden transition-colors ${className}`}
    >
      <button
        type="button"
        id={`header-${id}`}
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-[52px] px-6 py-4 flex items-center justify-between text-left hover:bg-card-raised transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div className="flex items-center gap-3">
          <span className="text-ink-muted">
            {isOpen ? (
              <ChevronDownIcon className="w-5 h-5" size={20} />
            ) : (
              <ChevronRightIcon className="w-5 h-5" size={20} />
            )}
          </span>
          {icon && <span className="text-ink-muted">{icon}</span>}
          <h2 className="text-xl font-semibold text-ink leading-tight">
            {title}
          </h2>
          {typeof count === 'number' && <Badge count={count} />}
        </div>
      </button>

      {isOpen && (
        <div
          id={`panel-${id}`}
          role="region"
          aria-labelledby={`header-${id}`}
          className="px-6 pb-6 pt-2 border-t border-border"
        >
          {children}
        </div>
      )}
    </section>
  )
}
