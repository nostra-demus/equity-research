# M0.6.5 Convergence Trigger — SIG-20260804-da21208a

## 1. Primary Trigger

| Field | Value |
|---|---|
| trigger_name | Grab Holdings' Q3 2026 earnings release (grab.com/sg/press release + accompanying Form 6-K, SEC EDGAR CIK 0001855612) |
| trigger_date_range | 2026-11-03 to 2026-11-17 (base case 2026-11-03/04) |
| trigger_type | scheduled |
| probability_if_unscheduled | null |
| probability_note | Quarterly earnings disclosure is a recurring, mandatory obligation for a Nasdaq-listed 6-K filer — the event WILL happen; only its exact date inside the window is estimated because Grab has not yet issued formal notice for Q3 2026. The base-case date (Nov 3-4) is set from Grab's own prior-year cadence: it announced Q3 2025 results on 3-4 November 2025 [Grab Investor Relations, "Grab to Announce Third Quarter 2025 Results on 3 November, 2025"; grab.com/sg/press, results published 2026-11-04] and Q3 2023 results on 9 November 2023 [Grab IR press release, 2023]. The wide end of the range (Nov 17) is a single vendor's forward placeholder [investing.com, GRAB Earnings, retrieved 2026-08-05], not corroborated by Grab's own historical pattern or by optionslam.com's own earnings-calendar entry (~2026-11-11, already cited in M0.6.2 Block 4) — it is shown as the outlier bound, not the central estimate. |
| Inside M0.4 horizon? | Yes (base case) — flagged for the tail. The base-case date (Nov 3-4) lands well inside the M0.4 "medium_weeks_3months" horizon (≈13 weeks from 2026-08-05 ≈ 2026-11-04) and matches the M0.5 `monitorable_threshold_date` (2026-11-15) with room to spare. The wide-end vendor estimate (Nov 17) would land 2 days AFTER the M0.5 threshold date and is flagged: if the print actually lands that late, the kill switch's monitoring window (which steps up "during the two weeks surrounding the expected... print," per M0.4) needs to extend by roughly 2 days, not that the horizon itself is breached. |

## 2. Causal Mechanism (four steps)

1. Grab's Q3 2026 6-K discloses on-demand incentives as a percentage of GMV together with the MTU (monthly transacting users) and GMV-per-MTU splits; if the marginal incentive ratio stays above the Q2 2026 average of 10.9% and/or MTU growth decelerates while incentive dollars keep rising, the mechanism M0.6.3 identified — rising marginal cost of growth, an acquisition-funnel rather than demand-intensity growth pattern — becomes a filed, dated fact instead of a derived one.
2. The 26 sell-side analysts covering GRAB (M0.6.1) rebuild their FY2027 adjusted-EBITDA-margin models on the newly disclosed marginal-versus-average incentive split rather than the blended ratio they use today; Barclays — already the outlier having cut its target from $7 to $5 on 2026-08-03 on qualitative incentive concern (M0.6.1) — is the most likely desk to formalize the marginal-cost read into a published note, and possibly into a rating or further target cut.
3. The existing short cohort (11.35% of float, M0.6.2 Block 5) adds to positions on confirmation, while momentum and regional-growth/EM-tech mandate funds — the flows M0.6.1's entrenchment_note says currently anchor GRAB as a "default holding" — begin trimming exposure, since a documented deceleration removes the support for that default-holding status.
4. GRAB's forward EV/EBITDA multiple — 14.6x against Uber's 21.22x trailing multiple (M0.6.2 Block 3) — compresses further as the market re-prices the growth story from "durable, AI-margin-funded" to "incentive-subsidized and decelerating," closing the gap between the variant view and the traded price. (If the metrics instead confirm consensus — marginal ratio falls back toward 10.9%, MTU growth holds — the multiple gap could instead narrow toward Uber's, which is the disconfirming path the M0.5 kill switch already tracks.)

## 3. Secondary Triggers

| ID | Trigger | Date | Type | P | Mechanism (one line) |
|---|---|---:|---|---:|---|
| ST-001 | GoTo (Gojek Tokopedia) Q3 2026 results — Indonesia's largest on-demand peer, reports before Grab's own print | 2026-10-28 (est.) [MarketScreener, GoTo financial calendar, retrieved 2026-08-05] | scheduled | 0.30 | If GoTo's own on-demand GMV growth is flat/declining or its incentive-to-GMV ratio is also rising, it independently corroborates a region-wide (not just Grab-specific) incentive-funded growth pattern ahead of Grab's Q3 print (reuses thesis_record.json SF-002's 0.30 estimate for this exact peer-read-across path). |
| ST-002 | A sell-side desk (most likely Barclays, given its 2026-08-03 target cut) publishes a note that explicitly models GRAB's marginal-versus-average incentive intensity | Unscheduled, could land any time before the Q3 print | unscheduled | 0.20 | M0.6.3's coverage-gap search found the general incentive-spend risk already flagged qualitatively but the specific marginal-ratio arithmetic (13.9% vs. 10.9%) nowhere in print; a desk publishing that exact decomposition would shift consensus assumption #2 (M0.6.1) directly, causing partial repricing before Q3 results confirm or deny it. |
| ST-003 | An interim Grab business update or investor-conference KPI disclosure (e.g., at a regional tech/consumer conference) between now and the Q3 print | Unscheduled | unscheduled | 0.10 | Grab does not routinely issue interim monthly KPIs outside quarterly reporting (M0.4's own monitoring-frequency note only checks for this as a possibility); if management is asked directly about MTU trend or incentive intensity at a public forum and answers with a number, it would partially confirm or deny the variant weeks before the scheduled print. |

## 4. Verdict

Verdict: trigger scheduled 2026-11-03 to 2026-11-17 (base case 2026-11-03/04) — proven timing for the event itself (mandatory quarterly disclosure), with the tail of the estimated window flagged as sitting 2 days past the M0.5 threshold date pending Grab's formal Q3 2026 notice.
