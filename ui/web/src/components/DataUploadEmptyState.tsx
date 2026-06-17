import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { Uploader } from './Uploader'
import { DataCoverage } from './DataCoverage'

// Single source of truth for "what's going on with this ticker's data" — so the cockpit is never a
// silent black box. Covers: nothing selected yet (the cockpit no longer auto-selects), unusable folder
// name, Drive still syncing, files being read/parsed, folder genuinely empty, and no companies at all.
// When Drive uploads are configured it also surfaces the in-app add-company / drag-and-drop uploader.
export function DataUploadEmptyState() {
  const selectedTicker = useStore((s) => s.selectedTicker)
  const dataStatus = useStore((s) => s.dataStatus)
  const dataLoading = useStore((s) => s.dataLoading)
  const emptyState = useStore((s) => s.emptyState)
  const tickers = useStore((s) => s.tickers)
  const driveEnabled = useStore((s) => s.driveEnabled)
  const staticMode = useStore((s) => s.staticMode)
  const openAddCompany = useStore((s) => s.openAddCompany)
  const defaultCoverage = useStore((s) => s.defaultCoverage)

  const sel = tickers.find((t) => t.ticker === selectedTicker)
  const noTickers = emptyState && !selectedTicker
  const noSelection = !selectedTicker && !emptyState && tickers.length > 0
  const invalid = !!selectedTicker && sel?.valid === false
  const hasData = !!dataStatus?.hasAnyData
  const syncing = !!selectedTicker && !invalid && !!sel?.syncing && !hasData
  const reading = !!selectedTicker && !invalid && !syncing && dataLoading && !dataStatus
  const tickerNoData = !!selectedTicker && !invalid && !!dataStatus && !hasData
  // Show the source-document upload guide (all unmet) whenever the engine has NO data to work with —
  // a selected-but-empty ticker (its per-ticker coverage) OR zero ticker folders at all (defaultCoverage
  // from /api/tickers). The most important onboarding moment gets the itemised "upload these first" list,
  // not a generic sentence.
  const guideCoverage = dataStatus?.coverage?.length ? dataStatus.coverage : defaultCoverage
  const showGuide = (tickerNoData || noTickers) && !!guideCoverage?.length

  if (!noTickers && !noSelection && !invalid && !syncing && !reading && !tickerNoData) return null

  const canAdd = driveEnabled && !staticMode // in-app add/upload only when the server has Drive configured
  const dir = dataStatus?.dataDir || (selectedTicker ? `…/equity-research-data/${selectedTicker}/` : null)
  const count = sel?.fileCount ?? 0
  const addBtn = canAdd ? <button className="empty__btn" onClick={() => openAddCompany()}>+ Add a company</button> : null

  // pick the message + actions for the current state
  let icon: 'upload' | 'sync' | 'warn'
  let title: string
  let body: React.ReactNode
  let foot: React.ReactNode
  let actions: React.ReactNode = null
  if (noSelection) {
    icon = 'upload'
    title = 'Select a company'
    body = <>Pick a company from the menu (top right) to see its data, readiness and run the swarm{canAdd ? ' — or add a new one and upload its documents right here' : ''}.</>
    foot = <><span className="pulsedot" /> nothing is running — choose a company to begin</>
    actions = addBtn
  } else if (invalid) {
    icon = 'warn'
    title = `“${selectedTicker}” can’t be used as a ticker`
    body = (
      <>
        {sel?.invalidReason ?? 'the folder name isn’t a valid ticker'} — so the engine can’t load or run it.
        {' '}Rename the Google Drive folder to <b style={{ color: 'var(--accent-bright)' }}>{sel?.suggestedTicker || 'a valid symbol'}</b> (the stock’s ticker symbol), then it’ll appear ready.
        {count > 0 && <> The {count} file{count === 1 ? '' : 's'} you uploaded will carry over automatically.</>}
      </>
    )
    foot = <><span className="empty__warndot" /> rename in Google Drive — no spaces or symbols</>
  } else if (syncing) {
    icon = 'sync'
    title = `Syncing ${selectedTicker} from Google Drive…`
    body = (
      <>
        {count > 0
          ? <>{count} file{count === 1 ? '' : 's'} pulled down so far — more are still arriving from the cloud.</>
          : <>The files are uploaded to Drive and are downloading to this machine now.</>}
        {' '}The count climbs live and the swarm wakes up the moment they land — nothing is stuck.
      </>
    )
    foot = <><span className="pulsedot" /> watching Google Drive · live</>
  } else if (reading) {
    icon = 'sync'
    title = `Reading ${selectedTicker}’s files…`
    body = (
      <>
        Classifying {count > 0 ? `${count} file${count === 1 ? '' : 's'}` : 'the files'} (filings, transcripts, Capital IQ exports) and checking each module’s readiness.
        {' '}First load from Google Drive can take a moment; results appear as soon as it finishes.
      </>
    )
    foot = <><span className="pulsedot" /> reading & classifying…</>
  } else if (tickerNoData) {
    icon = 'upload'
    title = `No data for ${selectedTicker} yet`
    if (canAdd) {
      body = <>Drop {selectedTicker}’s filings, transcripts, decks and Capital IQ exports below — they upload straight into its Google Drive folder and the swarm wakes up the moment they land.</>
      actions = <Uploader ticker={selectedTicker!} />
    } else {
      body = <>Drop the filings, transcripts, decks and Capital IQ exports into the synced Google Drive folder. The swarm wakes up the moment they land.</>
    }
    foot = <><span className="pulsedot" /> watching Google Drive for files…</>
  } else {
    // noTickers
    icon = 'upload'
    title = 'No companies yet'
    body = canAdd
      ? <>Add your first company — a folder is created in your shared Google Drive and you can drop its documents right here.</>
      : <>Drop the filings, transcripts, decks and Capital IQ exports into the synced Google Drive folder. The swarm wakes up the moment they land.</>
    foot = <><span className="pulsedot" /> watching Google Drive for files…</>
    actions = addBtn
  }

  return (
    <div className="empty">
      <motion.div className={`empty__card${invalid ? ' empty__card--warn' : ''}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className={`empty__icon${invalid ? ' empty__icon--warn' : ''}`}>
          {icon === 'warn' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
          ) : icon === 'sync' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty__spin"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v5h-5" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 16V4m0 0L8 8m4-4l4 4" /><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
          )}
        </div>
        <div className="empty__title">{title}</div>
        {showGuide ? <DataCoverage coverage={guideCoverage} mode="guide" /> : <div className="empty__body">{body}</div>}
        {actions && <div className="empty__actions">{actions}</div>}
        {dir && <div className="empty__path">{dir}</div>}
        <div className="empty__watch">{foot}</div>
      </motion.div>
    </div>
  )
}
