// Model + style + theme, the desktop drawer's three pickers as one sheet. The blurbs are the desktop's
// verbatim (ChatPanel MODELS/STYLES) — same vocabulary, same stickiness (style persists, model resets
// per session like desktop's default; theme is the shared nsw.theme contract).
import { Sheet } from './Sheet'
import { applyTheme, readTheme, saveChatStyle, type ChatStyle } from '../prefs'

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

export function PrefsSheet({ open, model, style, onModel, onStyle, onClose }: {
  open: boolean
  model: string
  style: ChatStyle
  onModel: (m: string) => void
  onStyle: (s: ChatStyle) => void
  onClose: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} label="Chat preferences">
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
