import React, { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../lib/types'
import { XIcon } from './Icons'

export interface SourcePanelProps {
  selectedMessageId: string | null
  messages: ChatMessage[]
  onClose: () => void
  isMobileDrawer?: boolean
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  selectedMessageId,
  messages,
  onClose,
  isMobileDrawer = false,
}) => {
  const activeMessageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedMessageId && activeMessageRef.current) {
      activeMessageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [selectedMessageId])

  if (!selectedMessageId) {
    if (isMobileDrawer) return null
    return (
      <div className="hidden lg:flex flex-col items-center justify-center p-8 border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark h-[520px] text-center text-ink-muted dark:text-ink-muted-dark">
        <p className="text-[14px]">
          Click any card to inspect its exact source message and surrounding context.
        </p>
      </div>
    )
  }

  const selectedIndex = messages.findIndex((m) => m.id === selectedMessageId)
  const currentMsg = selectedIndex !== -1 ? messages[selectedIndex] : null

  // Capture surrounding context (up to 2 previous, 2 subsequent)
  const contextStart = Math.max(0, selectedIndex - 2)
  const contextEnd = Math.min(messages.length, selectedIndex + 3)
  const contextMessages =
    selectedIndex !== -1 ? messages.slice(contextStart, contextEnd) : []

  const formatDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-border dark:border-border-dark mb-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#1A6B6B] dark:text-[#2D9B9B] uppercase">
            Source Context
          </span>
          <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark">
            {currentMsg ? formatDate(currentMsg.timestamp) : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close source view"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {contextMessages.map((msg) => {
          const isTarget = msg.id === selectedMessageId
          return (
            <div
              key={msg.id}
              ref={isTarget ? activeMessageRef : undefined}
              className={`p-3.5 rounded-lg text-[14px] transition-all leading-relaxed ${
                isTarget
                  ? 'bg-[#E6F0F0] dark:bg-[#1A3535] border border-[#1A6B6B] dark:border-[#2D9B9B] shadow-sm'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border border-transparent opacity-75'
              }`}
            >
              {isTarget && (
                <div className="text-[11px] font-bold text-[#1A6B6B] dark:text-[#2D9B9B] uppercase tracking-wider mb-1">
                  Source message
                </div>
              )}
              <div className="flex items-center justify-between text-[12px] text-ink-muted dark:text-ink-muted-dark mb-1">
                <span className="font-semibold text-ink dark:text-ink-dark">
                  {msg.sender}
                </span>
                <span>{formatDate(msg.timestamp)}</span>
              </div>
              <p className="whitespace-pre-wrap break-words font-normal" dir="auto">
                {msg.text}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (isMobileDrawer) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Source message drawer"
        className="fixed inset-0 z-40 bg-black/50 lg:hidden flex flex-col justify-end animate-in fade-in duration-150"
      >
        <div className="bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark rounded-t-xl p-5 max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="hidden lg:flex flex-col p-5 border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark sticky top-24 max-h-[calc(100vh-120px)] overflow-hidden shadow-sm">
      {content}
    </div>
  )
}
