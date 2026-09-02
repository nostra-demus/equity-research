import { useStore } from '../lib/store'
import type { DeploymentLag, HealthState } from '../lib/types'

// Two presentational pieces, both reading the heartbeat `health` from the store (logic lives there):
//  - EngineStatusPill: the always-visible top-bar pill (mounted in CommandBar)
//  - OfflineBanner:     the unmissable full-width strip when something is wrong (mounted in App)

type PillMeta = { label: string; color: string; pulse?: boolean }
const PILL: Record<HealthState, PillMeta> = {
  connecting: { label: 'Connecting…', color: 'var(--text-faint)' },
  online: { label: 'Live', color: 'var(--live)' },
  updating: { label: 'Updating…', color: 'var(--accent)', pulse: true },
  reconnecting: { label: 'Reconnecting…', color: 'var(--accent)', pulse: true },
  'engine-offline': { label: 'Engine offline', color: 'var(--bad)' },
  'your-network': { label: "You're offline", color: 'var(--bad)' },
  'session-expired': { label: 'Sign-in expired', color: 'var(--accent)' },
}

export function EngineStatusPill() {
  const health = useStore((s) => s.health)
  const deploymentLag = useStore((s) => s.deploymentLag)
  const staticMode = useStore((s) => s.staticMode)
  const checkNow = useStore((s) => s.checkHealthNow)
  if (staticMode) return null // read-only showcase has no live engine to be offline
  const m = health === 'online' && deploymentLag
    ? { label: 'Live · update delayed', color: 'var(--accent)', pulse: true }
    : PILL[health]
  return (
    <button className="estatus" onClick={() => checkNow()} title="Engine connection — click to re-check">
      <span className={`estatus__dot${m.pulse ? ' estatus__dot--pulse' : ''}`} style={{ background: m.color }} />
      <span className="estatus__label">{m.label}</span>
    </button>
  )
}

type BannerMeta = { title: string; body: string; cta: 'retry' | 'reload' | 'refresh'; activity?: 'checking' | 'blocked' }
const BANNER: Partial<Record<HealthState, BannerMeta>> = {
  updating: {
    title: 'Engine updating',
    body: 'A reviewed update is being installed. Existing runs keep going. Full runs and saved Continue requests can wait safely and start after it finishes.',
    cta: 'retry',
  },
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

export function deploymentLagBanner(lag: DeploymentLag, now = Date.now()): BannerMeta {
  const minutes = Math.max(1, Math.floor((now - lag.pendingSince) / 60_000))
  const age = `${minutes} minute${minutes === 1 ? '' : 's'}`
  switch (lag.reason) {
    case 'dirty_nondata':
      return { title: 'Production update blocked', body: `Main has waited ${age}. Production has unexpected local files; move them outside the production folder, then refresh this status.`, cta: 'refresh', activity: 'blocked' }
    case 'local_diverged':
      return { title: 'Production update blocked', body: `Main has waited ${age}. Production has a local commit that is not on main; publish or recover it safely, then refresh this status.`, cta: 'refresh', activity: 'blocked' }
    case 'build_failed':
      return { title: 'Production update failed', body: `Main has waited ${age}. The production build failed and needs a code fix before it can continue.`, cta: 'refresh', activity: 'blocked' }
    case 'ci_not_green':
      return { title: 'Production update waiting for checks', body: `Main has waited ${age}. One or more required checks have not passed; inspect the main checks, then refresh this status.`, cta: 'refresh', activity: 'checking' }
    default:
      return { title: 'Production update delayed', body: `Main has waited ${age} to reach production. The engine is still live; refresh to read the watcher's latest status.`, cta: 'refresh', activity: 'checking' }
  }
}

export function OfflineBanner() {
  const health = useStore((s) => s.health)
  const deploymentLag = useStore((s) => s.deploymentLag)
  const staticMode = useStore((s) => s.staticMode)
  const checkNow = useStore((s) => s.checkHealthNow)
  const lagInfo = health === 'online' && deploymentLag ? deploymentLagBanner(deploymentLag) : null
  const info = staticMode ? null : BANNER[health] ?? lagInfo
  if (!info) return null // online/connecting/reconnecting -> no banner (React unmounts it instantly)
  return (
    <div className="offlinebar" role="alert" aria-live="polite">
      <span className="offlinebar__dot" />
      <span className="offlinebar__title">{info.title}</span>
      <span className="offlinebar__body">{info.body}</span>
      <span className="offlinebar__spacer" />
      {info.cta === 'reload' ? (
        <button className="btn btn--ghost offlinebar__btn" onClick={() => location.reload()}>Reload</button>
      ) : info.cta === 'refresh' ? (
        <>
          <span className="offlinebar__retry">{info.activity === 'blocked' ? 'blocked' : 'checking…'}</span>
          <button className="btn btn--ghost offlinebar__btn" onClick={() => checkNow()}>Refresh status</button>
        </>
      ) : (
        <>
          <span className="offlinebar__retry"><span className="pulsedot" />retrying…</span>
          <button className="btn btn--ghost offlinebar__btn" onClick={() => checkNow()}>Retry now</button>
        </>
      )}
    </div>
  )
}
