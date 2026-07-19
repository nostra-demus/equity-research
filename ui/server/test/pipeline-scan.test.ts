// pipeline-scan — the PURE stream classifier + verdict extraction (no spawn). Run:
// npx tsx test/pipeline-scan.test.ts. Proves each stream-json line maps to the right live signal
// ("scanning <host>"), that the final JSON verdict is extracted from the agent's trailing text (ignoring
// prose and ```json fences), and that a tool-call target names the source being checked.
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { scanActivityTarget, classifyScanLine, extractLastJsonObject, buildScanPrompt } = await import('../src/pipeline-scan')

// ---- scanActivityTarget: "what is being scanned right now" ----
check('WebFetch target = hostname', scanActivityTarget('WebFetch', { url: 'https://api.cftc.gov/x?y=1' }) === 'api.cftc.gov')
check('WebSearch target = query', scanActivityTarget('WebSearch', { query: 'LME aluminium COTR api' }) === 'LME aluminium COTR api')
check('Read target = basename', scanActivityTarget('Read', { file_path: '/tmp/a/b/sample.json' }) === 'sample.json')
check('unknown tool falls back to tool name', scanActivityTarget('Bash', {}) === 'Bash')

// ---- classifyScanLine ----
check('system/init → ready with model', (() => {
  const r = classifyScanLine({ type: 'system', subtype: 'init', model: 'claude-x' })
  return r.signals.length === 1 && r.signals[0].kind === 'ready' && (r.signals[0] as any).model === 'claude-x'
})())
check('assistant tool_use → activity signal + accumulates text', (() => {
  const r = classifyScanLine({ type: 'assistant', message: { content: [
    { type: 'tool_use', name: 'WebFetch', input: { url: 'https://example.com/data' } },
    { type: 'text', text: 'checking...' },
  ] } })
  return r.signals.length === 1 && r.signals[0].kind === 'activity' && (r.signals[0] as any).target === 'example.com' && r.text === 'checking...'
})())
check('stream_event thinking_delta → thinking', (() => {
  const r = classifyScanLine({ type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'thinking_delta', thinking: 'hmm' } } })
  return r.signals.length === 1 && r.signals[0].kind === 'thinking' && (r.signals[0] as any).text === 'hmm'
})())
check('result → cost, no error on success', (() => {
  const r = classifyScanLine({ type: 'result', total_cost_usd: 0.02 })
  return r.result?.costUsd === 0.02 && !r.result?.error
})())
check('result error surfaces a friendly message', (() => {
  const r = classifyScanLine({ type: 'result', is_error: true, api_error_status: 401, result: 'auth' })
  return !!r.result?.error && /signed in/i.test(r.result!.error!)
})())

// ---- extractLastJsonObject ----
check('extracts a trailing JSON verdict after prose', (() => {
  const o = extractLastJsonObject('I looked at the source.\n\n{"relevance":"exact","tier":5}')
  return o?.relevance === 'exact' && o?.tier === 5
})())
check('handles a ```json fenced block and picks the LAST object', (() => {
  const o = extractLastJsonObject('{"first":1}\nsome text\n```json\n{"relevance":"partial","confidence":60}\n```')
  return o?.relevance === 'partial' && o?.confidence === 60
})())
check('returns null when there is no JSON object', extractLastJsonObject('no json here at all') === null)
check('ignores a non-object trailing brace', extractLastJsonObject('array [1,2] end }') === null || typeof extractLastJsonObject('array [1,2] end }') === 'object')

// ---- buildScanPrompt: carries the source + needs + the untrusted-content warning ----
const prompt = buildScanPrompt({
  subject: 'GOLD', swarm: 'commodity',
  needs: [{ need_id: 'n1', series: 'X series', why_it_caps: 'caps', cap_lifted: undefined, filing_required: false, entry_modules: ['macro-positioning'], suggested_source: { name: 'S', acquisition: 'official_api' }, tier: 5, cadence: 'weekly' } as any],
  source: { source_url: 'https://api.example.com/gold', source_kind: 'api', sample: 'a,b,c', note: 'a note', need_id: 'n1', series_hint: 'gold price' },
})
check('prompt names the source URL', prompt.includes('https://api.example.com/gold'))
check('prompt includes the open need id', prompt.includes('n1'))
check('prompt warns fetched pages are UNTRUSTED', /UNTRUSTED/.test(prompt))
check('prompt demands a single JSON verdict', prompt.includes('"relevance"') && prompt.includes('"buildable"'))

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
