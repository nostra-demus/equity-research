#!/usr/bin/env node
// One mechanical authority for whether a saved specialist markdown output is safe to reuse.
// The cockpit imports this function when pricing/resuming orbs; MODULE_PIPELINE invokes this same file before
// skipping an agent. Keep it deterministic: prose quality is a synthesis judgment, never a hidden reason to
// widen an exact paid scope after the user has approved it.

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function validateAgentOutputText(raw) {
  const body = typeof raw === 'string' ? raw.replace(/\r\n?/g, '\n') : ''
  const reasons = []
  if (!body.trim()) reasons.push('missing-or-empty')
  if (body.includes('\0')) reasons.push('nul-byte')
  if (!/^#(?!#)(?:[ \t]|$)/.test(body.trimStart())) reasons.push('no-top-level-header')

  let fence = null
  for (const line of body.split('\n')) {
    if (!fence) {
      const open = /^ {0,3}(`{3,}|~{3,})[^`~]*$/.exec(line)
      if (open) fence = { char: open[1][0], width: open[1].length }
      continue
    }
    const close = new RegExp(`^ {0,3}\\${fence.char}{${fence.width},}[ \\t]*$`)
    if (close.test(line)) fence = null
  }
  if (fence) reasons.push('unclosed-code-fence')

  const tail = body.split('\n').slice(-20)
  if (tail.some((line) => /^Agent:\s*\S+\s*$/.test(line))) reasons.push('stray-confirmation-block')
  return { valid: reasons.length === 0, reasons }
}

export function validateAgentOutputFile(file) {
  try {
    const stat = fs.lstatSync(file)
    if (!stat.isFile() || stat.isSymbolicLink()) return { valid: false, reasons: ['not-regular-file'] }
    return validateAgentOutputText(fs.readFileSync(file, 'utf8'))
  } catch {
    return { valid: false, reasons: ['missing-or-unreadable'] }
  }
}

const RUN_ROOT_RE = /^[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/
const MODULE_RE = /^[a-z][a-z0-9-]*$/
const SPECIALIST_KEY_RE = /^(?!99_)\d{2}_[A-Za-z0-9][A-Za-z0-9_-]*$/
const SYNTHESIS_KEY_RE = /^99_[A-Za-z0-9][A-Za-z0-9_-]*-synthesis$/

function receipt(raw, pattern, label, allowEmpty = false) {
  if (typeof raw !== 'string') throw new Error(`missing or invalid exact ${label} receipt`)
  const keys = raw ? raw.split(',').filter(Boolean) : []
  if ((!allowEmpty && !keys.length) || keys.length > 256 || keys.some((key) => !pattern.test(key))
      || new Set(keys).size !== keys.length) {
    throw new Error(`missing or invalid exact ${label} receipt`)
  }
  return keys
}

function exactQuarantineScope(env) {
  if (env?.NOSTRA_EXACT_MODULE_RESUME !== '1') throw new Error('exact module resume is not enabled')
  const runRoot = env?.NOSTRA_EXACT_MODULE_RUN_ROOT
  const module = env?.NOSTRA_EXACT_MODULE_NAME
  const writable = env?.NOSTRA_EXACT_MODULE_WRITABLE_ORBS
  const syntheses = env?.NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS
  const match = typeof runRoot === 'string' ? /^analyses\/([A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2})$/.exec(runRoot) : null
  if (!match || !RUN_ROOT_RE.test(match[1])) throw new Error('missing or invalid exact module run root')
  if (typeof module !== 'string' || !MODULE_RE.test(module)) throw new Error('missing or invalid exact module name')
  return {
    runFolder: match[1],
    module,
    writable: new Set(receipt(writable, SPECIALIST_KEY_RE, 'writable-orb', true)),
    syntheses: new Set(receipt(syntheses, SYNTHESIS_KEY_RE, 'synthesis-orb')),
  }
}

function quarantineExactArtifacts(files, analysesRoot, env, kind) {
  const specialist = kind === 'specialist'
  if (!Array.isArray(files) || files.length < 1 || files.length > (specialist ? 2 : 1)
      || files.some((file) => typeof file !== 'string')) {
    throw new Error('expected one markdown path and at most one signal-sidecar path')
  }
  const scope = exactQuarantineScope(env)
  const rootAbs = path.resolve(analysesRoot)
  const rootStat = fs.lstatSync(rootAbs)
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error('analyses root is not a real directory')
  const rootReal = fs.realpathSync(rootAbs)

  const suppliedNames = files.map((file) => path.basename(file))
  const markdown = specialist
    ? /^(?!99_)(\d{2}_[A-Za-z0-9][A-Za-z0-9_-]*)\.md$/.exec(suppliedNames[0])
    : /^(99_[A-Za-z0-9][A-Za-z0-9_-]*-synthesis)\.md$/.exec(suppliedNames[0])
  const allowed = specialist ? scope.writable : scope.syntheses
  if (!markdown || !allowed.has(markdown[1])) {
    throw new Error(`markdown is not in the exact ${specialist ? 'writable' : 'synthesis'}-orb receipt`)
  }
  if (specialist && suppliedNames.length === 2 && suppliedNames[1] !== `${markdown[1]}.signals.json`) {
    throw new Error('signal sidecar does not match the exact markdown artifact')
  }

  for (const file of files) {
    const suppliedAbs = path.resolve(file)
    const suppliedModule = path.basename(path.dirname(suppliedAbs))
    const suppliedRunRoot = path.basename(path.dirname(path.dirname(suppliedAbs)))
    const parentReal = fs.realpathSync(path.dirname(suppliedAbs))
    const abs = path.join(parentReal, path.basename(suppliedAbs))
    const rel = path.relative(rootReal, abs)
    const parts = rel.split(path.sep)
    if (!rel || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel) || parts.length !== 3
        || suppliedRunRoot !== parts[0] || suppliedModule !== parts[1]
        || parts[0] !== scope.runFolder || parts[1] !== scope.module
        || (parts[2] !== `${markdown[1]}.md` && parts[2] !== `${markdown[1]}.signals.json`)) {
      throw new Error(`refusing unsafe exact-agent artifact path: ${file}`)
    }

    let targetStat
    try { targetStat = fs.lstatSync(abs) } catch (error) {
      if (error?.code === 'ENOENT') continue
      throw error
    }
    const runAbs = path.join(rootReal, parts[0])
    const moduleAbs = path.join(runAbs, parts[1])
    for (const dir of [runAbs, moduleAbs]) {
      const stat = fs.lstatSync(dir)
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`refusing symlinked exact-agent parent: ${dir}`)
    }
    const moduleReal = fs.realpathSync(moduleAbs)
    if (!moduleReal.startsWith(`${rootReal}${path.sep}`)) throw new Error('exact-agent artifact resolves outside analyses')
    if (!targetStat.isFile() && !targetStat.isSymbolicLink()) {
      throw new Error(`refusing to remove non-file exact-agent artifact: ${file}`)
    }
    fs.unlinkSync(abs)
    try {
      fs.lstatSync(abs)
      throw new Error(`exact-agent artifact still exists after quarantine: ${file}`)
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
}

/** Remove only explicitly named specialist artifacts after an exact-resume Task fails. */
export function quarantineExactAgentArtifacts(files, analysesRoot = path.resolve('analyses'), env = process.env) {
  quarantineExactArtifacts(files, analysesRoot, env, 'specialist')
}

/** Remove only the server-bound current synthesis after its exact Task errors or fails validation. */
export function quarantineExactSynthesisArtifact(file, analysesRoot = path.resolve('analyses'), env = process.env) {
  quarantineExactArtifacts([file], analysesRoot, env, 'synthesis')
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const [command, ...args] = process.argv.slice(2)
  if (command === '--quarantine-exact') {
    try {
      quarantineExactAgentArtifacts(args)
    } catch (error) {
      console.error(`could not quarantine exact agent output: ${error?.message || error}`)
      process.exitCode = 1
    }
  } else if (command === '--quarantine-exact-synthesis') {
    try {
      if (args.length !== 1) throw new Error('expected one synthesis markdown path')
      quarantineExactSynthesisArtifact(args[0])
    } catch (error) {
      console.error(`could not quarantine exact synthesis output: ${error?.message || error}`)
      process.exitCode = 1
    }
  } else if (!command || args.length !== 0) {
    console.error('usage: node scripts/agent-output-validity.mjs <output.md> | --quarantine-exact <output.md> [signal.json] | --quarantine-exact-synthesis <99-output.md>')
    process.exitCode = 2
  } else {
    const result = validateAgentOutputFile(command)
    if (!result.valid) {
      console.error(`invalid agent output: ${result.reasons.join(', ')}`)
      process.exitCode = 1
    }
  }
}
