# Signal Gate Synthesis — SIG-20260716-1f0ddd45

## Abstract

Iran's Revolutionary Guard Corps has threatened to close the Strait of Hormuz and Bab el-Mandeb — the two main oil and gas shipping corridors in the Middle East — after the US reimposed a naval blockade on Iran and resumed military strikes. This is a brand-new story (no prior ledger entry on Iran, the IRGC, or either chokepoint) reported by one approved outlet, South China Morning Post, with no second wire yet confirming the body-level detail. It scores 50 out of 100 on materiality and is Parked: real and new, but tied to a state actor with no company or ticker behind it, and not yet corroborated by a second source.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | grade A, South China Morning Post |
| Relevance | material (0.85) |
| Event types | macro_sector |
| Filing type | unknown_filing (no override) |
| Linkage | macro_only |
| Similarity / pair | < 0.78 (no prior match) → new_event |
| Fact delta | 0.00 (no prior record to compare) |
| Confirmation upgrade | false |
| Novelty | 0.85 |
| Generic media | false — none matched |

## 2. Step 9 — Canonical Handling

- Best prior match: none — the 72-hour window (widened to 7 days for this slow-moving state-actor storyline) found zero ledger hits for Iran, IRGC, Strait of Hormuz, Bab el-Mandeb, or the named secondary issuers (US, Bahrain, Kuwait, Jordan).
- Priority comparison: not applicable — with no candidate record, none of official/source-tier/fact-richness/timestamp comparisons apply.
- **action:** keep_separate

## 3. Step 10 — Materiality

| Component | Value | Max | Reason |
|---|---|---|---|
| Source quality | 13 | 20 | Tier 2 source, body readable or no paywall issue. |
| Event materiality | 17 | 20 | Base 14 (material relevance) + severity add-on 3 (macro_sector). |
| Company / portfolio relevance | 2 | 20 | Public issuer, macro_only (2) + portfolio-position bonus 0. |
| Specificity | 3 | 15 | Raw 3, no corroboration cap applies. |
| Estimate / valuation impact | 5 | 15 | Raw 5, no corroboration cap applies. |
| Theme / macro | 10 | 10 | sector-wide move (+5); matches a live screener theme (+4); commodity/rate transmission to portfolio names (+1) |
| Routine filing penalty (from filing_type) | 0 | -20 | filing_type 'unknown_filing' — not a routine-filing derate category. |
| Generic media penalty (from is_generic_media) | 0 | -15 | Not flagged generic media (is_generic_media=false). |
| Private/unlisted irrelevance penalty | 0 | -15 | Issuer is public; penalty not applicable. |
| Duplicate / stale penalty | 0 | -25 | pair_label 'new_event' — not a duplicate/stale repeat. |
| Low-confidence extraction penalty | 0 | -10 | relevance_confidence 0.85 >= 0.80, source tier 2 or corroborated. |

**Final score: 50/100** — The score is carried mainly by event materiality (17/20, a live military escalation directly threatening two global oil chokepoints) plus a full theme/macro score (10/10) for matching the board's live "Kuwait · iran" theme and transmitting to the open Gulf-LNG thesis's Hormuz exposure; no penalty applies since this is a brand-new, non-generic story from an approved source, so the 50/100 total reflects a real but sovereign-actor, no-named-company event rather than any derate.

Source 13/20 + Event 17/20 + Company 2/20 + Specificity 3/15 + Estimate 5/15 + Theme 10/10 − penalties 0 = 50/100.

Source tier: 2 (Tier 2 source, body readable or no paywall issue.)

### Step 10a — Portfolio / theme lookup

- **portfolio_position:** false — no open or locked thesis names Iran or the IRGC as its primary issuer. The one thesis that touches this region (THS-SIG-20260612-dd716589, Gulf LNG force majeure, provisional) has QatarEnergy as its own primary issuer, not Iran, so it does not set this flag — its exposure is captured separately below.
- **live_theme_match:** true — the board carries a "hot"-tier theme `THM-79ff4e58` ("Kuwait · iran", composite 86) that directly names two of this signal's entities (Iran, Kuwait).
- **commodity_rate_transmission:** true — Qatar's LNG exports (the subject of the live provisional Gulf-LNG thesis) ship out through the Strait of Hormuz, so a credible threat to close Hormuz transmits directly to that open thesis's commodity exposure, even though it is a different primary issuer.

Issuer note: the primary issuer (Iran/IRGC) is a sovereign/military actor, not a company, so `issuer_public_status` has no exact fit in the schema's binary `public`/`private_unlisted` enum. It is set to `public` because that is the path that correctly applies the already-recorded `issuer_linkage: macro_only` (2 points) — the alternative, `private_unlisted`, would incorrectly trigger the private-company escape-hatch machinery (and, with no evidenced linkage tags, the full -15 penalty) for an entity that isn't a private company at all. This is a schema-fit judgment call, not a re-derivation of upstream evidence.

## 4. Decision

The signal routes to PARK. It is a real, brand-new escalation with a specific, checkable mechanism (named chokepoints, named struck sites, a direct IRGC quote), not routine or generic content — but the primary issuer has no ticker (macro_only linkage caps company relevance at 2/20), and only one, uncorroborated Tier-2 source has reported the body-level detail so far, capping specificity and estimate-impact. `intake.json.override_promote` is false, so no human override applies.

## Machine Output

Wrote: `screener/runs/SIG-20260716-1f0ddd45/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260716-1f0ddd45 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Materiality below is the Step 10b final score (post-derate where applicable).

Routing: PARK
Materiality: 50
Next module: none
