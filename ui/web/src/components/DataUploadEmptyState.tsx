import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

export function DataUploadEmptyState() {
  const selectedTicker = useStore((s) => s.selectedTicker)
  const dataStatus = useStore((s) => s.dataStatus)
  const emptyState = useStore((s) => s.emptyState)

  const noTickers = emptyState && !selectedTicker
  const tickerNoData = selectedTicker && dataStatus && !dataStatus.hasAnyData
  if (!noTickers && !tickerNoData) return null

  const dir = dataStatus?.dataDir || (selectedTicker ? `…/equity-research-data/${selectedTicker}/` : '…/equity-research-data/<TICKER>/')

  return (
    <div className="empty">
      <motion.div className="empty__card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="empty__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M12 16V4m0 0L8 8m4-4l4 4" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
        </div>
        <div className="empty__title">{noTickers ? 'No data uploaded yet' : `No data for ${selectedTicker} yet`}</div>
        <div className="empty__body">
          Drop the filings, transcripts, decks and Capital IQ exports into the synced Google Drive folder. The swarm wakes up the moment they land.
        </div>
        <div className="empty__path">{dir}</div>
        <div className="empty__watch">
          <span className="pulsedot" /> watching Google Drive for files…
        </div>
      </motion.div>
    </div>
  )
}
