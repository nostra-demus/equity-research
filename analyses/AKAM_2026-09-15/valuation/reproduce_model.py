import json
from pathlib import Path

# Frozen run's published assumptions; no new market-rate assertion is made here.
PRICE = 106.79
SHARES = 148.333  # Q2 10-Q p39, GAAP diluted less note-hedge benefit, millions
DEBT = 7562.828  # Q2 10-Q p19, carrying amount, $m
PRINCIPAL = 7640.0  # Q2 10-Q pp17/19, cash principal, $m
CASH = 1480.257  # Q2 10-Q p3, cash and equivalents, $m
NET_DEBT = DEBT - CASH
WARRANTS = [(155.02, 18.546), (178.74, 9.898), (180.44, 10.015), (247.35, 8.689), (282.68, 9.171)]
TIMES = [.25, 1., 2., 3., 4.]
BASE_CASH = [227.926, 558.7, 707.8, 856.1, 972.3]
BASE_FCF = 629.879


def equity_claim(price, shares=SHARES):
    return price * shares + sum(n * max(0, price-k) for k, n in WARRANTS)


def price_from_equity(equity, shares=SHARES):
    # Net note-conversion premium is offset by matching purchased hedges.
    # Sold warrants remain. Solve E = S*P + sum(N*max(P-K,0)).
    if equity <= 0:
        return 0.0
    lo, hi = 0., equity/shares
    for _ in range(200):
        mid = (lo+hi)/2
        if equity_claim(mid, shares) < equity:
            lo = mid
        else:
            hi = mid
    return (lo+hi)/2


def dcf(cash, w, g, net_debt=NET_DEBT):
    assert w > g
    explicit = sum(f/(1+w)**t for f,t in zip(cash,TIMES))
    terminal = cash[-1]*(1+g)/(w-g)/(1+w)**4.5
    equity = explicit+terminal-net_debt
    price = price_from_equity(equity)
    return dict(wacc=w, terminal_growth=g, explicit_pv=explicit, terminal_pv=terminal,
                enterprise=explicit+terminal, net_debt=net_debt, equity=equity,
                price=price, return_pct=(price/PRICE-1)*100,
                terminal_share_pct=terminal/(explicit+terminal)*100,
                warrant_claim=sum(n*max(price-k,0) for k,n in WARRANTS))


def root(f, lo, hi):
    assert f(lo)*f(hi) <= 0
    for _ in range(200):
        mid=(lo+hi)/2
        if f(lo)*f(mid) <= 0: hi=mid
        else: lo=mid
    return (lo+hi)/2


def growth_path(g, base=BASE_FCF):
    return [.5*base*(1+g)**.5] + [base*(1+g)**(i+.5) for i in range(1,5)]


def reverse(w, g, net_debt=NET_DEBT):
    target=equity_claim(PRICE)+net_debt
    growth=root(lambda x: dcf(growth_path(x), w, g, net_debt)['enterprise']-target, -.9, .8)
    implied_wacc=root(lambda x: dcf(BASE_CASH, x, g, net_debt)['enterprise']-target, g+1e-7,.5)
    return dict(equity_target=equity_claim(PRICE), enterprise_target=target,
                fcf_growth=growth, implied_wacc=implied_wacc, cash_path=growth_path(growth),
                terminal_margin=growth_path(growth)[-1]/6482.3,
                forward_price_check=dcf(BASE_CASH,implied_wacc,g,net_debt)['price'])


w=(15345.7/(15345.7+7562.8))*.0906+(7562.8/(15345.7+7562.8))*(42.237/7640)*(1-.19)
g=w*((1199.2-1134.4+30)/735.1)

# Narrow forensic correction: same published legacy equity claims, correctly shared with hedge benefit.
legacy_span_cash=[339.7,790.5,919.8,1070.2,1245.1]
legacy_span_wacc=.0504657045
fixed_scenarios={
    'bull_execution': dcf(legacy_span_cash, legacy_span_wacc, .008),
    'bull_dcf_sensitivity': dcf(BASE_CASH,w-.01,g+.005),
    'base': dcf(BASE_CASH,w,g),
    'bear_cyclical': dcf(BASE_CASH,w+.01,g-.005),
}
probabilities=[.10,.15,.45,.30]
weighted=sum(p*v['price'] for p,v in zip(probabilities,fixed_scenarios.values()))

# Coherent re-run with identical timing, terminal-growth input and share denominator in both directions.
matched=reverse(w,g)
matched_scenarios={**fixed_scenarios,
    'bull_execution': dcf(matched['cash_path'], matched['implied_wacc'], g)}
matched_weighted=sum(p*matched_scenarios[k]['price'] for p,k in zip(probabilities,fixed_scenarios))
out={
    'as_of': '2026-09-14',
    'units': 'USD millions, shares millions, prices USD/share',
    'source_inputs':dict(price=PRICE,economic_working_shares=SHARES,carrying_debt=DEBT,principal=PRINCIPAL,
                         cash=CASH,strict_net_debt=NET_DEBT,principal_net_debt=PRINCIPAL-CASH,
                         original_model_wacc=w,original_model_terminal_growth=g),
    'legacy_reverse_basis':dict(shares=143.7,equity=PRICE*143.7,enterprise=PRICE*143.7+NET_DEBT,
                                economic_price_on_working_shares=PRICE*143.7/SHARES),
    'narrow_correction_fixed_legacy_scenarios':fixed_scenarios,
    'narrow_correction_aggregate':dict(weighted_target=weighted,expected_return_pct=(weighted/PRICE-1)*100,
                                       weighted_risk_reward=(weighted-PRICE)/(PRICE-fixed_scenarios['bear_cyclical']['price']),
                                       margin_of_safety_pct=(fixed_scenarios['base']['price']-PRICE)/fixed_scenarios['base']['price']*100),
    'matched_reverse':matched,
    'matched_scenarios':matched_scenarios,
    'matched_aggregate':dict(weighted_target=matched_weighted,expected_return_pct=(matched_weighted/PRICE-1)*100,
                            weighted_risk_reward=(matched_weighted-PRICE)/(PRICE-matched_scenarios['bear_cyclical']['price']),
                            bull_bear_ratio=(matched_scenarios['bull_execution']['price']-PRICE)/(PRICE-matched_scenarios['bear_cyclical']['price'])),
    'principal_debt_sensitivity':{k:dict(price=price_from_equity(v['equity']-(PRINCIPAL-DEBT))) for k,v in matched_scenarios.items()},
    'wacc_sensitivity_conditional_only': {str(rate): dcf(BASE_CASH,rate,g) for rate in [.04,.05,.06,.07,.08,.09,.10]},
}
# Parent verified dated sources separately. This audit tests arithmetic only.
we=15345.7/(15345.7+7562.8)
wd=1-we
new_w=we*(.0497+.0423)+wd*(42.237/7640)*(1-.19)
new_g=new_w*((1199.2-1134.4+30)/735.1)
out['parent_sourced_september14_riskfree_sensitivity']={
    'riskfree': .0497, 'wacc':new_w,
    'fixed_terminal_growth':dcf(BASE_CASH,new_w,g),
    'recomputed_terminal_growth':dcf(BASE_CASH,new_w,new_g),
    'source_status':'Treasury rate independently verified by parent, not re-fetched by this auditor',
}
out['hypothetical_debt_cost_sensitivity']={str(kd):
    dcf(BASE_CASH,we*.0906+wd*kd*(1-.19),g)
    for kd in [.005528403141361256, .0483, .06, .08]}
explicit=out['matched_scenarios']['base']['explicit_pv']
exit_pv=(907.5+1134.4)*8/(1+w)**4.5
runoff_pv=(800/(w+.01))/(1+w)**4.5
out['other_per_share_dcf_exhibits']={
    'exit_multiple_eight_times':dict(terminal_pv=exit_pv, price=price_from_equity(explicit+exit_pv-NET_DEBT)),
    'structural_runoff':dict(terminal_pv=runoff_pv,price=price_from_equity(explicit+runoff_pv-NET_DEBT)),
    'sensitivity_grid':{str(gg):{str(ww):dcf(BASE_CASH,ww,gg)['price']
        for ww in [w-.01,w,w+.01]} for gg in [g+.005,g,g-.005]},
}
for r in (matched,):
    assert abs(r['forward_price_check']-PRICE)<1e-9
    assert abs(dcf(r['cash_path'],w,g)['enterprise']-r['enterprise_target'])<1e-8
for name,case in matched_scenarios.items():
    assert abs(equity_claim(case['price'])-case['equity'])<1e-8, name
assert abs(sum(probabilities)-1)<1e-12
assert abs(sum(p*matched_scenarios[k]['return_pct'] for p,k in zip(probabilities,fixed_scenarios))
           -out['matched_aggregate']['expected_return_pct'])<1e-10

print(json.dumps(out, indent=2))
