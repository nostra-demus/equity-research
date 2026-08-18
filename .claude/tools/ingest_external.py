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
    (no attribute preservation), use a staged no-clobber claim with an O_EXCL
    fallback where hardlinks are unavailable, and defer files still syncing.
  Idempotent — sha256 ledger; re-running is free. Singleton lock on LOCAL disk
    (never the mount, where O_EXCL is unreliable).

USAGE
  python3 ingest_external.py [--pool data] [--dry-run]
  Run from the repo root (the launchd timer com.nostradamus.external-ingest does).
"""
import sys
import os
import errno
import re
import json
import time
import hashlib
import hmac
import tempfile
import importlib.util
import subprocess
import stat
import fcntl
from datetime import date, datetime, timezone
from urllib.parse import urlsplit

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
MANUAL_REQUEST_DIR = ".data-need-requests"
MANUAL_INTENT_NAME = "intent.json"
MANUAL_PAYLOAD_NAME = "payload"
MANUAL_RESULT_NAME = "result.json"
MANUAL_INTENT_CONTRACT = "data-need-upload-intent/1"
MANUAL_RESULT_CONTRACT = "data-need-upload-result/1"
MANUAL_CONTEXT_CONTRACT = "data-need-upload-context/1"
MANUAL_MAX_BYTES = 40 * 1024 * 1024
MANUAL_NAME_MAX_BYTES = 255
MANUAL_FILENAME_MAX_BYTES = 200
MANUAL_SIDECAR_SUFFIX = ".source.json"
# Keep in sync with RESERVED_DATA_FOLDERS in ui/server/src/config.ts — reserved
# system folders in the pool root that are never companies.
RESERVED = {"news-archive", "external-inbox"}

# A folder/company symbol as the engine uses them — MIRRORS ui/server/src/sandbox.ts TICKER_RE
# (`[A-Z0-9.\-]{1,15}` + at least one alphanumeric), so a digit-led Indian symbol or a 13-15 char
# ticker the cockpit accepts is also routable here (incl. via the forced <Provider>/<TICKER>/ lane).
TICKER_SHAPE = re.compile(r"^(?=.*[A-Z0-9])[A-Z0-9.\-]{1,15}$")
MANUAL_SUBJECT_SHAPE = re.compile(r"^[A-Z0-9][A-Z0-9._-]{0,63}$")
MANUAL_REQUEST_ID = re.compile(r"^DNU-[a-f0-9]{32}$")
MANUAL_NEED_ID = re.compile(r"^[a-z0-9][a-z0-9_-]{0,127}$")
MANUAL_SWARM_ID = re.compile(r"^[a-z0-9][a-z0-9_-]{0,119}$")
MANUAL_FINGERPRINT = re.compile(r"^sha256:[a-f0-9]{64}$")
MANUAL_SHA256 = re.compile(r"^[a-f0-9]{64}$")
MANUAL_SIGNATURE = re.compile(r"^hmac-sha256:[a-f0-9]{64}$")
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
    "alt_data_panel": 5, "vendor_export": 5, "paid_api": 5, "official_data": 5,
    "peer_transcript": 6,  # a competitor's own earnings-call transcript — tier 6 about the PEER (§4)
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
    "peer_transcript": ("competitive-intel", "peer-readthrough-to-subject"),
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
- WILTW / "What I Learned This Week" is methodology-only and is rejected here;
  use the lawful original provider source when a report points to useful evidence;
- re-runs of a finished call stay YOURS to trigger — the engine recommends the
  exact command, it never spends on its own.
"""


def _file_identity(info):
    """Stat fields that move if and only if the file's BYTES can have moved.

    st_ctime_ns is deliberately EXCLUDED. The EXTERNAL-INBOX drop folder lives under the
    Drive-synced data/ tree, where the sync client writes xattrs that bump ctime without changing a
    byte — folding it in rejected files whose content never moved (the same defect that took out a
    whole 87-file pool in extract_pool.py; see the stable-read note there). A content write, even an
    in-place same-size byte flip, always bumps st_mtime_ns, so size + mtime + (dev, ino, nlink)
    still catch every real change. Index 2 stays st_size — _sha256_open_fd reads it positionally.
    """
    return (
        info.st_dev, info.st_ino, info.st_size,
        info.st_mtime_ns, info.st_nlink,
    )


def _open_unique_regular(path):
    before = os.lstat(path)
    if (stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode)
            or before.st_nlink != 1):
        raise ValueError("source must be a unique regular non-symlink file")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        if (not stat.S_ISREG(opened.st_mode) or opened.st_nlink != 1
                or _file_identity(opened) != _file_identity(before)):
            raise ValueError("source changed before read")
        return fd, _file_identity(opened)
    except Exception:
        os.close(fd)
        raise


def _verify_unique_regular(path, fd, identity):
    after_open = os.fstat(fd)
    after_path = os.lstat(path)
    if (not stat.S_ISREG(after_open.st_mode) or after_open.st_nlink != 1
            or stat.S_ISLNK(after_path.st_mode) or not stat.S_ISREG(after_path.st_mode)
            or after_path.st_nlink != 1
            or _file_identity(after_open) != identity
            or _file_identity(after_path) != identity):
        raise ValueError("source changed during read")


def _sha256_open_fd(path, fd, identity):
    h = hashlib.sha256()
    os.lseek(fd, 0, os.SEEK_SET)
    remaining = identity[2]
    while remaining:
        chunk = os.read(fd, min(remaining, 1 << 20))
        if not chunk:
            raise ValueError("source truncated during hashing")
        h.update(chunk)
        remaining -= len(chunk)
    if os.read(fd, 1):
        raise ValueError("source grew during hashing")
    _verify_unique_regular(path, fd, identity)
    return h.hexdigest()


# Errors a cloud-backed filesystem raises transiently. The EXTERNAL-INBOX drop folder lives on the
# Google Drive mount in Stream mode, so the FIRST read of a freshly dropped file triggers hydration
# and can surface as ETIMEDOUT ("[Errno 60] Operation timed out"). Nothing here caught that: the
# exception escaped run()/main(), so one cold placeholder aborted the entire routing pass with a
# traceback — and because iter_inbox_files yields sorted names, a file stuck dehydrated blocked
# every alphabetically later file behind it. Retry the pinned read instead.
_TRANSIENT_READ_ERRNOS = frozenset(
    getattr(errno, name) for name in
    ("ETIMEDOUT", "EIO", "EINTR", "EAGAIN", "EWOULDBLOCK", "EBUSY", "ENOENT", "ESTALE",
     "ENXIO", "EDEADLK", "ENOTCONN", "EHOSTDOWN")
    if hasattr(errno, name)
)
_STABLE_READ_ATTEMPTS = max(1, int(os.environ.get("INGEST_STABLE_READ_ATTEMPTS") or 4))
_STABLE_READ_BACKOFF_S = max(0.0, float(os.environ.get("INGEST_STABLE_READ_BACKOFF_S") or 0.15))


def _retry_transient(read_once):
    """Run a pinned read, retrying only a transient cloud-filesystem error."""
    for attempt in range(_STABLE_READ_ATTEMPTS):
        try:
            return read_once()
        except OSError as exc:
            if exc.errno not in _TRANSIENT_READ_ERRNOS or attempt + 1 >= _STABLE_READ_ATTEMPTS:
                raise
        if _STABLE_READ_BACKOFF_S:
            time.sleep(min(_STABLE_READ_BACKOFF_S * (2 ** attempt), 2.0))
    raise OSError(errno.EIO, "could not complete a stable read")  # unreachable


def _sha256_file_with_identity(path):
    def once():
        fd, identity = _open_unique_regular(path)
        try:
            return _sha256_open_fd(path, fd, identity), identity
        finally:
            os.close(fd)
    return _retry_transient(once)


def sha256_file(path):
    return _sha256_file_with_identity(path)[0]


def _read_unique_regular_bytes(path):
    def once():
        fd, identity = _open_unique_regular(path)
        try:
            remaining = identity[2]
            chunks = []
            while remaining:
                chunk = os.read(fd, min(remaining, 1 << 20))
                if not chunk:
                    raise ValueError("file truncated during read")
                chunks.append(chunk)
                remaining -= len(chunk)
            if os.read(fd, 1):
                raise ValueError("file grew during read")
            _verify_unique_regular(path, fd, identity)
            return b"".join(chunks)
        finally:
            os.close(fd)
    return _retry_transient(once)


def _recover_publication_alias(path, prefix):
    """Remove only same-directory publisher temp aliases left by a hard death."""
    observed = os.lstat(path)
    if observed.st_nlink == 1:
        return
    if (stat.S_ISLNK(observed.st_mode) or not stat.S_ISREG(observed.st_mode)
            or observed.st_nlink < 2):
        raise ValueError("published path is not a unique regular file")
    aliases = []
    with os.scandir(os.path.dirname(path) or ".") as entries:
        for entry in entries:
            if entry.name == os.path.basename(path) or not entry.name.startswith(prefix):
                continue
            try:
                info = entry.stat(follow_symlinks=False)
            except OSError:
                continue
            if (stat.S_ISREG(info.st_mode)
                    and (info.st_dev, info.st_ino) == (observed.st_dev, observed.st_ino)):
                aliases.append(entry.path)
    if len(aliases) != observed.st_nlink - 1:
        raise ValueError("published path has an unaccounted hardlink")
    for alias in aliases:
        os.unlink(alias)
    after = os.lstat(path)
    if ((after.st_dev, after.st_ino) != (observed.st_dev, observed.st_ino)
            or after.st_nlink != 1):
        raise ValueError("published path changed during alias recovery")


def _unlink_if_inode(path, identity):
    """Unlink only the exact named inode the caller created."""
    try:
        observed = os.lstat(path)
        if (observed.st_dev, observed.st_ino) != identity:
            raise ValueError("temporary publication name changed")
        os.unlink(path)
    except FileNotFoundError:
        return


def _publish_temp_no_clobber(tmp, dst):
    """Atomically claim an absent name without replacing concurrent evidence."""
    tmp_info = os.lstat(tmp)
    tmp_identity = (tmp_info.st_dev, tmp_info.st_ino)
    try:
        os.link(tmp, dst, follow_symlinks=False)
    except OSError as exc:
        unsupported = {
            errno.EXDEV, errno.EPERM, errno.EOPNOTSUPP,
            getattr(errno, "ENOTSUP", errno.EOPNOTSUPP),
        }
        if isinstance(exc, FileExistsError) or exc.errno not in unsupported:
            raise
    else:
        try:
            _unlink_if_inode(tmp, tmp_identity)
        except Exception:
            try:
                claimed = os.lstat(dst)
                if (claimed.st_dev, claimed.st_ino) == tmp_identity:
                    os.unlink(dst)
            except OSError:
                pass
            raise
        return

    # Google Drive File Stream and some FUSE mounts reject hard links. Claim
    # the final name with O_EXCL, then copy the already-fsynced staged bytes
    # into that exact inode. A live failure removes only our own inode; a hard
    # death may leave a prefix, which retry treats as an unprovenanced collision
    # and never overwrites.
    source_fd, source_identity = _open_unique_regular(tmp)
    target_fd = None
    claimed_identity = None
    try:
        target_fd = os.open(dst, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        claimed = os.fstat(target_fd)
        claimed_identity = (claimed.st_dev, claimed.st_ino)
        remaining = source_identity[2]
        while remaining:
            chunk = os.read(source_fd, min(remaining, 1 << 20))
            if not chunk:
                raise ValueError("staged file truncated during FUSE publication")
            view = memoryview(chunk)
            while view:
                written = os.write(target_fd, view)
                if written <= 0:
                    raise OSError("short write during FUSE publication")
                view = view[written:]
            remaining -= len(chunk)
        if os.read(source_fd, 1):
            raise ValueError("staged file grew during FUSE publication")
        _verify_unique_regular(tmp, source_fd, source_identity)
        os.fsync(target_fd)
        os.close(target_fd)
        target_fd = None
        _unlink_if_inode(tmp, (source_identity[0], source_identity[1]))
    except Exception:
        if target_fd is not None:
            os.close(target_fd)
        if claimed_identity is not None:
            try:
                observed = os.lstat(dst)
                if (observed.st_dev, observed.st_ino) == claimed_identity:
                    os.unlink(dst)
            except OSError:
                pass
        raise
    finally:
        os.close(source_fd)


def _safe_beneath(root, candidate):
    root = os.path.realpath(os.path.abspath(root))
    path = os.path.abspath(candidate)
    try:
        if os.path.commonpath([root, path]) != root:
            return None
    except ValueError:
        return None
    cursor = root
    rel = os.path.relpath(path, root)
    if rel == ".":
        return root
    for part in rel.split(os.sep):
        if part in {"", ".", ".."}:
            return None
        cursor = os.path.join(cursor, part)
        if not os.path.lexists(cursor):
            continue
        try:
            info = os.lstat(cursor)
        except OSError:
            return None
        if stat.S_ISLNK(info.st_mode):
            return None
    return path


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
            candidate = os.path.join(pool, n)
            try:
                info = os.lstat(candidate)
            except OSError:
                continue
            if (TICKER_SHAPE.match(n) and stat.S_ISDIR(info.st_mode)
                    and not stat.S_ISLNK(info.st_mode) and _safe_beneath(pool, candidate)):
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


def copy_contents(src, dst, root=None, expected_sha256=None):
    """Copy stable bytes and atomically claim ``dst`` without overwriting it."""
    dst_dir = os.path.dirname(dst) or "."
    destination_root = os.path.realpath(os.path.abspath(root or dst_dir))
    if _safe_beneath(destination_root, dst) is None:
        raise ValueError("destination contains a symlinked or escaping component")
    os.makedirs(dst_dir, exist_ok=True)
    if _safe_beneath(destination_root, dst_dir) is None:
        raise ValueError("destination parent contains a symlinked or escaping component")
    destination_pin = _pin_directory(dst_dir)
    if destination_pin is None:
        raise ValueError("destination parent is unsafe")
    source_fd = None
    source_identity = None
    tmp = None
    tmp_identity = None
    claimed = None
    digest = hashlib.sha256()
    try:
        source_fd, source_identity = _open_unique_regular(src)
        _assert_directory_pin(dst_dir, destination_pin)
        temp_fd, tmp = tempfile.mkstemp(dir=dst_dir, prefix=".tmp-route-")
        temp_info = os.fstat(temp_fd)
        tmp_identity = (temp_info.st_dev, temp_info.st_ino)
        _assert_directory_pin(dst_dir, destination_pin)
        with os.fdopen(source_fd, "rb", closefd=False) as fi, os.fdopen(temp_fd, "wb") as fo:
            remaining = source_identity[2]
            while remaining:
                chunk = fi.read(min(remaining, 1 << 20))
                if not chunk:
                    raise ValueError("source truncated during copy")
                fo.write(chunk)
                digest.update(chunk)
                remaining -= len(chunk)
            if fi.read(1):
                raise ValueError("source grew during copy")
            _verify_unique_regular(src, source_fd, source_identity)
            actual_sha256 = digest.hexdigest()
            if expected_sha256 is not None and actual_sha256 != expected_sha256:
                raise ValueError("source content changed after provenance hashing")
            fo.flush(); os.fsync(fo.fileno())
        _assert_directory_pin(dst_dir, destination_pin)
        staged = os.lstat(tmp)
        _publish_temp_no_clobber(tmp, dst)
        _assert_directory_pin(dst_dir, destination_pin)
        claimed = (staged.st_dev, staged.st_ino)
        if sha256_file(dst) != actual_sha256:
            raise ValueError("published copy does not match staged source bytes")
        return actual_sha256, source_identity
    except Exception:
        if claimed is not None:
            try:
                current = os.lstat(dst)
                if (current.st_dev, current.st_ino) == claimed:
                    os.unlink(dst)
            except OSError:
                pass
        raise
    finally:
        if source_fd is not None:
            os.close(source_fd)
        os.close(destination_pin[0])
        if tmp is not None:
            try:
                if tmp_identity is not None:
                    _unlink_if_inode(tmp, tmp_identity)
            except OSError:
                pass


def _same_source_after_rename(info, identity):
    """Same inode, same bytes, after the rename into the private hold.

    This used to index around position 4 by hand because st_ctime_ns sat in the identity tuple and
    a rename necessarily bumps ctime. `_file_identity` no longer carries ctime (a metadata-only
    touch is not a content change — see its docstring), so the comparison is simply the shared one.
    """
    return (
        stat.S_ISREG(info.st_mode)
        and not stat.S_ISLNK(info.st_mode)
        and info.st_nlink == 1
        and _file_identity(info) == identity
    )


def _consume_source(src, source_identity, expected_sha256):
    """Move the exact copied inode into a private hold before deleting it.

    If the pathname was swapped after copying, the replacement is quarantined in
    the hidden hold directory instead of being unlinked as though it were the
    routed source.
    """
    parent = os.path.dirname(src) or "."
    hold_dir = tempfile.mkdtemp(dir=parent, prefix=".route-consume-")
    hold = os.path.join(hold_dir, os.path.basename(src))
    moved = False
    held_fd = None
    try:
        os.rename(src, hold)
        moved = True
        held_fd, held_identity = _open_unique_regular(hold)
        held = os.fstat(held_fd)
        if (not _same_source_after_rename(held, source_identity)
                or _sha256_open_fd(hold, held_fd, held_identity) != expected_sha256):
            raise ValueError(f"source changed before archival; replacement quarantined at {hold}")
        # Keep the verified inode open through deletion. The private 0700 hold
        # directory removes the original shared pathname from the race; the
        # final lstat/fstat comparison immediately before unlink binds the name
        # being removed to the descriptor whose bytes were hashed.
        _verify_unique_regular(hold, held_fd, held_identity)
        os.unlink(hold)
        after_unlink = os.fstat(held_fd)
        if after_unlink.st_nlink != 0:
            raise ValueError("verified source has an unexpected link after deletion")
        os.close(held_fd)
        held_fd = None
        moved = False
        os.rmdir(hold_dir)
    except Exception as exc:
        if held_fd is not None:
            os.close(held_fd)
        if moved and os.path.lexists(hold):
            raise ValueError(f"source changed during consumption; object quarantined at {hold}") from exc
        if moved:
            moved = False
        if not moved:
            try:
                os.rmdir(hold_dir)
            except OSError:
                pass
        raise


def _next_suffixed(path, index):
    base, ext = os.path.splitext(path)
    return f"{base} ({index}){ext}"


def move_to_routed(src, inbox, expected_sha256=None):
    rel = os.path.relpath(src, inbox)
    first_dst = os.path.join(inbox, ROUTED_DIR, rel)
    if _safe_beneath(inbox, src) is None or _safe_beneath(inbox, first_dst) is None:
        raise ValueError("inbox archive path contains a symlinked or escaping component")
    os.makedirs(os.path.dirname(first_dst), exist_ok=True)
    if expected_sha256 is None:
        expected_sha256 = sha256_file(src)
    index = 1
    while True:
        dst = first_dst if index == 1 else _next_suffixed(first_dst, index)
        if os.path.lexists(dst):
            try:
                _recover_publication_alias(dst, ".tmp-route-")
                if sha256_file(dst) == expected_sha256:
                    _digest, source_identity = _sha256_file_with_identity(src)
                    if _digest != expected_sha256:
                        raise ValueError("source content changed before archival")
                    break
            except (OSError, ValueError):
                pass
            index += 1
            continue
        try:
            _digest, source_identity = copy_contents(
                src, dst, inbox, expected_sha256=expected_sha256,
            )
            break
        except FileExistsError:
            continue
    if sha256_file(dst) != expected_sha256:
        raise ValueError("archived copy does not match provenance hash")
    _consume_source(src, source_identity, expected_sha256)


def _write_json_safe(path, value, root):
    if _safe_beneath(root, path) is None:
        raise ValueError("sidecar path contains a symlinked or escaping component")
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)
    if _safe_beneath(root, directory) is None:
        raise ValueError("sidecar parent contains a symlinked or escaping component")
    directory_pin = _pin_directory(directory)
    if directory_pin is None:
        raise ValueError("sidecar parent is unsafe")
    encoded = json.dumps(value, indent=2).encode("utf-8")
    tmp = None
    tmp_identity = None
    try:
        _assert_directory_pin(directory, directory_pin)
        if os.path.lexists(path):
            _recover_publication_alias(path, ".tmp-sidecar-")
            if _read_unique_regular_bytes(path) == encoded:
                return False
            raise FileExistsError("different sidecar already exists")
        fd, tmp = tempfile.mkstemp(dir=directory, prefix=".tmp-sidecar-")
        opened_tmp = os.fstat(fd)
        tmp_identity = (opened_tmp.st_dev, opened_tmp.st_ino)
        _assert_directory_pin(directory, directory_pin)
        with os.fdopen(fd, "wb") as fh:
            fh.write(encoded)
            fh.flush(); os.fsync(fh.fileno())
        _assert_directory_pin(directory, directory_pin)
        try:
            _publish_temp_no_clobber(tmp, path)
        except FileExistsError:
            _recover_publication_alias(path, ".tmp-sidecar-")
            if _read_unique_regular_bytes(path) != encoded:
                raise FileExistsError("different sidecar won the publication race")
            return False
        _assert_directory_pin(directory, directory_pin)
        if _read_unique_regular_bytes(path) != encoded:
            raise ValueError("published sidecar does not match staged bytes")
        return True
    finally:
        os.close(directory_pin[0])
        try:
            if tmp is not None and tmp_identity is not None:
                _unlink_if_inode(tmp, tmp_identity)
        except OSError:
            pass


def _append_json_line_safe(path, value, root):
    if _safe_beneath(root, path) is None:
        raise ValueError("ledger path contains a symlinked or escaping component")
    directory = os.path.dirname(path) or "."
    pinned = _pin_directory(directory)
    if pinned is None:
        raise ValueError("ledger parent is unsafe")
    fd = None
    try:
        _assert_directory_pin(directory, pinned)
        fd = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT
                     | getattr(os, "O_NOFOLLOW", 0), 0o600)
        opened = os.fstat(fd)
        named = os.lstat(path)
        if (not stat.S_ISREG(opened.st_mode) or stat.S_ISLNK(named.st_mode)
                or opened.st_uid != os.getuid() or opened.st_nlink != 1
                or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
            raise ValueError("ledger is not a unique owned regular file")
        encoded = (json.dumps(value) + "\n").encode("utf-8")
        view = memoryview(encoded)
        while view:
            written = os.write(fd, view)
            if written <= 0:
                raise OSError("short ledger write")
            view = view[written:]
        os.fsync(fd)
        after = os.fstat(fd); named_after = os.lstat(path)
        if ((after.st_dev, after.st_ino) != (opened.st_dev, opened.st_ino)
                or (named_after.st_dev, named_after.st_ino) != (opened.st_dev, opened.st_ino)):
            raise ValueError("ledger changed during append")
        _assert_directory_pin(directory, pinned)
    finally:
        if fd is not None:
            os.close(fd)
        os.close(pinned[0])


def _sidecar_binds_payload(path, digest, ticker):
    try:
        _recover_publication_alias(path, ".tmp-sidecar-")
        value = json.loads(_read_unique_regular_bytes(path).decode("utf-8"))
    except (OSError, ValueError, UnicodeError, json.JSONDecodeError):
        return False
    return (
        isinstance(value, dict)
        and value.get("sha256") == digest
        and value.get("routed_by") == "ingest_external.py"
        and ticker in value.get("tickers", [])
    )


def _ensure_routed_sidecar(dst, sidecar, ticker, root):
    sidecar_path = dst + ".source.json"
    if os.path.lexists(sidecar_path):
        return _sidecar_binds_payload(sidecar_path, sidecar["sha256"], ticker)
    try:
        _write_json_safe(sidecar_path, sidecar, root)
    except FileExistsError:
        pass
    return _sidecar_binds_payload(sidecar_path, sidecar["sha256"], ticker)


def _existing_route_is_complete(dst, sidecar, ticker, root):
    try:
        _recover_publication_alias(dst, ".tmp-route-")
        if sha256_file(dst) != sidecar["sha256"]:
            return False
    except (OSError, ValueError):
        return False
    return _ensure_routed_sidecar(dst, sidecar, ticker, root)


# ---------- signed, decision-scoped manual requests ----------

_MANUAL_INTENT_KEYS = {
    "contract_version", "request_id", "subject", "swarm", "run_root",
    "decision_fingerprint", "need_id", "series", "provider", "source_url",
    "source_url_basis", "filename", "payload_sha256", "payload_size", "staged_at", "requested_by",
    "signature",
}
_MANUAL_RESULT_KEYS = {
    "contract_version", "request_id", "intent_sha256", "payload_sha256", "sidecar_sha256",
    "status", "routed_path", "reason", "completed_at", "signature",
}
_MANUAL_ALLOWED_EXTS = {
    "pdf", "xlsx", "xls", "csv", "doc", "docx", "ppt", "pptx", "txt", "md",
    "json", "png", "jpg", "jpeg",
}


def _canonical_json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _signed_value(value, key):
    unsigned = dict(value)
    unsigned.pop("signature", None)
    digest = hmac.new(key, _canonical_json(unsigned).encode("utf-8"), hashlib.sha256).hexdigest()
    return {**unsigned, "signature": f"hmac-sha256:{digest}"}


def _signature_valid(value, key):
    if not isinstance(value, dict) or not MANUAL_SIGNATURE.fullmatch(str(value.get("signature", ""))):
        return False
    expected = _signed_value(value, key)["signature"]
    return hmac.compare_digest(expected, value["signature"])


def _plain(value, maximum):
    return (isinstance(value, str) and 0 < len(value) <= maximum
            and not re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", value))


def _iso_timestamp(value):
    if not isinstance(value, str) or not re.fullmatch(
            r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z", value):
        return False
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z") == value
    except ValueError:
        return False


def _safe_source_url(value):
    if value is None:
        return True
    if not _plain(value, 2048) or re.search(r"[\x00-\x20\x7f]", value):
        return False
    try:
        parsed = urlsplit(value)
        return (parsed.scheme in ("http", "https") and bool(parsed.hostname)
                and parsed.username is None and parsed.password is None)
    except ValueError:
        return False


def _safe_original_filename(value):
    if not _plain(value, 180) or value.startswith(".") or os.path.basename(value) != value \
            or "/" in value or "\\" in value or "." not in value:
        return False
    return (value.rsplit(".", 1)[-1].lower() in _MANUAL_ALLOWED_EXTS
            and len(value.encode("utf-8")) <= MANUAL_FILENAME_MAX_BYTES
            and len((value + MANUAL_SIDECAR_SUFFIX).encode("utf-8")) <= MANUAL_NAME_MAX_BYTES)


def _owned_private_directory(path):
    """Pin an existing current-UID owner-only directory with no symlink in its chain."""
    requested = os.path.abspath(path)
    path = os.path.realpath(requested)
    try:
        requested_cursor = os.path.sep
        for part in requested[len(os.path.sep):].split(os.sep):
            if not part:
                continue
            requested_cursor = os.path.join(requested_cursor, part)
            info = os.lstat(requested_cursor)
            if stat.S_ISLNK(info.st_mode) and info.st_uid != 0:
                return None
        # The directory itself is the trust boundary. Ancestors such as /tmp legitimately have shared
        # modes; reject only symlinks in that chain, not their unrelated permissions/ownership.
        cursor = os.path.sep
        for part in path[len(os.path.sep):].split(os.sep):
            if not part:
                continue
            cursor = os.path.join(cursor, part)
            info = os.lstat(cursor)
            if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
                return None
        requested_info = os.lstat(requested)
        before = os.lstat(path)
        if (before.st_uid != os.getuid() or before.st_mode & 0o077
                or not stat.S_ISDIR(before.st_mode) or stat.S_ISLNK(requested_info.st_mode)
                or (requested_info.st_dev, requested_info.st_ino) != (before.st_dev, before.st_ino)):
            return None
        fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0)
                     | getattr(os, "O_NOFOLLOW", 0))
        opened = os.fstat(fd)
        named = os.lstat(path)
        if (opened.st_uid != os.getuid() or opened.st_mode & 0o077
                or not stat.S_ISDIR(opened.st_mode)
                or (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)
                or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
            os.close(fd)
            return None
        return fd, (opened.st_dev, opened.st_ino)
    except OSError:
        return None


def _directory_pin_valid(path, fd, identity, private=False):
    try:
        opened = os.fstat(fd)
        named = os.lstat(path)
        return (stat.S_ISDIR(opened.st_mode) and not stat.S_ISLNK(named.st_mode)
                and opened.st_uid == os.getuid()
                and (not private or not opened.st_mode & 0o077)
                and (opened.st_dev, opened.st_ino) == identity
                and (named.st_dev, named.st_ino) == identity)
    except OSError:
        return False


def _pin_directory(path, *, private=False):
    """Pin a current-UID directory. Caller retains the descriptor across mutations."""
    path = os.path.abspath(path)
    try:
        before = os.lstat(path)
        if (not stat.S_ISDIR(before.st_mode) or stat.S_ISLNK(before.st_mode)
                or before.st_uid != os.getuid() or (private and before.st_mode & 0o077)):
            return None
        fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0)
                     | getattr(os, "O_NOFOLLOW", 0))
        opened = os.fstat(fd)
        if ((opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)
                or not _directory_pin_valid(path, fd, (opened.st_dev, opened.st_ino), private)):
            os.close(fd)
            return None
        return fd, (opened.st_dev, opened.st_ino)
    except OSError:
        return None


def _assert_directory_pin(path, pinned, *, private=False):
    if pinned is None or not _directory_pin_valid(path, pinned[0], pinned[1], private):
        raise ValueError("directory changed during manual routing")


def _ensure_owned_directory_chain(root, parts, *, private_leaf=False):
    """Create fixed components while revalidating each retained parent descriptor."""
    cursor = os.path.realpath(os.path.abspath(root))
    pinned = _pin_directory(cursor)
    if pinned is None:
        raise ValueError("directory root is unsafe")
    try:
        for index, part in enumerate(parts):
            if (not part or part in (".", "..") or os.sep in part
                    or (os.altsep and os.altsep in part)):
                raise ValueError("unsafe directory component")
            _assert_directory_pin(cursor, pinned)
            child = os.path.join(cursor, part)
            try:
                os.mkdir(child, 0o700)
            except FileExistsError:
                pass
            _assert_directory_pin(cursor, pinned)
            child_pin = _pin_directory(
                child, private=private_leaf and index == len(parts) - 1,
            )
            if child_pin is None:
                raise ValueError("directory component is unsafe")
            os.close(pinned[0]); pinned = child_pin; cursor = child
        return cursor
    finally:
        os.close(pinned[0])


def _manual_key(path):
    if not path:
        return None
    parent = os.path.dirname(os.path.abspath(path))
    pinned = _owned_private_directory(parent)
    if pinned is None:
        return None
    parent_fd, identity = pinned
    try:
        before = os.lstat(path)
        if (not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode)
                or before.st_uid != os.getuid() or before.st_nlink != 1
                or before.st_mode & 0o077 or not before.st_mode & stat.S_IRUSR):
            return None
        raw = _read_unique_regular_bytes(path)
        after = os.lstat(path)
        if ((after.st_dev, after.st_ino) != (before.st_dev, before.st_ino)
                or not _directory_pin_valid(parent, parent_fd, identity, private=True)):
            return None
        text = raw.decode("ascii")
    except (OSError, ValueError, UnicodeError):
        return None
    finally:
        os.close(parent_fd)
    return bytes.fromhex(text[:64]) if re.fullmatch(r"[a-f0-9]{64}\n", text) else None


def _default_manual_key_path():
    repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    state = os.environ.get("ENGINE_STATE_DIR") or os.path.join(repo, "ui", "server", ".state")
    return os.path.join(state, "data-need-upload.key")


def _default_manual_authority(intent):
    """Ask the canonical TypeScript readers whether this SIGNED binding may still publish.

    This is deliberately a new short-lived process. The always-on server may have admitted and staged
    the request minutes earlier; consulting its old in-memory answer would not close the owner/decision
    race. Missing Node dependencies, an unreadable owner, multiple finished owners, or a changed standing
    decision all abstain. The caller leaves the envelope staged for a later pass; none is evidence that
    the payload itself is bad.
    """
    repo = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    runner = os.path.join(repo, "ui", "server", "node_modules", ".bin", "tsx")
    checker = os.path.join(repo, "ui", "server", "src", "manual-upload-authority.ts")
    if not os.path.isfile(runner) or not os.path.isfile(checker):
        return False, "terminal owner authority checker is unavailable"
    env = dict(os.environ)
    env["ENGINE_REPO_ROOT"] = repo
    try:
        result = subprocess.run(
            [runner, checker, intent["subject"], intent["swarm"], intent["run_root"],
             intent["decision_fingerprint"]],
            cwd=repo, env=env, capture_output=True, text=True, timeout=20, check=False,
        )
        parsed = json.loads((result.stdout or "").strip())
        if result.returncode == 0 and parsed.get("authorized") is True:
            return True, None
        reason = parsed.get("reason") if isinstance(parsed, dict) else None
        return False, str(reason or "terminal shared data-pool authority was denied")[:400]
    except (OSError, subprocess.SubprocessError, ValueError, json.JSONDecodeError):
        return False, "terminal shared data-pool authority check failed closed"


def _manual_authority(authority, intent):
    try:
        result = authority(intent)
        if isinstance(result, tuple) and len(result) == 2:
            return bool(result[0]), str(result[1] or "")[:400]
        return bool(result), "terminal shared data-pool authority was denied"
    except Exception:
        return False, "terminal shared data-pool authority check failed closed"


def _valid_manual_intent(value, key, request_id):
    if not isinstance(value, dict) or set(value) != _MANUAL_INTENT_KEYS \
            or value.get("contract_version") != MANUAL_INTENT_CONTRACT \
            or value.get("request_id") != request_id or not MANUAL_REQUEST_ID.fullmatch(request_id):
        return False
    subject = value.get("subject")
    run_root = value.get("run_root")
    return (
        isinstance(subject, str) and MANUAL_SUBJECT_SHAPE.fullmatch(subject)
        and subject.lower() not in RESERVED
        and isinstance(value.get("swarm"), str) and MANUAL_SWARM_ID.fullmatch(value["swarm"])
        and _plain(run_root, 300) and not os.path.isabs(run_root)
        and ".." not in re.split(r"[\\/]", run_root)
        and isinstance(value.get("decision_fingerprint"), str)
        and MANUAL_FINGERPRINT.fullmatch(value["decision_fingerprint"])
        and isinstance(value.get("need_id"), str) and MANUAL_NEED_ID.fullmatch(value["need_id"])
        and _plain(value.get("series"), 1000)
        and _plain(value.get("provider"), 200)
        and _safe_source_url(value.get("source_url"))
        and value.get("source_url_basis") in (
            "server_lookup_public_dns", "user_supplied_unverified", "absent")
        and ((value.get("source_url") is None) == (value.get("source_url_basis") == "absent"))
        and _safe_original_filename(value.get("filename"))
        and isinstance(value.get("payload_sha256"), str)
        and MANUAL_SHA256.fullmatch(value["payload_sha256"])
        and isinstance(value.get("payload_size"), int) and not isinstance(value["payload_size"], bool)
        and 0 < value["payload_size"] <= MANUAL_MAX_BYTES
        and _iso_timestamp(value.get("staged_at"))
        and _plain(value.get("requested_by"), 320)
        and _signature_valid(value, key)
    )


def _read_manual_intent(envelope, key):
    intent_path = os.path.join(envelope, MANUAL_INTENT_NAME)
    try:
        raw = _read_unique_regular_bytes(intent_path)
        if len(raw) > 32 * 1024:
            return None
        value = json.loads(raw.decode("utf-8"))
    except (OSError, ValueError, UnicodeError, json.JSONDecodeError):
        return None
    request_id = os.path.basename(envelope)
    if not _valid_manual_intent(value, key, request_id):
        return None
    return value, raw, hashlib.sha256(raw).hexdigest()


def _valid_manual_result(value, key, intent, intent_sha):
    if not isinstance(value, dict) or set(value) != _MANUAL_RESULT_KEYS \
            or value.get("contract_version") != MANUAL_RESULT_CONTRACT \
            or value.get("request_id") != intent["request_id"] \
            or value.get("intent_sha256") != intent_sha \
            or value.get("payload_sha256") != intent["payload_sha256"] \
            or value.get("status") not in (
                "routed_provenance_verified", "rejected_policy", "failed_tampered") \
            or not _iso_timestamp(value.get("completed_at")) or not _signature_valid(value, key):
        return False
    if value["status"] == "routed_provenance_verified":
        routed = value.get("routed_path")
        return (isinstance(routed, str) and routed.startswith("data/") and "\\" not in routed
                and ".." not in routed.split("/")
                and isinstance(value.get("sidecar_sha256"), str)
                and MANUAL_SHA256.fullmatch(value["sidecar_sha256"])
                and value.get("reason") is None)
    terminal = (value.get("routed_path") is None
                and value.get("sidecar_sha256") is None
                and value.get("reason") in (
                    "malformed_request", "tampered_request", "routing_failed", "policy_rejected"))
    return (terminal and ((value["status"] == "rejected_policy")
                          == (value.get("reason") == "policy_rejected")))


def _read_manual_result(envelope, key, intent, intent_sha):
    try:
        raw = _read_unique_regular_bytes(os.path.join(envelope, MANUAL_RESULT_NAME))
        if len(raw) > 16 * 1024:
            return None
        value = json.loads(raw.decode("utf-8"))
    except (OSError, ValueError, UnicodeError, json.JSONDecodeError):
        return None
    return value if _valid_manual_result(value, key, intent, intent_sha) else None


def _manual_result(intent, intent_sha, key, status, routed_path=None, sidecar_sha256=None, reason=None):
    value = {
        "contract_version": MANUAL_RESULT_CONTRACT,
        "request_id": intent["request_id"],
        "intent_sha256": intent_sha,
        "payload_sha256": intent["payload_sha256"],
        "sidecar_sha256": sidecar_sha256,
        "status": status,
        "routed_path": routed_path,
        "reason": reason,
        "completed_at": datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
    }
    return _signed_value(value, key)


def _manual_context(intent):
    # This is request context only. It is copied into provenance, never fed into source-type, tier,
    # licensing, or as-of inference.
    return {
        "contract_version": MANUAL_CONTEXT_CONTRACT,
        "request_id": intent["request_id"],
        "subject": intent["subject"],
        "swarm": intent["swarm"],
        "run_root": intent["run_root"],
        "decision_fingerprint": intent["decision_fingerprint"],
        "need_id": intent["need_id"],
        "series": intent["series"],
        "provider_basis": "operator_supplied_unverified",
        "source_url": intent["source_url"],
        "source_url_basis": intent["source_url_basis"],
        "staged_at": intent["staged_at"],
        "requested_by": intent["requested_by"],
    }


def _manual_sidecar_binds(path, sidecar, subject, intent, intent_sha):
    try:
        encoded = _read_unique_regular_bytes(path)
        value = json.loads(encoded.decode("utf-8"))
    except (OSError, ValueError, UnicodeError, json.JSONDecodeError):
        return False
    return (
        isinstance(value, dict) and value == sidecar
        and encoded == json.dumps(sidecar, indent=2).encode("utf-8")
        and value.get("sha256") == sidecar["sha256"]
        and value.get("tickers") == [subject]
        and value.get("provider") == intent["provider"]
        and value.get("upload_intent_sha256") == intent_sha
    )


def _existing_manual_route_complete(dst, sidecar, subject, intent, intent_sha, pool):
    try:
        _recover_publication_alias(dst, ".tmp-route-")
        return (sha256_file(dst) == sidecar["sha256"]
                and _manual_sidecar_binds(dst + ".source.json", sidecar, subject, intent, intent_sha))
    except (OSError, ValueError):
        return False


def _write_manual_failure(envelope, intent, intent_sha, key, reason):
    status = "rejected_policy" if reason == "policy_rejected" else "failed_tampered"
    result = _manual_result(intent, intent_sha, key, status, reason=reason)
    path = os.path.join(envelope, MANUAL_RESULT_NAME)
    try:
        _write_json_safe(path, result, envelope)
    except (FileExistsError, OSError, ValueError):
        return False
    return _read_manual_result(envelope, key, intent, intent_sha) is not None


def _consume_policy_rejected_payload(envelope, envelope_pin, intent):
    """Remove validated prohibited bytes only after their signed policy result is durable."""
    payload = os.path.join(envelope, MANUAL_PAYLOAD_NAME)
    _assert_directory_pin(envelope, envelope_pin, private=True)
    observed, identity = _sha256_file_with_identity(payload)
    if observed != intent["payload_sha256"]:
        raise ValueError("policy-rejected payload changed before cleanup")
    _consume_source(payload, identity, observed)
    _assert_directory_pin(envelope, envelope_pin, private=True)


def _archive_manual_request(envelope, inbox, intent, intent_raw, intent_sha, result):
    archive_lane = _ensure_owned_directory_chain(inbox, (ROUTED_DIR, MANUAL_REQUEST_DIR))
    lane_pin = _pin_directory(archive_lane)
    if lane_pin is None:
        raise ValueError("manual archive lane is unsafe")
    archive = os.path.join(archive_lane, intent["request_id"])
    try:
        _assert_directory_pin(archive_lane, lane_pin)
        try:
            os.mkdir(archive, 0o700)
        except FileExistsError:
            info = os.lstat(archive)
            if not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode):
                raise ValueError("manual archive request is not a safe directory")
        _assert_directory_pin(archive_lane, lane_pin)
        if _safe_beneath(inbox, archive) is None:
            raise ValueError("manual archive request contains a symlinked component")
    finally:
        os.close(lane_pin[0])

    archive_pin = _pin_directory(archive, private=True)
    envelope_pin = _pin_directory(envelope, private=True)
    if archive_pin is None or envelope_pin is None:
        for pinned in (archive_pin, envelope_pin):
            if pinned is not None:
                os.close(pinned[0])
        raise ValueError("manual archive/request directory is unsafe")

    try:
        pairs = (
            (os.path.join(envelope, MANUAL_PAYLOAD_NAME), os.path.join(archive, MANUAL_PAYLOAD_NAME),
             intent["payload_sha256"]),
            (os.path.join(envelope, MANUAL_INTENT_NAME), os.path.join(archive, MANUAL_INTENT_NAME), intent_sha),
        )
        for src, dst, digest in pairs:
            _assert_directory_pin(envelope, envelope_pin, private=True)
            _assert_directory_pin(archive, archive_pin, private=True)
            if os.path.lexists(dst):
                if sha256_file(dst) != digest:
                    raise ValueError("manual archive collision has different bytes")
            else:
                copy_contents(src, dst, inbox, expected_sha256=digest)
            _assert_directory_pin(envelope, envelope_pin, private=True)
            _assert_directory_pin(archive, archive_pin, private=True)
        if _read_unique_regular_bytes(os.path.join(archive, MANUAL_INTENT_NAME)) != intent_raw:
            raise ValueError("archived intent bytes changed")
        _assert_directory_pin(archive, archive_pin, private=True)
        _write_json_safe(os.path.join(archive, MANUAL_RESULT_NAME), result, inbox)
        _assert_directory_pin(archive, archive_pin, private=True)

        for src, _dst, digest in pairs:
            _assert_directory_pin(envelope, envelope_pin, private=True)
            if not os.path.lexists(src):
                continue
            observed, identity = _sha256_file_with_identity(src)
            if observed != digest:
                raise ValueError("manual request changed before archival cleanup")
            _consume_source(src, identity, digest)
            _assert_directory_pin(envelope, envelope_pin, private=True)
    finally:
        os.close(archive_pin[0]); os.close(envelope_pin[0])
    try:
        os.rmdir(envelope)
    except OSError:
        pass
    return archive


def _cleanup_replayed_manual_request(envelope, intent, archived, key, intent_sha, envelope_pin):
    archive_pin = _pin_directory(archived, private=True)
    if archive_pin is None:
        return False
    try:
        _assert_directory_pin(envelope, envelope_pin, private=True)
        _assert_directory_pin(archived, archive_pin, private=True)
        result = _read_manual_result(archived, key, intent, intent_sha)
        if result is None or result.get("status") != "routed_provenance_verified":
            return False
        expected = {
            MANUAL_PAYLOAD_NAME: intent["payload_sha256"],
            MANUAL_INTENT_NAME: intent_sha,
        }
        for name, digest in expected.items():
            _assert_directory_pin(envelope, envelope_pin, private=True)
            _assert_directory_pin(archived, archive_pin, private=True)
            src = os.path.join(envelope, name)
            if not os.path.lexists(src):
                continue
            observed, identity = _sha256_file_with_identity(src)
            if observed != digest:
                return False
            _consume_source(src, identity, digest)
        _assert_directory_pin(envelope, envelope_pin, private=True)
    finally:
        os.close(archive_pin[0])
    try:
        os.rmdir(envelope)
    except OSError:
        pass
    return True


def _process_manual_request(
        envelope, inbox, pool, ep, key, ledger_path, dry_run=False, manual_authority=None):
    envelope_pin = _pin_directory(envelope, private=True)
    if envelope_pin is None:
        return ("ignored", os.path.basename(envelope), "unsafe request envelope")
    try:
        _assert_directory_pin(envelope, envelope_pin, private=True)
        parsed = _read_manual_intent(envelope, key)
        _assert_directory_pin(envelope, envelope_pin, private=True)
        if parsed is None:
            return ("ignored", os.path.basename(envelope), "malformed or forged intent")
        intent, intent_raw, intent_sha = parsed
        return _process_manual_request_pinned(
            envelope, inbox, pool, ep, key, ledger_path,
            intent, intent_raw, intent_sha, envelope_pin, dry_run=dry_run,
            manual_authority=manual_authority,
        )
    finally:
        os.close(envelope_pin[0])


def _process_manual_request_pinned(
        envelope, inbox, pool, ep, key, ledger_path,
        intent, intent_raw, intent_sha, envelope_pin, dry_run=False, manual_authority=None):
    _assert_directory_pin(envelope, envelope_pin, private=True)
    existing_result = _read_manual_result(envelope, key, intent, intent_sha)
    if existing_result is not None:
        if existing_result.get("status") in ("failed_tampered", "rejected_policy"):
            return ("failed", intent["request_id"], existing_result.get("reason") or "terminal request failure")
        return ("ignored", intent["request_id"], "unexpected active success result")
    archive = os.path.join(inbox, ROUTED_DIR, MANUAL_REQUEST_DIR, intent["request_id"])
    if os.path.lexists(archive):
        archive_info = os.lstat(archive)
        if (stat.S_ISDIR(archive_info.st_mode) and not stat.S_ISLNK(archive_info.st_mode)
                and _safe_beneath(inbox, archive) is not None
                and _cleanup_replayed_manual_request(
                    envelope, intent, archive, key, intent_sha, envelope_pin)):
            return ("skipped", intent["request_id"], "replay of an already-routed request")

    try:
        names = sorted(os.listdir(envelope))
    except OSError:
        return ("ignored", intent["request_id"], "unreadable request envelope")
    if names != [MANUAL_INTENT_NAME, MANUAL_PAYLOAD_NAME]:
        if not dry_run:
            _write_manual_failure(envelope, intent, intent_sha, key, "tampered_request")
        return ("failed", intent["request_id"], "unexpected or multiple files")
    payload = os.path.join(envelope, MANUAL_PAYLOAD_NAME)
    try:
        info = os.lstat(payload)
        digest = sha256_file(payload)
    except (OSError, ValueError):
        if not dry_run:
            _write_manual_failure(envelope, intent, intent_sha, key, "tampered_request")
        return ("failed", intent["request_id"], "payload is not a unique regular file")
    if (not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode) or info.st_nlink != 1
            or info.st_size != intent["payload_size"] or digest != intent["payload_sha256"]):
        if not dry_run:
            _write_manual_failure(envelope, intent, intent_sha, key, "tampered_request")
        return ("failed", intent["request_id"], "payload hash or size mismatch")

    # All extraction/inference/publication consumes one private immutable snapshot. Revalidate the signed
    # active inode before and after extraction so a rename/mutation (including a WILTW swap) fails closed.
    snapshot_dir = os.path.realpath(tempfile.mkdtemp(prefix="nostra-manual-route-"))
    os.chmod(snapshot_dir, 0o700)
    snapshot = os.path.join(snapshot_dir, intent["filename"])
    try:
        copy_contents(payload, snapshot, snapshot_dir, expected_sha256=digest)
        _assert_directory_pin(envelope, envelope_pin, private=True)
        if sha256_file(payload) != digest:
            raise ValueError("manual request changed before extraction")
        sniff, fmt, read_error = _complete_identity_text(ep, snapshot)
        if sha256_file(snapshot) != digest:
            raise ValueError("manual payload snapshot changed during extraction")
        _assert_directory_pin(envelope, envelope_pin, private=True)
        if sha256_file(payload) != digest:
            raise ValueError("manual request changed during extraction")
        return _route_manual_snapshot(
            envelope, inbox, pool, ep, key, ledger_path, intent, intent_raw, intent_sha,
            envelope_pin, snapshot, digest, sniff, fmt, read_error, dry_run=dry_run,
            manual_authority=manual_authority,
        )
    finally:
        try:
            os.unlink(snapshot)
        except OSError:
            pass
        try:
            os.rmdir(snapshot_dir)
        except OSError:
            pass


def _route_manual_snapshot(
        envelope, inbox, pool, ep, key, ledger_path, intent, intent_raw, intent_sha,
        envelope_pin, snapshot, digest, sniff, fmt, read_error, dry_run=False,
        manual_authority=None):
    authority = manual_authority or _default_manual_authority
    if not dry_run:
        authorized, authority_reason = _manual_authority(authority, intent)
        if not authorized:
            return ("waiting", intent["request_id"], authority_reason)
    base = intent["filename"]
    methodology_reason = ep.methodology_only_source_reason(
        base, sniff, {"origin": base, "routed_from": f"{INBOX_NAME}/{MANUAL_REQUEST_DIR}/{intent['request_id']}"},
    )
    if methodology_reason:
        if not dry_run:
            authorized, authority_reason = _manual_authority(authority, intent)
            if not authorized:
                return ("waiting", intent["request_id"], authority_reason)
            if _write_manual_failure(envelope, intent, intent_sha, key, "policy_rejected"):
                _consume_policy_rejected_payload(envelope, envelope_pin, intent)
        return ("failed", intent["request_id"], "methodology-only source rejected")
    if fmt in ("pdf", "image") and not sniff.strip() and intent["subject"] == "GOLD":
        if not dry_run:
            authorized, authority_reason = _manual_authority(authority, intent)
            if not authorized:
                return ("waiting", intent["request_id"], authority_reason)
            if _write_manual_failure(envelope, intent, intent_sha, key, "policy_rejected"):
                _consume_policy_rejected_payload(envelope, envelope_pin, intent)
        return ("failed", intent["request_id"], read_error or "unreadable GOLD-sensitive visual")

    subject = intent["subject"]
    provider = intent["provider"]
    # Request metadata (including provider, source URL, filename, and decision prose) is never allowed to
    # upgrade evidence quality. Only readable payload CONTENT informs these four fields.
    stype = infer_source_type("", sniff)
    as_of, published = _parse_dates("", sniff)
    sidecar = {
        "provider": provider,
        "source_type": stype,
        "tier": TIER.get(stype, 9),
        "as_of": as_of,
        "published": published,
        "received": date.today().isoformat(),
        "tickers": [subject],
        "license": infer_license(sniff),
        "origin": base,
        "sha256": digest,
        "routed_by": "ingest_external.py",
        "routed_from": f"{INBOX_NAME}/{MANUAL_REQUEST_DIR}/{intent['request_id']}/{MANUAL_PAYLOAD_NAME}",
        "upload_intent_sha256": intent_sha,
        "request_context": _manual_context(intent),
    }
    if dry_run:
        return ("routed", intent["request_id"], f"would route to {subject}")

    subject_dir = _ensure_owned_directory_chain(pool, (subject,))
    destination_dir = _ensure_owned_directory_chain(subject_dir, ("external", slug(provider)))
    first_dst = os.path.join(destination_dir, base)
    if _safe_beneath(pool, first_dst) is None:
        raise RuntimeError("manual routed destination contains a symlinked component")
    index = 1
    while True:
        # Terminal CAS: no destination sidecar/payload/result becomes visible on an owner or standing
        # decision answer that was true only when the HTTP request was staged. An ambiguous/mismatched
        # answer is transient here — keep the signed envelope intact so an operator can resolve it.
        authorized, authority_reason = _manual_authority(authority, intent)
        if not authorized:
            return ("waiting", intent["request_id"], authority_reason)
        dst = first_dst if index == 1 else _next_suffixed(first_dst, index)
        if len((os.path.basename(dst) + MANUAL_SIDECAR_SUFFIX).encode("utf-8")) > MANUAL_NAME_MAX_BYTES:
            raise ValueError("manual routed filename exceeds destination NAME_MAX")
        if os.path.lexists(dst):
            if _existing_manual_route_complete(dst, sidecar, subject, intent, intent_sha, pool):
                break
            index += 1
            continue
        sidecar_path = dst + ".source.json"
        if os.path.lexists(sidecar_path):
            if not _manual_sidecar_binds(sidecar_path, sidecar, subject, intent, intent_sha):
                index += 1
                continue
        else:
            try:
                _write_json_safe(sidecar_path, sidecar, pool)
            except FileExistsError:
                if not _manual_sidecar_binds(sidecar_path, sidecar, subject, intent, intent_sha):
                    index += 1
                    continue
        try:
            _assert_directory_pin(envelope, envelope_pin, private=True)
            if sha256_file(os.path.join(envelope, MANUAL_PAYLOAD_NAME)) != digest:
                raise ValueError("manual request changed before publication")
            copy_contents(snapshot, dst, pool, expected_sha256=digest)
        except FileExistsError:
            continue
        if not _manual_sidecar_binds(sidecar_path, sidecar, subject, intent, intent_sha):
            raise ValueError("manual payload has no exact provenance sidecar")
        break

    hints = [_rerun_hint(stype, subject)]
    _append_json_line_safe(
        ledger_path, {**sidecar, "ts": int(time.time()), "suggested_reruns": hints}, inbox,
    )
    routed_path = "data/" + os.path.relpath(dst, pool).replace(os.sep, "/")
    sidecar_digest = sha256_file(dst + ".source.json")
    result = _manual_result(
        intent, intent_sha, key, "routed_provenance_verified",
        routed_path=routed_path, sidecar_sha256=sidecar_digest,
    )
    _archive_manual_request(envelope, inbox, intent, intent_raw, intent_sha, result)
    return ("routed", intent["request_id"], routed_path)


def process_manual_requests(
        inbox, pool, ep, key_path, ledger_path, request_id=None, dry_run=False,
        manual_authority=None):
    lane = os.path.join(inbox, MANUAL_REQUEST_DIR)
    if not os.path.isdir(lane) or _safe_beneath(inbox, lane) is None:
        return []
    key = _manual_key(key_path)
    if key is None:
        return [("ignored", request_id or "manual requests", "trusted intent key unavailable")]
    if request_id is not None and not MANUAL_REQUEST_ID.fullmatch(request_id):
        return [("ignored", request_id, "bad request id")]
    names = [request_id] if request_id else sorted(os.listdir(lane))
    outcomes = []
    for name in names:
        if not MANUAL_REQUEST_ID.fullmatch(name):
            continue
        envelope = os.path.join(lane, name)
        try:
            info = os.lstat(envelope)
        except OSError:
            continue
        if (not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode)
                or _safe_beneath(inbox, envelope) is None):
            outcomes.append(("ignored", name, "unsafe request envelope"))
            continue
        try:
            outcomes.append(_process_manual_request(
                envelope, inbox, pool, ep, key, ledger_path, dry_run=dry_run,
                manual_authority=manual_authority,
            ))
        except Exception as exc:
            # An infrastructure/read/copy exception is not evidence that the signed request is bad.
            # Leave its exact payload+intent pair committed so the next HTTP nudge/timer pass can retry.
            outcomes.append(("retrying", name, f"temporary routing interruption ({type(exc).__name__})"))
    return outcomes


# ---------- singleton lock (LOCAL disk — O_EXCL on the FUSE mount is unreliable) ----------

def acquire_lock(lock_path=None):
    """Retained kernel singleton lease; never fail open or steal from a live process."""
    lock = lock_path or os.path.join(tempfile.gettempdir(), "nostra-external-ingest.lock")
    fd = None
    try:
        fd = os.open(lock, os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0), 0o600)
        opened = os.fstat(fd)
        named = os.lstat(lock)
        if (not stat.S_ISREG(opened.st_mode) or stat.S_ISLNK(named.st_mode)
                or opened.st_uid != os.getuid() or opened.st_nlink != 1
                or opened.st_mode & 0o077
                or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)):
            os.close(fd)
            return None
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        os.ftruncate(fd, 0)
        os.write(fd, (str(os.getpid()) + "\n").encode("ascii"))
        os.fsync(fd)
        return fd, lock, (opened.st_dev, opened.st_ino)
    except (OSError, ValueError):
        if fd is not None:
            try:
                os.close(fd)
            except OSError:
                pass
        return None


def release_lock(lease):
    if lease is None:
        return
    fd, _lock, _identity = lease
    # Keep the private lock inode persistent. Closing the retained descriptor atomically releases flock;
    # unlinking before close would briefly allow a second process to lock a newly-created pathname inode.
    try:
        os.close(fd)
    except OSError:
        pass


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
    inbox = os.path.realpath(os.path.abspath(inbox))
    for root, dirs, files in os.walk(inbox, topdown=True, followlinks=False):
        dirs[:] = [d for d in dirs if d != ROUTED_DIR and not d.startswith(".")
                   and _safe_beneath(inbox, os.path.join(root, d)) is not None]
        for n in sorted(files):
            if n in JUNK_NAMES or n.startswith(JUNK_PREFIXES) or n.lower().endswith(JUNK_SUFFIXES):
                continue
            if n.lower().rsplit(".", 1)[-1] in ("gdoc", "gsheet", "gslides"):
                continue  # Drive pointer stubs — no local content to route
            candidate = os.path.join(root, n)
            try:
                info = os.lstat(candidate)
            except OSError:
                continue
            if (not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode)
                    or _safe_beneath(inbox, candidate) is None):
                continue
            yield candidate


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


def _cached_visual_identity(ep, path):
    """Return an existing OCR/vision transcription without making a network call.

    The inbox router is deterministic and must never spend on an LLM.  A full
    extractor run may already have produced a Claude-vision transcription for
    this exact file identity, however, and the methodology boundary must honour
    that stronger reading just as it honours the offline tesseract cache.
    """
    tags = [f"claude:{ep._VISION_MODEL}", "tesseract"]
    for tag in tags:
        try:
            text = ep._cache_read(ep._visual_cache_path(path, tag))
        except Exception:
            text = None
        if isinstance(text, str) and text.strip():
            return text
    return ""


def _complete_identity_text(ep, path):
    """Read the complete supported representation before routing anything.

    Returns ``(text, format, error)``.  Unlike ``sniff_text`` this deliberately
    has no character/page-head bound.  PDFs and images also use any existing
    vision transcription and the extractor's offline OCR floor.  No pool file,
    sidecar, ledger row, or rerun hint is produced until this preflight returns.
    """
    fmt = ep.sniff_format(path)
    ext = os.path.basename(path).lower().rsplit(".", 1)[-1] if "." in os.path.basename(path) else ""
    try:
        if fmt in ("ole2", "zip"):
            wbext = "xls" if fmt == "ole2" else "xlsx"
            try:
                sheets = ep.read_workbook(path, wbext)
                text = "\n".join(
                    ep._tab_text(os.path.basename(path), name, index, len(sheets), rows, ncols)
                    for index, (name, _nrows, ncols, rows) in enumerate(sheets, 1)
                )
                return text, fmt, None
            except Exception as workbook_error:
                text, doc_error = ep._read_doc(path)
                return text or "", fmt, doc_error or f"workbook: {type(workbook_error).__name__}"
        if fmt == "pdf":
            cached = _cached_visual_identity(ep, path)
            if cached:
                return cached, fmt, None
            # The full read (max_pages=None) invokes the image-only OCR path.
            text, error, _note = ep._read_pdf(path)
            return text or "", fmt, error
        if fmt == "image" or ext in getattr(ep, "IMAGE_EXTS", set()):
            cached = _cached_visual_identity(ep, path)
            if cached:
                return cached, "image", None
            text, _note, error = ep._read_image_file(path)
            return text or "", "image", error
        if fmt == "mime":
            text, error = ep._read_mhtml(path)
            return text or "", fmt, error
        if fmt == "rtf":
            text, error = ep._read_rtf(path)
            return text or "", fmt, error
        if fmt == "html":
            text, error = ep._read_html(path)
            return text or "", fmt, error
        if fmt == "text":
            with open(path, encoding="utf-8", errors="ignore") as fh:
                return fh.read(), fmt, None
        if fmt in ("empty", "unreadable"):
            return "", fmt, fmt
        text, error = ep._read_doc(path)
        return text or "", fmt, error
    except Exception as exc:  # a bad document is reported, never allowed to bypass the gate
        return "", fmt, f"{type(exc).__name__}: {exc}"


def _gold_sensitive_visual(base, forced, tickers, aliases):
    """Whether an unreadable visual could otherwise enter GOLD runtime evidence."""
    if forced == "GOLD":
        return True
    return any(ticker == "GOLD" for ticker, _score in match_tickers(base, "", tickers, aliases))


def run(
        pool="data", dry_run=False, extractor=None, manual_request=None, intent_key_path=None,
        manual_authority=None):
    ep = extractor or _load_extract_pool()
    pool = os.path.realpath(os.path.abspath(pool))
    inbox = os.path.join(pool, INBOX_NAME)
    if _safe_beneath(pool, inbox) is None:
        raise RuntimeError("external inbox contains a symlinked or escaping component")
    os.makedirs(os.path.join(inbox, ROUTED_DIR), exist_ok=True)
    if (_safe_beneath(pool, inbox) is None
            or _safe_beneath(inbox, os.path.join(inbox, ROUTED_DIR)) is None):
        raise RuntimeError("external inbox routing lane contains a symlinked component")
    readme = os.path.join(inbox, README_NAME)
    ledger_path = os.path.join(inbox, LEDGER_NAME)
    if _safe_beneath(inbox, readme) is None or _safe_beneath(inbox, ledger_path) is None:
        raise RuntimeError("external inbox control file contains a symlinked component")
    if not os.path.exists(readme) and not dry_run:
        open(readme, "w", encoding="utf-8").write(README_TEXT)

    manual = process_manual_requests(
        inbox, pool, ep, intent_key_path or _default_manual_key_path(), ledger_path,
        request_id=manual_request, dry_run=dry_run, manual_authority=manual_authority,
    )
    # The HTTP nudge names one committed envelope and must stay bounded. It uses this exact router and
    # singleton lock, but does not make a freshly-uploaded user wait behind every unrelated loose inbox
    # file. The ten-minute timer calls without --manual-request and continues through the ordinary lane.
    if manual_request is not None:
        tag = "[ingest_external]" + (" (dry-run)" if dry_run else "")
        for status, request, detail in manual:
            print(f"{tag} manual {status}: {request} — {detail}")
        return {"routed": [], "unrouted": [], "skipped": [], "manual": manual}

    seen = load_ledger(ledger_path)
    tickers = pool_tickers(pool)
    aliases = harvest_aliases(pool, tickers, ep)

    routed, skipped, unrouted = [], [], []
    for fp in iter_inbox_files(inbox):
        base = os.path.basename(fp)
        try:
            st = os.lstat(fp)
        except Exception:
            continue
        if (not stat.S_ISREG(st.st_mode) or stat.S_ISLNK(st.st_mode)
                or st.st_nlink != 1):
            skipped.append((base, "symlink/hardlink/special input rejected"))
            continue
        if st.st_size == 0:
            skipped.append((base, "empty file"))
            continue
        if not is_stable(fp, st):
            skipped.append((base, "still syncing — next pass"))
            continue
        digest = sha256_file(fp)
        provider_folder, forced = classify_inbox_path(fp, inbox, tickers)
        # Complete-content preflight.  The old bounded sniff admitted a renamed
        # report when its title appeared after 60k characters, and an unreadable
        # scan could be force-routed into GOLD on path metadata alone.
        sniff, fmt, read_error = _complete_identity_text(ep, fp)
        methodology_reason = ep.methodology_only_source_reason(
            base,
            sniff,
            {"origin": base, "routed_from": os.path.relpath(fp, pool)},
        )
        if methodology_reason:
            skipped.append((base, f"methodology-only source rejected — {methodology_reason}"))
            continue
        if fmt in ("pdf", "image") and not sniff.strip() \
                and _gold_sensitive_visual(base, forced, tickers, aliases):
            why = read_error or "no readable text from complete OCR/vision preflight"
            skipped.append((base, f"unreadable GOLD-sensitive visual rejected — {why}"))
            continue
        # sha256 dedup — but a FORCED drop is an explicit instruction: a doc auto-routed to one
        # ticker earlier can be force-added to another (the documented <Provider>/<TICKER>/ path
        # for a missed ticker). The per-target copy below still skips a pool that already holds
        # this exact content, so a forced re-drop of an already-covered ticker stays a no-op.
        if digest in seen and not forced:
            skipped.append((base, "already routed (ledger)"))
            continue

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
            subject_dir = os.path.join(pool, t)
            if os.path.lexists(subject_dir):
                try:
                    subject_info = os.lstat(subject_dir)
                except OSError as exc:
                    raise RuntimeError(f"subject pool is unreadable: {t}") from exc
                if (not stat.S_ISDIR(subject_info.st_mode) or stat.S_ISLNK(subject_info.st_mode)
                        or _safe_beneath(pool, subject_dir) is None):
                    raise RuntimeError(f"subject pool contains a symlinked or invalid directory: {t}")
            else:
                os.makedirs(subject_dir)
            dst = os.path.join(pool, t, "external", pslug, base)
            if _safe_beneath(pool, dst) is None:
                raise RuntimeError(f"routed destination contains a symlinked component: {t}")
            # same-name collisions: keep EVERY distinct version — walk (2), (3), … until a free
            # slot or an identical copy (recurring vendor exports all named "report.pdf" must
            # never overwrite the evidence history). An identical payload is complete only
            # when an exact hash-bound sidecar exists; a crash between the two publications
            # is repaired on retry rather than silently archived as success.
            first_dst = dst
            i = 1
            while True:
                dst = first_dst if i == 1 else _next_suffixed(first_dst, i)
                if os.path.lexists(dst):
                    if _existing_route_is_complete(dst, sidecar, t, pool):
                        break
                    i += 1
                    continue
                sidecar_path = dst + ".source.json"
                # Commit provenance before exposing the payload name. On the
                # FUSE O_EXCL path, a hard death can leave a strict payload
                # prefix; with the expected sidecar already present the
                # extractor hashes that prefix, marks the pair failed, and can
                # never treat it as path-derived tier-9 evidence.
                if os.path.lexists(sidecar_path):
                    if not _sidecar_binds_payload(sidecar_path, digest, t):
                        i += 1
                        continue
                else:
                    try:
                        _write_json_safe(sidecar_path, sidecar, pool)
                    except FileExistsError:
                        if not _sidecar_binds_payload(sidecar_path, digest, t):
                            i += 1
                            continue
                try:
                    copy_contents(fp, dst, pool, expected_sha256=digest)
                except FileExistsError:
                    continue
                if not _sidecar_binds_payload(sidecar_path, digest, t):
                    raise ValueError("published payload has no matching provenance sidecar")
                break
        move_to_routed(fp, inbox, expected_sha256=digest)
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
    for status, request, detail in manual:
        print(f"{tag} manual {status}: {request} — {detail}")
    print(f"{tag} done: {len(routed)} routed, {len(unrouted)} unrouted, {len(skipped)} skipped, {len(manual)} manual")
    return {"routed": routed, "unrouted": unrouted, "skipped": skipped, "manual": manual}


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
    manual_request = argv[argv.index("--manual-request") + 1] if "--manual-request" in argv else None
    intent_key_path = argv[argv.index("--intent-key") + 1] if "--intent-key" in argv else None
    lease = acquire_lock()
    if lease is None:
        print("[ingest_external] another ingester is running — skipping this pass")
        return 0
    try:
        run(pool, dry_run=dry, manual_request=manual_request, intent_key_path=intent_key_path)
        return 0
    finally:
        release_lock(lease)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
