# Per-Prompt Deep-Analysis Fixes

Output-driven prompt fixes. Methodology: read the agent prompt **+ 2–3 real committed outputs + an adversarial check**, then make the minimal edit that closes the gap the *outputs* (not the prompt alone) revealed. Each entry records the Issue, the Solution, why it's better, the evidence across real runs, and the net line change + a hallucination/error read.

This is a separate workstream from `FRAMEWORK_FIXES_2026-06-08.md` (PR #9). It lives on branch `claude/prompt-deepdive`.

---

## DD-01 · `moat` — mandate the return-vs-cost-of-capital test (the economic moat test)

**File:** `.claude/agents/business-model/09_moat.md` · **Net:** +14 lines (22 ins / 8 del)

**Issue.** The prompt requires a **peer-relative** capital-efficiency read (§4: "company sits at top/median/bottom of named peers") but never the **absolute** test — that a moat must earn a return on capital **above the cost of capital**. That is the textbook definition of an *economic* moat (peer-superiority alone is not a moat: an entire industry can earn below its cost of capital and still have a "best of a bad lot" leader). Because the prompt never demanded it, it was done ad hoc — and inconsistently:

| Real output | Business | Did it run the test? | Consequence of the gap |
|---|---|---|---|
| `BG_2026-06-01` | Operating (agri-trader) | ✅ Yes — ROIC 6.7% < 7.2% cost of equity → "moat in structure, not economics" | (correct) |
| `HCG_2026-06-01` | Operating (hospitals) | ✅ Yes | (correct) |
| `TMCV_2026-06-07` | Operating (CV maker) | ❌ No — reported "Auto ROCE 72.3%", ranked vs peer only | Never credited that 72.3% ≫ ~13% cost of capital — *understated* the economic moat; also swallowed a management-headline, segment-only ROCE at face value |
| `NIVABUPA_2026-06-05` | Insurer | ❌ No — reported ROE 10.7%, ranked "bottom vs peers" | Never flagged 10.7% ROE is *below* a ~14% cost of equity — *overstated* the moat; the improving-economics story is still value-destructive |

The test is decisive and cuts **both ways** (it would have strengthened TMCV and weakened NIVABUPA/BG), yet two of four real outputs skipped it.

**Solution.** Made the economic moat test mandatory and business-type-aware:
1. **§3** — after the economics table, a required one-liner: return on capital **{above/at/below}** cost of capital, with the gap in bps and the cost-of-capital source.
2. **Business-type-aware metric** — ROIC vs WACC for operating companies; ROE vs cost of equity for banks/insurers/financials (consistent with `frameworks/SECTOR_OVERLAYS.md`). Don't force ROIC onto a financial — this is *why* NIVABUPA's prompt fit poorly.
3. **Hard no-invention guardrail** — source the cost of capital by priority: (1) company-disclosed; (2) a labelled CAPM estimate ("Inference, not from filings", inputs shown); (3) else "not determinable" → mark the test **Not assessable**. Fabricating a cost-of-capital number is a hard error.
4. **Anti-anchoring** — a management-headline ROIC/ROCE/ROE must be cross-checked against a computed figure; segment-only/adjusted returns labelled (closes the TMCV "72.3%" face-value swallow).
5. **§5 verdict** — a "Strong moat" now requires returns *sustained above* the cost of capital (not just above peers); returns at/below cost of capital cap the verdict at Narrow/No-moat as a "moat in structure, not economics".

**Why better.** It moves the single most important moat economic test from "a diligent analyst might do it" to "the prompt requires it", and standardises the BG/HCG analysts' own best practice across every run. The guardrails mean the new requirement can't be satisfied by inventing a cost-of-capital number.

**Hallucination / error read.** Net **lower** error risk. The one new fabrication surface — an unsupported cost-of-capital figure — is explicitly closed by the priority ladder + "Not assessable" escape + the "hard error" label. The anti-anchoring rule *reduces* the existing risk of swallowing flattering management headlines. No new web/tool calls forced. Length cost is small (+14 lines).

---

## DD-02 · `relative-valuation-peers` — add relative-gap persistence + same-basis guardrail

**File:** `.claude/agents/valuation/03_relative-valuation-peers.md` · **Net:** +9 lines

**Issue (and an honest scope correction).** Reading the three real outputs (BG, TMCV, HCG) showed this prompt is already in **good shape** — most of the "peer-data" weaknesses I flagged from the prompt alone were already handled well in practice:

- *Capital-structure / double-counting* — TMCV reframed an apparent 47% EV/EBITDA discount to 11% on a debt-neutral basis (peer's EV inflated by a captive finance arm); BG handled cleanly.
- *Peer-selection bias* — both flag named-vs-self-selected peers, refuse to guess private-peer multiples (Cargill, LDC, VECV), and down-weight 2-stock medians.
- *Period / basis mismatch* — both use forward multiples for cyclicals and the same fiscal year-end; BG explicitly held its *own* current multiple as the "no re-rating" base.

So imposing a big rewrite would have been bloat. The **one genuinely universal gap**: the prompt produces a **point-in-time** premium/discount but never asks whether that gap is **wider or narrower than the company's own multi-year norm** versus these peers. That is exactly what separates a *structural* (already-warranted) discount from a real relative-value signal — a name that always trades 20% below peers and trades 20% below now is not cheap; one that historically trades at parity and is now 20% below is the signal. It falls in the crack between agent `02` (the stock's own *absolute* multiple history) and agent `03` (the *current* relative snapshot) — neither covers the *relative gap over time*.

**Solution.**
1. **§3** — a required one-liner: is the current gap in line with / wider / narrower than the ~3-year norm vs these peers; explicitly distinguished from `02`'s own-absolute-history; **Not assessable** if no peer-multiple history (no invention).
2. **§5 + workflow** — a same-basis guardrail: apply a peer multiple to the company metric on the *same* basis (forward↔forward, trailing↔trailing, adjusted↔adjusted) — never a peer trailing multiple on a company forward number.
3. Workflow step + two self-check items to enforce both.

**Why better.** Adds the single missing piece of a real relative-value read (gap-vs-its-own-history) without disturbing the parts the outputs already do well, and closes a quiet basis-mismatch error class in the implied-value step — at a +9-line cost.

**Hallucination / error read.** Net **neutral-to-lower**. The persistence line could invite a fabricated peer history, so it is explicitly gated with **Not assessable** when peer-multiple history is absent (which is the common case — these runs barely had *current* peer multiples). The same-basis rule strictly *removes* an error class. No new forced tool calls.

---

## Valuation module sweep (DD-03 … DD-06)

Method: a subagent deep-read each of the four highest-stakes valuation agents against every committed output (BG, HCG, TMCV; NIVABUPA has no valuation run); I adjudicated each finding for the real-vs-imagined-gap test and made the edits. Headline: **these prompts are in good shape — none had a decisive missing-test gap like the moat agent's.** Most candidate gaps came back DON'T-FIX (already handled well): the ROIC-vs-WACC value-destruction lens (intrinsic-dcf, MODULE_RULES Gates 2/3 — HCG executed it best-in-class), the circular-reasoning guard (reverse-dcf solves on observed EV, never its own DCF), the mean-reversion-trap guard (multiples-own-history — all three gave a concrete changed-fundamentals example), and the >40%-spread-reconcile-not-average rule (scenario-and-fair-value — BG/HCG both showed the blend then disclosed the override). The fixes below are the few genuine *enforcement* gaps, not new concepts.

### DD-03 · `intrinsic-dcf` — bound the WACC override + give the financeable-growth gate teeth + show the executed snippet
**Files:** `04_intrinsic-dcf.md`, `valuation/MODULE_RULES.md` · **Net:** ~+8 lines

**Issue.** Three enforcement holes, each output-evidenced: (1) **Unbounded WACC override** — BG raised a mechanically-computed 6.05% WACC to 7.0% "by analyst judgment" (BG §3); by its own grid that single input swings value from ~$171 to ~$80. The prompt's Step 4 said only "build the discount rate" — no rule on when/how much an override is allowed, and no cross-check against the moat module's inferred cost of capital (HCG had to reconcile its 10.7% WACC against the moat module's 12–13% by hand). (2) **Financeable-growth gate had no teeth** — TMCV's own cross-check showed implied growth 1.5–1.8% vs a modeled terminal g of 5.5% (a 3.7pp gap), labelled "optimistic / model risk" and left to stand on the un-financeable terminal value; MODULE_RULES Gate 2 said "flag it" but attached no consequence. HCG showed the disciplined alternative (forced g financeable). (3) **"Executed snippet (command + result shown)" self-check** existed but REPORT STRUCTURE gave no place to show it — a paper requirement.

**Solution.** (1) Step 4 + MODULE_RULES Gate 4: an override must show computed-and-used, justify in one sentence, stay within ±1.5pp, and cross-check the moat module's §3 cost-of-capital (now produced after DD-01) — if they diverge >2pp, run the grid spanning both; added `09_moat` to the agent's cross-module inputs. (2) MODULE_RULES Gate 2 + self-check: if the gap is >~1.5pp and unquantified, lower g to financeable OR cap confidence and show the grid at the financeable g. (3) §4 now instructs showing the executed command + raw output for the PV-sum, terminal value, and the equity bridge.

**Why better.** Closes the exact lever (a "judgment" WACC) where a desired DCF answer gets reverse-engineered, ties it to the new moat cost-of-capital number (a clean cross-module synergy), and stops a flagged-but-ignored un-financeable growth from inflating terminal value.

**Hallucination / error read.** Net **lower**. Every change *constrains* a degree of freedom (bounded override, financeable-g, shown arithmetic); none invents data. The override rule offers "span both in the grid" and the growth rule offers "lower g OR cap+show", so neither can force a fabricated number.

### DD-04 · `reverse-dcf` — stress the FCF base (and terminal g), not just the discount rate
**File:** `05_reverse-dcf.md` · **Net:** ~+5 lines

**Issue.** §4 robustness varied only WACC ±1%. Yet BG (§4: "more sensitive to the FCFF base than to WACC") and HCG both *voluntarily* added a base-sensitivity table and concluded the base dominates; TMCV did not — and TMCV's single ₹12,438 cr base (one year of FCF history, pre-Iveco) is the most fragile, left unstressed. Separately, in HCG the terminal value is 73–76% of PV, so the implied growth is highly sensitive to the held-fixed 5.0% terminal g — never shown.

**Solution.** Robustness now also stresses the FCF base (low/base/high, reusing the §1 figures — no new numbers) and names the dominant input; when terminal value exceeds ~60% of EV, also vary terminal g ±0.5%. Workflow step + self-check updated.

**Why better.** Mandates the base/terminal sensitivity the best outputs already added by instinct, so the weakest output can't leave the load-bearing assumption unstressed.

**Hallucination / error read.** Pure error-reduction — it stresses inputs the agent already derived; the "reuse §1 figures" guard blocks inventing a wider band.

### DD-05 · `multiples-own-history` — suppress a precise reversion target on short history
**File:** `02_multiples-own-history.md` · **Net:** ~+3 lines

**Issue.** The partial-data rule was binary — "no history → skip the table" — with no middle case. TMCV (~6 months listed) built a full §4 reversion table off a 3-point "mean" and emitted "₹423–₹465, midpoint ₹444, +15–26%" — false precision that `07` could lift as a real own-history anchor. BG, facing a similar gap, correctly *suppressed* its table. The prompt didn't force that consistency.

**Solution.** Partial-data rule + §4 + self-check: if own history is shorter than ~3 years, give only a directional "where in its short range it sits" read and label any reversion-implied value illustrative-only, not a fair-value input for `07`.

**Why better.** Closes the BG-vs-TMCV inconsistency and stops a six-month "mean" from entering the triangulation as a precise number.

**Hallucination / error read.** Net **lower** (a false-precision/calibration fix). Not a fabrication — TMCV's numbers tied out — but they shouldn't carry fair-value weight; the rule downgrades them to directional.

### DD-06 · `scenario-and-fair-value` — make the blend-vs-published-base disclosure a rule
**File:** `07_scenario-and-fair-value.md` · **Net:** +1 line (self-check)

**Issue (minor).** §2 reconciliation was enforced by example, not rule. BG ($111 blend → $108 published) and HCG (₹490 → ₹575) both *voluntarily* showed the mechanical weighted blend and then disclosed the override with a reason — exactly the §16 "reconcile, don't average" behavior. But nothing forced disclosing the *gap*: a weaker run could publish the overridden number while burying the blend, making the weights decorative.

**Solution.** One self-check line: if the published base departs from the mechanically-weighted blend, the departure and its reason are stated — never a silent re-anchor.

**Why better / risk read.** Disclosure-only; turns a good habit into a rule. Zero fabrication surface (it forces an existing number to be shown).
