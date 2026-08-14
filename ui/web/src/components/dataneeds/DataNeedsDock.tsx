import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { api } from '../../lib/api'
import { useStore } from '../../lib/store'
import type { DataNeed, IntakeRerunCommand } from '../../lib/types'
import { analysisForUpload, DataNeedsPanel, latestUploadStatus, type NeedSearchState, type NeedUploadState } from './DataNeedsDockView'
import './DataNeedsDock.css'

const UPLOAD_POLL_MS = 3_000
const UPLOAD_POLL_LIMIT = 20

function searchErrorMessage(message: string): string {
  if (message === 'static-deploy') return 'Finding a source needs the live engine.'
  if (message === 'selected-decision-contract-unavailable') return 'Refresh this call before searching.'
  if (message === 'selected-decision-changed') return 'This call changed while searching. Refresh and try again.'
  return message ? `Search failed: ${message}` : 'Search failed. Try again.'
}

function uploadErrorMessage(error: any): string {
  const code = error?.body?.error || error?.message || ''
  if (code === 'selected_call_not_current') return 'This is an older call. Open the current call before adding data.'
  if (code === 'selected_decision_changed' || code === 'selected_need_changed') return 'This call changed. Refresh it before uploading.'
  if (code === 'filing_required_use_standard_upload') return 'This item needs the standard company filing uploader.'
  if (/source_url|absolute HTTP/i.test(code)) return 'Use a full public source page beginning with https://, or leave it blank.'
  if (/limit|too large|size/i.test(code) || error?.status === 413) return 'That file is too large. The limit is 40 MB.'
  if (code === 'static-deploy') return 'Uploads need the live engine on your Mac Pro.'
  return code ? `Upload failed: ${code}` : 'Upload failed. Try again.'
}

// The selected call's evidence gaps. The server owns ranking and lookup truth: v2 needs arrive in priority
// order, while source_lookup exists only after a clean targeted search. The dock never upgrades a source
// suggestion, a partial candidate, or a failed request into a public-link/no-result claim.
export function DataNeedsDock() {
  const read = useStore((s) => s.dataNeeds)
  const intake = useStore((s) => s.intake)
  const intakeAnalyzing = useStore((s) => s.intakeAnalyzing)
  const globalActive = useStore((s) => s.globalActive)
  const nodesByKey = useStore((s) => s.nodesByKey)
  const analyzeIntake = useStore((s) => s.analyzeIntake)
  const launchRerun = useStore((s) => s.launchRerun)
  const driveEnabled = useStore((s) => s.driveEnabled)
  const openUploader = useStore((s) => s.openUploader)
  const setToast = useStore((s) => s.setToast)
  const refreshDataNeeds = useStore((s) => s.refreshDataNeeds)
  const decisionDockHeight = useStore((s) => s.stageDockH)
  const [open, setOpen] = useState(true)
  const [searchByNeed, setSearchByNeed] = useState<Record<string, NeedSearchState>>({})
  const [uploadByNeed, setUploadByNeed] = useState<Record<string, NeedUploadState>>({})
  const [uploadPollEpoch, setUploadPollEpoch] = useState(0)
  const searchAborts = useRef(new Map<string, AbortController>())
  const uploadAborts = useRef(new Map<string, AbortController>())
  const selectionKey = read ? `${read.swarm}\n${read.subject}\n${read.run_root}\n${read.decision_fingerprint}` : ''
  const selectionKeyRef = useRef(selectionKey)
  selectionKeyRef.current = selectionKey
  const needs = read?.needs ?? []
  const statusNeedsKey = needs.filter((need) => !need.filing_required && !need.built_by)
    .map((need) => `${need.need_id}\n${need.series}`).join('\n---\n')

  useEffect(() => {
    // A subject switch invalidates every in-flight lookup and every local error from the previous call.
    for (const controller of searchAborts.current.values()) controller.abort()
    searchAborts.current.clear()
    for (const controller of uploadAborts.current.values()) controller.abort()
    uploadAborts.current.clear()
    setSearchByNeed({})
    setUploadByNeed({})
  }, [read?.subject, read?.swarm, read?.run_root, read?.decision_fingerprint])
  useEffect(() => () => {
    for (const controller of searchAborts.current.values()) controller.abort()
    for (const controller of uploadAborts.current.values()) controller.abort()
  }, [])

  // Initialise durable status and then poll only while a latest request is waiting for the sole router.
  // Twenty bounded checks cover one minute; switching exact call cancels the timer and late GETs are ignored.
  useEffect(() => {
    if (!read) return
    const selected = read
    const startedFor = selectionKey
    const pollable = selected.needs.filter((need) => !need.filing_required && !need.built_by)
    if (!pollable.length) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const round = async (attempt: number, subset: DataNeed[]) => {
      const results = await Promise.all(subset.map(async (need) => {
        try { return { need, upload: await api.dataNeedUploadStatus(selected, need.need_id, need.series) } }
        catch { return { need, upload: null } }
      }))
      if (cancelled || selectionKeyRef.current !== startedFor) return
      setUploadByNeed((current) => {
        const next = { ...current }
        for (const result of results) if (result.upload) {
          next[result.need.need_id] = {
            ...next[result.need.need_id], read: result.upload,
            error: latestUploadStatus(result.upload) === 'none' ? next[result.need.need_id]?.error : undefined,
          }
        }
        return next
      })
      const waiting = results.filter((result) => result.upload && latestUploadStatus(result.upload) === 'staged_waiting')
        .map((result) => result.need)
      // Retry a transiently failed status read a few times, but do not turn an old/dead server into an
      // endless poll. A proven staged request gets the full one-minute routing window.
      const retryFailed = attempt < 3 ? results.filter((result) => !result.upload).map((result) => result.need) : []
      const next = [...new Map([...waiting, ...retryFailed].map((need) => [need.need_id, need])).values()]
      if (next.length && attempt < UPLOAD_POLL_LIMIT) {
        timer = setTimeout(() => void round(attempt + 1, next), UPLOAD_POLL_MS)
      }
    }
    void round(0, pollable)
    return () => { cancelled = true; if (timer) clearTimeout(timer) }
    // Exact identity + stable need identities are intentional. A source-lookup refresh must not restart a
    // one-minute poll, while an upload increments uploadPollEpoch and starts a fresh bounded window.
  }, [selectionKey, statusNeedsKey, uploadPollEpoch])

  const findPublicSource = useCallback((need: DataNeed) => {
    if (!read || need.filing_required || need.built_by || searchByNeed[need.need_id]?.status === 'searching') return
    const controller = new AbortController()
    const startedFor = selectionKey
    searchAborts.current.get(need.need_id)?.abort()
    searchAborts.current.set(need.need_id, controller)
    setSearchByNeed((current) => ({ ...current, [need.need_id]: { status: 'searching' } }))

    let terminal = false
    const isCurrent = () => searchAborts.current.get(need.need_id) === controller
      && selectionKeyRef.current === startedFor
    void api.pipelineDiscoverStream(read.subject, read.swarm, {
      need_id: need.need_id,
      runRoot: read.run_root,
      decisionFingerprint: read.decision_fingerprint,
      want: need.series,
      autoBuild: false,
    }, {
      signal: controller.signal,
      // A streamed candidate is not the lookup verdict. The server admits the URL, requires an exact match,
      // persists the terminal result, and only then sends done; render that refreshed projection below.
      onFound: () => {},
      onDone: () => {
        if (!isCurrent()) return
        terminal = true
        searchAborts.current.delete(need.need_id)
        void refreshDataNeeds(read.run_root).finally(() => {
          setSearchByNeed((current) => {
            if (current[need.need_id]?.status !== 'searching') return current
            const next = { ...current }
            delete next[need.need_id]
            return next
          })
        })
      },
      onError: (message) => {
        if (!isCurrent()) return
        terminal = true
        searchAborts.current.delete(need.need_id)
        setSearchByNeed((current) => ({
          ...current,
          [need.need_id]: { status: 'error', message: searchErrorMessage(message) },
        }))
      },
      onEnd: () => {
        if (terminal || controller.signal.aborted || !isCurrent()) return
        searchAborts.current.delete(need.need_id)
        setSearchByNeed((current) => ({
          ...current,
          [need.need_id]: { status: 'error', message: 'Search ended before a result was recorded. Try again.' },
        }))
      },
    })
  }, [read, refreshDataNeeds, searchByNeed, selectionKey])

  const toggleUpload = useCallback((need: DataNeed) => {
    setUploadByNeed((current) => {
      const prior = current[need.need_id] ?? {}
      return { ...current, [need.need_id]: {
        ...prior, error: undefined, formOpen: !prior.formOpen,
        provider: prior.provider ?? need.suggested_source?.name ?? '',
      } }
    })
  }, [])

  const setProvider = useCallback((need: DataNeed, provider: string) => {
    setUploadByNeed((current) => ({ ...current, [need.need_id]: {
      ...current[need.need_id], provider, error: undefined,
    } }))
  }, [])

  const setSourceUrl = useCallback((need: DataNeed, sourceUrl: string) => {
    setUploadByNeed((current) => ({ ...current, [need.need_id]: {
      ...current[need.need_id], sourceUrl, error: undefined,
    } }))
  }, [])

  const uploadFile = useCallback((need: DataNeed, file: File) => {
    if (!read || need.filing_required || need.built_by) return
    const selected = read
    const startedFor = selectionKey
    const provider = (uploadByNeed[need.need_id]?.provider ?? '').trim()
    const sourceUrl = (uploadByNeed[need.need_id]?.sourceUrl ?? '').trim()
    if (!provider) {
      setUploadByNeed((current) => ({ ...current, [need.need_id]: {
        ...current[need.need_id], error: 'Add the publisher name first.', formOpen: true,
      } }))
      return
    }
    uploadAborts.current.get(need.need_id)?.abort()
    const controller = new AbortController()
    uploadAborts.current.set(need.need_id, controller)
    const isCurrent = () => selectionKeyRef.current === startedFor
      && uploadAborts.current.get(need.need_id) === controller
    setUploadByNeed((current) => ({ ...current, [need.need_id]: {
      ...current[need.need_id], uploading: true, progress: 0, error: undefined,
    } }))
    void api.uploadDataNeed(selected, need.need_id, need.series, provider, sourceUrl, file, (progress) => {
      if (!isCurrent()) return
      setUploadByNeed((current) => ({ ...current, [need.need_id]: {
        ...current[need.need_id], progress,
      } }))
    }, controller.signal).then(({ upload }) => {
      if (!isCurrent()) return
      const status = latestUploadStatus(upload)
      setUploadByNeed((current) => ({ ...current, [need.need_id]: {
        ...current[need.need_id], read: upload, uploading: false, progress: 1, formOpen: false,
      } }))
      setToast({
        msg: status === 'routed_provenance_verified'
          ? 'Routed safely with provenance. Read the file before deciding what to rerun.'
          : status === 'rejected_policy'
            ? 'Not allowed as runtime evidence.'
            : status === 'failed_tampered'
              ? 'The upload failed its integrity check. Nothing was used.'
              : 'Uploaded safely. Waiting for the Mac Pro to route it with provenance.',
        tone: status === 'rejected_policy' || status === 'failed_tampered' ? 'bad' : 'good',
      })
      setUploadPollEpoch((value) => value + 1)
    }).catch((error: any) => {
      if (!isCurrent() || error?.name === 'AbortError') return
      setUploadByNeed((current) => ({ ...current, [need.need_id]: {
        ...current[need.need_id], uploading: false, error: uploadErrorMessage(error), formOpen: true,
      } }))
      // A response can be lost after the server durably staged the bytes. Reconcile disk truth instead of
      // asking the user to guess whether retrying would duplicate the request.
      setUploadPollEpoch((value) => value + 1)
    }).finally(() => {
      if (uploadAborts.current.get(need.need_id) === controller) uploadAborts.current.delete(need.need_id)
    })
  }, [read, selectionKey, setToast, uploadByNeed])

  const rerunOrb = useCallback((command: IntakeRerunCommand) => {
    const node = [...nodesByKey.values()].find((candidate) => candidate.module === command.module
      && (candidate.name === command.agent || candidate.slug === command.agent))
    if (!node) {
      setToast({ msg: `The ${command.module} / ${command.agent} route is no longer in this swarm. Read the file again.`, tone: 'bad' })
      return
    }
    // This is the ordinary rerun path: the server prices the exact live orb and the normal downstream
    // confirmation opens. Reading or uploading never launches work automatically.
    if (!intake?.actionable || !intake.plan_path || !intake.plan_sha256 || !intake.decision_fingerprint) {
      setToast({ msg: 'This data plan is no longer actionable. Re-analyze the documents first.', tone: 'bad' })
      return
    }
    void launchRerun({ module: node.module, name: node.name, key: node.key }, {
      planPath: intake.plan_path,
      planSha256: intake.plan_sha256,
      sourceDecisionFingerprint: intake.decision_fingerprint,
    })
  }, [intake, launchRerun, nodesByKey, setToast])

  const reading = !!read && (intakeAnalyzing || globalActive.some((run) => run.kind === 'doc-intake'
    && run.ticker === read.subject && (run.swarmId || 'research') === read.swarm))
  const uploadProjection = useMemo(() => {
    if (!read) return {}
    const projected: Record<string, NeedUploadState> = {}
    for (const need of needs) {
      const base = uploadByNeed[need.need_id] ?? {}
      const analysis = analysisForUpload(base.read, intake, read)
      projected[need.need_id] = {
        ...base, ...analysis,
        latestStatus: latestUploadStatus(base.read),
        reading: reading && latestUploadStatus(base.read) === 'routed_provenance_verified',
      }
    }
    return projected
  }, [intake, needs, read, reading, uploadByNeed])

  if (!read) return null
  return (
    <DataNeedsPanel
      needs={needs}
      integrityWarnings={read.widened}
      schemaVersion={read.data_needs_schema_version}
      open={open}
      style={{ '--dneeds-bottom-reserve': `${Math.max(18, decisionDockHeight + 12)}px` } as CSSProperties}
      searchByNeed={searchByNeed}
      uploadByNeed={uploadProjection}
      canUploadFiling={read.swarm === 'research' && driveEnabled}
      onToggle={() => setOpen((value) => !value)}
      onSearch={findPublicSource}
      onToggleUpload={toggleUpload}
      onProvider={setProvider}
      onSourceUrl={setSourceUrl}
      onFile={uploadFile}
      onAnalyze={() => void analyzeIntake()}
      onRunOrb={rerunOrb}
      onUploadFiling={() => openUploader(read.subject)}
    />
  )
}
