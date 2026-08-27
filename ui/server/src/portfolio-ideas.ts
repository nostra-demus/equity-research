// Which IDEA a trade was expressing — the thing neither the broker nor the engine can infer.
//
// The book already answers "what do I hold" and "what did each symbol make". It cannot answer the
// question a PM actually asks: DID THE IDEA WORK. In a real export, CANE (Teucrium Sugar) and SUGAl
// (WisdomTree Sugar) are two rows that never meet, yet they were one sugar bet; NHYDY is an aluminium
// bet wearing an ADR's clothes. Summed by symbol, the sugar result is invisible.
//
// NOTHING HERE IS INFERRED, AND NOTHING IS ASSIGNED AUTOMATICALLY. That is not caution, it is the
// whole design constraint. A ticker is not an idea: AMZN bought this year for one reason and next year
// for another is two ideas sharing a symbol, and any rule keyed on the symbol alone would sweep both
// under whichever label happened to be current — relabelling history the operator never relabelled.
// So an assignment is keyed to the thing that actually happened at a point in time:
//
//   · an OPEN position, keyed by symbol — there is only one open position per symbol at a time, so
//     the key cannot span two eras;
//   · a CLOSED round trip, keyed by the BROKER'S OWN closeTradeID — stable, unique, and already the
//     identity the first fold in tradeRows.ts groups on.
//
// A closure with no closeTradeID cannot be keyed stably and is therefore not assignable. It is
// reported as such rather than given a positional key that would silently point at a different trade
// the next time a statement is imported.

import fs from 'node:fs'
import path from 'node:path'

const FILE = 'ideas.json'

/** Bounded like every other file in this lane. A book with 200 live ideas is not a book. */
export const MAX_IDEAS = 200
/** Bounded so a corrupt or hand-edited file cannot make the read unbounded work. */
export const MAX_ASSIGNMENTS = 20_000
export const MAX_LABEL_LENGTH = 60

// Positions below this are residual dust, not a view. One share of CANE left over from a closed sugar
// trade is $11 against a $1.03m book: counting it makes the idea render at 0.0% of NAV forever, which
// reads as "this idea is on and tiny" when the truth is "this idea is closed". Excluded from idea
// WEIGHTING only — never from the holdings list, and never from reconciliation, because the book
// certifies its positions against broker NAV and quietly dropping one would open a break to save a
// rounding line.
export const RESIDUAL_VALUE_BASE = 100

export interface Idea {
  id: string
  label: string
}

export interface IdeaAssignments {
  /** SYMBOL (upper-cased) -> idea id. Labels the CURRENT open position only. */
  positions: Record<string, string>
  /** Broker closeTradeID -> idea id. Labels one closed round trip, at the time it happened. */
  closures: Record<string, string>
}

export interface IdeaBook {
  ideas: Idea[]
  assignments: IdeaAssignments
}

const emptyBook = (): IdeaBook => ({ ideas: [], assignments: { positions: {}, closures: {} } })

function filePath(dir: string): string { return path.join(dir, FILE) }

export function normalizeSymbol(symbol: string | null | undefined): string {
  return String(symbol ?? '').trim().toUpperCase()
}

/** Slug used as the stable id. Kept separate from the label so renaming never orphans an assignment. */
export function ideaId(label: string): string {
  const slug = String(label ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug
}

/** A file that cannot be read is an empty book, never an error: these decorate the book, and losing
 *  them must not cost the book. Mirrors readOverrides deliberately — same lane, same failure rule. */
export function readIdeas(dir: string): IdeaBook {
  let raw: unknown
  try { raw = JSON.parse(fs.readFileSync(filePath(dir), 'utf8')) } catch { return emptyBook() }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyBook()
  const src = raw as { ideas?: unknown; assignments?: unknown }

  const ideas: Idea[] = []
  const seen = new Set<string>()
  if (Array.isArray(src.ideas)) {
    for (const entry of src.ideas) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
      const e = entry as { id?: unknown; label?: unknown }
      const id = typeof e.id === 'string' ? e.id.trim() : ''
      const label = typeof e.label === 'string' ? e.label.trim() : ''
      if (!id || !label || seen.has(id) || ideas.length >= MAX_IDEAS) continue
      seen.add(id)
      ideas.push({ id, label: label.slice(0, MAX_LABEL_LENGTH) })
    }
  }

  // An assignment pointing at an idea that no longer exists is dropped on read rather than rendered as
  // a dangling label. Deleting an idea therefore cannot leave the book referencing a ghost.
  const readMap = (value: unknown, key: (k: string) => string): Record<string, string> => {
    const out: Record<string, string> = {}
    if (!value || typeof value !== 'object' || Array.isArray(value)) return out
    let n = 0
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (n >= MAX_ASSIGNMENTS) break
      if (typeof v !== 'string') continue
      const kk = key(k)
      if (!kk || !seen.has(v)) continue
      out[kk] = v
      n++
    }
    return out
  }

  const assignments = src.assignments && typeof src.assignments === 'object' && !Array.isArray(src.assignments)
    ? src.assignments as { positions?: unknown; closures?: unknown }
    : {}

  return {
    ideas: ideas.sort((a, b) => a.label.localeCompare(b.label)),
    assignments: {
      positions: readMap(assignments.positions, normalizeSymbol),
      closures: readMap(assignments.closures, (k) => String(k ?? '').trim()),
    },
  }
}

function write(dir: string, book: IdeaBook): void {
  fs.mkdirSync(dir, { recursive: true })
  // Through a temp file: a crash mid-write would otherwise leave a truncated object and every
  // declaration gone, silently unlabelling the whole book.
  const tmp = `${filePath(dir)}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(book, null, 2) + '\n')
  fs.renameSync(tmp, filePath(dir))
}

/** Create an idea, or return the existing one of the same NAME. Idempotent on the name, not on the
 *  slug: renameIdea deliberately leaves the id alone, so an idea slugged 'sugar' may by now be
 *  labelled 'Aluminium'. Matching on the slug would hand that back to an operator who typed "Sugar"
 *  and file their trade under a bet they never named — so a name that is genuinely new takes its own
 *  id, suffixed where the slug is already spoken for. */
export function createIdea(dir: string, label: string): Idea {
  const clean = String(label ?? '').trim().slice(0, MAX_LABEL_LENGTH)
  if (!clean) throw new Error('an idea needs a name')
  let id = ideaId(clean)
  if (!id) throw new Error('an idea name needs at least one letter or number')
  const book = readIdeas(dir)
  const existing = book.ideas.find((i) => i.label.toLowerCase() === clean.toLowerCase())
  if (existing) return existing
  if (book.ideas.some((i) => i.id === id)) {
    let n = 2
    while (book.ideas.some((i) => i.id === `${id}-${n}`)) n++
    id = `${id}-${n}`
  }
  if (book.ideas.length >= MAX_IDEAS) throw new Error(`no room for more ideas (${MAX_IDEAS})`)
  const idea: Idea = { id, label: clean }
  book.ideas.push(idea)
  write(dir, book)
  return idea
}

export function renameIdea(dir: string, id: string, label: string): void {
  const clean = String(label ?? '').trim().slice(0, MAX_LABEL_LENGTH)
  if (!clean) throw new Error('an idea needs a name')
  const book = readIdeas(dir)
  const idea = book.ideas.find((i) => i.id === id)
  if (!idea) throw new Error(`no such idea: ${id}`)
  // The id is deliberately NOT re-slugged: assignments point at it, and renaming a label must not
  // silently unassign every trade that carried it.
  idea.label = clean
  write(dir, book)
}

/** Delete an idea. Its assignments go with it — readIdeas already drops dangling ones, but removing
 *  them here keeps the file honest rather than relying on the reader to hide the mess. */
export function deleteIdea(dir: string, id: string): void {
  const book = readIdeas(dir)
  book.ideas = book.ideas.filter((i) => i.id !== id)
  for (const map of [book.assignments.positions, book.assignments.closures]) {
    for (const [k, v] of Object.entries(map)) if (v === id) delete map[k]
  }
  write(dir, book)
}

/** Label the CURRENT open position in `symbol`. Pass null to clear. */
export function assignPosition(dir: string, symbol: string, id: string | null): void {
  const key = normalizeSymbol(symbol)
  if (!key) throw new Error('a holding symbol is required')
  const book = readIdeas(dir)
  if (id === null) delete book.assignments.positions[key]
  else {
    if (!book.ideas.some((i) => i.id === id)) throw new Error(`no such idea: ${id}`)
    if (!(key in book.assignments.positions)
      && Object.keys(book.assignments.positions).length >= MAX_ASSIGNMENTS) {
      throw new Error(`no room for more assignments (${MAX_ASSIGNMENTS})`)
    }
    book.assignments.positions[key] = id
  }
  write(dir, book)
}

/** Label one closed round trip, by the broker trade ids that make it up. Pass null to clear.
 *  A row is several closeTradeIDs when the broker split one sale across orders, so every id in the
 *  row is written — the row then reads back as assigned however it is later re-folded. */
export function assignClosures(dir: string, closeTradeIDs: string[], id: string | null): number {
  const ids = [...new Set((closeTradeIDs ?? []).map((v) => String(v ?? '').trim()).filter(Boolean))]
  if (ids.length === 0) throw new Error('a closed trade needs at least one broker trade id')
  const book = readIdeas(dir)
  if (id !== null && !book.ideas.some((i) => i.id === id)) throw new Error(`no such idea: ${id}`)
  for (const tradeId of ids) {
    if (id === null) { delete book.assignments.closures[tradeId]; continue }
    if (!(tradeId in book.assignments.closures)
      && Object.keys(book.assignments.closures).length >= MAX_ASSIGNMENTS) {
      throw new Error(`no room for more assignments (${MAX_ASSIGNMENTS})`)
    }
    book.assignments.closures[tradeId] = id
  }
  write(dir, book)
  return ids.length
}

/** The idea labelling an open position, or null. Never guesses. */
export function ideaForPosition(book: IdeaBook, symbol: string | null): string | null {
  const key = normalizeSymbol(symbol)
  return key ? (book.assignments.positions[key] ?? null) : null
}

/** The idea labelling a closed round trip. A row carrying TWO DIFFERENT declared ideas is 'mixed', not
 *  silently one of them — the disagreement is a real thing the operator did and hiding it would
 *  misreport the row.
 *
 *  A leg carrying NO label is not a disagreement. Statements arrive in pieces, so a round trip labelled
 *  when it held one broker id routinely grows a second on the next import; reading that as a split
 *  would drop an already-labelled trade out of its idea's realised total with nobody having touched it. */
export function ideaForClosure(book: IdeaBook, closeTradeIDs: (string | null)[]): string | null | 'mixed' {
  const found = new Set<string>()
  for (const raw of closeTradeIDs) {
    const v = book.assignments.closures[String(raw ?? '').trim()]
    if (v) found.add(v)
  }
  if (found.size > 1) return 'mixed'
  return found.size === 1 ? [...found][0]! : null
}

/** Dust, not a view — see RESIDUAL_VALUE_BASE. Null value is NOT residual: unknown is not small. */
export function isResidual(positionValue: number | null): boolean {
  return positionValue !== null && Math.abs(positionValue) < RESIDUAL_VALUE_BASE
}
