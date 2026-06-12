// Extract a one-line "verdict" from a saved agent report. The saved files contain ONLY the report
// (no chat-confirmation block), so we parse the report body. Verdict carriers vary by agent:
//   - "## 3. Sufficiency Verdict\n\n- **Verdict:** Sufficient"
//   - "## 5. Moat Verdict\n\n**Narrow moat — and economically unproven so far.**"
//   - "### Verdict\n\n- **Verdict:** **Average business — worth deeper work...**"

function stripMd(s: string): string {
  return s
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^\s*[-*]\s+/, '')
    .replace(/^\s*>\s+/, '')
    .replace(/^\s*verdict\s*:?\s*/i, '')
    .trim()
}

function truncate(s: string, n = 240): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s
}

function cleanVerdictLine(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  if (/^-{3,}$/.test(t)) return null
  if (/^```/.test(t)) return null
  if (/^#{1,6}\s/.test(t)) return null // another heading -> stop
  if (/^\|/.test(t)) return null // table row
  if (/^[(*_]*\s*\(restated|^\(/i.test(t)) return null // parenthetical aside, not a verdict
  const cleaned = stripMd(t)
  if (!cleaned || cleaned.length < 2) return null
  return truncate(cleaned)
}

export function extractVerdict(markdown: string): string | null {
  const lines = markdown.split(/\r?\n/)

  // 1) an explicit "Verdict:"-labeled line is the most reliable carrier (triage, synthesis blocks)
  for (const ln of lines) {
    const m = ln.match(/^[\s>*-]*(?:\*\*)?\s*verdict\s*:\s*(?:\*\*)?\s*(.+?)\s*$/i)
    if (m && m[1]) {
      const v = stripMd(m[1])
      if (v && v.length > 1) return truncate(v)
    }
  }

  // 2) otherwise a "... Verdict" heading -> first meaningful line beneath it (e.g. moat's bare bold line)
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s+.*verdict/i.test(lines[i])) {
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const cleaned = cleanVerdictLine(lines[j])
        if (cleaned) return cleaned
      }
    }
  }
  return null
}

// Swarm routing contract (SWARM.md `routing:`): extract the labelled routing line a swarm
// synthesis writes in its `## Routing` block, e.g. `Routing: PROMOTE` -> "PROMOTE".
// Generic over the manifest's verdict_field — no swarm or value names are hardcoded here.
export function extractRouting(markdown: string, field: string): string | null {
  const esc = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`^[\\s>*-]*(?:\\*\\*)?\\s*${esc}\\s*:\\s*(?:\\*\\*)?\\s*(.+?)\\s*$`, 'i')
  for (const ln of markdown.split(/\r?\n/)) {
    const m = ln.match(re)
    if (m && m[1]) {
      // first token group before any separator commentary; tolerate "PROMOTE | PARK" menus by
      // rejecting lines that still contain a menu separator — a real routing is a single value.
      const v = stripMd(m[1])
      if (!v || /[|/]/.test(v)) continue
      return v.split(/\s{2,}|\s+—|\s+-\s/)[0].trim() || null
    }
  }
  return null
}

// Triage-specific: Sufficient / Partial / Insufficient (insufficient checked first to avoid substring hit).
export function extractTriageStatus(markdown: string): 'Sufficient' | 'Partial' | 'Insufficient' | null {
  const lines = markdown.split(/\r?\n/)
  for (const ln of lines) {
    if (/verdict/i.test(ln)) {
      if (/insufficient/i.test(ln)) return 'Insufficient'
      if (/\bpartial\b/i.test(ln)) return 'Partial'
      if (/\bsufficient\b/i.test(ln)) return 'Sufficient'
    }
  }
  // fall back to the engine's own fail-fast regex shape
  if (/verdict[*_:\s]*insufficient\s+data/i.test(markdown)) return 'Insufficient'
  return null
}
