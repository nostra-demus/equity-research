"""test_relationship_graph.py — adversarial checks on the CIQ supply-chain graph parser.

These are the failure modes that would quietly poison the Ideas board rather than crash:
  1. a wholly-owned sales subsidiary surfaced as a "second-order idea"
  2. a ticker invented for a counterparty the export left unlisted
  3. the export's "recently disclosed / current subsidiaries" scope silently dropped
  4. the disclosing side mis-read, so a counterparty naming the anchor in its OWN filing scores the same
     as one the anchor merely listed
  5. a financing relationship dressed up as an operating one
  6. a shifted header row (CIQ moves the table when the view carries extra scope lines) parsed as nothing

Run:  python3 test_relationship_graph.py      (exit 0 = all pass)
"""
from __future__ import annotations

import importlib.util
import sys
import tempfile
from pathlib import Path

_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))

import relationship_graph as rg  # noqa: E402

failures: list[str] = []


def check(cond: bool, msg: str) -> None:
    if not cond:
        failures.append(msg)


HEADER = ["Supplier Name", "Exchange:Ticker Symbol", "Customer Name", "Entity",
          "Relationship Type", "Primary Industry", "Source", "Business Description"]


def suppliers_sheet(rows: list[list[str]], *, scope_lines: int = 3, blank_lead: int = 5) -> list[list]:
    """A CIQ Suppliers sheet with a configurable number of leading blank and scope rows.

    The blank/scope lead is the point: CIQ shifts the table down when the view carries more filters, so a
    parser anchored on a row NUMBER silently returns an empty graph on a perfectly good export.
    """
    out: list[list] = [[""] * 8 for _ in range(blank_lead)]
    out.append(["Anchor Corp (NYSE:ANC) > Suppliers"] + [""] * 7)
    scope = [
        "Recently disclosed suppliers only (within the last two years)",
        "Include Suppliers for:Current subsidiaries",
        "Relationship Type: Supplier, Creditor",
    ][:scope_lines]
    for s in scope:
        out.append([s] + [""] * 7)
    out.append([""] * 8)
    out.append(["Recently Disclosed Suppliers"] + [""] * 7)
    out.append(HEADER)
    out.extend(rows)
    out.append(["*denotes proprietary relationship"] + [""] * 7)
    return out


def build(rows: list[list[str]], **kw) -> dict:
    """Run the builder over one synthetic Suppliers sheet and return the finished graph document."""
    b = rg.GraphBuilder()
    b.add_sheet("Anchor Suppliers.xls", "Anchor Suppliers.xls", "Suppliers", suppliers_sheet(rows, **kw))
    rg.classify_affiliation(b)
    order = rg.assign_orders(b)
    cps = rg.build_counterparties(b, order)
    return {
        "builder": b, "order": order, "counterparties": cps,
        "by_name": {c["name"]: c for c in cps},
        "concentration": rg.concentration(b, cps),
        "scope_notes": b.sources[0]["scope_notes"] if b.sources else [],
    }


ROWS = [
    # a listed third party that named the anchor in its OWN filing, supplying the anchor directly
    ["Widget Motors Inc. (NASDAQ:WMI)", "NASDAQ:WMI", "Anchor Corp (NYSE:ANC)", "Self", "Supplier",
     "Electrical Components and Equipment", "Widget Motors Inc. (NASDAQ:WMI) 2025 Form Doc", "Widget Motors makes motors."],
    # a listed third party the ANCHOR disclosed, supplying a subsidiary
    ["Packrite Holdings Limited (SEHK:9001)", "SEHK:9001", "Anchor Procurement Co., Ltd.", "Subsidiary/Investment",
     "Supplier", "Metal, Glass and Plastic Containers", "Anchor Corp (NYSE:ANC) - Form Doc", "Packrite makes cans."],
    # the anchor's OWN sales subsidiary, appearing only as a supplier -> must never become an idea
    ["Anchor Procurement Co., Ltd.", "-", "Anchor Corp (NYSE:ANC)", "Self", "Supplier",
     "Distributors", "Anchor Corp (NYSE:ANC) - Form Doc", "There is no business description for this supplier."],
    # a bank: financing, not operating
    ["Regional Bank Co., Ltd. (SEHK:3866)", "SEHK:3866", "Anchor Finance Co., Ltd.", "Subsidiary/Investment",
     "Creditor", "Regional Banks", "Regional Bank Co., Ltd. (SEHK:3866) 2025 Form Doc", "A bank."],
    # an unlisted third party -> real relationship, nothing to trade
    ["Quiet Plastics S.r.l.", "-", "Anchor Corp (NYSE:ANC)", "Self", "Supplier",
     "Commodity Chemicals", "Anchor Corp (NYSE:ANC) - Form Doc", "Quiet Plastics moulds parts."],
]

g = build(ROWS)
cp = g["by_name"]

# ---- 1. group entities are never counterparties ---------------------------------------------------
check("Anchor Procurement Co., Ltd." not in cp,
      "a group entity named on the anchor's own side of a row leaked into the counterparty ledger")
check(g["builder"].nodes[rg.node_id("Anchor Procurement Co., Ltd.")]["affiliation"] == "group",
      "an entity on the anchor side of a disclosed row was not classified as group")
check(g["builder"].nodes[rg.node_id("Anchor Corp")]["affiliation"] == "anchor",
      "the anchor itself was not classified as the anchor")

# ---- 2. tickers are read, never invented ----------------------------------------------------------
check(cp["Widget Motors Inc."]["listing"] == "NASDAQ:WMI", "a listing present in the export was not read")
check(cp["Widget Motors Inc."]["country"] == "United States", "a known exchange did not resolve to its country")
check(cp["Quiet Plastics S.r.l."]["listing"] is None, "a listing was invented for an unlisted counterparty")
check(cp["Quiet Plastics S.r.l."]["link_strength_cap"] == 25,
      "an unlisted counterparty was not capped below every investable one")
check(any("nothing to buy or sell" in gap for gap in cp["Quiet Plastics S.r.l."]["evidence_gaps"]),
      "an unlisted counterparty did not state that there is nothing to trade")

# ---- 3. the export's own scope travels with the graph ----------------------------------------------
check(any("within the last two years" in s for s in g["scope_notes"]),
      "the export's two-year disclosure window was dropped")
check(any("Current subsidiaries" in s for s in g["scope_notes"]),
      "the export's subsidiary-coverage scope was dropped")
check(not any(s.lower() in rg._SCOPE_HEADINGS for s in g["scope_notes"]),
      "a table section heading was captured as if it were a scope caveat")

# ---- 4. which side disclosed the relationship -------------------------------------------------------
check(cp["Widget Motors Inc."]["disclosed_by"] == "counterparty",
      "a counterparty naming the anchor in its own filing was not credited as the discloser")
check(cp["Packrite Holdings Limited"]["disclosed_by"] == "anchor_group",
      "a relationship disclosed in the anchor's own filing was misattributed to the counterparty")
check(cp["Widget Motors Inc."]["link_strength"] > cp["Packrite Holdings Limited"]["link_strength"],
      "a counterparty-disclosed direct link did not outscore an anchor-disclosed subsidiary link")

# ---- 5. financing is never dressed up as operating --------------------------------------------------
bank = cp["Regional Bank Co., Ltd."]
check(bank["role_kind"] == "financing", "a creditor row was not classified as financing")
check(bank["link_strength_components"]["role_kind"] == 0, "a financing link scored as if it moved with volumes")
check(bank["link_strength_cap"] == 45, "a financing link was not capped below an operating one")
check("credit link, not a trading one" in bank["mechanism"], "a lending relationship was described as a trade")
check(bank["link_strength"] < min(cp["Widget Motors Inc."]["link_strength"], cp["Packrite Holdings Limited"]["link_strength"]),
      "a bank outranked a real operating supplier")

# ---- 6. the mechanism never asserts an undisclosed magnitude ----------------------------------------
for name in ("Widget Motors Inc.", "Packrite Holdings Limited"):
    check("is a meaningful share of what it sells" in cp[name]["mechanism"],
          f"{name}: the mechanism asserted a causal link the export does not evidence")
    check("does not say how large the relationship is" in cp[name]["mechanism"],
          f"{name}: the mechanism did not admit that the size of the relationship is undisclosed")
    check(any("not disclosed here" in gap for gap in cp[name]["evidence_gaps"]),
          f"{name}: the missing revenue-share evidence was not stated")

# ---- 7. a shifted header row still parses -----------------------------------------------------------
for lead, scope in ((0, 0), (2, 1), (9, 3)):
    shifted = build(ROWS, blank_lead=lead, scope_lines=scope)
    check(len(shifted["counterparties"]) == len(g["counterparties"]),
          f"a table starting at a different row (lead={lead}, scope={scope}) parsed to a different graph")

# ---- 8. the related-party read -----------------------------------------------------------------------
conc = g["concentration"]
check(conc["relationship_rows"] == len(ROWS), "not every disclosed row became an edge")
check(conc["intragroup_rows"] == 1, f"the intra-group row count is wrong: {conc['intragroup_rows']}")
check(conc["listed_third_parties"] == 3, f"the listed third-party count is wrong: {conc['listed_third_parties']}")
check(sorted(conc["exchanges"]) == ["NASDAQ", "SEHK"], f"the exchange list is wrong: {conc['exchanges']}")

# ---- 9. a name shared with the group is withheld, not silently dropped --------------------------------
kin = build(ROWS + [
    ["Anchor Widgets Trading Co., Ltd.", "-", "Anchor Corp (NYSE:ANC)", "Self", "Supplier",
     "Distributors", "Anchor Corp (NYSE:ANC) - Form Doc", "A trading company."],
])
kin_row = kin["by_name"].get("Anchor Widgets Trading Co., Ltd.")
check(kin_row is not None, "an entity sharing the group's name vanished from the ledger instead of being flagged")
if kin_row:
    check(kin_row["affiliation"] == "likely_group", "an entity carrying the anchor's brand was treated as arm's-length")
    check(kin_row["link_strength"] <= 20, "a possibly-related entity was not capped below every real counterparty")
    check(any("shares the anchor group's brand" in gap for gap in kin_row["evidence_gaps"]),
          "a possibly-related entity did not say why it is being held back")
# a shared CITY is not a shared owner
check(rg.name_tokens("Regional Bank Co., Ltd.") & rg.name_tokens("Anchor Corp") == set(),
      "two unrelated names shared an identity token")

# ---- 10. an empty / non-relationship pool is a valid answer, not a crash -------------------------------
with tempfile.TemporaryDirectory() as tmp:
    empty = rg.build_graph(Path(tmp), "EMPTY")
    check(empty["sources"] == [] and empty["counterparties"] == [] and empty["warnings"] == [],
          "a pool with no relationship export did not produce a clean empty graph")
    check(empty["concentration"]["intragroup_row_share_pct"] is None,
          "an empty graph reported a share instead of admitting there is nothing to divide")
    (Path(tmp) / "notes.txt").write_text("not a workbook")
    check(rg.build_graph(Path(tmp), "EMPTY")["sources"] == [], "a non-workbook file was parsed as a relationship sheet")

# ---- 11. the customers orientation is the exact mirror -------------------------------------------------
cust_rows = [["Anchor Corp (NYSE:ANC)", "-", "Retail Chain Plc (LSE:RCP)", "Self", "Customer",
              "Broadline Retail", "Retail Chain Plc (LSE:RCP) - Form Doc", "A retailer."]]
cb = rg.GraphBuilder()
cust = [[""] * 8, ["Anchor Corp (NYSE:ANC) > Customers"] + [""] * 7,
        ["Recently disclosed customers only (within the last two years)"] + [""] * 7,
        ["Customer Name", "Exchange:Ticker Symbol", "Supplier Name", "Entity", "Relationship Type",
         "Primary Industry", "Source", "Business Description"]] + cust_rows
cb.add_sheet("c.xls", "c.xls", "Customers", cust)
check(cb.sources and cb.sources[0]["orientation"] == "customers",
      "a Customers view was not recognised from its own title")
check(cb.edges and cb.edges[0]["counterparty"] == rg.node_id("Anchor Corp"),
      "the Customers view put the wrong side in the counterparty column")

# ---- 12. a non-Latin name keeps a distinct node id (§27: non-English is first-class) ------------------
# An all-CJK/Arabic/Korean name has no [a-z0-9] to keep, so the ASCII fold is empty. Folding every such
# name onto one "unnamed" node silently merges genuinely different companies. Distinct originals must stay
# distinct.
check(rg.node_id("海尔智家股份有限公司") != rg.node_id("青岛海尔生物医疗"),
      "two distinct non-Latin names collapsed onto the same node id (§27 entity merge)")
check(rg.node_id("삼성전자").startswith("x-"),
      "a wholly non-Latin name did not fall back to a stable hashed id")
check(rg.node_id("海尔智家股份有限公司") == rg.node_id(" 海尔智家股份有限公司 "),
      "the non-Latin fallback id is not stable under surrounding whitespace")
cjk = build([
    ["海尔智家股份有限公司 (SHSE:600690)", "SHSE:600690", "Anchor Corp (NYSE:ANC)", "Self", "Supplier",
     "Consumer Electronics", "Anchor Corp (NYSE:ANC) - Form Doc", "A supplier."],
    ["青岛海尔生物医疗 (SHSE:688139)", "SHSE:688139", "Anchor Corp (NYSE:ANC)", "Self", "Supplier",
     "Health Care Equipment", "Anchor Corp (NYSE:ANC) - Form Doc", "Another supplier."],
])
check(len(cjk["counterparties"]) == 2,
      f"two distinct non-Latin counterparties merged into {len(cjk['counterparties'])} node(s)")

# ---- 13. a relationship workbook for a DIFFERENT anchor is skipped, not merged ------------------------
# A pool's external/ subtree can hold another company's export; merging its rows would attribute a foreign
# issuer's suppliers/customers to this anchor (§3 unsupported counterparties).
fb = rg.GraphBuilder()
fb.add_sheet("Anchor Suppliers.xls", "Anchor Suppliers.xls", "Suppliers", suppliers_sheet([ROWS[0]]))
foreign_sheet = [[""] * 8, ["Different Corp (NYSE:DIF) > Suppliers"] + [""] * 7,
                 ["Recently disclosed suppliers only (within the last two years)"] + [""] * 7, HEADER,
                 ["Some Supplier Inc. (NASDAQ:SSI)", "NASDAQ:SSI", "Different Corp (NYSE:DIF)", "Self", "Supplier",
                  "Electrical Components and Equipment", "Different Corp (NYSE:DIF) - Form Doc", "x."]]
foreign_added = fb.add_sheet("external/Different Suppliers.xls", "external/Different Suppliers.xls", "Suppliers", foreign_sheet)
check(foreign_added is False, "a relationship workbook for a DIFFERENT anchor was merged instead of skipped")
check(fb.anchor_name is not None and rg.node_id(fb.anchor_name) == rg.node_id("Anchor Corp"),
      "a foreign-anchor sheet overwrote or contaminated the real anchor")
check(any("different anchor" in w for w in fb.warnings),
      "skipping a foreign-anchor sheet did not record a warning")
rg.classify_affiliation(fb)
_fb_cps = rg.build_counterparties(fb, rg.assign_orders(fb))
check("Some Supplier Inc." not in {c["name"] for c in _fb_cps},
      "a foreign issuer's counterparty leaked into this anchor's graph")

# ---- 14. an unproven likely_group row is not counted as proven intra-group (§3) -----------------------
# `kin` (built above) adds one likely_group counterparty on top of ROWS' single proven-group row. The
# proven intra-group share must exclude the name-match heuristic and report it separately.
check(kin["concentration"]["intragroup_rows"] == 1,
      f"a likely_group (unproven name-match) row was counted as proven intra-group: {kin['concentration']['intragroup_rows']}")
check(kin["concentration"].get("likely_group_rows") == 1,
      "the suspected (likely_group) row was not surfaced separately from proven intra-group rows")

# ---- 15. RTF relationship exports are parsed portably, and malformed ones fail visibly ----------------
with tempfile.TemporaryDirectory() as tmp:
    rtf_path = Path(tmp) / "Anchor Corp NyseANC Suppliers.rtf"
    rtf_path.write_text(r"""{\rtf1\ansi
Recently disclosed suppliers only (within the last two years)\par
Include Suppliers for:Current subsidiaries\par
Suppliers\par
Recently Disclosed Suppliers\par
Supplier Name|Customer Name|Relationship Type|Primary Industry|Source|\par
Widget Motors Inc. (NASDAQ:WMI)|Anchor Corp (NYSE:ANC)|Supplier|Electrical Components and Equipment|Widget Motors Inc. (NASDAQ:WMI) 2025 Form Doc|\par
Business Description: Widget Motors makes motors.|\par
}""")
    check(rtf_path in rg._pool_files(Path(tmp)), "an RTF file named like a relationship export was not picked up by _pool_files")
    rtf_graph = rg.build_graph(Path(tmp), "ANCHOR")
    check(len(rtf_graph["sources"]) == 1 and len(rtf_graph["counterparties"]) == 1,
          f"a valid RTF relationship export did not become one source/counterparty: {rtf_graph['warnings']}")
    check(rtf_graph["counterparties"] and rtf_graph["counterparties"][0]["listing"] == "NASDAQ:WMI",
          "the RTF reader did not preserve the counterparty listing printed in its name")
    check(rtf_graph["anchor"]["listing"] == "NYSE:ANC",
          "the RTF reader did not infer the modal anchor-side identity from the exported rows")

    malformed = Path(tmp) / "Broken Corp Suppliers.rtf"
    malformed.write_text(r"{\rtf1\ansi Broken Corp Suppliers export, not a table.}")
    malformed_graph = rg.build_graph(Path(tmp), "ANCHOR")
    check(any("Broken Corp Suppliers.rtf" in w and "CiqParseError" in w for w in malformed_graph["warnings"]),
          f"a malformed RTF relationship export left no explicit parse warning: {malformed_graph['warnings']}")
    # An .rtf file that does NOT look like a relationship export (by name) must stay silent, exactly like
    # the pre-existing notes.txt case in check 10 — most .rtf files in a pool are unrelated filings.
    (Path(tmp) / "10-K excerpt.rtf").write_text(r"{\rtf1\ansi some filing text.}")
    check(not any("10-K excerpt" in w for w in rg.build_graph(Path(tmp), "ANCHOR")["warnings"]),
          "an unrelated .rtf file (not named like a relationship export) triggered a spurious warning")

if failures:
    for f in failures:
        print(f"  FAIL  {f}")
    print(f"  -> relationship_graph test FAILED ({len(failures)} failure(s))")
    sys.exit(1)
print("  PASS: group/anchor classification, no invented tickers, scope carried, discloser side, "
      "financing capped, conditional mechanism, header-shift tolerance, related-party read, "
      "brand withholding, empty-pool honesty, customers mirror, RTF export parsed/fails visibly")
sys.exit(0)
