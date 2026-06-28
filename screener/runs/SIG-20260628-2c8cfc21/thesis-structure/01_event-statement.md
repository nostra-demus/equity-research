# M0.1 Event Statement — SIG-20260628-2c8cfc21

## 1. Event Statement (sterile)

> Modern Innovative Digital Technology Company Limited (Stock Code: 2322), a Bermuda-incorporated entity listed in Hong Kong, filed a profit warning announcement on 26 June 2026 under HKEX Listing Rule 13.09. The filing states that the Group's net loss for the year ended 31 March 2026 is expected to be in the range of HK$220 million to HK$260 million, compared with a net loss of approximately HK$88.9 million for the year ended 31 March 2025. The filing states that the increase in net loss is attributable to an increase in provision for expected credit losses on receivables from clients in the Group's trading and money lending businesses, and that those accounts are unaudited and subject to adjustment.

- **sentence_count:** 3
- **character_count:** 681 (≥ 50)

## 2. Sources

| Role | Source | URL | Grade | Rationale |
|---|---|---|---|---|
| Primary | HKEXnews (HK Exchange Filing) — Profit Warning announcement, 26 June 2026 | https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0628/2026062800071.pdf | A | Official mandatory disclosure filed directly on the Hong Kong Stock Exchange's primary disclosure platform under HKEX Listing Rule 13.09; equivalent to a Tier 2 exchange filing in the §4 source hierarchy. |

## 3. Causal-Language Gate

- **Phrases checked/repaired:**
  - "attributable to" — retained in sentence 3 only as a direct quotation of the filing's own stated language, describing the increase in provision; this is the company's own characterisation in the announcement, not an M0.1 editorial assertion. The event statement does not assert causation independently; it reports what the filing states. No editorial causal verb added by M0.1.
  - "driven by" — checked; absent from the event statement (present in the signal gate synthesis abstract but not in the M0.1 statement itself).
  - "because", "due to", "leading to", "signals", "suggests", "implies", "soaring", "plunging", "panic", "crisis" — checked; all absent.
  - "increase in net loss is attributable to" — this phrase mirrors the filing's exact wording. To remove all interpretive colour: repaired to "The filing states that the increase in net loss is attributable to…" — the phrase is attributed to the filing, not asserted by M0.1. Repair confirmed in final saved statement.
- **causal_language_check:** PASS (locked true)

## 4. 60-Second Source Check

- **What was checked:** The HKEXnews PDF at https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0628/2026062800071.pdf was fetched and read in full (both pages rendered). Confirmed: (1) company name "Modern Innovative Digital Technology Company Limited", Stock Code 2322; (2) net loss range HK$220M–HK$260M for year ended 31 March 2026; (3) prior-year net loss of approximately HK$88.9M for year ended 31 March 2025; (4) filing made under HKEX Listing Rule 13.09; (5) disclosure dated Hong Kong, 26 June 2026; (6) filing states accounts are unaudited and subject to adjustment. All numbers in the event statement appear verbatim in the retrieved document. Retrieved at: 2026-06-28T15:45Z (agent run).
- **60_second_source_check:** PASS (locked true)

## 5. Verdict

Verdict: M0.1 complete
