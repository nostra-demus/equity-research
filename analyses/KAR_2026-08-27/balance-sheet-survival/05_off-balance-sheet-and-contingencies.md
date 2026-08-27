# Off-Balance-Sheet & Contingencies — KAR

Karoon Energy Ltd (ASX: KAR), reporting currency **US dollars (US$)**, IFRS as adopted by the AASB, FY2025 (year ended 31-Dec-2025), audited FY2025 Annual Report filed 26-Feb-2026. All figures below are US$ millions unless stated otherwise. Total equity at 31-Dec-2025: **$1,032.5m** [FY2025 Annual Report, Consolidated Statement of Financial Position, p.79]. This agent reads `01_capital-structure-and-leverage.md` to avoid double-counting: the $278.4m restoration (decommissioning) provision, the $34.2m Petrobras contingent-consideration derivative, and the $1.1m finance-lease liability are already recognised on Karoon's balance sheet and are covered in `01`'s debt-stack / other-debt-like-obligations tables — they are referenced here only where they carry an incremental, off-balance-sheet, or maximum-exposure dimension that `01` does not size. No `ciq_facts.json` sidecar exists for this run; every figure below is this agent's own sourced read of the FY2025 Annual Report, cross-checked to `01`.

## 1. Off-Balance-Sheet / Debt-Like Obligations

Reporting currency: **USD**.

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt? | Source |
|---|---:|---:|---|---|
| Operating leases (if not capitalized) | N/A — none | N/A | N/A — Karoon reports under IFRS 16, which capitalises all material leases; the $1.1m finance-lease liability is already on-balance-sheet and already in `01`'s debt stack. No separate off-balance-sheet operating-lease bucket exists. | FY2025 Annual Report, Note 14 Leases |
| Pension / OPEB underfunding | $0.1m net liability (immaterial long-service-leave-type liability; no defined-benefit pension scheme) | $0.1m (fully recognized — no unfunded/off-balance-sheet component) | Yes — already in `01`'s "Other Debt-Like Obligations" table | Karoon Energy Ltd ASX KAR Financials Pension OPEB.xls |
| Securitization / factoring | None disclosed | N/A | N/A | No securitization, factoring, or receivables-sale programme found in a full-text read of the Notes |
| Purchase / take-or-pay commitments — capital & service expenditure | $0 (not recognized — executory contracts) | **$41.1m total** ($0.7m capital commitments, all due ≤1 year; $40.4m service commitments — predominantly Baúna FPSO logistics/services contracts — $30.8m ≤1 year, $9.6m 1-5 years) [FY2024 comparative: $74.1m total, so this has fallen $33.0m year-on-year] | No — not previously sized in `01` (which covers debt-like instruments, not executory purchase commitments) | FY2025 Annual Report, Note 23 Commitments, p.121 |

## 2. Guarantees & Letters of Credit

Reporting currency: **USD**.

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Surety bond — Baúna decommissioning | $0 (off-balance-sheet security instrument; collateralises the already-recognized $278.4m restoration provision — see `01` §2, not incremental to the $278.4m) | BRL 843.8m (US$153.4m equivalent at 31-Dec-2025) | ANP (Brazil's national petroleum regulator), Baúna field decommissioning obligations | FY2025 Annual Report, Note 15(a), p.104-105 |
| Parent-company guarantee — Baúna decommissioning | $0 (same restoration provision, being superseded — "Management is actively working to have the Parent Company guarantee released") | BRL 117.7m (US$21.4m equivalent at 31-Dec-2025) | ANP, Baúna field decommissioning obligations (duplicative with the surety bond above pending release) | FY2025 Annual Report, Note 15(a) p.105; Note 22(c) p.121 |
| Parent-company guarantees — Santos Basin concession agreements | $0 | Amount **not disclosed** in the data pool | ANP — guarantees a subsidiary's obligations under Concession Agreements covering Blocks BM-S-61, BM-S-68, S-M-1102 and S-M-1537 | FY2025 Annual Report, Note 22(c) p.121 |
| Bank guarantees — property lease rentals | $0.2m (fully funded/cash-collateralized by security deposits — no net exposure) | $0.2m | Property lessors (Parent Company office leases) | FY2025 Annual Report, Note 22(b), p.121 |
| Financial guarantees — intercompany support | Not quantified | Not quantified — open-ended statement of intent | "The Company's present intention is to provide the necessary financial support for all Australian incorporated subsidiaries… as is necessary for each company to pay all debts as and when they become due" — an intercompany support commitment, not a third-party exposure | FY2025 Annual Report, Note 22(b)(ii), p.121 |
| Performance / surety bonds (other) | None disclosed beyond the ANP bond above | N/A | N/A | Full-text read of Notes 14-23 found no other performance bonds |

**Note on the ANP decommissioning security package:** the $153.4m surety bond and the $21.4m parent guarantee both collateralise the *same* already-recognized $278.4m restoration provision (see `01` §2) — they are not additive to it. They are listed here because they are genuine off-balance-sheet security instruments (contingent calls on Karoon's own assets/parent guarantee if the provision is not funded as expected), not because they represent exposure beyond the $278.4m already on the balance sheet.

## 3. Litigation & Tax Contingencies

Reporting currency: **USD**. The company classifies these under Note 16 "Contingent Liabilities and Contingent Assets," applying AASB 137: recognition is required only where "a future sacrifice of economic benefits" is "probable" — items below are, by the company's own test, judged not to meet that bar (recognition not required), which is the company's own version of "not probable / not remote enough to book."

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Petrobras contingent consideration (Baúna acquisition earn-out) | $34.2m fair value recognized (embedded derivative — $27.4m current, $6.8m non-current) | **Filing's own headline figure: "up to US$285 million"** — this is the *cumulative, 5-year programme cap* across testing years CY2022-CY2026 (annual tiers from $0 at Brent <$50 up to a per-year maximum at Brent ≥$70, summing to $285m across all five years — see build below). **The genuinely forward-looking (not-yet-tested) residual at 31-Dec-2025 is materially smaller: ~$42.4m** ($27.4m CY2025 amount, already fixed and paid Jan-2026, + up to $15.0m CY2026 maximum if Brent averages ≥$70, of which $6.8m is already fair-valued and recognized) | **Active but shrinking / substantially crystallized.** CY2022-2024 tiers have already been tested and settled — the FY2025 reconciliation shows $87.6m paid during FY2025 alone and $86.0m paid during FY2024, i.e. most of the $285m programme cap is historical cash already paid, not forward risk. Only the CY2026 tier remains genuinely oil-price-contingent | FY2025 Annual Report, Note 16(a), Note 18(ii), p.105/108-109 |
| Deferred consideration — Pacific Exploration and Production Corp. | $0 (not provided for — "dependent on uncertain future events") | $5.0m | **Contingent, not yet triggered.** Payable only on first production reaching ≥1 MMboe from specified Santos Basin blocks (S-M-1037, S-M-1101, S-M-1102, S-M-1165, S-M-1166); company's own language treats this as too uncertain to recognize, not as remote/dormant | FY2025 Annual Report, Note 16(a)(i), p.105 |
| Brazilian local-content compliance (Concession Contracts) | $0 | **Not quantified** — potential ANP fine for failing to meet the minimum Brazilian local-content requirement (up to 55% during exploration/appraisal phase) | Ongoing compliance obligation under Concession Contracts for 8 named Santos Basin blocks; no breach or fine disclosed as crystallized. Company does not quantify a maximum penalty | FY2025 Annual Report, Note 16(a)(iii), p.105 |
| Tax audits (ordinary course, multiple jurisdictions) | $0 | **Not quantified** | "In the ordinary course of business, the Group is subject to audits from relevant government revenue authorities... which could result in an amendment to historical tax positions" — generic disclosure, no specific assessment or claim named | FY2025 Annual Report, Note 16(a)(ii), p.105 |
| Other legal claims (ordinary course) | $0 | **Not quantified** | Company's own language: "No material loss to the Group is expected to result" — the company's own probability characterization is effectively remote | FY2025 Annual Report, Note 16(a)(iv), p.105 |
| Contingent assets | $0 | $0 | None — "The Group has no contingent assets as at 31 December 2025 (31 December 2024: $Nil)" | FY2025 Annual Report, Note 16(b), p.105 |

## 4. Contingent Exposure Summary

Reporting currency: **USD**. This summary uses the correctly-scoped, forward-looking maximum for the Petrobras earn-out ($42.4m residual, not the $285m cumulative 5-year programme cap, most of which is already-paid historical cash — see §3 build) so the total is not inflated by a sunk, already-settled figure. Unquantified items (local-content fine, tax audit adjustment) cannot be summed and are flagged separately rather than assumed at zero.

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities (Petrobras fair value + Pacific E&P + bank guarantee) | $34.4m ($34.2m Petrobras + $0.0m Pacific E&P + $0.2m bank guarantee) |
| Total maximum / gross exposure, quantifiable items (residual Petrobras $42.4m + Pacific E&P $5.0m + bank guarantee $0.2m) | $47.6m |
| Max exposure ÷ recognized | 1.38x ($47.6m ÷ $34.4m) |
| Max exposure ÷ total equity ($1,032.5m) | 4.6% |
| Memo: including firm (non-contingent) purchase commitments ($41.1m, Note 23) | $88.7m total ÷ $34.4m recognized = 2.58x; ÷ equity = 8.6% |
| Memo: if the filing's full $285m Petrobras programme cap were used instead of the correctly-scoped $42.4m residual (methodologically wrong — see §3) | $290.2m ÷ $34.4m = 8.4x; ÷ equity = 28.1% — **would cross both RF-OBS-001 thresholds, but only by using a stale, already-paid cumulative figure as if it were still live, which it is not** |
| Memo (context, not summed above — collateral for an already-recognized liability, not incremental): ANP surety bond + parent guarantee behind the $278.4m restoration provision | $174.8m ($153.4m + $21.4m) — 16.9% of equity, but secures a liability already fully recognized on the balance sheet, not an add-on exposure |

## 5. Contingency Read

The largest genuinely off-balance-sheet items are the two decommissioning security instruments backing Karoon's own $278.4m restoration provision — a BRL 843.8m (US$153.4m) surety bond and a BRL 117.7m (US$21.4m) parent-company guarantee to Brazil's ANP regulator [FY2025 Annual Report, Note 15(a), Note 22(c)] — but these collateralize a liability Karoon has already recognized in full on its balance sheet (see `01` §2), so they add no exposure beyond what is already booked; the only live risk is that the recognized $278.4m estimate proves too low, which is a provision-adequacy question for `04`/`06`, not an off-balance-sheet spike. The Petrobras Baúna earn-out carries a filing-quoted "up to US$285 million" headline that looks large next to the $34.2m currently recognized, but the correct, forward-looking residual is only about $42.4m (1.38x recognized, 4.6% of equity) once the already-paid CY2022-2025 tiers are excluded — using the $285m cumulative programme cap as if it were still outstanding would overstate the exposure roughly 6-7x. Two items remain genuinely unquantified — the Brazilian local-content compliance fine and ordinary-course tax-audit exposure — and neither is sized in the filing; per the module's partial-data rule, undisclosed magnitude on a known regulatory exposure (local content) is a real gap, not an invented number, and it caps confidence in "total" contingent exposure rather than being assumed at zero. None of the quantifiable items meets the RF-OBS-001 bar (max ÷ recognized > 3x or max ÷ equity > 15%, AND the matter genuinely live) on a correctly-scoped basis, so this module does not emit that tag for KAR.

