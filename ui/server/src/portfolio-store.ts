// Where the fund book lives on disk, and how it is rebuilt.
//
// STATEMENTS ARE THE SOURCE OF TRUTH; THE BOOK IS DERIVED. Only the raw Flex exports are stored — the
// book is rebuilt from them on read. That costs a parse (a year of statement is ~2 MB) and buys the
// thing that matters: when the importer improves, every past number improves with it. Persisting the
// derived book instead would freeze today's arithmetic, bugs included, and there would be no way back
// to the source once the original download was gone.
//
// THIS DATA NEVER ENTERS GIT. It is real positions and real NAV, so it lives under STATE_DIR
// (`.state/`, covered by the repo's `**/.state/` ignore rule) rather than in the research-data lane
// that auto-commits to main. That is a storage choice only — uploading, reading and rebuilding all
// work exactly as they would anywhere else.

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from './config'
import { buildBook, type Book } from './portfolio'
import { parseFlexXml, type FlexDocument } from './portfolio-import'

export const PORTFOLIO_DIR = path.join(STATE_DIR, 'portfolio')
export const STATEMENTS_DIR = path.join(PORTFOLIO_DIR, 'statements')

/** One statement is a year of a real account; the cap is generous but bounded. */
export const STATEMENT_MAX_BYTES = 64 * 1024 * 1024

export interface StoredStatement {
  id: string
  filename: string
  bytes: number
  uploadedAt: string
  accountId: string | null
  fromDate: string | null
  toDate: string | null
  trades: number
}

function ensureDirs(): void {
  fs.mkdirSync(STATEMENTS_DIR, { recursive: true })
}

/** Content hash, so re-uploading a file the book already holds is a no-op rather than a duplicate.
 *  The importer dedups rows too, but stopping here keeps the store itself honest about what it has. */
function statementId(xml: string): string {
  return crypto.createHash('sha256').update(xml).digest('hex').slice(0, 16)
}

function metaPath(id: string): string { return path.join(STATEMENTS_DIR, `${id}.json`) }
function xmlPath(id: string): string { return path.join(STATEMENTS_DIR, `${id}.xml`) }

export function listStatements(): StoredStatement[] {
  ensureDirs()
  let names: string[] = []
  try { names = fs.readdirSync(STATEMENTS_DIR).filter((n) => n.endsWith('.json')) } catch { return [] }
  const out: StoredStatement[] = []
  for (const name of names) {
    try { out.push(JSON.parse(fs.readFileSync(path.join(STATEMENTS_DIR, name), 'utf8'))) } catch { /* skip unreadable */ }
  }
  return out.sort((a, b) => (a.toDate ?? '').localeCompare(b.toDate ?? ''))
}

export interface SaveResult {
  status: 'saved' | 'duplicate'
  statement: StoredStatement
}

/** Parse BEFORE writing. A file that is not a readable Flex export never reaches the store, so a failed
 *  upload can never leave a half-book behind that later reads as real. */
export function saveStatement(xml: string, filename: string): SaveResult {
  const doc = parseFlexXml(xml) // throws with a useful message on anything that is not a Flex export
  ensureDirs()
  const id = statementId(xml)
  const statement: StoredStatement = {
    id,
    filename,
    bytes: Buffer.byteLength(xml, 'utf8'),
    uploadedAt: new Date().toISOString(),
    accountId: doc.accountIds[0] ?? doc.accountId,
    fromDate: doc.fromDate,
    toDate: doc.toDate,
    trades: doc.trades.length,
  }
  if (fs.existsSync(xmlPath(id))) return { status: 'duplicate', statement }
  fs.writeFileSync(xmlPath(id), xml)
  fs.writeFileSync(metaPath(id), JSON.stringify(statement, null, 2) + '\n')
  invalidate()
  return { status: 'saved', statement }
}

export function deleteStatement(id: string): boolean {
  if (!/^[0-9a-f]{16}$/.test(id)) return false // ids are our own hashes — never a caller-supplied path
  let removed = false
  for (const p of [xmlPath(id), metaPath(id)]) {
    try { if (fs.existsSync(p)) { fs.rmSync(p, { force: true }); removed = true } } catch { /* best effort */ }
  }
  if (removed) invalidate()
  return removed
}

// Rebuilding parses every stored statement, so the result is cached against the exact set of files it
// was built from. Any upload or delete invalidates it.
let cache: { key: string; book: Book | null; error: string | null } | null = null
function invalidate(): void { cache = null }

function currentKey(statements: StoredStatement[]): string {
  return statements.map((s) => s.id).sort().join(',')
}

export interface PortfolioRead {
  statements: StoredStatement[]
  book: Book | null
  /** Present when the stored statements cannot currently produce a book — two accounts, say. The
   *  statements are still listed, so the operator can see what to remove. */
  error: string | null
}

export function readPortfolio(): PortfolioRead {
  const statements = listStatements()
  if (statements.length === 0) return { statements, book: null, error: null }
  const key = currentKey(statements)
  if (cache && cache.key === key) return { statements, book: cache.book, error: cache.error }

  const docs: FlexDocument[] = []
  for (const s of statements) {
    try { docs.push(parseFlexXml(fs.readFileSync(xmlPath(s.id), 'utf8'))) } catch { /* listed below as an error */ }
  }
  let book: Book | null = null
  let error: string | null = null
  try {
    book = docs.length ? buildBook(docs) : null
    if (!docs.length) error = 'the stored statements could not be read'
  } catch (e: any) {
    error = String(e?.message || e)
  }
  cache = { key, book, error }
  return { statements, book, error }
}
