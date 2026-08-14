import path from 'node:path'
import { isValidTicker, SIG_RE } from './sandbox'
import { RESEARCH_SWARM_ID, swarmById } from './swarms'

// A swarm manifest owns its unit of work. Non-research subjects therefore need a generic, path-safe
// identifier rather than the research swarm's 15-character exchange-symbol rule. Keep the grammar in
// one place so manifest enumeration and every interactive Data Library route admit exactly the same IDs.
export const MANIFEST_SUBJECT_PATTERN = '[A-Z0-9][A-Z0-9._-]{0,63}'
export const MANIFEST_SUBJECT_RE = new RegExp(`^${MANIFEST_SUBJECT_PATTERN}$`)

/** Return the exact canonical subject, or null. Never trims/folds case: manifest/run identity is exact. */
export function normalizeDataSubject(swarmId: string, subject: unknown): string | null {
  if (!swarmById(swarmId) || typeof subject !== 'string') return null
  const valid = swarmId === RESEARCH_SWARM_ID
    ? isValidTicker(subject)
    : swarmId === 'screener' ? SIG_RE.test(subject) : MANIFEST_SUBJECT_RE.test(subject)
  if (!valid || path.basename(subject) !== subject || subject === '.' || subject === '..') return null
  return subject
}
