import React from 'react'
import { InputCard } from '../common/Card'

export interface ParsingScreenProps {
  progress: number
  statusText?: string
  fileName?: string
}

function getProgressWidthClass(p: number): string {
  if (p <= 15) return 'w-[15%]'
  if (p <= 35) return 'w-[35%]'
  if (p <= 50) return 'w-[50%]'
  if (p <= 70) return 'w-[70%]'
  if (p <= 85) return 'w-[85%]'
  return 'w-full'
}

export const ParsingScreen: React.FC<ParsingScreenProps> = ({
  progress,
  fileName = 'WhatsApp Chat.txt',
}) => {
  const widthClass = getProgressWidthClass(progress)

  return (
    <main className="w-full flex-1" aria-busy="true">
      <div className="max-w-[880px] mx-auto px-4 md:px-6 pt-12 md:pt-24 pb-16">
        <h1 className="text-[32px] sm:text-[44px] leading-[38px] sm:leading-[50px] font-semibold text-ink tracking-[-0.01em]">
          What did I miss?
        </h1>

        <p className="mt-3 text-base leading-6 text-ink-muted max-w-[60ch]">
          Get a briefing from a long chat. Everything is processed on your device.
        </p>

        {/* Input card showing file name, determinate progress bar, text Reading messages */}
        <div className="mt-8">
          <InputCard>
            <div className="min-h-[192px] flex flex-col justify-center px-4 py-6 space-y-4">
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-ink truncate max-w-[80%]">
                  {fileName}
                </span>
                <span className="text-sm text-ink-muted">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Determinate progress bar (4px, solid --accent on --card-raised, pill radius) */}
              <div className="w-full h-1 bg-card-raised rounded-full overflow-hidden">
                <div
                  className={`h-full bg-accent rounded-full transition-all duration-200 ${widthClass}`}
                />
              </div>

              <p aria-live="polite" className="text-sm text-ink-muted">
                Reading messages
              </p>
            </div>
          </InputCard>
        </div>

        {/* Three static skeleton blocks in --card-raised sized like result cards, no animation */}
        <div className="mt-8 space-y-6">
          <div className="h-28 rounded-2xl bg-card-raised border border-border" />
          <div className="h-28 rounded-2xl bg-card-raised border border-border" />
          <div className="h-28 rounded-2xl bg-card-raised border border-border" />
        </div>
      </div>
    </main>
  )
}
