# Ticker Mapping — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## 1. Carry-Forward Parties (inherited)

| Party ID | Industry | Tier | Side |
|---|---|---|---|
| DIR-001 | Housing finance companies | primary | long |
| HARM-001 | High-EBLR banks | primary | short |
| DIR-002 | Vehicle financiers / NBFCs | secondary | long |

## 2. Candidate Universe

| Ticker | Company | Exchange | Party (ref) | Side | Exposure mechanism (one line) | Exposure quantification | Investability |
|---|---|---|---|---|---|---|---|
| CANFINHOME | Can Fin Homes | NSE | DIR-001 | long | Pure-play mortgage spread on market-borrowing funding | ~100% revenue = mortgage spread [FY25 AR borrowings note — fixture] | mid-cap, liquid |
| LICHSGFIN | LIC Housing Finance | NSE | DIR-001 | long | Large pure-play HFC, heavy NCD mix | pure-play [FY25 AR — fixture] | large-cap, very liquid |
| CHOLAFIN | Cholamandalam Inv & Fin | NSE | DIR-002 | long | NBFC funding-cost decline on shorter books | diversified NBFC [FY25 AR — fixture] | large-cap, very liquid |
| FEDERALBNK | Federal Bank | NSE | HARM-001 | short | High EBLR floating retail share → NIM compression | EBLR share disclosed [FY25 AR — fixture] | liquid, futures available |

## 3. Unmappable Parties

| Party | Why no investable listed expression |
|---|---|
| — | all carry-forward parties mapped |

## 4. Verdict

Verdict: 4 candidates across 3 parties (3 long / 1 short)
