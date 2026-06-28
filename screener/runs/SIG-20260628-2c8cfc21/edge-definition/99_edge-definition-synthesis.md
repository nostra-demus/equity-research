# Edge Definition Synthesis — SIG-20260628-2c8cfc21

## Abstract

The variant is that Hong Kong's non-bank money lending sector is absorbing property-collateral ECL (expected credit loss) pressure that the headline residential price index recovery is masking — and that the market is pricing zero additional ECL burden at peer lenders despite one firm (HKEX: 2322) disclosing a ~170% loss widening and full provision write-down on 26 June 2026. The strongest evidence is a confirmed sell-side coverage gap: four searches returned no analyst research treating property-backed ECL risk in HKEX-listed micro-cap money lenders, and the only sector proxy (AEON Credit) is the wrong product-mix benchmark. The weakest link is that the sector-level claim rests entirely on one filing — no peer firm has yet confirmed the mechanism. Edge score is 53 (watchlist_no_edge band). The record is locked; the falsification monitors are set; no deep research work is warranted until a second peer money-lender filing confirms the ECL mechanism.

---

## 1. Sub-Scores (§12-calibrated)

### variant_perception_quality — 48/100

The variant identifies a real numeric departure: ~20–30 percentage points of EPS compression at peer money lenders versus the market's priced-in 0%, derived from WC-003's ECL increment of HK$131M–HK$171M above 2322.HK's prior-year loss base and the HARM-001 inference that peers with similar property-backed books face the same conditions. Two mechanisms missing from consensus are named and explained — the CCL headline recovery masking sub-prime collateral stress (CCL is a volume-weighted all-tier index, not a sub-prime collateral tracker, as the filing's own language proves: borrowers still could not refinance after nine months of CCL gains), and AEON Credit as a product-mix-incorrect proxy (personal credit cards and instalment finance versus property-backed trading receivables). Four searches on 2026-06-28 returned zero sell-side research treating this specific mechanism, confirming a genuine coverage gap. However, the M0.6.3 specialist labels its own variant "weak": no peer firm has filed a comparable ECL disclosure, so extrapolating from one firm's filing to a sector-level claim requires an inference step the available evidence cannot yet carry. The MODULE_RULES cap for "no proven variant yet" is ≤30; this variant has a numeric departure and evidenced mechanisms — it clears that floor — but the wide uncertainty range (20–30pp) and single-firm basis prevent scoring above the mixed band.

### mispricing_reason_strength — 62/100

The primary category (complexity) fits well and is supported by three independently verifiable facts. Fact 1: zero analyst coverage of 2322.HK and a single-analyst stub for AEON Credit (0900.HK), verifiable today on Stockopedia and TipRanks (searched 2026-06-28). Fact 2: the CCL's published methodology is a volume-weighted index of all HK residential transactions across all quality tiers — not a sub-prime collateral tracker — verifiable at Centaline Group's own documentation; the 2322.HK filing was submitted after nine months of CCL gains with the stated refinancing-failure mechanism still active, which is contemporaneous proof of the index's inadequacy as a collateral-stress signal. Fact 3: AEON Credit's disclosed business lines (personal credit cards, instalment lending, hire-purchase) are structurally different from 2322.HK's property-backed trading receivables book, verifiable against AEON's own HKEX annual results (year ended 28 February 2026). Secondary categories (behavioral anchoring on the CCL recovery narrative; mandate constraints excluding institutional actors from the sub-segment) add depth and explain why the gap persists. The structural nature of the complexity mispricing — requiring cross-domain analysis that no analyst has incentive to do for a zero-commission sub-segment — supports a structural rather than transient classification. The score sits in the strong band but not higher because none of the three facts comes from an audited peer filing confirming the ECL quantum at a second lender.

### convergence_trigger_clarity — 52/100

The primary trigger is a mandatory HKEX filing under Listing Rule 13.49 with a board meeting already held on 29 June 2026 — the timing is confirmed from an actual HKEXnews board-meeting announcement mirrored at Minichart.com.sg (2026-06-17), making this a proven calendar event rather than a vague "catalyst soon." The trigger window of 29 June – 31 July 2026 is entirely inside the M0.4 "short — days to weeks" horizon. The four-step causal mechanism names specific actors: the single analyst on AEON Credit (0900.HK) at Step 2, event-driven and momentum funds at Step 3, short sellers on 0900.HK at Step 3, and passive trackers at Step 3. The trigger will fire with near-certainty. The mechanism breaks down materially at Steps 3 and 4: there is one analyst covering the only liquid proxy and that analyst may not monitor a micro-cap filing; no listed options market exists for either name; short selling is not available because neither name is on the HKEX designated securities list; and passive trackers hold the micro-cap at negligible weight. The filing is certain to arrive; the chain from filing to price convergence depends on institutional actors who are structurally absent from this sub-segment. MODULE_RULES.md caps convergence trigger clarity at ≤40 for vague timing — the timing here is specific and calendar-derived, so the cap does not apply — but the mechanism weakness holds the score to the mixed band.

---

## 2. The Blend (visible math)

blended_calculation: 0.40 × 48 + 0.30 × 62 + 0.30 × 52 = 19.2 + 18.6 + 15.6 = **53.4 → final_score 53**

- justification_sentence_1: The thesis identifies a real and evidenced coverage gap — no analyst has written about property-backed ECL risk in HKEX-listed micro-cap money lenders — but the variant's sector-level claim rests on a single-firm filing, and no peer disclosure has yet confirmed the mechanism, leaving the departure credible but unproven.
- justification_sentence_2: The convergence trigger fires with certainty (a mandatory scheduled filing), but the chain from that filing to price convergence is structurally thin: one analyst covers the only liquid proxy, no derivatives market exists, and no short-selling mechanism is available — leaving the market impact of the trigger uncertain even if the data confirms the thesis.

---

## 3. Routing

- **routing_outcome:** watchlist_no_edge
- **routing_logic:** Final score 53 is below the 60-point threshold for provisional; routes to watchlist_no_edge.
- **routing_reason:** The variant's sector-level claim is inference from a single firm's filing rather than proven across peers, and the convergence mechanism lacks the institutional actors needed to transmit price discovery even if the FY2026 audited results confirm the ECL range.

---

## 4. Record State

- locked: true · version: 1 · phase1_completed_at: 2026-06-28T17:00:00Z · falsifiers locked at: 2026-06-28T17:00:00Z
- next_module: null

---

## Machine Output

Wrote: `screener/runs/SIG-20260628-2c8cfc21/thesis_record.json` (complete, LOCKED, validates against frameworks/screener/thesis_record.schema.json)
Filed: `screener/ledger/theses/THS-SIG-20260628-2c8cfc21-v1.json`; events ledger status line appended; board index refreshed.

---

## Routing

Routing: watchlist_no_edge
Edge score: 53
Next module: none
