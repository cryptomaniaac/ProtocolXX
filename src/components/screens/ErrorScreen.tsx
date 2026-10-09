import React from 'react'
import { InfoIcon } from '../common/Icons'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

export interface ErrorScreenProps {
  errorMessage: string
  onReset: () => void
  onTrySample: () => void
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  errorMessage,
  onReset,
  onTrySample,
}) => {
  return (
    <main className="w-full flex-1 max-w-[600px] mx-auto px-4 md:px-6 py-12 md:py-16 flex flex-col items-center justify-center animate-in fade-in duration-150">
      <Card className="w-full text-center p-8 space-y-6">
        <div className="w-12 h-12 rounded-full border border-border dark:border-border-dark bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-ink-muted dark:text-ink-muted-dark">
          <InfoIcon className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-[20px] font-semibold text-ink dark:text-ink-dark">
            Unable to parse chat export
          </h2>
          <p className="text-[15px] text-ink-muted dark:text-ink-muted-dark leading-relaxed">
            {errorMessage ||
              'We could not detect valid WhatsApp messages in this file. Please make sure the export was saved without media as a .txt file.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            Try another file
          </Button>
          <Button
            variant="outline"
            onClick={onTrySample}
            className="w-full sm:w-auto"
          >
            Try sample chat
          </Button>
        </div>
      </Card>
    </main>
  )
}
