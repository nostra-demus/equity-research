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
