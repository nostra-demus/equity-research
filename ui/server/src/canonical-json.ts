/**
 * Cross-runtime canonical JSON shared with scripts/canonical_json.py.
 *
 * JSON.stringify supplies ECMAScript number spelling and string escaping. The explicit walk rejects
 * JavaScript-only values instead of silently omitting/coercing them. Object text is emitted directly:
 * putting sorted keys into a temporary object would re-order integer-index keys and break Python parity.
 */

function hasLoneSurrogate(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const unit = value.charCodeAt(i)
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(i + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true
      i++
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return true
  }
  return false
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

export function canonicalJsonText(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') {
    if (hasLoneSurrogate(value)) throw new TypeError('canonical JSON strings cannot contain lone UTF-16 surrogates')
    return JSON.stringify(value)
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('canonical JSON numbers must be finite')
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new TypeError('canonical JSON integral numbers must be within JavaScript safe-integer range')
    }
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) {
    const out: string[] = []
    for (let index = 0; index < value.length; index++) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) throw new TypeError('canonical JSON arrays cannot be sparse')
      out.push(canonicalJsonText(value[index]))
    }
    return `[${out.join(',')}]`
  }
  if (record(value)) {
    const prototype = Object.getPrototypeOf(value)
    if ((prototype !== Object.prototype && prototype !== null) || Object.getOwnPropertySymbols(value).length) {
      throw new TypeError('canonical JSON objects must contain JSON-only properties')
    }
    const out: string[] = []
    for (const key of Object.keys(value).sort()) {
      if (hasLoneSurrogate(key)) throw new TypeError('canonical JSON keys cannot contain lone UTF-16 surrogates')
      out.push(`${JSON.stringify(key)}:${canonicalJsonText(value[key])}`)
    }
    return `{${out.join(',')}}`
  }
  throw new TypeError('canonical JSON cannot contain undefined, bigint, symbol, or function values')
}
