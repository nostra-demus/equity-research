import assert from 'node:assert/strict'
import { api } from './api'
import {
  reconcileReadinessGateSnapshot,
  readinessDecisionWaitsForSse,
  terminateReadinessGateMember,
  useStore,
} from './store'
import type { ReadinessReport } from './types'

const report = (ticker: string, ts: number): ReadinessReport => ({
  ticker,
  kind: 'full',
  overall: 'blocked',
  fileCount: 0,
  usableCount: 0,
  physicalPool: { state: 'empty', fileCount: 0, nonEmptyFileCount: 0 },
  entities: [],
  issues: [{ code: 'zero_files', severity: 'blocker', message: 'No files found.' }],
  ts,
})

for (const provider of ['claude', 'codex'] as const) {
  useStore.setState({
    selectedTicker: 'KAR',
    activeSwarm: 'research',
    constellationSwarm: 'research',
    selectToken: provider === 'claude' ? 901 : 902,
    readinessGate: null,
    readinessGateQueue: [],
    activeRuns: {
      [`${provider}-owner`]: {
        runId: `${provider}-owner`, ticker: 'KAR', swarmId: 'research', kind: 'module', module: 'business-model',
        status: 'awaiting-readiness-decision', chainId: `${provider}-chain`, provider,
      },
      [`${provider}-sibling`]: {
        runId: `${provider}-sibling`, ticker: 'KAR', swarmId: 'research', kind: 'module', module: 'earnings',
        status: 'awaiting-readiness-decision', chainId: `${provider}-chain`, provider,
      },
      [`${provider}-other-chain`]: {
        runId: `${provider}-other-chain`, ticker: 'KAR', swarmId: 'research', kind: 'module', module: 'valuation',
        status: 'awaiting-readiness-decision', chainId: `${provider}-chain-2`, provider,
      },
      [`${provider}-other-sibling`]: {
        runId: `${provider}-other-sibling`, ticker: 'KAR', swarmId: 'research', kind: 'module', module: 'catalyst',
        status: 'awaiting-readiness-decision', chainId: `${provider}-chain-2`, provider,
      },
    },
  })

  useStore.getState()._handleEvent({
    type: 'readiness-blocked', runId: `${provider}-owner`, report: report('KAR', 1),
    chainId: `${provider}-chain`, provider, ts: 1,
  })
  useStore.getState()._handleEvent({
    type: 'readiness-blocked', runId: `${provider}-sibling`, report: report('KAR', 2),
    chainId: `${provider}-chain`, provider, ts: 2,
  })
  useStore.getState()._handleEvent({
    type: 'readiness-blocked', runId: `${provider}-other-chain`, report: report('KAR', 2.5),
    chainId: `${provider}-chain-2`, provider, ts: 2.5,
  })
  useStore.getState()._handleEvent({
    type: 'readiness-blocked', runId: `${provider}-other-sibling`, report: report('KAR', 2.6),
    chainId: `${provider}-chain-2`, provider, ts: 2.6,
  })
  // Replay of the owner's blocker updates it in place; it cannot duplicate or overwrite the sibling.
  useStore.getState()._handleEvent({
    type: 'readiness-blocked', runId: `${provider}-owner`, report: report('KAR', 3),
    chainId: `${provider}-chain`, provider, ts: 3,
  })

  assert.equal(useStore.getState().readinessGate?.runId, `${provider}-owner`)
  assert.equal(useStore.getState().readinessGate?.report.ts, 3)
  assert.deepEqual(useStore.getState().readinessGate?.memberRunIds?.sort(), [`${provider}-owner`, `${provider}-sibling`].sort(),
    `${provider}: old-server siblings fold into one logical chain owner`)
  assert.deepEqual(useStore.getState().readinessGateQueue.map((gate) => gate.runId), [`${provider}-other-chain`],
    `${provider}: FIFO is across distinct chains only`)
  useStore.getState()._handleEvent({
    type: 'readiness-resolved', runId: `${provider}-other-sibling`, action: 'recheck',
    chainId: `${provider}-chain-2`, provider, ts: 3.5,
  })
  assert.equal(useStore.getState().readinessGateQueue[0]?.runId, `${provider}-other-chain`,
    `${provider}: a queued non-owner resolving cannot erase its elected chain owner`)

  useStore.getState()._handleEvent({
    type: 'readiness-resolved', runId: `${provider}-owner`, action: 'proceed',
    chainId: `${provider}-chain`, provider, ts: 4,
  })
  assert.equal(useStore.getState().readinessGate?.runId, `${provider}-other-chain`, `${provider}: the next logical chain is promoted`)
  assert.equal(useStore.getState().readinessGateQueue.length, 0)

  useStore.getState()._handleEvent({
    type: 'readiness-resolved', runId: `${provider}-other-chain`, action: 'proceed',
    chainId: `${provider}-chain-2`, provider, ts: 5,
  })
  assert.equal(useStore.getState().readinessGate, null)
}

// Polling can land after the recheck ACK but before its outcome SSE. That middle snapshot must preserve
// the current gate and FIFO order; `readiness-checking` is not a resolution.
{
  const current = {
    runId: 'poll-owner', report: report('KAR', 5.1), chainId: 'poll-chain',
    memberRunIds: ['poll-owner', 'poll-sibling'],
  }
  const queued = [{ runId: 'later-owner', report: report('KAR', 5.2), chainId: 'later-chain' }]
  const during = reconcileReadinessGateSnapshot(current, queued, 'poll-owner', 'readiness-checking')
  assert.equal(during.current?.runId, 'poll-owner', 'poll during recheck keeps the exact visible owner')
  assert.equal(during.current?.rechecking, true, 'poll during recheck keeps the visible spinner')
  assert.deepEqual(during.current?.memberRunIds, ['poll-owner', 'poll-sibling'])
  assert.deepEqual(during.queued.map((gate) => gate.runId), ['later-owner'], 'poll cannot promote a later chain')
}

// A terminal frame is member-scoped, unlike a readiness-resolved chain decision. If a rolling old server's
// elected owner ends, its same-chain sibling must become visible in the same FIFO position.
{
  const current = {
    runId: 'terminal-owner', report: report('KAR', 5.3), chainId: 'terminal-chain',
    memberRunIds: ['terminal-owner', 'terminal-sibling'], rechecking: true,
  }
  const queued = [{ runId: 'next-chain', report: report('KAR', 5.4), chainId: 'next-chain' }]
  const terminal = terminateReadinessGateMember(current, queued, 'terminal-owner')
  assert.equal(terminal.current?.runId, 'terminal-sibling', 'surviving same-chain member is promoted')
  assert.deepEqual(terminal.current?.memberRunIds, ['terminal-sibling'])
  assert.equal(terminal.current?.rechecking, false, 'the promoted paused sibling is actionable')
  assert.deepEqual(terminal.queued.map((gate) => gate.runId), ['next-chain'], 'later chains keep FIFO order')
}

// A normal non-blocking shared report never invents a user decision.
useStore.setState({
  selectedTicker: 'KAR', activeSwarm: 'research', constellationSwarm: 'research',
  readinessGate: null, readinessGateQueue: [],
  activeRuns: {
    clean: { runId: 'clean', ticker: 'KAR', swarmId: 'research', kind: 'module', status: 'readiness-checking', chainId: 'clean-chain', provider: 'codex' },
  },
})
useStore.getState()._handleEvent({
  type: 'readiness-report', runId: 'clean', report: { ...report('KAR', 6), overall: 'degraded', fileCount: 12, usableCount: 12, issues: [] },
  chainId: 'clean-chain', provider: 'codex', ts: 6,
})
assert.equal(useStore.getState().readinessGate, null)
assert.equal(useStore.getState().readinessGateQueue.length, 0)

// A chained non-empty report is never a human decision, including deploy skew where an older server parks
// it. The browser asks for one deterministic recheck and shows recovery in Activity; a strict standalone
// module with the same report retains its existing decision panel.
const originalCompatibilityDecision = api.readinessDecision
const originalRefreshActiveRuns = useStore.getState().refreshActiveRuns
try {
  let automaticRechecks = 0
  api.readinessDecision = async (_runId, action) => {
    assert.equal(action, 'recheck')
    automaticRechecks += 1
    return { ok: true, status: 'readiness-checking' }
  }
  useStore.setState({ refreshActiveRuns: async () => {} })
  const nonEmptyReport: ReadinessReport = {
    ...report('KAR', 7),
    fileCount: 1,
    usableCount: 0,
    physicalPool: { state: 'nonempty', fileCount: 1, nonEmptyFileCount: 1 },
    issues: [{ code: 'zero_usable_data', severity: 'blocker', message: 'Unsupported but non-empty file.' }],
  }
  useStore.setState({
    selectedTicker: 'KAR', activeSwarm: 'research', constellationSwarm: 'research',
    readinessGate: null, readinessGateQueue: [], readinessRecovery: {},
    activeRuns: {
      'legacy-chain-owner': {
        runId: 'legacy-chain-owner', ticker: 'KAR', swarmId: 'research', kind: 'module',
        status: 'awaiting-readiness-decision', chainId: 'legacy-chain', provider: 'codex',
      },
    },
  })
  useStore.getState()._handleEvent({
    type: 'readiness-blocked', runId: 'legacy-chain-owner', report: nonEmptyReport,
    chainId: 'legacy-chain', provider: 'codex', ts: 7,
  })
  // Recovery is serialized per logical chain, so let the queued microtask enter the bounded recheck.
  await new Promise<void>((resolve) => setImmediate(resolve))
  assert.equal(automaticRechecks, 1, 'one bounded server-verified recovery replaces a non-empty chain prompt')
  assert.equal(useStore.getState().readinessGate, null)
  assert.equal(useStore.getState().readinessRecovery['legacy-chain-owner']?.state, 'rechecking')
  useStore.getState()._handleEvent({
    type: 'readiness-resolved', runId: 'legacy-chain-owner', action: 'recheck',
    chainId: 'legacy-chain', provider: 'codex', ts: 8,
  })
  assert.equal(useStore.getState().readinessRecovery['legacy-chain-owner'], undefined)

  useStore.setState({
    readinessGate: null, readinessGateQueue: [], readinessRecovery: {},
    activeRuns: {
      standalone: { runId: 'standalone', ticker: 'KAR', swarmId: 'research', kind: 'module', status: 'awaiting-readiness-decision', provider: 'codex' },
    },
  })
  useStore.getState()._handleEvent({ type: 'readiness-blocked', runId: 'standalone', report: nonEmptyReport, provider: 'codex', ts: 9 })
  assert.equal(useStore.getState().readinessGate?.runId, 'standalone', 'standalone strict readiness remains unchanged')
  assert.equal(automaticRechecks, 1, 'standalone blockers are not automatically decided')
} finally {
  api.readinessDecision = originalCompatibilityDecision
  useStore.setState({ refreshActiveRuns: originalRefreshActiveRuns })
}

// Deterministic transport-order regression: the recheck route acknowledges before its SSE outcome. A
// second caller (double click / another tab) sees 409 + a readiness-checking snapshot. Neither response
// may delete the only decision report, and a later still-empty blocker must end the spinner cleanly. Run
// the same sequence for both providers: this state machine has no provider branch.
const originalDecision = api.readinessDecision
const originalSnapshot = api.runSnapshot
try {
  for (const provider of ['claude', 'codex'] as const) {
    const runId = `${provider}-recheck-owner`
    useStore.setState({
      selectedTicker: 'KAR', activeSwarm: 'research', constellationSwarm: 'research',
      readinessGate: { runId, report: report('KAR', 10), chainId: `${provider}-recheck-chain` },
      readinessGateQueue: [],
      activeRuns: {
        [runId]: {
          runId, ticker: 'KAR', swarmId: 'research', kind: 'module', module: 'business-model',
          status: 'awaiting-readiness-decision', chainId: `${provider}-recheck-chain`, provider,
        },
      },
    })

    let releaseFirst!: (value: { ok: boolean; status: string }) => void
    let decisionCalls = 0
    api.readinessDecision = async () => {
      decisionCalls += 1
      if (decisionCalls === 1) {
        return new Promise((resolve) => { releaseFirst = resolve })
      }
      throw Object.assign(new Error('run is not awaiting a readiness decision'), { status: 409 })
    }
    api.runSnapshot = async () => ({ status: 'readiness-checking' })

    const first = useStore.getState().decideReadiness(runId, 'recheck')
    const second = useStore.getState().decideReadiness(runId, 'recheck')
    assert.equal(await second, 'active', `${provider}: second-click 409 recognizes the live recheck`)
    assert.equal(useStore.getState().readinessGate?.runId, runId, `${provider}: 409 cannot delete the gate`)

    // HTTP ACK first, lifecycle SSE later: ACK alone retains the report and pending lifecycle.
    releaseFirst({ ok: true, status: 'readiness-checking' })
    const firstOutcome = await first
    assert.equal(firstOutcome, 'accepted')
    assert.equal(readinessDecisionWaitsForSse('recheck', firstOutcome), true, `${provider}: HTTP ACK keeps the UI latch`)
    assert.equal(readinessDecisionWaitsForSse('cancel', firstOutcome), false, `${provider}: non-recheck actions do not inherit the latch`)
    assert.equal(useStore.getState().readinessGate?.report.ts, 10, `${provider}: early ACK retains the report`)
    useStore.getState()._handleEvent({
      type: 'readiness-checking', runId, ticker: 'KAR', kind: 'module',
      chainId: `${provider}-recheck-chain`, provider, ts: 11,
    })
    assert.equal(useStore.getState().readinessGate?.rechecking, true)
    useStore.getState()._handleEvent({
      type: 'readiness-blocked', runId, report: report('KAR', 12),
      chainId: `${provider}-recheck-chain`, provider, ts: 12,
    })
    assert.equal(useStore.getState().readinessGate?.runId, runId)
    assert.equal(useStore.getState().readinessGate?.report.ts, 12)
    assert.equal(useStore.getState().readinessGate?.rechecking, false, `${provider}: still-empty result ends the spinner`)

    // Reverse delivery: the SSE result may win the race before the HTTP promise settles. The late ACK
    // must be a no-op and cannot put the finished recheck back into its in-flight state.
    let releaseLateAck!: (value: { ok: boolean; status: string }) => void
    api.readinessDecision = async () => new Promise((resolve) => { releaseLateAck = resolve })
    const lateAck = useStore.getState().decideReadiness(runId, 'recheck')
    useStore.getState()._handleEvent({
      type: 'readiness-checking', runId, ticker: 'KAR', kind: 'module',
      chainId: `${provider}-recheck-chain`, provider, ts: 13,
    })
    useStore.getState()._handleEvent({
      type: 'readiness-blocked', runId, report: report('KAR', 14),
      chainId: `${provider}-recheck-chain`, provider, ts: 14,
    })
    releaseLateAck({ ok: true, status: 'readiness-checking' })
    assert.equal(await lateAck, 'accepted')
    assert.equal(useStore.getState().readinessGate?.report.ts, 14)
    assert.equal(useStore.getState().readinessGate?.rechecking, false, `${provider}: late HTTP ACK cannot rewind SSE truth`)
  }
} finally {
  api.readinessDecision = originalDecision
  api.runSnapshot = originalSnapshot
}

// A stale decision response is member-scoped, not proof that every folded old-server sibling resolved.
// Whether the stale state is confirmed by a 409 snapshot or directly by 404, promote the surviving sibling
// in place and keep later chains queued. Exercise both providers across both transport paths.
const originalStaleDecision = api.readinessDecision
const originalStaleSnapshot = api.runSnapshot
const originalStaleRefreshActiveRuns = useStore.getState().refreshActiveRuns
try {
  useStore.setState({ refreshActiveRuns: async () => {} })
  for (const provider of ['claude', 'codex'] as const) {
    for (const stalePath of ['confirmed-409', 'direct-404'] as const) {
      const owner = `${provider}-${stalePath}-owner`
      const sibling = `${provider}-${stalePath}-sibling`
      const later = `${provider}-${stalePath}-later`
      useStore.setState({
        selectedTicker: 'KAR', activeSwarm: 'research', constellationSwarm: 'research',
        readinessGate: {
          runId: owner, report: report('KAR', 20), chainId: `${provider}-${stalePath}-chain`,
          memberRunIds: [owner, sibling], rechecking: true,
        },
        readinessGateQueue: [{
          runId: later, report: report('KAR', 21), chainId: `${provider}-${stalePath}-later-chain`,
        }],
        activeRuns: {
          [owner]: {
            runId: owner, ticker: 'KAR', swarmId: 'research', kind: 'module', module: 'business-model',
            status: 'awaiting-readiness-decision', chainId: `${provider}-${stalePath}-chain`, provider,
          },
          [sibling]: {
            runId: sibling, ticker: 'KAR', swarmId: 'research', kind: 'module', module: 'earnings',
            status: 'awaiting-readiness-decision', chainId: `${provider}-${stalePath}-chain`, provider,
          },
        },
      })

      api.readinessDecision = async () => {
        throw Object.assign(new Error('stale readiness member'), { status: stalePath === 'confirmed-409' ? 409 : 404 })
      }
      let snapshotCalls = 0
      api.runSnapshot = async () => {
        snapshotCalls += 1
        return { status: 'running' }
      }

      assert.equal(await useStore.getState().decideReadiness(owner, 'recheck'), 'stale')
      assert.equal(snapshotCalls, stalePath === 'confirmed-409' ? 1 : 0,
        `${provider}/${stalePath}: only a 409 needs a confirming snapshot`)
      assert.equal(useStore.getState().readinessGate?.runId, sibling,
        `${provider}/${stalePath}: surviving same-chain member becomes visible`)
      assert.deepEqual(useStore.getState().readinessGate?.memberRunIds, [sibling])
      assert.equal(useStore.getState().readinessGate?.rechecking, false,
        `${provider}/${stalePath}: surviving sibling is actionable`)
      assert.deepEqual(useStore.getState().readinessGateQueue.map((gate) => gate.runId), [later],
        `${provider}/${stalePath}: later chains remain queued`)
    }
  }
} finally {
  api.readinessDecision = originalStaleDecision
  api.runSnapshot = originalStaleSnapshot
  useStore.setState({ refreshActiveRuns: originalStaleRefreshActiveRuns })
}

console.log('readiness gate store: chain-singleton FIFO, non-empty auto-recovery, standalone strictness, race-safe recheck and stale-member recovery')
