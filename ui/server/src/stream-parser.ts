import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import { setCreditStatus } from './credit'
// launcher.ts also imports handleStreamLine from this file — a circular import, but safe under native
// ESM: recordStreamResultFailure is a hoisted `export function` (live before either module's own
// top-level code runs), and both files only call the other's export from inside a function body, at
// runtime, never at module-init time. See the comment on recordStreamResultFailure (Finding 1).
import { recordStreamResultFailure } from './launcher'
import { LAUNCH_GUARDS } from './config'
import { emit, emitTransient, recordActivity, type RunState } from './registry'
import { agentNameIndexAllSwarms, buildSwarmGraph } from './roster'
import { getProviderAdapter } from './providers/registry'

const PROVIDER_MESSAGE_MAX = 4_000

function rememberProviderMessage(run: RunState, message: string | undefined): void {
  const normalized = message?.trim()
  if (!normalized) return
  run.lastProviderMessage = normalized.slice(-PROVIDER_MESSAGE_MAX)
}

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

// Parse one provider stream line. Provider adapters normalize their native JSONL before any
// provider-specific shape reaches the shared run registry, activity feed, or finalizer.
export function handleStreamLine(run: RunState, line: string) {
  const events = getProviderAdapter(run.provider).parseStreamLine(line)
  for (const event of events) {
    const ts = Date.now()
    if (event.type === 'session') {
      run.sessionId = event.sessionId || run.sessionId
      continue
    }
    if (event.type === 'assistant-message') {
      rememberProviderMessage(run, event.message)
      continue
    }
    if (event.type === 'tool-use') {
      // Every orchestrator tool call, with WHAT it acted on (Task = dispatching an agent; Read/Bash/…
      // = pipeline work). The provider adapter preserves the canonical tool name + normalized input.
      const activity = { tool: event.tool, target: activityTarget(event.tool, event.input), ts }
      run.lastActivity = activity
      recordActivity(run, activity)
      emitTransient(run, {
        type: 'run-activity', runId: run.runId, tool: activity.tool, target: activity.target,
        provider: run.provider, executionProfile: run.executionProfile, ts,
      })
      if (event.tool === 'Task') {
        const input = event.input as any
        const sub = input?.subagent_type
        const idx = sub ? getNameIndex().get(sub) : undefined
        if (idx) {
          if (event.toolUseId) run.toolUseToAgent.set(event.toolUseId, idx.key)
          const a = run.agents.get(idx.key) || { key: idx.key, module: idx.module, name: idx.name, layer: idx.layer, status: 'queued' as const }
          if (a.status !== 'done') {
            a.status = 'running'
            run.agents.set(idx.key, a)
            emit(run, { type: 'agent-started', runId: run.runId, module: idx.module, agentKey: idx.key, name: idx.name, layer: idx.layer, ts })
          }
        }
      }
      continue
    }
    if (event.type === 'tool-result') {
      if (!event.isError) continue
      const key = event.toolUseId ? run.toolUseToAgent.get(event.toolUseId) : undefined
      const a = key ? run.agents.get(key) : undefined
      if (a && a.status !== 'done') {
        a.status = 'failed'
        emit(run, { type: 'agent-failed', runId: run.runId, agentKey: a.key, module: a.module, name: a.name, layer: a.layer, reason: 'tool_result_error', ts })
      }
      continue
    }
    if (event.type === 'usage') {
      setCreditStatus(event.usage, run.provider)
      emit(run, { type: 'cost-tick', runId: run.runId, rateLimit: { ok: event.usage.ok, reason: event.usage.status || event.usage.reason }, ts })
      continue
    }
    if (event.type === 'result') {
      // Capture the verdict BEFORE the is_error branch below, so a CLEAN result records it too. A
      // clean-but-truncated exit is exactly the case that had no durable evidence anywhere, and it is
      // what made months of module stalls undiagnosable.
      run.cliResult = event.cliResult
      rememberProviderMessage(run, event.message)
      if (typeof event.costUsd === 'number') run.costUsd = event.costUsd
      if (typeof event.numTurns === 'number') run.numTurns = event.numTurns
      if (typeof event.durationMs === 'number') run.durationMs = event.durationMs
      // Do not sweep outputs on the stream result. The detached leader can emit its result and exit while
      // a Task/tool descendant is still writing. The launcher's close path proves the whole process group
      // extinct first, then performs the authoritative final sweep before terminal validation/publication.
      emit(run, { type: 'cost-tick', runId: run.runId, costUsdSoFar: run.costUsd, ts })
      // Error results are recorded/emitted immediately, but NO result finalizes here. The process-close
      // handler must first prove the detached process group extinct; a Task/tool descendant can survive the
      // leader and keep writing even after this line arrives. Clean results also wait for close-time integrity.
      if (run.status === 'running' || run.status === 'starting') {
        if (event.cliResult.isError || event.cliResult.subtype === 'error_max_turns' || event.cliResult.subtype === 'error_during_execution') {
          const reason = event.cliResult.subtype === 'out_of_credits'
            ? 'out_of_credits'
            : event.cliResult.apiErrorStatus ? `api_error_${event.cliResult.apiErrorStatus}`
              : event.cliResult.subtype || 'engine_error'
          let message = event.message || ''
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
            } else if (event.cliResult.subtype === 'error_max_turns' || (guard.maxTurns && turns >= guard.maxTurns)) {
              capNote = `Stopped at the step ceiling for a ${run.kind} run: ${turns} of ${guard.maxTurns} turns. `
                + `Nothing crashed — it ran out of steps. Raise ${env}_MAX_TURNS, or re-run the remaining orbs individually.`
            }
            // APPEND, never replace: the CLI's own text is the diagnostic the failure note carries, and
            // overwriting it would trade one blind spot for another.
            if (capNote) message = message ? `${message}\n\n${capNote}` : capNote
          }
          // Record the failure note now, while preserving endedAt + claims until process-group-safe close.
          recordStreamResultFailure(run, reason, message)
          emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason, message: message ? message.slice(0, 400) : undefined, ts })
        }
      }
      continue
    }
  }
}
