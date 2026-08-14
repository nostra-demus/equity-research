#!/usr/bin/env bash
# Publish a completed, locally committed research result without pushing this checkout's branch.
# Bytes come only from the named saved DATA commit. They are replayed onto current origin/main with a
# per-file three-way CAS, so unrelated commits cannot leak and concurrent immutable records cannot be
# overwritten.
set -u

MSG="${1:-}"
shift || true
PREFLIGHT_ONLY=0
case "${1:-}" in
  --source-commit) ;;
  --preflight-source-commit) PREFLIGHT_ONLY=1 ;;
  *)
    echo "usage: publish-saved-research.sh \"<message>\" (--source-commit|--preflight-source-commit) <sha> -- <data path> [...]" >&2
    exit 2
    ;;
esac
if [ -z "${2:-}" ]; then
  echo "saved-publication: invalid request" >&2
  exit 2
fi
SOURCE_COMMIT="$2"
shift 2
[ "${1:-}" = "--" ] && shift
if [ -z "$MSG" ] || [ "$#" -eq 0 ] || ! [[ "$SOURCE_COMMIT" =~ ^[a-f0-9]{40,64}$ ]]; then
  echo "saved-publication: invalid request" >&2
  exit 2
fi

TOP="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "saved-publication: not a git repo" >&2; exit 2; }
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)" || {
  echo "saved-publication: cannot resolve helper directory" >&2; exit 2;
}
if [ "$PREFLIGHT_ONLY" -eq 0 ] && [ "${ENGINE_NO_PUSH:-}" = "1" ]; then
  echo "saved-publication: ENGINE_NO_PUSH=1 — publication recovery is disabled in validation runs" >&2
  exit 4
fi

ENGINE_APP_ENV="${NOSTRA_ENGINE_CONFIG_DIR:-$HOME/.config/nostra-engine}/github-app.env"
ENGINE_CRED_HELPER="$TOP/scripts/ops/gh-app-credential.sh"
if [ -f "$ENGINE_APP_ENV" ] && [ -x "$ENGINE_CRED_HELPER" ]; then
  export GIT_CONFIG_COUNT=2
  export GIT_CONFIG_KEY_0="credential.helper" GIT_CONFIG_VALUE_0=""
  export GIT_CONFIG_KEY_1="credential.helper" GIT_CONFIG_VALUE_1="!$ENGINE_CRED_HELPER"
fi

# Paths are identifiers only. The mutable worktree is never read for publication bytes.
# Exact committed data paths are identifiers only. This script also backs the generic data-lane helper,
# so it accepts the three repository-owned output authorities while refusing pathspec magic, traversal,
# code paths and unsafe components. Later tree-mode checks independently reject links/submodules.
if ! python3 - "$@" <<'PYSAFE'
import sys
for raw in sys.argv[1:]:
    rel = raw.rstrip('/')
    parts = rel.split('/')
    if (not rel or raw.startswith('/') or '\\' in raw or any(p in ('', '.', '..') for p in parts)
            or parts[0] not in ('analyses', 'screener', 'commodity')
            or any(any(ord(ch) < 32 for ch in part) for part in parts)):
        raise SystemExit(1)
PYSAFE
then
  echo "saved-publication: unsafe engine-data path" >&2
  exit 5
fi

if ! git -C "$TOP" cat-file -e "$SOURCE_COMMIT^{commit}" 2>/dev/null; then
  echo "saved-publication: saved data commit is not in this checkout's history" >&2
  exit 5
fi
if [ "$PREFLIGHT_ONLY" -eq 0 ]; then
  # ENGINE_NO_PUSH is a durable property of the commit, not merely of the process that created it. Refuse
  # the source and every descendant whose private lineage contains that marker; otherwise a later normal
  # recovery could publish validation research that was explicitly promised to remain local.
  SHARED_HINT="$(git -C "$TOP" rev-parse refs/remotes/origin/main 2>/dev/null || true)"
  if [ -z "$SHARED_HINT" ]; then
    echo "saved-publication: shared authority is temporarily unavailable" >&2
    exit 4
  fi
  SOURCE_BASE="$(git -C "$TOP" merge-base "$SOURCE_COMMIT" "$SHARED_HINT" 2>/dev/null || true)"
  if [ -z "$SOURCE_BASE" ]; then
    echo "saved-publication: saved data commit has no shared ancestry" >&2
    exit 5
  fi
  SOURCE_LINEAGE="$(git -C "$TOP" rev-list --first-parent "$SOURCE_BASE..$SOURCE_COMMIT" 2>/dev/null)" || {
    echo "saved-publication: validation-only lineage cannot be verified" >&2
    exit 4
  }
  while IFS= read -r SOURCE_LINEAGE_COMMIT; do
    [ -n "$SOURCE_LINEAGE_COMMIT" ] || continue
    SOURCE_LINEAGE_MESSAGE="$(git -C "$TOP" show -s --format=%B "$SOURCE_LINEAGE_COMMIT" 2>/dev/null)" || {
      echo "saved-publication: validation-only lineage cannot be verified" >&2
      exit 4
    }
    if printf '%s\n' "$SOURCE_LINEAGE_MESSAGE" | grep -Fqx 'Nostradamus-Publication: never'; then
      echo "saved-publication: validation-only data is permanently non-publishable" >&2
      echo "NON_PUBLISHABLE_SOURCE=$SOURCE_LINEAGE_COMMIT" >&2
      exit 5
    fi
  done <<<"$SOURCE_LINEAGE"
fi
if [ "$PREFLIGHT_ONLY" -eq 1 ]; then
  SOURCE_PARENT="$(git -C "$TOP" rev-parse "$SOURCE_COMMIT^" 2>/dev/null || true)"
  CURRENT_HEAD="$(git -C "$TOP" rev-parse HEAD 2>/dev/null || true)"
  if [ -z "$SOURCE_PARENT" ] || [ "$SOURCE_PARENT" != "$CURRENT_HEAD" ] || [ "${_NOSTRA_COMMIT_RUN_PREFLIGHT:-}" != "1" ]; then
    echo "saved-publication: invalid staged-index preflight source" >&2
    exit 5
  fi
elif ! git -C "$TOP" merge-base --is-ancestor "$SOURCE_COMMIT" HEAD 2>/dev/null; then
  echo "saved-publication: saved data commit is not in this checkout's history" >&2
  exit 5
fi

if [ "$PREFLIGHT_ONLY" -eq 0 ]; then
  LOCK="$(git -C "$TOP" rev-parse --git-path nostra-engine-mutation.flock 2>/dev/null)"
  case "$LOCK" in /*) ;; ?*) LOCK="$TOP/$LOCK" ;; *) echo "saved-publication: cannot resolve repository lock" >&2; exit 4 ;; esac
  exec 9>>"$LOCK" || { echo "saved-publication: cannot open repository lock" >&2; exit 4; }
  if ! python3 - 900000 9<&9 <<'PYLOCK'
import fcntl, sys, time
deadline = time.monotonic() + int(sys.argv[1]) / 1000
while True:
    try:
        fcntl.flock(9, fcntl.LOCK_EX | fcntl.LOCK_NB)
        break
    except BlockingIOError:
        if time.monotonic() >= deadline: raise SystemExit(3)
        time.sleep(0.05)
PYLOCK
  then
    echo "saved-publication: timed out waiting for repository lock" >&2
    exit 4
  fi
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/nostra-saved-publication.XXXXXX")" || exit 4
INDEX="$TMP/index"
cleanup() { rm -rf -- "$TMP"; }
trap cleanup EXIT
TERMINAL_RUNNER="$SCRIPT_DIR/../ui/server/node_modules/.bin/tsx"
TERMINAL_VALIDATOR="$SCRIPT_DIR/../ui/server/scripts/validate-terminal-publication.ts"

source_terminal_publication_is_valid() {
  local run_root="$1"
  [ -x "$TERMINAL_RUNNER" ] && [ -f "$TERMINAL_VALIDATOR" ] \
    && "$TERMINAL_RUNNER" "$TERMINAL_VALIDATOR" --repo "$TOP" --commit "$SOURCE_COMMIT" "$run_root" \
      >/dev/null 2>&1
}

result_terminal_publication_is_valid() {
  local run_root="$1"
  [ -x "$TERMINAL_RUNNER" ] && [ -f "$TERMINAL_VALIDATOR" ] \
    && GIT_INDEX_FILE="$INDEX" "$TERMINAL_RUNNER" "$TERMINAL_VALIDATOR" --repo "$TOP" --index "$run_root" \
      >/dev/null 2>&1
}

# True only when every tree change carried by the saved local lineage is already present byte-for-byte
# in the synthetic publication. The shared commit may also contain unrelated newer main changes.
saved_delta_is_shared() {
  local published="$1"
  python3 - "$TOP" "$SOURCE_COMMIT" "$published" <<'PYSHARED'
import subprocess, sys
top, source, published = sys.argv[1:]
def run(args, raw=False):
    value = subprocess.run(['git', '-C', top, *args], check=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL).stdout
    return value if raw else value.decode().strip()
try:
    base = run(['merge-base', source, published])
    paths = [p.decode() for p in run(['diff', '--no-renames', '--name-only', '-z', base, source], True).split(b'\0') if p]
    if not paths: raise SystemExit(1)
    def entry(commit, path):
        rows = [r for r in run(['ls-tree', '-z', commit, '--', path], True).split(b'\0') if r]
        if not rows: return None
        if len(rows) != 1: raise SystemExit(1)
        meta, name = rows[0].split(b'\t', 1)
        if name.decode() != path: raise SystemExit(1)
        mode, typ, oid = meta.decode().split()
        return mode, typ, oid
    if any(entry(source, path) != entry(published, path) for path in paths): raise SystemExit(1)
except (subprocess.CalledProcessError, ValueError):
    raise SystemExit(1)
PYSHARED
}

# Converge a production main checkout after isolated publication without making the private saved commit
# an ancestor of shared main. Exact trees can move with reset --soft (no worktree writes). When main moved
# meanwhile, reset --keep applies the combined shared tree but atomically refuses to overwrite a concurrent
# tracked/untracked worktree edit. The deploy loop independently retries the same proof if this attempt is
# blocked by an in-flight writer.
maybe_converge_checkout() {
  local published="$1" branch current source_tree published_tree
  branch="$(git -C "$TOP" symbolic-ref -q HEAD 2>/dev/null || true)"
  current="$(git -C "$TOP" rev-parse HEAD 2>/dev/null || true)"
  [ "$branch" = "refs/heads/main" ] || return 0
  [ "$current" = "$SOURCE_COMMIT" ] || return 0
  source_tree="$(git -C "$TOP" rev-parse "$SOURCE_COMMIT^{tree}" 2>/dev/null || true)"
  published_tree="$(git -C "$TOP" rev-parse "$published^{tree}" 2>/dev/null || true)"
  if [ -n "$source_tree" ] && [ "$source_tree" = "$published_tree" ]; then
    git -C "$TOP" reset --soft "$published" || return 0
    echo "CHECKOUT_CONVERGED=1"
    return 0
  fi
  saved_delta_is_shared "$published" || return 0
  # The shared repository lock excludes commit-run/deploy index mutations. Refuse to disturb an index
  # prepared by any other actor, even though reset --keep would preserve conflicting worktree bytes.
  git -C "$TOP" diff --cached --quiet -- || return 0
  if git -C "$TOP" reset --keep "$published" >/dev/null 2>&1; then
    echo "CHECKOUT_CONVERGED=1"
  else
    echo "CHECKOUT_CONVERGENCE_PENDING=1"
  fi
}

if ! git -C "$TOP" fetch -q origin main 2>/dev/null; then
  echo "saved-publication: shared main could not be read; will retry later" >&2
  exit 4
fi

attempt=1
while [ "$attempt" -le 3 ]; do
  rm -f -- "$INDEX" "$TMP/changed"
  REMOTE="$(git -C "$TOP" rev-parse refs/remotes/origin/main)" || exit 4
  BASE="$(git -C "$TOP" merge-base "$SOURCE_COMMIT" "$REMOTE")" || {
    echo "saved-publication: saved commit has no safe shared base" >&2; exit 5;
  }
  if ! GIT_INDEX_FILE="$INDEX" git -C "$TOP" read-tree "$REMOTE"; then
    echo "saved-publication: shared main tree could not be prepared" >&2
    exit 4
  fi

  # Apply the cumulative saved-data diff (BASE -> SOURCE) to the latest shared tree. For every path,
  # latest shared bytes must still equal BASE (safe CAS) or already equal SOURCE. Any third value is a
  # concurrent immutable-history conflict and fails closed without a push.
  if ! python3 - "$TOP" "$INDEX" "$SOURCE_COMMIT" "$BASE" "$REMOTE" "$TMP/terminal-required" "$@" <<'PYAPPLY'
import datetime as dt, hashlib, json, os, re, subprocess, sys
top, index, source, base, remote, terminal_required_file, *requested = sys.argv[1:]
roots = [p.rstrip('/') for p in requested]
window = r'(?:30d|90d|180d|365d|24m|36m|ad-hoc|post-mortem)'
review_re = re.compile(r'^analyses/[A-Z0-9.\-]{1,40}_\d{4}-\d{2}-\d{2}/reviews/\d{4}-\d{2}-\d{2}_' + window + r'_(?:decision_review(?:_v\d+)?\.json|memo_delta(?:_v\d+)?\.md)$')
review_mode = all(review_re.fullmatch(p) for p in roots)
def inside(p, r): return p == r or p.startswith(r + '/')
def safe_repo_path(p):
    parts = p.split('/')
    return (bool(p) and not p.startswith('/') and '\\' not in p
            and all(part not in ('', '.', '..') and not any(ord(ch) < 32 for ch in part) for part in parts))
def run(args, *, raw=False, check=True, env=None):
    out = subprocess.run(['git', '-C', top, *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                         check=check, env=env)
    return out.stdout if raw else out.stdout.decode()
parents = run(['rev-list', '--parents', '-n', '1', source]).strip().split()
if len(parents) != 2: raise SystemExit(2)
source_parent = parents[1]
own = [p.decode() for p in run(['diff-tree','--no-renames','--no-commit-id','--name-only','-r','-z',source_parent,source],raw=True).split(b'\0') if p]
own_set = set(own)
review_any = review_re
if not own or any(not safe_repo_path(p) or not (review_any.fullmatch(p) if review_mode else any(inside(p, r) for r in roots)) for p in own):
    raise SystemExit(2)

net_changed = [p.decode() for p in run(['diff','--no-renames','--name-only','-z',base,source,'--',*roots],raw=True).split(b'\0') if p]
# A net BASE->SOURCE diff alone can launder a first-writer path through create->rewrite/delete commits.
# Retain every requested path touched anywhere in the saved first-parent lineage, even if its final bytes
# equal BASE, so append-only and content-addressed guards can compare SOURCE to the earliest local write.
history_changed = []
unauthorized_history = []
for commit in [item for item in run(['rev-list','--first-parent','--reverse',f'{base}..{source}']).splitlines() if item]:
    parent_row = run(['rev-list','--parents','-n','1',commit]).strip().split()
    if len(parent_row) != 2: raise SystemExit(3)
    all_paths = [raw.decode('utf-8', 'strict') for raw in run(
        ['diff-tree','--no-renames','--no-commit-id','--name-only','-r','-z',parent_row[1],commit,'--'], raw=True,
    ).split(b'\0') if raw]
    scoped_paths = [path for path in all_paths if any(inside(path, root) for root in roots)]
    pure_data = bool(all_paths) and all(
        safe_repo_path(path) and path.split('/', 1)[0] in ('analyses', 'screener', 'commodity')
        for path in all_paths
    )
    if pure_data:
        history_changed.extend(scoped_paths)
    else:
        unauthorized_history.extend(scoped_paths)
changed = list(dict.fromkeys(net_changed + history_changed))
if any(not safe_repo_path(p) for p in changed): raise SystemExit(3)
def entry(commit, p):
    rows = run(['ls-tree','-z',commit,'--',p], raw=True).split(b'\0')
    rows = [row for row in rows if row]
    if not rows: return None
    if len(rows) != 1: raise SystemExit(3)
    meta, name = rows[0].split(b'\t', 1)
    mode, typ, oid = meta.decode().split()
    if name.decode() != p or typ != 'blob' or mode not in ('100644','100755'): raise SystemExit(3)
    return mode, oid

def blob(commit, p):
    item = entry(commit, p)
    return None if item is None else run(['cat-file', 'blob', item[1]], raw=True)

def earliest_local_addition(repo_path):
    for commit in [item for item in run(
        ['rev-list', '--first-parent', '--reverse', f'{base}..{source}', '--', repo_path],
    ).splitlines() if item]:
        parent_row = run(['rev-list', '--parents', '-n', '1', commit]).strip().split()
        if len(parent_row) != 2: raise SystemExit(3)
        before, after = entry(parent_row[1], repo_path), entry(commit, repo_path)
        if before is None and after is not None: return after
    return None

def subtree(commit, root):
    result = {}
    for row in [item for item in run(['ls-tree', '-r', '-z', commit, '--', root], raw=True).split(b'\0') if item]:
        meta, raw_name = row.split(b'\t', 1)
        mode, typ, oid = meta.decode('ascii').split()
        name = raw_name.decode('utf-8', 'strict')
        if typ != 'blob' or mode not in ('100644', '100755') or not name.startswith(root + '/'):
            raise SystemExit(3)
        result[name] = (mode, oid)
    return result

def earliest_local_subtree(root):
    prior = subtree(base, root)
    if prior: return prior
    for commit in [item for item in run(['rev-list', '--first-parent', '--reverse', f'{base}..{source}', '--', root]).splitlines() if item]:
        current = subtree(commit, root)
        if current: return current
    return None

for repo_path in dict.fromkeys(unauthorized_history):
    if entry(source, repo_path) != entry(remote, repo_path):
        print('UNAUTHORIZED_MIXED_LINEAGE=' + repo_path, file=sys.stderr)
        raise SystemExit(4)

def strict_json(raw):
    def pairs(items):
        value = {}
        for key, item in items:
            if key in value: raise ValueError('duplicate JSON key')
            value[key] = item
        return value
    def bad_constant(_value): raise ValueError('non-finite JSON number')
    return json.loads(raw.decode('utf-8'), object_pairs_hook=pairs, parse_constant=bad_constant)

def canonical_manifest_bytes(value):
    # The manifest contract contains only ASCII object keys plus strings. Restricting keys here makes
    # Python's ordering byte-identical to the engine's UTF-16 canonical-JSON ordering without importing
    # mutable checkout code into this privileged publication boundary.
    def ascii_keys(item):
        if isinstance(item, dict):
            return all(isinstance(key, str) and key.isascii() and ascii_keys(child)
                       for key, child in item.items())
        if isinstance(item, list): return all(ascii_keys(child) for child in item)
        return True
    if not ascii_keys(value): raise ValueError('non-canonical manifest key')
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True,
                      separators=(',', ':')).encode('utf-8')

RUN_PATH_RE = re.compile(r'^(analyses/[^/]+)/')
COMMODITY_ARCHIVE_RE = re.compile(r'^(commodity/runs/[^/]+/decisions/[^/]+)(?:/|$)')
SHA256_RE = re.compile(r'^[a-f0-9]{64}$')
AUDIT_PATTERNS = {
    'verification': re.compile(r'^verification_report(?:_v(\d+))?\.json$'),
    'pre_mortem': re.compile(r'^pre_mortem(?:_v(\d+))?\.json$'),
    'expectations_gap': re.compile(r'^expectations_gap(?:_v(\d+))?\.json$'),
}
FIXED_PINNED_NAMES = {
    'final_thesis': 'final_thesis.md',
    'decision_record': 'decision_record.json',
}
TERMINAL_COMPLETION = {'idea_admission.json', 'idea_3_6m.json', 'idea_market_evidence.json'}
DERIVED_TOP_LEVEL = {'memo.md', 'audit_dossier.md'}
DERIVED_MODULE_RE = re.compile(r'^[^/]+/[^/]+_(?:memo|dossier)\.md$')
READY_RE = re.compile(r'^## Publication\s*\n\s*ready for one path-confined commit\s*$', re.MULTILINE)
APPEND_ONLY = (
    review_any,
    re.compile(r'^analyses/[^/]+/agent_metrics\.[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.json$'),
    re.compile(r'^analyses/[^/]+/intake/outcomes/[a-f0-9]{64}\.json$'),
    re.compile(r'^analyses/[^/]+/intake/receipts/\d{8}T\d{6}(?:\d{3})?Z_[a-f0-9]{12}\.json$'),
    # Raw intake plans are also versioned append-only inputs to the receipt. Saved recovery must be able
    # to add the next pair, but can never reinterpret an already-published plan under the same name.
    re.compile(r'^analyses/[^/]+/intake/\d{4}-\d{2}-\d{2}_intake_plan(?:_v\d+)?\.(?:json|md)$'),
)

def direct_names(commit, run_root):
    prefix = run_root + '/'
    names = []
    for raw in run(['ls-tree', '-r', '-z', '--name-only', commit, '--', run_root], raw=True).split(b'\0'):
        if not raw: continue
        repo_path = raw.decode('utf-8')
        if repo_path.startswith(prefix) and '/' not in repo_path[len(prefix):]:
            names.append(repo_path[len(prefix):])
    return names

def sealed_authority(commit, run_root):
    manifest_path = run_root + '/idea_projection_manifest.json'
    manifest_raw = blob(commit, manifest_path)
    if manifest_raw is None: return None
    try:
        if len(manifest_raw) > 1024 * 1024: raise ValueError('oversized manifest')
        manifest = strict_json(manifest_raw)
        if (not isinstance(manifest, dict)
                or set(manifest) != {'schema_version', 'run_root', 'created_at', 'artifacts', 'manifest_sha256'}
                or manifest.get('schema_version') != 'idea-projection-manifest/v1'
                or manifest.get('run_root') != run_root
                or not re.fullmatch(r'analyses/[-A-Z0-9.]{1,24}_\d{4}-\d{2}-\d{2}', run_root)):
            raise ValueError('manifest identity')
        dt.date.fromisoformat(run_root[-10:])
        created = manifest.get('created_at')
        if not isinstance(created, str): raise ValueError('manifest timestamp')
        parsed_created = dt.datetime.fromisoformat(created.replace('Z', '+00:00'))
        if parsed_created.tzinfo is None: raise ValueError('manifest timestamp')
        recorded = manifest.get('manifest_sha256')
        payload = dict(manifest)
        payload.pop('manifest_sha256', None)
        if (not isinstance(recorded, str) or not SHA256_RE.fullmatch(recorded)
                or hashlib.sha256(canonical_manifest_bytes(payload)).hexdigest() != recorded):
            raise ValueError('manifest digest')
        artifacts = manifest.get('artifacts')
        expected = set(FIXED_PINNED_NAMES) | set(AUDIT_PATTERNS)
        if not isinstance(artifacts, dict) or set(artifacts) != expected:
            raise ValueError('manifest artifacts')
        pinned = set()
        names = direct_names(commit, run_root)
        for kind, item in artifacts.items():
            if not isinstance(item, dict) or set(item) != {'path', 'sha256'}:
                raise ValueError('artifact reference')
            name, digest = item.get('path'), item.get('sha256')
            if (not isinstance(name, str) or not re.fullmatch(r'[A-Za-z0-9_.-]+', name)
                    or not isinstance(digest, str) or not SHA256_RE.fullmatch(digest)):
                raise ValueError('artifact path or digest')
            if kind in FIXED_PINNED_NAMES:
                if name != FIXED_PINNED_NAMES[kind]: raise ValueError('fixed artifact path')
            else:
                matches = []
                for candidate in names:
                    match = AUDIT_PATTERNS[kind].fullmatch(candidate)
                    if match: matches.append((int(match.group(1) or 1), candidate))
                if not matches: raise ValueError('missing canonical audit')
                highest = max(version for version, _candidate in matches)
                latest = [candidate for version, candidate in matches if version == highest]
                if len(latest) != 1 or name != latest[0]: raise ValueError('manifest pins stale audit')
            repo_path = run_root + '/' + name
            artifact = blob(commit, repo_path)
            if artifact is None or hashlib.sha256(artifact).hexdigest() != digest:
                raise ValueError('pinned bytes')
            pinned.add(repo_path)
        return {'root': run_root, 'pinned': pinned}
    except (UnicodeDecodeError, ValueError, TypeError, json.JSONDecodeError):
        print('MALFORMED_SEALED_AUTHORITY=' + run_root, file=sys.stderr)
        raise SystemExit(5)

def append_only_path(repo_path):
    return any(pattern.fullmatch(repo_path) for pattern in APPEND_ONLY)

def derived_path(relative):
    return relative in DERIVED_TOP_LEVEL or DERIVED_MODULE_RE.fullmatch(relative) is not None

def metadata_ready(raw):
    if raw is None: return False
    try: return READY_RE.search(raw.decode('utf-8', 'strict')) is not None
    except UnicodeDecodeError: return False

def valid_corrections(raw):
    try:
        value = strict_json(raw)
        if not isinstance(value, dict) or not set(value).issubset({'schema', 'superseded_by', 'errata'}): return None
        if value.get('schema') != 'corrections/v1': return None
        superseded = value.get('superseded_by')
        if superseded is not None:
            if (not isinstance(superseded, dict) or set(superseded) != {'run_root', 'reason', 'date'}
                    or not all(isinstance(superseded.get(key), str) and superseded[key].strip()
                               for key in ('run_root', 'reason', 'date'))): return None
        errata = value.get('errata', [])
        if not isinstance(errata, list) or any(not isinstance(item, dict) for item in errata): return None
        return {'superseded_by': superseded, 'errata': errata}
    except (UnicodeDecodeError, ValueError, TypeError, json.JSONDecodeError):
        return None

def corrections_grow(old_raw, new_raw):
    if new_raw is None: return False
    new = valid_corrections(new_raw)
    if new is None: return False
    if old_raw is None: return True
    old = valid_corrections(old_raw)
    if old is None: return False
    if old['superseded_by'] is not None and new['superseded_by'] != old['superseded_by']: return False
    if len(new['errata']) < len(old['errata']): return False
    return new['errata'][:len(old['errata'])] == old['errata']

def first_local_seal(run_root):
    manifest_path = run_root + '/idea_projection_manifest.json'
    commits = [item for item in run(
        ['rev-list', '--first-parent', '--reverse', f'{base}..{source}', '--', manifest_path],
    ).splitlines() if item]
    for commit in commits:
        parents = run(['rev-list', '--parents', '-n', '1', commit]).strip().split()
        if len(parents) != 2: raise SystemExit(3)
        if blob(commit, manifest_path) is not None and blob(parents[1], manifest_path) is None:
            return commit
    return None

def enforce_sealed_delta(run_root, authority_commit, final_commit, terminal_required):
    prefix = run_root + '/'
    paths = [item.decode('utf-8', 'strict') for item in run(
        ['diff', '--name-only', '-z', authority_commit, final_commit, '--', run_root], raw=True,
    ).split(b'\0') if item]
    for repo_path in paths:
        if not repo_path.startswith(prefix): raise SystemExit(3)
        relative = repo_path[len(prefix):]
        authoritative = entry(authority_commit, repo_path)
        final = entry(final_commit, repo_path)
        if authoritative == final: continue
        if append_only_path(repo_path):
            if authoritative is not None or final is None:
                print('IMMUTABLE_APPEND_ONLY_CONFLICT=' + repo_path, file=sys.stderr)
                raise SystemExit(4)
            continue
        if derived_path(relative):
            if final is None:
                print('IMMUTABLE_SEALED_RUN_CONFLICT=' + repo_path, file=sys.stderr)
                raise SystemExit(4)
            continue
        if relative == 'RUN_METADATA.md':
            old_raw, new_raw = blob(authority_commit, repo_path), blob(final_commit, repo_path)
            if new_raw is None or metadata_ready(old_raw):
                print('IMMUTABLE_SEALED_RUN_CONFLICT=' + repo_path, file=sys.stderr)
                raise SystemExit(4)
            terminal_required.add(run_root)
            continue
        if relative == 'corrections.json':
            if not corrections_grow(blob(authority_commit, repo_path), blob(final_commit, repo_path)):
                print('IMMUTABLE_SEALED_RUN_CONFLICT=' + repo_path, file=sys.stderr)
                raise SystemExit(4)
            continue
        if relative == 'RUN_FAILURE.md' and authoritative is not None and final is None:
            continue
        if relative in TERMINAL_COMPLETION and authoritative is None and final is not None:
            terminal_required.add(run_root)
            continue
        print('IMMUTABLE_SEALED_RUN_CONFLICT=' + repo_path, file=sys.stderr)
        raise SystemExit(4)

sealed = {}
terminal_required = set()
for changed_path in changed:
    if changed_path.endswith('/idea_admission.json'):
        match = RUN_PATH_RE.match(changed_path)
        if match: terminal_required.add(match.group(1))
for changed_path in changed:
    match = RUN_PATH_RE.match(changed_path)
    if match and match.group(1) not in sealed:
        run_root = match.group(1)
        base_manifest = entry(base, run_root + '/idea_projection_manifest.json')
        remote_manifest = entry(remote, run_root + '/idea_projection_manifest.json')
        if base_manifest is not None and remote_manifest != base_manifest:
            print('MALFORMED_SEALED_AUTHORITY=' + run_root, file=sys.stderr)
            raise SystemExit(5)
        authority = sealed_authority(remote, run_root)
        authority_commit = remote if authority is not None else first_local_seal(run_root)
        if authority_commit is not None:
            if authority is None: authority = sealed_authority(authority_commit, run_root)
            if authority is None: raise SystemExit(5)
            authority['remote'] = authority_commit == remote
            sealed[run_root] = authority
            if authority_commit != remote:
                enforce_sealed_delta(run_root, authority_commit, source, terminal_required)
                # A new seal is publishable only as a complete canonical terminal result. This also
                # prevents create -> rewrite/delete laundering inside an unpublished saved lineage.
                terminal_required.add(run_root)

env = dict(os.environ, GIT_INDEX_FILE=index)
checked_local_archives = set()
for p in changed:
    before, saved, shared = entry(base,p), entry(source,p), entry(remote,p)
    # Isolated publication commits intentionally do not retain the saved checkout's ancestry. During
    # ordered recovery, shared main can therefore contain the exact immediate-parent bytes published
    # by C1 even though merge-base(C2, synthetic-main) remains the older base. Accept only that exact
    # predecessor for a path changed by C2; every immutable/archive rule below still runs first.
    sanctioned_remote_advance = p in own_set and shared == entry(source_parent, p)
    commodity_archive = COMMODITY_ARCHIVE_RE.match(p)
    if commodity_archive:
        archive_root = commodity_archive.group(1)
        remote_archive = any(run(
            ['ls-tree', '-r', '-z', '--name-only', remote, '--', archive_root], raw=True,
        ).split(b'\0'))
        # The first publication may create the whole content-addressed decision subtree. Once any blob
        # exists remotely, that decision ID is an immutable archive: no additions, edits, or deletions.
        if remote_archive and saved != shared:
            print('IMMUTABLE_COMMODITY_ARCHIVE_CONFLICT=' + p, file=sys.stderr)
            raise SystemExit(4)
        if not remote_archive and archive_root not in checked_local_archives:
            checked_local_archives.add(archive_root)
            first_tree = earliest_local_subtree(archive_root)
            if first_tree is not None and subtree(source, archive_root) != first_tree:
                print('IMMUTABLE_COMMODITY_ARCHIVE_CONFLICT=' + archive_root, file=sys.stderr)
                raise SystemExit(4)
    if append_only_path(p) and shared is None and before is None:
        first = earliest_local_addition(p)
        if first is not None and saved != first:
            print('IMMUTABLE_APPEND_ONLY_CONFLICT=' + p, file=sys.stderr)
            raise SystemExit(4)
    if append_only_path(p) and shared is not None and saved != shared:
        print('IMMUTABLE_APPEND_ONLY_CONFLICT=' + p, file=sys.stderr)
        raise SystemExit(4)
    match = RUN_PATH_RE.match(p)
    authority = sealed.get(match.group(1)) if match else None
    if authority and authority.get('remote'):
        relative = p[len(authority['root']) + 1:]
        if shared != saved:
            if append_only_path(p):
                if shared is not None or saved is None:
                    print('IMMUTABLE_APPEND_ONLY_CONFLICT=' + p, file=sys.stderr)
                    raise SystemExit(4)
            elif derived_path(relative):
                if saved is None:
                    print('IMMUTABLE_SEALED_RUN_CONFLICT=' + p, file=sys.stderr)
                    raise SystemExit(4)
            elif relative == 'RUN_METADATA.md':
                if saved is None or metadata_ready(blob(remote, p)):
                    print('IMMUTABLE_SEALED_RUN_CONFLICT=' + p, file=sys.stderr)
                    raise SystemExit(4)
                terminal_required.add(authority['root'])
                sanctioned_remote_advance = True
            elif relative == 'corrections.json':
                if not corrections_grow(blob(remote, p), blob(source, p)):
                    print('IMMUTABLE_SEALED_RUN_CONFLICT=' + p, file=sys.stderr)
                    raise SystemExit(4)
                sanctioned_remote_advance = True
            elif relative == 'RUN_FAILURE.md' and shared is not None and saved is None:
                pass
            elif relative in TERMINAL_COMPLETION and shared is None and saved is not None:
                terminal_required.add(authority['root'])
            else:
                print('IMMUTABLE_SEALED_RUN_CONFLICT=' + p, file=sys.stderr)
                raise SystemExit(4)
    if shared == saved: continue
    if shared != before and not sanctioned_remote_advance:
        print('CONFLICT=' + p, file=sys.stderr)
        raise SystemExit(4)
    if saved is None:
        subprocess.run(['git','-C',top,'update-index','--force-remove','--',p], check=True, env=env)
    else:
        subprocess.run(['git','-C',top,'update-index','--add','--cacheinfo',saved[0],saved[1],p], check=True, env=env)
with open(terminal_required_file, 'wb') as handle:
    for run_root in sorted(terminal_required):
        handle.write(run_root.encode('utf-8') + b'\0')
PYAPPLY
  then
    echo "saved-publication: shared research bytes changed; refusing to overwrite immutable history" >&2
    exit 5
  fi

  while IFS= read -r -d '' terminal_root; do
    if ! source_terminal_publication_is_valid "$terminal_root" \
      || ! result_terminal_publication_is_valid "$terminal_root"; then
      echo "saved-publication: canonical terminal publication failed for $terminal_root" >&2
      exit 5
    fi
    echo "TERMINAL_PUBLICATION_REPLAY=$terminal_root"
  done <"$TMP/terminal-required"

  # commit-run uses this exact source commit as an immutable snapshot of its staged index. The complete
  # remote CAS/seal policy above has now passed, but preflight must never create, converge, or push a ref.
  if [ "$PREFLIGHT_ONLY" -eq 1 ]; then
    echo "PUBLICATION_PREFLIGHT_OK=1"
    exit 0
  fi

  if GIT_INDEX_FILE="$INDEX" git -C "$TOP" diff --cached --quiet "$REMOTE" --; then
    maybe_converge_checkout "$REMOTE"
    echo "ALREADY_PUBLISHED=1"
    exit 0
  fi
  GIT_INDEX_FILE="$INDEX" git -C "$TOP" diff --cached --name-only -z "$REMOTE" -- >"$TMP/changed" || exit 5

  # Validate every resulting changed entry and any terminal decision at the exact isolated-index seam.
  while IFS= read -r -d '' changed; do
    mode="$(GIT_INDEX_FILE="$INDEX" git -C "$TOP" ls-files -s -- "$changed" | awk '{print $1}')"
    if [ -n "$mode" ] && [ "$mode" != "100644" ] && [ "$mode" != "100755" ]; then
      echo "saved-publication: non-regular saved entry: $changed" >&2
      exit 5
    fi
    if [[ "$changed" =~ ^analyses/[^/]+/decision_record\.json$ ]]; then
      run_root="${changed%/decision_record.json}"
      if source_terminal_publication_is_valid "$run_root" \
        && result_terminal_publication_is_valid "$run_root"; then
        echo "TERMINAL_PUBLICATION_REPLAY=$run_root"
      elif ! GIT_INDEX_FILE="$INDEX" git -C "$TOP" show ":$changed" >"$TMP/decision_record.json" \
        || ! (cd "$TOP" && python3 scripts/eval.py --data-needs-prewrite "$TMP/decision_record.json"); then
        echo "saved-publication: decision validation failed for $changed" >&2
        exit 5
      fi
    fi
  done <"$TMP/changed"

  TREE="$(GIT_INDEX_FILE="$INDEX" git -C "$TOP" write-tree)" || exit 5
  COMMIT="$(printf '%s\n' "$MSG" | git -C "$TOP" commit-tree "$TREE" -p "$REMOTE")" || exit 5
  if git -C "$TOP" push -q origin "$COMMIT:main" 2>/dev/null; then
    TRACKED="$(git -C "$TOP" rev-parse refs/remotes/origin/main 2>/dev/null || true)"
    if [ "$TRACKED" != "$COMMIT" ]; then
      git -C "$TOP" update-ref refs/remotes/origin/main "$COMMIT" "$REMOTE" || exit 4
    fi
    maybe_converge_checkout "$COMMIT"
    echo "PUBLICATION_SHA=$COMMIT"
    exit 0
  fi
  attempt=$((attempt + 1))
  if ! git -C "$TOP" fetch -q origin main 2>/dev/null; then break; fi
done

echo "saved-publication: shared main kept moving; saved bytes remain local and will retry" >&2
exit 4
