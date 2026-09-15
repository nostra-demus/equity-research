> Targeted correction published 2026-09-15. Operating forecasts and the $106.79 price remain dated 2026-09-14. This report replaces the affected valuation output; unaffected modules are reused with lineage in `maintenance_lineage.json`. No new specialist execution is claimed.

# AKAM — Price, debt and economic share anchor

## 1. Decision price and capitalization

The Capital IQ Comps Financial Data worksheet reports price **$106.79** and current shares **143.700m**, as of 2026-09-14. Their product is current market capitalization **$15,345.723m**. These vendor observations are not filing numbers. [Capital IQ Comps, Financial Data, Day Close Price Latest and Shares Outstanding Latest, 2026-09-14; canonical ciq_facts.json]

## 2. Debt and cash bridge

| Item | USD millions | Source / meaning |
|---|---:|---|
| Convertible debt carrying amount | 7,562.828 | Q2 FY2026 Form 10-Q, Note 7, p.19 |
| Convertible cash principal | 7,640.000 | Q2 FY2026 Form 10-Q, Note 7, pp.17–19 |
| Cash and equivalents | 1,480.257 | Q2 FY2026 Form 10-Q, balance sheet, p.3 |
| **Strict net debt, carrying basis** | **6,082.571** | 7,562.828 − 1,480.257; no securities netted |
| Principal less cash sensitivity | 6,159.743 | 7,640.000 − 1,480.257 |
| Debt fair value | 8,674.998 | Q2 FY2026 Form 10-Q, Note 7, p.19; includes embedded conversion economics |
| Current market EV, strict carrying bridge | 21,428.294 | 15,345.723 + 6,082.571 |

The filing requires settlement of principal in cash on conversion, with value above principal paid in cash or shares. Therefore a share correction does not justify removing all convertible debt. [Q2 FY2026 Form 10-Q, Note 7, p.18]

## 3. Economic diluted working shares

GAAP Q2 diluted weighted-average shares are **153.686m = 144.660m basic + 3.673m stock awards + 5.353m note conversion dilution**. GAAP EPS excludes the purchased note-hedge benefit. The filing separately shows the **5.353m** hedge adjustment in its economic/non-GAAP diluted share reconciliation. Subtracting that matched benefit gives **148.333m** economic diluted working shares. [Q2 FY2026 Form 10-Q, Note 13, p.25; Note 7, pp.19–20; MD&A non-GAAP diluted-share reconciliation, p.39]

This is a period-average working count, not a verified point-in-time fully diluted count. The 3.673m award dilution is the disclosed period treasury-stock-method result. Current award quantities and strike details are insufficient for an exact September 14 reconstruction. Purchased hedges offset note-conversion premiums; sold warrants are separate. The lowest disclosed warrant strike is $155.02, above all four canonical scenario prices. Any scenario above a warrant strike must include its incremental claim. The calculation artifact solves that claim explicitly rather than assuming all future dilution is zero. [Q2 FY2026 Form 10-Q, Note 7, pp.19–20]

## 4. Anchor Block

Forward fair values and reverse solves use **148.333m** economic working shares and **$6,082.571m** strict net debt. At $106.79, the reverse model must target **$15,840.48107m equity = 106.79 × 148.333**, and **$21,923.05207m enterprise value**. This is a synthetic value on the working diluted basis, not current observed market capitalization. The observed 143.700m shares remain valid for current market cap only. Mixing its $21,428.294m EV with 148.333m fair-value shares would fail to reproduce the quoted price.

Using principal rather than carrying debt lowers every below-strike price by **$0.520262 = (7,640.000 − 7,562.828) / 148.333**. This does not reverse the decision. The filing's debt fair value is disclosed but is not silently substituted into the bridge without matching the purchased hedge and embedded conversion-option valuation.
