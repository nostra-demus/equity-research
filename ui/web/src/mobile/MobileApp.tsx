// The phone shell: one screen — a chat over the selected subject, with a snapshot header and four
// sheets (switcher / scope / prefs / history). Everything swarm-shaped is data-driven from /api/swarms
// (a 4th swarm appears with zero edits here, §26). The .app wrapper carries data-swarm + the manifest
// color as --swarm-color, exactly as desktop App.tsx does — the derived-accent selector in tokens.css
// keys on that pair, and silently fails without it.
import { useEffect, useMemo, useState } from 'react'
import { api, ensureMode } from '../lib/api'
import type { ChatConversationDetail, ChatScope, SwarmMeta } from '../lib/types'
import { Composer } from './chat/Composer'
import { Thread } from './chat/Thread'
import { useMobileChat, type ChatTarget } from './chat/useMobileChat'
import { HistorySheet } from './history/HistorySheet'
import { NewsChat } from './newschat/NewsChat'
import { readChatStyle, readSavedSubject, saveSubject, useDesktopSite, type ChatStyle } from './prefs'
import { PrefsSheet } from './sheets/PrefsSheet'
import { ScopeSheet } from './sheets/ScopeSheet'
import { SubjectSheet, type SubjectChoice } from './sheets/SubjectSheet'
import { SnapshotHeader, useSnapshot } from './snapshot/SnapshotHeader'

// the desktop's per-scope starters, verbatim (ChatPanel.tsx) — same empty state, same wording
const SUGGESTIONS: Record<ChatScope, string[]> = {
  run: ['What’s the bull case in one paragraph?', 'What are the top 3 risks?', 'What would change the rating?'],
  module: ['Summarize this module’s verdict', 'Where is the evidence weakest?', 'What did this module flag to watch?'],
  orb: ['Summarize this output', 'What’s the single most important number?', 'What does this rely on?'],
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
  const [sheet, setSheet] = useState<SheetId>(null)
  const [model, setModel] = useState('sonnet')
  const [style, setStyle] = useState<ChatStyle>(readChatStyle())

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
  const snap = useSnapshot(newsWire ? undefined : target?.swarm, newsWire ? undefined : target?.subject, swarm?.layout)

  const pick = (c: SubjectChoice) => {
    setSheet(null)
    if (c.newsWire) { setNewsWire(true); return }
    setNewsWire(false)
    chat.reset()
    setTarget({ swarm: c.swarm, subject: c.subject, scope: 'run', title: chatTitle(c.subject, 'run') })
    saveSubject({ swarm: c.swarm, subject: c.subject })
  }

  // the desktop resume semantics, phone-shaped: switch swarm+subject, restore the transcript with its
  // computed cards + conversation id, and (research only) answer from the conversation's own run root
  const resume = (c: ChatConversationDetail) => {
    setSheet(null)
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
        <NewsChat model={model} />
      ) : (
        <>
          <SnapshotHeader snap={snap} onTap={() => setSheet('subject')} />
          <Thread chat={chat} starters={target ? SUGGESTIONS[target.scope] : undefined} onStarter={(q) => chat.send(q)} />
          <Composer
            placeholder={target ? `Ask about ${shortSubject(target.subject)}…` : 'Ask…'}
            disabled={!target || staticMode}
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
            setTarget({ ...target, scope, module, orbPath: undefined, orbKey: undefined, title: chatTitle(target.subject, scope, module) })
          }}
          onClose={() => setSheet(null)}
        />
      )}
      <PrefsSheet open={sheet === 'prefs'} model={model} style={style} onModel={setModel} onStyle={setStyle} onClose={() => setSheet(null)} />
      <HistorySheet open={sheet === 'history'} onResume={resume} onClose={() => setSheet(null)} />
    </div>
  )
}
