import React, { useState, useRef } from 'react'
import { UploadCloudIcon } from './Icons'

export interface UploadZoneProps {
  onFileSelected: (file: File) => void
  disabled?: boolean
  className?: string
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  disabled = false,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndHandle = (file: File) => {
    setErrorMessage(null)

    // Validate size (max 5 MB per GEMINI.md)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Only WhatsApp .txt exports up to 5 MB are supported.`
      )
      return
    }

    if (file.size === 0) {
      setErrorMessage('Selected file is empty.')
      return
    }

    // Validate type (.txt only)
    if (!file.name.toLowerCase().endsWith('.txt') && file.type && !file.type.includes('text')) {
      setErrorMessage('Only WhatsApp .txt exports up to 5 MB are supported.')
      return
    }

    onFileSelected(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndHandle(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndHandle(files[0])
      e.target.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        data-testid="upload"
        aria-label="Upload WhatsApp chat export (.txt)"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={`w-full min-h-[192px] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors border border-dashed select-none focus-visible:outline-2 focus-visible:outline-accent ${
          isDragOver
            ? 'border-accent bg-accent-soft'
            : 'border-border-strong bg-transparent hover:bg-card-raised'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,text/plain"
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          aria-hidden="true"
        />

        <div className="w-10 h-10 flex items-center justify-center text-ink-muted mb-3 pointer-events-none">
          <UploadCloudIcon className="w-6 h-6" size={24} />
        </div>

        <p className="text-base font-semibold text-ink text-center mb-1 pointer-events-none">
          Drop your WhatsApp .txt export here, or browse
        </p>
        <p className="text-sm text-ink-muted text-center pointer-events-none">
          iOS and Android exports, up to 5 MB.
        </p>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mt-3 text-sm text-high-fg bg-high-bg p-3 rounded-xl border border-border text-center"
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
