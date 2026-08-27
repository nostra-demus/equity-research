import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// server.ts is intentionally not imported: importing it claims the production singleton and starts the
// listener. Pin the route wiring as source while the browser tests exercise the fail-closed behaviour.
const here = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(here, '..', 'src', 'server.ts'), 'utf8')
const routeStart = source.indexOf("app.get('/api/launch/estimate'")
const routeEnd = source.indexOf('// ---------- launch ----------', routeStart)
assert.ok(routeStart > 0 && routeEnd > routeStart, 'launch estimate route exists')
const route = source.slice(routeStart, routeEnd)

assert.match(source, /EXACT_DECISION_LAUNCH_CONTRACT\s*=\s*'exact-decision-launch\/1'/)
assert.match(source, /const ProviderQuery = z\.object\(ProviderLaunchFields\)/,
  'estimate queries and paid launch bodies share one provider/profile field contract')
assert.match(source, /const ProviderLaunchFields = \{[\s\S]*expectedProfileKey:\s*z\.string\(\)\.min\(1\)\.max\(240\)\.optional\(\)/,
  'the shared provider/profile contract preserves the exact execution-profile key')
assert.match(source, /app\.post\('\/api\/launch\/exact'/)
assert.match(source, /\.\.\.binding, decisionRunRoot: binding\.runRoot, intakeReceipt, user, userVia/,
  'the exact route carries the selected decision root through launcher CAS and final spawn boundary')
assert.match(source, /intake\?\.actionable === true && intake\.widened\.length === 0/,
  'only a fully validated live intake plan may request one-time consumption')
assert.match(source, /planPath: intake\.plan_path[\s\S]*planSha256: intake\.plan_sha256[\s\S]*sourceDecisionFingerprint: intake\.decision_fingerprint/,
  'the exact route carries the source plan content identity into the rerun prompt')
assert.match(source, /requestedPlan && !intakeReceipt[\s\S]*code: 'intake_plan_changed'/,
  'an explicit stale plan-origin request is rejected instead of becoming an ordinary rerun')
assert.match(source, /const intakeReceipt = requestedPlan[\s\S]*exactActionableIntakeOrb/,
  'an ordinary graph rerun with no explicit plan origin never consumes a coincidentally matching plan orb')
assert.match(source, /exactDecisionBinding: exactDecisionLaunchReceipt\(binding, requestedPlan \? intakeReceipt : undefined\)/,
  'the paid response echoes the exact plan capability when one authorized the rerun')
assert.doesNotMatch(source, /\{ \.\.\.plan, decision_fingerprint: needs\.decision_fingerprint \}/,
  'GET intake never silently rebinds a legacy/stale raw plan to the current decision')
assert.match(source, /if \(kind === 'rerun'\) return reply\.code\(426\)\.send\(\{ error: 'exact_launch_endpoint_required' \}\)/,
  'legacy /api/launch cannot accept reruns, even from an old caller')
assert.match(source, /runRoot:\s*z\.string\(\)\.min\(1\)\.max\(300\)\.optional\(\)/)
assert.match(source, /decisionFingerprint:\s*z\.string\(\)\.regex\(\/\^sha256:/)
assert.match(source, /const binding = exactDecisionLaunchBinding\(swarm \|\| RESEARCH_SWARM_ID, subject, runRoot, decisionFingerprint\)/)
assert.match(source, /exactDecisionBinding:\s*exactDecisionLaunchReceipt\(binding, intakePlan \?\? undefined\)/)

const boundCalls = route.match(/boundLaunchEstimate\(/g)?.length ?? 0
assert.equal(boundCalls, 3, 'research, constellation, and non-research estimates share the binding gate')
assert.match(source, /preflight:\s*\{ \.\.\.out\.preflight, exactDecisionBinding: exactDecisionLaunchReceipt\(exactBinding\) \}/)
assert.match(source, /app\.post\('\/api\/intake-plan\/run-exact'/)
assert.match(source, /lockedIntake\.plan_path !== planPath[\s\S]*lockedIntake\.plan_sha256 !== planSha256[\s\S]*lockedIntake\.decision_fingerprint !== sourceDecisionFingerprint/,
  'scoped paid POST revalidates the exact reviewed plan inside its mutation lock')
assert.match(source, /exact_intake_plan_endpoint_required/)
assert.match(source, /app\.post\('\/api\/intake\/:subject\/analyze-exact'/)
assert.match(source, /exact_intake_endpoint_required/)

console.log('exact launch capability: estimate validation + versioned receipt wiring passed')
