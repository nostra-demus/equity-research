# Downside Stress Test — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS. Fiscal year ends 31 March.** EBITDA basis: **reported** (IndiaMART discloses no adjusted/non-GAAP EBITDA — full-text search of the FY26 Annual Report for "adjusted EBITDA"/"non-GAAP" returns no matches [`earnings/01_historical-financials.md` §4]). Base period is **FY26 (year ended 31-Mar-2026, audited)**; the latest quarter (30-Jun-2026) and LTM figures are shown as cross-checks. All computations below (leverage, coverage, liquidity gap, break-point solves) were produced by an executed Python snippet; the exact inputs and outputs are reproduced inline.

**Cash-backed EBITDA confirmed.** Per `earnings/06_earnings-quality.md` §2, CFO has exceeded EBITDA in every one of the last 5 years (121%–182% of EBITDA), with no cash-conversion red flags — the EBITDA used below is real, collected cash, not an inflated accrual figure. No divergence between headline and cash-backed EBITDA exists for this company, so no adjustment is required.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, FY26 annual) | ₹5,205.94mn | `01_capital-structure-and-leverage.md` §5; cross-check LTM (4qtrs to 30-Jun-2026) ₹5,314.65mn |
| Gross debt | ₹231.02mn (FY26-end) / ₹216.28mn (latest, 30-Jun-2026) — 100% lease liabilities (Ind AS 116), no bank borrowings/bonds/term loans/revolver | `01` §1 |
| Net debt (strict, §15 canonical basis per `01`) | **−₹573.11mn (net cash)** FY26-end / −₹151.83mn (net cash) latest | `01` §4, §7 |
| Net debt (broad basis, labelled, not canonical) | −₹30,971.63mn (net cash) FY26-end / −₹33,670.30mn (net cash) latest | `01` §4 |
| Net debt / EBITDA | N/M — net cash on both bases at every date shown (strict: −0.11x FY26; broad: −5.95x FY26) | `01` §5 |
| EBITDA / interest | 174.64x (FY26) / 212.36x (LTM Jun-26) | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold | **None exists** — no covenant-bearing debt (zero "covenant" hits in the full FY26 Annual Report text; only debt is ₹231mn of Ind AS 116 lease liabilities; no bank facility, bond, or rated debt of any kind) | `04` §2 |
| Next-12m obligations | ₹158.68mn = ₹117.38mn undiscounted lease payments due within 12 months + ₹41.30mn LTM maintenance/total capex (no split disclosed) + ₹0 committed dividends | `03_liquidity-runway.md` §2 |
| Committed liquidity (effective, adjusted to today 13-Aug-2026) | ₹30,649.92mn = ₹33,886.58mn total cash + ST investments + treasury book (30-Jun-2026) − ₹3,236.66mn FY26 dividend paid 29-Jul-2026 (already-executed cash outflow not yet reflected in the last balance sheet in the pool) | `03` §1 |
| Floating-rate debt (gross) | ₹0 — 100% of gross debt (lease liabilities) carries a fixed implicit/incremental-borrowing rate set at lease inception | `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | N/A — company states it is "not engaged in commodity trading, hedging or exchange risk management activities"; no floating-rate exposure exists to hedge | `business-model/10_external-dependency.md` §1 |
| Working-capital seasonality / peak build | Not materially seasonal (2–3pp quarterly revenue-share spread, below the >30%/<20% flag threshold); operating working capital is structurally **negative** (−₹12,916.52mn at FY26-end) because customers prepay annual subscriptions — working-capital movements are a net cash source, not a use | `03` §3; `earnings/01_historical-financials.md` §5 |

**Cycle position of the EBITDA base:** `business-model/10_external-dependency.md` classifies IndiaMART as **"Partly externally driven"** (External Dependency Risk Score 52/100, inverted scale — higher = worse), not a deep cyclical/commodity name, so the MODULE_RULES trough-to-peak calibration overlay is not mandatory here. For context only: the worst single-year historical EBITDA move in the 5-year window in this pool was FY22→FY23, a **−11.9% decline** (₹2,971.01mn → ₹2,618.07mn), driven by a cost cycle (employee-expense step-up), not a demand shock — well inside the −30% haircut floor tested below. No formal history-calibrated scenario is added as a separate column for this reason, but the gap between that worst historical print and the haircuts tested is itself informative (Section 4).

**No pending or recently-announced material acquisition** requiring a pro-forma base was found in `business-model/11_capital-allocation-governance.md` or elsewhere in the data pool — the one control acquisition in the pool's window (Busy Infotech/Tolexo, $66.93mm) closed in FY22 and is already fully reflected in the FY26 balance sheet used above. No pro-forma adjustment is required.

---

## 2. Stress Scenarios

All figures computed via executed Python (inputs: FY26 EBITDA ₹5,205.94mn; FY26 gross debt ₹231.02mn; FY26 net debt strict −₹573.11mn / broad −₹30,971.63mn; FY26 consolidated interest ₹29.81mn; FY26 FCF ₹6,872.19mn; FY26 effective tax rate 26.74%; next-12m obligations ₹158.68mn; effective committed liquidity ₹30,649.92mn).

**FCF-to-EBITDA scaling assumption (stated per step 5):** lost EBITDA drops through to free cash flow at the after-tax operating margin, holding cash interest and maintenance capex fixed: `stressed FCF(h) ≈ FCF_base − EBITDA·h·(1 − tax rate)`, tax rate = 26.74% (FY26 effective rate, per `earnings/06_earnings-quality.md` §8). This is a simplifying assumption, not a filed figure — labelled as such. It is directionally conservative for h up to 60% (it assumes none of the lost EBITDA is offset by lower variable cost or working-capital release, even though this business's deferred-revenue collections would likely cushion cash generation further); it becomes unreliable at h approaching 100% (fixed costs would force actual losses long before EBITDA hits exactly zero), so results near h=100% in Section 3 are directional only, not literal.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (₹mn) | 5,205.94 | 3,644.16 | 3,123.56 | 2,082.38 | 3,123.56 | 3,123.56 |
| Gross debt / EBITDA | 0.0444x | 0.0634x | 0.0740x | 0.1109x | 0.0740x | 0.0740x |
| Net debt / EBITDA (strict) | −0.11x (net cash) | −0.16x (net cash) | −0.18x (net cash) | −0.28x (net cash) | −0.18x (net cash) | −0.18x (net cash) |
| Net debt / EBITDA (broad, labelled) | −5.95x (net cash) | −8.50x (net cash) | −9.92x (net cash) | −14.87x (net cash) | −9.92x (net cash) | −9.92x (net cash) |
| EBITDA / interest | 174.64x | 122.25x | 104.78x | 69.85x | 104.78x | 104.78x (rate shock does not touch fixed-rate lease interest) |
| Tightest covenant headroom | Not assessable — none exists | Not assessable | Not assessable | Not assessable | Not assessable | Not assessable |
| Covenant breach? (Y/N) | N — no covenant to breach | N | N | N | N | N |
| Stressed FCF (₹mn) | 6,872.19 | 5,727.99 | 5,346.55 | 4,583.65 | 4,562.03 | 5,346.55 |
| 12-month liquidity gap (₹mn, negative = surplus) | −37,363.4 | −36,219.3 | −35,837.9 | −35,075.1 | −35,053.4 | −35,837.9 |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

Notes on the two shock columns:
- **−40% + WC shock:** working-capital seasonality is not disclosed as material (Section 1), so per the labeled-assumption rule this column applies a conservative labeled outflow of **5% of FY26 revenue** (₹15,690.42mn × 5% = ₹784.52mn) added to the 12-month obligations bucket. *Inference, not from filings — labeled assumption, not a disclosed seasonal build.* Even with this outflow layered on top of a 40% EBITDA cut, the liquidity gap stays a ₹35.05bn surplus.
- **−40% + rates +200bp:** **Not applicable / not computable as a distinct scenario.** IndiaMART carries zero floating-rate debt (100% of gross debt is fixed-rate lease liabilities, `02` §3) and no hedges, so a +200bp shock to the floating portion has **no effect on interest expense** — this column is numerically identical to the plain −40% column on every debt-side metric. (A +200bp move would raise the yield on the ₹30bn+ treasury book, which is an asset-side upside, not a liability-side risk, and is outside this stress test's scope.)

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not applicable — no covenant-bearing debt exists.** There is no threshold `T` to solve against; the company has never drawn a bank loan, bond, or revolver (`04` §2), so no maintenance covenant of any kind attaches to its ₹231mn lease-liability book. |
| Committed liquidity exhausted within 12 months | **h = 9.80 (980%)** — solve: `usable liquidity + FCF_base − EBITDA·h·(1−tax) = next-12m obligations` → `30,649.92 + 6,872.19 − 5,205.94·h·0.7326 = 158.68` → `h = (30,649.92 + 6,872.19 − 158.68) / (5,205.94 × 0.7326) = 9.797`. This exceeds 1 (100%) by nearly 10x — **not reached on an EBITDA decline alone.** EBITDA cannot decline more than 100% (to zero) under this framing; reaching this break point would require the company to be losing money at roughly 9–10x its current EBITDA scale for a full year, which is outside any plausible operating scenario. |
| Net leverage exceeds 6x (illustrative refi-market threshold) | **h ≥ 1.02 (strict basis), h ≥ 1.99 (broad basis) — not reached.** MAX-form solve: `h = 1 − net debt / (T × EBITDA)`. Strict: `h = 1 − (−573.11) / (6.0 × 5,205.94) = 1 + 0.0184 = 1.018`. Broad: `h = 1 − (−30,971.63) / (6.0 × 5,205.94) = 1 + 0.991 = 1.991`. Because net debt is **negative** (net cash) on both bases, the leverage ratio stays negative (net cash) for any EBITDA decline short of 100% — an EBITDA decline alone cannot flip this balance sheet into net debt of any multiple, let alone 6x. Net debt would first have to turn positive (new borrowing or a cash outflow exceeding the entire ₹573mn–₹31.0bn net-cash cushion) before a leverage ratio in the conventional sense even exists. |

**Illustrative, non-covenant sanity check (not a real threshold, shown only to size distance):** EBITDA/interest would fall to 1.0x — the point at which operating earnings alone stop covering the ₹29.81mn interest bill — only at **h = 0.994 (99.4%)**, i.e. EBITDA would need to collapse to roughly ₹30mn from ₹5,206mn. This is not a covenant and is not scored; it exists only to confirm that interest coverage, like leverage and liquidity, is not a plausible failure channel for this company (`04` §3 makes the same point independently).

---

## 4. Survival Read

IndiaMART does not break on any of the three channels this test exists to find — covenant, leverage, or liquidity — at −30%, −40%, or −60% EBITDA, and the executed solves in Section 3 show the structure does not break even under EBITDA declines several multiples beyond a 100% wipeout of current earnings. The reason is structural, not a favorable assumption: gross debt is ₹231.02mn (100% fixed-rate lease liabilities) against ₹5.2bn of FY26 EBITDA and ₹30.6bn of effective liquidity, there is no covenant-bearing debt of any kind to breach, and the company's next-12-month contractual obligations (₹158.68mn) are covered by cash and liquid investments alone roughly 193 times over before a rupee of stressed free cash flow is even counted. A normal recession-scale EBITDA decline of 30–40% is trivially survivable on its own — it moves gross leverage from 0.044x to 0.074x and coverage from 175x to 105x, neither of which approaches a stress point for any lender or the company itself. Market closure test: assuming no new unsecured refinancing is available for 12 months changes nothing, because IndiaMART has no unsecured (or any) debt to roll in the first place — its only "maturity" is a schedule of lease payments funded from cash on hand, and that conclusion holds with or without capital-markets access (`02` §4–5).

**IndiaMART is net cash on both the strict basis (−₹573.11mn at FY26-end, canonical per `01`) and the broad basis (−₹30,971.63mn, labelled), and it survives every haircut tested — 30%, 40%, 60%, plus a labeled working-capital shock — with no covenant breach and no liquidity gap.** This is the strongest survival outcome this module can report, and per MODULE_RULES and CLAUDE.md §24 (Filter 3), the ₹30–34bn net-cash position is **strategic optionality** — counter-cyclical capacity to keep investing, hold headcount, absorb a demand shock in the India SME sector (the one genuine external risk flagged by `business-model/10_external-dependency.md` — geopolitical and consumer-cycle exposure scored 52/100 on the inverted dependency scale, materially higher than any balance-sheet risk in this dossier), or fund further bolt-on M&A without any refinancing dependence — not idle capital and not a "nothing breaks" blandness finding. If this company fails, the failure will show up first in the operating business (subscriber losses, pricing power, the SME demand cycle already flagged elsewhere in this dossier), not in the balance sheet this module tests.
