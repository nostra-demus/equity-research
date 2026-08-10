// Connector URL boundary — structural admission plus deterministic DNS fixtures (no live network).
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const {
  bindConnectorUrls, isGlobalConnectorAddress, resolveBoundConnectorUrls, resolvedConnectorSourceUrl,
  safeConnectorSourceUrl,
} = await import('../src/connector-url-policy')

const publicLookup = async () => [{ address: '93.184.216.34', family: 4 }]
const privateLookup = async () => [{ address: '127.0.0.1', family: 4 }]
const mixedLookup = async () => [
  { address: '93.184.216.34', family: 4 }, { address: '10.0.0.7', family: 4 },
]

check('global address classifier accepts public IPv4 and IPv6',
  isGlobalConnectorAddress('93.184.216.34', 4) && isGlobalConnectorAddress('2606:2800:220:1:248:1893:25c8:1946', 6))
check('global address classifier rejects loopback/private/link-local/documentation ranges',
  !isGlobalConnectorAddress('127.0.0.1', 4) && !isGlobalConnectorAddress('10.0.0.1', 4)
  && !isGlobalConnectorAddress('169.254.1.1', 4) && !isGlobalConnectorAddress('192.0.2.1', 4)
  && !isGlobalConnectorAddress('::1', 6) && !isGlobalConnectorAddress('fe80::1', 6)
  && !isGlobalConnectorAddress('::2', 6) && !isGlobalConnectorAddress('::127.0.0.1', 6)
  && !isGlobalConnectorAddress('fec0::1', 6) && !isGlobalConnectorAddress('3fff::1', 6)
  && !isGlobalConnectorAddress('4000::1', 6) && !isGlobalConnectorAddress('5f00::1', 6)
  && !isGlobalConnectorAddress('2001:db8::1', 6))

for (const key of [
  'apikey', 'accessToken', 'vendorApiKey', 'oauthAccessToken', 'x-amz-credential',
  'x-amz-security-token', 'x-amz-signature',
  // Regression: these compact/camel/provider-prefixed credential families previously survived admission
  // and could therefore be persisted by add-source and forwarded in the read-only scan prompt.
  'auth', 'providerAuth', 'apiToken', 'vendorApiToken', 'refreshToken', 'providerRefreshToken',
  'sessionToken', 'vendorSessionToken', 'accessKey', 'providerAccessKey', 'privateKey',
  'providerPrivateKey', 'vendorKey', 'providerSecret', 'providerSession', 'jwt', 'sessionId',
  'authTicket', 'weatherAppId',
]) {
  check(`credential query key ${key} is rejected in compact/provider spelling`,
    safeConnectorSourceUrl(`https://api.example.com/data?${key}=do-not-persist`) === null)
}
check('ordinary non-secret query controls remain admissible',
  safeConnectorSourceUrl('https://api.example.com/data?series=gold&format=json&page=2&limit=50&filter=current')?.host
    === 'api.example.com')

for (const key of ['auth', 'apiToken', 'refreshToken', 'sessionToken', 'accessKey', 'privateKey']) {
  check(`DNS-admitted add-source/scan boundary still rejects ${key} before persistence or forwarding`,
    await resolvedConnectorSourceUrl(
      `https://api.example.com/data?${key}=do-not-persist`, publicLookup,
    ) === null)
}

check('DNS admission accepts a structurally safe URL with only global answers',
  (await resolvedConnectorSourceUrl('https://api.example.com/data?series=gold', publicLookup))?.host === 'api.example.com')
check('DNS admission rejects private and mixed public/private answer sets',
  await resolvedConnectorSourceUrl('https://api.example.com/data', privateLookup) === null
  && await resolvedConnectorSourceUrl('https://api.example.com/data', mixedLookup) === null)
check('DNS admission rejects lookup failure and empty answers',
  await resolvedConnectorSourceUrl('https://api.example.com/data', async () => []) === null
  && await resolvedConnectorSourceUrl('https://api.example.com/data', async () => { throw new Error('dns failed') }) === null)

check('exact-host binding accepts a safe same-host endpoint',
  bindConnectorUrls('https://api.example.com/', 'https://api.example.com/v1/data')?.endpoint.url
    === 'https://api.example.com/v1/data')
check('exact-host binding rejects off-host and credential-bearing endpoints',
  bindConnectorUrls('https://api.example.com/', 'https://other.example.com/data') === null
  && bindConnectorUrls('https://api.example.com/', 'https://api.example.com/data?api_key=secret') === null)
check('resolved exact-host binding preserves only admitted normalized URLs',
  (await resolveBoundConnectorUrls('https://API.EXAMPLE.COM/data#fragment', 'https://api.example.com/v1', publicLookup))?.source.url
    === 'https://api.example.com/data')

console.log(`\nconnector-url-policy.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
