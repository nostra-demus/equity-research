# Catalyst Data Triage — EMAR

*Emaar Properties PJSC (DFM: EMAAR) — Dubai / UAE real-estate developer. Today's date: 2026-07-10. This agent inventories dated, forward-looking, scheduled-event data before the calendar is built. It does NOT build the calendar, score catalysts, or issue the module verdict — and it never fail-fasts ("no proven catalyst" is a valid downstream result). Pool pre-extracted via the canonical extractor: 20 workbooks -> 57 tabs, 69 extracts, 0 failures (`_pool_extracts/manifest.md`); no tab skipped.*

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | **Other — UAE.** Listed on the Dubai Financial Market (DFM: EMAAR); regulated by the UAE Securities & Commodities Authority (SCA) + DFM listing rules. NOT US SEC, NOT India SEBI. Use local-equivalent scheduled-event documents (board-meeting & results intimations to DFM, AGM notice, ex-div/record notices) — do NOT mark 8-K / 10-K / DEF 14A "missing". | Public Company Profile "Ticker: EMAAR (DFM)", "headquartered in Dubai"; Q1 2026 press release "listed on the Dubai Financial Market" |
| Reporting standard (US GAAP / IFRS / Ind AS) | **IFRS** | 03_Guidance tab header "Acctg. Standard: IFRS"; balance-sheet-survival/02 confirms IFRS; audited annual reports |
| Reporting currency (and fiscal year-end) | **AED (UAE dirham); fiscal year ends 31 December.** Dirham pegged to USD at AED 3.6725 (press releases show US$ equivalents alongside AED — negligible AED/USD FX risk). | Q1 2026 press release (AED with US$); balance-sheet-survival/02 "AED 3.6725/USD", "fiscal year ends 31 December"; ciq_facts currency "AED" |
| Document language(s) | **English.** Annual reports, earnings press releases, earnings-call summaries and DFM disclosures in the pool are all in English (DFM issuers file bilingually Arabic/English; the pool copies are the English originals). No translation gap; all 69 extracts succeeded. | `_pool_extracts/manifest.md` (0 failures); source extracts |

Set for downstream agents: read the UAE/DFM local-equivalent scheduled-event map (DFM board-meeting & results intimations, AGM notice, ex-div/record-date notices, sukuk/NCD maturity notes). Do NOT flag any US or India form as "missing".

## Language is not a data gap (CLAUDE.md §27)

Every pool document is in English and extracted cleanly (`manifest.md`: 0 failures). No source is dropped, downgraded, or marked "opaque" for language. There is no non-English document and no failed extraction here, so language raises no data gap of any kind.

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | **Y (date); N (numeric guidance)** | **Q2 2026 results — estimated 10 Aug 2026** (CIQ-derived; ~1 month out). The exact date is confirmed by a board-meeting intimation to DFM historically ~1 week prior (Feb pattern: board meeting 09 Feb -> results 12 Feb). Q3 2026 ~Nov 2026 on the quarterly cadence. **No formal numeric EPS/revenue guidance** — the guidance tab is stale (FY2008/FY2015); management gives only qualitative steers (2026 sales mix "broadly in line with 2025"; gross margin "low 50s" medium-term). | Events Calendar (Aug-10-2026 Est. Earnings Release, CIQ Derived); 03_Guidance tab "FQ2 2026 Earnings Release Date: Aug-10-2026"; Q4'25 earnings-call summary (qualitative steers) |
| Debt maturity / refinancing date | **Y** | **Sukuk 3 — AED 2,752.6m bullet due 15 Sep 2026** (~2 months out; 3.64%). Full year-by-year ladder: 2027 660.6m; 2028 1,694.3m (INR term loan); 2029 Sukuk 4 1,836.8m (3.875%); 2031 Sukuk 5 1,834.5m (3.70%). **Low materiality** — net cash (broad basis AED 24,969m; strict §15 basis AED 2,115m), interest cover ~52x, S&P BBB+ / Moody's Baa1 both stable; a new sukuk issue / refi announcement around the Sep bullet is possible but not a distress event. | balance-sheet-survival/02_maturity-wall-and-refinancing.md (FY2025 AR, Notes 24–25); ciq_facts debt_maturity_wall; Q4'25 press release (ratings) |
| AGM / EGM / record date | **Y (recurring pattern; next date not yet published)** | FY2025 cycle complete and past: AGM 25 Mar 2026; ex-div 3 Apr 2026; record 6 Apr 2026; dividend paid 20 Apr 2026. **Next (FY2026) AGM ~late-Mar 2027** on the proven template — not yet dated in the pool. | Events Calendar (AGM Mar-25-2026; Ex-Div Apr-03-2026); Key Developments (AGM 2026-03-25; ex-div/record 2026-04-03/06) |
| Scheduled regulatory / legal decision | **N** | No dated regulator, court, antitrust, or licence-renewal decision in the pool. No litigation milestone date disclosed. | Key Developments; annual reports 2023/2024/2025 (no scheduled decision found) |
| Policy / government decision date | **N** | No dated policy event. Dubai property-cycle, UAE rates (dirham pegged to USD -> tracks US Fed), 15% UAE corporate tax (already in force), and Dubai's 5.8m-population-by-2040 target are thematic macro dependencies, not dated decisions -> belong to external-dependency. | Q4'25 call summary (population 5.8m by 2040 — long-range, not a decision date) |
| Operational event (launch / commissioning / contract) | **Y (real, but undated / long-dated)** | **AED 200bn Dubai master-planned urban district announced 11 Jun 2026** (>4.5m sqm GFA, ~150k residents) — no launch/sales date given. **Dubai Mall expansion "expected to open 2H 2028"** (dated window, but >12 months out). 59,800 residential units to be delivered 2025–2029; 23-hotel pipeline; 10 project launches in Q1 2026; Dubai Mansions launch (undated). Backlog AED 163.4bn converts over ~3–4 years. All windowed/undated. | Key Developments (2026-06-11 masterplan); Q3'25 call summary (Dubai Mall 2H28; 59,800 units 2025–29); Q1 2026 press release (backlog, 10 launches) |
| Capital-return event (dividend / buyback) | **Y (recurring; next date not yet published)** | Annual cash dividend = **100% of share capital = AED 1.00/share** (2nd consecutive year); FY2025 payout AED 8.84bn paid 20 Apr 2026 (ex-div 3 Apr, record 6 Apr). Yield ~8.3%. Policy set Dec 2024. **Next (FY2026) dividend declared with FY results ~Feb 2027**, paid ~Apr 2027 — windowed, not yet dated. No buyback programme disclosed. | Key Developments (Dividend Affirmation 2026-02-09; Board Meeting 2026-02-12); Q1 2026 press release; Public Company Profile (yield 8.3%) |
| Market-structure event (index review / lock-up) | **Partial (a completed structural change; no forward-dated event)** | **Control shift COMPLETED 11 May 2026:** Emirates Power Investment LLC acquired 22.27% from Investment Corporation of Dubai (~AED 23.9bn); Dubai Holding's total stake rose to **29.73%** — a past event, not forward, but it reframes ownership (feeds §24 Filter 6 / management-governance). Float 47.9%. **CFO transition:** Group Head of Finance departed 20 May 2026; interim appointee serves "until further notice" — permanent appointment undated. No dated index review or lock-up expiry in the pool. | Key Developments (2026-05-11 M&A closing; 2026-05-22 CFO change); Public Company Profile (float 47.9%) |

## 2. Upstream Modules Available

All five ran, each with a full `99` synthesis plus the specific catalyst-feeding files.

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | **Y** (99 + 04_guidance-consensus, 05_beat-miss-setup, 07_earnings-sensitivity) | Next-results date (Q2 est. 10 Aug 2026) / no numeric guidance / beat-miss setup — surprise history is a run of EPS beats (FY2023 +22%, FY2024 +15%, FY2025 +11%); sensitivity = backlog conversion + margin |
| balance-sheet-survival | **Y** (99 + 02_maturity-wall-and-refinancing) | Refinancing — Sukuk 3 AED 2,752.6m bullet 15 Sep 2026 + full ladder; rating (S&P BBB+ / Moody's Baa1 stable); net-cash cushion means no covenant/distress trigger |
| management-governance | **Y** (99 + 02_capital-allocation-scorecard, 05_board-and-shareholder-rights) | AGM (~Mar 2027) / 100%-of-capital dividend / control shift to Dubai Holding 29.73% / interim-CFO succession |
| valuation | **Y** (99 + 05_reverse-dcf, 07_scenario-and-fair-value) | Re-rating trigger / what's priced in — reverse-DCF implies FCFF −13.4%/yr and a ~21% terminal margin (below the FY2021 trough) = structural impairment priced; EV/EBITDA ~4.0x sits at the 0th percentile of its own 16-quarter range |
| business-model | **Y** (99 + 10_external-dependency, 11_capital-allocation-governance) | Policy/cycle — Dubai property supply (~167k units completing 2026–27), rates via the USD peg, the AED 200bn masterplan pipeline; capital-return policy |

## 3. Triage Verdict

**Sufficient.** The pool carries multiple dated, evidenced forward events, and all five upstream modules ran. The calendar can lead with proven dates: **Q2 2026 results (estimated 10 Aug 2026,** CIQ-derived; exact date confirmed by a DFM board-meeting intimation ~1 week prior), the **Sukuk 3 AED 2,752.6m bullet maturity (15 Sep 2026),** and a full year-by-year maturity ladder — on top of a proven quarterly-results and annual AGM/dividend cadence templated by the just-completed 2026 cycle (results Feb/May/Aug/Nov; AGM late March; ex-div/record early April).

Be clear about what is NOT dated, so the calendar does not overclaim: the marquee operational item — the **AED 200bn Dubai masterplan (announced 11 Jun 2026)** — has no launch/sales date; the largest capital-return and AGM events fall in an **early-2027 window**, not a published date; the **Dubai Mall expansion is a 2H 2028 window** (beyond 12 months); and Emaar issues **no formal numeric guidance**, so the earnings dates carry a print, not a pre-announced number. Per §17, those must be logged as windows, never as dated catalysts, and the AED 200bn masterplan must not lift conviction on its own (no date).

So the calendar will be anchored by real near-term dates (the Q2 print ~10 Aug 2026 and the Sukuk 3 maturity 15 Sep 2026) plus a high-confidence recurring cadence, with the high-impact operational and capital-return items entering as windowed, evidenced-but-undated events. This is a real catalyst calendar, not a thematic story. This verdict does NOT abort the module.
