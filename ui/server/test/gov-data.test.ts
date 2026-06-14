// Gov-data layer (Layer 3, US regulatory JSON): the keyless openFDA adapter (drug/device recalls +
// 510k clearances). Tests the date normalizer, row→RawArticle mapping for each endpoint, the
// firewall-passing fda.gov URLs, the lookback filter, and per-endpoint failure isolation. Mocked, no
// network. Run: npx tsx test/gov-data.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { fetchGovData, fdaDate } from '../src/news/sources/gov-data'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) } catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}
const noSleep = async () => {}
const now = () => new Date('2026-06-14T12:00:00Z')

function res(status: number, body: any) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) }
}
const DRUG = { results: [
  { report_date: '20260603', recalling_firm: 'AbbVie Inc.', product_description: 'PRED MILD ophthalmic', reason_for_recall: 'Impurities', classification: 'Class III', recall_number: 'D-0550-2026' },
  { report_date: '20260101', recalling_firm: 'Stale Co', product_description: 'Old drug', reason_for_recall: 'x', classification: 'Class II', recall_number: 'D-0001-2026' }, // older than lookback → dropped
  { report_date: '20260603', recalling_firm: '', product_description: '', reason_for_recall: '', classification: '', recall_number: '' }, // empty → dropped
] }
const DEVICE_510K = { results: [
  { decision_date: '2026-05-30', applicant: 'In2Bones USA, LLC', device_name: 'CoLink Screws', k_number: 'K261154' },
] }

function mkFetch(opts: { drugStatus?: number } = {}) {
  return (async (url: string) => {
    if (url.includes('/drug/enforcement')) return res(opts.drugStatus ?? 200, DRUG)
    if (url.includes('/device/enforcement')) return res(200, { results: [] })
    if (url.includes('/device/510k')) return res(200, DEVICE_510K)
    return res(404, {})
  }) as unknown as typeof fetch
}

await check('fdaDate: YYYYMMDD and YYYY-MM-DD → ISO; junk → null', () => {
  assert.equal(fdaDate('20260603'), '2026-06-03T00:00:00Z')
  assert.equal(fdaDate('2026-05-30'), '2026-05-30T00:00:00Z')
  assert.equal(fdaDate('garbage'), null)
  assert.equal(fdaDate(''), null)
})

await check('fetchGovData: drug recall → RawArticle (via:gov, api.fda.gov), lookback + empty-row drops', async () => {
  const out = await fetchGovData({ lookbackDays: 21, timeoutMs: 5000 }, { fetchFn: mkFetch(), sleep: noSleep, now })
  const drug = out.filter((a) => a.url.includes('/drug/enforcement'))
  assert.equal(drug.length, 1, 'only the fresh, complete drug recall survives')
  assert.match(drug[0].title, /FDA drug recall \(Class III\) — AbbVie Inc\.: PRED MILD/)
  assert.equal(new URL(drug[0].url).hostname, 'api.fda.gov') // firewall passes on fda.gov suffix
  assert.ok(drug[0].url.includes('D-0550-2026'), 'unique per recall_number → no dedup collapse')
  assert.equal(drug[0].via, 'gov')
})

await check('fetchGovData: 510(k) clearance → human accessdata.fda.gov URL', async () => {
  const out = await fetchGovData({ lookbackDays: 60, timeoutMs: 5000 }, { fetchFn: mkFetch(), sleep: noSleep, now })
  const k = out.filter((a) => a.url.includes('cfpmn'))
  assert.equal(k.length, 1)
  assert.match(k[0].title, /FDA 510\(k\) clearance — In2Bones USA, LLC: CoLink Screws/)
  assert.equal(new URL(k[0].url).hostname, 'www.accessdata.fda.gov')
  assert.ok(k[0].url.includes('K261154'))
})

await check('fetchGovData: a failing endpoint never blocks the others (isolation, never throws)', async () => {
  const out = await fetchGovData({ lookbackDays: 60, timeoutMs: 5000 }, { fetchFn: mkFetch({ drugStatus: 500 }), sleep: noSleep, now })
  assert.equal(out.filter((a) => a.url.includes('/drug/enforcement')).length, 0, 'drug 500 → no drug items')
  assert.equal(out.filter((a) => a.url.includes('cfpmn')).length, 1, '510k still delivers')
})

console.log(`\n${passed} checks passed`)
