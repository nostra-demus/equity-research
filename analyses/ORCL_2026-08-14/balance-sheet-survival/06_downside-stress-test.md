# Downside Stress Test — ORCL

Reporting currency: USD throughout. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2026" = year ended 2026-05-31). All figures are drawn from `01_capital-structure-and-leverage.md`, `02_maturity-wall-and-refinancing.md`, `03_liquidity-runway.md`, and `04_coverage-and-covenants.md` (all sourced to Oracle's audited FY2026 Form 10-K, filed 2026-06-22, and Capital IQ exports as of 2026-08-13), cross-checked against `earnings/06_earnings-quality.md` and `earnings/03_margin-drivers.md`. No pending or recently-announced material acquisition is disclosed anywhere in the data pool (`business-model/11_capital-allocation-governance.md` records $0 M&A cash outflow in FY2024–FY2026), so the pro-forma acquisition check in this agent's workflow (step 2a) does not apply — this stress test runs against Oracle's actual, reported FY2026 balance sheet. Every stressed figure below was produced by an executed Python snippet; the snippet and its output are shown inline.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $30,494mn (reported/GAAP-based: CIQ operating income $22,385mn + D&A $8,109mn) | [`01` §5, §7; `04` §1] |
| Net debt | $136,143mn (strict basis, §15; all-in gross debt $167,432mn − cash $31,289mn) — the basis `01` §7 designates as canonical for this module | [`01` §4, §7] |
| Net debt / EBITDA | 4.46x | [`01` §5] |
| EBITDA / interest | 6.63x (gross interest $4,599mn) / 7.98x (net interest $3,819mn) | [`04` §1] |
| Tightest covenant + threshold | Only one maintenance covenant disclosed anywhere in Oracle's debt terms: Revolving Credit Agreement, Consolidated EBITDA ÷ Consolidated Net Interest Expense **≥ 3.0x**, tested every fiscal quarter-end (MIN/floor covenant) | [`04` §2] |
| Next-12m obligations | $24,978mn = debt maturities $7,210mn + cash interest $3,896mn + maintenance-capex proxy (D&A) $8,109mn + committed dividends (common + preferred) $5,763mn | [`03` §2] |
| Committed liquidity | $41,894mn = cash & equivalents $31,289mn + short-term investments $605mn + fully available, non-borrowing-base undrawn revolver $10,000mn | [`03` §1] |
| Floating-rate debt (gross) | $6,137mn (4.5% of the notes-payable + finance-lease book) | [`02` §3] |
| Hedge coverage | $4,700mn of the Term Loan's floating balance swapped to an effective 4.74% fixed rate; floating exposure net of hedges ≈ $1,437mn (≈1.0% of the debt book) | [`02` §3] |
| Working-capital seasonality / peak build | No disclosed quarterly peak working-capital draw (`03` flags this as a hard-check gap). Separately, accounts-payable days (DPO) stretched from 42.9 to 127.6 days over FY2024–FY2026 as Oracle extends vendor terms to help fund the capex ramp — a real reversal risk, used below as the labeled working-capital shock | [`03` §"Seasonality"; `earnings/06_earnings-quality.md` §3] |

Reporting currency: USD. EBITDA basis: **reported/GAAP EBITDA ($30,494mn)**, not the inferred ~$37,035mn adjusted figure — Oracle discloses no company-defined adjusted EBITDA, and `earnings/06_earnings-quality.md` confirms the reported figure is genuinely cash-backed (CFO/EBITDA = 104.9% reported, ≈89.6% normalised for a one-off customer-prepayment surge, and has exceeded 85% in every year since FY2023), so this is the correct base per this agent's instruction to use cash-backed EBITDA over headline-adjusted EBITDA. `business-model/07_business-quality.md` scores Oracle's cyclicality at 38/100 (mid-band) — the hard rule requiring a history-calibrated trough scenario for a "deep cyclical/commodity name" is **not triggered**. That said, `business-model/10_external-dependency.md` scores AI-infrastructure industrial-cycle dependency at 72/100 (High, inverted), and FY2026's reported EBITDA margin (45.3%) is the highest of the last five years, aided by a record 49.5% Q4 margin — this base EBITDA is a high-water mark, not a normalised figure, and that caution carries into the haircuts below.

## 2. Stress Scenarios

Calculation run (Python):
```
EBITDA=30494.0; net_debt=136143.0; gross_interest=4599.0; net_interest=3819.0; threshold=3.0
for h in [0, 0.30, 0.40, 0.60]:
    e = EBITDA*(1-h)
    lev = net_debt/e
    cov_g = e/gross_interest; cov_n = e/net_interest
    hr_n = (cov_n-threshold)/threshold; hr_g = (cov_g-threshold)/threshold

Result:
h=0%:  EBITDA=30,494  net_lev=4.46x  cov_gross=6.63x  cov_net=7.98x  headroom_net=+166.2%  headroom_gross=+121.0%
h=30%: EBITDA=21,346  net_lev=6.38x  cov_gross=4.64x  cov_net=5.59x  headroom_net=+86.3%   headroom_gross=+54.7%
h=40%: EBITDA=18,296  net_lev=7.44x  cov_gross=3.98x  cov_net=4.79x  headroom_net=+59.7%   headroom_gross=+32.6%
h=60%: EBITDA=12,198  net_lev=11.16x cov_gross=2.65x  cov_net=3.19x  headroom_net=+6.5%    headroom_gross=-11.6% (BREACH on gross basis)
```
Net debt is held constant across haircuts (no offsetting paydown or draw assumed) — this is the conservative, standard convention for an EBITDA-only stress. The −40%+WC-shock and −40%+rates scenarios below layer a labeled liquidity/rate shock onto the −40% EBITDA case.

**Working-capital shock (labeled assumption):** accounts payable reverting from FY2026's stretched 127.6-day DPO back to FY2025's 80.5-day level, at FY2026 cost-of-revenue ($23,021mn), implies AP falling from $10,977mn to ≈$5,077mn — a **$5,900mn cash outflow** [`earnings/06_earnings-quality.md` §3]. This is used in place of an undisclosed seasonal-build figure (MODULE_RULES §B1), since no quarterly working-capital peak is disclosed.

**Rate shock:** +200bps applied to the ≈$1,437mn of floating-rate debt net of hedges → **+$28.7mn** of additional annual interest [Calc: 1,437 × 0.02 = 28.7]. This is immaterial relative to Oracle's $4,599mn gross interest bill because only ≈1% of the debt book is genuinely floating net of the Term Loan swap [`02` §3] — shown in the table for completeness, but it moves coverage by only ~0.03x.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | $30,494mn | $21,346mn | $18,296mn | $12,198mn | $18,296mn | $18,296mn |
| Net debt / EBITDA | 4.46x | 6.38x | 7.44x | 11.16x | 7.44x | 7.44x |
| EBITDA / interest (net-interest basis, matches covenant) | 7.98x | 5.59x | 4.79x | 3.19x | 4.79x | 4.76x |
| EBITDA / interest (gross-interest, conservative alt.) | 6.63x | 4.64x | 3.98x | 2.65x | 3.98x | 3.95x |
| Tightest covenant headroom (net-interest basis; MIN/floor: (actual−3.0)/3.0) | +166.2% | +86.3% | +59.7% | **+6.5%** | +59.7% | +58.5% |
| Covenant breach? (Y/N) | N | N | N | **N (net-int.) / Y (gross-int., conservative alt.) — marginal, basis-dependent** | N | N |
| 12-month liquidity gap (uses − committed liquidity; negative = surplus) | −$16,916mn | −$16,916mn | −$16,916mn | −$16,916mn (or −$6,916mn if revolver access is lost on a covenant breach) | −$11,016mn | −$16,887mn |
| Survives without external action? (Y/N) | Y | Y | Y | **Marginal — Y on the covenant's own literal (net-interest) basis, N on the conservative gross-interest alt.** | Y | Y |

**Why the liquidity-gap row barely moves with EBITDA alone:** the $24,978mn near-term uses bucket (debt maturities, cash interest, a maintenance-capex proxy, dividends) is contractual/discretionary, not EBITDA-linked in the next 12 months — so an EBITDA haircut alone does not mechanically widen it. This is a real finding, not an oversight: it means the covenant, not this narrow liquidity bucket, is the first thing an EBITDA-only shock threatens. But this narrow bucket **deliberately excludes** Oracle's guided ≈$70bn of FY2027 growth capex (per `03` §3) — Section 3 below shows what happens once that capex is put back in.

**Deep-cyclical calibration:** not triggered (see Section 1) — no additional history-calibrated haircut is added. As a substitute caution, note that FY2026's 45.3% EBITDA margin is a five-year high; a reversion toward the 38–41% margin band seen in FY2023–FY2025 (`01` §5) would itself act like an EBITDA haircut of roughly 9–15% even before any further AI-demand shock, tightening every ratio above.

## 3. Break Points

Calculation run (Python):
```
# (a) Covenant breach — MIN/floor coverage covenant, T=3.0x, interest held constant
h_net   = 1 - (3.0*3819.0)/30494.0   = 0.6243  -> 62.4%
h_gross = 1 - (3.0*4599.0)/30494.0   = 0.5476  -> 54.8%

# net leverage vs illustrative refi threshold, T=6.0x (labeled illustrative — Oracle has no max-leverage covenant; see 04 §3)
h_lev = 1 - 136143.0/(6.0*30494.0) = 0.2559 -> 25.6%

# (b) Liquidity exhaustion — narrow "hard obligations" basis (debt maturities + dividends only;
#     interest & capex already sit inside FCF, so they are NOT added again, per MODULE_RULES §8)
usable_liquidity = 41894.0
obligations_narrow = 7210.0 + 5763.0 = 12973.0   # debt maturities + committed dividends
FCF_base(reported, FY26)    = -23686.0
FCF_base(normalised, FY26)  = -28328.0
tax = 0.126  (FY26 GAAP effective tax rate, earnings/06 §8)
stressed_FCF(h) ≈ FCF_base − EBITDA·h·(1−tax)
Solve usable_liquidity + stressed_FCF(h) = obligations_narrow:
  reported basis:    h = 0.1964 -> 19.6%
  normalised basis:  h = 0.0222 -> 2.2%
# Alternate: narrow "hard-obligations-only" basis used by 03 (uses=$24,978mn incl. only maintenance-capex
# proxy, no FCF subtraction) is NOT EBITDA-linked -> does not breach on EBITDA decline alone (h>=1)
```

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **−62.4%** on the covenant's own literal net-interest-expense basis (EBITDA would need to fall from $30,494mn to $11,457mn, interest held flat); **−54.8%** on the conservative gross-interest alternative (used because the exact covenant-EBITDA addback definition is undisclosed — `04` §2 flags this and caps headroom confidence at 60/100). Both are well beyond the standard −60% haircut in Section 2, which is why the −60% row shows only a marginal, basis-dependent breach. |
| Committed liquidity exhausted within 12 months | **Basis-dependent, and this is the single most important number in this report.** On the narrow "hard obligations only" basis (maintenance capex proxied by D&A, no FCF netting — the basis `03` itself uses, because reported FCF is dominated by discretionary growth capex) this does **not** breach on EBITDA decline alone (h ≥ 1). But once actual free cash flow (which nets Oracle's real, guided capex spend) is used instead, the picture flips sharply: solving `usable liquidity + stressed FCF(h) = debt maturities + dividends` gives **h ≈ +19.6%** using FY2026's reported FCF (−$23,686mn) as the base, or **h ≈ +2.2%** using the §15-normalised FCF (−$28,328mn, which strips out a one-off customer-prepayment surge that management guides will actually *recur* into FY2027 — so the reported-FCF figure is arguably the better forward base here, labeled: Inference, not from filings). **Under this reading, a decline as shallow as 2–20% in EBITDA — well inside a normal-recession range, not a tail scenario — could exhaust Oracle's committed liquidity within 12 months, PROVIDED capex is held at its current pace and is not cut back.** That proviso is the load-bearing assumption; see Section 4. |
| Net leverage exceeds 6.0x (illustrative refi-market threshold — Oracle has no max-leverage covenant of its own; `04` §3 notes a typical leveraged-borrower band of 4.0x–4.5x, and Oracle's own current net debt/EBITDA of 4.46x already sits at the low end of that band) | **−25.6%** — shallower than the standard −30% haircut. At −30% EBITDA alone, net leverage is already 6.38x. |

## 4. Survival Read

The one disclosed covenant is wide and does not break inside the standard 30–60% haircut range on its own literal terms (breaches only past a 62.4% EBITDA decline), but that headline masks two more binding constraints: net leverage crosses a typical refinancing-sensitive threshold (6.0x) at just a 25.6% decline — shallower than a normal-recession −30% haircut — and, more importantly, Oracle's committed liquidity ($41.9bn) is not actually being tested against maintenance-level spending; it is being run down by a ≈$56bn (FY2026 actual) to ≈$70–95bn (FY2027 guided) capex program that is roughly double the size of the EBITDA it is meant to be measured against. On that real-spending basis, the liquidity break point falls to somewhere between a 2% and 20% EBITDA decline — inside normal-recession territory, not a tail event — **provided capex is not cut**. A 30–40% EBITDA decline is not mechanically survivable if Oracle keeps building at its current pace: it would need to draw the revolver, delay or cancel data-center commitments (a portion of the disclosed $260bn of additional, not-yet-commenced lease commitments — `05` §1), issue new debt or equity into a market where S&P has already cut the issuer rating to BBB− (2026-07-09, one notch above non-investment grade) and CDS spreads sit near an 18-year high [`02` §5], or seek a covenant waiver if the coverage test is later read on the conservative gross-interest basis. The single most plausible, and most likely, exit is a **capex retrenchment** — management itself has signaled that lever is available. **Market closure test (no new unsecured issuance for 12 months):** cash ($31.3bn) plus the undrawn revolver ($10.0bn) — $41.3bn — would still cover the FY2027 notes-payable maturity ($7.2bn) plus lease payments (≈$4.4bn) several times over [`02` §5], so Oracle does **not** default on its debt service under closed markets; what breaks is the AI-infrastructure buildout itself, which depends on ≈$40bn of planned new debt and equity issuance that a closed market removes. Oracle is **not** net cash (net debt $136,143mn, strict basis) and does not earn the module's strongest survival read; a normal 30–40% EBITDA decline is survivable for debt service, but not survivable for the capital program as currently guided, without one of a capex cut, a fresh capital raise, or (in the deepest, least likely case) a covenant waiver.
