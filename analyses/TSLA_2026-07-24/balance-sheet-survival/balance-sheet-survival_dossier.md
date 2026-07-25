# balance-sheet-survival Module Dossier — TSLA

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-07-24T18:46:03Z
- Module folder: `balance-sheet-survival`
- Contents: 1 module synthesis + 7 specialist outputs = 8 files

## Table of Contents

- [balance-sheet-survival — module synthesis](#balance-sheet-survival-module-synthesis) — `99_balance-sheet-survival-synthesis.md`
- [balance-sheet-survival / 00_solvency-data-triage.md](#balance-sheet-survival-00-solvency-data-triage-md) — `00_solvency-data-triage.md`
- [balance-sheet-survival / 01_capital-structure-and-leverage.md](#balance-sheet-survival-01-capital-structure-and-leverage-md) — `01_capital-structure-and-leverage.md`
- [balance-sheet-survival / 02_maturity-wall-and-refinancing.md](#balance-sheet-survival-02-maturity-wall-and-refinancing-md) — `02_maturity-wall-and-refinancing.md`
- [balance-sheet-survival / 03_liquidity-runway.md](#balance-sheet-survival-03-liquidity-runway-md) — `03_liquidity-runway.md`
- [balance-sheet-survival / 04_coverage-and-covenants.md](#balance-sheet-survival-04-coverage-and-covenants-md) — `04_coverage-and-covenants.md`
- [balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md](#balance-sheet-survival-05-off-balance-sheet-and-contingencies-md) — `05_off-balance-sheet-and-contingencies.md`
- [balance-sheet-survival / 06_downside-stress-test.md](#balance-sheet-survival-06-downside-stress-test-md) — `06_downside-stress-test.md`


---

## balance-sheet-survival — module synthesis

_Source: `99_balance-sheet-survival-synthesis.md`_

# Balance-Sheet-Survival Module — TSLA (Synthesis)

## Abstract

Tesla's leverage is close to zero: canonical net debt (lease-inclusive gross debt minus cash only, the strict basis) is $861 million against $10,849 million of TTM EBITDA — 0.08x — and the company stays net cash on every broader reading, from $5.9 billion excluding leases to $27–34 billion including short-term investments. The real risk is concentration, not size: on a contractual basis 78% of debt matures within 12 months, almost entirely one unhedged $5.9 billion China working-capital facility booked long-term on an unevidenced refinancing assertion rather than a signed replacement agreement. Liquidity of $48.2 billion covers that wall roughly 6.6 times over even without counting free cash flow, giving a 28-month runway on the conservative basis; the tightest covenant is not quantifiable (no threshold disclosed). The stress test shows no covenant breach and no liquidity gap up to a 92–99% EBITDA collapse. Verdict: Solid, not Fortress — the wall and disclosure gaps are real, if well-cushioned.

## 1. Solvency Verdict

- **Verdict:** Solid
- **Net leverage (net debt / EBITDA):** 0.08x canonical (net debt $861M = broad/lease-inclusive gross debt $16,080M − cash & equivalents $15,219M, strict §15 cash basis; TTM GAAP EBITDA $10,849M) [`01`, §4, §7]. Deeply net cash on every broader basis: net cash $5,877M excluding leases (narrow debt $9,342M); net cash $27,444M–$34,182M once short-term investments are netted in [`01`, §4].
- **Liquidity runway:** ≈28.2 months on the conservative gross-obligations basis (usable liquidity $48,238M ÷ $1,710.1M monthly obligations, with no FCF netted); memo net-of-FCF basis is ~375 months but is flagged unreliable given the guided FY2026 capex step-up above $25bn [`03`, §3].
- **Maturity wall (% within 24 months):** GAAP balance-sheet "current" classification shows only 15.2% ($1,418M); the contractual basis — which this synthesis treats as the operative figure per the conservative-default rule — shows ≥78.2% ($7,306M) due within 12 months (and no lower within 24 months), driven almost entirely by the $5,888M China Working Capital Facility, which contractually matures Sep-2026–Mar-2027 but is booked GAAP long-term on management's stated "intent and ability to refinance," with no binding replacement facility disclosed [`02`, §1a–§1c, §2].
- **Tightest covenant + headroom:** Not assessable — no covenant threshold, ratio, or covenant-EBITDA definition is disclosed anywhere in the pool, only a binary "in material compliance" statement [`04`, §2]. Indicative-only headroom on a labeled-assumption 4.0x max-net-leverage covenant is +98.0%, not a disclosed fact [`04`, §3].
- **Stress break point (EBITDA decline that breaks it):** No covenant breach and no liquidity gap up to the deepest haircut modeled. Covenant/leverage break points (on labeled-assumption thresholds) cluster at ~92–99% EBITDA decline — essentially total elimination of operating earnings; committed liquidity does not exhaust on an EBITDA decline alone under either basis modeled [`06`, §3]. Tesla's own realized peak-to-trough EBITDA decline (FY2022→FY2025, −39.1%) already sits inside the −40% stress column and changes almost nothing [`06`, §2].
- Solvency strength /100: 74 *(capped at 75 — off-balance-sheet exposures undisclosed for a known-litigious name; see Cap 4)*
- Liquidity runway /100: 85
- Refinancing risk /100 *(higher = worse)*: 42
- Covenant headroom /100: Not assessable *(capped by no covenant disclosure per §4; indicative-only, not scored numerically)*
- Downside resilience /100: 92
- Data quality /100: 78
- Overall usefulness /100: 73 *(capped at max 75 — no covenant disclosure)*
- Biggest solvency risk (one line): the $5,888M China Working Capital Facility — 63% of total gross debt on the narrow basis — contractually matures within 2–9 months but is booked long-term on an unevidenced management refinancing assertion, with no signed replacement facility disclosed anywhere in the pool.

## 1A. Module Disconfirmation

- **Strongest bear point:** on a contractual basis, 78.2% of Tesla's debt ($7,306M) matures within 12 months, concentrated almost entirely in one unhedged, CNY-denominated, non-US-market facility with no committed replacement financing on file — the GAAP long-term classification rests on an accounting assertion, not a signed agreement [`02`, §1b, §4].
- **Strongest bull point:** usable committed liquidity of $48,238M covers that same contractual wall ~6.6x over and the full gross-obligations 12-month uses bucket ($20,521M, including a guided capex ramp) ~2.4x over — without relying on FCF materializing at all — and the China facility itself has a two-year track record of successful expansion and re-draw ($2,740M → $4,288M → $5,888M, Dec-2024 to Jun-2026) [`01`, §6; `03`, §1, §4; `02`, §4].
- **Single killer risk specific to solvency:** a joint scenario in which Chinese bank credit tightens (blocking the facility's roll) at the same time US capital markets or the RCF's usability for this purpose are constrained — this joint closure is not evidenced or modeled explicitly in this pool; the module's "market closure" test assumes only the US side is shut and still clears comfortably [`02`, §5; `06`, §4].
- **Disconfirming evidence already visible:** none undermines the liquidity math itself. What is visible is a set of quality-of-evidence gaps — no disclosed covenant threshold, no FY2025 10-K full contingency notes, a single stale (Oct-2022) credit rating — that lower confidence in the "Solid"/"Fortress" distinction without pointing to an actual fragility [`00`, §5; `04`, §2; `05`, opening gap flag].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficient — a recent balance sheet, instrument-level debt note, and cash flow statement all exist; the one real gap is no quantified covenant threshold | Single highest-value missing document: the credit agreement/indenture (or the full FY2025 10-K debt note, not in this pool) that would supply actual covenant thresholds behind the binary "in compliance" statement |
| capital-structure-and-leverage | Near-zero leverage on every basis; canonical net debt $861M / EBITDA 0.08x, tipping into net debt only on the strictest cash-only, lease-inclusive combination | 99.98% of on-balance-sheet debt (ex. finance leases/undrawn RCF) is non-recourse to Tesla, Inc.'s general assets — issued by subsidiary SPEs or an offshore China facility |
| maturity-wall-and-refinancing | "Refinanceable in most markets" — not "self-funded/low refi risk" | GAAP shows only 15.2% of debt due within 12 months, but the contractual figure is 78.2% — the $5,888M China facility is booked long-term on an unevidenced refinancing assertion, not a committed replacement |
| liquidity-runway | ≈28.2 months of runway on the conservative gross-obligations basis; not dependent on FCF materializing | Usable liquidity ($48,238M) is 6.6x the contractual 12-month wall and 2.4x the full gross-obligations uses bucket |
| coverage-and-covenants | Coverage is extreme (32.48x EBITDA/interest) but this reflects a near-zero debt base, not proven resilience; covenant headroom not assessable | (EBITDA − capex)/interest is negative (−6.21x) — a disclosed, cash-funded capex-timing effect (guided FY2026 capex >$25bn), not a distress signal |
| off-balance-sheet-and-contingencies | Largest exposure ($4.07B resale-value guarantee max) is 5.07% of equity — below the module's 3x/15% co-trigger; not treated as a spike | Five active litigation/regulatory matters (discrimination suits, Autopilot/FSD class action, securities class action, regulatory investigations) carry no disclosed dollar estimate — undisclosed exposure beyond the $4.40B quantified total cannot be ruled out |
| downside-stress-test | Survives every haircut modeled (−30%/−40%/−60%/−39.1% historical) with no covenant breach and a >$26B liquidity surplus | Break points (92–99% EBITDA decline) are a mechanical result of a near-debt-free balance sheet, not evidence the operating business itself is downturn-proof — EBIT margin already fell from 16.8% (FY2022) to 4.6% (FY2025) |

## 3. Reconciliation

No unresolved numerical disagreements between specialists — each upstream agent already reconciled to the more conservative reading and stated its basis explicitly. Three basis choices are carried through this synthesis and are worth surfacing together because the master synthesizer will otherwise see only one number per topic:

- **Maturity wall:** GAAP-current classification (15.2% due within 12 months) vs. the contractual view (78.2%). `02` built both and led with the contractual figure as the operative one, because the GAAP long-term booking of the $5,888M China facility rests on an accounting judgment (ASC 470-10-45 "intent and ability to refinance"), not a signed agreement. This synthesis adopts `02`'s contractual figure as the headline per CLAUDE.md §4's conservative-default rule.
- **Net debt:** narrow/GAAP-only debt (net cash $5,877M) vs. broad/lease-inclusive debt (net debt $861M). `01` designated the broad-debt, strict-cash figure ($861M net debt) as canonical because it is the more conservative combination and matches Capital IQ's and `earnings/01_historical-financials.md`'s existing convention. This synthesis uses that canonical figure but shows both, per §15.
- **Liquidity runway:** gross-obligations basis (28.2 months) vs. net-of-FCF basis (~375 months). `03` led with the conservative gross-obligations figure because TTM FCF is flagged unreliable against the guided FY2026 capex ramp. This synthesis adopts the same lead figure.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m (contractual) | ≥78.2% ($7,306M), 63.0% of it one instrument (China facility) | A single unhedged, non-US-market facility carries almost the entire near-term wall risk |
| Availability liquidity | usable liquidity vs uses | $48,238M vs $20,521M (2.4x) gross-obligations, or vs $7,306M (6.6x) contractual wall | RCF is fully committed and undrawn, not borrowing-base; liquidity does not require FCF to hold |
| Covenant illusion risk | covenant EBITDA vs reported | Undisclosed — cannot rule addback illusion in or out | Immaterial in practice only because debt is tiny vs. EBITDA, not because the definition question is resolved |
| Floating-rate sensitivity | floating % net of hedges | 63.0% of narrow debt ($5,888M), fully unhedged (no FX or rate hedges disclosed) | +200bp shock = +$117.8M/yr — immaterial in dollars, but confirms zero hedge protection |
| Structural subordination | HoldCo debt vs upstreaming | No classic HoldCo; ~99.98% of on-balance-sheet debt is non-recourse SPE/subsidiary paper; China-facility upstreaming constraints not disclosed | Ring-fenced debt protects the parent but the offshore cash's freedom to move is unconfirmed |
| Contingent accelerants | CoC puts / cross-default | Not disclosed in the data pool | A genuine disclosure gap, not evidence of absence — cannot be ruled out |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N — instrument-level maturity data exists (10-Q Note 8 + CIQ Capital Structure Details); not pre-aggregated, but built by `02` | — | Not applied |
| No covenant disclosure | Y — only a binary compliance affirmation, no threshold/definition | Covenant headroom; Overall usefulness | Covenant headroom = Not assessable; Overall usefulness max 75 |
| No cash flow statement | N — 10-Q + CIQ cash flow data present | — | Not applied |
| Only annual data (no interim) | N — Q2 FY26 10-Q (interim) is the primary source | — | Not applied |
| No EBITDA base (stress not run) | N — EBITDA base present (GAAP + non-GAAP), stress test ran fully | — | Not applied |
| Off-balance-sheet exposures undisclosed for a known-litigious/levered name | Y — five active litigation/regulatory matters carry no dollar estimate; full FY2025 10-K contingency notes not in this pool | Solvency strength | max 75 |

Most restrictive cap on Solvency strength is the off-balance-sheet cap (max 75); the covenant cap independently caps Overall usefulness at max 75.

## 5. Survival Summary

Tesla is barely levered by any conventional measure, and the direction is mildly worsening on the strictest basis even as the company stays net cash on every broader one: the canonical net-debt figure flipped from net cash of $1,794M at FY2025-end to net debt of $861M by Jun-30-2026, driven mainly by the China Working Capital Facility going fully drawn. The near-term maturity wall is real, not cosmetic — 78% of debt on a contractual basis matures within a year — but it is not self-funded in the sense of a signed refinancing agreement; it is covered instead by a large liquidity cushion (cash, unrestricted short-term investments, and an undrawn revolver) that does not depend on operating cash flow holding up. That liquidity runway is at least 28 months even in the most conservative reading, and the tightest disclosed covenant fact is simply that Tesla states it is "in material compliance," with no threshold anyone outside the company can verify. The stress test shows the company would need to lose 92–99% of its EBITDA before any labeled-assumption covenant would break, and committed liquidity never runs out on an EBITDA decline alone — so a normal recession-scale EBITDA decline (−30% to −40%) is comfortably survivable without a waiver, asset sale, or equity raise, and Tesla has in fact already lived through a comparable −39.1% peak-to-trough EBITDA decline (FY2022→FY2025) without any balance-sheet strain.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Solid | A disclosed, signed replacement facility or bond issuance for the China Working Capital Facility ahead of its Sep-2026–Mar-2027 contractual maturity; a disclosed covenant threshold showing genuinely wide numeric headroom; resolution/quantification of the five open litigation matters at immaterial amounts | A failed or materially more expensive re-draw of the China facility; simultaneous tightening of both Chinese bank credit and US capital-markets access; disclosure of a real covenant that is tighter than the labeled assumption used here; a large unquantified litigation loss crystallizing | The credit agreement/indenture text (actual covenant thresholds and definitions); the full FY2025 10-K's commitments/contingencies note; any signed refinancing or extension agreement for the China facility |

## 6A. Survival Playbook (non-speculative levers)

- **Refi actions taken:** the China Working Capital Facility has been successfully expanded and re-drawn three times over 18 months ($2,740M → $4,288M → $5,888M, Dec-2024 to Jun-2026), evidencing repeated market access to that specific credit line, though no forward commitment is disclosed [`01`, §6; `02`, §4].
- **Asset-sale programs:** none announced in this pool.
- **Capex cuts feasible:** not evidenced as a lever the company is using — capex is being ramped, not cut; management has guided FY2026 capex above $25bn, more than double FY2025's $8,527M, "for the next two to three years" [`03`, §2; `04`, §1].
- **Dividend/buyback suspension ability:** not a lever because none exists to suspend — Tesla has paid $0 in dividends and repurchased $0 of shares in any year since at least FY2017 [`03`, §2].
- **Covenant-amendment likelihood:** not assessable — no covenant terms or amendment history are disclosed in this pool.

## 7. Note To The Final Synthesizer

- Leverage is near-zero and, on the broadest cash+investments basis, deeply net cash ($27–34 billion); the direction on the strictest (canonical) basis is worsening — net cash of $1,794M (FY2025) flipped to net debt of $861M (Jun-30-2026) — driven by the China facility going fully drawn, not by new capital-markets borrowing.
- The maturity wall is concentrated, not laddered: 78.2% of debt is contractually due within 12 months, and 63.0% of that is a single unhedged China-market facility booked GAAP long-term on an accounting assertion ("intent and ability to refinance"), not a signed replacement agreement — refinancing depends on continued Chinese bank-credit access, a market distinct from where Tesla's US-dollar cash cushion sits.
- The liquidity runway (≈28 months, conservative basis) depends almost entirely on cash/investments/RCF already on the balance sheet, not on free cash flow materializing — a genuine strength given TTM FCF is itself unreliable as a forward guide against the guided capex ramp.
- The tightest covenant and its headroom cannot be stated as a fact: no threshold or covenant-EBITDA definition is disclosed anywhere in the pool, only a binary "in material compliance" affirmation. Indicative-only math on a labeled-assumption covenant shows extreme headroom, but that reflects how small the debt base is, not a verified distance to breach.
- The largest quantified off-balance-sheet exposure is the $4.07 billion maximum on vehicle resale-value guarantees (5.07% of equity, below the module's spike thresholds); the larger unresolved item is qualitative — five active litigation/regulatory matters (discrimination suits, the Autopilot/FSD consumer class action, the securities class action, ongoing NHTSA/SEC/DOJ inquiries) with no disclosed dollar estimate, which is why solvency strength is capped at 75 rather than scored on the leverage/liquidity picture alone. No `RF-OBS-001 (contingent-liability spike)` was fired by `05` — it explicitly tested and did not trip the module's 3x/15% co-trigger.
- The stress break point: covenant/leverage breach requires a ~92–99% EBITDA decline (essentially total elimination of operating earnings); committed liquidity does not exhaust on an EBITDA decline alone under either basis modeled. A normal recession-scale −30% to −40% EBITDA decline is fully survivable with no covenant breach and a liquidity surplus in excess of $26 billion, and this is not hypothetical — Tesla already lived through a comparable −39.1% peak-to-trough decline (FY2022→FY2025).
- Given the near-net-cash position, the strategic-flexibility read applies per CLAUDE.md §24 Filter 3: this is counter-cyclical optionality funding the robotaxi/Optimus/AI-compute capex cycle through a demand downturn without refinancing dependence, not a "lazy" or sub-optimal balance sheet.
- Two partial-data caps applied: no covenant disclosure (covenant headroom = Not assessable; overall usefulness capped at 75) and undisclosed off-balance-sheet/litigation exposure for a known-litigious name (solvency strength capped at 75). Neither cap reflects evidence of actual fragility — both reflect disclosure gaps in this pool.
- Biggest missing data point / single highest-value next data request: the credit agreement or indenture behind Tesla's debt (or the full FY2025 10-K debt/contingency notes, not present in this pool), which would supply the actual covenant thresholds currently only affirmed as "in compliance."
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress break points here (92–99% EBITDA decline for covenant breach, no finite liquidity break point) are the inputs for the master's downside scenario and risk register — this module assigns no probabilities and issues no rating.

## 8. Simple Summary

- Gross debt is $16,080 million including leases ($9,342 million excluding leases); net debt is just $861 million against $10,849 million of yearly earnings before interest, tax, depreciation and amortization (EBITDA) — a leverage ratio of 0.08x, and the company is still net cash by $5,877 million to $34,182 million on broader, still-standard readings.
- The maturity wall looks small on the balance sheet (15% due within a year) but is really much bigger on a true-date basis (78% due within a year) because one $5,888 million China loan is booked as long-term on a management promise to refinance it, not a signed deal — that promise, not a lack of cash, is the thing to watch.
- Liquidity lasts at least 28 months even in the most conservative math, without needing any operating cash flow to show up.
- No confirmed loan covenant exists to test — Tesla only says it is "in compliance," with no number disclosed, so "how close to breaking" cannot be answered with real data.
- The biggest off-balance-sheet item is a $4.07 billion cap on vehicle resale-value guarantees (5% of equity, not a red flag); five open lawsuits/investigations carry no dollar estimate and remain an unquantified tail risk.
- Yes — it survives a 30–60% earnings drop with no covenant break and no cash shortfall; the balance sheet would only actually break at a 92–99% earnings decline, which is essentially total loss of operating earnings, not a realistic recession.
- A current credit rating exists but is thin and stale (S&P BBB/Stable, only one agency, rating action dated Oct-2022); the key missing document is the actual loan agreement that would show real covenant numbers instead of just a "we're compliant" statement.
- This module is useful for the master synthesizer: the leverage and liquidity picture is clear and well-sourced; the main limits are the undisclosed covenant terms and the unquantified litigation tail, both flagged rather than guessed at.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — TSLA

## 1. File Inventory

Pool extraction confirmed fresh: 11 workbooks → 54 tabs; 64 total extract files; 0 extraction failures (`_pool_extracts/manifest.md`, `manifest.json` — every `status` is `ok`). No `data/TSLA/external/` folder exists, so no externally-sourced documents are in this pool.

| Filename | Type | Period Covered | Last Modified (Drive sync date — not filing date) | Solvency Relevance |
|---|---|---|---|---|
| Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarterly filing (10-Q) | Quarter ended Jun-30-2026, filed Jul-23-2026 | 2026-07-24 | High — full debt note (Note 8), balance sheet, cash flow, commitments & contingencies |
| Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | Annual filing amendment (10-K/A, Part III only) | FY ended Dec-31-2025; amendment filed Apr-30-2026 | 2026-07-24 | Medium — governance/comp/ownership only; explicitly does NOT restate or include financial statements, debt note, or contingencies (states "does not otherwise change or update any of the disclosures set forth in the Original Form 10-K") |
| Annual_Report_TSLA-Q4-2025.pdf | Investor deck ("Q4 and FY 2025 Update") — NOT the 10-K itself | Q4/FY2025 (period ended Dec-31-2025) | 2026-07-24 | Medium — includes an unaudited summarized balance sheet, income statement, and cash flow (pp.27+), sourced from the FY2025 10-K, but not the full debt/contingency notes |
| Annual_Report_TSLA-Q4-2024.pdf | Investor deck ("Q4 and FY 2024 Update") — NOT the 10-K itself | Q4/FY2024 (period ended Dec-31-2024) | 2026-07-24 | Medium — same structure as above, one year older |
| TSLA-Q2-2026-Update.pdf | Investor deck | Q2 2026 (period ended Jun-30-2026) | 2026-07-24 | Medium — summarized financial statements, cash/FCF commentary |
| TSLA-Q1-2026-Update.pdf | Investor deck | Q1 2026 (period ended Mar-31-2026) | 2026-07-24 | Medium |
| Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Transcript | Q2 2026 (call held Jul-22-2026) | 2026-07-24 | Medium — management commentary on cash, capex, liquidity |
| Tesla, Inc., Q1 2026 Earnings Call, Apr 22, 2026.rtf | Transcript | Q1 2026 (call held Apr-22-2026) | 2026-07-24 | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Key Stats | Debt / capital-structure export (CIQ) tab | Quarterly series through Jun-30-2026 | 2026-07-24 | High |
| … — Income Statement | CIQ tab | Quarterly series through Jun-30-2026 | 2026-07-24 | Medium (EBITDA base) |
| … — Balance Sheet | CIQ tab | Quarterly series through Jun-30-2026 | 2026-07-24 | High |
| … — Cash Flow | CIQ tab | Quarterly series through Jun-30-2026 | 2026-07-24 | High |
| … — Multiples | CIQ tab | Quarterly series | 2026-07-24 | Low |
| … — Historical Capitalization | CIQ tab | Quarterly series | 2026-07-24 | High |
| … — Capital Structure Summary | CIQ tab | Quarterly series through Jun-30-2026 | 2026-07-24 | High — gross/net debt, leverage ratios by period |
| … — Capital Structure Details | CIQ tab | "Source: Q2 2026 filed Jul-23-2026" — instrument-level as of FY2025 (Dec-31-2025) and FY2024 | 2026-07-24 | High — instrument-level type/coupon/maturity/seniority/secured/currency |
| … — Ratios | CIQ tab | Quarterly series | 2026-07-24 | High — EBITDA/Interest, (EBITDA-capex)/Interest coverage series |
| … — Supplemental | CIQ tab | Quarterly series | 2026-07-24 | Low-Medium |
| … — Industry Specific | CIQ tab | Quarterly series | 2026-07-24 | Low |
| … — Pension OPEB | CIQ tab | Quarterly series | 2026-07-24 | Low — tab is blank/no data, consistent with no material defined-benefit obligation |
| … — Segments | CIQ tab | Quarterly series | 2026-07-24 | Low (business-model relevance, not solvency) |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — [same 14 tabs as Quarterly above] | CIQ tabs | Annual series FY2017–FY2025 | 2026-07-24 | High (same set, annual cadence) |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Summary | CIQ tab | LTM ending Jun-30-2026, financials updated 2026-07-23 | 2026-07-24 | High — CIQ relative Solvency/Liquidity scores + S&P Foreign-Currency LT rating (BBB) vs 31 peers |
| … — Financials | CIQ tab | LTM series | 2026-07-24 | Medium |
| … — Operational Metrics Charts | CIQ tab | LTM series | 2026-07-24 | Low |
| … — Solvency Metrics Charts | CIQ tab | LTM series | 2026-07-24 | Medium |
| … — Liquidity Metrics Charts | CIQ tab | LTM series | 2026-07-24 | Medium |
| … — Disclaimer | CIQ tab | — | 2026-07-24 | None |
| Tesla Inc NasdaqGS TSLA Public Company Profile.rtf | CIQ profile export | Snapshot as of 2026-07-24 | 2026-07-24 | Medium — carries the S&P Global Ratings issuer credit rating block (Local & Foreign Currency LT: BBB, Stable, rating action dated Oct-06-2022) |
| Tesla Inc NasdaqGS TSLA Key Developments.xls — Key Developments | CIQ tab | Historical event log | 2026-07-24 | Low-Medium — could carry rating-action or default events; not solvency-primary |
| Company Comparable Analysis Tesla Inc .xls — Credit Health Panel | CIQ tab (duplicate of dedicated Credit Health Panel workbook) | Snapshot | 2026-07-24 | Medium |
| … — Financial Data / Trading Multiples / Operating Statistics / Implied Valuation / Valuation Chart / Business Description / Disclaimer | CIQ tabs | Snapshot / peer comps | 2026-07-24 | Low — valuation-comps focused, not solvency |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Consensus / Recent Changes / Guidance / Multiples / Surprise / Trends / Revisions (7 tabs) | CIQ tabs | Forward estimates | 2026-07-24 | Low — consensus/estimates, not solvency data |
| Tesla Inc NasdaqGS TSLA Customers.xls — Customers | CIQ tab | Snapshot | 2026-07-24 | Low |
| Tesla Inc NasdaqGS TSLA Events Calendar.xls — Events Calendar | CIQ tab | Forward calendar | 2026-07-24 | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership History.xls — History | CIQ tab | Historical ownership | 2026-07-24 | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Insider Trading.xls — Insider Trading | CIQ tab | Historical | 2026-07-24 | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Summary.rtf | CIQ export | Snapshot | 2026-07-24 | Low |
| Short_Interest_12m_TSLA.xls — Chart 1 with Data / Attributions (2 tabs) | CIQ tab | Trailing 12 months | 2026-07-24 | None (not solvency-relevant) |

No document in this pool is in a non-English language; all sources are English-language SEC/CIQ exports. No language-related gap exists (CLAUDE.md §27).

## 1A. External Data

Not applicable — `data/TSLA/external/` does not exist. No externally sourced documents are in this pool.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Not directly present as a standalone 10-K. Best available: 10-Q Note 8 (Debt) + Note (Commitments & Contingencies), both of which reconcile back to the audited Dec-31-2025 balance sheet | Interim filing carries forward FY2025 audited opening balances; period ended Jun-30-2026, filed Jul-23-2026 | ~0 |
| Quarterly filing | Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarter ended Jun-30-2026, filed Jul-23-2026 | ~0 |
| Debt / capital-structure export | Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, "Capital Structure Details" & "Capital Structure Summary" tabs | Instrument detail as of FY2025 (Dec-31-2025); summary ratios through Jun-30-2026; workbook sourced "Q2 2026 filed Jul-23-2026" | ~0–7 (mixed vintages within the tab) |
| Fixed-income / maturities export | Same "Capital Structure Details" tab — instrument-level maturity dates, coupons, seniority, secured status | As of Dec-31-2025 (FY2025) | ~7 |
| Cash flow statement | 10-Q (six months ended Jun-30-2026) + CIQ Financials_Quarterly.xls "Cash Flow" tab | Six months ended Jun-30-2026 | ~0 |
| Covenant / credit-agreement disclosure | 10-Q, Note 8 (Debt) narrative: "As of June 30, 2026, we were in material compliance with all financial debt covenants" | As of Jun-30-2026 | ~0, but no threshold/definition disclosed (see §5) |
| Credit rating report | Tesla Inc NasdaqGS TSLA Public Company Profile.rtf, "S&P Global Ratings Credit Ratings" block: Issuer Credit Rating (Local & Foreign Currency LT) BBB, Stable outlook | Rating action dated Oct-06-2022; CIQ data feed refreshed 2026-07-24 | ~45 (rating action itself is stale; only one agency in the pool — no Moody's/Fitch) |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | 10-Q, Consolidated Balance Sheets as of Jun-30-2026 (period-end derived from audited Dec-31-2025 balance sheet) [Q2 FY26 10-Q]; CIQ Financials_Quarterly.xls, Balance Sheet tab | Debt, cash, equity base |
| Debt note (amounts by type) | Y | 10-Q, Note 8 (Debt): Recourse (RCF Credit Agreement, Other) and Non-recourse (Automotive Asset-Backed Notes, etc.) with unpaid principal, net carrying value, rates, and maturities [Q2 FY26 10-Q, Note 8]; CIQ Capital Structure Details tab (instrument-level, FY2025) | The debt stack and seniority |
| Maturity schedule | Y (instrument-level, not yet aggregated into a year-by-year wall) | 10-Q Note 8 gives per-instrument maturity dates/ranges (e.g. RCF Jan-2028, Automotive ABS Jun-2027–2035); CIQ Capital Structure Details tab gives the same by instrument for FY2025/FY2024 | The maturity wall and refinancing exposure — agent 02 must aggregate these into a by-year wall |
| Cash flow statement | Y | 10-Q, Condensed Consolidated Statements of Cash Flows (six months ended Jun-30-2026) [Q2 FY26 10-Q]; CIQ Financials Cash Flow tabs (quarterly + annual) | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | 10-Q MD&A: "We had $5.00 billion of unused committed credit amounts as of June 30, 2026" [Q2 FY26 10-Q, Liquidity section]; RCF Credit Agreement shows $0 drawn / $5,000M unused committed in Note 8 table | True liquidity beyond cash |
| Interest expense detail | Y (via ratio series; income-statement interest-expense line not directly grepped but implied by CIQ EBITDA/Interest ratio series) | CIQ Financials Ratios tab: "EBITDA / Interest Exp." and "(EBITDA-CAPEX) / Interest Exp." quarterly series | Coverage ratios |
| Covenant disclosure | Partial | 10-Q, Note 8: "As of June 30, 2026, we were in material compliance with all financial debt covenants" — a compliance affirmation only, no threshold, ratio, or covenant-EBITDA definition disclosed anywhere in the pool | Headroom to a breach — not quantifiable from this pool |
| Lease detail (operating/finance) | Y | 10-Q balance sheet lines "Operating lease right-of-use assets," "Operating lease liabilities," "Finance leases" within debt table; CIQ Capital Structure Details tab: Finance Lease $223M @4.70%, Operating Lease $6,343M @5.00% (FY2025) | Debt-like obligations |
| Pension / OPEB funded status | N (not material / not disclosed) | CIQ Financials_Annual.xls, "Pension OPEB" tab is blank across all periods; no defined-benefit pension note found in 10-Q or 10-K/A text search | Off-balance-sheet obligation — appears immaterial for Tesla (no defined-benefit plan disclosed) |
| Commitments & contingencies note | Y | 10-Q, "Commitments and Contingencies" note (litigation incl. discrimination/harassment claims, product/services litigation, resale-value guarantee liabilities with stated maximum exposure) [Q2 FY26 10-Q] | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y (thin) | Public Company Profile.rtf: S&P Global Ratings, Issuer Credit Rating (Local & Foreign Currency LT) BBB, Stable, action dated 2022-10-06 | Refinancing access and cost — only one agency present, and the rating action itself is ~45 months old (only the CIQ data feed pull is current) |
| EBITDA base (for stress test) | Y | CIQ Financials Annual/Quarterly Income Statement + Ratios tabs; investor decks state Adjusted EBITDA ($4,154M Q4-2025, non-GAAP) [TSLA-Q4-2025 Update deck] | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | 10-Q cover page: Nasdaq-listed auto/energy manufacturer, Austin TX HQ, single consolidated registrant — operating company, not a financial institution, REIT, or disclosed HoldCo/OpCo structure | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | 10-Q Note 8: RCF Credit Agreement, $5,000M committed, $0 drawn, maturity Jan-2028, not a borrowing-base facility (no borrowing-base language found); separately, an uncommitted Warehouse Agreement (up to a stated $ limit, secured by financing receivables) entered Q1 2026 | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | Not disclosed anywhere in the pool — only the compliance affirmation exists | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | N / Not applicable | No HoldCo-level debt or structural-subordination disclosure found; Tesla, Inc. is the single consolidated registrant and debt issuer (China Working Capital Facility sits at a subsidiary level but is not flagged as structurally subordinated in the pool) | Structural subordination and upstreaming |
| Hedging / swaps disclosure | N | 10-Q explicitly states Tesla "do[es] not typically hedge foreign currency risk"; no interest-rate swap or hedge disclosure found in the debt note or market-risk section | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | N | Not disclosed in the data pool | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All six cross-module files exist at `analyses/TSLA_2026-07-24/business-model/` and `analyses/TSLA_2026-07-24/earnings/`. Notably, `earnings/01_historical-financials.md` already computes a strict-basis net debt series (net cash shrinking from $8.7B in FY2021 to $1.8B in FY2025, flipping to $861M of net debt on a strict basis by Jun-30-2026, while the broad basis including short-term investments still shows ~$27.4B of net cash) — the balance-sheet-survival module's `01_capital-structure-and-leverage` agent should reconcile to this existing basis-labeled figure rather than recompute independently. `business-model/10_external-dependency.md` already flags automotive (~86.5% of FY2025 revenue) as "High" consumer-cycle exposure — this should calibrate the depth of the EBITDA stress haircut in `06_downside-stress-test`.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-Q cover page: registrant address Austin, Texas [Q2 FY26 10-Q, cover page] |
| Exchange | Nasdaq Global Select Market | 10-Q cover page: "The Nasdaq Global Select Market" [Q2 FY26 10-Q, cover page]; CIQ ticker NasdaqGS:TSLA throughout |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-Q filed "pursuant to Section 13 or 15(d) of the Securities Exchange Act of 1934" [Q2 FY26 10-Q, cover page]; 10-K/A filed under Form 10-K/A Amendment No. 1 |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | 10-Q references FASB ASU adoptions (ASU 2026-02, ASU 2025-05) and ASC topics (ASC 606, ASC 460) throughout Note disclosures [Q2 FY26 10-Q] |
| Reporting currency (USD / INR / …) | USD (with disclosed foreign-currency sub-exposures: CNY for the China Working Capital Facility, EUR/CNY operating exposure) | CIQ Capital Structure Details tab: "Repayment Currency" column shows USD for most instruments, CNY for the China Working Capital Facility; 10-Q FX-sensitivity note discloses euro/yuan exposure |
| Document language(s) | English (all documents) | Confirmed across every extract in `_pool_extracts/`; no non-English source in this pool |

Downstream agents should apply standard US-filing sourcing (10-Q/10-K, DEF 14A-style disclosures) — this is not a non-US jurisdiction case, so none of the India/other-market equivalence mapping in MODULE_RULES applies here.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — instrument-level maturity data exists (10-Q Note 8 + CIQ Capital Structure Details), but it is NOT pre-aggregated into a by-year wall table; agent 02 must build it | 02, 06 | None (data present; no confidence cap needed beyond normal build effort) |
| No covenant disclosure | Y (partial) — a compliance affirmation exists but no threshold, ratio, or definition | 04, 06 | Covenant headroom = "Not assessable" (numeric headroom cannot be computed, only a binary "in compliance" statement); Overall usefulness max 75 |
| No cash flow statement | N — present (10-Q + CIQ) | 03, 04, 06 | None |
| No undrawn-facility disclosure | N — RCF $5.00B unused committed is explicitly disclosed | 03 | None |
| No interest-expense detail | N — covered via CIQ EBITDA/Interest ratio series; if the raw interest-expense dollar figure is needed and not separately itemized on the face of the income statement, proxy from the ratio series and flag | 04 | None (or minor: proxy flag only if raw $ not found on re-check) |
| No EBITDA base | N — present (CIQ + investor decks disclose Adjusted EBITDA; GAAP EBITDA constructible from CIQ Income Statement) | 06 | None |

Additional caps not in the standard six-row table above but directly supported by MODULE_RULES.md's fuller Score Cap Rules:

- **No covenant EBITDA definition / addback detail** → Covenant headroom max 60 (in addition to "Not assessable" if no threshold can be found at all).
- **Credit ratings present but thin** (single agency, S&P only; rating action dated Oct-2022, ~45 months stale) → note this explicitly to agent 99; do not infer an implied rating from the stale action date alone.
- **Hedging/swaps and change-of-control/cross-default/rating-trigger clauses undisclosed** → agent 05 (off-balance-sheet & contingencies) should state "Not disclosed in the data pool" per the module's Structural Priority & Entity Mapping hard rule, rather than assuming either a benign or adverse position.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent balance sheet (10-Q as of Jun-30-2026, rolling forward the audited Dec-31-2025 balance sheet), a detailed debt note by instrument type/rate/maturity/seniority/security (10-Q Note 8 + CIQ Capital Structure Details), and a cash flow statement (10-Q + CIQ Cash Flow tabs) are all present and recent (the 10-Q was filed one day before this triage), so leverage, liquidity, coverage, and a stress test can all be built; the one real gap — no quantified covenant threshold/definition — is a bounded, flagged cap rather than a missing pillar.
- **Sections that can run:** capital structure, maturity wall (built from instrument-level data), liquidity, coverage (proxied where raw interest-expense $ is not directly itemized), contingencies, stress test. Covenant headroom runs but is capped to a binary compliance read, not a numeric headroom, per the flag above.
- **Active partial-data caps:**
  - Covenant headroom = "Not assessable" as a numeric distance-to-breach; only a binary "in material compliance" statement is available (10-Q, Note 8) — cap Overall usefulness at max 75, cap Covenant headroom score at max 60.
  - Credit-rating read is thin: one agency (S&P, BBB/Stable) with a rating action dated Oct-2022 — treat as directionally useful but stale; do not infer forward refinancing cost purely from this rating without flagging its age.
  - HoldCo/OpCo, hedging/swaps, and change-of-control/cross-default/rating-trigger clauses are all undisclosed in this pool — agent 05 must state "Not disclosed in the data pool" for each rather than assume a position.
- **Critical missing items:** None that block the module. The single biggest quality gap is the absence of any quantified covenant threshold or covenant-EBITDA addback definition anywhere in the pool.
- **Single highest-value missing document:** The credit agreement / indenture itself (or the original FY2025 Form 10-K's full debt note, which the 10-K/A in this pool explicitly does not carry) — either would supply the actual covenant thresholds and definitions that are currently only affirmed as "in compliance," without the numbers behind that affirmation.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **Reporting standard:** US GAAP. **Period:** balance-sheet figures as of Jun-30-2026 (latest, per Q2 FY26 10-Q filed Jul-23-2026), with Dec-31-2025 (FY2025, audited) shown for comparison [Form 10-Q, Jul-23-2026, Note 8 (Debt) and Consolidated Balance Sheets]. No `ciq_facts.json` sidecar exists for this run; all Capital IQ (CIQ) figures below are read directly from the vendor workbook exports in `_pool_extracts/` and cited as such — never mislabeled as filing figures (CLAUDE.md §5).

**Basis note carried through this report (CLAUDE.md §15 / MODULE_RULES §Calculation Standards #2–3):** Tesla's Note 8 debt table (interest-bearing debt + finance leases) excludes operating lease liabilities, consistent with US GAAP (operating leases are not "debt" on the face of the balance sheet). Capital IQ's own "Total Debt" field, and `earnings/01_historical-financials.md`'s existing net-debt series, both use a **lease-inclusive** definition that adds operating lease liabilities back in. Both views are shown below; §4 and §7 state explicitly which is canonical.

---

## 1. Debt Stack

Debt Stack basis: Note 8 (Debt), interest-bearing debt + finance leases only (operating leases excluded here and shown separately in §2, per US GAAP treatment). All amounts are **net carrying value** as of June 30, 2026 unless noted; unpaid principal shown in parentheses where it differs.

| Instrument | Amount ($M) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| RCF Credit Agreement (revolver, drawn) | $0 drawn / $5,000 committed | Tesla, Inc. (recourse — general assets) | No (unsecured) | Senior | None disclosed | Jan-2028 | Floating (SOFR-based benchmark; rate n/a, undrawn) | [Q2 FY26 10-Q, Note 8]; [CIQ Financials_Annual, Capital Structure Details tab] |
| Solar Bonds / Other recourse | $2 | Tesla, Inc. (recourse) | No (unsecured, per CIQ FY2025 read) | Senior | None disclosed | Mar-2030 – Jan-2031 | Fixed, 5.45%–5.75% | [Q2 FY26 10-Q, Note 8]; [CIQ Capital Structure Details tab, FY2025 "Solar Bonds" row] |
| Automotive Asset-Backed Notes | $2,366 ($2,366 unpaid principal: $1,240 current + $1,121 LT) | Subsidiary SPE (non-recourse to Tesla, Inc.) | Yes | Senior | Financing receivables / leased-vehicle collateral | Jun-2027 – Jun-2035 | Fixed, 2.82%–5.82% | [Q2 FY26 10-Q, Note 8] |
| China Working Capital Facility | $5,888 (fully drawn; $0 unused as of Jun-30-2026, vs $1,429 unused at Dec-31-2025) | Subsidiary (Tesla China, non-recourse) | No (per CIQ FY2025 read) | Senior | Not disclosed | Sep-2026 – Mar-2027 | Floating, 2.01%–2.11% ("New Benchmark"); repayment currency CNY | [Q2 FY26 10-Q, Note 8]; [CIQ Capital Structure Details tab] |
| Energy Asset-Backed Notes | $708 | Subsidiary SPE (non-recourse; SPE "wholly owned by us and consolidated," no recourse to Tesla's other assets) | Yes | Senior | Energy-storage financing receivables | Jun-2050 – May-2052 | Fixed, 5.08%–6.35% | [Q2 FY26 10-Q, Note 8, incl. SPE recourse language] |
| Cash Equity Debt | $116 | Subsidiary (non-recourse) | Yes | Senior | Solar/cash-equity project assets | Jul-2034 | Fixed, 5.25% | [Q2 FY26 10-Q, Note 8] |
| Finance leases | $281 ($78 current + $203 LT) | Tesla, Inc. and subsidiaries | Yes | Senior | Leased equipment/assets | Various (no single date disclosed) | Fixed, ~4.70% | [Q2 FY26 10-Q, Note 8]; [CIQ Capital Structure Details tab, "Finance Lease" row] |
| **Total gross debt (debt + finance leases, narrow/GAAP basis)** | **$9,342** ($1,418 current + $7,924 LT) | — | Mixed (see rows) | Mixed | Mixed | Various through 2052 | Mixed | [Q2 FY26 10-Q, Consolidated Balance Sheets: "Current portion of debt and finance leases" $1,418 + "Debt and finance leases, net of current portion" $7,924] |

Ties out: the total above reconciles exactly to the two balance-sheet lines cited (no gap). Unpaid principal balance (before discounts/issuance-cost adjustments) totals $9,080M for debt alone [Q2 FY26 10-Q, Note 8]. As of June 30, 2026, "we were in material compliance with all financial debt covenants" — a binary compliance statement with no threshold or covenant-EBITDA definition disclosed [Q2 FY26 10-Q, Note 8] (headroom is not quantifiable from this pool — see `04_coverage-and-covenants`).

**Recourse vs. non-recourse split (structural priority):** Total recourse debt (Tesla, Inc.'s general assets) is just $2M — effectively immaterial. Non-recourse debt — recourse only to specific subsidiary/SPE assets, with "no recourse to our other assets" for creditors of those SPEs — totals $9,078M in unpaid principal, i.e. ~99.98% of Tesla's on-balance-sheet debt (ex. finance leases and the undrawn RCF) [Q2 FY26 10-Q, Note 8]. This means Tesla, Inc.'s own general-corporate-credit exposure to funded debt is close to zero; nearly all of it sits in ring-fenced financing vehicles (auto/energy ABS SPEs) or an offshore working-capital facility (China).

**Undrawn committed liquidity:** $5,000M unused committed under the RCF Credit Agreement as of Jun-30-2026 (down from $6,429M total unused committed at Dec-31-2025, which included $1,429M of then-unused China facility capacity, since fully drawn) [Q2 FY26 10-Q, Note 8; MD&A]. A separate $1,500M **uncommitted** Warehouse Agreement (entered Q1 2026, secured by financing receivables/leased-vehicle interests, $0 drawn as of Jun-30-2026) exists outside Note 8's debt table and is NOT committed liquidity [Q2 FY26 10-Q, "Warehouse Agreement"].

---

## 2. Other Debt-Like Obligations

| Obligation | Amount ($M) | Treatment | Source |
|---|---:|---|---|
| Operating leases | $6,738 total ($1,022 current + $5,716 LT) as of Jun-30-2026, up from $6,343 ($954 + $5,389) at Dec-31-2025; contractual rate 5.00% per CIQ | US GAAP (ASC 842): recognized as a right-of-use asset ($6,386M) and lease liability, kept OFF the "debt" line on the face of the balance sheet and excluded from Note 8's debt table. Capital IQ's own "Total Debt" and "Total Lease Liabilities" fields DO fold this in (treated as "Capital Lease" type, "Senior," "Secured: Yes" in the CIQ schema) — a lease-inclusive convention, not a GAAP reclassification. Material: at $6,738M this is ~42% the size of the narrow $9,342M debt-and-finance-lease figure it would sit alongside if added in | [Q2 FY26 10-Q, Consolidated Balance Sheets: "Operating lease liabilities, current portion" $1,022M (in Note 6/Accrued liabilities) and "Operating lease liabilities" $5,716M (Note 7/Other Long-Term Liabilities)]; [CIQ Financials_Annual, Capital Structure Details tab, "Operating Lease" row] |
| Pension / OPEB underfunding | Not disclosed / not material | No defined-benefit pension or OPEB note found in the 10-Q; CIQ's "Pension OPEB" tab is blank across all periods, consistent with no material plan | [Q2 FY26 10-Q, full-text search]; [CIQ Financials_Annual.xls, Pension-OPEB tab — blank] |
| Preferred equity | $0 | 100 million shares of $0.001 par-value preferred stock authorized; none issued and outstanding | [Q2 FY26 10-Q, Consolidated Balance Sheets, "Preferred stock ... no shares issued and outstanding"] |

---

## 3. Cash & Liquid Assets

| Item | Amount ($M) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $15,219 (Jun-30-2026); $16,513 (Dec-31-2025) | No (this line already excludes restricted cash — see below) | [Q2 FY26 10-Q, Consolidated Balance Sheets] |
| Short-term investments | $28,305 (Jun-30-2026); $27,546 (Dec-31-2025) | $286M of the $28,305M is "held and restricted for our insurance business" (Jun-30-2026; $254M at Dec-31-2025) — flagged, not netted out below given its small size (~1.0% of the ST-investments balance) | [Q2 FY26 10-Q, Consolidated Balance Sheets; Note 5 disclosure on insurance-restricted balances] |
| Restricted / trapped cash (flag) | $1,206 total ($496M in prepaid expenses/other current assets + $710M in other non-current assets), as of Jun-30-2026 ($389M + $714M = $1,103M at Dec-31-2025) | Yes — explicitly disclosed as restricted, held in separate balance-sheet line items, and already EXCLUDED from the $15,219M "cash and cash equivalents" headline figure (not silently netted in) | [Q2 FY26 10-Q, "Restricted Cash" note, reconciliation table] |

Foreign-currency cash: $3.80 billion of the cash/investments balance (USD-equivalent) is held in foreign currencies, primarily euros and Chinese yuan [Q2 FY26 10-Q, MD&A Liquidity section] — a currency-translation exposure, not a restriction, but relevant to how "usable" onshore-USD liquidity reads; not quantified further in this pool.

---

## 4. Gross & Net Debt

Two gross-debt definitions are shown because operating leases are material (§2). **Narrow** = Note 8 debt + finance leases (GAAP "debt" line). **Broad (lease-inclusive)** = narrow + operating lease liabilities, matching Capital IQ's own "Total Debt" field and the figure already used in `earnings/01_historical-financials.md`.

| Metric | Narrow (debt + finance leases) | Broad (+ operating leases, CIQ convention) | Source |
|---|---:|---:|---|
| Gross debt | $9,342 | $16,080 | [Q2 FY26 10-Q, Note 8 + balance sheet]; [CIQ Financials_Annual, Capital Structure Summary tab, "Total Debt," Jun-30-2026 column] |
| − Cash & equivalents | $15,219 | $15,219 | [Q2 FY26 10-Q, balance sheet] |
| **Net debt (strict, §15)** | **$(5,877)** → net CASH of $5,877 | **$861** → net DEBT of $861 | Computed; broad figure ties exactly to `earnings/01_historical-financials.md` §2 ("Total Debt $16,080M − Cash & Equivalents $15,219M = $861M net debt (strict)") |
| − Liquid short-term investments | $28,305 | $28,305 | [Q2 FY26 10-Q, balance sheet] |
| **Net debt (broad, incl. investments)** | **$(34,182)** → net CASH of $34,182 | **$(27,444)** → net CASH of $27,444 | Computed; broad-basis/broad-debt figure ties exactly to `earnings/01_historical-financials.md` and to CIQ's own "Net Debt" field (-27,444, Jun-30-2026 column, Capital Structure Summary tab) |

**Which figure is canonical:** see §7. Short version — the module designates the **broad-debt (lease-inclusive), strict-cash (§15) net debt of $861M (net debt, not net cash)** as canonical, because (a) it is the more conservative reading where two legitimate conventions disagree (CLAUDE.md §4's conservative-default rule), (b) Tesla's own vendor data (CIQ) and `earnings/01_historical-financials.md` already use this convention, so this avoids a cross-module contradiction on a load-bearing number, and (c) operating leases are large, senior, and effectively fixed financial commitments (Supercharger network, retail/office/factory space) even though US GAAP keeps them off the "debt" line. The narrow, GAAP-only figures are shown alongside for full transparency, since MODULE_RULES.md explicitly requires showing both views where leases are material.

---

## 5. Leverage Ratios

EBITDA bases: **Reported (GAAP) EBITDA** = Operating Income + D&A, TTM ended Jun-30-2026 = $10,849M [`earnings/01_historical-financials.md`, §2]. **Adjusted EBITDA (non-GAAP, company-defined)** = net income before interest, taxes, D&A, stock-based compensation, digital-assets gains/losses and the SpaceX equity-investment unrealized gain, TTM ended Jun-30-2026 = $15,322M (sum of Q3'25 $4,227M + Q4'25 $4,154M + Q1'26 $3,668M + Q2'26 $3,273M) [TSLA-Q2-2026-Update.pdf, p.24, "Adjusted EBITDA – TTM (non-GAAP)" row].

| Ratio | On Reported (GAAP) EBITDA ($10,849M TTM) | On Adjusted EBITDA ($15,322M TTM) | Source |
|---|---:|---:|---|
| Gross debt / EBITDA — narrow ($9,342M) | 0.86x | 0.61x | Computed |
| Gross debt / EBITDA — broad, lease-incl. ($16,080M) | 1.48x | 1.05x | Computed. (CIQ's own "Total Debt/EBITDA" field shows 1.635x LTM Jun-30-2026 [CIQ Capital Structure Summary tab] — the ~11% gap versus the 1.48x above is because CIQ's own denominator EBITDA differs slightly from the company-figure-built $10,849M used here; see the Q3/Q4-2025 operating-income reconciliation flag in `earnings/01_historical-financials.md` for the source of that gap.) |
| Net debt / EBITDA — canonical (broad debt, strict cash: net debt $861M) | 0.08x | 0.06x | Computed |
| Net debt / EBITDA — broad debt, broad cash (net cash $27,444M) | Not meaningful (net cash) | Not meaningful (net cash) | Computed |
| Net debt / EBITDA — narrow debt, strict cash (net cash $5,877M) | Not meaningful (net cash) | Not meaningful (net cash) | Computed |
| Debt / capital — narrow | 9.7% ($9,342M / $96,200M) | (n/a) | Computed; capital = gross debt + total stockholders' equity $86,858M [Q2 FY26 10-Q, balance sheet] |
| Debt / capital — broad | 15.5% ($16,080M / $103,599M) | (n/a) | [CIQ Capital Structure Summary tab, "Total Debt" % of "Total Capital," Jun-30-2026 column: 15.52%] |
| Debt / equity — narrow | 10.8% ($9,342M / $86,858M) | (n/a) | Computed |
| Debt / equity — broad | 18.5% ($16,080M / $86,858M) | (n/a) | Computed |

**Cyclicality overlay (required — automotive flagged "High" consumer-cycle exposure):** `business-model/10_external-dependency.md` flags automotive (~86.5% of FY2025 revenue) as "High" consumer-cycle exposure [business-model/10_external-dependency.md, §Consumer cycle row]. Per MODULE_RULES.md, leverage is also shown on a normalized/mid-cycle EBITDA:

| Basis | GAAP EBITDA used | Gross debt (broad) / EBITDA | Net debt (canonical, $861M) / EBITDA | Label |
|---|---:|---:|---:|---|
| Latest TTM (Jun-30-2026) | $10,849M | 1.48x | 0.08x | Latest |
| 5-year average, FY2021–FY2025 (mid-cycle/normalised) | $12,751M (= average of $9,434M, $17,235M, $13,558M, $13,027M, $10,503M) [`earnings/01_historical-financials.md`, §1 Annual Financial Table] | 1.26x | 0.07x | Mid-cycle / normalised |

**Note on direction:** Tesla's FY2022 EBITDA ($17,235M) was the actual cyclical peak in this five-year window, not the latest period. The latest TTM EBITDA ($10,849M) sits *below* the 5-year average, not above it — so unlike the usual warning that a "latest/peak" EBITDA flatters leverage, here leverage computed on the latest TTM figure is already the *more conservative* (higher) of the two reads. Both remain low in absolute terms (under 1.5x gross, near-zero net) given the debt stack's small size relative to EBITDA either way.

---

## 6. Leverage Trend

Basis: net debt (canonical — broad/lease-inclusive gross debt, strict/cash-only netting, §15) and reported GAAP EBITDA, reconciled to `earnings/01_historical-financials.md`.

| Metric | FY2023 | FY2024 | FY2025 | Latest (Jun-30-2026, TTM EBITDA) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, broad-debt basis) | $(6,825)M net cash | $(2,516)M net cash | $(1,794)M net cash | $861M net **debt** | Rising (net cash cushion shrinking, flipped to net debt) |
| Net debt / EBITDA | (0.50x) | (0.19x) | (0.17x) | 0.08x | Rising |

Memo — broad-cash basis (netting in short-term investments) for contrast: net cash of $19,521M (FY2023) → $22,940M (FY2024) → $29,340M (FY2025) → $27,444M (latest) — still deeply net cash on this view, though it too has narrowed slightly from the FY2025 peak [`earnings/01_historical-financials.md`, §1 basis-labels paragraph; CIQ Capital Structure Summary tab].

Leverage is rising on the strict (cash-only) basis, driven by three visible factors: (1) the China Working Capital Facility going from $2,740M drawn (Dec-31-2024) to $4,288M (Dec-31-2025) to fully drawn at $5,888M (Jun-30-2026), funding Chinese-subsidiary working capital [Q2 FY26 10-Q, Note 8; CIQ Capital Structure Details tab]; (2) operating lease liabilities growing from $6,343M (Dec-31-2025) to $6,738M (Jun-30-2026) as the Supercharger/retail/office footprint expands; and (3) cash & equivalents alone declining slightly ($16,513M → $15,219M) even as a capex ramp (Q2 2026 capex $5,789M, +142% QoQ per `earnings/01_historical-financials.md`) was partly financed rather than fully self-funded — the 10-Q's financing-activities line shows a swing to a $1.21B net inflow (from a $554M outflow a year earlier), "primarily due to a $1.63 billion increase in proceeds from issuances of debt" [Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources]. None of this is large in absolute terms — Tesla remains net cash on every basis that either excludes leases or nets in short-term investments — but the direction is unambiguous.

---

## 6A. HoldCo / OpCo & Structural Subordination

Not applicable in the classic holding-company sense — Tesla, Inc. is the single consolidated registrant and no material HoldCo-level debt or structural-subordination disclosure exists in this pool [Solvency Data Triage, §3]. However, a related structural point is material and worth flagging for downstream agents:

| Item | Evidence | Why It Matters |
|---|---|---|
| Recourse vs. non-recourse split within Tesla's own debt stack | Just $2M of debt is recourse to Tesla, Inc.'s general assets; ~$9,078M (unpaid principal, ex. finance leases/undrawn RCF) is non-recourse — issued by subsidiary SPEs (Automotive/Energy Asset-Backed Notes) or an offshore subsidiary (China Working Capital Facility), each of which explicitly has "no recourse to our other assets" for its creditors [Q2 FY26 10-Q, Note 8] | Tesla, Inc.'s parent-level exposure to funded debt is close to zero; the debt is ring-fenced against specific receivables/collateral pools, which is a source of resilience for the parent but means those asset pools are not available to satisfy other creditors |
| Upstreaming constraints | Not disclosed in the data pool for the China Working Capital Facility or the SPE structures | Cannot assess whether cash generated offshore/in the SPEs can be freely upstreamed; flagged as a gap, not assumed benign |
| Material restricted / trapped cash | $1,206M restricted cash disclosed separately (§3), already excluded from the headline cash figure | Net debt figures above are not overstated by this — restricted cash was never included in the $15,219M cash balance netted out above |

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt:** $16,080M (broad, lease-inclusive — canonical). Memo: $9,342M on a narrow, GAAP-only debt-and-finance-lease basis. [Q2 FY26 10-Q, Note 8 + balance sheet; CIQ Capital Structure Summary tab]
- **Net debt:** **$861M net debt (canonical basis: broad/lease-inclusive gross debt minus cash & equivalents only — the §15 strict basis).** Reason for using the broad debt definition as canonical: it is the more conservative reading (CLAUDE.md §4) and matches the convention already established in `earnings/01_historical-financials.md` and Capital IQ's own fields, avoiding a cross-module contradiction. Also shown, broad-cash basis (netting in $28,305M of short-term investments): **net cash of $27,444M** — label this "broad" whenever quoted; it is NOT the canonical figure. Memo (narrow debt, strict cash): net cash of $5,877M.
- **Cash & liquid investments:** Cash & equivalents $15,219M + short-term investments $28,305M = $43,524M combined (of which $286M of the investments is restricted for the insurance business). Restricted cash of $1,206M is separate and already excluded from all figures above.
- **EBITDA base used:** Reported (GAAP) EBITDA, TTM ended Jun-30-2026 = $10,849M (Operating Income + D&A), the **latest** period figure, which in Tesla's case sits *below* its own 5-year average (mid-cycle/normalised GAAP EBITDA = $12,751M, FY2021–FY2025 average) — i.e., latest is not the cyclical peak here; FY2022 ($17,235M) was. Adjusted (non-GAAP) EBITDA, TTM = $15,322M, is also shown throughout for the reported-vs-adjusted comparison required by CLAUDE.md §15.
- **Net debt / EBITDA (canonical net debt of $861M):** 0.08x on reported GAAP EBITDA ($10,849M); 0.06x on adjusted EBITDA ($15,322M); 0.07x on mid-cycle/normalised GAAP EBITDA ($12,751M). All three reads are near-zero.
- **Reporting currency:** USD.

**Net-cash framing (CLAUDE.md §24, Filter 3; MODULE_RULES.md Core Principle 8):** Despite the canonical net-debt figure just tipping positive ($861M) on the strictest cash-only, lease-inclusive basis, Tesla remains overwhelmingly net cash on every other defensible reading — $5,877M net cash excluding leases, and $27,444M–$34,182M net cash once short-term investments are netted in. This is a strategic-flexibility asset, not a "lazy balance sheet": it funds Tesla's stated intent to "manage the business such that we maintain a strong balance sheet and sufficient liquidity" while ramping AI/Optimus/semiconductor capex [Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources], and it removes near-term refinancing dependence. This module does not editorialize that Tesla is "under-levered" or should add debt to lower its cost of capital — that framing is rejected per CLAUDE.md §24.

**Caveats propagated downstream:**
- Covenant thresholds and covenant-EBITDA definitions are not disclosed anywhere in this pool — only a binary "in material compliance" statement exists. `04_coverage-and-covenants` should treat headroom as "Not assessable" numerically.
- The 5-year mid-cycle/normalised EBITDA of $12,751M is a straightforward arithmetic average of the company's own reported figures — a computed reference point, not a company-disclosed "mid-cycle" estimate; treat as directional.
- Adjusted EBITDA (non-GAAP) figures above are the company's own non-GAAP measure (excludes SBC, digital-assets gains/losses, SpaceX equity-investment unrealized gain, certain tax items) — always shown alongside the GAAP figure per CLAUDE.md §15, never used alone.
- The credit rating on file (S&P Global Ratings, Issuer Credit Rating BBB, Stable) is a single agency with a rating action dated Oct-06-2022 — ~45 months old as of this report's date; only the CIQ data-feed pull (2026-07-24) is current, not the rating action itself [`Tesla Inc NasdaqGS TSLA Public Company Profile.rtf`, S&P Global Ratings block]. Peer benchmarking (CIQ Credit Health Panel, 31 automotive peers, LTM Jun-30-2026) scores Tesla "Top" overall, "Top" on Solvency, "Top" on Liquidity, and "Above Average" on Operational among the peer set [`Tesla Inc NasdaqGS TSLA Credit Health Panel.xls`, Summary tab].



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **Basis:** Note 8 (Debt) of the Form 10-Q for the quarter ended June 30, 2026 (filed Jul-23-2026), interest-bearing debt + finance leases only (narrow/GAAP basis, matching `01_capital-structure-and-leverage.md`'s $9,342M total gross debt on that basis; the operating-lease-inclusive "broad" $16,080M figure is `01`'s canonical net-debt basis but operating leases carry no debt-note maturity schedule and are excluded from this wall, consistent with US GAAP keeping them off the debt line). All dollar amounts below are **net carrying value** (current + long-term), which reconciles exactly to `01`'s $9,342M total ($1,418M current + $7,924M long-term) [Q2 FY26 10-Q, Note 8].

---

## 1. Maturity Schedule

Tesla's debt note does **not** publish a year-by-year (Year 1 / 2 / 3 / 4 / 5 / Thereafter) maturity table — only a current-vs-long-term split on the balance sheet, plus an instrument-level contractual maturity date or date-range for each facility. This section first reproduces the GAAP balance-sheet split (the literal "within 12 months / thereafter" anchor), then a second table translates the instrument-level contractual dates into a truer time-based view, because the two views diverge sharply for one instrument (flagged below).

### 1a. GAAP balance-sheet classification (current vs long-term)

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (GAAP current, i.e. by Jun-30-2027) | $1,418M | 15.2% | Automotive Asset-Backed Notes $1,240M; Energy Asset-Backed Notes $90M; Cash Equity Debt $10M; Finance leases $78M | [Q2 FY26 10-Q, Note 8] |
| Year 2 | Not separately disclosed | n/a | No by-year breakdown published beyond current/long-term | [Q2 FY26 10-Q, Note 8] |
| Year 3 | Not separately disclosed | n/a | " | " |
| Year 4 | Not separately disclosed | n/a | " | " |
| Year 5 | Not separately disclosed | n/a | " | " |
| Thereafter (GAAP long-term, undifferentiated by year) | $7,924M | 84.8% | China Working Capital Facility $5,888M (see flag below); Automotive Asset-Backed Notes (LT portion) $1,121M, contractual range Jun-2027–Jun-2035; Energy Asset-Backed Notes (LT portion) $610M, contractual range Jun-2050–May-2052; Cash Equity Debt (LT portion) $100M, Jul-2034; Solar Bonds/Other $2M, Mar-2030–Jan-2031; Finance leases (LT portion) $203M, no single date disclosed | [Q2 FY26 10-Q, Note 8] |
| **Total** | **$9,342M** | **100%** | — | [Q2 FY26 10-Q, Note 8 + Consolidated Balance Sheets] |

Ties out exactly to `01_capital-structure-and-leverage.md`'s narrow gross-debt figure ($9,342M = $1,418M current + $7,924M long-term). No reconciling item.

### 1b. Reclassification flag — the GAAP split materially understates the true near-term wall

The **China Working Capital Facility** ($5,888M net carrying value, fully drawn, 63.0% of total gross debt) carries a **contractual maturity of September 2026 – March 2027** — 2 to 9 months from the Jun-30-2026 balance-sheet date — yet is booked entirely as **long-term** ($0 current / $5,888M long-term). Note 8's own footnote explains why: *"As we have the intent and ability to refinance the loan on a long-term basis, we classify it as Debt and finance leases, net of current portion in the consolidated balance sheets"* [Q2 FY26 10-Q, Note 8, footnote (2)]. This is a standard, permitted US GAAP presentation (ASC 470-10-45) when management has intent and ability to refinance — but it is a **classification judgment, not evidence that a refinancing is secured**. No binding replacement-financing agreement is disclosed anywhere in the pool; only the general "intent and ability" assertion exists.

### 1c. Contractual-maturity view (before the ASC 470-10-45 reclassification)

| Window (contractual, from Jun-30-2026) | Amount | % of Total Debt | Driver |
|---|---:|---:|---|
| ≤ 12 months (by Jun-2027) | **$7,306M** | **78.2%** | GAAP-current $1,418M **+ China Working Capital Facility $5,888M** (contractual maturity Sep-2026–Mar-2027, reclassified long-term per §1b) |
| 13–24 months | Indeterminate — no incremental amount separately disclosed | n/a | The Automotive Asset-Backed Notes' contractual range (Jun-2027–Jun-2035) begins inside this window, but the $1,121M long-term tranche is not itemized by year |
| Beyond 24 months, through 2035 | Up to $1,223M ($1,121M Automotive ABS LT + $100M Cash Equity Debt LT (Jul-2034) + $2M Solar Bonds (Mar-2030–Jan-2031)) | up to 13.1% | Timing within the Automotive ABS range not disclosed |
| 2050–2052 | $610M | 6.5% | Energy Asset-Backed Notes (LT portion) |
| **Total** | **$9,342M** | **100%** | |

---

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | ~3.7 years — computed from instrument-level contractual dates, using the midpoint of each date range, amount-weighted by net carrying value; **excludes** $281M of finance leases (no single maturity date disclosed) and the undrawn RCF. *Inference, not from filings* (the midpoint-of-range method is an estimation, not a company-disclosed WAM). Memo: excluding the China facility, the remaining $3,173M of debt has an estimated WAM of ~9.5 years (pulled long by the 2050–2052 Energy ABS tail) — the ~3.7-year headline figure is almost entirely a function of the China facility's near-term contractual date. |
| % due within 12 months | **78.2%** on a contractual basis ($7,306M / $9,342M — see §1c); **15.2%** on the GAAP balance-sheet "current" classification ($1,418M / $9,342M — see §1a). The 63-point gap is the China Working Capital Facility reclassification (§1b). |
| % due within 24 months | ≥ 78.2% (same floor as the 12-month figure); the true figure is higher but not quantifiable — the Automotive Asset-Backed Notes' Jun-2027–Jun-2035 range enters this window with no by-year split disclosed. **Confidence: moderate** — instrument-level data exists, but the multi-tranche ABS split within its range is not itemized. |
| % due within 36 months | ≥ 78.2% (same floor and limitation as above) |
| Largest single maturity year (and amount) | The **Sep-2026 – Mar-2027 window: $5,888M (63.0% of total gross debt)** — entirely the China Working Capital Facility. No other single year or window exceeds low single digits of total debt. |

---

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | 37.0% ($3,454M / $9,342M): Solar Bonds $2M (5.45%–5.75%); Automotive Asset-Backed Notes $2,361M (2.82%–5.82%); Energy Asset-Backed Notes $700M (5.08%–6.35%); Cash Equity Debt $110M (5.25%); Finance leases $281M (~4.70%) | [Q2 FY26 10-Q, Note 8] |
| Floating-rate share | 63.0% ($5,888M / $9,342M): China Working Capital Facility, 2.01%–2.11% referencing an unspecified "New Benchmark," CNY-denominated. Memo: the RCF Credit Agreement ($5,000M committed) is also floating (SOFR-based) but $0 drawn — a contingent floating exposure only if drawn, not counted in the % above | [Q2 FY26 10-Q, Note 8] |
| Weighted-average coupon — all debt (rate-midpoint basis) | ~3.02% | Computed: amount-weighted average of each instrument's stated rate-range midpoint. Pulled down heavily by the China facility's 2.06% midpoint on 63% of the stack. |
| Weighted-average coupon — USD fixed-rate instruments only (ex-China facility) | ~4.67% | Computed, same method, on the $3,454M fixed-rate USD subset |
| Current market refi rate — USD, ~5yr tenor, BBB-unsecured proxy | ~5.3%–5.4% (5-Year US Treasury yield 4.41% as of 2026-07-22, + ICE BofA BBB US Corporate Index option-adjusted spread of ~0.94%–0.97%, Jul-2026) | Web: FRED, 5-Year Treasury Constant Maturity Rate, 2026-07-22 (indicative, unverified); Web: FRED, ICE BofA BBB US Corporate Index OAS, Jul-2026 (indicative, unverified) |
| Current market refi rate — China, 1-year benchmark proxy | 1-Year Loan Prime Rate (LPR) 3.00%, unchanged for a 14th straight month as of Jul-2026 | Web: PBOC 1-Year Loan Prime Rate, reported Jul-20-2026 (indicative, unverified) |
| Estimated refi cost step-up — USD fixed debt vs. BBB-unsecured proxy | ~+68 bps (4.67% → ~5.35%) | Computed. Caveat: most of this USD fixed debt (Automotive/Energy Asset-Backed Notes) is **secured**, asset-backed paper, which typically prices tighter than an unsecured BBB corporate-bond proxy — this may overstate the true step-up for those instruments specifically. |
| Estimated refi cost step-up — China Working Capital Facility vs. 1yr LPR | ~+94 bps (2.06% → 3.00%) | Computed. Caveat: the facility's actual pricing basis ("New Benchmark") and bank spread are not itemized beyond the stated 2.01%–2.11% range, so the true renewal rate is not precisely derivable from this pool — the LPR comparison is a directional proxy only. |

Tesla does not disclose interest-rate hedges or swaps; the 10-Q states Tesla "do[es] not typically hedge foreign currency risk" and no interest-rate hedge is disclosed in the debt note or market-risk section [`00_solvency-data-triage.md`, §3]. The 63.0% floating share (all China facility) is therefore unhedged exposure as disclosed.

---

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities (≥$7,306M contractual floor) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $15,219M (Jun-30-2026) | [Q2 FY26 10-Q, Consolidated Balance Sheets] |
| Forecast FCF (recent run-rate, labeled) | $5,762M TTM (ended Jun-30-2026); labeled run-rate, not a forecast — and volatile quarter to quarter: Q2-2026 alone was **negative** $(1,092)M, driven by a capex ramp (Q2-2026 capex $5,789M, +142% QoQ) | [`earnings/01_historical-financials.md`, §2 and §3] |
| Revolver availability | $5,000M committed, undrawn (RCF Credit Agreement, matures Jan-2028, general-corporate-purpose, unsecured). Not confirmed in this pool as specifically earmarked or eligible to repay/refinance the China facility — Note 8 footnote (1) references "restrictions on draw-down or use for general corporate purposes" tied to the FY2025 10-K's own debt note, which is not itself in this data pool, so any facility-specific restriction cannot be confirmed either way | [Q2 FY26 10-Q, Note 8] |
| Asset-sale proceeds | Not disclosed / not announced | — |
| New debt issuance | Not committed or announced for this specific facility. Note 8's footnote (2) states Tesla has "the intent and ability to refinance the loan on a long-term basis" — this is an accounting assertion supporting the balance-sheet classification, **not** a disclosed signed refinancing agreement or committed replacement facility. The China facility's own history is directionally supportive of continued market access: it grew from $2,740M drawn (Dec-31-2024) to $4,288M (Dec-31-2025) to fully drawn $5,888M (Jun-30-2026), i.e., Tesla has successfully expanded and re-drawn this facility repeatedly over the past 18 months [`01_capital-structure-and-leverage.md`, §6; Q2 FY26 10-Q, Note 8] | [Q2 FY26 10-Q, Note 8, footnote (2)] |

**Is the near-term wall covered, and by what?** In dollar terms, yes with a wide margin: cash ($15,219M) plus the committed undrawn RCF ($5,000M) total $20,219M against the $7,306M contractual 12-month wall — roughly 2.8x coverage — even before counting the $5,762M of TTM FCF. But the wall's single largest component, the $5,888M China Working Capital Facility, is a China-market instrument: refinancing it depends on continued access to Chinese working-capital bank credit (or PBOC-benchmark-linked facilities), not on the US capital markets that the RCF and cash sit in, and converting US-based cash/RCF proceeds into CNY to substitute for it would involve FX conversion that is not confirmed as a pre-arranged contingency plan in this pool. The facility is non-recourse to Tesla, Inc.'s general assets [`01_capital-structure-and-leverage.md`, §1, §6A], so a failure to roll it would primarily strain the China subsidiary's working capital rather than trigger a parent-level default — and no cross-default or change-of-control provision tying the two together is disclosed in the data pool. S&P rates Tesla's issuer credit BBB/Stable, but that rating action is dated Oct-06-2022 (~45 months old as of this report) and is the only rating agency represented in the pool — a thin, stale signal on current market access [`00_solvency-data-triage.md`, §2]. Of the 63.0% floating-rate exposure (all the China facility), a further benchmark increase would reprice the entire $5,888M balance, though the rate is low in absolute terms (2.01%–2.11%) so the dollar sensitivity per 100bps is roughly $59M/year.

**Verdict: refinanceable in most markets.** Parent-level liquidity comfortably covers the contractual wall in dollar terms, and the China facility's own draw-up history shows repeated, successful re-access to that specific credit line — but no binding refinancing agreement is disclosed, the facility's renewal depends on a market (Chinese bank credit) distinct from where Tesla's cash cushion sits, and the credit-rating support for that read is thin and stale. This falls short of "self-funded / low refi risk" because the stated basis for the long-term classification is an unevidenced management assertion, not a locked-in facility.

---

## 5. Refinancing Read

The maturity wall Tesla's balance sheet shows (15.2% due within 12 months) is not the real one: on a contractual basis, **78.2% of Tesla's $9,342M gross debt ($7,306M) is due within 12 months of Jun-30-2026**, almost entirely because the $5,888M China Working Capital Facility — 63% of total debt, fully drawn — contractually matures Sep-2026–Mar-2027 but is booked long-term purely on management's stated "intent and ability to refinance," with no disclosed binding agreement behind it. The estimated refinancing cost step-up is modest where it can be measured — roughly +68bps on the USD fixed-rate ABS/lease debt (weighted coupon ~4.67% vs. an indicative ~5.35% BBB-unsecured 5-year benchmark) and roughly +94bps on the China facility (2.06% vs. the 3.00% 1-year LPR) — so cost is not the central risk here; concentration and disclosure quality are. The single biggest refinancing risk is that nearly two-thirds of Tesla's total debt sits in one China-market working-capital line with no committed replacement financing on file, rather than a laddered, diversified maturity profile. On the explicit "market closure" test (no new unsecured issuance for 12 months): Tesla survives — cash ($15,219M) plus the committed, undrawn RCF ($5,000M) together cover the $7,306M contractual 12-month wall roughly 2.8x over, assuming the RCF can in fact be drawn for this purpose (not fully confirmed — general-corporate-purpose language exists, but instrument-specific restrictions referenced in the FY2025 10-K's debt note are not in this pool, so this is a labeled assumption, not a certainty).

---

**Partial-data note:** an instrument-level maturity schedule is disclosed (Note 8, per-instrument dates/ranges), so the §1a/§2 12-month and largest-maturity-window figures are high confidence. What is **not** disclosed is a true year-by-year (Year 2 / 3 / 4 / 5) breakdown for the multi-tranche Automotive and Energy Asset-Backed Notes, whose contractual dates are given only as ranges (Jun-2027–Jun-2035 and Jun-2050–May-2052 respectively). The 24-month and 36-month figures in §2 are therefore stated as floors ("≥78.2%"), not exact percentages, and carry moderate (not high) confidence.



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **Period:** balance-sheet figures as of Jun-30-2026 [Form 10-Q, Jul-23-2026], next-12-month maturities and rate detail carried from `02_maturity-wall-and-refinancing.md`.

---

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $15,219M | Y | Already excludes restricted cash (see below) | [Q2 FY26 10-Q, Consolidated Balance Sheets] |
| Liquid short-term investments | $28,305M | Y, less $286M | $286M of this balance is "held and restricted for our insurance business" — excluded from usable total below; the remaining $28,019M is unrestricted | [Q2 FY26 10-Q, Consolidated Balance Sheets; Note 5] |
| Revolver / facilities (commitment) | $5,000M | — | RCF Credit Agreement, Tesla, Inc. (recourse, unsecured), matures Jan-2028, floating (SOFR-based) if drawn | [Q2 FY26 10-Q, Note 8] |
| Revolver availability (if disclosed) | $5,000M | Y | $0 drawn as of Jun-30-2026; not a borrowing-base facility (no borrowing-base or reserve language found in the pool), so the full commitment is treated as available, general-corporate-purpose | [Q2 FY26 10-Q, Note 8; MD&A Liquidity section] |
| **Total usable liquidity** | **$48,238M** | | $15,219 + $28,019 (ex-restricted) + $5,000 | Computed |

**Excluded / flagged, not counted in the headline figure:**
- **Warehouse Agreement, $1,500M** — **uncommitted**, secured by financing receivables/leased-vehicle interests, entered Q1 2026, $0 drawn as of Jun-30-2026. Excluded entirely per MODULE_RULES §4 (committed liquidity only) [Q2 FY26 10-Q, "Warehouse Agreement"].
- **Restricted / trapped cash, $1,206M** ($496M in prepaid expenses/other current assets + $710M in other non-current assets) — already excluded from the $15,219M cash headline, not double-counted here [Q2 FY26 10-Q, "Restricted Cash" note].
- **Foreign-currency cash, ~$3.80bn** of the cash/investments balance (USD-equivalent) is held in euros and Chinese yuan — a currency-translation exposure, not a restriction, but relevant to how freely "usable" onshore-USD liquidity converts; not quantified further in this pool [Q2 FY26 10-Q, MD&A Liquidity section].

Reporting currency: USD. No partial-data cap applies to this section — undrawn committed capacity and cash flow data are both disclosed (per `00_solvency-data-triage.md` §5).

---

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (contractual basis, from `02`) | $7,306M | `02_maturity-wall-and-refinancing.md` §1c — includes the $5,888M China Working Capital Facility, which is booked GAAP long-term on management's "intent and ability to refinance" but contractually matures Sep-2026–Mar-2027. Memo: the GAAP-current classification alone is only $1,418M — see the "GAAP-current memo" row in §3 below. |
| Cash interest | $292M | FY2025 actual cash interest paid, used as a proxy for the next 12 months (no raw TTM interest-expense $ figure is separately itemized in this pool) [`earnings/06_earnings-quality.md` §1] — labeled proxy |
| Maintenance capex | $12,923M (TTM total capex, used as a proxy — flagged) | `earnings/01_historical-financials.md` §3. Tesla does not split maintenance vs. growth capex, so total capex is used as the conservative proxy line here. This likely overstates "maintenance-only" spend but likely **understates** true forward total capex: the CFO guided full-year 2026 capex to exceed $25bn (more than double FY2025's $8,527M) and stated capex "will grow for the next two to three years" to fund robotaxi, Optimus, a semiconductor fab, solar manufacturing and AI compute [`earnings/06_earnings-quality.md` §1; Tesla Q2 2026 Earnings Call, Jul-22-2026] |
| Committed dividends / buybacks | $0 | Tesla has paid $0 in dividends and repurchased $0 of shares in any year since at least FY2017 [`business-model/business-model_dossier.md`, capital-allocation row; CIQ Financials_Annual.xls, Cash Flow tab] — no discretionary capital-return commitment to fund |
| **Total near-term uses (gross-obligations basis)** | **$20,521M** | $7,306 + $292 + $12,923 + $0 |

Memo — total near-term uses using the **GAAP-current** ($1,418M) maturity figure instead of the contractual wall: $1,418 + $292 + $12,923 + $0 = **$14,633M**.

---

## 3. Runway

**Basis choice:** MODULE_RULES §8 calls for the **net-of-FCF basis** when FCF is "meaningful/positive" and the **gross-obligations basis** when FCF is "negative or unreliable." TTM FCF ($5,762M, ended Jun-30-2026) is positive on a trailing basis, but it is **flagged as unreliable as a forward run-rate**: quarterly FCF turned negative for the first time in eight quarters in Q2 2026 (−$1,092M), driven by a capex ramp the company has explicitly guided will continue and intensify — full-year 2026 capex is guided to exceed $25bn, more than double FY2025's $8,527M, with growth continuing "for the next two to three years" [`earnings/06_earnings-quality.md` §1; Tesla Q2 2026 Earnings Call, Jul-22-2026]. Given that disclosed, forward-guided step-change, this report leads with the **gross-obligations basis** as the more conservative, decision-relevant read (CLAUDE.md §4 conservative-default rule; MODULE_RULES Core Principle 7), and shows net-of-FCF as a labeled memo.

### Primary — Gross-obligations basis

| Metric | Value |
|---|---:|
| Total usable liquidity | $48,238M |
| Annual FCF | Not subtracted on this basis (deliberately ignoring operating inflows, per MODULE_RULES §8) |
| Basis used | Gross-obligations (FCF flagged unreliable given guided capex step-up) |
| Annual net cash burn = 12-month uses (no FCF subtraction) | $20,521M |
| Monthly net cash burn = $20,521M ÷ 12 | $1,710.1M |
| **Liquidity runway (months) = $48,238M ÷ $1,710.1M** | **≈ 28.2 months** |

Memo, using GAAP-current maturities ($1,418M) instead of the contractual wall ($7,306M): total uses $14,633M → monthly burn $1,219.4M → runway ≈ **39.6 months**.

### Memo — Net-of-FCF basis (TTM FCF, labeled backward-looking, not a forward run-rate)

| Metric | Value |
|---|---:|
| Total usable liquidity | $48,238M |
| Annual FCF (TTM, ended Jun-30-2026) | $5,762M — labeled run-rate, **not** a forecast; flagged unreliable given guided FY2026 capex >$25bn [`earnings/01_historical-financials.md` §2] |
| Basis used | Net-of-FCF (memo only) |
| Annual net cash burn = (12-month contractual maturities $7,306M + $0 dividends/buybacks) − FCF $5,762M | $1,544M |
| Monthly net cash burn = $1,544M ÷ 12 | $128.7M |
| **Liquidity runway (months) = $48,238M ÷ $128.7M** | **≈ 375 months (~31 years)** — functionally unconstrained |

Memo within the memo: against GAAP-current maturities alone ($1,418M), TTM FCF more than covers the 12-month wall — annual net burn is negative (−$4,344M), i.e., an **annual surplus of $4,344M**, not a finite runway, on that combination.

Both readings point the same direction — Tesla's liquidity is not the binding constraint over the next 12 months even under the conservative gross-obligations basis (28.2 months, over 2 years of coverage). The wide spread between the two bases (28 months vs. ~31 years) is entirely a function of whether TTM FCF is trusted to hold given the guided capex ramp — not a data-quality problem in the liquidity figure itself.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital shows real, disclosed seasonality (Q1 is consistently the weakest revenue quarter, 20–24% of annual revenue, with days-sales-outstanding rising 16.7% then 20.4% YoY in FY2024–FY2025 [`earnings/01_historical-financials.md` §5; `earnings/06_earnings-quality.md` §3]), but **no disclosed peak-quarter cash-usage or seasonal working-capital-build figure exists in this pool**. Peak working-capital need not disclosed — runway may be overstated. Separately, the capex ramp itself is a disclosed, quantified "seasonal-like" cash event already captured in the gross-obligations uses line above (the guided FY2026 capex step-up), which is the larger and better-evidenced near-term cash-usage risk relative to ordinary working-capital seasonality.

---

## 4. Sources & Uses Bridge

Internal sources comfortably cover the next 12 months on any reading: usable liquidity of $48,238M is 6.6x the conservative contractual 12-month debt wall ($7,306M) and 2.4x the full gross-obligations bucket ($20,521M) including the guided capex ramp — no external access (refinancing, asset sale, or facility drawdown beyond the RCF already counted) is required to survive the next 12 months. The overwhelming majority of the runway is **already-in-hand liquidity** ($48,238M of cash, unrestricted short-term investments, and the undrawn RCF), not FCF that must materialize: even on the most conservative gross-obligations basis, which assumes zero operating cash inflow is netted against obligations, the runway is still ≈28 months. FCF only extends the runway further (to the multi-decade net-of-FCF memo figure above) if the TTM $5,762M run-rate holds — which is exactly the assumption flagged as unreliable given the guided capex step-up, so it should not be relied on for the headline read.

---

## 5. Liquidity Read

Tesla's liquidity runway is at minimum ≈28 months (2.3 years) on the conservative gross-obligations basis — usable liquidity of $48,238M (cash $15,219M + unrestricted short-term investments $28,019M + the undrawn $5,000M RCF) against $20,521M of annual near-term obligations (the $7,306M contractual 12-month debt wall, cash interest, total capex used as a maintenance-capex proxy, and $0 of dividends/buybacks) — and this floor does not depend on FCF materializing at all. The runway depends almost entirely on liquidity already on the balance sheet, not on cash flow that has to show up; even if FCF collapses to zero as the company ramps capex toward its guided $25bn+ for FY2026, Tesla still has over two years of coverage before external funding would be needed. The single biggest liquidity risk is not a shortfall in dollars but a concentration and reliability issue already flagged upstream: the largest single line inside the 12-month uses figure is the $5,888M China Working Capital Facility, whose GAAP long-term classification rests on an unevidenced "intent and ability to refinance" assertion rather than a committed replacement facility [`02_maturity-wall-and-refinancing.md` §1b, §4] — and separately, TTM FCF ($5,762M) is not a reliable guide to 2026's actual free cash flow given the disclosed, guided capex step-up, so any read that leans on FCF holding (the net-of-FCF memo above) should be treated with caution even though the dollar cushion makes the distinction largely academic here.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — TSLA

**Basis carried from `01_capital-structure-and-leverage.md`:** reporting currency USD, US GAAP, figures in millions. Debt and EBITDA base: canonical net debt $861M (broad/lease-inclusive gross debt of $16,080M minus cash & equivalents of $15,219M, strict §15 cash basis) [`01_capital-structure-and-leverage.md`, §7]; TTM period ended Jun-30-2026 throughout this report unless stated otherwise.

---

## 1. Coverage Ratios

TTM figures = Q3 2025 + Q4 2025 + Q1 2026 + Q2 2026 (period ended Jun-30-2026), matching `earnings/01_historical-financials.md` §2. All ratios computed with a Python snippet (shown in the agent's working, reproducible from the inputs cited below).

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest (gross) | **32.48x** ($10,849M / $334M) | EBITDA: [`earnings/01_historical-financials.md`, §2 TTM Snapshot]. Interest expense: [Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, Income Statement tab, "Interest Expense" row, Q3'25 $76M + Q4'25 $85M + Q1'26 $92M + Q2'26 $81M = $334M] |
| EBIT / interest (gross) | **13.09x** ($4,372M / $334M) | EBIT: [`earnings/01_historical-financials.md`, §2 TTM Snapshot]. Interest expense as above |
| (EBITDA − capex) / interest | **−6.21x** (($10,849M − $12,923M) / $334M = −$2,074M / $334M) | Capex TTM: [`earnings/01_historical-financials.md`, §2]. Interest expense as above |
| Adjusted EBITDA / interest (memo, non-GAAP) | **45.87x** ($15,322M / $334M) | Adjusted EBITDA TTM: [`01_capital-structure-and-leverage.md`, §5] |
| Fixed-charge coverage (proxy) | **−0.75x** (($10,849M − $12,923M) / ($334M interest + $1,418M current debt+finance-lease maturities + $1,022M current operating-lease liability) = −$2,074M / $2,774M) | Current debt+finance-lease and current operating-lease figures: [`01_capital-structure-and-leverage.md`, §1 and §2, Jun-30-2026 balance-sheet columns]. **Proxy flag:** no discrete "cash paid for operating leases" or scheduled-amortization schedule was found in the 10-Q text search of this pool; the current-portion balance-sheet lines are used as a one-year proxy for near-term lease cash payments and scheduled debt amortization — a labeled proxy, not a disclosed fixed-charge figure |
| Cross-check: CIQ's own EBITDA/interest, LTM Jun-30-2026 | 37.89x | [Tesla Inc NasdaqGS TSLA Credit Health Panel.xls, Financials tab, "EBITDA/Interest Exp. (x)" row, Company column, 2026-06-30 period] — differs from the 32.48x computed above because CIQ's own LTM EBITDA build (Credit Health Panel methodology) is not identical to the company-reported GAAP EBITDA build (Operating Income + D&A) used in this report; both are shown rather than reconciled to a single figure, per CLAUDE.md §5 (cite the source the number actually came from) |

**EBITDA basis:** reported GAAP EBITDA (Operating Income + D&A), TTM $10,849M — the primary basis for all ratios above, per module convention. Adjusted (non-GAAP) EBITDA of $15,322M (excludes SBC, digital-asset gains/losses, the SpaceX equity-investment unrealized gain) is shown as a memo line only, never as the headline. **Interest is gross**, not net: Tesla's income statement separately discloses "Interest Expense" ($334M TTM) and "Interest and Invest. Income" ($1,744M TTM), netting to a **positive** $1,410M of net interest income, not expense [Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, Income Statement tab]. This is a materially different picture from a normal leveraged borrower: Tesla earns roughly 5x its own gross interest expense from interest income on its cash and short-term-investment pile alone, before any operating EBITDA is counted. Coverage ratios use gross interest per MODULE_RULES.md Calculation Standard #5, but the net-interest-income position is a relevant qualitative fact for the read in §4.

**Cash-backing of EBITDA:** `earnings/06_earnings-quality.md` finds CFO exceeded 85% of GAAP EBITDA in every year FY2021–FY2025 (reaching ~140% in FY2025, itself flagged as partly a shrinking-EBITDA-denominator effect rather than pure quality improvement) [`earnings/06_earnings-quality.md`, §2]. There is no evidence in that module of manufactured or non-cash EBITDA — the $10,849M TTM GAAP EBITDA used above is broadly cash-backed. The one caveat that matters for the ratios above is not an EBITDA-quality issue but a **capex-timing** one: quarterly capex jumped to $5,789M in Q2 2026 (+142% QoQ) as management guided full-year 2026 capex above $25 billion (more than double FY2025's $8,527M) to fund robotaxi, Optimus, a semiconductor fab and AI-compute buildout [`earnings/06_earnings-quality.md`, §1; Tesla Q2 2026 Earnings Call, Jul-22-2026, prepared remarks]. That ramp is what drives the negative (EBITDA − capex)/interest and fixed-charge-coverage readings above — it is a disclosed, funded growth-investment choice (against $43.5B of cash plus short-term investments — see `01_capital-structure-and-leverage.md` §3), not an earnings shortfall.

---

## 2. Covenant Inventory

No quantified covenant threshold, ratio, or covenant-EBITDA definition is disclosed anywhere in this pool. The only disclosure is a binary compliance affirmation: *"As of June 30, 2026, we were in material compliance with all financial debt covenants"* [Q2 FY26 10-Q, Note 8 (Debt)]. Per the module's partial-data rule, a typical market covenant for this credit type is applied as a **LABELED ASSUMPTION** (not a disclosed fact), and numeric headroom against it is indicative only.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (**LABELED ASSUMPTION** — no disclosed threshold; using a typical investment-grade-adjacent industrial borrower range of 3.5x–4.5x, midpoint 4.0x, per MODULE_RULES.md partial-data rule) | 4.0x net debt / EBITDA (assumed) | 0.08x (net debt $861M / GAAP EBITDA $10,849M, canonical basis) | **+98.0%** [(4.0 − 0.08) / 4.0] (indicative only) | Threshold: labeled assumption, not from filings. Actual: [`01_capital-structure-and-leverage.md`, §5] |
| Min interest coverage (**LABELED ASSUMPTION** — no disclosed threshold; using a typical range of 2.0x–3.0x, midpoint 2.5x) | 2.5x EBITDA/interest (assumed) | 32.48x | **+1,199%** [(32.48 − 2.5) / 2.5] (indicative only — the extreme % is a direct product of Tesla's near-zero gross interest expense, not a data error; see §4) | Threshold: labeled assumption. Actual: §1 above |
| Min liquidity / net worth | Not disclosed | Cash & equivalents $15,219M + ST investments $28,305M = $43,524M combined; stockholders' equity $86,858M | Not assessable — no disclosed floor | [`01_capital-structure-and-leverage.md`, §3, §5] |
| Springing covenant trigger (e.g., revolver utilization threshold) | Not disclosed | RCF Credit Agreement: $0 drawn / $5,000M committed as of Jun-30-2026 — 0% utilized | Not assessable — no springing-covenant language found in the 10-Q text search of this pool; if one exists it is currently "not active" given 0% utilization, but this is inferred from the undrawn balance, not confirmed from a disclosed trigger clause | [`01_capital-structure-and-leverage.md`, §1]; Inference, not from filings, on the "not active" read |
| Equity cure rights (Y/N, limits) | Not disclosed | N/A | Not assessable | "Not disclosed in the data pool" |
| Other — cross-default / change-of-control | Not disclosed | N/A | Not assessable | "Not disclosed in the data pool" [consistent with `00_solvency-data-triage.md`, §3] |

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Undisclosed.** No credit-agreement excerpt, indenture, or debt note in this pool defines a covenant-specific EBITDA (addbacks, exclusions) | "Not disclosed in the data pool" |
| Addbacks permitted (types) | Unknown | — |
| Addback caps / limits | Unknown | — |
| Is covenant EBITDA materially above reported EBITDA? | **Cannot be determined.** The company's own non-GAAP "Adjusted EBITDA" ($15,322M TTM, +41% above the $10,849M GAAP figure) shows the *direction and scale* of what a lenient addback-heavy definition could look like, but there is no evidence this — or any other — definition is what a lender actually uses for covenant purposes | [`01_capital-structure-and-leverage.md`, §5] for the Adjusted EBITDA figure; inference that it may resemble a covenant definition is flagged as "Inference, not from filings" |

**Headroom quality is unknown** — the "addback illusion" risk (a covenant that looks comfortable only because covenant EBITDA is defined generously) cannot be ruled out or confirmed from this pool. This is immaterial in practice here only because Tesla's funded debt is so small relative to any plausible EBITDA base (see §3) — not because the definition question has been resolved.

---

## 3. Headroom & Breach Proximity

**Numeric covenant headroom is "Not assessable" for scoring purposes**, per the module's partial-data rule (no disclosed covenant threshold). The figures below are indicative distances against the two LABELED ASSUMPTION covenants in §2, computed with the same Python snippet as §1.

| Metric | Value |
|---|---:|
| Tightest covenant (of the two labeled-assumption covenants; in relative-percentage terms) | Max net leverage (assumed 4.0x) — indicative headroom +98.0%, versus +1,199% on the assumed min-coverage covenant |
| Headroom on tightest covenant (%) | **+98.0%** (indicative; not a disclosed fact) |
| EBITDA decline that would breach the assumed leverage covenant (4.0x, holding debt fixed) | EBITDA would have to fall to ~$215M — a ~98% decline from TTM GAAP EBITDA ($10,849M) — before net debt/EBITDA reaches 4.0x on the current $861M of net debt. This is not a realistic near-term risk; it is a mechanical result of net debt being tiny |
| Debt increase that would breach the assumed leverage covenant (4.0x, holding EBITDA fixed) | Net debt would have to rise to ~$43,396M — an increase of ~$42.5 billion from the current $861M — to hit 4.0x at the current $10,849M TTM EBITDA |
| EBITDA decline that would breach the assumed min-coverage covenant (2.5x, holding interest fixed) | EBITDA would have to fall to ~$835M — a ~92% decline from TTM — before EBITDA/interest reaches 2.5x on the current $334M of TTM interest expense |

**Read:** on either labeled-assumption covenant, the distance to breach is extreme — not because Tesla's underlying operating performance is exceptional (EBIT margin has fallen from 16.8% in FY2022 to 4.6% in FY2025, per `earnings/01_historical-financials.md` §1), but because the debt base against which any leverage or coverage ratio is measured is almost nonexistent ($861M net debt, $334M TTM gross interest, against $10,849M TTM EBITDA). A genuine near-term fixed-charge concern exists — the negative (EBITDA − capex)/interest and fixed-charge-coverage readings in §1 — but it is a **capex-timing** story (a disclosed, cash-funded growth-capex ramp), not a covenant-breach story. No disclosed covenant is close to breaking on the evidence available; whether an undisclosed lender-negotiated covenant with a stricter or more idiosyncratic definition exists cannot be ruled out (see the addback-illusion flag above), but there is no evidence of one in this pool beyond the binary "in material compliance" statement.

---

## 4. Coverage / Covenant Read

Earnings cover interest with vast room on a pure interest basis: GAAP EBITDA is 32.48x TTM gross interest expense ($10,849M / $334M), and Tesla's interest income ($1,744M TTM) actually exceeds its interest expense, so the company runs net interest income of $1,410M rather than a net interest cost [Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, Income Statement tab]. But that headline ratio is doing very little work here — Tesla's funded debt is so small (canonical net debt of just $861M against $10,849M TTM EBITDA, 0.08x) that almost any coverage or leverage ratio clears almost any plausible covenant by a wide margin; this is a company with essentially no meaningful covenant exposure to speak of, not a company that has proven itself against a real constraint. No covenant threshold, ratio, or covenant-EBITDA definition is disclosed anywhere in the pool (only a binary "in material compliance" statement, [Q2 FY26 10-Q, Note 8]) — the labeled-assumption headroom of +98.0% on an indicative 4.0x max-leverage covenant is not a real distance-to-breach figure and must be read as illustrative, not disclosed. The one genuine coverage weak spot is (EBITDA − capex)/interest, which is negative at −6.21x TTM because guided 2026 capex above $25 billion (more than double FY2025's $8,527M, funding robotaxi/Optimus/semiconductor-fab/AI-compute buildout) has outrun TTM EBITDA generation — a disclosed, cash-funded growth-investment choice against $43.5 billion of cash and short-term investments, not a signal of financial distress, but it does mean the "coverage after reinvestment" line, not the raw interest-coverage line, is the number to watch if the capex ramp does not translate into EBITDA growth on the timeline management has guided.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **Reporting standard:** US GAAP. **Period:** Jun-30-2026 (Q2 FY26 10-Q, filed Jul-23-2026), with Dec-31-2025 (FY2025, audited, carried forward) shown for comparison. No `ciq_facts.json` sidecar exists for this run. This module's `01_capital-structure-and-leverage.md` designates **net debt of $861M** (broad/lease-inclusive gross debt, strict/cash-only netting) as canonical — referenced below where relevant.

**Data-pool gap flagged up front:** the full FY2025 10-K (with its complete Notes to Financial Statements, including any annual purchase-obligation / capital-commitment table) is NOT in this data pool — only the FY2025 10-K/A (Part III only: governance, compensation, ownership) is present. The Q2 FY26 10-Q's own "Commitments and Contingencies" note (Note 11) does not carry a purchase-obligation or capital-commitment table this quarter (none found on a full-text search). Purchase/take-or-pay commitments and any letters-of-credit/surety-bond detail are therefore **not quantifiable from this pool** and are recorded as a gap below, not filled in.

---

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debtstack? | Source |
|---|---:|---:|---|---|
| Operating leases | $6,738M total ($1,022M current + $5,716M LT), Jun-30-2026 (up from $6,343M, Dec-31-2025) | Same — undiscounted future minimum payments not separately re-disclosed this quarter; $6,738M is the discounted lease-liability balance | **Yes — flagged, not double-counted here.** `01`'s "Other Debt-Like Obligations" table (§2) already carries this figure and its broad/lease-inclusive gross-debt figure ($16,080M canonical) already includes it. Shown here only for completeness of the off-balance-sheet picture; do not re-add it to any total in this report | [Q2 FY26 10-Q, Consolidated Balance Sheets: "Operating lease liabilities, current portion" $1,022M; "Operating lease liabilities" $5,716M] |
| Pension / OPEB underfunding | Not material / not disclosed | Not material / not disclosed | N/A — `01` already confirms no defined-benefit plan | [Q2 FY26 10-Q, full-text search — no pension/OPEB note]; [CIQ Financials_Annual.xls, Pension-OPEB tab — blank] |
| Securitization / factoring (Automotive & Energy Asset-Backed Notes, China Working Capital Facility) | $9,078M unpaid principal (non-recourse to Tesla, Inc.'s general assets) | Same — these are on-balance-sheet, fully recognized debt instruments, not contingent exposures | **Yes — already in `01`'s debt stack** (narrow $9,342M figure includes these instruments; see `01` §1 for the full instrument table). Listed here only to confirm no additional off-balance-sheet securitization exists beyond what `01` already captures | [Q2 FY26 10-Q, Note 8 (Debt)] |
| Uncommitted Warehouse Agreement | $0 drawn as of Jun-30-2026 | Up to $1.50 billion (undrawn commitment), secured by financing receivables/leased-vehicle interests; draw window expires Mar-2027 | No — sits outside Note 8's debt table and outside `01`'s committed-liquidity figure (it is explicitly uncommitted, not usable liquidity per `01`) | [Q2 FY26 10-Q, "Warehouse Agreement" disclosure] |
| Purchase / take-or-pay commitments | Not disclosed in this pool | Not disclosed in this pool | N/A — genuine data gap, not filled in | See gap note above |

State the reporting currency: USD.

---

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Vehicle resale-value guarantees to commercial banking partners | "Immaterial" — not separately quantified in the note (recorded within "other liabilities," no dollar figure given) | $4.07 billion (Jun-30-2026), up from $3.45 billion (Dec-31-2025) | Commercial banking partners in vehicle-leasing programs — Tesla originates the lease, sells it and the vehicle to the bank, and guarantees a capped resale value if the bank cannot sell the vehicle at or above its contractual/determined residual value at lease end | [Q2 FY26 10-Q, Note (Guarantees), full text: "Our maximum exposure on the guarantees we provide ... was $4.07 billion and $3.45 billion as of June 30, 2026 and December 31, 2025, respectively"] |
| Standby letters of credit | Not disclosed in this pool | Not disclosed in this pool | Not disclosed | Not disclosed in the data pool |
| Financial guarantees to/for related parties (SpaceX, The Boring Company, Redwood Materials) | None disclosed — the SpaceX relationship in this pool is a $2.00 billion equity-method investment (approved Mar-2026, formerly structured as a preferred investment in xAI) and ordinary-course Megapack sales ($405M H1-2026 revenue / $307M cost of revenue), not a guarantee of SpaceX debt or obligations | N/A | N/A | [Q2 FY26 10-Q, Note 13 (Related Party Transactions)] |
| Performance / surety bonds | Not disclosed in this pool | Not disclosed in this pool | Not disclosed | Not disclosed in the data pool |

---

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Benavides v. Tesla, Inc. (2019 Autopilot fatality — product liability) | "Immaterial accrual" (company states it disagrees with the verdict) | $329M combined ($129M compensatory + $200M punitive; jury found the driver 67% at fault, Tesla 33%) | **Active.** Post-trial motions denied Feb-19-2026; Tesla filed its opening appellate brief with the 11th Circuit Jul-2-2026 | [Q2 FY26 10-Q, Note 11 (Commitments and Contingencies), "Benavides v. Tesla, Inc."] |
| CRD (California Civil Rights Dept.) systemic race-discrimination/hostile-work-environment suit | Not quantified — "unable to reasonably estimate the possible loss or range of loss" | Not quantified; complaint seeks monetary damages and injunctive relief | **Active.** First trial phase set Sep-21-2026 | [Q2 FY26 10-Q, Note 11, "Litigation and Investigations Relating to Alleged Discrimination and Harassment"] |
| EEOC parallel race-harassment/retaliation suit | Not quantified — "unable to reasonably estimate" | Not quantified; seeks monetary and injunctive relief | **Active** — in discovery, no trial date set | [Q2 FY26 10-Q, Note 11] |
| Autopilot/FSD driver-assistance consumer class action (N.D. Cal., consolidated) | Not quantified — "unable to reasonably estimate" | Not quantified; damages and other relief sought on behalf of purchasers/lessees since Jan-1-2016 | **Active.** Class certified for a limited California-consumer subset (Aug-2025); Tesla's 9th Circuit appeal of certification fully briefed, oral argument set Aug-31-2026 | [Q2 FY26 10-Q, Note 11, "Other Litigation Related to Our Products and Services"] |
| Securities-fraud class action re: Autopilot/FSD/Robotaxi representations (W.D. Tex.) | Not quantified — no accrual disclosed | Not quantified; seeks monetary damages on behalf of purchasers Apr-19-2023 to Jun-22-2025 | **Active.** Amended complaint filed Feb-17-2026; Tesla's motion to dismiss filed Apr-20-2026; plaintiffs responded Jun-22-2026 | [Q2 FY26 10-Q, Note 11] |
| Delaware derivative suits (breach of fiduciary duty re: CEO/X Corp./xAI dealings) | Not quantified — case dismissed | Not quantified — unspecified damages sought | **Dormant at trial level, active on appeal.** Tesla's motions to dismiss granted Apr-13-2026; plaintiffs appealed to the Delaware Supreme Court in May-2026 | [Q2 FY26 10-Q, Note 11, "Certain Derivative Lawsuits in Delaware"] |
| Tariff refund (IEEPA ruling, Feb-2026) | Not recognized (contingent gain, not a liability) — "we will not recognize any receivable ... until such amounts are realized or realizable" | Not quantified | Active but this is a **contingent asset**, not a contingent liability — noted for completeness only, excluded from the liability totals in §4 | [Q2 FY26 10-Q, Note 11, "Tariffs"] |
| NHTSA / NTSB / SEC / DOJ and other regulatory information requests and investigations | No accrual disclosed | Not quantified; company states an enforcement action "exists the possibility of a material adverse impact" | **Active** — ongoing information requests; "no government agency ... has concluded that any wrongdoing occurred" per the company | [Q2 FY26 10-Q, Note 11, "Certain Investigations and Other Matters"] |
| Uncertain tax positions / tax-authority audits | Not disclosed in this pool (this quarter's 10-Q carries no unrecognized-tax-benefit rollforward) | Not disclosed | Not assessable from this pool | Data gap — the full FY2025 10-K (which typically carries this table) is not present |
| Warranty reserve (memo — recognized liability, not a gap between recorded and max) | $8,963M accrued warranty balance, Jun-30-2026 (up from $8,607M at Jan-1-2026; $1,121M provision less $972M costs incurred plus a $207M net revaluation, six months ended Jun-30-2026) | No separate "maximum" disclosed beyond the accrual itself — this is a routine, actuarially-estimated reserve, not an off-balance-sheet contingency | N/A — fully recognized on the balance sheet | [Q2 FY26 10-Q, Note (Warranties), accrued-warranty rollforward table] |

Use the company's own probability language: for every material litigation matter above except Benavides, Tesla states it is "unable to reasonably estimate the possible loss or range of loss" — the company's own probability disclosure stops at "reasonably possible" without a number, never "remote," for the discrimination, consumer, and securities suits. The Delaware derivative suits are the one matter dismissed at the trial level (now dormant there, live only on appeal).

---

## 4. Contingent Exposure Summary

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities (resale-value guarantee + Benavides accrual) | "Immaterial" for both — not separately quantified by the company; treated as not meaningfully greater than $0 for this ratio |
| Total quantified maximum / gross exposure (resale-value guarantee $4.07B + Benavides $329M) | $4.40 billion |
| Max exposure ÷ recognized | Not computable precisely — the recognized-side inputs are disclosed only as "immaterial," not as a dollar figure; the ratio is directionally very large but this reflects standard ASC 460 guarantee accounting (expected-loss recording vs. contractual cap), not an escalating exposure |
| Max exposure ÷ total equity ($86,858M, per `01` §5) | 5.07% |

Most litigation matters (discrimination/harassment suits, the Autopilot/FSD consumer class action, the securities class action, and the regulatory investigations) carry **no disclosed dollar figure at all** — "unable to reasonably estimate" — so they are excluded from the $4.40B total above; the true aggregate contingent exposure is understated by an unquantified amount, not overstated.

---

## 5. Contingency Read

The largest off-balance-sheet exposure is the $4.07 billion maximum on Tesla's vehicle resale-value guarantees to leasing-bank partners — up 18% from $3.45 billion six months earlier as the leasing book grows — against a recorded liability the company calls only "immaterial"; this is a live, growing, ordinary-course program (not a legacy or distressed exposure), and at 4.7% of the $86,858M equity base it would not threaten solvency even in a downside where EV resale values fell meaningfully. The next-largest, most concrete exposure is the $329 million Benavides jury verdict (on appeal, immaterial accrual booked), a rounding error against Tesla's balance sheet. The bigger unresolved risk is qualitative, not quantitative: five active, unquantified litigation and regulatory matters (CRD/EEOC discrimination suits, the Autopilot/FSD consumer class action, the securities class action, and ongoing NHTSA/SEC/DOJ information requests) are all live and each carries the company's own "material adverse impact" caution language with no dollar estimate — undisclosed exposures on these specific matters cannot be ruled out from this pool.

Max exposure ÷ recognized is not computable ($0/"immaterial" denominator), and max exposure ÷ equity is 5.07% — below the module's 3x/15% co-trigger thresholds — so this report does **not** treat the resale-guarantee or litigation exposure as a contingent-liability spike; it is a monitorable, disclosed, and comparatively small exposure relative to Tesla's balance sheet, not a red flag under the module's own test.

**Partial data: the FY2025 10-K's full financial-statement notes (purchase/capital commitments table, letters-of-credit detail, uncertain-tax-position rollforward) are not in this data pool — only the Part III-only FY2025 10-K/A is present. Given Tesla's known-litigious profile (multiple active class actions and regulatory matters with unquantified exposure), undisclosed or unquantified exposures beyond the $4.40B identified here cannot be ruled out; this caps `01`'s solvency-strength score at 75 per MODULE_RULES.md's "off-balance-sheet exposures undisclosed for a known-litigious/levered name" cap, to be applied by `04`/`06`/`99` downstream.**



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **EBITDA basis:** reported (GAAP) EBITDA (Operating Income + D&A), TTM ended Jun-30-2026 = $10,849M — the module's designated base, cross-checked as cash-backed against `earnings/06_earnings-quality.md` (cash from operations, CFO, exceeded 85% of GAAP EBITDA in every year FY2021–FY2025; no evidence of manufactured or non-cash EBITDA). The company's own non-GAAP "Adjusted EBITDA" ($15,322M TTM) is shown as a memo only, never as the stress base, per CLAUDE.md §15. **Net debt basis:** the canonical figure designated by `01_capital-structure-and-leverage.md` §7 — broad/lease-inclusive gross debt ($16,080M) minus cash & equivalents only (§15 strict-cash basis) = **$861M net debt**. Tesla is deeply net cash on every other defensible reading (net cash of $5,877M excluding leases; net cash of $27,444M–$34,182M once short-term investments are netted in), and that framing carries through this report even though the single strictest/most conservative combination shows a small positive net-debt figure.

**Pending-acquisition check (step 2a):** no pending or recently-announced material acquisition is disclosed in `business-model/11_capital-allocation-governance.md` — cash acquisitions were $0 in five of the last six fiscal years, and the one related-party capital commitment on file (a $2.0 billion equity-method investment in SpaceX) is an equity purchase, not a consolidating M&A transaction. **No pro-forma adjustment is required**; this report stresses the reported balance sheet as of Jun-30-2026 directly.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, GAAP) | $10,849M TTM (Jun-30-2026) | `01_capital-structure-and-leverage.md` §5; cash-backing cross-checked in `earnings/06_earnings-quality.md` §2 |
| Net debt (canonical, §15 strict-cash / broad-debt basis) | $861M net debt | `01_capital-structure-and-leverage.md` §7 |
| Net debt / EBITDA | 0.08x | Computed |
| EBITDA / interest | 32.48x (gross interest $334M TTM) | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold | Max net leverage, **assumed** 4.0x (no disclosed covenant threshold anywhere in the pool — only a binary "in material compliance" statement; labeled assumption per `04`'s partial-data rule) | `04_coverage-and-covenants.md` §2–3 |
| Next-12m obligations (gross-obligations basis: contractual debt wall + cash interest + total capex proxy + $0 dividends/buybacks) | $20,521M | `03_liquidity-runway.md` §2 |
| Committed liquidity (cash + unrestricted ST investments + undrawn RCF) | $48,238M | `03_liquidity-runway.md` §1 |
| Floating-rate debt (gross) | $5,888M (China Working Capital Facility, 63.0% of narrow $9,342M debt stack; fully drawn, unhedged) | `01`/`02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | None — Tesla "do[es] not typically hedge foreign currency risk" and discloses no interest-rate hedge or swap | `02_maturity-wall-and-refinancing.md` §3 |
| Working-capital seasonality / peak build | Not disclosed as a $ figure — Q1 is the seasonally weakest revenue quarter and DSO has risen 16.7% then 20.4% YoY, but no peak-quarter cash-usage figure exists in the pool | `03_liquidity-runway.md` §3 (Seasonality Hard Check); `earnings/06_earnings-quality.md` §3 |

Reporting currency: USD. EBITDA basis: reported (GAAP), TTM. **Covenant caveat carried through every stress figure below:** no covenant threshold, ratio, or covenant-EBITDA definition is disclosed in this data pool (only Tesla's binary "in material compliance" statement, Q2 FY26 10-Q Note 8) — the 4.0x max-leverage and 2.5x min-coverage covenants used throughout this report are **labeled assumptions** from `04`'s partial-data rule (typical market ranges for an investment-grade-adjacent industrial borrower), not disclosed facts. Every breach flag and headroom % below is indicative, not a distance to a real, known threshold.

---

## 2. Stress Scenarios

All figures computed with an executed Python snippet (shown in the agent's working; reproducible from the inputs cited above and in `01`–`05`). Liquidity gap is shown on the **gross-obligations basis** (usable liquidity − stressed 12-month obligations, no FCF netted — the more conservative of the two bases `03` defines, and the one that basis leads with given TTM FCF is flagged unreliable against the guided FY2026 capex ramp). A net-of-FCF cross-check is shown in §3's solve; it only widens the surplus.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA ($M) | 10,849 | 7,594 | 6,509 | 4,340 | 6,509 | 6,509 |
| Net debt / EBITDA | 0.08x | 0.11x | 0.13x | 0.20x | 0.13x | 0.13x |
| EBITDA / interest | 32.48x | 22.74x | 19.49x | 12.99x | 19.49x | 14.41x (interest raised to $451.8M) |
| Tightest covenant headroom (assumed 4.0x max leverage; indicative) | +98.0% | +97.2% | +96.7% | +95.0% | +96.7% | +96.7% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap (surplus shown; gross-obligations basis) | +$27,717M | +$27,717M | +$27,717M | +$27,717M | +$26,422M | +$27,599M |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**WC shock sizing (labeled assumption — no disclosed seasonal-build figure per `03` §3):** 5% of TTM quarterly revenue ($25,905M ÷ 4... i.e. $25,905M quarterly run-rate) = **$1,295M** added to 12-month obligations. **Rate shock sizing:** +200bps applied to the $5,888M floating-rate China Working Capital Facility (unhedged, no interest-rate hedge disclosed) = **+$117.8M/year** incremental interest, raising TTM gross interest from $334M to $451.8M in that column only.

**Historical trough-to-peak calibration (automotive flagged "High" consumer-cycle exposure per `business-model/10_external-dependency.md`):** Tesla's own reported GAAP EBITDA fell from its FY2022 cyclical peak of $17,235M to $10,503M in FY2025 — a **−39.1% peak-to-trough decline**, already realized in the company's own recent history [`earnings/06_earnings-quality.md` §1]. Recomputed on this basis: EBITDA $6,611M, net debt/EBITDA 0.13x, EBITDA/interest 19.79x, tightest covenant headroom +96.7%, no breach, liquidity surplus +$27,717M, survives without external action. This confirms the −40% column above is not a hypothetical tail case for Tesla — it sits almost exactly on top of a decline the company has already lived through this cycle.

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (max leverage, assumed 4.0x) | ~98.0% |
| Min-coverage covenant breaches (assumed 2.5x, memo — not the tightest) | ~92.3% |
| Committed liquidity exhausted within 12 months | **Not reached on an EBITDA decline alone (h ≥ 1)** |
| Net leverage exceeds an illustrative 6.0x market-refi-access ceiling | ~98.7% |

**Solves executed (Python, shown in full):**

- **Leverage covenant (MAX/ceiling, T = 4.0x, net debt held constant at $861M):**
  `h = 1 − net_debt / (T · EBITDA) = 1 − 861 / (4.0 × 10,849) = 1 − 861/43,396 = 1 − 0.01984 = 0.9802` → **98.0% EBITDA decline** required to breach. (Cross-checks `04`'s own indicative read: EBITDA would need to fall to ~$215M.)
- **Coverage covenant (MIN/floor, T = 2.5x, interest held constant at $334M):**
  `h = 1 − (T · interest) / EBITDA = 1 − (2.5 × 334) / 10,849 = 1 − 835/10,849 = 1 − 0.07697 = 0.9230` → **92.3% EBITDA decline** required to breach.
- **Illustrative net-leverage market-refi threshold (MAX form, T = 6.0x — an indicative "loses normal capital-markets access" ceiling, not a disclosed covenant):**
  `h = 1 − 861 / (6.0 × 10,849) = 1 − 861/65,094 = 1 − 0.01323 = 0.9868` → **98.7% EBITDA decline.**
- **Liquidity exhaustion — gross-obligations basis (primary, most conservative; no FCF netted, so the gap is structurally independent of h):**
  `surplus = usable_liquidity − 12m_obligations = 48,238 − 20,521 = $27,717M` at **any** EBITDA haircut — the gap never depends on EBITDA under this basis because it already assumes zero operating cash inflow. Liquidity is not exhausted at any finite EBITDA decline under this basis.
- **Liquidity exhaustion — net-of-FCF cross-check (stressed FCF scaling: lost EBITDA drops through to FCF at the after-tax operating margin, holding cash interest and maintenance capex fixed → `stressed_FCF(h) ≈ FCF_base − EBITDA·h·(1−tax)`, tax = 21% federal statutory rate, labeled assumption; FCF_base = $5,762M TTM):**
  `h = (usable_liquidity + FCF_base − obligations) / (EBITDA × (1 − tax)) = (48,238 + 5,762 − 20,521) / (10,849 × 0.79) = 33,479 / 8,570.7 = 3.906`
  This solve returns **h ≥ 1** — meaning even a 100% elimination of TTM EBITDA (and beyond, mathematically) does not exhaust the 12-month liquidity cushion on this basis either. **Committed liquidity does not break on an EBITDA decline alone under either basis** — the constraint that would actually matter is a run on the $48,238M of cash/investments/RCF itself (e.g., a market-closure-plus-asset-freeze event), not a fall in operating earnings.

All three covenant/leverage break points cluster in the **92–99% EBITDA decline** range — i.e., essentially the total elimination of Tesla's operating earnings, not a plausible recession. This is a mechanical result of net debt ($861M) being minuscule relative to EBITDA ($10,849M TTM), not evidence of exceptional operating resilience — Tesla's EBIT margin has already fallen from 16.8% (FY2022) to 4.6% (FY2025) [`earnings/03_margin-drivers.md` §4] even as these ratios stayed comfortable, because the debt base being measured against is so small.

---

## 4. Survival Read

On every haircut this report can run — −30%, −40%, −60%, and a −39.1% historical peak-to-trough calibration, each alone or stacked with a labeled working-capital shock ($1,295M) or a +200bps floating-rate shock (+$117.8M/year on the unhedged $5,888M China facility) — Tesla shows no covenant breach and a 12-month liquidity surplus in excess of $26 billion; a 30–40% EBITDA decline, a normal recession rather than a tail event, is survivable on the company's own balance sheet with no external action required, and even the historically-realized −39% peak-to-trough EBITDA move (FY2022→FY2025) changes almost nothing about the numbers above. **Market closure test:** assuming no new unsecured refinancing is available for 12 months, Tesla still clears its full $20,521M gross-obligations bucket — including the $5,888M China Working Capital Facility that contractually matures Sep-2026–Mar-2027 but is booked GAAP long-term on an unevidenced "intent and ability to refinance" assertion (`02_maturity-wall-and-refinancing.md` §1b–§4) — out of cash and the undrawn RCF alone, without touching new issuance; the item that "breaks first" in a genuine closure scenario is not covenant headroom or aggregate liquidity but the **China facility's specific refinancing channel**, which depends on continued access to Chinese bank credit rather than the US-dollar cash pile sitting alongside it. The break points that would actually matter — a ~92–99% EBITDA decline to breach the (labeled-assumption) covenants, or an EBITDA collapse beyond 100% to dent the liquidity cushion under either basis modeled — are not realistic near-term scenarios; they reflect a company whose net debt ($861M) is a rounding error against its EBITDA ($10,849M TTM), not a company that has proven itself resilient against a real debt constraint.

**Tesla is net cash on every reading except the single strictest, lease-inclusive-debt/cash-only combination, where it is barely net debt ($861M).** It survives every haircut modeled here with no covenant breach and no liquidity gap — the strongest survival outcome this module can report. That result is a mechanical consequence of an almost debt-free balance sheet (99.98% of Tesla, Inc.'s on-balance-sheet debt is non-recourse SPE/subsidiary paper, per `01_capital-structure-and-leverage.md` §1), not evidence that the operating business itself is immune to a downturn — margin compression is real and already visible (EBIT margin −1,222bps FY2022→FY2025) and the company's own guided capex ramp (>$25bn FY2026) is what is currently pressuring free cash flow, not debt service. Per CLAUDE.md §24 (Filter 3) and this module's Core Principle 8, this net-cash position is strategic optionality — counter-cyclical capacity to keep funding the robotaxi/Optimus/AI-compute investment cycle through a demand downturn without needing a covenant waiver, an asset sale, or an equity raise — not a "nothing breaks" blandness finding: it is the specific, cited reason nothing breaks.

**Caveat on confidence:** the covenant breach points above rest on labeled-assumption thresholds (`04`'s partial-data rule), since no actual covenant is disclosed — if a real lender covenant exists with a materially tighter, idiosyncratic definition, the true breach point could differ from the ~92–99% figures shown, though given how small net debt and interest are in absolute dollars, a materially different outcome would require a covenant far outside typical market ranges. Off-balance-sheet exposures for litigation matters carrying no disclosed dollar estimate (five active matters — discrimination/harassment suits, the Autopilot/FSD class action, the securities class action, and open regulatory investigations, per `05_off-balance-sheet-and-contingencies.md` §3, §5) are not sized in this stress test and remain a source of tail risk this module cannot quantify.
