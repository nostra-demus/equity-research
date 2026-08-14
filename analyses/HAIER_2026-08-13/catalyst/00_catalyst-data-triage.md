# Catalyst Data Triage — HAIER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction | **China / dual-primary listed** — A-shares on the Shanghai Stock Exchange (SSE/SHSE 600690) and H-shares on The Stock Exchange of Hong Kong (SEHK 6690), plus D-shares on Frankfurt/Munich/Stuttgart/Wiener Boerse and an unsponsored US ADR (Pink Sheets) | Equity Listings export — 11 active listings across SHSE, SEHK, XETRA, Boerse Muenchen, Deutsche Boerse, Wiener Boerse, Boerse-Stuttgart, Pink Sheets, Thailand DR |
| Reporting standard | **China Accounting Standards for Business Enterprises (China ASBE/CAS)** for the A-share Annual/Interim Report filed to SSE; **IFRS** for the parallel H-share Annual Report filed to HKEX (same fiscal year, reconciled not averaged) | `Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf`, extracted text: "prepared in accordance with the China Accounting Standards for Business Enterprises" and "Rules Governing the Listing of Securities on The Stock Exchange of Hong Kong"; corroborated by `business-model/10_external-dependency.md`'s dual-citation pattern (China ASBE SSE filing + HKEX IFRS filing) |
| Reporting currency (and fiscal year-end) | **RMB (CNY)**, millions; fiscal year-end **31 December** | Events Calendar ("Current Fiscal Year End: Dec-31-2026"); Key Developments FY2025 results entry (year ended December 31, 2025) |
| Document language(s) | Chinese (original A-share Annual Report / Interim Report), English (H-share filings, CapIQ exports); non-English filings are read and translated in full by upstream modules per CLAUDE.md §27 — never a data gap | `business-model/10_external-dependency.md` cites the Chinese-language A-share Annual Report directly (原材料价格波动的风险, etc.) alongside the English HKEX IFRS filing |

Downstream agents should read the SSE board-meeting/results announcements, the HKEX regulatory-news filings, and the AGM Notice/Corporate Governance Report as the local equivalents of a US 8-K/10-K/DEF 14A — never mark them "missing" for lacking a US form number.

## Language is not a data gap (CLAUDE.md §27)

The A-share Annual Report and Interim Report are filed in Chinese; both are transcribed verbatim by `extract_pool.py` (0 extraction failures across 126 extracts, per the manifest) and translated by upstream modules (see `business-model/10_external-dependency.md`, which cites Chinese-language passages directly with translated context). No document in this pool is treated as opaque or discounted for language. The only real gaps in the pool are noted explicitly below (e.g., no S&P/Moody's rating text captured, no AGM poll/scrutinizer vote-tally announcement) — those are genuine missing-document gaps, not language issues.

## External data (frameworks/EXTERNAL_DATA.md)

No `data/HAIER/external/` folder exists in this pool (checked directly — the path is absent). There is no externally sourced research (alt-data panels, expert calls, channel checks, paid broker research) to inventory for this run. This has no effect on the sufficiency verdict (external data never moves it in either direction).

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | **Y** | H1 2026 interim results (six months ended Jun-30-2026), earnings release date **Aug-27-2026** (estimated) / **Aug-28-2026** (CapIQ-tracked release date) — roughly two weeks from today (2026-08-13); FQ2 2026 consensus tracks revenue CNY 75,075.97mn and EPS CNY 0.58 | `Haier Smart Home Co Ltd SHSE 600690 Events Calendar.xls` ("Aug-27-2026 3:00 AM — Estimated Earnings Release Date (CIQ Derived)"; "Aug-28-2026 3:00 AM — Earnings Release Date"); corroborated in `earnings/04_guidance-consensus.md` and `earnings/05_beat-miss-setup.md` ("due Aug-27-2026 — two weeks from today") |
| Debt maturity / refinancing date | **Y** | CNY 1,500.0mn Medium-Term Note 001 (1.99% fixed) due **2028-02-25/26**; CNY 2,000.0mn Medium-Term Note 002 (1.66% fixed) due **2028-06-17/18**. Nearer-term: CNY 23,452.2mn (55.0% of gross debt) is bucketed "current" — due within 12 months of the Dec-31-2025 balance-sheet date, i.e. by Dec-31-2026, but not itemized to exact dates | `Haier Smart Home Co Ltd SHSE 600690 Fixed Income Securities Summary.rtf` (Maturity Schedule, Jun-18-2028 note); `balance-sheet-survival/02_maturity-wall-and-refinancing.md` §1 (FY2025 Annual Report Notes 七、25/33/35/37; 2028 MTN maturities from Annual Report p.110) |
| AGM / EGM / record date | **Y** — already occurred this cycle, but the dividend-payment leg is still forward | 2025 AGM held **Jun-24-2026** (SSE/HKEX); H-share register closed **Aug-5 to Aug-7-2026** for the final dividend; ex-dividend date **Aug-3-2026** (already passed); **dividend payment date Aug-21-2026** (forward, ~1 week from today) — RMB 8.9151 per 10 shares | `Haier Smart Home Co Ltd SHSE 600690 Key Developments.xls` (AGM entry, Jun-24-2026; Dividend Affirmation entry, payable Aug-21-2026) |
| Scheduled regulatory / legal decision | **N** | No scheduled regulator hearing, license renewal, or litigation milestone date found in the pool | — |
| Policy / government decision date | **N (dated) / Y (thematic)** | China's national appliance trade-in subsidy program ("国补") is a live demand driver flagged as fading into 2026 ("high-base growth pressure"), and US/EU tariff policy is repeatedly cited as a headwind — but no specific decision date, renewal date, or hearing is disclosed for either | `business-model/10_external-dependency.md` (Government policy row, Regulation row, Geopolitics row) — thematic/undated only |
| Operational event (launch / commissioning / contract) | **Partial** | Recurring US product launches (GE Appliances HVAC line, wall ovens) and a $28m Decatur, Alabama factory-upgrade announcement (opened, not forward-dated) are logged, but these are past/routine product-news items, not forward-dated material operational catalysts | `Haier Smart Home Co Ltd SHSE 600690 Key Developments.xls` (multiple 2026-02 to 2026-05 entries) |
| Capital-return event (dividend / buyback) | **Y** | Final FY2025 dividend payment **Aug-21-2026** (above); ongoing CNY 6,000mn buyback program authorized 2026-03-26, valid for 12 months (through ~Mar-2027), with tranches reported through Jun-30-2026 (71,043,300 shares / 0.76% / CNY 1,488.06mn repurchased to date) — remaining program authorization runs into 2027 but no scheduled completion date beyond the 12-month window | `Haier Smart Home Co Ltd SHSE 600690 Key Developments.xls` (Buyback Transaction Announcement, 2026-03-26; Buyback Tranche Updates through 2026-06-30) |
| Market-structure event (index review / lock-up) | **Y** — already occurred, retrospective | Dropped from the Hang Seng China Enterprises Index effective **2026-06-05** (past); no forward index-review date disclosed in this pool | `Haier Smart Home Co Ltd SHSE 600690 Key Developments.xls` (Index Constituent Drop, 2026-06-05) |

## 1A. (No external data table — none present in this pool, per the note above.)

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | **Y** (full `00`–`08` + `99` synthesis) | Next-results date (Aug-27-2026), consensus-cut trajectory, elevated miss risk into the print (`04_guidance-consensus.md`, `05_beat-miss-setup.md`) |
| balance-sheet-survival | **Y** (full `00`–`06` + `99` synthesis) | 2028 bond maturities, within-12-month current-debt bucket (CNY 23,452.2mn), refinancing-cost read (flat-to-favorable given record-low PRC benchmark rates) |
| management-governance | **Y** (`00`, `01`, `05`, `06` + `99` synthesis; `02`–`04` not all separately confirmed present but governance summary/red-flags files exist) | Jun-2026 AGM outcomes (Articles amendment, director appointment, related-party financial-services framework renewal, general A-share issuance mandate), buyback/employee-share-plan mechanics, board-committee reshuffle (Jun-25-2026) |
| valuation | **Y** (full `00`–`07` + `99` synthesis) | Re-rating trigger context: cross-method DCF/peer-relative spread (35.1%) tied to the "eroding moat" structural-reset bear case; no single dated re-rating event, but the valuation dossier ties the bear case to continued margin erosion visible at each print |
| business-model | **Y** (full `00`–`12` + `99` synthesis + dossier) | Policy/regulatory/commodity/tariff themes (external-dependency), capital-allocation and buyback mechanics (`11_capital-allocation-governance.md`) — feeds the thematic (undated) side of the calendar |

All five upstream modules ran and produced completed synthesis files in this run — this is a materially better starting position than a standalone raw-data triage.

## 3. Triage Verdict

**Sufficient.**

The calendar can carry at least two dated, evidenced, near-term events with clear two-sided triggers:
1. **H1 2026 interim results, Aug-27/28-2026** (roughly two weeks from today) — evidenced by both the CapIQ Events Calendar and corroborated inside the earnings module, which independently flags elevated miss risk (two of the last two reported quarters missed an already-cut consensus).
2. **Final FY2025 dividend payment, Aug-21-2026** — evidenced by the Key Developments log with an exact payment date, register-closure window, and per-share amount (RMB 8.9151/10 shares).

Beyond these, the 2028 bond maturities (Feb and Jun 2028) are dated but distant (>18 months out), and the ongoing CNY 6,000mn buyback and the "国补" subsidy fade / US-EU tariff themes are real but largely undated (a soft window, not a hard date) — these belong on the calendar as thematic/windowed catalysts, not proven near-term ones. No scheduled regulatory or legal decision date exists in the pool. All five upstream modules completed, giving the calendar-builder rich cross-module material (valuation's structural bear case, governance's AGM/related-party items, balance-sheet's maturity wall) beyond just the data pool's own Events Calendar. The calendar will be able to carry at least one hard-dated, high-conviction near-term catalyst (the Aug-27/28 print) rather than being purely thematic — though most of the rest of the 12-month set will lean windowed/thematic (tariff policy, subsidy fade, buyback pacing) rather than hard-dated.
