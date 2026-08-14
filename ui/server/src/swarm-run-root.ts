// One manifest-owned run-root resolver for every non-research swarm. It is deliberately independent of
// any family: SWARM.md owns the template and runs root; this module only proves that substituting one
// normalized subject cannot escape them or traverse a symlink. Callers may resolve a future folder for a
// full run, or require the exact existing folder for reads/reruns.
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'
import { normalizeDataSubject } from './data-subject'
import { RESEARCH_SWARM_ID, runRootForSubject, swarmById } from './swarms'

const inside = (candidate: string, root: string): boolean => {
  const rel = path.relative(root, candidate)
  return rel === '' || (!path.isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${path.sep}`))
}

export interface ManifestRunRoot {
  relative: string
  absolute: string
}

export function resolveManifestRunRoot(
  swarmId: string,
  subject: unknown,
  options: { mustExist?: boolean; requestedRunRoot?: string } = {},
): ManifestRunRoot | null {
  if (swarmId === RESEARCH_SWARM_ID) return null
  const swarm = swarmById(swarmId)
  const normalized = normalizeDataSubject(swarmId, subject)
  if (!normalized || !swarm) return null
  const relative = runRootForSubject(swarm, normalized)?.split(path.sep).join('/')
  if (!relative || path.isAbsolute(relative) || relative.includes('{')) return null
  if (options.requestedRunRoot !== undefined && options.requestedRunRoot !== relative) return null

  const repo = path.resolve(REPO_ROOT)
  const runsRoot = path.resolve(repo, swarm.runsRoot)
  const absolute = path.resolve(repo, relative)
  if (!inside(runsRoot, repo) || !inside(absolute, runsRoot) || absolute === runsRoot) return null

  // The declared root must already be a real, direct filesystem boundary. A missing destination is okay
  // only for a future full run; every component that already exists must be a directory and not a link.
  let realRepo: string
  let realRunsRoot: string
  try {
    if (fs.lstatSync(runsRoot).isSymbolicLink() || !fs.statSync(runsRoot).isDirectory()) return null
    realRepo = fs.realpathSync(repo)
    realRunsRoot = fs.realpathSync(runsRoot)
    if (!inside(realRunsRoot, realRepo)) return null
  } catch {
    return null
  }
  const parts = path.relative(runsRoot, absolute).split(path.sep).filter(Boolean)
  let cursor = runsRoot
  for (const part of parts) {
    cursor = path.join(cursor, part)
    try {
      const stat = fs.lstatSync(cursor)
      if (stat.isSymbolicLink() || !stat.isDirectory()) return null
    } catch (error: any) {
      if (error?.code !== 'ENOENT') return null
      break
    }
  }
  if (options.mustExist) {
    try {
      const real = fs.realpathSync(absolute)
      if (!fs.statSync(real).isDirectory() || !inside(real, realRunsRoot)) return null
    } catch {
      return null
    }
  }
  return { relative, absolute }
}
