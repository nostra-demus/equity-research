# Signal Intake & Gate 0 — SIG-20260613-4bbcdeae

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260613-4bbcdeae |
| Event ID (sha256-12) | EVT-e453d65c1cc5 |
| Input nature | news_headline |
| Input datetime | 2026-06-13T17:39:50.949Z |
| Headline | Intel Just Got a Rare Double Upgrade From Bank of America. Here's the AI Shift Behind the Call. |
| Source name (as given / canonical) | The Motley Fool / The Motley Fool |
| Source URL | https://www.fool.com/investing/2026/06/13/intel-just-got-a-rare-double-upgrade-from-bank-of/?source=iedfolrf0000001 |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "The Motley Fool" in `sources.signal_gate.allowed` (SWARM.md, expanded coverage block).
- **Source grade:** B — The Motley Fool is a secondary investment commentary outlet reporting on a Bank of America analyst action; the underlying primary event (the BofA analyst note / upgrade) would be Grade A, but this article is the secondary source covering it.
- **approved_source_check:** true

## 3. Dedup Pre-Check

sha256 input (lowercased, whitespace-collapsed headline + "|" + source_url):
`intel just got a rare double upgrade from bank of america. here's the ai shift behind the call.|https://www.fool.com/investing/2026/06/13/intel-just-got-a-rare-double-upgrade-from-bank-of/?source=iedfolrf0000001`

sha256 result: `e453d65c1cc51404b1b0fbe5b7fe5cce150a13f624fd3e82ce1fdd199b591d8e`
event_id: `EVT-e453d65c1cc5`

- **event_id match in ledger:** No — no entry with EVT-e453d65c1cc5 found in `screener/ledger/events.ndjson`.
- **URL match in ledger:** No — no entry containing `fool.com/investing/2026/06/13/intel` found in the ledger.

## 4. Gate Decision

Both gates clear. The source, The Motley Fool, is present on the approved list in the swarm manifest. It is a Grade B source: a secondary outlet reporting on a Bank of America analyst upgrade of Intel; the underlying primary event is an institutional analyst action (a BofA double upgrade), and M0.1 should seek to confirm from a primary source (Reuters, Bloomberg, or similar on-list newswire) or from the Bank of America research note itself if available. No prior record of this URL or event_id exists in the ledger, so this is not a resubmission. The signal proceeds to the next signal-gate module.

## Routing

Routing: Proceed
Next module: signal-gate continues
