import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { resolveInsideAnalyses, resolveInsidePrompts } from './sandbox'
import { extractVerdict } from './verdict'

export function readMarkdown(relPath: string): { path: string; markdown: string } {
  const real = resolveInsideAnalyses(relPath)
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
}

// Read a prompt (agent definition / module rules / constitution) from the read-only doctrine surface.
export function readPrompt(relPath: string): { path: string; markdown: string } {
  const real = resolveInsidePrompts(relPath)
  const markdown = fs.readFileSync(real, 'utf8')
  return { path: relPath, markdown }
}

export function resolveRunRoot(opts: { runRoot?: string; ticker?: string; date?: string }): string | null {
  if (opts.runRoot) return opts.runRoot.replace(/^\/+/, '')
  if (opts.ticker && opts.date) return `analyses/${opts.ticker}_${opts.date}`
  if (opts.ticker) {
    try {
      const dirs = fs.readdirSync(ANALYSES_DIR).filter((n) => n.startsWith(opts.ticker + '_')).sort().reverse()
      return dirs.length ? `analyses/${dirs[0]}` : null
    } catch {
      return null
    }
  }
  return null
}

export function readDecision(runRoot: string): any {
  const p = resolveInsideAnalyses(`${runRoot}/decision_record.json`)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

export function listRunsForTicker(ticker: string) {
  let dirs: string[] = []
  try {
    dirs = fs.readdirSync(ANALYSES_DIR).filter((n) => n.startsWith(ticker + '_')).sort().reverse()
  } catch {
    return []
  }
  return dirs.map((d) => {
    const runRoot = `analyses/${d}`
    let decision: string | null = null
    let confidence: number | null = null
    let decisionDate: string | null = null
    try {
      const dr = readDecision(runRoot)
      decision = dr.decision ?? null
      confidence = typeof dr.confidence_score === 'number' ? dr.confidence_score : null
      decisionDate = dr.decision_date ?? null
    } catch {}
    return {
      runRoot,
      date: d.slice(ticker.length + 1),
      decision,
      confidence,
      decisionDate,
      hasFinalThesis: fs.existsSync(path.join(REPO_ROOT, runRoot, 'final_thesis.md')),
    }
  })
}

export function runManifest(runRoot: string) {
  const abs = resolveInsideAnalyses(runRoot)
  const modules: Record<string, { agentKey: string; name: string; verdict: string | null }[]> = {}
  for (const entry of fs.readdirSync(abs)) {
    const sub = path.join(abs, entry)
    let isDir = false
    try {
      isDir = fs.statSync(sub).isDirectory()
    } catch {}
    if (!isDir) continue
    const files = fs.readdirSync(sub).filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
    modules[entry] = files.map((f) => {
      const base = f.replace(/\.md$/, '')
      let verdict: string | null = null
      try {
        verdict = extractVerdict(fs.readFileSync(path.join(sub, f), 'utf8'))
      } catch {}
      return { agentKey: `${entry}/${base}`, name: base.slice(3), verdict }
    })
  }
  const has = (f: string) => fs.existsSync(path.join(abs, f))
  return {
    runRoot,
    modules,
    memo: has('memo.md'),
    finalThesis: has('final_thesis.md'),
    fullDossier: has('audit_dossier.md'),
    decisionRecord: has('decision_record.json'),
    verification: has('verification_report.json') || has('verification_report_v3.json') || has('verification_report_v2.json'),
    preMortem: has('pre_mortem.json'),
    expectationsGap: has('expectations_gap.json'),
  }
}
