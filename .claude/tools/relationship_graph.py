"""relationship_graph.py — deterministic supply-chain graph from CIQ business-relationship exports.

The problem it solves: a Capital IQ "Suppliers" / "Customers" export is one of the richest documents a
pool ever receives — it names, with a source filing for each row, exactly who sells into the company and
who buys from it, with the counterparty's exchange ticker and GICS industry attached. Until now the
cockpit classified those workbooks as `other / low` and no orb was told they existed, so the single most
idea-dense file in the pool sat inert.

This module turns that workbook into a graph the rest of the engine can read WITHOUT an LLM:

  nodes        every named entity, with its listing, industry, and whether it belongs to the anchor's own
               group or is a genuine third party (derived from the export's own structure, not a guess)
  edges        one per disclosed relationship, carrying the exact filing that disclosed it and WHICH side
               disclosed it (a counterparty naming the anchor in its OWN filing is a materiality signal)
  counterparties  the third parties, with their order (2 = direct, 3 = one hop further out), the
               transmission mechanism, an explainable link-strength score, and the evidence that is MISSING
               before the link could ever be called an investment idea
  concentration   how much of the disclosed chain is intra-group — a related-party read (CLAUDE.md §13)
               that falls straight out of the same parse

CARDINAL RULES (inherited from ciq.py and CLAUDE.md):
  - Never invent. A relationship exists only if a row disclosed it; a ticker exists only if the export
    carried it. An unresolvable cell is UNAVAILABLE (None), never a plausible fill-in (§3, §5).
  - Carry the scope. These exports are "recently disclosed … within the last two years" and cover
    "current subsidiaries" — a partial view of the real supplier base. That caveat travels with the graph
    so no downstream reader mistakes it for a complete list (§3, §11).
  - Name the disclosing document. Every edge cites the filing named in the export's Source column (§5).
  - Direction is not asserted here. This layer states the mechanism and the gaps; whether that becomes a
    long, a short, or nothing at all is a judgment the anchor's own research verdict has to carry (§7).

Usage:  python3 relationship_graph.py <DATA_DIR> [--json]
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

from ciq import CiqFormat, CiqParseError, classify, read_sheets

Rows = list[list[Any]]

SCHEMA_VERSION = "relationship-graph/v1"

# The export's column set. Both orientations share every column except which side is named first, so one
# header signature recognises a Suppliers sheet and a Customers sheet alike.
_REQUIRED_HEADERS = ("entity", "relationship type", "source")
_NAME_HEADERS = ("supplier name", "customer name")

# CIQ writes UNAVAILABLE as a bare dash. Same contract as ciq.clean_num: never coerce it to a value.
_UNAVAILABLE = frozenset({"", "-", "—", "n/a", "na", "nm"})

# How much of a CIQ business description the sidecar keeps (the rest stays in the workbook extract).
_DESC_MAX = 400

# "Name (EXCH:SYMBOL)" — CIQ appends the primary listing to the display name of any listed entity.
_LISTING_IN_NAME = re.compile(r"^(?P<name>.+?)\s*\((?P<exch>[A-Za-z][A-Za-z0-9.]{1,12}):(?P<sym>[A-Za-z0-9.\-]{1,16})\)\s*$")
_LISTING_CELL = re.compile(r"^(?P<exch>[A-Za-z][A-Za-z0-9.]{1,12}):(?P<sym>[A-Za-z0-9.\-]{1,16})$")

# Rows 6-8 of a CIQ relationship export carry the view's own scope. They are the difference between "these
# are the suppliers" and "these are the suppliers disclosed somewhere in the last two years", so they are
# captured verbatim rather than dropped as chrome.
_SCOPE_PREFIXES = ("recently disclosed", "include suppliers for", "include customers for", "all disclosed", "relationship type:")

# A CIQ relationship export's FILENAME says what it is even when its bytes cannot be read as a spreadsheet
# — e.g. "Amazon com Inc NasdaqGS AMZN Customers.rtf". Mirrors the same naming heuristic `data-status.ts`
# uses to route these files to the reader in the first place, so a file this pattern matches but this
# module cannot parse gets a stated gap instead of silently becoming zero relationships (§3 — do not hide
# missing data).
_RELATIONSHIP_FILENAME = re.compile(r"suppliers?|customers?|relationship", re.I)
# …but the table's own section headings start with the same words and say nothing about scope.
_SCOPE_HEADINGS = frozenset({"recently disclosed suppliers", "recently disclosed customers", "suppliers", "customers"})

# CIQ exchange codes -> the country whose market the listing trades on. Only codes the engine has actually
# seen are listed; an unknown code resolves to None rather than a guess, because getting a counterparty's
# market wrong is worse than admitting the code is unmapped (§3).
_EXCHANGE_COUNTRY: dict[str, str] = {
    "NYSE": "United States", "NASDAQ": "United States", "NASDAQGS": "United States",
    "NASDAQCM": "United States", "NASDAQGM": "United States", "AMEX": "United States", "OTCPK": "United States",
    "SHSE": "China", "SZSE": "China", "SEHK": "Hong Kong",
    "TSE": "Japan", "TSEC": "Taiwan", "TPEX": "Taiwan",
    "KOSE": "South Korea", "KOSDAQ": "South Korea",
    "NSEI": "India", "BSE": "India",
    "LSE": "United Kingdom", "AIM": "United Kingdom",
    "ENXTPA": "France", "ENXTAM": "Netherlands", "ENXTBR": "Belgium", "ENXTLS": "Portugal",
    "XTRA": "Germany", "DB": "Germany", "BIT": "Italy", "BME": "Spain", "WBAG": "Austria",
    "SWX": "Switzerland", "OM": "Sweden", "HLSE": "Finland", "CPSE": "Denmark", "OB": "Norway",
    "TSX": "Canada", "TSXV": "Canada", "ASX": "Australia", "NZSE": "New Zealand",
    "SGX": "Singapore", "KLSE": "Malaysia", "SET": "Thailand", "IDX": "Indonesia", "HOSE": "Vietnam",
    "BMV": "Mexico", "BOVESPA": "Brazil", "BVL": "Peru", "BCBA": "Argentina",
    "TASE": "Israel", "IBSE": "Turkey", "DFM": "United Arab Emirates", "ADX": "United Arab Emirates",
    "SASE": "Saudi Arabia", "EGX": "Egypt", "JSE": "South Africa",
}

# Legal-form and generic corporate words carry no identity, so they are stripped before deciding whether
# a counterparty shares the anchor's brand. Geography is stripped too: "Qingdao" is a city that Bank of
# Qingdao and Qingdao Haier Multimedia both carry, and only one of them is a Haier entity.
_GENERIC_NAME_TOKENS = frozenset("""
co ltd limited inc incorporated llc llp plc corp corporation company group holding holdings gmbh ag sa
srl spa nv bv oyj ab as pte pvt private public international global worldwide industries industrial
technology technologies tech science sciences electronics electric electrical enterprise enterprises
trading trade commercial services service solutions systems products manufacturing mfg equipment
appliance appliances smart home the and of for a an de du la le el
""".split())

# Stripped for the same reason as the generic tokens above, kept separate so the list is auditable: these
# are places, not brands. A shared city is not evidence of a shared owner.
_GEO_NAME_TOKENS = frozenset("""
china chinese qingdao shandong beijing shanghai shenzhen guangdong chongqing jiangxi ningbo zhejiang
jiangsu hong kong taiwan japan japanese korea korean india indian italia italy italian france french
germany german spain spanish uk gb britain british england america american usa us canada canadian
australia australian zealand nz singapore malaysia thailand vietnam indonesia mexico mexican brazil
brasil pakistan bangladesh egypt turkey russia poland netherlands belgium sweden norway denmark finland
asia europe european africa pacific
""".split())

# The relationship roles CIQ emits, mapped to how the link actually transmits economics. `operating` roles
# move with the anchor's volumes; `financing` and `other` do not, and are never dressed up as if they did.
_ROLE_KINDS: dict[str, str] = {
    "supplier": "operating",
    "vendor": "operating",
    "customer": "operating",
    "distributor": "operating",
    "reseller": "operating",
    "creditor": "financing",
    "lender": "financing",
    "investor": "financing",
    "landlord": "other",
    "tenant": "other",
    "licensor": "other",
    "licensee": "other",
    "franchisor": "other",
    "franchisee": "other",
    "strategic alliance": "other",
    "joint venture": "other",
    "partner": "other",
}

# One sentence per role, written for a reader who has never worked in finance (§21). `{cp}` is the
# counterparty, `{side}` the anchor-group entity actually named in the row.
#
# Every sentence is CONDITIONAL on purpose. The export proves the relationship exists; it never says how
# big it is. "X sells into Y, so Y's volumes drive X's revenue" would be an unearned causal claim — it is
# only true if those sales are material to X, and the export is silent on that. Writing the condition into
# the sentence keeps the reader honest about what has actually been shown (§3, §5) and keeps the wording
# right even where CIQ's role label sits oddly on the business (a factoring house tagged "Supplier").
# The subject is implied: every place this sentence is shown or cited already names the counterparty on
# the same row, and repeating a long legal name three times in two sentences is unreadable (§21).
_MECHANISM: dict[str, str] = {
    "supplier": "Sells into {side}. If {anchor_short} is a meaningful share of what it sells, then {anchor_short}'s volumes and the prices it agrees flow straight into this company's revenue and margin. The export does not say how large the relationship is.",
    "vendor": "Sells into {side}. If {anchor_short} is a meaningful share of what it sells, then {anchor_short}'s volumes and the prices it agrees flow straight into this company's revenue and margin. The export does not say how large the relationship is.",
    "customer": "Buys from {side}. If it is a meaningful share of what {anchor_short} sells, its own demand is part of what {anchor_short} earns. The export does not say how large the relationship is.",
    "distributor": "Resells {anchor_short}'s products. If it carries a meaningful share of the range, what it chooses to stock moves {anchor_short}'s volume, and {anchor_short}'s range moves its own sales mix. The export does not say how large the relationship is.",
    "reseller": "Resells {anchor_short}'s products. If it carries a meaningful share of the range, what it chooses to stock moves {anchor_short}'s volume, and {anchor_short}'s range moves its own sales mix. The export does not say how large the relationship is.",
    "creditor": "Lends to {side}. That is a credit link, not a trading one — {anchor_short} selling more does not by itself earn it anything.",
    "lender": "Lends to {side}. That is a credit link, not a trading one — {anchor_short} selling more does not by itself earn it anything.",
    "investor": "Holds an investment in {side}. That is an ownership link, not a trading one.",
}
_MECHANISM_FALLBACK = "Disclosed as a {role} of {side}. The export does not say how money moves between them, so the link is recorded but not read as a trading one."

# Trailing legal-form words trimmed from the anchor's display name so the generated sentences read like
# English ("Haier Smart Home", not "Haier Smart Home Co.").
_TRAILING_LEGAL_FORM = re.compile(r"[\s,.]*\b(?:co|inc|ltd|limited|corp|corporation|plc|llc|llp|sa|srl|spa|nv|bv|ag|gmbh|group|holdings?)\b[\s,.]*$", re.I)


class RelationshipParseWarning(str):
    """A non-fatal note attached to the graph (a skipped sheet, an unreadable file)."""


# --------------------------------------------------------------------------------------------------
# cell / name helpers
# --------------------------------------------------------------------------------------------------

def _text(cell: Any) -> str:
    """A cell as trimmed, newline-collapsed text. CIQ pads Entity cells with embedded newlines."""
    if cell is None:
        return ""
    return re.sub(r"\s+", " ", str(cell)).strip()


def _available(cell: Any) -> str | None:
    """Trimmed text, or None when the cell is one of CIQ's UNAVAILABLE markers — never coerced."""
    s = _text(cell)
    return None if s.lower() in _UNAVAILABLE else s


def node_id(name: str) -> str:
    """Stable identity for an entity name: lower-cased, punctuation-stripped, whitespace-collapsed.

    Deliberately conservative — it folds "Qingdao Haier International Trade Co. Ltd" and "Qingdao Haier
    International Trade Co., Ltd" onto one node (a real CIQ spelling drift) without ever folding two
    genuinely different companies together.
    """
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    # A name written entirely in a non-Latin script (Chinese, Arabic, Korean, …) has no [a-z0-9] to keep,
    # so the ASCII fold above yields "". Collapsing every such name onto one "unnamed" node would silently
    # merge genuinely different companies — the exact §27 failure (non-English is first-class, not a gap).
    # Fall back to a stable hash of the normalised original so distinct non-Latin names stay distinct
    # without inventing any Latin text for them.
    if s:
        return s
    folded = " ".join(name.strip().lower().split())
    return "x-" + hashlib.sha1(folded.encode("utf-8")).hexdigest()[:12] if folded else "unnamed"


def split_listing(display_name: str, listing_cell: Any) -> tuple[str, str | None, str | None, str | None]:
    """(clean name, listing, exchange, symbol) from CIQ's display name + its Exchange:Ticker column.

    The dedicated column wins when it carries a listing; the parenthesised suffix on the name is the
    fallback (CIQ omits the column for a row whose listing it only shows inline). A name with no listing
    anywhere yields None — an unlisted counterparty is a real, honest outcome, not a lookup to guess at.
    """
    name = _text(display_name)
    exch = sym = None
    m = _LISTING_IN_NAME.match(name)
    if m:
        name = m.group("name").strip()
        exch, sym = m.group("exch").upper(), m.group("sym").upper()
    cell = _available(listing_cell)
    if cell:
        cm = _LISTING_CELL.match(cell)
        if cm:
            exch, sym = cm.group("exch").upper(), cm.group("sym").upper()
    listing = f"{exch}:{sym}" if exch and sym else None
    return name, listing, exch, sym


def short_name(name: str) -> str:
    """A company's readable short name: listing suffix and trailing legal form removed, repeatedly.

    Used only for generated prose. The full name is what every citation and node keeps.
    """
    s = _text(name).split(" (")[0]
    for _ in range(3):
        trimmed = _TRAILING_LEGAL_FORM.sub("", s).strip()
        if trimmed == s or not trimmed:
            break
        s = trimmed
    return s or _text(name)


def name_tokens(name: str) -> set[str]:
    """The identity-bearing words of a name: legal form, generic corporate nouns, and geography removed."""
    words = re.findall(r"[a-z0-9]+", name.lower())
    return {w for w in words if len(w) > 2 and w not in _GENERIC_NAME_TOKENS and w not in _GEO_NAME_TOKENS}


# --------------------------------------------------------------------------------------------------
# sheet recognition
# --------------------------------------------------------------------------------------------------

def find_header(rows: Rows) -> tuple[int, dict[str, int]] | None:
    """Locate the relationship table's header row and map each known column to its index.

    Recognises on COLUMN NAMES, never on row position: CIQ shifts the table up or down depending on how
    many scope lines the view carries, and a position-based reader silently returns nothing when it does.
    """
    for i, row in enumerate(rows[:40]):
        labels = {_text(c).lower(): j for j, c in enumerate(row) if _text(c)}
        if not any(h in labels for h in _NAME_HEADERS):
            continue
        if not all(h in labels for h in _REQUIRED_HEADERS):
            continue
        cols = {
            "supplier": labels.get("supplier name"),
            "customer": labels.get("customer name"),
            "listing": labels.get("exchange:ticker symbol", labels.get("exchange:ticker")),
            "entity": labels.get("entity"),
            "role": labels.get("relationship type"),
            "industry": labels.get("primary industry"),
            "source": labels.get("source"),
            "description": labels.get("business description"),
        }
        if cols["supplier"] is None or cols["customer"] is None:
            continue
        return i, {k: v for k, v in cols.items() if v is not None}
    return None


def sheet_orientation(rows: Rows, header_idx: int, cols: dict[str, int]) -> str | None:
    """'suppliers' or 'customers' — which side of the table the COUNTERPARTY sits on.

    Read from the view title ("… > Suppliers") when present, because that is the export's own statement
    of what it is. Falls back to column order: CIQ always prints the counterparty column first.
    """
    for row in rows[:header_idx]:
        for cell in row:
            t = _text(cell).lower()
            if t.endswith("> suppliers") or t == "suppliers" or t == "recently disclosed suppliers":
                return "suppliers"
            if t.endswith("> customers") or t == "customers" or t == "recently disclosed customers":
                return "customers"
    if cols.get("supplier") is not None and cols.get("customer") is not None:
        return "suppliers" if cols["supplier"] < cols["customer"] else "customers"
    return None


def read_anchor(rows: Rows, header_idx: int) -> tuple[str | None, str | None]:
    """(anchor display name, listing) from the view title row — "Haier Smart Home Co., Ltd. (SHSE:600690) > Suppliers"."""
    for row in rows[:header_idx]:
        for cell in row:
            t = _text(cell)
            if ">" in t and re.search(r">\s*(suppliers|customers)\s*$", t, re.I):
                head = t.split(">")[0].strip()
                name, listing, _, _ = split_listing(head, None)
                return name or None, listing
    return None, None


def read_scope_notes(rows: Rows, header_idx: int) -> list[str]:
    """The view's own scope lines, verbatim. These bound every claim the graph can support."""
    out: list[str] = []
    for row in rows[:header_idx]:
        for cell in row:
            t = _text(cell)
            low = t.lower()
            if t and low.startswith(_SCOPE_PREFIXES) and low not in _SCOPE_HEADINGS and t not in out:
                out.append(t)
    return out


# --------------------------------------------------------------------------------------------------
# graph construction
# --------------------------------------------------------------------------------------------------

class GraphBuilder:
    """Accumulates nodes and edges across every relationship sheet found in one pool."""

    def __init__(self) -> None:
        self.nodes: dict[str, dict[str, Any]] = {}
        self.edges: list[dict[str, Any]] = []
        self.sources: list[dict[str, Any]] = []
        self.warnings: list[str] = []
        self.anchor_id: str | None = None
        self.anchor_name: str | None = None
        self.anchor_listing: str | None = None

    # -- nodes ------------------------------------------------------------------------------------
    def touch(self, display_name: str, listing_cell: Any = None, **attrs: Any) -> str | None:
        name, listing, exch, sym = split_listing(display_name, listing_cell)
        if not name:
            return None
        nid = node_id(name)
        node = self.nodes.get(nid)
        if node is None:
            node = {
                "node_id": nid, "name": name, "listing": None, "exchange": None, "symbol": None,
                "industry": None, "description": None,
                "on_anchor_side": False, "on_counterparty_side": False, "roles": [],
            }
            self.nodes[nid] = node
        # A listing, industry, or description seen on ANY row for this entity is kept: CIQ prints the
        # richer attributes on the row where the entity is the subject and leaves them blank elsewhere.
        if listing and not node["listing"]:
            node["listing"], node["exchange"], node["symbol"] = listing, exch, sym
        for key in ("industry", "description"):
            val = attrs.get(key)
            if val and not node[key]:
                # CIQ business descriptions run to a thousand characters. The first couple of sentences
                # are what identifies the business; the full text stays in the workbook extract every orb
                # already reads, so the sidecar keeps a lead-in rather than a second copy of the corpus.
                node[key] = val if key != "description" or len(val) <= _DESC_MAX else val[:_DESC_MAX].rstrip() + "…"
        return nid

    # -- sheets -----------------------------------------------------------------------------------
    def add_sheet(self, file_name: str, pool_rel: str, sheet_name: str, rows: Rows) -> bool:
        found = find_header(rows)
        if not found:
            return False
        header_idx, cols = found
        orientation = sheet_orientation(rows, header_idx, cols)
        if orientation not in ("suppliers", "customers"):
            self.warnings.append(f"{pool_rel} [{sheet_name}]: relationship table found but its direction could not be read; skipped.")
            return False
        anchor_name, anchor_listing = read_anchor(rows, header_idx)
        if anchor_name and not self.anchor_name:
            self.anchor_name, self.anchor_listing = anchor_name, anchor_listing
            self.anchor_id = node_id(anchor_name)
        elif anchor_name and self.anchor_name and node_id(anchor_name) != self.anchor_id:
            # A pool's external/ subtree may hold a relationship workbook for a DIFFERENT company. Merging
            # its rows into this anchor's graph would attribute another issuer's suppliers/customers to the
            # anchor and let the Ideas lane publish unsupported counterparties (§3). Reject the foreign sheet.
            self.warnings.append(
                f"{pool_rel} [{sheet_name}]: relationship table names a different anchor "
                f"({anchor_name!r}, not {self.anchor_name!r}); skipped to avoid cross-company merge."
            )
            return False
        # In a Suppliers view the counterparty is the supplier and the anchor-group entity is the
        # customer; a Customers view is the exact mirror.
        cp_col = cols["supplier"] if orientation == "suppliers" else cols["customer"]
        side_col = cols["customer"] if orientation == "suppliers" else cols["supplier"]

        row_count = 0
        for r in range(header_idx + 1, len(rows)):
            row = rows[r]
            cp_display = _text(row[cp_col]) if cp_col < len(row) else ""
            side_display = _text(row[side_col]) if side_col < len(row) else ""
            if not cp_display or not side_display:
                continue
            if cp_display.startswith("*"):  # the "*denotes proprietary relationship" footer
                continue
            role_raw = _text(row[cols["role"]]) if "role" in cols and cols["role"] < len(row) else ""
            entity_raw = _text(row[cols["entity"]]) if "entity" in cols and cols["entity"] < len(row) else ""
            source_ref = _available(row[cols["source"]]) if "source" in cols and cols["source"] < len(row) else None
            industry = _available(row[cols["industry"]]) if "industry" in cols and cols["industry"] < len(row) else None
            desc = _available(row[cols["description"]]) if "description" in cols and cols["description"] < len(row) else None
            if desc and desc.lower().startswith("there is no business description"):
                desc = None

            cp_id = self.touch(cp_display, row[cols["listing"]] if "listing" in cols and cols["listing"] < len(row) else None,
                               industry=industry, description=desc)
            side_id = self.touch(side_display)
            if not cp_id or not side_id or cp_id == side_id:
                continue
            role = role_raw.lower().strip() or ("supplier" if orientation == "suppliers" else "customer")
            self.nodes[cp_id]["on_counterparty_side"] = True
            # The anchor-side column of a relationship export is, by the export's own definition, the
            # anchor or one of its current subsidiaries. That is hard structural evidence of group
            # membership — far stronger than any name heuristic, and it is what keeps a wholly-owned
            # sales subsidiary from ever being surfaced as a "second-order idea".
            self.nodes[side_id]["on_anchor_side"] = True
            if role not in self.nodes[cp_id]["roles"]:
                self.nodes[cp_id]["roles"].append(role)
            self.edges.append({
                "edge_id": f"{cp_id}->{side_id}:{role.replace(' ', '-')}",
                "counterparty": cp_id,
                "anchor_side": side_id,
                "role": role,
                "role_kind": _ROLE_KINDS.get(role, "other"),
                "orientation": orientation,
                "anchor_side_entity": "self" if entity_raw.lower().startswith("self") else "subsidiary" if entity_raw else None,
                "disclosed_by": self._disclosed_by(source_ref, cp_display, side_display),
                "source_ref": source_ref,
                "source_file": pool_rel,
                "source_sheet": sheet_name,
                "source_row": r + 1,
            })
            row_count += 1

        self.sources.append({
            "file": file_name, "path": pool_rel, "sheet": sheet_name,
            "orientation": orientation, "rows": row_count,
            "anchor_named": anchor_name, "anchor_listing": anchor_listing,
            "scope_notes": read_scope_notes(rows, header_idx),
        })
        return True

    def _disclosed_by(self, source_ref: str | None, cp_display: str, side_display: str) -> str | None:
        """Which side's filing disclosed the relationship.

        This is the single most informative field in the export and it is free: CIQ names the document the
        relationship came from. When that document is the COUNTERPARTY's own filing, the counterparty
        considered the relationship material enough to name in its own accounts — a materiality signal
        about the link that the anchor's filing cannot give. Compared on identity tokens so a "… 2024 Form
        Doc" suffix or a punctuation drift does not break the match.

        The anchor-group side is matched against BOTH the entity named in the row and the anchor itself:
        a subsidiary's supplier relationship is routinely disclosed in the PARENT's filing, and comparing
        only against the subsidiary's name would leave that row looking undisclosed by anyone.
        """
        if not source_ref:
            return None
        src = name_tokens(source_ref)
        if not src:
            return None
        cp = name_tokens(split_listing(cp_display, None)[0])
        side = name_tokens(split_listing(side_display, None)[0])
        anchor = name_tokens(self.anchor_name) if self.anchor_name else set()
        cp_hit = bool(cp) and cp <= src
        side_hit = (bool(side) and side <= src) or (bool(anchor) and anchor <= src)
        if cp_hit and not side_hit:
            return "counterparty"
        if side_hit and not cp_hit:
            return "anchor_group"
        return None


# --------------------------------------------------------------------------------------------------
# affiliation, ordering, scoring
# --------------------------------------------------------------------------------------------------

def brand_tokens(builder: GraphBuilder) -> set[str]:
    """The anchor group's distinctive name words, learned from entities PROVEN to be in the group.

    Two admissible sources, both evidence rather than inference: a word in the anchor's OWN name, and a
    word shared by two or more entities the export itself placed on the anchor's side. Legal forms,
    generic corporate nouns, and place names are already stripped, so what survives is the brand — for
    "Haier Smart Home Co., Ltd." that is `haier`, not `smart`, `home`, or `qingdao`.
    """
    if not builder.nodes:
        return set()
    anchor_own = name_tokens(builder.anchor_name) if builder.anchor_name else set()
    group_counts: dict[str, int] = {}
    for node in builder.nodes.values():
        if node["on_anchor_side"]:
            for tok in name_tokens(node["name"]):
                group_counts[tok] = group_counts.get(tok, 0) + 1
    shared_in_group = {t for t, n in group_counts.items() if n >= 2}
    return anchor_own | shared_in_group


def classify_affiliation(builder: GraphBuilder) -> None:
    """Tag every node `anchor` / `group` / `likely_group` / `third_party`, with the basis stated.

    Only `third_party` can ever become an idea. `likely_group` is the honest middle: a name-token match is
    suggestive, not proof, so those entities are counted in the related-party read and withheld from the
    idea lane rather than being silently promoted or silently dropped.
    """
    brands = brand_tokens(builder)
    for nid, node in builder.nodes.items():
        if nid == builder.anchor_id:
            node["affiliation"] = "anchor"
            node["affiliation_basis"] = "the company this pool is about"
            continue
        if node["on_anchor_side"]:
            node["affiliation"] = "group"
            node["affiliation_basis"] = "named on the anchor's own side of a disclosed relationship, so the export places it inside the group"
            continue
        shared = sorted(name_tokens(node["name"]) & brands)
        if shared:
            node["affiliation"] = "likely_group"
            node["affiliation_basis"] = f"shares the group's name ({', '.join(shared)}) but never appears on the anchor's side of a disclosed row — treated as related until a filing says otherwise"
            continue
        node["affiliation"] = "third_party"
        node["affiliation_basis"] = "never appears on the anchor's side of a disclosed relationship and does not share the group's name"


def assign_orders(builder: GraphBuilder) -> dict[str, int]:
    """Hops from the anchor GROUP, counting only third parties as steps.

    Order 1 is the anchor and everything the export PROVED is consolidated into it. Order 2 is a third
    party that deals with the group directly. Order 3 is a third party that reaches the group only
    through another third party — which needs that other party's own relationship export in the pool, so
    a real order-3 chain appears the moment the data to prove it does, and never before.

    A `likely_group` entity is deliberately NOT seeded as order 1: the group claim rests on a shared name,
    not on the export's structure, so counting hops through it would spread an unproven assumption into
    every node behind it.
    """
    order: dict[str, int] = {}
    for nid, node in builder.nodes.items():
        if node["affiliation"] in ("anchor", "group"):
            order[nid] = 1
    adjacency: dict[str, set[str]] = {}
    for e in builder.edges:
        adjacency.setdefault(e["counterparty"], set()).add(e["anchor_side"])
        adjacency.setdefault(e["anchor_side"], set()).add(e["counterparty"])
    frontier = set(order)
    depth = 1
    while frontier and depth < 6:
        depth += 1
        nxt: set[str] = set()
        for nid in frontier:
            for peer in adjacency.get(nid, ()):  # noqa: B007
                if peer not in order:
                    order[peer] = depth
                    nxt.add(peer)
        frontier = nxt
    return order


# Link-strength components. Each is a stated, checkable fact about the LINK — never a view on the
# counterparty's own business, which this layer has no evidence about (§12: every score explainable from
# evidence rows). It measures how well EVIDENCED and how DIRECT the connection is, nothing else: a
# perfect 100 means "a listed company named this anchor in its own filing as a direct operating
# counterparty, more than once", not "a good investment".
_SCORE_DISCLOSED_BY = {"counterparty": 30, "anchor_group": 15, None: 4}
_SCORE_ORDER = {2: 24, 3: 10}
_SCORE_SIDE = {"self": 14, "subsidiary": 9, None: 7}
_SCORE_ROLE_KIND = {"operating": 14, "financing": 0, "other": 4}
_SCORE_LISTED = 14
_SCORE_CORROBORATION_PER_EXTRA_ROW = 4
_SCORE_CORROBORATION_MAX = 8


def build_counterparties(builder: GraphBuilder, order: dict[str, int]) -> list[dict[str, Any]]:
    """The counterparty ledger: one row per outside party, with its strongest link, strength, and gaps."""
    anchor_short = short_name(builder.anchor_name or "the company")
    by_cp: dict[str, list[dict[str, Any]]] = {}
    for e in builder.edges:
        by_cp.setdefault(e["counterparty"], []).append(e)

    out: list[dict[str, Any]] = []
    for nid, node in builder.nodes.items():
        # `likely_group` rows stay in the ledger rather than being deleted: withholding an entity because
        # of a name match, silently, is how a real counterparty disappears. It is carried with its
        # affiliation, a hard score cap, and the gap that would resolve it.
        if node["affiliation"] not in ("third_party", "likely_group"):
            continue
        links = by_cp.get(nid, [])
        if not links:
            continue
        hops = order.get(nid, 2)
        # The strongest disclosed link leads the card: an operating role beats a financing one, a
        # counterparty-disclosed row beats an anchor-disclosed one, and a link to the listed parent beats
        # a link to a subsidiary.
        def link_rank(e: dict[str, Any]) -> tuple[int, int, int]:
            return (
                _SCORE_ROLE_KIND.get(e["role_kind"], 0),
                _SCORE_DISCLOSED_BY.get(e["disclosed_by"], 0),
                _SCORE_SIDE.get(e["anchor_side_entity"], 0),
            )
        primary = max(links, key=link_rank)
        side_name = builder.nodes[primary["anchor_side"]]["name"]
        template = _MECHANISM.get(primary["role"], _MECHANISM_FALLBACK)
        # Short names in the prose, full names everywhere a claim is anchored: a sentence that repeats
        # "Co., Ltd." three times is not readable, and readability is a rule here too (§21).
        mechanism = template.format(
            cp=short_name(node["name"]), side=short_name(side_name),
            anchor_short=anchor_short, role=primary["role"],
        )

        listed = bool(node["listing"])
        components = {
            "disclosure_side": _SCORE_DISCLOSED_BY.get(primary["disclosed_by"], 0),
            "directness": _SCORE_ORDER.get(hops, 6),
            "anchor_side": _SCORE_SIDE.get(primary["anchor_side_entity"], 0),
            "role_kind": _SCORE_ROLE_KIND.get(primary["role_kind"], 0),
            "investability": _SCORE_LISTED if listed else 0,
            "corroboration": min(_SCORE_CORROBORATION_MAX, (len(links) - 1) * _SCORE_CORROBORATION_PER_EXTRA_ROW),
        }
        raw = min(100, sum(components.values()))

        gaps: list[str] = []
        if not listed:
            gaps.append("the export names no listed security for this counterparty — as it stands there is nothing to buy or sell")
        if primary["role_kind"] == "operating":
            gaps.append(f"how much of {short_name(node['name'])}'s revenue {anchor_short} actually accounts for is not disclosed here")
            gaps.append("whether the relationship is contracted, sole-source, or easily switched is not disclosed here")
        if primary["role_kind"] == "financing":
            gaps.append("a lending relationship does not move with the anchor's volumes — treat it as credit exposure, not a trade")
        if not primary["disclosed_by"]:
            gaps.append("the export does not make clear whose filing disclosed the relationship")
        if node["affiliation"] == "likely_group":
            gaps.append("this name shares the anchor group's brand — confirm from a filing that it is a genuine outside party before treating it as an idea")

        # Caps, applied after the components so the reason for a low score is always visible. An
        # unlisted, non-operating, or possibly-related link is a map entry, not a lead, and is scored so
        # it can never sort above a genuinely investable one.
        cap = 100
        cap_reason = None
        if node["affiliation"] == "likely_group":
            cap, cap_reason = 20, "may be part of the anchor's own group"
        elif not listed:
            cap, cap_reason = 25, "the export names no listing for it"
        elif primary["role_kind"] != "operating":
            cap, cap_reason = 45, f"the disclosed link is {primary['role_kind']}, not operating"
        score = min(raw, cap)

        out.append({
            "node_id": nid,
            "name": node["name"],
            "affiliation": node["affiliation"],
            "listing": node["listing"],
            "exchange": node["exchange"],
            "symbol": node["symbol"],
            "country": _EXCHANGE_COUNTRY.get(node["exchange"] or "") or None,
            "industry": node["industry"],
            "description": node["description"],
            "order": hops,
            "role": primary["role"],
            "role_kind": primary["role_kind"],
            "orientation": primary["orientation"],
            "anchor_side_entity_id": primary["anchor_side"],
            "anchor_side_entity": side_name,
            "anchor_side_relation": primary["anchor_side_entity"],
            "disclosed_by": primary["disclosed_by"],
            "source_ref": primary["source_ref"],
            "source_file": primary["source_file"],
            "source_sheet": primary["source_sheet"],
            "mechanism": mechanism,
            "link_strength": score,
            "link_strength_components": components,
            "link_strength_cap": None if cap == 100 else cap,
            "link_strength_cap_reason": cap_reason,
            "evidence_gaps": gaps,
            "link_count": len(links),
            "all_roles": sorted({e["role"] for e in links}),
        })

    out.sort(key=lambda c: (-c["link_strength"], c["order"], c["name"]))
    return out


def industry_clusters(counterparties: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Industries with more than one disclosed third-party counterparty.

    A cluster is an INDUSTRY-level read, never a ticker: two disclosed suppliers in one sub-industry says
    something about where the anchor's spend concentrates, and that is a lead worth following into the
    rest of that industry — but naming companies the export never named would be inventing evidence.
    """
    buckets: dict[str, list[dict[str, Any]]] = {}
    for c in counterparties:
        if c["industry"]:
            buckets.setdefault(c["industry"], []).append(c)
    out = [
        {
            "industry": ind,
            "counterparty_count": len(rows),
            "listed_count": sum(1 for r in rows if r["listing"]),
            # How much of the cluster is genuinely outside the group. A cluster that is all related
            # parties says something about the group's structure, not about an addressable market.
            "third_party_count": sum(1 for r in rows if r["affiliation"] == "third_party"),
            "counterparties": [r["name"] for r in rows],
            "roles": sorted({r["role"] for r in rows}),
        }
        for ind, rows in buckets.items() if len(rows) > 1
    ]
    out.sort(key=lambda x: (-x["third_party_count"], -x["counterparty_count"], x["industry"]))
    return out


def concentration(builder: GraphBuilder, counterparties: list[dict[str, Any]]) -> dict[str, Any]:
    """The related-party read that falls out of the same parse (CLAUDE.md §13, §24 filter 6).

    When most of a company's disclosed trading relationships are with entities inside its own group, the
    export is telling you something about governance and about how little of the chain is arm's-length —
    which matters whether or not a single idea ever comes out of it.
    """
    kinds = {"anchor": 0, "group": 0, "likely_group": 0, "third_party": 0}
    for node in builder.nodes.values():
        kinds[node.get("affiliation", "third_party")] = kinds.get(node.get("affiliation", "third_party"), 0) + 1
    related = kinds["group"] + kinds["likely_group"]
    named = related + kinds["third_party"]
    # `likely_group` is only a shared-name heuristic (ownership never proven), so it must NOT be counted as
    # definitively "inside the group" — the UI prints intragroup_row_share_pct as fact (§3). Keep the share
    # to PROVEN group rows (anchor/group) and report suspected name-matches separately.
    intragroup_rows = sum(
        1 for e in builder.edges
        if builder.nodes[e["counterparty"]].get("affiliation") in ("anchor", "group")
    )
    likely_group_rows = sum(
        1 for e in builder.edges
        if builder.nodes[e["counterparty"]].get("affiliation") == "likely_group"
    )
    listed = [c for c in counterparties if c["listing"] and c["affiliation"] == "third_party"]
    return {
        "relationship_rows": len(builder.edges),
        "intragroup_rows": intragroup_rows,
        "likely_group_rows": likely_group_rows,
        "intragroup_row_share_pct": round(100 * intragroup_rows / len(builder.edges), 1) if builder.edges else None,
        "named_entities": named,
        "group_entities": kinds["group"],
        "likely_group_entities": kinds["likely_group"],
        "third_party_entities": kinds["third_party"],
        "listed_third_parties": len(listed),
        "listed_suppliers": sum(1 for c in listed if c["orientation"] == "suppliers"),
        "listed_customers": sum(1 for c in listed if c["orientation"] == "customers"),
        "exchanges": sorted({c["exchange"] for c in listed if c["exchange"]}),
    }


# --------------------------------------------------------------------------------------------------
# entry point
# --------------------------------------------------------------------------------------------------

def _pool_files(data_path: Path) -> list[Path]:
    """Every spreadsheet in the pool, including external/ drops, newest last for stable ordering.

    Also picks up `.rtf` files whose NAME looks like a relationship export (CIQ sometimes saves these as
    Suppliers/Customers.rtf rather than a workbook). This module has no RTF table reader — see the
    unsupported-format warning in `build_graph` — but the file still has to reach that check to produce
    one; dropped here, it would silently become an empty graph with no error (§3, §20 bad extraction)."""
    out: list[Path] = []
    for p in sorted(data_path.rglob("*")):
        if not p.is_file() or p.name.startswith("."):
            continue
        suffix = p.suffix.lower()
        if suffix in (".xls", ".xlsx", ".xlsm"):
            out.append(p)
        elif suffix == ".rtf" and _RELATIONSHIP_FILENAME.search(p.stem):
            out.append(p)
    return out


def build_graph(data_path: Path, ticker: str) -> dict[str, Any]:
    """Parse every relationship export in one pool into the graph document. Never raises on bad input."""
    builder = GraphBuilder()
    for path in _pool_files(data_path):
        rel = str(path.relative_to(data_path))
        try:
            fmt = classify(path)
            if fmt not in (CiqFormat.BIFF_XLS, CiqFormat.OOXML):
                # No table reader exists for this format (RTF text, PDF, HTML, …). A file whose NAME says
                # it is a relationship export gets a stated gap rather than silently contributing zero
                # rows — the difference between "no relationship export was provided" and "one was
                # provided and this tool could not read it" matters to data sufficiency (§11, §20).
                if _RELATIONSHIP_FILENAME.search(path.stem):
                    builder.warnings.append(
                        f"{rel}: looks like a relationship export but is in an unsupported format "
                        f"({fmt.value}) — no table reader for this format is implemented, so it was NOT "
                        f"parsed; treat this as a missing export, not zero disclosed relationships."
                    )
                continue
            sheets = read_sheets(path, fmt)
        except (CiqParseError, OSError, ValueError) as exc:
            builder.warnings.append(f"{rel}: not readable as a workbook ({type(exc).__name__}); skipped.")
            continue
        except Exception as exc:  # noqa: BLE001 — one bad workbook must never lose the rest of the pool
            builder.warnings.append(f"{rel}: unreadable ({type(exc).__name__}: {exc}); skipped.")
            continue
        for sheet_name, rows in sheets.items():
            try:
                builder.add_sheet(path.name, rel, sheet_name, rows)
            except Exception as exc:  # noqa: BLE001
                builder.warnings.append(f"{rel} [{sheet_name}]: relationship parse failed ({type(exc).__name__}: {exc}).")

    classify_affiliation(builder)
    order = assign_orders(builder)
    counterparties = build_counterparties(builder, order)
    scope_notes: list[str] = []
    for s in builder.sources:
        for note in s["scope_notes"]:
            if note not in scope_notes:
                scope_notes.append(note)

    nodes = []
    for nid, node in builder.nodes.items():
        nodes.append({**{k: v for k, v in node.items() if k not in ("on_anchor_side", "on_counterparty_side")},
                      "order": order.get(nid)})
    nodes.sort(key=lambda n: (n.get("order") or 9, n["name"]))

    return {
        "schema_version": SCHEMA_VERSION,
        "generated_by": "relationship_graph.py",
        "ticker": ticker,
        "anchor": {
            "name": builder.anchor_name,
            "listing": builder.anchor_listing,
            "node_id": builder.anchor_id,
        },
        "sources": builder.sources,
        "scope_notes": scope_notes,
        "nodes": nodes,
        "edges": builder.edges,
        "counterparties": counterparties,
        "industry_clusters": industry_clusters(counterparties),
        "concentration": concentration(builder, counterparties),
        "warnings": builder.warnings,
    }


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: relationship_graph.py <DATA_DIR> [--json]", file=sys.stderr)
        return 2
    data_path = Path(argv[1]).expanduser().resolve()
    if not data_path.is_dir():
        print(f"relationship_graph.py: {data_path} is not a directory", file=sys.stderr)
        return 2
    graph = build_graph(data_path, data_path.name)
    if "--json" in argv[2:]:
        print(json.dumps(graph, indent=2, default=str))
        return 0
    c = graph["concentration"]
    anchor = graph["anchor"]["name"] or graph["ticker"]
    print(f"=== relationship graph for {anchor} ===")
    print(f"{len(graph['sources'])} relationship sheet(s) | {c['relationship_rows']} disclosed row(s) | "
          f"{c['third_party_entities']} third part{'y' if c['third_party_entities'] == 1 else 'ies'} "
          f"({c['listed_third_parties']} listed)")
    if c["intragroup_row_share_pct"] is not None:
        print(f"intra-group rows: {c['intragroup_rows']}/{c['relationship_rows']} ({c['intragroup_row_share_pct']}%)")
    for note in graph["scope_notes"]:
        print(f"  scope: {note}")
    for cp in graph["counterparties"][:15]:
        print(f"  [{cp['link_strength']:3d}] order {cp['order']} · {cp['listing'] or 'unlisted'} · "
              f"{cp['name']} — {cp['role']} of {cp['anchor_side_entity']}")
    for w in graph["warnings"]:
        print(f"  ! {w}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
