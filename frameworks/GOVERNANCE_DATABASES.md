# GOVERNANCE_DATABASES.md — Legal & Regulatory Database Registry

The canonical registry of public legal, regulatory, and registry databases the engine sweeps to verify governance facts — about a **company** and about every **person** who runs it. The management-governance module's `07_people-integrity-dossiers` (persons) and `12_regulatory-legal-and-compliance` (the company) run their sweeps from this file; any agent may cite it when a checklist item needs a database fact (e.g., an audit firm's disciplinary record). Future swarms may reference it the same way.

Every entry below was reachability-verified on 2026-08-13. Sites change: when a recipe fails, use the entry's fallback, record the substitution, and prefer fixing the sweep over skipping it.

---

## Sweep Rules (Hard — restated from MODULE_RULES)

1. **Jurisdiction first (CLAUDE.md §27).** Detect the listing jurisdiction from triage, sweep that jurisdiction's core set; add the global set for cross-listed companies and globally active people.
2. **Primary registry beats aggregator (§4).** MCA beats Zauba/Tofler; SEBI's own orders page beats Watchout Investors; EDGAR beats a news summary. Aggregators are for DISCOVERY (name → identifier, single-search triage); confirm on the primary source before anything enters a report, and cite what you actually read (§5).
3. **Date every lookup.** A sweep is a snapshot. Cite as: `[Indian Kanoon search "{name}", 2026-08-13, 3 results]` or `[SEBI orders search "{name}", 2026-08-13, no records]`.
4. **"No result" ≠ "clean".** Log every sweep: database, query used, date, result count — in the agent's Sweep Log. A person or company is "Clean (swept)" only when the core set actually ran. An unreachable database = "coverage-limited: {database} unreachable {date}", which caps confidence — it is never silently skipped and never counted as a clean result. Several key sources are geo- or bot-gated (flagged below): a 403/timeout from an automated client is a COVERAGE note, not evidence of absence.
5. **Namesake protocol.** Anchor every adverse attribution on the unique identifier (DIN / CIN / CRD / IRN / registry officer ID) or ≥2 corroborating identifiers (company linkage, age/DOB, father's name, address, photo, co-parties). Common names collide; transliterated names collide worse. An unanchorable hit = "possible namesake — not attributed."
6. **Allegation ≠ conviction.** Record procedural posture verbatim (complaint → charges → trial → conviction/acquittal; petitioner vs respondent vs accused; settlement "without admission of guilt" cited as such). Court and regulator records are tier-8-or-better sources; dated reputable media is tier 10; forums are §24-Filter-1 buzz only.
7. **Reconcile against filings.** What the databases show is compared to what the filings disclose (checklist A9-10, A16-02, A16-13). A material fact visible in public records but absent from filings is a disclosure-integrity finding in its own right.
8. **Aggregator conflict = keep and flag, never drop.** When two mirrors disagree about who is on a board (one lists five directors, another three), the extra name stays IN SCOPE as an unresolved ambiguity — attempt resolution on the primary registry, and if it cannot be resolved, record the conflict and the name. Silently adopting the shorter roster is how a real director disappears from a check. The conservative default (§4) applies to the roster the same way it applies to a finding.
9. **Discovery before sweeping.** A sweep can only be as good as the list of subjects it runs against. Before any sweep, build the subject list per the Entity & Lineage Discovery Recipes below and the **Entity & Network Discovery Protocol** (MODULE_RULES) — and write down HOW each subject was found. A subject with no recorded discovery method has not been found; a subject dropped without a Scope-Boundary row has been hidden.

**Sweep Log format (every sweeping agent appends this table):**

| Database | Query | Date | Results | Attributed? (identifier used) | Coverage note |
|---|---|---|---:|---|---|

---

## Entity & Lineage Discovery Recipes (Hard Rule — run BEFORE the sweeps)

The sweeps below answer "is there anything against this name?". These recipes answer the prior and harder question: **which names?** They are jurisdiction-neutral and run first, for the target company and then for every entity the loop surfaces. Each recipe names the discovery method it produces — that string goes in the Discovery Register cell (MODULE_RULES, Entity & Network Discovery Protocol).

The failure mode these exist for: a company whose own board, and the company itself, sweep clean on every database in this file, while its predecessor entity — reachable only through the company's own marketing copy — sat in insolvency, and that predecessor's founder, long off every board, was under a money-laundering prosecution. No directorship search reaches that. A website fetch does.

| # | Recipe | What it finds | How to run it | Caveats |
|---|---|---|---|---|
| D-1 | **Company self-disclosure fetch** *(mandatory — never skip)* | Self-declared lineage the registry does not carry: "formerly", "erstwhile", "rebranded from", "part of the ___ group", predecessor brand names, reused taglines | Fetch the company's OWN About / History / Our Story / Milestones / Investor / Farming-and-sourcing pages — not an aggregator profile — and read them for lineage language. Then `"{company}" ("formerly" OR "erstwhile" OR "part of" OR "rebranded")` even if the pages said nothing | Marketing copy is a tier-10 source for FACTS, but a **self-disclosed** lineage claim is the company speaking against its own interest — treat it as a lead of the highest priority and verify the predecessor on the registry. Archive the page (date it) — About pages get edited |
| D-2 | **Founding-year mismatch test** | An undisclosed predecessor entity | Compare the founding year the company claims (website, deck, packaging, LinkedIn) against its registry incorporation date. A claimed history older than the entity means a predecessor exists — find it | A group founding year is a legitimate claim IF the group entity is disclosed. Unexplained is the flag, not the gap itself |
| D-3 | **Name-change trail** | The company's own former names — under which its litigation, enforcement and defaults are indexed | India: MCA master data "previous names" field. UK: Companies House previous-names list. US: EDGAR "formerly" header. Plus `site:{mirror} "{company}" "formerly known as"` | Pre-rename matters do NOT surface under the current name. Every former name is a separate Sweep Log subject (agent `12` owns the company-level re-sweep) |
| D-4 | **Brand & trademark ownership** | Marks owned outside the listco, or shared with a live unrelated user | India: IP India `tmrsearch.ipindia.gov.in` (proprietor search + wordmark search). US: USPTO TESS / `tmsearch.uspto.gov`. UK: `trademarks.ipo.gov.uk`. Global: WIPO Global Brand Database. Search BOTH the mark and the proprietor name | A brand the company trades under but a promoter entity owns is a leakage channel (route to `09`, A5/A11). Two live companies using the same marks is an unresolved ambiguity to flag — possible split, IP dispute, or informal succession — never assumed benign |
| D-5 | **Registered-address cluster** | Entities sharing the target's registered office | Zauba / TheCompanyCheck address pages; `"{address line}" -"{company}"`; RoC address search where offered | **A shared address alone is a LEAD, not a relationship.** Co-working, virtual-office, CA-office and industrial-estate addresses cluster hundreds of unrelated companies. Require a second independent link (common director, common founder, brand overlap, transaction) before treating a co-address entity as related — see the corroboration rule in MODULE_RULES |
| D-6 | **Founder discovery** *(the Phase-2 step)* | The founder(s) of a surfaced entity, **distinct from its current board** | `"{entity}" founder` · `"{entity}" ("founded by" OR "co-founder")` · the entity's own About page · Crunchbase / Tracxn company pages · incorporation-era press. Then confirm against the registry: the director list AT incorporation, and the founder's identifier (DIN / officer ID) | **A founder no longer on the board is a reason to look HARDER, not to drop them.** An exit is often the most informative fact about an entity. Once identified, the founder is a full subject: the keyword battery and the person core set run on their name, not just the entity's |
| D-7 | **Predecessor insolvency / phoenix route** | A failed entity whose business continued under a new name | Run IBBI + NCLT/NCLAT (or the local insolvency register) on the PREDECESSOR name from D-1/D-2/D-3. Then test continuity: same brands, same address, same staff, same products, same customers — and on what disclosed legal basis and consideration | A clean resolution under a formal process is a legitimate outcome; the flag is continuity WITHOUT a disclosed basis, or a related party re-buying the assets (the Sec 29A round-trip the person protocol already tests at A16-08) |
| D-8 | **Past-directorship snapshot** | Directors who resigned before the current board snapshot | Aggregator historic snapshots (InsiderBiz, TheCompanyCheck filings history, Tofler document sets), AGM-vintage filings, and `"{company}" director {year}` for prior years | Current-board pages overwrite history. A director who left before the last filing is invisible in a live-roster search — and is exactly who a check is looking for |
| D-9 | **Co-director network** | Other people who repeatedly appear alongside a subject across entities | Mirror director pages list co-directors per company; intersect the co-director sets across a subject's directorships | Repeated co-appearance across unrelated businesses is a network signal; a single overlap is noise |

---

## Adverse-Keyword Battery (Hard Rule)

Database recipes are per-source. This battery is per-SUBJECT: run it against **every entity and every person on the Discovery Register**, at the depth their tier requires. A subject that got the databases but not the battery has not been checked — the battery is what catches matters that never reached a court or a regulator's index.

**Core terms** (every jurisdiction), each combined with the quoted subject name:

> lawsuit · legal notice · court · criminal · civil suit · fraud · default · defaulter · wilful defaulter · police complaint · FIR · arrest · disqualified director · strike off · insolvency · tribunal

**Jurisdiction add-ons:**

| Jurisdiction | Additional terms |
|---|---|
| India | CBI · EOW · SFIO · ED (Enforcement Directorate) · PMLA · GST evasion · benami · FEMA · lookout circular · FEO Act · NCLT · NCLAT · SEBI order · debarred |
| United States | indictment · SEC charges · class action · DPA · NPA · debarment · consent order · receivership · Chapter 11 |
| United Kingdom | SFO · disqualification · winding-up petition · administration · FCA final notice |
| Any | controversy · scam · probe · raid · whistleblower · resigned (auditor / independent director) |

**Sector add-ons** — extend the battery where the subject's business suggests it: lending (NPA, recovery, DRT, SARFAESI), pharma (USFDA warning letter, import alert, recall), infrastructure (arbitration, termination notice, blacklisting), listed financials (RBI penalty, licence cancellation), export/trade (DGFT, customs, misdeclaration).

**Depth floor (Hard).** At least ONE query per source category, and **typically 5–10 queries per Tier-A / Tier-E-A subject** — do not stop at the first query per category, and do not treat a single "no results" page as the battery having run. Vary the keyword set; a relevance-ranked engine caps results and re-orders them (§ adverse-media caveat below).

**Logging.** Every battery query is a Sweep Log row like any database query — the existing rule binds unchanged: *no sweep-log row → the corresponding "clean" claim is invalid.* Log the terms actually used, not "keyword battery run".

---

## Unlisted / Private-Entity Sweep Protocol

Most entities the discovery loop surfaces are **not listed**: promoter vehicles, predecessor entities, founder-linked companies, address-cluster companies. They file no proxy, no CG report, no quarterly results. That is the REGIME, not a data gap — recording "no disclosures available" as opacity is the §27 twin of marking a non-US company's data missing because there is no 10-K, and it is a bad-extraction error (§20).

What an unlisted entity still yields, and what to run:

| Axis | Source | What it answers |
|---|---|---|
| Registry master data | MCA / Companies House / local registrar | Status (active / struck-off / under CIRP / dormant / active-noncompliant), incorporation date, **previous names**, registered address, authorised & paid-up capital, last filing date |
| Directors & founders | Registry director master data + the mirrors, plus D-6 | Current board, incorporation-era board, identifiers for each |
| Charge register | MCA charges / Companies House mortgages | Who lends to it, how much, secured on what — the only lender view an unlisted entity gives you, and a live charge on a "dormant" entity is a finding |
| Insolvency | IBBI / NCLT / NCLAT / Gazette / local insolvency register | CIRP, liquidation, winding-up — as debtor AND as petitioner |
| Courts | Indian Kanoon / eCourts / BAILII / CourtListener | Litigation naming the entity; party posture verbatim |
| Regulator | Securities regulator, banking regulator, sector regulator, defaulter lists | Enforcement, penalties, defaulter listings |
| Statutory dues | EPFO / GST status / equivalents | PF default while distributing profits, suo-moto GST cancellation |
| Keyword battery | Above | Matters that never reached an indexed database |
| Adverse media | Dated, tiered | The public trail |

**Financials.** Where an unlisted entity's accounts matter (a promoter vehicle transacting with the listco, a predecessor still trading), the registry's filed annual accounts — or a paid mirror's extract of them — are the tier-appropriate source. Cite what you actually read; a mirror's summary is a mirror's summary, not the filed accounts (§5).

**Never invert the absence.** An unlisted entity that files nothing beyond its statutory minimum is normal. The finding is a *specific* one — struck-off, active-noncompliant, an undisclosed charge, a live case — never "we could not see inside it, therefore concerning."

---

## India — Core Set

### Corporate registry & directorships

| Database | What it answers | Recipe | Caveats |
|---|---|---|---|
| **MCA portal (mca.gov.in)** — company/LLP master data, DIN, disqualified directors | THE primary registry: company status (active / struck-off / under CIRP), CIN, charges, director master data (every directorship against a DIN), DIN status, RoC disqualified-director lists (Sec 164(2)) | MCA Services → Master Data → View Company/LLP Master Data ({CIN} or name) · View Director Master Data ({DIN}) · Enquire DIN Status. Disqualified lists: `site:mca.gov.in disqualified directors {ROC_CITY}`. Get the DIN from a mirror first, confirm here | **Browser-only** (WAF/geo-block 403s automated and foreign clients; captchas). Shows current state, not history. Automated pipelines read the mirrors below and reserve MCA for confirming anything that will be cited |
| **Zauba Corp (zaubacorp.com)** — free MCA mirror | Name → DIN resolution; DIN → all directorships (current + past); co-director networks — the fastest map of a promoter's company web | Director page `zaubacorp.com/director/{NAME-SLUG}/{DIN}`; practical route: `site:zaubacorp.com {DIN}` or `site:zaubacorp.com "{NAME}"`, open in a browser | Cloudflare-blocks automated clients (403) — go via the site: recipe. Freshness lags MCA by months; past-directorship end-dates often missing. Confirm the DIN↔company pairing on MCA or a second mirror |
| **TheCompanyCheck / Tofler / Falconebiz / IndiaFilings** — additional MCA mirrors | Second/third/fourth mirrors to triangulate: director profiles (DIN, directorships, co-directors), company data, charges; Tofler sells private-company financials (useful for promoter private entities) | `thecompanycheck.com/director/{name-slug}/{DIN}` · `tofler.in/{company-slug}/company/{CIN}` · `falconebiz.com/director` · `indiafilings.com/search/` — or `site:{mirror} {DIN}` / `{CIN}` | Freemium walls and upsells; namesake merges happen on mirror DIN pages — verify on MCA. Never cite a mirror for a number that exists in an MCA filing; mirrors are pointers |
| **Tracxn / Quickcompany / InsiderBiz / Crunchbase** — discovery-tier mirrors | Tracxn: company profiles, revenue bands, **founder names** and funding history for private companies. Quickcompany: clean DIN → directorship lists. InsiderBiz: **historic board snapshots** (a director who resigned before the current filing). Crunchbase: founder/co-founder attribution for the D-6 loop | `site:tracxn.com "{COMPANY}"` · `quickcompany.in/director/{DIN}` or `site:quickcompany.in {DIN}` · `site:insiderbiz.in "{COMPANY}"` · `site:crunchbase.com "{COMPANY}"` | **Discovery only, never a citation.** These are the weakest tier in this file: Tracxn revenue bands are estimates, Crunchbase founder fields are self-submitted, InsiderBiz snapshots are undated scrapes. Their job is to produce a NAME that the registry then confirms. Never let a mirror's roster override MCA; where mirrors conflict, Sweep Rule 8 applies (keep and flag, never drop) |

### Courts & tribunals

| Database | What it answers | Recipe | Caveats |
|---|---|---|---|
| **Indian Kanoon (indiankanoon.org)** — full-text case law | Litigation naming a person/company across SC, HCs, SAT, NCLAT, ITAT, CESTAT, consumer fora — catches names buried inside orders, not just captions | `indiankanoon.org/search/?formInput=%22{NAME}%22` (URL-encoded, quoted). Filters inside formInput: `doctypes:judgments`, `fromdate:/todate:`, court lists; `&sortby=mostrecent`. Namesake control: `%22{NAME}%22 %22{COMPANY}%22` | Rate-limits/temp-bans rapid queries — space them. District-court coverage thin. **Being named in a judgment is not an adverse finding — read the order** (party posture: petitioner vs accused) |
| **eCourts v6 (services.ecourts.gov.in)** — district courts | Pending/disposed district-court cases (criminal complaints, cheque-bounce s.138, recovery suits) — the layer below Indian Kanoon | Case Status → Party Name; select State + District, enter {NAME} + year; CNR-number search is the fastest exact hit | Captcha per query (browser-driven). District-scoped — iterate the subject's operating districts. Try name/transliteration variants; match on father's name/address in the record |
| **eSCR / eCourts Judgments (judgments.ecourts.gov.in/pdfsearch)** | Government-run full-text SC/HC judgment search — the official cross-check on Indian Kanoon | Phrase search `"{NAME}"`, filter by court | Captcha per search. Judgments only (no pending-case status). Strongest post-2010s |
| **NCLT (nclt.gov.in) + NCLAT (nclat.nic.in)** | IBC insolvency petitions, oppression/mismanagement (Sec 241/242), schemes; appellate outcomes (was an adverse order stayed/reversed?). Cause lists = early warning before any order exists | Orders date-wise per bench; party-name discovery via `site:nclt.gov.in "{COMPANY}"` / `site:nclat.nic.in "{NAME}"`; Indian Kanoon also indexes NCLAT | Weak on-site name search — lean on site: recipes and the IBBI mirror. Scanned PDFs common; cause-list PDFs replaced daily |
| **IBBI (ibbi.gov.in)** — insolvency mirror | One-stop mirror of IBC orders across NCLT/NCLAT/HC/SC (31k+ records): is the company (or a company the person ran) in CIRP/liquidation, who filed, what stage; disciplinary orders against insolvency professionals | `ibbi.gov.in/en/orders/nclt` (also /nclat, /supreme-court, /high-court), Subject filter accepts a company-name fragment; plus `site:ibbi.gov.in "{COMPANY}"` | Subject filter only matches the order caption — misses respondent-side appearances; cross-check NCLT. Cite the underlying tribunal order, not the mirror |

### Regulators & enforcement

| Database | What it answers | Recipe | Caveats |
|---|---|---|---|
| **SEBI enforcement (sebi.gov.in/enforcement/orders.html)** | THE most governance-relevant source: final + adjudication orders naming companies, promoters, directors (PFUTP fraud, insider trading, disclosure violations); settlements; market debarments | Hub → categories (Chairperson/Members, AO, Settlement, SAT/Courts). Fastest name search: `site:sebi.gov.in "{NAME}" (order OR adjudication OR debarred)`. Consolidated debarred lists republished by exchanges: NSE `/regulations/member-sebi-debarred-entities`, BSE `/investors/debent.aspx` | On-site search clunky; start from orders.html. Confirm identity via PAN/DIN printed in the order. Settlements are "without admission of guilt" — cite as such. Check the SAT-orders category before treating a debarment as live |
| **RBI (rbi.org.in) + wilful-defaulter route (suit.cibil.com)** | Penalties on banks/NBFCs, cancelled registrations, the Alert List; wilful-defaulter (₹25L+) and suit-filed (₹1cr+) borrower lists naming companies AND their directors/guarantors | Press releases: `site:rbi.org.in "{NAME}" penalty`. Alert List: `website.rbi.org.in/web/rbi/alert-list`. Defaulter lists: `suit.cibil.com` — borrower name / bank / state | **suit.cibil.com is geo-blocked outside India** — a "no hit" from a foreign egress is NOT evidence of absence; record coverage-limited. Director names on defaulter lists are lender-reported and namesake-prone — corroborate with DIN |
| **Watchout Investors (watchoutinvestors.com)** | Single-search triage (~450k entities) across SEBI/RBI/MCA/exchange actions and defaulter lists: "has any Indian regulator ever acted against this name?" | Search form at `watchoutinvestors.com` (person or company name); alphabetical browse `compindex.asp?findword={LETTER}` | 1990s ASP site — drive a browser. It is an AGGREGATOR: stale entries (orders set aside on appeal) and namesake risk — trace every hit to the primary regulator document; this is triage, never the citation |
| **NSE + BSE disclosure layer** | Reg 30 material events (auditor/CFO resignations, fraud, regulatory action, pledge invocations), LODR non-compliance fines per quarter, shareholding patterns with the promoter-pledge column, SEBI-debarred registers | NSE: `/companies-listing/corporate-filings-announcements`, `/regulations/listing-compliance`, `/companies-listing/corporate-filings-shareholding-pattern`. BSE: `/corporates/ann.html`, `/corporates/shpSecurities.aspx`. BSE small-caps often BSE-only | Strong bot-protection (NSE especially): browser UA + warmed cookies, or drive a real browser; BSE pages are JS-rendered (API needs `Referer: www.bseindia.com`). Fines disclosures are quarterly files, not a searchable DB |
| **EPFO + GST statutory-dues routes** | Does the company actually remit employee PF (PF default while paying dividends is a §24 crook-filter signal); EPFO defaulting-establishments list; GST registration status/cancellations (a suo-moto cancellation is a flag) | EPFO establishment search: `unifiedportal-emp.epfindia.gov.in/publicPortal/no-auth/misReport/home/loadEstSearchHome`; CAIU defaulters: `iwu.epfindia.gov.in/caiu/defWebList`; GST: `services.gst.gov.in/services/searchtp` by {GSTIN} or PAN | Captchas (browser-driven); GST portal resets some foreign connections. Get PAN/GSTIN from the annual report first. EPFO "default" rows can be settled-but-unupdated |

---

## US / UK / Global — Core Set

### United States

| Database | What it answers | Recipe | Caveats |
|---|---|---|---|
| **SEC EDGAR full-text search (efts.sec.gov)** | Which filings mention a person/entity/phrase: bad-actor disclosures, officer-and-director-bar language, 8-K executive departures (Item 5.02), auditor changes (Item 4.01), related-party mentions | JSON: `efts.sec.gov/LATEST/search-index?q=%22{PHRASE}%22&forms={8-K|DEF 14A|10-K}&startdt=&enddt=`; UI: `sec.gov/edgar/search/#/q=%22{PHRASE}%22` | Full-text coverage starts 2001. All of www.sec.gov 403s generic bot UAs — send a declared `orgname contact@email` User-Agent (efts.sec.gov JSON needs no special UA). Constrain by form + date, confirm identity inside the filing |
| **SEC Litigation Releases + Administrative Proceedings + SALI** | Civil enforcement vs companies/officers/auditors; SALI (`sec.gov/litigations/sec-action-look-up`) is the dedicated individual bad-actor screen incl. O&D bars and penny-stock bars | `sec.gov/enforcement-litigation/litigation-releases?search={NAME}`; admin: `/administrative-proceedings?search={NAME}`; robust route: `site:sec.gov "litigation release" "{NAME}"` | Declared-UA requirement. Civil only — criminal is DOJ. A release records an allegation or settlement — read the linked order. SALI covers individuals only; complete from ~2013, substantial to 1995 |
| **CourtListener / RECAP (courtlistener.com)** — free PACER mirror | Federal dockets/filings: securities class actions, derivative suits, SEC v. X, criminal indictments, bankruptcies | API: `courtlistener.com/api/rest/v4/search/?q=%22{NAME}%22&type=r` (dockets; `type=o` opinions); fielded `party:(%22{NAME}%22)`, `&court=`, `&filed_after=` | Mirrors only what someone bought from PACER — **absence ≠ no case**; PACER itself is paid. State courts not covered. Run both q= and party:() forms |
| **DOJ press releases (justice.gov)** | Criminal charges, pleas, convictions, DPAs/NPAs (securities/accounting fraud, FCPA, insider trading) | Domain-scoped search: `site:justice.gov "{NAME}"` (+ district feeds `site:justice.gov/usao-sdny …`) — direct fetches are Akamai-403 bot-gated | Never read the 403 as "no data". A press release marks charges, not outcomes — chase the docket. Thin before ~2009 |
| **FINRA BrokerCheck (+ adviserinfo.sec.gov)** | Whether a person is/was a registered broker/adviser: disclosure events, terminations, criminal items, permanent-bar status | JSON: `api.brokercheck.finra.org/search/individual?query={NAME}&wt=json` with `Referer: https://brokercheck.finra.org/`; UI `brokercheck.finra.org/search?query={NAME}` | Registrants only — a never-licensed CEO won't appear (absence means nothing). Match on CRD + employment history, never name alone |
| **US state courts — judyrecords + NY/DE portals** | State-court litigation federal mirrors miss: Delaware fiduciary/appraisal suits, NY Commercial Division fraud/contract cases | judyrecords.com search (browser); confirm on NYSCEF `iapps.courts.state.ny.us/nyscef/CaseSearch` and Delaware CourtConnect | No free national state-court search; judyrecords is an unofficial scrape — hits are LEADS, verify on the official portal. Heavy namesake risk |

### United Kingdom

| Database | What it answers | Recipe | Caveats |
|---|---|---|---|
| **Companies House (find-and-update.company-information.service.gov.uk)** | Every UK directorship (current + resigned) — serial-directorship / phoenix patterns — plus the statutory disqualified-directors register (grounds, duration) | Officers: `/search/officers?q={NAME}`; disqualified register: `/register-of-disqualifications/{A-Z}`; free REST API (`api.company-information.service.gov.uk`) with a free key | UK companies only. Disambiguate on name + month/year of birth + correspondence address. Filed data is as-submitted, not verified |
| **FCA register + final notices (register.fca.org.uk)** | Authorization history, controlled functions, prohibition orders, per-record disciplinary history; final notices carry the full findings | Register: `register.fca.org.uk/s/search?q={NAME}&type=Individuals`; notices: `site:fca.org.uk "final notice" "{NAME}"` | Regulated persons only; register is a JS app (browser). Match on IRN/FRN, never name alone |
| **The Gazette (thegazette.co.uk) + BAILII (bailii.org)** | Statutory insolvency notices (winding-up petitions/orders, administrations, personal bankruptcies) — the earliest UK distress signal; full-text judgments (CDDA disqualifications, fraudulent trading, unfair prejudice) | Gazette: `/all-notices/notice?text=%22{NAME}%22` (+ date bounds); BAILII: `/cgi-bin/lucy_search_1.cgi?method=boolean&query=%22{NAME}%22 AND %22disqualification%22` | Gazette: match on the registered number inside the notice. BAILII: judgments only, coverage era-dependent; check caselaw.nationalarchives.gov.uk for post-2022 |

### Global screens

| Database | What it answers | Recipe | Caveats |
|---|---|---|---|
| **OpenCorporates (opencorporates.com)** | Cross-jurisdiction directorship graph (140+ registries) — offshore/foreign directorships a national registry misses | `/officers?q={NAME}` in a real browser; fallback `site:opencorporates.com "{NAME}"` | Captcha-gates automated clients; API is keyed. Registry freshness varies — confirm on the national registry; require DOB/address correlation |
| **OpenSanctions (opensanctions.org)** — consolidated sanctions + PEP | One query across OFAC, UN, EU, UK OFSI, World Bank/MDB debarments, PEP datasets | `/search/?q=%22{NAME}%22` — entity pages link every source dataset | Aggregator: entity resolution can merge/split people wrongly — ALWAYS click through to the primary list before treating a hit as fact. PEP status is context, not accusation |
| **OFAC sanctions search (sanctionssearch.ofac.treas.gov)** | SDN / consolidated non-SDN match for a person/entity | Form search; set minimum match score ~85; confirm on DOB + nationality + ID in the detail record | Fuzzy matching false-positives on transliterated names. US lists only. The 50%-ownership rule won't surface unlisted majority-owned entities — trace ownership separately |
| **World Bank debarred firms** | Fraud/corruption debarment in World Bank projects (+ MDB cross-debarment) — a strong §24 signal for EM companies | Page table (JS-rendered, browser) at worldbank.org → procurement → debarred firms; or the OpenSanctions mirror | Lists the exact sanctioned legal entity — search name variants; check the ineligibility period dates |
| **Interpol Red Notices (interpol.int)** | Public Red Notices (wanted for extradition) — the extreme tail (fugitive promoters) | View-Red-Notices search: family name / forename / nationality | Only ~1 in 10 notices is public — **absence proves nothing**. A notice is the requesting state's allegation, not a conviction. Match on nationality + DOB + photo |
| **Adverse media — Google News RSS, site-scoped** | The dated adverse-media trail (investigations, raids, short-seller reports, resignations) as tier-10 dated citations | RSS: `news.google.com/rss/search?q=%22{NAME}%22+(fraud+OR+probe+OR+SEC+OR+SEBI+OR+resign)`; date-window `+after:/+before:`; quality-scope `site:reuters.com OR site:ft.com …`; kill namesakes by pairing `%22{NAME}%22+%22{COMPANY}%22` | Relevance-ranked and capped (~100/query) — absence in results ≠ absence of coverage; vary keyword sets. Headlines allege — chase every material hit to a primary source. Cite `Web: {outlet}, {date} (unverified)` per §5 |

---

## Fallback chains

- **DIN → directorships (India):** Zauba → TheCompanyCheck → Falconebiz → IndiaFilings → MCA (browser confirm). ≥2 mirrors agreeing, or MCA itself, before citing.
- **Entity discovery (any jurisdiction):** company's own About/History pages (D-1) → founding-year vs incorporation test (D-2) → registry previous-names field (D-3) → `"formerly" OR "erstwhile" OR "part of"` web search → trademark proprietor search (D-4) → registered-address cluster (D-5). Run ALL of them; they fail independently, and D-1 is the one that most often carries the answer.
- **Founder trail (Phase 2):** entity About page → `"{entity}" founder` / `"founded by"` → Crunchbase/Tracxn → incorporation-era press → registry director list AT incorporation → identifier (DIN/officer ID) → the person core set + keyword battery on that identifier.
- **Predecessor / phoenix:** former name (D-3) → IBBI mirror → NCLT/NCLAT via `site:` → Gazette / local insolvency register → continuity test (brands, address, staff, products) → the legal basis and consideration for the continuation.
- **India litigation:** Indian Kanoon → eSCR judgments portal → eCourts (district) → NCLT/NCLAT via site: → IBBI mirror. Log which layers ran; district-court coverage is inherently partial — say so.
- **India regulator:** SEBI orders.html (+ site:) → exchange debarred registers → Watchout Investors (triage only) → RBI press releases → suit.cibil.com (India egress only).
- **US person:** SALI → SEC litigation/admin search → CourtListener → DOJ site: → BrokerCheck (if ever licensed) → judyrecords/state portals.
- **UK person:** Companies House officers + disqualified register → FCA register/notices → Gazette → BAILII.
- **Global overlay (everyone):** OpenSanctions → OFAC (confirm) → World Bank debarred → Interpol public notices → OpenCorporates → adverse-media RSS.

When an entire chain is unreachable, the dossier records "coverage-limited" for that axis and the module's confidence caps bind (MODULE_RULES Score Cap Rules). Never substitute memory for a sweep: a recalled "clean" or "convicted" that the logged sweep did not return is not a finding (CLAUDE.md §3).
