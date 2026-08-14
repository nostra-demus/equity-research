export interface ReportIntegrityView {
  body: string
  warning: null | {
    details: string
  }
}

const FINISH_GATE_HEADER = /^>\s*(?:⚠️\s*)?(?:\[WARNING\]\s*)?\*\*PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED\.\*\*\s*$/

/**
 * Move the machine-written finish-gate block out of the report body for display.
 * The raw Markdown remains untouched for downloads and audit checks.
 */
export function reportIntegrityView(markdown: string): ReportIntegrityView {
  const lines = markdown.split(/\r?\n/)
  if (!FINISH_GATE_HEADER.test(lines[0] ?? '')) return { body: markdown, warning: null }

  let end = 1
  while (end < lines.length && /^>/.test(lines[end])) end += 1

  const quoted = lines.slice(1, end).map((line) => line.replace(/^> ?/, ''))
  const details = quoted.join('\n').trim()
  const hasResolution = /(?:Resolve the flagged items|Resolve the remaining verification findings)/.test(details)
  const cleanBoundary = end === lines.length || lines[end].trim() === ''
  if (!details || !hasResolution || !cleanBoundary) return { body: markdown, warning: null }

  const bodyStart = end < lines.length && lines[end].trim() === '' ? end + 1 : end
  return {
    body: lines.slice(bodyStart).join('\n'),
    warning: { details },
  }
}
