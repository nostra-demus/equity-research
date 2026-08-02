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
import path from 'node:path'
import { CHAT, REPO_ROOT } from './config'
import { readDecision, readMarkdown, runManifest } from './outputs'
import { loadRetrievalConcepts } from './retrieval/concepts'
import { buildHybridQuery, HybridCollector } from './retrieval/hybrid'
import { buildSwarmGraph, findRunRootForSubject, swarmSubjects } from './roster'
import { listSwarms } from './swarms'
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

export interface ContextPiece {
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
  linkedRuns?: LinkedRun[] // cross-swarm dossiers folded into the context because this run references them
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

export function rankContextPiecesForQuestion(pieces: ContextPiece[], question = ''): ContextPiece[] {
  const indexed = pieces.map((p, i) => ({ p, i, id: `${i}:${p.relPath}` }))
  let ordered = indexed.slice().sort((a, b) => b.p.priority - a.p.priority || a.i - b.i)
  const query = buildHybridQuery(question, { concepts: loadRetrievalConcepts(REPO_ROOT), maxTerms: 12 })
  if (query.terms.length) {
    const collector = new HybridCollector<(typeof indexed)[number]>(query)
    for (const row of indexed) {
      collector.add({
        id: row.id,
        value: row,
        quality: row.p.priority * 100,
        fields: [
          { name: 'heading', text: row.p.heading, weight: 7, fuzzy: true },
          { name: 'path', text: row.p.relPath, weight: 2, fuzzy: true },
          { name: 'body', text: row.p.markdown, weight: 1 },
        ],
      })
    }
    const mandatory = indexed.filter((row) => row.p.priority >= 4).sort((a, b) => b.p.priority - a.p.priority || a.i - b.i)
    const used = new Set(mandatory.map((row) => row.id))
    const relevant = collector.results(indexed.length).map((hit) => hit.document.value).filter((row) => !used.has(row.id))
    for (const row of relevant) used.add(row.id)
    const remaining = indexed.filter((row) => !used.has(row.id)).sort((a, b) => b.p.priority - a.p.priority || a.i - b.i)
    ordered = [...mandatory, ...relevant, ...remaining]
  }
  return ordered.map((row) => row.p)
}

function trimToBudget(pieces: ContextPiece[], question = ''): { kept: ContextPiece[]; dropped: ContextPiece[] } {
  const total = pieces.reduce((n, p) => n + estTokens(p.markdown), 0)
  if (total <= CHAT.contextMaxTokens) return { kept: pieces, dropped: [] }
  // The final thesis and decision record remain mandatory. For everything else, use the same explainable
  // hybrid retrieval as news chat so an oversized run keeps the sections that answer this question.
  const ordered = rankContextPiecesForQuestion(pieces, question)
  const kept: ContextPiece[] = []
  const dropped: ContextPiece[] = []
  let used = 0
  for (const p of ordered) {
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

// ---- cross-swarm linked dossiers (C-1) ----
// A run's chat can pull in the SYNTHESES of ANOTHER swarm's committed run that this run's own text
// references — e.g. an NHY research thesis discussing "LME aluminium" links the ALUMINIUM commodity run's
// dossier, so a question about the aluminium price is answerable from the engine's OWN output instead of
// refused. Stays closed-book (still engine-authored markdown, cited by source) and §26-generic: candidate
// subjects come from the swarm manifests + the run's content, never a hardcoded pairing.
export interface LinkedRun { swarmId: string; subject: string; runRoot: string; mentions: number }

// PURE: normalize an OS path to forward slashes. `path.relative` yields backslashes on Windows, which would
// break the run-root equality check (`rr === primaryRunRoot`, forward-slash) and the `startsWith(runRoot +
// '/')` survivor filter — both compare forward-slash paths. Normalizing both sides keeps them right on any
// platform. Unit-tested.
export function toPosixPath(p: string): string {
  return p.replace(/\\/g, '/')
}

// PURE: the candidate subjects, by swarm, that a run in `sourceSwarmId` may link — every OTHER swarm's
// subjects, never the source swarm's own. Self/peer exclusion keys on the SWARM, not the subject string:
// a research GOLD run may link the commodity GOLD dossier (different swarm, same name — the wanted cross-
// swarm case), while a commodity GOLD run never pulls in its OWN swarm's COPPER/WHEAT comparison names.
// Skips the active swarm, not just research. Unit-tested.
export function linkCandidatesBySwarm(sourceSwarmId: string, subjectsBySwarm: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [swarmId, subs] of Object.entries(subjectsBySwarm)) {
    if (swarmId === sourceSwarmId) continue
    if (subs.length) out[swarmId] = subs
  }
  return out
}

// PURE: a run is linkable only once it has reached its terminal, committed deliverable. The primary,
// §26-GENERIC signal is the manifest's `finalReport` — final_thesis.md for research, else the terminal
// MODULE's synthesis, DERIVED from the discovered swarm graph (not a hardcoded artifact list), so a future
// swarm that ends on some other synthesis is honoured with no engine edit. decision_record.json is kept as a
// belt-and-suspenders terminal marker. A run FOLDER is created BEFORE its modules run, so a bare/partial
// folder has no finalReport and is not linked (committed-dossier contract).
// KNOWN LIMITATION: a rerun overwrites a completed folder in place while its terminal marker persists, so a
// chat during an ACTIVE rerun can still read a mixed-generation dossier. The full fix is a committed-snapshot
// transaction in the rerun flow (rename/guard the marker across the mutation) — not observable from here.
export function isLinkableRun(man: { finalReport?: unknown | null; decisionRecord?: boolean; finalThesis?: boolean }): boolean {
  return !!(man.finalReport || man.decisionRecord || man.finalThesis)
}

// PURE: the subjects (by swarm) `text` references as a whole word (case-insensitive). Ranked by mention
// count, capped. Self/peer exclusion is NOT done here — the caller passes only cross-swarm candidates (via
// linkCandidatesBySwarm), so a candidate that shares the primary run's subject name is a genuine cross-swarm
// link and is kept. Only too-short names (whole-word false-match risk) are skipped. Unit-tested fixture-free.
export function matchLinkedSubjects(text: string, candidatesBySwarm: Record<string, string[]>, cap = 3): { swarmId: string; subject: string; mentions: number }[] {
  // Slug separators (- _) become spaces on BOTH sides, so a subject like CRUDE-OIL matches the prose spelling
  // "crude oil" (and "crude-oil"); the subject's words are then matched with flexible whitespace.
  const hay = (text || '').toLowerCase().replace(/[-_]+/g, ' ')
  if (!hay.trim()) return []
  const out: { swarmId: string; subject: string; mentions: number }[] = []
  for (const [swarmId, subjects] of Object.entries(candidatesBySwarm)) {
    for (const subj of subjects) {
      const norm = (subj || '').toLowerCase().replace(/[-_]+/g, ' ').trim()
      if (norm.replace(/\s+/g, '').length < 3) continue // too-short → whole-word false-match risk
      const pat = norm.split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')
      const re = new RegExp(`\\b${pat}\\b`, 'g')
      const mentions = (hay.match(re) || []).length
      if (mentions > 0) out.push({ swarmId, subject: subj, mentions })
    }
  }
  return out.sort((a, b) => b.mentions - a.mentions || a.subject.localeCompare(b.subject)).slice(0, cap)
}

// Discover the committed runs of OTHER swarms that `text` references and that EXIST on disk. Self/peer
// exclusion keys on (swarm, run identity): the SOURCE swarm's own subjects are never candidates (so a run
// never pulls its own swarm's peers), and the primary run's own root is skipped — while a genuine cross-
// swarm link that shares a subject name (research GOLD ↔ commodity GOLD) IS kept. Only a COMPLETED run
// (terminal marker present — isLinkableRun) is linked, never a mid-pipeline/partial folder. Returns run-
// root-relative (POSIX) paths, confined to committed runs. §26-generic: candidates come from the swarm
// manifests + the run's content, never a hardcoded pairing.
export function discoverLinkedRuns(text: string, primaryRunRoot: string, sourceSwarmId: string): LinkedRun[] {
  const subjectsBySwarm: Record<string, string[]> = {}
  for (const swarm of listSwarms()) {
    const subs = swarmSubjects(swarm.id)
    if (subs.length) subjectsBySwarm[swarm.id] = subs
  }
  const candidatesBySwarm = linkCandidatesBySwarm(sourceSwarmId, subjectsBySwarm)
  const primary = toPosixPath(primaryRunRoot)
  const out: LinkedRun[] = []
  const LINK_CAP = 3
  // Rank ALL mentioned candidates, then keep the top LINK_CAP that actually resolve to a linkable, committed
  // run — so subjects that are declared but never run (swarmSubjects includes them) can't consume the cap
  // ahead of a lower-ranked dossier that IS available. Cap the survivors, not the raw mentions.
  for (const m of matchLinkedSubjects(text, candidatesBySwarm, Number.MAX_SAFE_INTEGER)) {
    if (out.length >= LINK_CAP) break
    const abs = findRunRootForSubject(m.swarmId, m.subject)
    if (!abs) continue
    const rr = toPosixPath(path.relative(REPO_ROOT, abs))
    if (rr === primary) continue
    let linkable = false
    try { linkable = isLinkableRun(runManifest(rr, resolveInsideRuns)) } catch { linkable = false }
    if (!linkable) continue
    out.push({ swarmId: m.swarmId, subject: m.subject, runRoot: rr, mentions: m.mentions })
  }
  return out
}

export function assembleContext(opts: {
  scope: ChatScope
  runRoot: string
  module?: string
  orbPath?: string
  swarmId?: string // which swarm's module graph to walk for the run scope (default research)
  linked?: boolean // include cross-swarm dossiers the run references (default on; run scope only)
  question?: string // used only when an oversized scope must keep the most relevant sections
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
    const { kept, dropped } = trimToBudget(pieces, opts.question)
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
  // ---- C-1: fold in cross-swarm dossiers this run's own text references (closed book — still engine
  // markdown, cited by source; lower priority than every primary piece, so trimmed first under budget) ----
  let linkedRuns: LinkedRun[] = []
  if (opts.linked !== false) {
    const primaryText = pieces.map((p) => p.markdown).join('\n')
    linkedRuns = discoverLinkedRuns(primaryText, runRoot, swarmId)
    for (const lr of linkedRuns) {
      let lman
      try { lman = runManifest(lr.runRoot, resolveInsideRuns) } catch { continue }
      for (const [mod, rep] of Object.entries(lman.moduleReports)) {
        const synthRel = rep?.synthesis
        if (!synthRel) continue
        const md = tryRead(synthRel)
        if (md == null) continue
        pieces.push({
          heading: `Linked dossier · ${lr.subject} (${lr.swarmId}) — ${moduleLabel(mod)} synthesis`,
          relPath: synthRel, markdown: md, priority: 2,
        })
      }
    }
  }
  const { kept, dropped } = trimToBudget(pieces, opts.question)
  const degraded = dropped.length > 0
  // Only report a linked run whose content actually SURVIVED the trim — never promise the model a dossier
  // that got dropped on the way out (same rule the change-block honours below).
  const survivingLinks = linkedRuns.filter((lr) => kept.some((p) => p.relPath.startsWith(lr.runRoot + '/')))
  return {
    present: true, scope, runRoot, label: 'Whole run', sourcePath,
    linkedRuns: survivingLinks.length ? survivingLinks : undefined,
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
    ...(assembled.linkedRuns?.length
      ? [`The CONTEXT includes one or more "Linked dossier · …" sections — the engine's OWN output for ANOTHER run that ${subject} references (${assembled.linkedRuns.map((l) => `${l.subject}`).join(', ')}). Answer from them when the question needs them (e.g. a commodity price this ${subject} thesis depends on), and cite them by their "Linked dossier · …" heading so it is clear the fact came from a different run, not from ${subject} itself. They inform ${subject}'s thesis; they do not change its verdict.`]
      : []),
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
