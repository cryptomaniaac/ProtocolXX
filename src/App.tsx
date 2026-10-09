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
  const [fileName, setFileName] = useState<string>('WhatsApp Chat.txt')
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Theme management: stores only the theme choice
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('unread_catchup_theme')
    if (saved) return saved === 'dark'
    return !window.matchMedia('(prefers-color-scheme: light)').matches
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.classList.add('dark')
      localStorage.setItem('unread_catchup_theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
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
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
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

    try {
      setParsingProgress(35)

      const rawMessages = await parseChatWithWorker(text, {
        timeoutMs: 5000,
        onProgress: (p) => {
          setParsingProgress(p)
        },
      })

      setParsingProgress(70)

      const processed = processChatMessages(rawMessages)

      setParsingProgress(100)

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
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (text) {
          processText(text)
        } else {
          setErrorMessage('Selected file is empty.')
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
    setFileName('Project Phoenix Launch [FAKE].txt')
    const sampleText = generateSampleChatText()
    processText(sampleText)
  }, [processText])

  const handleClearData = useCallback(() => {
    // Ephemeral wipe: strictly removes all chat records from memory
    setChatData(null)
    setErrorMessage('')
    setParsingProgress(0)
    setScreen('landing')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <TopBar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenHelp={() => setIsHelpOpen(true)}
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
          fileName={fileName}
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
