import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { REPO_ROOT, STATE_DIR } from './config'
import { ibkrPaperExecution } from './ibkr-paper-execution'
import { runLocalPaperBridge } from './ibkr-paper-local-bridge'
import { listAllCalls } from './outputs'
import { buildCallPolicyTarget } from './paper-call-ledger'

function configuredOperatorAuthorized(): boolean {
  const local = String(process.env.ENGINE_IBKR_PAPER_LOCAL_OPERATOR || '').trim().toLowerCase()
  const allowed = String(process.env.ENGINE_IBKR_PAPER_OPERATORS || '')
    .split(',').map((row) => row.trim().toLowerCase()).filter(Boolean)
  return Boolean(local) && allowed.includes(local)
}

const attempt = await runLocalPaperBridge({
  enabled: process.env.ENGINE_IBKR_PAPER_EXECUTION === '1'
    && process.env.ENGINE_IBKR_PAPER_AUTO_SYNC === '1',
  operatorAuthorized: configuredOperatorAuthorized(),
  stateDir: path.join(STATE_DIR, 'ibkr-paper-local-bridge'),
  revision: () => execFileSync('git', ['-C', REPO_ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  target: async () => buildCallPolicyTarget((await listAllCalls()).calls, new Date()),
  sync: (idempotencyKey, command) => ibkrPaperExecution.sync(idempotencyKey, command),
})

if (attempt) {
  process.stdout.write(`${attempt.at} ${attempt.outcome} orders=${attempt.order_count} skipped=${attempt.skipped_count} ${attempt.detail}\n`)
}

