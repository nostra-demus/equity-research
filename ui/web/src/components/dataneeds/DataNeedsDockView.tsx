import type { CSSProperties } from 'react'
import type { DataNeed, DataNeedUploadItem, DataNeedUploadRead, DataNeedUploadStatus, DataNeedsRead, IntakeEntryOrb, IntakePlan, IntakeRerunCommand } from '../../lib/types'

export type NeedSearchState = { status: 'searching' } | { status: 'error'; message: string }
export type NeedUploadState = {
  read?: DataNeedUploadRead
  uploading?: boolean
  progress?: number
  error?: string
  formOpen?: boolean
  provider?: string
  sourceUrl?: string
  latestStatus?: DataNeedUploadStatus
  readMatched?: boolean
  analyzedOrbs?: IntakeEntryOrb[]
  rerunCommands?: IntakeRerunCommand[]
  reading?: boolean
  readVerdict?: 'note_only' | 'insufficient'
}

function normalizedSha(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const hash = value.toLowerCase().replace(/^sha256:/, '')
  return /^[a-f0-9]{64}$/.test(hash) ? hash : null
}

function exactEvidencePath(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.split('/').includes('..')) return null
  return value.replace(/^\.\//, '')
}

/** The status record is append-only. The newest request, not an older successful upload, owns the card. */
export function latestUploadItem(read: DataNeedUploadRead | undefined): DataNeedUploadItem | null {
  if (!read?.items.length) return null
  return [...read.items].sort((a, b) => a.staged_at.localeCompare(b.staged_at) || a.request_id.localeCompare(b.request_id)).at(-1) ?? null
}

export function latestUploadStatus(read: DataNeedUploadRead | undefined): DataNeedUploadStatus {
  const item = latestUploadItem(read)
  if (!item) return 'none'
  if (item.routed_path) return 'routed_provenance_verified'
  if (item.reason === 'policy_rejected') return 'rejected_policy'
  if (item.reason) return 'failed_tampered'
  return 'staged_waiting'
}

function matchesActualBytes(doc: IntakePlan['new_docs'][number], item: DataNeedUploadItem): boolean {
  const docHash = normalizedSha(doc.sha256)
  const itemHash = normalizedSha(item.sha256)
  // If both sides publish a hash it is the stronger identity. A reused path with different bytes must not
  // make an old intake plan look as though it read the new upload.
  if (docHash && itemHash) return docHash === itemHash
  const docPath = exactEvidencePath(doc.path)
  const routedPath = exactEvidencePath(item.routed_path)
  return !!docPath && !!routedPath && docPath === routedPath
}

function uniqueOrbs(orbs: IntakeEntryOrb[]): IntakeEntryOrb[] {
  const seen = new Set<string>()
  return orbs.filter((orb) => {
    const key = `${orb.module}\n${orb.agent}`
    if (seen.has(key)) return false
    seen.add(key); return true
  })
}

/**
 * Join manual-upload provenance to document-intake output. The requested need's frozen `entry_orbs` are
 * deliberately absent: only the bytes-matched intake document and its actual `triggered_by` rows can
 * authorize a rerun button.
 */
export function analysisForUpload(
  upload: DataNeedUploadRead | undefined,
  intake: IntakePlan | null,
  selected: DataNeedsRead,
): Pick<NeedUploadState, 'readMatched' | 'analyzedOrbs' | 'rerunCommands' | 'readVerdict'> {
  const item = latestUploadItem(upload)
  if (!item?.routed_path || !intake || intake.swarm !== selected.swarm || intake.subject !== selected.subject
      || intake.run_root !== selected.run_root || intake.decision_fingerprint !== selected.decision_fingerprint
      || intake.ticker !== selected.subject) return {}
  const doc = intake.new_docs.find((candidate) => matchesActualBytes(candidate, item))
  if (!doc) return {}
  const docPath = exactEvidencePath(doc.path)
  const commands = (intake.rerun_plan?.commands ?? []).filter((command) => docPath
    && command.triggered_by.some((trigger) => exactEvidencePath(trigger) === docPath))
  const rerunCommands: IntakeRerunCommand[] = []
  const commandKeys = new Set<string>()
  for (const command of commands) if (!commandKeys.has(command.command)) {
    commandKeys.add(command.command); rerunCommands.push(command)
  }
  const noteOnly = !!docPath && (intake.rerun_plan?.note_only ?? [])
    .some((note) => exactEvidencePath(note.path) === docPath)
  return {
    readMatched: true,
    analyzedOrbs: uniqueOrbs(doc.entry_orbs ?? []),
    rerunCommands,
    readVerdict: rerunCommands.length ? undefined
      : noteOnly || intake.verdict === 'note_only' ? 'note_only'
        : intake.verdict === 'insufficient' ? 'insufficient' : undefined,
  }
}

function shortHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'Open HTTPS address' }
}

function checkedLabel(iso: string | undefined, stale: boolean | undefined): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return stale ? 'Check is stale' : 'Check date unavailable'
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(iso))
  return `Checked ${date}${stale ? ' · recheck due' : ''}`
}

export function DataNeedsPanel({ needs, integrityWarnings, schemaVersion, open, style, searchByNeed, uploadByNeed = {}, canUploadFiling = false, onToggle, onSearch, onToggleUpload = () => {}, onProvider = () => {}, onSourceUrl = () => {}, onFile = () => {}, onAnalyze = () => {}, onRunOrb = () => {}, onUploadFiling = () => {} }: {
  needs: DataNeed[]
  integrityWarnings: string[]
  schemaVersion?: '2.0'
  open: boolean
  style?: CSSProperties
  searchByNeed: Record<string, NeedSearchState>
  uploadByNeed?: Record<string, NeedUploadState>
  canUploadFiling?: boolean
  onToggle: () => void
  onSearch: (need: DataNeed) => void
  onToggleUpload?: (need: DataNeed) => void
  onProvider?: (need: DataNeed, provider: string) => void
  onSourceUrl?: (need: DataNeed, sourceUrl: string) => void
  onFile?: (need: DataNeed, file: File) => void
  onAnalyze?: () => void
  onRunOrb?: (command: IntakeRerunCommand) => void
  onUploadFiling?: (need: DataNeed) => void
}) {
  return (
    <aside className="dneeds" style={style} aria-label="What would improve this call">
      <button
        className="dneeds__head"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="data-needs-call-panel"
      >
        <span className="dneeds__chev" data-open={open} aria-hidden>▸</span>
        <span className="dneeds__heading">
          <span className="dneeds__title">What would improve this call</span>
          <span className="dneeds__subtitle">
            Closing these gaps would improve understanding, but evidence can strengthen, weaken, or leave the call unchanged. It never guarantees conviction.
          </span>
        </span>
        <span className="dneeds__count">{needs.length}</span>
      </button>
      {open && (
        <div className="dneeds__body" id="data-needs-call-panel">
          {needs.length === 0 && integrityWarnings.length > 0 ? (
            <div className="dneeds__integrity dneeds__integrity--blocked" role="status">
              <span>Data guidance unavailable</span>
              <span>Refresh or rerun this call.</span>
            </div>
          ) : integrityWarnings.length > 0 ? (
            <div className="dneeds__integrity" role="status">
              Some guidance could not be verified and is hidden. Refresh or rerun this call.
            </div>
          ) : needs.length === 0 && schemaVersion === '2.0' ? (
            <div className="dneeds__empty">This call did not identify an active data gap.</div>
          ) : needs.length === 0 ? (
            <div className="dneeds__empty">This older call did not produce structured data guidance. Rerun to generate it.</div>
          ) : null}
          {needs.map((need, index) => (
            <NeedCard
              key={need.need_id}
              need={need}
              index={index}
              search={searchByNeed[need.need_id]}
              upload={uploadByNeed[need.need_id]}
              canUploadFiling={canUploadFiling}
              onSearch={() => onSearch(need)}
              onToggleUpload={() => onToggleUpload(need)}
              onProvider={(provider) => onProvider(need, provider)}
              onSourceUrl={(sourceUrl) => onSourceUrl(need, sourceUrl)}
              onFile={(file) => onFile(need, file)}
              onAnalyze={onAnalyze}
              onRunOrb={onRunOrb}
              onUploadFiling={() => onUploadFiling(need)}
            />
          ))}
        </div>
      )}
    </aside>
  )
}

export function NeedCard({ need, index, search, upload, canUploadFiling = false, onSearch, onToggleUpload = () => {}, onProvider = () => {}, onSourceUrl = () => {}, onFile = () => {}, onAnalyze = () => {}, onRunOrb = () => {}, onUploadFiling = () => {} }: {
  need: DataNeed
  index: number
  search?: NeedSearchState
  upload?: NeedUploadState
  canUploadFiling?: boolean
  onSearch: () => void
  onToggleUpload?: () => void
  onProvider?: (provider: string) => void
  onSourceUrl?: (sourceUrl: string) => void
  onFile?: (file: File) => void
  onAnalyze?: () => void
  onRunOrb?: (command: IntakeRerunCommand) => void
  onUploadFiling?: () => void
}) {
  const lookup = need.source_lookup
  const publicUrl = lookup?.lookup_status === 'public_link_found' && lookup.public_url
    ? lookup.public_url
    : null
  // Keep one button at one tree position from idle → retry → searching → error. Moving a retry button
  // between the source row and a footer made React replace the focused element on click.
  const canSearch = !need.filing_required && !need.built_by && (!publicUrl || lookup?.stale === true)
  const isPriorityOne = need.priority === 1
  const uploadRead = upload?.read
  const uploadStatus = upload?.latestStatus ?? uploadRead?.status
  const routed = uploadStatus === 'routed_provenance_verified'
  const staged = uploadStatus === 'staged_waiting'
  const rejected = uploadStatus === 'rejected_policy'
  const tampered = uploadStatus === 'failed_tampered'
  const analyzed = !!upload?.readMatched

  return (
    <article
      className={`dneed${isPriorityOne ? ' dneed--priority' : ''}${need.filing_required ? ' dneed--filing' : ''}`}
      style={{ '--i': Math.min(index, 5) } as CSSProperties}
    >
      <div className="dneed__top">
        <div className="dneed__series">{need.series}</div>
        {typeof need.priority === 'number' && (
          <span className="dneed__priority">{isPriorityOne ? 'Priority 1' : `Priority ${need.priority}`}</span>
        )}
      </div>

      <div className="dneed__label">Why it limits understanding</div>
      <p className="dneed__why">{need.why_it_caps || 'The run did not explain this gap.'}</p>

      {need.entry_orbs?.length ? (
        <div className="dneed__orbs" aria-label="Affected analysis">
          {need.entry_orbs.map((orb) => (
            <span
              className={`dneed__orb${orb.route_status === 'historical' ? ' dneed__orb--historical' : ''}`}
              key={`${orb.module}/${orb.agent}`}
              title={`${orb.why} · ${Math.round(orb.confidence * 100)}% routing confidence${orb.route_status === 'historical' ? ' · historical route; no longer rerunnable' : ''}`}
            >
              {orb.module} · {orb.agent}{orb.route_status === 'historical' ? ' · historical' : ''}
            </span>
          ))}
        </div>
      ) : need.entry_modules.length ? (
        <div className="dneed__orbs" aria-label="Affected modules">
          {need.entry_modules.map((module) => <span className="dneed__orb dneed__orb--legacy" key={module}>{module}</span>)}
        </div>
      ) : null}

      {need.expected_impact && (
        <div className="dneed__impact">
          <div className="dneed__impact-side">
            <span className="dneed__impact-label">If supportive</span>
            <span>{need.expected_impact.if_supportive}</span>
          </div>
          <div className="dneed__impact-side dneed__impact-side--adverse">
            <span className="dneed__impact-label">If adverse</span>
            <span>{need.expected_impact.if_adverse}</span>
          </div>
        </div>
      )}

      <div className="dneed__source">
        <span className="dneed__source-label">Source lookup</span>
        {need.built_by ? (
          <span className="dneed__built">Feed already available</span>
        ) : need.filing_required ? (
          <span className="dneed__filing-required">Statutory filing required · public search cannot close this</span>
        ) : publicUrl ? (
          <span className="dneed__source-found" role="status" aria-live="polite">
            <span>{lookup?.stale ? 'Previously found — recheck' : 'Candidate public link'}</span>
            <a
              className="dneed__source-link"
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              title={`HTTPS syntax and public DNS were checked${lookup?.checked_at ? ` on ${lookup.checked_at}` : ''}. Data access and reuse rights were not verified: ${publicUrl}`}
            >
              {shortHost(publicUrl)} ↗
            </a>
            <span className="dneed__access-caveat">Access and reuse rights not verified</span>
            <span className={`dneed__checked${lookup?.stale ? ' is-stale' : ''}`}>
              {checkedLabel(lookup?.checked_at, lookup?.stale)}
            </span>
          </span>
        ) : search?.status === 'error' ? (
          <span className="dneed__source-error" role="alert">{search.message}</span>
        ) : lookup?.lookup_status === 'could_not_find' && search?.status !== 'searching' ? (
          <span className="dneed__not-found" role="status" aria-live="polite">
            <span>{lookup?.stale ? 'Previously: Could not find — recheck' : 'Could not find'}</span>
            <span className={`dneed__checked${lookup?.stale ? ' is-stale' : ''}`}>
              {checkedLabel(lookup?.checked_at, lookup?.stale)}
            </span>
          </span>
        ) : null}
        {publicUrl && search?.status === 'error' && (
          <span className="dneed__source-error" role="alert">{search.message}</span>
        )}
      </div>

      {canSearch && <div className="dneed__actions">
        <button
          className="dneed__find"
          onClick={onSearch}
          disabled={search?.status === 'searching'}
          aria-busy={search?.status === 'searching'}
        >
          {search?.status === 'searching' ? (
            <><span className="dneed__search-skeleton" aria-hidden />Searching…</>
          ) : search?.status === 'error' ? 'Try again'
            : lookup?.lookup_status === 'could_not_find' ? 'Search again'
              : lookup?.stale ? 'Recheck link'
              : 'Find public source'}
        </button>
      </div>}

      {!need.built_by && need.filing_required && <div className="dneed__evidence">
        <div className="dneed__label">Add the required filing</div>
        <p className="dneed__filing-copy">Use the normal company-document lane so the filing keeps its primary-source status.</p>
        {canUploadFiling ? (
          <button className="dneed__upload-open" onClick={onUploadFiling}>Add filing</button>
        ) : (
          <span className="dneed__upload-caveat">The standard filing uploader is not available on this host.</span>
        )}
      </div>}

      {!need.built_by && !need.filing_required && <div className="dneed__evidence">
        <div className="dneed__label">Your additional data</div>
        {upload?.uploading ? (
          <div className="dneed__upload-state" role="status" aria-live="polite">
            <span>Uploading</span><progress max={1} value={upload.progress ?? 0} />
          </div>
        ) : rejected ? (
          <div className="dneed__upload-error" role="alert">Not allowed as runtime evidence.</div>
        ) : tampered ? (
          <div className="dneed__upload-error" role="alert">The upload failed its integrity check. Nothing was used.</div>
        ) : staged ? (
          <div className="dneed__upload-state" role="status">Uploaded · waiting for secure routing</div>
        ) : routed && upload?.reading ? (
          <div className="dneed__upload-state" role="status">Uploaded ✓ · Routed ✓ · Reading the actual file…</div>
        ) : routed && analyzed ? (
          <div className="dneed__upload-result" role="status" aria-live="polite">
            <span className="dneed__upload-ok">Uploaded ✓ · Routed ✓ · Read ✓</span>
            {upload?.analyzedOrbs?.length ? (
              <div className="dneed__actual-orbs" aria-label="Checks selected after reading the uploaded file">
                {upload.analyzedOrbs.map((orb) => <span className="dneed__orb" key={`${orb.module}/${orb.agent}`}>{orb.module} · {orb.agent}</span>)}
              </div>
            ) : null}
            {upload?.readVerdict === 'note_only' && <span>Read and filed. It does not justify a rerun.</span>}
            {upload?.readVerdict === 'insufficient' && <span>Read, but the evidence is not strong enough to scope a safe rerun.</span>}
            {!upload?.readVerdict && !(upload?.rerunCommands?.length) && <span>Read. No rerun was assigned to this file.</span>}
            {(upload?.rerunCommands ?? []).map((command) => (
              <button className="dneed__review-rerun" key={command.command} onClick={() => onRunOrb(command)}>
                Review rerun · {command.module} / {command.agent}
              </button>
            ))}
          </div>
        ) : routed ? (
          <div className="dneed__upload-result" role="status" aria-live="polite">
            <span className="dneed__upload-ok">Uploaded ✓ · Routed with provenance ✓</span>
            <button className="dneed__read-upload" onClick={onAnalyze}>Read this data</button>
            <span className="dneed__upload-caveat">Reading decides which checks it actually affects. Nothing reruns automatically.</span>
          </div>
        ) : null}
        {upload?.error && <div className="dneed__upload-error" role="alert">{upload.error}</div>}
        {!upload?.uploading && !staged && !routed && (
          upload?.formOpen ? (
            <div className="dneed__upload-form">
              <label>
                <span>Who published it?</span>
                <input value={upload.provider ?? ''} onChange={(event) => onProvider(event.target.value)} maxLength={120} />
              </label>
              <label>
                <span>Source page <em>optional</em></span>
                <input type="url" value={upload.sourceUrl ?? ''} onChange={(event) => onSourceUrl(event.target.value)} maxLength={2048} placeholder="https://…" />
              </label>
              <label className={`dneed__file${(upload.provider ?? '').trim() ? '' : ' is-disabled'}`}>
                Choose one file
                <input
                  type="file"
                  disabled={!(upload.provider ?? '').trim()}
                  onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) onFile(file); event.currentTarget.value = '' }}
                />
              </label>
              <span className="dneed__upload-caveat">The file is provenance-checked, then read before any rerun is offered.</span>
            </div>
          ) : (
            <button className="dneed__upload-open" onClick={onToggleUpload}>Upload data</button>
          )
        )}
      </div>}
    </article>
  )
}
