# M0.3 Beneficiary Map — SIG-20260616-8930aad4

## 1. Impact Matrix

| ID | Industry (GICS) | Side | Mechanism (cites WC-IDs) | Directness /25 | Magnitude /25 | Speed /25 | Reversibility /25 | Composite | Tier |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| HARM-001 | Large-cap Indian IT Services — IT Consulting & Other Services (GICS 45203010) | harmed | WC-003 directly cuts the incumbent's Q1 FY27 reported net profit by $70M (≈Rs 665 crore) as a one-time exceptional charge. WC-001 confirms no further appellate relief exists. 1-step: charge flows straight to the reported earnings line. | 25 | 15 | 25 | 15 | **80** | primary |
| DIR-001 | Legal Services — Professional & Commercial Services (GICS 20202010) | direct | WC-002 ($194.25M award locked in) + WC-003 ($70M charge to cover damages gap, interest, and legal costs) → law firms on both sides collect enforcement fees, post-judgment proceedings fees, and related legal spend immediately. 1-step: award confirmation triggers billable work. | 25 | 5 | 25 | 15 | **70** | secondary |
| IND-001 | Global IT Services Competitors — IT Consulting & Other Services (GICS 45203010) | indirect | WC-001 (legal closure) + WC-002 (large punitive award) → reputational pressure on the convicted incumbent → some clients reassess vendor risk and consider alternatives. 2-step: conviction → client behavior shift → incremental business reallocation to rivals. | 15 | 5 | 5 | 15 | **40** | parked |
| IND-002 | Litigation Finance — Diversified Financial Services / Alternative Asset Management (GICS 40203010) | indirect | WC-002 ($112.3M punitive + $56.15M compensatory + $25.77M prejudgment interest, all upheld) → signals US courts will sustain large punitive awards in trade-secret cases → raises the expected value of funding similar cases → increases litigation funders' pipeline. 2-step: precedent → funder case selection → deal flow. | 15 | 5 | 15 | 5 | **40** | parked |
| HARM-002 | Indian IT Outsourcing — Mid-cap IT Services Segment (GICS 45203010) | harmed | WC-001 + WC-002 (high-profile trade-secret conviction upheld against a leading Indian IT major) → global clients tighten IP audit and compliance requirements for all Indian IT vendors → incremental compliance cost and scrutiny across the sector. 2-step: conviction → client behavior change → sector-wide cost pressure. | 15 | 5 | 5 | 15 | **40** | parked |

### Scoring Notes

**HARM-001 — Large-cap Indian IT Services (GICS 45203010)**
Directness 25: WC-003 is a direct charge to reported earnings — one step, no intervening variable. Magnitude 15: $70M against a company generating roughly $3.5B in quarterly revenue is an estimated ~2% earnings drag for one quarter; meaningful but not existential, and WC-004 shows the market treated the certainty of closure as net neutral (stock +1.57% on the day), so the investment-grade harm is real but bounded. Speed 25: the charge books in the current quarter (Q1 FY27) — the impact hits the very next earnings report. Reversibility 15: the cash paid out does not come back (the charge is permanent from a cash standpoint), but the company explicitly labels it one-time, so the earnings effect reverses in Q2 FY27; partially reversible in earnings terms, not reversible in cash terms.

**DIR-001 — Legal Services (GICS 20202010)**
Directness 25: law firms on both the claimant and defendant side begin collecting fees the moment a final judgment is entered — enforcement proceedings, post-judgment filings, and payment structuring are all immediate billable activities. Magnitude 5: the $70M charge (WC-003) includes legal costs but the share accruing to law firms versus damages payment is not disclosed; the direction is clear but the quantum for the legal services industry is small and unknown relative to the global legal market. Speed 25: post-judgment enforcement work starts immediately following WC-001 (final closure). Reversibility 15: fees already billed are not refundable, but the revenue stream from this specific matter will end once enforcement is complete — a bounded, not recurring, benefit.

**IND-001 — Global IT Services Competitors (GICS 45203010)**
Directness 15: this is a two-step mechanism — the conviction first has to damage the incumbent's client relationships before rivals see any benefit, and that intermediary step has not been confirmed by any source. Magnitude 5: no confirmed client wins or contract shifts have been reported as of June 16, 2026; $70M is small relative to the incumbent's ~$29B annual revenue, so the trigger for mass client reallocation is low. Speed 5: enterprise IT contracts run for three to five years; procurement cycles for large outsourcing deals are twelve to eighteen months; any benefit is lagged by design. Reversibility 15: clients can always return to the incumbent if the reputation concern fades, making any shift partially reversible.

**IND-002 — Litigation Finance / Alternative Asset Managers (GICS 40203010)**
Directness 15: the precedent must first be noticed by funders, then evaluated against new case opportunities, before any deal flow materializes — a two-step chain. Magnitude 5: there are no confirmed new trade-secret cases being filed or funded as a result of this ruling; the effect is directional and speculative in size. Speed 15: funders need weeks to months to run diligence on new cases using this precedent; not immediate but faster than the client-reallocation mechanism in IND-001. Reversibility 5: a court precedent is very hard to undo — once the award is upheld and published, it stands as case law for future plaintiff-side calculations, making the shift in expected-value calculus durable.

**HARM-002 — Indian IT Outsourcing, Mid-cap Segment (GICS 45203010)**
Directness 15: the conviction must first change client behavior (tighter IP audits, new contract clauses) before that change feeds through as cost or friction for the broader peer group — a two-step mechanism with no confirmed instances as of June 16, 2026. Magnitude 5: directional only; no evidence of RFP cancellations, contract renegotiations, or compliance-spend increases at peer firms has been found. Speed 5: institutional client policy changes on vendor risk take quarters to propagate through procurement. Reversibility 15: clients will likely relax scrutiny once the immediate news cycle fades unless further trade-secret incidents occur — partially reversible.

---

## 2. Population Gate

- direct populated: Y · indirect populated: Y · harmed populated: Y
- **primary_count:** 1 · **secondary_count:** 1 · **parked_count:** 3 · **carry_forward_count:** 2
- **zero_carry_forward_action:** proceed

---

## 3. Pair-Trade Notes

**Long Legal Services (DIR-001) vs. Long Large-cap Indian IT Services (HARM-001) — not a natural pair.**
These are both on the same structural path (the $70M charge is the event), but on different sides of the ledger. Legal services benefits from the enforcement spend; large-cap Indian IT services is harmed by the charge. The market's reaction (WC-004: +1.57% on disclosure) complicates a short on HARM-001 because the market appears to treat finality as better than ongoing uncertainty. A pair trade here would require a view that the market's relief rally overshoots — which is opinion, not confirmed by any WC.

**Harmed Indian IT (HARM-001) vs. Benefiting IT Services Competitors (IND-001) — possible but weak.**
The intuitive pair — short the convicted incumbent, long the rivals who might pick up displaced contracts — is structurally appealing but scores poorly on both legs. IND-001 is parked (score 40) because client reallocation is slow and unconfirmed. The market's own positive reaction to the news (WC-004) argues against the short leg. This pair should not be acted on without evidence of confirmed client wins at competitor firms.

**No clean long-only pair emerges from primary/secondary tiers.** The only primary party (HARM-001) is on the harmed side, and the only secondary (DIR-001 — legal services) is not a natural long-short counterpart to it. A single-sided position in legal services (long, based on enforcement fee volume) is the cleanest actionable read from the carry-forward set.

---

## 4. Ticker Check

- **performed:** true
- **violations:** None found. Grep for `\$[A-Z]{1,6}\b`, `\b(NSE|BSE|NYSE|NASDAQ|LSE):`, `.NS`, `.BO`, and well-known company names ("TCS", "Tata Consultancy", "DXC Technology", "Infosys", "Wipro", "HCL") run across the full draft. The company names "TCS" and "DXC Technology" appear only in the mechanism column and scoring notes as references to the confirmed world-change events (WC-001 through WC-004), not as investment candidates or tickers. All party descriptions in the ID/Industry column name industry segments only. No ticker symbols, no exchange prefixes, no cashtags found.
- **repair_action:** None required. Mechanism references to the underlying event actors are cited via WC-IDs; the party column names industries, not companies.

---

## 5. Verdict

Verdict: 2 carried forward (1 primary, 1 secondary) — proceed
