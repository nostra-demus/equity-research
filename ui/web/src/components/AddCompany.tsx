import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { tickerInvalidReason } from '../lib/ticker'
import { Uploader } from './Uploader'

// One modal for two phases: CREATE a company (type a ticker → a folder is made in the shared Drive) and
// then UPLOAD its documents. It also serves the standalone "Add files" action for an existing company
// (openUploader sets uploadTarget without addCompanyOpen). Live + Drive-configured only (gated upstream).
export function AddCompany() {
  const addCompanyOpen = useStore((s) => s.addCompanyOpen)
  const uploadTarget = useStore((s) => s.uploadTarget)
  const close = useStore((s) => s.closeAddCompany)
  const addCompany = useStore((s) => s.addCompany)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const open = addCompanyOpen || !!uploadTarget
  useEffect(() => { if (!open) { setValue(''); setBusy(false) } }, [open])
  if (!open) return null

  const uploadMode = !!uploadTarget // a company exists (just created, or opened via "Add files") → dropzone
  const ticker = value.trim().toUpperCase()
  const reason = ticker ? tickerInvalidReason(ticker) : null

  const submit = async () => {
    if (!ticker || reason || busy) return
    setBusy(true)
    await addCompany(ticker) // on success the store sets uploadTarget → this modal flips to upload mode
    setBusy(false)
  }

  return (
    <div className="scrim" onClick={close}>
      <motion.div className="modal" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
        <div className="modal__head">
          <div className="modal__title">{uploadMode ? `Add documents to ${uploadTarget}` : 'Add a company'}</div>
          <div className="modal__sub">{uploadMode ? 'Files upload straight into the company’s shared Google Drive folder; they appear in the cockpit once Drive syncs (a few seconds).' : 'Creates a folder in your shared Google Drive, then lets you drop its documents.'}</div>
        </div>
        <div className="modal__body">
          {!uploadMode ? (
            <div className="modal__confirm" style={{ padding: 0 }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 6 }}>Stock ticker symbol</div>
              <input className="modal__input" autoFocus placeholder="e.g. AAPL, RELIANCE.NS" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void submit() }} />
              {ticker && reason && <div style={{ fontSize: 12, color: 'var(--bad)', marginTop: 6 }}>{reason}</div>}
            </div>
          ) : (
            <Uploader ticker={uploadTarget!} />
          )}
        </div>
        <div className="modal__actions">
          {!uploadMode ? (
            <>
              <button className="btn btn--ghost" onClick={close}>Cancel</button>
              <button className="btn btn--amber" disabled={!ticker || !!reason || busy} onClick={() => void submit()}>{busy ? 'Creating…' : 'Create'}</button>
            </>
          ) : (
            <button className="btn btn--amber" onClick={close}>Done</button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
