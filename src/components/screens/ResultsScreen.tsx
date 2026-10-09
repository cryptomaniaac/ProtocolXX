import React, { useState, useMemo, useRef } from 'react'
import type { ParsedChatData } from '../../lib/types'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { Tabs } from '../common/Tabs'
import { Section } from '../common/Section'
import { SourcePanel } from '../common/SourcePanel'
import {
  ListIcon,
  BellIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  AtSignIcon,
  ClockIcon,
} from '../common/Icons'
import { generateCatchupSummary } from '../../lib/tldr'

export interface ResultsScreenProps {
  data: ParsedChatData
  onClearData: () => void
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  data,
  onClearData,
}) => {
  // Navigation / active section
  const [activeSection, setActiveSection] = useState<string>('summary')

  // Controls card state
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [lastSeenString, setLastSeenString] = useState<string>(() => {
    if (data.startDate) {
      const d = new Date(data.startDate.getTime() - 60000)
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
    return ''
  })

  // Urgency filter tab for "Needs your attention"
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [showAllAttention, setShowAllAttention] = useState<boolean>(false)

  // Source message inspection
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const lastActiveElementRef = useRef<HTMLElement | null>(null)

  // Timeline pagination
  const [timelinePage, setTimelinePage] = useState<number>(1)
  const TIMELINE_PAGE_SIZE = 50

  // Copy toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const lastSeenInputRef = useRef<HTMLInputElement>(null)

  const lastSeenDate = useMemo(() => {
    if (!lastSeenString) return null
    const parsed = new Date(lastSeenString)
    return isNaN(parsed.getTime()) ? null : parsed
  }, [lastSeenString])

  // Filter messages by last seen time and participant
  const unreadMessages = useMemo(() => {
    let msgs = data.messages
    if (lastSeenDate) {
      msgs = msgs.filter((m) => m.timestamp > lastSeenDate)
    }
    if (selectedUser !== 'all') {
      msgs = msgs.filter((m) => m.sender === selectedUser)
    }
    return msgs
  }, [data.messages, lastSeenDate, selectedUser])

  const unreadMessageIds = useMemo(() => {
    return new Set(unreadMessages.map((m) => m.id))
  }, [unreadMessages])

  const unreadDecisions = useMemo(
    () => data.decisions.filter((item) => unreadMessageIds.has(item.sourceMessageId)),
    [data.decisions, unreadMessageIds]
  )
  const unreadActionItems = useMemo(
    () => data.actionItems.filter((item) => unreadMessageIds.has(item.sourceMessageId)),
    [data.actionItems, unreadMessageIds]
  )
  const unreadBlockers = useMemo(
    () => data.blockers.filter((item) => unreadMessageIds.has(item.sourceMessageId)),
    [data.blockers, unreadMessageIds]
  )
  const unreadMentions = useMemo(
    () => data.mentions.filter((item) => unreadMessageIds.has(item.sourceMessageId)),
    [data.mentions, unreadMessageIds]
  )
  const unreadAttention = useMemo(
    () => data.attentionItems.filter((item) => unreadMessageIds.has(item.sourceMessageId)),
    [data.attentionItems, unreadMessageIds]
  )

  // Filtered attention by urgency tab
  const filteredAttention = useMemo(() => {
    if (urgencyFilter === 'All') return unreadAttention
    return unreadAttention.filter((item) => item.urgency === urgencyFilter)
  }, [unreadAttention, urgencyFilter])

  const displayedAttention = useMemo(() => {
    if (showAllAttention) return filteredAttention
    return filteredAttention.slice(0, 5)
  }, [filteredAttention, showAllAttention])

  // Summary calculation
  const currentSummary = useMemo(() => {
    if (unreadMessages.length === data.messages.length) {
      return data.summary.summaryText
    }
    const computed = generateCatchupSummary(
      unreadMessages,
      unreadDecisions,
      unreadActionItems,
      unreadBlockers
    )
    return computed.summaryText
  }, [data.messages.length, data.summary.summaryText, unreadMessages, unreadDecisions, unreadActionItems, unreadBlockers])

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(currentSummary)
      setToastMessage('Summary copied.')
      setTimeout(() => setToastMessage(null), 2000)
    } catch {
      setToastMessage('Summary copied.')
      setTimeout(() => setToastMessage(null), 2000)
    }
  }

  const handleClearData = () => {
    setToastMessage('Data cleared.')
    setTimeout(() => {
      onClearData()
    }, 150)
  }

  const handleInspectMessage = (messageId: string, event?: React.MouseEvent<HTMLElement>) => {
    if (event?.currentTarget) {
      lastActiveElementRef.current = event.currentTarget
    }
    setSelectedMessageId(messageId)
  }

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateTime = (d: Date) => {
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const navItems = [
    { id: 'summary', label: 'Summary', count: undefined },
    { id: 'attention', label: 'Needs your attention', count: unreadAttention.length },
    { id: 'decisions', label: 'Decisions', count: unreadDecisions.length },
    { id: 'actions', label: 'Action items', count: unreadActionItems.length },
    { id: 'mentions', label: 'Mentions', count: unreadMentions.length },
    { id: 'timeline', label: 'Timeline', count: unreadMessages.length },
  ]

  const urgencyTabs: { id: 'All' | 'High' | 'Medium' | 'Low'; label: string }[] = [
    { id: 'All', label: 'All' },
    { id: 'High', label: 'High' },
    { id: 'Medium', label: 'Medium' },
    { id: 'Low', label: 'Low' },
  ]

  const isEmpty = unreadMessages.length === 0

  return (
    <main data-testid="results" className="w-full flex-1 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 bg-card border border-border-strong text-ink px-4 py-2.5 rounded-xl text-sm font-semibold select-none"
        >
          {toastMessage}
        </div>
      )}

      {/* Mobile Sticky Section Chips (< 1024px) */}
      <nav
        aria-label="Section navigation"
        className="lg:hidden sticky top-16 z-20 bg-surface border-b border-border px-4 py-2.5 overflow-x-auto whitespace-nowrap"
      >
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`h-9 px-4 rounded-full text-sm font-normal border transition-colors cursor-pointer select-none shrink-0 ${
                activeSection === item.id
                  ? 'border-border-strong bg-accent-soft text-ink font-semibold'
                  : 'border-border bg-transparent text-ink-muted hover:bg-card-raised'
              }`}
            >
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span className="ml-1.5 text-xs text-accent font-semibold">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Layout: Desktop Two Columns (>= 1024px) */}
      <div className="max-w-[1120px] mx-auto w-full flex-1 flex flex-col lg:flex-row">
        {/* Left Side Nav (240px, sticky on desktop) */}
        <aside
          aria-label="Navigation sidebar"
          className="hidden lg:flex w-[240px] bg-surface border-r border-border sticky top-16 h-[calc(100vh-64px)] p-4 flex-col justify-between shrink-0"
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl text-left transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'bg-accent-soft border-l-2 border-accent text-ink font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-card-raised'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {typeof item.count === 'number' && (
                    <Badge count={item.count} />
                  )}
                </button>
              )
            })}
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <Button
              variant="secondary"
              fullWidth
              data-testid="copy-summary"
              onClick={handleCopySummary}
            >
              Copy summary
            </Button>
            <Button
              variant="secondary"
              fullWidth
              data-testid="clear-data"
              onClick={handleClearData}
            >
              Clear data
            </Button>
          </div>
        </aside>

        {/* Main Column (max-w 720, 32px padding) */}
        <div className="flex-1 max-w-[720px] mx-auto w-full p-4 sm:p-8 space-y-8">
          {/* 1. Controls Card */}
          <Card className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="who-are-you-select"
                  className="block text-sm font-semibold text-ink mb-1.5"
                >
                  Who are you?
                </label>
                <select
                  id="who-are-you-select"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-ink text-sm font-normal focus-visible:outline-2 focus-visible:outline-accent cursor-pointer"
                >
                  <option value="all">All participants</option>
                  {data.participants.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="last-seen-input"
                  className="block text-sm font-semibold text-ink mb-1.5"
                >
                  Last seen
                </label>
                <input
                  ref={lastSeenInputRef}
                  id="last-seen-input"
                  type="datetime-local"
                  value={lastSeenString}
                  onChange={(e) => setLastSeenString(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-card text-ink text-sm font-normal focus-visible:outline-2 focus-visible:outline-accent cursor-pointer"
                />
              </div>
            </div>

            <p className="text-sm text-ink-muted">
              {unreadMessages.length === data.messages.length
                ? `Showing all ${data.messages.length} messages in this export.`
                : `Showing ${unreadMessages.length} unread messages out of ${data.messages.length} total.`}
            </p>
          </Card>

          {/* Empty State */}
          {isEmpty ? (
            <Card className="text-center p-8 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-card-raised border border-border flex items-center justify-center mx-auto text-ink-muted">
                <ClockIcon className="w-6 h-6" size={24} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-ink">
                  No unread messages
                </h2>
                <p className="text-base text-ink-muted">
                  Nothing new since your last seen time. Try an earlier time.
                </p>
              </div>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (data.startDate) {
                      const d = new Date(data.startDate.getTime() - 60000)
                      const pad = (n: number) => String(n).padStart(2, '0')
                      setLastSeenString(
                        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
                      )
                    }
                  }}
                >
                  Change last seen
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* 2. Summary Card */}
              <div id="summary">
                <Card data-testid="summary" className="space-y-3">
                  <div className="flex items-center gap-3">
                    <ListIcon className="w-5 h-5 text-ink-muted" size={20} />
                    <h2 className="text-xl font-semibold text-ink">Summary</h2>
                  </div>
                  <p className="text-base leading-6 text-ink whitespace-pre-line">
                    {currentSummary}
                  </p>
                </Card>
              </div>

              {/* 3. Needs your attention */}
              <div id="attention" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <BellIcon className="w-5 h-5 text-ink-muted" size={20} />
                    <h2 className="text-xl font-semibold text-ink">
                      Needs your attention
                    </h2>
                    <Badge count={filteredAttention.length} />
                  </div>

                  <Tabs
                    tabs={urgencyTabs}
                    activeTab={urgencyFilter}
                    onChange={(tab) => {
                      setUrgencyFilter(tab)
                      setShowAllAttention(false)
                    }}
                    tabTestIdPrefix="filter-tab"
                  />
                </div>

                <div data-testid="attention-list" className="space-y-4">
                  {displayedAttention.length === 0 ? (
                    <Card className="p-6 text-center text-sm text-ink-muted">
                      No attention items found for {urgencyFilter} urgency.
                    </Card>
                  ) : (
                    displayedAttention.map((item) => (
                      <Card
                        key={item.id}
                        interactive
                        data-testid="attention-item"
                        onClick={(e) => handleInspectMessage(item.sourceMessageId, e)}
                        className="space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <Badge level={item.urgency} />
                          <span className="text-sm text-ink-faint">
                            {formatTime(item.timestamp)}
                          </span>
                        </div>

                        <p className="text-base text-ink line-clamp-3 leading-6">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm text-ink-muted">
                            {item.urgencyReason}
                          </span>
                          <span className="text-accent text-sm font-semibold hover:underline">
                            View in chat
                          </span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                {filteredAttention.length > 5 && (
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      data-testid="show-all"
                      onClick={() => setShowAllAttention((prev) => !prev)}
                    >
                      {showAllAttention ? 'Show top 5' : `Show all (${filteredAttention.length})`}
                    </Button>
                  </div>
                )}
              </div>

              {/* 4. Collapsible Sections: Decisions, Action items, Mentions, Timeline */}
              <div className="space-y-6">
                {/* Decisions */}
                <Section
                  id="decisions"
                  title="Decisions"
                  count={unreadDecisions.length}
                  icon={<CheckCircleIcon className="w-5 h-5 text-ink-muted" size={20} />}
                >
                  {unreadDecisions.length === 0 ? (
                    <p className="text-sm text-ink-muted py-2">No decisions recorded.</p>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {unreadDecisions.map((dec) => (
                        <div
                          key={dec.id}
                          onClick={(e) => handleInspectMessage(dec.sourceMessageId, e)}
                          className="p-4 rounded-xl border border-border bg-card hover:bg-card-raised hover:border-border-strong cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-ink">{dec.sender}</span>
                            <span className="text-ink-faint">{formatTime(dec.timestamp)}</span>
                          </div>
                          <p className="text-base text-ink">{dec.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Action Items */}
                <Section
                  id="actions"
                  title="Action items"
                  count={unreadActionItems.length}
                  icon={<ClipboardListIcon className="w-5 h-5 text-ink-muted" size={20} />}
                >
                  {unreadActionItems.length === 0 ? (
                    <p className="text-sm text-ink-muted py-2">No action items recorded.</p>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {unreadActionItems.map((act) => (
                        <div
                          key={act.id}
                          onClick={(e) => handleInspectMessage(act.sourceMessageId, e)}
                          className="p-4 rounded-xl border border-border bg-card hover:bg-card-raised hover:border-border-strong cursor-pointer transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-ink">{act.sender}</span>
                            <span className="text-ink-faint">{formatTime(act.timestamp)}</span>
                          </div>
                          <p className="text-base text-ink">{act.description}</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {act.assignee && (
                              <span className="px-2.5 py-0.5 rounded-full border border-border text-xs text-ink-muted">
                                Owner: {act.assignee}
                              </span>
                            )}
                            <Badge level={act.urgency} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Mentions */}
                <Section
                  id="mentions"
                  title="Mentions"
                  count={unreadMentions.length}
                  icon={<AtSignIcon className="w-5 h-5 text-ink-muted" size={20} />}
                >
                  {unreadMentions.length === 0 ? (
                    <p className="text-sm text-ink-muted py-2">No mentions recorded.</p>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {unreadMentions.map((men) => (
                        <div
                          key={men.id}
                          onClick={(e) => handleInspectMessage(men.sourceMessageId, e)}
                          className="p-4 rounded-xl border border-border bg-card hover:bg-card-raised hover:border-border-strong cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-ink">{men.title}</span>
                            <span className="text-ink-faint">from {men.sender}</span>
                          </div>
                          <p className="text-base text-ink">{men.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Timeline */}
                <Section
                  id="timeline"
                  title="Timeline"
                  count={unreadMessages.length}
                  icon={<ClockIcon className="w-5 h-5 text-ink-muted" size={20} />}
                >
                  <div className="space-y-2.5 pt-2">
                    {unreadMessages
                      .slice(0, timelinePage * TIMELINE_PAGE_SIZE)
                      .map((msg) => {
                        const isTarget = selectedMessageId === msg.id
                        return (
                          <div
                            key={msg.id}
                            onClick={(e) => handleInspectMessage(msg.id, e)}
                            className={`p-3 rounded-xl text-base border transition-colors cursor-pointer ${
                              isTarget
                                ? 'bg-accent-soft border-accent text-ink'
                                : 'border-border bg-card hover:bg-card-raised text-ink'
                            }`}
                          >
                            <div className="flex items-center justify-between text-sm text-ink-muted mb-1">
                              <span className="font-semibold text-ink">{msg.sender}</span>
                              <span className="text-ink-faint text-xs">
                                {formatDateTime(msg.timestamp)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                        )
                      })}

                    {unreadMessages.length > timelinePage * TIMELINE_PAGE_SIZE && (
                      <div className="pt-2 text-center">
                        <Button
                          variant="secondary"
                          onClick={() => setTimelinePage((p) => p + 1)}
                        >
                          Load next {TIMELINE_PAGE_SIZE} messages
                        </Button>
                      </div>
                    )}
                  </div>
                </Section>
              </div>

              {/* Mobile Actions: Copy summary and Clear data (< 1024px) */}
              <div className="lg:hidden pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  data-testid="copy-summary"
                  onClick={handleCopySummary}
                >
                  Copy summary
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  data-testid="clear-data"
                  onClick={handleClearData}
                >
                  Clear data
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Source Inspection Panel */}
      <SourcePanel
        selectedMessageId={selectedMessageId}
        messages={data.messages}
        onClose={() => setSelectedMessageId(null)}
        returnFocusRef={lastActiveElementRef}
      />
    </main>
  )
}
