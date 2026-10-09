import React from 'react'
import { SunIcon, MoonIcon, HelpCircleIcon } from './Icons'
import { Button } from './Button'

export interface TopBarProps {
  isDark: boolean
  onToggleTheme: () => void
  onOpenHelp: () => void
  onClearData?: () => void
  hasData: boolean
}

export const TopBar: React.FC<TopBarProps> = ({
  isDark,
  onToggleTheme,
  onOpenHelp,
  onClearData,
  hasData,
}) => {
  return (
    <header className="w-full border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark transition-colors sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1A6B6B] dark:bg-[#2D9B9B] flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm select-none">
            UC
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-ink dark:text-ink-dark leading-none">
              Unread Catchup
            </h1>
            <span className="text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark">
              Local-first briefing
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {hasData && onClearData && (
            <Button
              variant="text"
              size="sm"
              data-testid="clear-data-button"
              onClick={onClearData}
              className="text-ink-muted hover:text-[#C96A2E] dark:hover:text-[#F09060] text-[13px] px-2 py-1"
              title="Clear all chat data from memory"
            >
              Clear data
            </Button>
          )}

          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="Keyboard shortcuts and help (?)"
            title="Shortcuts & Help (?)"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A6B6B]"
          >
            <HelpCircleIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1A6B6B]"
          >
            {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}
