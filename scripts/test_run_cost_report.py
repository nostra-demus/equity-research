#!/usr/bin/env python3
"""Self-contained tests for run_cost_report.py — inline fixtures, stdlib only, CI-runnable
(no ~/.claude dependency). Exits nonzero on any failure."""
import os, sys, json, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import run_cost_report as R

fails = []
def check(name, cond):
    print(f"  {'ok  ' if cond else 'FAIL'} {name}")
    if not cond: fails.append(name)

# --- 1. pricing formula vs hand-computed values ---
u = {'input_tokens':1000,'output_tokens':500,'cache_read_input_tokens':10000,'cache_creation_input_tokens':2000}
expect = (1000*3 + 10000*0.1*3 + 2000*1.25*3 + 500*15)/1e6   # sonnet $3in/$15out
check("token_cost sonnet == hand-computed", abs(R.token_cost('claude-sonnet-4-6', u) - expect) < 1e-9)
check("opus pricier than sonnet", R.token_cost('claude-opus-4-8', u) > R.token_cost('claude-sonnet-4-6', u))
check("haiku cheaper than sonnet", R.token_cost('claude-haiku-4-5', u) < R.token_cost('claude-sonnet-4-6', u))
check("unknown model defaults to sonnet", R.token_cost('mystery-x', u) == R.token_cost('claude-sonnet', u))
u1h = {'cache_creation':{'ephemeral_1h_input_tokens':1000,'ephemeral_5m_input_tokens':0}}
u5m = {'cache_creation':{'ephemeral_1h_input_tokens':0,'ephemeral_5m_input_tokens':1000}}
check("1h cache-write priced above 5m", R.token_cost('claude-sonnet', u1h) > R.token_cost('claude-sonnet', u5m))

# --- 1b. cache-creation resolution: the bug the review caught (flat field, no breakdown dict) ---
check("split: breakdown dict used when present", R._cache_creation_split({'cache_creation':{'ephemeral_5m_input_tokens':7,'ephemeral_1h_input_tokens':3}}) == (7,3))
check("split: flat field used when dict absent", R._cache_creation_split({'cache_creation_input_tokens':5000}) == (5000,0))
check("split: flat field used when dict present-but-zero", R._cache_creation_split({'cache_creation':{'ephemeral_5m_input_tokens':0,'ephemeral_1h_input_tokens':0},'cache_creation_input_tokens':5000}) == (5000,0))
check("split: partial dict respected (1h only)", R._cache_creation_split({'cache_creation':{'ephemeral_5m_input_tokens':0,'ephemeral_1h_input_tokens':9},'cache_creation_input_tokens':9}) == (0,9))
# and end-to-end: a flat-only usage must NOT be priced at $0 for cache-creation
flat = {'input_tokens':0,'output_tokens':10,'cache_read_input_tokens':0,'cache_creation_input_tokens':100000}
check("token_cost prices flat cache-creation (regression)", abs(R.token_cost('claude-sonnet-4-6', flat) - (100000*1.25*3 + 10*15)/1e6) < 1e-9)

# --- 2. dedup by requestId (correctness fix the demo exposed) ---
d = tempfile.mkdtemp()
def msg(rid, cr, cc, out, ttl_dict=True):
    usage = {"input_tokens":1,"output_tokens":out,"cache_read_input_tokens":cr,"cache_creation_input_tokens":cc}
    if ttl_dict: usage["cache_creation"] = {"ephemeral_5m_input_tokens":cc,"ephemeral_1h_input_tokens":0}
    return json.dumps({"attributionAgent":"moat","requestId":rid,"message":{"model":"claude-sonnet-4-6","usage":usage}})
sub = os.path.join(d, 'agent-x.jsonl')
with open(sub, 'w') as f:           # 2 billed calls, each logged twice (streaming partial + final)
    f.write(msg("req-1", 100, 50, 10) + "\n"); f.write(msg("req-1", 100, 50, 10) + "\n")
    f.write(msg("req-2", 200, 0, 20) + "\n");  f.write(msg("req-2", 200, 0, 20) + "\n")
atype, model, agg, calls = R.dedup_usage(sub)
check("dedup: 2 distinct calls, not 4 lines", calls == 2)
check("dedup: cache_read summed over calls only (300)", agg['cache_read_input_tokens'] == 300)
check("dedup: output summed over calls only (30)", agg['output_tokens'] == 30)
check("attributionAgent parsed", atype == "moat")

# --- 2b. dedup + pricing when messages carry ONLY the flat cache-creation field (no dict) ---
subflat = os.path.join(d, 'agent-flat.jsonl')
with open(subflat, 'w') as f:
    f.write(msg("r1", 0, 100000, 10, ttl_dict=False) + "\n")   # flat-only, 100k cache-creation
_, mf, aggf, _ = R.dedup_usage(subflat)
check("dedup: flat cache-creation folded into breakdown", aggf['cache_creation']['ephemeral_5m_input_tokens'] == 100000)
check("dedup->token_cost prices flat cache-creation (not $0)", R.token_cost(mf, aggf) > 0.37)

# --- 3. end-to-end: orchestrator + runtime from toolUseResult (snapshot NOT used for cost) ---
main = os.path.join(d, 'sess.jsonl')
with open(main, 'w') as f:
    f.write(json.dumps({"type":"assistant","requestId":"o-1","message":{"model":"claude-sonnet-4-6",
        "usage":{"input_tokens":5,"output_tokens":100,"cache_read_input_tokens":1000,"cache_creation_input_tokens":0}}})+"\n")
    f.write(json.dumps({"type":"user","toolUseResult":{"agentType":"moat","agentId":"a1",
        "totalDurationMs":123000,"totalTokens":151,"usage":{"input_tokens":1}}})+"\n")   # snapshot totalTokens ignored
res = R.attribute_session(main, [sub])
moat = next(a for a in res['agents'] if a['agent'] == 'moat')
check("runtime pulled from toolUseResult (123s)", moat['runtime_ms'] == 123000)
check("cost uses DEDUP tokens, not the 151 snapshot", moat['usage']['cache_read_input_tokens'] == 300)
check("orchestrator counted separately", res['orchestrator'] and res['orchestrator']['usage']['cache_read_input_tokens'] == 1000)

# --- 4. render is robust + surfaces module rollup ---
out = R.render(res, {'moat':'business-model'})
check("render emits table with module + total", "business-model" in out and "TOTAL list-price" in out)

# --- 5. agent_module_map includes BOTH module specialists AND top-level agents (--all gap fix) ---
repo = tempfile.mkdtemp()
os.makedirs(os.path.join(repo, '.claude/agents/business-model'))
with open(os.path.join(repo, '.claude/agents/business-model/09_moat.md'), 'w') as f:
    f.write("---\nname: moat\nlayer: 2\n---\n# moat\n")
with open(os.path.join(repo, '.claude/agents/synthesizer.md'), 'w') as f:          # top-level agent
    f.write("---\nname: synthesizer\nmodel: opus\n---\n# synth\n")
os.makedirs(os.path.join(repo, '.claude/agents/screener/candidate-surfacing'))     # swarm: 3-level nesting
with open(os.path.join(repo, '.claude/agents/screener/candidate-surfacing/01_ticker-mapping.md'), 'w') as f:
    f.write("---\nname: screener-ticker-mapping\nlayer: 1\n---\n# tm\n")
mm = R.agent_module_map(repo)
check("module map: research specialist -> its module", mm.get('moat') == 'business-model')
check("module map: top-level agent included (not dropped from --all)", mm.get('synthesizer') == '(top-level)')
check("module map: swarm specialist -> <swarm>/<module> (product-wide)", mm.get('screener-ticker-mapping') == 'screener/candidate-surfacing')

print("\nALL RUN_COST_REPORT TESTS PASS" if not fails else f"\n{len(fails)} FAILED: {fails}")
sys.exit(1 if fails else 0)
