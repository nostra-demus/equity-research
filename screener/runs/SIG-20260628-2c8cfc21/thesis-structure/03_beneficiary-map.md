# M0.3 Beneficiary Map — SIG-20260628-2c8cfc21

## 1. Impact Matrix

| ID | Industry (GICS) | Side | Mechanism (cites WC-IDs) | Directness /25 | Magnitude /25 | Speed /25 | Reversibility /25 | Composite | Tier |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| HARM-001 | Consumer Finance — Non-Bank Money Lenders (Financials / Diversified Financials / Consumer Finance; GICS 4020) | harmed | WC-001, WC-002, WC-003: The firm, a licensed money lender, has recorded full ECL provisions on client receivables; the net loss has widened ~170% to a midpoint of HK$240M. The disclosed mechanism — clients unable to refinance, collateral property values falling — signals active credit deterioration inside this business model. Peer firms operating money lending books with similar collateral (property-backed receivables from trading and retail clients in Hong Kong) face the same deterioration in collateral quality, the same borrower stress, and an elevated probability of provisions on their own books. | 20 | 15 | 20 | 20 | 75 | primary |
| HARM-002 | Real Estate — Hong Kong Residential & Commercial Property (Real Estate / Real Estate Management & Development; GICS 6010) | harmed | WC-003: The profit warning directly states that property values are declining and borrowers in the trading/money lending book cannot obtain re-financing. This is not asserted by this map; it is stated verbatim in the HKEX filing. Declining property collateral values harm the real estate sector by signalling price weakness and tightening refinancing access for property owners — the same mechanism that caused the provisions now feeds back into property demand and pricing. | 15 | 15 | 15 | 15 | 60 | secondary |
| IND-001 | Distressed Debt Advisory & Restructuring Services (Financials / Capital Markets / Investment Banking & Brokerage; GICS 4020) | indirect | WC-001, WC-002, WC-003: A lender disclosing full ECL provisions on a client book, with accounts under audit and final results pending, creates demand for restructuring advisors, insolvency practitioners, and distressed-asset recovery specialists. This is a two-step mechanism: (1) lender records full provisions → (2) affected borrowers/collateral require workout, recovery negotiation, and restructuring counsel. The immediate demand is modest given the small absolute size of the firm (HK$240M midpoint net loss). | 15 | 5 | 15 | 15 | 50 | parked |
| DIR-001 | Audit & Accounting Services — Forensic and Provision-Review Engagements (Industrials / Professional Services; GICS 2020) | direct | WC-001, WC-003: The profit warning explicitly states the accounts are unaudited and under active audit ("under audit and may be subject to adjustments"). A full ECL provision review on a trading and money lending receivables book requires substantive auditor work to validate provision adequacy, assess collateral values, and verify recoverability assumptions. Audit firms engaged in the HK financial-services sector benefit directly from the increased scope of provision-validation work. However, the absolute dollar size of this engagement is very small. | 20 | 5 | 25 | 20 | 70 | secondary |

**Scoring notes:**

- **HARM-001 (Consumer Finance / Non-Bank Money Lenders):** Directness 20 — this is a direct, one-step hit to the industry: a firm inside the industry has reported full ECL provisions and disclosed the mechanism (property collateral decline + borrower inability to refinance). The impact is not a prediction about peers; it is a signal already embedded in the filing. Not 25 because the filing is from one small firm and the connection to industry-wide impairment requires one inference step (peer firms have similar books). Magnitude 15 — the absolute loss is HK$240M midpoint; this is a material loss relative to the firm's own scale but small relative to the total Hong Kong consumer finance market. The signal value (a disclosed ECL provision with stated mechanism) matters more than the dollar quantum. Speed 20 — the provisions are already recorded; the re-rating of credit quality for money lending peers in Hong Kong happens within weeks of a filed profit warning at this severity. Not 25 because audit completion (late FY2026) may shift the timeline. Reversibility 20 — property value declines and borrower refinancing stress do not reverse quickly; the ECL cycle in Hong Kong property-backed lending has historically been multi-quarter to multi-year. Not 25 because a macro Hong Kong policy response (rate cuts, property market easing) could accelerate partial reversal.

- **HARM-002 (Real Estate — HK Residential & Commercial Property):** Directness 15 — two-step: lender discloses declining property collateral → market reads this as a property price weakness signal. The filing names the mechanism but does not quantify the property price decline. Magnitude 15 — one small lender's provisions are a data point, not a market-moving quantum for the HK real estate sector overall. Speed 15 — re-rating of property sector sentiment from a single lender profit warning lags; larger data points (Centaline indices, government land sales) drive the sector more. Reversibility 15 — if the underlying property cycle turns, the harm partially reverses, but the near-term credit tightening effect is real and not quickly undone.

- **IND-001 (Distressed Debt Advisory & Restructuring Services):** Directness 15 — two-step mechanism: provisions → workout demand. Magnitude 5 — the absolute scale of this firm's impaired book is too small to move advisory revenues at any material level. Speed 15 — restructuring mandates follow provision recognition but take months to materialise. Reversibility 15 — restructuring demand persists until workout concludes (multi-quarter). Composite 50 — parked: real mechanism, too small to carry forward.

- **DIR-001 (Audit & Accounting Services):** Directness 20 — the filing explicitly flags active audit work on the provision, making audit demand a direct, one-step consequence. Speed 25 — the audit is in progress now (accounts "under audit" per the filing). Magnitude 5 — one small firm's audit engagement; negligible revenue impact on the audit sector. Reversibility 20 — once the audit scope expands, it does not shrink back within the engagement.

---

## 2. Population Gate

- direct populated: Y · indirect populated: Y · harmed populated: Y
- **primary_count:** 1 · **secondary_count:** 2 · **parked_count:** 1 · **carry_forward_count:** 3
- **zero_carry_forward_action:** proceed
- beneficiaries_only_note: N/A
- harmed_only_note: N/A

**Note on population balance:** The signal is company-specific distress at a small, micro-cap Hong Kong money lender. There are no meaningful direct beneficiaries at industry level — the distress is not large enough to redirect meaningful client volumes or market share to peers in a measurable way within the thesis horizon. The harmed side dominates the map because the confirmed world changes (WC-001 through WC-003) are loss-widening events, not supply/demand shifts that create winners. The two secondary carry-forwards (HARM-002 and DIR-001) are carried on mechanism, not on magnitude.

---

## 3. Pair-Trade Notes

- **HARM-001 vs HARM-002:** Consumer finance / non-bank money lenders short vs Hong Kong real estate is not a natural long-short pair here because both are on the harmed side of the same mechanism (property collateral decline → lender provisions). They move in the same direction. No long-short pair implied within the confirmed world changes.
- **HARM-001 vs broader HK financial sector:** A pair between Hong Kong money lending / consumer finance (short) and geographies with lower property-credit linkage (long) is implied by the mechanism, but the world changes do not confirm a sector-wide trigger — only a single firm's disclosure. Any such pair rests on inference beyond what M0.2 confirmed and is therefore flagged as speculative, not supported by the reality lock.
- No industry-vs-industry long-short pair is cleanly supported by the confirmed world changes alone. The signal is too company-specific to generate a reliable pair trade at the industry level.

---

## 4. Ticker Check

- **performed:** true
- **violations:** none — the draft was checked for $-prefixed cashtags, exchange-prefixed symbols (NSE:, BSE:, NYSE:, NASDAQ:, LSE:, HKEX:), bare exchange-suffixed symbols (.NS, .BO, .HK), and well-known company names. No ticker-like tokens found. The company name "Modern Innovative Digital Technology Company Limited" appears only in the context of identifying the issuer of the filing (the event source), not as a candidate for investment — consistent with M0.3 industry-only rules.
- **repair_action:** none required

---

## 5. Verdict

Verdict: 3 carried forward (1 primary, 2 secondary) — proceed
