# balance-sheet-survival Module Dossier — NVT

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-09-07T04:45:57Z
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

# Balance-Sheet-Survival Module — NVT (Synthesis)

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Balance-sheet date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31) · **Report date: 2026-09-07** · **Jurisdiction: US SEC domestic filer; issuer incorporated in Ireland** [`00_solvency-data-triage` §4A]

**All seven upstream specialist outputs were read. None failed. No fail-fast trigger fired.**

---

## Abstract

nVent's reported balance sheet is lightly levered and getting lighter: strict net debt of $1,236.4m is 1.15x peak EBITDA and 1.43x mid-cycle, down from 3.00x at FY2024. Only 0.92% of debt falls due within twelve months; the wall is a single $500.0m note in April 2028, making 35.3% of the stack due within 24 months. Free cash flow of $634.1m covers every committed obligation, so there is no finite runway, and the tightest covenant — a 3.75x leverage ceiling — sits +69.9% clear. Pro-forma the signed $1.75bn Maverick purchase, that breach point collapses to roughly −36.4%. Adequate — and the undisclosed bridge tenor, not earnings, is the binding unknown.

---

## 1. Solvency Verdict

**The central adjudication, stated first and explicitly.** Two balance sheets give two different survival answers, and this module must say which governs.

- **The REPORTED 30-June-2026 balance sheet is the only set of facts.** Net leverage 1.15x strict, covenant breach at −69.9% EBITDA, no finite liquidity runway, survives −60% with an $18.5m twelve-month gap against $776.4m of usable liquidity [`01` §5, §7; `04` §3; `06` §2A, §3A]. **On this read alone the verdict would be "Solid."**
- **The PRO-FORMA balance sheet is arithmetic on an assumption, and every figure carrying it is labelled pro-forma inference, not from filings** [`01` §5A; `04` §3A; `06` §1A]. $1.75bn cash plus up to $550m of contingent earnout, funded from "available cash on hand and new debt" with committed Bank of America bridge financing, announced 24 August 2026, expected to close Q4 2026 [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. Pro-forma net leverage ~2.43x on peak EBITDA / ~2.94x mid-cycle; covenant breach at −36.4%; −40% is **not** survivable on the standing 3.75x ceiling without the 4.25x acquisition election or a lender waiver.
- **VERDICT ADJUDICATION: the pro-forma read governs, and the verdict is set on it.** Three reasons. (a) The agreement is **signed and definitive**, with financing described as committed and closing expected inside the current quarter — it is not a rumour or an intention, so a solvency verdict written on a balance sheet that will not exist by year-end would be stale on arrival. (b) MODULE_RULES Core Principle 7 and CLAUDE.md §4 both require the more fragile reading where data is thin, and the thin data here — the financing terms — sits entirely on the pro-forma side. (c) `06` finds the binding constraint may not be earnings at all: if the Bank of America bridge is drawn at close and **not** termed out within twelve months, the funding gap is **$557.9m (funding Case B) to $565.4m (Case A) at today's EBITDA, before any earnings decline** [`06` §3B]. That is a market-access break point, not a stress break point, and no earnings-based verdict can cover it.
- **What this does NOT mean.** No pro-forma figure is presented anywhere in this report as a reported one. Reported net leverage is **1.15x**; ~2.43x is a pro-forma inference resting on a financing mix the pool does not contain. Both numbers are carried, always labelled.

| Item | Value |
|---|---|
| **Verdict** | **Adequate** — leverage elevated post-acquisition but serviceable; coverage and headroom acceptable; **refinancing and covenant attention genuinely needed**. *As-reported alone the verdict would be **Solid**; it reverts to Solid if the Maverick financing is disclosed as long-dated term paper rather than a short bridge.* |
| **Net leverage (net debt / EBITDA), with basis** | **REPORTED: 1.15x** (strict §15 basis — gross debt $1,492.4m filing basis less cash $256.0m = net debt $1,236.4m, ÷ LTM reported EBITDA $1,074.6m, **peak-cycle**). **1.16x** on company-adjusted EBITDA $1,061.5m. **1.43x** on normalised / mid-cycle EBITDA $863.6m. **1.22x** strict excluding the $79.6m of cash that cannot be readily repatriated. *Memo, vendor basis:* **1.28x** on Capital IQ's lease-inclusive net debt $1,376.9m [`ciq_facts.json`]. **PRO-FORMA (inference, not from filings): ~2.43x** peak / **~2.94x** mid-cycle / **~2.88x** peak with the full $550m earnout paid / **~2.17x** on FY2026 consensus EBITDA [`01` §5, §5A, §7] |
| **Gross leverage** | **REPORTED: 1.39x** on reported EBITDA (gross debt $1,492.4m, filing basis, excludes $140.5m of operating leases which US GAAP keeps off the debt line); **1.41x** adjusted; **1.73x** mid-cycle. Debt/capital 27.2%; debt/equity 37.4% [`01` §5] |
| **Liquidity runway** | **REPORTED: no finite runway.** Normalised operating FCF of $634.1m a year covers all $151.0m of committed twelve-month financing obligations ($13.8m maturities + $137.2m dividends) with a **$483.1m annual surplus**, before touching $856.0m of committed liquidity (**gross-liquidity basis**: cash $256.0m + $600.0m disclosed, committed, undrawn, non-borrowing-base revolver availability). *Zero-FCF bound:* **35.1 months** on $856.0m; **31.8 months** excluding repatriation-limited cash; **10.5 months** on cash alone; **7.2 months** on the $176.4m of freely usable cash. **PRO-FORMA: still no finite runway** (~$408–416m annual surplus); gross-obligations bound 21.5–26.4 months. **EXCEPTION — bridge not termed out within 12 months: ~7.0 months** [`03` §3A, §3B] |
| **Maturity wall (% within 24 months)** | **35.29% ($529.3m of $1,500.0m principal)** — of which **$500.0m is a single instrument, the 4.550% Senior Notes due 2028-04-15**, roughly 19 months out. Within 12 months: **0.92% ($13.8m)**, all term-loan amortisation. Largest single maturity year: calendar 2028 at $517.2m (34.48%). WAM 4.42 years. **No pro-forma maturity schedule is constructed — the tenor of the acquisition debt is not disclosed** [`02` §1, §1a, §2, §4] |
| **Tightest covenant + headroom** | **Maximum net leverage 3.75x** (MAX / ceiling, Senior Credit Facilities, stated by the filing to be "the most restrictive"), electively **4.25x for four testing periods in connection with certain material acquisitions**. **REPORTED actual 1.13x on the credit agreement's own definitions** (covenant net debt $1,250.0m ÷ covenant EBITDA $1,106.7m) → **+69.9% headroom** (+73.4% vs the 4.25x election); **+62.5%** on a normalised mid-cycle covenant EBITDA of $889.4m. Second covenant: minimum interest coverage 3.00x (MIN / floor), actual 14.78x, +392.5%. **PRO-FORMA: ~+36.5%** at ~2.38x covenant leverage; **+23.2%** mid-cycle; **+9.1%** mid-cycle with the earnout paid. **Headroom quality: HIGH** — covenant EBITDA is only **3.0% above** reported EBITDA, one addback only (non-cash share-based compensation), no restructuring, deal-cost or synergy addbacks [`04` §2, §3, §3A] |
| **Stress break point (EBITDA decline that breaks it)** | **REPORTED: −69.9%** (3.75x leverage ceiling); −73.4% on the 4.25x election; −79.7% on the 3.00x coverage floor; liquidity never exhausted on an EBITDA decline alone (`h = 1.51`), −78.9% on cash only with the revolver excluded. **PRO-FORMA: −36.4%** (3.75x ceiling); −43.9% on the 4.25x election; **−24.8%** with the full $550m earnout paid; **a further −9.1%** measured from a normalised mid-cycle base with the earnout paid. **BRIDGE-NOT-TERMED-OUT CASE: the break point is `h ≈ −0.59` — the gap exists at TODAY's EBITDA, $557.9–565.4m, before any decline** [`06` §3A, §3B] |
| **Solvency strength /100** *(higher = better)* | **72** — no MODULE_RULES cap binds (all nine cap rows checked and cleared in §4 below). Held at 72 rather than the mid-80s the reported balance sheet alone would earn, because the forward capital structure rests on a $1.75bn financing whose mix, tenor and pricing are absent from the pool |
| **Liquidity runway /100** *(higher = better)* | **74** — `03` scored 82 reported / 66 pro-forma; the synthesis sits between them, weighted toward the pro-forma per the adjudication above |
| **Refinancing risk /100** *(**INVERTED — higher = WORSE**)* | **55** — 0.92% due inside twelve months and proven bank and bond access within fifteen months would score ~25 on the reported stack alone; the undisclosed tenor of $1.75bn of new acquisition debt, and the $558–565m twelve-month gap it creates if the bridge is not termed out, is what carries this to 55 |
| **Covenant headroom /100** *(higher = better)* | **68** — +69.9% reported against a near-GAAP covenant EBITDA (high-quality, not addback-manufactured), falling to +36.5% pro-forma and +9.1% on a mid-cycle base with the earnout paid. **Assessable** — both covenants, both thresholds, the acquisition election and the covenant-EBITDA definition including the $250.0m cash-netting cap are all disclosed |
| **Downside resilience /100** *(higher = better)* | **66** — **assessable**; the stress test ran in full. Reported structure survives −30/−40/−60% with no external action; pro-forma −40% requires the 4.25x election or a waiver, and −60% breaches both covenants and turns FCF negative (−$13.5m) |
| **Data quality /100** *(higher = better)* | **78** — `00` verdict **Sufficient**, 15 sources, 0 extraction failures, no partial-data cap active. Deducted for three real absences: no credit-rating-agency report; the FY2025 Form 10-K is not in the pool (FY2025 lease, pension and contingency detail read through a tier-5 vendor export or the FY2024 10-K); and the Maverick financing terms — the single most material forward fact — are undisclosed |
| **Overall usefulness /100** *(higher = better)* | **84** — every one of the five "what good looks like" questions is answered with filed numbers and reproducible formulas, and the one unanswerable question is named rather than papered over |
| **Biggest solvency risk (one line)** | **The undisclosed tenor of the committed Bank of America bridge: if drawn at a Q4 2026 close and not termed out within twelve months, up to $1,573.6–1,750.0m enters the twelve-month maturity bucket and opens a $557.9–565.4m funding gap at today's earnings — a market-access break, not an earnings break** [`06` §3B, §4] |

---

## 1A. Module Disconfirmation *(CLAUDE.md §8; fix F37)*

- **Strongest bear point.** The forward covenant cushion is thinner than any reported number suggests and it is measured against an input that probably flatters it. Pro-forma covenant EBITDA of $1,258.9m adds Maverick's **~$152.2m implied company-adjusted** EBITDA (backed out of the release's own "approximately 11.5 times anticipated 2026 adjusted EBITDA") to nVent's **trailing** covenant EBITDA — a mixed basis, and `06` names this line "the weakest input in this report" because the credit agreement's definition permits almost no addbacks [`06` §1A]. On a normalised mid-cycle base with the full $550m earnout paid, covenant leverage is 3.41x and **a further −9.1% EBITDA decline breaches the 3.75x ceiling** [`06` §3B] — the single most fragile figure the module produces.
- **Strongest bull point (the steelman).** The reported structure is genuinely hard to break, and the evidence is filed rather than asserted: **100% senior unsecured with no collateral pledged anywhere**, 86.7% fixed-rate, only 0.92% of principal due inside twelve months, a $600.0m committed non-borrowing-base revolver with availability stated outright by the filing and not maturing until 2030-06-30 (so a closed market cannot pull it), **no minimum-liquidity, minimum-net-worth or current-ratio covenant exists at all**, and covenant headroom of +69.9% measured against a covenant EBITDA only 3.0% above the GAAP number [`01` §1; `02` §2; `03` §1; `04` §2]. Net debt fell $787.4m (−38.9%) from its FY2024 peak. Bank and bond access is proven within fifteen months (June 2025 credit-agreement amend-and-restate; February 2026 supplemental indenture adding joint-and-several parent guarantees) [`02` §4].
- **Single killer risk.** Not the covenant and not the wall — **the bridge**. `02` and `03` reach it independently from the maturity side and the liquidity side, and `06` solves it: the gap is $557.9–565.4m at `h = 0`, widening to ~$940m at −40% and ~$1,130m at −60%. Nothing in the pool discloses tenor, pricing or take-out plan.
- **Disconfirming evidence already visible.** Three items cut against the fragile read and are stated rather than buried. (a) The **4.25x acquisition election is contractual, not a negotiation** — it is nVent Finance's own election for four testing periods in connection with material acquisitions, and at −40% pro-forma it clears with +6.6% to spare [`04` §2; `06` §2B]. (b) Liquidity never exhausts on an earnings decline in **any** scenario run, reported or pro-forma, including the funding case where the entire freely usable cash balance is spent and the revolver is the only usable liquidity (`h = 1.06`) [`06` §3B]. (c) The realised-offset test shows a −30/−40/−60% fall is a **volume** event, not a cost event: reaching −40% through the cost channel would need a $1,023.4m gross pre-mitigation shock, 19.0% of guided FY2026 sales and 5.4 times the entire all-in tariff run-rate [`06` §2C].

---

## 2. Specialist Roll-Up

**CLAUDE.md §3 four-shape fidelity pass run over every row before publishing** — checked for (i) qualifier dropped, (ii) basis dropped, (iii) build dropped, (iv) verdict hardened. Every leverage figure below carries its net-debt basis and its EBITDA cycle position; every pro-forma figure is labelled; the $1,066.1m contingent aggregate carries its mixed-basis warning and its build.

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| **00 solvency-data-triage** | **Sufficient.** 15 sources, 2 workbooks, 20 tabs, 33 extracts, **0 extraction failures**; all nine MODULE_RULES cap rows checked and **none binds**. US SEC domestic filer, US GAAP, USD, all documents English (no translation layer needed, no language gap) | Two absences recorded as data notes rather than caps: **no credit-rating-agency report** (so no rating may be inferred from management's "intent to maintain investment grade metrics" — that is management language, not an agency action), and the **Maverick financing is undisclosed**, named as the single highest-value missing document. The FY2025 10-K is also absent from the pool |
| **01 capital-structure-and-leverage** | Leverage is **falling, and fast**: strict net debt / reported EBITDA 3.00x (FY2024) → 1.57x (FY2025) → **1.15x** (LTM Jun-2026), net debt down $787.4m (−38.9%) from the FY2024 peak. **Canonical figure designated: net debt $1,236.4m, strict §15 basis, filing debt note, 30-Jun-2026** | **The trend is down; the trajectory is not.** Management states the current level is *below* where it wants to be ("1.2x, well below our target range of 2 to 2.5x" [`Q2 FY26 transcript, 2026-07-31`]), `business-model/11` records $3,017m of acquisition cash over FY2021–FY2025 against $2,091m of cumulative FCF, and Maverick is the first instalment (~2.43x pro-forma). Also: **$79.6m of the $256.0m cash (31.1%) cannot be readily repatriated**; **100% of the debt is senior unsecured at three holding companies, structurally subordinated to the operating subsidiaries' own creditors**, though the SEC restricted-net-assets test is clean and the Feb-2026 supplemental indenture added joint-and-several parent guarantees |
| **02 maturity-wall-and-refinancing** | **"Self-funded / low refi risk" for the next 12 months, stepping to "refinanceable in most markets" for the April 2028 wall** — on the reported structure only. Full year-by-year schedule disclosed, so **no partial-data cap binds** | **The ladder is barbelled, not smooth**: 0.92% due within 12 months, then a single $517.2m step in calendar 2028 (34.48% of the stack, of which $500.0m is the 4.550% Notes due 2028-04-15), then almost nothing until 2031. Refinancing that $500.0m at an indicative ~5.51% (4.54% 5-year Treasury at 2026-09-04 + 97bp BBB-index spread, both **web-sourced, indicative, unverified**, and the BBB index is a **spread proxy, not a rating claim**) costs +96bp ≈ $4.8m a year, 0.45% of LTM EBITDA. **"The single biggest refinancing risk is not the 2028 notes at all: it is the tenor of the debt that funds the $1.75bn Maverick purchase, which is not disclosed anywhere in this pool."** |
| **03 liquidity-runway** | **No finite runway on the reported structure**: $634.1m of normalised operating FCF against $151.0m of committed twelve-month obligations, a **$483.1m annual surplus**, with $856.0m of committed liquidity (**gross-liquidity basis**) untouched. Zero-FCF bound 35.1 months. **Liquidity runway 82/100 reported, 66/100 pro-forma**; no cap binds (revolver availability is disclosed) | **The runway depends far more on cash generation holding up than on money already in hand: 70.1% of the committed liquidity is a facility that must still be drawn, only 20.6% is freely usable cash, and the FCF doing the work is a trailing figure on peak-cycle earnings.** The $102.0m of LCs and bonds is **not** deducted from the $600.0m, because the same filing at the same date states availability of $600.0m after them — deducting again would double-count; if a future filing revealed an LC sublimit, liquidity falls to $754.0m. **And the exception: if the bridge is drawn and not termed out within twelve months, the runway falls to ~7.0 months** |
| **04 coverage-and-covenants** | Earnings cover interest many times over on every basis: reported EBITDA/net interest **14.35x**, EBIT/interest 11.25x, (EBITDA−capex)/interest 12.84x, fixed-charge coverage **7.93x**; on a **normalised mid-cycle** base 11.53x / 8.43x / 6.19x. **Tightest covenant: max net leverage 3.75x, actual 1.13x, +69.9% headroom.** Covenants fully disclosed — **no cap binds** | **The headroom is high-quality, not manufactured** — covenant EBITDA of $1,106.7m is only **3.0% above** reported EBITDA, the definition permits **exactly one addback** (non-cash share-based compensation) and **no** restructuring, deal-cost or synergy addbacks, which is the opposite of the usual addback illusion. Direction-aware sign check applied (ceiling vs floor). **But Maverick roughly halves it: +69.9% → ~+36.5%, and the breach point moves from −69.9% to −36.4%.** Two disclosure gaps carried as unknowns, with the conservative default applied: **equity cure rights not disclosed (assume none available)**; **change-of-control puts and cross-default terms on the Notes not disclosed in the data pool** |
| **05 off-balance-sheet-and-contingencies** | Total **recognized** contingent liabilities **$298.5m** (mixed dates); total **maximum / gross exposure $1,066.1m** on a **mixed basis** — 26.7% of $3,986.9m equity, 0.99x LTM reported EBITDA, 0.86x canonical net debt. Ratio max ÷ recognized **3.57x** (1.73x excluding the earnout). **`RF-OBS-001` (contingent-liability spike) FIRED** | **Two live items.** (a) The **$550.0m Maverick earnout** — post-balance-sheet, deal not closed, contingent on 2027–2028 performance, and management's language points toward paying it ("returns are expected to be significantly better if the potential additional considerations are paid"). (b) **$102.0m of bonds, letters of credit and bank guarantees with $0 booked provision, up 9.5-fold in eighteen months** (10.5 → 10.7 → 75.7 → 82.6 → 102.0) and +34.7% in six months. **The qualifier travels with the tag: the company gives the mechanism itself — face value "fluctuates with the value of our projects in process and in our backlog" — so this is growth-linked, not distress-linked; there is no named litigation, no regulatory action, no tax demand and no related-party guarantee in it.** No securitization, factoring, receivable-sale or VIE disclosure exists anywhere in the pool (zero corpus hits — a genuine nil, not an extraction failure). **$1,066.1m is a floor on the maximum, not the maximum**: disposition indemnities are stated by the company as "cannot be reasonably estimated", and litigation, asbestos, environmental PRP and warranty exposures are unquantified |
| **06 downside-stress-test** | **Ran in full; downside resilience is assessable and no cap binds.** **As-reported: nothing breaks** — −30/−40/−60% all survive with no equity raise, no asset sale and no waiver; even −60% produces only an $18.5m gap against $776.4m of usable liquidity. **Pro-forma: the covenant breaks, the liquidity does not** — −40% breaches the 3.75x ceiling by 5.9% but clears the 4.25x election by +6.6%; −60% breaches both covenants and turns FCF negative | **"That is not an earnings question at all; it is a market-access question."** The bridge-not-termed-out case breaks at `h ≈ −0.59` — a **$557.9m (Case B) to $565.4m (Case A) funding gap at today's EBITDA**, widening to ~$940m at −40% and ~$1,130m at −60%. **Every scenario is a zero-mitigation BOUND, not a forecast**, and is labelled as one; the measured realised-offset case (58% cost-channel offset, quarterly path 40% → 79%) is run beside them, and the cost channel cannot produce a −30/−40/−60% fall at all — that requires a volume event, and **the volume decremental is not measurable from this pool** |

---

## 3. Reconciliation

**No material disagreement between specialists on any number.** Every figure ties across agents, and the four places where two numbers exist for the same concept are definitional differences that each agent labelled rather than averaged. They are listed here because carrying them silently would be the §3 defect this section exists to catch.

| Item | The two readings | Sources | Reconciled (more conservative) view |
|---|---|---|---|
| **Total debt** | **$1,492.4m** (filing basis) vs **$1,632.9m** (Capital IQ) | `Q2 FY26 10-Q, Note 10` vs `CIQ Financials → Balance Sheet` / `ciq_facts.json` | **Not a disagreement — a definitional gap of exactly $140.5m of operating-lease liabilities**, which US GAAP keeps off the debt line. `01` designates the **filing basis** as canonical and shows both, each under its own source. The vendor read is accepted as accurate on its own basis and is not overridden (§5 sidecar rule) |
| **Net debt** | **$1,236.4m** strict §15 (canonical) · **$1,316.0m** strict excluding trapped cash · **$1,376.9m** vendor lease-inclusive | `01` §4 and §7 | **Canonical is $1,236.4m strict.** The **$1,316.0m** conservative variant is the one `03` and `06` use for stress work, and `01` instructed exactly that. Any quote of $1,376.9m must carry the "Capital IQ lease-inclusive vendor basis" label. **Nothing is presented as bare "net debt" without its basis** |
| **Interest coverage** | **14.35x** (this module) vs **14.794x** (`CIQ Financials → Ratios`) | `04` §1 | **Named, not averaged.** The vendor's Ratios tab implies a ~$72.6m denominator while the same workbook's Income Statement and the 10-Q's own quarterly lines both give **$74.9m**; the vendor's own EBIT/interest row (11.251x) uses $74.9m, so that tab is internally inconsistent. `ciq_facts.json` reports 14.3x, matching this module exactly. **This module uses 14.35x**, built from the filing's own quarterly interest lines |
| **Finance leases at 30-Jun-2026** | **$17.8m** carried forward vs **$0.0m implied** by the vendor's lease total | `05` §1 resolution table | **$17.8m is carried, conservatively.** The vendor's zero is a **disclosure artefact** — at 30-Jun-2026 its lease total equals the 10-Q's operating-lease liabilities to the cent, because Note 8 itemises operating leases and stops. Nothing in the pool says the leases were repaid, and their last-disclosed remaining term was ~12 years. *Carry-forward from 31-Dec-2025. Inference, not from filings.* At 1.2% of gross debt it moves no ratio |
| **Verdict-level tension (the real one)** | `02`, `03` and `06` all reach the bridge tenor independently — from the maturity side, the liquidity side and the stress side — and all three say the same thing | `02` §5; `03` §5; `06` §4 | **Convergence, not disagreement — and it is why the pro-forma read governs the verdict.** Three specialists working different questions on the same pool arrived at the same single missing fact |

---

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| **Maturity concentration** | % due within 24m | **35.29% ($529.3m of $1,500.0m principal)**, of which **$500.0m is one instrument on one date — 2028-04-15**. Within 12m: 0.92% ($13.8m). **Pro-forma: not assessable — the acquisition-debt tenor is not disclosed, so no pro-forma schedule is constructed** [`02` §1a, §2, §4] | A barbelled ladder hides its shape behind a 4.42-year average. Today the concentration is small and 19 months out; if the bridge is termed out with paper maturing before or alongside April 2028, the modest step becomes a genuine wall |
| **Availability liquidity** | usable liquidity vs uses | **$856.0m gross-liquidity basis** (cash $256.0m + **disclosed, committed, non-borrowing-base** revolver availability $600.0m); **$776.4m** excluding repatriation-limited cash — the figure `06` uses in every solve. **But 70.1% is undrawn facility, not cash; only $176.4m (20.6%) is freely usable cash.** $300.0m accordion **excluded** (lender consent). No minimum-liquidity covenant exists to subtract [`03` §1] | The revolver is real liquidity here — availability is stated by the filing, it is not borrowing-base, it does not mature until 2030-06-30, and drawing the full $600.0m still leaves covenant leverage at 1.67x against a 3.75x ceiling. But it is money that must be borrowed, not money sitting there |
| **Covenant illusion risk** | covenant EBITDA vs reported | **Covenant EBITDA $1,106.7m vs reported EBITDA $1,074.6m — only 3.0% above.** Exactly one addback permitted (non-cash share-based compensation $40.5m), less $8.4m of restructuring and other non-operating expense not added back. **No** restructuring, deal-cost or synergy addback exists. **Risk: LOW — this is the opposite of an addback illusion** [`04` §2] | The usual way headroom is fake is a definition running 30–50% above the audited number. Here headroom is measured against a near-GAAP denominator, so +69.9% is real. **The one caveat that must travel: pro-forma covenant EBITDA adds Maverick's implied ~$152.2m company-*adjusted* figure to a covenant that permits almost no addbacks — that line probably flatters the pro-forma ratio** |
| **Floating-rate sensitivity** | floating % net of hedges | **13.3% ($200.0m term loan, average rate 4.903%)**; 86.7% fixed ($1,300.0m of notes). **No interest-rate hedge — the $350.5m of cross-currency swaps hedge currency, not rate.** +200bp = **+$4.0m a year**, 0.37% of LTM EBITDA. **Pro-forma this is a bound, not a fact: the fixed/floating split of the acquisition financing is not disclosed;** if all $1,750m floated, +200bp = +$35.0m [`02` §3; `06` §2B] | Material to state and immaterial to the answer on the reported stack. It becomes material only if the acquisition is funded floating and left that way |
| **Structural subordination** | HoldCo debt vs upstreaming | **100% of the debt sits at three holding companies** (nVent Electric plc, nVent Finance S.à r.l., Hoffman Schroff Holdings, Inc.), none of it guaranteed by the operating subsidiaries; the filing states plainly that no other subsidiary is "under any direct obligation to pay or otherwise fund amounts due on the Notes". **Upstreaming: the SEC restricted-net-assets test is clean** — "no significant restrictions… none of the assets… represents restricted net assets" — but the company also discloses possible "statutory and regulatory limitations on the payment of dividends from certain subsidiaries", unquantified. Feb-2026 supplemental indenture added full joint-and-several parent guarantees [`01` §6A] | Trade creditors, employees and tax authorities of the operating companies rank ahead of every dollar of this debt on those companies' assets. The clean restricted-net-assets test is filing-grade evidence rather than a management adjective, so **the MODULE_RULES "upstreaming unclear" cap does not bind** — but the residual, unquantified statutory limit is real |
| **Contingent accelerants** | CoC puts / cross-default | **Change-of-control puts and cross-default terms: NOT DISCLOSED in the data pool** (the only change-of-control language anywhere in the pool sits in equity-award agreements). **Equity cure rights: NOT DISCLOSED — conservative default applied, assume none available.** **A rating-linked pricing step DOES exist** — the credit-facility margin can be set off nVent's public debt rating — but it is a **pricing** step, not a default trigger, and **no rating-agency report is in this pool, so no rating is asserted** [`01` §1; `04` §2] | These do not change the headroom arithmetic, because headroom is measured off disclosed thresholds and disclosed actuals. They change the **consequence** of a breach — which is precisely why they are named rather than left out |

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | **N** — full year-by-year table to "thereafter" disclosed [`Q2 FY26 10-Q, Note 10`; `02` §1] | Solvency strength | max 70 — **not applied** |
| No covenant disclosure | **N** — both maintenance covenants, both thresholds, the 4.25x acquisition election and the covenant-EBITDA definition including the $250.0m cash-netting cap are all disclosed [`04` §2] | Covenant headroom | "Not assessable"; usefulness max 75 — **not applied. Covenant headroom IS assessable: 68/100** |
| No cash flow statement | **N** — 10-Q statements of cash flows plus the Capital IQ Cash Flow tab (FY2021–FY2025 + LTM Jun-30-2026) [`03` §3A] | Liquidity runway | max 50 — **not applied** |
| Only annual data (no interim) | **N** — Q1 and Q2 FY26 10-Qs are both in the pool; the balance sheet used is ~2 months old | Solvency strength | max 75 — **not applied** |
| No EBITDA base (stress not run) | **N** — LTM reported EBITDA $1,074.6m plus a five-year series and forward consensus; **the stress test ran in full** [`06`] | Downside resilience | "Not assessable"; usefulness max 70 — **not applied. Downside resilience IS assessable: 66/100** |
| *(MODULE_RULES additional)* No undrawn-facility disclosure | **N** — $600.0m committed, $0 drawn, capacity stated | Liquidity runway | — |
| *(MODULE_RULES additional)* No interest-expense detail | **N** — net interest by period plus per-instrument average rates. *Interest is disclosed on a NET basis only; `04` §1 tested the size of the possible error and found the net line is not flattered by hidden interest income* | Coverage | — |
| *(MODULE_RULES additional)* Revolver exists but availability unknown | **N** — availability disclosed outright, not borrowing-base | Liquidity runway max 60 | **not applied** |
| *(MODULE_RULES additional)* Covenant headroom relies on assumed addbacks | **N** — the covenant-EBITDA definition is filed; headroom rests on disclosed terms | Covenant headroom max 60 | **not applied** |
| *(MODULE_RULES additional)* HoldCo material debt, upstreaming unclear | **N** — Obligor Group mapped; SEC restricted-net-assets test clean [`01` §6A] | Solvency strength max 70 | **not applied** |
| *(MODULE_RULES additional)* Off-balance-sheet undisclosed for a known-litigious/levered name | **N** — Note 15 contingencies, pension, lease and tax detail all present; `RF-OBS-001` fired on **disclosed** figures, not on absence | Solvency strength max 75 | **not applied** |
| *(MODULE_RULES additional)* No credit ratings | **N/A — not a score cap; a recording duty** | 99 | **Recorded: no rating-agency report exists in the pool. No rating is inferred. Management's stated "intent to maintain investment grade metrics" is management language, not an agency action, and is not treated as a rating** |

**No score cap binds.** `00` checked all nine cap rows and found none active; each downstream agent independently confirmed the same. **The scores above are therefore judgment-limited, not cap-limited** — solvency strength sits at 72 because of the undisclosed acquisition financing, not because a rule forced it there.

---

## 5. Survival Summary

**How levered, and which way.** On the balance sheet nVent actually reports, it is lightly levered and the direction has been sharply down: strict net debt of $1,236.4m is **1.15x** peak LTM EBITDA and **1.43x** on a normalised mid-cycle base, against **3.00x** at FY2024 — 1.85 turns removed, driven mostly by the $1.65bn Thermal Management disposal (which funded $866.3m of debt repayment in H1 2025) and by EBITDA rising 59.1% since FY2024, with ordinary repayment a distant third. **But the trend and the trajectory point opposite ways, and the module says so rather than reporting the flattering half:** management calls 1.2x "well below our target range of 2 to 2.5x", `business-model/11` records $3,017m of acquisition cash over FY2021–FY2025 against $2,091m of cumulative free cash flow, and the signed Maverick purchase takes pro-forma net leverage to **~2.43x** on peak EBITDA, **~2.94x** mid-cycle, **~2.88x** with the earnout paid — *every one of those a labelled pro-forma inference, never a reported figure.*

**Is the near-term wall self-funded or refinancing-dependent?** **Self-funded, on the reported structure, and by a wide margin.** Only $13.8m — 0.92% of principal — falls due inside twelve months, which is 2.2% of one year's normalised free cash flow. The wall proper is a single $500.0m instrument, the 4.550% Notes due 2028-04-15, about 19 months out; two years of run-rate FCF after dividends (~$1,046m) would cover it twice, and the $600.0m committed revolver could bridge it alone. Refinancing it at an indicative ~5.51% costs +96bp, roughly $4.8m a year, 0.45% of LTM EBITDA. **What is genuinely refinancing-dependent is not in the table at all: the $1.75bn of new acquisition debt, whose tenor the pool does not disclose.**

**How long the runway, and how close the tightest covenant.** There is **no finite runway** to state on the reported structure — $634.1m of normalised operating FCF covers $151.0m of committed twelve-month obligations with a **$483.1m annual surplus**, and the $856.0m of committed liquidity is untouched; ignoring the operations entirely gives a 35.1-month bound, or 10.5 months on cash alone. The tightest covenant, a **3.75x maximum net leverage ceiling**, sits at **1.13x** on the credit agreement's own definitions — **+69.9% clear**, and that cushion is high-quality because covenant EBITDA is only 3.0% above the GAAP number. **Pro-forma, headroom roughly halves to ~+36.5%, and on a normalised base with the earnout paid it compresses to +9.1%.**

**Where it first breaks, and whether a normal recession is survivable.** **As-reported: a normal recession is survivable outright.** −30% and −40% leave net leverage at 1.64x / 1.92x, interest covered 10.0x / 8.6x, covenant headroom +57.0% / +49.8%, and an annual cash surplus of $232.3m / $148.7m — no equity raise, no asset sale, no waiver. The first thing to break would be the leverage covenant, and only at **−69.9%**; even −60% leaves an $18.5m gap against $776.4m of usable liquidity. **Pro-forma: a normal recession is not survivable on the standing covenant without help.** −40% breaches the 3.75x ceiling by 5.9% — clearing the **4.25x acquisition election** (a company election, not a lender negotiation) by +6.6%, but only for four testing periods, under conditions the pool does not disclose. −60% breaches both covenants, turns FCF negative (−$13.5m) and opens a $164.5m gap. **And the true first break is neither**: if the committed Bank of America bridge is drawn at a Q4 2026 close and is not termed out within twelve months, the gap is **$557.9–565.4m at today's earnings, at zero EBITDA decline** — a market-access break, not an earnings break, with no tenor, pricing or take-out plan anywhere in this pool.

---

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| **Adequate** *(as-reported alone: Solid)* | (a) Maverick financing disclosed as **long-dated term paper** (5–10 year notes or a term loan maturing 2031+) rather than a short bridge — this alone removes the $557.9–565.4m twelve-month gap and would move the verdict to **Solid**. (b) Financing sized so pro-forma covenant leverage stays under ~2.0x — e.g. a larger cash component or partial equity. (c) A rating-agency report confirming investment grade, which would pin refinancing access and cost. (d) Explicit disclosure that the 4.25x election is **not** being used, i.e. the company sits inside 3.75x unaided. (e) Evidence the $102.0m of LCs/bonds sits **outside** the revolver with no sublimit | (a) Bridge drawn at close with **tenor inside twelve months** and no announced take-out — this is the path to **Stretched**, because survival would then depend on refi access rather than on earnings. (b) Acquisition debt priced floating and unhedged (a +200bp shock would then cost ~$35.0m a year, not $4.0m). (c) Maverick's actual EBITDA landing materially below the ~$152.2m implied from the release's own 11.5x, which would raise every pro-forma leverage figure one-for-one. (d) Disclosure that Maverick carries its own net debt consolidating at close — `06` assumed **zero** and flagged it as the flattering assumption. (e) The full $550m earnout becoming probable while EBITDA sits at a mid-cycle level (covenant leverage 3.41x, only −9.1% from breach). (f) An LC sublimit inside the revolver, cutting usable liquidity to $754.0m. (g) Disclosure of a change-of-control put or cross-default that accelerates on a breach | **1. The Maverick Power financing terms — the 8-K, commitment letter or credit-agreement amendment giving the debt/cash mix, tenor, pricing, fixed/floating split, and whether the 4.25x election is being taken.** 2. A rating-agency report (Moody's / S&P / Fitch). 3. The credit agreement itself, for equity-cure mechanics and the "certain conditions" attaching to the 4.25x election. 4. The Notes' indentures, for change-of-control puts and cross-default. 5. The FY2025 Form 10-K (absent from the pool), for audited FY2025 lease, pension and contingency notes and the current-year purchase-commitment figure. 6. Maverick's own balance sheet — whether it brings net debt |

---

## 6A. Survival Playbook (non-speculative levers)

Only levers with evidence in the pool. Nothing speculative, and no probability attached to any of them.

- **Refi actions already taken (proven market access, not intention).** June 2025: the credit agreement was **amended and restated**, replacing three earlier term loans with a five-year $275.0m term loan and a five-year $600.0m revolver, both maturing 2030-06-30. February 2026: a **supplemental indenture** added nVent Electric plc and Hoffman Schroff Holdings as full, unconditional, joint-and-several guarantors of the Notes — a credit-package upgrade. August 2026: **committed bridge financing secured from Bank of America** for the Maverick purchase price. Bank and bond access is therefore evidenced within the last fifteen months [`Q2 FY26 10-Q, Note 10`; `nVent news release, 2026-08-24`; `02` §4].
- **The 4.25x covenant election — contractual, and it does not require lender consent at the time.** The credit agreement permits 4.25x "at nVent Finance's election and subject to certain conditions, for four testing periods in connection with certain material acquisitions" [`Q2 FY26 10-Q, Note 10`]. **It is not a waiver.** Two limits travel with it: it lasts **four testing periods, not indefinitely**, and the "certain conditions" are **not disclosed in the pool**. At a pro-forma −40%, it clears with +6.6% to spare [`06` §2B].
- **Term-loan prepayment is proven and immediate.** The $200.0m term loan is prepayable and the company repaid nearly **$70m of it in Q2 2026 alone** [`Q2 FY26 transcript, 2026-07-31, prepared remarks (CFO)`]. Debt repayment — not cash accumulation — is the only lever that helps the leverage covenant, because cash netting is **capped at $250.0m** and $6.0m of today's $256.0m already earns no covenant credit [`04` §3].
- **Capex is genuinely flexible, and the filings show which part.** FY2026 capex is guided to **~$130m, up 40%**, with management stating "most of this increased investment is for **new capacity** to support growth in data centers, power utilities and supply chain resiliency" [`Q2 FY26 transcript, 2026-07-31`]. The maintenance proxy is **~$66.7m** (depreciation, i.e. total D&A $231.9m less $165.2m of acquisition intangible amortisation) — *a labelled proxy; nVent does not split maintenance from growth capex anywhere in the pool* [`03` §2]. The gap between the two is the cuttable amount.
- **Dividend and buyback suspension: available, and sized.** Buybacks ran **$58.0m LTM** with **no authorisation amount or minimum commitment disclosed** — stoppable at will, and `03` therefore excludes them from committed uses. The dividend is **$137.2m a year** run-rate ($0.21/share quarterly declared 16 May 2026 on ~162m shares), declared quarterly and legally cancellable, though paid and raised every year in the pool. **No contractual constraint on suspending either appears anywhere in the pool.** Together they restore **$195.2m a year, which closes every liquidity gap in the pro-forma stress grid** [`03` §2; `06` §4].
- **Asset sales: none announced or authorised.** The last disposal, Thermal Management for $1.65bn, closed 30-Jan-2025 and is already in the balance sheet. **No disposal programme exists in the pool** — asset-sale capacity is not claimed as a lever here [`02` §4].
- **Covenant-amendment likelihood: not assessable from this pool.** No prior waiver, amendment-for-relief or covenant reset appears in any pool document, and equity-cure mechanics are undisclosed (conservative default applied: **assume no cure right**). The June 2025 amend-and-restate was a refinancing, not a covenant relief — do not read it as evidence of amendment willingness [`04` §2].

---

## 7. Note To The Final Synthesizer

- **Leverage, gross and net, with direction.** **REPORTED: gross debt $1,492.4m (filing basis, excludes $140.5m of operating leases — US GAAP keeps them off the debt line), net debt $1,236.4m strict §15. Gross leverage 1.39x; net leverage 1.15x on peak LTM EBITDA of $1,074.6m, 1.16x adjusted, 1.43x on a normalised mid-cycle $863.6m.** Direction: **down hard** — 3.00x (FY2024) → 1.57x (FY2025) → 1.15x, net debt −$787.4m. **Direction of travel is the opposite:** management targets 2.0–2.5x and calls today's level "well below" it; $3,017m of acquisition cash over FY2021–FY2025 against $2,091m of cumulative FCF; **pro-forma Maverick ~2.43x peak / ~2.94x mid-cycle — labelled inference, never reported.**
- **The maturity wall, and whether refinancing is secured or exposed.** 0.92% ($13.8m) due within 12 months; **35.29% ($529.3m) within 24 months, concentrated in one instrument on one date — $500.0m of 4.550% Notes on 2028-04-15**. WAM 4.42 years. **The 2028 wall is not the problem — it is coverable from two years of FCF or from the revolver alone, at a +96bp refi cost of ~$4.8m a year. The exposed piece is the $1.75bn of acquisition debt whose tenor the pool does not disclose;** `02` explicitly declines to construct a pro-forma maturity schedule because doing so would require inventing the tenor.
- **The liquidity runway, and what it depends on.** **No finite runway** reported or pro-forma: $634.1m of normalised operating FCF against $151.0m of committed twelve-month obligations, a $483.1m surplus, $856.0m of committed liquidity untouched (gross-liquidity basis). **It depends on the flow, not the stock: 70.1% of that liquidity is an undrawn facility that must still be borrowed, only $176.4m (20.6%) is freely usable cash, and the FCF doing the work is trailing and at a cycle peak.** Strip FCF out and the bound is 35.1 months; strip the revolver too and it is 10.5 months, or 7.2 months on freely usable cash. **The one case where the runway becomes short is ~7.0 months, and it is the bridge case.**
- **The tightest covenant and its headroom.** **Max net leverage 3.75x** (Senior Credit Facilities, stated by the filing to be "the most restrictive"), electively **4.25x for four testing periods in connection with certain material acquisitions**. **Reported actual 1.13x → +69.9% headroom**; second covenant min interest coverage 3.00x, actual 14.78x, +392.5%. **The headroom is high-quality — covenant EBITDA is only 3.0% above reported EBITDA, one addback only, no restructuring / deal-cost / synergy addbacks.** **Pro-forma ~+36.5%, falling to +23.2% mid-cycle and +9.1% mid-cycle with the earnout paid.** **Undisclosed and treated conservatively: equity cure rights (assume none), change-of-control puts, cross-default terms.**
- **The largest live off-balance-sheet / contingent exposure.** **The $550.0m Maverick Power earnout** — post-balance-sheet, deal not closed, contingent on 2027–2028 performance, and management's own language points toward payment ("returns are expected to be significantly better if the potential additional considerations are paid"). Second: **$102.0m of bonds, letters of credit and bank guarantees, $0 booked provision, up 9.5-fold in eighteen months.** **Total maximum / gross exposure $1,066.1m — a MIXED-BASIS aggregate, and the build must travel with it: operating leases undiscounted 171.4 (scaled from a disclosed ratio — inference) + finance leases undiscounted 30.5 (31-Dec-2024) + pension gross PBO 122.7 (31-Dec-2025, vendor read) + OPEB 11.1 (31-Dec-2025) + gross uncertain tax positions 11.7 (31-Dec-2024) + bonds/LCs/guarantees face value 102.0 (30-Jun-2026) + purchase commitments 66.7 (calendar 2025 only, stale) + Maverick earnout cap 550.0 (post-balance-sheet, deal not closed) = 1,066.1.** It mixes recognized liabilities shown pre-discount, instrument face values, a stale one-year commitment and an un-closed earnout cap. **It is a FLOOR on the maximum, not the maximum** — disposition indemnities are stated by the company as "cannot be reasonably estimated", and litigation, asbestos, environmental PRP and warranty exposures are unquantified. Against $3,986.9m of equity it is 26.7% (12.9% excluding the earnout); max ÷ recognized 3.57x (1.73x excluding the earnout).
- **`RF-OBS-001` (contingent-liability spike) — FIRED, propagated as a standalone line.** Emitted by `05_off-balance-sheet-and-contingencies`. Mechanical test met on both limbs: max ÷ recognized **3.57x** (threshold 3x) and max ÷ equity **26.7%** (threshold 15%). **The qualifier travels with it and must not be stripped: there is no named litigation, no regulatory action, no tax demand, no related-party guarantee and no distress signal in it. The company gives the mechanism itself — the bonds/LC face value "fluctuates with the value of our projects in process and in our backlog" — so the spike is growth-linked, the arithmetic consequence of writing a $1.75bn cheque and posting more performance bonds as the order book grows.** This module's own solvency scores already absorbed it; it is carried here as a standalone tag so the master's cross-module forensic roll-up can read it (synthesizer.md Pre-Write Gate step 4B; CLAUDE.md §11, §13; eval check AQ).
- **The stress break point — what fails first, and at what EBITDA decline.** **REPORTED: the 3.75x leverage covenant, at −69.9%** (coverage floor at −79.7%; liquidity never exhausted on an earnings decline alone, `h = 1.51`). **PRO-FORMA: the same covenant, at −36.4%** (−43.9% on the 4.25x election; −24.8% with the earnout paid; **a further −9.1% from a normalised mid-cycle base with the earnout paid — the most fragile figure the module produces**). **THE ACTUAL FIRST BREAK IS NEITHER: the bridge-not-termed-out case breaks at `h ≈ −0.59`, i.e. a $557.9m (Case B) to $565.4m (Case A) funding gap at TODAY's EBITDA, before any decline** — widening to ~$940m at −40% and ~$1,130m at −60%. **That is a market-access break, not an earnings break, and no earnings scenario contains it.** **Every stress line is a zero-mitigation BOUND, not a forecast**; the measured realised-offset case (58% cost-channel offset, path 40% → 79%) runs beside them, and the cost channel cannot produce a −30/−40/−60% fall at all — reaching −40% that way needs a $1,023.4m gross shock, 19.0% of guided FY2026 sales.
- **Net cash / strategic-flexibility read: NOT APPLICABLE.** nVent is **not** net cash — net debt is $1,236.4m — so CLAUDE.md §24 Filter 3's net-cash credit does not apply and is not claimed. What the reported structure does earn on its own terms: 100% senior unsecured with nothing pledged, 86.7% fixed-rate, a $600.0m committed undrawn revolver running to 2030, no minimum-liquidity covenant, and 1.85 turns of leverage removed since FY2024. **What §24 Filter 3 and Filter 4 do flag: this is a serial acquirer deliberately re-levering — $3,017m of deal cash against $2,091m of cumulative FCF, and management stating an intention to move leverage UP toward 2.0–2.5x. Under Filter 3, choosing to add leverage is not a strength to credit; it is the risk the filter exists to price.**
- **Partial-data caps: NONE applied.** All nine MODULE_RULES cap rows checked and cleared in §4; `00` returned **Sufficient** with 0 extraction failures. **What limits the read is judgment, not a cap:** the single most material forward fact — the Maverick financing mix, tenor, pricing and fixed/floating split — is absent, which is why solvency strength is 72 rather than the mid-80s the reported balance sheet alone would carry, and why refinancing risk is 55 rather than ~25. **Also recorded per MODULE_RULES: no credit-rating-agency report exists in this pool. No rating is inferred or asserted anywhere in this module. Management's stated "intent to maintain investment grade metrics" is management language, not an agency action; the BBB index used by `02` is a credit-spread proxy, not a rating claim.** The FY2025 Form 10-K is also absent, so FY2025 lease, pension and contingency detail is read through a tier-5 vendor export or the FY2024 10-K and cited as such.
- **Biggest missing data point — the single highest-value next data request.** **The Maverick Power financing disclosure: the 8-K, commitment letter or credit-agreement amendment setting out the debt-versus-cash mix, the TENOR, the pricing, the fixed/floating split, and whether the 4.25x acquisition covenant election is being taken.** One item, not ten. Every forward leverage, coverage, covenant-headroom, maturity-wall and liquidity figure in this module turns on it, and three independent specialists (`02`, `03`, `06`) converged on it from three different directions. *Second-highest, for completeness only: a rating-agency report, to pin refinancing access and the cost of that new debt.*
- **EXPLICIT HANDOFF.** The master synthesizer's **"Balance Sheet and Survival Test"** section should **defer to this synthesis** and not re-derive it. Take the verdict (**Adequate**, with as-reported **Solid** stated alongside), the leverage figures **with their basis labels intact** (strict §15 net debt; reported vs adjusted vs mid-cycle EBITDA; pro-forma never as reported), the covenant headroom (+69.9% reported / ~+36.5% pro-forma), and **the three break points — −69.9% as-reported, −36.4% pro-forma, and `h ≈ −0.59` (i.e. a $557.9–565.4m gap at zero decline) in the bridge case — as the inputs to the master's downside scenario and risk register. This module assigns NO probabilities, produces no fair value, no risk/reward, no rating and no position size; the master assigns probabilities, not this module.** One instruction on how to use them: **the bridge case is not a tail of the earnings distribution — it is a separate, orthogonal state that must be given its own scenario line rather than folded into the −40% column.**

---

## 8. Simple Summary

- **Debt:** $1,492.4m gross on the company's own debt note (all senior unsecured, nothing pledged, sitting at three holding companies), $256.0m of cash, so **$1,236.4m net** — **1.39x gross and 1.15x net** against last year's earnings, or **1.73x / 1.43x** against a more normal year. Leverage has fallen from 3.00x in 2024. Management says it wants it back up to 2.0–2.5x.
- **The wall:** almost nothing due soon — **$13.8m, under 1% of the debt, in the next twelve months**. The real date is **15 April 2028**, when **$500.0m** of notes come due — about 19 months away, and coverable from two years' cash flow or from the untouched $600.0m credit line. **Covered.**
- **Runway:** **there isn't a finite one.** The business throws off about **$634m of cash a year** against **$151m** of committed payments. Ignore the business entirely and the money already committed lasts about **35 months**; ignore the credit line too and it is about **10.5 months** on cash.
- **Tightest covenant:** the lenders' limit is **3.75x**; nVent is at **1.13x** — **69.9% clear**. Earnings would have to fall **almost 70%** to break it. That cushion is real, not an accounting trick: the lenders' definition of profit is only 3% above the audited number.
- **Biggest off-balance-sheet item:** the **$550m earnout** on the Maverick deal, payable if the acquired business hits 2027–2028 targets — management says returns are better if it gets paid. Behind it, **$102m of performance bonds and letters of credit with nothing set aside against them, up nine-and-a-half-fold in eighteen months** — that growth tracks the order book, not trouble, but it is un-booked and moves one way. Total worst-case contingent exposure is **$1,066.1m on a mixed basis, and that is a floor, not a ceiling** — some exposures the company says cannot be sized at all.
- **Does it survive a 30–60% earnings drop?** **On today's balance sheet, yes — all of it, with no rescue needed.** Even a 60% fall leaves an $18.5m shortfall against $776.4m of available money. **After the $1.75bn Maverick deal closes, no**: a 40% fall breaks the standing covenant and needs the temporary 4.25x acquisition election (which the contract allows for four quarters) or a lender waiver; a 60% fall breaks both covenants and burns cash.
- **Key data gap:** **no credit-rating report exists in this pool, so no rating is claimed anywhere here** — and, more important, **nobody has disclosed how the $1.75bn is being financed.** If the Bank of America bridge loan is drawn and not replaced with long-term debt inside a year, there is a **$558–565m hole at today's earnings, before anything goes wrong**. That single missing document is the highest-value next request.
- **Useful for the master synthesizer?** **Yes — 84/100.** Every leverage, coverage, covenant and stress number is built from filings with the formula shown, the one unanswerable question is named rather than guessed, and the verdict is **Adequate** — **Solid** on the balance sheet as it stands today, **Adequate** once the signed acquisition is counted, and it would slip to **Stretched** if the bridge turns out to be short-dated with no take-out announced.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Data pool:** data/NVT/ (frozen evidence generation `6db32848…d1e6`) · **Triage date:** 2026-09-07
**Pool integrity:** manifest reports 15 sources, 2 workbooks, 20 tabs, 33 extracts written, **0 failures**. No `external/` folder exists in this pool, so there are no external-research rows and no §1A table.
**Periods below are read from INSIDE each document** (period-end / "as of" / fiscal-year lines), not from file timestamps (fix F23). Every file in the pool was synced on 2026-09-07, so the sync date carries no information.

---

## 1. File Inventory

Every one of the 15 pool files is listed. Both multi-tab workbooks are broken out: each of the 20 tabs is its own row with parent file, sheet name and rows x cols, reconciled against `manifest.json`. No workbook appears as a single opaque row.

### 1.1 Documents (13 non-workbook files)

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| nVent Electric plc, 2025.pdf | Annual filing — SEC Form 10-K, audited | FY ended Dec 31, 2024 (filed 2025) | 2026-09-07 (Drive sync — not informative) | **High** — Note 10 Debt, Note 13 Benefit Plans, Note 17 Leases, Note 18 Commitments & Contingencies, MD&A liquidity |
| nVent Electric plc, Q2 2026.pdf | Quarterly filing — SEC Form 10-Q | Quarterly period ended Jun 30, 2026 | 2026-09-07 (sync) | **High** — most recent balance sheet, Note 10 Debt + maturity table + covenants, Note 15 Contingencies, cash flow statement |
| nVent Electric plc, Q1 2026.pdf | Quarterly filing — SEC Form 10-Q | Quarterly period ended Mar 31, 2026 | 2026-09-07 (sync) | High — prior-quarter debt, covenants, cash flow |
| nVent Electric plc, 2026.pdf | Quarterly filing — SEC Form 10-Q (**duplicate of Q1 2026.pdf**, same period, different extraction render: 151,205 vs 165,957 chars) | Quarterly period ended Mar 31, 2026 | 2026-09-07 (sync) | Medium — duplicate content; do not double-count |
| nVent Electric plc, 2026 rev.pdf | SEC Form **11-K** — employee retirement savings plan annual report (nVent Management Company Retirement Savings and Investment Plan) | Plan FY ended Dec 31, 2025 | 2026-09-07 (sync) | Low — defined-contribution plan; no corporate debt or company pension obligation |
| nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf | Transcript | Q2 2026 results call, Jul 31, 2026 | 2026-09-07 (sync) | Medium — management commentary on cash, capital deployment, acquisition funding |
| nVent Electric plc, Q1 2026 Earnings Call, May 01, 2026.pdf | Transcript | Q1 2026 results call, May 1, 2026 | 2026-09-07 (sync) | Medium — same, one quarter earlier |
| nVent Electric plc, Q1 2026 ppt.pdf | Investor deck — Q1 2026 earnings presentation | Dated May 1, 2026 | 2026-09-07 (sync) | Medium — free-cash-flow and capital-deployment slides |
| 2026-William-Blair-Conference-nVent-NVT-Presentation.pdf | Investor deck — conference presentation | Dated June 3, 2026 | 2026-09-07 (sync) | Low–Medium — strategy/growth framing; thin on balance-sheet detail |
| nVent-to-Acquire-Maverick-Power-2026.pdf | Material-event press release (acquisition announcement) | Dated Aug 24, 2026 | 2026-09-07 (sync) | **High** — $1.75bn cash purchase price plus up to $550m contingent earnout, expected to close Q4 2026, to be funded with "available cash on hand and new debt" (financing terms not yet disclosed) |
| nVent Electric plc NYSE NVT Competitors.rtf | Capital IQ profile export — competitors | Recently disclosed competitors, LTM dates to Jun-30-2026 | 2026-09-07 (sync) | Low |
| nVent Electric plc NYSE NVT Products.rtf | Capital IQ profile export — products | Sourced from 2023/2026 Form 10-K product lists | 2026-09-07 (sync) | Low |
| nVent Electric plc NYSE NVT Strategic Alliances.rtf | Capital IQ profile export — alliances | "No recently disclosed strategic alliances"; prior-period entries only | 2026-09-07 (sync) | Low |

### 1.2 Workbook — nVent Electric plc NYSE NVT Financials.xls (Capital IQ, 13 tabs, status ok)

Workbook-level header: Reported Currency USD, in millions. Capital Structure Details block sourced from "A 2025 filed Feb-17-2026"; latest financial column is LTM 12 months Jun-30-2026.

| Filename (parent · tab) | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| Financials.xls · Key Stats (91x9) | Capital IQ export | FY2022A–FY2025A + LTM Jun-30-2026 | 2026-09-07 (sync) | Medium |
| Financials.xls · Income Statement (108x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — EBITDA base for leverage and the stress test; interest expense |
| Financials.xls · Balance Sheet (94x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — Cash 256.0, Total Debt 1,632.9, Net Debt 1,376.9, Total Equity 3,986.9 at Jun-30-2026 |
| Financials.xls · Cash Flow (76x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — Cash from Ops 690.6, capex 112.9, debt repaid 75.3, dividends 132.9 (LTM Jun-30-2026) |
| Financials.xls · Multiples (91x9) | Capital IQ export | 6 quarterly closes, latest as-of 2026-08-12 | 2026-09-07 (sync) | Low — valuation, not solvency |
| Financials.xls · Historical Capitalization (39x7) | Capital IQ export | FY2021–FY2025 + latest | 2026-09-07 (sync) | **High** — debt/equity mix through time |
| Financials.xls · Capital Structure Summary (99x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — debt stack summary |
| Financials.xls · Capital Structure Details (40x10) | Capital IQ export | FY2025 (Dec-31-2025) and FY2024 as-reported blocks | 2026-09-07 (sync) | **High** — instrument-level principal, coupon, floating flag, maturity date, seniority, secured flag |
| Financials.xls · Ratios (161x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — coverage, leverage, ROIC series |
| Financials.xls · Supplemental (74x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | Medium |
| Financials.xls · Industry Specific (15x6) | Capital IQ export | Sparse (20 populated cells) | 2026-09-07 (sync) | Low |
| Financials.xls · Pension OPEB (243x7) | Capital IQ export | FY2020–FY2025 annual | 2026-09-07 (sync) | **High** — defined-benefit obligation, plan assets, funded status |
| Financials.xls · Segments (84x7) | Capital IQ export | FY2021–FY2025, business + geographic | 2026-09-07 (sync) | Medium — asset base / divestment capacity |

### 1.3 Workbook — nVentElectricplcNYSENVTEstimatesReport.xls (Capital IQ Estimates, 7 tabs, status ok)

Workbook-level header: Consolidated, **Accounting Standard: US GAAP**, Reported Currency USD.

| Filename (parent · tab) | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| EstimatesReport.xls · Consensus (462x41) | Capital IQ estimates | Forward FY2026–FY2028 consensus | 2026-09-07 (sync) | Medium — forward EBITDA for the stress-test baseline |
| EstimatesReport.xls · Recent Changes (265x10) | Capital IQ estimates | Recent broker revisions | 2026-09-07 (sync) | Low |
| EstimatesReport.xls · Guidance (179x41) | Capital IQ estimates | Company guidance history, FY2026 current | 2026-09-07 (sync) | Medium — guided FCF / EPS |
| EstimatesReport.xls · Multiples (23x7) | Capital IQ estimates | Forward multiples | 2026-09-07 (sync) | Low |
| EstimatesReport.xls · Surprise (219x35) | Capital IQ estimates | FY2021–FY2025 beat/miss | 2026-09-07 (sync) | Low |
| EstimatesReport.xls · Trends (300x16) | Capital IQ estimates | Estimate trend series | 2026-09-07 (sync) | Low |
| EstimatesReport.xls · Revisions (467x12) | Capital IQ estimates | Last-month revision breadth | 2026-09-07 (sync) | Low |

**Failed extractions:** none. `manifest.json` totals report `"failures": 0`, and every one of the 15 sources carries `status: ok`. No `gdrive-pointer` stubs, no `fail`, no `fallback-text`, no `missing-dependency`. No source is treated as missing on extraction grounds (fix F03).

**Deterministic sidecars read:** `ciq_facts.json` (15 concepts resolved, 0 conflicts, currency USD) and `relationships.json` (empty graph — 0 nodes, 0 edges, no Suppliers/Customers export in the pool; no supply-chain counterparty read is available and none is needed for solvency).

---

## 2. Most Recent Sources

Age measured from the period-end / document date inside the document, to 2026-09-07.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | nVent Electric plc, 2025.pdf — Form 10-K | FY ended Dec 31, 2024 | ~20 |
| Quarterly filing | nVent Electric plc, Q2 2026.pdf — Form 10-Q | Quarter ended Jun 30, 2026 | ~2 |
| Debt / capital-structure export | Financials.xls · Capital Structure Summary + Balance Sheet | LTM Jun-30-2026 column | ~2 |
| Fixed-income / maturities export | Financials.xls · Capital Structure Details | FY2025 as-reported block (Dec-31-2025), source "A 2025 filed Feb-17-2026" | ~8 |
| Cash flow statement | nVent Electric plc, Q2 2026.pdf — Condensed Consolidated Statements of Cash Flows (six months ended Jun 30, 2026); Financials.xls · Cash Flow (LTM Jun-30-2026) | Jun 30, 2026 | ~2 |
| Covenant / credit-agreement disclosure | nVent Electric plc, Q2 2026.pdf — Note 10 (Debt), Senior Credit Facilities paragraph | Jun 30, 2026 | ~2 |
| Credit rating report | **None in pool** | — | — |
| Material-event disclosure (post-balance-sheet) | nVent-to-Acquire-Maverick-Power-2026.pdf | Aug 24, 2026 | ~0.5 |

**Freshness note.** The pool's audited annual filing is the **FY2024** 10-K; the **FY2025** 10-K (which Capital IQ cites as its own source, "A 2025 filed Feb-17-2026") is **not** in the pool as a document. This does not create a sufficiency gap, because every solvency requirement below is met by the fresher Q2 2026 10-Q (Jun 30, 2026) and, for instrument-level detail, by the Capital IQ Capital Structure Details FY2025 block. It does mean the FY2025 audited lease, pension and contingency notes must be read through Capital IQ or the FY2024 10-K, and downstream agents should cite accordingly rather than attribute a vendor figure to a filing (§5).

---

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | **Y** | Q2 2026 10-Q, Condensed Consolidated Balance Sheets at Jun 30, 2026 (cash $256.0m; total debt $1,492.4m; Financials.xls · Balance Sheet total equity $3,986.9m) | Debt, cash, equity base |
| Debt note (amounts by type) | **Y** | Q2 2026 10-Q, Note 10 (Debt) — term loan $200.0m @4.903%; 2028 notes $500.0m @4.550%; 2031 notes $300.0m @2.750%; 2033 notes $500.0m @5.650%; revolver $0 drawn | The debt stack and seniority (all senior unsecured per Financials.xls · Capital Structure Details) |
| Maturity schedule | **Y** | Q2 2026 10-Q, Note 10 maturity table: Q3–Q4 2026 $6.9m; 2027 $13.8m; 2028 $517.2m; 2029 $20.6m; 2030 $141.5m; 2031 $300.0m; thereafter $500.0m; total $1,500.0m | The maturity wall and refinancing exposure |
| Cash flow statement | **Y** | Q2 2026 10-Q, Statements of Cash Flows (CFO from continuing ops $278.7m, capex $57.6m, six months to Jun 30, 2026); Financials.xls · Cash Flow LTM Jun-30-2026 | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | **Y** | Q2 2026 10-Q, Note 10 — five-year $600.0m senior **unsecured** revolving credit facility, borrowing capacity $600.0m at Jun 30, 2026, $0 drawn; accordion up to a further $300.0m subject to lender commitment | True liquidity beyond cash |
| Interest expense detail | **Y** | Q2 2026 10-Q, Statements of Income — net interest expense $17.4m (Q2) / $34.9m (H1 2026); average interest rate per instrument in Note 10 | Coverage ratios |
| Covenant disclosure | **Y** | Q2 2026 10-Q, Note 10 — max net-debt/EBITDA **3.75x** (electively 4.25x for four testing periods around a material acquisition); min EBITDA/interest **3.00x**; stated in compliance at Jun 30, 2026 | Headroom to a breach |
| Lease detail (operating/finance) | **Y** | Q2 2026 10-Q, Note 8 (Supplemental Balance Sheet) — operating ROU assets $132.8m, current operating lease liabilities $33.0m, non-current $107.5m; FY2024 10-K Note 17 (Leases); Financials.xls · Capital Structure Details finance leases $17.8m | Debt-like obligations |
| Pension / OPEB funded status | **Y** | Financials.xls · Pension OPEB tab (FY2020–FY2025 obligation, assets, cost); FY2024 10-K Note 13 (Benefit Plans) | Off-balance-sheet obligation |
| Commitments & contingencies note | **Y** | Q2 2026 10-Q, Note 15 — bonds, letters of credit and bank guarantees outstanding face value $102.0m at Jun 30, 2026 ($75.7m at Dec 31, 2025); disposition indemnities stated as not reasonably estimable; FY2024 10-K Note 18 | Guarantees, LCs, litigation, tax claims |
| Credit ratings | **N** | No rating-agency report in the pool. Only management's stated "intent to maintain investment grade metrics" (Q2 2026 10-Q, MD&A Liquidity and Capital Resources) and the fact that the credit-facility margin can be priced off a public debt rating (Note 10) | Refinancing access and cost |
| EBITDA base (for stress test) | **Y** | `ciq_facts.json` `ltm_ebitda_m` = 1,074.6 [Financials.xls · Income Statement, LTM 12 months Jun-30-2026]; multi-year series FY2021 485 → FY2025 840 → LTM 1,075 | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | **Y** | **Operating company** — designer and manufacturer of electrical connection and protection products (Q2 2026 10-Q, Note 13 Segment Information: Systems Protection and Electrical Connections). **Also a HoldCo/OpCo structure** — see below | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | **Y** | Q2 2026 10-Q, Note 10 — $600.0m committed, unsecured, matures 2030-06-30 (Financials.xls · Capital Structure Details), **not** borrowing-base; full $600.0m capacity available, $0 drawn; pricing off net leverage ratio or public debt rating | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | **Y** | Q2 2026 10-Q, Note 10 — consolidated debt net of unrestricted cash above $5.0m but **capped at $250.0m** of netting, over consolidated net income before interest, taxes, D&A and non-cash share-based compensation, excluding non-cash gains and losses | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | **Y** | Q2 2026 10-Q, Note 10 — Obligor Group is nVent Electric plc (parent holding company, no independent operations), nVent Finance S.a r.l. (issuer, holding company) and Hoffman Schroff Holdings, Inc.; February 2026 supplemental indenture added full joint-and-several guarantees; filing states no significant restriction on obtaining funds from subsidiaries and no restricted net assets | Structural subordination and upstreaming |
| Hedging / swaps disclosure | **Y** | Q2 2026 10-Q, Note 9 (Derivatives and Financial Instruments) — cross-currency swaps notional $350.5m (vs $362.5m at Dec 31, 2025), liabilities $28.8m / assets $2.6m; foreign-currency contracts disclosed. Floating-rate exposure is the $200.0m term loan; the $1,300.0m of senior notes are fixed | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | **Y (partial)** | **Rating trigger: Y** — credit-facility applicable margin is set off net leverage ratio or public debt rating (Q2 2026 10-Q, Note 10). **Indenture covenants: Y** — restrictions on merger/consolidation, liens and sale-and-leaseback (Note 10). **Change-of-control put on the Notes and cross-default terms: not disclosed in the data pool** — the only "change of control" text in the pool sits in equity-award agreements (FY2024 10-K exhibits), not in the debt terms | Hidden accelerants to distress |

**Business Type Applicability Gate — PASSED.** nVent is an operating manufacturer with ordinary corporate debt, not a bank, insurer or REIT. The debt/EBITDA, coverage and covenant-headroom framework applies. The financial-institution override does **not** trip. The HoldCo/OpCo mapping requirement **does** apply and is satisfied by Note 10, so agents `01` and `99` must build the Obligor Group map rather than flag it as not assessable.

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | **Y** |
| business-model/11_capital-allocation-governance.md | **Y** |
| business-model/03_segment-map.md | **Y** |
| earnings/01_historical-financials.md | **Y** |
| earnings/06_earnings-quality.md | **Y** |
| earnings/03_margin-drivers.md | **Y** |

Both upstream modules are complete (business-model: 13 agent files plus synthesis and dossier; earnings: 9 agent files plus synthesis, dossier and `sensitivity_summary.json`). `analyses/NVT_2026-09-07/valuation/` does not exist — that is expected and correct: per MODULE_RULES it is **not** a cross-module input to this module and must not be read.

---

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (issuer incorporated in **Ireland**, principal executive offices in London, United Kingdom) | Q2 2026 10-Q cover page: "Ireland (State or other jurisdiction of incorporation)"; "The Mille, 1000 Great West Road, 8th Floor (East), London, TW8 9DW, United Kingdom" |
| Exchange | New York Stock Exchange, ticker NVT | FY2024 10-K, Item 5: "Our ordinary shares are listed for trading on the New York Stock Exchange and trade under the symbol 'NVT.'" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC**, domestic-filer forms (10-K, 10-Q, 11-K), Commission file number 001-38265 | FY2024 10-K and Q2 2026 10-Q cover pages |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | EstimatesReport.xls · Consensus header: "Acctg. Standard: US GAAP"; Q2 2026 10-Q financial statements |
| Reporting currency (USD / INR / …) | **USD**, presented in millions | Financials.xls tab headers "Currency: Reported Currency; In Millions; USD"; `ciq_facts.json` `"currency": "USD"` |
| Document language(s) | **English** — all 15 sources | Every extract in the generation root is English; no translation layer needed and no language-related gap exists (CLAUDE.md §27) |

Downstream agents therefore read **US SEC** documents: the 10-K debt / lease / benefit-plan / contingency notes, the 10-Q Note 10 (Debt) and Note 15 (Commitments and Contingencies), and 8-K-equivalent material-event releases. There is no SEBI-LODR or Ind AS overlay here. **Under US GAAP, operating leases stay off the debt line** — note that Capital IQ's "Total Debt" of $1,632.9m at Jun-30-2026 exceeds the 10-Q's reported total debt of $1,492.4m by exactly $140.5m, which is the sum of current ($33.0m) and non-current ($107.5m) operating lease liabilities. Agent `01` must state which basis it designates as canonical and label it (MODULE_RULES Calculation Standards 2–3, CLAUDE.md §15); it must not present the vendor's $1,632.9m under a filing citation (§5).

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | **N** | 02, 06 | None — full year-by-year schedule to "thereafter" in Q2 2026 10-Q Note 10 |
| No covenant disclosure | **N** | 04, 06 | None — both maintenance covenants, their thresholds, the covenant-EBITDA definition and the $250.0m cash-netting cap are disclosed |
| No cash flow statement | **N** | 03, 04, 06 | None — 10-Q statements of cash flows plus Capital IQ Cash Flow tab (FY2021–FY2025 + LTM Jun-30-2026) |
| No undrawn-facility disclosure | **N** | 03 | None — $600.0m committed revolver, $0 drawn, full capacity stated at Jun 30, 2026 |
| No interest-expense detail | **N** | 04 | None — net interest expense by period plus average interest rate per instrument |
| No EBITDA base | **N** | 06 | None — LTM Jun-30-2026 EBITDA $1,074.6m plus a five-year series and forward consensus |

**No score cap from the MODULE_RULES cap table binds.** Checked against all nine cap rows: maturity schedule present; covenant disclosure present; cash flow statement present; interim data present (so the "only annual data" cap does not apply); EBITDA base present; off-balance-sheet exposures disclosed (Note 15, $102.0m of bonds/LCs/guarantees, plus pension and lease detail); the revolver is committed and not borrowing-base with availability stated; the covenant-EBITDA definition is disclosed so headroom does not rest on assumed addbacks; and the HoldCo debt sits with disclosed upstreaming language ("no significant restrictions on the ability of nVent Electric plc to obtain funds from its subsidiaries by dividend or loan").

**Two data notes that are not caps but that downstream agents must carry:**
1. **No credit-rating report.** MODULE_RULES partial-data row "No credit ratings → 99: note the absence; do not infer a rating." Agent `99` must record the absence. **Do not infer or assert an investment-grade rating** from management's stated intent to "maintain investment grade metrics" — that is management language, not an agency action, and asserting a rating from it would be a §3 unsupported claim.
2. **Maverick Power is a post-balance-sheet leverage event with undisclosed financing.** Announced Aug 24, 2026 (after the Jun 30, 2026 balance-sheet date): $1.75bn cash purchase price plus up to $550m of contingent consideration tied to 2027–2028 performance, expected to close Q4 2026, to be funded "with a combination of available cash on hand and new debt" — the mix, tenor, pricing and any commitment financing are **not disclosed in the pool**. Against $256.0m of cash and $1,492.4m of reported debt at Jun 30, 2026, this is a material change to the capital structure. Agents `01`, `02`, `03` and `06` must run the reported Jun-30-2026 structure as the base case and present any Maverick-inclusive figure separately, clearly labelled as pro-forma with the funding mix stated as an assumption ("Inference, not from filings"). The covenant that matters here is already known: net leverage 3.75x, electively 4.25x for four testing periods in connection with a material acquisition (Q2 2026 10-Q, Note 10).

---

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A balance sheet two months old (Q2 2026 10-Q at Jun 30, 2026), a full debt note with amounts by instrument and a year-by-year maturity table, and a cash flow statement are all present, so leverage, liquidity, coverage, covenant headroom and a downside stress test can all be built from primary filings.
- **Sections that can run:** capital structure and leverage; maturity wall and refinancing; liquidity runway; coverage and covenants; off-balance-sheet and contingencies; downside stress test. All six run, plus the mandatory HoldCo/OpCo structural-priority map.
- **Active partial-data caps:** none. No cap from the MODULE_RULES score-cap table binds.
- **Critical missing items:** none that block the module. Two lower-order absences to record rather than cap for: (a) no credit-rating-agency report, so refinancing access and cost must be reasoned from coupons, maturity profile and covenant terms, and no rating may be inferred; (b) the FY2025 10-K itself is absent from the pool — the FY2025 audited lease, pension and contingency notes must be read through the Capital IQ Pension OPEB and Capital Structure Details tabs or the FY2024 10-K, cited as the vendor export or the FY2024 filing respectively, never as an FY2025 filing.
- **Single highest-value missing document:** the **Maverick Power financing disclosure** — the 8-K, commitment letter or credit-agreement amendment setting out how the $1.75bn cash purchase price plus up to $550m of contingent consideration will be funded (debt versus cash mix, tenor, pricing, and whether the 4.25x acquisition covenant election is being used). Every forward leverage, coverage and covenant-headroom read in this module turns on it. Second-highest: a rating-agency report (Moody's / S&P / Fitch) to pin refinancing access and the cost of the announced new debt.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Balance-sheet date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31)

**Three things to hold on to before the tables.**

1. **The canonical debt figure in this module is the company's own debt note, not the vendor's.** The 10-Q's Note 10 total debt is **$1,492.4m**. Capital IQ's "Total Debt" of **$1,632.9m** is the same balance sheet with the **$140.5m** of operating-lease liabilities added in. Under US GAAP operating leases sit **off** the debt line, so the filing basis is the one used throughout. Both are shown, each under its own source (CLAUDE.md §5 — never a vendor number under a filing's name).
2. **The EBITDA in every ratio below is at a cyclical peak.** `business-model/07_business-quality` scores cyclicality **30/100** (reverse-mapped: low score = high cyclicality) and `earnings/02_revenue-drivers` states plainly that Q2 FY26 "is a peak-of-cycle print, not a normalised base." So every ratio is shown on the latest (peak) EBITDA **and** on a normalised / mid-cycle EBITDA, each labelled. The peak figure is a floor on leverage, not the central estimate.
3. **A $1.75bn acquisition sits outside every reported number here.** Maverick Power was announced **24 August 2026** — after the 30 June 2026 balance sheet — for **$1.75bn cash plus up to $550m of contingent consideration**, to be funded "with a combination of available cash on hand and new debt," with **committed bridge financing from Bank of America**, expected to close **Q4 2026** [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. The debt/cash mix, tenor and pricing are **not disclosed in this data pool**. Section 5A carries the pro-forma read; it is labelled pro-forma on every line and is never a reported figure.

---

## 1. Debt Stack

All amounts USD millions at **30 June 2026**. Source for every row: `Q2 FY26 10-Q, Note 10 (Debt)` unless stated. Seniority / secured / maturity-date columns cross-read from `CIQ Financials → Capital Structure Details` (FY2025 as-reported block, source "A 2025 filed Feb-17-2026") — a tier-5 vendor export, cited as such.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Current maturities of long-term debt and short-term borrowings | 13.8 | Obligor Group (HoldCo) | No | Senior unsecured | None | within 12 months | Amortisation of the floating term loan | `Q2 FY26 10-Q, Note 10`; balance sheet line |
| 4.550% Senior Notes due 2028 ("2028 Notes") | 500.0 | Issued by nVent Finance S.à r.l. (HoldCo); guaranteed by nVent Electric plc and Hoffman Schroff Holdings, Inc. | No | General unsecured senior obligations, ranking equally with all other unsubordinated unsecured debt | None | 2028-04-15 | **Fixed** 4.550% | `Q2 FY26 10-Q, Note 10`; `CIQ Financials → Capital Structure Details` (maturity date) |
| 2.750% Senior Notes due 2031 ("2031 Notes") | 300.0 | nVent Finance S.à r.l. (HoldCo), same guarantees | No | Senior unsecured | None | 2031 | **Fixed** 2.750% | `Q2 FY26 10-Q, Note 10` |
| 5.650% Senior Notes due 2033 ("2033 Notes") | 500.0 | nVent Finance S.à r.l. (HoldCo), same guarantees | No | Senior unsecured | None | 2033 | **Fixed** 5.650% | `Q2 FY26 10-Q, Note 10` |
| Term Loan Facility (amortising) | 200.0 | nVent Finance S.à r.l. / Obligor Group | No | Senior unsecured | None | 2030-06-30 | **Floating** — SOFR / EURIBOR / SONIA + margin; average rate **4.903%** at 30-Jun-2026 | `Q2 FY26 10-Q, Note 10`; `CIQ Financials → Capital Structure Details` |
| Revolving Credit Facility (drawn) | **0.0** (of $600.0m committed capacity; accordion up to a further $300.0m subject to lender commitment) | nVent Finance S.à r.l. / Obligor Group | No | Senior unsecured | None | 2030-06-30 | Floating when drawn; margin set off net leverage ratio **or public debt rating** | `Q2 FY26 10-Q, Note 10` |
| Unamortized debt issuance costs and discounts | (7.6) | — | — | — | — | — | — | `Q2 FY26 10-Q, Note 10` |
| **Total debt (filing basis, Note 10)** | **1,492.4** | of which current 13.8 / long-term 1,478.6 | **None secured** | **All senior unsecured** | **No collateral pledged** | see §6 note | 86.7% fixed / 13.3% floating of the $1,500.0m principal | `Q2 FY26 10-Q, Note 10` and balance sheet |
| *Memo:* finance / capital lease obligations (NOT in the Note 10 total) | **17.8** at 31-Dec-2025 | Operating subsidiaries | **Yes** (the leased asset) | Senior | Leased production facilities and equipment | weighted-average remaining term **12 years** | 6.0% imputed | `CIQ Financials → Capital Structure Details` (FY2025 block); `FY24 10-K, Note 17 (Leases)` — $18.0m at 31-Dec-2024, discount rate 6.0% |
| *Memo:* total principal excluding issuance costs | **1,500.0** | — | — | — | — | — | — | `Q2 FY26 10-Q, Note 10` maturity table |

**Notes on the stack.**

- **Nothing in the corporate debt stack is secured.** Every instrument is senior unsecured and no collateral is pledged; the revolver shares no security package with the notes because there is no security package [`Q2 FY26 10-Q, Note 10`]. The only "secured" debt Capital IQ shows — $140.5m of "Total Secured Debt" at 30-Jun-2026 — is the lease liabilities, secured only by the leased assets themselves [`CIQ Financials → Capital Structure Summary`].
- **Finance leases are not separately disclosed at 30 June 2026.** The 10-Q's supplemental balance-sheet note itemises operating leases but not finance leases, which sit inside "Other current liabilities" ($111.6m) and "Other non-current liabilities" ($34.0m) [`Q2 FY26 10-Q, Note 8`]. The latest separately disclosed figure is **$17.8m at 31-Dec-2025** [`CIQ Financials → Capital Structure Details`], versus $18.0m at 31-Dec-2024 [`FY24 10-K, Note 17`]. Adding it to the filing-basis total gives roughly **$1,510m** of gross debt including finance leases — *approximately $17.8m of that is a 31-Dec-2025 carry-forward, not a 30-Jun-2026 disclosure. Inference, not from filings.* At 1.2% of gross debt it does not move any ratio in this report.
- **Rate mix:** $1,300.0m fixed (**86.7%** of the $1,500.0m principal), $200.0m floating (**13.3%**). Cross-currency swaps of $350.5m notional exist but hedge currency, not interest rate [`Q2 FY26 10-Q, Note 9`]. Refinancing cost and the maturity ladder belong to `02_maturity-wall-and-refinancing`.
- **Change-of-control puts and cross-default terms: Not disclosed in the data pool.** The indenture covenants that *are* disclosed restrict merger/consolidation, liens and sale-and-leaseback [`Q2 FY26 10-Q, Note 10`]. A **rating-linked pricing step does exist** — the credit-facility applicable margin can be set off nVent's public debt rating [`Q2 FY26 10-Q, Note 10`] — but no rating-agency report is in this pool, so no rating is asserted here.

---

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| **Operating leases** | **140.5** (current 33.0 + non-current 107.5) | **US GAAP — kept OFF the debt line.** Recognised as right-of-use assets ($132.8m) with lease liabilities inside "Other current liabilities" and "Other non-current liabilities", not inside Note 10 total debt. Under IFRS 16 these would be capitalised into debt; nVent does not report under IFRS. Capital IQ's lease-inclusive $1,632.9m total debt is exactly $1,492.4m + $140.5m. Weighted-average discount rate 5.1%, remaining term 5 years | `Q2 FY26 10-Q, Note 8 (Supplemental Balance Sheet Information)`; `FY24 10-K, Note 17 (Leases)`; `CIQ Financials → Capital Structure Summary` |
| **Finance leases** | **17.8** at 31-Dec-2025 (18.0 at 31-Dec-2024) | Debt-like and on balance sheet, but excluded from the Note 10 debt total; sits in Other liabilities. Secured on the leased assets. Not separately disclosed at 30-Jun-2026 | `CIQ Financials → Capital Structure Details`; `FY24 10-K, Note 17` |
| **Pension / OPEB underfunding** | **128.6** at 31-Dec-2024 (pension obligation 120.3 less plan assets 3.1 = 117.2 underfunded; post-retirement health plan 11.4 wholly unfunded). Balance-sheet liability "Pension and other post-retirement compensation and benefits" **133.3** at 30-Jun-2026 | Largely **unfunded, pay-as-you-go** — plan assets of $3.1m cover 2.6% of the pension obligation. Not interest-bearing debt, but a real cash claim. FY2025 audited benefit-plan note is not in this pool; the FY2024 10-K is the latest audited read | `FY24 10-K, Note 13 (Benefit Plans)` — obligations and funded status table; `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` |
| **Preferred equity** | **None** | Only ordinary shares, $0.01 par, 400.0m authorised, 161.9m issued at 30-Jun-2026. No preferred class exists, so no prior-ranking equity claim | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` |
| *Memo — contingent, not yet a liability:* Maverick Power earnout | **up to 550.0** | Contingent consideration tied to 2027–2028 performance on a deal not yet closed. Not on the 30-Jun-2026 balance sheet. Sized here so downstream agents carry it; `05_off-balance-sheet-and-contingencies` owns it | `nVent news release, 2026-08-24` |

Guarantees, letters of credit and bank guarantees ($102.0m face value at 30-Jun-2026, `Q2 FY26 10-Q, Note 15`) are named here only so they are not lost; they belong to `05_off-balance-sheet-and-contingencies`.

---

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | **256.0** | See the trapped-cash row | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` (also $237.5m at 31-Dec-2025) |
| Liquid short-term investments | **0.0 — none** | n/a | `CIQ Financials → Balance Sheet`: "Total Cash & ST Investments" 256.0 = cash and equivalents 256.0, with no separate short-term-investment line in any of the six periods FY2021–Jun-2026 |
| **Restricted / trapped cash (flag)** | **79.6 of the 256.0 (31.1%)** | **Yes — effectively trapped.** The company's own words: "$256.0 million of cash on hand, of which **$79.6 million is held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences**." This is up from $53.2m of $131.2m (40.5%) at 31-Dec-2024 | `Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`; `FY24 10-K, MD&A, Liquidity and Capital Resources` |
| Freely usable cash (memo) | **176.4** | 256.0 − 79.6 | derived from the two rows above |
| Committed undrawn revolver (memo — NOT cash; `03_liquidity-runway` owns it) | 600.0 | Committed, not borrowing-base; $0 drawn; full capacity available at 30-Jun-2026 | `Q2 FY26 10-Q, Note 10` |

**Because there are no short-term investments, the strict and broad §15 net-debt bases give the same number.** That is unusual and it is helpful: it removes the most common place a leverage figure gets flattered. The trapped-cash flag is the live issue instead — netting all $256.0m against debt assumes cash that cannot cheaply cross a border is available to repay it. Both versions are shown below.

---

## 4. Gross & Net Debt

USD millions at 30 June 2026.

| Metric | Value | Source |
|---|---:|---|
| **Gross debt (filing basis — Note 10 total debt)** | **1,492.4** | `Q2 FY26 10-Q, Note 10 (Debt)` |
| − Cash & equivalents | (256.0) | `Q2 FY26 10-Q, balance sheet` |
| **Net debt (strict, §15) — CANONICAL** | **1,236.4** | 1,492.4 − 256.0 |
| − Liquid short-term investments | (0.0) — none exist | `CIQ Financials → Balance Sheet` |
| **Net debt (broad, incl. investments)** | **1,236.4 — identical to strict**, because there are no short-term investments to net | same |
| *Memo:* net debt strict, excluding the $79.6m of cash that cannot be readily repatriated | **1,316.0** | 1,492.4 − (256.0 − 79.6) — the conservative read (MODULE_RULES: usable cash must exclude trapped cash) |
| *Memo:* gross debt including finance leases (latest disclosed, 31-Dec-2025) | **~1,510.2** | 1,492.4 + 17.8 — *the lease figure is a 31-Dec-2025 carry-forward. Inference, not from filings* |
| *Memo — vendor basis, cited as the vendor:* Capital IQ total debt 1,632.9, net debt **1,376.9** | 1,376.9 | `CIQ Financials → Balance Sheet`; `ciq_facts.json` `total_debt_m` 1,632.9 / `net_debt_m` 1,376.9. This is the **broad-in-a-different-sense** figure: it adds the $140.5m of operating leases to debt. 1,492.4 + 140.5 − 256.0 = 1,376.9 exactly — reconciled to the cent, not a misread |

**Reconciliation to `ciq_facts.json` (required).** The sidecar reports net debt **$1,376.9m** and net debt / LTM EBITDA **1.28x**. Both are accepted as accurate reads of the workbook and neither is overridden. The entire $140.5m gap to this report's $1,236.4m is operating-lease liabilities, which US GAAP keeps off the debt line — an itemised definitional difference, reconciled above. The `ciq_facts.json` `source_ref` itself instructs the reader to "confirm vs the strict total-debt−cash basis, §15"; that confirmation is the $1,236.4m line.

**Designated canonical figure for every downstream agent in this module: net debt $1,236.4m, strict §15 basis, filing debt note, at 30 June 2026.** Strict is the default and no reason exists to depart from it here (there are no short-term investments, so broad adds nothing). Any agent quoting $1,376.9m must label it "Capital IQ lease-inclusive vendor basis"; any agent quoting $1,316.0m must label it "strict, excluding trapped cash".

---

## 5. Leverage Ratios

**EBITDA figures used, and their basis:**

| EBITDA measure | Value | Basis and cycle position | Source |
|---|---:|---|---|
| **Reported EBITDA, LTM to 30-Jun-2026** | **1,074.6** | Standardised GAAP-derived EBITDA on **continuing operations** (operating income 842.7 + D&A 231.9). **PEAK / latest.** Independently rebuilt from the filings: FY2025 840.5 − H1'25 (286.7 + 92.3 D&A = 379.0) + H1'26 (496.4 + 116.4 D&A = 612.8) = 1,074.3, which ties to the vendor's 1,074.6 within rounding | `ciq_facts.json` `ltm_ebitda_m` = 1,074.6 [`CIQ Financials → Income Statement`, LTM 12 months Jun-30-2026]; rebuild from `Q2 FY26 10-Q` income statement and cash flow statement, and `Q1 FY26 ppt` FY2025 reconciliation |
| **Company adjusted EBITDA, LTM to 30-Jun-2026** | **1,061.5** | Company-defined non-GAAP: adjusted operating income (which excludes restructuring and other, acquisition transaction and integration costs, intangible amortisation, and the $25.8m IEEPA tariff reimbursement) plus depreciation. **PEAK / latest.** Built as Q3'25 230.1 + Q4'25 226.0 + Q1'26 265.3 + Q2'26 340.1. **The Q2'26 component of $340.1m is computed by this agent, not disclosed** — no Q2 FY26 deck is in the pool; it is adjusted operating income of $322.7m (which ties exactly to reportable segment income $357.0m less Enterprise and other $34.3m) plus Q2 depreciation of $17.4m (H1 34.2 − Q1 16.8). *Inference from filed tables, not a company-published figure* | `Q1 FY26 ppt`, GAAP-to-non-GAAP reconciliations (FY2025 quarters and Q1 2026); `Q2 FY26 10-Q, Note 13 (Segment Information)` reconciliation table and Statements of Cash Flows |
| **Normalised / mid-cycle EBITDA** | **863.6** | Three-year average of the company's own reported EBITDA on the current, post-acquisition asset base: (FY2024 675.6 + FY2025 840.5 + LTM Jun-26 1,074.6) ÷ 3. **MID-CYCLE / NORMALISED.** Chosen over a five-year average because FY2021–FY2023 pre-date $2.77bn of acquisitions (ECM, Trachte, Electrical Products Group) and describe a materially smaller company; chosen over holding revenue flat and cutting the margin because `earnings/03_margin-drivers` and `07_business-quality` locate the cyclicality in **volume**, not margin (EBITDA margin has moved only 19.7% → 22.2% across the whole window). *This is a labelled normalisation, not a forecast* | `CIQ Financials → Income Statement`, EBITDA row FY2024 / FY2025 / LTM Jun-30-2026; cyclicality read from `business-model/07_business-quality` §Cyclicality (30/100) and `earnings/02_revenue-drivers` §4a |

**The ratios.** Formulas shown; every number reproducible.

| Ratio | On Reported EBITDA (peak, 1,074.6) | On Adjusted EBITDA (peak, 1,061.5) | Source |
|---|---:|---:|---|
| **Gross debt / EBITDA** | **1.39x** (1,492.4 ÷ 1,074.6) | **1.41x** (1,492.4 ÷ 1,061.5) | `Q2 FY26 10-Q, Note 10` ÷ EBITDA sources above |
| **Net debt / EBITDA — strict §15 basis (canonical)** | **1.15x** (1,236.4 ÷ 1,074.6) | **1.16x** (1,236.4 ÷ 1,061.5) | as above |
| Net debt / EBITDA — strict, excluding trapped cash | 1.22x (1,316.0 ÷ 1,074.6) | 1.24x (1,316.0 ÷ 1,061.5) | conservative variant |
| *Memo:* net debt / EBITDA — Capital IQ lease-inclusive vendor basis | 1.28x (1,376.9 ÷ 1,074.6) | 1.30x (1,376.9 ÷ 1,061.5) | `ciq_facts.json` `net_debt_ebitda_x` 1.28x — matches this report exactly on the vendor's own basis |
| **Debt / capital** | **27.2%** (1,492.4 ÷ (1,492.4 + 3,986.9)) | (n/a) | `Q2 FY26 10-Q, Note 10` and balance sheet total equity 3,986.9. *Memo, vendor lease-inclusive basis:* 29.1% (1,632.9 ÷ 5,619.8) [`CIQ Financials → Capital Structure Summary`, which prints 29.06%] |
| **Debt / equity** | **37.4%** (1,492.4 ÷ 3,986.9) | (n/a) | as above |

**Cyclical overlay — required, because this is a cyclical name.** `business-model/07_business-quality` scores cyclicality **30/100** (reverse-mapped; the lowest of its twelve rows) and quotes the company's own risk factors: "We expect to experience fluctuations in revenues and results of operations due to economic and business cycles." `earnings/02_revenue-drivers` §4a: "Q2 FY26 revenue is a peak-of-cycle print, not a normalised base."

| Ratio | On latest EBITDA — **PEAK** | On normalised / mid-cycle EBITDA (863.6) — **MID-CYCLE** | Delta |
|---|---:|---:|---:|
| Gross debt / EBITDA | 1.39x (reported) | **1.73x** (1,492.4 ÷ 863.6) | +0.34x |
| Net debt / EBITDA (strict, canonical) | 1.15x (reported) | **1.43x** (1,236.4 ÷ 863.6) | +0.28x |

**Read it this way:** the headline 1.15x is the *floor* on leverage, not the central estimate. On the normalised EBITDA the same balance sheet carries **1.43x**. Both numbers are low in absolute terms — the gap between them is 0.28 turns, not two turns — so the cyclical adjustment sharpens the picture without changing its character. Management's own quoted figure is consistent: "We exited the quarter with net leverage of 1.2x, well below our target range of 2 to 2.5x" [`Q2 FY26 transcript, 2026-07-31, prepared remarks (CFO)`]. That 1.2x is a management figure on a call; the filing-derived strict figure is 1.15x on reported EBITDA and 1.16x on adjusted, and the covenant-definition version (which caps cash netting at $250.0m) belongs to `04_coverage-and-covenants`.

### 5A. Pro-forma for Maverick Power — **LABELLED PRO-FORMA, NOT A REPORTED FIGURE**

Every number in this sub-section is pro-forma and rests on an assumption the pool does not contain. Announced 24 August 2026; expected to close Q4 2026, subject to regulatory approval; **$1.75bn cash purchase price plus up to $550m contingent consideration** tied to 2027–2028 performance; funding stated only as "a combination of available cash on hand and new debt," with **committed bridge financing from Bank of America**. Mix, tenor and pricing: **not disclosed in the data pool** [`nVent news release, 2026-08-24`].

**A convenient fact that removes one assumption:** whether the $1.75bn is paid from cash or from new debt changes **gross** debt but not **net** debt — a dollar of cash spent is a dollar of net debt added, exactly as a dollar borrowed is. So the pro-forma net-debt figure below is robust to the funding mix; only the gross-debt line depends on it.

| Pro-forma line (all *Inference, not from filings*) | Value | Build |
|---|---:|---|
| Net debt, strict basis, at 30-Jun-2026 (reported) | 1,236.4 | §4 above |
| + Maverick cash consideration | 1,750.0 | `nVent news release, 2026-08-24` |
| **= Pro-forma net debt (pre-earnout)** | **2,986.4** | additive, mix-independent |
| Pro-forma gross debt, if fully debt-funded (bound) | 3,242.4 | 1,492.4 + 1,750.0, cash unchanged at 256.0 |
| Pro-forma gross debt, if the $176.4m of freely usable cash is spent first | 3,066.0 | 1,492.4 + 1,573.6, cash falls to 79.6 (the trapped balance) |
| Maverick's implied 2026 adjusted EBITDA | **~152.2** | $1,750.0m ÷ 11.5x, from the release's own "approximately 11.5 times anticipated 2026 adjusted EBITDA" (10.5x after the present value of expected tax benefits, i.e. ~$166.7m on that basis) |
| **Pro-forma net debt / EBITDA — reported basis** | **~2.43x** | 2,986.4 ÷ (1,074.6 + 152.2 = 1,226.8) |
| **Pro-forma net debt / EBITDA — company adjusted basis** | **~2.46x** | 2,986.4 ÷ (1,061.5 + 152.2 = 1,213.7) |
| Pro-forma net leverage if the full $550m earnout is later paid | ~2.88x | (2,986.4 + 550.0) ÷ 1,226.8 |
| Pro-forma net leverage on **normalised / mid-cycle** EBITDA | **~2.94x** | 2,986.4 ÷ (863.6 + 152.2 = 1,015.8) |

**Two basis warnings that must travel with these figures (§15).** (a) The denominators add nVent's **trailing twelve-month** EBITDA to Maverick's **anticipated full-year 2026** EBITDA — a trailing figure plus a forward figure. That mismatch flatters nothing in particular but is a mixed basis and must be stated wherever the number is quoted. (b) Holding nVent's LTM EBITDA static while adding a full year of Maverick is a **bound, not a forecast**: FY2026 consensus EBITDA is $1,225.0m [`CIQ Estimates → Consensus`, FY2026], so on a forward denominator the same net debt gives roughly 2.17x. The pro-forma range worth carrying downstream is therefore **~2.2x to ~2.9x** depending on whether the denominator is forward, trailing, or normalised, and on whether the earnout is paid.

For orientation only, not a headroom computation (`04_coverage-and-covenants` owns that): the disclosed maximum net-leverage covenant is **3.75x**, electively **4.25x for four testing periods in connection with certain material acquisitions** [`Q2 FY26 10-Q, Note 10`]. Every pro-forma figure above sits below both.

---

## 6. Leverage Trend

Strict §15 basis throughout; total debt from the company's **own debt note** at each date, cash from the balance sheet, EBITDA from `CIQ Financials → Income Statement` (continuing-operations basis).

| Metric | FY2023 (31-Dec-2023) | FY2024 (31-Dec-2024) | FY2025 (31-Dec-2025) | Latest (30-Jun-2026) | Direction |
|---|---:|---:|---:|---:|---|
| Total debt (filing debt note) | 1,780.7 | 2,155.0 | 1,559.8 | 1,492.4 | Down 30.7% from the FY2024 peak |
| Cash & equivalents | 179.6 | 131.2 | 237.5 | 256.0 | Rising |
| **Net debt (strict, §15)** | **1,601.1** | **2,023.8** | **1,322.3** | **1,236.4** | **Falling — down $787.4m (−38.9%) from the FY2024 peak** |
| Reported EBITDA (continuing ops) | 561.5 | 675.6 | 840.5 | 1,074.6 (LTM) | Rising in every period |
| **Net debt / EBITDA (strict)** | **2.85x** | **3.00x** | **1.57x** | **1.15x** | **Falling — 1.85 turns off the FY2024 peak** |
| Gross debt / EBITDA | 3.17x | 3.19x | 1.86x | 1.39x | Falling |

Sources: FY2023 and FY2024 debt totals `FY24 10-K, Note 10 (Debt)` ($2,155.0m and $1,780.7m); FY2025 debt total `Q2 FY26 10-Q, Note 10` comparative column ($1,559.8m); 30-Jun-2026 `Q2 FY26 10-Q, Note 10`. Cash from the same filings' balance sheets. EBITDA from `CIQ Financials → Income Statement` (FY2022 and FY2023 columns carry a "Reclassified" stamp).

**A matched-basis caveat on the two oldest ratios (§15), stated because it cuts against the flattering direction of the trend.** The FY2023 and FY2024 ratios put **total** debt over **continuing-operations** EBITDA. But part of that debt was funding the Thermal Management segment, which was still owned then and whose earnings are excluded from the continuing-ops EBITDA line. So 2.85x and 3.00x **overstate** the leverage actually carried at the time on a like-for-like basis. The deleveraging from FY2024 to today is real, but it is smaller than the raw 3.00x → 1.15x move suggests, because a chunk of that move is a change in what the denominator counts, not a change in the balance sheet.

**Direction and drivers, in three sentences.** Leverage is **falling, and fast**: strict net debt / EBITDA went 3.00x (FY2024) → 1.57x (FY2025) → 1.15x (LTM Jun-2026), and net debt itself fell $787.4m from the FY2024 peak. Two drivers, in order of size: (1) the **sale of Thermal Management** for $1.65bn, agreed 31-Jul-2024 and closed 30-Jan-2025, which put $1,584.6m of investing inflows from discontinued operations into H1 2025 and funded **$866.3m** of long-term-debt repayment in that half alone [`Q2 FY26 10-Q, Statements of Cash Flows, six months ended June 30, 2025`; `FY24 10-K, Item 1 and Note 6`]; and (2) **EBITDA growth**, which nearly doubled the denominator — reported EBITDA rose from $675.6m (FY2024) to $1,074.6m (LTM Jun-2026), +59.1%, on revenue up from $3,006.1m to $4,834.0m [`CIQ Financials → Income Statement`]. Deleveraging by ordinary repayment has been a distant third: $68.3m of long-term debt repaid in H1 2026 (nearly $70m of the prepayable term loan in Q2 alone, per the CFO), against $118m returned to shareholders in the same half ($50.4m of buybacks, $68.2m of dividends) [`Q2 FY26 10-Q, Statements of Cash Flows`; `Q2 FY26 transcript, 2026-07-31, prepared remarks`].

**The number that disagrees with the falling trend, named (§3).** The denominator doing most of the work is at a cyclical peak, and the acquisition programme has not stopped. `business-model/11_capital-allocation-governance` scores the debt-level-and-trajectory row **30/100 severity** and records $3,017m of acquisition cash over FY2021–FY2025 against $2,091m of cumulative free cash flow — deals consuming more than everything the business generated. Management has said the current level is *below* where it wants to be: 1.2x is "well below our target range of 2 to 2.5x, providing ample flexibility to invest in growth and acquisitions" [`Q2 FY26 transcript, 2026-07-31`]. So the honest read is that leverage has fallen sharply and is stated by management as **intended to rise again**, with Maverick the first instalment (§5A: ~2.4x pro-forma). The trend is down; the trajectory is not.

---

## 6A. HoldCo / OpCo & Structural Subordination

**Applicable.** Every dollar of the corporate debt is issued or guaranteed at holding-company level, and none of it is guaranteed by the operating subsidiaries.

| Item | Evidence | Why It Matters |
|---|---|---|
| **Where the debt sits (HoldCo vs OpCo)** | The **Obligor Group** is three holding companies: **nVent Electric plc** (the listed Irish parent — "a holding company that has no independent assets or operations unrelated to its investments in consolidated subsidiaries"), **nVent Finance S.à r.l.** (the Luxembourg issuer of all three note series — likewise a holding company whose only activity is its investments and "the issuance of the Notes and other external debt"), and **Hoffman Schroff Holdings, Inc.** (a US holding company, 100%-owned indirect subsidiary, also with no independent operations). A **February 2026 supplemental indenture** made nVent Electric plc and Hoffman Schroff Holdings full, unconditional, **joint-and-several guarantors** of nVent Finance's Notes. The Senior Credit Facilities were entered into by the same three entities in June 2025 [`Q2 FY26 10-Q, Note 10`] | **Structural subordination is real and disclosed.** The 10-Q says it plainly: "None of the other subsidiaries of any of the Obligor Group are under any direct obligation to pay or otherwise fund amounts due on the Notes or the guarantees, whether in the form of dividends, distributions, loans or other payments." All the debt sits above the operating companies; all the trade creditors, employees and tax authorities of those operating companies rank ahead of it on those companies' own assets. The February 2026 guarantee upgrade **improves** this — it puts the parent's and the US holding company's balance sheets behind the Notes — but it does not push the claim down to the operating level |
| **Upstreaming constraints (dividend blockers, regulatory)** | Two disclosures, pulling opposite ways, and both must be carried. **Permissive:** "There are **no significant restrictions** on the ability of nVent Electric plc to obtain funds from its subsidiaries by dividend or loan. None of the assets of nVent Electric plc or its subsidiaries represents **restricted net assets** pursuant to the guidelines established by the Securities and Exchange Commission." **Restrictive:** "there may be **statutory and regulatory limitations on the payment of dividends from certain subsidiaries** of the Obligor Group. If such subsidiaries are unable to transfer funds to the Obligor Group and sufficient cash or liquidity is not otherwise available, the Obligor Group may not be able to make principal and interest payments on their outstanding debt" [both `Q2 FY26 10-Q, Note 10`] | **Can the HoldCo service its own debt?** Its only sources are dividends from subsidiaries (nVent Electric plc), interest income from subsidiaries (nVent Finance and Hoffman Schroff), and the group revolver. On the SEC's own restricted-net-assets test the answer is yes with no significant restriction — the strongest single piece of evidence available here, because it is a filing-grade test rather than a management adjective. The residual risk is the company's own hedged sentence about statutory limits in "certain subsidiaries", which is not quantified in the pool. **Not a cap:** the disclosure exists and the SEC restricted-net-assets test is clean, so the MODULE_RULES cap for "HoldCo has material debt but upstreaming constraints unclear" does **not** bind |
| **Material restricted / trapped cash** | **$79.6m of the $256.0m of cash (31.1%) is "held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences"** [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]. Prior year: $53.2m of $131.2m (40.5%) [`FY24 10-K, MD&A`]. Geographic revenue mix at FY2025 was Americas 81%, EMEA 15%, Asia-Pacific 4% [`ciq_facts.json` `geographic`, CIQ Segments] | **Net debt is understated by up to $79.6m if that cash cannot be moved to the Obligor Group.** Netting it against HoldCo debt assumes free movement the filing explicitly qualifies. Strict net debt excluding it is **$1,316.0m** and net leverage **1.22x** rather than 1.15x — a 0.07-turn effect, so it changes the reading in principle but not in magnitude at today's leverage. It matters more in a stressed case, where the freely usable cash is $176.4m, not $256.0m; `03_liquidity-runway` and `06_downside-stress-test` must use the $176.4m figure. Note also the covenant's own answer to this question: it caps cash netting at **$250.0m** regardless [`Q2 FY26 10-Q, Note 10`] |

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

**Use these verbatim. Any departure must be labelled with its own basis.**

| Anchor | Value | Basis label — carry this with the number |
|---|---:|---|
| **Reporting currency** | **USD, millions** | US GAAP; fiscal year ends 31 December; balance-sheet date **30 June 2026** |
| **Gross debt** | **1,492.4** | Filing basis — `Q2 FY26 10-Q, Note 10 (Debt)`. Total principal $1,500.0m before $7.6m of issuance costs/discounts. **Excludes** $140.5m of operating leases (US GAAP keeps them off the debt line) and ~$17.8m of finance leases |
| **Net debt — CANONICAL** | **1,236.4** | **Strict §15 basis** (gross debt − cash & equivalents). Broad basis is **identical**, because nVent holds **no** short-term investments. This strict figure is the module's designated canonical net debt |
| Net debt — conservative variant | 1,316.0 | Strict basis **excluding the $79.6m of cash that cannot be readily repatriated**. Use this in `03_liquidity-runway` and `06_downside-stress-test` |
| Net debt — vendor variant (do not headline) | 1,376.9 | **Capital IQ lease-inclusive vendor basis** [`ciq_facts.json`, `CIQ Financials → Balance Sheet`]. Reconciles exactly: 1,492.4 + 140.5 leases − 256.0 |
| **Cash & liquid investments** | **256.0** cash; **0.0** short-term investments; **176.4** freely usable | `Q2 FY26 10-Q` balance sheet and MD&A. $79.6m (31.1%) trapped. The $600.0m undrawn committed revolver is **liquidity, not cash** — `03_liquidity-runway` owns it |
| **EBITDA base — reported** | **1,074.6** | LTM to 30-Jun-2026, continuing operations, GAAP-derived. **Cycle position: PEAK / latest** |
| **EBITDA base — company adjusted** | **1,061.5** | LTM to 30-Jun-2026. **Cycle position: PEAK / latest.** *The Q2 FY26 component ($340.1m) is computed by this agent from the 10-Q's own segment-reconciliation and cash-flow tables, not published by the company — no Q2 deck is in the pool. Carry this caveat* |
| **EBITDA base — normalised / mid-cycle** | **863.6** | Three-year average of reported EBITDA (FY2024 675.6, FY2025 840.5, LTM 1,074.6). **Cycle position: MID-CYCLE / NORMALISED.** *A labelled normalisation, not a forecast* |
| **Net debt / EBITDA — reported** | **1.15x** | 1,236.4 ÷ 1,074.6, strict basis, **peak EBITDA** |
| **Net debt / EBITDA — adjusted** | **1.16x** | 1,236.4 ÷ 1,061.5, strict basis, **peak EBITDA** |
| **Net debt / EBITDA — mid-cycle** | **1.43x** | 1,236.4 ÷ 863.6, strict basis, **normalised EBITDA** |
| **Gross debt / EBITDA** | **1.39x** reported · **1.41x** adjusted · **1.73x** mid-cycle | as built in §5 |
| Debt / capital · Debt / equity | **27.2%** · **37.4%** | Filing debt basis over total equity $3,986.9m |
| Fixed / floating mix | **86.7% fixed** ($1,300.0m notes) / **13.3% floating** ($200.0m term loan) of $1,500.0m principal | `Q2 FY26 10-Q, Note 10`. Cross-currency swaps $350.5m notional hedge currency, not rate [`Note 9`] |
| Security | **100% senior unsecured; no collateral pledged** | `Q2 FY26 10-Q, Note 10`. Only the leases are "secured", and only on the leased assets |
| **Pro-forma for Maverick Power — LABELLED PRO-FORMA, NOT REPORTED** | net debt **~2,986.4**; net leverage **~2.43x** reported / **~2.46x** adjusted / **~2.94x** mid-cycle; **~2.88x** if the full $550m earnout is paid; **~2.17x** on FY2026 consensus EBITDA of $1,225.0m | *Inference, not from filings.* $1.75bn cash consideration added to net debt (mix-independent); denominator adds Maverick's implied ~$152.2m 2026 adjusted EBITDA (from the release's own 11.5x). Financing mix, tenor and pricing **not disclosed in the data pool**; Bank of America committed bridge financing in place; expected close Q4 2026 [`nVent news release, 2026-08-24`] |

**Caveats every downstream agent must propagate.**
1. **Both EBITDA bases are at a cyclical peak.** Any single-year leverage figure quoted without the 1.43x mid-cycle counterpart understates fragility (MODULE_RULES Calculation Standard 4).
2. **The adjusted-EBITDA figure of $1,061.5m contains a $340.1m Q2 FY26 component computed by this agent** from filed tables, because no Q2 FY26 reconciliation deck exists in the pool. It ties to management's stated 1.2x net leverage, which is corroboration but not publication.
3. **Every Maverick figure is pro-forma and rests on an undisclosed financing mix.** Never present it as reported. The purchase price is a fact from the release; the leverage that results is arithmetic on an assumption.
4. **$79.6m of the cash is effectively trapped.** Do not net it silently.
5. **No credit-rating-agency report is in this pool.** Management's stated "intent to maintain investment grade metrics" [`Q2 FY26 10-Q, MD&A`] is management language, not an agency action — do not infer or assert a rating from it.
6. **The FY2025 Form 10-K is absent from this pool.** FY2025 audited lease, pension and contingency detail is read through the Capital IQ export or the FY2024 10-K, and is cited as such — never under an FY2025 filing's name.

**On the level itself (MODULE_RULES Core Principle 8; CLAUDE.md §24, Filter 3).** nVent is **not** net cash — net debt is $1,236.4m — so the net-cash treatment does not apply. What the numbers do show is a balance sheet that has taken 1.85 turns of net leverage off its FY2024 peak, carries no secured debt, has nothing pledged, holds an undrawn $600.0m committed revolver, and runs 86.7% fixed-rate. This report states those levels and their trend; it makes **no solvency verdict** — that is `99_balance-sheet-survival-synthesis`'s job. The maturity ladder belongs to `02`, liquidity to `03`, coverage and covenant headroom to `04`, contingencies to `05`, and the downside stress to `06`.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Measurement date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31) · **Report date: 2026-09-07**

**Read these three things before the tables.**

1. **A full year-by-year maturity table is disclosed**, so the partial-data rule for "no maturity schedule" does **not** apply and no confidence cap binds [`Q2 FY26 10-Q, Note 10 (Debt)`; confirmed in `00_solvency-data-triage` §5]. Everything below is built from that table, not from a short-term / long-term split.
2. **The maturity table is stated on principal ($1,500.0m); the balance-sheet debt figure is $1,492.4m.** The $7.6m gap is unamortized debt issuance costs and discounts — a book-value adjustment, not an obligation. Percentages below use the $1,500.0m principal, because that is what actually has to be repaid. The reconciliation to `01`'s gross debt is in §1.
3. **A $1.75bn acquisition sits outside every reported number here.** Maverick Power was announced 24 August 2026, after the 30 June 2026 balance-sheet date, to be funded "with a combination of available cash on hand and new debt," with committed bridge financing from Bank of America, expected to close Q4 2026 [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. **The financing mix, tenor and pricing are not disclosed in this data pool.** Every forward or pro-forma line below is labelled as such and is never presented as a reported figure.

---

## 1. Maturity Schedule

USD millions. The rows below are the filing's own **calendar-year** presentation of debt outstanding at 30 June 2026, excluding unamortized issuance costs and discounts. Source for every amount: `Q2 FY26 10-Q, Note 10 (Debt)`, contractual debt obligation maturities table.

| Period (calendar-year basis, from 30-Jun-2026) | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| **Within 12 months** — H2 2026 (Q3–Q4) | **6.9** | **0.46%** | Scheduled amortisation (part-year repayment) of the floating Term Loan Facility | `Q2 FY26 10-Q, Note 10` |
| **Year 2** — calendar 2027 | 13.8 | 0.92% | Term Loan Facility amortisation | `Q2 FY26 10-Q, Note 10` |
| **Year 3** — calendar 2028 | **517.2** | **34.48%** | **4.550% Senior Notes due 2028, $500.0m, maturing 2028-04-15** + $17.2m Term Loan amortisation | `Q2 FY26 10-Q, Note 10`; maturity date 2028-04-15 from `CIQ Financials → Capital Structure Details` (tier-5 vendor export) |
| **Year 4** — calendar 2029 | 20.6 | 1.37% | Term Loan Facility amortisation | `Q2 FY26 10-Q, Note 10` |
| **Year 5** — calendar 2030 | 141.5 | 9.43% | Term Loan Facility — final amortisation plus the balloon at **2030-06-30** | `Q2 FY26 10-Q, Note 10`; maturity date from `CIQ Financials → Capital Structure Details` |
| Calendar 2031 | 300.0 | 20.00% | 2.750% Senior Notes due 2031 | `Q2 FY26 10-Q, Note 10` |
| **Thereafter** (2033) | 500.0 | 33.33% | 5.650% Senior Notes due 2033 | `Q2 FY26 10-Q, Note 10` |
| **Total principal** | **1,500.0** | **100%** | | `Q2 FY26 10-Q, Note 10` |

**Reconciliation to `01`'s gross debt (required).** `01_capital-structure-and-leverage` designates gross debt of **$1,492.4m** on the filing basis. The schedule above totals **$1,500.0m**. The single reconciling item is **$7.6m of unamortized debt issuance costs and discounts**, which the filing subtracts to get to the carrying value: 1,500.0 − 7.6 = 1,492.4 [`Q2 FY26 10-Q, Note 10`]. Nothing else differs — the schedule captures 100% of the corporate debt stack.

**Two items sit outside this wall and are named so they are not lost.** (a) **Operating lease liabilities of $140.5m** (current $33.0m, non-current $107.5m; weighted-average remaining term 5 years) are kept off the debt line under US GAAP and are not in Note 10's maturity table [`Q2 FY26 10-Q, Note 8`]. (b) **Finance lease obligations of ~$17.8m** at 31-Dec-2025, weighted-average remaining term ~12 years, also sit outside Note 10 [`CIQ Financials → Capital Structure Details` (FY2025 block); `FY24 10-K, Note 17 (Leases)`]. Neither is a refinancing event — leases run off with the asset — but together they are ~$158m of contractual cash claims not counted in the wall.

**Nothing in the wall is secured.** All four instruments are senior unsecured with no collateral pledged, so there is no collateral package to lose and no secured lender ahead of the notes [`Q2 FY26 10-Q, Note 10`; `01_capital-structure-and-leverage` §1]. All of it sits at the three holding companies of the Obligor Group, which is structurally subordinated to the operating subsidiaries' own creditors [`Q2 FY26 10-Q, Note 10`; `01` §6A].

### 1a. Rolling schedule from the balance-sheet date

The filing gives calendar years. A refinancing read needs rolling windows, so the term-loan amortisation is split evenly across each calendar year to build them. *That even split is an approximation, not a disclosure — Inference, not from filings.* It affects only the small amortisation amounts, never the $500.0m note maturity, which carries a stated date.

| Rolling window from 30-Jun-2026 | Amount Due | % of $1,500.0m principal | What it is |
|---|---:|---:|---|
| 12 months (to 30-Jun-2027) | **13.8** | **0.92%** | Term Loan amortisation only. **Not an approximation** — it ties exactly to the balance sheet's own "Current maturities and short-term borrowings" of $13.8m [`Q2 FY26 10-Q, Note 10`] |
| 24 months (to 30-Jun-2028) | **529.3** | **35.29%** | The above plus the **$500.0m 2028 Notes on 2028-04-15**, plus ~$15.5m further amortisation |
| 36 months (to 30-Jun-2029) | **548.2** | **36.55%** | The above plus ~$18.9m of amortisation. **Nothing new matures in year 3** |

**From today (2026-09-07) rather than the balance-sheet date**, the picture is the same one shifted ~2 months: the $500.0m 2028 Notes sit roughly **19 months** away, and there is ~$13.8m of scheduled amortisation between now and then plus a further ~$8.6m in the first four months of 2028.

---

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| **Weighted-average maturity (WAM)** | **4.42 years** from 30-Jun-2026 |
| **% due within 12 months** | **0.92%** ($13.8m) |
| **% due within 24 months** | **35.29%** ($529.3m) |
| **% due within 36 months** | **36.55%** ($548.2m) |
| **Largest single maturity year** | **Calendar 2028 — $517.2m (34.48% of principal)**, of which $500.0m is the 4.550% Senior Notes due 2028-04-15 |

**WAM build (weighted-average maturity = the average time to repayment, weighted by how much money is due).** Each tranche is weighted by principal and by years from 30-Jun-2026:

| Tranche | Principal | Years out | Principal × years |
|---|---:|---:|---:|
| Term Loan amortisation, H2 2026 | 6.9 | 0.375 | 2.6 |
| Term Loan amortisation, 2027 | 13.8 | 1.00 | 13.8 |
| **4.550% Notes, 2028-04-15** | **500.0** | **1.79** | **897.0** |
| Term Loan amortisation, 2028 | 17.2 | 2.00 | 34.4 |
| Term Loan amortisation, 2029 | 20.6 | 3.00 | 61.8 |
| Term Loan, 2030 (amortisation + 2030-06-30 balloon) | 141.5 | 4.00 | 566.0 |
| 2.750% Notes, 2031 | 300.0 | 5.38 | 1,613.4 |
| 5.650% Notes, 2033 | 500.0 | 6.87 | 3,437.0 |
| **Total** | **1,500.0** | | **6,626.0** |

6,626.0 ÷ 1,500.0 = **4.42 years**.

*The exact maturity dates of the 2031 and 2033 Notes are not stated in the pool.* They are placed at 15-Nov-2031 and 15-May-2033 from the issue months (November 2021 and May 2023) and the disclosed semi-annual interest dates of 15 May / 15 November, on a standard 10-year tenor [`Q2 FY26 10-Q, Note 10`]. *Inference, not from filings.* The sensitivity is small: putting both at their calendar-year midpoints instead gives a WAM of **4.45 years**, so the answer is ~4.4 years either way.

**What the profile says.** The ladder is barbelled, not smooth: **0.92% of the debt falls due in the next twelve months**, then a single $517.2m step in 2028, then almost nothing again until the $300.0m 2031 Notes. The 2028 step is more than a third of the entire stack in one calendar year. A 4.42-year average maturity is a fair description of the ladder's length, but it is not a description of its shape — MODULE_RULES Core Principle 3 exists for exactly this case.

---

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| **Fixed-rate share** | **86.7%** ($1,300.0m of $1,500.0m principal) | `Q2 FY26 10-Q, Note 10` — 2028 Notes $500.0m @ 4.550%, 2031 Notes $300.0m @ 2.750%, 2033 Notes $500.0m @ 5.650% |
| **Floating-rate share** | **13.3%** ($200.0m Term Loan Facility) | `Q2 FY26 10-Q, Note 10` — priced off adjusted base rate / SOFR / EURIBOR / SONIA plus a margin; average rate **4.903%** at 30-Jun-2026 |
| **Weighted-average coupon** | **4.604%** | Build: (500.0×4.550 + 300.0×2.750 + 500.0×5.650 + 200.0×4.903) ÷ 1,500.0 = 6,905.6 ÷ 1,500.0. Rates and principals from `Q2 FY26 10-Q, Note 10` |
| **Current market refi rate — 5-year tenor (matching a new 5-year note)** | **~5.51%** | 5-year US Treasury **4.54%** at 2026-09-04 [`Web: Forbes Advisor / Trading Economics Treasury rates, 2026-09-04 — indicative, unverified`] + BBB corporate credit spread **0.97%** (97 bps), ICE BofA BBB US Corporate Index option-adjusted spread, August 2026 [`Web: FRED / Trading Economics BAMLC0A4CBBB, Aug-2026 — indicative, unverified`] |
| **Current market refi rate — 10-year tenor** | **~5.73%** | 10-year US Treasury **4.76%** at 2026-09-04 (intraday high 4.818%, the highest since November 2023) [`Web: Trading Economics / CNBC, 2026-09-04 — indicative, unverified`] + the same 97 bps BBB spread |
| **Estimated refi cost step-up on the next maturity (the 2028 Notes)** | **+96 bps** at 5-year tenor (5.51% − 4.550%); **+118 bps** at 10-year tenor | Computed from the two rows above |
| *Memo:* step-up if the **whole stack** repriced at today's 5-year market rate | **+91 bps** (5.51% − 4.604%) | Computed |
| *Memo:* step-up on the **2031 Notes** when they eventually come due | **+276 bps** (5.51% − 2.750%) — the cheapest money in the stack, but not due until 2031 | Computed |

**A required label on the market rate.** No credit-rating-agency report is in this data pool [`00_solvency-data-triage` §3]. The BBB index is used as a **credit-spread proxy**, not as a claim about nVent's rating — **no rating is asserted or inferred here.** Management states an "intent to maintain investment grade metrics" [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`], and the credit facility's margin can be set off a "public debt rating" [`Q2 FY26 10-Q, Note 10`], which implies a public rating exists — but the pool does not contain it, so nothing is claimed. If nVent prices tighter or wider than the BBB index, the step-up moves one-for-one with that difference.

**The coupon figure ties to the actual cash cost.** Contractual interest at the weighted-average coupon is 4.604% × $1,500.0m = **$69.1m a year**. Reported net interest expense was **$34.9m for the six months to 30-Jun-2026** [`Q2 FY26 10-Q, Condensed Consolidated Statements of Income`], which annualises to **$69.8m**. The two agree within $0.7m, so the coupon build is not a paper construct.

**What the step-up actually costs in cash.** Refinancing the $500.0m 2028 Notes at ~5.51% adds **~$4.8m a year** of pre-tax interest (+96 bps × $500.0m); at 10-year tenor, ~$5.9m. Against LTM reported EBITDA of $1,074.6m that is **0.45% of EBITDA**, and against LTM interest expense of ~$69.8m it is a **~7% rise in the interest bill**. It is a real cost and a small one.

**Floating-rate sensitivity (how much of the interest bill moves if rates move).** Only **$200.0m** — 13.3% of principal — reprices. A **+200 bps** shock adds **$4.0m a year** of pre-tax interest (0.37% of LTM EBITDA; +5.7% on the ~$69.8m interest bill). The cross-currency swaps of $350.5m notional hedge **currency, not interest rate**, so they do not reduce this [`Q2 FY26 10-Q, Note 9`]. Two things shrink the exposure further over time: the term loan amortises (down to ~$193.1m by end-2026 on the schedule above), and it is prepayable — the company repaid nearly $70m of it in Q2 2026 alone [`Q2 FY26 transcript, 2026-07-31, prepared remarks (CFO)`].

---

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

Measured against the **$529.3m of maturities in the 24 months to 30-Jun-2028** — which is $13.8m of term-loan amortisation, ~$15.5m more amortisation, and the **$500.0m 2028 Notes on 2028-04-15**.

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| **Cash on hand** | **$256.0m** total; **$176.4m** freely usable | $256.0m at 30-Jun-2026, "of which $79.6 million is held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences" [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]. `01` designates $176.4m as the freely usable figure. **Post-Maverick cash balance: unknown** — the release says cash will part-fund the purchase but does not say how much |
| **Forecast FCF (recent run-rate, labelled)** | **~$659.9m a year** (recent run-rate, **not** a forecast) | LTM to 30-Jun-2026: continuing-operations CFO $772.8m − capex $112.9m = FCF $659.9m [`earnings/01_historical-financials` §2, built from `Q2 FY26 10-Q, Statements of Cash Flows` and `CIQ Financials → Cash Flow`]. On the total-company CFO basis (including a −$82.2m discontinued-operations drag) the same LTM FCF is $577.7m [`CIQ Financials → Cash Flow`, LTM Jun-30-2026]. Over 24 months at the run-rate that is roughly **$1,320m** gross, less dividends of ~$137m a year ($0.21/share quarterly on ~162m shares [`Q2 FY26 10-Q, Note 12`]) → **~$1,046m** before any buybacks. **This is a run-rate extrapolation on peak-cycle earnings, not a forecast** |
| **Revolver availability (only if availability known)** | **$600.0m — availability is known and stated** | "As of June 30, 2026, the borrowing capacity under the Revolving Credit Facility was $600.0 million," $0 drawn, five-year senior **unsecured** facility maturing 2030-06-30, **not** borrowing-base [`Q2 FY26 10-Q, Note 10`]. An accordion of up to a further $300.0m exists but is **subject to lender commitment** and is therefore excluded. **Post-Maverick availability: unknown** |
| **Asset-sale proceeds (only if announced / authorized)** | **None — nothing announced or authorised** | No disposal is announced in the pool. The last one, Thermal Management for $1.65bn, closed 30-Jan-2025 and is already reflected in the balance sheet [`FY24 10-K, Item 1 and Note 6`; `01` §6] |
| **New debt issuance (only if committed / announced)** | **$0 committed against these maturities** | **Bank of America has provided committed bridge financing — but for the Maverick purchase price, not for the 2028 Notes** [`nVent news release, 2026-08-24`]. No issuance, commitment or refinancing has been announced for the $500.0m 2028 Notes. The size, tenor and pricing of the bridge are **not disclosed in the data pool** |

**Unknowns stated plainly, not assumed away.** Three cells above are unknown and must travel with the figures: (a) how much of the $256.0m of cash Maverick consumes at close; (b) whether the revolver is drawn to help fund Maverick, which would cut the $600.0m of availability; (c) the bridge's size, tenor and pricing, and whether it will be taken out with bonds, a term loan, or equity. None of these is assumed here.

**Is the near-term wall covered?** On the reported 30-June-2026 structure, yes, and by a wide margin: the next twelve months require **$13.8m** of repayment against **$256.0m** of cash and roughly **$659.9m a year** of recent-run-rate free cash flow — the twelve-month wall is **2.1% of one year's FCF**. The 24-month bar is the $500.0m 2028 Notes, which two years of run-rate FCF after dividends (~$1,046m) would cover twice over even with no market access, and which $600.0m of committed undrawn revolver could bridge on its own if the company chose. **Rating posture and recent refinancing activity are both evidenced:** nVent amended and restated its credit agreement in **June 2025**, replacing three earlier term loans with a five-year $275.0m term loan and a five-year $600.0m revolver, both maturing 2030-06-30 [`Q2 FY26 10-Q, Note 10`; prior facilities visible in the FY2024 block of `CIQ Financials → Capital Structure Details`], and in **February 2026** upgraded the notes' credit package by adding nVent Electric plc and Hoffman Schroff Holdings as full joint-and-several guarantors [`Q2 FY26 10-Q, Note 10`] — bank and bond market access proven within the last fifteen months, and a bridge commitment secured from Bank of America in August 2026. **Interest-rate repricing exposure is small:** only **$200.0m (13.3%)** of the debt floats, so a +200 bps move adds **$4.0m a year**, or 0.37% of LTM EBITDA. **Conclusion on the reported structure: "self-funded / low refi risk" for the next 12 months, stepping to "refinanceable in most markets" for the April 2028 wall.**

**The pro-forma qualifier that must travel with that conclusion — LABELLED PRO-FORMA, NOT A REPORTED FIGURE.** Maverick adds **$1.75bn of cash consideration plus up to $550m of contingent earnout** to a balance sheet that today carries $1,492.4m of debt, taking pro-forma net leverage to roughly **2.4x** on a trailing basis and up to **~2.9x** on normalised EBITDA or with the earnout paid [`01` §5A — *Inference, not from filings*]. The new debt that funds it is **not in the maturity table above**, and its tenor is the single fact that decides whether the 2028 wall stays a $517.2m step or becomes a much larger one. If the bridge is termed out with paper maturing before or alongside April 2028, the 2028 concentration rises materially; if it is termed out to 2032–2036, the ladder lengthens. **The pool does not say which.** No pro-forma maturity schedule is constructed here, because constructing one would require inventing the tenor.

---

## 5. Refinancing Read

**The wall is one date and one instrument: $500.0m of 4.550% Senior Notes on 15 April 2028, about 19 months from today, which with $17.2m of term-loan amortisation makes calendar 2028 the single largest maturity year at $517.2m — 34.5% of the entire $1,500.0m stack — while the next twelve months require only $13.8m, or 0.92%** [`Q2 FY26 10-Q, Note 10`]. Refinancing that $500.0m at today's indicative market rate of ~5.51% for five-year BBB-proxy paper (4.54% 5-year Treasury at 2026-09-04 plus a 97 bps August-2026 BBB spread, both web-sourced and unverified) costs **+96 bps, or about $4.8m a year more** — 0.45% of LTM EBITDA, a real cost and a small one. **The single biggest refinancing risk is not the 2028 notes at all: it is the tenor of the debt that funds the $1.75bn Maverick purchase, which is not disclosed anywhere in this pool** — if that new paper is termed out short, the modest 2028 step becomes a genuine wall, and the same Bank of America bridge that de-risks the closing becomes a refinancing obligation of its own inside twelve months.

**Does the company survive the next 12 months under "market closure" — no new unsecured issuance?** **On the reported 30-June-2026 structure, yes, comfortably, and with evidence rather than assumption.** The test is $13.8m of scheduled repayment plus ~$69.8m of annual interest against $256.0m of cash on hand ($176.4m of it freely usable after the $79.6m that cannot be readily repatriated), roughly $659.9m a year of recent-run-rate free cash flow, and $600.0m of committed, undrawn, non-borrowing-base revolver whose availability the filing states outright — a facility that does not itself mature until 2030-06-30, so a closed market cannot pull it. Nothing needs to be issued, sold, or waived. **Two assumptions are labelled rather than hidden:** the $659.9m FCF figure is a trailing run-rate on peak-cycle earnings, not a forecast (`01` records LTM EBITDA of $1,074.6m as a cyclical peak against a $863.6m normalised figure), and this answer covers the reported structure only — **the Maverick-inclusive answer cannot be given, because the pool does not disclose how the $1.75bn is financed.** If the acquisition closes in Q4 2026 as expected and the market then shuts, the 12-month survival question turns entirely on the terms of a bridge facility that this data pool does not contain.



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Measurement date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31) · **Report date: 2026-09-07**

**Four things to hold on to before the tables.**

1. **Liquidity runway means: how many months the company can keep paying what it owes out of money it already has, plus the cash the business throws off.** It is not the same question as solvency (`01`) or refinancing (`02`).
2. **Revolver availability is disclosed, so the revolver counts.** The filing states outright: *"As of June 30, 2026, the borrowing capacity under the Revolving Credit Facility was $600.0 million"*, with **$0 drawn** and no borrowing base [`Q2 FY26 10-Q, Note 10 (Debt)`]. MODULE_RULES' "exclude the revolver if availability is unknown" rule therefore does **not** bite, and the "revolver availability unknown → runway capped at 60" score cap does **not** apply.
3. **Every liquidity figure below carries its §15 basis label.** nVent holds **no** short-term investments, so the strict and broad bases are identical; "gross liquidity" is used where cash and the facility are added together with no debt netted.
4. **A $1.75bn acquisition sits outside every reported number here.** Maverick Power was announced **24 August 2026** — after the balance-sheet date — for **$1.75bn cash plus up to $550m of contingent consideration**, to be funded "with a combination of available cash on hand and new debt", with committed bridge financing from Bank of America, expected to close **Q4 2026** [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. **The financing mix, tenor and pricing are not disclosed in this data pool.** §3B carries the pro-forma runway; it is labelled pro-forma on every line and is never a reported figure.

---

## 1. Liquidity Sources (committed only)

USD millions at **30 June 2026**.

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | **256.0** | **Partly** | **$79.6m (31.1%) is repatriation-limited** — "held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences". Freely usable cash is therefore **$176.4m**. This is not "restricted cash" in the accounting sense (it is not segregated), but it cannot be moved to the Obligor Group cheaply, so it is flagged and shown both ways | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` and `MD&A, Liquidity and Capital Resources` |
| Liquid short-term investments | **0.0 — none exist** | n/a | "Total Cash & ST Investments" equals cash and equivalents in every period FY2021–Jun-2026; there is no separate short-term-investment line. So the **strict** and **broad** §15 bases give the same number | `CIQ Financials → Balance Sheet` (tier-5 vendor export); confirmed against the 10-Q balance sheet |
| Revolver / facilities (commitment) | **600.0** | — | Five-year **senior unsecured** revolving credit facility from the June 2025 amended and restated Credit Agreement, maturing **2030-06-30**. **$0 drawn** at 30-Jun-2026 and at 31-Dec-2025 | `Q2 FY26 10-Q, Note 10 (Debt)`; maturity date from `CIQ Financials → Capital Structure Details` |
| **Revolver availability (disclosed)** | **600.0** | **Y** | The filing states the number directly: *"As of June 30, 2026, the borrowing capacity under the Revolving Credit Facility was $600.0 million."* **Not** borrowing-base; no reserves disclosed; no minimum-liquidity covenant exists to subtract (see the three tests below) | `Q2 FY26 10-Q, Note 10` |
| **Total usable liquidity — gross-liquidity basis** | **856.0** | | 256.0 cash + 600.0 committed availability. No debt netted — this is a **gross-liquidity** figure, not net cash (§15) | derived from the rows above |
| *Conservative variant:* total usable liquidity excluding repatriation-limited cash | **776.4** | | 176.4 + 600.0. `01` §7 designates $176.4m as the freely usable cash figure for this agent and for `06` | derived |
| *Excluded — uncommitted:* revolver accordion | **300.0** | **N** | "nVent Finance has the **option to request** to increase the Revolving Credit Facility in an aggregate amount of up to $300.0 million, **subject to customary conditions, including the commitment of the participating lenders**." A request the lenders may decline is not committed liquidity. **Excluded from every figure above** | `Q2 FY26 10-Q, Note 10` |

**Three tests run on whether the $600.0m is genuinely drawable, because a headline commitment is not the same as usable money.**

- **Is drawing it covenant-constrained? No, and by a wide margin.** `04_coverage-and-covenants` puts covenant net leverage at **1.13x** against a **3.75x** ceiling on the credit agreement's own definitions ($1,250.0m covenant net debt ÷ $1,106.7m covenant EBITDA), leaving room for roughly **$2,900m** of extra debt before a breach. Drawing the whole $600.0m takes covenant net debt to $1,850.0m and net leverage to **1.67x** — still **55% clear** of the 3.75x ceiling ((3.75 − 1.67) ÷ 3.75). On the minimum-interest-coverage floor of 3.00x, $600.0m drawn at an assumed 5.5% adds ~$33m of interest, giving $1,106.7m ÷ ~$107.9m = **~10.3x**, versus the 3.00x floor. *The 5.5% draw rate is a labelled assumption — the pool discloses the pricing grid's mechanism but not the current margin. Inference, not from filings.* **Conclusion: the covenants do not constrain the draw.**
- **Is there a minimum-liquidity covenant to subtract? No.** `04` searched the debt notes and found **no** minimum-liquidity, minimum-net-worth or current-ratio maintenance covenant anywhere [`Q2 FY26 10-Q, Note 10`; `FY24 10-K, Note 10`]. Nothing is subtracted.
- **Do the $102.0m of letters of credit and bonds eat into the $600.0m? Not on the disclosed facts — and this report does not double-count them.** `05_off-balance-sheet-and-contingencies` records **$102.0m** of outstanding bonds, letters of credit and bank guarantees at 30-Jun-2026 [`Q2 FY26 10-Q, Note 15`]. **The filing nowhere states that these are issued under the Revolving Credit Facility, and discloses no LC sublimit.** Critically, the *same filing, at the same date*, states borrowing capacity of **$600.0m** — so whatever those instruments are issued under, the disclosed availability is stated after them. Deducting $102.0m again would be double-counting an amount the company has already told us does not reduce capacity. **The instruments are carried instead as a contingent cash draw in §2, which is where they belong.** If a future filing were to reveal an LC sublimit inside the revolver, usable liquidity would fall by up to $102.0m to **$754.0m** (gross-liquidity basis) — sized here so the reader can apply it if the disclosure changes.

---

## 2. Near-Term Uses (next 12 months)

Window: **1 July 2026 to 30 June 2027**. USD millions.

| Use | Amount | Source |
|---|---:|---|
| **Debt maturities (from `02`)** | **13.8** | `02_maturity-wall-and-refinancing` §1a: **0.92%** of the $1,500.0m principal, all scheduled amortisation of the floating Term Loan Facility. `02` notes this is **not** an approximation — it ties exactly to the balance sheet's own "Current maturities of long-term debt and short-term borrowings" of $13.8m [`Q2 FY26 10-Q, Note 10`] |
| **Cash interest** | **74.9** | LTM net interest expense to 30-Jun-2026, built from the filing's own quarterly lines (FY2025 $75.0m − H1'25 $35.0m + H1'26 $34.9m) [`Q2 FY26 10-Q, Condensed Consolidated Statements of Income`; `CIQ Financials → Income Statement` FY2025]. **Interest is disclosed on a net basis only** — no gross interest or interest-income line exists in the pool. The run-rate contractual coupon on the 30-Jun-2026 stack is $69.1m (4.604% weighted-average on $1,500.0m principal), so the net line is not being flattered by hidden interest income [`04` §1] |
| **Maintenance capex** | **~66.7 — a proxy, not a disclosure** | **nVent does not split maintenance from growth capex anywhere in the pool.** Total capex was **$112.9m** LTM [`CIQ Financials → Cash Flow`, LTM Jun-30-2026] and is **guided to ~$130m for FY2026, up 40%**, with management stating "most of this increased investment is for **new capacity** to support growth in data centers, power utilities and supply chain resiliency" [`Q2 FY26 transcript, 2026-07-31, prepared remarks (CFO)`]. Maintenance capex is proxied at **depreciation of ~$66.7m** (total D&A $231.9m less acquisition intangible amortisation of $165.2m) [`CIQ Financials → Cash Flow`; `earnings/06_earnings-quality` for the $165.2m amortisation figure]. *A labelled proxy. Inference, not from filings.* |
| **Committed dividends** | **137.2** | Run-rate on the declared quarterly dividend: the Board declared **$0.21 per ordinary share** on 16 May 2026, and dividends payable on the balance sheet at 30-Jun-2026 were **$34.3m** — × 4 quarters = $137.2m [`Q2 FY26 10-Q, Note 12 (Dividends payable)` and `Condensed Consolidated Balance Sheets`]. LTM dividends actually paid were $132.9m [`CIQ Financials → Cash Flow`]. The dividend is declared quarterly and is legally cancellable, but it has been paid and raised every year in the pool (up 5% year on year per the CFO), so it is treated as committed |
| **Total near-term uses** | **292.6** | 13.8 + 74.9 + 66.7 + 137.2 |
| *Excluded — discretionary, not committed:* share repurchases | 58.0 LTM ($50.4m in H1 2026) | No authorisation amount or minimum commitment is disclosed in the pool. Buybacks are stopped at will, so they are **not** a committed use. Sized here so they are not lost: including them lifts total uses to **$350.6m** [`CIQ Financials → Cash Flow`; `Q2 FY26 10-Q, MD&A, Financing activities`] |
| *Excluded — contingent, not scheduled:* bonds, LCs and bank guarantees | 102.0 face value | Draws only if projects fail to perform. Face value rose 10.7 → 75.7 → 102.0 across Dec-2024, Dec-2025 and Jun-2026, with **$0 booked provision** — growth-linked, per the company's own mechanism ("fluctuates with the value of our projects in process and in our backlog"), not distress-linked [`Q2 FY26 10-Q, Note 15`; `05` §2] |
| *Excluded — outside the window:* Maverick Power earnout | up to 550.0 | Contingent on **2027 and 2028** performance metrics, so it cannot fall due inside the next twelve months [`nVent news release, 2026-08-24`; `05` §3] |
| *Memo — not double-counted:* operating and finance lease payments | ~32.6 a year | Already inside CFO, and therefore already inside the FCF used in §3. Named so a reader does not add them again [`04` §1, fixed-charge build] |

---

## 3. Runway

### 3A. As-reported (30 June 2026 structure)

**Basis chosen: NET-OF-FCF.** Free cash flow is large and positive, so the net-of-FCF basis is the correct one under MODULE_RULES §8. On this basis the annual burn is `(12-month maturities + committed dividends) − FCF`. **Cash interest and capex are NOT re-added** — FCF already carries both (interest paid sits inside CFO; capex is subtracted in full).

**The FCF figure used, and why (§15).** FCF = CFO − total capex. Three versions exist and all three are shown, with the normalised one leading because the reported figure is inflated by a disclosed one-off:

| FCF measure | Value | Build and basis |
|---|---:|---|
| **Normalised operating FCF — LEAD FIGURE** | **634.1** | Continuing-operations CFO $772.8m − capex $112.9m − **$25.8m of one-off IEEPA tariff refunds** [`earnings/06_earnings-quality`; `Q2 FY26 10-Q, Note 13` reconciliation line "IEEPA tariffs" 25.8]. This is the recurring cash the operations throw off |
| FCF, continuing operations as reported | 659.9 | $772.8m − $112.9m. Continuing-ops CFO is $690.6m reported CFO plus the $82.2m outflow through discontinued operations [`CIQ Financials → Cash Flow`, LTM Jun-30-2026; `Q2 FY26 10-Q, Statements of Cash Flows`; `earnings/01_historical-financials` §2] |
| FCF, total company (most conservative) | 577.7 | $690.6m reported CFO − $112.9m capex — includes the discontinued-operations drag [`CIQ Financials → Cash Flow`, LTM Jun-30-2026] |

*All three are **trailing** figures on **peak-cycle** earnings, not forecasts.* `01` §7 records LTM EBITDA of $1,074.6m as a cyclical peak against a normalised $863.6m; `earnings/02_revenue-drivers` calls Q2 FY26 "a peak-of-cycle print, not a normalised base". The cash is real — continuing-ops CFO is **71.9%** of EBITDA and `earnings/06_earnings-quality` records CFO at 69–79% of EBITDA for four straight years with no low-conversion flag — but the level is a peak.

| Metric | Value |
|---|---:|
| Total committed liquidity (gross-liquidity basis) | **856.0** (cash 256.0 + committed revolver availability 600.0) |
| Total committed liquidity, excluding repatriation-limited cash | 776.4 |
| Annual FCF (normalised operating, lead figure) | **634.1** |
| **Basis used** | **NET-OF-FCF** |
| **Annual net cash burn** = (13.8 maturities + 137.2 dividends) − 634.1 | **−483.1 — a SURPLUS, not a burn** |
| Monthly net cash burn | **negative — none** |
| **Liquidity runway (months)** | **No finite runway. FCF more than covers every committed 12-month obligation, with an annual surplus of $483.1m before touching a dollar of the $856.0m of liquidity** |

**Show the arithmetic and the sensitivities, so the surplus is not a single fragile point estimate:**

| Variant | Annual surplus (+) / burn (−) | Formula |
|---|---:|---|
| Normalised operating FCF $634.1m (lead) | **+483.1** | 634.1 − (13.8 + 137.2) |
| Continuing-ops FCF as reported $659.9m | +508.9 | 659.9 − 151.0 |
| Total-company FCF $577.7m (most conservative) | **+426.7** | 577.7 − 151.0 |
| Normalised FCF, **including** discretionary buybacks at the LTM run rate | +425.1 | 634.1 − (13.8 + 137.2 + 58.0) |

On every one of the four, FCF covers the obligations several times over. The committed 12-month debt maturity of $13.8m is **2.2%** of one year's normalised FCF.

**Gross-obligations cross-check — the deliberate no-FCF bound.** This is not the chosen basis (FCF is positive and cash-backed, so using it would overstate fragility), but it answers the question "what if the operations generated nothing at all?" and it is the number `06_downside-stress-test` should start from. Monthly burn = $292.6m ÷ 12 = **$24.4m**.

| Liquidity pool used | Runway (months) = liquidity ÷ $24.4m | Coverage multiple (÷ annual $292.6m) |
|---|---:|---:|
| **Total committed liquidity 856.0** | **35.1 months** | 2.93× |
| Excluding repatriation-limited cash: 776.4 | 31.8 months | 2.65× |
| Cash only, revolver excluded: 256.0 | 10.5 months | 0.87× |
| Freely usable cash only: 176.4 | 7.2 months | 0.60× |

*Units check (MODULE_RULES §8): 2.93× is a coverage **multiple**, not months. 2.93 × 12 = 35.1 months.*

**The split that matters: 30% of that 35.1-month bound is already in hand, 70% is a facility that must still be drawn.** Of the $856.0m, **$256.0m (29.9%)** is cash on the balance sheet — and only **$176.4m (20.6%)** of it can be moved freely. **$600.0m (70.1%)** is undrawn revolver: committed, non-borrowing-base, not covenant-constrained, and not maturing until 2030-06-30, so a closed market cannot pull it — but it is still money that has to be borrowed, not money that is sitting there.

### Seasonality / Peak Liquidity Need (Hard Check)

**Working capital IS seasonal, and the company says so in its own words:** *"We experience seasonal cash flows primarily due to increased demand for Electrical Connections products during the spring and summer months in the Northern Hemisphere"* [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`; same disclosure for the predecessor segment name in `FY24 10-K, Item 1 — Seasonality`].

**The peak build is not disclosed as a peak, but the pool contains enough to size the observed one.** Working-capital increases from the filings' own MD&A:

| Period | Working-capital increase | Cash & equivalents at period end | Source |
|---|---:|---:|---|
| Q1 2026 (three months) | **128.3** | **190.0** — the observed cash trough in this pool | `Q1 FY26 10-Q, MD&A, Operating activities` and balance sheet |
| H1 2026 (six months) | **219.7** | 256.0 | `Q2 FY26 10-Q, MD&A, Operating activities` |
| H1 2025 (six months) | 154.6 | — | `Q2 FY26 10-Q, MD&A, Operating activities` (comparative) |

So the build is **front-loaded into Q1** ($128.3m of the $219.7m first-half build, i.e. 58% of it in the first three months), and cash fell from $237.5m at 31-Dec-2025 to **$190.0m at 31-Mar-2026** before recovering to $256.0m by 30 June. The company attributes the 2026 build to "accounts receivable driven by the overall increase and timing of sales" — it is growth-driven (revenue up 53% in H1), not distress-driven.

**Re-run of the runway using peak seasonal cash usage** (gross-obligations bound; the build is already inside CFO, so it does **not** apply to the net-of-FCF basis — adding it there would double-count):

| Seasonal deduction applied to liquidity | Liquidity after the build | Runway (months) at $24.4m/month |
|---|---:|---:|
| Peak observed **half-year** build, $219.7m | 636.3 | **26.1 months** |
| Peak observed **quarter** build, $128.3m | 727.7 | 29.8 months |
| Peak half-year build, on the conservative liquidity pool of 776.4 | 556.7 | **22.8 months** |

**Statement required by the hard check:** the **peak** working-capital need is **not separately disclosed** — nVent discloses the seasonal pattern qualitatively and the realised half-year and quarterly builds, but never a peak-need figure. The $219.7m half-year build used above is the **largest realised build in the pool**, not a stated peak, so **the runway may still be overstated if a future peak exceeds it.** Note also that the largest build in the pool came in the strongest growth period the company has ever printed, which is the honest way to read it: the seasonal drag scales with growth, and growth is currently at a cycle peak.

### 3B. Pro-forma for Maverick Power — **LABELLED PRO-FORMA, NOT A REPORTED FIGURE**

Every number here rests on assumptions the pool does not contain. **The financing mix, tenor and pricing of the $1.75bn cash consideration are not disclosed** [`nVent news release, 2026-08-24`]. *Inference, not from filings.*

**What the cash portion does to the cash balance — the single most important line in this section.** The release says the purchase will be funded "with a combination of available cash on hand and new debt" but **does not say how much of each**. Two bounds bracket it:

| Funding case | Cash & equivalents after close | Freely usable cash after close | New debt drawn | Total committed liquidity (gross-liquidity basis) |
|---|---:|---:|---:|---:|
| **A — all debt-funded (upper bound on cash)** | **256.0 unchanged** | 176.4 | 1,750.0 | 856.0 (assumes the revolver is not used for the purchase) |
| **B — freely usable cash spent first (lower bound on cash)** | **79.6** | **0.0** | 1,573.6 | **679.6** — and every dollar of the remaining cash is repatriation-limited |

**Case B is the one to hold in mind: it wipes out the entire freely usable cash balance and leaves the company's usable liquidity as the revolver and nothing else.** The $79.6m that remains is precisely the money the company says it cannot readily move. A third case exists and is worse for liquidity — drawing the revolver to help fund the purchase — which would cut the $600.0m of availability dollar for dollar; the pool does not say whether that will happen.

| Pro-forma line (all *Inference, not from filings*) | Case A (all debt) | Case B (cash spent first) |
|---|---:|---:|
| Incremental annual interest on new debt at 5.0% / 5.5% / 6.0% | 87.5 / 96.2 / 105.0 | 78.7 / 86.5 / 94.4 |
| Pro-forma cash interest (74.9 + the above, at 5.5%) | **171.1** | **161.4** |
| Pro-forma normalised FCF (634.1 less after-tax interest at a 22.2% effective rate) | **559.2** | **566.7** |
| **PF annual net burn, NET-OF-FCF basis** = (13.8 + 137.2) − PF FCF | **−408.2 — still a surplus** | **−415.7 — still a surplus** |
| **PF runway, net-of-FCF basis** | **No finite runway; ~$408m annual surplus** | **No finite runway; ~$416m annual surplus** |
| PF total 12-month uses, gross-obligations bound (13.8 + PF interest + 66.7 + 137.2) | 388.9 | 379.1 |
| **PF runway, gross-obligations bound** = liquidity ÷ (uses ÷ 12) | **26.4 months** (856.0 ÷ 32.4) | **21.5 months** (679.6 ÷ 31.6) |

*Effective tax rate of 22.2% is built from the LTM continuing-operations figures: $168.4m tax ÷ ($591.0m earnings + $168.4m tax) [`CIQ Financials → Income Statement`, LTM Jun-30-2026].* **Maverick's own cash generation is deliberately excluded** from every pro-forma line above. `01` §5A implies ~$152.2m of anticipated 2026 adjusted EBITDA from the release's own 11.5x multiple; adding any of it would lengthen the runway. Excluding it makes these figures a **conservative bound**, and that is stated rather than quietly assumed.

**The one scenario where the runway becomes short, and it is a real one.** A bridge facility is designed to be refinanced — but if the Bank of America bridge is drawn at close in Q4 2026 and is **not** termed out into long-dated bonds within twelve months, then up to **$1,750m** enters the 12-month maturity bucket. On Case B at a 5.5% assumed rate:

`annual burn = (1,573.6 bridge + 13.8 amortisation + 137.2 dividends) − 566.7 PF FCF = 1,157.9` → monthly $96.5m → **runway = 679.6 ÷ 96.5 = 7.0 months.**

**That is the pro-forma number that matters, and it turns on one fact the pool does not contain: the tenor of the Maverick financing.** `02` reached the same conclusion from the maturity-wall side. It is not a prediction — bridges are routinely termed out, nVent has proven bond and bank access within the last fifteen months (June 2025 credit-agreement refinancing, February 2026 guarantee upgrade), and the release says the financing is committed. It is a statement of what the reader cannot yet check.

---

## 4. Sources & Uses Bridge

**On the reported 30-June-2026 structure, internal sources cover the next twelve months several times over, and no external access is required.** Committed uses of **$292.6m** (maturities $13.8m + cash interest $74.9m + maintenance-capex proxy $66.7m + dividends $137.2m) sit against normalised operating free cash flow of **$634.1m** — the business alone covers them **2.2 times** and leaves an annual surplus of **$483.1m** without touching the $856.0m of liquidity. Add discretionary buybacks at the LTM run rate of $58.0m and the surplus is still $425.1m. Nothing has to be issued, sold, drawn or waived.

**The split between money in hand and money that must still materialise is roughly 30/70 on liquidity and heavily FCF-dependent on the flow side.** Of the $856.0m of committed liquidity, only **$256.0m (29.9%) is cash already on the balance sheet — and just $176.4m (20.6%) of that can be moved freely**; the other **$600.0m (70.1%)** is an undrawn facility that must be borrowed, albeit a committed, unsecured, non-borrowing-base one that runs to 2030 and is nowhere near a covenant limit. On the flow side the dependence is larger: strip FCF out entirely and the 35.1-month bound falls to **10.5 months on cash alone** and **7.2 months on freely usable cash alone**. The runway is not fragile, but it is a working business's runway, not a cash pile's.

**Pro-forma, the answer changes in degree, not in kind — with one exception.** Maverick consumes up to the entire freely usable cash balance and adds roughly $87–105m a year of interest, which still leaves a ~$408–416m annual FCF surplus and a 21.5–26.4-month gross-obligations bound. **The exception is the bridge**: if it is drawn and not termed out within twelve months, the runway compresses to roughly **7 months** and external access stops being optional. The pool cannot tell us which happens.

---

## 5. Liquidity Read

**On the reported 30-June-2026 balance sheet there is no finite runway to state: free cash flow of $634.1m a year covers all $151.0m of committed 12-month financing obligations (a $13.8m debt maturity plus $137.2m of dividends) with a $483.1m annual surplus, and the $856.0m of committed liquidity — $256.0m of cash plus a fully available, unsecured, non-borrowing-base $600.0m revolver — is untouched.** Ignore the operations entirely and the gross-obligations bound is **35.1 months** (2.93× coverage of $292.6m of annual uses); ignore the revolver too and it is **10.5 months on cash**, or **7.2 months on the $176.4m of cash that can actually be moved.**

**The runway depends far more on cash generation holding up than on money already in hand: 70% of the committed liquidity is a facility that still has to be drawn, and the FCF doing the work is a trailing figure on peak-cycle earnings** — `01` records LTM EBITDA of $1,074.6m against a normalised $863.6m, and the working-capital build that comes with growth consumed $219.7m in H1 2026 alone, front-loaded into a Q1 that took cash down to $190.0m. That cash is genuine (CFO at 71.9% of EBITDA, four straight years at 69–79%, no cash-quality flag from `earnings/06_earnings-quality`), but it is cyclical, and the peak working-capital need is not disclosed, so the runway above may be overstated.

**The single biggest liquidity risk is not on the reported balance sheet at all: it is the tenor of the debt funding the $1.75bn Maverick Power purchase, which this data pool does not disclose.** In the case where nVent spends its freely usable cash first, the deal leaves it with $79.6m of cash that it says it cannot readily repatriate and a revolver as its only usable liquidity; and if the committed Bank of America bridge is drawn at a Q4 2026 close and is not termed out within twelve months, the runway falls from "no finite runway" to roughly **7 months**, at which point refinancing access stops being a convenience and becomes the whole question.

**Scores for the synthesizer (MODULE_RULES bands; higher = better on this score).** **Liquidity runway: 82/100** on the reported structure — committed liquidity of $856.0m with disclosed availability, a $483.1m annual FCF surplus, a 12-month maturity of 0.92% of debt, no minimum-liquidity covenant, and no covenant constraint on drawing the facility; held below the high 80s by three real things: 70% of the liquidity is undrawn facility rather than cash, 31.1% of the cash is repatriation-limited, and the FCF is at a cycle peak. **On the pro-forma Maverick structure the same score is 66/100**, and it would fall materially further if the bridge tenor turned out to be short. **No partial-data cap binds** — the revolver's availability is disclosed (so the "availability unknown → max 60" cap does not apply), the cash flow statement is present (so the "no cash flow → max 50" cap does not apply), and `00_solvency-data-triage` confirms no cap from the MODULE_RULES table is active.

**Scope note.** This report measures the runway only. The debt stack belongs to `01`, the maturity wall and refinancing to `02`, covenant headroom to `04`, contingencies to `05`, the downside stress test to `06`, and the solvency verdict to `99_balance-sheet-survival-synthesis`.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Measurement date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31) · **Ratio period: LTM to 30-Jun-2026**

**Read this before the tables — three things set the basis for everything below.**

1. **Coverage means: how many times over do the profits cover the interest bill.** Covenant headroom means: how far the actual ratio sits from the level at which the lenders could act. Both are computed here from filed numbers, with every formula shown.
2. **Interest is disclosed on a NET basis only.** The Q2 FY26 10-Q reports a single line, "Net interest expense" — $17.4m for Q2 and $34.9m for H1 2026. No gross interest expense and no interest income line is broken out anywhere in the pool. Every coverage ratio below therefore uses **net** interest of **$74.9m** for the LTM (FY2025 $75.0m − H1'25 $35.0m + H1'26 $34.9m). §4 of this report tests how much that could flatter the picture; the answer is: not enough to matter at these levels.
3. **The covenant ratios use the credit agreement's OWN EBITDA definition, not reported or company-adjusted EBITDA.** They are a different number ($1,106.7m) built on a different basis, and they are labelled as such on every line. The reported-EBITDA coverage ratios in §1 and the covenant ratios in §2–§3 are not interchangeable (CLAUDE.md §15, matched basis).

**Post-balance-sheet event carried throughout.** Maverick Power was announced **24 August 2026** — after the 30 June 2026 balance-sheet date — for **$1.75bn cash plus up to $550m of contingent consideration**, to be funded "with a combination of available cash on hand and new debt", with committed bridge financing from Bank of America, expected to close Q4 2026 [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. **The financing mix, tenor and pricing are not disclosed in this data pool.** Every Maverick figure in this report sits in §3A, is labelled pro-forma on every line, and is never presented as reported.

---

## 1. Coverage Ratios

All ratios LTM to 30-Jun-2026. **Interest = net interest expense $74.9m** (the only interest figure the company discloses). **EBITDA basis is labelled in each row.** Every value was produced by an executed Python calculation, not mental arithmetic (command and output shown at the end of this section).

| Ratio | Value | Source |
|---|---:|---|
| **EBITDA / interest** — reported EBITDA $1,074.6m ÷ $74.9m | **14.35x** | `CIQ Financials → Income Statement`, EBITDA LTM Jun-30-2026 (= `ciq_facts.json` `ltm_ebitda_m` 1,074.6) ÷ net interest built from `Q2 FY26 10-Q, Condensed Consolidated Statements of Income` and `CIQ Financials → Income Statement` FY2025 |
| **EBIT / interest** — EBIT $842.7m ÷ $74.9m | **11.25x** | `CIQ Financials → Income Statement`, EBIT (= operating income) LTM Jun-30-2026; matches the vendor's own Ratios row 11.251x |
| **(EBITDA − capex) / interest** — ($1,074.6m − $112.9m) ÷ $74.9m | **12.84x** | capex $112.9m from `CIQ Financials → Cash Flow`, LTM Jun-30-2026 |
| **Fixed-charge coverage** — ($1,074.6m − $112.9m) ÷ ($74.9m interest + $13.8m scheduled amortisation + $32.6m lease payments) = 961.7 ÷ 121.3 | **7.93x** | interest as above; scheduled amortisation = current maturities of long-term debt $13.8m [`Q2 FY26 10-Q, Note 10` and balance sheet]; lease payments **proxied** at $31.1m operating [`CIQ Financials → Income Statement`, "Net Rental Exp." FY2025] + ~$1.5m finance-lease payments [`FY24 10-K, Note 17 (Leases)`, finance-lease maturity schedule $1.4–1.5m per year] |
| *Same four, on company-adjusted EBITDA $1,061.5m* | EBITDA/int **14.17x** | adjusted EBITDA per `01_capital-structure-and-leverage` §7 — *its Q2 FY26 component of $340.1m is computed by that agent from filed tables, not published; carry that caveat* |
| *Same, on normalised / mid-cycle EBITDA $863.6m* | EBITDA/int **11.53x** · EBIT/int **8.43x** · fixed-charge **6.19x** | mid-cycle EBITDA per `01` §7 (three-year average FY2024 675.6 / FY2025 840.5 / LTM 1,074.6). *A labelled normalisation, not a forecast* |

**The EBITDA basis, stated plainly.** The headline row uses **reported** EBITDA — GAAP operating income of $842.7m plus depreciation and amortisation of $231.9m, on **continuing operations** only. It is **not** company-adjusted and it is **not** the covenant number. It is also at a **cyclical peak**: `business-model/07_business-quality` scores cyclicality 30/100 (reverse-mapped, its lowest row) and `earnings/02_revenue-drivers` states Q2 FY26 "is a peak-of-cycle print, not a normalised base". The mid-cycle row is the honest counterweight — coverage of **11.53x** rather than 14.35x on the same interest bill.

**Interest is NET, and here is the size of the possible error.** Rebuilding interest from the disclosed coupons on the 30-Jun-2026 stack gives a run-rate **gross** interest cost of **$69.1m** a year: $500.0m at 4.550% = $22.75m, $300.0m at 2.750% = $8.25m, $500.0m at 5.650% = $28.25m, $200.0m term loan at 4.903% = $9.81m — a weighted-average coupon of **4.604%** on $1,500.0m of principal [`Q2 FY26 10-Q, Note 10`]. The disclosed LTM **net** figure of $74.9m is **$5.8m higher** than that run-rate, which is what you would expect given debt was higher earlier in the twelve months ($1,559.8m at 31-Dec-2025) and given revolver commitment fees and issuance-cost amortisation. In other words the net line is not being flattered by a hidden slug of interest income. To breach the 3.00x minimum-coverage covenant, interest expense would have to reach **$368.9m — 4.9 times the disclosed $74.9m**. The net-versus-gross question cannot change any conclusion here.

**Is the EBITDA cash-backed? Yes, and the cross-module read says so.** `earnings/06_earnings-quality` records CFO at **69–79% of EBITDA for four straight years**, a cash conversion cycle **15.5 days shorter** than FY2023, and explicitly emits no low-cash-conversion flag ("CFO/EBITDA was not below 50% in any of the last three years"). On this report's own arithmetic, continuing-operations CFO for the LTM is $772.8m ($690.6m reported CFO plus the $82.2m outflow through discontinued operations), which is **71.9%** of reported EBITDA. Two caveats that travel with that, both from `earnings/06`: the LTM free cash flow includes roughly **$25.8m of one-off IEEPA tariff refunds**, so the recurring normalised operating FCF is about **$634.1m**, not $659.9m — that recurring cash still covers the net interest bill **8.47 times over**; and the reported-to-adjusted wedge is real but is **87% acquisition intangible amortisation** ($165.2m LTM), which is genuinely non-cash and does not weaken a coverage ratio. **Conclusion: no cash-quality caveat is required on the coverage ratios above.** Working capital is the live tension (it consumed $218.4m in H1 FY26 on revenue up 53%), and it is a liquidity question, which `03_liquidity-runway` owns — not a coverage question.

**One vendor row does not tie, and it is named rather than averaged away (§3).** `CIQ Financials → Ratios` prints EBITDA / interest expense of **14.794x** and (EBITDA − capex) / interest of **13.287x** for the LTM. Those imply an interest denominator of about **$72.6m**, not the $74.9m the same workbook's Income Statement carries, and not the $74.9m the 10-Q's own quarterly lines build to. The vendor's own EBIT / interest row (11.251x) *does* use $74.9m, so the Ratios tab is internally inconsistent. The deterministic sidecar `ciq_facts.json` reports `interest_coverage_x` = **14.3**, which matches this report's 14.35x exactly. **This report uses 14.35x, built from the filing's own quarterly interest lines, and treats the 14.794x row as a vendor artefact.** The difference is 0.45 turns on a 14x ratio and changes nothing.

**Executed calculation (fix F09).**

```
$ python3  # inputs: EBITDA_rep=1074.6, EBIT=842.7, capex=112.9,
           # int_net = 75.0 - 35.0 + 34.9 = 74.9
LTM net interest expense = 74.9
EBITDA/int         = 14.35x
EBIT/int           = 11.25x
(EBITDA-capex)/int = 12.84x
EBITDA/int adj     = 14.17x
EBITDA/int mid-cycle = 11.53x
EBIT/int mid-cycle   = 8.43x
Fixed-charge coverage = (1074.6-112.9)/(74.9+13.8+32.6) = 7.93x
Fixed-charge coverage, mid-cycle EBITDA = 6.19x
run-rate gross interest on the 30-Jun-2026 stack = 69.06 (wtd-avg coupon 4.604%)
interest that would breach the 3.00x floor = 368.9 (4.9x the disclosed 74.9)
cont-ops CFO LTM 772.8 -> CFO/EBITDA 71.9%
normalised op FCF 634.1 / net interest = 8.47x
```

---

## 2. Covenant Inventory

**The covenants are fully disclosed — the partial-data rule does not apply and no score cap binds.** The Q2 FY26 10-Q sets out both maintenance covenants, both thresholds, the acquisition election, and the covenant-EBITDA definition including the cash-netting cap. Verbatim: *"we may not permit (i) the ratio of our consolidated debt (net of our consolidated unrestricted cash in excess of $5.0 million but not to exceed $250.0 million) to our consolidated net income (excluding, among other things, non-cash gains and losses) before interest, taxes, depreciation, amortization and non-cash share-based compensation expense ("EBITDA") on the last day of any period of four consecutive fiscal quarters (each a "testing period") to exceed 3.75 to 1.00 (or, at nVent Finance's election and subject to certain conditions, 4.25 to 1.00 for four testing periods in connection with certain material acquisitions) and (ii) the ratio of our EBITDA to our consolidated interest expense for the same period to be less than 3.00 to 1.00"* [`Q2 FY26 10-Q, Note 10 (Debt)`, Senior credit facilities]. The company states it *"was in compliance with all financial covenants"* at 30 June 2026 and that *"there is no material uncertainty about our ongoing ability to meet those covenants"* [same note].

**Where they live and what they bind.** Both sit in the **Senior Credit Facilities** — the June 2025 amended and restated credit agreement providing a five-year $275.0m senior unsecured term loan (drawn balance $200.0m) and a five-year $600.0m senior unsecured revolving credit facility, entered into by nVent Electric plc, nVent Finance S.à r.l. and Hoffman Schroff Holdings, Inc. The 10-Q states these are *"the most restrictive"* financial covenants in the debt agreements — so the Senior Credit Facilities, not the Notes, set the binding constraint for the whole $1,492.4m stack.

| Covenant | Threshold | Current Actual (30-Jun-2026) | Headroom | Source |
|---|---|---:|---:|---|
| **Max net leverage** — covenant net debt / covenant EBITDA (MAX / ceiling) | **3.75x**; electively **4.25x** for four testing periods in connection with certain material acquisitions | **1.13x** ($1,250.0m ÷ $1,106.7m, principal basis) | **+69.9%** vs 3.75x · **+73.4%** vs the 4.25x election | `Q2 FY26 10-Q, Note 10` |
| **Min interest coverage** — covenant EBITDA / consolidated interest expense (MIN / floor) | **3.00x** | **14.78x** ($1,106.7m ÷ $74.9m) | **+392.5%** | `Q2 FY26 10-Q, Note 10` |
| **Min liquidity / net worth** | **None disclosed** — no minimum-liquidity, minimum-net-worth or current-ratio maintenance covenant appears anywhere in the debt note | n/a | n/a — no such covenant exists to have headroom against | `Q2 FY26 10-Q, Note 10`; `FY24 10-K, Note 10 (Debt)` |
| **Springing covenant (e.g. revolver-utilisation trigger)** | **None disclosed.** Both covenants are tested *"on the last day of any period of four consecutive fiscal quarters"* with no utilisation condition — they are **always active**, including today with the revolver undrawn. There is no springing structure to switch on or off | always on | **Status: ACTIVE** (both covenants) | `Q2 FY26 10-Q, Note 10` |
| **Equity cure rights (Y/N, limits)** | **Not disclosed in the data pool.** The 10-Q summarises the covenants but not the cure mechanics, and the credit agreement itself is not in the pool. Per MODULE_RULES ("cure rights must be captured"), this is recorded as an unknown, and the conservative default (§4) applies: **assume no cure right is available** until the credit agreement proves otherwise | unknown | not assessable | `Q2 FY26 10-Q, Note 10` (absence) |
| **Other — negative covenants** | Restrictions on the ability to **create liens, merge or consolidate with another person, make acquisitions, and incur subsidiary debt** (Senior Credit Facilities); the Notes' indentures separately restrict **merger/consolidation, liens and sale-and-leaseback** | not ratio-tested | n/a — incurrence-style restrictions, no headroom metric | `Q2 FY26 10-Q, Note 10` |
| **Other — rating-linked pricing step** | The applicable margin on the Senior Credit Facilities is set, at nVent Finance's election, off **nVent's net leverage ratio or its public debt rating**. This is a **pricing** step, not a default trigger — a downgrade raises the cost, it does not accelerate the debt | n/a | n/a | `Q2 FY26 10-Q, Note 10`. **No rating-agency report is in this pool**, so no rating is asserted here |
| **Other — change-of-control put / cross-default** | **Not disclosed in the data pool.** The only "change of control" language anywhere in the pool sits in equity-award agreements [`FY24 10-K` exhibits], not in the debt terms | unknown | not assessable | `Q2 FY26 10-Q, Note 10` (absence) |

**Direction-aware headroom, shown so the sign can be checked (MODULE_RULES §11).** Max net leverage is a **ceiling**, so headroom = (threshold − actual) ÷ threshold = (3.75 − 1.129) ÷ 3.75 = **+69.9%**. Min interest coverage is a **floor**, so headroom = (actual − threshold) ÷ threshold = (14.78 − 3.00) ÷ 3.00 = **+392.5%**. Applying the ceiling formula to the floor covenant would have printed −80% and falsely flagged the safest covenant as the tightest.

### Covenant EBITDA Definition & Quality (required — headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| **Covenant EBITDA definition summary** | Consolidated net income, **excluding non-cash gains and losses**, before **interest, taxes, depreciation, amortization and non-cash share-based compensation expense**. That is the complete definition as filed — nothing else | `Q2 FY26 10-Q, Note 10` |
| **Addbacks permitted (types)** | **Exactly one addback beyond the standard EBITDA build: non-cash share-based compensation.** Plus the exclusion of non-cash gains and losses. That is all. There is **no** addback for restructuring charges, **no** addback for acquisition transaction and integration costs, **no** "run-rate synergies" or "pro-forma cost savings" addback, and **no** general "other adjustments" basket. This is a notably narrow definition by leveraged-credit standards | `Q2 FY26 10-Q, Note 10` |
| **Addback caps / limits** | No cap is needed on the EBITDA side because only one addback exists. The cap that does bite is on the **other** side of the leverage ratio: cash netting is limited to **unrestricted cash in excess of $5.0m but not exceeding $250.0m**. With $256.0m of cash on hand, the netting allowed is min($256.0m − $5.0m, $250.0m) = **$250.0m**, so **$6.0m of the cash gets no credit** at all | `Q2 FY26 10-Q, Note 10`; cash from `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` |
| **Is covenant EBITDA materially above reported EBITDA?** | **No — it is 3.0% above.** Covenant EBITDA of **$1,106.7m** versus reported EBITDA of **$1,074.6m**, a gap of **$32.1m**, and the whole gap is explained by two named items: **+$40.5m** of non-cash share-based compensation (the one permitted addback) less **$8.4m** of restructuring charges ($7.8m) and other non-operating expense ($0.6m) that sit below operating income and are **not** added back. Build: earnings from continuing operations $591.0m + net interest $74.9m + tax $168.4m + D&A $231.9m + non-cash share-based comp $40.5m = **$1,106.7m** | `CIQ Financials → Income Statement` (earnings from continuing operations 591.0, tax 168.4, restructuring 7.8, other non-operating 0.6, stock-based comp 40.5) and `→ Cash Flow` (D&A total 231.9), LTM Jun-30-2026; net interest built from `Q2 FY26 10-Q` |

**Headroom quality: HIGH, and here is why that word is earned rather than asserted.** The usual reason covenant headroom is fake — the "addback illusion" — is a definition that lets a borrower add back restructuring costs, deal costs, and unrealised future synergies until covenant EBITDA is 30–50% above the audited number. **That is the opposite of what is happening here.** nVent's covenant EBITDA sits only **3.0%** above reported EBITDA, and it is *below* what the company's own adjusted-EBITDA presentation would support: the company excludes restructuring ($7.8m LTM), acquisition transaction and integration costs, intangible amortisation and the $25.8m IEEPA tariff reimbursement from its adjusted figures [`Q2 FY26 10-Q, Note 13 (Segment Information)` reconciliation], and **the covenant permits none of those exclusions except the amortisation that any EBITDA build removes.** The headroom below is therefore measured against a near-GAAP denominator. Two secondary points, both recorded rather than swept up: (a) **discontinued operations** contributed $7.3m of earnings in the LTM, and a strictly literal reading of "consolidated net income" would include them, lifting covenant EBITDA to $1,114.0m and headroom by 0.1 percentage points — this report uses the **more conservative continuing-operations build of $1,106.7m**; (b) the "excluding non-cash gains and losses" carve-out is immaterial in this period — no mark-to-market gain or loss line appears in the LTM segment reconciliations, so nothing is being stripped out.

**One definitional unknown, stated rather than assumed away.** The 10-Q says "consolidated **debt**" without defining whether that means the GAAP carrying amount ($1,492.4m, net of $7.6m of issuance costs), the principal outstanding ($1,500.0m), or principal plus finance-lease obligations (~$1,517.8m using the latest separately disclosed finance-lease figure of $17.8m at 31-Dec-2025 [`CIQ Financials → Capital Structure Details`]). All three are computed in §3 below. The spread across them is **0.02 turns of leverage and 0.6 percentage points of headroom** — it does not change any conclusion. The headline uses the **principal basis ($1,500.0m)**, the more conservative of the two filing-supported readings.

---

## 3. Headroom & Breach Proximity

All covenant figures on the **credit agreement's own definitions**: covenant net debt = debt − $250.0m of permitted cash netting; covenant EBITDA = $1,106.7m LTM.

| Metric | Value |
|---|---:|
| **Tightest covenant** | **Max net leverage 3.75x** (the ceiling in the Senior Credit Facilities) |
| **Headroom on tightest covenant (%)** | **+69.9%** — actual 1.13x against a 3.75x ceiling. On the 4.25x acquisition election: **+73.4%** |
| **EBITDA decline that would breach it (approx.)** | **−69.9%** — covenant EBITDA would have to fall from $1,106.7m to **$333.3m** ($1,250.0m ÷ 3.75) with debt and cash held flat |
| **Debt increase that would breach it (approx.)** | **+$2,900.1m** — gross debt would have to rise from $1,500.0m of principal to **$4,400.1m** (3.75 × $1,106.7m + $250.0m of netting), an increase of **193%**, with EBITDA held flat |

**The second covenant, for completeness.** The 3.00x minimum interest-coverage floor breaks at covenant EBITDA of $224.7m (3.00 × $74.9m) — a **−79.7%** fall, nearly ten percentage points further away than the leverage covenant. **The leverage covenant is the one that binds first**, and by a clear margin. Its headroom of +69.9% is the number the stress test in `06` should use.

**Three sensitivities on the tightest covenant, so the +69.9% is not read as a single fragile point estimate.**

| Basis | Covenant net debt | Covenant EBITDA | Net leverage | Headroom vs 3.75x |
|---|---:|---:|---:|---:|
| Debt at GAAP **carrying** amount | 1,242.4 | 1,106.7 | **1.12x** | **+70.1%** |
| Debt at **principal** (headline) | 1,250.0 | 1,106.7 | **1.13x** | **+69.9%** |
| Debt at principal **+ finance leases** (~$17.8m at 31-Dec-2025) | 1,267.8 | 1,106.7 | **1.15x** | **+69.5%** |
| Principal, on **normalised / mid-cycle** covenant EBITDA ($889.4m — the $1,106.7m scaled by 863.6/1,074.6) | 1,250.0 | 889.4 | **1.41x** | **+62.5%** |

The mid-cycle row is the one that matters for a cyclical name: on a normalised earnings base the same balance sheet still sits **62.5%** clear of the ceiling. The peak-EBITDA figure of +69.9% is the *floor* on leverage and the *ceiling* on headroom, not the central estimate (MODULE_RULES Calculation Standard 4).

**The cash-netting cap is a small, real drag worth naming.** Because netting stops at $250.0m, $6.0m of today's $256.0m cash balance earns no covenant credit — and every dollar of cash the company builds above $255.0m from here is worth **nothing** to the leverage covenant. That is a live consideration for a company generating roughly $634.1m of recurring operating FCF a year: cash accumulation stops helping the covenant almost immediately, only debt repayment does. Note also that the covenant's own cap ($250.0m) happens to sit close to this module's conservative "usable cash" figure of $176.4m (the $256.0m less $79.6m the company says it cannot readily repatriate [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]) — the covenant nets **unrestricted** cash, and repatriation-limited cash is not restricted cash in the accounting sense, so the full $250.0m netting stands. That is a definitional point, not a judgement that the cash is freely available.

### 3A. Pro-forma for Maverick Power — **LABELLED PRO-FORMA, NOT A REPORTED FIGURE**

Every number in this sub-section rests on an assumption the pool does not contain. **The financing mix, tenor and pricing of the $1.75bn cash consideration are not disclosed** [`nVent news release, 2026-08-24`]. *Inference, not from filings.*

The purchase price is a fact from the release; the leverage and coverage that follow are arithmetic on top of an assumption. Maverick's implied EBITDA is taken from `01` at **~$152.2m** ($1,750.0m ÷ the release's own "approximately 11.5 times anticipated 2026 adjusted EBITDA"). Two basis warnings travel with every line: the denominator adds nVent's **trailing** twelve-month covenant EBITDA to Maverick's **anticipated full-year 2026** EBITDA (a mixed basis, §15), and holding nVent's LTM EBITDA static is a **bound, not a forecast**.

| Pro-forma line (all *Inference, not from filings*) | Value | Build |
|---|---:|---|
| PF covenant EBITDA | **1,258.9** | 1,106.7 + 152.2. Maverick's EBITDA is a **company-adjusted** figure implied from a purchase multiple, so it is *not* on the covenant's narrow definition — this line is the least reliable input in the table and probably flatters the ratio |
| PF covenant net debt — **all-debt-funded bound** | **3,000.0** | (1,500.0 + 1,750.0) − 250.0 netting |
| PF covenant net debt — if the $176.4m of freely usable cash is spent first | **2,999.0** | (1,500.0 + 1,573.6) − netting of 74.6 (cash falls to $79.6m, so the $250.0m cap no longer binds). **Within $1.0m of the all-debt bound — the funding mix is very nearly irrelevant to the covenant** |
| **PF net leverage (covenant basis)** | **~2.38x** | 3,000.0 ÷ 1,258.9 |
| **PF headroom vs the 3.75x ceiling** | **+36.5%** | (3.75 − 2.383) ÷ 3.75 |
| PF headroom vs the **4.25x acquisition election** | **+43.9%** | the election is available precisely for this situation — "four testing periods in connection with certain material acquisitions" — and on these numbers nVent does not need it |
| PF net leverage if the full $550m earnout is later paid | **~2.82x** | (3,000.0 + 550.0) ÷ 1,258.9 → headroom **+24.8%** |
| PF net leverage on **normalised / mid-cycle** covenant EBITDA ($1,041.6m) | **~2.88x** | 3,000.0 ÷ (889.4 + 152.2) → headroom **+23.2%** |
| PF net leverage on **FY2026 consensus** EBITDA ($1,225.0m + 152.2) | **~2.18x** | forward denominator [`CIQ Estimates → Consensus`, FY2026] → headroom **+41.9%** |
| **PF interest coverage** at an assumed 5.0% / 5.5% / 6.0% on $1,750m of new debt | **7.75x / 7.36x / 7.00x** | interest of 162.4 / 171.2 / 179.9 → headroom vs the 3.00x floor of **+158.4% / +145.2% / +133.3%**. *The coupon is a labelled assumption — the pool discloses no pricing. The range brackets nVent's own 5.650% 2033 coupon* |
| **PF EBITDA fall that would breach the 3.75x ceiling** | **−36.5%** | PF covenant EBITDA would have to drop from $1,258.9m to $800.0m ($3,000.0m ÷ 3.75) |

**What the deal does to the tightest covenant, in one line.** Headroom on the binding covenant goes from **+69.9% to roughly +36.5%** — it roughly halves — and the EBITDA fall required to breach goes from **−69.9% to −36.5%**. On a normalised mid-cycle base with the earnout paid, headroom compresses toward the low-20s percent. That is still not a tight covenant, but it is a materially different balance sheet, and it is the single largest change to this module's covenant read. `06_downside-stress-test` should run both the reported and the pro-forma covenant bases.

---

## 4. Coverage / Covenant Read

Earnings carry the interest bill many times over on any basis tested: reported EBITDA of $1,074.6m covers net interest of $74.9m **14.35 times**, EBIT covers it **11.25 times**, EBITDA less capex covers it **12.84 times**, and fixed-charge coverage — profits after capex against interest plus scheduled debt repayment plus lease payments — is **7.93x**; on a normalised mid-cycle earnings base those become 11.53x, 8.43x and 6.19x, and the EBITDA is genuinely cash-backed (continuing-operations CFO at 71.9% of EBITDA, recurring operating FCF of ~$634.1m covering net interest 8.47 times), so no cash-quality caveat is needed [`Q2 FY26 10-Q`; `CIQ Financials → Income Statement / Cash Flow`, LTM Jun-30-2026; `earnings/06_earnings-quality`].

The tightest covenant is the **maximum net leverage ratio of 3.75x** in the Senior Credit Facilities, and on the credit agreement's own definitions nVent sits at **1.13x** — **+69.9% headroom** — against a minimum interest-coverage covenant at **14.78x versus a 3.00x floor (+392.5%)**; that headroom is high-quality rather than manufactured, because the covenant EBITDA definition permits exactly one addback (non-cash share-based compensation) and no restructuring, deal-cost or synergy addbacks at all, so covenant EBITDA of $1,106.7m is only **3.0% above** reported EBITDA [`Q2 FY26 10-Q, Note 10`].

Breaking that covenant from today's reported position would take a **69.9% fall in covenant EBITDA** (to $333.3m) or **$2.9bn of additional debt** with earnings flat — but the Maverick Power acquisition is the move that actually matters: on a pro-forma basis (financing terms **not disclosed in the pool**, so this is labelled inference throughout) headroom roughly halves to **~+36.5%** at ~2.38x, the required EBITDA fall drops to **−36.5%**, and it compresses to roughly **+23%** on a normalised mid-cycle earnings base with the full $550m earnout paid — still well inside the covenant, and inside the 4.25x acquisition election the agreement already provides, but no longer the same order of cushion.

**Two disclosure gaps to carry, neither a cap.** **Equity cure rights are not disclosed** — the 10-Q summarises the covenants but not the cure mechanics, and the credit agreement itself is not in the pool, so the conservative default applies and this report assumes **no cure right is available**. **Change-of-control puts and cross-default terms on the Notes are likewise not disclosed in the data pool.** Neither absence changes the headroom arithmetic, because headroom is measured off disclosed thresholds and disclosed actuals; both would change the *consequence* of a breach, which is why they are named here rather than left out.

**Scope note.** This report produces coverage levels and covenant headroom only. Whether the company survives a 30–60% earnings decline belongs to `06_downside-stress-test`, which should take the +69.9% reported and ~+36.5% pro-forma headroom figures and the covenant EBITDA base of $1,106.7m from here; the solvency verdict belongs to `99_balance-sheet-survival-synthesis`.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Balance-sheet date: 30 June 2026** [`Q2 FY26 10-Q, filed 2026-07-31`]

**Three framing points before the tables.**

1. **What "off-balance-sheet" means under US GAAP here.** nVent keeps operating leases OFF the debt line (IFRS 16 would capitalise them; nVent does not report under IFRS). So the single largest debt-like item in this report — $140.5m of operating-lease liabilities — is *on* the balance sheet but *outside* the $1,492.4m debt stack that `01_capital-structure-and-leverage` designated as canonical. Every row below states which of the two debt bases already contains it.
2. **Two dates are mixed and both are labelled.** The freshest filing is the Q2 FY26 10-Q at 30 June 2026. The FY2025 Form 10-K is **not in this data pool** [`00_solvency-data-triage`, §2], so the FY2025 audited lease, pension and contingency detail is read through the Capital IQ workbook (a tier-5 vendor export) or the FY2024 10-K, and is cited as such — never under an FY2025 filing's name (CLAUDE.md §5).
3. **The biggest contingent number is post-balance-sheet.** The Maverick Power earnout of **up to $550.0m** arises from an agreement signed **24 August 2026**, nearly two months after the balance-sheet date. It is not a liability anywhere yet. It is carried separately, labelled post-balance-sheet on every line, and never summed silently into a 30-June figure.

**No securitization, factoring, receivable-sale, variable-interest-entity or "off-balance sheet arrangements" disclosure exists anywhere in this pool.** A search of the full frozen corpus for `securitiz`, `factoring`, `sale of receivable`, `variable interest entit` and `off-balance sheet` returns **zero** hits [`<GENERATION_ROOT>/corpus.txt`, full-text search, 2026-09-07]. That is a genuine absence, not an extraction failure — recorded as nil, not as unknown.

---

## 1. Off-Balance-Sheet / Debt-Like Obligations

**Reporting currency: USD, millions.** "Recognized" = the amount booked on the balance sheet. "Maximum / gross" = the same obligation before discounting, or the stated cap.

| Item | Recognized Liability | Maximum / Gross Exposure | Already in `01`'s debt? | Source |
|---|---:|---:|---|---|
| **Operating leases** (office, production, distribution, warehouses, sales offices, fleet, equipment) | **140.5** at 30-Jun-2026 (current 33.0 + non-current 107.5); 135.3 at 31-Dec-2025; 113.1 at 31-Dec-2024 | **~171.4** undiscounted at 30-Jun-2026 — *scaled, see note below*. Last **disclosed** undiscounted totals: **165.1** at 31-Dec-2025 (136.1 due in 5 years + 29.0 thereafter) and **145.3** at 31-Dec-2024 (against 113.1 recognized) | **No** to `01`'s canonical filing-basis debt of $1,492.4m (US GAAP keeps operating leases off the debt line). **Yes** to the Capital IQ vendor basis of $1,632.9m, which is exactly $1,492.4m + $140.5m — so anyone quoting the vendor's net debt of $1,376.9m has already counted this row | `Q2 FY26 10-Q, Note 8 (Supplemental Balance Sheet Information)`; `FY24 10-K, Note 17 (Leases)` maturity table; `CIQ Financials → Capital Structure Summary` (31-Dec-2025 undiscounted schedule) |
| **Finance leases** (production facilities and equipment; secured on the leased asset) | **17.8** at 31-Dec-2025 — **a carry-forward, not a 30-Jun-2026 disclosure** (see the resolution below). 18.0 at 31-Dec-2024 | **30.5** undiscounted at 31-Dec-2024 against 18.0 recognized — a ratio of **1.69x**, because the leases run a weighted-average **12 years** at a **6.0%** imputed rate, so $12.5m of the gross figure is imputed interest | **No** — in neither `01`'s $1,492.4m nor the vendor's $1,632.9m at 30-Jun-2026. `01` showed a memo gross-debt figure of ~$1,510.2m including it | `FY24 10-K, Note 17 (Leases)` — maturity table and supplemental balance-sheet table; `CIQ Financials → Capital Structure Summary` (Total Lease Liabilities row) |
| **Pension underfunding** (one domestic-reported defined-benefit plan, essentially unfunded) | **119.7** at 31-Dec-2025 (projected benefit obligation 122.7 − plan assets 3.0). 117.2 at 31-Dec-2024 | **122.7** — the gross projected benefit obligation at 31-Dec-2025. Plan assets of **3.0** cover **2.4%** of it, so the gross and the net are nearly the same number. Near-term cash call is small: company-estimated contributions for the **next year of 6.6** | **No** — not interest-bearing debt and not in either debt basis. Sits in the balance-sheet line "Pension and other post-retirement compensation and benefits" of **133.3** at 30-Jun-2026 | `CIQ Financials → Pension OPEB tab` (FY2025 column — vendor export, the FY2025 10-K is absent from this pool); `FY24 10-K, Note 13 (Benefit Plans)` for the FY2024 figures; `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` for the 133.3 line |
| **OPEB (post-retirement health) underfunding** | **11.1** at 31-Dec-2025 — **wholly unfunded, pay-as-you-go**; 11.4 at 31-Dec-2024 | **11.1** — identical, because there are no plan assets at all. Estimated payments of **1.1** in each of the next five years | **No** — same line as above | `CIQ Financials → Pension OPEB tab` (FY2025); `FY24 10-K, Note 13 (Benefit Plans)` |
| **Securitization / factoring / receivable sales / VIEs** | **Nil — none exist** | **Nil** | n/a | `<GENERATION_ROOT>/corpus.txt` — zero hits across all 15 pool sources for `securitiz`, `factoring`, `sale of receivable`, `variable interest entit`, `off-balance sheet` |
| **Purchase / take-or-pay commitments** (raw materials, all significant terms confirmed) | **Nil** — a commitment, not a booked liability | **66.7 for calendar 2025**; "contractual purchase obligations beyond 2025 are not material". **No 2026 figure exists in this pool** — that disclosure lives in the FY2025 10-K, which is absent. **Flagged as stale, not filled in** | **No** | `FY24 10-K, MD&A, "Material contractual cash requirements"` |
| **Uncertain tax positions** (gross liability for tax positions taken) | **9.4** at 30-Jun-2026; 10.3 at 31-Dec-2025; 11.7 gross at 31-Dec-2024 | **11.7** gross at 31-Dec-2024 (the latest *gross* disclosure), of which **10.0** would hit the effective tax rate if recognized. The company's own stated movement range for the following year was a **decrease of zero to 2.4** | **No** — sits in Other current and Other non-current liabilities | `Q2 FY26 10-Q, Note 11 (Income Taxes)`; `FY24 10-K, MD&A` and `Note on income taxes` |
| *Memo — for orientation only, owned by `01` and `02`:* interest obligations on fixed-rate debt | n/a | 59.3 within one year / 318.2 beyond / **377.5** total, measured at 31-Dec-2024 | Debt service, not a contingency — named here only so it is not double-counted as one | `FY24 10-K, MD&A, "Material contractual cash requirements"` |

### Resolving `01`'s finance-lease flag

`01` flagged $17.8m of finance leases as a 31-Dec-2025 carry-forward that is "not separately disclosed at 30-Jun-2026", and asked this agent to resolve or declare it. **Declared, with the derivation checked and the vendor's silence explained — it is not evidence the leases were repaid.**

The check: Capital IQ's "Total Lease Liabilities" row can be rebuilt from the filings at every date where the filings itemise both lease types.

| Date | CIQ "Total Lease Liabilities" | 10-K / 10-Q operating leases | Implied finance leases | Filed finance-lease figure | Tie? |
|---|---:|---:|---:|---:|---|
| 31-Dec-2024 | 131.1 | 113.1 (22.4 + 90.7) | 18.0 | **18.0** [`FY24 10-K, Note 17`] | **Exact** |
| 31-Dec-2025 | 153.1 | 135.3 (30.3 + 105.0) | **17.8** | not separately filed (FY2025 10-K absent from pool) | derivation validated by the row above |
| 30-Jun-2026 | 140.5 | 140.5 (33.0 + 107.5) | **0.0 implied** | not separately filed | **breaks** |

At 30-Jun-2026 the vendor's lease total equals the 10-Q's operating-lease liabilities **to the cent**. The vendor picked up only what the 10-Q itemised, because the 10-Q's Note 8 lists operating leases and stops. So the zero implied at 30-Jun-2026 is a **disclosure artefact, not a repayment**: nothing in the pool says the finance leases were settled, and their weighted-average remaining term at last disclosure was **12 years** with only ~$1.5m of annual payments [`FY24 10-K, Note 17`]. The conservative reading (MODULE_RULES Core Principle 7) is that roughly **$17.8m of finance-lease liability is still there at 30-Jun-2026**, sitting unlabelled inside Other current liabilities and Other non-current liabilities ($202.1m of the latter, of which $107.5m is the non-current operating lease) [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. *Carried forward from 31-Dec-2025. Inference, not from filings.* At 1.2% of gross debt it moves no ratio in this module.

### The scaled operating-lease gross figure, and why it is labelled

No undiscounted operating-lease maturity table is filed at 30-Jun-2026 (that table appears only in the annual 10-K). The two dates where both figures exist give a gross-to-recognized ratio of **1.284x** at 31-Dec-2024 (145.3 ÷ 113.1) and **1.220x** at 31-Dec-2025 (165.1 ÷ 135.3). Applying the fresher 1.220x to the recognized $140.5m gives **~$171.4m**. *This is a labelled scaling of a disclosed ratio, not a filed figure. Inference, not from filings.* The gap between $171.4m and $140.5m is imputed interest at a **5.1%** weighted-average discount rate over a **5-year** weighted-average remaining term [`Q2 FY26 10-Q, Note 8`; `FY24 10-K, Note 17`] — it is not extra exposure, it is the same obligation shown before discounting.

---

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| **Bonds, letters of credit and bank guarantees** (single disclosed line — the company does not split it) | **Nil disclosed.** The accounting policy is stated ("We recognize, at the inception of a guarantee, a liability for the fair value of the obligation undertaken in issuing the guarantee") but **no liability amount is given** at 30-Jun-2026. The only guarantee liability ever quantified in this pool was **12.5**, which was **released to income during 2024** | **102.0** outstanding face value at **30-Jun-2026**. Prior dates: 82.6 (31-Mar-2026), 75.7 (31-Dec-2025), 10.7 (31-Dec-2024), 10.5 (31-Dec-2023) | Two purposes, both disclosed: (a) **performance** — instruments "that require payments to our customers for any non-performance", whose face value "fluctuates with the value of our projects in process and in our backlog"; (b) **financial standby letters of credit** "primarily to secure our performance to third parties under self-insurance programs" | `Q2 FY26 10-Q, Note 15 (Commitments and Contingencies)`; `Q1 FY26 10-Q, Note 15`; `FY24 10-K, Note 18 (Commitments and Contingencies)` and `FY24 10-K, MD&A`; release of the 12.5 guarantee liability: `FY24 10-K, MD&A "Other expense (income)"` and `Consolidated Statements of Cash Flows` |
| **Performance / surety bonds** | — included in the 102.0 line above; **not separately disclosed** | — not separately disclosed | Customers, on project non-performance | `Q2 FY26 10-Q, Note 15` |
| **Financial standby letters of credit** | — included in the 102.0 line above; **not separately disclosed** | — not separately disclosed | Third parties, under self-insurance programmes | `Q2 FY26 10-Q, Note 15` |
| **Disposition indemnities** (given to buyers of divested businesses and product lines — pre-closing tax, product liability, warranty, environmental and other obligations; the largest recent disposal is the Thermal Management segment sold for $1.65bn, closed 30-Jan-2025) | **Nil disclosed** | **Not stated and not estimable.** The company's exact words: "the maximum obligation under such indemnifications is not explicitly stated and as a result, the overall amount of these obligations **cannot be reasonably estimated**" | Purchasers of divested businesses / product lines | `Q2 FY26 10-Q, Note 15`; `FY24 10-K, Note 18`; Thermal Management disposal: `FY24 10-K, Item 1 and Note 6` |
| **Product service and warranty policies** | **"Not material"** at both 30-Jun-2026 and 31-Dec-2025 — accrued but not quantified | Not stated | Customers | `Q2 FY26 10-Q, Note 15` |
| **Intra-group note guarantees** (nVent Electric plc and Hoffman Schroff Holdings guarantee nVent Finance's Notes, joint and several, per the February 2026 supplemental indenture) | Consolidated — **no incremental exposure** | **Nil incremental.** These guarantee debt already inside `01`'s $1,492.4m stack; counting them again would double-count | Noteholders | `Q2 FY26 10-Q, Note 10 (Debt)`; already mapped in `01`, §6A |

**The one number in this report that has genuinely spiked.** The bonds / LC / bank-guarantee face value went **10.5 → 10.7 → 75.7 → 82.6 → 102.0** across Dec-2023, Dec-2024, Dec-2025, Mar-2026 and Jun-2026 — a **9.5-fold rise in eighteen months** and **+34.7%** in the six months of 2026 alone. The company gives the mechanism itself: the face value "fluctuates with the value of our projects in process and in our backlog". This is therefore growth-linked, not distress-linked — nVent's Systems Protection segment income more than doubled year on year in Q2 FY26 (248.2 vs 137.1) [`Q2 FY26 10-Q, Note 13 (Segment Information)`], and the announced Maverick deal is explicitly a data-centre power-distribution business with "a strong backlog" [`nVent news release, 2026-08-24`]. But the direction of the exposure is one way, it is un-booked, and if projects fail to perform these instruments are drawn in cash. **Both facts travel together.**

---

## 3. Litigation & Tax Contingencies

Probability language below is quoted from the company, not assigned by this agent. Under CLAUDE.md §10, "remote" maps to 0–10% and "unlikely" to 25–45%.

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) — the company's own words | Source |
|---|---:|---:|---|---|
| **General litigation** — commercial and contractual disputes, product liability, **asbestos**, environmental, safety and health, patent infringement, employment | **Not disclosed.** No aggregate litigation reserve is given anywhere in this pool | **Not stated.** No claimed amount, no named case, no plaintiff, no court | **Active as a class, none named.** "We have been made parties to a number of actions filed or have been given notice of potential claims". The company's probability language is explicit and two-sided: a material impact "**is unlikely**", but "given the inherent uncertainty of litigation, a **remote possibility** exists that a future adverse ruling or unfavorable development could result in future charges that could have a material adverse impact" | `FY24 10-K, Item 3 (Legal Proceedings)`; `FY24 10-K, Note 18`; `FY24 10-K, MD&A "Commitments and Contingencies"` |
| **Environmental clean-ups** — named as defendant, target or **potentially responsible party (PRP)** at a number of sites, current and former, including divested and acquired businesses | **"Not material"** at 31-Dec-2024 — accrued site-by-site "when it is probable that a liability has been incurred and the amount can be reasonably estimated". The amount itself is not disclosed | **Not stated.** The company warns openly that "unknown conditions, new details about existing conditions or changes in environmental requirements may give rise to environmental liabilities that will **exceed the amount of our current reserves** and could have a material adverse effect in the future" | **Active** — clean-ups are ongoing, and PRP status can attach to future sites. Not characterised as remote | `FY24 10-K, Item 3 (Legal Proceedings) — Environmental matters`; `FY24 10-K, Note 18` |
| **Product liability claims** | Not separately disclosed | Not stated | **Active as a class**; no case named | `FY24 10-K, Item 3 (Legal Proceedings) — Product liability claims` |
| **Uncertain tax positions** (unrecognized tax benefits) | **9.4** at 30-Jun-2026 — a booked liability, down from 10.3 at 31-Dec-2025 | **11.7** gross at 31-Dec-2024, of which **10.0** would move the effective tax rate. Penalty and interest liabilities of **2.0** and **1.4** are carried separately | **Live but shrinking and small.** The company expected the balance to "decrease by a range of **zero to 2.4**" over the following year, "primarily as a result of the resolution of non-U.S. tax audits", and does not expect a material change beyond what is recorded | `Q2 FY26 10-Q, Note 11 (Income Taxes)`; `FY24 10-K, MD&A` and income-tax note |
| **Tariff exposure — flagged, not sized as a contingency** | **Nil.** nVent recognised a **$25.8m benefit** in Q2 FY26 from "reimbursements of tariffs previously remitted under the International Emergency Economic Powers Act (IEEPA tariffs)" — an inflow, not a provision | **Not disclosed as a contingency by the company at all.** No reversal risk, no clawback term and no legal status is stated in any pool document | **Status not established from this pool.** `business-model/10_external-dependency` §1A reaches the same conclusion and records the exposure as "status not established". Gross tariff cost is separately guided at about **$100m for 2026** on top of about **$90m in 2025** — an operating cost, which belongs to the earnings module, **not** a contingent liability. **No exposure is invented here** | `Q2 FY26 10-Q, Note 13 (Segment Information)` reconciliation line "IEEPA tariffs" 25.8 and `MD&A, Gross profit`; `business-model/10_external-dependency.md`, §1A |
| **Maverick Power earnout — POST-BALANCE-SHEET, contingent** | **Nil.** The deal was signed 24-Aug-2026, after the 30-Jun-2026 balance-sheet date, and has not closed. Nothing is booked | **550.0 cash maximum** — "potential additional consideration of **up to $550 million in cash** based on achieving certain performance metrics in **2027 and 2028**" | **Live, and management's language points toward payment, not away from it:** "nVent's financial returns on the acquisition are expected to be **significantly better if the potential additional considerations are paid**." Separately, the **firm** $1.75bn cash purchase price is contingent only on closing conditions "including regulatory approval", expected **Q4 2026**, with **committed bridge financing from Bank of America** | `nVent news release "nVent to Acquire Maverick Power", 2026-08-24` |

**The separate $1.75bn is not double-counted here.** The firm cash purchase price is a post-balance-sheet funding commitment, already carried in `01`, §5A as pro-forma net debt of ~$2,986.4m and pro-forma net leverage of ~2.43x. This report sizes only the **contingent** $550m earnout. `01` already showed the earnout's effect (~2.88x if paid in full) — do not add it to that figure a second time.

---

## 4. Contingent Exposure Summary

**Read the basis labels before the ratios.** These aggregates mix (a) recognized liabilities shown before discounting, (b) instrument face values, (c) a stale one-year purchase commitment, and (d) a post-balance-sheet earnout cap on a deal that has not closed. They are **not one homogeneous number**, and the itemised build is printed in full so a reader can rebuild every total (CLAUDE.md §15).

**Build A — recognized liabilities in scope** (booked on the balance sheet, outside `01`'s $1,492.4m debt stack):

| Component | Amount | As of |
|---|---:|---|
| Operating lease liabilities | 140.5 | 30-Jun-2026 |
| Finance lease liabilities | 17.8 | 31-Dec-2025 (carry-forward — see §1) |
| Pension underfunding | 119.7 | 31-Dec-2025 (vendor read) |
| OPEB underfunding | 11.1 | 31-Dec-2025 (vendor read) |
| Uncertain tax positions | 9.4 | 30-Jun-2026 |
| Guarantee liability, warranty accrual, environmental reserve, litigation provision | **0.0 disclosed** — each stated as nil, "not material", or not quantified | — |
| **Total recognized** | **298.5** | **mixed dates: two lines at 30-Jun-2026, three at 31-Dec-2025** |

**Build B — maximum / gross exposure for the same items:**

| Component | Amount | Basis — what kind of number this is |
|---|---:|---|
| Operating leases, undiscounted | 171.4 | scaled from the 31-Dec-2025 disclosed ratio — *inference, labelled in §1* |
| Finance leases, undiscounted | 30.5 | filed maturity table, 31-Dec-2024 |
| Pension gross projected benefit obligation | 122.7 | gross obligation before $3.0m of plan assets, 31-Dec-2025 |
| OPEB gross obligation | 11.1 | wholly unfunded, 31-Dec-2025 |
| Uncertain tax positions, gross | 11.7 | gross unrecognized tax benefits, 31-Dec-2024 |
| Bonds, LCs and bank guarantees | 102.0 | **face value of instruments outstanding**, 30-Jun-2026 |
| Purchase commitments | 66.7 | **one calendar year (2025) only**, stale — no 2026 figure in this pool |
| Maverick Power earnout cap | 550.0 | **post-balance-sheet contingent cap** on a deal not yet closed |
| **Total maximum / gross** | **1,066.1** | **mixed basis — do not quote without this table** |

| Metric | Value |
|---|---:|
| **Total recognized contingent liabilities** | **298.5** (mixed dates as above; the guarantee, warranty, environmental and litigation lines are all $0 booked) |
| **Total maximum / gross exposure** | **1,066.1** (mixed basis as above; **$550.0m of it — 51.6% — is the post-balance-sheet Maverick earnout**) |
| **Max exposure ÷ recognized** | **3.57x** (1,066.1 ÷ 298.5). **Excluding the post-balance-sheet earnout: 1.73x** (516.1 ÷ 298.5) |
| **Max exposure ÷ total equity ($3,986.9m at 30-Jun-2026)** | **26.7%**. **Excluding the earnout: 12.9%** |
| *Memo:* purely contingent items, never recognized (LCs/bonds 102.0 + purchase commitments 66.7 + earnout 550.0) | **718.7 against $0.0 of booked provision** — 18.0% of equity; excluding the earnout, 168.7 (4.2% of equity) |
| *Memo:* max exposure ÷ LTM reported EBITDA ($1,074.6m) | **0.99x** |
| *Memo:* max exposure ÷ `01`'s canonical net debt ($1,236.4m, strict §15 basis) | **0.86x** |

Equity source: `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` (total equity 3,986.9). EBITDA and net-debt anchors taken verbatim from `01`, §7.

**Unquantifiable items excluded from every total above, and named so they are not forgotten:** disposition indemnities (company states the maximum "cannot be reasonably estimated"), general litigation including asbestos and product liability (no claimed amount disclosed), environmental clean-up beyond the "not material" reserve, and product warranty. These are real and they are open-ended; they are simply not addable. Their absence means **$1,066.1m is a floor on the maximum, not the maximum.**

---

## 5. Contingency Read

**The largest live off-balance-sheet exposure is the $550.0m Maverick Power earnout, and management's own language points toward paying it, not avoiding it** — the release says returns will be "significantly better if the potential additional considerations are paid" [`nVent news release, 2026-08-24`]. It is contingent on 2027–2028 performance at a business the company is buying for $1.75bn on ~11.5x its anticipated 2026 EBITDA, so the earnout gets paid precisely in the state of the world where nVent can most afford it — that is a real mitigant, but it is not a guarantee, and a cash earnout paid at the top of a data-centre build cycle would land on a balance sheet already carrying ~2.4x pro-forma net leverage [`01`, §5A]. **The second live item is the $102.0m of performance bonds, letters of credit and bank guarantees, which has risen 9.5-fold in eighteen months (10.7 → 102.0) with $0 of booked provision against it.** That is growth-driven, not distress-driven — the company itself ties the face value to project backlog — but it is un-booked, it moves only one way, and it converts to cash if projects fail to perform.

**If the whole $1,066.1m crystallised at once, it would absorb 26.7% of the $3,986.9m equity base and 0.99x of one year's LTM EBITDA — painful, not fatal, and not a solvency event on its own.** The reason is that more than half of that total is an earnout that only becomes payable if the acquired business hits its numbers, and roughly a third is leases and pensions that are already recognized and that pay out over 5 to 12 years, not at once. The genuinely open-ended exposures — disposition indemnities, asbestos, environmental PRP status — are all described by the company as unlikely-to-remote with immaterial reserves, and no active named case, plaintiff, claimed amount or court appears anywhere in this pool. **Thin disclosure is the honest caveat here rather than a discovered exposure: nVent gives one combined LC/bond/guarantee line with no split, no aggregate litigation reserve, and no quantified indemnity cap, and the FY2025 10-K — where the FY2025 audited contingency, lease and pension notes would sit — is absent from this pool. Undisclosed exposures cannot be ruled out.** That absence is flagged, not filled in.

RF-OBS-001 (contingent-liability spike)

**Why the tag fires, stated plainly so the synthesis can weigh it rather than just count it.** The mechanical test is met on both limbs — max ÷ recognized is **3.57x** (threshold 3x) and max ÷ equity is **26.7%** (threshold 15%) — and the two items driving it are live rather than remote by the company's own language: the earnout is under a signed definitive agreement expected to close in Q4 2026, and the $102.0m of bonds and LCs is outstanding today and grew 34.7% in six months. **What the tag does not mean here:** there is no named litigation, no regulatory action, no tax demand, no related-party guarantee, and no distress signal in any of it. The spike is the arithmetic consequence of a company writing a $1.75bn cheque and posting more performance bonds as its order book grows. `06_downside-stress-test` should carry the $102.0m of LCs and bonds as a potential cash draw and the $550.0m earnout as a 2028–2029 outflow contingent on the acquired business performing; `99` should record the tag with this qualifier attached, not stripped.

---

**Scope note.** This report does not restate the on-balance-sheet debt stack (`01` owns it), does not assess coverage or covenant headroom (`04` owns them), and does not run the stress test (`06` owns it). It sizes what sits outside the headline debt and hands the material items down.



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Measurement date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31) · **Report date: 2026-09-07**

**Read these five things before the tables. They set the basis for every number below.**

1. **This is a survival bound, not a forecast.** Every scenario holds management's response at zero — no price rises, no cost programme, no capacity deferral, no dividend or buyback cut beyond what a row names. That is the right posture for a survival test (CLAUDE.md §24, Filter 3), but it is a *bound*, and it is labelled as one on every line (CLAUDE.md §9). Where the filings let a realised offset be measured, it is computed and run as a second case (§2A).
2. **Two structures are run, not one.** The **as-reported** 30-June-2026 balance sheet, and a **pro-forma** balance sheet for the Maverick Power acquisition announced 24 August 2026 ($1.75bn cash plus up to $550m earnout, "cash on hand and new debt", committed Bank of America bridge, expected close Q4 2026). **The financing mix, tenor and pricing are not disclosed in this data pool** [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. Every Maverick line is labelled **pro-forma inference, not from filings**, and is never presented as reported.
3. **Every covenant line uses the credit agreement's OWN definitions**, taken from `04_coverage-and-covenants`: covenant EBITDA $1,106.7m (the only addback is non-cash share-based compensation), covenant net debt $1,250.0m (principal $1,500.0m less the $250.0m cash-netting cap). Those are a different basis from the reported-EBITDA leverage and coverage rows, and the two are never mixed (CLAUDE.md §15).
4. **The base EBITDA is at a cyclical peak.** `01` records LTM reported EBITDA of $1,074.6m against a normalised / mid-cycle $863.6m. A haircut applied to a peak understates the fall from a normalised base — every table therefore also shows the mid-cycle read.
5. **Every stressed figure, headroom and break-point solve below was produced by an executed Python calculation**, not by hand. The commands and their output are printed in §3.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| **Base EBITDA (cash-backed), LTM to 30-Jun-2026** | **1,074.6** — reported, continuing operations, GAAP-derived (operating income 842.7 + D&A 231.9) | `01` §7; `ciq_facts.json` `ltm_ebitda_m` 1,074.6 [`CIQ Financials → Income Statement`, LTM Jun-30-2026]. **Cash-backing confirmed**: continuing-ops CFO $772.8m = **71.9%** of EBITDA, and 69–79% for four straight years with no low-conversion flag [`earnings/06_earnings-quality`; `04` §1] |
| Memo — company adjusted EBITDA | 1,061.5 | `01` §7. Its Q2 FY26 component ($340.1m) is computed by `01` from filed tables, not company-published — caveat carried |
| Memo — **normalised / mid-cycle EBITDA** | **863.6** | Three-year average of reported EBITDA (FY2024 675.6 / FY2025 840.5 / LTM 1,074.6) [`01` §5]. *A labelled normalisation, not a forecast* |
| **Net debt (strict §15 basis — `01`'s designated canonical figure)** | **1,236.4** | `01` §4 and §7: gross debt $1,492.4m [`Q2 FY26 10-Q, Note 10 (Debt)`] − cash $256.0m. The **broad** basis is identical — nVent holds no short-term investments |
| Memo — net debt, strict, **excluding the $79.6m of cash that cannot be readily repatriated** | 1,316.0 | `01` §7 designates this variant for use here |
| **Net debt / EBITDA (strict, peak EBITDA)** | **1.15x** · **1.43x** on mid-cycle EBITDA | 1,236.4 ÷ 1,074.6 · 1,236.4 ÷ 863.6 [`01` §5] |
| **EBITDA / interest** | **14.35x** (1,074.6 ÷ 74.9). Interest is disclosed **net only** | `04` §1. LTM net interest $74.9m = FY2025 75.0 − H1'25 35.0 + H1'26 34.9 [`Q2 FY26 10-Q, Condensed Consolidated Statements of Income`] |
| **Tightest covenant + threshold** | **Maximum net leverage 3.75x** (MAX / ceiling), electively **4.25x for four testing periods in connection with certain material acquisitions**. Actual **1.13x** on the credit agreement's own definitions → **+69.9% headroom** | `04` §2–§3 [`Q2 FY26 10-Q, Note 10`]. Second covenant: minimum interest coverage **3.00x** (MIN / floor), actual 14.78x, +392.5% |
| Covenant EBITDA / covenant net debt | **1,106.7** / **1,250.0** | `04` §2. Covenant EBITDA is only **3.0% above** reported EBITDA — one addback (non-cash share-based comp), no restructuring, deal-cost or synergy addbacks. Netting capped at $250.0m of the $256.0m cash |
| **Next-12m obligations (1-Jul-2026 to 30-Jun-2027)** | **151.0** on the financing basis (13.8 maturities + 137.2 dividends) · **292.6** on the gross-obligations basis (adds 74.9 cash interest + 66.7 maintenance-capex proxy) | `03` §2; maturities from `02` §1a (**0.92%** of the $1,500.0m principal, all term-loan amortisation) |
| **Committed liquidity** | **856.0 — gross-liquidity basis** (cash 256.0 + committed undrawn revolver availability 600.0, disclosed, non-borrowing-base, maturing 2030-06-30) | `03` §1 [`Q2 FY26 10-Q, Note 10`] |
| **Usable liquidity used in every solve below** | **776.4** | 856.0 less the **$79.6m** of repatriation-limited cash. **No minimum-liquidity covenant exists** to subtract [`04` §2 — searched and found nil]. The $300.0m accordion is excluded (lender-consent, not committed) |
| **Floating-rate debt (gross)** | **200.0 — 13.3%** of the $1,500.0m principal (Term Loan Facility, average rate 4.903% at 30-Jun-2026); 1,300.0 (86.7%) fixed | `01` §7; `02` §3 [`Q2 FY26 10-Q, Note 10`] |
| **Hedge coverage (interest rate)** | **None.** The $350.5m of cross-currency swaps hedge **currency, not interest rate** | `Q2 FY26 10-Q, Note 9`; `01` §7. No commodity hedging is disclosed anywhere in the pool [`earnings/07`, row 4] |
| **Working-capital seasonality / peak build** | Seasonal, company-stated. **Largest realised build in the pool: $219.7m in H1 2026** (58% of it — $128.3m — in Q1, which took cash to a $190.0m trough). **A peak need is nowhere disclosed** | `03` §3A "Seasonality / Peak Liquidity Need" [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`; `Q1 FY26 10-Q, MD&A`] |
| **Normalised operating FCF (the flow that absorbs the stress)** | **634.1** | `03` §3A: continuing-ops CFO 772.8 − capex 112.9 − the **$25.8m one-off IEEPA tariff refund**. The recurring figure leads; the inflated $659.9m is shown beside it, labelled (CLAUDE.md §15) |
| Effective tax rate used in the FCF drop-through | **22.2%** | 168.4 tax ÷ (591.0 earnings + 168.4) [`CIQ Financials → Income Statement`, LTM Jun-30-2026; `03` §3B] |

**Currency and EBITDA basis, stated as required.** All figures are **USD millions, US GAAP**. The stress base is **reported** EBITDA on continuing operations, cross-checked as cash-backed against `earnings/06_earnings-quality` — not headline company-adjusted EBITDA, and not the covenant number. Covenant rows use covenant EBITDA and say so.

### 1A. Pro-forma base for Maverick Power — **PRO-FORMA INFERENCE, NOT FROM FILINGS**

**Step 2a of this agent's workflow requires a pro-forma base before haircutting, because a material acquisition is signed and not yet in the reported balance sheet.** Built on the same **strict §15 basis** the rest of this report uses, and on the credit agreement's own definitions for the covenant lines.

| Pro-forma build (all *inference, not from filings*) | Value | How it is built, and what is assumed |
|---|---:|---|
| Net debt, strict, at 30-Jun-2026 (reported) | 1,236.4 | `01` §4 |
| + Maverick cash consideration | **1,750.0** | `nVent news release, 2026-08-24`. **Mix-independent for net debt**: a dollar of cash spent adds a dollar of net debt exactly as a dollar borrowed does, so the debt-funded portion and the cash-funded portion enter identically here. A stock-funded portion would add nothing — **there is none; the consideration is all cash** |
| + target's own net debt consolidating at close | **0.0 assumed — NOT DISCLOSED** | The release does not say whether the deal is cash-free / debt-free, and Maverick is private with no filed balance sheet in this pool. **Assuming zero is the flattering assumption and it is flagged as such**; any assumed debt adds one-for-one to every pro-forma leverage figure below |
| No double-count check | passed | No acquisition debt is drawn yet (the balance sheet is dated 30-Jun-2026, the deal was signed 24-Aug-2026) and no escrowed or restricted acquisition cash sits in the $256.0m. Nothing is added twice |
| **= Pro-forma net debt, strict §15** | **2,986.4** | |
| **= Pro-forma covenant net debt** | **3,000.0** | (1,500.0 principal + 1,750.0 new debt) − the $250.0m netting cap. On the alternative funding case where the $176.4m of freely usable cash is spent first, `04` §3A computes **2,999.0** — within $1.0m, so **the funding mix is very nearly irrelevant to the covenant** |
| Maverick's own EBITDA (perimeter-matched to the debt above) | **~152.2**, range **152.2–166.7** | $1,750.0m ÷ the release's own "approximately 11.5 times anticipated 2026 adjusted EBITDA" (and ÷ 10.5x after the present value of expected tax benefits). **Not disclosed directly** — this is implied from the stated multiple, so the leverage is shown as a range bracketing it. On the wider figure PF leverage is 2.41x rather than 2.43x — the choice does not move the answer |
| **PF EBITDA — peak / trailing base** | **1,226.8** | 1,074.6 + 152.2. **Mixed basis (§15): nVent's trailing twelve months plus Maverick's anticipated full-year 2026.** Carry this label wherever the number is quoted |
| **PF EBITDA — normalised / mid-cycle base** | **1,015.8** | 863.6 + 152.2 |
| PF EBITDA — FY2026 consensus base | 1,377.2 | 1,225.0 [`CIQ Estimates → Consensus`, FY2026] + 152.2 |
| **PF covenant EBITDA** | **1,258.9** | 1,106.7 + 152.2. **The weakest input in this report**: Maverick's implied EBITDA is a company-*adjusted* figure derived from a purchase multiple, and the covenant's definition permits almost no addbacks — so this line probably flatters the covenant ratio |
| **PF net leverage — strict, on PEAK EBITDA** | **2.43x** | 2,986.4 ÷ 1,226.8 |
| **PF net leverage — strict, on MID-CYCLE EBITDA** | **2.94x** | 2,986.4 ÷ 1,015.8. **This, not 2.43x, is the central estimate for a cyclical name** (MODULE_RULES Calculation Standard 4); 2.43x is the floor |
| PF net leverage — strict, on forward consensus EBITDA | 2.17x | 2,986.4 ÷ 1,377.2 |
| PF net leverage with the full **$550m earnout** paid — peak / mid-cycle | **2.88x** / **3.48x** | (2,986.4 + 550.0) ÷ 1,226.8 and ÷ 1,015.8. The earnout is contingent on 2027–2028 performance, and management's own language points toward paying it: returns are "expected to be significantly better if the potential additional considerations are paid" [`nVent news release, 2026-08-24`; `05` §3] |
| **PF covenant net leverage** | **2.38x** peak · **2.88x** mid-cycle · **3.41x** mid-cycle **with the earnout paid** | 3,000.0 ÷ 1,258.9 · ÷ 1,041.6 · 3,550.0 ÷ 1,041.6 [`04` §3A] |
| **PF headroom on the 3.75x ceiling** | **+36.5%** peak · **+23.2%** mid-cycle · **+9.1%** mid-cycle with the earnout paid | Direction-aware MAX form: (3.75 − actual) ÷ 3.75 |
| PF cash interest, assumed | **171.1** at 5.5% on $1,750m of new debt (range 162.4 at 5.0% / 179.9 at 6.0%) | **The coupon is a labelled assumption — the pool discloses no pricing.** The range brackets nVent's own 5.650% 2033 coupon [`04` §3A] |
| PF normalised FCF | **559.2** (funding Case A) / **566.7** (Case B) | 634.1 less after-tax incremental interest [`03` §3B]. **Maverick's own cash generation is deliberately excluded** — including it would lengthen every runway, so this is a conservative bound |
| PF usable liquidity | **776.4** (Case A, all-debt-funded) / **600.0** (Case B, freely usable cash spent first — the revolver and nothing else) | `03` §3B, less the $79.6m of repatriation-limited cash in each case |

---

## 2. Stress Scenarios

**Both grids apply the haircut to EBITDA and hold everything else fixed** — debt, cash, interest, capex, dividends. FCF scales as: `stressed FCF(h) = FCF_base − EBITDA_base × h × (1 − 0.222)`, i.e. lost EBITDA drops through to cash at the after-tax operating rate, with cash interest and maintenance capex held at their base levels. **Covenant EBITDA is haircut in the same proportion as reported EBITDA** — the conservative choice: holding the $40.5m of non-cash share-based comp fixed instead moves the as-reported covenant break point from −69.9% to −72.0%, i.e. further away. **The 12-month liquidity gap is `(maturities + dividends + any named shock) − stressed FCF`; a negative figure is a surplus.** Cash interest and capex are not re-added there, because FCF already carries both (MODULE_RULES §8 — adding them would double-count).

### 2A. As-reported structure (30 June 2026)

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | **−37.4% history-calibrated** | **Realised-offset case (−16.8%)** | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| EBITDA (reported basis) | 1,074.6 | 752.2 | 644.8 | 429.8 | 673.1 | 894.1 | 644.8 | 644.8 |
| Net debt / EBITDA (strict §15, canonical) | 1.15x | 1.64x | 1.92x | 2.88x | 1.84x | 1.38x | 1.92x | 1.92x |
| EBITDA / interest (net interest 74.9) | 14.35x | 10.04x | 8.61x | 5.74x | 8.99x | 11.94x | 8.61x | **8.17x** (interest 78.9) |
| Covenant net leverage (credit-agreement basis: 1,250.0 ÷ covenant EBITDA) | 1.13x | 1.61x | 1.88x | 2.82x | 1.80x | 1.36x | 1.88x | 1.88x |
| **Tightest covenant headroom** (MAX 3.75x ceiling) | **+69.9%** | **+57.0%** | **+49.8%** | **+24.7%** | **+51.9%** | **+63.8%** | **+49.8%** | **+49.8%** |
| Second covenant — min interest coverage (floor 3.00x), covenant basis | 14.78x / +392.5% | 10.34x / +244.8% | 8.87x / +195.5% | 5.91x / +97.0% | 9.26x / +208.5% | 12.29x / +309.8% | 8.87x / +195.5% | 8.42x / +180.5% |
| **Covenant breach? (Y/N)** | **N** | **N** | **N** | **N** | **N** | **N** | **N** | **N** |
| Stressed normalised FCF | 634.1 | 383.3 | 299.7 | 132.5 | 321.7 | 493.6 | 299.7 | 296.6 |
| **12-month liquidity gap** (uses − sources; negative = surplus) | **−483.1** | **−232.3** | **−148.7** | **+18.5** | **−170.7** | **−342.6** | **+71.0** | **−145.6** |
| Usable liquidity remaining after the gap (of 776.4) | 776.4 | 776.4 | 776.4 | 757.9 | 776.4 | 776.4 | 705.4 | 776.4 |
| **Survives without external action? (Y/N)** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** |

**Notes on the two extra columns, and on the two named shocks.**

- **The history-calibrated scenario is required because this is a cyclical name** (`business-model/07_business-quality` scores cyclicality 30/100, reverse-mapped — its lowest row; `earnings/02_revenue-drivers` calls Q2 FY26 "a peak-of-cycle print"). **The company's own post-divestiture history contains no EBITDA decline to calibrate against** — continuing-operations EBITDA rose in every year on record: 395.4 (FY2022) → 575.9 → 673.1 → 824.6 → 1,074.6 LTM [`earnings/01_historical-financials` §1]. The only fall in the pool, FY2021's $484.6m to FY2022's $395.4m (−18.4%), sits across the Thermal Management basis break and is **not comparable**. So the honest calibration is not a trough-to-peak ratio but a **revert to a level the company actually printed on this continuing-operations perimeter eighteen months ago: FY2024 EBITDA of $673.1m, a −37.4% haircut.** *Labelled: FY2024 predates the $975.7m Electrical Products Group acquisition, so it is a smaller asset base — reverting to it is a deliberately adverse calibration, not a like-for-like one.*
- **The working-capital shock is the $219.7m realised H1-2026 build** — the largest in the pool, not a disclosed peak, so it may understate a future one [`03` §3A]. **It is deliberately internally adverse**: in a −40% volume-driven downturn working capital would *release* cash, not consume it. Stacking a peak build on a demand collapse is a bound, and is labelled as one.
- **The rate shock is +200bp on the $200.0m of floating debt = +$4.0m a year**, with no hedge offset (the cross-currency swaps hedge FX only). At 13.3% floating it moves EBITDA/interest by 0.44 turns and nothing else. It is **material to state and immaterial to the answer** — say so rather than pad it.
- **The −60% column is the only as-reported scenario that produces any gap at all**, and it is $18.5m against $776.4m of usable liquidity — 2.4% of it. Even at **zero EBITDA** (h = 1.00) stressed FCF is −$201.9m and usable liquidity plus that flow is $574.5m against $151.0m of obligations.

### 2B. Pro-forma for Maverick Power — **PRO-FORMA INFERENCE, NOT FROM FILINGS**

Covenant net debt $3,000.0m, covenant EBITDA $1,258.9m, strict net debt $2,986.4m, PF EBITDA base $1,226.8m, PF interest $171.1m (5.5% assumed), PF FCF $559.2m, usable liquidity $776.4m (funding Case A). **Every figure rests on a financing mix, tenor and price the pool does not contain.**

| Metric | Base (PF) | −30% EBITDA | −40% EBITDA | −60% EBITDA | **−37.4% history-calibrated** | **Realised-offset case (−16.8%)** | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| PF EBITDA | 1,226.8 | 858.8 | 736.1 | 490.7 | 768.5 | 1,020.7 | 736.1 | 736.1 |
| PF net debt / EBITDA (strict §15) | 2.43x | 3.48x | 4.06x | 6.09x | 3.89x | 2.93x | 4.06x | 4.06x |
| PF EBITDA / interest | 7.17x | 5.02x | 4.30x | 2.87x | 4.49x | 5.97x | 4.30x | **3.50x** (interest 210.1) |
| PF covenant net leverage (3,000.0 ÷ covenant EBITDA) | 2.38x | 3.40x | **3.97x** | **5.96x** | **3.80x** | 2.86x | **3.97x** | **3.97x** |
| **Tightest covenant headroom** (MAX 3.75x ceiling) | **+36.5%** | **+9.2%** | **−5.9%** | **−58.9%** | **−1.4%** | **+23.6%** | **−5.9%** | **−5.9%** |
| Headroom on the **4.25x acquisition election** (four testing periods) | +43.9% | +19.8% | **+6.6%** | −40.2% | **+10.5%** | +32.8% | +6.6% | +6.6% |
| Second covenant — min interest coverage (floor 3.00x), covenant basis | 7.36x / +145.3% | 5.15x / +71.7% | 4.41x / +47.2% | **2.94x / −1.9%** | 4.61x / +53.6% | 6.12x / +104.1% | 4.41x / +47.2% | 3.60x / +19.9% |
| **Covenant breach? (Y/N)** | **N** | **N** | **Y on 3.75x · N if the 4.25x election is taken** | **Y — both covenants** | **Y on 3.75x (marginal, −1.4%) · N on 4.25x** | **N** | **Y on 3.75x · N on 4.25x** | **Y on 3.75x · N on 4.25x** |
| Stressed PF FCF | 559.2 | 272.9 | 177.4 | **−13.5** | 202.6 | 398.9 | 177.4 | 147.0 |
| **12-month liquidity gap** (negative = surplus) | **−408.2** | **−121.9** | **−26.4** | **+164.5** | **−51.6** | **−247.9** | **+193.3** | **+3.9** |
| **Survives without external action? (Y/N)** | **Y** | **Y** | **Liquidity Y; covenant NO — needs the 4.25x election or a waiver** | **NO — covenant breach on both tests; needs a waiver, and a $164.5m gap against $776.4m of liquidity** | **Liquidity Y; covenant marginal — needs the election** | **Y** | **Liquidity Y ($193.3m gap vs $776.4m); covenant NO** | **Liquidity Y; covenant NO** |

**Four qualifiers that must travel with 2B.**

- **The 4.25x election is real and it is exactly this situation.** The credit agreement permits 4.25x "at nVent Finance's election and subject to certain conditions, **for four testing periods in connection with certain material acquisitions**" [`Q2 FY26 10-Q, Note 10`]. It is not a waiver and it does not need lender consent at the time — but it lasts four quarters, not indefinitely, and "certain conditions" are not disclosed in the pool. So the −40% pro-forma outcome is best stated as: **breaches the standing 3.75x ceiling; clears the temporary 4.25x election with +6.6% to spare, for four quarters only.**
- **The pro-forma rate shock is much larger than the as-reported one and is a bound.** It assumes the whole $1,750m of new debt is floating (+$35.0m at +200bp) on top of the $200.0m term loan (+$4.0m). The fixed/floating split of the acquisition financing is **not disclosed**; if it is termed out with fixed-rate notes the shock reverts to the as-reported $4.0m.
- **PF FCF turns negative at −60%** (−$13.5m). That is the first scenario in this report in which the business consumes cash rather than generating it.
- **The mid-cycle pro-forma is worse than every column above and belongs beside them.** On the normalised base, PF covenant leverage is **2.88x (+23.2% headroom)** before the earnout and **3.41x (+9.1%)** with it — meaning that measured from a normalised earnings base with the earnout paid, **a further −9.1% EBITDA decline breaches the 3.75x ceiling.** That is the single most fragile number this report produces.

**Mitigation assumption, stated as CLAUDE.md §9 requires.** *All scenarios above assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2) is the expected-outcome read.*

### 2C. The realised-offset case, computed rather than assumed (CLAUDE.md §9)

**What the filings actually let us measure, and what they do not.**

- **Measurable — the cost channel.** `earnings/07` §2 computes the realised offset from the filings and the calls: pre-mitigation inflation of ~$110m over H1 FY26 ÷ $2,713.3m of sales = ~405bps, against an observed gross-margin change of −170bps → **realised offset = 1 − 170/405 = 58%**, with a quarterly path of **40% (Q1 FY26) → 79% (Q2 FY26)**. That is measured, not assumed.
- **Not measurable — the volume channel.** `earnings/07` §6 states it plainly: "The pool contains no organic-revenue decline since the divestiture, so the true decremental rate is **not measurable from available data**." There is therefore **no realised offset to run for a demand-driven EBITDA fall**, and the −30/−40/−60% columns stay bounds. Saying otherwise would be invention.

**So the realised-offset case is run on the cost channel, and the arithmetic cuts both ways:**

| Read | Arithmetic |
|---|---|
| **The offset applied to a −40% bound** | If the −$429.8m of EBITDA loss is cost-driven, the 58% measured offset means the realised hit is **$429.8m × 0.42 = $180.5m = −16.8% of EBITDA** — the "realised-offset case" column in §2A and §2B |
| **The offset applied to the full known cost exposure** | The entire disclosed cost exposure is roughly **$270m gross** a year (~$190m all-in tariffs plus ~$80m of non-tariff inflation) [`earnings/07` rows 3–4]. At the measured 58% offset that is **−$113.4m of EBITDA = −10.6%** — well short of even the −30% haircut |
| **What a −40% fall would require through the cost channel** | A gross pre-mitigation cost shock of **$1,023.4m — 19.0% of guided FY2026 sales of $5,372.5m**, i.e. **5.4 times** the entire all-in tariff run rate. For −30% it is $767.6m (14.3% of sales); for −60%, $1,535.1m (28.6%) |

**Conclusion of the realised-offset test: a −30% to −60% EBITDA fall at nVent is a volume event, not a cost event.** Cost inflation of the size the company is actually absorbing, run at the rate it has actually absorbed it, gets nowhere near these haircuts. **Three qualifiers travel with the 58%** and are not dropped: the cost dollars are call figures stated as floors ("more than", "approximately"), so the offset is conservative; the previous cycle **over-recovered and then handed the price back** (group price +5.5% in 2023, −0.2% in 2024), so the offset is not a permanent ratchet; and "no contractual pass-through" is a fact about contracts, never a measurement — the 58% is the measurement [`earnings/07` §2].

---

## 3. Break Points

**The covenant solve is direction-aware and uses the covenant's OWN numerator**, read from `04`: the nVent covenant nets cash (capped at $250.0m), so the numerator is **covenant net debt**, not gross or secured debt.

- **MAX / ceiling** (max net leverage): `h = 1 − covenant net debt ÷ (T × covenant EBITDA)`
- **MIN / floor** (min interest coverage): `h = 1 − (T × interest) ÷ covenant EBITDA`
- **Liquidity**: solve `usable liquidity + stressed FCF(h) = next-12-month obligations`, with `stressed FCF(h) = FCF_base − EBITDA_base × h × (1 − 0.222)`

### 3A. As-reported structure

| Break Point | EBITDA Decline That Triggers It | The solve |
|---|---:|---|
| **Tightest covenant breaches (max net leverage 3.75x, MAX/ceiling)** | **−69.9%** | `h = 1 − 1,250.0 ÷ (3.75 × 1,106.7) = 1 − 1,250.0 ÷ 4,150.1 = 0.6988`. Covenant EBITDA would have to fall to $333.3m |
| Same covenant, on the 4.25x acquisition election | −73.4% | `h = 1 − 1,250.0 ÷ (4.25 × 1,106.7) = 0.7342` |
| Same covenant, holding non-cash share-based comp fixed at $40.5m instead of haircutting it | −72.0% | `1,074.6 × (1−h) + 32.1 = 333.3` → `h = 0.7197`. **The proportional assumption used in §2 is the more conservative one** |
| Same covenant, measured from the **normalised / mid-cycle** base | a **further −62.5%** | `h = 1 − 1,250.0 ÷ (3.75 × 889.4) = 0.6252`, where $889.4m is covenant EBITDA scaled to the mid-cycle base |
| Second covenant breaches (min interest coverage 3.00x, MIN/floor) | −79.7% | `h = 1 − (3.00 × 74.9) ÷ 1,106.7 = 1 − 224.7 ÷ 1,106.7 = 0.7970`. Nearly ten percentage points further out than the leverage covenant, so **it does not bind** |
| **Committed liquidity exhausted within 12 months** | **Not reached on an EBITDA decline alone — `h = 1.51 ≥ 1`** | `776.4 + (634.1 − 836.0h) = 151.0` → `836.0h = 1,259.5` → `h = 1.5065`. At h = 1.00 (EBITDA of zero) stressed FCF is −$201.9m and sources are $574.5m against $151.0m of obligations. **State it plainly rather than print a fabricated %** |
| Same, with the $219.7m working-capital shock stacked on | Still not reached — `h = 1.24 ≥ 1` | `776.4 + (634.1 − 836.0h) = 151.0 + 219.7` → `h = 1.2437` |
| Same, on **cash only** (revolver excluded — the market-closure variant) | **−78.9%** | `176.4 + (634.1 − 836.0h) = 151.0` → `h = 0.7888` |
| Net leverage exceeds **2.5x — the top of management's own stated target range** | **−54.0%** | `h = 1 − 1,236.4 ÷ (2.5 × 1,074.6) = 0.5398`. "We exited the quarter with net leverage of 1.2x, well below our target range of 2 to 2.5x" [`Q2 FY26 transcript, 2026-07-31, prepared remarks (CFO)`] |
| Net leverage exceeds **4.0x — a labelled refi-market threshold** | **−71.2%** | `h = 1 − 1,236.4 ÷ (4.0 × 1,074.6) = 0.7124`. *4.0x is an assumption, not a disclosure — no rating-agency report is in this pool, so no rating threshold is asserted* [`00_solvency-data-triage`; `02` §3]. At 6.0x: −80.8% |

### 3B. Pro-forma structure — **PRO-FORMA INFERENCE, NOT FROM FILINGS**

| Break Point | EBITDA Decline That Triggers It | The solve |
|---|---:|---|
| **Tightest covenant breaches (3.75x ceiling)** | **−36.4%** | `h = 1 − 3,000.0 ÷ (3.75 × 1,258.9) = 1 − 3,000.0 ÷ 4,720.9 = 0.3645` |
| Same, on the **4.25x acquisition election** (four testing periods only) | −43.9% | `h = 1 − 3,000.0 ÷ (4.25 × 1,258.9) = 0.4393` |
| Same, **with the full $550m earnout paid** | **−24.8%** | `h = 1 − 3,550.0 ÷ (3.75 × 1,258.9) = 0.2480` |
| Same, measured from the **normalised / mid-cycle** base | a **further −23.2%** | `h = 1 − 3,000.0 ÷ (3.75 × 1,041.6) = 0.2320` |
| Same, **mid-cycle base AND the earnout paid** | **a further −9.1%** | `h = 1 − 3,550.0 ÷ (3.75 × 1,041.6) = 0.0911`. **The most fragile figure in this report** |
| Second covenant breaches (min interest coverage 3.00x) at PF interest of $171.1m | −59.2% | `h = 1 − (3.00 × 171.1) ÷ 1,258.9 = 0.5923`. At +200bp interest of $210.1m: **−49.9%** |
| **Committed liquidity exhausted within 12 months — funding Case A** | Not reached — `h = 1.24 ≥ 1` | `776.4 + (559.2 − 954.5h) = 151.0` → `h = 1.2411` |
| **Committed liquidity exhausted — funding Case B** (freely usable cash spent at close; the revolver is the only usable liquidity) | Not reached, but only just — `h = 1.06 ≥ 1` | `600.0 + (566.7 − 954.5h) = 151.0` → `h = 1.0642` |
| **Committed liquidity exhausted — the UNDRAWN-BRIDGE-TENOR case** (bridge drawn at close and NOT termed out within 12 months) | **`h ≤ 0` — the gap exists at TODAY's EBITDA, before any decline** | Case B: uses = 1,573.6 bridge + 13.8 amortisation + 137.2 dividends = **$1,724.6m**; sources at h = 0 = 600.0 liquidity + 566.7 FCF = **$1,166.7m** → **gap $557.9m**, solved `h = −0.585`. Case A (all-debt-funded, $1,750.0m bridge): uses $1,901.0m, sources $1,335.6m → **gap $565.4m**, `h = −0.592`. At −30% the gap is $844–852m; at −40%, $940–947m; at −60%, $1,131–1,138m |
| PF net leverage exceeds 2.5x (management's own ceiling) | **−2.6%** — i.e. it is essentially there on day one | `h = 1 − 2,986.4 ÷ (2.5 × 1,226.8) = 0.0263`. On the mid-cycle base it is **already above 2.5x at 2.94x before any decline** |
| PF net leverage exceeds the labelled 4.0x refi threshold | −39.1% | `h = 1 − 2,986.4 ÷ (4.0 × 1,226.8) = 0.3914` |

### 3C. Executed calculations (fix F09)

Every stressed figure, headroom and break point above was produced by the two Python scripts below and copied from their output — none was computed by hand.

```
$ python3 stress.py
=== AS-REPORTED (30-Jun-2026) ===
Base                      h= 0.000 EBITDA= 1074.6 ND/E=1.15x E/int=14.35x covLev=1.13x hr= 69.9% covMinCov=14.78x hrmin=392.5% FCF= 634.1 gap= -483.1
-30% EBITDA               h= 0.300 EBITDA=  752.2 ND/E=1.64x E/int=10.04x covLev=1.61x hr= 57.0% covMinCov=10.34x hrmin=244.8% FCF= 383.3 gap= -232.3
-40% EBITDA               h= 0.400 EBITDA=  644.8 ND/E=1.92x E/int= 8.61x covLev=1.88x hr= 49.8% covMinCov= 8.87x hrmin=195.5% FCF= 299.7 gap= -148.7
-60% EBITDA               h= 0.600 EBITDA=  429.8 ND/E=2.88x E/int= 5.74x covLev=2.82x hr= 24.7% covMinCov= 5.91x hrmin= 97.0% FCF= 132.5 gap=   18.5
Hist-cal: revert to FY2024 h=0.374 EBITDA=  673.1 ND/E=1.84x E/int= 8.99x covLev=1.80x hr= 51.9% covMinCov= 9.26x hrmin=208.5% FCF= 321.7 gap= -170.7
Realised-offset 58%       h= 0.168 EBITDA=  894.1 ND/E=1.38x E/int=11.94x covLev=1.36x hr= 63.8% covMinCov=12.29x hrmin=309.8% FCF= 493.6 gap= -342.6
-40% + WC shock 219.7     h= 0.400 EBITDA=  644.8 ND/E=1.92x E/int= 8.61x covLev=1.88x hr= 49.8%                              FCF= 299.7 gap=   71.0
-40% + rates +200bp       h= 0.400 EBITDA=  644.8 ND/E=1.92x E/int= 8.17x covLev=1.88x hr= 49.8% covMinCov= 8.42x hrmin=180.5% FCF= 296.6 gap= -145.6
hist-cal haircut = 0.3736
=== BREAK POINTS AS-REPORTED ===
covenant MAX 3.75x  h = 1 - 1250.0/(3.75*1106.7) = 0.6988
covenant MAX 4.25x  h = 0.7342
covenant MIN 3.00x  h = 1 - (3.00*74.9)/1106.7  = 0.7970
  strict net lev > 2.5x  h = 0.5398 | > 3.0x  h = 0.6165 | > 3.75x h = 0.6932 | > 4.0x h = 0.7124 | > 6.0x h = 0.8082
liquidity exhaustion h = (776.4 + 634.1 - 151.0)/(1074.6*0.778) = 1.5065  (>=1 -> not reached)
  at h=1.0: FCF = -201.9  liq+FCF = 574.5 vs obl 151.0
  cash-only usable 176.4: h = 0.7888   |   with WC shock 219.7: h = 1.2437
as-reported covenant break, SBC held fixed: 0.7197  vs proportional 0.6988

$ python3 stress_pf.py
PF net debt strict 2986.4 | PF lev peak 2.43 | mid-cycle 2.94 | fwd consensus 2.17 | +earnout peak 2.88 | +earnout mid 3.48
PF lev peak on Maverick EBITDA range 152.2-166.7: 2.43 - 2.41
Base PF                h=0.000 E=1226.8 ND/E=2.43x E/int= 7.17x covLev=2.38x hr= 36.5% minCov=7.36x hrm=145.3% FCF= 559.2 gap= -408.2
-30%                   h=0.300 E= 858.8 ND/E=3.48x E/int= 5.02x covLev=3.40x hr=  9.2% minCov=5.15x hrm= 71.7% FCF= 272.9 gap= -121.9
-40%                   h=0.400 E= 736.1 ND/E=4.06x E/int= 4.30x covLev=3.97x hr= -5.9% minCov=4.41x hrm= 47.2% FCF= 177.4 gap=  -26.4
-60%                   h=0.600 E= 490.7 ND/E=6.09x E/int= 2.87x covLev=5.96x hr=-58.9% minCov=2.94x hrm= -1.9% FCF= -13.5 gap=  164.5
hist-cal -37.4%        h=0.374 E= 768.5 ND/E=3.89x E/int= 4.49x covLev=3.80x hr= -1.4% minCov=4.61x hrm= 53.6% FCF= 202.6 gap=  -51.6
realised-offset -16.8% h=0.168 E=1020.7 ND/E=2.93x E/int= 5.97x covLev=2.86x hr= 23.6% minCov=6.12x hrm=104.1% FCF= 398.9 gap= -247.9
PF -40% + WC 219.7  gap = 193.3
PF -40% + rates +200bp: interest 210.1 E/int 3.50 minCov 3.60 gap 3.9
=== PF BREAK POINTS ===
cov MAX 3.75x h = 1 - 3000/(3.75*1258.9) = 0.3645 | 4.25x election h = 0.4393 | with 550 earnout h = 0.2480
cov MIN 3.00x at PF interest 171.1 h = 0.5923 | at +200bp interest 210.1 h = 0.4993
  strict net lev > 2.5x h = 0.0263 | > 4.0x h = 0.3914
liquidity exhaustion Case A h = 1.2411 | Case B h = 1.0642
=== BRIDGE NOT TERMED OUT (12m) ===
Case A bridge 1750.0: uses=1901.0 sources(h=0)=1335.6 gap@h=0 = 565.4 -> break-point h = -0.592
     h=0.3: gap = 851.7 | h=0.4: gap = 947.2 | h=0.6: gap = 1138.1
Case B bridge 1573.6: uses=1724.6 sources(h=0)=1166.7 gap@h=0 = 557.9 -> break-point h = -0.585
     h=0.3: gap = 844.2 | h=0.4: gap = 939.7 | h=0.6: gap = 1130.6
PF mid-cycle covenant EBITDA 1041.6 | covLev 2.88x headroom 23.2% | further decline to breach h = 0.2320
  with full 550 earnout: covLev 3.41x, h = 0.0911 | on 4.25x election: h = 0.3223
AS-REPORTED mid-cycle covLev 1.41x headroom 62.5% | further decline to breach h = 0.6252
cost-channel check at the measured 58% offset:
  -30% EBITDA needs a gross pre-mitigation cost shock of 767.6m = 14.3% of guided FY26 sales
  -40% EBITDA needs 1023.4m = 19.0% of sales | -60% needs 1535.1m = 28.6% of sales
  known all-in cost exposure ~270m gross at 58% offset -> 113.4m of EBITDA = -10.6% haircut
```

---

## 4. Survival Read

**On the balance sheet nVent actually reports today, nothing breaks inside a normal recession and nothing breaks in a severe one: the tightest covenant — the 3.75x maximum net leverage ceiling in the Senior Credit Facilities, measured on the credit agreement's own definitions — needs a −69.9% fall in covenant EBITDA to break, the 3.00x minimum interest-coverage floor needs −79.7%, and committed liquidity is never exhausted on an EBITDA decline alone (the solve returns `h = 1.51`, meaning the company still has $574.5m of usable sources against $151.0m of obligations even at zero EBITDA).** A −30% or −40% decline — a normal recession, not a tail — leaves net leverage at 1.64x / 1.92x strict, interest covered 10.0x / 8.6x, covenant headroom of +57.0% / +49.8%, and an annual free-cash surplus of $232.3m / $148.7m before touching a dollar of the $776.4m of usable liquidity. **Survivable on its own, with no equity raise, no asset sale and no waiver.** Even −60% produces only an $18.5m twelve-month gap, 2.4% of usable liquidity, with the covenant still +24.7% clear. Add the $219.7m peak working-capital build to the −40% case and the gap is $71.0m against $776.4m; add +200bp of rates and it costs $4.0m a year, because only 13.3% of the debt floats and none of it is rate-hedged.

**The pro-forma balance sheet is a different credit, and the number that changes is the covenant, not the liquidity.** Adding $1.75bn of cash consideration takes strict net leverage to 2.43x on peak EBITDA and **2.94x on a normalised mid-cycle base** — and the EBITDA fall that breaks the 3.75x ceiling collapses from **−69.9% to −36.4%**, to **−24.8%** if the full $550m earnout is paid, and to **a further −9.1% measured from a normalised base with the earnout paid.** A −40% decline breaches the standing ceiling by 5.9% but clears the 4.25x acquisition election with +6.6% to spare — and that election lasts four testing periods, not indefinitely, with conditions the pool does not disclose. So the pro-forma answer is: **liquidity holds at −30/−40/−60% (the solve returns `h ≥ 1` even in the funding case where the entire freely usable cash balance is spent and the revolver is the only usable liquidity), but the covenant does not — a 40% earnings decline post-Maverick requires either the election or a lender waiver, and a 60% decline breaches both covenants and turns FCF negative.** Recognise what that means in a downturn: management may need to choose between the buyback, the $137.2m dividend and the covenant, and the covenant wins.

**Market-closure test — assume no new unsecured refinancing for 12 months.** *As-reported: it holds, and easily.* Only $13.8m of debt matures inside the window (0.92% of principal); the $600.0m revolver is committed and does not itself mature until 2030-06-30, so a closed market cannot pull it; and even excluding the revolver entirely, the break point on cash alone is a −78.9% EBITDA fall. *Pro-forma: it holds only if the acquisition debt is termed out.* **This is the one place the structure genuinely breaks, and it breaks at zero EBITDA decline.** If the committed Bank of America bridge is drawn at a Q4 2026 close and is not refinanced within twelve months, up to $1,573.6–1,750.0m enters the twelve-month maturity bucket, against usable liquidity plus stressed free cash flow of $1,166.7–1,335.6m — a **$557.9–565.4m funding gap at today's earnings**, solving to `h ≈ −0.59`. That is not an earnings question at all; it is a market-access question, and the pool contains no tenor, no pricing and no take-out plan. It widens to roughly $940m at −40% and $1,130m at −60%.

**What would be needed, and in what order.** As-reported: nothing. Pro-forma at −30%: nothing. Pro-forma at −40%: the 4.25x election first (a company election, not a negotiation), then a waiver if the decline runs past four quarters, then dividend and buyback suspension — which on its own restores $137.2m + $58.0m a year and closes every liquidity gap in §2B. Pro-forma at −60%: a waiver on both covenants is unavoidable, and the $164.5m gap plus negative FCF makes an asset sale or an equity raise a live option rather than a theoretical one. Under the bridge-not-termed-out case at any earnings level: **refinancing access, and nothing else, is the answer** — the company would need to issue term paper, extend the bridge, or draw and hold the revolver, and none of that is inside its own control. **The single fact that would most change this read is the tenor and pricing of the Maverick financing, and it is not in this data pool.**

**Two things this report does not do.** It assigns **no probability** to any of these scenarios — that is the master synthesizer's job — and it produces no solvency verdict, which belongs to `99_balance-sheet-survival-synthesis`. **Downside resilience is assessable** (a usable EBITDA base exists and covenants are fully disclosed, so no partial-data cap binds), and on the reported structure it is high; the pro-forma structure is where the assessment gets harder, and it is labelled inference throughout because the pool does not disclose how a $1.75bn cheque is being financed.
