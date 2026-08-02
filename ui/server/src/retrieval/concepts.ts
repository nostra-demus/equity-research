// A small, shared loader for conservative term equivalence. The vocabulary lives under frameworks/ so
// every search consumer gets the same concepts and a new concept needs no engine-code wiring.

import fs from 'node:fs'
import path from 'node:path'
import type { ConceptGroup } from './hybrid'

let cached: { file: string; mtimeMs: number; groups: ConceptGroup[] } | null = null

export function loadRetrievalConcepts(repoRoot: string): ConceptGroup[] {
  const file = path.join(repoRoot, 'frameworks', 'retrieval', 'concepts.json')
  try {
    const stat = fs.statSync(file)
    if (cached?.file === file && cached.mtimeMs === stat.mtimeMs) return cached.groups
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    const groups: ConceptGroup[] = []
    const seen = new Set<string>()
    for (const row of Array.isArray(raw?.groups) ? raw.groups : []) {
      const id = String(row?.id || '').trim()
      const terms = [...new Set<string>((Array.isArray(row?.terms) ? row.terms : []).map((x: unknown) => String(x || '').trim()).filter((x: string) => x.length >= 2 && x.length <= 80))]
      if (!/^[a-z0-9][a-z0-9_-]{1,60}$/.test(id) || terms.length < 2 || seen.has(id)) continue
      seen.add(id)
      groups.push({ id, terms })
    }
    cached = { file, mtimeMs: stat.mtimeMs, groups }
    return groups
  } catch {
    return []
  }
}

export function invalidateRetrievalConcepts(): void { cached = null }
