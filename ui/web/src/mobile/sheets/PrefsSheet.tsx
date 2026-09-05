// Model + style + theme, the desktop drawer's three pickers as one sheet. The blurbs are the desktop's
// vocabulary and stickiness. Ask model, style, and theme share their desktop localStorage contracts.
import { Sheet } from './Sheet'
import { applyTheme, readTheme, saveChatStyle, type ChatStyle } from '../prefs'
import { providerBlockedReason, providerIsBlocked, providerLabel, providerNeedsCheck, type ProvidersRead, type RunProvider } from '../../lib/provider'
import { useStore } from '../../lib/store'
import { useChatModelChoices } from '../../lib/useChatModels'

const STYLES: Array<{ id: ChatStyle; blurb: string }> = [
  { id: 'simple', blurb: 'plain English, like you’re 18 — no jargon' },
  { id: 'analyst', blurb: 'terse, technical buy-side notes' },
  { id: 'detailed', blurb: 'thorough, structured walkthrough' },
]

export function PrefsSheet({ open, model, style, provider, providers, onModel, onStyle, onProvider, onClose }: {
  open: boolean
  model: string
  style: ChatStyle
  provider: RunProvider
  providers: ProvidersRead
  onModel: (m: string) => void
  onStyle: (s: ChatStyle) => void
  onProvider: (p: RunProvider) => void
  onClose: () => void
}) {
  const runProfileKey = useStore((s) => s.runProfileKeys[provider])
  const setRunProfile = useStore((s) => s.setRunProfile)
  const chatModels = useChatModelChoices(model)
  return (
    <Sheet open={open} onClose={onClose} label="Chat preferences">
      <div className="msheet__head">Run research with</div>
      <div className="msheet__list msheet__list--tight">
        {(['claude', 'codex'] as RunProvider[]).map((choice) => {
          const status = providers[choice]
          const problem = providerBlockedReason(status)
          return <button key={choice} className={`msheet__row${provider === choice ? ' msheet__row--on' : ''}`} disabled={providerIsBlocked(status)} title={problem || (providerNeedsCheck(status) ? `Check ${providerLabel(choice)} status` : undefined)} onClick={() => onProvider(choice)}><span className="msheet__rowlabel">{status.checking ? 'checking…' : providerLabel(choice)}</span><span className="msheet__rowsub">{problem || (providerNeedsCheck(status) ? 'status unknown — tap to check again' : choice === 'codex' ? 'uses your Codex plan for new runs' : 'uses your Claude plan for new runs')}</span></button>
        })}
      </div>
      <div className="msheet__head">Research model</div>
      <div className="msheet__list msheet__list--tight">
        {(providers[provider].profiles || []).map((profile) => (
          <button key={profile.key} className={`msheet__row${runProfileKey === profile.key ? ' msheet__row--on' : ''}`} onClick={() => setRunProfile(provider, profile.key)}>
            <span className="msheet__rowlabel">{profile.label}</span>
            <span className="msheet__rowsub">{profile.description}</span>
          </button>
        ))}
      </div>
      <div className="msheet__head">Ask model</div>
      <div className="msheet__list msheet__list--tight">
        {chatModels.map((m) => (
          <button key={m.id} className={`msheet__row${model === m.id ? ' msheet__row--on' : ''}`} disabled={m.disabled} onClick={() => { if (!m.disabled) onModel(m.id) }}>
            <span className="msheet__rowlabel">{m.label}</span>
            <span className="msheet__rowsub">{m.provider === 'codex' ? 'Codex · ' : 'Claude · '}{m.sub}</span>
          </button>
        ))}
        {!chatModels.length && <div className="msheet__row"><span className="msheet__rowsub">No Ask models are enabled on this host.</span></div>}
      </div>
      <div className="msheet__head">Explain answers as…</div>
      <div className="msheet__list msheet__list--tight">
        {STYLES.map((s) => (
          <button key={s.id} className={`msheet__row${style === s.id ? ' msheet__row--on' : ''}`} onClick={() => { saveChatStyle(s.id); onStyle(s.id) }}>
            <span className="msheet__rowlabel">{s.id}</span>
            <span className="msheet__rowsub">{s.blurb}</span>
          </button>
        ))}
      </div>
      <div className="msheet__head">Theme</div>
      <div className="msheet__list msheet__list--tight">
        <button className="msheet__row" onClick={() => applyTheme(readTheme() === 'dark' ? 'light' : 'dark')}>
          <span className="msheet__rowlabel">Switch to {readTheme() === 'dark' ? 'light' : 'dark'}</span>
          <span className="msheet__rowsub">shared with the desktop app</span>
        </button>
      </div>
    </Sheet>
  )
}
