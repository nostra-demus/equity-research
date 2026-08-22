// The chained full-run master is implemented by the rerun command, so its publication contract spans
// prompt instructions, the launcher completion marker, and the deterministic admission freezer. Keep the
// three pieces locked together: removing any one recreates a "completed but never published" Ideas board.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '../../..')
const rerun = fs.readFileSync(path.join(repo, '.claude/commands/research/rerun.md'), 'utf8')
const launcher = fs.readFileSync(path.join(repo, 'ui/server/src/launcher.ts'), 'utf8')
const freezer = fs.readFileSync(path.join(repo, 'scripts/freeze_idea_admission.py'), 'utf8')

const chained = rerun.slice(rerun.indexOf('## 9B.'), rerun.indexOf('## 9C.'))
assert.match(chained, /Step 10B\.3A verbatim/, 'the chained master must rerun the final immutable audit set')
assert.match(chained, /Step 10B\.4 verbatim/, 'the chained master must execute final projection and admission')
assert.match(chained, /freeze_idea_admission\.py/, 'the chained master must invoke the semantic freezer')
assert.match(chained, /Never remove that completion marker by hand/, 'the prompt must leave marker authority to the freezer')
assert.ok(
  chained.indexOf('Step 10B.3A verbatim') < chained.indexOf('Step 10B.4 verbatim'),
  'final audits must precede the immutable projection/admission step',
)

assert.match(launcher, /const IDEA_PUBLICATION_MARKER = '\.requires_idea_publication'/)
assert.match(launcher, /finalDeliverablesPresent[\s\S]*!ideaPublicationPending\(runRoot\)/,
  'close-time completion must remain false while publication is pending')
assert.match(launcher, /writeMarker:[\s\S]*markIdeaPublicationRequired/,
  'the chained scheduler must create the publication marker before paid work')
assert.match(freezer, /atomic_write\(output, payload\)[\s\S]*clear_publication_marker\(run_abs\)/,
  'only a successfully frozen admission may release the completion marker')

console.log('idea-publication-chain-contract: PASS')
