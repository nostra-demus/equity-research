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
