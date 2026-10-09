import React, { useState, useRef } from 'react'
import { ArrowUpFromTrayIcon } from './Icons'

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
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please upload a chat file under 5 MB.`
      )
      return
    }

    if (file.size === 0) {
      setErrorMessage('Selected file is empty. Please upload an active chat export.')
      return
    }

    // Validate type (.txt only)
    if (!file.name.toLowerCase().endsWith('.txt') && file.type && !file.type.includes('text')) {
      setErrorMessage('Only .txt files are supported. Please export your WhatsApp chat as a text file.')
      return
    }

    onFileSelected(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
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
      // Reset input value so re-selecting the same file fires change event
      e.target.value = ''
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <label
        data-testid="upload-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full min-h-[160px] md:min-h-[180px] rounded-lg p-6 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed select-none focus-within:ring-2 focus-within:ring-[#1A6B6B] ${
          isDragOver
            ? 'border-[#1A6B6B] bg-[#1A6B6B]/15 dark:border-[#2D9B9B] dark:bg-[#2D9B9B]/20 scale-[0.99]'
            : 'border-[#1A6B6B]/40 hover:border-[#1A6B6B] bg-[#1A6B6B]/[0.04] hover:bg-[#1A6B6B]/[0.08] dark:border-[#2D9B9B]/40 dark:hover:border-[#2D9B9B] dark:bg-[#2D9B9B]/[0.05]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,text/plain"
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          aria-label="Upload WhatsApp chat export file (.txt)"
        />

        <div className="w-12 h-12 rounded-full bg-[#1A6B6B]/10 dark:bg-[#2D9B9B]/10 flex items-center justify-center text-[#1A6B6B] dark:text-[#2D9B9B] mb-3">
          <ArrowUpFromTrayIcon className="w-6 h-6" />
        </div>

        <p className="text-[16px] font-semibold text-ink dark:text-ink-dark text-center mb-1">
          Drop your WhatsApp .txt export here, or <span className="text-[#1A6B6B] dark:text-[#2D9B9B] underline underline-offset-2">browse</span>
        </p>
        <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark text-center">
          Supports iOS & Android text formats (up to 5 MB)
        </p>
      </label>

      {errorMessage && (
        <p
          role="alert"
          className="mt-3 text-[14px] text-[#A04515] dark:text-[#F09060] bg-[#C96A2E]/10 p-3 rounded-lg border border-[#C96A2E]/30 text-center"
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
