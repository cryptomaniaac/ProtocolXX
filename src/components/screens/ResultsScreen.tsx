import React, { useState, useMemo, useRef, useEffect } from 'react'
import type { ParsedChatData, FilterState, ExtractedItem } from '../../lib/types'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { Section } from '../common/Section'
import { SourcePanel } from '../common/SourcePanel'
import { PrivacyBadge } from '../common/PrivacyBadge'
import {
  CopyIcon,
  CheckIcon,
  SearchIcon,
  XIcon,
  ExternalLinkIcon,
} from '../common/Icons'
import {
  filterMessages,
  filterExtractedItems,
  highlightText,
} from '../../lib/filters'
import { generateCatchupSummary } from '../../lib/tldr'

export interface ResultsScreenProps {
  data: ParsedChatData
  onClearData: () => void
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  data,
  onClearData,
}) => {
  // Search and filter state
  const [filters, setFilters] = useState<FilterState>({
    timeWindow: 'all',
    selectedParticipants: [],
    searchQuery: '',
  })

  // Selected message for source view
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Expand "Needs your attention"
  const [showAllAttention, setShowAllAttention] = useState(false)

  // Pagination for raw message log
  const [messagePage, setMessagePage] = useState(1)
  const MESSAGES_PER_PAGE = 50

  // Copy summary state
  const [isCopied, setIsCopied] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Global keyboard shortcuts: `/` to focus search, `Escape` to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === 'Escape') {
        if (isMobileDrawerOpen) {
          setIsMobileDrawerOpen(false)
        } else if (selectedMessageId) {
          setSelectedMessageId(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileDrawerOpen, selectedMessageId])

  // Filter messages based on time window, participants, search
  const filteredMessages = useMemo(() => {
    const latestDate =
      data.endDate ??
      (data.messages.length > 0
        ? data.messages[data.messages.length - 1].timestamp
        : new Date(0))
    return filterMessages(data.messages, filters, latestDate)
  }, [data.messages, data.endDate, filters])

  const filteredMessageIds = useMemo(() => {
    return new Set(filteredMessages.map((m) => m.id))
  }, [filteredMessages])

  // Filter extracted categories
  const filteredAttention = useMemo(() => {
    return filterExtractedItems(
      data.attentionItems,
      filteredMessageIds,
      filters.searchQuery
    )
  }, [data.attentionItems, filteredMessageIds, filters.searchQuery])

  const filteredDecisions = useMemo(() => {
    return filterExtractedItems(
      data.decisions,
      filteredMessageIds,
      filters.searchQuery
    )
  }, [data.decisions, filteredMessageIds, filters.searchQuery])

  const filteredActionItems = useMemo(() => {
    return filterExtractedItems(
      data.actionItems,
      filteredMessageIds,
      filters.searchQuery
    )
  }, [data.actionItems, filteredMessageIds, filters.searchQuery])

  const filteredBlockers = useMemo(() => {
    return filterExtractedItems(
      data.blockers,
      filteredMessageIds,
      filters.searchQuery
    )
  }, [data.blockers, filteredMessageIds, filters.searchQuery])

  const filteredLinks = useMemo(() => {
    return filterExtractedItems(
      data.links,
      filteredMessageIds,
      filters.searchQuery
    )
  }, [data.links, filteredMessageIds, filters.searchQuery])

  const filteredMentions = useMemo(() => {
    return filterExtractedItems(
      data.mentions,
      filteredMessageIds,
      filters.searchQuery
    )
  }, [data.mentions, filteredMessageIds, filters.searchQuery])

  // Dynamic summary if filters are active
  const dynamicSummary = useMemo(() => {
    const isFiltered =
      filters.timeWindow !== 'all' ||
      filters.selectedParticipants.length > 0 ||
      Boolean(filters.searchQuery.trim())

    if (!isFiltered) return data.summary

    return generateCatchupSummary(
      filteredMessages,
      filteredDecisions,
      filteredActionItems,
      filteredBlockers
    )
  }, [
    filters,
    data.summary,
    filteredMessages,
    filteredDecisions,
    filteredActionItems,
    filteredBlockers,
  ])

  // Items to display in attention list
  const attentionDisplayList = showAllAttention
    ? filteredAttention
    : filteredAttention.slice(0, 5)

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(dynamicSummary.summaryText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Fallback if clipboard API restricted
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleItemClick = (item: ExtractedItem) => {
    setSelectedMessageId(item.sourceMessageId)
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(true)
    }
  }

  const formatShortTime = (d: Date) => {
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Safe highlighted text renderer without innerHTML
  const renderHighlighted = (text: string) => {
    const segments = highlightText(text, filters.searchQuery)
    return (
      <>
        {segments.map((seg, idx) =>
          seg.isMatch ? (
            <mark
              key={idx}
              className="bg-amber-200 dark:bg-amber-900/60 text-ink dark:text-ink-dark rounded-xs px-0.5"
            >
              {seg.text}
            </mark>
          ) : (
            <span key={idx}>{seg.text}</span>
          )
        )}
      </>
    )
  }

  return (
    <main
      data-testid="results-section"
      className="w-full flex-1 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 animate-in fade-in duration-200"
    >
      {/* 1. Filter and Search Controls Bar */}
      <section
        aria-label="Filter and Search Controls"
        className="p-4 md:p-5 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark space-y-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted dark:text-ink-muted-dark pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="Filter topics, tasks or decisions... (Press / to focus)"
              className="w-full h-11 pl-10 pr-9 rounded-lg border border-border dark:border-border-dark bg-base dark:bg-base-dark text-ink dark:text-ink-dark text-[14px] placeholder:text-ink-muted dark:placeholder:text-ink-muted-dark focus:border-[#1A6B6B] dark:focus:border-[#2D9B9B] outline-none transition-colors"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, searchQuery: '' }))
                }
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time Window Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {(
              [
                { id: 'all', label: 'All' },
                { id: '24h', label: 'Last 24h' },
                { id: '7d', label: 'Last 7d' },
              ] as const
            ).map((win) => {
              const isActive = filters.timeWindow === win.id
              return (
                <button
                  key={win.id}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, timeWindow: win.id }))
                  }
                  className={`min-h-[38px] px-3.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1A6B6B] text-white dark:bg-[#2D9B9B] dark:text-[#111110]'
                      : 'border border-border dark:border-border-dark text-ink dark:text-ink-dark hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {win.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Participant filter pills */}
        {data.participants.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-[13px]">
            <span className="text-ink-muted dark:text-ink-muted-dark font-medium mr-1">
              Participants:
            </span>
            {data.participants.map((p) => {
              const isSelected = filters.selectedParticipants.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => {
                      const exists = prev.selectedParticipants.includes(p)
                      return {
                        ...prev,
                        selectedParticipants: exists
                          ? prev.selectedParticipants.filter((x) => x !== p)
                          : [...prev.selectedParticipants, p],
                      }
                    })
                  }}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#1A6B6B] text-white dark:bg-[#2D9B9B] dark:text-[#111110]'
                      : 'bg-black/5 dark:bg-white/5 text-ink dark:text-ink-dark hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            {filters.selectedParticipants.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, selectedParticipants: [] }))
                }
                className="text-[12px] text-[#1A6B6B] dark:text-[#2D9B9B] underline ml-1 cursor-pointer"
              >
                Reset participants
              </button>
            )}
          </div>
        )}
      </section>

      {/* Main Results Layout: Left Content Column (720px max) + Sticky Source Panel (340px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* 2. TL;DR Briefing Card */}
          <Card className="space-y-4 border-l-4 border-l-[#1A6B6B] dark:border-l-[#2D9B9B]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold uppercase tracking-wider text-[#1A6B6B] dark:text-[#2D9B9B]">
                TL;DR Summary
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                className="gap-1.5"
                title="Copy summary to clipboard"
              >
                {isCopied ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>Copy summary</span>
                  </>
                )}
              </Button>
            </div>

            <p className="text-[17px] md:text-[18px] leading-relaxed text-ink dark:text-ink-dark font-medium readable-measure">
              {dynamicSummary.summaryText}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-[12px] text-ink-muted dark:text-ink-muted-dark border-t border-border dark:border-border-dark">
              <span>Active topics:</span>
              {dynamicSummary.activeTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 font-medium text-ink dark:text-ink-dark"
                >
                  {topic}
                </span>
              ))}
            </div>
          </Card>

          {/* 3. Needs Your Attention Section */}
          <section aria-labelledby="attention-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  id="attention-heading"
                  className="text-[20px] font-bold text-ink dark:text-ink-dark"
                >
                  Needs your attention
                </h2>
                <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark">
                  Ranked by urgency: active blockers, critical decisions, and time-sensitive tasks.
                </p>
              </div>

              {filteredAttention.length > 5 && (
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => setShowAllAttention((prev) => !prev)}
                  className="text-[13px]"
                >
                  {showAllAttention
                    ? 'Show top 5 only'
                    : `Show all (${filteredAttention.length})`}
                </Button>
              )}
            </div>

            {filteredAttention.length === 0 ? (
              <Card className="text-center py-8 text-ink-muted dark:text-ink-muted-dark text-[14px]">
                No urgent items detected matching the current filters.
              </Card>
            ) : (
              <div data-testid="attention-list" className="space-y-3">
                {attentionDisplayList.map((item) => {
                  const isSelected = selectedMessageId === item.sourceMessageId
                  return (
                    <Card
                      key={item.id}
                      interactive
                      selected={isSelected}
                      onClick={() => handleItemClick(item)}
                      className="p-4 md:p-5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Badge level={item.urgency} />
                        <span className="text-[12px] text-ink-muted dark:text-ink-muted-dark">
                          {formatShortTime(item.timestamp)}
                        </span>
                      </div>

                      <h3 className="text-[16px] font-semibold text-ink dark:text-ink-dark leading-snug">
                        {renderHighlighted(item.title)}
                      </h3>

                      <p
                        className="text-[14px] text-ink-muted dark:text-ink-muted-dark line-clamp-2 leading-relaxed"
                        dir="auto"
                      >
                        {renderHighlighted(item.description)}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[12px] text-ink-muted dark:text-ink-muted-dark border-t border-border/50 dark:border-border-dark/50">
                        <span>From: <strong className="font-medium text-ink dark:text-ink-dark">{item.sender}</strong></span>
                        <span className="text-[11px] italic">{item.urgencyReason}</span>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          {/* 4. Collapsible Categories */}
          <section aria-label="Detailed Breakdowns" className="space-y-3 pt-2">
            {/* Decisions */}
            <Section
              id="decisions"
              title="Decisions"
              count={filteredDecisions.length}
            >
              {filteredDecisions.length === 0 ? (
                <p className="text-[14px] text-ink-muted dark:text-ink-muted-dark py-2">
                  No explicit decisions found.
                </p>
              ) : (
                <div className="space-y-3 pt-2">
                  {filteredDecisions.map((dec) => (
                    <div
                      key={dec.id}
                      onClick={() => handleItemClick(dec)}
                      className="p-3.5 rounded-lg border border-border dark:border-border-dark bg-base/50 dark:bg-base-dark/50 hover:border-[#1A6B6B] dark:hover:border-[#2D9B9B] transition-colors cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[12px] text-ink-muted dark:text-ink-muted-dark">
                        <span className="font-medium text-ink dark:text-ink-dark">{dec.sender}</span>
                        <span>{formatShortTime(dec.timestamp)}</span>
                      </div>
                      <p className="text-[15px] font-medium text-ink dark:text-ink-dark" dir="auto">
                        {renderHighlighted(dec.title)}
                      </p>
                      <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark" dir="auto">
                        {renderHighlighted(dec.description)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Action Items */}
            <Section
              id="action-items"
              title="Action Items"
              count={filteredActionItems.length}
            >
              {filteredActionItems.length === 0 ? (
                <p className="text-[14px] text-ink-muted dark:text-ink-muted-dark py-2">
                  No pending action items found.
                </p>
              ) : (
                <div className="space-y-3 pt-2">
                  {filteredActionItems.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => handleItemClick(act)}
                      className="p-3.5 rounded-lg border border-border dark:border-border-dark bg-base/50 dark:bg-base-dark/50 hover:border-[#1A6B6B] dark:hover:border-[#2D9B9B] transition-colors cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[12px] text-ink-muted dark:text-ink-muted-dark">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink dark:text-ink-dark">{act.sender}</span>
                          {act.assignee && (
                            <span className="px-2 py-0.5 rounded bg-[#1A6B6B]/10 dark:bg-[#2D9B9B]/15 text-[#1A6B6B] dark:text-[#2D9B9B] font-semibold text-[11px]">
                              @{act.assignee}
                            </span>
                          )}
                        </div>
                        <span>{formatShortTime(act.timestamp)}</span>
                      </div>
                      <p className="text-[15px] font-medium text-ink dark:text-ink-dark" dir="auto">
                        {renderHighlighted(act.title)}
                      </p>
                      <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark" dir="auto">
                        {renderHighlighted(act.description)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Questions & Blockers */}
            <Section
              id="blockers"
              title="Questions & Blockers"
              count={filteredBlockers.length}
            >
              {filteredBlockers.length === 0 ? (
                <p className="text-[14px] text-ink-muted dark:text-ink-muted-dark py-2">
                  No blockers or open questions detected.
                </p>
              ) : (
                <div className="space-y-3 pt-2">
                  {filteredBlockers.map((blk) => (
                    <div
                      key={blk.id}
                      onClick={() => handleItemClick(blk)}
                      className="p-3.5 rounded-lg border border-border dark:border-border-dark bg-base/50 dark:bg-base-dark/50 hover:border-[#1A6B6B] dark:hover:border-[#2D9B9B] transition-colors cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[12px] text-ink-muted dark:text-ink-muted-dark">
                        <span className="font-medium text-ink dark:text-ink-dark">{blk.sender}</span>
                        <Badge level={blk.urgency} />
                      </div>
                      <p className="text-[15px] font-medium text-ink dark:text-ink-dark" dir="auto">
                        {renderHighlighted(blk.title)}
                      </p>
                      <p className="text-[13px] text-ink-muted dark:text-ink-muted-dark" dir="auto">
                        {renderHighlighted(blk.description)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Key Links */}
            <Section
              id="links"
              title="Key Links & References"
              count={filteredLinks.length}
            >
              {filteredLinks.length === 0 ? (
                <p className="text-[14px] text-ink-muted dark:text-ink-muted-dark py-2">
                  No links shared in this conversation.
                </p>
              ) : (
                <div className="space-y-2 pt-2">
                  {filteredLinks.map((lnk) => (
                    <div
                      key={lnk.id}
                      className="p-3 rounded-lg border border-border dark:border-border-dark bg-base/50 dark:bg-base-dark/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[14px] text-ink dark:text-ink-dark truncate">
                            {lnk.title}
                          </span>
                          <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                            ({lnk.sender})
                          </span>
                        </div>
                        <p className="text-[12px] text-ink-muted dark:text-ink-muted-dark truncate">
                          {lnk.url}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => handleItemClick(lnk)}
                          className="text-[12px]"
                        >
                          Context
                        </Button>
                        {lnk.url && (
                          <a
                            href={lnk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open link ${lnk.url} in new tab`}
                            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[#1A6B6B] dark:text-[#2D9B9B]"
                          >
                            <ExternalLinkIcon className="w-4 h-4" />
                          </a>
                        )}
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
              count={filteredMentions.length}
            >
              {filteredMentions.length === 0 ? (
                <p className="text-[14px] text-ink-muted dark:text-ink-muted-dark py-2">
                  No direct mentions found.
                </p>
              ) : (
                <div className="space-y-2 pt-2">
                  {filteredMentions.map((men) => (
                    <div
                      key={men.id}
                      onClick={() => handleItemClick(men)}
                      className="p-3 rounded-lg border border-border dark:border-border-dark bg-base/50 dark:bg-base-dark/50 hover:border-[#1A6B6B] dark:hover:border-[#2D9B9B] transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-bold text-[#1A6B6B] dark:text-[#2D9B9B]">
                          {men.title}
                        </span>
                        <span className="text-ink-muted dark:text-ink-muted-dark">
                          from {men.sender}
                        </span>
                      </div>
                      <p className="text-[13px] text-ink dark:text-ink-dark line-clamp-1" dir="auto">
                        {renderHighlighted(men.description)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Timeline / Full Message Archive (Paginated for high volume) */}
            <Section
              id="timeline"
              title="Full Message Log"
              count={filteredMessages.length}
            >
              <div className="space-y-2.5 pt-2">
                {filteredMessages
                  .slice(0, messagePage * MESSAGES_PER_PAGE)
                  .map((msg) => {
                    const isSelected = selectedMessageId === msg.id
                    return (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedMessageId(msg.id)}
                        className={`p-3 rounded-lg text-[13px] border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#E6F0F0] dark:bg-[#1A3535] border-[#1A6B6B] dark:border-[#2D9B9B]'
                            : 'bg-base/30 dark:bg-base-dark/30 border-border/60 dark:border-border-dark/60 hover:border-[#1A6B6B]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-ink-muted dark:text-ink-muted-dark mb-1">
                          <span className="font-semibold text-ink dark:text-ink-dark">
                            {msg.sender}
                          </span>
                          <span>
                            {msg.timestamp.toLocaleDateString()}{' '}
                            {formatShortTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap break-words" dir="auto">
                          {renderHighlighted(msg.text)}
                        </p>
                      </div>
                    )
                  })}

                {filteredMessages.length > messagePage * MESSAGES_PER_PAGE && (
                  <div className="pt-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessagePage((prev) => prev + 1)}
                    >
                      Load next {MESSAGES_PER_PAGE} messages ({filteredMessages.length - messagePage * MESSAGES_PER_PAGE} remaining)
                    </Button>
                  </div>
                )}
              </div>
            </Section>
          </section>
        </div>

        {/* Desktop Sticky Source Inspection Panel (Right Column, 340px) */}
        <aside
          aria-label="Source Message Inspector"
          className="hidden lg:block lg:col-span-4"
        >
          <SourcePanel
            selectedMessageId={selectedMessageId}
            messages={data.messages}
            onClose={() => setSelectedMessageId(null)}
          />
        </aside>
      </div>

      {/* Mobile Drawer Source Inspection */}
      {isMobileDrawerOpen && (
        <SourcePanel
          selectedMessageId={selectedMessageId}
          messages={data.messages}
          onClose={() => setIsMobileDrawerOpen(false)}
          isMobileDrawer
        />
      )}

      {/* Privacy Footer with Clear Data */}
      <footer className="pt-12 pb-6 border-t border-border dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <PrivacyBadge />
        <Button
          variant="outline"
          size="sm"
          data-testid="clear-data-button"
          onClick={onClearData}
          className="text-[13px] border-red-300 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-700 dark:text-red-400"
        >
          Clear all chat data
        </Button>
      </footer>
    </main>
  )
}
