# Scenario & Fair Value — AKAM

All amounts are USD unless stated otherwise. The decision line is AKAM common stock on the Nasdaq Global Select Market. The $106.79 close on 14 September 2026 is pool-verified. This is a partial-data triangulation: only the intrinsic DCF produces a valid fair-value point. Accordingly, the base case is a single-method result and valuation confidence is capped at 50/100; it is not a broad-method consensus. [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price`, present; valuation/01_price-and-capital-structure, Anchor Block; valuation/04_intrinsic-dcf, §§5–8]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | Not assessable — illustrative-only | Low | 0% | Only six quarterly closes (about 1.5 years) are available, below the report's minimum for a reversion target. The vendor EV/EBITDA series also does not reconcile to the filing-based EV bridge. [CIQ Financials → Multiples, 2025-03-31 to 2026-09-11; `ciq_facts.json`, `range_position`, present; valuation/02_multiples-own-history, §§2–4] |
| Relative / peers (03) | Not assessable — $377.81 is mechanical only | Low | 0% | The only complete statistic is a heterogeneous 59.4x vendor peer median, and AKAM's 13.4x vendor EV/EBITDA does not reconcile to the canonical bridge. It cannot set a warranted peer value. [CIQ Comps → Trading Multiples, data as of 2026-09-14; `ciq_facts.json`, `peer_ev_ebitda`, present; valuation/03_relative-valuation-peers, §§2–5] |
| Intrinsic DCF (04) | **$68.78** | Low | **100%** | It is the sole valid value-producing method. Its 82.2% terminal-value share of EV makes the point sensitive, but it is a fully bridged FCFF result using $6,082.6m strict net debt and 153.686m diluted working shares. [valuation/04_intrinsic-dcf, §§4–7; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp.3–8, 17–20, 24] |
| Reverse-DCF (05) | 16.35% implied annual FCF growth; not a value | Low | n/a | This is a cross-check only. At the current EV, it requires FY2030 FCF of $1.245bn and a 19.21% FCF margin on the DCF revenue path. [valuation/05_reverse-dcf, §§2–5] |
| Sum-of-the-parts (06) | Not produced — single-segment sanity check only | n/a | 0% | AKAM has one reportable segment and no solution-category profit or capital data, so a breakup cannot be structured on a forward basis. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11 p.23; Note 14 pp.25–26; valuation/06_sum-of-the-parts, §§1–5] |

Weights sum to 100% across valid, value-producing methods: `1.00 × $68.78 = $68.78`. The 100% DCF weight is a mechanical consequence of the other methods being unusable; it does not signal high confidence.

## 2. Triangulation & Reconciliation

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Intrinsic DCF | $68.78 base; $45.65–$109.66 sensitivity grid | Low | 100% | The base uses a 6.22% WACC, 0.80% terminal growth, and a terminal value equal to 82.2% of EV. The grid changes WACC and terminal growth; it is not a second independent method. [valuation/04_intrinsic-dcf, §§4–7] |

The full high-to-low dispersion across valid value-producing **methods** is **Not assessable (one method)**, not 0%. The $45.65–$109.66 DCF sensitivity span is 140.2% of its lower bound, but it is within-method model sensitivity rather than cross-method corroboration. The single-method rule caps valuation confidence at 50/100; terminal dominance would independently cap the DCF at 60/100. [valuation/04_intrinsic-dcf, §§5, 7; valuation/MODULE_RULES.md, Score Cap Rules]

The $68.78 base point is therefore the DCF value, not a blended mid-point. The DCF's $60.03 exit-multiple check is directionally consistent with a lower cash-flow value, while its $33.99 declining-perpetuity structural-reset input shows the downside if the fading profit economics become permanent. [valuation/04_intrinsic-dcf, §5]

Neither multiple method provides independent support for the DCF. `02` found no cycle-elevated/depressed tag from its limited IGV price proxy (a 14.1% move, below the 25% guide); `03` could not test sector multiple history. More importantly, both methods are zero-weighted: `02` has too little history and `03` has no defensible homogeneous peer multiple. Their non-flagged status must not be read as evidence that the multiple anchors are sound. [valuation/02_multiples-own-history, §§4–5; valuation/03_relative-valuation-peers, §§5–6]

## 3. Bull / Base / Bear Fair-Value Levels

These are 12-month convergence levels derived from `04`'s DCF sensitivity grid, not a new peer- or own-history-multiple valuation. The P/FCF figures are an algebraic translation of each DCF equity value into the FY2030 FCF per diluted share; they are **implied**, not observed or warranted peer multiples. That distinction is necessary because `02`'s vendor FCF series uses a different definition and is illustrative-only. [valuation/02_multiples-own-history, §§1–4; valuation/04_intrinsic-dcf, §§4–7]

| Case | Fair Value / Share (point) | Forward Metric (FCF / terminal growth) | Implied P/FCF Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$109.66** | FY2030 FCF $972.3m = $6.3265/share; terminal FCF growth 1.30% | 17.33x | 12 months | The documented FY2030 cash path must be met, including a recovery from H1 FY2026's 29.4% CFO margin toward 33.5%, while cash capex falls from 20.0% to 18.5% of revenue. Security and CIS must convert growth to cash despite capacity costs, and the market must accept a 5.22% WACC. The earnings evidence does not separately prove this upside path. [valuation/04_intrinsic-dcf, §§2, 4, 7; earnings/07_earnings-sensitivity, §§2, 5–6] |
| Base | **$68.78** | FY2030 FCF $972.3m = $6.3265/share; terminal FCF growth 0.80% | 10.87x | 12 months | FY2026–FY2028 revenue consensus and `04`'s EBIT-margin recovery to 14.0% by FY2030 occur, while return on capital fades to the 6.22% WACC because no moat is proven. [valuation/04_intrinsic-dcf, §§2, 4–6; business-model/09_moat, §§3–5] |
| bear_cyclical — operating / valuation sensitivity | **$45.65** | FY2030 FCF $972.3m = $6.3265/share; terminal FCF growth 0.30% | 7.22x | 12 months | The explicit cash path is unchanged, but lower lasting FCF growth and a 7.22% WACC compress the implied multiple. This is a DCF sensitivity state, not a documented cyclical trough: the earnings work does not supply a full-year through-cycle FCF range. Rising payroll/SBC, co-location and network costs, delayed CIS conversion, and Delivery renewal-price pressure are the evidence-backed ways the operating path can weaken. [valuation/04_intrinsic-dcf, §7; earnings/07_earnings-sensitivity, §§2, 4–6; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp.28, 30, 32–34] |

The case mechanics were executed rather than hand-calculated:

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
shares=153.686
fcf=972.3
for label,value,g,wacc in [('bull',109.66,.013,.0522),('base',68.78,.008,.0622),('bear',45.65,.003,.0722)]:
    metric=fcf/shares
    multiple=value/metric
    print(f'{label}: FCF/share={metric:.4f}; implied_P/FCF={multiple:.4f}x; check={metric*multiple:.2f}; terminal_g={g:.1%}; WACC={wacc:.2%}')
PY
```

```text
bull: FCF/share=6.3265; implied_P/FCF=17.3333x; check=109.66; terminal_g=1.3%; WACC=5.22%
base: FCF/share=6.3265; implied_P/FCF=10.8717x; check=68.78; terminal_g=0.8%; WACC=6.22%
bear: FCF/share=6.3265; implied_P/FCF=7.2156x; check=45.65; terminal_g=0.3%; WACC=7.22%
```

The bull is only 2.7% above the current price and therefore fails the scenario span check. It is the top of the valid DCF sensitivity grid, not a complete bullish operating case. No wider bull level is defensible from the valid methods, so it must not be used as if it captures all positive outcomes. [valuation/04_intrinsic-dcf, §7; valuation/MODULE_RULES.md, Scenario Construction & Method-Weighting Policy §2]

### bear_structural — Avoid-Ruin Structural Reset (24–36 Months)

The structural-reset trigger fires because the moat verdict is “No moat proven — trajectory eroding” and the rate-of-change/disruption score is 35/100. The moat report also records a material contradiction: CFO/EBITDA rose 16.3 percentage points while margins and ROIC fell. Its qualifier therefore travels: erosion is identified on profit economics but is not confirmed across every measure. I keep the $33.99 reset as a **24–36 month avoid-ruin floor**, rather than replacing the 12-month bear, because `04` is usable and already fades terminal ROIC to WACC. [business-model/09_moat, §5; business-model/07_business-quality, §4; valuation/04_intrinsic-dcf, §5]

`04`'s structural case uses FY2031 FCF of $800.0m, a roughly 12% FCF margin after a terminal GAAP EBIT-margin fade toward 10%, and −1.0% terminal growth. It is an EV-based declining-perpetuity valuation, so strict net debt is deducted before division: PV explicit FCF $2,856.2m + PV structural terminal value $8,450.3m = structural EV $11,306.5m; less $6,082.6m strict net debt = equity $5,223.9m; divided by 153.686m diluted working shares = **$33.99 per share**. [valuation/04_intrinsic-dcf, §§4–6; valuation/01_price-and-capital-structure, Anchor Block]

| Case label | Fair Value / Share | Forward Metric | Implied P/FCF Multiple | Horizon | Billing |
|---|---:|---:|---:|---|---|
| bear_structural | **$33.99** | FY2031 FCF $800.0m = $5.2054/share; −1.0% terminal growth | 6.53x | 24–36 months | Avoid-ruin floor, not the 12-month headline bear; the formal moat verdict retains its cash-conversion qualifier. |

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
pv_explicit=2856.2; pv_struct_terminal=8450.3; net_debt=6082.6; shares=153.686
ev=pv_explicit+pv_struct_terminal
equity=ev-net_debt
print(f'structural EV={pv_explicit:.1f}+{pv_struct_terminal:.1f}={ev:.1f}; equity={ev:.1f}-{net_debt:.1f}={equity:.1f}; per_share={equity:.1f}/{shares:.3f}=${equity/shares:.2f}')
PY
```

```text
structural EV=2856.2+8450.3=11306.5; equity=11306.5-6082.6=5223.9; per_share=5223.9/153.686=$33.99
```

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $106.79, pool-verified at 2026-09-14 [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price`, present] |
| Base-case fair value (point) | $68.78 |
| Bear-case fair value | $45.65 — 12-month operating / valuation-sensitivity bear |
| Implied upside to base case = (base FV − price) / price | **−35.6%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−55.3%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **57.3%** |

The two metrics are deliberately different: the −55.3% margin of safety says the current price is above the $68.78 base fair value, while the 57.3% inverted downside-to-bear measures the decline from $106.79 to $45.65. The separate $33.99 avoid-ruin floor implies 68.2% downside at its longer 24–36 month horizon; it is not substituted into the 12-month bear metric.

The weighting and price-relative arithmetic were executed as follows:

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
price=106.79; base=68.78; bear=45.65
weighted=1.00*base
print(f'weighted_base={weighted:.2f}')
print(f'implied_upside_to_base={(base-price)/price:.1%}')
print(f'margin_of_safety={(base-price)/base:.1%}')
print(f'downside_to_bear={(price-bear)/price:.1%}')
PY
```

```text
weighted_base=68.78
implied_upside_to_base=-35.6%
margin_of_safety=-55.3%
downside_to_bear=57.3%
```

## 5. Warranted-Multiple Check

The base value's implied 10.87x FY2030 P/FCF translation depends on cash conversion recovering while terminal returns fade to the cost of capital. That is more cautious than assuming a permanent excess return, but it is still a low-confidence value because 82.2% of the DCF EV is terminal value. [valuation/04_intrinsic-dcf, §§4–7]

The current price is not supported by the available cash evidence: `05` calculates that it requires 16.35% annual FCF growth to $1.245bn by FY2030 or a 19.21% FCF margin on `04`'s revenue path, versus LTM FCF margin of 14.57%. Security and CIS growth can help, but their category margins are not disclosed; Delivery price pressure and infrastructure costs remain visible. [valuation/05_reverse-dcf, §§2–5; earnings/07_earnings-sensitivity, §§1–6]

There is no RF-OWN-004 controlling-owner flag: the governance work identifies no government, parent, conglomerate, or controlling-owner structure. The relevant valuation limitation is operating durability instead—business quality is 48/100, disruption risk is 35/100, and no economic moat is proven. [management-governance/04_ownership-and-insider-behavior, §4; business-model/07_business-quality, §§2, 4; business-model/09_moat, §5]

## 6. Fair-Value Read

The levels are **$109.66 bull, $68.78 base, and $45.65 12-month bear**, with a separate $33.99 avoid-ruin structural-reset floor. At the $106.79 pool-verified price, the base case gives a −55.3% margin of safety and the 12-month bear implies 57.3% downside; those are separate measures. The $68.78 DCF drives the answer because all other methods are non-value-producing, so confidence is capped rather than strengthened by false triangulation. The main swing factor is whether Security and CIS growth turns into lasting cash conversion before data-centre capacity, payroll/SBC, and Delivery renewal-price pressure erode the terminal cash-flow path. [valuation/04_intrinsic-dcf, §§4–8; valuation/05_reverse-dcf, §§2–5; earnings/07_earnings-sensitivity, §§2, 5–6]
