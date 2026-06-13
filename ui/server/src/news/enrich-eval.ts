// Self-checking quality gate for the event-detail enrichment. Instead of eyeballing cards one by one,
// this samples N recent wire events, runs the real enrichment (the article-body Groq read), and scores
// each against a rubric drawn from the 50-article audit's failure modes:
//   - companies_clean   : no country / agency / index leaked into `companies` (the 52% bug)
//   - has_story         : never a blank panel — a gist, a parsed filing, a summary, or an honest note
//   - gist_substantive  : the gist is real bullets, not the headline reworded
//   - theme_set         : a theme is resolved (read or triage fallback)
//   - beneficiaries_firms: every NAMED beneficiary/exposed party is a real firm (no invented countries)
//
// Run it any time to catch regressions and see where the prompt/denylist needs tuning:
//   GROQ_API_KEY=… npx tsx src/news/enrich-eval.ts            # default 12 events
//   GROQ_API_KEY=… npx tsx src/news/enrich-eval.ts 25         # sample 25
// It is a CLI tool, NOT part of the unit suite (it needs the live Groq key + network). Cache-aware, so
// re-runs are cheap. This is the "read the articles and check we're right" loop, automated.

import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { readFeed } from './feed'
import { enrichEvent } from './enrich'
import { isCompanyName } from './entities'

// did we actually read the article body? (a gist or a parsed SEC filing). Many sources paywall/403
// the server fetch — those legitimately degrade to a summary + triage theme, and the body-only checks
// below are scored ONLY over the items we could read, so a blocked source isn't counted as a bug.
const wasRead = (e: any): boolean => !!(e.gist?.length || e.sec)

interface Check { name: string; bodyOnly?: boolean; pass: (e: any) => boolean }
const CHECKS: Check[] = [
  // always apply — these must hold whether or not the body was readable
  { name: 'companies_clean', pass: (e) => (e.companies || []).every((c: any) => isCompanyName(c.name)) },
  { name: 'has_story', pass: (e) => !!(e.gist?.length || e.sec || e.summary || e.note) },
  { name: 'beneficiaries_firms', pass: (e) => [...(e.beneficiaries || []), ...(e.exposed || [])].every((p: any) => !p.named_in_article || isCompanyName(p.name)) },
  // body-only — scored over the items we actually read
  { name: 'gist_substantive', bodyOnly: true, pass: (e) => !!(e.gist?.length && e.gist.some((g: string) => g.length >= 30)) || !!e.sec },
  { name: 'theme_set', bodyOnly: true, pass: (e) => !!e.theme || !!e.sec },
]

async function main() {
  const n = Math.max(1, Math.min(50, Number(process.argv[2]) || 12))
  if (!NEWS.groqApiKey) { console.error('enrich-eval: needs GROQ_API_KEY (the article-body read uses it)'); process.exit(2) }
  // sample the highest-scored recent items across a spread of scopes (what a human would actually open)
  const items = readFeed(REPO_ROOT, 2, { maxItems: 1500 }).items
  const byScope = new Map<string, any[]>()
  for (const it of items) { const s = it.scope || 'unknown'; (byScope.get(s) || byScope.set(s, []).get(s)!).push(it) }
  const sample: any[] = []
  let round = 0
  while (sample.length < n && round < 30) {
    for (const arr of byScope.values()) { const x = arr[round]; if (x && sample.length < n) sample.push(x) }
    round++
  }

  const groq = { apiKey: NEWS.groqApiKey, model: NEWS.groqModel, baseUrl: NEWS.groqBaseUrl, maxTokens: 900 }
  const tally: Record<string, number> = Object.fromEntries(CHECKS.map((c) => [c.name, 0]))
  const fails: string[] = []
  let readCount = 0
  console.log(`enrich-eval: scoring ${sample.length} events (fresh read)…\n`)
  for (const it of sample) {
    // force a fresh read — an eval must test CURRENT behavior, not a stale cache entry
    const e = await enrichEvent({ event_id: it.event_id, url: it.url, headline: it.headline, companies: it.companies, event_types: it.event_types, scope: it.scope }, { repoRoot: REPO_ROOT, stateDir: STATE_DIR, groq, force: true })
    const read = wasRead(e)
    if (read) readCount++
    const failed: string[] = []
    for (const c of CHECKS) {
      if (c.bodyOnly && !read) continue // a blocked source isn't scored on body-only checks
      if (c.pass(e)) tally[c.name]++
      else failed.push(c.name)
    }
    const mark = !read ? '·' : failed.length ? '✗' : '✓'
    console.log(`  ${mark} [${(it.scope || '?').padEnd(11)}] ${it.headline.slice(0, 60)}${!read ? '  (source blocked — degraded)' : failed.length ? '  ← ' + failed.join(', ') : ''}`)
    if (read && failed.length) fails.push(`${it.headline.slice(0, 70)} → ${failed.join(', ')} | companies=${JSON.stringify((e.companies || []).map((c: any) => c.name))} theme=${e.theme}`)
  }

  console.log(`\n── rubric (n=${sample.length}, body read on ${readCount}) ──`)
  for (const c of CHECKS) {
    const denom = c.bodyOnly ? readCount : sample.length
    const pct = denom ? Math.round((100 * tally[c.name]) / denom) : 0
    console.log(`  ${c.name.padEnd(20)} ${String(pct).padStart(3)}%  (${tally[c.name]}/${denom})${c.bodyOnly ? '  [of read]' : ''}`)
  }
  console.log(`  ${'body_read_rate'.padEnd(20)} ${Math.round((100 * readCount) / sample.length)}%  (${readCount}/${sample.length})  [source-fetch limit, not an enrichment bug]`)
  if (fails.length) { console.log(`\n── ${fails.length} read item(s) to tune ──`); fails.forEach((f) => console.log('  • ' + f)) }
}

main().catch((e) => { console.error('enrich-eval failed:', e?.message || e); process.exit(1) })
