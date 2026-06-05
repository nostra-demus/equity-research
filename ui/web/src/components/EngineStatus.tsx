import { useStore } from '../lib/store'
import type { HealthState } from '../lib/types'

// Two presentational pieces, both reading the heartbeat `health` from the store (logic lives there):
//  - EngineStatusPill: the always-visible top-bar pill (mounted in CommandBar)
//  - OfflineBanner:     the unmissable full-width strip when something is wrong (mounted in App)

type PillMeta = { label: string; color: string; pulse?: boolean }
const PILL: Record<HealthState, PillMeta> = {
  connecting: { label: 'Connecting…', color: 'var(--text-faint)' },
  online: { label: 'Live', color: 'var(--live)' },
  reconnecting: { label: 'Reconnecting…', color: 'var(--accent)', pulse: true },
  'engine-offline': { label: 'Engine offline', color: 'var(--bad)' },
  'your-network': { label: "You're offline", color: 'var(--bad)' },
  'session-expired': { label: 'Sign-in expired', color: 'var(--accent)' },
}

export function EngineStatusPill() {
  const health = useStore((s) => s.health)
  const staticMode = useStore((s) => s.staticMode)
  const checkNow = useStore((s) => s.checkHealthNow)
  if (staticMode) return null // read-only showcase has no live engine to be offline
  const m = PILL[health]
  return (
    <button className="estatus" onClick={() => checkNow()} title="Engine connection — click to re-check">
      <span className={`estatus__dot${m.pulse ? ' estatus__dot--pulse' : ''}`} style={{ background: m.color }} />
      <span className="estatus__label">{m.label}</span>
    </button>
  )
}

type BannerMeta = { title: string; body: string; cta: 'retry' | 'reload' }
const BANNER: Partial<Record<HealthState, BannerMeta>> = {
  'engine-offline': {
    title: 'Engine offline',
    body: "The research engine's machine is asleep or offline. You're seeing the last loaded state; live actions are paused.",
    cta: 'retry',
  },
  'your-network': {
    title: "You're offline",
    body: 'Your device lost its internet connection. This page reconnects automatically when you’re back online.',
    cta: 'retry',
  },
  'session-expired': {
    title: 'Sign-in expired',
    body: 'Your secure session timed out. Reload to sign in again.',
    cta: 'reload',
  },
}

export function OfflineBanner() {
  const health = useStore((s) => s.health)
  const staticMode = useStore((s) => s.staticMode)
  const checkNow = useStore((s) => s.checkHealthNow)
  const info = staticMode ? null : BANNER[health] ?? null
  if (!info) return null // online/connecting/reconnecting -> no banner (React unmounts it instantly)
  return (
    <div className="offlinebar" role="alert" aria-live="polite">
      <span className="offlinebar__dot" />
      <span className="offlinebar__title">{info.title}</span>
      <span className="offlinebar__body">{info.body}</span>
      <span className="offlinebar__spacer" />
      {info.cta === 'reload' ? (
        <button className="btn btn--ghost offlinebar__btn" onClick={() => location.reload()}>Reload</button>
      ) : (
        <>
          <span className="offlinebar__retry"><span className="pulsedot" />retrying…</span>
          <button className="btn btn--ghost offlinebar__btn" onClick={() => checkNow()}>Retry now</button>
        </>
      )}
    </div>
  )
}
