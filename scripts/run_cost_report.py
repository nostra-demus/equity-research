#!/usr/bin/env python3
"""run_cost_report.py — per-agent cost & runtime attribution for a research/screener run.

READ-ONLY diagnostic. Reads the Claude Code transcripts the harness already writes
(`~/.claude/projects/<proj>/<session>.jsonl` = orchestrator; `.../<session>/subagents/*.jsonl`
= each Task specialist). It is NOT part of the run path and changes no run behaviour: it
only reads logs after the fact.

Cost basis — the one thing that must be right: dedup usage by `requestId` (one usage per
billed API call). Naive per-line summing over-counts ~1.8x because streaming logs ~2 usage
lines per call. The orchestrator's `toolUseResult.totalTokens` is a final-turn snapshot that
under-counts ~10x, so it is used only for RUNTIME (`totalDurationMs`), never for cost.

Cost is a LIST-PRICE estimate (tokens x published rate), not a billed invoice: under
subscription/plan auth the CLI reports `total_cost_usd=0`, so we always price from tokens.

Usage:
  run_cost_report.py --session <SESSION_UUID> [--projects-dir DIR] [--repo-root DIR] [--json OUT]
  run_cost_report.py --all [--projects-dir DIR] [--repo-root DIR] [--json OUT]
"""
from __future__ import annotations
import argparse, json, os, glob, sys, collections

# ---- pricing: per 1M tokens (input, output). Source: Anthropic list price, cached 2026-06-24. ----
MODEL_PRICES = {
    'claude-fable':    (10.0, 50.0),
    'claude-opus':     (5.0, 25.0),
    'claude-sonnet-5': (3.0, 15.0),
    'claude-sonnet':   (3.0, 15.0),
    'claude-haiku':    (1.0, 5.0),
}
DEFAULT_RATE = (3.0, 15.0)            # unknown model -> sonnet-tier
CACHE_READ_MULT, CACHE_5M_MULT, CACHE_1H_MULT = 0.10, 1.25, 2.00
USAGE_KEYS = ('input_tokens', 'output_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens')

def rate_for(model):
    if model:
        for k, v in MODEL_PRICES.items():
            if model.startswith(k):
                return v
    return DEFAULT_RATE

def token_cost(model, u):
    """List-price USD for a usage dict; splits cache-creation by 5m/1h TTL when present."""
    inp, out = rate_for(model)
    cc = u.get('cache_creation') or {}
    cc5, cc1 = cc.get('ephemeral_5m_input_tokens'), cc.get('ephemeral_1h_input_tokens')
    if cc5 is None and cc1 is None:
        cc5, cc1 = u.get('cache_creation_input_tokens', 0), 0   # no split -> price all at 5m rate
    cc5, cc1 = cc5 or 0, cc1 or 0
    return (u.get('input_tokens', 0) * inp
            + u.get('cache_read_input_tokens', 0) * CACHE_READ_MULT * inp
            + cc5 * CACHE_5M_MULT * inp
            + cc1 * CACHE_1H_MULT * inp
            + u.get('output_tokens', 0) * out) / 1e6

def _iter(path):
    try:
        with open(path, encoding='utf-8', errors='ignore') as f:
            for line in f:
                line = line.strip()
                if line:
                    try: yield json.loads(line)
                    except Exception: continue
    except OSError:
        return

def dedup_usage(path):
    """(attributionAgent, model, summed-usage, n_billed_calls) — usage deduped by requestId."""
    byreq, atype, model = {}, None, None
    for o in _iter(path):
        atype = atype or o.get('attributionAgent')
        m = o.get('message')
        if isinstance(m, dict):
            model = model or m.get('model')
            u = m.get('usage')
            if u:
                rid = o.get('requestId') or m.get('id') or len(byreq)
                byreq[rid] = u                       # keep final usage per billed call
    agg = {k: 0 for k in USAGE_KEYS}
    cc5 = cc1 = 0
    for u in byreq.values():
        for k in USAGE_KEYS: agg[k] += u.get(k, 0)
        cc = u.get('cache_creation') or {}
        cc5 += cc.get('ephemeral_5m_input_tokens', 0) or 0
        cc1 += cc.get('ephemeral_1h_input_tokens', 0) or 0
    agg['cache_creation'] = {'ephemeral_5m_input_tokens': cc5, 'ephemeral_1h_input_tokens': cc1}
    return atype, model, agg, len(byreq)

def runtimes_from_main(main_path):
    rt = collections.Counter()
    for o in _iter(main_path):
        tur = o.get('toolUseResult')
        if isinstance(tur, dict) and tur.get('agentType'):
            rt[tur['agentType']] += tur.get('totalDurationMs', 0) or 0
    return rt

def attribute_session(main_path, subagent_paths):
    rt = runtimes_from_main(main_path) if main_path else collections.Counter()
    agents = {}
    for p in subagent_paths:
        atype, model, u, calls = dedup_usage(p)
        if not atype: continue
        a = agents.setdefault(atype, dict(agent=atype, model=model, calls=0,
                                          usage={k: 0 for k in USAGE_KEYS}, cost=0.0))
        a['model'] = a['model'] or model
        a['calls'] += calls
        for k in USAGE_KEYS: a['usage'][k] += u[k]
        a['cost'] += token_cost(model, u)
    for atype, a in agents.items():
        a['runtime_ms'] = rt.get(atype, 0)
    orch = None
    if main_path:
        _, om, ou, oc = dedup_usage(main_path)
        orch = dict(agent='(orchestrator)', model=om, calls=oc,
                    usage={k: ou[k] for k in USAGE_KEYS}, cost=token_cost(om, ou), runtime_ms=0)
    return {'agents': list(agents.values()), 'orchestrator': orch}

# ---- discovery + module map ----
def find_session(projects_dir, session_id):
    main = next(iter(glob.glob(f'{projects_dir}/*/{session_id}.jsonl')), None)
    subs = glob.glob(f'{projects_dir}/*/{session_id}/subagents/*.jsonl')
    return main, subs

def agent_module_map(repo_root):
    m = {}
    for p in glob.glob(f'{repo_root}/.claude/agents/*/*.md'):
        module, name = os.path.basename(os.path.dirname(p)), None
        for line in _readlines(p)[:12]:
            if line.startswith('name:'):
                name = line.split(':', 1)[1].strip(); break
        if name: m[name] = module
    return m

def _readlines(p):
    try:
        with open(p, encoding='utf-8', errors='ignore') as f: return f.readlines()
    except OSError: return []

# ---- reporting ----
def _u(u): return sum(u.get(k, 0) for k in USAGE_KEYS)

def render(result, modmap=None, title=''):
    modmap = modmap or {}
    agents = sorted(result['agents'], key=lambda a: -a['cost'])
    lines = [f"# run cost report {title}".rstrip(), ""]
    lines.append(f"{'agent':30s} {'module':22s} {'model':13s} {'calls':>5} {'billed_tok':>11} {'cache%':>6} {'runtime':>8} {'$list':>7}")
    tot = collections.Counter(); comp = collections.Counter(); costsum = 0.0
    for a in agents:
        u = a['usage']; ctx = u['input_tokens'] + u['cache_read_input_tokens'] + u['cache_creation_input_tokens']
        cachepct = 100*u['cache_read_input_tokens']/ctx if ctx else 0
        mdl = (a['model'] or '?').replace('claude-', '')
        lines.append(f"{a['agent'][:30]:30s} {modmap.get(a['agent'],'?')[:22]:22s} {mdl[:13]:13s} {a['calls']:>5} {_u(u):>11,} {cachepct:>5.0f}% {a['runtime_ms']/1000:>6.0f}s {a['cost']:>7.3f}")
        costsum += a['cost']
        for k in USAGE_KEYS: tot[k] += u[k]
        _accrue(comp, a['model'], u)
    orch = result.get('orchestrator')
    if orch:
        lines.append("-"*104)
        lines.append(f"{'(orchestrator own context)':30s} {'':22s} {(orch['model'] or '?').replace('claude-','')[:13]:13s} {orch['calls']:>5} {_u(orch['usage']):>11,} {'':>6} {'':>8} {orch['cost']:>7.3f}")
        costsum += orch['cost']
        for k in USAGE_KEYS: tot[k] += orch['usage'][k]
        _accrue(comp, orch['model'], orch['usage'])
    allt = sum(tot.values()) or 1; totcost = sum(comp.values()) or 1e-9
    lines += ["", f"TOTAL list-price cost: ${costsum:.2f}"
              + (f"   (orchestrator {100*orch['cost']/costsum:.0f}% overhead)" if orch and costsum else "")]
    lines.append("cost by token type:  " + "  ".join(f"{k} ${comp[k]:.2f} ({100*comp[k]/totcost:.0f}%)"
                 for k in ('cache_creation','cache_read','output','input')))
    lines.append(f"token mix:  cache_read {100*tot['cache_read_input_tokens']/allt:.0f}%  "
                 f"cache_create {100*tot['cache_creation_input_tokens']/allt:.0f}%  "
                 f"output {100*tot['output_tokens']/allt:.1f}%  input {100*tot['input_tokens']/allt:.1f}%")
    lines.append("NOTE: list-price estimate (tokens x published rate); not a billed invoice.")
    return "\n".join(lines)

def _accrue(comp, model, u):
    inp, out = rate_for(model)
    cc = u.get('cache_creation') or {}
    cc5 = cc.get('ephemeral_5m_input_tokens'); cc1 = cc.get('ephemeral_1h_input_tokens')
    if cc5 is None and cc1 is None: cc5, cc1 = u.get('cache_creation_input_tokens', 0), 0
    cc5, cc1 = cc5 or 0, cc1 or 0
    comp['input'] += u.get('input_tokens',0)*inp/1e6
    comp['cache_read'] += u.get('cache_read_input_tokens',0)*CACHE_READ_MULT*inp/1e6
    comp['cache_creation'] += (cc5*CACHE_5M_MULT + cc1*CACHE_1H_MULT)*inp/1e6
    comp['output'] += u.get('output_tokens',0)*out/1e6

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--session', help='session UUID to attribute (one run)')
    ap.add_argument('--all', action='store_true', help='fleet: aggregate every research sub-agent on disk')
    ap.add_argument('--projects-dir', default=os.path.expanduser('~/.claude/projects'))
    ap.add_argument('--repo-root', default=os.getcwd(), help='repo root (for the agent->module map)')
    ap.add_argument('--json', help='also write the structured report to this path')
    args = ap.parse_args(argv)
    modmap = agent_module_map(args.repo_root)
    if args.session:
        main_path, subs = find_session(args.projects_dir, args.session)
        if not subs and not main_path:
            print(f"no transcripts found for session {args.session} under {args.projects_dir}", file=sys.stderr); return 2
        result = attribute_session(main_path, subs)
        print(render(result, modmap, title=f"— session {args.session[:12]}"))
    elif args.all:
        subs = glob.glob(f'{args.projects_dir}/*/*/subagents/*.jsonl')
        result = attribute_session(None, subs)
        result['agents'] = [a for a in result['agents'] if a['agent'] in modmap]  # research only
        print(render(result, modmap, title="— fleet (all research sub-agents on disk)"))
    else:
        ap.print_help(); return 2
    if args.json:
        with open(args.json, 'w') as f: json.dump(result, f, indent=2)
        print(f"\nwrote {args.json}", file=sys.stderr)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
