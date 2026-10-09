import React, { useState, useEffect, useCallback } from 'react'
import type { ParsedChatData } from './lib/types'
import { parseChatWithWorker } from './lib/parseWorkerClient'
import { processChatMessages } from './lib/catchupEngine'
import { generateSampleChatText } from './lib/sampleChat'
import { TopBar } from './components/common/TopBar'
import { HelpModal } from './components/common/HelpModal'
import { LandingScreen } from './components/screens/LandingScreen'
import { ParsingScreen } from './components/screens/ParsingScreen'
import { ResultsScreen } from './components/screens/ResultsScreen'
import { ErrorScreen } from './components/screens/ErrorScreen'

type ScreenState = 'landing' | 'parsing' | 'results' | 'error'

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('landing')
  const [chatData, setChatData] = useState<ParsedChatData | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [parsingProgress, setParsingProgress] = useState<number>(0)
  const [parsingStatus, setParsingStatus] = useState<string>('')
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Theme management: only persists theme preference, never chat content
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('unread_catchup_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('unread_catchup_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('unread_catchup_theme', 'light')
    }
  }, [isDark])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  // Keyboard shortcut listener for '?'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '?' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        setIsHelpOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Process text into data model
  const processText = useCallback(async (text: string) => {
    setScreen('parsing')
    setParsingProgress(15)
    setParsingStatus('Reading chat file...')

    try {
      setParsingProgress(35)
      setParsingStatus('Validating export structure...')

      const rawMessages = await parseChatWithWorker(text, {
        timeoutMs: 5000,
        onProgress: (p, label) => {
          setParsingProgress(p)
          setParsingStatus(label)
        },
      })

      setParsingProgress(70)
      setParsingStatus('Extracting decisions, action items and blockers...')

      const processed = processChatMessages(rawMessages)

      setParsingProgress(100)
      setParsingStatus('Generating briefing...')

      // Brief transition to let progress bar smoothly complete
      setTimeout(() => {
        setChatData(processed)
        setScreen('results')
      }, 150)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown parsing error occurred.'
      setErrorMessage(msg)
      setScreen('error')
    }
  }, [])

  const handleFileSelected = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (text) {
          processText(text)
        } else {
          setErrorMessage('File could not be read or is empty.')
          setScreen('error')
        }
      }
      reader.onerror = () => {
        setErrorMessage('Failed to read file from disk.')
        setScreen('error')
      }
      reader.readAsText(file)
    },
    [processText]
  )

  const handleLoadSampleChat = useCallback(() => {
    const sampleText = generateSampleChatText()
    processText(sampleText)
  }, [processText])

  const handleClearData = useCallback(() => {
    // Ephemeral wipe: strictly removes all chat records from memory
    setChatData(null)
    setErrorMessage('')
    setParsingProgress(0)
    setParsingStatus('')
    setScreen('landing')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-base dark:bg-base-dark text-ink dark:text-ink-dark transition-colors duration-150">
      <TopBar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenHelp={() => setIsHelpOpen(true)}
        onClearData={handleClearData}
        hasData={screen === 'results' && chatData !== null}
      />

      {screen === 'landing' && (
        <LandingScreen
          onFileSelected={handleFileSelected}
          onLoadSampleChat={handleLoadSampleChat}
        />
      )}

      {screen === 'parsing' && (
        <ParsingScreen
          progress={parsingProgress}
          statusText={parsingStatus}
        />
      )}

      {screen === 'results' && chatData && (
        <ResultsScreen
          data={chatData}
          onClearData={handleClearData}
        />
      )}

      {screen === 'error' && (
        <ErrorScreen
          errorMessage={errorMessage}
          onReset={handleClearData}
          onTrySample={handleLoadSampleChat}
        />
      )}

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  )
}

export default App
