// The phone shell: one screen — a chat over the selected subject, with a snapshot header and four
// sheets (switcher / scope / prefs / history). Everything swarm-shaped is data-driven from /api/swarms
// (a 4th swarm appears with zero edits here, §26). The .app wrapper carries data-swarm + the manifest
// color as --swarm-color, exactly as desktop App.tsx does — the derived-accent selector in tokens.css
// keys on that pair, and silently fails without it.
import { useEffect, useMemo, useRef, useState } from 'react'
import { api, ensureMode } from '../lib/api'
import type { ChatConversationDetail, ChatScope, SwarmMeta } from '../lib/types'
import { Composer } from './chat/Composer'
import { Thread } from './chat/Thread'
import { useMobileChat, type ChatTarget } from './chat/useMobileChat'
import { HistorySheet } from './history/HistorySheet'
import { NewsChat } from './newschat/NewsChat'
import { readChatStyle, readSavedSubject, saveSubject, useDesktopSite, type ChatStyle } from './prefs'
import { RunFirst } from './chat/RunFirst'
import { PrefsSheet } from './sheets/PrefsSheet'
import { ScopeSheet } from './sheets/ScopeSheet'
import { SubjectSheet, type SubjectChoice } from './sheets/SubjectSheet'
import { SnapshotHeader, useSnapshot } from './snapshot/SnapshotHeader'
import { emptyProviders, providerIsBlocked, providerNeedsCheck, readRunProvider, saveRunProvider, type ProvidersRead, type RunProvider } from '../lib/provider'
import { useStore } from '../lib/store'

// the desktop's per-scope starters, verbatim (ChatPanel.tsx) — same empty state, same wording
const SUGGESTIONS: Record<ChatScope, string[]> = {
  run: ['What’s the bull case in one paragraph?', 'What are the top 3 risks?', 'What would change the rating?'],
  module: ['Summarize this module’s verdict', 'Where is the evidence weakest?', 'What did this module flag to watch?'],
  orb: ['Summarize this output', 'What’s the single most important number?', 'What does this rely on?'],
  wire: ['What changed today?', 'Which themes are getting stronger?', 'What looks new compared with history?'],
}

// the desktop's title contract (store.ts defaultChatTitle)
const chatTitle = (subject: string, scope: ChatScope, module?: string) =>
  scope === 'run' ? `Ask · ${subject} — whole run` : scope === 'module' ? `Ask · ${subject} — ${(module || '').replace(/-/g, ' ')}` : `Ask · ${subject}`

// a SIG id is board-row long — the header shows a short form; the snapshot card carries the headline
const shortSubject = (s: string) => (s.length > 14 && s.startsWith('SIG-') ? `SIG-…${s.slice(-4)}` : s)

type SheetId = 'subject' | 'scope' | 'prefs' | 'history' | null

export function MobileApp() {
  const [swarms, setSwarms] = useState<SwarmMeta[]>([])
  const [staticMode, setStaticMode] = useState(false)
  const [target, setTarget] = useState<ChatTarget | null>(null)
  const [newsWire, setNewsWire] = useState(false)
  const [wireConversation, setWireConversation] = useState<ChatConversationDetail | null>(null)
  const [sheet, setSheet] = useState<SheetId>(null)
  const model = useStore((s) => s.chatModel)
  const setModel = useStore((s) => s.setChatModel)
  const [style, setStyle] = useState<ChatStyle>(readChatStyle())
  const [provider, setProviderState] = useState<RunProvider>(readRunProvider())
  const [providers, setProviders] = useState<ProvidersRead>(emptyProviders())
  const providerCheckSeq = useRef<Record<RunProvider, number>>({ claude: 0, codex: 0 })
  const checkProvider = (choice: RunProvider) => {
    const seq = ++providerCheckSeq.current[choice]
    setProviders((current) => ({ ...current, [choice]: { ...current[choice], checking: true } }))
    void api.providerCheck(choice).then((status) => {
      if (providerCheckSeq.current[choice] !== seq) return
      setProviders((current) => ({ ...current, [choice]: { ...status, checking: false } }))
    }).catch(() => {
      if (providerCheckSeq.current[choice] !== seq) return
      setProviders((current) => ({
        ...current,
        [choice]: { ...current[choice], checked: true, checking: false, status: 'unavailable', available: false, reason: 'Availability check failed' },
      }))
    })
  }
  const setProvider = (next: RunProvider) => {
    if (providerIsBlocked(providers[next])) return
    saveRunProvider(next)
    setProviderState(next)
    if (providerNeedsCheck(providers[next]) && !providers[next].checking) checkProvider(next)
  }

  useEffect(() => {
    let dead = false
    void api.providers().then((catalog) => {
      if (dead) return
      setProviders(catalog)
      if (catalog.catalogState === 'fallback') {
        setProviderState((current) => {
          if (current !== 'codex') return current
          saveRunProvider('claude')
          return 'claude'
        })
      }
    })
    return () => { dead = true }
  }, [])

  useEffect(() => {
    let dead = false
    void (async () => {
      const sw = await api.swarms().catch(() => [] as SwarmMeta[])
      if (dead) return
      setSwarms(sw)
      const saved = readSavedSubject()
      if (saved) {
        setTarget({ swarm: saved.swarm, subject: saved.subject, scope: 'run', title: chatTitle(saved.subject, 'run') })
        return
      }
      const t = await api.tickers().catch(() => null)
      if (dead) return
      const first = t?.tickers?.find((x) => x.latestRun) ?? t?.tickers?.[0]
      if (first) {
        setTarget({ swarm: 'research', subject: first.ticker, scope: 'run', title: chatTitle(first.ticker, 'run') })
        saveSubject({ swarm: 'research', subject: first.ticker })
      }
    })()
    return () => { dead = true }
  }, [])

  useEffect(() => {
    void ensureMode().then((m) => setStaticMode(m === 'static'))
  }, [])

  const swarm = useMemo(() => swarms.find((s) => s.id === (target?.swarm ?? 'research')), [swarms, target])
  const chat = useMobileChat(target, model, style)

  // present = the desktop's run-first gate, from the server's own availability rules. A resumed
  // conversation is ALWAYS chat-able (its runRoot answers), matching ChatPanel's rule.
  const [present, setPresent] = useState(true)
  useEffect(() => {
    if (!target || newsWire) { setPresent(true); return }
    if (target.runRoot) { setPresent(true); return }
    let dead = false
    void api.chatScopes(target.subject, target.swarm).then((sc) => {
      if (dead) return
      // Guard the arrays (DESIGN.md §5): an older server, or a partial response, otherwise turns a
      // missing key into a TypeError that takes the whole phone shell down instead of one absent gate.
      const modules = Array.isArray(sc.modules) ? sc.modules : []
      const orbs = Array.isArray(sc.orbs) ? sc.orbs : []
      setPresent(target.scope === 'run' ? !!sc.run?.present : target.scope === 'module' ? !!modules.find((m) => m.module === target.module)?.present : !!orbs.find((o) => o.path === target.orbPath)?.present)
    }).catch(() => { if (!dead) setPresent(true) /* fail open — the server 409s with its own hint */ })
    return () => { dead = true }
  }, [target, newsWire])
  const snap = useSnapshot(newsWire ? undefined : target?.swarm, newsWire ? undefined : target?.subject, swarm?.layout)

  const pick = (c: SubjectChoice) => {
    setSheet(null)
    // useMobileChat stays mounted (and its stream, if any, stays live) regardless of newsWire — without
    // resetting it here too, a run chat streaming when the user opens the news wire keeps consuming the
    // model in the background and can commit an answer into a conversation the user has already left.
    if (c.newsWire) { chat.reset(); setWireConversation(null); setNewsWire(true); return }
    setWireConversation(null)
    setNewsWire(false)
    chat.reset()
    setTarget({ swarm: c.swarm, subject: c.subject, scope: 'run', title: chatTitle(c.subject, 'run') })
    saveSubject({ swarm: c.swarm, subject: c.subject })
  }

  // the desktop resume semantics, phone-shaped: switch swarm+subject, restore the transcript with its
  // computed cards + conversation id, and (research only) answer from the conversation's own run root
  const resume = (c: ChatConversationDetail) => {
    setSheet(null)
    if (c.scope === 'wire') {
      chat.reset()
      setWireConversation(c)
      setNewsWire(true)
      if (c.model) setModel(c.model)
      return
    }
    setWireConversation(null)
    setNewsWire(false)
    const sw = c.swarm || 'research'
    setTarget({
      swarm: sw,
      subject: c.subject,
      scope: c.scope,
      module: c.module,
      orbPath: (c as any).orbPath,
      orbKey: (c as any).orbKey,
      runRoot: sw === 'research' ? ((c as any).runRoot ?? undefined) : undefined,
      title: c.title || chatTitle(c.subject, c.scope, c.module),
    })
    saveSubject({ swarm: sw, subject: c.subject })
    if (c.model) setModel(c.model)
    if (c.style) setStyle(c.style)
    const last = [...(c.messages || [])].reverse().find((m) => (m as any).sourcePath)
    chat.hydrate(c.messages || [], c.id, (last as any)?.sourcePath)
  }

  const scopeLabel = target?.scope === 'run' ? 'whole run' : target?.scope === 'module' ? (target.module || 'module').replace(/-/g, ' ') : 'one orb'

  return (
    <div className="app m-root" data-swarm={target?.swarm ?? 'research'} style={swarm?.color ? ({ ['--swarm-color' as string]: swarm.color } as React.CSSProperties) : undefined}>
      <header className="mchat__bar">
        <button className="mchat__subject" aria-label="Choose what to ask about" onClick={() => setSheet('subject')}>
          <span className="mchat__dot" aria-hidden />
          {newsWire ? (
            <>News wire <span className="mchat__caret" aria-hidden>▾</span></>
          ) : target ? (
            <>
              <span className="mchat__swarmname">{swarm?.label ?? target.swarm} ·</span> {shortSubject(target.subject)} <span className="mchat__caret" aria-hidden>▾</span>
            </>
          ) : (
            'Loading…'
          )}
        </button>
        <span className="mchat__baricons">
          {!newsWire && target && (
            <button className="mchat__iconbtn" aria-label="Chat scope" onClick={() => setSheet('scope')}>{scopeLabel}</button>
          )}
          <button className="mchat__iconbtn" aria-label="Saved chats" onClick={() => setSheet('history')}>⟲</button>
          <button className="mchat__iconbtn" aria-label="Preferences" onClick={() => setSheet('prefs')}>≡</button>
        </span>
      </header>

      {staticMode && <div className="mchat__static">Chat runs live — start the engine with npm run dev to ask questions.</div>}

      {newsWire ? (
        <NewsChat model={model} staticMode={staticMode} initial={wireConversation} />
      ) : (
        <>
          <SnapshotHeader snap={snap} onTap={() => setSheet('subject')} />
          {target && !present ? (
            <RunFirst swarm={target.swarm} subject={target.subject} scope={target.scope === 'wire' ? 'run' : target.scope} module={target.module} isFlow={swarm?.layout === 'flow'} staticMode={staticMode} provider={provider} providerStatus={providers[provider]} providerCatalogState={providers.catalogState} />
          ) : (
            <Thread chat={chat} starters={target ? SUGGESTIONS[target.scope] : undefined} onStarter={(q) => chat.send(q)} />
          )}
          <Composer
            placeholder={target ? (present ? `Ask about ${shortSubject(target.subject)}…` : 'Run this output first to chat with it') : 'Ask…'}
            disabled={!target || staticMode || !present}
            streaming={chat.state.streaming}
            onSend={chat.send}
            onStop={chat.stop}
          />
        </>
      )}

      <SubjectSheet
        open={sheet === 'subject'}
        swarms={swarms}
        current={target ? { swarm: target.swarm, subject: target.subject } : null}
        onPick={pick}
        onClose={() => setSheet(null)}
        onDesktop={useDesktopSite}
      />
      {target && (
        <ScopeSheet
          open={sheet === 'scope'}
          swarm={target.swarm}
          subject={target.subject}
          current={{ scope: target.scope, module: target.module }}
          onPick={(scope, module) => {
            setSheet(null)
            chat.reset()
            // Drop runRoot with the rest of the resumed conversation's state. It pins answers to the run
            // that conversation belonged to, but the scope sheet lists availability for the CURRENT run —
            // so keeping it makes a module the sheet just offered answer from an older run, or refuse as
            // "not run" because it did not exist back then. Deliberately changing scope starts fresh.
            setTarget({ ...target, scope, module, orbPath: undefined, orbKey: undefined, runRoot: undefined, title: chatTitle(target.subject, scope, module) })
          }}
          onClose={() => setSheet(null)}
        />
      )}
      <PrefsSheet open={sheet === 'prefs'} model={model} style={style} provider={provider} providers={providers} onModel={setModel} onStyle={setStyle} onProvider={setProvider} onClose={() => setSheet(null)} />
      <HistorySheet open={sheet === 'history'} onResume={resume} onClose={() => setSheet(null)} />
    </div>
  )
}
