// The one-glance card under the header. Rendering only — every derivation lives in snapshotView.ts
// (tested per swarm). Tapping the card opens the switcher, same as the header.
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { decisionColor } from '../../lib/format'
import type { QuoteRead, SwarmMeta } from '../../lib/types'
import { commoditySnapshot, researchSnapshot, signalSnapshot, type Snapshot } from './snapshotView'

const nfmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d })

export function useSnapshot(swarm: string | undefined, subject: string | undefined, layout: SwarmMeta['layout'] | undefined): Snapshot | null {
  const [snap, setSnap] = useState<Snapshot | null>(null)
  useEffect(() => {
    if (!swarm || !subject) { setSnap(null); return }
    let dead = false
    setSnap(null)
    void (async () => {
      try {
        if (swarm === 'research') {
          const d = await api.decision(subject).catch(() => null)
          const q: QuoteRead | null = d ? await api.quote(subject, d.run_root).catch(() => null) : null
          if (!dead) setSnap(researchSnapshot(d, q))
        } else if (layout === 'flow') {
          const b = await api.screenerBoard()
          if (dead) return
          const sig = (b.signals || []).find((s) => s.signal_id === subject)
          const th = (b.theses || []).find((t) => t.signal_id === subject)
          setSnap(signalSnapshot(sig, th))
        } else {
          const [subs, rec] = await Promise.all([
            api.swarmSubjects(swarm).catch(() => ({ subjects: [], summaries: [] })),
            api.decision(subject, swarm).catch(() => null),
          ])
          if (dead) return
          setSnap(commoditySnapshot(subs.summaries.find((x) => x.subject === subject), rec))
        }
      } catch {
        if (!dead) setSnap(null)
      }
    })()
    return () => { dead = true }
  }, [swarm, subject, layout])
  return snap
}

export function SnapshotHeader({ snap, onTap }: { snap: Snapshot | null; onTap: () => void }) {
  if (!snap) return null
  if (snap.kind === 'never-run') {
    return (
      <button className="msnap" onClick={onTap}>
        <span className="msnap__sub">{snap.note}</span>
      </button>
    )
  }
  if (snap.kind === 'signal') {
    return (
      <button className="msnap" onClick={onTap}>
        {snap.headline && <span className="msnap__headline">{snap.headline}</span>}
        <span className="msnap__rowline">
          {snap.routing && <span className="msnap__pill">{snap.routing}</span>}
          {snap.edge != null && <span className="msnap__sub">edge {snap.edge}</span>}
        </span>
      </button>
    )
  }
  if (snap.kind === 'commodity') {
    return (
      <button className="msnap" onClick={onTap}>
        <span className="msnap__rowline">
          {snap.verdict && <span className="msnap__pill" style={{ color: decisionColor(snap.verdict) }}>{snap.verdict}</span>}
          {snap.confidence != null && (
            <span className="msnap__sub">
              confidence {snap.confidence}
              {snap.confidenceRaw != null && <span className="msnap__faint"> ({snap.confidenceRaw} before red-team cap)</span>}
            </span>
          )}
        </span>
        {snap.price != null && (
          <span className="msnap__price mono">
            {nfmt(snap.price)} {snap.priceUnit}
            {snap.asOf && <span className="msnap__faint"> · as of {snap.asOf}</span>}
          </span>
        )}
        {snap.chips.length > 0 && (
          <span className="msnap__chips">{snap.chips.map((c) => <span key={c} className="msnap__chip">{c}</span>)}</span>
        )}
      </button>
    )
  }
  // research
  return (
    <button className="msnap" onClick={onTap}>
      <span className="msnap__rowline">
        {snap.verdict && <span className="msnap__pill" style={{ color: decisionColor(snap.verdict) }}>{snap.verdict}</span>}
        {snap.confidence != null && <span className="msnap__sub">confidence {snap.confidence}/100</span>}
      </span>
      {snap.entry != null && (
        <span className="msnap__price mono">
          entry {nfmt(snap.entry)}
          {snap.live != null && <> → now {nfmt(snap.live)}</>}
          {snap.movePct != null && (
            <span className={snap.movePct < 0 ? 'msnap__neg' : 'msnap__pos'}> {snap.movePct > 0 ? '+' : ''}{nfmt(snap.movePct, 1)}%</span>
          )}
        </span>
      )}
    </button>
  )
}
