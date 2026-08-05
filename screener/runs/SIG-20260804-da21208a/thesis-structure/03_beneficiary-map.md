# M0.3 Beneficiary Map — SIG-20260804-da21208a

## 1. Impact Matrix

| ID | Industry (GICS) | Side | Mechanism (cites WC-IDs) | Directness /25 | Magnitude /25 | Speed /25 | Reversibility /25 | Composite | Tier |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| DIR-001 | Southeast Asia digital-payment transaction processing / payment-rail providers (Financials — Transaction & Payment Processing Services, GICS 40203020) | direct | WC-004: on-demand GMV $6.5bn, +21.5% YoY. Rising GMV is the dollar volume settled through the payment rails and processors that clear in-app payments across Grab's markets — one step from GMV to settled payment volume. | 25 | 15 | 25 | 15 | 80 | primary |
| DIR-002 | Southeast Asia gig-driver vehicle / two-wheeler leasing and fleet-financing providers (Financials — Consumer Finance, GICS 40203010) | direct | WC-004 (GMV +21.5%) and WC-001 (raised FY26 revenue guidance) reflect higher trip/order volumes, which need more active driver vehicle-hours; providers financing or leasing vehicles to gig drivers see demand rise as the addressable driver fleet grows to cover the added volume. | 15 | 15 | 15 | 15 | 60 | secondary |
| IND-001 | Southeast Asia online ride-hailing and food/grocery delivery platform peers competing in overlapping city markets (Industrials — Ground Transportation, GICS 20304010) | indirect | Step 1: WC-003/WC-004 (Grab revenue +21.7%, GMV +21.5%) and WC-001 (raised guidance) reveal an underlying acceleration in regional on-demand demand. Step 2: competing platforms selling into the same consumer base in the same metro markets are plausibly exposed to the same tailwind — inferential, not independently confirmed by any peer's own reported numbers. | 15 | 15 | 15 | 15 | 60 | secondary |
| HARM-001 | Traditional and informal (non-platform) taxi and passenger-transport operators in Southeast Asia (Industrials — Ground Transportation, GICS 20304010, informal segment) | harmed | Step 1: WC-004 (on-demand GMV +21.5%) and WC-001 (raised guidance) show Grab continuing to grow within the passenger-trip pool. Step 2: because on-demand platform growth in mature SE Asia markets is largely substitutional (riders choosing the app over hailing a street taxi), continued platform growth implies the non-platform segment's addressable trip volume keeps shrinking — inferred from platform-side growth, not from any informal-segment data. | 15 | 15 | 15 | 25 | 70 | secondary |
| HARM-002 | Southeast Asia restaurant and food-service merchants selling through on-demand delivery marketplaces (Consumer Discretionary — Restaurants, GICS 25301040) | harmed | Step 1: WC-002 (raised FY26 adjusted EBITDA guidance, +2.8% at midpoint) alongside WC-004 (delivery-inclusive GMV growth) shows platform profitability improving as GMV scales. Step 2: take-rate/commission economics are the channel by which rising delivery GMV becomes rising platform profit, so merchants transacting on the marketplace keep bearing that commission structure — the commission rate itself is not disclosed in any WC, so this link is an inference, not a filed fact. | 15 | 5 | 15 | 15 | 50 | parked |

**Scoring notes:**
- DIR-001: Directness is high (25) because rising GMV converts almost mechanically into settled payment volume in the same period. Magnitude is capped at 15 because only Grab's own GMV is quantified — the actual revenue captured by the third-party payment-processing industry (its take rate on that volume) is not disclosed anywhere in the confirmed world changes. Speed is 25 because the volume is already flowing this quarter. Reversibility is 15 because Grab could route more volume through its own wallet (GXS/GrabPay) over time, and consumer demand could slow, both of which would pull share away from third-party rails.
- DIR-002: The link runs through two steps — more GMV needs more driver-hours, which needs more financed vehicles — so directness is 15, not 25. No driver-count or vehicle-count figure exists in the confirmed changes, so magnitude is estimated (15). Fleet-financing decisions take longer than one quarter to show up, so speed is lagged (15). Drivers can also lease through other channels or use owned vehicles, so reversibility is partial (15).
- IND-001: This rests entirely on inference — Grab's own results are confirmed, but no peer's numbers are. That inferential middle step caps directness at 15. The same "estimated, not independently confirmed" logic caps magnitude at 15. Peer results would only become visible in their own next quarterly reporting cycle, so speed is lagged (15). Reversibility is partial (15) since the demand tailwind, if real, could fade with the macro cycle.
- HARM-001: The mechanism is inferential (no informal-taxi data exists to confirm share loss directly), so directness and magnitude are both capped at 15. The shift accrues gradually, so speed is lagged (15). Reversibility is scored high (25) because once riders habitually book on an app, migration back to street-hailing is rare — this is a largely one-way, structurally sticky substitution, which is why it clears into the secondary tier despite resting on inference.
- HARM-002: Same two-step, inferential structure as HARM-001, but weaker: the confirmed world changes never disclose a commission rate or a merchant-level figure, so magnitude drops to directional-only (5) rather than estimated. Merchants can also multi-home across delivery apps or shift to dine-in/owned channels, so reversibility is partial (15). The composite lands at exactly the parked threshold.

## 2. Population Gate

- direct populated: Y (2) · indirect populated: Y (1) · harmed populated: Y (2)
- **primary_count:** 1 · **secondary_count:** 3 · **parked_count:** 1 · **carry_forward_count:** 4
- **zero_carry_forward_action:** proceed
- beneficiaries_only_note / harmed_only_note: not applicable — all three sides are populated, no note required.

## 3. Pair-Trade Notes

- **Platform-share pair:** long the Southeast Asia on-demand ride-hailing and delivery platform industry (IND-001) against short/avoid the traditional and informal taxi and passenger-transport industry (HARM-001). Both sides trace to the same underlying mechanism — Grab's confirmed GMV and guidance growth (WC-001, WC-004) as evidence of platform share continuing to displace non-platform passenger transport in the same city markets.
- **Gig-fleet-financing pair:** long the gig-driver vehicle/two-wheeler leasing and fleet-financing industry (DIR-002), which gains as platform ride volume requires more financed vehicles, against the owner-operated segment of the traditional taxi industry (part of HARM-001), which loses fleet-utilization economics to the same platform growth.

## 4. Ticker Check

- **performed:** true — grepped the full draft for `\$[A-Z]{1,6}\b`, `\b(NSE|BSE|NYSE|NASDAQ|LSE):`, exchange-suffixed symbols (`.NS`/`.BO` and similar), and scanned for company names.
- **violations:** none — the draft names only industries/business models with GICS codes (e.g., "Transaction & Payment Processing Services, GICS 40203020"); no ticker, cashtag, exchange-prefixed symbol, or company name appears anywhere in the matrix, notes, or pair-trade section.
- **repair_action:** none required.

## 5. Verdict

Verdict: 4 carried forward (1 primary, 3 secondary) — proceed
