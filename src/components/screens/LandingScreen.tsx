import React from 'react'
import { UploadZone } from '../common/UploadZone'
import { Button } from '../common/Button'
import { PrivacyBadge } from '../common/PrivacyBadge'

export interface LandingScreenProps {
  onFileSelected: (file: File) => void
  onLoadSampleChat: () => void
  isLoading?: boolean
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onFileSelected,
  onLoadSampleChat,
  isLoading = false,
}) => {
  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 animate-in fade-in duration-200">
      <div className="w-full max-w-[600px] flex flex-col items-center text-center space-y-8">
        {/* Headline & Subtext */}
        <div className="space-y-3">
          <h1 className="text-[32px] md:text-[40px] font-bold text-ink dark:text-ink-dark tracking-tight leading-tight">
            What did I miss?
          </h1>
          <p className="text-[17px] md:text-[18px] text-ink-muted dark:text-ink-muted-dark readable-measure mx-auto">
            Get an instant briefing from long chat exports. Key decisions, action items, and blockers—computed entirely in your browser.
          </p>
        </div>

        {/* Upload Zone (Single Primary Action) */}
        <div className="w-full">
          <UploadZone onFileSelected={onFileSelected} disabled={isLoading} />
        </div>

        {/* Secondary Action: Try sample chat */}
        <div className="flex flex-col items-center gap-3 w-full">
          <span className="text-[13px] text-ink-muted dark:text-ink-muted-dark">or</span>
          <Button
            variant="outline"
            data-testid="sample-button"
            onClick={onLoadSampleChat}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 font-medium"
          >
            Try sample chat (Project Phoenix [FAKE])
          </Button>
        </div>

        {/* Privacy Badge */}
        <div className="pt-4">
          <PrivacyBadge />
        </div>
      </div>
    </main>
  )
}
