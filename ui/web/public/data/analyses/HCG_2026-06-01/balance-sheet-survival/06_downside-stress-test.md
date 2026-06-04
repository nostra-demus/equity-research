# Downside Stress Test — HCG

HealthCare Global Enterprises Limited (NSE: HCG / BSE: 539787). Report date: 2026-06-01. India-focused cancer-care / multispecialty hospital operator (≈25 hospitals; one centre in Kenya). **Reporting currency: INR million (₹ Mn), consolidated, Ind AS, as at 31 March 2026 (FY26)** unless a date is stated. Fiscal year ends 31 March. EBITDA throughout is **Reported EBITDA (audited statutory operating result, pre other-income, post-Ind AS 116)**, which is the cash-backed base used here (see note below); Adjusted EBITDA differs by only +₹53 Mn (+1.15%), so Reported is the conservative anchor.

**Inputs consumed:** `01_capital-structure-and-leverage.md` (net debt, EBITDA base, rate mix), `02_maturity-wall-and-refinancing.md` (12-month obligations, floating exposure, rate shock), `03_liquidity-runway.md` (committed liquidity, near-term uses, runway), `04_coverage-and-covenants.md` (coverage, the tightest covenant — labeled assumption — and breach proximities), `05_off-balance-sheet-and-contingencies.md` (Vizag cash calls, EPCG, committed capex). Cross-module: `business-model/10_external-dependency.md` (cycle depth), `earnings/03_margin-drivers.md` (downside-margin levers), `earnings/06_earnings-quality.md` (cash-backed EBITDA). This agent does **not** assign probabilities, value the company, or rate the stock — that is the master synthesizer's job.

**EBITDA basis — cash-backed cross-check (per earnings/06).** Reported EBITDA ₹4,657.9 Mn is **cash-backed but the conversion rate is eroding**: CFO/Reported EBITDA was 74.5% in FY26 (down from 84–86% in FY23–FY24), above the 70% healthy line for four straight years; the adjusted-vs-reported gap is only +1.15% [earnings/06 §1–2, §9]. So Reported EBITDA is **not** materially above cash-backed EBITDA and is the correct stress base. The practical caveat the stress must carry: the CFO that actually services debt runs ~25% below EBITDA, so coverage is modeled on cash uses, not on headline EBITDA, where it matters.

**Two-covenant caveat (carried from 04).** **No lender financial maintenance covenant is disclosed in the data pool** [04 §2; FY24-25 AR, Note 18, searched in full]. The breach checks below therefore run against **labeled-assumption** market covenants for an A+ (ICRA)-rated Indian operating company — **assumed min interest coverage 2.0x (lease-inclusive)** and **assumed max net leverage 3.5x (incl. lease)** — plus management's quantified **internal 2.5x ex-lease net-leverage ceiling** (a board discipline, not a lender test). **True covenant headroom is "Not assessable"; all covenant breach points below are indicative**, per the partial-data rule [MODULE_RULES partial-data + score-cap tables].

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, Reported, FY26) | ₹4,657.9 Mn | 01 §7; earnings/06 §1 (CFO/EBITDA 74.5%, cash-backed) |
| Net debt — incl. leases (cash only) | ₹11,993.1 Mn | from 01 §4, §7 |
| Net debt — ex-lease (cash only) | ₹3,743.6 Mn | from 01 §4, §7 |
| Net debt / EBITDA — incl. leases | **2.57x** | 11,993.1 ÷ 4,657.9 [01 §5] |
| Net debt / EBITDA — ex-lease | 0.80x | 3,743.6 ÷ 4,657.9 [01 §5] |
| EBITDA / interest — total finance cost (incl. lease interest) | **2.64x** | 4,657.9 ÷ 1,765.7 [04 §1] |
| EBITDA / interest — cash bank interest only (ex-lease, ~₹970 Mn proxy) | ~4.8x | 4,657.9 ÷ ~970 [04 §1, flagged proxy] |
| EBIT / interest (incl. lease interest) | 1.40x | 2,466.1 ÷ 1,765.7 [04 §1] |
| Tightest *disclosed/quantified* constraint | Internal 2.5x ex-lease net-leverage ceiling (not a lender covenant) | 04 §3; Q4/FY26 transcript |
| Tightest *assumed* lender covenant (labeled assumption) | Min interest coverage 2.0x (lease-inclusive) | 04 §3 (labeled assumption — not assessable for scoring) |
| Next-12m obligations — hard (overdraft rolled), ex-Vizag, ex-growth capex | ~₹4,338 Mn | 03 §3 (term principal ~917 + lease principal 649.7 + cash interest ~1,582 + maint capex 1,189) |
| Next-12m obligations — conservative (full overdraft repaid), ex-Vizag, ex-growth capex | ~₹6,533 Mn | 03 §2–3 |
| Committed liquidity (cash only) | ₹5,360.5 Mn | 03 §1 (revolver/cash-credit availability undisclosed → excluded; ~₹287 Mn margin money restricted → excluded) |
| Floating-rate debt (gross) | ~₹8,740 Mn (~96% of ₹9,104.1 Mn borrowings) | 01 §1, §7; 02 §3 |
| Hedge coverage (if any) | None located in the pool — floating exposure appears largely unhedged | 02 §3; 00_triage §3 |
| Working-capital seasonality / peak build | Not materially seasonal (each quarter ~24–26% of revenue); structural WC drain already inside CFO; no separately disclosed peak-quarter build | 03 §3 (Seasonality Hard Check); earnings/06 §3 |

**Currency / EBITDA basis:** INR million, consolidated, Ind AS, post-Ind AS 116. Reported EBITDA is the default base; the cash-backed cross-check (CFO/EBITDA 74.5%) holds [earnings/06 §1].

**Cycle-depth calibration (per 10_external-dependency).** HCG is **"partly externally driven"** (external-dependency score 45/100, inverted) — oncology demand is largely **non-discretionary and not cyclical-consumer**, so a deep volume-led EBITDA collapse is less likely than for a discretionary or commodity name [10 §3–4]. There is **no commodity cyclicality** (drugs/consumables are regulated-price sourced goods, not exchange-traded) and **no industrial/weather cycle** [10 §1]. The genuine downside drivers are **margin, not volume**: (i) DPCO drug-price control / margin caps compressing the 27%-of-revenue consumables spread (the single biggest margin driver, a structural Headwind [earnings/03 §8]); (ii) a rising government-scheme payer share (≈33% of revenue, price-taker work) diluting realisation [earnings/03 §5]; (iii) state-scheme collection disruption (e.g. the Q3FY26 Andhra Pradesh event) draining cash via receivables [earnings/06 §3, §10]. Because HCG is **not a deep cyclical**, the −30/−40/−60% haircuts below already span more than its own demand history would suggest; the −40%/−60% cases are therefore best read as a **margin-and-collections shock** (DPCO + payer-mix + bad-debt), not a volume cliff. A separate history-calibrated trough scenario is not warranted (and a clean EBITDA trough-to-peak history is not in the pool — FY23–FY26 EBITDA rose every year, ₹2,987→₹4,658 Mn [earnings/06 §1]); the standard haircuts bound the realistic downside.

---

## 2. Stress Scenarios

EBITDA haircuts applied to the ₹4,657.9 Mn base. **Leverage and coverage** lines hold net debt and total finance cost constant at the haircut snapshot (the standard point-in-time covenant test). The **12-month liquidity gap** is modeled dynamically: internal cash generation falls with EBITDA (CFO scaled at the 74.5% conversion ratio [earnings/06 §1]); maintenance capex is held flat (hospitals must keep maintaining); the on-demand working-capital overdraft (~₹2.8 Bn) is **assumed rolled** in the EBITDA-haircut columns (its normal behaviour, but availability is undisclosed [03 §1]); the ₹1,543 Mn Vizag deferred consideration (paid Apr-2026, inside the FY27 window [05 §1]) is included as a real first-half cash call. Liquidity gap = 12-month uses − (opening cash ₹5,360.5 Mn + scaled CFO); positive = shortfall. Coverage uses the **lease-inclusive** total finance cost as the conservative anchor.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (₹ Mn) | 4,658 | 3,261 | 2,795 | 1,863 | 2,795 | 2,795 |
| Net debt / EBITDA — incl. leases | 2.57x | 3.68x | 4.29x | 6.44x | 4.29x | 4.29x |
| Net debt / EBITDA — ex-lease | 0.80x | 1.15x | 1.34x | 2.01x | 1.34x | 1.34x |
| EBITDA / interest (lease-incl total) | 2.64x | 1.85x | 1.58x | 1.06x | 1.58x | 1.44x |
| EBITDA / interest (cash bank interest, ~₹970 Mn proxy) | 4.80x | 3.36x | 2.88x | 1.92x | 2.88x | 2.44x |
| Tightest covenant headroom — assumed 2.0x coverage (lease-incl)¹ | +32% | −8% | −21% | −47% | −21% | −28% |
| Covenant breach? — assumed 2.0x coverage (lease-incl)¹ | No | **YES** | **YES** | **YES** | **YES** | **YES** |
| Covenant breach? — assumed 3.5x leverage (incl. lease)¹ | No | **YES** | **YES** | **YES** | **YES** | **YES** |
| Covenant breach? — internal 2.5x ex-lease ceiling | No | No | No | No | No | No |
| 12-month liquidity gap (overdraft rolled, incl Vizag) | −2,951 (surplus) | −1,910 (surplus) | −1,562 (surplus) | −868 (surplus) | −290 (surplus) | −1,387 (surplus) |
| Cash runway vs net burn (months) | ~27 | ~19 | ~17 | ~14 | ~13 | ~16 |
| Survives without external action? | Yes | **Liquidity yes; assumed covenant no** | **Liquidity yes; assumed covenant no** | **Liquidity yes; assumed covenant no** | **Liquidity yes (thin); assumed covenant no** | **Liquidity yes; assumed covenant no** |

¹ **Indicative only — no lender covenant is disclosed [04 §2].** Headroom signed so positive = headroom remaining; computed as (threshold − actual) ÷ threshold on the coverage line. The "internal 2.5x ex-lease" line is a management discipline, not a lender test. The assumed-covenant breaches are the floor a real bilateral-loan covenant *could* sit at; they are not a confirmed contractual trip.

**Working-capital shock — basis (labeled assumption).** No seasonal peak build is disclosed [03 §3]. The WC-shock column adds an **incremental cash outflow of ₹1,272 Mn = 5% of ~₹25,450 Mn FY26 revenue** (a labeled assumption sized to a plausible state-scheme collection-cycle stall on top of the structural drain already inside CFO; e.g. an Andhra-Pradesh-style disruption scaled up [earnings/06 §3]). Even with this, the rolled-overdraft 12-month position stays in a thin surplus (gap −₹290 Mn).

**Rate shock — basis.** ~96% of borrowings float and are largely unhedged [01 §7; 02 §3]. A **+200 bps shock on the floating book ≈ −₹175 Mn pre-tax** (midpoint of 02's −₹170 to −₹180 Mn full-book estimate), ~3.8% of base EBITDA [02 §3]. It cuts lease-inclusive coverage from 1.58x to 1.44x at −40% but does **not** by itself open a liquidity gap (rolled-overdraft gap −₹1,387 Mn surplus). Direction note: 02 finds the near-term *repricing* risk is actually downward (RBI repo at 5.25% vs ~6.5% when most loans were struck), so +200 bps is a genuine adverse shock, not the base path.

---

## 3. Break Points

Net debt and finance cost held constant; the EBITDA decline that first triggers each event. Coverage break points are **indicative** (no lender covenant disclosed). Liquidity break points are solved dynamically (CFO scaled at 74.5% conversion; maintenance capex flat; Vizag ₹1,543 Mn included).

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| **Assumed 2.0x interest coverage breaches** (lease-incl total finance cost) — *the first thing to break* | **≈ −24%** (EBITDA to ~₹3,531 Mn) |
| Assumed 3.5x net leverage breaches (incl. lease) | ≈ −26% (EBITDA to ~₹3,427 Mn) |
| Assumed 2.0x interest coverage breaches (if covenant tested on cash bank interest ~₹970 Mn, not lease-incl) | ≈ −58% (EBITDA to ~₹1,940 Mn) |
| Committed liquidity exhausted within 12 months — **overdraft rolled** (incl Vizag) | ≈ −85% (EBITDA to ~₹698 Mn) — i.e. effectively does not break on EBITDA alone |
| Committed liquidity exhausted within 12 months — **market closure / overdraft repaid** (incl Vizag) | **≈ −22%** (EBITDA to ~₹3,644 Mn) — driven by the ₹2.8 Bn overdraft repayment + ₹1,543 Mn Vizag, **not** by the EBITDA decline |
| Committed liquidity exhausted within 12 months — market closure / overdraft repaid, **ex-Vizag** | ≈ −66% (EBITDA to ~₹1,573 Mn) |
| Internal 2.5x ex-lease net-leverage ceiling breaches (management discipline, not a lender test) | ≈ −68% (EBITDA to ~₹1,497 Mn) |
| Net leverage exceeds 6x — **incl. leases** (typical stressed-refi threshold) | ≈ −57% (EBITDA to ~₹1,999 Mn) |
| Net leverage exceeds 6x — **ex-lease** | ≈ −87% (EBITDA to ~₹624 Mn) |

**Reading the break points.** Two different things break at two very different depths, and *which covenant exists* decides the answer:

1. **If the bilateral bank loans carry a typical ~2.0x lease-inclusive interest-coverage covenant** (assumed — not disclosed), it trips at only **~−24% EBITDA**, shallower than a −30% recession. That is the binding constraint and it sits *inside* the standard stress range. But it is a labeled assumption; the pool shows no such covenant [04 §2].
2. **Liquidity, by contrast, is hard to break on earnings alone.** As long as the ~₹2.8 Bn on-demand overdraft rolls (its normal behaviour), committed cash + scaled CFO covers 12-month uses down to a **−85% EBITDA decline** — i.e. liquidity is not the constraint in any realistic earnings downside. Liquidity only breaks at **~−22%** in the **market-closure case where the overdraft is *also* pulled** and the ₹1,543 Mn Vizag payment lands in the same window — and even then the trigger is the **₹2.8 Bn overdraft repayment, not the EBITDA fall** (ex-Vizag the break moves out to ~−66%).

So the **first thing to break is an (assumed) coverage covenant at ~−24%**; the next real cliff is **the on-demand overdraft being called** (a counterparty action, not an earnings event), which would open a ~₹0.6–1.3 Bn 12-month gap in a −40% to −60% downside.

---

## 4. Survival Read

**Market-closure test (no new unsecured issuance for 12 months).** HCG carries **₹5,360.5 Mn cash** (raised in the Q4 FY26 ₹4,250 Mn rights issue) against hard 12-month uses, has **no bonds, no ECB, and no near-term unsecured bullet** to refinance, and generates ~₹2.3 Bn/yr of maintenance-capex-adjusted operating cash [01 §7; 03 §3–4]. **Liquidity holds through a −40% EBITDA decline with the markets shut, provided the ~₹2.8 Bn on-demand secured working-capital overdraft is not called.** If that overdraft *is* pulled at the same time (its availability is undisclosed [03 §1]), a 12-month gap opens — ~₹0.6 Bn at −40%, ~₹1.3 Bn at −60% (incl. the ₹1,543 Mn Vizag payment) — and the overdraft repayment, not the EBITDA fall, is what breaks the position. **The first thing to break is therefore the working-capital line (a counterparty/refinancing action); after that, an assumed coverage covenant.**

**Where the structure first breaks, and what it would need.** On the conservative lease-inclusive basis, the structure first breaks at **~−24% EBITDA** *if* a typical bilateral-loan interest-coverage covenant (assumed 2.0x) exists — shallower than a normal recession — and the company would need a **covenant waiver or amendment** (no equity or asset sale required to *survive* at that depth, since liquidity is intact). Because no lender covenant is actually disclosed, this is the single biggest unknown: there is no visible early-warning trigger, but the bilateral loans almost certainly carry covenants this analysis cannot see [04 §2, §4]. If the constraint is instead measured on cash bank interest (~4.8x today), the coverage break moves out to **~−58%**.

**Is a 30–40% decline survivable on its own?** **On liquidity, yes** — even a −60% EBITDA year leaves ~14 months of cash runway with the overdraft rolled, and the −30%/−40% cases sit in a ₹1.5–1.9 Bn 12-month surplus [§2–3]. The optional levers (none required for survival, but available) are real: a **₹4,250 Mn rights issue was just executed**, KKR is in sole control with an internal 2.5x ex-lease leverage ceiling and ~68% headroom to it [01 §6], discretionary growth capex (~₹1.7 Bn/yr) can be paused, and a signed Milann divestment brings ~₹282 Mn upfront [02 §4]. **On a covenant basis, a −30%/−40% decline is *not* clean** against the assumed 2.0x coverage test (breaches at ~−24%) and would require a waiver — but that depends on a covenant the pool cannot confirm exists. The honest verdict: **liquidity survives a 30–60% EBITDA decline so long as the secured overdraft keeps rolling; the genuine break risks are (1) that overdraft being pulled and (2) an undisclosed lender coverage covenant tripping near −24%** — both of which sit outside what the EBITDA haircut alone controls.

---

### Self-Check
- Three EBITDA haircuts run (−30/−40/−60%); cyclical-history scenario assessed and **not warranted** — HCG is "partly externally driven," non-cyclical demand, no commodity cycle, and FY23–FY26 EBITDA rose every year (no trough in the pool); the standard haircuts already over-span the demand downside [10 §3–4; earnings/06 §1]. WC-shock and rate-shock columns added. ✓
- Each scenario recomputes net leverage (incl. + ex-lease), coverage (lease-incl + cash-interest), covenant headroom (assumed + internal, breach Y/N), and the 12-month liquidity gap. ✓
- Base EBITDA is cash-backed (CFO/EBITDA 74.5%, cross-checked vs earnings/06; adjusted-vs-reported gap only +1.15%) — Reported EBITDA used, not headline adjusted. ✓
- Break points solved explicitly: assumed coverage breach ~−24%; assumed 3.5x leverage ~−26%; liquidity exhaustion ~−85% (overdraft rolled) / ~−22% (market closure, overdraft repaid, incl Vizag); internal 2.5x ceiling ~−68%; 6x incl-lease at ~−57%. ✓
- Each scenario states whether survival needs external action (waiver for the assumed covenant; no equity/asset sale needed to survive on liquidity unless the overdraft is pulled). ✓
- No probability assigned to the downside — left to the master synthesizer. ✓
- EBITDA base exists → stress run (downside resilience assessable). Partial-data cap propagated: **no lender covenant disclosed → covenant headroom "Not assessable" for scoring; all covenant breach points indicative** [04 §2; MODULE_RULES]. Revolver availability undisclosed → overdraft excluded from committed liquidity and the market-closure case treats it as repayable [03 §1]. ✓
- No banned phrases (every coverage, headroom, runway and leverage figure is stated as a number). ✓
