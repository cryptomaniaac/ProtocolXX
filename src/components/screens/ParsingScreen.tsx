import React from 'react'
import { Card } from '../common/Card'

export interface ParsingScreenProps {
  progress: number
  statusText: string
}

export const ParsingScreen: React.FC<ParsingScreenProps> = ({
  progress,
  statusText,
}) => {
  return (
    <main
      className="w-full flex-1 max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6 animate-in fade-in duration-150"
      aria-busy="true"
    >
      {/* Parsing progress indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[14px]">
          <span
            aria-live="polite"
            className="font-medium text-ink dark:text-ink-dark"
          >
            {statusText || 'Parsing chat messages...'}
          </span>
          <span className="font-mono text-[13px] text-ink-muted dark:text-ink-muted-dark">
            {Math.round(progress)}%
          </span>
        </div>

        {/* 4px Progress Bar */}
        <div className="w-full h-1 bg-border dark:bg-border-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A6B6B] dark:bg-[#2D9B9B] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
          />
        </div>
      </div>

      {/* Matching layout skeletons to prevent layout shift */}
      {/* 1. TL;DR Skeleton Card */}
      <Card className="space-y-4">
        <div className="h-5 bg-border dark:bg-border-dark rounded w-32 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3.5 bg-border dark:bg-border-dark rounded w-[90%] animate-pulse" />
          <div className="h-3.5 bg-border dark:bg-border-dark rounded w-[75%] animate-pulse" />
          <div className="h-3.5 bg-border dark:bg-border-dark rounded w-[60%] animate-pulse" />
        </div>
      </Card>

      {/* 2. Needs Attention Skeleton Card */}
      <div className="space-y-3 pt-2">
        <div className="h-5 bg-border dark:bg-border-dark rounded w-44 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-border dark:bg-border-dark rounded w-16 animate-pulse" />
                <div className="h-3 bg-border dark:bg-border-dark rounded w-20 animate-pulse" />
              </div>
              <div className="h-4 bg-border dark:bg-border-dark rounded w-[80%] animate-pulse" />
              <div className="h-3 bg-border dark:bg-border-dark rounded w-[55%] animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
