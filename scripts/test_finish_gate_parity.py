#!/usr/bin/env python3
"""Finish-gate parity guard — every live-relevant deterministic detector runs in BOTH places.

WHY THIS EXISTS. The engine's deterministic finish-gate is implemented TWICE, on purpose:

  1. RETROSPECTIVE — `scripts/eval.py` grades already-committed runs (the golden-run harness,
     `/research:eval`). It reaches the shared `eval_*` detector functions either by calling them
     directly or by calling the module-level `scan_committed()` aggregator that invokes them.
  2. LIVE, PRE-PUBLISH — `.claude/commands/research/full.md` Step 10B.x embeds those SAME
     detectors in `python3 - "<RUN_ROOT>" <<'PY' … PY` heredocs that stamp `final_thesis.md`
     PROVISIONAL on a violation BEFORE the run commits.

The detection logic is deliberately extracted into shared, side-effect-free modules
(`rating_caps.py`, `headline_checks.py`, `scenario_integrity_checks.py`,
`sector_valuation_checks.py`, `calibration_gate_checks.py`, `valuation_summary_checks.py`,
`valuation_basis_checks.py`, `verify_evidence_checks.py`, `supersession_integrity_checks.py`, …)
so the SAME function runs in both callers instead of being re-implemented and drifting.

THE RECURRING BUG THIS CLOSES. A new check lands in `eval.py` (retrospective) but its call is
forgotten in the `full.md` live gate. A thesis that violates the check then prints the live
gate's `GATE: PASS`, loses nothing, and — because research DATA commits straight to `main`
without CI (CLAUDE.md §25/§28) — ships the violation to `main` undetected, until someone
remembers to run the retrospective harness later. The repo has paid for this exact class of
defect repeatedly and fixed each ONE reactively: the extraction docstrings record it for check W
("defined only inline in eval.py, the one place the live finish-gate could never reach"), for
AT/AU/AV ("ran only inside scripts/eval.py — a post-hoc grading pass a human has to remember to
run"), and for AA/AB/AG/AI/AK/AQ/BB/BD/BE/BF/BG/BH/BI/BJ as each shared module was created.

The existing `scripts/test_live_gate_*.py` tests each guard ONE check's wiring with bespoke
fixtures. None guards the GENERAL invariant, so the NEXT detector added without a live-gate call —
and without a bespoke per-check test — still ships silently. This guard closes the whole class
ONCE and covers every FUTURE detector with no per-check wiring (CLAUDE.md §26 spirit):

  INVARIANT 1 (the historical bug): every shared `eval_*` detector the retrospective grader can
  reach must ALSO be called in the live finish-gate heredoc(s), unless it is on an explicit,
  reasoned allowlist of detectors that are deliberately NOT part of the per-thesis finish gate.

  INVARIANT 2 (the mirror): every detector called in the live gate must ALSO be reachable from
  the retrospective grader, so the golden-run harness can still regression-test it.

  INVARIANT 3 (the inline sub-class): every `eval_*` check still DEFINED INLINE in `eval.py`
  must be CLASSIFIED in `INLINE_EVAL` — either `live` (the 10B gate enforces it WITHOUT a shared
  call: a hand-written re-implementation in a heredoc, or a shell invocation of eval.py itself;
  the entry names a marker that must still be present in the 10B section) or `retrospective`
  (deliberately or currently NOT enforced before publish, with a stated reason). The live gate
  cannot call an eval.py-defined function by name, so call-site parity is impossible here; what
  the guard CAN enforce is that no inline check exists without a recorded, reviewable decision.
  A NEW inline `eval_*` added to eval.py therefore fails CI until someone either extracts it to a
  shared module (Invariants 1/2 then apply) or classifies it — it can no longer land silently.
  A `live` marker is evidence that the mirror is still THERE, not that it is faithful; fidelity
  stays with the per-check `scripts/test_live_gate_*.py` suite.

WHAT IT IS NOT. This is a WIRING guard, not a behaviour test: it proves each detector is reached
from both callers, not that the detector is correct (the module `--selftest`s / `eval.py
selftest` / `test_live_gate_*.py` do that) and not that the gate's PROVISIONAL plumbing fires
(the per-check live-gate tests do that). It reads source text only; it executes nothing and
never touches `analyses/`.

THREE SUBTLETIES IT GETS RIGHT.
  · Detection is by real, EXECUTABLE call site — an `ast.Call` node — not string presence.
    `eval.py` carries a provenance manifest (file → token lists) that MENTIONS detector names as
    data, and both callers are heavily commented; a text match would count a name inside a string,
    comment or docstring as a call and hide a genuinely-unwired detector. Each caller is parsed
    (eval.py as a module, every 10B heredoc as its own script); a block that does not parse fails
    the guard loudly rather than being skipped.
  · Only the GRADING path counts as "graded". `eval.py`'s `if scope=="selftest":` block, and a
    shared module's `_selftest`/`__main__` code, exercise detectors with synthetic inputs but
    grade no committed run — a detector called only there is NOT grader-reachable.
  · The grader reaches some detectors only THROUGH a module's `scan_committed()` aggregator
    (`eval_ap_*`, `eval_bf_*`, `eval_multiple_metric_basis`, `eval_scenario_basis_coherence` are
    graded that way, never called by name in eval.py). A detector therefore counts as graded when
    eval.py calls it directly — through a binding that resolves to its defining module, so a call
    that outlived its import does not count — OR when its defining module exposes `scan_committed`, eval.py
    imports from that module, and the module's own non-selftest code calls it.

Self-contained, fixture-free, exits nonzero on failure so CI fails loudly.
"""
import ast
import os
import re
import sys
import glob

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS = os.path.join(REPO_ROOT, "scripts")
FULL_MD = os.path.join(REPO_ROOT, ".claude", "commands", "research", "full.md")
EVAL_PY = os.path.join(SCRIPTS, "eval.py")

# ── The allowlist: detectors the grader reaches but that are deliberately NOT wired into the ──────
# per-thesis finish gate. Each entry needs a reason a reviewer can check. The guard enforces that
# every entry is a real, grader-reachable detector that is genuinely ABSENT from the live gate — a
# stale or unnecessary entry fails just as loudly as a missing wiring, so the allowlist cannot rot
# into a place to hide a real gap.
RETROSPECTIVE_ONLY = {
    "eval_an_supersession_integrity":
        "Live at the corrections-prewrite gate (scripts/corrections_prewrite_gate.py), a DIFFERENT "
        "publish path (ledger supersession, ui/server ledger-corrections.ts) from the thesis "
        "finish gate — not a per-thesis-publish check, so it does not belong in full.md Step 10B.",
    "eval_release_gate_eligible":
        "A release-eligibility helper (provider-parity / supersession run-metadata), not a "
        "per-thesis doctrine detector; it gates a release decision, never a single run's publish.",
    "eval_as_forecast_overdue":
        "CLAUDE.md §19 ADVISORY overdue check — fires at review time over an elapsed forecast "
        "window, not at publish; advisory by construction (never fatal), so it has no place in the "
        "pre-publish finish gate.",
    "eval_aw_kill_criteria_overdue":
        "Advisory overdue check — fires when a kill-criterion's own monitor event has elapsed "
        "unchecked, at review time, not at publish; advisory by construction, so not a finish-gate "
        "detector.",
    "eval_statistic_label":
        "A PREVENTIVE check over 02's markdown prose (the min-max range printed under the word "
        "'percentile'); the thesis finish gate enforces valuation basis through the sidecar "
        "detectors (eval_bf_basis_enforcement + eval_multiple_metric_basis), and statistic_label "
        "runs only in valuation_basis_checks.scan_committed while its sidecar field is pending "
        "(valuation_basis_checks.BF_SIDECAR_REQUIRED_DATE is None).",
}

# Detectors legitimately called in the live gate but NOT reachable from the retrospective grader.
# Expected empty: a check the live gate runs that the grader cannot reach would mean the golden-run
# harness can no longer regression-test it. Kept as an explicit, reasoned escape hatch.
GATE_ONLY_OK = {}

# ── Invariant 3 registry: every `eval_*` check defined INLINE in eval.py, classified. ────────────
# kind "live":  (kind, marker_regex, note) — the 10B gate's EXECUTABLE text must still match
#   marker_regex. That text is each heredoc re-rendered from its AST with string literals emptied (so comments and message text are gone and a
#   marker can only match real code) plus the shell command lines of the 10B section. A marker is
#   therefore written against the check's own condition, not against the comment describing it.
# kind "retrospective": (kind, None, reason) — not enforced by the pre-publish gate; say why.
# An inline check missing from this table, a table entry that is no longer an inline check, an
# empty note, or a `live` marker that no longer matches the 10B section each FAIL the guard.
INLINE_EVAL = {
    "eval_x_verify_floor": (
        "live", r"if verdict not in \(",
        "10B.2 stamps PROVISIONAL on any verify-evidence verdict outside Clean / Minor issues "
        "(hand-written, and stricter than check X: it applies to every run, not only conviction baskets)."),
    "eval_y_data_sufficiency": (
        "live", r"\(?ds < 30\)? and \(?dec != ",
        "10B.1 re-implements the §11 data-sufficiency ↔ decision cap in its heredoc."),
    "eval_z_thesis_type_cap": (
        "live", r"t in _EXTERNAL for t in tt\)+ and \(?dec in _ABOVE_STARTER",
        "10B.1 re-implements the §14 thesis_type enum + external-variable conviction cap in its heredoc."),
    "eval_ah_expectations_gap_gate": (
        "live", r"no_edge and _isnum\(cf\) and \(?cf > 60",
        "10B.3 re-implements the expectations-gap existence + §7 edge-consistency stamp in its heredoc."),
    "eval_ax_data_needs_v2": (
        "live", r"python3 scripts/eval\.py --data-needs-prewrite",
        "10B.3-prewrite shells out to eval.py's own creation-time scope, which calls this function "
        "directly (no re-implementation) and STOPS the run before sealing on a failure."),
    "eval_ay_fixture_integrity": (
        "retrospective", None,
        "Grades the resolved integrity status of an ALREADY-COMMITTED run (verified / provisional / "
        "unaudited) for the golden-fixture floor; that status does not exist until after publish, so "
        "there is nothing for a pre-publish gate to test."),
    "eval_t_probability": (
        "retrospective", None,
        "NOT enforced before publish today: the 10B heredocs validate forecast_ledger rows for "
        "trigger tests, resolvability and probability BASIS (BK / AO / BC) but not the 0-100 "
        "probability SCALE. Recorded as an open live-gate gap, not a design decision — closing it "
        "means extracting this check to a shared module and calling it in 10B.1."),
    "eval_forecast_type": (
        "retrospective", None,
        "NOT enforced before publish today: the forecast_type closed enum is graded only "
        "retrospectively. Recorded as an open live-gate gap (same remedy as eval_t_probability)."),
    "eval_forecast_entry_completeness": (
        "retrospective", None,
        "NOT enforced before publish today: owner_module / confidence_score / evidence_today "
        "presence (CLAUDE.md §19) is graded only retrospectively. Recorded as an open live-gate gap "
        "(same remedy as eval_t_probability)."),
}

_DEF_RE = re.compile(r"^(?:async[ \t]+)?def[ \t]+(eval_[A-Za-z0-9_]+)\s*\(", re.M)


def defined_detectors(text, what):
    """The `eval_*` functions a module really DEFINES at module level — read from parsed
    `FunctionDef` / `AsyncFunctionDef` nodes, never from text. A column-0 `def eval_x(` line left
    behind in a docstring, comment-adjacent string or example is not a definition: counting it
    would keep a removed detector "defined", so a stale call in both callers would satisfy parity
    and slip past stale_live_calls() while crashing at run time. `_DEF_RE` is only a cheap
    prefilter (a real module-level def always matches it), so a file with no candidate line is
    never parsed; a candidate file that does not parse raises ValueError naming `what`, and so
    does an `async def` detector (neither caller awaits, so it could never execute)."""
    if not _DEF_RE.search(text):
        return []
    try:
        tree = ast.parse(text)
    except SyntaxError as e:
        raise ValueError(f"{what}: does not parse as Python ({e.msg}, line {e.lineno}) — refusing "
                         "to judge which detectors it defines from unparseable source.")
    is_async = [n.name for n in tree.body
                if isinstance(n, ast.AsyncFunctionDef) and n.name.startswith("eval_")]
    if is_async:
        # Both callers are synchronous: a bare `eval_x(...)` on an `async def` only builds a
        # coroutine, so the detector body would never run while call-site parity reported it wired.
        raise ValueError(f"{what}: detector(s) {sorted(is_async)} are `async def` — the grader and the "
                         "live gate call detectors synchronously, so an async detector would never "
                         "execute. Make it a plain `def`.")
    return [n.name for n in tree.body
            if isinstance(n, ast.FunctionDef) and n.name.startswith("eval_")]


def discover_detectors(scripts_dir=SCRIPTS):
    """Every `eval_*` detector DEFINED under scripts/ (recursively), outside the grader and tests.

    These are the shared, dual-use detection functions. Discovery is dynamic so a future shared
    module is covered with no edit here (CLAUDE.md §26 zero-touch). eval.py is excluded (it is the
    grader, not a detector library); test_*.py are excluded (their re-defined stubs are not the
    source of truth). Definitions come from the parsed AST (see defined_detectors), so a `def eval_x(`
    line surviving only in a docstring or string is not a detector. A glob match that is not a regular file (e.g. a directory named `*.py`) is
    skipped before any open(), so discovery cannot crash on an odd tree. Returns
    (name -> defining basename, name -> set of basenames if duplicated)."""
    found = {}
    dupes = {}
    for path in sorted(glob.glob(os.path.join(scripts_dir, "**", "*.py"), recursive=True)):
        base = os.path.relpath(path, scripts_dir).replace(os.sep, "/")
        leaf = os.path.basename(path)
        if (not os.path.isfile(path) or base == "eval.py" or re.match(r"test[_-]", leaf)
                or "node_modules/" in base or "__pycache__/" in base):
            continue
        with open(path, encoding="utf-8") as f:
            text = f.read()
        for name in defined_detectors(text, f"scripts/{base}"):
            if name in found and found[name] != base:
                dupes.setdefault(name, {found[name]}).add(base)
            else:
                found.setdefault(name, base)
    return found, dupes


def _selftest_guard(test):
    """Classify an `if` test: "eq" for `<x> == "selftest"` / `"--selftest"` / `__name__ ==
    "__main__"` (the BODY is self-test code), "ne" for the same comparison with `!=` (the ELSE
    branch is self-test code), None for anything else. The operator is checked, not just the
    operands — `if scope != "selftest":` guards PRODUCTION code and must not be pruned."""
    if not isinstance(test, ast.Compare) or len(test.comparators) != 1 or len(test.ops) != 1:
        return None
    if not any(isinstance(side, ast.Constant) and side.value in ("selftest", "--selftest", "__main__")
               for side in (test.left, test.comparators[0])):
        return None
    if isinstance(test.ops[0], ast.Eq):
        return "eq"
    if isinstance(test.ops[0], ast.NotEq):
        return "ne"
    return None


def _is_dead_test(test):
    """`if False:` / `if 0:` / `if None:` — a branch that can never run."""
    return isinstance(test, ast.Constant) and not test.value


def _is_selftest_def(node):
    return (isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
            and re.match(r"_*(selftest|self_test)", node.name) is not None)


def executable_calls(src, what, skip_selftest=False, entry_only=False, detail=None):
    """The set of names CALLED by executable code in `src` — `f(...)` and `mod.f(...)` both yield
    `f`. Parsed with `ast`, so a name inside a comment, string or docstring is never a call and a
    `def f(` line is never a call to `f`. A constant-false branch (`if False:`) is never executed
    and is ignored. With skip_selftest, code that only runs in a self-test is ignored: the
    self-test side of an `if <x> == / != "selftest":` or `__name__ == / != "__main__"` block and
    any function named `_selftest*`. With entry_only, a call inside a function body counts only
    if that function is itself called — transitively — from the script's top-level code, so a
    detector call parked in a helper nobody invokes is not mistaken for a live one. A source that
    does not parse raises ValueError naming `what`, so the guard fails loudly instead of passing
    on nothing. If `detail` is a dict it is filled, from the SAME pruned walk, with `bare` (names
    called as `f(...)`) and `qualified` (`(receiver, f)` pairs for `receiver.f(...)`), so a caller
    can resolve a call against its import on the path that actually executes."""
    try:
        tree = ast.parse(src)
    except SyntaxError as e:
        raise ValueError(f"{what}: does not parse as Python ({e.msg}, line {e.lineno}) — refusing "
                         "to judge call-site parity on unparseable source.")
    top = set()          # calls made outside any function body
    in_func = {}         # function name -> calls made inside its body (same-named defs merged)

    def visit(node, bucket):
        if skip_selftest and _is_selftest_def(node):
            return
        if isinstance(node, ast.If):
            if _is_dead_test(node.test):
                for child in node.orelse:
                    visit(child, bucket)
                return
            guard = _selftest_guard(node.test) if skip_selftest else None
            if guard:
                for child in (node.orelse if guard == "eq" else node.body):
                    visit(child, bucket)
                return
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            # decorators and default values run at definition time, in the enclosing scope
            for child in node.decorator_list + node.args.defaults + [d for d in node.args.kw_defaults if d]:
                visit(child, bucket)
            inner = in_func.setdefault(node.name, set())
            for child in node.body:
                visit(child, inner)
            return
        if isinstance(node, ast.Call):
            f = node.func
            if isinstance(f, ast.Name):
                bucket.add(f.id)
                if detail is not None:
                    detail.setdefault("bare", set()).add(f.id)
            elif isinstance(f, ast.Attribute):
                bucket.add(f.attr)
                if detail is not None and isinstance(f.value, ast.Name):
                    detail.setdefault("qualified", set()).add((f.value.id, f.attr))
        for child in ast.iter_child_nodes(node):
            visit(child, bucket)

    visit(tree, top)
    if not entry_only:
        return top.union(*in_func.values()) if in_func else set(top)
    reached, frontier = set(top), [n for n in in_func if n in top]
    seen = set()
    while frontier:
        fn = frontier.pop()
        if fn in seen:
            continue
        seen.add(fn)
        reached |= in_func[fn]
        frontier.extend(n for n in in_func if n in in_func[fn] and n not in seen)
    return reached


def wrapper_delegates(eval_src, name, modbase):
    """True iff eval.py's own `def name(...)` is a thin wrapper that CALLS the shared `name`
    imported from its defining module (under any alias). A same-named eval.py function that does
    not delegate is a second, divergent implementation: the grader would run one body and the live
    gate another while name-based parity reported both as wired."""
    modname = os.path.basename(modbase)
    modname = modname[:-3] if modname.endswith(".py") else modname
    tree = ast.parse(eval_src)
    local = {a.asname or a.name for n in ast.walk(tree) if isinstance(n, ast.ImportFrom)
             and n.module and n.module.split(".")[-1] == modname
             for a in n.names if a.name == name}
    local.discard(name)  # the inline def shadows an un-aliased import, so that is not delegation
    for n in ast.walk(tree):
        if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name == name:
            if any(isinstance(c, ast.Call) and isinstance(c.func, ast.Name) and c.func.id in local
                   for c in ast.walk(n)):
                return True
    return False


def grader_calls_detector(eval_src, name, modbase, detail):
    """True iff eval.py's grading code calls `name` THROUGH a binding to its defining module — the
    same resolution unresolved_live_calls() applies to the live heredocs. A call counts when it is
      · a bare call to a local name bound by `from <module> import name [as alias]`,
      · a module-qualified call `m.name(...)` where `m` is `import <module> [as m]`, or
      · a call to eval.py's own same-named `def name` (a wrapper; that it delegates to the shared
        definition is checked separately by wrapper_delegates()).
    `detail` is the bare / receiver-qualified call record executable_calls(eval_src,
    skip_selftest=True, detail=...) fills, so the call AND its receiver are judged on the same
    production path — a correctly qualified call living only in the self-test branch cannot be
    joined to an unrelated `other.name(...)` in production. Name-only membership is NOT enough: if the import is deleted or renamed while the call stays, the grader
    raises NameError — or runs an unrelated same-named symbol — yet name-only matching would still
    report the detector as graded."""
    modname = os.path.basename(modbase)
    modname = modname[:-3] if modname.endswith(".py") else modname
    tree = ast.parse(eval_src)
    bound, mod_alias, wrapped = set(), set(), False
    for n in ast.walk(tree):
        if isinstance(n, ast.ImportFrom) and n.module and n.module.split(".")[-1] == modname:
            bound |= {a.asname or a.name for a in n.names if a.name == name}
        elif isinstance(n, ast.Import):
            mod_alias |= {a.asname or a.name.split(".")[0] for a in n.names
                          if a.name.split(".")[-1] == modname}
        elif isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name == name:
            wrapped = True
    bare, qualified = detail.get("bare", set()), detail.get("qualified", set())
    if wrapped:
        return name in bare
    return bool(bound & bare) or any((m, name) in qualified for m in mod_alias)


def stale_live_calls(live_calls, detectors):
    """`eval_*` names the live gate calls that no shared module defines — a detector renamed or
    removed while its full.md call stayed behind. The heredoc would die on a NameError /
    AttributeError at publish time instead of enforcing anything."""
    return sorted(n for n in live_calls if n.startswith("eval_") and n not in detectors)


def live_imports(tree):
    """Import bindings a heredoc script really has at MODULE scope when it runs: (module alias ->
    module, local name -> (module, real name)). An import under a constant-false branch never
    executes, and one inside a function / class body binds a local there, not a module-level name
    — neither makes a top-level `q.eval_x(...)` resolvable, so neither is collected."""
    mod_alias, from_name = {}, {}

    def visit(node):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda)):
            return
        if isinstance(node, ast.If) and _is_dead_test(node.test):
            for child in node.orelse:
                visit(child)
            return
        if isinstance(node, ast.Import):
            for a in node.names:
                mod_alias[a.asname or a.name.split(".")[0]] = a.name.split(".")[-1]
        elif isinstance(node, ast.ImportFrom) and node.module:
            for a in node.names:
                from_name[a.asname or a.name] = (node.module.split(".")[-1], a.name)
        for child in ast.iter_child_nodes(node):
            visit(child)

    visit(tree)
    return mod_alias, from_name


def gate_calls(blocks):
    """Names called across the 10B finish-gate heredocs, each parsed as its own script. A call
    through a `from <module> import real as alias` binding is recorded under the REAL name — the
    function that actually executes — so `from m import eval_q as eval_r; eval_r(...)` counts as a
    live call to eval_q, never to eval_r."""
    names = set()
    for k, block in enumerate(blocks, 1):
        called = executable_calls(block, f"full.md 10B heredoc #{k}", entry_only=True)
        _mods, from_name = live_imports(ast.parse(block))
        for local, (_mod, real) in from_name.items():
            if local != real and local in called:
                called.discard(local)
                called.add(real)
        names |= called
    return names


def inline_eval_defs(eval_src):
    """Every `eval_*` function DEFINED in eval.py (any nesting level)."""
    return sorted({n.name for n in ast.walk(ast.parse(eval_src))
                   if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name.startswith("eval_")})


def evaluate_inline(inline_defs, shared, section_text, registry=None):
    """Invariant 3. `inline_defs` = eval_* names defined in eval.py; `shared` = names that are ALSO
    shared-module detectors (thin eval.py wrappers — Invariants 1/2 already cover those);
    `section_text` = the 10B gate's executable text (see extract_gate_blocks). Returns [(name, 'inv3', message)]."""
    if registry is None:
        registry = INLINE_EVAL
    issues = []
    todo = [n for n in inline_defs if n not in shared]
    for name in todo:
        if name not in registry:
            issues.append((name, "inv3", "is defined inline in eval.py but is not classified in INLINE_EVAL"))
    for name in sorted(registry):
        entry = registry[name]
        if name not in todo:
            issues.append((name, "inv3", "INLINE_EVAL entry is not an inline eval.py check (renamed, removed, or extracted to a shared module?)"))
            continue
        if not (isinstance(entry, tuple) and len(entry) == 3 and entry[0] in ("live", "retrospective")):
            issues.append((name, "inv3", "INLINE_EVAL entry must be (\"live\"|\"retrospective\", marker_or_None, note)"))
            continue
        kind, marker, note = entry
        if not note or not note.strip():
            issues.append((name, "inv3", "INLINE_EVAL entry has no note/reason"))
        if kind == "live":
            if not marker or re.search(marker, section_text) is None:
                issues.append((name, "inv3", f"INLINE_EVAL says the 10B gate enforces it, but marker /{marker}/ is no longer in the 10B gate's executable code — the live mirror was removed or rewritten"))
        elif marker is not None:
            issues.append((name, "inv3", "INLINE_EVAL retrospective entry must not carry a marker"))
    return issues


def module_scanned_by_eval(name, modbase, eval_src, scripts_dir=SCRIPTS):
    """True iff the grader reaches `name` through its module's `scan_committed` aggregator: the
    defining module exposes `scan_committed`, eval.py imports from that module, AND the module's
    own executable, non-selftest code actually CALLS `name` (so scan_committed or a helper reaches
    it). This is how eval_ap_* / eval_bf_* / the basis detectors are graded. Requiring the real
    in-module call — not just the import — means a detector newly dropped into a scan_committed
    module but never invoked by it (or invoked only by the module's `_selftest`) is NOT counted
    grader-reachable, so it cannot silently evade Invariant 2. The import is matched with a
    whitespace-tolerant regex (not a fixed-spacing substring)."""
    modname = os.path.basename(modbase)
    modname = modname[:-3] if modname.endswith(".py") else modname
    with open(os.path.join(scripts_dir, modbase), encoding="utf-8") as f:
        mtext = f.read()
    has_scan = "def scan_committed(" in mtext
    imported = re.search(r"from\s+(?:[\w.]+\.)?" + re.escape(modname) + r"\s+import\b", eval_src) is not None
    if not (has_scan and imported):
        return False
    # executable, non-selftest call inside the module (a call only in `_selftest` grades nothing)
    return name in executable_calls(mtext, f"scripts/{modbase}", skip_selftest=True)


def evaluate(detectors, graded, in_gate, retro_only=None, gate_only=None):
    """Pure core: given the detector set and, per detector, whether the grader reaches it (`graded`)
    and whether the live gate calls it (`in_gate`), return (issues, n_live). `issues` is a list of
    (name, code, message) — code in {allowlist, inv1, inv2} — so both the live run and the built-in
    self-check share one source of truth and the self-check proves the predicate is not vacuous.

    Both allowlists are held to the SAME hygiene so neither can rot into a hiding place: every
    RETROSPECTIVE_ONLY entry must be a discovered, grader-reachable detector that is genuinely
    absent from the live gate; every GATE_ONLY_OK entry must be a discovered detector the live gate
    actually calls and the grader genuinely cannot reach. A stale or bogus exemption in EITHER list
    fails as loudly as a missing wiring (a wrong GATE_ONLY_OK entry would otherwise suppress a real
    Invariant-2 gap indefinitely). The lists default to the module globals; the self-check passes
    crafted ones to prove the hygiene fires."""
    if retro_only is None:
        retro_only = RETROSPECTIVE_ONLY
    if gate_only is None:
        gate_only = GATE_ONLY_OK
    issues = []
    for name in sorted(retro_only):
        reason = retro_only[name]
        if name not in detectors:
            issues.append((name, "allowlist", "RETROSPECTIVE_ONLY: allowlisted but not a discovered detector (renamed or removed?)"))
            continue
        if not reason or not reason.strip():
            issues.append((name, "allowlist", "RETROSPECTIVE_ONLY: allowlisted with no reason"))
        if not graded.get(name):
            issues.append((name, "allowlist", "RETROSPECTIVE_ONLY: allowlisted but the grader never reaches it — no obligation to exempt"))
        if in_gate.get(name):
            issues.append((name, "allowlist", "RETROSPECTIVE_ONLY: allowlisted but the live gate DOES call it — stale exemption"))
    for name in sorted(gate_only):
        reason = gate_only[name]
        if name not in detectors:
            issues.append((name, "allowlist", "GATE_ONLY_OK: allowlisted but not a discovered detector (renamed or removed?)"))
            continue
        if not reason or not reason.strip():
            issues.append((name, "allowlist", "GATE_ONLY_OK: allowlisted with no reason"))
        if not in_gate.get(name):
            issues.append((name, "allowlist", "GATE_ONLY_OK: allowlisted but the live gate never calls it — no obligation to exempt"))
        if graded.get(name):
            issues.append((name, "allowlist", "GATE_ONLY_OK: allowlisted but the grader DOES reach it — stale exemption"))
    n_live = 0
    for name in sorted(detectors):
        if graded.get(name) and name not in retro_only:
            n_live += 1
            if not in_gate.get(name):
                issues.append((name, "inv1", "grader-reachable but NOT called by the live finish gate"))
    for name in sorted(detectors):
        if in_gate.get(name) and name not in gate_only and not graded.get(name):
            issues.append((name, "inv2", "called by the live gate but NOT reachable from the grader"))
    return issues, n_live


def selfcheck():
    """Prove every predicate can both pass and fail, so a broken extractor/regex can't make the
    guard pass vacuously. Synthetic, no I/O. Each block is the permanent red-on-broken regression
    for one fixed branch; expected values are pinned to the guard's own stated invariants and to
    full.md's 10A(non-gate)/10B(gate) structure + Bash heredoc semantics, never to live files."""
    retro = {"eval_an_supersession_integrity": "r"}
    dets = {"eval_x": "m.py", "eval_y": "m.py", "eval_an_supersession_integrity": "supersession_integrity_checks.py"}
    # clean world: both live detectors graded+gated; the allowlisted one graded + absent from gate
    graded = {"eval_x": True, "eval_y": True, "eval_an_supersession_integrity": True}
    in_gate = {"eval_x": True, "eval_y": True, "eval_an_supersession_integrity": False}
    issues, _ = evaluate(dets, graded, in_gate, retro_only=retro, gate_only={})
    assert issues == [], f"selfcheck clean-world leaked issues: {issues}"
    # broken world: eval_y dropped from the gate -> Invariant 1 must fire for exactly eval_y
    in_gate_broken = dict(in_gate, eval_y=False)
    issues_b, _ = evaluate(dets, graded, in_gate_broken, retro_only=retro, gate_only={})
    inv1 = [i[0] for i in issues_b if i[1] == "inv1"]
    assert inv1 == ["eval_y"], f"selfcheck broken-world did not flag eval_y: {inv1}"
    # live-but-ungraded: a gate detector the grader can't reach -> Invariant 2 must fire
    issues_c, _ = evaluate({"eval_z": "m.py"}, {"eval_z": False}, {"eval_z": True}, retro_only={}, gate_only={})
    assert [i[0] for i in issues_c if i[1] == "inv2"] == ["eval_z"], "selfcheck Invariant 2 did not fire"

    # GATE_ONLY_OK hygiene: a bogus/stale entry must fail just as loudly as a missing wiring.
    #  - undiscovered name
    iz, _ = evaluate({}, {}, {}, retro_only={}, gate_only={"eval_ghost": "r"})
    assert any(c == "allowlist" and "GATE_ONLY_OK" in m for _, c, m in iz), "GATE_ONLY_OK undiscovered not caught"
    #  - discovered + grader-reachable (not genuinely live-only) -> stale exemption
    iz2, _ = evaluate({"eval_g": "m.py"}, {"eval_g": True}, {"eval_g": True}, retro_only={}, gate_only={"eval_g": "r"})
    assert any(c == "allowlist" and "grader DOES reach" in m for _, c, m in iz2), "GATE_ONLY_OK stale-exemption not caught"
    #  - a legitimately live-only + ungraded entry is clean (suppresses inv2, raises nothing)
    iz3, _ = evaluate({"eval_g": "m.py"}, {"eval_g": False}, {"eval_g": True}, retro_only={}, gate_only={"eval_g": "live-only"})
    assert iz3 == [], f"GATE_ONLY_OK legitimate entry leaked issues: {iz3}"

    # extract_gate_blocks: a detector called ONLY in a 10A (non-gate) heredoc must NOT count live;
    # the same call under a 10B header MUST. Pinned to full.md's 10A-audit-dossier/10B-gate split.
    md_10a = "### 10A.2 — Audit dossier\n```bash\npython3 - <<'PY'\nviol = eval_probe_x(d)\nPY\n```\n"
    blocks_a, _ = extract_gate_blocks(md_10a)
    assert blocks_a == [] and "eval_probe_x" not in gate_calls(blocks_a), "10A heredoc wrongly extracted as gate"
    md_10b = md_10a.replace("### 10A.2 — Audit dossier", "### 10B.1 — Deterministic validator")
    blocks_b, _ = extract_gate_blocks(md_10b)
    assert len(blocks_b) == 1 and "eval_probe_x" in gate_calls(blocks_b), "10B gate heredoc not extracted"
    # a heredoc OUTSIDE a ``` fence (prose / example) under a 10B header is documentation, not the
    # gate -> must NOT be extracted; a real one inside a ```bash fence in the same section MUST.
    md_unfenced = ("### 10B.1 — V\nexample (not run):\npython3 - <<'PY'\nx = eval_probe_x(d)\nPY\n"
                   "```bash\npython3 - <<'PY'\ny = eval_probe_y(d)\nPY\n```\n")
    blocks_uf, _ = extract_gate_blocks(md_unfenced)
    calls_uf = gate_calls(blocks_uf)
    assert "eval_probe_x" not in calls_uf, "out-of-fence prose heredoc wrongly counted as the live gate"
    assert len(blocks_uf) == 1 and "eval_probe_y" in calls_uf, "in-fence gate heredoc not extracted"
    # an indented `  PY` does NOT terminate a Bash heredoc -> must raise (not silently truncate+pass)
    md_bad = "### 10B.1 — V\n```bash\npython3 - <<'PY'\nx = eval_probe_x(d)\n  PY\n```\n"
    try:
        extract_gate_blocks(md_bad)
        raise AssertionError("unterminated/indented-PY heredoc did not raise")
    except ValueError:
        pass

    # module_scanned_by_eval reach-check: a detector DEFINED in a scan_committed module but never
    # CALLED by it is not grader-reachable (would otherwise evade Invariant 2 if live-wired).
    mod_reached = "def scan_committed():\n    return eval_hit(x)\ndef eval_hit(x):\n    return []\n"
    mod_unreached = "def scan_committed():\n    return []\ndef eval_miss(x):\n    return []\n"
    assert "eval_hit" in executable_calls(mod_reached, "selfcheck", skip_selftest=True), "reach-check missed a real in-module call"
    assert "eval_miss" not in executable_calls(mod_unreached, "selfcheck", skip_selftest=True), "reach-check counted an uncalled detector"

    # executable_calls: a name in a comment / string / docstring / def line is NOT a call; a real
    # call (bare or module-qualified) is; a call only inside a selftest region is not a grading call.
    src = ('def eval_defd(x):\n    """eval_doc(1)"""\n    return []\n'
           '# eval_cmt(1)\ns = "eval_str(1)"\nv = eval_real(1) + m.eval_attr(2)\n'
           'if scope == "selftest":\n    eval_st_only(1)\nelse:\n    eval_else(1)\n'
           'def _selftest():\n    eval_fn_st(1)\n')
    got = executable_calls(src, "selfcheck", skip_selftest=True)
    assert got >= {"eval_real", "eval_attr", "eval_else"}, f"real calls missed: {got}"
    assert not (got & {"eval_defd", "eval_doc", "eval_cmt", "eval_str", "eval_st_only", "eval_fn_st"}), \
        f"non-executable / selftest-only mention counted as a call: {got}"
    assert "eval_st_only" in executable_calls(src, "selfcheck"), "skip_selftest=False must keep selftest calls"
    try:
        executable_calls("def broken(:\n", "selfcheck")
        raise AssertionError("unparseable source did not raise")
    except ValueError:
        pass
    # the comparison OPERATOR decides which side is self-test code
    ne = 'if scope != "selftest":\n    eval_prod(1)\nelse:\n    eval_st(1)\n'
    got_ne = executable_calls(ne, "selfcheck", skip_selftest=True)
    assert "eval_prod" in got_ne and "eval_st" not in got_ne, f"`!= selftest` guard misread: {got_ne}"
    # entry_only: a call in an uncalled helper or under `if False:` is not live; a call in a helper
    # reached (transitively) from top-level code is.
    blk = ('def unused():\n    eval_parked(1)\ndef inner():\n    eval_deep(1)\n'
           'def outer():\n    inner()\nif False:\n    eval_dead(1)\nouter()\neval_top(1)\n')
    got_e = executable_calls(blk, "selfcheck", entry_only=True)
    assert got_e >= {"eval_top", "eval_deep"} and not (got_e & {"eval_parked", "eval_dead"}), f"entry reachability wrong: {got_e}"
    # a live call to a detector nobody defines is stale wiring
    assert stale_live_calls({"eval_gone", "eval_here", "print"}, {"eval_here": "m.py"}) == ["eval_gone"], "stale live call missed"
    # a same-named eval.py def must delegate to the shared one
    w_ok = "from m import eval_w as _w\ndef eval_w(x):\n    return _w(x)\n"
    w_bad = "from m import eval_w as _w\ndef eval_w(x):\n    return []\n"
    assert wrapper_delegates(w_ok, "eval_w", "m.py") and not wrapper_delegates(w_bad, "eval_w", "m.py"), "wrapper delegation check wrong"
    # a `## ` header after the gate closes the 10B section (steps 10C / 11 / 12 are not the gate)
    md_after = md_10b + "## 12. Commit\n```bash\npython3 - <<'PY'\ny = eval_probe_y(d)\nPY\n```\n"
    blocks_after, _sec = extract_gate_blocks(md_after)
    assert len(blocks_after) == 1 and "eval_probe_y" not in gate_calls(blocks_after), "post-gate `## ` step leaked into the gate"

    # a mirror marker that survives only in a COMMENT is not evidence the check still runs
    md_cmt = "### 10B.1 — V\n```bash\npython3 - <<'PY'\n# if ds < 30: flag\nx = 1\nPY\n```\n"
    _b, sec_cmt = extract_gate_blocks(md_cmt)
    assert re.search(r"ds < 30", sec_cmt) is None, "comment text leaked into the gate's executable text"
    md_code = md_cmt.replace("x = 1", "if ds < 30: x = 1")
    assert re.search(r"ds < 30", extract_gate_blocks(md_code)[1]), "executable marker not found"
    assert "python3 - <<'PY'" in sec_cmt, "shell command lines missing from the gate's executable text"

    # ...nor is one that survives only inside a STRING literal or f-string
    md_str = md_cmt.replace("x = 1", "x = 'if ds < 30'; y = f'ds < 30 {x}'")
    assert re.search(r"ds < 30", extract_gate_blocks(md_str)[1]) is None, "string-literal text leaked into the gate's executable text"
    # a detector call must resolve to an import of its defining module in the same heredoc
    dm = {"eval_q": "qmod.py"}
    assert unresolved_live_calls(["import qmod as q\nq.eval_q(1)\n", "from qmod import eval_q\neval_q(1)\n"], dm) == [], "resolved calls flagged"
    assert [n for n, _ in unresolved_live_calls(["q.eval_q(1)\n"], dm)] == ["eval_q"], "call with a missing module import not flagged"
    assert [n for n, _ in unresolved_live_calls(["import other as q\nq.eval_q(1)\n"], dm)] == ["eval_q"], "call through the wrong module not flagged"
    assert [n for n, _ in unresolved_live_calls(["eval_q(1)\n"], dm)] == ["eval_q"], "bare call with no import not flagged"
    # an `async def` detector is rejected outright: a synchronous call would never run its body
    try:
        defined_detectors("async def eval_async(x):\n    return []\n", "selfcheck")
        raise AssertionError("async detector was accepted (a bare call would only create a coroutine)")
    except ValueError:
        pass
    # a `def eval_x(` line that survives only inside a docstring / string is NOT a definition
    ghost = 'DOC = """example:\ndef eval_ghost(x):\n    return []\n"""\ndef eval_live(x):\n    return []\n'
    assert defined_detectors(ghost, "selfcheck") == ["eval_live"], "docstring `def` counted as a detector definition"
    try:
        defined_detectors("def eval_broken(:\n", "selfcheck")
        raise AssertionError("unparseable detector module did not raise")
    except ValueError:
        pass
    # a grader call counts only through a binding to the defining module
    def _g(src):
        d = {}
        executable_calls(src, "selfcheck", skip_selftest=True, detail=d)
        return grader_calls_detector(src, "eval_q", "qmod.py", d)
    assert _g("from qmod import eval_q\neval_q(1)\n"), "resolved bare grader call not counted"
    assert _g("from qmod import eval_q as _q\n_q(1)\n"), "aliased grader call not counted"
    assert _g("import qmod as q\nq.eval_q(1)\n"), "module-qualified grader call not counted"
    assert _g("from qmod import eval_q as _q\ndef eval_q(x):\n    return _q(x)\neval_q(1)\n"), "wrapper grader call not counted"
    assert not _g("eval_q(1)\n"), "grader call with its import deleted counted as graded"
    assert not _g("from other import eval_q\neval_q(1)\n"), "grader call bound to the wrong module counted as graded"
    assert not _g("import other as q\nq.eval_q(1)\n"), "grader call through the wrong module counted as graded"
    assert not _g("from qmod import eval_q\n"), "imported-but-never-called detector counted as graded"
    # the qualified call and its receiver must sit on the SAME production path
    assert not _g('import qmod as q\nimport other\nif scope == "selftest":\n    q.eval_q(1)\nother.eval_q(1)\n'), \
        "selftest-only qualified call joined to an unrelated production call"
    assert not _g("from qmod import eval_q\nimport other\nother.eval_q(1)\n"), "unrelated qualified call counted as the bound bare call"
    # live imports count only at executable module scope
    assert [n for n, _ in unresolved_live_calls(["if False:\n    import qmod as q\nq.eval_q(1)\n"], dm)] == ["eval_q"], "import under `if False:` accepted as a live binding"
    assert [n for n, _ in unresolved_live_calls(["def h():\n    import qmod as q\nq.eval_q(1)\n"], dm)] == ["eval_q"], "import inside an uncalled helper accepted as a live binding"
    # a live call through an alias counts for the detector that really runs
    assert gate_calls(["from qmod import eval_q as eval_r\neval_r(1)\n"]) >= {"eval_q"}, "aliased live call not normalised to the real detector"
    assert "eval_r" not in gate_calls(["from qmod import eval_q as eval_r\neval_r(1)\n"]), "aliased live call credited to the alias name"
    # a `<<'PY'` heredoc fed to a non-Python command is not gate code -> must raise
    try:
        extract_gate_blocks("### 10B.1 — V\n```bash\ncat <<'PY'\nx = eval_probe_x(d)\nPY\n```\n")
        raise AssertionError("non-Python heredoc was extracted as live gate code")
    except ValueError:
        pass
    assert len(extract_gate_blocks("### 10B.1 — V\n```bash\nRUN_ROOT=\"a\" python3 - \"x\" <<'PY'\nx = 1\nPY\n```\n")[0]) == 1, "env-prefixed python heredoc not extracted"

    # Invariant 3: unclassified inline check, stale entry, vanished live marker, missing reason.
    reg = {"eval_a": ("live", r"mirrors check A", "n"), "eval_b": ("retrospective", None, "why")}
    assert evaluate_inline(["eval_a", "eval_b", "eval_shared"], {"eval_shared"}, "# mirrors check A", reg) == [], "inv3 clean world leaked"
    assert [i[0] for i in evaluate_inline(["eval_a", "eval_b", "eval_new"], set(), "# mirrors check A", reg)] == ["eval_new"], "inv3 missed an unclassified inline check"
    assert [i[0] for i in evaluate_inline(["eval_a", "eval_b"], set(), "nothing here", reg)] == ["eval_a"], "inv3 missed a vanished live marker"
    assert [i[0] for i in evaluate_inline(["eval_a"], set(), "# mirrors check A", reg)] == ["eval_b"], "inv3 missed a stale entry"
    assert evaluate_inline(["eval_b"], set(), "", {"eval_b": ("retrospective", None, " ")}), "inv3 missed an empty reason"
    print("  [ok] selfcheck: parity predicate, allowlist hygiene, 10B-only extraction, strict "
          "terminator, executable-call detection, selftest exclusion, scan_committed reach-check and "
          "inline classification each pass a clean world and fail a broken one")


class _Blank(ast.NodeTransformer):
    """Empty every string literal and f-string, so re-rendered code carries structure only: a
    marker can then match a real condition but never text parked in a message or docstring."""
    def visit_Constant(self, node):
        return ast.copy_location(ast.Constant(value=""), node) if isinstance(node.value, (str, bytes)) else node

    def visit_JoinedStr(self, node):
        return ast.copy_location(ast.Constant(value=""), node)


def unresolved_live_calls(blocks, detectors):
    """Detector calls in the gate whose receiver does not resolve, in the SAME heredoc, to an import
    of the detector's defining module: `rc.eval_x(...)` needs `import <module> as rc` (or `import
    <module>`), a bare `eval_x(...)` needs `from <module> import eval_x`. A call that outlives its
    import raises NameError at publish time instead of enforcing anything. Only imports that execute
    at the heredoc's module scope count (see live_imports). Returns [(name, why)]."""
    out = []
    for k, block in enumerate(blocks, 1):
        tree = ast.parse(block)
        mod_alias, from_name = live_imports(tree)
        for n in ast.walk(tree):
            if not isinstance(n, ast.Call):
                continue
            f = n.func
            if isinstance(f, ast.Attribute) and f.attr in detectors:
                want = os.path.basename(detectors[f.attr])[:-3]
                recv = f.value.id if isinstance(f.value, ast.Name) else None
                if mod_alias.get(recv) != want:
                    out.append((f.attr, f"heredoc #{k} calls it as `{recv}.{f.attr}(...)` but `{recv}` is not an import of {want} in that block"))
            elif isinstance(f, ast.Name) and f.id in from_name and from_name[f.id][1] in detectors:
                mod, real = from_name[f.id]
                want = os.path.basename(detectors[real])[:-3]
                if mod != want:
                    out.append((real, f"heredoc #{k} imports it from {mod}, but it is defined in {want}"))
            elif isinstance(f, ast.Name) and f.id in detectors:
                out.append((f.id, f"heredoc #{k} calls it bare but never imports it from its defining module"))
    return out


def extract_gate_blocks(md_text):
    """The body of every embedded python heredoc that lives in a Step 10B FINISH-GATE section of
    full.md — a block opened by a line ending in `<<'PY'` (or `<<\"PY\"`) and closed by a
    column-0 `PY`. A detector counts as wired live when one of those blocks CALLS it. Returns
    (blocks, section_text): one string per heredoc, plus the gate's EXECUTABLE text — the 10B
    section's shell command lines and each heredoc re-rendered from its AST, comments removed —
    which is what the Invariant-3 mirror markers are searched in.

    Four things it gets right (each is a way a weaker extractor would HIDE a real Invariant-1 gap):
      · SECTION-SCOPED. Only heredocs under a `### 10B` header are the finish gate — the blocks that
        can stamp `final_thesis.md` PROVISIONAL. Heredocs under a `### 10A` section (e.g. 10A.2's
        audit dossier, which is best-effort and `must never abort the run`) are EXCLUDED: a detector
        called only there does not gate a publish, so counting it as live-wired would mask a missing
        real gate call. Section state flips on every `## ` / `### ` header (any non-10B section —
        including the `## 10C` / `## 11` / `## 12` steps after the gate — turns collection off), so
        moving a detector call into a non-gate block fails the guard.
      · FENCE-SCOPED. Only a heredoc that opens INSIDE an executable ``` fence runs when the gate
        runs. A heredoc-shaped line sitting in prose or an indented example under a 10B header — not
        inside a ``` block — is documentation, not the gate, so it is EXCLUDED (the opener is
        accepted only while `in_fence`). Otherwise a stale example calling a detector would keep the
        guard green after the real executable call was removed.
      · PYTHON-FED. The opener line must be a `python3 - … <<'PY'` invocation. A `<<'PY'` heredoc
        feeding any other command (`cat <<'PY'`) only prints its body, so a detector named in it
        never runs; such a block raises instead of being counted.
      · EXACT TERMINATOR. A Bash `<<'PY'` heredoc (no `-`) is closed ONLY by a line that is exactly
        `PY` at column 0; an indented `  PY` does not terminate it. The terminator is matched exactly
        (not `.strip()`), and an opener with no column-0 `PY` before EOF raises rather than silently
        counting a truncated block — so a malformed gate fails loudly instead of passing vacuously."""

    lines = md_text.splitlines()
    blocks = []
    section = []
    i = 0
    opener = re.compile(r"<<\s*['\"]PY['\"]\s*$")
    py_cmd = re.compile(r"(?:^|[\s;&|(])python3?(?:\.\d+)?\s+-(?:\s|$)")
    header = re.compile(r"^#{2,3}\s+(\S+)")
    in_10b = False
    in_fence = False
    while i < len(lines):
        h = header.match(lines[i])
        if h:
            in_10b = h.group(1).startswith("10B")
            i += 1
            continue
        if lines[i].lstrip().startswith("```"):
            in_fence = not in_fence
        elif in_10b and in_fence and not lines[i].lstrip().startswith("#"):
            section.append(lines[i])       # a shell command line of the gate
        if in_10b and in_fence and opener.search(lines[i]):
            if not py_cmd.search(lines[i]):
                raise ValueError(
                    f"full.md: 10B heredoc opened at line {i + 1} is not stdin of a `python3 -` "
                    "invocation — a `<<'PY'` body fed to another command (e.g. `cat`) is printed, "
                    "not run, so it cannot be judged as live gate code. Use a different heredoc "
                    "tag for non-Python text.")
            j = i + 1
            body = []
            while j < len(lines) and lines[j] != "PY":
                body.append(lines[j])
                j += 1
            if j >= len(lines):
                raise ValueError(
                    f"full.md: 10B finish-gate heredoc opened at line {i + 1} has no column-0 'PY' "
                    "terminator before EOF — refusing to extract a truncated/garbled live gate.")
            blocks.append("\n".join(body))
            i = j + 1
        else:
            i += 1
    code = []
    for k, block in enumerate(blocks, 1):
        try:
            code.append(ast.unparse(_Blank().visit(ast.parse(block))))   # code structure only
        except SyntaxError as e:
            raise ValueError(f"full.md 10B heredoc #{k}: does not parse as Python ({e.msg}, line "
                             f"{e.lineno}) — refusing to judge the live gate on unparseable source.")
    return blocks, "\n".join(section + code)


_MSG = {
    "inv1": ("is reachable from the retrospective grader (eval.py) but is NOT called by the live "
             "finish gate (full.md). A run violating it would print GATE: PASS and commit to main "
             "undetected (CLAUDE.md §25/§28). Wire it into full.md Step 10B, or — if it is "
             "deliberately not a per-thesis finish-gate check — add it to RETROSPECTIVE_ONLY with a reason."),
    "inv2": ("is called by the live finish gate (full.md) but is NOT reachable from the retrospective "
             "grader (eval.py) — the golden-run harness can no longer regression-test it. Wire it into "
             "eval.py (directly or via scan_committed), or add it to GATE_ONLY_OK with a reason."),
    "allowlist": ("RETROSPECTIVE_ONLY hygiene:"),
}


def main():
    selfcheck()

    with open(EVAL_PY, encoding="utf-8") as f:
        eval_src = f.read()
    with open(FULL_MD, encoding="utf-8") as f:
        md = f.read()
    blocks, section_text = extract_gate_blocks(md)
    n_blocks = len(blocks)

    if n_blocks == 0:
        print("  [XX] full.md: found no `<<'PY'` finish-gate heredoc — the live gate could not be "
              "located (did the heredoc marker change?). Refusing to pass vacuously.")
        print("FINISH-GATE PARITY FAIL (live gate not found)")
        sys.exit(1)
    print(f"  [ok] full.md: extracted {n_blocks} embedded python heredoc block(s)")

    bad = 0
    try:
        detectors, dupes = discover_detectors()
        grader_detail = {}
        executable_calls(eval_src, "scripts/eval.py", skip_selftest=True, detail=grader_detail)
        live_calls = gate_calls(blocks)
        graded = {n: (grader_calls_detector(eval_src, n, detectors[n], grader_detail)
                      or module_scanned_by_eval(n, detectors[n], eval_src))
                  for n in detectors}
    except ValueError as e:
        print(f"  [XX] {e}")
        print("FINISH-GATE PARITY FAIL (unparseable caller or detector module)")
        sys.exit(1)
    for name, where in sorted(dupes.items()):
        bad += 1
        print(f"  [XX] detector {name} is def'd in multiple modules {sorted(where)} — ambiguous "
              "source of truth; one must be the shared definition.")
    in_gate = {n: n in live_calls for n in detectors}

    issues, n_live = evaluate(detectors, graded, in_gate)
    inline_defs = inline_eval_defs(eval_src)
    issues += evaluate_inline(inline_defs, set(detectors), section_text)
    for name in stale_live_calls(live_calls, detectors):
        issues.append((name, "inv3", "is called by the live finish gate but no shared module under "
                       "scripts/ defines it (renamed or removed?) — the gate block would crash instead of enforcing it"))
    for name, why in unresolved_live_calls(blocks, detectors):
        issues.append((name, "inv3", why))
    for name in inline_defs:
        if name in detectors and not wrapper_delegates(eval_src, name, detectors[name]):
            issues.append((name, "inv3", "is defined BOTH inline in eval.py and in a shared module, and the "
                           "eval.py definition does not delegate to the shared one — two implementations under one name"))
    for name, code, detail in issues:
        bad += 1
        where = f" [defined in {detectors[name]}]" if name in detectors else ""
        if code in ("allowlist", "inv3"):
            print(f"  [XX] {name}: {detail}.{where}")
        else:
            print(f"  [XX] {name} {_MSG[code]}{where}")

    if bad:
        print(f"\nFINISH-GATE PARITY FAIL ({bad} issue(s))")
        sys.exit(1)
    print(f"  [ok] {n_live} live-relevant detector(s) are wired into BOTH the retrospective grader "
          "and the live finish gate")
    print(f"  [ok] {len(RETROSPECTIVE_ONLY)} detector(s) deliberately gate elsewhere (allowlisted, "
          "each with a reason and verified grader-reachable + absent from the thesis finish gate)")
    n_inline_live = sum(1 for v in INLINE_EVAL.values() if v[0] == "live")
    print(f"  [ok] {len(INLINE_EVAL)} inline eval.py check(s) are each classified: {n_inline_live} enforced "
          f"by the 10B gate (mirror marker present), {len(INLINE_EVAL) - n_inline_live} retrospective-only with a reason")
    print("FINISH-GATE PARITY PASS — every live-relevant deterministic detector runs in both the "
          "retrospective grader and the live pre-publish finish gate")


if __name__ == "__main__":
    main()
