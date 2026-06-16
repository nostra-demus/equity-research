# Thesis Structure Synthesis — SIG-20260616-8930aad4

## Abstract

On June 15, 2026, the US Supreme Court refused to hear TCS's appeal in the DXC Technology trade-secrets case, making a roughly $194 million damages award final and permanent. TCS disclosed to the BSE and NSE on June 16 that it will book an additional $70 million as a one-time charge in Q1 FY27, on top of $150 million it had already set aside. The primary industry affected is large-cap Indian IT services (GICS 45203010), which takes a direct one-step earnings hit of $70 million in the quarter ending June 30, 2026; legal services (GICS 20202010) is a secondary beneficiary from enforcement fee activity. The thesis expires when TCS files its Q1 FY27 results with BSE/NSE in mid-July 2026, and it is falsified if the $70 million exceptional charge does not appear in that filing or the reported net profit falls short of pre-announcement consensus by less than $35 million. All five M0 gates passed. Routing: Proceed to edge-definition.

---

## 1. Gate Ledger

| Gate | Result | Evidence |
|---|---|---|
| M0.1 causal language | PASS | Checked for: because, due to, driven by, as a result, leading to, signals, suggests, implies, soaring, plunging, aggressively, inevitably, boosts, hurts, causes, triggered by — none present in the event statement. "Closes all appellate avenues" treated as a factual statement of procedural finality. |
| M0.1 60-second source | PASS | Primary source (ndtvprofit.com) blocked on fetch; The Star (thestar.com.my, 2026-06-16) fetched and confirmed all headline facts: Supreme Court declined petition June 15 2026; $168M award upheld; $150M prior provision; $70M additional charge in Q1 FY27. NDTV Profit is on the approved-source list (Grade A). |
| M0.2 reality lock (2–6 quantified) | pass | 4 world changes confirmed — WC-001: legal state changed to final (0 further appeals); WC-002: $194.25M total award locked in; WC-003: $70M incremental charge on top of $150M already provisioned, disclosed to BSE/NSE June 16 2026; WC-004: TCS stock +1.57% at Rs 2,196 on the day. |
| M0.3 population + carry-forward | proceed | 1 primary (HARM-001, score 80), 1 secondary (DIR-001, score 70), 3 parked — 2 carry-forward industries |
| M0.3 ticker check | PASS | 0 violations. "TCS" and "DXC Technology" appear only as references to confirmed world-change events in the mechanism column, not as investment candidates or tickers. All party IDs name industry segments only. |
| M0.4 observable expiry | PASS | Expiry = TCS Q1 FY27 results filed with BSE/NSE (SEBI LODR Reg 33), mid-July 2026. Checkable on bseindia.com the day of publication. Not an opinion. |
| M0.5 uncomfortable check | PASS | Kill switch requires the $70M charge to appear in the Q1 FY27 exceptional-items line. If absent — for any reason including reclassification or settlement — HARM-001's composite score falls below the 75-point primary threshold and the thesis collapses. The fact that the market rose 1.57% on disclosure day makes the falsifier genuinely uncomfortable, not easily dismissible. |

---

## 2. The Thesis Core (assembled)

- **Event:** On June 15, 2026, the US Supreme Court denied TCS's petition to appeal the DXC Technology trade-secrets judgment, making a $168 million damages award final; TCS disclosed a $70 million exceptional charge to BSE and NSE on June 16, 2026.

- **World changes:**
  - WC-001: Legal state changed from "appeal pending" to "final" — 0 further appeals possible (baseline: certiorari petition pending before the Supreme Court)
  - WC-002: Total damages award locked at ~$194.25M ($56.15M compensatory + $112.3M punitive + $25.77M prejudgment interest) vs. baseline of a contested, unresolved appeal
  - WC-003: $70M incremental exceptional charge disclosed to BSE/NSE on June 16, 2026, on top of $150M already provisioned (total exposure ~$194.25M, fully confirmed)
  - WC-004: TCS BSE closing price Rs 2,196 on June 16, 2026 — +1.57% vs. prior close of Rs 2,162

- **Blast radius:** Primary — large-cap Indian IT services (GICS 45203010, HARM-001, composite 80); secondary — legal services (GICS 20202010, DIR-001, composite 70); three parked (IT services competitors IND-001, litigation finance IND-002, mid-cap Indian IT HARM-002 — each scored 40, carry-forward blocked)

- **Clock:** medium_weeks_3months; expiry = TCS Q1 FY27 financial results published on BSE/NSE under SEBI LODR Reg 33, expected mid-July 2026

- **Kill switch:** The $70M exceptional charge does not appear in TCS's Q1 FY27 income statement filed with BSE/NSE, or reported Q1 FY27 net profit departs from pre-announcement consensus by less than $35M (metric: BSE exceptional-items line + Bloomberg/CapIQ consensus snapshot dated <= June 13, 2026; threshold: $35M USD; date: 2026-07-31)

---

## 3. Routing Decision

Every gate in the pipeline passed cleanly. M0.1 cleared both the causal-language check and the 60-second source check on a Grade-A on-list source (NDTV Profit), with The Star (thestar.com.my) providing literal cross-verification. M0.2 locked four quantified world changes, all already occurred with dates and baselines. M0.3 produced two carry-forward industries (one primary, one secondary) against a total map of five parties, with no ticker violations. M0.4 set a crisp, checkable expiry against a BSE/NSE SEBI LODR filing. M0.5 set a genuinely uncomfortable kill switch — the risk that the charge is absorbed into a strong quarter or simply reclassified is real enough that a motivated holder could not dismiss it. No gate failed; no terminal watchlist status was triggered. The record proceeds to edge-definition.

---

## Machine Output

Wrote: `screener/runs/SIG-20260616-8930aad4/thesis_record.json` (draft, locked: false, validates against frameworks/screener/thesis_record.schema.json)

---

## Routing

Routing: Proceed
Next module: edge-definition
