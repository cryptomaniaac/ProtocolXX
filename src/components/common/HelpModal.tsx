import React, { useEffect, useRef } from 'react'
import { XIcon, ShieldIcon } from './Icons'
import { Button } from './Button'

export interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
    >
      <div
        ref={modalRef}
        className="w-full max-w-[480px] bg-surface border border-border-strong rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close help"
          className="absolute top-4 right-4 w-11 h-11 rounded-xl flex items-center justify-center text-ink-muted hover:text-ink hover:bg-card-raised transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
        >
          <XIcon className="w-5 h-5" size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
            <ShieldIcon className="w-5 h-5" size={20} />
          </div>
          <h2 id="help-modal-title" className="text-xl font-semibold text-ink">
            Help and privacy
          </h2>
        </div>

        <div className="space-y-6 text-sm text-ink-muted leading-relaxed">
          <div>
            <h3 className="font-semibold text-ink text-base mb-1">
              What stays on your device
            </h3>
            <p>
              Your chat files are processed entirely in memory inside this browser using Web Workers. No text, names, timestamps, or metadata are ever transmitted across the network. All data is discarded when you clear data or leave the page.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink text-base mb-2">
              How to export a WhatsApp chat
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-ink text-sm">iOS (iPhone)</h4>
                <p>
                  Open the chat &rarr; tap contact/group name at top &rarr; scroll down &rarr; tap <strong>Export chat</strong> &rarr; choose <strong>Without media</strong> &rarr; save the .txt file.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-ink text-sm">Android</h4>
                <p>
                  Open the chat &rarr; tap three dots menu &rarr; tap <strong>More</strong> &rarr; tap <strong>Export chat</strong> &rarr; choose <strong>Without media</strong> &rarr; save the .txt file.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-ink text-base mb-1">
              Keyboard navigation
            </h3>
            <p>
              Press <kbd className="px-1.5 py-0.5 rounded border border-border text-ink font-mono text-xs">?</kbd> to open this help dialog, <kbd className="px-1.5 py-0.5 rounded border border-border text-ink font-mono text-xs">Esc</kbd> to close any dialog or source panel, and arrow keys to switch tabs.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
