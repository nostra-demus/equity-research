import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import { setCreditStatus } from './credit'
import { sweepRunOutputs } from './fs-watcher'
// launcher.ts also imports handleStreamLine from this file — a circular import, but safe under native
// ESM: recordStreamResultFailure is a hoisted `export function` (live before either module's own
// top-level code runs), and both files only call the other's export from inside a function body, at
// runtime, never at module-init time. See the comment on recordStreamResultFailure (Finding 1).
import { recordStreamResultFailure } from './launcher'
import { LAUNCH_GUARDS } from './config'
import { emit, emitTransient, finishRun, recordActivity, type RunState } from './registry'
import { agentNameIndexAllSwarms, buildSwarmGraph } from './roster'

let nameIndex: Map<string, { key: string; module: string; layer: number; name: string }> | null = null
function getNameIndex() {
  if (nameIndex) return nameIndex
  // subagent_type -> orb across EVERY swarm (agent names are globally unique, CLAUDE.md §26),
  // so screener Task calls attribute to orbs exactly like research ones.
  nameIndex = agentNameIndexAllSwarms()
  const g = buildSwarmGraph()
  if (g.masterSynthesizer?.name) {
    nameIndex.set(g.masterSynthesizer.name, { key: 'master/synthesizer', module: 'master', layer: 99, name: g.masterSynthesizer.name })
  }
  return nameIndex
}

export function finalPaths(run: RunState) {
  const out: { finalThesisPath?: string | null; decisionRecordPath?: string | null } = {}
  if (!run.runRoot) return out
  const thesis = path.join(REPO_ROOT, run.runRoot, 'final_thesis.md')
  const decision = path.join(REPO_ROOT, run.runRoot, 'decision_record.json')
  out.finalThesisPath = fs.existsSync(thesis) ? `${run.runRoot}/final_thesis.md` : null
  out.decisionRecordPath = fs.existsSync(decision) ? `${run.runRoot}/decision_record.json` : null
  return out
}

// ---- what a tool call is ACTING ON ----
// The stream has always carried the tool NAME ("Read"), which answers "is it alive?" but never "what
// is it reading?" — the one thing someone watching a document-intake run actually wants. These helpers
// pull the single string from each tool's input that names its subject.

const TARGET_MAX = 160

// A tool input is model-authored free text: it can be long or span lines, and the cockpit renders this
// inline. Flatten to one line and cap it.
function tidy(s: string | undefined): string | undefined {
  if (!s) return undefined
  const one = s.replace(/\s+/g, ' ').trim()
  if (!one) return undefined
  return one.length > TARGET_MAX ? `${one.slice(0, TARGET_MAX - 1)}…` : one
}

// An absolute path is machine detail. Show the repo-relative name — the same one the citation rules use
// (`data/<TICKER>/…`, `analyses/<RUN>/…`). A path outside the repo keeps only its last two segments, so
// a stray temp/home path can never print someone's directory tree into the cockpit.
function relPath(p: string | undefined): string | undefined {
  const abs = p?.trim()
  if (!abs) return undefined
  const rel = path.relative(REPO_ROOT, abs)
  if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) return tidy(rel)
  return tidy(abs.startsWith('/') ? abs.split('/').slice(-2).join('/') : abs)
}

function str(input: any, ...keys: string[]): string | undefined {
  for (const k of keys) if (typeof input?.[k] === 'string' && input[k].trim()) return input[k] as string
  return undefined
}

export function activityTarget(tool: string, input: any): string | undefined {
  if (!input || typeof input !== 'object') return undefined
  switch (tool) {
    case 'Read':
    case 'Write':
    case 'Edit':
    case 'NotebookEdit':
      return relPath(str(input, 'file_path', 'notebook_path'))
    case 'Glob':
    case 'Grep': {
      const pat = tidy(str(input, 'pattern'))
      const where = relPath(str(input, 'path'))
      return pat && where ? `${pat} in ${where}` : pat || where
    }
    // Claude Code sends every Bash call a one-line `description` saying what the step is FOR — which
    // reads far better than the shell it runs. The command is the fallback, first clause only.
    case 'Bash':
      return tidy(str(input, 'description')) || tidy(str(input, 'command')?.split(/[\n|&;]/)[0])
    case 'Task':
      return tidy(str(input, 'description', 'subagent_type'))
    case 'WebFetch': {
      const url = str(input, 'url')
      // hostname via the URL parser, never a substring test on the raw string (a crafted URL can put
      // any host in its path/userinfo).
      try {
        return url ? new URL(url).hostname : undefined
      } catch {
        return tidy(url)
      }
    }
    case 'WebSearch':
      return tidy(str(input, 'query'))
  }
  return undefined
}

// Parse one NDJSON line from `claude --output-format stream-json --verbose`.
export function handleStreamLine(run: RunState, line: string) {
  const t = line.trim()
  if (!t) return
  let obj: any
  try {
    obj = JSON.parse(t)
  } catch {
    return
  }
  const ts = Date.now()

  switch (obj.type) {
    case 'system':
      if (obj.subtype === 'init') {
        run.sessionId = obj.session_id || run.sessionId
      }
      break

    case 'assistant': {
      const content = obj.message?.content
      if (!Array.isArray(content)) break
      for (const block of content) {
        // Every orchestrator tool call, with WHAT it acted on (Task = dispatching an agent; Read/Bash/…
        // = pipeline work). Two consumers, deliberately: `lastActivity` rides the 3s heartbeat as the
        // ambient "doing X right now" line, and the per-call `run-activity` event is the step-by-step
        // feed — a run can read several documents between two heartbeats, and each one must be seen.
        if (block?.type === 'tool_use' && typeof block?.name === 'string') {
          const activity = { tool: block.name, target: activityTarget(block.name, block.input), ts }
          run.lastActivity = activity
          recordActivity(run, activity)
          emitTransient(run, { type: 'run-activity', runId: run.runId, tool: activity.tool, target: activity.target, ts })
        }
        if (block?.type === 'tool_use' && block?.name === 'Task') {
          const sub = block.input?.subagent_type
          const idx = sub ? getNameIndex().get(sub) : undefined
          if (idx) {
            if (block.id) run.toolUseToAgent.set(block.id, idx.key)
            const a = run.agents.get(idx.key) || { key: idx.key, module: idx.module, name: idx.name, layer: idx.layer, status: 'queued' as const }
            if (a.status !== 'done') {
              a.status = 'running'
              run.agents.set(idx.key, a)
              emit(run, { type: 'agent-started', runId: run.runId, module: idx.module, agentKey: idx.key, name: idx.name, layer: idx.layer, ts })
            }
          }
        }
      }
      break
    }

    case 'user': {
      const content = obj.message?.content
      if (!Array.isArray(content)) break
      for (const block of content) {
        if (block?.type === 'tool_result' && block?.is_error) {
          const key = run.toolUseToAgent.get(block.tool_use_id)
          const a = key ? run.agents.get(key) : undefined
          if (a && a.status !== 'done') {
            a.status = 'failed'
            emit(run, { type: 'agent-failed', runId: run.runId, agentKey: a.key, module: a.module, name: a.name, layer: a.layer, reason: 'tool_result_error', ts })
          }
        }
      }
      break
    }

    case 'rate_limit_event': {
      const info = obj.rate_limit_info || {}
      // "ok" = you can still make requests on plan quota. Overage being disabled is NOT out-of-quota.
      const ok = info.status !== 'rejected' && info.status !== 'blocked'
      setCreditStatus({
        ok,
        checked: true,
        status: info.status,
        rateLimitType: info.rateLimitType,
        utilization: typeof info.utilization === 'number' ? info.utilization : undefined,
        resetsAt: info.resetsAt,
        isUsingOverage: info.isUsingOverage,
        reason: info.overageDisabledReason || info.status,
      })
      emit(run, { type: 'cost-tick', runId: run.runId, rateLimit: { ok, reason: info.status } as any, ts })
      break
    }

    case 'result': {
      // Capture the verdict BEFORE the is_error branch below, so a CLEAN result records it too. A
      // clean-but-truncated exit is exactly the case that had no durable evidence anywhere, and it is
      // what made months of module stalls undiagnosable.
      run.cliResult = {
        subtype: typeof obj.subtype === 'string' ? obj.subtype : undefined,
        isError: obj.is_error === true,
        apiErrorStatus: typeof obj.api_error_status === 'number' ? obj.api_error_status : undefined,
      }
      if (typeof obj.total_cost_usd === 'number') run.costUsd = obj.total_cost_usd
      if (typeof obj.num_turns === 'number') run.numTurns = obj.num_turns
      if (typeof obj.duration_ms === 'number') run.durationMs = obj.duration_ms
      // last-moment file writes can still be held by the watcher's awaitWriteFinish — sweep the
      // expected outputs from disk so agent-done lands BEFORE run-done, never after
      sweepRunOutputs(run)
      emit(run, { type: 'cost-tick', runId: run.runId, costUsdSoFar: run.costUsd, ts })
      // Error results finalize early (unambiguous). A CLEAN result does NOT finalize here: the
      // process-close handler (launcher's finalizeRunOnClose) is the single success finalizer, so
      // its integrity checks — the full/rerun missing-final-thesis guard — can never be bypassed
      // by a clean stream `result` arriving moments before the process closes.
      if (run.status === 'running' || run.status === 'starting') {
        if (obj.is_error || obj.subtype === 'error_max_turns' || obj.subtype === 'error_during_execution') {
          const reason = obj.api_error_status ? `api_error_${obj.api_error_status}` : obj.subtype || 'engine_error'
          let message = typeof obj.result === 'string' ? obj.result : ''
          // A CAP STOP IS NOT A CRASH — say which ceiling was hit, in words, with the numbers. The CLI
          // reports a budget stop as a bare `error_during_execution` with an empty result, so the cockpit
          // rendered a deliberate, expected ceiling as an unexplained ERROR. That is what made the
          // 2026-08-19 governance stalls unreadable: the module was simply out of allowance and nothing
          // anywhere said so. The machine `reason` deliberately stays the CLI's own subtype — the failure
          // note and downstream consumers key on it — so only the human-facing `message` changes.
          const guard = LAUNCH_GUARDS[run.kind]
          if (guard) {
            const spent = typeof run.costUsd === 'number' ? run.costUsd : 0
            const turns = typeof run.numTurns === 'number' ? run.numTurns : 0
            // Within 2% counts as "hit it" — the ceiling is enforced between turns, so a run stops at or
            // fractionally under it, and a concurrent wave can overshoot it outright.
            const env = `ENGINE_${run.kind.toUpperCase().replace(/-/g, '_')}`
            let capNote = ''
            if (spent >= guard.budgetUsd * 0.98) {
              capNote = `Stopped at the spend ceiling for a ${run.kind} run: $${spent.toFixed(2)} of $${guard.budgetUsd}. `
                + `Nothing crashed — it ran out of allowance. Raise ${env}_BUDGET_USD, or re-run the remaining orbs individually.`
            } else if (obj.subtype === 'error_max_turns' || (guard.maxTurns && turns >= guard.maxTurns)) {
              capNote = `Stopped at the step ceiling for a ${run.kind} run: ${turns} of ${guard.maxTurns} turns. `
                + `Nothing crashed — it ran out of steps. Raise ${env}_MAX_TURNS, or re-run the remaining orbs individually.`
            }
            // APPEND, never replace: the CLI's own text is the diagnostic the failure note carries, and
            // overwriting it would trade one blind spot for another.
            if (capNote) message = message ? `${message}\n\n${capNote}` : capNote
          }
          // Finding 1: this early-finalize path used to call finishRun() directly, which sets run.endedAt —
          // so finalizeRunOnClose (the close handler) would later return immediately without ever writing
          // the .interrupted marker or RUN_FAILURE.md for what is the single most common budget/API-error
          // stop. Record the SAME failure note here, before finishRun, so it's never skipped.
          recordStreamResultFailure(run, reason, message)
          emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason, message: message ? message.slice(0, 400) : undefined, ts })
          finishRun(run, 'error')
        }
      }
      break
    }
  }
}
