// Model + style + theme, the desktop drawer's three pickers as one sheet. The blurbs are the desktop's
// verbatim (ChatPanel MODELS/STYLES) — same vocabulary, same stickiness (style persists, model resets
// per session like desktop's default; theme is the shared nsw.theme contract).
import { Sheet } from './Sheet'
import { applyTheme, readTheme, saveChatStyle, type ChatStyle } from '../prefs'
import { providerBlockedReason, providerIsBlocked, providerLabel, providerNeedsCheck, type ProvidersRead, type RunProvider } from '../../lib/provider'

const MODELS: Array<{ id: string; blurb: string }> = [
  { id: 'sonnet', blurb: 'fast · strong default' },
  { id: 'opus', blurb: 'deepest reasoning' },
  { id: 'haiku', blurb: 'fastest · lightest' },
]
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
      <div className="msheet__head">Model</div>
      <div className="msheet__list msheet__list--tight">
        {MODELS.map((m) => (
          <button key={m.id} className={`msheet__row${model === m.id ? ' msheet__row--on' : ''}`} onClick={() => onModel(m.id)}>
            <span className="msheet__rowlabel">{m.id}</span>
            <span className="msheet__rowsub">{m.blurb}</span>
          </button>
        ))}
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
