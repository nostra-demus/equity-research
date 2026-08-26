import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { tickerInvalidReason } from '../lib/ticker'
import { Uploader } from './Uploader'

const VENUES = ['NYSE', 'NasdaqGS', 'NasdaqCM', 'NasdaqGM', 'NSE', 'DFM', 'XTRA', 'Oslo Børs', 'SHSE', 'HKEX', 'LSE'] as const

// One modal for two phases: CREATE a company (type a ticker → a folder is made in the shared Drive) and
// then UPLOAD its documents. It also serves the standalone "Add files" action for an existing company
// (openUploader sets uploadTarget without addCompanyOpen). Live + Drive-configured only (gated upstream).
export function AddCompany() {
  const addCompanyOpen = useStore((s) => s.addCompanyOpen)
  const uploadTarget = useStore((s) => s.uploadTarget)
  const close = useStore((s) => s.closeAddCompany)
  const addCompany = useStore((s) => s.addCompany)
  const [value, setValue] = useState('')
  const [legalName, setLegalName] = useState('')
  const [venue, setVenue] = useState<(typeof VENUES)[number] | ''>('')
  const [currency, setCurrency] = useState('')
  const [lei, setLei] = useState('')
  const [figi, setFigi] = useState('')
  const [isin, setIsin] = useState('')
  const [busy, setBusy] = useState(false)

  const open = addCompanyOpen || !!uploadTarget
  useEffect(() => {
    if (!open) {
      setValue(''); setLegalName(''); setVenue(''); setCurrency('')
      setLei(''); setFigi(''); setIsin(''); setBusy(false)
    }
  }, [open])
  if (!open) return null

  const uploadMode = !!uploadTarget // a company exists (just created, or opened via "Add files") → dropzone
  const ticker = value.trim().toUpperCase()
  const reason = ticker ? tickerInvalidReason(ticker) : null
  const normalizedCurrency = currency.trim().toUpperCase()
  const normalizedLei = lei.trim().toUpperCase()
  const normalizedFigi = figi.trim().toUpperCase()
  const normalizedIsin = isin.trim().toUpperCase()
  const identityReason = !legalName.trim() ? 'Enter the legal company name.'
    : !venue ? 'Choose the exact listing venue.'
      : !/^[A-Z]{3}$/.test(normalizedCurrency) ? 'Currency must be a three-letter code, such as USD or INR.'
        : normalizedLei && !/^[A-Z0-9]{20}$/.test(normalizedLei) ? 'LEI must be 20 letters or numbers.'
          : normalizedFigi && !/^[A-Z0-9]{12}$/.test(normalizedFigi) ? 'FIGI must be 12 letters or numbers.'
            : normalizedIsin && !/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(normalizedIsin) ? 'ISIN must be a valid 12-character code.'
              : null

  const submit = async () => {
    if (!ticker || reason || identityReason || busy || !venue) return
    setBusy(true)
    const identifiers = [
      normalizedLei ? `issuer:lei:${normalizedLei}` : '',
      normalizedFigi ? `security:figi:${normalizedFigi}` : '',
      normalizedIsin ? `security:isin:${normalizedIsin}` : '',
    ].filter(Boolean)
    await addCompany({
      ticker, legalName: legalName.trim(), venue, currency: normalizedCurrency, identifiers,
    }) // on success the store sets uploadTarget → this modal flips to upload mode
    setBusy(false)
  }

  return (
    <div className="scrim" onClick={close}>
      <motion.div className="modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
        <div className="modal__head">
          <div className="modal__title">{uploadMode ? `Add documents to ${uploadTarget}` : 'Add a company'}</div>
          <div className="modal__sub">{uploadMode ? 'Files upload straight into the company’s shared Google Drive folder; they appear in the cockpit once Drive syncs (a few seconds).' : 'Add the exact legal listing once. This prevents memory from mixing companies that share a ticker.'}</div>
        </div>
        <div className="modal__body">
          {!uploadMode ? (
            <div className="modal__confirm" style={{ padding: 0 }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 6 }}>Stock ticker symbol</div>
              <input className="modal__input" autoFocus placeholder="e.g. AAPL, RELIANCE.NS" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void submit() }} />
              {ticker && reason && <div style={{ fontSize: 12, color: 'var(--bad)', marginTop: 6 }}>{reason}</div>}
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 12 }}>Legal company name</div>
              <input className="modal__input" style={{ fontFamily: 'inherit', letterSpacing: 0 }} placeholder="e.g. Apple Inc." value={legalName} onChange={(e) => setLegalName(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8, marginTop: 12 }}>
                <label style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Listing venue
                  <select className="modal__input" value={venue} onChange={(e) => setVenue(e.target.value as (typeof VENUES)[number])}>
                    <option value="">Choose…</option>
                    {VENUES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Currency
                  <input className="modal__input" maxLength={3} placeholder="USD" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
                </label>
              </div>
              <details style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text-muted)' }}>
                <summary>Security identifiers (optional)</summary>
                <input className="modal__input" placeholder="LEI — 20 characters" value={lei} onChange={(e) => setLei(e.target.value.toUpperCase())} />
                <input className="modal__input" placeholder="FIGI — 12 characters" value={figi} onChange={(e) => setFigi(e.target.value.toUpperCase())} />
                <input className="modal__input" placeholder="ISIN — 12 characters" value={isin} onChange={(e) => setIsin(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') void submit() }} />
              </details>
              {!reason && identityReason && (legalName || venue || currency || lei || figi || isin) && <div style={{ fontSize: 12, color: 'var(--bad)', marginTop: 8 }}>{identityReason}</div>}
            </div>
          ) : (
            <Uploader ticker={uploadTarget!} />
          )}
        </div>
        <div className="modal__actions">
          {!uploadMode ? (
            <>
              <button className="btn btn--ghost" onClick={close}>Cancel</button>
              <button className="btn btn--amber" disabled={!ticker || !!reason || !!identityReason || busy} onClick={() => void submit()}>{busy ? 'Creating…' : 'Create'}</button>
            </>
          ) : (
            <button className="btn btn--amber" onClick={close}>Done</button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
