// Client-side mirror of the server's ticker rules (ui/server/src/sandbox.ts) — for INSTANT inline
// feedback in the Add-company form. The server stays authoritative: POST /api/tickers re-validates and
// is the only thing that actually creates the folder. Keep these rules identical to the server's.
export const TICKER_RE = /^[A-Z0-9.\-]{1,15}$/

export function isValidTicker(name: string): boolean {
  // a real symbol needs at least one letter/digit — reject all-punctuation names like ".", "..", "---".
  return TICKER_RE.test(name) && /[A-Z0-9]/.test(name)
}

export function suggestTicker(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9.\-]/g, '').slice(0, 15)
}

export function tickerInvalidReason(name: string): string | null {
  if (isValidTicker(name)) return null
  if (/\s/.test(name)) return 'ticker names can’t contain spaces'
  if (/[a-z]/.test(name)) return 'ticker names must be uppercase'
  if (name.length > 15) return 'ticker name is too long (max 15 characters)'
  if (!/[A-Z0-9]/.test(name)) return 'ticker needs at least one letter or number'
  return 'ticker names allow only A–Z, 0–9, dot and hyphen'
}
