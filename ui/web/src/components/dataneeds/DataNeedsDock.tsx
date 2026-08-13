import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { api } from '../../lib/api'
import { useStore } from '../../lib/store'
import type { DataNeed } from '../../lib/types'
import { DataNeedsPanel, type NeedSearchState } from './DataNeedsDockView'
import './DataNeedsDock.css'

function searchErrorMessage(message: string): string {
  if (message === 'static-deploy') return 'Finding a source needs the live engine.'
  if (message === 'selected-decision-contract-unavailable') return 'Refresh this call before searching.'
  if (message === 'selected-decision-changed') return 'This call changed while searching. Refresh and try again.'
  return message ? `Search failed: ${message}` : 'Search failed. Try again.'
}

// The selected call's evidence gaps. The server owns ranking and lookup truth: v2 needs arrive in priority
// order, while source_lookup exists only after a clean targeted search. The dock never upgrades a source
// suggestion, a partial candidate, or a failed request into a public-link/no-result claim.
export function DataNeedsDock() {
  const read = useStore((s) => s.dataNeeds)
  const refreshDataNeeds = useStore((s) => s.refreshDataNeeds)
  const decisionDockHeight = useStore((s) => s.stageDockH)
  const [open, setOpen] = useState(true)
  const [searchByNeed, setSearchByNeed] = useState<Record<string, NeedSearchState>>({})
  const searchAborts = useRef(new Map<string, AbortController>())
  const selectionKey = read ? `${read.swarm}\n${read.subject}\n${read.run_root}\n${read.decision_fingerprint}` : ''
  const selectionKeyRef = useRef(selectionKey)
  selectionKeyRef.current = selectionKey
  const needs = read?.needs ?? []

  useEffect(() => {
    // A subject switch invalidates every in-flight lookup and every local error from the previous call.
    for (const controller of searchAborts.current.values()) controller.abort()
    searchAborts.current.clear()
    setSearchByNeed({})
  }, [read?.subject, read?.swarm, read?.run_root, read?.decision_fingerprint])
  useEffect(() => () => {
    for (const controller of searchAborts.current.values()) controller.abort()
  }, [])

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

  if (!read) return null
  return (
    <DataNeedsPanel
      needs={needs}
      integrityWarnings={read.widened}
      schemaVersion={read.data_needs_schema_version}
      open={open}
      style={{ '--dneeds-bottom-reserve': `${Math.max(18, decisionDockHeight + 12)}px` } as CSSProperties}
      searchByNeed={searchByNeed}
      onToggle={() => setOpen((value) => !value)}
      onSearch={findPublicSource}
    />
  )
}
