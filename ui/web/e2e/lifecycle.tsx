import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/global.css'
import { ActivityDock } from '../src/components/ActivityDock'
import { LaunchConfirm } from '../src/components/LaunchConfirm'
import { ResumeConfirm } from '../src/components/ResumeConfirm'
import { CODEX_EXECUTION_PROFILE, type ProviderExecutionProfile, type ProviderProfileOption, type RunProvider } from '../src/lib/provider'
import { useStore } from '../src/lib/store'

declare global { interface Window { __ENGINE_LIVE__?: boolean } }
window.__ENGINE_LIVE__ = true

const CLAUDE_PROFILE: ProviderExecutionProfile = { key: 'claude:opus:default', parentModel: 'opus', parentReasoning: 'default' }

function option(provider: RunProvider, profile: ProviderExecutionProfile): ProviderProfileOption {
  return {
    key: profile.key,
    label: provider === 'claude' ? 'Opus' : 'Sol + Terra',
    description: provider === 'claude' ? 'Highest quality Claude research profile' : 'Sol adjudication with Terra specialists',
    model: profile.parentModel!,
    reasoningLevel: profile.parentReasoning,
    executionProfile: profile,
  }
}

const providers = {
  claude: {
    provider: 'claude' as const, enabled: true, available: true, checked: true, status: 'available',
    profile: CLAUDE_PROFILE, defaultProfileKey: CLAUDE_PROFILE.key, profiles: [option('claude', CLAUDE_PROFILE)],
  },
  codex: {
    provider: 'codex' as const, enabled: true, available: true, checked: true, status: 'available',
    profile: CODEX_EXECUTION_PROFILE, defaultProfileKey: CODEX_EXECUTION_PROFILE.key,
    profiles: [option('codex', CODEX_EXECUTION_PROFILE)],
  },
  catalogState: 'valid' as const,
}

interface FixtureState { updating: boolean; provider: RunProvider }

function Harness() {
  const [ready, setReady] = useState(false)
  const provider = (new URLSearchParams(window.location.search).get('provider') === 'codex' ? 'codex' : 'claude') as RunProvider
  const profileKey = provider === 'codex' ? CODEX_EXECUTION_PROFILE.key : CLAUDE_PROFILE.key

  useEffect(() => {
    let stopped = false
    const sync = async () => {
      const response = await fetch('/api/e2e/state')
      const fixture = await response.json() as FixtureState
      if (stopped) return
      useStore.setState({
        staticMode: false,
        connected: true,
        health: fixture.updating ? 'updating' : 'online',
        activeSwarm: 'research',
        selectedTicker: 'KAR',
        selectToken: 1,
        runProvider: provider,
        runProfileKeys: { claude: CLAUDE_PROFILE.key, codex: CODEX_EXECUTION_PROFILE.key },
        providers,
        activityOpen: true,
      })
      await Promise.all([
        useStore.getState().refreshPendingAdmissions(),
        useStore.getState().refreshResumable(),
        useStore.getState().refreshActiveRuns(),
      ])
      if (!stopped) setReady(true)
    }
    void sync()
    const timer = window.setInterval(() => { void sync() }, 500)
    return () => { stopped = true; window.clearInterval(timer) }
  }, [provider])

  return (
    <main data-testid="lifecycle-harness" data-ready={ready ? 'yes' : 'no'} data-provider={provider} style={{ minHeight: '100vh', padding: 24 }}>
      <section style={{ maxWidth: 520 }}>
        <div style={{ color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: 1 }}>Provider-transparent lifecycle fixture</div>
        <h1 style={{ margin: '8px 0' }}>KAR · {provider === 'claude' ? 'Claude' : 'Codex'}</h1>
        <p style={{ color: 'var(--text-muted)' }}>The production Run, Continue, confirmation, and Activity components are connected to a throwaway control plane and fake subscription CLI.</p>
        <button data-testid="run-full" className="btn btn--amber" disabled={!ready} onClick={() => void useStore.getState().requestFull()}>Run full</button>
        <div data-testid="profile-key" style={{ marginTop: 12, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{profileKey}</div>
      </section>
      <LaunchConfirm />
      <ResumeConfirm />
      <ActivityDock />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Harness />)
