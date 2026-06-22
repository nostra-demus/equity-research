# M0.5 Primary Falsification — SIG-20260620-e420a56a

## 1. The Kill Switch

- **falsification_sentence:** If SEBI has not issued its formal observations letter on the Jio Platforms DRHP AND Jio Platforms has not filed a Red Herring Prospectus with a price band on NSE or BSE by 2026-11-30, the IPO pipeline has effectively stalled or been withdrawn, which destroys the fee income, subscription brokerage revenue, and capital crowding-out mechanisms that all three primary carry-forward parties depend on.
- **falsification_condition_type:** speed_failure

The load-bearing claim is that the Jio Platforms DRHP filing translates into a live public subscription event within the 3–6 month thesis horizon. Every primary party — investment banking fee income (DIR-001), retail brokerage subscription revenues (DIR-002), and capital crowding-out of PE/unlisted funds (HARM-002) — is mechanically contingent on the IPO progressing to the price-band and subscription stage. None of these effects materialise from a stalled or withdrawn filing; the DRHP alone is not sufficient.

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | SEBI public-issues register (sebi.gov.in/filings/public-issues/) — status field for Jio Platforms Ltd DRHP filed 19 Jun 2026: tracks from "filed / under processing" to "observations issued" or "returned / withdrawn / lapsed" |
| monitorable_metric_2 | NSE corporate filings (nseindia.com/companies-listing/corporate-filings/all-other-filings) and BSE XBRL portal (bseindia.com/corporates/List_Scrips.aspx) — presence or absence of an RHP document filing for Jio Platforms Ltd with a price band stated |
| monitorable_threshold_rate | 0 |
| monitorable_threshold_rate_unit | observations letters issued OR RHP filings completed (count must reach ≥ 1 to avoid falsification; remaining at 0 by the threshold date confirms falsification) |
| monitorable_threshold_date | 2026-11-30 |

**Monitoring cadence:** Check both feeds every Friday. Any Monday following a Jio Platforms or RIL corporate announcement triggers an immediate out-of-cycle check. SEBI's stated statutory window for issuing observations is 30–75 days from DRHP filing (19 Jun 2026), placing the expected earliest observations date at approximately 18 Jul 2026 and the latest at 2 Sep 2026. A failure to receive observations by 2 Sep 2026 is an early-warning signal; a failure to receive observations or an RHP filing by 2026-11-30 confirms falsification.

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** The falsifier attacks the single mechanism every primary party depends on: the IPO progressing to a live subscription event. If SEBI blocks or returns the DRHP, or if Jio withdraws it, the following all collapse simultaneously — DIR-001 (investment banking fee income vanishes because the transaction does not close), DIR-002 (no subscription window means no brokerage commissions and no account-opening wave), and HARM-002 (capital crowding-out of PE/unlisted funds fully reverses because no retail or institutional capital is locked into the Jio subscription). The secondary carry-forwards (IND-001 tower operators, HARM-001 incumbent telecom harm) are also weakened because the financial strengthening narrative (WC-002) would no longer be translating into public-equity capital access. This falsifier does not merely dent the thesis — it removes the investable mechanism for every primary party. A hostile reviewer asking "so what if it fires?" would conclude: there is no residual thesis at the primary tier; the world changes (WC-001 through WC-006) remain factually true as information events, but they stop generating investable outcomes for the carry-forward parties within the thesis horizon.

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | Jio Platforms or RIL officially announces a deferral or postponement of the IPO after receiving SEBI observations — the observations letter arrives but the RHP is not filed within the permitted 12-month window and management signals a delay beyond the M0.4 horizon (post December 2026). This kills the near-term brokerage and fee timing for DIR-001 and DIR-002 even though the DRHP information event (WC-001 through WC-006) remains valid. | NSE/BSE exchange intimation (Reg 30 SEBI LODR) from Jio Platforms or RIL disclosing a deferral; or absence of RHP filing within 4 months of SEBI observations letter | 0.15 |
| SF-002 | A second mega-IPO (stated gross issue size ≥ Rs 25,000 crore) files a DRHP or RHP with SEBI before Jio's subscription window opens, splitting the domestic institutional and retail capital pool and materially reducing the crowding-out effect on PE/unlisted tech funds (HARM-002). The HARM-002 mechanism weakens from primary to secondary or below if competing capital demand absorbs the float. | SEBI public-issues register: count of concurrent IPO filings with gross issue size ≥ Rs 25,000 crore in the same subscription window as Jio Platforms | 0.20 |
| SF-003 | Jio Platforms' monthly net subscriber additions turn negative (subscriber count falls month-on-month) in any two consecutive TRAI or company-disclosed months before the listing date, signaling competitive deterioration that undermines the financial scale narrative (WC-004, WC-005, WC-006) and weakens the valuation anchor for DIR-002 (brokerage/wealth management fees tied to IPO pricing) and HARM-001 (incumbent telecom harm reverses if Jio is losing ground). | TRAI Monthly Subscriber Report (trai.gov.in/reports-publications) — Jio net additions column; or Jio Platforms interim quarterly results filed to NSE/BSE post-listing | 0.10 |

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock; after that these criteria cannot be moved)

## 6. Verdict

Verdict: kill switch set — SEBI observations letter issued OR Jio Platforms RHP with price band filed on NSE/BSE reaching a count of ≥ 1 by 2026-11-30; if both remain at 0 on that date, IPO pipeline thesis is falsified across all three primary carry-forward parties
