import React from 'react'
import { SunIcon, MoonIcon, CircleHelpIcon } from './Icons'

export interface TopBarProps {
  isDark: boolean
  onToggleTheme: () => void
  onOpenHelp: () => void
  userEmail?: string
  onLogout?: () => void
}

export const TopBar: React.FC<TopBarProps> = ({
  isDark,
  onToggleTheme,
  onOpenHelp,
  userEmail,
  onLogout,
}) => {
  return (
    <header className="w-full h-16 border-b border-border bg-surface sticky top-0 z-30">
      <div className="max-w-[1120px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-on-accent font-semibold text-base select-none shrink-0">
            UC
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-xl font-semibold text-ink leading-none">
              Unread Catchup
            </span>
            <span className="hidden sm:inline text-sm text-ink-muted leading-none">
              Local-first briefing
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="help-button"
            onClick={onOpenHelp}
            aria-label="Help and privacy reference"
            title="Help (?)"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-card-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
          >
            <CircleHelpIcon className="w-5 h-5" size={20} />
          </button>

          {userEmail && onLogout && (
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 h-9">
              <span className="text-xs text-ink-muted hidden sm:inline max-w-[140px] truncate">
                {userEmail}
              </span>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Sign out"
                className="text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer"
                data-testid="logout-btn"
              >
                Sign out
              </button>
            </div>
          )}

          <button
            type="button"
            data-testid="theme-toggle"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-card-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
          >
            {isDark ? <SunIcon className="w-5 h-5" size={20} /> : <MoonIcon className="w-5 h-5" size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
