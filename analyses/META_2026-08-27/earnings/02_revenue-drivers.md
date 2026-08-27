# Revenue Drivers — META

## 1. Segment Decomposition Status

Segment decomposition applied — 2 segments from the business-model module (`analyses/META_2026-08-27/business-model/03_segment-map.md`): Family of Apps (FoA), 99.3% of Q2 FY26 revenue ($60,370m / $60,801m), and Reality Labs (RL), 0.7% ($431m / $60,801m) [Q2 2026 Form 10-Q, Note 12]. FoA clears the module's own 85% single-segment threshold, so the consolidated-level read in §§2–4 below is, in substance, an FoA read. Reality Labs is covered separately in §5 for completeness given its strategic significance (the AI/compute build-out is funded partly to serve both segments), even though its revenue share is immaterial to the consolidated total. No external alt-data or channel-check files exist under `data/META/external/` for this run; no alt-data citations appear in this report.

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Marketplace / two-sided ad platform (closest fit) | Ad impressions delivered × average price per ad |
| Multi-segment | Sum of segment revenue drivers |

**Company-specific formula:** Total revenue = FoA Advertising revenue (Ad impressions delivered × average price per ad, both figures nominal/FX-inclusive as disclosed) + FoA Other revenue (WhatsApp paid messaging, Meta Verified subscriptions, Payments fees) + Reality Labs revenue (AI-glasses and other hardware, software, content) [Q2 2026 Form 10-Q, Note 2; MD&A pp.41–42]. Meta does not disclose a standalone audience metric that ties directly into the advertising formula (it discloses daily active people, DAP, as a reach/engagement metric, and average revenue per person, ARPP, only as a concept, not a reported figure in this pool) [Q2 2026 Form 10-Q, p.3].

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand (advertiser budgets / macro ad spend) | Improving | Management attributes part of the +12% YoY average-price-per-ad increase in Q2 FY26 to "improvements in macro conditions relative to Q2 of last year" [Q2 2026 Earnings Call transcript, Jul-29-2026, CFO Susan Li prepared remarks]. Business-model `10_external-dependency.md` scores "Consumer cycle" dependency High — advertiser budgets are the single biggest external lever and Meta has no long-term commitments from marketers [`10_external-dependency.md` §1, §5]. | 85 |
| Company market share / reach | Improving, but slower than monetization | Family daily active people (DAP) 3.60bn on average for June 2026, +3% YoY — the slowest-growing of the three headline metrics (DAP, impressions, price). Instagram crossed 2bn daily actives; Threads crossed 500m monthly actives [Q2 2026 Form 10-Q, MD&A p.31; Earnings Call transcript, Jul-29-2026, CEO prepared remarks]. Ad impressions (+14% YoY) growing faster than DAP (+3%) implies the growth is coming mainly from more ads shown per user (ad load) and engagement, not new-user growth [Q2 2026 Form 10-Q, MD&A p.31]. | 55 |
| Price / realization | Improving | Average price per ad +12% YoY in Q2 FY26 (vs +9% for full-year FY2025 and +10% FY2024) — a reacceleration. Driven by "ad performance gains, improvements in macro conditions ... and currency tailwinds," partially offset by impression growth concentrated in lower-monetizing surfaces/regions [Q2 2026 Form 10-Q, MD&A p.41; Earnings Call transcript, Jul-29-2026]. | 90 |
| Product / customer / geography mix | Mixed — a drag on blended price, a lift on volume | "The online commerce vertical was the largest contributor to the increase in advertising revenue" in Q2/H1 FY26 [Q2 2026 Form 10-Q, MD&A p.41]. Ad-impression growth is concentrated in geographies (Asia-Pacific) and surfaces (Reels) that monetize at lower rates than the US/Canada and Europe base, which mechanically drags the blended average price even as it lifts impression volume [Q2 2026 Form 10-Q, MD&A pp.34, 41]. By user geography, Q2 FY26 revenue grew 32% in US & Canada, 24% in Europe, 19% in Asia-Pacific and 36% in Rest of World [Q2 2026 Form 10-Q, MD&A p.34]. | 60 |
| FX translation | Volatile / direction has flipped | FX was a favorable +$685m (Q2 FY26) / +$2.43bn (H1 FY26) tailwind to reported total revenue, but an unfavorable −$418m drag for full-year FY2025 — not a stable one-way trend [Q2 2026 Form 10-Q, MD&A p.42; FY2025 Form 10-K, MD&A]. Management's own Q3 FY26 guidance assumes FX flips back to an ~1% headwind to YoY total-revenue growth "based on current exchange rates" [Earnings Call transcript, Jul-29-2026]. This must not be read as organic demand — it is currency, and it is presently guided to reverse direction next quarter. | 40 |
| M&A / divestitures | Not a factor | No acquisition or divestiture is disclosed in the FY2025 10-K or Q2 FY26 10-Q as contributing to revenue in the periods covered by this report; growth is organic (impressions/price), not inorganic. | — |

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Ad impressions delivered (volume) | +14% YoY (Q2 FY26); +16% YoY (H1 FY26); +12% FY2025 full year | Improving / Accelerating | High | [Q2 2026 Form 10-Q, MD&A p.41]; [FY2025 Form 10-K, MD&A] |
| Average price per ad (realization) | +12% YoY (Q2 FY26, both Q2 and H1); +9% FY2025 full year | Improving / Accelerating | High | [Q2 2026 Form 10-Q, MD&A p.41] |
| Family daily active people (DAP) — reach | 3.60bn average, +3% YoY | Improving, but the slowest-growing headline metric | Mid | [Q2 2026 Form 10-Q, MD&A p.31] |
| FX translation | +$685m (Q2 FY26, favorable); guided to an ~1% headwind for Q3 FY26 | Volatile — reversing | Mid | [Q2 2026 Form 10-Q, MD&A p.42]; [Earnings Call transcript, Jul-29-2026] |
| Regulation / ad-data-signal access (GDPR, DMA, DSA, browser/OS restrictions) | Ongoing constraint; company states it has "adversely affected revenue" and expects "further impact" | Deteriorating (structural headwind, not reversing) | High (undisclosed exact $ sensitivity, but management's own language is that past impact was material) | [Q2 2026 Form 10-Q, MD&A pp.32–33]; corroborated by `10_external-dependency.md` §1 (Regulation scored High) |
| FoA Other revenue (WhatsApp paid messaging, Meta Verified subscriptions, Payments) | $1,007m Q2 FY26, +73% YoY, off a small base (1.7% of total revenue) | Improving | Low | [Q2 2026 Form 10-Q, Note 2; MD&A p.41] |
| Reality Labs revenue (AI glasses, Meta Quest, software) | $431m Q2 FY26, +16% YoY (H1 FY26 +7%); AI glasses up, Meta Quest down | Mixed within segment; net Improving but on an immaterial base | Low | [Q2 2026 Form 10-Q, Note 12; MD&A p.41] |
| Enterprise / compute monetization (agentic tools, API, direct compute sales to large customers) | Nascent; no revenue figure disclosed; management states it is not providing a 2027 capex outlook or a monetization figure yet | Unknown / not yet a driver | Low today (undisclosed dollar contribution); could become material later | [Earnings Call transcript, Jul-29-2026, CEO and CFO prepared remarks and Q&A] |
| Q4 seasonality (holiday advertising demand) | Q4 has averaged 29.6% of annual revenue over FY2023–FY2025, right at the report's own 30% flag threshold | Stable, recurring | High on a QoQ basis (recurring, not incremental) | Carried from `01_historical-financials.md` §5, itself citing [FY2025 Form 10-K, Item 7, Revenue Seasonality] |

Magnitude bands per this module's convention: High >5% revenue impact from a reasonable move, Mid 2–5%, Low <2%.

## 5. Revenue Drivers By Segment

### Segment: Family of Apps (99.3% of Q2 FY26 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Ad impressions delivered | +14% YoY Q2 FY26 | Improving | High | [Q2 2026 Form 10-Q, MD&A p.41] |
| Average price per ad | +12% YoY Q2 FY26 | Improving | High | [Q2 2026 Form 10-Q, MD&A p.41] |
| DAP (reach) | 3.60bn, +3% YoY | Improving, slowest of the three | Mid | [Q2 2026 Form 10-Q, MD&A p.31] |
| Regulation / data-signal access | Ongoing EU consent-model engagement (GDPR/DMA/DSA); no financial quantification disclosed | Deteriorating | High (qualitative) | [Q2 2026 Form 10-Q, MD&A pp.32–33] |
| FoA Other (WhatsApp paid messaging, subscriptions) | $1,007m, +73% YoY | Improving | Low | [Q2 2026 Form 10-Q, Note 2] |

### Segment: Reality Labs (0.7% of Q2 FY26 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| AI glasses sales | Higher sales cited as the driver of the segment's Q2/H1 FY26 revenue increase | Improving | Low (segment itself is 0.7% of total revenue) | [Q2 2026 Form 10-Q, MD&A p.41] |
| Meta Quest (VR headset) sales | "Partially offset by lower Meta Quest sales" | Deteriorating | Low | [Q2 2026 Form 10-Q, MD&A p.41] |
| Segment operating loss | $(4,619)m Q2 FY26 operating loss (−1,072% operating margin); management expects full-year 2026 RL operating losses to stay similar to FY2025's $19.19bn loss | Not a revenue driver, but caps how much the segment can be scaled without margin consequence — flagged for `03_margin-drivers` | — | [Q2 2026 Form 10-Q, Note 12]; [Q2 2026 Form 10-Q, MD&A] |

The remainder of the business (no Corporate/Other segment is reported; FoA and RL reconcile exactly to consolidated revenue) [`03_segment-map.md` §3].

## 6. Revenue Growth Decomposition

Basis: three months ended June 30, 2026 vs three months ended June 30, 2025 (the latest reported quarter), all figures nominal/as-reported (not constant-currency) unless stated. Total revenue grew from $47,516m to $60,801m, +27.96% (reported as "28%") [Q2 2026 Form 10-Q, Note 2].

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Advertising revenue (volume × price; see §6a for the sub-decomposition) | +26.94pp | $12,800m increase ÷ $47,516m prior-period total revenue [Q2 2026 Form 10-Q, Note 2] |
| FoA Other revenue (WhatsApp paid messaging, subscriptions) | +0.89pp | $424m increase ÷ $47,516m [Q2 2026 Form 10-Q, Note 2] |
| Reality Labs revenue | +0.13pp | $61m increase ÷ $47,516m [Q2 2026 Form 10-Q, Note 2] |
| FX (memo only — already embedded in the Price sub-component of Advertising above; not additive; see §6a) | $0pp incremental (embedded) | [Q2 2026 Form 10-Q, MD&A p.42] |
| Acquisitions / divestitures | 0pp | None disclosed [FY2025 Form 10-K; Q2 2026 Form 10-Q] |
| **Total revenue growth** | **+27.96pp (≈28%)** | [Q2 2026 Form 10-Q, Note 2] |

The three components (Advertising, FoA Other, Reality Labs) are an exact accounting identity against the reported dollar figures — they sum to the stated total with no residual, because each is a directly reported dollar change, not a modelled estimate. The modelling (and its residual) happens one level down, inside the Advertising line — see §6a.

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

**Advertising revenue's 26.94pp is sub-decomposed here into volume and price**, using the two ratios Meta itself discloses for Family of Apps, Q2 FY26 vs Q2 FY25 (same segment, same quarter, nominal/FX-inclusive basis — both ratios are measured on this identical basis, so combining them is valid):

```
Volume:  Ad impressions delivered +14% YoY (FoA, Q2 FY26 vs Q2 FY25) × prior-period ad revenue $46,563m
  = $6,519m modelled dollar contribution
  = 13.72pp of the 27.96pp total revenue growth observed
  → basis matches (same segment, same quarter, nominal) — applied cleanly

Price:  Average price per ad +12% YoY (FoA, Q2 FY26 vs Q2 FY25, nominal — INCLUDES FX and macro effects per management's own commentary) × prior-period ad revenue $46,563m
  = $5,588m modelled dollar contribution
  = 11.76pp of the 27.96pp total revenue growth observed
  → basis matches (same segment, same quarter) — applied cleanly, but this figure is NOT constant-currency; see the FX memo below before treating it as "pure" pricing power

Volume × Price interaction (mathematical cross-term, since (1+v)(1+p)-1 = v + p + vp):
  14% × 12% × prior-period ad revenue $46,563m = $783m
  = 1.65pp of the 27.96pp total revenue growth observed
  → this is an arithmetic necessity of combining two multiplicative growth rates, not a separate business driver
```

**Reconciliation:** Volume (13.72pp) + Price (11.76pp) + interaction (1.65pp) = 27.13pp modelled dollar effect on advertising revenue = $12,889m, against the advertising line's actual reported increase of $12,800m [Q2 2026 Form 10-Q, Note 2]. Residual = $12,800m − $12,889m = **−$89m, or −0.19pp of total revenue** — the modelled volume/price combination very slightly *overshoots* the actual advertising-revenue increase. This is consistent with the two headline growth rates (14%, 12%) being disclosed as rounded whole percentages rather than exact figures; the gap is immaterial (0.7% of the modelled ad-revenue increase) and is shown, not rounded away.

Full component build against the Section 6 Total: Volume 13.72pp + Price 11.76pp + interaction 1.65pp + residual −0.19pp (= Advertising's 26.94pp) + FoA Other 0.89pp + Reality Labs 0.13pp = **27.96pp reconciled, ~0pp unexplained** (the only unreconciled amount is the −0.19pp residual inside the volume/price ratio itself, already stated above).

**FX basis flag — refused as a separate additive line.** Meta's own constant-currency disclosure shows FX added $693m to advertising revenue and $685m to total revenue in Q2 FY26 [Q2 2026 Form 10-Q, MD&A p.42]. That $693m is **already inside** the Price line above (management's own words: the 12% price-per-ad increase was driven in part by "currency tailwinds" [Earnings Call transcript, Jul-29-2026]). Adding a further FX line to the table would double-count roughly $693m (≈1.46pp of total revenue) that the Price ratio was measured on. This report therefore treats FX as a memo item on the basis it was actually measured (a constant-currency comparison against as-reported revenue), not as a component to sum: on that basis, price-per-ad growth **excluding** the disclosed FX effect is approximately 11.76pp − 1.46pp ≈ **10.30pp** of total revenue, versus the as-reported 11.76pp. The gap between those two figures (≈1.46pp) is the part of "Price" that is currency, not ad-tech or demand improvement — a distinction the next quarter's guidance makes concrete, since management now assumes FX flips to an ~1% headwind for Q3 FY26 [Earnings Call transcript, Jul-29-2026].

**What this supports for §7:** Volume (13.72pp) explains just under half — 49.1% — of the 27.96pp total revenue growth on its own; Price (11.76pp) explains 42.1%. Both clear "roughly half" loosely, but Volume is the larger and the one whose contribution requires no FX caveat to interpret.

## 7. The Single Biggest Revenue Driver

**Ad impressions delivered (the volume side of the advertising formula)** is the single biggest driver of Meta's revenue over the next 3–12 months. It contributed 13.72pp of the 27.96pp Q2 FY26 revenue growth (49.1% on its own, per §6a) — the largest single modelled component — and its current direction is improving and accelerating: +14% YoY in Q2 FY26 and +16% YoY for H1 FY26, both faster than the +12% posted for full-year FY2025 and the +11% for FY2024 [Q2 2026 Form 10-Q, MD&A p.41; FY2025 Form 10-K, MD&A]. A 10–20% swing in impressions growth would move total revenue by a comparable order of magnitude given advertising is ~98% of consolidated revenue, making this the clearest High-magnitude lever in §4. Average price per ad is a close second (42.1% of the same growth) and cannot be dismissed — but its recent strength is partly currency (≈1.46pp of the 11.76pp, per §6a's FX memo) and it is the direct transmission channel for the one identified structural headwind in this report: management's own words that ad-targeting regulation (GDPR/evolving CJEU interpretation, DSA, DMA, and browser/OS data restrictions) "has adversely affected revenue" and is expected to have "further impact" [Q2 2026 Form 10-Q, MD&A pp.32–33]. Cycle read (Cycle-Position Rule): based on the data available in this pool (FY2021 onward), Meta's revenue growth has accelerated in every year since the FY2022 trough (−1.1% → +15.7% → +21.9% → +22.2%, then +26–33% on a quarterly YoY basis through H1 FY26) with no evidence yet of deceleration — this reads as an **extended upcycle, not (on present evidence) a peak or a trough**; the pool contains no pre-FY2021 baseline, so a true multi-year "record high" cannot be confirmed, only that the run has not yet turned. No one-time policy, tax, or subsidy tailwind is identified as inflating current-period *revenue* (the two one-off tax items disclosed for Q3 FY25 and Q1 FY26 hit EPS through the tax line only, not revenue or operating income — see `01_historical-financials.md` §4) — the growth reads as broad-based (both impressions and price up, all four geographic regions growing), not a base-effect artifact. Management's own Q3 FY26 guidance ($61bn–$64bn total revenue, implying +19.0% to +24.9% YoY against Q3 FY25's $51,242m, and assuming an ~1% FX headwind) points to a deceleration from Q2's +28% print, which is the first forward-looking signal in this data that the upcycle's pace, if not its direction, may be moderating [Earnings Call transcript, Jul-29-2026, CFO Susan Li prepared remarks].
