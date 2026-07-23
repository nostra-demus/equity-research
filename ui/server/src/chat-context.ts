// Closed-book context assembly for the cockpit "chat with your data" feature.
//
// Given a scope — the whole run, one module, or one orb — this reads the engine's OWN synthesized
// markdown for that scope (and nothing else) and concatenates it into a single prompt context with
// per-file headings, so the chat model can cite which orb/module each fact came from. It also exposes
// which scopes are present on disk vs not-yet-run, so the UI can show "run this first" instead of
// chatting against thin air. Research swarm only (v1); screener is a fast follow.
//
// Reuses the existing sandboxed readers (readMarkdown / readDecision / runManifest) and the discovered
// roster (buildSwarmGraph) — no module name is ever hardcoded (CLAUDE.md §26).
import { CHAT } from './config'
import { readDecision, readMarkdown, runManifest } from './outputs'
import { buildSwarmGraph } from './roster'
import { resolveInsideRuns } from './sandbox'

export type ChatScope = 'run' | 'module' | 'orb'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ---- narration style: HOW the answer is phrased (the closed-book + citation rules never change) ----
export type ChatStyle = 'simple' | 'analyst' | 'detailed'
export const DEFAULT_CHAT_STYLE: ChatStyle = 'simple'
const CHAT_STYLE_INSTRUCTIONS: Record<ChatStyle, string> = {
  simple:
    'NARRATION STYLE — Explain it simply, as if to a sharp 18-year-old with zero finance background. Use plain ' +
    'everyday words and short sentences. The first time any technical term appears (EBITDA, net debt, margin of ' +
    'safety, …) give its meaning in a quick parenthesis. No jargon, no buzzwords, no hedging. Lead with the bottom ' +
    'line; a short bold heading or two is welcome. (Every citation and the never-invent-a-number rule still apply.)',
  analyst:
    "NARRATION STYLE — Write like a buy-side analyst's private notes: terse, dense, precise. Lead with the answer, " +
    'keep it tight, assume the reader knows the finance terms. No preamble; every figure cited.',
  detailed:
    'NARRATION STYLE — Give a thorough, well-structured walkthrough with short headings, covering the key nuances ' +
    'and caveats and how the numbers connect. Plain English where possible; cite throughout.',
}

// rough token estimate — ~4 chars/token is close enough to size the context cap (we never bill on it).
const estTokens = (s: string): number => Math.ceil(s.length / 4)

interface ContextPiece {
  heading: string
  relPath: string
  markdown: string
  priority: number // higher = keep first when trimming to fit (syntheses/thesis > orbs > triage)
}

export interface AssembledContext {
  present: boolean
  scope: ChatScope
  runRoot: string
  label: string
  sourcePath?: string
  context: string
  files: { path: string; heading: string; tokens: number }[]
  approxTokens: number
  degraded: boolean
  degradeNote?: string
  missingHint?: string // set when !present — what the user must run first
  hasChangeBlock?: boolean // a "What changed since the last version" piece is in the context
}

function tryRead(relPath: string): string | null {
  try {
    // swarm-agnostic: confine to ANY swarm's runs tree (analyses/, screener/runs, commodity/runs, …)
    return readMarkdown(relPath, resolveInsideRuns).markdown
  } catch {
    return null
  }
}

// human label for a module folder name: "balance-sheet-survival" -> "Balance Sheet Survival"
function moduleLabel(name: string): string {
  return name.split('-').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ')
}

// Build the present-orb path set + module->orb file list from the on-disk manifest.
// manifest.modules[mod] entries carry agentKey = `${mod}/${nn}_${slug}` (no .md) for EVERY 00..99 file
// actually present; the run-root-relative path is `${runRoot}/${agentKey}.md`.
function manifestView(runRoot: string) {
  const man = runManifest(runRoot, resolveInsideRuns)
  const orbPaths = new Set<string>()
  const orbByModule: Record<string, { relPath: string; base: string }[]> = {}
  for (const [mod, arr] of Object.entries(man.modules)) {
    for (const a of arr) {
      const relPath = `${runRoot}/${a.agentKey}.md`
      orbPaths.add(relPath)
      ;(orbByModule[mod] ||= []).push({ relPath, base: a.agentKey.slice(mod.length + 1) })
    }
  }
  return { man, orbPaths, orbByModule }
}

function trimToBudget(pieces: ContextPiece[]): { kept: ContextPiece[]; dropped: ContextPiece[] } {
  const total = pieces.reduce((n, p) => n + estTokens(p.markdown), 0)
  if (total <= CHAT.contextMaxTokens) return { kept: pieces, dropped: [] }
  // keep highest-priority first; among equal priority keep the original (manifest) order
  const ordered = pieces.map((p, i) => ({ p, i })).sort((a, b) => b.p.priority - a.p.priority || a.i - b.i)
  const kept: ContextPiece[] = []
  const dropped: ContextPiece[] = []
  let used = 0
  for (const { p } of ordered) {
    const t = estTokens(p.markdown)
    if (used + t <= CHAT.contextMaxTokens || kept.length === 0) {
      kept.push(p)
      used += t
    } else {
      dropped.push(p)
    }
  }
  // restore manifest order for readability
  const order = new Map(pieces.map((p, i) => [p, i]))
  kept.sort((a, b) => (order.get(a)! - order.get(b)!))
  return { kept, dropped }
}

function render(pieces: ContextPiece[]): string {
  return pieces
    .map((p) => `### ${p.heading}\n_(source: ${p.relPath})_\n\n${p.markdown.trim()}\n`)
    .join('\n\n———\n\n')
}

export function assembleContext(opts: {
  scope: ChatScope
  runRoot: string
  module?: string
  orbPath?: string
  swarmId?: string // which swarm's module graph to walk for the run scope (default research)
  // The git-history delta, pre-computed by the caller. It arrives ALREADY RENDERED because reading git
  // is async and this assembler is sync with one caller (an already-async route handler). Keeping it that
  // way is deliberate: making this async would cascade, and the only sync alternative — execFileSync —
  // stalls the event loop that serves the live SSE streams, which the cockpit reads as "System offline".
  whatChanged?: { markdown: string } | null
}): AssembledContext {
  const { scope, runRoot } = opts
  const swarmId = opts.swarmId ?? 'research'
  const { man, orbPaths, orbByModule } = manifestView(runRoot)

  // ---- ORB: one specific agent output ----
  if (scope === 'orb') {
    const orbPath = opts.orbPath || ''
    // path-safety: only an orb the manifest actually lists for THIS run is readable (no arbitrary paths)
    if (!orbPath || !orbPaths.has(orbPath)) {
      return {
        present: false, scope, runRoot, label: 'Orb', context: '', files: [], approxTokens: 0,
        degraded: false, missingHint: 'This orb has not been run yet — run it first, then chat with it.',
      }
    }
    const md = tryRead(orbPath)
    if (md == null) {
      return { present: false, scope, runRoot, label: 'Orb', context: '', files: [], approxTokens: 0, degraded: false, missingHint: 'This orb output could not be read — re-run it.' }
    }
    // module + file are relative to the run root (analyses/<TICKER>_<DATE>/<module>/<file>.md), so derive
    // them from the run-root-relative remainder — not a fixed split index (the run folder has its own '/').
    const rel = orbPath.startsWith(runRoot + '/') ? orbPath.slice(runRoot.length + 1) : orbPath
    const mod = rel.split('/')[0] || ''
    const base = rel.split('/').pop()!.replace(/\.md$/, '')
    const heading = `${moduleLabel(mod)} · ${base}`
    const piece: ContextPiece = { heading, relPath: orbPath, markdown: md, priority: 3 }
    return {
      present: true, scope, runRoot, label: heading, sourcePath: orbPath,
      context: render([piece]), files: [{ path: orbPath, heading, tokens: estTokens(md) }],
      approxTokens: estTokens(md), degraded: false,
    }
  }

  // ---- MODULE: one module's triage + orbs + synthesis ----
  if (scope === 'module') {
    const mod = opts.module || ''
    const synthRel = man.moduleReports[mod]?.synthesis
    const files = orbByModule[mod] || []
    if (!synthRel && files.length === 0) {
      return {
        present: false, scope, runRoot, label: `${moduleLabel(mod)} module`, context: '', files: [], approxTokens: 0,
        degraded: false, missingHint: `The ${moduleLabel(mod)} module has not been run yet — run it first, then chat with it.`,
      }
    }
    const pieces: ContextPiece[] = []
    for (const f of files) {
      const md = tryRead(f.relPath)
      if (md == null) continue
      const isSynth = /^99_/.test(f.base)
      const isTriage = /^00_/.test(f.base)
      pieces.push({
        heading: `${moduleLabel(mod)} · ${f.base}`,
        relPath: f.relPath,
        markdown: md,
        priority: isSynth ? 3 : isTriage ? 1 : 2,
      })
    }
    const { kept, dropped } = trimToBudget(pieces)
    const degraded = dropped.length > 0
    return {
      present: true, scope, runRoot, label: `${moduleLabel(mod)} module`,
      sourcePath: synthRel || files[0]?.relPath,
      context: render(kept),
      files: kept.map((p) => ({ path: p.relPath, heading: p.heading, tokens: estTokens(p.markdown) })),
      approxTokens: kept.reduce((n, p) => n + estTokens(p.markdown), 0),
      degraded,
      degradeNote: degraded ? `Context was trimmed to fit — ${dropped.length} orb output(s) omitted; the module synthesis is kept. Ask about a single orb for full detail.` : undefined,
    }
  }

  // ---- RUN: master thesis + decision record + every module's synthesis ----
  const pieces: ContextPiece[] = []
  let sourcePath: string | undefined
  if (man.finalThesis) {
    const md = tryRead(`${runRoot}/final_thesis.md`)
    if (md != null) {
      pieces.push({ heading: 'Master thesis', relPath: `${runRoot}/final_thesis.md`, markdown: md, priority: 5 })
      sourcePath = `${runRoot}/final_thesis.md`
    }
  }
  if (man.decisionRecord) {
    try {
      const dr = readDecision(runRoot, resolveInsideRuns)
      pieces.push({
        heading: 'Decision record',
        relPath: `${runRoot}/decision_record.json`,
        markdown: '```json\n' + JSON.stringify(dr, null, 2) + '\n```',
        priority: 4,
      })
    } catch { /* unreadable decision record — skip */ }
  }
  // The version delta sits with the decision record it describes (priority 4): only final_thesis.md (5)
  // outranks it, so it survives every realistic trim.
  if (opts.whatChanged) {
    pieces.push({
      heading: 'What changed since the last version',
      relPath: `${runRoot}/decision_record.json — git history`,
      markdown: opts.whatChanged.markdown,
      priority: 4,
    })
  }
  // every module synthesis, in discovered (topo) order (this swarm's graph)
  const g = buildSwarmGraph(swarmId)
  for (const m of g.modules) {
    const synthRel = man.moduleReports[m.name]?.synthesis
    if (!synthRel) continue
    const md = tryRead(synthRel)
    if (md == null) continue
    pieces.push({ heading: `${moduleLabel(m.name)} — module synthesis`, relPath: synthRel, markdown: md, priority: 3 })
    if (!sourcePath) sourcePath = synthRel
  }

  if (pieces.length === 0) {
    return {
      present: false, scope, runRoot, label: 'Whole run', context: '', files: [], approxTokens: 0,
      degraded: false, missingHint: 'No module syntheses or final thesis are on disk yet — run the modules (or the full pipeline) first.',
    }
  }
  const { kept, dropped } = trimToBudget(pieces)
  const degraded = dropped.length > 0
  return {
    present: true, scope, runRoot, label: 'Whole run', sourcePath,
    // derived from what SURVIVED the trim, never from what we pushed — the rule must not promise the
    // model a section that got dropped on the way out.
    hasChangeBlock: kept.some((p) => p.heading === 'What changed since the last version'),
    context: render(kept),
    files: kept.map((p) => ({ path: p.relPath, heading: p.heading, tokens: estTokens(p.markdown) })),
    approxTokens: kept.reduce((n, p) => n + estTokens(p.markdown), 0),
    degraded,
    degradeNote: degraded ? `Context was trimmed to fit — ${dropped.length} section(s) omitted. Ask about a single module or orb for full detail.` : undefined,
  }
}

// ---- which scopes are present (chat-able) vs not-yet-run, for the UI's scope picker ----
export interface ScopeAvailability {
  ticker: string
  runRoot: string | null
  run: { present: boolean }
  modules: { module: string; label: string; present: boolean }[]
  orbs: { module: string; path: string; title: string; present: boolean }[]
}

export function scopeAvailability(ticker: string, runRoot: string | null, swarmId: string = 'research'): ScopeAvailability {
  const g = buildSwarmGraph(swarmId)
  if (!runRoot) {
    return {
      ticker, runRoot: null, run: { present: false },
      modules: g.modules.map((m) => ({ module: m.name, label: moduleLabel(m.name), present: false })),
      orbs: g.modules.flatMap((m) =>
        Object.values(m.layers).flat().map((a) => ({ module: a.module, path: '', title: a.name, present: false })),
      ),
    }
  }
  const { man, orbPaths } = manifestView(runRoot)
  const anySynthesis = Object.values(man.moduleReports).some((r) => !!r?.synthesis)
  return {
    ticker, runRoot,
    run: { present: man.finalThesis || anySynthesis },
    modules: g.modules.map((m) => ({ module: m.name, label: moduleLabel(m.name), present: !!man.moduleReports[m.name]?.synthesis })),
    orbs: g.modules.flatMap((m) =>
      Object.values(m.layers).flat().map((a) => {
        const path = `${runRoot}/${a.module}/${a.nn}_${a.slug}.md`
        return { module: a.module, path, title: a.name, present: orbPaths.has(path) }
      }),
    ),
  }
}

// ---- prompt construction (closed-book system + the context/transcript/question user message) ----
// Added ONLY when the delta block actually survived into the context. With no block, the chat keeps its
// honest refusal ("I have one snapshot and cannot diff") — which was correct behaviour, not a bug. We
// retire that refusal only when we can back it with evidence.
const CHANGE_RULE =
  'A "What changed since the last version" section is in the CONTEXT. When asked what changed, answer from ' +
  'it ONLY — never infer a change by re-reading the current snapshot. If it says the call did not move, lead ' +
  'with that plainly: an unchanged call is a real answer, not a failure (doctrine §1). Then name everything ' +
  'it lists as changed. Never say "nothing changed" while a red flag, kill criterion, missing-data item or ' +
  'module verdict moved — that section separates the call from the evidence underneath it precisely so both ' +
  'get reported. Name the two versions you are comparing (revision + date), and say so if the current one is ' +
  'marked not yet committed. Do not call a change to the call an upgrade or a downgrade — the ratings are not ' +
  'a ladder; say it changed from X to Y.'

export function buildChatPrompts(args: {
  assembled: AssembledContext
  messages: ChatMessage[]
  subject: string
  style?: ChatStyle
  // An authoritative COMPUTED SCENARIO block (from chat-whatif.ts) when this turn is a modelable what-if.
  // The engine already did the arithmetic; the model narrates it and must not recompute. See §15/§20.
  computedBlock?: string
}): { system: string; user: string } {
  const { assembled, messages, subject, computedBlock } = args
  const styleInstruction = CHAT_STYLE_INSTRUCTIONS[args.style ?? DEFAULT_CHAT_STYLE]
  // Rules are numbered from their INDEX, never hand-numbered: the conditional rules below used to append
  // a hardcoded "6.", so adding a second optional rule would have printed two 6s.
  const rules = [
    'Closed book. Use ONLY the CONTEXT. You have NO tools and cannot browse, fetch prices, or read other files. Do not use outside knowledge, and do not rely on anything not written in the CONTEXT.',
    "No source = no claim (engine doctrine §3). If the answer is not in the CONTEXT, say so plainly in one line and name which module or orb the user should run to get it. Never guess, estimate, or fill a gap from memory.",
    'Cite as you go. After a fact, name the heading it came from, e.g. "(Valuation — module synthesis)" or "(Earnings · 03_margin-drivers)", so every number is traceable.',
    'Plain English, short sentences (doctrine §21). Keep technical terms (EBITDA, FCF, net debt, ROIC, …) but add a short plain meaning the first time one appears. Lead with the answer; be concise and specific.',
    "Numbers must match the CONTEXT exactly — do not recompute or round away precision, and keep the company's own currency and units.",
    ...(computedBlock
      ? ['A COMPUTED SCENARIO block is in the CONTEXT. It was produced by the engine\'s deterministic calculator, NOT by you. Lead with its result, state the numbers exactly as given (never recompute or re-round them), cite the source it shows, and carry its confidence and any caution/non-linearity note into the answer.']
      : []),
    ...(assembled.hasChangeBlock ? [CHANGE_RULE] : []),
    ...(assembled.degraded
      ? ['NOTE: the CONTEXT was trimmed to fit, so some orb-level detail may be missing. If a question needs more depth than the CONTEXT holds, tell the user to narrow the chat to that single module or orb.']
      : []),
  ]
  const system = [
    `You are the research-desk assistant inside an institutional equity-research engine. You answer questions about ONE company using ONLY the CONTEXT block in the user's message — the engine's own synthesized notes for ${subject} (scope: ${assembled.label}).`,
    '',
    'Rules you must follow:',
    ...rules.map((r, i) => `${i + 1}. ${r}`),
    '',
    styleInstruction,
  ].join('\n')

  const prior = messages.slice(0, -1)
  const last = messages[messages.length - 1]
  const transcript = prior.length
    ? 'CONVERSATION SO FAR:\n' + prior.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n') + '\n\n═══════════════════════\n\n'
    : ''
  const user = [
    `CONTEXT — the engine's output for ${subject} (scope: ${assembled.label}). Each section is headed by the file it came from:`,
    '',
    assembled.context,
    // The computed what-if sits AFTER the synthesized context and before the question, framed as its own
    // authoritative block so the model narrates it rather than the prose figures around it.
    ...(computedBlock ? ['', '═══════════════════════', '', computedBlock] : []),
    '',
    '═══════════════════════',
    '',
    transcript + 'QUESTION:',
    last.content,
    '',
    'Answer using ONLY the CONTEXT above. If the answer is not there, say so and name which module or orb to run.',
  ].join('\n')

  return { system, user }
}
