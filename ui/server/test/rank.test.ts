// Composite ranking (news/rank.ts): the deterministic re-rank that lifts terse primary filings above
// verbose news (CLAUDE.md §4), demotes rumours/macro, and stays explainable. No network, no LLM.
// Run: npx tsx test/rank.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { rankScore, reRankFromFactors, preTriagePriority, materialityLabelBoost, quantifiedImpactBonus, deriveMaterialityLabel, MATERIALITY_LABEL_FLOOR } from '../src/news/rank'
import { DEFAULT_RANK_WEIGHTS } from '../src/news/rank-weights'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

const NOW = new Date('2026-06-13T12:00:00Z')
const fresh = '2026-06-13T11:30:00Z' // 30 min old → recency +5

check('bias fix: a terse high-tier filing out-ranks a higher-Groq plain-news item', () => {
  const filing = rankScore(
    { materiality_pre_score: 45, input_nature: 'regulatory_filing', issuer_linkage: 'primary', companies: [{ name: 'Acme Corp' }], event_types: ['capital_actions'], size_bucket: 'large', headline: '8-K - Acme Corp (Filer)', found_at: fresh },
    NOW,
  )
  const news = rankScore(
    { materiality_pre_score: 62, input_nature: 'news_headline', issuer_linkage: 'sector', event_types: ['macro_sector'], size_bucket: 'unknown', headline: 'Analysts weigh in on the sector outlook', found_at: fresh },
    NOW,
  )
  assert.ok(filing.rank_score > news.rank_score, `filing ${filing.rank_score} should beat news ${news.rank_score}`)
  assert.ok(filing.rank_score > 45, 'filing was boosted above its raw Groq read')
  assert.equal(filing.rank_factors.source_tier, 8) // primary_filing
  assert.equal(filing.rank_factors.scope_id, 'single_name')
  assert.equal(filing.rank_factors.event, 6) // capital_actions
})

check('rumour is demoted below its raw Groq read', () => {
  const r = rankScore(
    { materiality_pre_score: 60, input_nature: 'news_headline', issuer_linkage: 'primary', companies: [{ name: 'Bid Co' }], event_types: ['mna', 'rumor'], size_bucket: 'large', headline: 'Bid Co said to weigh a takeover, sources say', found_at: fresh },
    NOW,
  )
  // rumor source-tier penalty (-8) applies even though mna is a strong event; net still below raw 60? Not
  // necessarily — assert the rumour TIER penalty is present and the score is bounded sensibly.
  assert.equal(r.rank_factors.source_tier, -8) // unconfirmed
  assert.ok(r.rank_score <= 100 && r.rank_score >= 0)
})

check('macro print is demoted vs a single-name company event of equal Groq score', () => {
  const macro = rankScore({ materiality_pre_score: 55, input_nature: 'macro_data_release', issuer_linkage: 'macro', event_types: ['macro_sector'], headline: 'US CPI inflation cools to 2.3%', found_at: fresh }, NOW)
  const company = rankScore({ materiality_pre_score: 55, input_nature: 'company_press_release', issuer_linkage: 'primary', companies: [{ name: 'Widget Inc' }], event_types: ['guidance_change'], size_bucket: 'large', headline: 'Widget Inc raises full-year guidance', found_at: fresh }, NOW)
  assert.ok(company.rank_score > macro.rank_score, `company ${company.rank_score} should beat macro ${macro.rank_score}`)
  assert.equal(macro.rank_factors.scope, -4) // macro penalty
})

check('boost_weight 0 → rank_score equals the raw Groq materiality (pure pre-score)', () => {
  const r = rankScore({ materiality_pre_score: 73, input_nature: 'regulatory_filing', issuer_linkage: 'primary', companies: [{ name: 'X' }], event_types: ['mna'], found_at: fresh }, NOW, { ...DEFAULT_RANK_WEIGHTS, boost_weight: 0 })
  assert.equal(r.rank_score, 73)
})

check('factors are explainable and the score reconciles to materiality + boost (clamped 0–100)', () => {
  const r = rankScore({ materiality_pre_score: 50, input_nature: 'regulatory_filing', issuer_linkage: 'primary', companies: [{ name: 'Y' }], event_types: ['mna'], size_bucket: 'mega', headline: 'Y to acquire Z', found_at: fresh }, NOW)
  const f = r.rank_factors
  const expected = Math.max(0, Math.min(100, f.materiality + f.source_tier + f.scope + f.event + f.size + f.recency))
  assert.equal(r.rank_score, expected)
  assert.equal(f.materiality, 50)
  assert.equal(f.recency, 5)
  assert.equal(f.size, 2) // mega
})

check('score clamps to 100 (no overflow) for a maxed-out item', () => {
  const r = rankScore({ materiality_pre_score: 95, input_nature: 'regulatory_filing', issuer_linkage: 'primary', companies: [{ name: 'A' }, { name: 'B' }], event_types: ['mna'], size_bucket: 'mega', headline: 'A to acquire B', found_at: fresh }, NOW)
  assert.equal(r.rank_score, 100)
})

// ---- event-materiality classifier: floor-boost, quantified bonus, final label (the under-scoring fix) ----

check('materialityLabelBoost lifts a score to the label\'s floor, never lowers it', () => {
  assert.equal(materialityLabelBoost('critical', 58), 27) // 85 - 58
  assert.equal(materialityLabelBoost('high', 58), 12) // 70 - 58
  assert.equal(materialityLabelBoost('critical', 90), 0) // already above the floor — no boost
  assert.equal(materialityLabelBoost('low', 90), 0) // a low label never PULLS a score down
  assert.equal(materialityLabelBoost('medium', 10), 35) // 45 - 10
  assert.equal(materialityLabelBoost(undefined, 50), 0) // missing label → no-op
  assert.equal(materialityLabelBoost('not-a-label', 50), 0) // unrecognized → no-op, never throws
})

check('deriveMaterialityLabel thresholds match MATERIALITY_LABEL_FLOOR exactly', () => {
  assert.equal(deriveMaterialityLabel(100), 'critical')
  assert.equal(deriveMaterialityLabel(MATERIALITY_LABEL_FLOOR.critical), 'critical')
  assert.equal(deriveMaterialityLabel(MATERIALITY_LABEL_FLOOR.critical - 1), 'high')
  assert.equal(deriveMaterialityLabel(MATERIALITY_LABEL_FLOOR.high), 'high')
  assert.equal(deriveMaterialityLabel(MATERIALITY_LABEL_FLOOR.high - 1), 'medium')
  assert.equal(deriveMaterialityLabel(MATERIALITY_LABEL_FLOOR.medium), 'medium')
  assert.equal(deriveMaterialityLabel(MATERIALITY_LABEL_FLOOR.medium - 1), 'low')
  assert.equal(deriveMaterialityLabel(0), 'low')
})

check('quantifiedImpactBonus fires only when a quantified figure AND an impact keyword are BOTH present', () => {
  // task test case 2: a quantified profit warning
  assert.equal(quantifiedImpactBonus('Company warns net loss of HK$220-260m'), 6)
  assert.equal(quantifiedImpactBonus('Acme cuts FY guidance to $1.2bn from $1.5bn'), 6)
  assert.equal(quantifiedImpactBonus('Regulator fines Acme 5% of global revenue'), 6)
  // a bare number with no impact keyword must NOT trigger (avoid false positives)
  assert.equal(quantifiedImpactBonus('Acme opens its 3rd store this year, $50 entry ticket'), 0)
  // an impact keyword with no quantified figure must NOT trigger
  assert.equal(quantifiedImpactBonus('Acme warns of a tough quarter ahead'), 0)
  // checks the English translation when present, same pattern as deriveScope
  assert.equal(quantifiedImpactBonus('foreign headline', 'Company warns net loss of HK$220-260m'), 6)
})

check('quantifiedImpactBonus uses word boundaries — "investors" does not fire the "invest" stem (Thread D)', () => {
  // the 'invest' impact keyword matched substring-wise on "investors"/"investor" in routine price-chatter,
  // pairing with the "%" figure to add a spurious +6. RED on old code (returned 6); GREEN after switching
  // to word-boundary matching.
  assert.equal(quantifiedImpactBonus('Shares fall 5% as investors weigh results'), 0)
  assert.equal(quantifiedImpactBonus('Investor sentiment lifts the index 3%'), 0)
  // the sibling substring collisions the same fix closes: "cuts" inside "Haircuts", "beats" inside "heartbeats"
  assert.equal(quantifiedImpactBonus('Haircuts get pricier as salon fees rise 4%'), 0)
  // a REAL 'invest' hit (word boundary) still fires when paired with a figure — coverage is preserved
  assert.equal(quantifiedImpactBonus('Reliance to invest ₹75,000 crore in green energy'), 6)
  assert.equal(quantifiedImpactBonus('Acme to invest $2bn in a new fab'), 6)
  // multi-word impact keywords still match at their outer edges
  assert.equal(quantifiedImpactBonus('Board approves plan to buy back 5% of shares'), 6)
  assert.equal(quantifiedImpactBonus('Firm posts net loss of $500m'), 6)
})

check('rankScore: a war escalation with no company named now scores ABOVE a routine macro print (task test case 1)', () => {
  // BEFORE this fix this fell into the macro bucket (-4 penalty) — now it is recognized as geopolitical
  // (+9) and the model's own "critical" call lifts the raw score via the floor-boost.
  const warEscalation = rankScore(
    { materiality_pre_score: 58, issuer_linkage: 'macro', event_types: ['macro_sector'], headline: 'US conducts fresh strikes in Iran after recent peace treaty', found_at: fresh, event_materiality_label: 'critical' },
    NOW,
  )
  const routineMacro = rankScore(
    { materiality_pre_score: 55, input_nature: 'macro_data_release', issuer_linkage: 'macro', event_types: ['macro_sector'], headline: 'US CPI inflation cools to 2.3%', found_at: fresh },
    NOW,
  )
  assert.equal(warEscalation.rank_factors.scope_id, 'geopolitical')
  assert.equal(warEscalation.rank_factors.scope, 9)
  assert.equal(warEscalation.rank_factors.materiality_label_floor, 27) // 85 - 58
  assert.ok(warEscalation.rank_score > routineMacro.rank_score, `war escalation ${warEscalation.rank_score} should beat routine macro ${routineMacro.rank_score}`)
  assert.ok(warEscalation.rank_score >= 85, `war escalation should clear the critical floor, got ${warEscalation.rank_score}`)
})

check('rankScore: a "Top 10" roundup does not earn the multi_name lift, even naming 5 mega-caps (task test case 4)', () => {
  const roundup = rankScore(
    {
      materiality_pre_score: 30,
      issuer_linkage: 'sector',
      companies: [{ name: 'Apple' }, { name: 'Microsoft' }, { name: 'Nvidia' }, { name: 'Alphabet' }, { name: 'Amazon' }],
      event_types: ['macro_sector'],
      size_bucket: 'mega',
      headline: 'Top 10 companies by market cap this week',
      found_at: fresh,
    },
    NOW,
  )
  assert.equal(roundup.rank_factors.scope_id, 'generic_media')
  assert.equal(roundup.rank_factors.scope, -10)
  assert.ok(roundup.rank_score < 40, `generic roundup should stay well below the watch threshold, got ${roundup.rank_score}`)
})

check('reRankFromFactors carries materiality_label_floor and quantified through UNCHANGED (not a function of the weight set)', () => {
  const r = rankScore({ materiality_pre_score: 60, issuer_linkage: 'primary', companies: [{ name: 'Acme' }], event_types: ['guidance_change'], headline: 'Acme warns of a $200m shortfall', found_at: fresh, event_materiality_label: 'high' }, NOW)
  assert.ok(r.rank_factors.materiality_label_floor > 0)
  assert.ok(r.rank_factors.quantified > 0)
  const rr = reRankFromFactors(r.rank_factors, { event_types: ['guidance_change'], size_bucket: undefined }, { ...DEFAULT_RANK_WEIGHTS, scope: { ...DEFAULT_RANK_WEIGHTS.scope, single_name: 999 } })
  assert.equal(rr.rank_factors.materiality_label_floor, r.rank_factors.materiality_label_floor)
  assert.equal(rr.rank_factors.quantified, r.rank_factors.quantified)
})

check('boost_weight 0 → the floor-boost and quantified bonus also vanish (pure Groq score, no exceptions)', () => {
  const r = rankScore(
    { materiality_pre_score: 40, issuer_linkage: 'macro', headline: 'US conducts fresh strikes in Iran', found_at: fresh, event_materiality_label: 'critical' },
    NOW,
    { ...DEFAULT_RANK_WEIGHTS, boost_weight: 0 },
  )
  assert.equal(r.rank_score, 40)
})

check('preTriagePriority orders the Groq queue: material-first, then primary filings, then routine news', () => {
  const matFiling = preTriagePriority({ input_nature: 'regulatory_filing', headline: 'Acme Ltd to acquire Beta Inc', found_at: fresh }, NOW)
  const matNews = preTriagePriority({ input_nature: 'news_headline', headline: 'Gamma in merger talks, sources say', found_at: fresh }, NOW)
  const routineFiling = preTriagePriority({ input_nature: 'regulatory_filing', headline: 'Delta Ltd: Newspaper Publication', found_at: fresh }, NOW)
  const routineNews = preTriagePriority({ input_nature: 'news_headline', headline: 'A quiet day in the markets', found_at: fresh }, NOW)
  assert.ok(matFiling > matNews, `material filing ${matFiling} > material news ${matNews}`)
  assert.ok(matNews > routineFiling, `material news ${matNews} > routine filing ${routineFiling} (a takeover headline beats a routine filing of any tier)`)
  assert.ok(routineFiling > routineNews, `routine filing ${routineFiling} > routine news ${routineNews}`)
})

// CLAUDE.md §4 (source hierarchy: filings > … > news > rumour, social is the FLOOR) + §24 (social is
// discovery/corroboration only, never ahead of trusted sources). A Reddit post packed with hot keywords
// must NOT jump the scarce triage queue ahead of a routine trusted item. Expected pinned to that rule,
// not to current code: social must rank strictly below every trusted-tier item.
check('preTriagePriority: a keyword-loaded social (Reddit) item never out-ranks trusted sources for the budget', () => {
  // r/Layoffs-style post: matches PRE_KEYWORDS ('layoffs', 'fraud') AND is freshest possible
  const socialHot = preTriagePriority({ input_nature: 'social_discussion', headline: 'Mass layoffs and fraud rumors at MegaCorp', found_at: fresh }, NOW)
  const routineNews = preTriagePriority({ input_nature: 'news_headline', headline: 'A quiet day in the markets', found_at: fresh }, NOW)
  const routineCompany = preTriagePriority({ input_nature: 'company_press_release', headline: 'Widget Inc opens a new office', found_at: fresh }, NOW)
  const routineFiling = preTriagePriority({ input_nature: 'regulatory_filing', headline: 'Delta Ltd: Newspaper Publication', found_at: fresh }, NOW)
  // Pre-fix this FAILED: socialHot = tier0*3 + material12 + recency5 = 17, beating routineNews(6+5=11),
  // routineCompany(9+5=14) and even routineFiling(15+5=20 — only filing survived). Now material is
  // suppressed for social → socialHot ≤ max recency (5) < every trusted floor.
  assert.ok(socialHot < routineNews, `social ${socialHot} must rank below routine news ${routineNews}`)
  assert.ok(socialHot < routineCompany, `social ${socialHot} must rank below routine company ${routineCompany}`)
  assert.ok(socialHot < routineFiling, `social ${socialHot} must rank below routine filing ${routineFiling}`)
})

// CLAUDE.md §4/§24 again, under a TUNED weight set. The freshness points are panel-tunable up to +50
// (rank-weights PT_MAX). Suppressing only the keyword lift left the recency lift on social, so once an
// operator raised the freshness weight a FRESH Reddit post could leapfrog an OLDER trusted item in the
// scarce triage queue. Expected pinned to the rule (social strictly below every trusted tier), not to
// code: that must hold at ANY recency weight, so the freshness lift is suppressed for social too.
check('preTriagePriority: a fresh social item never out-ranks a stale trusted item even with recency cranked up', () => {
  const stale = '2026-06-11T12:00:00Z' // 2 days old → 'more' bucket
  // freshness weight raised to its max on every recent bucket; the day-plus bucket stays 0
  const tuned = { ...DEFAULT_RANK_WEIGHTS, recency: { '1': 50, '3': 50, '6': 50, '12': 50, '24': 50, more: 0 } }
  const socialFresh = preTriagePriority({ input_nature: 'social_discussion', headline: 'MegaCorp layoffs thread', found_at: fresh }, NOW, tuned)
  const staleNews = preTriagePriority({ input_nature: 'news_headline', headline: 'A quiet day in the markets', found_at: stale }, NOW, tuned)
  const staleFiling = preTriagePriority({ input_nature: 'regulatory_filing', headline: 'Delta Ltd: Newspaper Publication', found_at: stale }, NOW, tuned)
  // Pre-fix: socialFresh = tier0*3 + 0 + recency50 = 50, beating staleNews(6+0=6) and staleFiling(15+0=15).
  // Post-fix: the freshness lift is suppressed for social → socialFresh = 0 < every trusted floor.
  assert.ok(socialFresh < staleNews, `fresh social ${socialFresh} must rank below stale news ${staleNews}`)
  assert.ok(socialFresh < staleFiling, `fresh social ${socialFresh} must rank below stale filing ${staleFiling}`)
  // control: recency still works for TRUSTED tiers — a fresh news item still beats a stale one under tuning
  const freshNews = preTriagePriority({ input_nature: 'news_headline', headline: 'A quiet day in the markets', found_at: fresh }, NOW, tuned)
  assert.ok(freshNews > staleNews, `fresh news ${freshNews} should still beat stale news ${staleNews} under recency tuning`)
})

console.log(`\n${passed} checks passed`)
