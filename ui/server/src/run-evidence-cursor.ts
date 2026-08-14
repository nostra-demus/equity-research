import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'

export interface RunEvidenceCursor {
  version: 1
  ticker: string
  run_root: string
  started_at: string
}

const RUN_RE = /^analyses\/([A-Z0-9.\-]{1,15})_(\d{4})-(\d{2})-(\d{2})$/
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/

function valid(raw: any, ticker: string, runRoot: string, ceiling: number): raw is RunEvidenceCursor {
  return raw?.version === 1
    && raw.ticker === ticker
    && raw.run_root === runRoot
    && typeof raw.started_at === 'string'
    && ISO_RE.test(raw.started_at)
    && Number.isFinite(Date.parse(raw.started_at))
    && Date.parse(raw.started_at) <= ceiling
}

/**
 * Save the source-pool floor before a full run can dispatch. Existing same-day partial runs use local
 * midnight as a conservative floor: this may re-read evidence, but can never hide evidence.
 */
export function ensureRunEvidenceCursor(input: {
  ticker: string
  runRoot: string
  now?: number
  repoRoot?: string
}): RunEvidenceCursor {
  const now = input.now ?? Date.now()
  const repoRoot = input.repoRoot ?? REPO_ROOT
  const match = RUN_RE.exec(input.runRoot)
  if (!match || match[1] !== input.ticker) throw new Error('run evidence cursor has an unsafe run root')
  fs.mkdirSync(repoRoot, { recursive: true })
  const realRepo = fs.realpathSync(repoRoot)
  const absRoot = path.resolve(realRepo, input.runRoot)
  const analyses = path.resolve(realRepo, 'analyses')
  if (path.dirname(absRoot) !== analyses) throw new Error('run evidence cursor must stay inside analyses')
  fs.mkdirSync(analyses, { recursive: true })
  const realAnalyses = fs.realpathSync(analyses)
  if (fs.lstatSync(analyses).isSymbolicLink()) {
    throw new Error('analyses authority is not a real local directory')
  }
  if (fs.existsSync(absRoot)) {
    if (fs.lstatSync(absRoot).isSymbolicLink() || !fs.lstatSync(absRoot).isDirectory()
        || path.dirname(fs.realpathSync(absRoot)) !== realAnalyses) {
      throw new Error('run evidence cursor cannot follow a linked run root')
    }
  } else {
    fs.mkdirSync(absRoot)
  }
  const intakeDir = path.join(absRoot, 'intake')
  const file = path.join(intakeDir, 'run_evidence_cursor.json')

  if (fs.existsSync(intakeDir) && (fs.lstatSync(intakeDir).isSymbolicLink()
      || !fs.lstatSync(intakeDir).isDirectory() || path.dirname(fs.realpathSync(intakeDir)) !== fs.realpathSync(absRoot))) {
    throw new Error('run evidence cursor cannot follow a linked intake directory')
  }

  if (fs.existsSync(file)) {
    if (fs.lstatSync(file).isSymbolicLink() || !fs.lstatSync(file).isFile()) {
      throw new Error('saved run evidence cursor is not a real file')
    }
    let raw: unknown
    try { raw = JSON.parse(fs.readFileSync(file, 'utf8')) }
    catch { throw new Error('saved run evidence cursor cannot be read safely') }
    if (!valid(raw, input.ticker, input.runRoot, now)) throw new Error('saved run evidence cursor is damaged')
    return raw
  }

  let startedAt = now
  try {
    const existing = fs.readdirSync(absRoot).some((name) => name !== 'intake')
    if (existing) {
      const year = Number(match[2]); const month = Number(match[3]); const day = Number(match[4])
      const localMidnight = new Date(year, month - 1, day).getTime()
      if (Number.isFinite(localMidnight) && localMidnight <= now) startedAt = localMidnight
    }
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }

  const cursor: RunEvidenceCursor = {
    version: 1,
    ticker: input.ticker,
    run_root: input.runRoot,
    started_at: new Date(startedAt).toISOString(),
  }
  fs.mkdirSync(intakeDir, { recursive: true })
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`
  let fd: number | null = null
  try {
    fd = fs.openSync(temp, 'wx', 0o600)
    fs.writeFileSync(fd, JSON.stringify(cursor, null, 2) + '\n', 'utf8')
    fs.fsyncSync(fd)
  } finally {
    if (fd !== null) fs.closeSync(fd)
  }
  try { fs.renameSync(temp, file) }
  catch (error) { try { fs.rmSync(temp, { force: true }) } catch {}; throw error }
  try {
    const dir = fs.openSync(intakeDir, 'r')
    try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
  } catch { /* directory fsync is not portable */ }
  return cursor
}
