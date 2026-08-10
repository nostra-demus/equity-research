#!/usr/bin/env python3
"""market_prices.py — pure reader for the market price / benchmark feed (the user-provided source).

WHY THIS EXISTS
---------------
The calibration scoreboard (`scripts/calibrate.py`) must judge a call on a BENCHMARK-ADJUSTED basis —
a long that merely rode a rising market did not show skill (CLAUDE.md §9 base-rate discipline). And a
review of a null-entry call (BG) needs a source+dated price to anchor returns from. Both want the same
thing: a daily close series for the stock, its benchmark, and its sector. This module reads that feed.

It follows the `frameworks/EXTERNAL_DATA.md` §7 paid-API / file-drop contract exactly: a fetcher (or the
user) WRITES FILES; there is NO engine wiring and no live API call from the engine. The feed is a
cross-cutting reference series (index / sector closes), not ticker-scoped, so it lives in a shared lane
rather than a ticker's `external/` folder:

  data/_market/<provider>/
     <anything>.csv          long-format daily closes — header: date,symbol,close[,volume]
     <file>.source.json      OPTIONAL provenance sidecar (§3 shape); path-derived fallback if absent
     _symbols.json           OPTIONAL map {symbol: {kind, sector, benchmark, beta}} for adjustment

CSV contract (deliberately minimal, so any source can emit it):
  • one row per (symbol, date): `date,symbol,close` with optional session `volume`
  • date = ISO `YYYY-MM-DD`; symbol = a stable ticker/index string; close = a float in the symbol's
    own currency (returns are unit-free, so currency need not be uniform across symbols — but a stock
    and ITS benchmark must share a currency for the excess to be meaningful).
  • the as-of is the max date IN the data, never a file mtime (EXTERNAL_DATA §8 / fix F23).

CONTRACT (mirrors ledger_records.py / extract_pool.py):
  • Pure + importable; the CLI runs only under __main__. Read-only. Never writes into the feed.
  • Tolerant: a missing feed, a malformed row, a bad date → skipped, never a crash. Absence yields an
    empty reader whose `available()` is False, so callers degrade gracefully and say so.
  • Deterministic: identical files → identical output.

CLI:
  python3 scripts/market_prices.py --print          # summarise what feed is present
  python3 scripts/market_prices.py --history TICKER [--exchange X --currency CCC]
                                                 # strict, provider/basis-bound history JSON
  python3 scripts/market_prices.py --idea-evidence TICKER # quote/liquidity/ordinary-move evidence
  python3 scripts/market_prices.py --write-idea-evidence TICKER RUN_ROOT
                                                 # atomically freeze canonical evidence + digest
  python3 scripts/market_prices.py --selftest        # pure-math + tolerant-read selftests
"""
from __future__ import annotations

import csv
import datetime
import fcntl
import glob
import hashlib
import json
import math
import os
import statistics
import sys
import tempfile

from canonical_json import canonical_json_bytes

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEED_ROOT = os.path.join(REPO, "data", "_market")


# ── reading ──────────────────────────────────────────────────────────────────────────────────────

def _read_csv_closes(path):
    """Yield one parsed row from a long-format CSV. Bad rows are skipped.

    `exchange`, `currency`, and `price_basis` are optional row-level identity assertions. When present,
    the strict export requires them to agree with this SAME provider's `_symbols.json`. They are not
    required because the established file-drop contract binds rows to provider metadata by folder, but
    they can never be ignored when a provider supplies them.
    """
    try:
        with open(path, newline="", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames:
                return
            cols = {c.lower().strip(): c for c in reader.fieldnames}
            if not {"date", "symbol", "close"} <= set(cols):
                return  # not our schema
            for row in reader:
                try:
                    sym = str(row[cols["symbol"]]).strip()
                    date = str(row[cols["date"]]).strip()[:10]
                    close = float(str(row[cols["close"]]).strip())
                except (KeyError, ValueError, TypeError, AttributeError):
                    continue
                # a close must be a FINITE POSITIVE price: NaN/±inf produce nonsensical/infinite returns,
                # and 0 or negative would divide-by-zero or sign-flip in total_return — skip the bad row.
                if sym and _is_iso(date) and math.isfinite(close) and close > 0:
                    volume = None
                    if "volume" in cols:
                        try:
                            raw_volume = str(row[cols["volume"]]).strip()
                            parsed_volume = float(raw_volume) if raw_volume else None
                            if parsed_volume is not None and math.isfinite(parsed_volume) and parsed_volume >= 0:
                                volume = parsed_volume
                        except (KeyError, ValueError, TypeError, AttributeError):
                            volume = None
                    def optional(name):
                        if name not in cols:
                            return None
                        try:
                            value = str(row[cols[name]]).strip()
                            return value or None
                        except (KeyError, TypeError, AttributeError):
                            return None

                    yield (sym, date, close, volume, optional("exchange"),
                           optional("currency"), optional("price_basis"))
    except OSError:
        return


def _days_between(d_early, d_late):
    """Calendar days from `d_early` to `d_late` (both YYYY-MM-DD). Large sentinel if either is unparseable
    (treat as maximally stale, so a bad date never sneaks a carry through the staleness guard)."""
    try:
        a = datetime.date(int(d_early[:4]), int(d_early[5:7]), int(d_early[8:10]))
        b = datetime.date(int(d_late[:4]), int(d_late[5:7]), int(d_late[8:10]))
        return (b - a).days
    except (ValueError, TypeError, IndexError):
        return 10 ** 9


def _is_iso(s):
    """True only for a REAL calendar date in strict YYYY-MM-DD form. A day-of-month must be valid for
    its month (rejects 2026-02-31, 2026-04-31, 2026-13-01) — otherwise one impossible provider row could
    become the feed's as_of or be picked by close_on's string comparison and corrupt a reported return."""
    if not (isinstance(s, str) and len(s) == 10 and s[4] == "-" and s[7] == "-"):
        return False
    try:
        y, m, d = int(s[:4]), int(s[5:7]), int(s[8:10])
        if y < 1900:
            return False
        datetime.date(y, m, d)  # raises ValueError on an impossible calendar date
        return True
    except ValueError:
        return False


def _day_rfc3339(day):
    """Represent a date-resolution observation without inventing an end-of-day clock.

    Midnight UTC is deliberate: stamping today's row at 23:59:59Z before that instant would create
    future evidence. The source is a daily feed, so the contract promises date resolution only.
    """
    return day + "T00:00:00Z"


def _utc_now_rfc3339():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _canonical_json_bytes(value):
    return canonical_json_bytes(value)


class MarketFeed:
    """The parsed feed: per-symbol sorted (date, close) series + optional symbol metadata + per-close
    provenance (which provider supplied each close), so a review's `tracking_price` can cite its source."""

    def __init__(self, closes, meta, providers, files, sources=None, volumes=None,
                 provider_series=None, provider_meta=None, provider_volumes=None,
                 provider_row_claims=None, provider_files=None,
                 provider_metadata_files=None):
        self._closes = closes          # {symbol: [(date, close)] sorted by date}
        self._meta = meta              # {symbol: {kind, sector, benchmark, beta}}
        self.providers = providers     # [provider names present]
        self.files = files             # [relpaths read]
        self._sources = sources or {}  # {(symbol, date): provider} — provenance for the tracking_price.source contract
        self._volumes = volumes or {}  # {(symbol, date): shares/units}; absent is unknown, never zero-filled
        # Strict outcome/idea exports never consume the flattened compatibility view above. They use a
        # provider-local series whose rows, volumes, and metadata travel together, so metadata from an
        # adjusted provider cannot bless raw rows contributed by a different provider.
        self._provider_series = provider_series or {}          # {provider: {symbol: [(date, close)]}}
        self._provider_meta = provider_meta or {}              # {provider: {symbol: metadata}}
        self._provider_volumes = provider_volumes or {}        # {provider: {(symbol,date): volume}}
        self._provider_row_claims = provider_row_claims or {}  # {provider: {symbol: {field: set(values)}}}
        self._provider_files = provider_files or {}            # {provider: {symbol: [repo-relative CSVs]}}
        self._provider_metadata_files = provider_metadata_files or {}  # {provider: repo-relative _symbols.json}

    def available(self):
        return bool(self._closes)

    def symbols(self):
        return sorted(self._closes)

    def as_of(self):
        """The latest date anywhere in the feed (its freshness), or None."""
        alld = [s[-1][0] for s in self._closes.values() if s]
        return max(alld) if alld else None

    MAX_CARRY_DAYS = 7  # a close may carry forward at most a week (long weekend + holidays); beyond that the
                        # symbol is stale for the requested date and must NOT anchor a price as if it were priced

    def close_dated_sourced_on(self, symbol, date, max_stale_days=MAX_CARRY_DAYS):
        """(close, actual_close_date, source_provider) for the last close ON OR BEFORE `date`, or
        (None, None, None). Carries forward over non-trading days, but at most `max_stale_days` calendar
        days — a symbol that stopped updating weeks ago must NOT anchor a price as if the requested date
        were priced (another symbol can keep the feed-level as_of fresh, hiding the staleness). Returns the
        ACTUAL close date (how stale the anchor is) AND the provider that supplied it, so a review's
        `tracking_price` can carry the required `source` + `as_of` (review-decisions contract, §5).
        `max_stale_days=None` disables the limit."""
        series = self._closes.get(symbol)
        if not series:
            return (None, None, None)
        chosen = (None, None)
        for d, c in series:  # sorted ascending
            if d <= date:
                chosen = (c, d)
            else:
                break
        c, d = chosen
        if c is None:
            return (None, None, None)
        if max_stale_days is not None and _days_between(d, date) > max_stale_days:
            return (None, None, None)  # the nearest close is too stale to represent `date`
        return (c, d, self._sources.get((symbol, d)))

    def close_and_date_on(self, symbol, date, max_stale_days=MAX_CARRY_DAYS):
        """(close, actual_close_date) — see close_dated_sourced_on; this drops the source for callers that
        don't need to cite provenance."""
        c, d, _ = self.close_dated_sourced_on(symbol, date, max_stale_days)
        return (c, d)

    def close_on(self, symbol, date, max_stale_days=MAX_CARRY_DAYS):
        """The last close on or before `date` (carry-forward for a non-trading day, up to `max_stale_days`),
        or None. Used to anchor an entry/review/tracking price (review-decisions backfill). A close older
        than the window is rejected, so a stale feed cannot silently anchor a weeks-old price."""
        return self.close_dated_sourced_on(symbol, date, max_stale_days)[0]

    def total_return(self, symbol, d0, d1):
        """Total price return (%) of `symbol` from d0 to d1 using on-or-before closes (each within the
        carry-forward window). None if either endpoint is missing or too stale. Raw return — never a skill
        signal on its own (§9)."""
        c0, c1 = self.close_on(symbol, d0), self.close_on(symbol, d1)
        if c0 is None or c1 is None or c0 == 0:
            return None
        return round((c1 / c0 - 1.0) * 100.0, 4)

    def beta_of(self, symbol):
        m = self._meta.get(symbol) or {}
        b = m.get("beta")
        # A user-provided beta must be a FINITE real number. A bool, NaN, or Infinity in _symbols.json
        # would otherwise flow into beta_adjusted_excess() and emit a non-finite `beta_adjusted_excess_pct`
        # — invalid strict JSON downstream, or a silently-nulled adjustment. Fall back to 1.0 (no
        # adjustment, naive excess) instead of trusting a poisoned value.
        if isinstance(b, (int, float)) and not isinstance(b, bool) and math.isfinite(b):
            return float(b)
        return 1.0

    def benchmark_of(self, symbol):
        b = (self._meta.get(symbol) or {}).get("benchmark")
        # A benchmark must be a non-empty STRING symbol. A non-string container (list/dict) in a
        # user-provided _symbols.json would otherwise reach total_return() → _closes.get(unhashable) and
        # raise TypeError, crashing beta_adjusted_excess — treat it as missing (None) instead.
        return b if (isinstance(b, str) and b.strip()) else None

    def metadata_of(self, symbol):
        """A defensive copy of one symbol's provider metadata, or {}."""
        m = self._meta.get(symbol)
        return dict(m) if isinstance(m, dict) else {}

    def _strict_history_selection(self, symbol, exchange=None, currency=None, require_equity=False,
                                  provider=None, instrument_kind=None, price_basis=None):
        """Resolve exactly one provider-local listing, or fail closed with a stable reason code.

        The compatibility reader historically flattened providers by `(symbol,date)`. That is fine for
        an indicative `close_on`, but unsafe for outcome grading: Provider B's adjusted metadata could
        otherwise bless Provider A's raw rows, and the same ticker can name different listings. Strict
        exports therefore bind rows + volumes + metadata to one provider and one listing identity.
        """
        symbol = str(symbol).strip()
        wanted_exchange = exchange.strip().upper() if isinstance(exchange, str) and exchange.strip() else None
        wanted_currency = currency.strip().upper() if isinstance(currency, str) and currency.strip() else None
        wanted_provider = provider.strip() if isinstance(provider, str) and provider.strip() else None
        wanted_price_basis = price_basis.strip().lower() if isinstance(price_basis, str) and price_basis.strip() else None
        if provider is not None and wanted_provider is None:
            return None, None, "invalid_provider_selector"
        if instrument_kind is not None and instrument_kind not in ("equity", "benchmark", "sector", "future"):
            return None, None, "invalid_instrument_kind_selector"
        allowed_price_bases = {
            "split_adjusted", "front_contract", "continuous_back_adjusted", "continuous_ratio_adjusted",
        }
        if price_basis is not None and wanted_price_basis not in allowed_price_bases:
            return None, None, "invalid_price_basis_selector"
        if currency is not None and (wanted_currency is None or len(wanted_currency) != 3 or not wanted_currency.isalpha()):
            return None, None, "invalid_currency_selector"
        if exchange is not None and wanted_exchange is None:
            return None, None, "invalid_exchange_selector"

        records = []
        unresolved_identity = False
        for provider_name in sorted(self._provider_series):
            if wanted_provider and provider_name != wanted_provider:
                continue
            series = (self._provider_series.get(provider_name) or {}).get(symbol)
            if not series:
                continue
            meta = dict(((self._provider_meta.get(provider_name) or {}).get(symbol)) or {})
            mx = meta.get("exchange")
            mc = meta.get("currency")
            valid_identity = (isinstance(mx, str) and bool(mx.strip()) and
                              isinstance(mc, str) and len(mc.strip()) == 3 and mc.strip().isalpha())
            if wanted_exchange or wanted_currency:
                if not valid_identity:
                    # A data-bearing provider with unknown identity may be the requested listing. It
                    # cannot be silently ignored merely because another provider has better metadata.
                    unresolved_identity = True
                    continue
                if wanted_exchange and mx.strip().upper() != wanted_exchange:
                    continue
                if wanted_currency and mc.strip().upper() != wanted_currency:
                    continue
            if wanted_price_basis and meta.get("price_basis") != wanted_price_basis:
                continue
            records.append({"provider": provider_name, "series": series, "meta": meta})

        if unresolved_identity:
            return None, None, "provider_identity_ambiguous"
        if not records:
            return None, None, "history_missing"
        # With no selectors, a symbol is backwards compatible only if exactly one provider contributes
        # rows. With selectors, more than one matching provider is still conflicting provenance: there
        # is no provider selector in v1 and combining them would make the frozen source irreproducible.
        if len(records) != 1:
            return None, None, "listing_or_provider_ambiguous"

        record = records[0]
        provider, all_series, meta = record["provider"], record["series"], record["meta"]
        today = datetime.date.today().isoformat()
        future_series = [(d, c) for d, c in all_series if d > today]
        series = [(d, c) for d, c in all_series if d <= today]
        if not series:
            return None, None, "no_non_future_history"
        record["series"] = series
        record["excluded_future_sessions"] = len(future_series)
        kind = meta.get("kind")
        allowed_kinds = (instrument_kind,) if instrument_kind else (("equity",) if require_equity else ("equity", "benchmark", "sector", "future"))
        if kind not in allowed_kinds:
            return None, None, "instrument_kind_not_allowed"
        actual_price_basis = meta.get("price_basis")
        kind_bases = {
            "equity": {"split_adjusted"}, "benchmark": {"split_adjusted"},
            "sector": {"split_adjusted"},
            "future": {"front_contract", "continuous_back_adjusted", "continuous_ratio_adjusted"},
        }
        if actual_price_basis not in kind_bases[kind]:
            return None, None, "price_basis_unproven"
        mx, mc = meta.get("exchange"), meta.get("currency")
        if not (isinstance(mx, str) and mx.strip() and isinstance(mc, str) and
                len(mc.strip()) == 3 and mc.strip().isalpha()):
            return None, None, "listing_identity_missing"

        # Optional identity/basis columns are assertions, not decoration. Any conflict inside the same
        # provider makes the whole history unusable instead of allowing a last-row-wins identity.
        claims = (((self._provider_row_claims.get(provider) or {}).get(symbol)) or {})
        expected = {
            "exchange": mx.strip().upper(),
            "currency": mc.strip().upper(),
            "price_basis": actual_price_basis,
        }
        for field, expected_value in expected.items():
            values = claims.get(field) or set()
            normalized = {str(v).strip().upper() if field != "price_basis" else str(v).strip().lower()
                          for v in values if str(v).strip()}
            if normalized and normalized != {expected_value}:
                return None, None, "row_metadata_conflict"

        status = meta.get("security_status", "active")
        if status not in ("active", "delisted"):
            return None, None, "security_status_invalid"
        terminal = meta.get("terminal_value")
        if status == "delisted":
            if not isinstance(terminal, dict):
                return None, None, "terminal_value_missing"
            td, tp, ts = terminal.get("date"), terminal.get("price"), terminal.get("source")
            if not (_is_iso(td) and td <= today and isinstance(tp, (int, float)) and not isinstance(tp, bool) and
                    math.isfinite(tp) and tp >= 0 and isinstance(ts, str) and ts.strip()):
                return None, None, "terminal_value_invalid"
            terminal = {"date": _day_rfc3339(td), "price": float(tp), "source": ts.strip()}
        else:
            terminal = None

        source_files = sorted(set(((self._provider_files.get(provider) or {}).get(symbol)) or []))
        metadata_file = self._provider_metadata_files.get(provider)
        calendar_symbols = []
        calendar_days = set()
        compatible_calendar_kinds = (
            {"future"} if kind == "future" else {"equity", "benchmark", "sector"}
        )
        for calendar_symbol, calendar_series in (self._provider_series.get(provider) or {}).items():
            calendar_meta = ((self._provider_meta.get(provider) or {}).get(calendar_symbol)) or {}
            if (calendar_meta.get("currency") != mc or
                    calendar_meta.get("kind") not in compatible_calendar_kinds):
                continue
            usable = [day for day, _ in calendar_series if day <= today]
            if not usable:
                continue
            calendar_symbols.append(calendar_symbol)
            calendar_days.update(usable)
        source = f"{provider} market feed"
        history_as_of = max([series[-1][0], *(calendar_days or {series[-1][0]}), *([terminal["date"][:10]] if terminal else [])])
        out = {
            "schema_version": "market-history/v1",
            "ticker": symbol,
            "exchange": mx.strip(),
            "currency": mc.strip().upper(),
            "adjusted": actual_price_basis in {"split_adjusted", "continuous_back_adjusted", "continuous_ratio_adjusted"},
            "adjustment_basis": "split_adjusted_price" if actual_price_basis == "split_adjusted" else actual_price_basis,
            "source": source,
            "provider": provider,
            "instrument_kind": kind,
            "metadata_file": metadata_file,
            "source_files": source_files,
            "excluded_future_sessions": len(future_series),
            "as_of": _day_rfc3339(history_as_of),
            "security_status": status,
            "terminal_value": terminal,
            "session_calendar": {
                "source": f"{provider} provider-local session calendar",
                "source_symbols": sorted(set(calendar_symbols)),
                "dates": [_day_rfc3339(day) for day in sorted(calendar_days)],
            },
            "points": [{"date": _day_rfc3339(d), "close": c} for d, c in series],
        }
        if kind == "equity":
            benchmark = meta.get("benchmark") if isinstance(meta.get("benchmark"), str) and meta.get("benchmark").strip() else None
            sector = meta.get("sector") if isinstance(meta.get("sector"), str) and meta.get("sector").strip() else None
            beta = meta.get("beta")
            if not (isinstance(beta, (int, float)) and not isinstance(beta, bool) and math.isfinite(beta)):
                beta = 1.0
            out["comparators"] = {"benchmark": benchmark, "sector": sector, "beta": float(beta)}
        record["volumes"] = (self._provider_volumes.get(provider) or {})
        return out, record, None

    def adjusted_history(self, symbol, exchange=None, currency=None, require_equity=False,
                         provider=None, instrument_kind=None, price_basis=None):
        """Export exactly one provider-bound `market-history/v1`, or None when identity/provenance/basis
        is ambiguous. Equities require split-adjusted prices; futures carry an explicit front-contract,
        continuous back-adjusted or continuous ratio-adjusted basis. Selectors are verified, never copied.
        """
        history, _, _ = self._strict_history_selection(
            symbol, exchange, currency, require_equity, provider, instrument_kind, price_basis)
        return history

    def idea_evidence(self, symbol, exchange=None, currency=None):
        """Source-bound market evidence for one EQUITY listing and a new 3–6 month assessment.

        Liquidity uses the fixed most-recent 60 eligible sessions and requires observed volume on at
        least 90% (54/60). Non-USD conversion requires the exact `<currency>/USD` pair, rate in USD per
        one listing-currency unit, as-of, and source. Future-dated rows are excluded and make the export
        unavailable, so no future observation can influence quote, liquidity, or ordinary-move values.
        """
        history, record, selection_error = self._strict_history_selection(
            symbol, exchange, currency, require_equity=True)
        if history is None:
            return {
                "schema_version": "idea-market-evidence/v1", "symbol": str(symbol).strip(),
                "available": False, "gaps": [f"No unambiguous provider-bound equity history ({selection_error})."],
            }

        gaps = []
        today = datetime.date.today().isoformat()
        points = history["points"]
        excluded_future = record.get("excluded_future_sessions", 0)
        if excluded_future:
            gaps.append(f"{excluded_future} future-dated adjusted-price session(s) were excluded.")
        if not points:
            return {
                "schema_version": "idea-market-evidence/v1", "symbol": str(symbol).strip(),
                "available": False, "gaps": gaps + ["No non-future adjusted-price session is available."],
                "instrument": {
                    "ticker": history["ticker"], "exchange": history["exchange"],
                    "currency": history["currency"], "asset_type": "equity",
                },
                "quote": None, "liquidity": None, "market_risk": None,
            }

        latest = points[-1]
        latest_date = latest["date"][:10]
        latest_at = _day_rfc3339(latest_date)
        provider = record["provider"]
        source = f"{provider} market feed, {latest_date}"
        quote_age_days = _days_between(latest_date, today)
        quote = {
            "price": latest["close"], "as_of": latest_at, "source": source,
            "identity_verified": True, "stale": quote_age_days > self.MAX_CARRY_DAYS,
        }
        if quote["stale"]:
            gaps.append(f"Latest adjusted quote is more than {self.MAX_CARRY_DAYS} calendar days old.")

        meta = record["meta"]
        listing_currency = history["currency"]
        if listing_currency == "USD":
            conversion = {
                "pair": "USD/USD", "rate_usd_per_currency": 1.0, "as_of": latest_at,
                "source": "USD listing currency; identity conversion",
            }
        else:
            expected_pair = f"{listing_currency}/USD"
            pair = meta.get("usd_fx_pair")
            rate = meta.get("usd_fx_rate")
            fx_date = meta.get("usd_fx_as_of")
            fx_source = meta.get("usd_fx_source")
            fx_age_days = _days_between(fx_date, latest_date) if _is_iso(fx_date) else 10 ** 9
            valid_fx = (
                isinstance(pair, str) and pair.strip().upper() == expected_pair and
                isinstance(rate, (int, float)) and not isinstance(rate, bool) and
                math.isfinite(rate) and rate > 0 and _is_iso(fx_date) and fx_date <= today and
                0 <= fx_age_days <= 14 and isinstance(fx_source, str) and bool(fx_source.strip())
            )
            if valid_fx:
                conversion = {
                    "pair": expected_pair, "rate_usd_per_currency": float(rate),
                    "as_of": _day_rfc3339(fx_date), "source": fx_source.strip(),
                }
            else:
                conversion = None
                gaps.append(
                    f"A source-bound {expected_pair} rate/as-of/source within 14 days of the quote is missing or conflicting."
                )

        if len(points) < 60:
            gaps.append(f"Only {len(points)}/60 non-future adjusted-price sessions are available.")
            liquidity = None
            market_risk = None
        else:
            window = points[-60:]
            window_start = window[0]["date"][:10]
            window_end = window[-1]["date"][:10]
            volumes = record["volumes"]
            observed = []
            if conversion is not None:
                for point in window:
                    day = point["date"][:10]
                    volume = volumes.get((str(symbol).strip(), day))
                    if (isinstance(volume, (int, float)) and not isinstance(volume, bool) and
                            math.isfinite(volume) and volume >= 0):
                        observed.append((day, point["close"] * volume * conversion["rate_usd_per_currency"]))
            coverage_pct = round(len(observed) / 60 * 100, 2)
            if conversion is None:
                liquidity = None
            elif len(observed) < 54:
                gaps.append(
                    f"Only {len(observed)}/60 sessions ({coverage_pct:.2f}%) in the fixed liquidity window "
                    "have observed close × volume; at least 54/60 (90%) are required."
                )
                liquidity = None
            else:
                liquidity_date = observed[-1][0]
                if _days_between(liquidity_date, latest_date) > 14:
                    gaps.append("Measured close × volume liquidity is more than 14 calendar days older than the quote.")
                liquidity = {
                    "verified": True,
                    "as_of": _day_rfc3339(liquidity_date),
                    "source": f"{provider} market feed close × volume; {conversion['source']}",
                    "lookback_days": 60,
                    "observed_sessions": len(observed),
                    "coverage_pct": coverage_pct,
                    "window_start": _day_rfc3339(window_start),
                    "window_end": _day_rfc3339(window_end),
                    "median_daily_value_usd": round(statistics.median(v for _, v in observed), 2),
                    "currency_conversion": conversion,
                }

            five_session_moves = [abs(window[i]["close"] / window[i - 5]["close"] - 1.0) * 100
                                  for i in range(5, len(window))]
            market_risk = {
                "as_of": latest_at, "source": f"{provider} split-adjusted market feed",
                "lookback_days": 60,
                "ordinary_move_pct": round(statistics.median(five_session_moves), 4),
            }

        return {
            "schema_version": "idea-market-evidence/v1",
            "symbol": str(symbol).strip(),
            "available": not gaps and liquidity is not None and market_risk is not None,
            "gaps": gaps,
            "instrument": {
                "ticker": history["ticker"], "exchange": history["exchange"],
                "currency": listing_currency, "asset_type": "equity",
            },
            "quote": quote,
            "liquidity": liquidity,
            "market_risk": market_risk,
        }

    def beta_adjusted_excess(self, symbol, d0, d1, benchmark=None, beta=None):
        """Beta-adjusted excess return (%): stock_return − beta·benchmark_return over [d0, d1]. This is
        the honest skill number — it strips the market move the stock would have made just by having
        beta exposure, so only the residual (alpha) counts (§9). Returns a dict with the raw and the
        adjusted figures (so a caller can show BOTH and see they diverge), or None if data is missing.
        `benchmark`/`beta` default to the symbol's `_symbols.json` metadata."""
        benchmark = benchmark or self.benchmark_of(symbol)
        beta = self.beta_of(symbol) if beta is None else beta
        if not benchmark:
            return None
        sr = self.total_return(symbol, d0, d1)
        br = self.total_return(benchmark, d0, d1)
        if sr is None or br is None:
            return None
        return {
            "symbol": symbol, "benchmark": benchmark, "beta": round(beta, 4),
            "stock_return_pct": sr, "benchmark_return_pct": br,
            "raw_excess_pct": round(sr - br, 4),                 # naive (beta=1) excess
            "beta_adjusted_excess_pct": round(sr - beta * br, 4),  # the skill number
        }


def load_feed(feed_root=FEED_ROOT):
    """Read every `data/_market/<provider>/*.csv` into a MarketFeed, plus any `_symbols.json` metadata.
    A missing feed root returns an empty (unavailable) feed — the normal state until the user drops one."""
    closes, meta, providers, files = {}, {}, [], []
    sources = {}  # {(symbol, date): provider} — which provider supplied each close (for tracking_price.source)
    volumes = {}  # {(symbol, date): observed shares/units}; never imputed
    provider_series = {}
    provider_meta = {}
    provider_volumes = {}
    provider_row_claims = {}
    provider_files = {}
    provider_metadata_files = {}
    if not os.path.isdir(feed_root):
        return MarketFeed(closes, meta, providers, files)
    for provider in sorted(os.listdir(feed_root)):
        pdir = os.path.join(feed_root, provider)
        if not os.path.isdir(pdir):
            continue
        providers.append(provider)
        local_meta = {}
        mpath = os.path.join(pdir, "_symbols.json")
        if os.path.isfile(mpath):
            try:
                with open(mpath, encoding="utf-8") as f:
                    m = json.load(f)
                if isinstance(m, dict):
                    provider_metadata_files[provider] = os.path.relpath(mpath, REPO)
                    for k, v in m.items():
                        if isinstance(v, dict):
                            key = str(k).strip()
                            local_meta[key] = dict(v)
                            meta[key] = v
            except (OSError, json.JSONDecodeError, ValueError):
                pass
        provider_meta[provider] = local_meta
        local_closes = {}
        local_volumes = {}
        local_claims = {}
        local_files = {}
        for path in sorted(glob.glob(os.path.join(pdir, "*.csv"))):
            found = False
            relpath = os.path.relpath(path, REPO)
            for sym, date, close, volume, row_exchange, row_currency, row_basis in _read_csv_closes(path):
                prior_close = local_closes.get(sym, {}).get(date)
                prior_volume = local_volumes.get((sym, date))
                if prior_close is not None and (prior_close != close or prior_volume != volume):
                    raise ValueError(
                        f"conflicting same-provider rows for {provider}:{sym}:{date}; "
                        "exact duplicates are allowed but no lexical last-write-wins precedence exists"
                    )
                local_closes.setdefault(sym, {})[date] = close
                closes.setdefault(sym, {})[date] = close  # dedup: last write per (sym,date) wins
                sources[(sym, date)] = provider           # …and record which provider it came from
                if volume is not None:
                    local_volumes[(sym, date)] = volume
                    volumes[(sym, date)] = volume
                else:
                    local_volumes.pop((sym, date), None)
                    volumes.pop((sym, date), None)        # the winning close row also owns volume absence
                claims = local_claims.setdefault(sym, {"exchange": set(), "currency": set(), "price_basis": set()})
                if row_exchange is not None:
                    claims["exchange"].add(row_exchange)
                if row_currency is not None:
                    claims["currency"].add(row_currency)
                if row_basis is not None:
                    claims["price_basis"].add(row_basis)
                local_files.setdefault(sym, set()).add(relpath)
                found = True
            if found:
                files.append(relpath)
        provider_series[provider] = {sym: sorted(byd.items()) for sym, byd in local_closes.items()}
        provider_volumes[provider] = local_volumes
        provider_row_claims[provider] = local_claims
        provider_files[provider] = {sym: sorted(paths) for sym, paths in local_files.items()}
    # freeze each symbol to a date-sorted list
    sorted_closes = {sym: sorted(byd.items()) for sym, byd in closes.items()}
    return MarketFeed(sorted_closes, meta, providers, files, sources, volumes,
                      provider_series, provider_meta, provider_volumes,
                      provider_row_claims, provider_files, provider_metadata_files)


IDEA_EVIDENCE_SNAPSHOT = "idea_market_evidence.json"


def _read_immutable_idea_evidence_snapshot(target, manifest_sha, symbol, exchange=None, currency=None):
    """Return a valid first-writer snapshot or raise without replacing it.

    Once a research projection has observed a market state, a later feed refresh must not move its entry
    price or liquidity window. Corrupt or differently scoped existing bytes therefore fail closed; they
    are never treated as permission to rewrite history.
    """
    try:
        with open(target, encoding="utf-8") as handle:
            snapshot = json.load(handle)
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        raise ValueError("existing idea_market_evidence.json is unreadable and will not be overwritten") from exc
    evidence = snapshot.get("evidence") if isinstance(snapshot, dict) else None
    try:
        captured = datetime.datetime.fromisoformat(str(snapshot.get("captured_at")).replace("Z", "+00:00"))
    except (TypeError, ValueError):
        captured = None
    evidence_sha = hashlib.sha256(_canonical_json_bytes(evidence)).hexdigest() if isinstance(evidence, dict) else None
    instrument = evidence.get("instrument") if isinstance(evidence, dict) and isinstance(evidence.get("instrument"), dict) else {}
    requested_ticker = str(symbol).strip().upper()
    requested_exchange = str(exchange).strip().upper() if exchange is not None else None
    requested_currency = str(currency).strip().upper() if currency is not None else None
    if (
            not isinstance(snapshot, dict) or snapshot.get("schema_version") != "idea-market-evidence-snapshot/v1" or
            snapshot.get("projection_manifest_sha256") != manifest_sha or captured is None or captured.tzinfo is None or
            evidence_sha is None or snapshot.get("evidence_sha256") != evidence_sha or
            evidence.get("schema_version") != "idea-market-evidence/v1" or evidence.get("available") is not True or
            evidence.get("gaps") != [] or str(instrument.get("ticker") or "").strip().upper() != requested_ticker or
            instrument.get("asset_type") != "equity" or
            (requested_exchange is not None and str(instrument.get("exchange") or "").strip().upper() != requested_exchange) or
            (requested_currency is not None and str(instrument.get("currency") or "").strip().upper() != requested_currency)
    ):
        raise ValueError("existing idea_market_evidence.json failed its immutable digest, manifest, or listing contract and will not be overwritten")
    return snapshot, evidence_sha


def write_idea_evidence_snapshot(feed, symbol, run_root, exchange=None, currency=None):
    """Atomically freeze one canonical market-evidence sidecar.

    The digest is SHA-256 over the canonical JSON bytes of `evidence` alone. `captured_at` is deliberately
    outside that digest: rerunning against identical market evidence produces the same content address,
    while the wrapper still records when this particular immutable snapshot was written.
    """
    root = os.path.abspath(run_root)
    if not os.path.isdir(root):
        raise ValueError("RUN_ROOT must be an existing directory")
    target = os.path.join(root, IDEA_EVIDENCE_SNAPSHOT)
    lock_fd = os.open(root, os.O_RDONLY)
    try:
        # One directory-scoped mutex serializes manifest creation, market capture, and final admission
        # without leaving a transient `.lock` file that a broad research-data commit could stage.
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        manifest_path = os.path.join(root, "idea_projection_manifest.json")
        try:
            with open(manifest_path, encoding="utf-8") as handle:
                manifest = json.load(handle)
            manifest_payload = dict(manifest)
            manifest_sha = manifest_payload.pop("manifest_sha256", None)
            if (manifest.get("schema_version") != "idea-projection-manifest/v1" or
                    not isinstance(manifest_sha, str) or len(manifest_sha) != 64 or
                    manifest_sha != hashlib.sha256(_canonical_json_bytes(manifest_payload)).hexdigest()):
                raise ValueError("digest mismatch")
        except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
            raise ValueError("a valid post-audit idea_projection_manifest.json is required before market capture") from exc

        if os.path.exists(target):
            snapshot, evidence_sha = _read_immutable_idea_evidence_snapshot(
                target, manifest_sha, symbol, exchange=exchange, currency=currency)
            return {"path": target, "evidence_sha256": evidence_sha, "snapshot": snapshot}

        evidence = feed.idea_evidence(symbol, exchange=exchange, currency=currency)
        if not evidence.get("available"):
            raise ValueError("market evidence is unavailable: " + "; ".join(evidence.get("gaps") or []))
        evidence_sha = hashlib.sha256(_canonical_json_bytes(evidence)).hexdigest()
        snapshot = {
            "schema_version": "idea-market-evidence-snapshot/v1",
            "captured_at": _utc_now_rfc3339(),
            "projection_manifest_sha256": manifest_sha,
            "evidence": evidence,
            "evidence_sha256": evidence_sha,
        }
        tmp = None
        try:
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=root,
                                             prefix=".idea_market_evidence.", suffix=".tmp",
                                             delete=False) as f:
                tmp = f.name
                json.dump(snapshot, f, sort_keys=True, indent=2, ensure_ascii=False, allow_nan=False)
                f.write("\n")
                os.fchmod(f.fileno(), 0o644)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, target)
            tmp = None
            os.fsync(lock_fd)
        finally:
            if tmp:
                try:
                    os.unlink(tmp)
                except OSError:
                    pass
        return {"path": target, "evidence_sha256": evidence_sha, "snapshot": snapshot}
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


# ── selftest + CLI ─────────────────────────────────────────────────────────────────────────────────

def selftest():
    import tempfile
    ok = True

    def check(cond, msg):
        nonlocal ok
        if not cond:
            ok = False
            print(f"[market_prices] SELFTEST FAIL: {msg}")

    # empty / missing feed → unavailable, never crashes
    empty = load_feed("/nonexistent/_market/xyz")
    check(empty.available() is False, "missing feed → unavailable")
    check(empty.close_on("SPX", "2026-01-01") is None, "missing feed → close_on None")
    check(empty.total_return("SPX", "2026-01-01", "2026-02-01") is None, "missing feed → return None")

    with tempfile.TemporaryDirectory() as td:
        prov = os.path.join(td, "SampleProvider")
        os.makedirs(prov)
        with open(os.path.join(prov, "closes.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\n")
            f.write("2026-06-01,STK,100\n2026-07-01,STK,120\n")   # stock +20%
            f.write("2026-06-01,BENCH,200\n2026-07-01,BENCH,220\n")  # benchmark +10%
        with open(os.path.join(prov, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({
                "STK": {"kind": "equity", "benchmark": "BENCH", "beta": 1.5,
                        "exchange": "NYSE", "currency": "USD", "price_basis": "split_adjusted"},
                "BENCH": {"kind": "benchmark", "exchange": "INDEX", "currency": "USD",
                          "price_basis": "split_adjusted"},
            }, f)
        feed = load_feed(td)

        check(feed.available() and feed.symbols() == ["BENCH", "STK"], "reads both symbols")
        check(feed.as_of() == "2026-07-01", "as_of is the latest date in the data (not mtime)")
        check(feed.close_on("STK", "2026-06-03") == 100.0, "close_on carries the prior close forward over a non-trading day (2 days)")
        check(feed.close_on("STK", "2026-06-15") is None, "close_on REJECTS a >7-day-stale carry (14 days after the last close)")
        check(feed.close_on("STK", "2026-06-15", max_stale_days=None) == 100.0, "…unless the staleness limit is disabled")
        c, d = feed.close_and_date_on("STK", "2026-06-03")
        check(c == 100.0 and d == "2026-06-01", "close_and_date_on returns the ACTUAL (stale-aware) close date")
        c2, d2, src = feed.close_dated_sourced_on("STK", "2026-06-03")
        check(c2 == 100.0 and d2 == "2026-06-01" and src == "SampleProvider",
              "close_dated_sourced_on carries the provider provenance (for tracking_price.source)")
        check(feed.close_on("STK", "2026-05-01") is None, "close_on before the series → None")
        hist = feed.adjusted_history("STK")
        check(hist is not None and hist["adjustment_basis"] == "split_adjusted_price" and
              hist["exchange"] == "NYSE" and hist["instrument_kind"] == "equity" and
              hist["metadata_file"].endswith("SampleProvider/_symbols.json") and
              hist["session_calendar"]["source_symbols"] == ["BENCH", "STK"] and len(hist["points"]) == 2,
              "strict adjusted-history export binds provider metadata and reuses the canonical feed")
        bh = feed.adjusted_history("BENCH")
        check(bh is not None and bh["ticker"] == "BENCH" and bh["instrument_kind"] == "benchmark",
              "an explicitly identified split-adjusted benchmark can feed relative outcomes")
        check(feed.adjusted_history("STK", provider="SampleProvider", instrument_kind="equity") is not None and
              feed.adjusted_history("STK", provider="OtherProvider", instrument_kind="equity") is None,
              "an admitted provider selector allows the frozen feed and rejects replacement history")
        check(feed.adjusted_history("BENCH", provider="SampleProvider", instrument_kind="sector") is None and
              feed.adjusted_history("STK", provider="SampleProvider", instrument_kind="benchmark") is None,
              "strict outcome roles cannot relabel an equity, benchmark, or sector")
        check(feed.total_return("STK", "2026-06-01", "2026-07-01") == 20.0, "stock total return +20%")
        check(feed.total_return("BENCH", "2026-06-01", "2026-07-01") == 10.0, "benchmark total return +10%")

        adj = feed.beta_adjusted_excess("STK", "2026-06-01", "2026-07-01")
        check(adj is not None, "beta-adjusted excess computes with metadata")
        check(adj["raw_excess_pct"] == 10.0, "raw (beta=1) excess = 20 − 10 = 10pp")
        check(adj["beta_adjusted_excess_pct"] == 5.0, "beta-adjusted excess = 20 − 1.5·10 = 5pp")
        check(adj["raw_excess_pct"] != adj["beta_adjusted_excess_pct"],
              "raw and beta-adjusted DIVERGE (the point — high beta explains part of the outperformance)")
        # explicit override beats metadata
        adj2 = feed.beta_adjusted_excess("STK", "2026-06-01", "2026-07-01", beta=2.0)
        check(adj2["beta_adjusted_excess_pct"] == 0.0, "beta=2.0 override → 20 − 2·10 = 0pp (no alpha)")

        # a malformed row is skipped, not fatal
        with open(os.path.join(prov, "bad.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\nnot-a-date,STK,oops\n2026-08-01,STK,130\n")
        feed2 = load_feed(td)
        check(feed2.close_on("STK", "2026-08-01") == 130.0, "good row read despite a sibling malformed row")

        # non-finite / non-positive closes AND an impossible calendar date are all skipped, not ingested
        with open(os.path.join(prov, "junk.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\n")
            f.write("2026-09-01,JUNK,inf\n2026-09-02,JUNK,-5\n2026-09-03,JUNK,0\n")   # inf / negative / zero
            f.write("2026-02-31,JUNK,50\n")                                            # impossible date
            f.write("2026-09-05,JUNK,42\n")                                            # the one good row
        feed3 = load_feed(td)
        check(feed3.symbols().count("JUNK") == 1 and feed3.as_of() == "2026-09-05",
              "inf/-5/0/impossible-date rows skipped; only the good JUNK row (42 @ 2026-09-05) survives")
        check(feed3.close_on("JUNK", "2026-09-06") == 42.0, "close_on never returns a skipped bad price (the good 42 @ 09-05)")

    with tempfile.TemporaryDirectory() as td:
        prov = os.path.join(td, "FuturesProvider")
        os.makedirs(prov)
        with open(os.path.join(prov, "closes.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close,exchange,currency,price_basis\n")
            f.write("2026-06-01,@GC.1,3300,COMEX,USD,continuous_back_adjusted\n")
            f.write("2026-07-01,@GC.1,3400,COMEX,USD,continuous_back_adjusted\n")
        with open(os.path.join(prov, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({"@GC.1": {"kind": "future", "exchange": "COMEX", "currency": "USD",
                                   "price_basis": "continuous_back_adjusted"}}, f)
        futures = load_feed(td)
        future_history = futures.adjusted_history(
            "@GC.1", instrument_kind="future", price_basis="continuous_back_adjusted")
        check(future_history is not None and future_history["instrument_kind"] == "future" and
              future_history["adjustment_basis"] == "continuous_back_adjusted" and
              future_history["adjusted"] is True,
              "futures history carries an explicit continuous adjustment basis")
        check(futures.adjusted_history("@GC.1", instrument_kind="benchmark") is None and
              futures.adjusted_history("@GC.1", instrument_kind="future", price_basis="split_adjusted") is None,
              "a futures series cannot masquerade as a split-adjusted benchmark")

    with tempfile.TemporaryDirectory() as td:
        prov = os.path.join(td, "MixedCalendarProvider")
        os.makedirs(prov)
        with open(os.path.join(prov, "closes.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\n")
            f.write("2026-06-05,EQ,100\n2026-06-08,EQ,101\n")
            f.write("2026-06-05,FUT,200\n2026-06-07,FUT,202\n2026-06-08,FUT,203\n")
        with open(os.path.join(prov, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({
                "EQ": {"kind": "equity", "exchange": "NYSE", "currency": "USD",
                       "price_basis": "split_adjusted"},
                "FUT": {"kind": "future", "exchange": "COMEX", "currency": "USD",
                        "price_basis": "front_contract"},
            }, f)
        mixed = load_feed(td)
        equity_calendar = mixed.adjusted_history("EQ")["session_calendar"]
        future_calendar = mixed.adjusted_history("FUT")["session_calendar"]
        check(equity_calendar["source_symbols"] == ["EQ"] and
              "2026-06-07T00:00:00Z" not in equity_calendar["dates"],
              "futures-only Sunday sessions never contaminate an equity calendar")
        check(future_calendar["source_symbols"] == ["FUT"] and
              "2026-06-07T00:00:00Z" in future_calendar["dates"],
              "a futures calendar remains provider-local and instrument-compatible")

    # Strict histories bind one provider's rows to that same provider's metadata. These regressions
    # guard the exact cross-provider flattening failures that can manufacture split-adjusted history.
    with tempfile.TemporaryDirectory() as td:
        raw = os.path.join(td, "A_RawRows")
        metadata_only = os.path.join(td, "Z_AdjustedMetadataOnly")
        os.makedirs(raw)
        os.makedirs(metadata_only)
        with open(os.path.join(raw, "raw.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\n2026-06-01,CROSS,100\n2026-06-02,CROSS,50\n")
        with open(os.path.join(metadata_only, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({"CROSS": {"kind": "equity", "exchange": "NYSE", "currency": "USD",
                                  "price_basis": "split_adjusted"}}, f)
        cross = load_feed(td)
        check(cross.adjusted_history("CROSS") is None,
              "adjusted metadata from a metadata-only provider cannot bless another provider's raw rows")

    with tempfile.TemporaryDirectory() as td:
        ny = os.path.join(td, "NYSEProvider")
        ns = os.path.join(td, "NSEProvider")
        os.makedirs(ny)
        os.makedirs(ns)
        for pdir, exchange, currency, base in ((ny, "NYSE", "USD", 100), (ns, "NSE", "INR", 1000)):
            with open(os.path.join(pdir, "rows.csv"), "w", encoding="utf-8") as f:
                f.write("date,symbol,close,exchange,currency,price_basis\n")
                f.write(f"2026-06-01,DUP,{base},{exchange},{currency},split_adjusted\n")
                f.write(f"2026-06-02,DUP,{base + 1},{exchange},{currency},split_adjusted\n")
            with open(os.path.join(pdir, "_symbols.json"), "w", encoding="utf-8") as f:
                json.dump({"DUP": {"kind": "equity", "exchange": exchange, "currency": currency,
                                   "price_basis": "split_adjusted"}}, f)
        collision = load_feed(td)
        check(collision.adjusted_history("DUP") is None,
              "a ticker collision across provider listings is ambiguous without exchange/currency")
        ny_hist = collision.adjusted_history("DUP", exchange="nyse", currency="usd")
        ns_hist = collision.adjusted_history("DUP", exchange="NSE", currency="INR")
        check(ny_hist is not None and ny_hist["exchange"] == "NYSE" and ny_hist["provider"] == "NYSEProvider" and
              ns_hist is not None and ns_hist["exchange"] == "NSE" and ns_hist["provider"] == "NSEProvider",
              "exchange/currency selectors verify and disambiguate ticker collisions without mixing providers")
        check(collision.adjusted_history("DUP", exchange="NYSE", currency="INR") is None,
              "conflicting exchange/currency selectors fail closed")
        ny2 = os.path.join(td, "SecondNYSEProvider")
        os.makedirs(ny2)
        with open(os.path.join(ny2, "rows.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\n2026-06-01,DUP,99\n2026-06-02,DUP,101\n")
        with open(os.path.join(ny2, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({"DUP": {"kind": "equity", "exchange": "NYSE", "currency": "USD",
                               "price_basis": "split_adjusted"}}, f)
        conflicting = load_feed(td)
        check(conflicting.adjusted_history("DUP", exchange="NYSE", currency="USD") is None,
              "two providers for the same verified listing remain conflicting; they are never spliced")
        frozen_provider = conflicting.adjusted_history(
            "DUP", exchange="NYSE", currency="USD", provider="NYSEProvider", instrument_kind="equity")
        check(frozen_provider is not None and frozen_provider["provider"] == "NYSEProvider",
              "a frozen provider identity remains reproducible after another provider appears")

    with tempfile.TemporaryDirectory() as td:
        prov = os.path.join(td, "TerminalProvider")
        os.makedirs(prov)
        with open(os.path.join(prov, "rows.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close\n2026-06-01,OLD,100\n2026-06-01,BENCH,200\n")
        with open(os.path.join(prov, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({
                "OLD": {"kind": "equity", "exchange": "NYSE", "currency": "USD",
                        "benchmark": "BENCH", "price_basis": "split_adjusted", "security_status": "delisted",
                        "terminal_value": {"date": "2026-07-01", "price": 0,
                                           "source": "bankruptcy distribution notice"}},
                "BENCH": {"kind": "benchmark", "exchange": "INDEX", "currency": "USD",
                          "price_basis": "split_adjusted"},
            }, f)
        terminal_feed = load_feed(td)
        terminal_history = terminal_feed.adjusted_history(
            "OLD", provider="TerminalProvider", instrument_kind="equity")
        check(terminal_history is not None and terminal_history["as_of"][:10] == "2026-07-01" and
              terminal_history["points"][-1]["date"][:10] == "2026-06-01",
              "a source-bound terminal event advances history as-of without inventing a later price")

    with tempfile.TemporaryDirectory() as td:
        prov = os.path.join(td, "BasisConflict")
        os.makedirs(prov)
        with open(os.path.join(prov, "rows.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close,exchange,currency,price_basis\n")
            f.write("2026-06-01,BASIS,100,NYSE,USD,raw\n")
        with open(os.path.join(prov, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({"BASIS": {"kind": "equity", "exchange": "NYSE", "currency": "USD",
                                  "price_basis": "split_adjusted"}}, f)
        basis = load_feed(td)
        check(basis.adjusted_history("BASIS") is None,
              "row-level raw basis conflicting with provider metadata is never exported as adjusted")

    with tempfile.TemporaryDirectory() as td:
        prov = os.path.join(td, "SameProviderConflict")
        os.makedirs(prov)
        with open(os.path.join(prov, "a.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close,volume\n2026-06-01,CONFLICT,100,1000\n")
        with open(os.path.join(prov, "b.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close,volume\n2026-06-01,CONFLICT,101,1000\n")
        try:
            load_feed(td)
            check(False, "conflicting same-provider duplicate rows fail closed")
        except ValueError as exc:
            check("conflicting same-provider rows" in str(exc),
                  "conflicting same-provider duplicate rows fail closed")

    # The qualification evidence export consumes the SAME feed and proves that optional volume is not
    # merely documented then discarded. Use dates ending today so the freshness guard is deterministic.
    with tempfile.TemporaryDirectory() as td:
        prov = os.path.join(td, "EvidenceProvider")
        os.makedirs(prov)
        today = datetime.date.today()
        with open(os.path.join(prov, "market.csv"), "w", encoding="utf-8") as f:
            f.write("date,symbol,close,volume\n")
            for i in range(65):
                d = today - datetime.timedelta(days=64 - i)
                f.write(f"{d.isoformat()},IDEA,{100 + i * 0.5},{1000000 + i * 1000}\n")
                f.write(f"{d.isoformat()},IDEAINR,{1000 + i * 2},{500000 + i * 1000}\n")
                f.write(f"{d.isoformat()},IDEAINRGOOD,{1000 + i * 2},{500000 + i * 1000}\n")
                sparse_volume = 1000000 if i >= 12 else ""  # 53/60 in the fixed recent window
                f.write(f"{d.isoformat()},IDEASPARSE,{100 + i * 0.5},{sparse_volume}\n")
                f.write(f"{d.isoformat()},NON_EQUITY,{100 + i * 0.5},{1000000 + i * 1000}\n")
                future_d = d + datetime.timedelta(days=1)
                f.write(f"{future_d.isoformat()},IDEAFUTURE,{100 + i * 0.5},{1000000 + i * 1000}\n")
        with open(os.path.join(prov, "_symbols.json"), "w", encoding="utf-8") as f:
            json.dump({
                "IDEA": {"kind": "equity", "exchange": "NYSE", "currency": "USD",
                         "price_basis": "split_adjusted"},
                "IDEAINR": {"kind": "equity", "exchange": "NSE", "currency": "INR",
                            "price_basis": "split_adjusted", "usd_fx_pair": "INR/USD",
                            "usd_fx_rate": 0.012,
                            "usd_fx_as_of": (today + datetime.timedelta(days=1)).isoformat(),
                            "usd_fx_source": "Test reference rate"},
                "IDEAINRGOOD": {"kind": "equity", "exchange": "NSE", "currency": "INR",
                                "price_basis": "split_adjusted", "usd_fx_pair": "INR/USD",
                                "usd_fx_rate": 0.012, "usd_fx_as_of": today.isoformat(),
                                "usd_fx_source": "Test central-bank reference rate"},
                "IDEASPARSE": {"kind": "equity", "exchange": "NYSE", "currency": "USD",
                               "price_basis": "split_adjusted"},
                "NON_EQUITY": {"kind": "benchmark", "exchange": "INDEX", "currency": "USD",
                               "price_basis": "split_adjusted"},
                "IDEAFUTURE": {"kind": "equity", "exchange": "NYSE", "currency": "USD",
                               "price_basis": "split_adjusted"},
            }, f)
        evidence_feed = load_feed(td)
        ev = evidence_feed.idea_evidence("IDEA")
        check(ev["available"] is True and ev["quote"]["stale"] is False,
              "idea evidence has one current source-bound quote")
        check(ev["liquidity"]["lookback_days"] == 60 and ev["liquidity"]["observed_sessions"] == 60 and
              ev["liquidity"]["coverage_pct"] == 100.0 and ev["liquidity"]["median_daily_value_usd"] > 5_000_000,
              "the fixed 60-session window carries observed coverage and measured USD traded value")
        check(ev["liquidity"]["currency_conversion"] == {
                  "pair": "USD/USD", "rate_usd_per_currency": 1.0,
                  "as_of": today.isoformat() + "T00:00:00Z",
                  "source": "USD listing currency; identity conversion"},
              "USD identity conversion is explicit and fully auditable")
        check(ev["market_risk"]["lookback_days"] == 60 and ev["market_risk"]["ordinary_move_pct"] > 0,
              "ordinary move is the median absolute five-session return over 60 sessions")
        ev_inr = evidence_feed.idea_evidence("IDEAINR")
        check(ev_inr["available"] is False and any("INR/USD" in gap for gap in ev_inr["gaps"]),
              "non-USD liquidity fails closed when the source-bound FX conversion is future-dated")
        ev_inr_good = evidence_feed.idea_evidence("IDEAINRGOOD")
        fx = ev_inr_good["liquidity"]["currency_conversion"]
        check(ev_inr_good["available"] is True and fx["pair"] == "INR/USD" and
              fx["rate_usd_per_currency"] == 0.012 and fx["as_of"] == today.isoformat() + "T00:00:00Z" and
              fx["source"] == "Test central-bank reference rate",
              "non-USD liquidity carries source-bound FX pair, rate, as-of, and source")
        ev_sparse = evidence_feed.idea_evidence("IDEASPARSE")
        check(ev_sparse["available"] is False and ev_sparse["liquidity"] is None and
              any("53/60" in gap and "90%" in gap for gap in ev_sparse["gaps"]),
              "53/60 measured-volume sessions fail the fixed >=90% liquidity coverage rule")
        ev_non_equity = evidence_feed.idea_evidence("NON_EQUITY")
        check(ev_non_equity["available"] is False and any("instrument_kind_not_allowed" in gap
                                                            for gap in ev_non_equity["gaps"]),
              "idea evidence requires kind=equity even when a benchmark has adjusted prices and volume")
        ev_future = evidence_feed.idea_evidence("IDEAFUTURE")
        check(ev_future["available"] is False and any("future-dated" in gap for gap in ev_future["gaps"]) and
              ev_future["quote"]["as_of"][:10] == today.isoformat(),
              "future rows are excluded and cannot influence the quote or live assessment evidence")
        future_history = evidence_feed.adjusted_history("IDEAFUTURE")
        check(future_history["as_of"][:10] == today.isoformat() and
              future_history["excluded_future_sessions"] == 1 and
              all(p["date"][:10] <= today.isoformat() for p in future_history["points"]),
              "market-history export also excludes every future row and discloses the exclusion")

        run_root = os.path.join(td, "analyses", "IDEA_" + today.isoformat())
        os.makedirs(run_root)
        manifest = {
            "schema_version": "idea-projection-manifest/v1",
            "run_root": "analyses/IDEA_" + today.isoformat(),
            "created_at": _utc_now_rfc3339(),
            "artifacts": {},
        }
        manifest["manifest_sha256"] = hashlib.sha256(_canonical_json_bytes(manifest)).hexdigest()
        with open(os.path.join(run_root, "idea_projection_manifest.json"), "w", encoding="utf-8") as f:
            json.dump(manifest, f)
        frozen1 = write_idea_evidence_snapshot(evidence_feed, "IDEA", run_root)
        frozen2 = write_idea_evidence_snapshot(evidence_feed, "IDEA", run_root)
        with open(frozen2["path"], encoding="utf-8") as f:
            persisted = json.load(f)
        recalculated = hashlib.sha256(_canonical_json_bytes(persisted["evidence"])).hexdigest()
        check(frozen1["evidence_sha256"] == frozen2["evidence_sha256"] == recalculated and
              frozen1["snapshot"] == frozen2["snapshot"] == persisted and
              persisted["schema_version"] == "idea-market-evidence-snapshot/v1" and
              persisted["evidence_sha256"] == recalculated and persisted["captured_at"].endswith("Z"),
              "the first immutable evidence capture wins with a stable digest and capture time")
        try:
            write_idea_evidence_snapshot(evidence_feed, "IDEAINRGOOD", run_root)
            check(False, "a different listing cannot replace a run's first market capture")
        except ValueError as exc:
            check("will not be overwritten" in str(exc),
                  "a different listing cannot replace a run's first market capture")
        persisted["evidence"]["quote"]["price"] = 999
        with open(frozen2["path"], "w", encoding="utf-8") as f:
            json.dump(persisted, f)
        try:
            write_idea_evidence_snapshot(evidence_feed, "IDEA", run_root)
            check(False, "a corrupt first capture fails closed rather than being repaired in place")
        except ValueError as exc:
            check("will not be overwritten" in str(exc),
                  "a corrupt first capture fails closed rather than being repaired in place")

    print("[market_prices] selftest", "PASS" if ok else "FAIL")
    return ok


def main(argv):
    if "--selftest" in argv:
        return 0 if selftest() else 1
    feed = load_feed()

    def option(flag):
        if flag not in argv:
            return None
        try:
            value = argv[argv.index(flag) + 1]
        except IndexError:
            raise ValueError(f"{flag} requires a value")
        if value.startswith("--"):
            raise ValueError(f"{flag} requires a value")
        return value

    try:
        exchange = option("--exchange")
        currency = option("--currency")
        provider = option("--provider")
        role = option("--role")
    except ValueError as exc:
        print(json.dumps({"error": str(exc)}))
        return 2
    role_kind = {"security": "equity", "benchmark": "benchmark", "sector": "sector"}.get(role) if role else None
    if role is not None and role_kind is None:
        print(json.dumps({"error": "--role must be security, benchmark, or sector"}))
        return 2

    if "--write-idea-evidence" in argv:
        try:
            i = argv.index("--write-idea-evidence")
            symbol, run_root = argv[i + 1], argv[i + 2]
            if symbol.startswith("--") or run_root.startswith("--"):
                raise IndexError
        except (ValueError, IndexError):
            print(json.dumps({"error": "--write-idea-evidence requires TICKER RUN_ROOT"}))
            return 2
        try:
            written = write_idea_evidence_snapshot(feed, symbol, run_root, exchange, currency)
        except (OSError, ValueError) as exc:
            print(json.dumps({"error": str(exc), "symbol": symbol}, separators=(",", ":")))
            return 4
        print(json.dumps({"path": written["path"], "evidence_sha256": written["evidence_sha256"]},
                         separators=(",", ":"), allow_nan=False))
        return 0
    if "--history" in argv:
        try:
            symbol = argv[argv.index("--history") + 1]
        except (ValueError, IndexError):
            print(json.dumps({"error": "--history requires a symbol"}))
            return 2
        history, _, reason = feed._strict_history_selection(
            symbol, exchange, currency, provider=provider, instrument_kind=role_kind)
        if history is None:
            print(json.dumps({"error": "no unambiguous provider-bound, basis-qualified history for symbol",
                              "symbol": symbol, "exchange": exchange, "currency": currency,
                              "reason": reason}, separators=(",", ":")))
            return 3
        print(json.dumps(history, separators=(",", ":"), allow_nan=False))
        return 0
    if "--idea-evidence" in argv:
        try:
            symbol = argv[argv.index("--idea-evidence") + 1]
        except (ValueError, IndexError):
            print(json.dumps({"error": "--idea-evidence requires a symbol"}))
            return 2
        print(json.dumps(feed.idea_evidence(symbol, exchange, currency), separators=(",", ":"), allow_nan=False))
        return 0
    if not feed.available():
        print(f"No market feed present under {os.path.relpath(FEED_ROOT, REPO)}/ — "
              f"drop a provider folder with `date,symbol,close` CSVs to enable benchmark-adjusted scoring.")
        return 0
    print(f"Market feed: providers={feed.providers}; symbols={len(feed.symbols())}; as_of={feed.as_of()}; files={len(feed.files)}")
    if "--print" in argv:
        print(json.dumps({"providers": feed.providers, "symbols": feed.symbols(),
                          "as_of": feed.as_of(), "files": feed.files}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
