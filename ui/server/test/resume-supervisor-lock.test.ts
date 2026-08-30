// Autonomous resume vs exact staging: both directions use the same subject mutation lock.
// Pure/injected: no run folders, registry writes, Git or model process.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import {
  dispatchResumableCandidate,
  liveSubjectSet,
  type ResumableRun,
  type ResumeCandidateDispatchDeps,
} from '../src/resume-supervisor'
import { createRun, finishRun, inFlightRunsForSubject, setActiveSubjectRun } from '../src/registry'
import { SubjectBusyError, subjectMutationLockKey, withSubjectLock } from '../src/subject-lock'

const now = Date.now()
const research: ResumableRun = {
  kind: 'full', subject: 'LOCKRACE', reason: 'terminated_SIGKILL', runRoot: 'analyses/LOCKRACE_2099-01-01',
}

function deps(overrides: Partial<ResumeCandidateDispatchDeps> = {}): ResumeCandidateDispatchDeps {
  return {
    withLock: withSubjectLock,
    liveSubjects: () => new Set(),
    stillResumable: () => true,
    reviewCandidate: async () => null,
    launchCandidate: async () => ({ runId: 'fake' }),
    ...overrides,
  }
}

// Order 1: exact-route staging owns the key first. Supervisor must not recheck/mutate/register/launch.
{
  let rechecked = 0
  let launched = 0
  let mutated = 0
  await withSubjectLock(subjectMutationLockKey('research', research.subject), async () => {
    const outcome = await dispatchResumableCandidate(research, now, deps({
      stillResumable: () => { rechecked++; return true },
      launchCandidate: async () => { launched++; mutated++; return { runId: 'impossible' } },
    }))
    assert.equal(outcome, 'busy')
  })
  assert.equal(rechecked, 0, 'a held route lock rejects before even the final candidate read')
  assert.equal(launched, 0, 'the supervisor never calls the launcher while exact staging owns the key')
  assert.equal(mutated, 0, 'no launch registration or mutation occurs in the losing order')
}

// Order 2: supervisor owns the key first and holds it through launch acknowledgement. An exact-route-like
// contender must receive SubjectBusyError before its staging callback can mutate anything.
{
  let registered = false
  let exactRouteMutated = false
  let announceLaunch!: () => void
  let releaseLaunch!: () => void
  const launchStarted = new Promise<void>((resolve) => { announceLaunch = resolve })
  const holdLaunch = new Promise<void>((resolve) => { releaseLaunch = resolve })
  const supervisor = dispatchResumableCandidate(research, now, deps({
    launchCandidate: async () => {
      registered = true
      announceLaunch()
      await holdLaunch
      return { runId: 'registered' }
    },
  }))
  await launchStarted
  await assert.rejects(
    withSubjectLock(subjectMutationLockKey('research', research.subject), async () => {
      exactRouteMutated = true
    }),
    (error: any) => error instanceof SubjectBusyError,
  )
  assert.equal(exactRouteMutated, false, 'the exact contender loses before its staging callback runs')
  assert.equal(registered, true, 'the supervisor registered while it still owned the shared key')
  releaseLaunch()
  assert.equal(await supervisor, 'launched')
}

// The final candidate and live-state read happen inside the lock, not only in the outer scan.
{
  let launched = 0
  const stale = await dispatchResumableCandidate(research, now, deps({
    stillResumable: () => false,
    launchCandidate: async () => { launched++; return {} },
  }))
  assert.equal(stale, 'stale')
  assert.equal(launched, 0)

  let rechecked = 0
  const live = await dispatchResumableCandidate(research, now, deps({
    liveSubjects: () => new Set([research.subject]),
    stillResumable: () => { rechecked++; return true },
    launchCandidate: async () => { launched++; return {} },
  }))
  assert.equal(live, 'stale')
  assert.equal(rechecked, 0, 'a newly-live subject is rejected before disk eligibility is consulted')
  assert.equal(launched, 0)
}

// Signal resumes use their own swarm-local namespace; a research lock with the same label is unrelated.
{
  const signal: ResumableRun = { kind: 'signal', subject: 'SIG-20990101-deadbeef' }
  let launched = 0
  await withSubjectLock(subjectMutationLockKey('research', signal.subject), async () => {
    assert.equal(await dispatchResumableCandidate(signal, now, deps({
      launchCandidate: async () => { launched++; return {} },
    })), 'launched')
  })
  assert.equal(launched, 1, 'screener resume is not blocked by another swarm with the same subject label')

  await withSubjectLock(subjectMutationLockKey('screener', signal.subject), async () => {
    assert.equal(await dispatchResumableCandidate(signal, now, deps()), 'busy')
  })
}

// Registry liveness is endedAt-based rather than display-status-based. Even if a cancellation path has
// already changed the visible status, an unfinalized writer remains admission authority until close.
{
  const subject = 'CANCELRACE'
  const shuttingDown = createRun({
    kind: 'module', ticker: subject, module: 'management-governance', provider: 'claude', model: 'sonnet',
    reasoningLevel: 'default', profileKey: 'claude|sonnet:default',
    executionProfile: { key: 'claude|sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }, prompt: '',
    user: 'test', userVia: 'local', runRoot: 'analyses/CANCELRACE_2099-01-01', willCommitToMain: true,
    writeTargetsAbs: ['/tmp/CANCELRACE/management-governance/99_management-governance-synthesis.md'],
    coveredModules: ['management-governance'], readDepsAbs: [],
  })
  shuttingDown.status = 'running'
  shuttingDown.child = { pid: 2_000_000_000, kill: () => true } as any
  setActiveSubjectRun(shuttingDown.runId, subject, 'research')
  try {
    shuttingDown.cancelRequested = true
    shuttingDown.status = 'cancelled'
    assert.equal(shuttingDown.status, 'cancelled', 'Cancel is visible immediately')
    assert.equal(shuttingDown.endedAt, undefined, 'process close/finalization has not happened yet')
    assert.deepEqual(inFlightRunsForSubject(subject, 'research').map((run) => run.runId), [shuttingDown.runId],
      'the cancelled-but-unfinalized writer retains its subject claim')

    let launches = 0
    const due: ResumableRun = {
      kind: 'full', subject, reason: 'terminated_SIGTERM', runRoot: shuttingDown.runRoot!,
    }
    assert.equal(await dispatchResumableCandidate(due, now, deps({
      liveSubjects: liveSubjectSet,
      stillResumable: () => true,
      launchCandidate: async () => { launches++; return {} },
    })), 'stale', 'the immediate due-resume sees the shutting-down exact module as live')
    assert.equal(launches, 0, 'no full chain launches before old process close')
  } finally {
    if (shuttingDown.endedAt === undefined) finishRun(shuttingDown, 'cancelled')
  }
}

console.log('resume supervisor lock: both race orders + final live/disk recheck + unfinalized cancellation + swarm namespace passed')
