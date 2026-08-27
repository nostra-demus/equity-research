import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import { Spin } from '../Spin'
import { ProviderProfileSelector } from '../ProviderProfileSelector'
import { providerBlockedReason, providerIsBlocked, providerLabel, providerLaunchBlockedReason, providerNeedsCheck, type RunProvider } from '../../lib/provider'

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
  const starting = useStore((s) => s.launchPending?.key === 'signal:intake')
  const seed = useStore((s) => s.signalIntakeSeed)
  const provider = useStore((s) => s.runProvider)
  const setProvider = useStore((s) => s.setRunProvider)
  const profileKey = useStore((s) => s.runProfileKeys[provider])
  const setProfile = useStore((s) => s.setRunProfile)
  const providers = useStore((s) => s.providers)
  const checkProvider = useStore((s) => s.refreshProviders)
  const providerProblem = providerLaunchBlockedReason(providers[provider], providers.catalogState)
  const [nature, setNature] = useState<string>('news_headline')
  const [headline, setHeadline] = useState('')
  const [url, setUrl] = useState('')
  const [source, setSource] = useState('')
  const [note, setNote] = useState('')
  const isHuman = nature === 'human_prompt'
  const valid = headline.trim().length >= 8 && (isHuman || (url.trim().length > 0 && source.trim().length > 0))

  // A news-chat answer can open this form with a draft. A normal "Check an event" open has no seed
  // and gets a clean form. The user can still edit every field before spending money on the checks.
  useEffect(() => {
    if (!open) return
    setNature(seed?.input_nature || 'news_headline')
    setHeadline(seed?.headline || '')
    setUrl(seed?.source_url || '')
    setSource(seed?.source_name || '')
    setNote(seed?.human_prompt_note || seed?.body_text || '')
  }, [open, seed])

  const onSubmit = () => {
    if (!valid || providerProblem) return
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

            <label className="intake__label">Run with</label>
            <div className="providerseg" role="radiogroup" aria-label="Run provider">
              {(['claude', 'codex'] as RunProvider[]).map((choice) => {
                const problem = providerBlockedReason(providers[choice])
                const status = providers[choice]
                return <button key={choice} role="radio" aria-checked={provider === choice} className={`providerseg__btn${provider === choice ? ' providerseg__btn--on' : ''}`} disabled={providerIsBlocked(status)} title={problem || (providerNeedsCheck(status) ? `Check ${providerLabel(choice)} status` : `Run with ${providerLabel(choice)}`)} onClick={() => { setProvider(choice); if (providerNeedsCheck(status) && !status.checking) void checkProvider(choice) }}>{status.checking ? 'checking…' : providerLabel(choice)}</button>
              })}
            </div>
            <label className="intake__label">Model</label>
            <ProviderProfileSelector status={providers[provider]} profileKey={profileKey} onChange={(key) => setProfile(provider, key)} />
            {providerProblem && <div className="intake__hint" style={{ color: 'var(--bad)' }}>{providerProblem}. Choose an available provider to continue.</div>}

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
              <span className="intake__est">{provider === 'codex' ? 'uses your Codex plan · stops early when a check says no' : 'costs about $8–45 · stops early (and cheaper) if a check says no'}</span>
              <button className="btn btn--ghost" onClick={close}>Cancel</button>
              <button className="btn btn--amber" disabled={!valid || starting || !!providerProblem} title={providerProblem || undefined} onClick={onSubmit}>{starting ? <><Spin /> Starting…</> : <>Start the checks ▸</>}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
