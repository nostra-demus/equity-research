#!/usr/bin/env python3
"""
ingest_external.py — External-data inbox router for the equity-research engine.

WHY THIS EXISTS
  The user buys and collects primary research the pool has no lane for: paid
  alternative-data notes (YipitData-style panels), expert-network calls, his own
  channel checks, broker research, and (later) paid-API pulls. The contract is
  frameworks/EXTERNAL_DATA.md. This router is the low-friction entry point:

    data/EXTERNAL-INBOX/                    <- the user drops ANYTHING here
      <file>                                 loose: ticker(s) auto-detected
      <Provider>/<file>                      provider from the folder name
      <Provider>/<TICKER>/<file>             forced routing, no detection
      _routed/                               originals archived after routing
      .ingest_ledger.ndjson                  append-only ledger (sha256-deduped)

  Each routed file lands at data/<TICKER>/external/<provider-slug>/<file> with a
  <file>.source.json provenance sidecar (provider, source_type, §4 tier, dates,
  tickers covered, license). Multi-ticker documents are copied into EVERY
  matching pool. Nothing is silently dropped: a file that matches no known
  ticker stays in the inbox and is reported.

CONTRACT
  Deterministic — no LLM. Detection = filename + sniffed-text matching against
    aliases harvested from the existing data/<TICKER>/ pools themselves.
  Recommend-only — prints (and records in the ledger) a suggested
    /research:rerun per routed ticker; it NEVER launches a run (runs cost money).
  Drive-safe — the pool is a Google Drive FUSE mount: copies write contents only
    (no attribute preservation), land via a temp file + rename, and a file still
    syncing (young mtime / changing size) is skipped until the next pass.
  Idempotent — sha256 ledger; re-running is free. Singleton lock on LOCAL disk
    (never the mount, where O_EXCL is unreliable).

USAGE
  python3 ingest_external.py [--pool data] [--dry-run]
  Run from the repo root (the launchd timer com.nostradamus.external-ingest does).
"""
import sys
import os
import re
import json
import time
import hashlib
import tempfile
import importlib.util
from datetime import date

# ---- shared venv re-exec (same .venv as extract_pool; own sentinel) ----
# extract_pool._ensure_deps cannot be reused: it execv's extract_pool's OWN
# __file__, which would replace this process with the extractor. Same venv
# though — without xlrd/openpyxl the body-sniff of a vendor .xls/.xlsx returns
# almost nothing and a workbook would route on its filename alone.
def _ensure_venv():
    try:
        import xlrd  # noqa
        import openpyxl  # noqa
        return
    except Exception:
        pass
    if os.environ.get("_INGEST_EXTERNAL_VENV") == "1":
        return
    here = os.path.dirname(os.path.abspath(__file__))
    venv_py = os.path.join(here, ".venv", "bin", "python")
    if os.path.exists(venv_py):
        os.environ["_INGEST_EXTERNAL_VENV"] = "1"
        os.execv(venv_py, [venv_py, os.path.abspath(__file__)] + sys.argv[1:])
    # No venv: proceed — PDFs/text still sniff; workbooks degrade to filename routing.


def _load_extract_pool():
    """Import the sibling extract_pool.py (sniff_text, entity_from_filename, _norm_entity)
    without triggering its venv re-exec (we only call pure helpers)."""
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location("extract_pool", os.path.join(here, "extract_pool.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


INBOX_NAME = "EXTERNAL-INBOX"
ROUTED_DIR = "_routed"
LEDGER_NAME = ".ingest_ledger.ndjson"
README_NAME = "README.md"
# Keep in sync with RESERVED_DATA_FOLDERS in ui/server/src/config.ts — reserved
# system folders in the pool root that are never companies.
RESERVED = {"news-archive", "external-inbox"}

# A folder/company symbol as the engine uses them — MIRRORS ui/server/src/sandbox.ts TICKER_RE
# (`[A-Z0-9.\-]{1,15}` + at least one alphanumeric), so a digit-led Indian symbol or a 13-15 char
# ticker the cockpit accepts is also routable here (incl. via the forced <Provider>/<TICKER>/ lane).
TICKER_SHAPE = re.compile(r"^(?=.*[A-Z0-9])[A-Z0-9.\-]{1,15}$")
# Auto-detection only trusts symbols of length >= 3 as bare word tokens ("IT"/"SO"/"A" would
# over-match any English text); shorter symbols need an explicit context tag ($SO / (NYSE:SO)).
MIN_BARE_SYMBOL_LEN = 3
SNIFF_CHARS = 60_000       # deep enough to catch a ticker covered late in a long note
ROUTE_SCORE = 5            # filename hit alone routes; body-only needs >=5 mentions
MAX_FANOUT = 5             # a doc matching more tickers than this is "too broad" -> stays in inbox
STABLE_AGE_S = 60          # a file younger than this may still be syncing (Drive FUSE)
STABLE_RECHECK_S = 2       # size must be unchanged across two stats this far apart

# extract_pool.POINTER_EXTS lives in the loaded module; junk we never route:
JUNK_NAMES = {README_NAME, LEDGER_NAME, ".DS_Store"}
JUNK_PREFIXES = ("~$", ".")
JUNK_SUFFIXES = (".tmp", ".crdownload", ".partial")

# source_type -> CLAUDE.md §4 tier (the frameworks/EXTERNAL_DATA.md mapping)
TIER = {
    "alt_data_panel": 5, "vendor_export": 5, "paid_api": 5,
    "broker_research": 7,
    "expert_call": 9, "channel_check": 9, "management_meeting": 9, "external_other": 9,
}
# source_type -> the orb most likely invalidated (a HINT for the human, recommend-only)
RERUN_HINT = {
    "alt_data_panel": ("earnings", "guidance-consensus"),
    "vendor_export": ("earnings", "guidance-consensus"),
    "paid_api": ("earnings", "revenue-drivers"),
    "broker_research": ("earnings", "guidance-consensus"),
    "expert_call": ("business-model", "business-quality"),
    "channel_check": ("earnings", "revenue-drivers"),
    "management_meeting": ("management-governance", "management-and-track-record"),
    "external_other": ("earnings", "guidance-consensus"),
}

# A pool folder can be a COMMODITY (GOLD, SUGAR) rather than an equity ticker — the commodity
# swarm shares data/<SUBJECT>/ and its subjects are the `## <NAME>` headings of the profiles file
# (the same source the /commodity:* commands grep). The rerun hint switches accordingly:
# `/commodity:rerun supply-demand <NAME>` is the documented "common post-note case".
_PROFILES_PATH = os.path.join("frameworks", "commodity", "COMMODITY_PROFILES.md")
_commodity_cache = {}


def _is_commodity_subject(name):
    if name in _commodity_cache:
        return _commodity_cache[name]
    hit = False
    try:
        txt = open(_PROFILES_PATH, encoding="utf-8").read()
        hit = bool(re.search(r"(?m)^## " + re.escape(name) + r"\s*$", txt))
    except Exception:
        hit = False
    _commodity_cache[name] = hit
    return hit


def _rerun_hint(stype, subject):
    if _is_commodity_subject(subject):
        return f"/commodity:rerun supply-demand {subject}"
    module, agent = RERUN_HINT.get(stype, RERUN_HINT["external_other"])
    return f"/research:rerun {module} {agent} {subject}"

KNOWN_PROVIDERS = {
    "yipit": "YipitData", "yipitdata": "YipitData",
    "m science": "M Science", "second measure": "Second Measure",
    "similarweb": "SimilarWeb", "sensor tower": "Sensor Tower",
    "consumer edge": "Consumer Edge", "earnest": "Earnest Analytics",
    "tegus": "Tegus", "glg": "GLG", "alphasights": "AlphaSights",
    "third bridge": "Third Bridge", "guidepoint": "Guidepoint",
    "visible alpha": "Visible Alpha", "hedgeye": "Hedgeye",
}

# What a KNOWN provider ships — used when the document's own text gives no stronger signal, so a
# `<Provider>/<TICKER>/` drop whose only vendor cue is the folder name still lands at the right
# source_type/tier (an alt-data vendor's opaque export must not default to external_other/tier 9).
PROVIDER_TYPE = {
    "YipitData": "alt_data_panel", "M Science": "alt_data_panel", "Second Measure": "alt_data_panel",
    "SimilarWeb": "alt_data_panel", "Sensor Tower": "alt_data_panel", "Consumer Edge": "alt_data_panel",
    "Earnest Analytics": "alt_data_panel", "Visible Alpha": "alt_data_panel",
    "Tegus": "expert_call", "GLG": "expert_call", "AlphaSights": "expert_call",
    "Third Bridge": "expert_call", "Guidepoint": "expert_call",
    "Hedgeye": "broker_research",
}

# Period-shaped folder names ("2026", "Q1-2026", "Mar-26", "FY26", "H1-2026") are how providers
# organize drops by date — NEVER a forced ticker, or a fake data/2026/ pool would swallow the doc.
PERIOD_SHAPE = re.compile(
    r"^(?:(?:19|20)\d{2}(?:[-_.](?:\d{1,2})(?:[-_.]\d{1,2})?)?"
    r"|Q[1-4](?:[-_ ]?(?:19|20)?\d{2})?"
    r"|FY[-_ ]?\d{2,4}"
    r"|H[12](?:[-_ ]?(?:19|20)?\d{2})?"
    r"|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[-_ ]?\d{2,4})$",
    re.I)

README_TEXT = """# External data inbox

Drop ANY research file here — paid data notes, expert-call notes, your own channel
checks, broker research, API pulls. Every ~10 minutes the engine routes each file
into the matching company pool(s) at `<TICKER>/external/<provider>/`, writes a
provenance sidecar next to it, and archives the original under `_routed/`.

Layouts (all work):
- loose file            -> the engine detects which company/companies it covers
- `<Provider>/<file>`   -> the provider is taken from the folder name
- `<Provider>/<TICKER>/<file>` -> forced: goes to that ticker, no detection

A file that matches no known company stays here (nothing is silently dropped) —
give it a `<Provider>/<TICKER>/` folder to force it. Detection only targets
companies that already have a folder in this Drive pool.

Optional: a `.aliases.json` file here teaches the router the product/segment
names a document uses instead of the company name, e.g.
`{"AMZN": ["Amazon", "AWS", "Amazon Web Services"]}`.

Commodities work the same way: a `GOLD/` or `SUGAR/` pool folder receives
external research too (satellite crop data, paid analytics, trade channel
checks), and the engine suggests `/commodity:rerun` instead. Commodity names
are common words, so prefer the forced `<Provider>/<COMMODITY>/` layout (or
add precise `.aliases.json` entries) over loose drops.

Rules of the road (frameworks/EXTERNAL_DATA.md in the repo):
- external data is cited as what it is (estimate / expert view / channel check),
  never as a filing, and never replaces a filing's own number;
- re-runs of a finished call stay YOURS to trigger — the engine recommends the
  exact command, it never spends on its own.
"""


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def slug(s, fallback="unfiled"):
    s = re.sub(r"[^A-Za-z0-9._\- ]+", "", str(s)).strip().lower().replace(" ", "-")
    s = re.sub(r"-{2,}", "-", s).strip("-._")
    return s or fallback


# ---------- provenance heuristics (deterministic; the analyst re-reads the doc anyway) ----------

def infer_source_type(name, sniff):
    """Best-effort source_type from filename + sniffed head. Conservative default."""
    hay = f"{name}\n{sniff[:6000]}".lower()
    if re.search(r"channel[\s_-]?check", hay):
        return "channel_check"
    if re.search(r"\b(tegus|glg|alphasights|third bridge|guidepoint)\b|expert (call|interview|network)", hay):
        return "expert_call"
    if re.search(r"\b(ndr|non-deal roadshow)\b|meeting with (the )?management|ir meeting", hay):
        return "management_meeting"
    # broker note: a directional verdict block (target price + rating label) — mirrors the
    # cockpit's sell-side-note detection (ui/server/src/data-status.ts isSellSideNoteContent)
    if re.search(r"target[\s\-]?price|price[\s\-]?target", hay) and \
       re.search(r"(?<!credit )\brating\b|recommendation|overweight|underweight", hay):
        return "broker_research"
    # measured panel / dataset language, or a known alt-data vendor name
    if re.search(r"\bpanel\b|margin of error|backtest|our estimates? (vs|versus|against)|"
                 r"yipit|m science|second measure|similarweb|sensor tower|consumer edge|earnest analytics", hay):
        return "alt_data_panel"
    ext = name.lower().rsplit(".", 1)[-1] if "." in name else ""
    if ext in ("xls", "xlsx", "xlsm", "csv"):
        return "vendor_export"
    if ext == "json":
        return "paid_api"
    return "external_other"


def infer_provider(name, sniff, folder=None):
    if folder:
        return folder  # the user's folder name wins verbatim (slugged at the path layer)
    hay = f"{name}\n{sniff[:4000]}".lower()
    for key, canon in KNOWN_PROVIDERS.items():
        if key in hay:
            return canon
    return "unfiled"


_MONTHS = {m: i + 1 for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"])}


def _parse_dates(name, sniff):
    """(as_of, published) best-effort. as_of = data coverage ('data through' / 'Mar-26' in the
    name); published = the document's own header date. Either may be None — the reading layer
    always confirms from inside the document (fix F23)."""
    as_of = published = None
    hay = f"{name}\n{sniff[:4000]}"
    m = re.search(r"(?:data )?thr(?:ough|u)\s+(\d{1,2})/(\d{1,2})(?:/(\d{2,4}))?", hay, re.I)
    if m and m.group(3):
        y = int(m.group(3)); y += 2000 if y < 100 else 0
        a, b = int(m.group(1)), int(m.group(2))
        # VALIDATE, and detect the day-first form ("data through 31/03/2026"): a first number
        # that cannot be a month is the day. Both plausible -> US month-first. Neither -> drop.
        mo, dy = (a, b) if a <= 12 else (b, a)
        if a > 12 and b > 12:
            mo = dy = 0
        if 1 <= mo <= 12 and 1 <= dy <= 31:
            as_of = f"{y:04d}-{mo:02d}-{dy:02d}"
    if not as_of:
        m = re.search(r"\b([A-Za-z]{3})[a-z]*[- ](\d{2})\b(?=\s*(update|data|panel|read|month)|\W*$)", name, re.I)
        if m and m.group(1).lower()[:3] in _MONTHS:
            as_of = f"20{int(m.group(2)):02d}-{_MONTHS[m.group(1).lower()[:3]]:02d}"
    m = re.search(r"\b([A-Z][a-z]{2,8}) (\d{1,2}), (\d{4})\b", sniff[:2500])
    if m and m.group(1).lower()[:3] in _MONTHS:
        published = f"{int(m.group(3)):04d}-{_MONTHS[m.group(1).lower()[:3]]:02d}-{int(m.group(2)):02d}"
    return as_of, published


def infer_license(sniff):
    """'do not forward/share' boilerplate marks subscriber-licensed material — the memo layer
    then cites figures with attribution and never republishes tables (EXTERNAL_DATA.md §3)."""
    if re.search(r"do not (forward|share|redistribute)|for subscribers? only|intended for subscribers",
                 sniff[:4000], re.I):
        return "subscriber-only"
    return "unspecified"


# ---------- ticker detection ----------

def pool_tickers(pool):
    out = []
    try:
        for n in sorted(os.listdir(pool)):
            if n.startswith(".") or n.lower() in RESERVED:
                continue
            if TICKER_SHAPE.match(n) and os.path.isdir(os.path.join(pool, n)):
                out.append(n)
    except Exception:
        pass
    return out


def harvest_aliases(pool, tickers, ep):
    """Alias phrases per ticker — three zero-friction layers:
    (a) harvested from the pool's own filenames ('Amazon com Inc NasdaqGS AMZN
        Competitors.rtf' -> 'amazon com'), normalized;
    (b) the first DISTINCTIVE token of each harvested name ('amazon', 'bunge') — >=4 chars
        and not a generic token, so a note that says 'Amazon' but never 'AMZN' still routes;
    (c) optional user-editable EXTERNAL-INBOX/.aliases.json: {"AMZN": ["Amazon", "AWS",
        "Amazon Web Services"], ...} — the place to teach the router segment/product names
        a document uses instead of the company name.
    The bare symbol itself is matched separately (case-sensitively)."""
    user_aliases = {}
    try:
        user_aliases = json.load(open(os.path.join(pool, INBOX_NAME, ".aliases.json"), encoding="utf-8"))
    except Exception:
        pass
    if not isinstance(user_aliases, dict):
        user_aliases = {}  # a valid-JSON but wrong-type sidecar (array/string/number) must degrade to "no
        #                    aliases", not crash harvest_aliases (which runs every pass) and wedge the whole lane
    aliases = {}
    for t in tickers:
        names = set()
        try:
            for n in os.listdir(os.path.join(pool, t)):
                if n.startswith("."):
                    continue
                ent = ep.entity_from_filename(n)
                if ent:
                    norm = ep._norm_entity(ent)
                    if norm and len(norm) >= 4:
                        names.add(norm)
        except Exception:
            pass
        for phrase in list(names):
            tok = phrase.split()[0]
            if len(tok) >= 4 and tok not in ep._GENERIC_ENTITY_TOKENS:
                names.add(tok)
        for a in user_aliases.get(t, []) or []:
            norm = ep._norm_entity(str(a))
            if norm:
                names.add(norm)
        aliases[t] = names
    return aliases


def _count_word(text, word, flags=0):
    if not word:
        return 0
    return len(re.findall(r"(?<![A-Za-z0-9])" + re.escape(word) + r"(?![A-Za-z0-9])", text, flags))


def _count_phrase(norm_text, phrase):
    """Occurrences of a normalized phrase in normalized text. Lookarounds (not consumed
    delimiters), so adjacent hits ('… bunge bunge …') all count — a padded str.count
    silently drops every second adjacent occurrence."""
    if not phrase:
        return 0
    return len(re.findall(r"(?<![a-z0-9])" + re.escape(phrase) + r"(?![a-z0-9])", norm_text))


def match_tickers(filename, sniff, tickers, aliases):
    """Score each candidate ticker against the doc. Returns [(ticker, score), ...] routed order.
    Rules (deliberately conservative — the forced <Provider>/<TICKER>/ lane covers the rest):
      filename symbol/alias hit = 5 (routes alone); body: bare symbol tokens are CASE-SENSITIVE
      and only for symbols >= 3 chars (else require $SYM / (EXCH:SYM)); alias phrases are
      case-insensitive on the normalized text."""
    norm_body = " " + re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", (sniff or "").lower())) + " "
    norm_name = " " + re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", filename.lower())) + " "
    scores = []
    for t in tickers:
        score = 0
        # filename symbols match case-INSENSITIVELY (a filename is metadata — "amzn_panel.pdf"
        # is the only routing signal a scanned/sparse-text file has); BODY symbols stay
        # case-sensitive below to avoid prose false positives.
        fname_hit = bool(_count_word(filename, t, re.I)) or any(_count_phrase(norm_name, a) for a in aliases.get(t, ()))
        if fname_hit:
            score += 5
        if len(t) >= MIN_BARE_SYMBOL_LEN:
            score += min(_count_word(sniff or "", t), 10)  # case-sensitive: AMZN, not "amzn corp." prose
        # short symbols only via explicit tags
        score += min(len(re.findall(r"[$(]\s*(?:[A-Za-z]+\s*:\s*)?" + re.escape(t) + r"\b", sniff or "")), 10)
        score += min(sum(_count_phrase(norm_body, a) for a in aliases.get(t, ())), 10)
        if score >= ROUTE_SCORE:
            scores.append((t, score))
    scores.sort(key=lambda x: -x[1])
    return scores


# ---------- filesystem plumbing (Drive-FUSE-safe) ----------

def is_stable(path, first_stat):
    """A Drive file can surface mid-sync: young mtime, or size still changing. Two stats a
    couple of seconds apart + a minimum age make routing wait for the next pass instead of
    copying half a file. (The server-side watcher has awaitWriteFinish; the router needs its own.)"""
    try:
        if time.time() - first_stat.st_mtime < STABLE_AGE_S:
            return False
        time.sleep(STABLE_RECHECK_S)
        return os.stat(path).st_size == first_stat.st_size and first_stat.st_size > 0
    except Exception:
        return False


def copy_contents(src, dst):
    """Copy CONTENTS via a temp file + rename. Drive's file provider rejects attribute
    preservation (see scripts/ops/news-archive.sh), and rename is the closest thing to an
    atomic landing the mount offers."""
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    tmp = os.path.join(os.path.dirname(dst), ".tmp-" + os.path.basename(dst))
    with open(src, "rb") as fi, open(tmp, "wb") as fo:
        while True:
            chunk = fi.read(1 << 20)
            if not chunk:
                break
            fo.write(chunk)
    os.replace(tmp, dst)


def move_to_routed(src, inbox):
    rel = os.path.relpath(src, inbox)
    dst = os.path.join(inbox, ROUTED_DIR, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst):  # same name routed before — keep both, suffixed
        base, ext = os.path.splitext(dst)
        i = 2
        while os.path.exists(f"{base} ({i}){ext}"):
            i += 1
        dst = f"{base} ({i}){ext}"
    try:
        os.rename(src, dst)
    except OSError:  # cross-device / FUSE oddity: copy + unlink
        copy_contents(src, dst)
        os.unlink(src)


# ---------- singleton lock (LOCAL disk — O_EXCL on the FUSE mount is unreliable) ----------

def acquire_lock():
    lock = os.path.join(tempfile.gettempdir(), "nostra-external-ingest.lock")
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
        return lock
    except FileExistsError:
        try:
            pid = int(open(lock).read().strip() or "0")
            alive = pid > 0 and _pid_alive(pid)
            stale = time.time() - os.path.getmtime(lock) > 1800
            if not alive or stale:
                os.unlink(lock)  # steal a dead/stale lock and retry once
                return acquire_lock()
        except Exception:
            pass
        return None
    except Exception:
        return lock  # fail OPEN: never block the only ingester on a lock hiccup


def _pid_alive(pid):
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


# ---------- main pass ----------

def load_ledger(path):
    seen = set()
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                try:
                    seen.add(json.loads(line).get("sha256"))
                except Exception:
                    continue
    except FileNotFoundError:
        pass
    return seen


def iter_inbox_files(inbox):
    for root, dirs, files in os.walk(inbox):
        dirs[:] = [d for d in dirs if d != ROUTED_DIR and not d.startswith(".")]
        for n in sorted(files):
            if n in JUNK_NAMES or n.startswith(JUNK_PREFIXES) or n.lower().endswith(JUNK_SUFFIXES):
                continue
            if n.lower().rsplit(".", 1)[-1] in ("gdoc", "gsheet", "gslides"):
                continue  # Drive pointer stubs — no local content to route
            yield os.path.join(root, n)


def classify_inbox_path(fp, inbox, tickers):
    """(provider_folder, forced_ticker) from the file's position in the inbox.
    A first-level folder that IS an existing pool ticker = forced ticker; otherwise it is a
    provider name. A second-level ticker-shaped folder = forced ticker (pool created if new)."""
    parts = os.path.relpath(fp, inbox).split(os.sep)[:-1]
    if not parts:
        return None, None
    if len(parts) == 1:
        if parts[0] in tickers:
            return None, parts[0]
        return parts[0], None
    # a period-shaped second segment ("2026", "Q1-2026", "Mar-26") is a provider's date folder,
    # never a forced ticker — force-routing it would create a fake data/2026/ pool
    forced = parts[1] if TICKER_SHAPE.match(parts[1]) and not PERIOD_SHAPE.match(parts[1]) else None
    return parts[0], forced


def run(pool="data", dry_run=False):
    ep = _load_extract_pool()
    pool = os.path.abspath(pool)
    inbox = os.path.join(pool, INBOX_NAME)
    os.makedirs(os.path.join(inbox, ROUTED_DIR), exist_ok=True)
    readme = os.path.join(inbox, README_NAME)
    if not os.path.exists(readme) and not dry_run:
        open(readme, "w", encoding="utf-8").write(README_TEXT)

    ledger_path = os.path.join(inbox, LEDGER_NAME)
    seen = load_ledger(ledger_path)
    tickers = pool_tickers(pool)
    aliases = harvest_aliases(pool, tickers, ep)

    routed, skipped, unrouted = [], [], []
    for fp in iter_inbox_files(inbox):
        base = os.path.basename(fp)
        try:
            st = os.stat(fp)
        except Exception:
            continue
        if st.st_size == 0:
            skipped.append((base, "empty file"))
            continue
        if not is_stable(fp, st):
            skipped.append((base, "still syncing — next pass"))
            continue
        digest = sha256_file(fp)
        provider_folder, forced = classify_inbox_path(fp, inbox, tickers)
        # sha256 dedup — but a FORCED drop is an explicit instruction: a doc auto-routed to one
        # ticker earlier can be force-added to another (the documented <Provider>/<TICKER>/ path
        # for a missed ticker). The per-target copy below still skips a pool that already holds
        # this exact content, so a forced re-drop of an already-covered ticker stays a no-op.
        if digest in seen and not forced:
            skipped.append((base, "already routed (ledger)"))
            continue
        sniff = ""
        try:
            sniff = ep.sniff_text(fp, SNIFF_CHARS)
        except Exception:
            pass

        if forced:
            targets = [(forced, -1)]  # -1 = forced, no score
        else:
            targets = match_tickers(base, sniff, tickers, aliases)
            if not targets:
                unrouted.append((base, "no known company matched — use a <Provider>/<TICKER>/ folder to force it"))
                continue
            if len(targets) > MAX_FANOUT:
                unrouted.append((base, f"matched {len(targets)} companies — too broad; split it or force-route"))
                continue

        provider = infer_provider(base, sniff, provider_folder)
        stype = infer_source_type(base, sniff)
        # the folder name is often the ONLY vendor signal (`YipitData/AMZN/opaque.xlsx`): when the
        # content gave no stronger signal than a generic bucket, a KNOWN provider sets the type
        canon = KNOWN_PROVIDERS.get(str(provider).strip().lower(), provider)
        if stype in ("external_other", "vendor_export", "paid_api") and canon in PROVIDER_TYPE:
            provider = canon
            stype = PROVIDER_TYPE[canon]
        pslug = slug(provider)
        as_of, published = _parse_dates(base, sniff)
        tick_list = [t for t, _ in targets]
        sidecar = {
            "provider": provider,
            "source_type": stype,
            "tier": TIER.get(stype, 9),
            "as_of": as_of,
            "published": published,
            "received": date.today().isoformat(),
            "tickers": tick_list,
            "license": infer_license(sniff),
            "origin": base,
            "sha256": digest,
            "routed_by": "ingest_external.py",
            "routed_from": os.path.relpath(fp, pool),
        }
        hints = [_rerun_hint(stype, t) for t in tick_list]

        if dry_run:
            routed.append((base, tick_list, provider, stype, hints))
            continue

        for t in tick_list:
            dst = os.path.join(pool, t, "external", pslug, base)
            # same-name collisions: keep EVERY distinct version — walk (2), (3), … until a free
            # slot or an identical copy (recurring vendor exports all named "report.pdf" must
            # never overwrite the evidence history). Identical content already in place = no-op.
            stem, ext = os.path.splitext(base)
            i = 2
            while os.path.exists(dst) and sha256_file(dst) != digest:
                dst = os.path.join(pool, t, "external", pslug, f"{stem} ({i}){ext}")
                i += 1
            if os.path.exists(dst):  # identical copy already in this pool
                continue
            copy_contents(fp, dst)
            json.dump(sidecar, open(dst + ".source.json", "w", encoding="utf-8"), indent=2)
        move_to_routed(fp, inbox)
        with open(ledger_path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps({**sidecar, "ts": int(time.time()), "suggested_reruns": hints}) + "\n")
        seen.add(digest)
        routed.append((base, tick_list, provider, stype, hints))

    # ---- report ----
    tag = "[ingest_external]" + (" (dry-run)" if dry_run else "")
    for base, ts, provider, stype, hints in routed:
        print(f"{tag} routed: {base} -> {', '.join(ts)}  ({provider} · {stype})")
        for h in hints:
            tick = h.rsplit(" ", 1)[-1]
            has_run = bool([d for d in _safe_ls("analyses") if d.startswith(tick + "_")]) \
                or os.path.isdir(os.path.join("commodity", "runs", tick))
            note = "finished run now stale — suggest: " if has_run else "no prior run; hint: "
            print(f"{tag}   {note}{h}")
    for base, why in unrouted:
        print(f"{tag} UNROUTED: {base} — {why}")
    for base, why in skipped:
        print(f"{tag} skipped: {base} — {why}")
    print(f"{tag} done: {len(routed)} routed, {len(unrouted)} unrouted, {len(skipped)} skipped")
    return {"routed": routed, "unrouted": unrouted, "skipped": skipped}


def _safe_ls(path):
    try:
        return os.listdir(path)
    except Exception:
        return []


def main(argv):
    _ensure_venv()
    pool = "data"
    if "--pool" in argv:
        pool = argv[argv.index("--pool") + 1]
    dry = "--dry-run" in argv
    lock = acquire_lock()
    if lock is None:
        print("[ingest_external] another ingester is running — skipping this pass")
        return 0
    try:
        run(pool, dry_run=dry)
        return 0
    finally:
        try:
            os.unlink(lock)
        except Exception:
            pass


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
