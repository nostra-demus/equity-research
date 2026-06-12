# M0.2 World Change — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. World Changes (already occurred — the reality lock)

| ID | Change | Magnitude | Baseline | Confirmed | Source |
|---|---|---|---|---|---|
| WC-001 | Policy repo rate reduced | −50 bps to 5.00% | 5.50% (since 2026-04-09) | 2026-06-10 | [RBI press release, 2026-06-10] |
| WC-002 | 10-year G-sec yield fell | −18 bps to 6.04% | 6.22% prior close | 2026-06-10 | [Exchange data / Reuters wrap, 2026-06-10] |
| WC-003 | Overnight call money repriced | −42 bps to 5.08% WAR | 5.50% prior-day WAR | 2026-06-10 | [CCIL data, 2026-06-10] |

## 2. Deferred Items (hypothetical / not yet occurred)

| Item | Why deferred |
|---|---|
| Bank MCLR/EBLR resets | Occur on future reset dates — not yet occurred |
| HFC funding-cost decline | Expected over 1–2 quarters as borrowings roll — not yet occurred |

## 3. Sources Checked

RBI press release (rate/vote/stance — found); Reuters market wrap (yield close — found); CCIL money-market page (call WAR — found).

## 4. Gate

- **gate_result:** pass
- **gate_rationale:** Three already-occurred, quantified changes against stated baselines.

## 5. Verdict

Verdict: 3 world changes confirmed — gate pass
