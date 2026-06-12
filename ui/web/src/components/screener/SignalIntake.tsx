import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../lib/store'

// The Phase 0.1 intake doc's input_nature enum — kept verbatim so the agent-side schema validates.
const NATURES = [
  ['news_headline', 'News headline'],
  ['human_prompt', 'My own observation'],
  ['regulatory_filing', 'Regulatory filing'],
  ['earnings_release', 'Earnings release'],
  ['earnings_call_transcript', 'Earnings call'],
  ['company_press_release', 'Press release'],
  ['exchange_announcement', 'Exchange announcement'],
  ['price_alert', 'Price alert'],
  ['commodity_price_move', 'Commodity move'],
  ['shipping_rate_move', 'Shipping rates'],
  ['options_flow_alert', 'Options flow'],
  ['chart_pattern', 'Chart pattern'],
  ['geopolitical_event', 'Geopolitical event'],
  ['macro_data_release', 'Macro data'],
] as const

// On-list origins (the swarm doctrine's Gate-0 firewall): shown as a hint — the gate agent is the
// authority; an off-list source is recorded as watchlist_no_source rather than blocked client-side.
const SOURCES = ['Reuters', 'Bloomberg', 'Financial Times', 'The Wall Street Journal', 'CNBC', 'MarketWatch', 'The Economic Times', 'Business Standard', 'LiveMint', 'Moneycontrol', 'SEC EDGAR', 'BSE / NSE Exchange Filing', 'Company Investor Relations Page', 'Official Government Statement']

export function SignalIntake() {
  const open = useStore((s) => s.signalIntakeOpen)
  const close = useStore((s) => s.closeSignalIntake)
  const submit = useStore((s) => s.submitSignal)
  const [nature, setNature] = useState<string>('news_headline')
  const [headline, setHeadline] = useState('')
  const [url, setUrl] = useState('')
  const [source, setSource] = useState('')
  const [note, setNote] = useState('')
  const isHuman = nature === 'human_prompt'
  const valid = headline.trim().length >= 8 && (isHuman || (url.trim().length > 0 && source.trim().length > 0))

  const onSubmit = () => {
    if (!valid) return
    void submit({
      headline: headline.trim(),
      input_nature: nature,
      source_url: isHuman ? undefined : url.trim(),
      source_name: isHuman ? undefined : source.trim(),
      human_prompt_note: isHuman ? (note.trim() || headline.trim()) : undefined,
      body_text: !isHuman && note.trim() ? note.trim() : undefined,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div
            className="modal intake"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="intake__title">Check a news event</div>
            <div className="intake__sub">Paste one event. The system checks it step by step, then decides: drop it, watch it, or turn it into an investment idea. Most events get dropped — that is normal, and it is cheap.</div>

            <label className="intake__label">What kind of event is this?</label>
            <div className="intake__natures">
              {NATURES.map(([k, label]) => (
                <button key={k} className={`chip intake__nature${nature === k ? ' intake__nature--on' : ''}`} onClick={() => setNature(k)}>
                  {label}
                </button>
              ))}
            </div>

            <label className="intake__label">{isHuman ? 'What did you notice? (in your own words)' : 'Headline (paste it exactly as published)'}</label>
            <textarea className="intake__input" rows={2} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={isHuman ? 'e.g. Capesize rates have jumped 30% in a week while iron-ore volumes are flat' : 'Paste the headline exactly as published'} />

            {!isHuman && (
              <>
                <label className="intake__label">Source URL</label>
                <input className="intake__input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
                <label className="intake__label">Source name <span className="intake__hint">only trusted sources pass the first check — anything else goes to the Watching pile</span></label>
                <input className="intake__input" list="gate0-sources" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Reuters, Bloomberg, Moneycontrol…" />
                <datalist id="gate0-sources">
                  {SOURCES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </>
            )}

            <label className="intake__label">{isHuman ? 'Anything else worth knowing' : 'Body / summary (optional)'}</label>
            <textarea className="intake__input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />

            <div className="intake__actions">
              <span className="intake__est">costs about $8–45 · stops early (and cheaper) if a check says no</span>
              <button className="btn btn--ghost" onClick={close}>Cancel</button>
              <button className="btn btn--amber" disabled={!valid} onClick={onSubmit}>Start the checks ▸</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
