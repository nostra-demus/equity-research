// One serializer for live and static Calls. Keeping this tiny command in the server package lets the
// static web build reuse every correction, integrity check, review delta and notification rule instead
// of maintaining a second, weaker ledger reader in JavaScript.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import { listAllCalls } from '../src/outputs'

process.stdout.write(JSON.stringify(listAllCalls()))
