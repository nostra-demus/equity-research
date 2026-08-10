// The phone shell: one screen — a chat over the selected subject, with a snapshot header. Everything
// swarm-shaped is data-driven from /api/swarms (a 4th swarm appears with zero edits here, §26). The
// .app wrapper carries data-swarm + the manifest color as --swarm-color, exactly as desktop App.tsx
// does — the derived-accent selector in tokens.css keys on that pair, and silently fails without it.
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import type { ChatScope, SwarmMeta } from '../lib/types'
import { Composer } from './chat/Composer'
import { Thread } from './chat/Thread'
import { useMobileChat, type ChatTarget } from './chat/useMobileChat'
import { readChatStyle, readSavedSubject, saveSubject, useDesktopSite } from './prefs'

// the desktop's per-scope starters, verbatim (ChatPanel.tsx) — same empty state, same wording
const SUGGESTIONS: Record<ChatScope, string[]> = {
  run: ['What’s the bull case in one paragraph?', 'What are the top 3 risks?', 'What would change the rating?'],
  module: ['Summarize this module’s verdict', 'Where is the evidence weakest?', 'What did this module flag to watch?'],
  orb: ['Summarize this output', 'What’s the single most important number?', 'What does this rely on?'],
}

// the desktop's title contract (store.ts defaultChatTitle): run → "Ask · SUBJECT — whole run"
const chatTitle = (subject: string, scope: ChatScope, module?: string) =>
  scope === 'run' ? `Ask · ${subject} — whole run` : scope === 'module' ? `Ask · ${subject} — ${(module || '').replace(/-/g, ' ')}` : `Ask · ${subject}`

export function MobileApp() {
  const [swarms, setSwarms] = useState<SwarmMeta[]>([])
  const [staticMode, setStaticMode] = useState(false)
  const [target, setTarget] = useState<ChatTarget | null>(null)
  const [model] = useState('sonnet')
  const [style] = useState(readChatStyle())

  // boot: swarm list, then land on the saved subject or the first research ticker with a run
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

  // static showcase: same one-liner contract as the desktop drawer — chat needs the live engine
  useEffect(() => {
    void import('../lib/api').then(({ ensureMode }) => ensureMode().then((m) => setStaticMode(m === 'static')))
  }, [])

  const swarm = useMemo(() => swarms.find((s) => s.id === (target?.swarm ?? 'research')), [swarms, target])
  const chat = useMobileChat(target, model, style)

  return (
    <div className="app m-root" data-swarm={target?.swarm ?? 'research'} style={swarm?.color ? ({ ['--swarm-color' as string]: swarm.color } as React.CSSProperties) : undefined}>
      <header className="mchat__bar">
        <button className="mchat__subject" aria-label="Choose what to ask about">
          <span className="mchat__dot" aria-hidden />
          {target ? (
            <>
              <span className="mchat__swarmname">{swarm?.label ?? target.swarm} ·</span> {target.subject} <span className="mchat__caret" aria-hidden>▾</span>
            </>
          ) : (
            'Loading…'
          )}
        </button>
      </header>

      {staticMode && (
        <div className="mchat__static">Chat runs live — start the engine with npm run dev to ask questions.</div>
      )}

      <Thread chat={chat} starters={target ? SUGGESTIONS[target.scope] : undefined} onStarter={(q) => chat.send(q)} />

      <Composer
        placeholder={target ? `Ask about ${target.subject}…` : 'Ask…'}
        disabled={!target || staticMode}
        streaming={chat.state.streaming}
        onSend={chat.send}
        onStop={chat.stop}
      />

      <footer className="mchat__foot">
        <button className="mchat__desktoplink" onClick={useDesktopSite}>Use desktop site</button>
      </footer>
    </div>
  )
}
