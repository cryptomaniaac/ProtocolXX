import React, { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../../lib/types'
import { XIcon, MinusIcon, ChevronDownIcon } from './Icons'

export interface SourcePanelProps {
  selectedMessageId: string | null
  messages: ChatMessage[]
  onClose: () => void
  returnFocusRef?: React.RefObject<HTMLElement | null>
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  selectedMessageId,
  messages,
  onClose,
  returnFocusRef,
}) => {
  const [minimisedMessageId, setMinimisedMessageId] = useState<string | null>(null)
  const isMinimised = minimisedMessageId === selectedMessageId
  const activeMessageRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedMessageId) {
      const t = setTimeout(() => {
        activeMessageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 50)
      return () => clearTimeout(t)
    }
  }, [selectedMessageId])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedMessageId) {
        onClose()
        returnFocusRef?.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMessageId, onClose, returnFocusRef])

  if (!selectedMessageId) return null

  const selectedIndex = messages.findIndex((m) => m.id === selectedMessageId)
  if (selectedIndex === -1) return null

  const contextStart = Math.max(0, selectedIndex - 5)
  const contextEnd = Math.min(messages.length, selectedIndex + 6)
  const contextMessages = messages.slice(contextStart, contextEnd)

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleClose = () => {
    onClose()
    returnFocusRef?.current?.focus()
  }

  const messagesBody = (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {contextMessages.map((msg) => {
        const isTarget = msg.id === selectedMessageId
        return (
          <div
            key={msg.id}
            ref={isTarget ? activeMessageRef : undefined}
            className={`p-3 rounded-xl text-base ${
              isTarget
                ? 'bg-accent-soft border-l-2 border-accent pl-3 text-ink'
                : 'text-ink-muted'
            }`}
          >
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={`font-semibold ${isTarget ? 'text-ink' : 'text-ink-muted'}`}>
                {msg.sender}
              </span>
              <span className="text-ink-faint text-xs">
                {formatTime(msg.timestamp)}
              </span>
            </div>
            <p className="whitespace-pre-wrap break-words">
              {msg.text}
            </p>
          </div>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Bottom Sheet (Screen width < 1024px) */}
      <div
        role="dialog"
        aria-label="Source message"
        data-testid="source-panel"
        className="fixed inset-0 z-40 lg:hidden flex flex-col justify-end bg-black/60"
      >
        <div className="w-full bg-surface border-t border-border-strong rounded-t-2xl max-h-[70vh] flex flex-col overflow-hidden">
          <div className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
            <span className="text-base font-semibold text-ink">
              Source message
            </span>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close source message"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-card-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
              <XIcon className="w-5 h-5" size={20} />
            </button>
          </div>
          {messagesBody}
        </div>
      </div>

      {/* Desktop Floating Panel (Screen width >= 1024px) */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-label="Source message"
        data-testid="source-panel"
        className="hidden lg:flex fixed bottom-6 right-6 z-40 w-[420px] max-h-[60vh] bg-surface border border-border-strong rounded-2xl flex-col overflow-hidden"
      >
        <div className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
          <span className="text-base font-semibold text-ink">
            Source message
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMinimisedMessageId(isMinimised ? null : selectedMessageId)}
              aria-label={isMinimised ? 'Expand source message' : 'Minimise source message'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-card-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
              {isMinimised ? (
                <ChevronDownIcon className="w-4 h-4 rotate-180" size={16} />
              ) : (
                <MinusIcon className="w-4 h-4" size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close source message"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-card-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
              <XIcon className="w-4 h-4" size={16} />
            </button>
          </div>
        </div>
        {!isMinimised && messagesBody}
      </aside>
    </>
  )
}
