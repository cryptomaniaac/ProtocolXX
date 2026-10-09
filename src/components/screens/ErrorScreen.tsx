import React from 'react'
import { TriangleAlertIcon } from '../common/Icons'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

export interface ErrorScreenProps {
  errorMessage?: string
  onReset: () => void
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  errorMessage,
  onReset,
}) => {
  return (
    <main className="w-full flex-1">
      <div className="max-w-[880px] mx-auto px-4 md:px-6 pt-12 md:pt-24 pb-16">
        <h1 className="text-[32px] sm:text-[44px] leading-[38px] sm:leading-[50px] font-semibold text-ink tracking-[-0.01em]">
          What did I miss?
        </h1>

        <p className="mt-3 text-base leading-6 text-ink-muted max-w-[60ch]">
          Get a briefing from a long chat. Everything is processed on your device.
        </p>

        <div className="mt-8">
          <Card role="alert" className="p-8 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-card-raised border border-border flex items-center justify-center text-ink-muted">
              <TriangleAlertIcon className="w-6 h-6 text-ink" size={24} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-ink">
                We could not read that file
              </h2>
              <p className="text-base text-ink-muted leading-relaxed">
                {errorMessage || 'Only WhatsApp .txt exports up to 5 MB are supported.'}
              </p>
            </div>

            <div>
              <Button variant="primary" onClick={onReset}>
                Choose another file
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
