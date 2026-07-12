# M0.5 Primary Falsification — SIG-20260711-b55e8917

## 1. The Kill Switch

- **falsification_sentence:** If Carvana's Q2 2026 earnings release (or any subsequent Stellantis monthly sales disclosure before 2026-10-31) shows that the acquired Stellantis franchise stores collectively sold fewer than 350 new vehicles per store per month on average, the core volume-superiority claim is broken and the thesis is dead.
- **falsification_condition_type:** magnitude_decay

## 2. Monitoring Specification

| Field | Value |
|---|---|
| monitorable_metric_1 | Carvana 8-K / Q2 2026 earnings press release — new-vehicle unit count at acquired Stellantis franchise stores, filed on SEC EDGAR (CIK 0001690820), expected late July 2026 |
| monitorable_metric_2 | Stellantis North America monthly U.S. sales report — store-level or brand-level volume for the Casa Grande, AZ location, published at media.stellantisnorthamerica.com in the first week of each calendar month |
| monitorable_threshold_rate | 350 |
| monitorable_threshold_rate_unit | new vehicles sold per acquired store per month (average across all seven stores) |
| monitorable_threshold_date | 2026-10-31 |

## 3. Uncomfortable Check

- **uncomfortable_check:** PASS (locked true)
- **uncomfortable_check_rationale:** The entire thesis rests on one confirmed load-bearing number: 700+ new-vehicle units sold at Casa Grande in May 2026 versus 30–50 under the prior operator (WC-002). That 14x uplift is the mechanism that makes DIR-001 (the online model is proven superior), DIR-002 (traditional dealers face direct volume displacement), and DIR-003 (OEMs gain a high-throughput channel) credible. If the threshold of 350 units per store per month — half of the single confirmed data point, and still 7–12x the prior operator's baseline — is not met when Carvana or Stellantis next discloses operating data, it means either (a) the May 2026 figure was a launch-month outlier, (b) the model does not replicate at scale across seven stores, or (c) the 700+ figure itself was not representative. Any of those outcomes removes the empirical foundation of the thesis. There is no secondary mechanism that carries the thesis if the volume claim fails: the $171M acquisition price (WC-001), Carvana's overall used-car growth (WC-003/WC-004), and the pair-trade logic all depend on the new-car volume superiority being real and sustained. The falsifier would kill the thesis, not dent it.

## 4. Secondary Falsifiers

| ID | Description | Metric | P(fires in horizon) |
|---|---|---|---:|
| SF-001 | Stellantis terminates or declines to expand the franchise agreement with Carvana, signalling that the OEM itself does not view the model as a durable distribution channel — removing the DIR-003 mechanism and capping the DIR-001 upside at seven stores | Stellantis North America press release or SEC 8-K from Carvana disclosing franchise non-renewal, termination, or OEM objection, reachable on SEC EDGAR and media.stellantisnorthamerica.com | 0.10 |
| SF-002 | Carvana publicly abandons or pauses further new-car franchise acquisition activity by Q3 2026 results, indicating that the economics at the seven acquired stores do not justify expansion — collapsing the thesis from a disruption story to a seven-store experiment | Carvana Q2 2026 or Q3 2026 earnings transcript (SEC EDGAR, CIK 0001690820) or investor presentation containing language explicitly pausing or exiting the franchise strategy | 0.15 |
| SF-003 | A second Stellantis monthly sales report (covering June or July 2026) shows that Casa Grande's unit volume has reverted to below 200 units per month, confirming the May 2026 spike was a one-month promotional event rather than a structural run rate | Stellantis North America monthly U.S. sales report, store-level or brand-level data for Casa Grande, AZ, published at media.stellantisnorthamerica.com | 0.20 |

## 5. Lock State

- **locked_after_m0_complete:** pending (edge-definition sets the lock; after that these criteria cannot be moved)

## 6. Verdict

Verdict: kill switch set — new-vehicle sales per acquired Stellantis store falling below 350 units/month on average by 2026-10-31
