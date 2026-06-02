# Management-Governance Module — Operating Rules

This file defines the operating rules specific to the **management-governance module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "Are the people running this company competent stewards of shareholder capital, and are their incentives and governance aligned with minority shareholders?"

It is the deep-dive behind the single `business-model/11_capital-allocation-governance` quick-read: management quality and track record, the capital-allocation scorecard, incentive/compensation alignment, ownership and insider behavior, board quality and shareholder rights, and disclosure candor.

This module DOES:
- judge management's track record — have they delivered on what they promised?
- score the historical capital-allocation record (M&A, buybacks, dividends, reinvestment, debt)
- assess whether incentives/compensation reward per-share value or empire-building
- map ownership, insider buying/selling, and control structure
- assess board independence, shareholder rights, and minority-shareholder protection
- judge disclosure candor — do they tell the truth in good times and bad?

This module does NOT:
- value the company or produce a fair value / price target — the **valuation module** owns that
- assign scenario probabilities, compute risk/reward, size positions, or issue a Buy/Sell rating — the **master synthesizer** owns that
- re-adjudicate the hard disqualifiers — those live in `business-model/01_disqualifier-scan` (audit qualification, going concern, promoter pledging >50%, related-party >25%, repeated auditor changes, material restatements, regulatory enforcement). This module references them and goes deeper on the spectrum.

**Relationship to `business-model/11_capital-allocation-governance` (read this twice).** That agent is a single quick-read inside the business-model module. THIS module is the dedicated deep-dive and **supersedes** it where they overlap. The synthesis tells the master synthesizer to treat this module's governance verdict and scores as the primary governance read.

**Boundary with the master synthesizer.** This module produces the stewardship read — scores, a verdict, and red flags at stated severity. The master synthesizer folds that into its verdict and risk register. Produce the read; stop there. No valuation, no probabilities, no rating, no sizing.

---

## Core Principles

1. **Judge actions, not words.** A mission statement is not evidence. Capital deployed, shares bought at what price, insiders buying or selling, promises kept or missed — those are evidence.
2. **Follow the incentives.** People do what they are paid to do. If comp pays on revenue or EPS growth, expect acquisitions and buybacks regardless of returns. State what the metrics actually reward.
3. **Per-share, always.** Growth that dilutes per-share value is value destruction dressed as ambition. Judge capital allocation on per-share outcomes, not absolute size.
4. **Alignment over charisma.** Skin in the game (meaningful ownership, bought not just granted) beats a good narrative.
5. **Candor in bad times is the tell.** Anyone is candid when results are good. Did they own the misses, or bury them in adjusted numbers and "headwinds"?
6. **Be blunt and conservative.** When evidence is thin, say "Not proven from available data" — do not give the benefit of the doubt.

---

## Source Hierarchy (most → least trusted)

1. Proxy statement / DEF 14A (compensation, ownership, board, related-party) and annual filings
2. Quarterly filings (10-Q, 6-K) and 8-K (management changes, departures)
3. Shareholder letters and the CEO's own prior-year statements (to check promises vs delivery)
4. Capital IQ / Bloomberg — ownership, insider transactions, compensation benchmarking
5. Earnings transcripts (tone, candor, ownership of misses)
6. User notes
7. Web sources — only for inputs not in the pool (executive background, board affiliations, insider-transaction filings, comp benchmarks). Label web-sourced numbers, with the date, as unverified.
8. Your own inference — must be labeled *"Inference, not from filings."*

When the shareholder letter is upbeat and the proxy shows misaligned pay, trust the proxy.

---

## Jurisdiction-Aware Source Mapping (Hard Rule)

US filing names (DEF 14A, 10-K, 10-Q, 8-K, Form 4) are EXAMPLES, not requirements. Detect the listing jurisdiction (triage `00`) and use the local equivalents. Do NOT mark a non-US company's governance data "missing" because a US form is absent when the local equivalent exists.

- **US / SEC:** DEF 14A, 10-K, 10-Q, 8-K, Form 4, Schedule 13D/13G, S-1/S-3/S-4/S-8, shareholder letter.
- **India / SEBI-LODR:** Annual Report, Corporate Governance Report, Board's Report, MD&A, Auditor Report, Secretarial Audit Report, Notes to Accounts, RPT disclosures, AGM notice, AGM voting / scrutinizer results, shareholding-pattern filings, promoter pledge/encumbrance disclosures, NSE/BSE announcements, SEBI orders, MCA filings, BRSR, investor presentations, earnings-call transcripts, credit-rating reports, postal-ballot notices, scheme documents, SEBI PIT/SAST disclosures, LODR compliance disclosures.
- **Other jurisdictions:** the local annual report, corporate-governance statement, remuneration report, voting results, exchange announcements, ownership disclosures, and regulator enforcement releases.

For Indian companies the proxy-equivalent is the AGM Notice + Corporate Governance Report; ownership is the shareholding-pattern filing; compensation is the Board's Report / CG Report.

---

## Sector-Specific Governance Overlays (Hard Rule)

Triage `00` identifies the sector and tells later agents which overlay applies. The CFO/PAT and working-capital lenses do NOT apply to financials — use the overlay instead.

- **Banks / NBFCs / insurers:** GNPA/NNPA, provision coverage, restructured book, write-offs, related-party lending, ALM mismatch, capital adequacy (CET1 / CAR), RBI/IRDAI observations, lending concentration, promoter pledge, regulatory penalties. Do NOT use CFO/PAT or working-capital metrics.
- **IT services:** client concentration, unbilled revenue, contract assets, attrition, subcontractor cost, visa exposure, wage-hike deferrals, large-deal margin risk, employee pyramid, cybersecurity / data-breach risk, government-contract exposure.
- **Pharma:** USFDA observations / warning letters / import alerts, plant compliance, product concentration, related-party manufacturing/distribution, R&D capitalization, ANDA write-offs.
- **Infra / real estate:** related-party land transactions, loans/advances, project SPVs, guarantees, contingent liabilities, land-title disputes, revenue recognition, customer advances, pledge / promoter debt.
- **Holding companies / conglomerates:** holdco discount, capital allocation between subsidiaries, guarantees, cross-holdings, cash leakage, opaque subsidiary structures, intercompany loans.

---

## Hard Self-Check (canonical — every agent applies before returning)

- [ ] Every material claim appears in the Universal Findings Table.
- [ ] Every non-NA finding has evidence; every citation has source, period, and page/section/date where available.
- [ ] Every Amber or Red finding has a follow-up question.
- [ ] Every Red finding has a red-flag decision and a Red Flag ID where applicable.
- [ ] Every score is traceable to specific rows.
- [ ] No vague verdicts without raw values.
- [ ] No US-only filing assumptions for non-US companies (jurisdiction map applied).
- [ ] Missing data is marked "Insufficient Data," not guessed.
- [ ] The narrative summary introduces no uncited claim.

The synthesis (`99`) downgrades data quality and confidence if any upstream agent fails this.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- `FY24 DEF 14A, Compensation Discussion & Analysis`
- `FY24 DEF 14A, Beneficial Ownership table`
- `FY24 10-K, Note 19 (Related Party)`
- `FY23 Shareholder Letter (promise)` vs `FY24 10-K (outcome)`
- `Capital IQ Insider Transactions, data as of 2026-05-09`
- `Web: Form 4 filing, 2026-04-15 (unverified)`

Do NOT write "company filings" or "the proxy" alone — those are not citations.

---

## Calculation & Assessment Standards

1. Always state the reporting currency and the period.
2. **Capital-allocation scorecard:** for each use of capital over 3–5 years, state the amount and the per-share outcome:
   - M&A: price paid, what it added, and whether disclosed returns/synergies materialized.
   - Buybacks: dollars spent, average price paid, and whether that price was below a defensible value (buying low vs buying high).
   - Dividends: payout ratio, coverage, growth, and whether sustainable.
   - Organic reinvestment: incremental ROIC (`Δ NOPAT / Δ invested capital`) where computable.
   - Debt: raised/repaid and to what end.
3. **Incentive alignment:** state the actual performance metrics in the bonus/LTIP, their weights, and whether they are per-share/returns-based (ROIC, EPS, TSR) or size-based (revenue, absolute EBITDA, deal count). Note pay magnitude vs performance and vs peers where data allows.
4. **Ownership:** state insider/promoter ownership %, whether shares were bought or merely granted, recent net insider buying/selling (12 months), and any pledging.
5. **Control structure:** flag dual-class / super-voting, controlled-company status, and any shareholder bloc with board-nomination or veto rights.
6. **Candor:** compare specific prior-period promises/guidance to actual outcomes; note non-GAAP aggressiveness (cross-check `earnings/06_earnings-quality`) and whether misses were owned or obscured.
7. Show the basis for every judgment. A reader must be able to trace each score to evidence.

---

## Evidence, Verdict & Confidence Schema (Hard Rule)

Every material finding in this module must be an auditable row, not a loose label. For each finding, capture:

- **Standardized verdict:** Green / Amber / Red / Not Applicable / Insufficient Data.
- **Raw value + unit:** the actual number (e.g., "66.7% independent," "RPT = 3.1% of revenue," "$190M tax dispute") — never just "Good/High/Low."
- **Current vs prior + trend:** Improving / Stable / Deteriorating / Not enough history.
- **Peer verdict:** Better than peers / In line / Worse than peers (where a peer set exists).
- **Source + as-of date:** a real citation (filing, page/note, date) — never the word "Source" alone.
- **Confidence (1–5):** by source quality (tiers below).
- **Materiality:** Low / Medium / High / Critical (thresholds below).

A finding may NOT be marked Red on existence alone — it must clear a materiality threshold. Replace every vague label ("strong," "good," "high") with a measurable criterion. Separate fact (evidence) from interpretation (your read). Use "Insufficient Data" rather than guessing; flag stale or source-conflicting data and lower the confidence.

**Confidence tiers (1–5):** annual report / exchange filing = 5; auditor report / notes to accounts = 4; investor deck / transcript = 3; rating agency / proxy advisor / reputable news = 2; social / employee-review / unverified = 1.

---

## Universal Findings Table (Hard Rule)

Every specialist agent (01–06) MUST output a Universal Findings Table. Every material claim in its narrative must also appear as a row here — the narrative summarizes this table and introduces no uncited claim. Columns:

| Finding ID | Section | Question / Test | Standardized Verdict | Raw Value | Unit | Current Period | Prior Period | Trend | Peer Benchmark | Peer Verdict | Score | Max Score | Penalty | Confidence 1–5 | Materiality | Evidence | As-of Date | Analyst Interpretation | Red Flag Triggered? | Red Flag ID | Follow-up Required |
|---|---|---|---|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|---|---|---|---|---|---|

- **Finding ID** = `{NN}-{nnn}` (agent number + sequence), e.g. `03-001`.
- **Standardized Verdict** ∈ {Green, Amber, Red, Not Applicable, Insufficient Data}.
- **Raw Value** numeric where possible; no vague labels ("Good/High/Low/Strong") without a measurable value.
- Every non-NA row has **Evidence** in the MODULE_RULES citation format and an **As-of Date**.
- Every **Amber/Red** row has a Follow-up; every **Red** row states whether a formal red flag is triggered and its **Red Flag ID** (registry below) if applicable.
- Missing data → "Insufficient Data" (never guessed).

## Source Log (Hard Rule)

Every agent ends with a Source Log. No evidence without a source-log entry; no source-log entry without a use. If sources conflict, show the conflict and lower confidence. If a source is stale, mark it stale.

| Source ID | Source Type | Filename / Filing | Period | Page / Section | Date | Confidence 1–5 | Used For |
|---|---|---|---|---|---|---:|---|

## Machine-Readable Outputs (Hard Rule)

Markdown alone is not enough. Each specialist emits, at the END of its report, a fenced ```json block: an array of finding objects (one per Universal Findings Table row) using this schema:

```
{ "finding_id":"", "ticker":"", "date":"", "agent":"", "section":"", "question":"",
  "standardized_verdict":"", "raw_value":null, "unit":"", "current_period":"", "prior_period":"",
  "trend":"", "peer_benchmark":"", "peer_verdict":"", "score":null, "max_score":null, "penalty":null,
  "confidence_1_to_5":null, "materiality":"", "evidence":"", "source_id":"", "source_type":"",
  "source_date":"", "as_of_date":"", "analyst_interpretation":"", "red_flag_triggered":false,
  "red_flag_id":"", "follow_up_required":"" }
```

The synthesis (`99`) consolidates these and emits, as fenced blocks, `governance_summary.json`, `governance_findings.csv`, `red_flags.csv`, and `source_log.csv`. The standalone command writes those blocks to disk as sidecar files (subagents return inline; the orchestrator owns file IO). If a block cannot be produced, mark that export "pending" — never omit it silently.

---

## Materiality Thresholds (Hard Rule)

Do not flag something Red just because it exists. Size it.

| Item | Low | Medium | High | Critical |
|---|---|---|---|---|
| Legal / regulatory exposure | <0.5% of net worth or PAT | 0.5–2% | 2–5% | >5%, or criminal / fraud allegation |
| Related-party transactions | <1% of revenue/assets | 1–5% | 5–10% | >10%, opaque, recurring, or promoter-linked |
| CFO / PAT (or CFO / EBITDA) | ≥80% (Green) | 60–80% (Amber) | <60% (Red) | profits rising while cash conversion falls for multiple years |
| Receivables | aging stable, in line with industry (Green) | growing faster than revenue (Amber) | >6-month receivables rising sharply / concentrated with related parties (Red) | — |

For the forensic inputs above (CFO/PAT, receivables), use the figures from `earnings/06_earnings-quality` and `earnings/01_historical-financials` — do not recompute them; apply the governance lens (is this a candor or leakage signal?).

---

## Analyst Follow-Up & Peer Benchmark (Hard Rule)

- **Follow-ups:** every Red or Amber finding must carry at least one analyst follow-up question (one-off or recurring? material to earnings/cash/valuation? disclosure adequate? company-specific or sector-wide? affects minority holders? does management's explanation hold?).
- **Peer benchmark:** where `business-model/08_competitive-map` provides peers, benchmark the key governance metrics (board independence, insider/promoter holding, pledge, auditor / non-audit fees, RPT intensity, contingent liabilities, AGM votes-against) against 3–5 peers and assign a peer verdict. If no peer set is available, state "No peer set — relative governance not assessed."

---

## Scoring Rules

All scores are out of 100, whole numbers. Bands:

| Band | Meaning |
|---|---|
| 0–20 | Very weak / very high risk / unknown |
| 21–40 | Weak / high risk |
| 41–60 | Mixed / average |
| 61–80 | Strong / low risk |
| 81–100 | Very strong / very low risk / very clear |

### Management-Governance Module Scores

| Score | Direction | What it measures |
|---|---|---|
| Management quality /100 | higher = better | Track record and execution vs stated plans |
| Capital allocation /100 | higher = better | Historical per-share value creation from capital deployed |
| Incentive alignment /100 | higher = better | Whether pay rewards per-share value vs size/empire-building |
| Shareholder friendliness /100 | higher = better | Board independence, voting rights, minority-shareholder protection |
| Disclosure candor /100 | higher = better | Truth-telling in good and bad times |
| Governance risk /100 | **higher = WORSE** (inverted) | Red flags: control abuse, related-party, pledging, restatements, entrenchment |
| Data quality /100 | higher = better | Completeness of governance-relevant data (proxy, ownership, comp) |
| Overall usefulness /100 | higher = better | How useful this module is for the master synthesizer |

**Inverted scores are flagged explicitly** in every table header that uses them.

Be strict. High scores require evidence of action, not narrative. Default to the middle band when uncertain.

### Composite Governance Score & Rating (Hard Rule)

Roll the specialist scores into a single **Governance Score /100** using this exact formula:

`Governance Score = 0.20×Capital Allocation + 0.18×Incentive Alignment + 0.18×Shareholder Friendliness + 0.16×Disclosure Candor + 0.16×Management Quality + 0.12×(100 − Governance Risk)`

(Governance Risk is inverted, so use `100 − Governance Risk`.) Then compute:

`Confidence-Adjusted Governance Score = Governance Score × (Confidence Score / 100)`

Map the Governance Score to a **Governance Rating**: 85–100 Excellent · 70–84 Good · 55–69 Watchlist · 40–54 Weak · below 40 Avoid / High Governance Risk.

Report separately: **Confidence Score /100** (from the source-quality tiers), **Red-Flag Count**, and **Critical Red-Flag Count**. If a hard disqualifier is flagged (see Disqualifier Deference) OR a Critical red flag fires, the Governance Rating must be **no better than "Weak"** and the stewardship verdict **no better than "Serious governance concerns."**

---

## Red-Flag Trigger Engine (Hard Rule)

The following events are automatic red flags. When any is present, the synthesis lists it with: trigger, evidence (source + date), severity (High / Critical), and impact on the governance score. Count them (and the critical ones) in the verdict block.

- Auditor resignation before term end; modified audit opinion; recurring Key Audit Matters; ICFR weakness
- CFO, Company Secretary, or Compliance Officer resignation (especially sudden / unexplained)
- Independent-director resignation, especially citing concerns
- Promoter pledge increase; promoter stake sale (especially before bad news)
- Related-party transactions above the High/Critical materiality threshold; large loans / guarantees to related parties
- CFO/PAT (or CFO/EBITDA) below 60%, especially persistent (from `earnings/06`)
- Sharp, unexplained receivables increase or concentration with related parties
- Material contingent liability (>5% of net worth); goodwill impairment
- SEBI / ED / MCA / SEC / DOJ / exchange enforcement action; repeated regulatory penalties; delayed results
- High non-audit fees vs audit fees; sudden accounting-policy change; restatement
- High AGM votes-against (remuneration, RPT, director / auditor reappointment)
- Insider selling before weak results; unexplained price / volume move before an announcement
- Large acquisition with vague rationale; cash trapped in subsidiaries; management commentary contradicting the numbers

Severity uses the materiality thresholds. A Critical red flag (fraud allegation, going concern, enforcement, restatement, RPT leakage >10%) forces the rating to **no better than "Weak"** and the verdict to **no better than "Serious governance concerns."**

### Red-Flag ID Registry

Every Red finding cites a Red Flag ID. Severity uses the Materiality Thresholds.

| ID | Trigger |
|---|---|
| RF-AUD-001 | Auditor resignation before term end |
| RF-AUD-002 | Modified audit opinion |
| RF-AUD-003 | Emphasis of matter / adverse CARO / adverse secretarial-audit issue |
| RF-MGT-001 | Sudden CFO resignation |
| RF-MGT-002 | Sudden Company Secretary / Compliance Officer resignation |
| RF-MGT-003 | Management changes a KPI after underperformance |
| RF-MGT-004 | Turnaround claimed without ≥2–3 yrs of delivered operating inflection (§24 Filter 2) |
| RF-OWN-001 | Promoter pledge above threshold |
| RF-OWN-002 | Promoter pledge increased QoQ |
| RF-OWN-003 | Promoter stake sale before weak result / adverse announcement |
| RF-OWN-004 | Structurally unaligned controlling owner — government control, listed subsidiary of a value-maximizing parent, or sprawling unrelated conglomerate (§24 Filter 6) |
| RF-RPT-001 | RPT above High/Critical threshold |
| RF-RPT-002 | Promoter-linked RPT above threshold |
| RF-RPT-003 | Loans / advances / guarantees to related parties |
| RF-FIN-001 | CFO/PAT below 60% |
| RF-FIN-002 | Receivables growing faster than revenue |
| RF-FIN-003 | Contingent liability above 5% of net worth |
| RF-FIN-004 | Goodwill impairment |
| RF-REG-001 | SEBI / SEC / MCA / ED / exchange enforcement |
| RF-REG-002 | Delayed results or delayed material disclosure |
| RF-SHR-001 | High votes against a key resolution |
| RF-SHR-002 | Controversial preferential allotment / warrants / dilution |
| RF-MKT-001 | Insider selling before weak result |
| RF-MKT-002 | Unusual price / volume before announcement |
| RF-CAP-001 | Large acquisition with vague rationale |
| RF-CAP-002 | Buybacks not reducing share count |
| RF-CAP-003 | Dividends not covered by FCF |
| RF-CAP-004 | Serial-acquirer / value-destructive M&A pattern, esp. debt-funded near/above own value (§24 Filter 4) |
| RF-DISC-001 | Management commentary contradicts the numbers |
| RF-DISC-002 | Recurring "one-off" adjustments |

Each Red finding records: Red Flag ID, trigger, severity, evidence, score impact, and a follow-up question.

---

## Stewardship Verdict Categories

The synthesis agent must pick exactly one:

- **Owner-operator / exemplary stewards** — meaningful insider ownership, a record of per-share value creation, returns-based incentives, clean governance, candid in bad times
- **Aligned & competent** — generally shareholder-aligned with a solid record and acceptable governance; minor flags
- **Standard / mixed** — neither a clear positive nor a clear negative; conventional comp and governance, an unremarkable record
- **Misaligned or weak stewardship** — size-based incentives, value-destructive capital allocation, thin alignment, or weak candor
- **Serious governance concerns** — control abuse, related-party leakage, entrenchment, or a pattern of misleading disclosure (note any hard disqualifier flagged by `business-model/01_disqualifier-scan`)
- **Insufficient data** — cannot assess stewardship (e.g., no proxy / no ownership / no comp data)

---

## Partial-Data Rules

When specific data is missing, the affected agents must cap their output as described:

| Missing Data | Affected Agents | Rule |
|---|---|---|
| No proxy / compensation disclosure | 03, 99 | Incentive alignment not assessable; cap and flag |
| No ownership / insider-transaction data | 04, 99 | Ownership and insider-behavior read limited; cap |
| No board disclosure | 05, 99 | Board independence/rights not assessable; cap |
| No multi-year history | 02 | Capital-allocation scorecard limited to the latest period; flag |
| No transcripts or prior letters | 01, 06 | Promise-vs-delivery and candor read limited to filings |

---

## Score Cap Rules

When data is missing or weak, these hard caps override an agent's own scoring. The synthesis agent applies all applicable caps.

| Missing / Weak Data | Score Cap |
|---|---|
| No proxy / compensation disclosure | Incentive alignment max 50; Overall usefulness max 70 |
| No ownership / insider-transaction data | Shareholder friendliness max 60 |
| No multi-year capital-allocation history | Capital allocation max 65 |
| No prior promises/guidance to check against | Disclosure candor max 65 |
| A hard disqualifier is flagged by `business-model/01_disqualifier-scan` | Governance risk floor 80 (i.e., score ≥80); Overall verdict cannot exceed "Serious governance concerns" |
| **Turnaround thesis without ≥2–3 yrs of delivered operating inflection** (§24 Filter 2) | Management quality max 60; note conviction cap; classify as governance-turnaround |
| **Serial-acquirer pattern** — multiple material deals, esp. debt-funded near/above own value (§24 Filter 4) | Capital allocation max 50; Governance risk floor 60; RF-CAP-004 |
| **Structurally unaligned controlling owner** — government control, listed subsidiary of a value-maximizing parent, or sprawling unrelated conglomerate (§24 Filter 6) | Shareholder friendliness max 55; Governance risk floor 55; RF-OWN-004; value-trap note to valuation |
| **Unresolved adverse integrity signal** routed from `business-model/01_disqualifier-scan` and not cleared (§24 Filter 1) | Management quality max 60; Disclosure candor max 60; note conviction cap (no hard lock unless proven) |

If multiple caps affect the same score, use the most restrictive.

These rows implement the CLAUDE.md §24 "Avoid Big Risks" rejector filters as score penalties + conviction caps. They are not new hard disqualifiers (those stay in `business-model/01_disqualifier-scan` and §13). A filter trips on cited evidence; a tripped filter is never averaged away, and the synthesis (`99`) applies it in the Score Cap Application table.

---

## Cross-Module Inputs

The management-governance module reads outputs from previously-run modules. Under `/research:full` it runs after business-model and earnings.

**From business-model (`analyses/{TICKER}_{DATE}/business-model/`):**
- `11_capital-allocation-governance.md` — the quick-read this module deepens and supersedes
- `01_disqualifier-scan.md` — hard governance disqualifiers (audit, pledging, related-party, restatements, enforcement) — reference, do not re-adjudicate
- `12_red-flags-sweep.md` — any governance/quality flags already surfaced
- `02_business-identity.md` — who the company is and its control context

**From earnings (`analyses/{TICKER}_{DATE}/earnings/`):**
- `06_earnings-quality.md` — non-GAAP aggressiveness and accrual quality (a candor signal)
- `04_guidance-consensus.md` — the guidance/beat-miss track record (a candor and competence signal)

If a cross-module file is missing, the affected agent proceeds independently and states:
*"{module} cross-module input not available — proceeding on this module's own read of the data pool."*

---

## Disqualifier Deference (Hard Rule)

The hard, binary disqualifiers are owned by `business-model/01_disqualifier-scan`. This module does NOT re-decide them. If that scan flagged any disqualifier, this module's synthesis must: (a) report it verbatim, (b) apply the Governance-risk floor from the Score Cap Rules, and (c) cap the stewardship verdict at "Serious governance concerns." This module's job is the richer spectrum BELOW the hard lock — competence, alignment, and candor — not a second opinion on the lock itself.

---

## Style Rules

- Plain English. Short sentences.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Actions and numbers beat adjectives. Quote the comp metric, the buyback price, the ownership %.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These may NOT appear unless paired with specific evidence in the same sentence:

- "strong management" / "experienced team" (state the track-record evidence)
- "aligned with shareholders" (state the ownership % or the incentive metric)
- "shareholder-friendly" (state the action — buyback price, dividend, rights)
- "disciplined capital allocation" (state the per-share outcome)
- "best-in-class governance" / "high-quality board"
- "proven track record" (prove it with a kept promise)
- "committed to creating value"

---

## Out-of-Scope Requests

If the invocation message asks for anything outside a subagent's specific scope — a fair value / price target, scenario probabilities, risk/reward, a Buy/Sell rating, position sizing — do NOT comply. Produce the standard report and add:
`Out-of-scope request received: [describe]. This belongs to the valuation module or the master synthesizer, not the management-governance module.`

---

## Inputs Every Subagent Receives

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/management-governance/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to outputs from agents this one depends on (in-module and cross-module; may be empty)

Read these from the invocation message. Never hardcode.

---

## Output Path Convention

`analyses/{TICKER}_{DATE}/management-governance/{NN}_{agent-name}.md`

---

## Chat Confirmation Format

Every subagent ends its turn with:

```
Agent: {name}
Output: {path}
Verdict: {agent-specific verdict line}
Biggest finding: {one line}
```

Add lines only if applicable:
- `Out-of-scope: ...`
- `Insufficient data: ...`
- `Partial data: ...` (name which data is missing and which cap was applied)

---

## Independent Reads

Each subagent reads `DATA_PATH` independently and extracts what it needs.
Subagents do NOT share an authoritative manifest.
The synthesizer reconciles disagreements at the end.

---

## What Good Looks Like

A good Management-Governance module output should let the master synthesizer answer five questions quickly:

1. Have these people delivered on what they promised?
2. Has capital been allocated to create per-share value, or to grow for its own sake?
3. Do incentives reward per-share value or empire-building?
4. Do insiders own meaningful stock, and are they buying or selling?
5. Are minority shareholders protected, and is management candid when results are bad?

---

## Subagent List & Execution Layers

Layer 0 (sequential, fail-fast):
- `00_governance-data-triage`

Layer 1 (sequential — the foundation):
- `01_management-and-track-record`

Layer 2 (parallel, all depend on `01`):
- `02_capital-allocation-scorecard`
- `03_incentives-and-compensation`
- `04_ownership-and-insider-behavior`
- `05_board-and-shareholder-rights`
- `06_candor-and-disclosure-quality`

Layer 3 (sequential, synthesizer):
- `99_management-governance-synthesis` (depends on all prior)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
