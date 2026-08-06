# Customer And Geography Map — UBER

## 0. Data Note

No primary annual filing (10-K) is present in this data pool — only Capital IQ vendor exports and the Q2 2026 earnings call transcript [00_data-triage.md, §2A/§3]. The geographic and segment revenue split below comes from a Capital IQ export that the vendor states is parsed from Uber's own FY2025 10-K segment note ("Restatement: Latest Filings," filing date shown as 2026-02-13) [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab]. Per CLAUDE.md §5/§27, this is cited as the vendor export, not as the 10-K itself, because the 10-K document is not in the pool to verify against. Uber does not disclose individual named customers anywhere in this pool — this is expected for a consumer marketplace with millions of riders and eaters, not a B2B supplier with a handful of accounts.

## 1. Customer Map

Uber does not disclose customer concentration by name or count (no "Customer A accounts for X%" language anywhere in the pool). Its revenue is inherently atomized across individual consumers rather than concentrated in a few paying accounts, so the table below uses the customer-TYPE breakdown the company does disclose — its three reporting segments, each serving a structurally different payer — rather than fabricating named accounts.

| Customer Type | Importance (% of FY2025 revenue) | Long-term Contract? (Y/N/Not disclosed) | Evidence | Risk |
|---|---|---|---|---|
| Mobility riders (individual consumers booking rides, one trip at a time) | 57.0% ($29,670M of $52,017M total) | N — per-trip transactional, no contract | [Capital IQ export, UBER Financials.xls, Segments tab, FY2025]; segment description in [Company Comparable Analysis — Business Description tab, as-of 2026-08-06] | Low per-customer risk (millions of riders), but revenue is 100% transactional — no backlog or contracted revenue cushions a demand shock |
| Delivery consumers and merchant partners (restaurants/retailers on the marketplace, plus Uber Direct white-label enterprise clients) | 33.2% ($17,248M of $52,017M total) | Not disclosed for consumer orders; Uber Direct enterprise contracts likely exist but terms/duration/count are not disclosed in this pool | [Capital IQ export, UBER Financials.xls, Segments tab, FY2025]; Uber Direct described in [Business Description tab] | Same transactional exposure as Mobility on the consumer side; merchant mix (single large chain vs many small restaurants) is not disclosed |
| Freight shippers and carriers (B2B logistics marketplace connecting shippers with truck carriers) | 9.8% ($5,099M of $52,017M total) | Not disclosed — no shipper-count or contract-term detail in this pool | [Capital IQ export, UBER Financials.xls, Segments tab, FY2025]; segment description in [Business Description tab] | This is the one segment structurally capable of customer concentration (B2B, fewer counterparties than a consumer app), but no shipper-concentration disclosure exists in this pool to confirm or rule it out |

**Not disclosed:** any named top customer, any percentage of revenue tied to a single payer, and any Freight shipper-count or contract-duration detail. Absence here is a pool gap (no 10-K risk-factor section is present), not evidence that no concentration exists in Freight.

## 2. Geography Map

FY2025 revenue by geographic segment [Capital IQ export, UBER Financials.xls, Segments tab, FY2025; vendor-stated as parsed from the FY2025 10-K geographic note]:

| Geography | % of Revenue | Trend (Growing / Stable / Declining / Unknown) | Evidence | Risk |
|---|---:|---|---|---|
| United States and Canada | 50.9% ($26,469M) | Declining share — was 57.8% of revenue in FY2021 ($10,094M/$17,455M) and 61.1% in FY2022, down to 50.9% by FY2025 | [Capital IQ export, UBER Financials.xls, Segments tab, FY2021–FY2025] | Largest single geography and still just over half of revenue — see Flag 3 below |
| Europe, Middle East and Africa (EMEA) | 31.5% ($16,364M) | Growing — up from 18.4% of revenue in FY2021 ($3,213M/$17,455M) to 31.5% in FY2025, the fastest-growing region by share | [Capital IQ export, UBER Financials.xls, Segments tab, FY2021–FY2025]; growth partly acquisition-driven — management cites the Trendyol Go, Getir (Turkey), and Careem re-consolidation deals as adding to Delivery bookings in the region [Q2 2026 Earnings Call transcript, Aug-05-2026, prepared remarks] | Growth mix includes M&A roll-up in Turkey/Middle East delivery, not purely organic — durability of the acquired revenue is unproven from this pool |
| Asia Pacific (APAC) | 11.3% ($5,857M) | Growing modestly — 15.6% of revenue in FY2021 ($2,731M/$17,455M) fell to 10.9% in FY2022 before recovering to 11.3% by FY2025 | [Capital IQ export, UBER Financials.xls, Segments tab, FY2021–FY2025] | Smallest of the four regions; competitive intensity from regional players (Grab, DiDi) is visible in the peer comp set [Company Comparable Analysis — Business Description tab] |
| Latin America (LATAM) | 6.4% ($3,327M) | Roughly stable — 8.1% of revenue in FY2021 down to 6.4% by FY2025 | [Capital IQ export, UBER Financials.xls, Segments tab, FY2021–FY2025]; management flags intensifying 2-wheeler delivery competition in Brazil against iFood affecting trip volumes even as share holds [Q2 2026 Earnings Call transcript, Aug-05-2026, prepared remarks] | Competitive pressure in the largest LATAM market (Brazil) is pushing incentive spend from Mobility to Delivery, per management [Q2 2026 Earnings Call transcript] |
| **Total** | **100.0% ($52,017M)** | — | [Capital IQ export, UBER Financials.xls, Segments tab, FY2025] | — |

Additional within-US color: management states only 30% of U.S. gross bookings and 25% of U.S. profits come from the top 20 U.S. cities, with "the long tail of thousands of other cities and suburbs" the primary growth and profit engine — i.e., within the largest geography, revenue is itself spread across a long tail of markets rather than concentrated in a handful of metros [Q2 2026 Earnings Call transcript, Aug-05-2026, prepared remarks].

## 3. Concentration Flags

| Concentration Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| One customer >20% of revenue | N | No named customer disclosed anywhere in the pool; Uber's Mobility and Delivery revenue is spread across millions of individual consumers by business-model design [Business Description tab]. Freight (9.8% of revenue) is the one segment structurally capable of a concentrated shipper, but no shipper-level disclosure exists to test this — flagged as a genuine data gap, not a clean pass |
| Top 3 customers >40% of revenue | N | Same reasoning — no named-customer disclosure exists in this pool to evaluate |
| One geography >50% of revenue | **Y** | United States and Canada = 50.9% of FY2025 revenue ($26,469M of $52,017M total) [Capital IQ export, UBER Financials.xls, Segments tab, FY2025] |
| One customer or geography >30% with no long-term contract disclosed | **Y** | United States and Canada (50.9%) and EMEA (31.5%) both exceed 30% of revenue; the business is transactional per-trip/per-order revenue with no long-term contract structure disclosed for either region [Capital IQ export, UBER Financials.xls, Segments tab, FY2025] |

## 4. Read

Uber is geographically concentrated but not customer-concentrated in the way that word usually implies: the U.S. and Canada still supply 50.9% of FY2025 revenue ($26,469M of $52,017M) [Capital IQ export, UBER Financials.xls, Segments tab], and that share plus EMEA's 31.5% together clear the >30%-with-no-contract flag, but the underlying payer base within each geography is millions of individual riders and eaters, not a handful of accounts. The concentration that exists is naked in the specific sense that per-trip and per-order revenue carries no long-term contract of any kind — a regulatory or demand shock in the U.S., where half of revenue sits, hits immediately with no contracted backlog to cushion it. The single biggest dependency the synthesizer should know: just over half of Uber's revenue still depends on the U.S. and Canada regulatory and competitive environment, with no long-term contract structure anywhere in the business to smooth a shock there, even as EMEA's rising share (18.4% to 31.5% since FY2021) is partly acquisition-driven (Trendyol Go, Getir, Careem) rather than fully organic [Capital IQ export, UBER Financials.xls, Segments tab; Q2 2026 Earnings Call transcript, Aug-05-2026].
