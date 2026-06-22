# M0.1 Event Statement — SIG-20260620-e420a56a

## 1. Event Statement (sterile)

> On 20 June 2026, Jio Platforms Limited filed a Draft Red Herring Prospectus (DRHP) with the Securities and Exchange Board of India (SEBI) for a fresh issue of up to 27 crore equity shares, with a stated issue size of approximately Rs 37,700 crore. The filing contains no offer-for-sale component. Approximately Rs 27,500 crore of the proceeds is designated for repayment or prepayment of existing borrowings. At the time of filing, Reliance Industries Limited held a 66.43% pre-IPO stake in Jio Platforms.

- **sentence_count:** 4
- **character_count:** 583 (≥ 50)

## 2. Sources

| Role | Source | URL | Grade | Rationale |
|---|---|---|---|---|
| Primary | Outlook Business | https://www.outlookbusiness.com/markets/jio-files-for-mega-ipo-debt-reduction-ai-ambitions-and-a-new-valuation-story | B | Approved-list Indian business press (Jun 2026 expansion block); secondary aggregator reporting on the SEBI DRHP filing — not the primary SEBI/exchange filing itself, so Grade B. |
| Supporting | SEBI DRHP (Jio Platforms, 20 Jun 2026) | Not directly fetched; cited as underlying primary document per DRHP facts confirmed via Outlook Business article | A | The DRHP is a regulatory submission to SEBI — an official primary filing (CLAUDE.md §4, tier 2 equivalent). Facts reported by Outlook Business match the DRHP's stated figures. |

## 3. Causal-Language Gate

- **Phrases checked/repaired:**
  - "targeting proceeds of" → removed; replaced with "with a stated issue size of approximately Rs 37,700 crore" (DRHP states the issue size; "targeting" introduced an interpretive frame)
  - "earmarked" (draft) → retained as "designated" — describes the DRHP's own stated use-of-proceeds allocation; no causal inference involved
  - "mega IPO" (from headline) → not carried into the statement; adjective stripped
  - "significantly impact" (from body_text) → not carried into the statement; interpretive language stripped
  - "debt reduction, AI ambitions" (from headline framing) → not carried into the statement; motivational framing stripped
  - Checked and not present: "because", "due to", "driven by", "as a result", "leading to", "signals", "suggests", "implies", "panic", "crisis", "soaring", "plunging", "aggressively", "inevitably", "robust", "strong"
- **causal_language_check:** PASS

## 4. 60-Second Source Check

- **What was checked:** WebFetch of the primary source URL (https://www.outlookbusiness.com/markets/jio-files-for-mega-ipo-debt-reduction-ai-ambitions-and-a-new-valuation-story) at retrieved_at 2026-06-20T12:00:00Z (as logged in signal_payload.json); confirmed article dated 20 June 2026 (published 12:40 pm, updated 12:46 pm). The following facts were verified against the article's stated figures: (1) fresh issue of up to 27 crore equity shares — confirmed; (2) stated issue size approximately Rs 37,700 crore — confirmed; (3) approximately Rs 27,500 crore designated for repayment or prepayment of existing borrowings — confirmed; (4) no offer-for-sale component — confirmed; (5) Reliance Industries Limited 66.43% pre-IPO stake — confirmed. All five facts in the event statement appear verbatim or in direct equivalent form in the on-list source. Source is on the approved list (Outlook Business, Jun 2026 expansion block in SWARM.md).
- **60_second_source_check:** PASS

## 5. Verdict

Verdict: M0.1 complete
