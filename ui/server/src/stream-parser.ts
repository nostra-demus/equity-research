import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import { setCreditStatus } from './credit'
import { emit, finishRun, type RunState } from './registry'
import { buildSwarmGraph } from './roster'

let nameIndex: Map<string, { key: string; module: string; layer: number; name: string }> | null = null
function getNameIndex() {
  if (nameIndex) return nameIndex
  nameIndex = new Map()
  const g = buildSwarmGraph()
  for (const m of g.modules) {
    for (const a of Object.values(m.layers).flat()) {
      nameIndex.set(a.name, { key: a.key, module: a.module, layer: a.layer, name: a.name })
    }
  }
  if (g.masterSynthesizer?.name) {
    nameIndex.set(g.masterSynthesizer.name, { key: 'master/synthesizer', module: 'master', layer: 99, name: g.masterSynthesizer.name })
  }
  return nameIndex
}

function finalPaths(run: RunState) {
  const out: { finalThesisPath?: string | null; decisionRecordPath?: string | null } = {}
  if (!run.runRoot) return out
  const thesis = path.join(REPO_ROOT, run.runRoot, 'final_thesis.md')
  const decision = path.join(REPO_ROOT, run.runRoot, 'decision_record.json')
  out.finalThesisPath = fs.existsSync(thesis) ? `${run.runRoot}/final_thesis.md` : null
  out.decisionRecordPath = fs.existsSync(decision) ? `${run.runRoot}/decision_record.json` : null
  return out
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
      if (typeof obj.total_cost_usd === 'number') run.costUsd = obj.total_cost_usd
      if (typeof obj.num_turns === 'number') run.numTurns = obj.num_turns
      if (typeof obj.duration_ms === 'number') run.durationMs = obj.duration_ms
      emit(run, { type: 'cost-tick', runId: run.runId, costUsdSoFar: run.costUsd, ts })
      if (run.status === 'running' || run.status === 'starting') {
        if (obj.is_error || obj.subtype === 'error_max_turns' || obj.subtype === 'error_during_execution') {
          const reason = obj.api_error_status ? `api_error_${obj.api_error_status}` : obj.subtype || 'engine_error'
          emit(run, { type: 'run-error', runId: run.runId, status: 'error', reason, message: typeof obj.result === 'string' ? obj.result.slice(0, 400) : undefined, ts })
          finishRun(run, 'error')
        } else {
          emit(run, { type: 'run-done', runId: run.runId, status: 'done', costUsd: run.costUsd, durationMs: run.durationMs, numTurns: run.numTurns, ...finalPaths(run), ts })
          finishRun(run, 'done')
        }
      }
      break
    }
  }
}
