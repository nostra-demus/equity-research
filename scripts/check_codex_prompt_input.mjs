import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_DOC_MAX_BYTES = 131_072
const REQUIRED_HEADROOM_BYTES = 32_768
const TAIL_SENTINEL = 'The twins must match.'
const PROBE_MARKER = 'NOSTRA_PROMPT_TAIL_PROBE'
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = fs.realpathSync(path.resolve(scriptDir, '..'))

const argv = process.argv.slice(2)
const valueAfter = (flag) => {
  const index = argv.indexOf(flag)
  return index >= 0 ? argv[index + 1] : undefined
}
const requestedCwd = fs.realpathSync(path.resolve(valueAfter('--cwd') || repoRoot))
assert.ok(
  requestedCwd === repoRoot || requestedCwd.startsWith(`${repoRoot}${path.sep}`),
  `launch cwd escapes repository: ${requestedCwd}`,
)

const relativeCwd = path.relative(repoRoot, requestedCwd)
const segments = relativeCwd ? relativeCwd.split(path.sep) : []
const directories = [repoRoot]
for (let index = 1; index <= segments.length; index += 1) {
  directories.push(path.join(repoRoot, ...segments.slice(0, index)))
}
const instructionFiles = directories.flatMap((directory) => {
  const sourcePath = ['AGENTS.override.md', 'AGENTS.md']
    .map((name) => path.join(directory, name))
    .find((candidate) => fs.existsSync(candidate))
  if (!sourcePath) return []
  const resolved = fs.realpathSync(sourcePath)
  assert.ok(resolved === repoRoot || resolved.startsWith(`${repoRoot}${path.sep}`), `${sourcePath} escapes repository`)
  return [resolved]
})
assert.ok(instructionFiles.length > 0, 'Codex discovered no project instruction documents')
const instructionBytes = instructionFiles.reduce((total, sourcePath) => total + fs.statSync(sourcePath).size, 0)
assert.ok(
  instructionBytes + REQUIRED_HEADROOM_BYTES <= PROJECT_DOC_MAX_BYTES,
  `${instructionBytes}-byte instruction chain + ${REQUIRED_HEADROOM_BYTES}-byte headroom exceeds ${PROJECT_DOC_MAX_BYTES}`,
)

const npxVersion = valueAfter('--npx-version')
const explicitBin = valueAfter('--codex-bin') || process.env.CODEX_BIN
assert.ok(npxVersion || explicitBin, 'pass --npx-version VERSION or --codex-bin PATH; this gate never skips')
const command = npxVersion ? 'npx' : explicitBin
const prefixArgs = npxVersion ? ['-y', `@openai/codex@${npxVersion}`] : []
const versionResult = spawnSync(command, [...prefixArgs, '--version'], {
  encoding: 'utf8', timeout: 120_000, maxBuffer: 512 * 1024,
})
assert.equal(
  versionResult.status,
  0,
  `codex --version failed: ${String(versionResult.error?.message || versionResult.stderr || versionResult.stdout).slice(0, 800)}`,
)
const versionOutput = `${versionResult.stdout || ''}\n${versionResult.stderr || ''}`.trim()
const cliVersion = versionOutput.split(/\r?\n/).map((line) => line.trim())
  .find((line) => /^codex-cli\s+\S+$/i.test(line)) || ''
assert.match(cliVersion, /^codex-cli\s+\S+/i, 'selected prompt-input binary did not prove its Codex CLI version')
if (npxVersion) assert.match(cliVersion, new RegExp(`^codex-cli\\s+${npxVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'))
const result = spawnSync(command, [
  ...prefixArgs,
  '--cd', requestedCwd,
  '--config', `project_doc_max_bytes=${PROJECT_DOC_MAX_BYTES}`,
  'debug', 'prompt-input', PROBE_MARKER,
], { encoding: 'utf8', timeout: 120_000, maxBuffer: 2 * 1024 * 1024 })
assert.equal(
  result.status,
  0,
  `codex debug prompt-input failed: ${String(result.error?.message || result.stderr || result.stdout).slice(0, 800)}`,
)
assert.doesNotMatch(
  String(result.stderr || ''),
  /truncat|instruction.{0,40}budget|project[_ -]?doc.{0,40}(?:limit|exceed|large)|document.{0,40}(?:too large|exceed)/i,
  'Codex reported a project-instruction budget/truncation warning',
)
let promptInput
assert.doesNotThrow(() => { promptInput = JSON.parse(String(result.stdout || '')) }, 'prompt-input output must be strict JSON')
const serialized = JSON.stringify(promptInput)
assert.match(serialized, new RegExp(TAIL_SENTINEL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'model input omitted doctrine tail sentinel')
assert.match(serialized, new RegExp(PROBE_MARKER), 'model input omitted probe prompt')
console.log(
  `Codex prompt-input gate passed: ${instructionFiles.length} document(s), ${instructionBytes} bytes, `
  + `${REQUIRED_HEADROOM_BYTES} bytes headroom, tail sentinel present, ${cliVersion}`,
)
