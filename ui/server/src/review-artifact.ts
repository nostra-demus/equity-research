export const REVIEW_WINDOW_RE = /^(?:30d|90d|180d|365d|24m|36m|ad-hoc|post-mortem)$/
export const REVIEW_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export interface ExactReviewArtifactIdentity {
  runRoot: string
  ticker: string
  window: string
  decisionDate: string
  jsonBasename: string
  memoValid: (memoBasename: string) => boolean
}

export interface ValidExactReviewArtifact {
  raw: any
  memoBasename: string
}

function finiteOrNull(value: unknown): boolean {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

function validChangedSections(value: unknown): boolean {
  if (!Array.isArray(value)) return false
  return value.every((row: any) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)
        || typeof row.rerun_recommended !== 'boolean'
        || typeof row.materiality_score !== 'number' || !Number.isFinite(row.materiality_score)
        || row.materiality_score < 0 || row.materiality_score > 100) return false
    if (!row.rerun_recommended || row.materiality_score < 60) return true
    return typeof row.section === 'string' && !!row.section.trim()
      && typeof row.new_evidence === 'string' && !!row.new_evidence.trim()
      && typeof row.evidence_source === 'string' && !!row.evidence_source.trim()
      && /\b\d{4}-\d{2}-\d{2}\b/.test(row.evidence_source)
  })
}

export function reviewArtifactNamePattern(window: string): RegExp | null {
  if (!REVIEW_WINDOW_RE.test(window)) return null
  const escaped = window.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^(\\d{4}-\\d{2}-\\d{2})_${escaped}_decision_review(?:_v\\d+)?\\.json$`)
}

export function pairedReviewMemoBasename(jsonBasename: string): string {
  return jsonBasename.replace('_decision_review', '_memo_delta').replace(/\.json$/, '.md')
}

const MEMO_SECTIONS = [
  '## 1. One-line verdict',
  '## 2. What changed since the original memo',
  '## 3. Did the original thesis play out?',
  '## 4. Forecasts, catalysts, risks',
  '## 5. Section impact map',
  '## 6. Stage-One sheet comment',
  '## 7. Questions for management / analysts',
  '## 8. Watch before the next checkpoint',
]

interface ParsedMemoSection {
  number: number
  heading: string
  bodyWords: number
}

interface ParsedMemo {
  sections: ParsedMemoSection[]
  bodyWords: number
}

/**
 * Parse the common, durable memo shape once for both current and historical authority. The section
 * titles changed in older prompt versions, but a completed memo has always been a numbered document,
 * not merely an H1 and an outline. Requiring a small body in every section rejects a crash-truncated
 * skeleton without imposing today's prose or headings on immutable history.
 */
function parsedMemo(
  bytes: Buffer,
  identity: { ticker: string; reviewDate: string; window: string },
  maxWords: number,
  minSectionWords: number,
  minBodyWords: number,
): ParsedMemo | null {
  if (!Buffer.isBuffer(bytes) || bytes.length < 256 || bytes.length > 512 * 1024
      || !/^[A-Z0-9.\-]{1,15}$/.test(identity.ticker)
      || !REVIEW_DATE_RE.test(identity.reviewDate) || !REVIEW_WINDOW_RE.test(identity.window)) return null
  let text: string
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes) } catch { return null }
  const words = text.trim().split(/\s+/)
  if (text.includes('\0') || words.length > maxWords) return null
  const heading = `# ${identity.ticker} Memo Delta — ${identity.reviewDate} (${identity.window} review)`
  if (text.split(/\r?\n/, 1)[0].trim() !== heading) return null

  const lines = text.split(/\r?\n/)
  const sectionStarts: Array<{ number: number; heading: string; line: number }> = []
  for (let line = 1; line < lines.length; line++) {
    const trimmed = lines[line].trim()
    const match = /^##\s+(\d{1,2})\.\s+\S/.exec(trimmed)
    if (match) sectionStarts.push({ number: Number(match[1]), heading: trimmed, line })
  }
  if (sectionStarts.length < 8 || sectionStarts.length > 16 || sectionStarts[0].number !== 1) return null

  const sections: ParsedMemoSection[] = []
  let bodyWords = 0
  for (let index = 0; index < sectionStarts.length; index++) {
    const section = sectionStarts[index]
    if (section.number !== index + 1) return null
    const end = sectionStarts[index + 1]?.line ?? lines.length
    const body = lines.slice(section.line + 1, end)
      .filter((line) => !/^#{1,6}\s/.test(line.trim()))
      .join(' ').trim()
    const count = body ? body.split(/\s+/).length : 0
    if (count < minSectionWords) return null
    bodyWords += count
    sections.push({ number: section.number, heading: section.heading, bodyWords: count })
  }
  if (bodyWords < minBodyWords) return null
  return { sections, bodyWords }
}

/**
 * Compatibility-safe integrity witness for immutable saved/published history. Legacy memos legitimately
 * vary their section titles and some have nine sections, so shared authority must not demand today's exact
 * prompt headings. It still requires the exact call identity, substantive UTF-8 text, and a complete
 * ordered numbered-section skeleton; a one-byte/truncated write can never settle a review.
 */
export function validAuthoritativeReviewMemo(
  bytes: Buffer,
  identity: { ticker: string; reviewDate: string; window: string },
): boolean {
  // Historical templates sometimes used a terse "None." section. Preserve those immutable rows while
  // requiring meaningful content across the memo as a whole.
  return parsedMemo(bytes, identity, 10_000, 1, 24) !== null
}

/** Strong final-write witness used only for model-free pre-commit recovery. Historical review projection
 * remains schema-compatible, but a few memo bytes written before a crash can never authorize a commit. */
export function validCompleteReviewMemo(
  bytes: Buffer,
  identity: { ticker: string; reviewDate: string; window: string },
): boolean {
  // Newly generated work must meet the current, stronger completion contract before it can be committed.
  const memo = parsedMemo(bytes, identity, 2_500, 5, 60)
  return !!memo && memo.sections.length === MEMO_SECTIONS.length
    && memo.sections.every((section, index) => section.heading === MEMO_SECTIONS[index])
}

/** Canonical proof that an append-only review belongs to one exact call/window. Both Calls and the
 * automatic launch postcondition use this function, so a partial JSON can never hide a due checkpoint
 * in one projection while being rejected by the other. */
export function validateExactReviewArtifact(
  raw: unknown,
  identity: ExactReviewArtifactIdentity,
): ValidExactReviewArtifact | null {
  const value = raw as any
  const nameMatch = reviewArtifactNamePattern(identity.window)?.exec(identity.jsonBasename)
  if (!nameMatch || !value || typeof value !== 'object' || Array.isArray(value)
      || typeof value.schema_version !== 'string' || !value.schema_version.trim()
      || value.ticker !== identity.ticker
      || value.original_decision_date !== identity.decisionDate
      || !REVIEW_DATE_RE.test(value.review_date || '') || value.review_date !== nameMatch[1]
      || value.review_window !== identity.window
      || typeof value.original_decision !== 'string' || !value.original_decision.trim()
      || typeof value.basket !== 'string' || !value.basket.trim()
      || !Object.prototype.hasOwnProperty.call(value, 'entry_price') || !finiteOrNull(value.entry_price)
      || !Object.prototype.hasOwnProperty.call(value, 'review_price') || !finiteOrNull(value.review_price)
      || !Object.prototype.hasOwnProperty.call(value, 'absolute_return_pct') || !finiteOrNull(value.absolute_return_pct)
      || !Object.prototype.hasOwnProperty.call(value, 'benchmark_return_pct') || !finiteOrNull(value.benchmark_return_pct)
      || !Object.prototype.hasOwnProperty.call(value, 'sector_return_pct') || !finiteOrNull(value.sector_return_pct)
      || !Object.prototype.hasOwnProperty.call(value, 'benchmark_relative_return_pct') || !finiteOrNull(value.benchmark_relative_return_pct)
      || !Object.prototype.hasOwnProperty.call(value, 'sector_relative_return_pct') || !finiteOrNull(value.sector_relative_return_pct)
      || typeof value.thesis_status !== 'string' || !value.thesis_status.trim()
      || !Array.isArray(value.forecast_results)
      || !value.memo_delta || typeof value.memo_delta !== 'object' || Array.isArray(value.memo_delta)
      || typeof value.memo_delta.summary !== 'string' || !value.memo_delta.summary.trim()
      || typeof value.memo_delta.thesis_delta_verdict !== 'string' || !value.memo_delta.thesis_delta_verdict.trim()
      || !validChangedSections(value.memo_delta.changed_sections)) return null

  const memoBasename = pairedReviewMemoBasename(identity.jsonBasename)
  if (value.memo_delta.memo_delta_file !== `${identity.runRoot}/reviews/${memoBasename}`
      || !identity.memoValid(memoBasename)) return null
  return { raw: value, memoBasename }
}
