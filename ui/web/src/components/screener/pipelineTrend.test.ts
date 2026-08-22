import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error?.message || error}`); process.exitCode = 1 }
}

const here = path.dirname(fileURLToPath(import.meta.url))
const panel = fs.readFileSync(path.join(here, 'PipelineDiagnostics.tsx'), 'utf8')
const trend = fs.readFileSync(path.join(here, 'PipelineTrend.tsx'), 'utf8')
const css = fs.readFileSync(path.join(here, 'PipelineDiagnostics.css'), 'utf8')
const api = fs.readFileSync(path.resolve(here, '../../lib/api.ts'), 'utf8')

check('Trend and Live share the existing drawer and toggle the expanded shell', () => {
  assert.match(panel, /trendMode \? 'Live' : 'Trend'/)
  assert.match(panel, /diag\$\{trendMode \? ' is-trend'/)
  assert.match(panel, /would rank #/)
  assert.match(css, /\.diag\.is-trend \{ width: min\(1080px, 98%\)/)
})

check('range presets, UTC/custom range, and the 90-day client cap are present', () => {
  for (const label of ["label: '1h'", "label: '24h'", "label: '7d'", "label: '30d'"]) assert.match(trend, new RegExp(label))
  assert.match(trend, /type="datetime-local"/)
  assert.match(trend, /90 \* 86_400_000/)
  assert.match(trend, /toISOString\(\).*UTC/)
})

check('timeline is native SVG with shared crosshair, gaps, provider lanes, routing changes, and no chart dependency', () => {
  assert.match(trend, /<svg/)
  assert.match(trend, /pattern id="audit-gap"/)
  assert.match(trend, /diagtrend__crosshair/)
  assert.match(trend, /chart\.providerIds\.map/)
  assert.match(trend, /bucket\.routerTransition/)
  assert.match(trend, /point\.routingChanges/)
  assert.doesNotMatch(trend, /recharts|chart\.js|d3-/i)
})

check('keyboard navigation and the exact decision/outcome audit tooltip are exposed', () => {
  assert.match(trend, /tabIndex=\{0\}/)
  assert.match(trend, /ArrowLeft/)
  assert.match(trend, /ArrowRight/)
  assert.match(trend, /Decision \{audit\.decision\.decisionId\}/)
  assert.match(trend, /Outcome missing — explicit audit gap/)
  assert.match(trend, /Allowance/)
  assert.match(trend, /newsDiagnosticsTrendEvents\(selectedBucket\.start, selectedBucket\.end/)
})

check('SVG and accessible summary table expose the same provider range data', () => {
  assert.match(trend, /trend\.providers\.map/)
  assert.match(trend, /<table className="diagtrend__table">/)
  assert.match(trend, /Contribution/)
  assert.match(trend, /Usable-batch yield/)
  assert.match(trend, /Released-capacity use/)
})

check('the static showcase fails closed to empty legacy history instead of fabricated zero activity', () => {
  assert.match(api, /newsDiagnosticsTrend:/)
  assert.match(api, /coverage: \{ complete: false/)
  assert.match(api, /buckets: \[\], providers: \[\]/)
})

check('an unreadable saved backlog is shown as unknown, never as a proven zero', () => {
  assert.match(panel, /diag\.backlog\.unavailable \? '—'/)
  assert.match(panel, /the saved waiting list could not be read/)
})

check('pool-cap misses do not hide candidates that still have a paced slot later today', () => {
  assert.match(panel, /diag\.rescue\.queuedForLater > 0/)
  assert.doesNotMatch(panel, /queuedForLater > 0 && diag\.rescue\.capacityMisses/)
})

check('reduced motion and narrow-screen layouts remain supported', () => {
  assert.match(css, /prefers-reduced-motion: reduce/)
  assert.match(css, /\.diag \{ transition: none; \}/)
  assert.match(css, /@media \(max-width: 760px\)/)
})

console.log(`pipeline trend tests: ${passed} passed`)
