# Downside Stress Test — EMAR

*Emaar Properties PJSC (DFM: EMAAR) — Dubai / UAE real-estate developer. Reporting standard **IFRS**; reporting currency **AED (UAE dirham), millions** unless stated; fiscal year ends **31 December**. Stress base = **Q1-2026 balance sheet (31 Mar 2026)** paired with **LTM-to-31-Mar-2026** income and cash flow. The dirham is pegged to the US dollar at **AED 3.6725/USD**, so the group's USD sukuk carry no real dirham FX risk. Filings are in English — no translation gap.*

*Plain-English note (first use): **EBITDA** = rough operating cash profit before interest, tax and depreciation; a **haircut** = an assumed fall in EBITDA (a −40% haircut means EBITDA drops 40%); **net debt** = borrowings minus cash (the strict §15 basis); **net cash** = the same figure when cash exceeds debt; **covenant** = a promise to lenders (e.g. keep leverage below a limit) that, if broken, lets them demand repayment; **covenant headroom** = the signed distance from the limit (positive = room to spare); **coverage** = how many times EBITDA covers the interest bill; **liquidity gap** = 12-month cash uses minus cash sources (negative = a surplus); **break point** = the EBITDA fall at which the structure first breaks.*

**Every stressed figure and every break-point solve below was produced by an executed Python snippet (command + printed result shown in this agent's working log), not by hand [fix F09].** The base numbers are consumed verbatim from `01`–`05`; this agent does not re-derive them.

**Pending-acquisition (pro-forma) check — does NOT trigger.** There is no pending debt-, cash-, or mixed-funded acquisition sitting off the reported balance sheet. Emaar's growth engine is organic mega-development (the AED 200bn masterplan announced Jun-2026 is a capital *commitment* funded by customer presales and operating cash — already inside the AED 35.5bn commitment book in `05`, not an M&A purchase); the one large recent deal, Dubai Creek Harbour (AED 7.5bn, half cash / half shares, Aug-2022), is long since consolidated; and the May-2026 ~29.7% ownership transfer (ICD → Emirates Power Investment) is a share transfer *between government entities* that changes neither Emaar's debt nor its EBITDA [business-model/11 §1]. So the stress base is the **actual** Q1-2026 balance sheet, not a pro-forma one.

**EBITDA basis (cash-backed, cross-checked vs `earnings/06`).** The base is **CIQ standardized / reported-IFRS EBITDA** of **AED 25,200.7m** (LTM), the conservative spine — Emaar's own non-IFRS EBITDA is ~AED 1.0–1.5bn *higher* (it folds in net finance income), so using it would flatter the stress [`01` §5]. It is genuinely cash-backed: `earnings/06` scores earnings quality **81/100** and shows normalised CFO/EBITDA of **91–159% across five years (94% LTM)** even after stripping the customer-advance tailwind — the item `earnings/06` flags as overstated is *reported FCF*, **not** EBITDA [earnings/06 §2, §9]. **This EBITDA is a Dubai property-cycle PEAK, not a run-rate** — 2025 was Dubai's strongest year on record and consensus long-term growth is **−14.8%** [business-model/10 §3; ciq_facts]. So the stress is run against both the peak LTM figure and, as a cyclical cross-check, the **mid-cycle / normalised EBITDA of AED 14,647m** (5-yr avg FY2021–25) [`01` §5].

---

## 1. Base Case (today)

Currency **AED millions**, at 31 Mar 2026 (LTM income). EBITDA basis = CIQ standardized (reported-IFRS), cash-backed, peak-cycle.

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | **25,200.7** (peak/latest) · mid-cycle normalised **14,647** | `01` §5; earnings/06 §9; ciq_facts ltm_ebitda 25,200.7 |
| Net debt | net **CASH 2,115.1** (strict, canonical §15) · net **CASH 24,969.2** (broad) | `01` §4, §7 |
| Net debt / EBITDA | **−0.08x** strict (net cash) · **−0.99x** broad | `01` §5; ciq_facts −0.99x |
| EBITDA / interest | **52.1x** (gross borrowing interest 483.5) · **24.5x** on total finance costs 1,028.1 | `04` §1; ciq_facts 52.1x |
| Tightest covenant + threshold | Lender thresholds **UNDISCLOSED** → labelled assumptions: **max net leverage 3.5x** (tightest by today's headroom) + **min interest cover 3.0x**. Only disclosed quantified limit = **Board gearing policy < 50%** (actual −188%). Breach points **indicative**. | `04` §2–§3 |
| Next-12m obligations (hard / non-discretionary) | **5,860.2** = debt maturities 3,776.2 + cash interest 1,093 + maintenance capex 991. Only capital-markets bullet = **Sukuk 3 AED 2,752.6m, due 15 Sep 2026** (3.64%). *IFRS current-portion maturities basis 5,314.6.* | `02` §1–2; `03` §2 |
| — plus discretionary dividend (cuttable) | **8,838.8** (AED 1.00/share; ~50% of earnings) — not a hard call | `03` §2; business-model/11 §1 |
| Committed liquidity | **16,199.5** conservative (free cash 12,179.5 + trading 350.7 + committed revolver availability 3,669.3) · **38,702.9** broad. RERA escrow **43,338.5 excluded** (restricted). **No** min-liquidity covenant to subtract. | `03` §1 |
| Floating-rate debt (gross) | **1,069.9** (10.1% of gross debt) | `01` §1; `02` §3 |
| Hedge coverage (if any) | **None disclosed** — floating exposure is small (a +200bp move reprices ~AED 21m of interest) | `02` §3 |
| Working-capital seasonality / peak build | **Negative operating working capital** — customer advances (AED 40.7bn) fund the build, so there is **no seasonal inventory-build cash drain**. Q4 takes ~32–33% of revenue; the one dated call (Sukuk 3) falls in Q3. Peak intra-year WC need not separately disclosed. | `03` §3; earnings/06 §3 |

Reporting currency **AED**; EBITDA basis **CIQ standardized / reported-IFRS** (cash-backed), cycle position **peak / latest**.

---

## 2. Stress Scenarios

EBITDA haircuts applied to the AED 25,200.7m peak base. The **−69%** column is the **deep-cyclical history calibration** required for a cyclical name — it takes EBITDA down to **AED ~7,812m**, i.e. Emaar's own **FY2021 trough** (AED 7,803m, the tail of the 2015–19 down-cycle + COVID), a peak-to-trough fall of 69% inside the company's own 5-year record [earnings/01 §1; business-model/10 §3]. Net debt is held at the strict canonical basis (net cash 2,115.1) and moves only in the WC-shock column, which drains cash. Sign convention: net leverage negative = net cash; liquidity gap negative = **surplus**.

| Metric | Base | −30% | −40% | −60% | −69% (FY21 trough) | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|---:|
| EBITDA (AED m) | 25,201 | 17,640 | 15,120 | 10,080 | 7,812 | 15,120 | 15,120 |
| Net debt / EBITDA — strict (canonical) | −0.08x | −0.12x | −0.14x | −0.21x | −0.27x | **+0.41x** | −0.14x |
| Gross debt / EBITDA (memo) | 0.40x | 0.57x | 0.67x | 1.00x | 1.29x | 0.67x | 0.67x |
| EBITDA / interest | 52.1x | 36.5x | 31.3x | 20.8x | 16.2x | 31.3x | 29.9x |
| Assumed min interest-cover (3.0x) headroom | +1,637% | +1,116% | +942% | +595% | +439% | +942% | +898% |
| Covenant breach? (3.5x max net-lev OR 3.0x min cover) | N | N | N | N | N | N | N |
| 12-month liquidity gap (uses − committed liquidity, zero operating cash) | −10,339 | −10,339 | −10,339 | −10,339 | −10,339 | **−1,992** | −10,318 |
| Survives without external action? | Y | Y | Y | Y | Y | Y | Y |

**How to read the rows.**
- **Net leverage stays net cash on the strict basis at every pure EBITDA haircut** (net debt is a balance-sheet figure; an EBITDA fall does not create debt), so gross leverage rises only to ~1.0x at −60% and ~1.3x at the −69% trough, and coverage never drops below **16.2x** even at the FY2021-trough haircut — versus an assumed 3.0x floor.
- **The liquidity-gap row is shown on the most conservative basis on purpose** — committed liquidity against hard obligations with **zero operating cash counted**, isolating in-hand liquidity from must-materialise FCF (per `03`'s finding that debt service is already-in-hand). It is the same −10,339 surplus across the pure haircuts *because in-hand liquidity, not EBITDA, pre-funds the hard obligations*: AED 16,199.5m committed liquidity covers the AED 5,860.2m of non-discretionary calls **2.76x** regardless of EBITDA. Adding stressed operating FCF widens the surplus to **AED ~16–33bn** at every haircut.
- **WC-shock column (labelled assumption):** on top of −40% EBITDA, the ~AED 8,347m LTM customer-advance build fully **reverses** (Dubai off-plan sales slow, buyers stop new instalments and some refunds occur) — a one-time cash drain. It flips the strict basis to a small **net debt of +0.41x** and cuts committed liquidity to AED 7,852.5m, yet that still covers the AED 5,860.2m of hard obligations (a −1,992 surplus) with no covenant breach. This is the harshest liquidity scenario and Emaar still needs no external action.
- **Rate-shock column:** +200bp on the AED 1,069.9m floating book adds only ~**AED 21m/yr** of interest (coverage 31.3x → 29.9x). Because the group holds ~AED 35bn of cash and investments that **earn more** at higher rates, the move is on balance a net *benefit* to finance income, not a drag [`02` §3] — shown as a shock for completeness, but it is not a downside for Emaar.

*(Floating exposure is material enough to compute but small in effect; working-capital data exists and drives the WC column — neither shock is "not applicable" here.)*

---

## 3. Break Points

The EBITDA decline `h` (stressed EBITDA = 25,200.7·(1−`h`)) at which each item first breaks. Direction-aware per `04` / MODULE_RULES: **MAX/ceiling** `h = 1 − debt ÷ (T·EBITDA)`; **MIN/floor coverage** `h = 1 − (T·interest) ÷ EBITDA`. `h ≥ 1` means the break point is **not reached on an EBITDA decline alone** (the net-cash / net-creditor case).

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches — assumed **min interest cover 3.0x** (MIN) | **−94.2%** (on gross interest) · −87.8% (on total finance costs) |
| Assumed **max net-leverage 3.5x** (MAX, strict net cash) | **Not reached on EBITDA decline alone** (net cash) — indicative gross-debt version breaches at −88.6% |
| Committed liquidity exhausted within 12 months | **Not reached on any EBITDA decline alone** (`h`=1.50); even at EBITDA = 0, liquidity covers hard obligations 2.76x |
| Net leverage exceeds **6.0x** (refi-market threshold) | **Not reached on EBITDA decline alone** (strict net cash) — gross-debt version reaches 6.0x only at −93.3% |

**Executed solves (command + result in the working log):**
- Coverage (MIN 3.0x, gross interest 483.5): `h = 1 − (3.0 × 483.5) / 25,200.7 = 0.9424` → **−94.2%**. On the broadest interest (total finance costs 1,028.1): `h = 1 − (3.0 × 1,028.1) / 25,200.7 = 0.8776` → **−87.8%**.
- Net-leverage covenant (MAX 3.5x, strict net debt −2,115.1): `h = 1 − (−2,115.1) / (3.5 × 25,200.7) = 1.024` → **`h > 1`, does not breach on an EBITDA decline alone** (net cash makes the ratio negative). Indicative **gross**-debt version: `h = 1 − 10,064.4 / (3.5 × 25,200.7) = 0.8859` → −88.6% (shown because a cash-rich borrower breaches a gross- or secured-debt covenant far earlier than a net-debt one — even so, −89%).
- Liquidity exhaustion (non-discretionary uses, conservative committed liquidity, stressed FCF scaled after-tax): solve `16,199.5 + [22,635 − 25,200.7·h·(1−0.13)] = 5,860.2` → `h = (16,199.5 + 22,635 − 5,860.2) / 21,924.6 = 1.504` → **`h > 1`, not exhausted on any EBITDA decline alone.** *Scaling stated:* lost EBITDA drops through to FCF at the after-tax operating rate (tax 13%, FY2025 effective rate per earnings/03), holding cash interest and maintenance capex fixed; the conservative normalised operating FCF (AED 22,635m, ex advance build) is the base. Cross-check: even at EBITDA = 0, committed liquidity (16,199.5) covers the AED 5,860.2m of hard obligations **2.76x**. Only if the entire discretionary AED 8.8bn dividend is paid *and* operations generate zero cash for a full year does the runway shorten to ~13.2 months — and the dividend is cuttable [`03` §3].
- Net-leverage 6.0x refi threshold (strict net debt): `h = 1 − (−2,115.1) / (6.0 × 25,200.7) = 1.014` → **`h > 1`, not reached** (net cash); gross-debt version `h = 1 − 10,064.4 / (6.0 × 25,200.7) = 0.9334` → −93.3%.

*Mid-cycle cross-check:* even running the −40% haircut off the **normalised** EBITDA of AED 14,647m (i.e. EBITDA of AED 8,788m, a 65% fall from the LTM peak), gross leverage is 1.15x, the strict basis is still net cash (−0.14x on the normalised base), and coverage is 18.2x — the survival read does not depend on peak earnings.

---

## 4. Survival Read

**Emaar survives all four EBITDA haircuts — −30%, −40%, −60%, and the −69% FY2021-trough calibration — with no covenant breach and no 12-month liquidity gap, needing no equity raise, no distressed asset sale, and no covenant waiver.** The first thing that could break is the *assumed* 3.0x interest-cover covenant, and only at a **−94% EBITDA collapse** (−88% on the broadest interest definition) — deeper than the company's own worst observed cycle; the assumed net-leverage covenant and committed liquidity are **not reached on an EBITDA decline alone** because the group is net cash and holds committed liquidity of AED 16.2bn against just AED 5.9bn of hard 12-month obligations. A normal recession — a 30–40% EBITDA decline — is therefore survivable on its own with wide room to spare (coverage still 31–37x, gross leverage still ~0.6–0.7x, hard obligations pre-funded by in-hand cash 2.76x). The only scenario that even nudges the balance sheet into net debt is the working-capital shock (the ~AED 8.3bn customer-advance build fully reversing on a Dubai off-plan downturn), and even then leverage is +0.41x and liquidity still covers hard calls — the real cyclical pressure point is the discretionary AED 8.8bn dividend, which is cut long before debt service is ever at risk.

**Market-closure test (12 months, no new unsecured issuance):** Emaar clears it comfortably — the only material bullet in the window, Sukuk 3 (AED 2,752.6m, 15 Sep 2026), is covered **4.4x by free unrestricted cash alone** (AED 12,179.5m) before any FCF, the ~AED 3,669m undrawn committed revolver, or the ~AED 22.5bn short-term-investment pool; nothing breaks and no refinancing is required [`02` §4–5; `03` §4].

**Net-cash read (MODULE_RULES core principle 8 / CLAUDE.md §24, Filter 3):** Emaar is net cash on **both** §15 bases — strict net cash AED 2,115.1m and broad net cash AED 24,969.2m — and survives every haircut with zero covenant breach and zero liquidity gap. This is the strongest survival outcome the module recognises. The net cash is **strategic optionality, not idle capital**: it is counter-cyclical capacity — dry powder to hold land and staff, keep launching, and buy assets cheap precisely when the Dubai property cycle turns — and it removes refinancing dependence entirely. It is not marked down as a "lazy" or under-levered balance sheet, and this agent makes no add-debt-to-optimise argument. *(No probability is assigned to the downside and no rating is issued — those belong to the master synthesizer; this report produces the survival levels only.)*
