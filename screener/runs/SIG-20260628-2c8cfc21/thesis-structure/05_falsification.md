# M0.5 Primary Falsification — SIG-20260628-2c8cfc21

## 1. The Kill Switch

- **falsification_sentence:** The FY2026 audited net loss for Stock Code 2322 is confirmed below HK$180M (i.e., the management-account ECL provision is reversed or materially reduced at audit), AND the Centaline City Leading Index for Hong Kong residential property prints above 155 (recovering above the level at which the filing's stated collateral-decline mechanism would still apply), together signalling that the ECL write-down was idiosyncratic and the property-collateral stress mechanism does not apply to the broader Hong Kong non-bank money lending sector.
- **falsification_condition_type:** magnitude_decay

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | HKEXnews Annual Results / Preliminary Results Announcement for Stock Code 2322 — confirmed audited net loss figure for FY ended 31 March 2026 (free, filed under HKEX Listing Rule 13.49; searchable at www1.hkexnews.hk stock code 2322, document type "Annual Results") |
| monitorable_metric_2 | Centaline City Leading Index (CCLI) — weekly Hong Kong residential property price index published by Centaline Property Agency at hk.centadata.com; the figure in force on the date the 2322 audited results are filed |
| monitorable_threshold_rate | 180 (for metric 1: audited net loss below HK$180M) AND 155 (for metric 2: CCLI above 155) — both conditions must hold simultaneously to confirm falsification |
| monitorable_threshold_rate_unit | HK$M for metric 1; index points for metric 2 |
| monitorable_threshold_date | 2026-09-30 (inside the M0.4 short_days_weeks horizon; HKEX Rule 13.49 requires preliminary annual results within three months of 31 March 2026, so the outer filing deadline is 30 June 2026 — the FY2026 preliminary results must be filed by 30 June 2026 and the full annual report by 31 July 2026; if any extension is granted, the monitoring date extends to the filing date but no later than 2026-09-30) |

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** The thesis's load-bearing claim — carried in HARM-001 (Consumer Finance / Non-Bank Money Lenders, composite 75, primary tier) — is that the ECL provision mechanism (Hong Kong property collateral declining, borrowers unable to refinance) is real and applies to the sector, not just this one firm. If the audited net loss comes in below HK$180M, it means the management accounts overstated provisions by at least HK$40M–HK$80M (relative to the HK$220M–HK$260M range) — a material reversal that removes the quantitative basis for all three carry-forward world changes (WC-001, WC-002, WC-003). If the CCLI simultaneously recovers above 155, the specific collateral-decline mechanism stated verbatim in the filing no longer holds as an ongoing sector stress. Together, these two conditions mean the original ECL write-down was a one-firm accounting event, not a signal of broader industry credit deterioration. The thesis does not survive as a sector-level harm signal — it becomes a company-specific accounting adjustment with no carry-forward investment implication. The falsifier is genuinely uncomfortable because the unaudited management accounts are explicitly flagged as preliminary and subject to revision, meaning the audit outcome is the single most important near-term fact, and HK property sentiment has been subject to policy-driven swings. Both risks are live.

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | Hong Kong Monetary Authority (HKMA) or government announces a property market support measure (e.g., further stamp duty cuts, relaxation of LTV caps on mortgage lending) that materially re-opens refinancing for distressed borrowers — directly reversing the "clients unable to obtain re-financing" mechanism stated in the WC-003 filing; the mechanism named in the thesis no longer applies. Monitor: HKMA press releases at hkma.gov.hk/eng/news-and-media/press-releases/ and Hong Kong government budget / housing-policy announcements. | HKMA or Finance Bureau official announcement of LTV relaxation or stamp-duty removal, dated within the horizon | 0.20 |
| SF-002 | No comparable ECL provision disclosures from other listed Hong Kong non-bank money lenders or consumer finance companies within 60 days of the 2322.HK profit warning — the absence of peer confirmations means the harm mechanism does not generalise to the sector; HARM-001 primary-tier status is unsupported and the thesis collapses to a single-name accounting event. Monitor: HKEXnews filings for companies in the Consumer Finance / Diversified Finance segment of the HKEX Main Board and GEM, specifically profit warnings and results announcements; also scan the Hong Kong Money Lenders Ordinance licensee list (licensed by the Registrar of Money Lenders). | Count of HKEXnews profit warnings or results filings from peer non-bank money lenders citing ECL provisions on property-backed receivables, within 60 days of 26 June 2026 (i.e., by 25 August 2026) | 0.35 |
| SF-003 | The FY2026 preliminary results filed by 2322.HK disclose that the ECL provision was entirely reversed at audit (full recovery of previously provisioned receivables), reducing the audited net loss to within 20% of the FY2025 level (i.e., below HK$107M); this would mean not only that the magnitude decays but that the world change itself is retracted in the company's own audited record. Monitor: HKEXnews Annual Results / Preliminary Results Announcement, Stock Code 2322, same feed as metric 1 above. | Audited net loss below HK$107M (within 20% of FY2025's HK$88.9M) as stated in the FY2026 preliminary results filing | 0.10 |

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock; after that these criteria cannot be moved)

## 6. Verdict

Verdict: kill switch set — audited net loss (HKEXnews, Stock Code 2322 annual results) below HK$180M AND Centaline City Leading Index above 155, both confirmed by 2026-09-30
