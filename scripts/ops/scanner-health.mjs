#!/usr/bin/env node

// Read the engine's shared scanner verdict and translate it into a tiny watchdog contract.
// Exit 0 = healthy, 2 = real fault but restart cannot fix it, 3 = restart-repairable, 4 = malformed
// contract. The watchdog never has to infer a remedy from prose or duplicate provider logic in Bash.

let url = process.env.SCANNER_HEALTH_URL || 'http://127.0.0.1:8787/api/news/diagnostics'
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--url' && process.argv[i + 1]) url = process.argv[++i]
}

function oneLine(value) {
  return String(value ?? '').replace(/[\t\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)
}

function emit(status, code, action, summary, exitCode) {
  process.stdout.write(`${oneLine(status)}\t${oneLine(code)}\t${oneLine(action)}\t${oneLine(summary)}\n`)
  process.exitCode = exitCode
}

let response
try {
  response = await fetch(url, { signal: AbortSignal.timeout(8_000), headers: { accept: 'application/json' } })
} catch (error) {
  emit('failing', 'diagnostics-unreachable', 'restart-engine', `Scanner diagnostics could not be reached: ${error?.message || error}`, 3)
}

if (response) {
  if (!response.ok) {
    emit('failing', 'diagnostics-unreachable', 'restart-engine', `Scanner diagnostics returned HTTP ${response.status}.`, 3)
  } else {
    let body
    try { body = await response.json() }
    catch (error) {
      emit('failing', 'diagnostics-contract-invalid', 'inspect-deploy', `Scanner diagnostics were not JSON: ${error?.message || error}`, 4)
    }

    if (body) {
      const health = body.health
      const validStatus = ['healthy', 'degraded', 'failing', 'idle'].includes(health?.status)
      const validCode = typeof health?.code === 'string' && health.code.length > 0
      const validAction = typeof health?.action === 'string' && health.action.length > 0
      const validSummary = typeof health?.summary === 'string' && health.summary.length > 0
      const validRestart = typeof health?.restartRecommended === 'boolean'
      const validFindings = Array.isArray(health?.findings)
      if (!validStatus || !validCode || !validAction || !validSummary || !validRestart || !validFindings) {
        emit('failing', 'diagnostics-contract-invalid', 'inspect-deploy', 'Scanner diagnostics did not contain a valid health verdict.', 4)
      } else {
        emit(
          health.status,
          health.code,
          health.restartRecommended ? 'restart-engine' : health.action,
          health.summary,
          health.status === 'healthy' ? 0 : health.restartRecommended ? 3 : 2,
        )
      }
    }
  }
}
