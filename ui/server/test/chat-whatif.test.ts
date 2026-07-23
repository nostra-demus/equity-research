// Deterministic what-if modeling for the Ask chat: the pure detection/matching/parsing layer + the real
// engine reconciliation. This is the anti-hallucination core — it pins that (a) a what-if is detected only
// when genuinely asked, (b) the question maps to the RIGHT recorded variable and the right signed delta,
// and (c) the number the chat surfaces is exactly what scripts/sensitivity_math.py computes. If any of
// these drift, the chat could surface a wrong or fabricated figure — so they are locked here.
// Run: npx tsx test/chat-whatif.test.ts
import assert from 'node:assert/strict'
import {
  detectWhatIf, variableKeywords, matchVariable, parseDelta, parseWhatIf,
  computeScenario, computedContextBlock, type SensitivitySidecar,
} from '../src/chat-whatif'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// A fixture mirroring NHY's real recorded coefficients — inline, so the test never depends on committed data.
const NHY: SensitivitySidecar = {
  base_metric: 'adjusted_ebitda_nok_m', base_value: 28889, base_period: 'FY2025', revenue_base: 207971,
  sensitivities: [
    { variable: 'lme_aluminium_price', label: 'LME aluminium price', unit: 'USD/mt', base_value: 3192, coefficient: 15.0, confidence: 'high', basis: 'company-disclosed', valid_range: { low: -400, high: 300 }, non_linearity: '1.5-2mo pricing lag', source: 'FY2025 Annual Report, p.38' },
    { variable: 'usd_nok', label: 'USD/NOK exchange rate', unit: 'NOK', base_value: 9.72, coefficient: 4900.0, confidence: 'high', basis: 'company-disclosed', valid_range: { low: -1, high: 1 } },
    { variable: 'alumina_price', label: 'Alumina price (Platts PAX)', unit: 'USD/mt', base_value: 345, coefficient: 72.0, confidence: 'low', basis: 'inferred', valid_range: { low: -50, high: 65 } },
  ],
}

await (async () => {
  // ---- 1. detection: strict, not "any sentence with a number" ----
  await check('detects a real what-if', () => {
    assert.equal(detectWhatIf('how does margin change if the aluminium price rises $45/mt?'), true)
    assert.equal(detectWhatIf('what if USD/NOK falls 0.5?'), true)
    assert.equal(detectWhatIf('aluminium +45'), true)
  })
  await check('ignores non-what-if questions', () => {
    assert.equal(detectWhatIf('what is the bull case?'), false)      // no magnitude
    assert.equal(detectWhatIf('summarize the top 3 risks'), false)   // "3" but no change/conditional/sign
    assert.equal(detectWhatIf(''), false)
  })

  // ---- 2. variable matching: right row, and NOT a look-alike ----
  await check('keywords derive from the row itself (generic)', () => {
    const kw = variableKeywords(NHY.sensitivities![0])
    assert.ok(kw.includes('aluminium') && kw.includes('aluminum')) // spelling normalized
  })
  await check('matches aluminium, and alumina does NOT collide with it', () => {
    assert.equal(matchVariable('if the aluminium price rises $45/mt', NHY)?.variable, 'lme_aluminium_price')
    assert.equal(matchVariable('what if alumina goes up 20 USD/mt', NHY)?.variable, 'alumina_price')
  })
  await check('matches the FX row by code and by currency alias', () => {
    assert.equal(matchVariable('if USD/NOK strengthens by 0.5', NHY)?.variable, 'usd_nok')
    assert.equal(matchVariable('if the dollar moves 0.5', NHY)?.variable, 'usd_nok') // 'dollar' -> usd
  })
  await check('an unrecorded variable matches nothing', () => {
    assert.equal(matchVariable('if freight rates rise 20%', NHY), null)
  })

  // ---- 3. delta: signed magnitude in the variable's own unit ----
  const alu = NHY.sensitivities![0]
  await check('extracts a positive absolute delta', () => {
    assert.deepEqual(parseDelta('rises $45/mt', alu), { delta: 45, magnitude: 45, percent: false })
    assert.equal((parseDelta('+45', alu) as any).delta, 45)
  })
  await check('a falling verb makes it negative', () => {
    assert.equal((parseDelta('falls 45', alu) as any).delta, -45)
    assert.equal((parseDelta('drops by 30 USD/mt', alu) as any).delta, -30)
  })
  await check('a percentage move is sized off the row base_value', () => {
    // -5% of base 3192 = -159.6
    assert.ok(Math.abs((parseDelta('drops by 5%', alu) as any).delta - (-159.6)) < 1e-9)
  })
  await check('no magnitude -> null (not a modelable move)', () => {
    assert.equal(parseDelta('the aluminium price', alu), null)
  })
  await check('an absolute "from X to Y" level change is not sized (null, model answers)', () => {
    assert.equal(parseDelta('if aluminium drops from 3200 to 3000', alu), null)
  })

  // ---- 4. parseWhatIf: compute vs unsupported vs pass-through ----
  await check('parseWhatIf routes to compute for a recorded variable', () => {
    const p = parseWhatIf('margin if aluminium rises $45/mt', NHY)
    assert.equal(p?.kind, 'compute')
    assert.equal((p as any).variable, 'lme_aluminium_price')
    assert.equal((p as any).delta, 45)
  })
  await check('parseWhatIf routes to unsupported for an unrecorded variable', () => {
    const p = parseWhatIf('what if freight rates rise 20%', NHY)
    assert.equal(p?.kind, 'unsupported')
    assert.equal((p as any).recorded.length, 3)
  })
  await check('a non-what-if question yields null', () => {
    assert.equal(parseWhatIf('what is the single biggest risk?', NHY), null)
  })

  // ---- 5. the engine reconciliation: the number the chat shows == sensitivity_math.py ----
  await check('aluminium +45 reconciles with the orb (impact +675, +32.5 bps, in range)', async () => {
    const s = await computeScenario(NHY, 'lme_aluminium_price', 45)
    assert.ok(s, 'expected a computed scenario')
    assert.equal(s!.impact, 675)            // 45 x 15, the orb's own disclosed rate
    assert.equal(s!.newValue, 29564)        // 28,889 + 675
    assert.equal(s!.marginChangeBps, 32.5)  // 675 / 207,971
    assert.equal(s!.withinDisclosedRange, true)
    assert.equal(s!.confidence, 'high')
    assert.equal(s!.source, 'FY2025 Annual Report, p.38')
  })
  await check('a move beyond the disclosed band is flagged, not hidden', async () => {
    const s = await computeScenario(NHY, 'lme_aluminium_price', 500)
    assert.ok(s)
    assert.equal(s!.impact, 7500)                 // still computed (linear)
    assert.equal(s!.withinDisclosedRange, false)  // but flagged
    assert.ok(s!.rangeNote && /range/i.test(s!.rangeNote))
  })
  await check('an unknown variable computes to null (never a fabricated number)', async () => {
    assert.equal(await computeScenario(NHY, 'freight', 20), null)
  })

  // ---- 6. the injected context block carries the engine's numbers verbatim ----
  await check('computedContextBlock renders the scenario numbers + the do-not-recompute instruction', async () => {
    const s = await computeScenario(NHY, 'lme_aluminium_price', 45)
    const block = computedContextBlock({ kind: 'scenario', asked: 'q', scenario: s! })
    assert.ok(block.includes('29,564') && block.includes('675'))
    assert.ok(/do NOT recompute/i.test(block))
    assert.ok(block.includes('FY2025 Annual Report, p.38'))
  })
  await check('computedContextBlock for unsupported lists the recorded variables', () => {
    const block = computedContextBlock({ kind: 'unsupported', asked: 'q', recorded: NHY.sensitivities!.map((r) => ({ variable: r.variable, label: r.label, unit: r.unit })) })
    assert.ok(block.includes('LME aluminium price') && /could NOT model/i.test(block))
  })

  console.log(`\n${passed} chat-whatif checks passed`)
})()
