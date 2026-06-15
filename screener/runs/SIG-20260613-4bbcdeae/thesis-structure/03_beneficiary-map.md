# M0.3 Beneficiary Map — SIG-20260613-4bbcdeae

## 1. Impact Matrix

| ID | Industry (GICS Sector / Code) | Side | Mechanism (cites WC-IDs) | Directness /25 | Magnitude /25 | Speed /25 | Reversibility /25 | Composite | Tier |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| DIR-001 | Semiconductors — Data Center / Server CPU (Information Technology / 45301020) | direct | WC-005 raises the confirmed 2030 server CPU TAM from ~$125B to >$170B (+$45B+, +36%+); WC-003 shows the segment is already growing at +22% YoY at $5.1B. The TAM revision directly enlarges the addressable revenue pool for every server CPU maker competing in this space. One-step mechanism: larger TAM → higher potential revenue and volume for producers. | 25 | 25 | 20 | 20 | 90 | primary |
| DIR-002 | Semiconductor Capital Equipment (Information Technology / 45301010) | direct | WC-003 confirms DC+AI segment revenue at $5.1B (+22% YoY) and WC-005 revises the 2030 TAM to >$170B, which requires expanded fab capacity to produce the chips. Server CPU producers invest in new capacity by purchasing lithography, etch, deposition, and inspection equipment from this sector. One-step mechanism: confirmed revenue growth + TAM expansion → incremental wafer-start demand → equipment orders. | 25 | 20 | 15 | 20 | 80 | primary |
| IND-001 | Electronic Manufacturing Services / Server ODMs (Information Technology / 45301010) | indirect | WC-005 (+$45B TAM) and WC-003 (+22% DC+AI revenue) increase server unit volumes. EMS / ODM firms assemble the server boards into which data-center CPUs are slotted; demand for assembly services is a downstream consequence of chip volume growth. Two-step mechanism: TAM expansion → more chip demand → more server builds → more board assembly. | 15 | 15 | 15 | 15 | 60 | secondary |
| IND-002 | Data Center REITs and Colocation Operators (Real Estate / 60108010) | indirect | WC-005 revises the server CPU TAM (+36%+) which implies more compute deployed in data centers; WC-003 shows AI-driven revenue already scaling. More servers deployed means more rack space, power, and cooling consumed. Two-step mechanism: AI compute TAM expansion → more servers deployed → more co-location demand and faster absorption of data center capacity. | 15 | 15 | 10 | 20 | 60 | secondary |
| IND-003 | Advanced Packaging / Substrate / PCB Makers (Information Technology / 45301020) | indirect | WC-003 ($5.1B DC+AI at +22% YoY) and WC-005 (TAM >$170B by 2030) require advanced packaging substrates for each server CPU shipped. Two-step mechanism: chip volume growth → substrate/interposer/PCB demand grows. The link is real but depends on chip producers actually growing production, which is WC-003's trajectory, not a certainty. | 15 | 15 | 15 | 15 | 60 | secondary |
| HARM-001 | Semiconductor — ARM-based / RISC-V Server CPU Competing Architectures (Information Technology / 45301020) | harmed | WC-005 revises the TAM upward as a validation of x86 server CPUs in AI workloads. WC-004 revises upward the earnings forecast for the incumbent x86 CPU maker (BofA 2030 EPS +78% to $6.24), reflecting expectations of share re-capture. If x86 recaptures server CPU share in AI workloads, competing architecture vendors lose incremental socket wins and face pricing pressure on designs not yet entrenched. One-step mechanism: x86 TAM and earnings re-rating → competing architectures lose socket share at the margin. The harm is competitive displacement risk, not demand destruction; the magnitude is moderate since the overall TAM is growing for all server CPU types. | 25 | 15 | 15 | 10 | 65 | secondary |
| HARM-002 | System Software / Workload Optimization Middleware (Information Technology / 45103010) | harmed | WC-003 shows AI-driven hardware (DC+AI segment +22%) capturing more of the compute workload. If hardware efficiency gains reduce the need for software-level workload arbitrage (e.g. CPU scheduling, load balancing middleware), pricing power for pure-software optimization layers narrows. Two-step mechanism: hardware revenue growth → customers invest more in hardware → marginal software-only optimization layers face substitution. The link is indirect and slow; the harm is directional only with no quantified displacement number from the confirmed WCs. | 5 | 5 | 5 | 10 | 25 | parked |

**Scoring notes:**

- **DIR-001** (Server CPU Semiconductors): Directness 25 — the TAM revision (WC-005) is a direct statement about the size of the market these producers sell into; no intermediate step needed. Magnitude 25 — a confirmed +$45B TAM revision (+36%+) on a $125B base is large and quantified [WC-005]. Speed 20 — the DC+AI segment is already growing at 22% YoY [WC-003], meaning the impact is in motion now, though the full TAM materializes by 2030; horizon is medium-to-long so 20 not 25. Reversibility 20 — AI compute infrastructure build-outs create multi-year capex commitments that are hard to unwind quickly, but not impossible to pause; partially reversible gets 20 not 25.

- **DIR-002** (Semiconductor Capital Equipment): Directness 25 — equipment orders follow directly from chip-production plans; no further step needed. Magnitude 20 — a $45B TAM expansion implies substantial additional wafer starts but the equipment revenue is a fraction of chip revenue (typically 10–15% of chip sales), so quantified but smaller; 20 rather than 25. Speed 15 — equipment orders typically lag chip revenue inflections by 6–18 months (planning, procurement lead times); impact is lagged. Reversibility 20 — capital equipment orders are cancelable with penalties but production capacity is not easily idled; partially reversible.

- **IND-001** (EMS / Server ODMs): Directness 15 — a two-step chain (chip TAM → chip volume → server assembly demand); not a direct beneficiary of the TAM revision. Magnitude 15 — directionally large but no quantified unit-volume number flows from the confirmed WCs alone; estimated. Speed 15 — server build activity lags chip availability by a quarter or more. Reversibility 15 — assembly contracts are partially locked in but can be redirected.

- **IND-002** (Data Center REITs / Colocation): Directness 15 — two-step (TAM expansion → more servers deployed → facility demand). Magnitude 15 — the link to rack-absorption is real but the WCs do not quantify data-center floor space or power consumption directly; estimated. Speed 10 — colocation demand responds to deployment, which lags chip production by 9–18 months; uncertain timing. Reversibility 20 — long-term lease commitments in data centers are structurally hard to reverse once signed; 20 not 25 because demand softening can pause expansion.

- **IND-003** (Advanced Packaging / Substrates): Directness 15 — two-step (chip volume → substrate demand). Magnitude 15 — real but no substrate volume number confirmed in the WCs. Speed 15 — packaging demand co-moves with chip production ramp, moderate lag. Reversibility 15 — substrate capacity is specialized but not impossible to redirect.

- **HARM-001** (ARM/RISC-V Competing Architectures): Directness 25 — a one-step harm: if x86 AI-server CPUs recapture sockets, competing architecture vendors lose those wins directly. Magnitude 15 — the overall AI compute TAM is growing (WC-005), so it is a relative share loss, not an absolute demand collapse; estimated displacement rather than a quantified revenue loss. Speed 15 — socket wins shift over product cycles (12–24 months); moderately lagged. Reversibility 10 — once x86 re-establishes a foothold in major hyperscaler designs, it is costly and slow to displace again; harder to reverse than a pricing change alone.

- **HARM-002** (System Software / Middleware): Directness 5 — three or more steps separate hardware TAM growth from middleware pricing power; the mechanism is vague and the causal chain is speculative. Magnitude 5 — directional only; no number flows from the confirmed WCs. Speed 5 — uncertain and likely multi-year. Reversibility 10 — software pricing power erodes gradually and can be partly recovered via new feature sets; 10 acknowledges partial irreversibility. Composite 25 → parked.

---

## 2. Population Gate

- direct populated: Y · indirect populated: Y · harmed populated: Y
- **primary_count:** 2 · **secondary_count:** 4 · **parked_count:** 1 · **carry_forward_count:** 6
- **zero_carry_forward_action:** proceed
- beneficiaries_only_note: N/A (harmed side is populated)
- harmed_only_note: N/A (beneficiary sides are populated)

---

## 3. Pair-Trade Notes

1. **Long Server CPU Semiconductors (DIR-001) vs Short ARM/RISC-V Server CPU Architecture Vendors (HARM-001):** If x86 recaptures AI-workload server sockets — as implied by WC-005's TAM revision and WC-004's forward-earnings upgrade — the trade captures relative share shift within the server processor industry. The long side benefits from confirmed TAM growth; the short side is harmed by market-share displacement risk. Both industries sit in the same GICS sub-industry (45301020), keeping the trade sector-neutral at the broader semiconductor level.

2. **Long Semiconductor Capital Equipment (DIR-002) vs Short System Software / Workload Optimization Middleware (HARM-002):** If AI hardware investment accelerates (supported by WC-003 and WC-005), capital equipment suppliers benefit from production ramp orders while software-layer substitutes face marginal pricing pressure. Note: HARM-002 is parked (composite 25), so this pairing has an asymmetric conviction level — the long side is primary, the short side is low conviction. Surface for monitoring only, not a high-conviction pair.

3. **Long Data Center REITs / Colocation (IND-002) vs Long Semiconductor Capital Equipment (DIR-002) as a portfolio pair:** Both benefit from the same AI-compute infrastructure build-out but through different mechanisms and with different timing profiles. REITs absorb the deployed servers; equipment makers supply the fab capacity to make the chips. Running both long captures the build-out at two different points in the supply chain with partially offsetting timing risk (equipment leads deployment by 12–18 months).

---

## 4. Ticker Check

- **performed:** true
- **violations:** none — draft was grepped for `\$[A-Z]{1,6}\b`, `\b(NSE|BSE|NYSE|NASDAQ|LSE):`, `.NS`/`.BO` suffixes, and well-known company names. The only proper noun in the report is "Intel" and "Bank of America" and "BofA" — used solely as references to the confirmed world-change events (WC-001 through WC-005) already named in M0.2, not as investment candidates or tickers. No ticker symbols, no exchange-prefixed symbols, and no candidate company names appear in the impact matrix or scoring notes.
- **repair_action:** none required

---

## 5. Verdict

Verdict: 6 carried forward (2 primary, 4 secondary) — proceed
