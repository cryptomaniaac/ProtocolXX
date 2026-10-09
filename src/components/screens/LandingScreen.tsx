import React from 'react'
import { UploadZone } from '../common/UploadZone'
import { InputCard } from '../common/Card'
import { Chip } from '../common/Chip'
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
    <main className="w-full flex-1">
      <div className="max-w-[880px] mx-auto px-4 md:px-6 pt-12 md:pt-24 pb-16">
        {/* Headline */}
        <h1 className="text-[32px] sm:text-[44px] leading-[38px] sm:leading-[50px] font-semibold text-ink tracking-[-0.01em]">
          What did I miss?
        </h1>

        {/* Subtext */}
        <p className="mt-3 text-base leading-6 text-ink-muted max-w-[60ch]">
          Get a briefing from a long chat. Everything is processed on your device.
        </p>

        {/* 32px gap, then the input card */}
        <div className="mt-8">
          <InputCard>
            <UploadZone onFileSelected={onFileSelected} disabled={isLoading} />
          </InputCard>
        </div>

        {/* 24px below: chip with caption */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Chip
            data-testid="sample-button"
            onClick={onLoadSampleChat}
            disabled={isLoading}
          >
            Try sample chat
          </Chip>
          <span className="text-sm text-ink-faint">
            Uses fake demo data.
          </span>
        </div>

        {/* 48px gap, then privacy badge */}
        <div className="mt-12">
          <PrivacyBadge />
        </div>
      </div>
    </main>
  )
}
