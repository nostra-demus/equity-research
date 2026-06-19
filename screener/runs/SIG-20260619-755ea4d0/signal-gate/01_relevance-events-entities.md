# Relevance, Event Types & Entities — SIG-20260619-755ea4d0

## 1. What Happened (3 lines max)

A human prompt asserts that Barry Diller and other management members have been buying MGM Resorts International (MGM) shares, and that Diller proposed an all-cash acquisition at a premium to the stock's floor price. The prompt also references MGM's Osaka, Japan integrated resort (IR) project — targeted for a ~2030 opening — as a major future revenue catalyst. A supplementary note speculates about UAE/Dubai as a further expansion opportunity.

## 2. Step 1 — Relevance

- **relevance_label:** relevant_non_material
- **relevance_confidence:** 0.30
- **Driving criterion:** The Osaka IR project is a real, publicly known strategic initiative for MGM Resorts (a long-dated capital allocation event that could affect future revenue and cash flow); however, it has been public knowledge since at least 2019–2021 and the 2030 timeline is not a new development. The Barry Diller insider-buying and all-cash deal claim — which would be the most material element (capital structure change, M&A) — cannot be attributed to any on-list source retrieved during this run, and Barry Diller is not a known MGM Resorts executive, board member, or identified major shareholder. No on-list source confirms the deal proposal or insider purchases. The "2X price target" and UAE/Dubai commentary are unattributed speculation. Without verified sourcing for the deal claim, the strict materiality threshold (capital structure change via acquisition, or management credibility via confirmed insider buying) cannot be confirmed from evidence in this signal.

## 3. Step 2 — Event Types

| Event type | Tagged | Evidence (one line) |
|---|---|---|
| mna | ✓ | Human prompt asserts an all-cash deal proposal by Barry Diller at a premium to MGM's floor price — no on-list source corroborates this claim. |
| management | ✓ | Human prompt asserts Barry Diller and other management members purchased MGM shares — no on-list source corroborates insider buying. |
| commercial | ✓ | MGM's Osaka, Japan integrated resort is a real, publicly known long-dated commercial expansion project with a ~2030 opening target. |
| rumor | ✓ | The Barry Diller deal proposal and insider buying claims are sourced solely to the unattributed human prompt; no named or on-list source is provided — these claims qualify as rumor under the fixed-list definition. |

## 4. Step 3 — Entities & Linkage

| Field | Value |
|---|---|
| Primary issuer(s) | MGM Resorts International (NYSE: MGM) |
| Secondary issuer(s) | None confirmed from source; Barry Diller's firm IAC/InterActiveCorp is not named in the prompt and the connection is unverified (Inference, not from the source) |
| Sector | Consumer Discretionary — Hotels, Resorts & Cruise Lines (GICS 25301040) |
| Geography | United States (primary listing); Japan (Osaka IR project); UAE/Dubai (speculative note only) |
| Commodity | None |
| **issuer_linkage** | primary_issuer |

## 5. Verdict

Verdict: relevant_non_material, 4 event type(s), linkage primary_issuer

**Source-check finding:** No on-list source was retrieved to confirm the Barry Diller deal proposal, the insider buying claim, or any new development on the Osaka IR timeline. The Osaka IR project is real and long-dated public knowledge; the deal/insider-buying claims are unverified rumors as of this run. Per swarm doctrine (SWARM.md §2), a human_prompt that cannot be corroborated by an on-list source at M0.1 fails the approved-source check for its unverified claims.
