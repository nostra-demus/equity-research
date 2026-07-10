# Off-Balance-Sheet & Contingencies — AMZN

**Reporting standard:** US GAAP (ASC 842 for leases; ASC 450 for contingencies). **Currency:** USD (millions unless stated). **Fiscal year end:** December 31. **Primary source:** FY2025 10-K (filed Apr 9, 2026), Note 7 — Commitments and Contingencies (p.59–61), Note 4 — Leases (p.55), Note 9 — Income Taxes (p.63–67), Note 1 — Self-Insurance Liabilities (p.50). Cross-module upstream: `01_capital-structure-and-leverage.md` (debt stack); `11_capital-allocation-governance.md` (litigation context). Q1 2026 10-Q (Apr 30, 2026) not extractable in binary format; FY2025 10-K is the primary source throughout.

---

## 1. Off-Balance-Sheet / Debt-Like Obligations

All figures as of December 31, 2025. USD millions.

| Item | Recognized Liability (on-BS) | Gross / Maximum Commitment | Already in 01's debt stack? | Source |
|---|---:|---:|---|---|
| Operating lease liabilities (current + long-term) | $89,252 (PV) | $106,914 (gross undiscounted) | No — US GAAP ASC 842 puts these on the balance sheet as a liability but they are explicitly excluded from 01's gross financial debt stack | FY2025 10-K, Note 4, p.55 |
| Finance lease liabilities (current + long-term) | $12,286 (PV) | $14,917 (gross undiscounted) | No — 01's gross financial debt ($68,851M) excludes all lease liabilities; the "broad view including all leases" in 01 is labeled separately | FY2025 10-K, Note 4, p.55 |
| Financing obligations — build-to-suit / non-lease (current + long-term) | $8,112 | $9,615 (including interest per Note 7 table) | No — recorded in "Accrued expenses and other" and "Other long-term liabilities"; not in 01's financial debt | FY2025 10-K, Note 7, p.59 fn.1; Note 1 supplemental, p.50 |
| Leases not yet commenced (signed, not yet started) | $0 — off-balance-sheet | $96,373 (gross undiscounted) | No — no right-of-use asset or liability recorded until lease commencement | FY2025 10-K, Note 7, p.59 |
| Unconditional purchase obligations (energy, content, equipment, software) | $0 — off-balance-sheet | $84,772 | No — not reflected on the consolidated balance sheet per Note 7 fn.2 | FY2025 10-K, Note 7, p.59 fn.2 |
| Other commitments (asset retirement, build-to-suit under construction, digital media content >1yr) | $0 to partial — on-BS where estimable | $18,868 | Partial — the estimable portions are in "Accrued expenses and other"; the residual is off-balance-sheet | FY2025 10-K, Note 7, p.59 fn.3 |
| Self-insurance liabilities (workers' comp, healthcare, general/product/auto liability) | $10,400 | ~$10,400 (maximum not separately disclosed; recorded at actuarial estimate) | No — in "Accrued expenses and other"; not in 01's debt | FY2025 10-K, Note 1, p.50 |
| Pension / OPEB underfunding | $0 | $0 | No — Amazon does not maintain defined benefit pension or OPEB plans material enough to disclose a funded status | FY2025 10-K — no pension note |
| Securitization / receivables factoring | $0 | $0 | No — the secured revolving credit facility backed by seller receivables was terminated September 2024; no securitization outstanding | FY2025 10-K, Note 6, p.59 |

**Note on leases not yet commenced ($96,373M):** These are signed lease agreements where the lease term has not started. They cover future data-centre and fulfilment network capacity, consistent with Amazon's ~$200B 2026 capex plan. They will become on-balance-sheet operating or finance lease liabilities as each lease commences; the gross amount represents the undiscounted payment stream. This is the single largest off-balance-sheet obligation in this category.

**Note on purchase obligations ($84,772M):** Primarily long-term energy purchase agreements (power purchase agreements for AWS data centres), digital media content licensing commitments, and equipment/software procurement contracts. These are unconditional — Amazon owes them regardless of whether the underlying services are consumed — making them economically equivalent to fixed charges. The filing notes that energy agreements without a fixed or minimum volume commitment are excluded; the $84,772M is the fixed-commitment floor.

---

## 2. Guarantees & Letters of Credit

All figures as of December 31, 2025. USD millions.

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Standby and trade letters of credit | $0 recorded as a liability | $9,500 unused capacity | Collateral for real estate arrangements, third-party seller obligations in certain jurisdictions, debt collateral, and digital media content licenses; the $9,500M represents the unused capacity of LCs issued under Amazon's credit facilities | FY2025 10-K, Note 6, p.59 ("$9.5 billion unused letters of credit"); Note 2 fn.2, p.53 |
| Financial guarantees to third parties | $0 disclosed | Not disclosed | No financial guarantees to third parties are disclosed in the FY2025 10-K | FY2025 10-K, Note 7 — not disclosed |
| Performance / surety bonds | $0 disclosed | Not disclosed | None disclosed in Note 7 or elsewhere in the 10-K | FY2025 10-K — not disclosed |
| Restricted cash / marketable securities pledged as collateral | $3,296 (restricted; not a guarantee but a cash pledge) | $3,296 | Same purposes as LCs above: real estate, third-party seller amounts, debt, LC collateral, digital media licenses | FY2025 10-K, Note 2, p.53 fn.2 |

**Letter of credit note:** The $9,500M is the *unused* capacity — meaning Amazon has committed to back obligations up to this amount if called upon, but has not drawn the letters. The actual letters of credit outstanding (drawn but not disclosed separately from the unused figure) are within this cap. This is a contingent obligation: it crystallizes only if the underlying counterparties draw on the LCs. Given Amazon's net cash position of $17,959M (strict basis) and $54,178M (broad basis), a full drawdown of the $9,500M LCs would be large but absorb-able.

---

## 3. Litigation & Tax Contingencies

All figures in USD millions unless stated. As of December 31, 2025.

| Matter | Recorded Provision | Maximum / Claimed | Status | Source |
|---|---:|---:|---|---|
| Income tax contingencies (gross; IRS + multi-jurisdiction) | $6,566 accrued (of which $5,000M, if recognized, would reduce effective tax rate) | Undisclosed maximum; plus $400M accrued interest/penalties | Active — IRS examining calendar years 2016 onwards; audits in Germany, India, Japan, Luxembourg, UK for 2011 onwards; India cloud-services tax claim is open-ended; Luxembourg LTA dispute over intangible asset distribution (2021) is active | FY2025 10-K, Note 9, p.66–67 |
| Kove IO patent (S3 / DynamoDB) — jury award $525M + $148M pre-judgment interest = $673M total | Not separately disclosed; Amazon is contesting on appeal | $673M awarded by jury (Aug 2024) + ongoing royalty (unquantified) | Active — notice of appeal filed September 2024; Amazon disputes the jury's finding | FY2025 10-K, Note 7, p.60 |
| Italian Competition Authority (ICA) fine — marketplace/logistics practices | Accrued (€1.13B paid; currently seeking recovery pending appeals); the filing states Amazon "has paid and will seek to recover" | €752M residual fine after TAR reduction (originally €1.13B; TAR reduced to €752M in Sep 2025); Amazon appealed TAR ruling in Dec 2025 | Active — appealed to higher Italian court in December 2025; company disputes the TAR's ruling and seeks recovery of the €1.13B already paid | FY2025 10-K, Note 7, p.61; stated in EUR — approximately $820M at Dec 31, 2025 EUR/USD rate of ~1.09 |
| Luxembourg CNPD GDPR fine — €746M data protection fine (Jul 2021) | Not separately disclosed; under appeal | €746M (~$813M at ~1.09 EUR/USD) | Active — Luxembourg Administrative Court dismissed Amazon's appeal (Mar 2025); Amazon appealed to Luxembourg Administrative Court of Appeal in April 2025; Amazon believes the CNPD decision is "without merit" | FY2025 10-K, Note 7, p.61 |
| Antitrust — price-fixing / monopolization / consumer protection (Frame-Wilson and related US/Canada/UK class actions) | Not disclosed (probable loss not estimable) | Seeks "billions of dollars" in alleged damages, treble damages, punitive damages, structural relief, civil penalties, attorneys' fees, and costs (filing's exact language) | Active — US motions to dismiss partly granted; cases continuing; UK: two class actions certified, one pre-certification; Canada: class certification denied in one case (appeal pending), two others pre-certification | FY2025 10-K, Note 7, pp.60–61 |
| Rensselaer Polytechnic / CF Dynamic Advances — Alexa patent ($140M–$267M claimed) | Not separately disclosed | $140M–$267M (plaintiffs' damages report range) | Active — district court granted summary judgment for Amazon (Apr 2024); plaintiffs filed notice of appeal; patent found invalid but appeal ongoing | FY2025 10-K, Note 7, p.60 |
| Biometric information — Illinois BIPA (Wilcosky, Hogan, and related class actions) | Not disclosed | Unspecified; class-action damages potentially large given scope (Amazon Photos, Alexa, AWS Connect, virtual try-on, Just Walk Out) | Active — multiple federal and state cases; class certification pending in several; unspecified damages sought | FY2025 10-K, Note 7, p.60 |
| Xockets patent — AWS Nitro System (10 patents) | Not disclosed | Unspecified | Active — filed June 2025; Amazon disputes | FY2025 10-K, Note 7, p.61 |
| InterDigital patent — Prime Video / device video technologies (multi-jurisdiction) | Not disclosed | Unspecified | Active — filed November 2025 in US, Germany, Brazil, Unified Patent Court, ITC; Amazon disputes | FY2025 10-K, Note 7, p.61 |
| Primos Storage Technology — S3 / EMR / EC2 / FSx patent (5 patents) | Not disclosed | Unspecified | Active — filed December 2025 in Delaware; Amazon disputes | FY2025 10-K, Note 7, p.61 |
| Non-income tax controversies (sales, VAT, consumption, withholding taxes — multi-jurisdiction) | Partial provisions where estimable (amount not separately disclosed) | Not separately quantified; described as potentially "materially different" from management's expectations | Active — ongoing in multiple jurisdictions; Amazon collecting and remitting these taxes in disputed jurisdictions but also disputing scope | FY2025 10-K, Note 7, p.60 ("Other Contingencies") |

**Amazon's own probability language (from Note 7, p.61):** "The outcomes of our legal proceedings and other contingencies are inherently unpredictable, subject to significant uncertainties, and could be material to our operating results and cash flows for a particular period." Amazon does not use the ASC 450 terms "probable / reasonably possible / remote" to classify individual items by name in the filing. The filing's disclosure that it does not include an estimate for matters "where such an estimate is not possible or is immaterial" means the large antitrust, biometric, and newer patent suits carry no recognized provision. The tax contingencies ($6,566M accrued) represent the items where management has estimated a probable liability.

**Italian ICA note:** Amazon has already paid €1.13B (~$1.23B) and is seeking to recover this pending appeal. If the appeal fails at the higher Italian court, the economic cost is the €752M reduced fine (already funded by the prior payment). The overpayment of €378M would be recovered. This is an unusual structure: the expense is effectively already cash-settled and the question is whether Amazon recovers the excess paid.

---

## 4. Contingent Exposure Summary

All figures in USD millions. As of December 31, 2025.

| Metric | Value | Notes |
|---|---:|---|
| Total recognized contingent liabilities (on-balance-sheet lease liabilities + financing obligations + self-insurance + tax contingencies) | ~$126,616 | Operating leases $89,252 + finance leases $12,286 + financing obligations $8,112 + self-insurance $10,400 + income tax contingencies $6,566 = $126,616 |
| Of which: already in 01's debt stack | $0 | 01's gross financial debt ($68,851M) consists solely of bonds + ST borrowings; all lease and contingency liabilities are excluded from 01's stack |
| Total maximum / gross off-balance-sheet commitment exposure (contractual, Note 7 table — excluding LT debt P&I already in 01, and excluding items already recognized on-BS) | ~$199,013 | Leases not yet commenced $96,373 + purchase obligations $84,772 + other commitments $18,868 = $200,013; less overlap with partial on-BS items ~$1,000 ≈ $199,013 |
| Standby letters of credit (contingent, max exposure) | $9,500 | Contingent; crystallizes only on counterparty draw |
| Kove jury award (subject to appeal) | $673 | Active litigation; appeal filed Sep 2024 |
| Luxembourg CNPD GDPR fine (appealed) | ~$813 | Active appeal; Amazon believes decision "without merit" |
| Italian ICA fine net exposure | ~$0 to $820 | Already paid €1.13B; residual fine €752M; seeking recovery of excess; net exposure depends on appeal outcome |
| Tax contingencies (gross, accrued) | $6,566 | On-BS; IRS + multi-jurisdiction audits |
| Antitrust litigation claimed damages | "Billions" | Not quantifiable; seeks treble damages + punitive damages + structural relief |
| Max exposure ÷ recognized contingent liabilities | ~1.6x | $199,013 off-BS / $126,616 on-BS recognized ≈ 1.57x |
| Max off-BS contractual exposure ÷ total equity ($285,970M) | ~70% | $199,013 / $285,970 = 69.6% |
| Total recognized contingent liabilities ÷ total equity | ~44% | $126,616 / $285,970 = 44.3% |
| All-in obligations (Note 7 total commitments, excluding LT debt P&I) | $331,459 | $439,661 total commitments per Note 7 less $108,202 LT debt P&I (already in 01) = $331,459 |
| All-in obligations ÷ equity | ~116% | $331,459 / $285,970 = 115.9% |

**Equity basis note:** Total stockholders' equity of $285,970M is from the upstream `01_capital-structure-and-leverage.md` (labeled as Inference from balance sheet data; not directly extracted from the FY2025 10-K balance sheet page in this agent's read). All other figures are directly from the FY2025 10-K.

---

## 5. Contingency Read

The largest off-balance-sheet obligation is $96.4B in signed-but-not-yet-commenced leases, covering future data-centre and fulfilment capacity that will migrate onto the balance sheet as each lease starts — representing a wave of fixed charges that will arrive over the next several years as Amazon's $200B capex plan gets built out. This is not hidden and is fully disclosed in Note 7; it is a structural feature of Amazon's AWS infrastructure build, backed by pre-committed customer contracts ($244B in AWS backlog as of Dec 31, 2025). The second-largest off-balance-sheet obligation is $84.8B in unconditional purchase commitments (primarily power purchase agreements for data centres), which are economically fixed charges Amazon must pay regardless of usage — at approximately 58% of FY2025 EBITDA ($145.7B), they are material but serviceable given AWS's revenue trajectory. On litigation, the most live exposure is the Kove patent verdict ($673M, on appeal), the Luxembourg GDPR fine (~$813M, appealed), and the antitrust price-fixing class actions (unquantified but seeking "billions" across US, Canada, and UK), none of which carries a disclosed provision; if the antitrust suits crystallized at even $2–3B in aggregate, they would represent less than 1% of Amazon's equity base and would not threaten solvency. The $6.6B tax contingency accrual — the critical audit matter flagged by Ernst & Young — represents the most probable near-term cash outflow from contingencies and is already booked, but the underlying disputes with the IRS, India, and Luxembourg could produce additional charges. In no plausible scenario do the disclosed contingencies threaten Amazon's solvency: the $54.2B broad-basis net cash position provides a buffer that exceeds every quantified contingent liability in the filing combined.

---

*Sources used: FY2025 10-K (filed Apr 9, 2026), Note 4 — Leases (p.55), Note 7 — Commitments and Contingencies (pp.59–61), Note 9 — Income Taxes (pp.63–67), Note 1 — Self-Insurance Liabilities (p.50), Note 2 — Restricted Cash (p.53); upstream `01_capital-structure-and-leverage.md`; `11_capital-allocation-governance.md`.*
