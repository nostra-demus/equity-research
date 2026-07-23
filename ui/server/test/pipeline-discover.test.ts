// pipeline-discover — the PURE parse of the discovery agent's output into clean, buildable candidates. The
// agent's JSON is UNTRUSTED (it read the open web), so every field is re-derived and clamped server-side.
// No filesystem, no spawn. Run: npx tsx test/pipeline-discover.test.ts.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { parseDiscovered, usableSourceUrl, buildDiscoverPrompt } = await import('../src/pipeline-discover')

// ── usableSourceUrl: only an absolute http(s) URL with a host survives (a build pins that host) ──
check('accepts an https URL', usableSourceUrl('https://api.example.com/v1/data') === 'https://api.example.com/v1/data')
check('rejects a non-http scheme', usableSourceUrl('ftp://x.example.com/f') === null)
check('rejects a bare path (no host)', usableSourceUrl('/some/path') === null)
check('rejects a non-string', usableSourceUrl(42 as any) === null && usableSourceUrl(null) === null)
check('rejects empty / whitespace', usableSourceUrl('   ') === null)

// ── parseDiscovered: happy path ──
const good = JSON.stringify({
  feeds: [
    { source_url: 'https://api.good.com/series', series: 'A daily series', why: 'fills the gap', relevance: 'exact', confidence: 88, matched_need_ids: ['need-a'], entry_modules: ['mod-a'], acquisition: 'official_api', tier: 5, cadence: 'daily', buildable: true },
    { source_url: 'https://scrape.good.com/page', series: 'A weekly proxy', relevance: 'partial', confidence: 55, entry_modules: ['mod-b'], acquisition: 'scrape', tier: 9, cadence: 'weekly', buildable: true },
  ],
})
const feeds = parseDiscovered('here is what I found\n' + good)
check('parses both feeds', feeds.length === 2, `got ${feeds.length}`)
check('exact-relevance ranks before partial', feeds[0].verdict.relevance === 'exact' && feeds[1].verdict.relevance === 'partial')
check('the host is re-derived from the URL, not trusted from the model', feeds[0].verdict.host === 'api.good.com')
check('the verdict is sanitized (tier stays in band)', feeds[0].verdict.tier === 5 && feeds[1].verdict.tier === 9)
check('why is carried through', feeds[0].why === 'fills the gap')

// ── a candidate with no usable URL is dropped ──
const oneBad = JSON.stringify({ feeds: [
  { source_url: 'not a url', series: 'junk', buildable: true },
  { source_url: 'https://ok.example.com/x', series: 'kept', relevance: 'exact', confidence: 70, acquisition: 'official_api', tier: 5, cadence: 'daily', buildable: true },
] })
check('a feed without a fetchable URL is dropped, the good one kept', (() => { const f = parseDiscovered(oneBad); return f.length === 1 && f[0].verdict.host === 'ok.example.com' })())

// ── the same endpoint twice is one find ──
const dup = JSON.stringify({ feeds: [
  { source_url: 'https://dup.example.com/a', series: 'first', relevance: 'exact', confidence: 80, acquisition: 'official_api', tier: 5, cadence: 'daily', buildable: true },
  { source_url: 'https://dup.example.com/a', series: 'again', relevance: 'exact', confidence: 90, acquisition: 'official_api', tier: 5, cadence: 'daily', buildable: true },
] })
check('a duplicate endpoint is de-duplicated', parseDiscovered(dup).length === 1)

// ── robustness: no feeds / no JSON / garbage never throws ──
check('an object with no feeds array → []', parseDiscovered(JSON.stringify({ nope: true })).length === 0)
check('no JSON at all → []', parseDiscovered('the search found nothing worth wiring').length === 0)
check('empty string → []', parseDiscovered('').length === 0)
check('feeds not an array → []', parseDiscovered(JSON.stringify({ feeds: 'nope' })).length === 0)

// ── the prompt: security boundary + the inputs it must carry ──
const prompt = buildDiscoverPrompt({
  subject: 'ACME', swarm: 'research', want: 'inventory data',
  needs: [{ need_id: 'need-x', series: 'Widget inventories', why_it_caps: 'caps the read', entry_modules: ['mod-x'], tier: 5, cadence: 'weekly', suggested_source: { name: 'X', acquisition: 'official_api' } } as any],
  wired: [{ series: 'Existing feed', provider: 'Prov', subjects: ['ACME'] }],
})
check('prompt names the subject', prompt.includes('ACME'))
check('prompt marks fetched pages UNTRUSTED', /UNTRUSTED/.test(prompt))
check('prompt carries the open need', prompt.includes('need-x'))
check('prompt lists what is already wired (do-not-duplicate)', prompt.includes('Existing feed'))
check('prompt carries the user steer', prompt.includes('inventory data'))
check('prompt forbids tiers 1-4 (a feed is not a filing)', /NEVER 1-4/.test(prompt))

console.log(`\npipeline-discover.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
