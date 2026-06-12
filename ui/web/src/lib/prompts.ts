// Prompt-surface helpers — resolve the repo-relative path to the "prompt" (the exact instructions a
// thing runs on) for each orb, each module, and the engine itself, and map those paths into the static
// snapshot bundle. Everything derives from the node KEY (`<module>/<nn>_<slug>`), so a new module or
// sub-agent is covered automatically with no per-module wiring (CLAUDE.md §26).

export const CONSTITUTION_PATH = 'CLAUDE.md'

// Repo-relative path to an orb's prompt (its agent-definition markdown).
// The master synthesizer (the Memo / core orb) lives at the agents root; every other orb's key already
// IS its file stem under .claude/agents/ — prefixed by the swarm folder for non-research swarms
// (their modules nest one level deeper, e.g. .claude/agents/screener/signal-gate/...).
export function promptPathForNodeKey(nodeKey?: string, swarmId?: string): string | null {
  if (!nodeKey) return null
  if (nodeKey === 'master/synthesizer') return '.claude/agents/synthesizer.md'
  const prefix = swarmId && swarmId !== 'research' ? `${swarmId}/` : ''
  return `.claude/agents/${prefix}${nodeKey}.md`
}

// The module an orb belongs to (null for the master synthesizer, which has no owning module).
export function moduleOfNodeKey(nodeKey?: string): string | null {
  if (!nodeKey || nodeKey === 'master/synthesizer') return null
  const m = nodeKey.split('/')[0]
  return m || null
}

// Repo-relative path to a module's shared doctrine (its MODULE_RULES.md).
export function moduleRulesPath(module: string, swarmId?: string): string {
  const prefix = swarmId && swarmId !== 'research' ? `${swarmId}/` : ''
  return `.claude/agents/${prefix}${module}/MODULE_RULES.md`
}

// Map a repo-relative prompt path to its location inside the static snapshot bundle
// (public/data/prompts/...). The static deploy can't host a leading-dot folder, so .claude/ is flattened
// to claude/ here AND in build-snapshot.mjs — keep the two in lockstep.
export function staticPromptPath(repoRel: string): string {
  return 'prompts/' + repoRel.replace(/^\.claude\//, 'claude/')
}

// A short, human filename for a downloaded prompt: keep the module so two `MODULE_RULES.md` downloads
// don't collide. e.g. ".claude/agents/catalyst/01_catalyst-calendar.md" -> "catalyst_01_catalyst-calendar.md".
export function promptFileName(repoRel: string): string {
  const parts = repoRel.split('/').filter((p) => p && p !== '.claude' && p !== 'agents')
  return parts.join('_') || 'prompt.md'
}

export interface PromptDoc {
  meta: [string, string][]
  body: string
}

// Split YAML-ish frontmatter (key: value lines) from a prompt for clean on-screen display.
// Files without frontmatter (MODULE_RULES.md, CLAUDE.md) return an empty meta and the whole body.
export function splitFrontmatter(md: string): PromptDoc {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!m) return { meta: [], body: md }
  const meta: [string, string][] = []
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (kv && kv[2].trim()) meta.push([kv[1], kv[2].trim()])
  }
  return { meta, body: m[2] }
}
