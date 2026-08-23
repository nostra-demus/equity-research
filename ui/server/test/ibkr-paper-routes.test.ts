// Static route contract: importing server.ts would claim the production singleton and open a listener.
// Pure execution tests exercise dispatch; this pins every HTTP safety gate around those commands.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, '..', 'src', 'server.ts'), 'utf8')
const start = source.indexOf("app.get('/api/calls/paper-portfolio'")
const end = source.indexOf("app.get('/api/calls/artifact'", start)
assert.ok(start > 0 && end > start, 'paper portfolio route group exists')
const routes = source.slice(start, end)

assert.match(routes, /can_execute:\s*portfolio\.execution\.status === 'ready' && paperOperatorAllowed\(req\)/,
  'GET exposes request-specific execution capability instead of global broker readiness')
assert.match(routes, /ENGINE_IBKR_PAPER_OPERATORS/,
  'remote execution uses a dedicated paper-operator allow-list')
assert.match(routes, /actor\.userVia === 'cf-access'[\s\S]*operators\.includes\(actor\.user\.toLowerCase\(\)\)/,
  'a signed-in remote user must be explicitly allow-listed')
assert.match(routes, /ENGINE_IBKR_PAPER_LOCAL_OPERATOR === '1'/,
  'an unidentified local user is disabled unless separately opted in')
assert.doesNotMatch(routes, /isDispatchAdmin/,
  'coding-dispatch authorization cannot accidentally grant broker authority')

assert.match(routes, /confirmation:\s*z\.enum\(\['SYNC PAPER', 'CANCEL PAPER', 'CLOSE PAPER'\]\)/)
assert.match(routes, /idempotency_key:\s*z\.string\(\)\.uuid\(\)/)
assert.match(routes, /PaperOrderParams = z\.object\(\{ orderId: z\.coerce\.number\(\)\.int\(\)\.positive\(\) \}\)\.strict\(\)/)
assert.match(routes, /PaperPositionParams = z\.object\(\{ contractId: z\.coerce\.number\(\)\.int\(\)\.positive\(\) \}\)\.strict\(\)/)
assert.match(routes, /allowedStatuses = new Set\(\[400, 403, 404, 409, 422, 423, 503\]\)/,
  'broker errors cannot choose an arbitrary HTTP status')
assert.match(routes, /\^PAPER_\[A-Z0-9_\]\{1,56\}\$/,
  'only bounded machine-safe paper error codes reach the browser')

for (const [pathText, confirmation, dispatch] of [
  ["/api/calls/paper-portfolio/sync", 'SYNC PAPER', 'ibkrPaperExecution.sync'],
  ["/api/calls/paper-orders/:orderId/cancel", 'CANCEL PAPER', 'ibkrPaperExecution.cancel'],
  ["/api/calls/paper-positions/:contractId/close", 'CLOSE PAPER', 'ibkrPaperExecution.close'],
] as const) {
  const routeStart = routes.indexOf(`app.post('${pathText}'`)
  const nextRoute = routes.indexOf('\napp.', routeStart + 1)
  const route = routes.slice(routeStart, nextRoute < 0 ? undefined : nextRoute)
  assert.ok(routeStart >= 0, `${pathText} exists`)
  assert.match(route, /if \(!originAllowed\(req\)\) return reply\.code\(403\)/, `${pathText} blocks cross-origin writes`)
  assert.match(route, /if \(!paperOperatorAllowed\(req\)\) return reply\.code\(403\)/, `${pathText} rejects unauthorized users`)
  assert.ok(route.includes(`confirmation !== '${confirmation}'`), `${pathText} requires its exact typed confirmation`)
  assert.ok(route.includes(dispatch), `${pathText} dispatches only to its matching paper service method`)
  assert.match(route, /catch \(error\) \{ return paperCommandError\(error, reply\) \}/, `${pathText} uses the bounded error mapper`)
}

console.log('ibkr-paper-routes.test.ts: paper HTTP authorization and validation contract passed')
