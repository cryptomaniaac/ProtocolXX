import React, { useRef } from 'react'

export interface TabItem<T extends string = string> {
  id: T
  label: string
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[]
  activeTab: T
  onChange: (id: T) => void
  className?: string
  tabTestIdPrefix?: string
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  tabTestIdPrefix = 'filter-tab',
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (index + 1) % tabs.length
      onChange(tabs[nextIndex].id)
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      buttons?.[nextIndex]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = (index - 1 + tabs.length) % tabs.length
      onChange(tabs[prevIndex].id)
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      buttons?.[prevIndex]?.focus()
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Filter selection"
      className={`inline-flex items-center gap-1.5 p-1 rounded-full ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isSelected = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            data-testid={`${tabTestIdPrefix}-${tab.id.toLowerCase()}`}
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`h-9 px-4 rounded-full text-sm transition-colors cursor-pointer select-none ${
              isSelected
                ? 'border border-ink text-ink font-semibold bg-transparent'
                : 'border border-transparent text-ink-muted font-normal hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
