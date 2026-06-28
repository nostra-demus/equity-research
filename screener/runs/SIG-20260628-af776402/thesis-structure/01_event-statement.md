# M0.1 Event Statement — SIG-20260628-af776402

## 1. Event Statement (sterile)

> The Australian Financial Review reported on 28 June 2026 that Forrestania agreed to acquire the Edna May gold mine from Ramelius Resources for A$300 million. The Edna May mine, located near Westonia in Western Australia, had been on care and maintenance since April 2025 following the end of underground mining operations in May 2024. No additional on-list source has been located to independently confirm the headline facts of this transaction.

- **sentence_count:** 3
- **character_count:** 431 (≥ 50)

## 2. Sources

| Role | Source | URL | Grade | Rationale |
|---|---|---|---|---|
| Primary | Australian Financial Review — "Gold hotshot Forrestania buys Ramelius's Edna May for $300m" | https://www.afr.com/street-talk/gold-hotshot-forrestania-buys-ramelius-s-edna-may-for-300m-20260628-p60aq7 | A | AFR is an approved primary financial newspaper. However, the article is paywalled and could not be directly opened and verified by WebFetch — the source URL returned an access error. |
| Supporting | None identified | — | — | Ten targeted searches across Yahoo Finance, Australian Mining, MarketScreener, Business News, Stockhead, ASX announcement feeds, TipRanks, Kalkine, and the Ramelius/Forrestania investor relations pages returned no independent corroboration of the A$300m Edna May transaction as of the 60-second check window (retrieved 2026-06-28). |

## 3. Causal-Language Gate

- **Phrases checked/repaired:**
  - "acquires" → retained; this is the observable act (a signed agreement / deal), not a causal verb.
  - "agreed to acquire" → retained; states the transactional fact, not a reason or consequence.
  - No use of: because, due to, driven by, as a result, leading to, signals, suggests, implies, panic, crisis, soaring, plunging, aggressively, inevitably, or any synonym doing causal work.
  - Sentence 3 ("No additional on-list source has been located to independently confirm...") is a factual observation about source availability, not causal or interpretive language.
- **causal_language_check:** PASS (locked true)

## 4. 60-Second Source Check

- **What was checked:**
  - WebFetch of the primary AFR source URL (https://www.afr.com/street-talk/gold-hotshot-forrestania-buys-ramelius-s-edna-may-for-300m-20260628-p60aq7) — returned access error (paywalled); facts could not be confirmed from the source itself. Retrieved 2026-06-28.
  - WebSearch: "Forrestania Ramelius Edna May gold mine acquisition $300 million 2026" — no on-list corroboration found.
  - WebSearch: "Ramelius Resources Edna May sale Forrestania ASX announcement June 2026" — no on-list corroboration found.
  - WebSearch: "Ramelius RMS ASX Edna May sale 300 2026" — no on-list corroboration found.
  - WebFetch: Ramelius investor relations ASX announcements page — page rendered empty; no listing.
  - WebSearch: Forrestania Resources (FRS) ASX announcement page — June 9, 2026 shows a Zenith Minerals takeover announcement; no Edna May / Ramelius deal visible.
  - WebSearch: Ramelius Q3 2026 earnings call transcript (Investing.com, April 2026) — CEO stated Edna May remained under strategic review with no decision made as of that call.
  - Multiple additional searches on Australian Mining, Business News, MarketScreener, Yahoo Finance, Kalkine, Stockhead — no on-list article confirmed a binding A$300m Edna May transaction between Ramelius and Forrestania.
  - **On-list sources checked that could independently carry the fact:** Australian Mining (australianmining.com.au), Business News (businessnews.com.au), MarketScreener (marketscreener.com), Yahoo Finance (finance.yahoo.com), Kalkine (kalkine.com.au), Stockhead (stockhead.com.au), TipRanks (tipranks.com), Ramelius corporate website (rameliusresources.com.au), ASX announcement feeds (asx.com.au/announcements.asx.com.au). None carried this transaction.
  - Retrieved: 2026-06-28.
- **60_second_source_check:** FAIL → watchlist_no_source

The AFR is an approved Grade A source. However, the article is behind a paywall and WebFetch returned an access error — the facts in the headline could not be read and confirmed from the source itself. Under MODULE_RULES.md, the 60-second check requires that the agent "re-open the source_url (WebFetch) and confirm headline facts." That step failed. No secondary on-list source corroborated the transaction across ten targeted searches. The gate condition is not met.

## 5. Verdict

Verdict: watchlist_no_source
