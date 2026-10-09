import React, { useEffect } from 'react'
import { XIcon, ShieldIcon } from './Icons'

export interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close help modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#1A6B6B]/10 dark:bg-[#2D9B9B]/10 flex items-center justify-center text-[#1A6B6B] dark:text-[#2D9B9B]">
            <ShieldIcon className="w-4 h-4" />
          </div>
          <h2 id="help-modal-title" className="text-[18px] font-bold text-ink dark:text-ink-dark">
            Help & Privacy Reference
          </h2>
        </div>

        <div className="space-y-5 text-[14px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">
          <div>
            <h3 className="font-semibold text-ink dark:text-ink-dark text-[15px] mb-1">
              Local-First Privacy Architecture
            </h3>
            <p>
              Your chat files are processed entirely in your browser using local Web Workers. No text, timestamps, or phone numbers are ever sent over the network. When you refresh the page or click <strong>Clear data</strong>, all chat contents are immediately erased from memory.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink dark:text-ink-dark text-[15px] mb-2">
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/5">
                <kbd className="px-2 py-0.5 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark font-mono font-semibold text-ink dark:text-ink-dark">
                  /
                </kbd>
                <span>Focus search bar</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/5">
                <kbd className="px-2 py-0.5 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark font-mono font-semibold text-ink dark:text-ink-dark">
                  ?
                </kbd>
                <span>Open this help dialog</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/5">
                <kbd className="px-2 py-0.5 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark font-mono font-semibold text-ink dark:text-ink-dark">
                  Esc
                </kbd>
                <span>Close modal / panel</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-black/5 dark:bg-white/5">
                <kbd className="px-2 py-0.5 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark font-mono font-semibold text-ink dark:text-ink-dark">
                  Tab
                </kbd>
                <span>Keyboard navigation</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-ink dark:text-ink-dark text-[15px] mb-1">
              How to Export WhatsApp Chats
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open any group or individual chat in WhatsApp.</li>
              <li>Tap Group Info / Contact Details &rarr; <strong>Export Chat</strong>.</li>
              <li>Select <strong>Without Media</strong> to generate a clean .txt file.</li>
              <li>Drop the downloaded .txt file into the upload area.</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border dark:border-border-dark flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1A6B6B] hover:bg-[#145555] dark:bg-[#2D9B9B] dark:hover:bg-[#228383] text-white font-medium text-[14px] cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
