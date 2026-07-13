# Price & Capital Structure — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**Jurisdiction / regime:** United Arab Emirates, listed on the Dubai Financial Market (DFM). **Reporting standard:** IFRS. **Reporting currency:** AED (UAE dirham). **Fiscal year:** ends 31 December. **FX peg:** the AED is hard-pegged to the US dollar at **3.6725 AED/USD** (UAE central-bank peg in place since 1997), so AED↔USD conversion carries negligible currency risk; the peg is used throughout and dated to the price date where a conversion is made.

Plain-English glossary (first use): **market cap** = share count × price (what the equity is worth at today's price); **enterprise value (EV)** = what you'd pay for the whole business — market cap plus debt and minority stakes, minus cash; **net debt / net cash** = total borrowings minus cash (negative = the company holds more cash than debt); **minority (non-controlling) interest** = the slice of consolidated subsidiaries owned by outside shareholders, not by Emaar; **book value** = accounting net worth of the equity; **tangible book value** = book value stripped of goodwill/intangibles; **EBITDA** = rough proxy for operating cash profit before interest, tax and depreciation (used here only for a leverage ratio, not for valuation).

**Cross-module inputs used:** `earnings/01_historical-financials.md` (net-debt bases, share count, escrow treatment) and the deterministic facts sidecar `_pool_extracts/ciq_facts.json` (pinned: net debt, total debt, LTM EBITDA, shares, price). Business-model and management-governance files exist in the run root but are not required for this anchor; the ownership/misaligned-owner read is left to the valuation synthesizer.

**Business-type note (method-validity flag for downstream, not a valuation call):** Emaar is a **hybrid real-estate business** — ~80% of FY2025 revenue is build-to-sell property development (operating-company-like; the EV bridge is meaningful), ~15% leasing/retail (malls) and ~5% hospitality (recurring-income, REIT-like; downstream `04`/`06` may value these on an asset/NAV basis, for which the EV bridge is informational per the Business-Type Method Map). This agent builds the full EV bridge and flags the split; it makes no valuation judgment.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | **AED 12.20** ( = US$3.32 × 3.6725 peg) | CIQ Comps → Financial Data, "Day Close Price Latest" (subject row), price quoted in USD | 2026-06-28 |
| Currency | AED (native DFM trading currency); source figure quoted in USD | — | — |
| Price basis | Last close (day-close, latest) | CIQ Comps "Day Close Price Latest" | 2026-06-28 |

**Price-state: `pool-verified`.** The price is from a pool source (CIQ Comps export) and the export explicitly timestamps the quote (`As-Of Date: 2026-06-28`) — this is the quote's own as-of date, not merely a file-download date, so the vendor-export-freshness ambiguity does not apply. No web quote was needed or used.

**Currency note (important for downstream):** the CIQ Comps sheet is USD-normalized (it states "Currency: US Dollar", "Values converted at today's spot rate"), so it reports Emaar at **US$3.32**. Emaar actually trades on the DFM in **AED**, and the company reports, the consensus target (AED 17.07), and book value (AED 10.16) are all in AED. I therefore make **AED the canonical currency** and convert the price at the 3.6725 peg: US$3.32 → **AED 12.20**. Cross-check: CIQ's own comps market cap of US$29,358.4m ÷ 8,838.8m shares = US$3.3216, i.e. AED 12.20 — internally consistent.

**Two pool prices exist — I anchor on the fresher one.** A second pool source, the CIQ Financials_Quarterly "Current Capitalization" (Key-Stats) block, shows a **native AED 13.02** share price. That workbook was pulled ~2026-06-20 (no explicit quote date in the block); the Comps price is explicitly as-of 2026-06-28. The ~6.4% gap (AED 13.02 → AED 12.20) is **eight days of price movement, not a data conflict** — the stock fell that week. The freshest dated pool price (AED 12.20, 2026-06-28) is the anchor; the older AED 13.02 is shown for transparency in §3–§4.

**Staleness caveat (data-quality, not a no-price trigger):** the anchor price is 12 days old relative to the report date (2026-07-10). Downstream trailing multiples and margin-of-safety inherit that small staleness. Price-state remains `pool-verified` (§ Score-Cap rules: staleness is a data-quality caveat, not the no-price cap).

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of 2026-06-28) | 8,838.789849m | CIQ Comps "Shares Outstanding Latest"; ties to CIQ Financials_Quarterly BS "Total Shares Out. on Filing Date" [Q1 Mar-31-2026] |
| Diluted weighted-average shares (LTM/FY) | 8,838.789849m (basic = diluted) | CIQ Financials_Quarterly, EPS basic & diluted identical; earnings/01 confirms FY25 & LTM basic = diluted |
| Options/RSUs count | None disclosed / immaterial | No option or RSU dilution reported; basic EPS = diluted EPS every period |
| Convertibles / potential shares | None | Debt is revolver + term loans + senior unsecured bonds + leases; no convertibles in the capital-structure detail |
| Treasury stock | None (AED 0) | CIQ Financials_Quarterly BS "Treasury Stock" = nil [Q1 Mar-31-2026] |
| **Fully diluted shares (TSM + if-converted)** | **8,838.789849m** | = basic; no dilutive instruments to add |
| Share count used for market cap | 8,838.789849m | most recent "as-of" count (Fully Diluted Equity Rule 1) |
| Share count used for per-share fair value | 8,838.789849m | fully diluted = basic; no limitation (Fully Diluted Equity Rule 2) |

**Share Count Reconciliation Table**

| Step | Shares (m) | Note |
|---|---:|---|
| Basic shares outstanding | 8,838.789849 | Par value AED 1.00/share (Common Stock AED 8,838.79m ÷ 8,838.79m = AED 1.00) |
| + Options / RSUs (TSM) | 0.000 | none disclosed |
| + Convertibles (if-converted) | 0.000 | none |
| **= Fully diluted shares used** | **8,838.789849** | used for BOTH market cap and per-share fair value |

No material gap between basic and fully diluted — Emaar reports identical basic and diluted EPS, has no treasury stock, no options/RSU overhang, and no convertibles. The single count of **8,838.8m** is used everywhere. (Historical note, not an adjustment: the count stepped up from 8,179.7m to 8,838.8m in Q4-2022 and has been stable since; the current count is the relevant anchor.)

---

## 3. Market Capitalization

`Market cap = fully diluted shares × current price`

- **AED basis (canonical):** 8,838.789849m × AED 12.20 = **≈ AED 107,818m (≈ AED 107.8bn)**
  (equivalently, CIQ Comps market cap US$29,358.4m × 3.6725 = AED 107,818m)
- **USD basis (source):** **US$29,358.4m (≈ US$29.4bn)** [CIQ Comps "Market Capitalization Latest", as-of 2026-06-28]

Cross-reference (older pool snapshot, ~2026-06-20): at the native AED 13.02 Key-Stats price, market cap = 8,838.8m × AED 13.02 = **AED 115,081m** [CIQ Financials_Quarterly Key-Stats "Current Capitalization"]. The AED 7,263m difference vs the canonical figure is entirely the eight-day price decline (AED 13.02 → AED 12.20), not a share-count or definitional change.

---

## 4. Enterprise Value Bridge

Two cash bases are shown because they differ materially and the choice moves EV by ~AED 22.9bn (~19%). **Canonical basis = broad** (see the cash-quality box below) — it matches the deterministic facts pin (`net_debt_m −24,969.2`) and CIQ's own multiple history and peer comps, giving downstream apples-to-apples comparability. The **strict (§15-default) basis is shown alongside every time** so neither figure is presented bare. Escrow cash is excluded from **both** bases. Price/shares as-of 2026-06-28.

| Component | Broad basis (canonical), AED m | Strict basis (§15 default), AED m | Source |
|---|---:|---:|---|
| Market capitalization | 107,818 | 107,818 | §3 above (CIQ Comps, 2026-06-28) |
| + Total debt (short + long term, incl. leases) | 10,064.4 | 10,064.4 | CIQ Financials_Quarterly, Total Debt [Q1 Mar-31-2026]; = curr. LT debt 1,996.2 + LT debt 7,290.2 + leases 778.0 |
| + Minority / non-controlling interest | 13,808.3 | 13,808.3 | CIQ Financials_Quarterly BS "Minority Interest" [Q1 Mar-31-2026] |
| + Preferred equity | 0.0 | 0.0 | none (CIQ Comps LTM Pref. Equity = nil) |
| − Cash & equivalents (operating) | (12,179.5) | (12,179.5) | CIQ Financials_Quarterly BS "Cash And Equivalents" [Q1 Mar-31-2026] |
| − Short-term investments (bank term deposits) | (22,503.4) | — | CIQ BS "Short Term Investments" [Q1 Mar-31-2026] — netted in broad only |
| − Trading asset securities (mark-to-market) | (350.7) | — | CIQ BS "Trading Asset Securities" [Q1 Mar-31-2026] — netted in broad only; flagged (see box) |
| **= Enterprise value (EV)** | **≈ 96,657** | **≈ 119,511** | derived; broad ties to CIQ Comps EV |
| = EV in USD (÷ 3.6725) | **≈ US$26,320m** | ≈ US$32,543m | broad ties to CIQ Comps "Total Enterprise Value Latest" US$26,319.7m ✔ |

Arithmetic (broad): 107,818 + 10,064.4 + 13,808.3 + 0 − 35,033.6 = **96,657m AED**.
Arithmetic (strict): 107,818 + 10,064.4 + 13,808.3 + 0 − 12,179.5 = **119,511m AED**.
The AED 22,854m gap between the two = short-term deposits 22,503.4 + trading securities 350.7. The broad EV of AED 96,657m reconciles to CIQ's independently-computed comps EV of US$26,319.7m (× 3.6725 = AED 96,659m) — a clean tie-out.

> **Cash quality — what is and is not netted (this is the single biggest capital-structure judgment for EMAR).**
> Emaar's balance sheet carries four distinct "cash-like" buckets at Q1 Mar-31-2026; they are NOT interchangeable:
> - **Operating cash & equivalents — AED 12,179.5m.** Genuine unrestricted operating cash. Netted in **both** bases. ✔
> - **Short-term investments — AED 22,503.4m.** Bank **term/fixed deposits** (maturity >3 months). Unrestricted and genuinely liquid, but not "cash equivalents" in the ≤3-month sense. They are **not** a financial-subsidiary investment book, **not** restricted, and **not** mark-to-market securities — so they do not fall in the categories one excludes by default. Netted in the **broad** basis; a conservative reader who holds to the strict §15 definition excludes them (→ strict EV AED 119,511m).
> - **Trading asset securities — AED 350.7m.** These **do** carry mark-to-market P&L — the one item here in the "exclude by default" set. They are ~0.4% of EV, so immaterial; excluding just these from broad gives a "mid" net cash of AED 24,618m (vs broad 24,969m) — the difference is not decision-relevant.
> - **Restricted escrow cash — AED 43,338.5m (NOT in any base).** RERA-mandated Dubai project-escrow balances that can only fund the specific off-plan projects they belong to — **trapped**; it cannot repay debt or return to shareholders, and it is the mirror of the AED 43,689m non-current unearned-revenue (customer-advance) liability. CIQ already excludes it from "cash"; so do I, on both bases. Netting it would understate EV and flatter net debt (earnings/01 confirms the AED 43,338m is escrow). The FY2025 audited "cash and cash equivalents" of AED 52,632,912k (FY2025 Annual Report, Note 10) is a still-broader cash-flow-statement figure that folds in restricted balances — do **not** use it for the EV bridge.
>
> **Why broad is canonical here:** the AED 22.5bn of term deposits are real, unrestricted liquidity that belongs to equity holders; pinning broad also matches the facts-sidecar net-debt pin and the CIQ multiple history/peer set (all broad-basis), so downstream `02`/`03`/`04`/`06` inherit one consistent basis. The strict figure is retained as the conservative floor and shown at every appearance (§15).

**Adjustments deliberately NOT made (and why):**
- **Operating / IFRS-16 lease liabilities — already inside total debt.** CIQ's AED 10,064.4m total debt already includes AED 778.0m of lease liabilities, so no separate lease add-on is required (avoids double-counting).
- **Unearned revenue / customer advances — AED 43,689m non-current — NOT treated as debt.** These are pre-collected off-plan sale proceeds that unwind into P&L as projects complete (matched by development inventory and the escrow cash), not a financing claim repayable in cash. Adding them would double-count against the escrow already excluded.
- **Pension / end-of-service benefits — AED 210.7m — NOT added.** UAE end-of-service gratuity obligation; ~0.2% of EV, immaterial. Could be treated as a small debt-like item but is not decision-relevant.
- **Equity-method investments — AED 7,528.7m — NOT subtracted** (consistent with CIQ's EV). A purist SOTP (`06`) may value associates/JVs separately and deduct them from EV; flagged for `06`, not applied here so the anchor matches CIQ.

---

## 5. Net Debt & Leverage Snapshot

Emaar is in a **net-cash** position on every basis (it holds more cash than borrowings). Both §15 bases shown; canonical = broad.

| Metric | Broad basis (canonical) | Strict basis (§15 default) | Source |
|---|---:|---:|---|
| Total debt (incl. leases) | AED 10,064.4m | AED 10,064.4m | CIQ Financials_Quarterly, Total Debt [Q1 Mar-31-2026]; facts pin `total_debt_m 10,064.4` |
| Cash netted | AED 35,033.6m (cash + ST deposits + trading sec.) | AED 12,179.5m (cash & equivalents only) | CIQ BS [Q1 Mar-31-2026] |
| **Net debt / (net cash)** | **(AED 24,969.2m)** net cash | **(AED 2,115.1m)** net cash | broad ties to facts pin `net_debt_m −24,969.2`; strict = 10,064.4 − 12,179.5 |
| Net debt / (net cash) in USD | (US$6,799m) | (US$576m) | ÷ 3.6725; broad ties to CIQ Comps LTM Net Debt −US$6,798m ✔ |
| LTM EBITDA (CIQ standardized) | AED 25,200.7m | AED 25,200.7m | facts pin `ltm_ebitda_m 25,200.7` [LTM Mar-31-2026]; label: standardized, not company non-IFRS EBITDA |
| **Net debt / EBITDA** | **−0.99x** (≈1x EBITDA of net cash) | **−0.08x** (roughly net-flat) | broad ties to facts pin `net_debt_ebitda_x −0.99`; strict = −2,115.1 / 25,200.7 |

Reconciliation to the facts sidecar: the pinned `net_debt_m −24,969.2` is the **broad** CIQ basis; its own source_ref flags "may net short-term/liquid investments; confirm vs the strict total-debt−cash basis (§15)." I confirm: strict net cash is **AED 2,115.1m**. This is a §15 basis distinction, not a misread of the workbook — the vendor's Net Debt line is correctly −24,969.2. Both are shown. Investment-grade credit backs the low leverage: **S&P BBB+ / Moody's Baa1** (upgrades noted for 2025) [earnings/01, citing FY2025 press release]; debt is ~66% fixed-rate, weighted-average maturity ~2.5y, nearest maturity 2026-06-30, and 100% unsecured except the AED 778m of (secured) lease liabilities [CIQ Capital Structure Summary/Details, Q1 Mar-31-2026].

---

## 6. Per-Share Reference Values

Divided by the fully diluted count of 8,838.789849m. Reporting currency AED.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | **AED 10.16** | CIQ Financials_Quarterly BS "Book Value/Share" 10.157935 [Q1 Mar-31-2026] (= Total Common Equity AED 89,783.9m ÷ 8,838.8m) |
| Tangible book value per share | **AED 10.11** | CIQ BS "Tangible Book Value/Share" 10.107857 [Q1 Mar-31-2026] (= TBV AED 89,341.2m ÷ 8,838.8m; strips AED 442.6m intangibles) |
| Net cash per share — broad (canonical) | **AED 2.82** | = AED 24,969.2m ÷ 8,838.8m |
| Net cash per share — strict (§15) | **AED 0.24** | = AED 2,115.1m ÷ 8,838.8m |

For context only (no valuation judgment): canonical price AED 12.20 vs book value AED 10.16 per share. Restricted escrow cash is excluded from the net-cash-per-share figures, as in §4–§5.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Use these verbatim. Reporting currency **AED**; USD shown at the 3.6725 peg. All balance-sheet items as of Q1 **Mar-31-2026**; price/shares/market cap as of **2026-06-28**.

- **Current price:** AED 12.20 (US$3.32), last close, as-of 2026-06-28 — **pool-verified** (CIQ Comps). 12 days stale vs report date; native currency AED.
- **Fully diluted shares (market cap AND per-share fair value):** 8,838.789849m (basic = diluted; no options/converts/treasury).
- **Market cap:** ≈ AED 107,818m (US$29,358m).
- **Net cash — canonical (broad):** AED 24,969m net cash (US$6,799m); **strict (§15): AED 2,115m** net cash — state the basis every time (§15).
- **Enterprise value — canonical (broad):** ≈ AED 96,657m (US$26,320m); **strict (§15): ≈ AED 119,511m** (US$32,543m).
- **LTM EBITDA (for leverage only):** AED 25,200.7m (CIQ standardized). Net debt/EBITDA −0.99x broad / −0.08x strict.
- **Restricted escrow AED 43,338m excluded from all cash/EV figures** (RERA-trapped) — do not re-add.

### Anchor Block (copy-forward)

- Price: **AED 12.20** (US$3.32) (as-of 2026-06-28, last close)
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read (staleness caveat only; not a no-price trigger)
- Currency: **AED** (reporting/native); USD at 3.6725 peg
- Shares (market cap): **8,838.789849m** (CIQ Comps / Financials_Quarterly BS, Q1 Mar-31-2026)
- Shares (per-share fair value): **8,838.789849m** (fully diluted = basic; no dilution — no limitation)
- Market cap: **≈ AED 107,818m** (US$29,358m)
- Net debt: **canonical broad (net cash) AED 24,969m**; strict (§15) net cash AED 2,115m — label basis on every use
- EV: **canonical broad ≈ AED 96,657m** (US$26,320m); strict (§15) ≈ AED 119,511m (US$32,543m)
- Key caveats: (1) price is USD-normalized in the pool → converted to AED at the 3.6725 peg; native DFM price is AED. (2) Price 12 days stale (as-of 2026-06-28). (3) **Cash-basis choice moves EV by ~AED 22.9bn (~19%)** — broad nets AED 22.5bn of unrestricted bank term deposits; use broad for CIQ/peer multiple comparability, strict as the conservative floor; state the basis every time. (4) AED 43,338m restricted escrow excluded from all bases. (5) Hybrid business — EV bridge is meaningful for the ~80% development arm; recurring-income malls/hospitality may be valued on NAV/asset basis by `04`/`06`.

---

*Reconciliation note:* every headline number here reconciles to the `ciq_facts.json` pins (net debt −24,969.2 broad; total debt 10,064.4; LTM EBITDA 25,200.7; shares 8,838.8m; price US$3.32) and to CIQ's comps EV (US$26,319.7m). No pin was overridden; the strict-basis figures are an additional §15 read, not a contradiction of the vendor's (broad) Net Debt line. No valuation judgment is made in this report.
