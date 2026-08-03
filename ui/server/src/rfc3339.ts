// Strict timestamp boundary for machine-readable engine artifacts. Date.parse alone accepts date-only
// strings and normalizes impossible dates on some runtimes; both are unsafe for freshness and replay.

const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|([+-])(\d{2}):(\d{2}))$/

export function parseRfc3339Ms(value: unknown): number {
  if (typeof value !== 'string') return NaN
  const match = RFC3339.exec(value)
  if (!match) return NaN
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  const offsetHour = match[8] == null ? 0 : Number(match[8])
  const offsetMinute = match[9] == null ? 0 : Number(match[9])
  if (
    year < 1900 || month < 1 || month > 12 || day < 1 ||
    day > new Date(Date.UTC(year, month, 0)).getUTCDate() ||
    hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59
  ) return NaN
  return Date.parse(value.replace('t', 'T').replace(/z$/, 'Z'))
}

export function isRfc3339(value: unknown): value is string {
  return Number.isFinite(parseRfc3339Ms(value))
}
