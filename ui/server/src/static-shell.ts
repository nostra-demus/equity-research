// Which SPA shell a non-asset URL falls back to. The cockpit ships two: the desktop app at / and the
// phone chat shell at /m/ (ui/dist/m/index.html). Pure so the routing rule is testable without booting
// Fastify — the caller's notFoundHandler has already 404'd /api/* and any path with a file extension.
//
// The prefix must match exactly /m, /m/, /m?…, /m#…, /m/anything — and never /moo or /mx: a path that
// merely STARTS with the letter m silently serving the wrong app would be the worst kind of bug (no
// error, just the desktop bundle where the phone one belongs).
export function shellForUrl(url: string): 'mobile' | 'desktop' {
  return /^\/m(?:[/?#]|$)/.test(url) ? 'mobile' : 'desktop'
}
