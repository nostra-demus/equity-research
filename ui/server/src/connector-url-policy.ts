// Security boundary for connector source URLs.  Source URLs cross from user/model-controlled
// pipeline data into a privileged coding agent, so syntax, origin and resolved addresses are
// re-established server-side at every persistence/dispatch boundary.  Callers get only null on
// failure: an error must never echo a URL which may contain a credential.

import { lookup as dnsLookup } from 'node:dns/promises'
import { BlockList, isIP } from 'node:net'

export interface SafeConnectorUrl {
  url: string
  host: string
}

export interface BoundConnectorUrls {
  source: SafeConnectorUrl
  endpoint: SafeConnectorUrl
}

export type ConnectorLookup = (hostname: string) => Promise<readonly { address: string; family: number }[]>

const DNS_NAME_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
function credentialQueryKey(key: string): boolean {
  const compact = key.toLowerCase().replace(/[^a-z0-9]+/g, '')
  if (!compact) return false
  // Query-key spelling is not a security boundary: providers commonly use snake_case, kebab-case,
  // compact, camelCase, or a provider prefix (x-amz-credential, vendorApiKey, oauthAccessToken). Match
  // credential *families* by compact suffix so providerApiToken / vendorPrivateKey / refresh_token cannot
  // be persisted merely because their spelling is new. Stable source URLs should never carry pagination,
  // refresh, session, or API tokens; those belong in the connector's declared credential environment.
  // Ordinary source controls such as series, format, page, date, filter, and limit remain admissible.
  if (compact === 'key' || compact === 'sig' || compact === 'token' || compact === 'secret'
      || compact === 'auth' || compact === 'oauth' || compact === 'jwt' || compact === 'cookie'
      || compact === 'session' || compact === 'bearer' || compact === 'sas') return true
  return [
    // Generic token suffix is intentional. A durable source URL does not need an opaque continuation token;
    // the connector obtains pagination state while fetching and must not persist it in the source ledger.
    'token', 'key', 'secret', 'password', 'passwd', 'credential', 'authorization', 'signature',
    'session', 'sessionid', 'cookie', 'jwt', 'bearer', 'ticket', 'oauthcode', 'authorizationcode',
    'functionkey', 'appid', 'sas', 'auth',
  ].some((suffix) => compact.endsWith(suffix))
}

const nonGlobalV4 = new BlockList()
for (const [network, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) nonGlobalV4.addSubnet(network, prefix, 'ipv4')

const nonGlobalV6 = new BlockList()
for (const [network, prefix] of [
  ['::', 128], ['::1', 128], ['::ffff:0:0', 96], ['64:ff9b::', 96], ['64:ff9b:1::', 48],
  ['100::', 64], ['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['fc00::', 7],
  ['fe80::', 10], ['fec0::', 10], ['3fff::', 20], ['5f00::', 16], ['ff00::', 8],
] as const) nonGlobalV6.addSubnet(network, prefix, 'ipv6')

// Node's IP parser validates syntax but does not classify address purpose.
// Admit only IANA's allocated IPv6 global-unicast block before applying the
// narrower special-purpose exclusions above; reserved/unallocated addresses
// such as ::2, ::127.0.0.1, and 4000::1 must never reach connector egress.
const allocatedGlobalUnicastV6 = new BlockList()
allocatedGlobalUnicastV6.addSubnet('2000::', 3, 'ipv6')

/** Pure/synchronous admission: exact public-DNS HTTPS origin, with no embedded credentials. */
export function safeConnectorSourceUrl(raw: unknown): SafeConnectorUrl | null {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 2_000) return null
  try {
    const parsed = new URL(raw.trim())
    const host = parsed.hostname.toLowerCase()
    if (parsed.protocol !== 'https:' || (parsed.port && parsed.port !== '443')) return null
    if (parsed.username || parsed.password || !host || host.endsWith('.') || host === 'localhost'
      || host.endsWith('.localhost') || host.endsWith('.local')) return null
    // URL normalises alternate IPv4 spellings (127.1, integer/hex forms).  Bracketed IPv6 is
    // rejected by DNS syntax too, but strip brackets here so the intent remains explicit.
    const bareHost = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host
    if (isIP(bareHost) !== 0 || !DNS_NAME_RE.test(host)) return null
    for (const key of parsed.searchParams.keys()) if (credentialQueryKey(key)) return null
    parsed.hash = ''
    const url = parsed.toString()
    if (url.length > 2_000) return null
    return { url, host }
  } catch {
    return null
  }
}

export function isGlobalConnectorAddress(address: string, family?: number): boolean {
  const actual = isIP(address)
  if (!actual || (family && family !== actual)) return false
  return actual === 4
    ? !nonGlobalV4.check(address, 'ipv4')
    : allocatedGlobalUnicastV6.check(address, 'ipv6') && !nonGlobalV6.check(address, 'ipv6')
}

const lookupAll: ConnectorLookup = async (hostname) => dnsLookup(hostname, { all: true, verbatim: true })

/**
 * DNS/SSRF preflight for server-side admission; every answer must be globally routable.
 *
 * This does NOT pin or constrain a later child process, which could resolve the name again. Automatic
 * privileged connector coding remains disabled until it has an enforced egress sandbox.
 */
export async function resolvedConnectorSourceUrl(
  raw: unknown, lookup: ConnectorLookup = lookupAll,
): Promise<SafeConnectorUrl | null> {
  const safe = safeConnectorSourceUrl(raw)
  if (!safe) return null
  try {
    const answers = await lookup(safe.host)
    if (!answers.length || answers.some((answer) => !isGlobalConnectorAddress(answer.address, answer.family))) return null
    return safe
  } catch {
    return null
  }
}

/** Pin an optional endpoint hint to the exact admitted source host. */
export function bindConnectorUrls(sourceRaw: unknown, endpointRaw?: unknown): BoundConnectorUrls | null {
  const source = safeConnectorSourceUrl(sourceRaw)
  if (!source) return null
  const hasEndpoint = typeof endpointRaw === 'string' && endpointRaw.trim().length > 0
  const endpoint = hasEndpoint ? safeConnectorSourceUrl(endpointRaw) : source
  if (!endpoint || endpoint.host !== source.host) return null
  return { source, endpoint }
}

/** DNS-check both boundary values for persistence/read-only scanning; not a child-process egress boundary. */
export async function resolveBoundConnectorUrls(
  sourceRaw: unknown, endpointRaw?: unknown, lookup: ConnectorLookup = lookupAll,
): Promise<BoundConnectorUrls | null> {
  const bound = bindConnectorUrls(sourceRaw, endpointRaw)
  if (!bound) return null
  const source = await resolvedConnectorSourceUrl(bound.source.url, lookup)
  if (!source) return null
  // The endpoint is exact-host-bound, so the source resolution establishes its network destination too.
  return { source, endpoint: bound.endpoint }
}
