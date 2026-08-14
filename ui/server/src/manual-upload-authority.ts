// Terminal, read-only compare-and-set for ingest_external.py.
//
// A manual upload can sit staged while the Python router extracts it. Before the router publishes any
// bytes into data/<SUBJECT>, it invokes this tiny process with the SIGNED intent binding. Reusing the
// server's canonical owner/data-needs readers avoids a second, subtly different parser in Python.
// Exit 0 means the label still has exactly one finished owner and the same standing decision. Any other
// exit is a transient abstention: the router leaves the envelope staged and retries on its next pass.
import { resolveUniqueFinishedIntakeOwner } from './intake-owner'

const [subject, swarm, runRoot, decisionFingerprint] = process.argv.slice(2)

let reason = 'shared data-pool authority could not be verified'
let authorized = false
try {
  const owner = subject ? resolveUniqueFinishedIntakeOwner(subject) : null
  authorized = !!owner
    && owner.swarm === swarm
    && owner.runRoot === runRoot
    && owner.decisionFingerprint === decisionFingerprint
  if (!owner) reason = 'shared data-pool owner is absent or ambiguous'
  else if (owner.swarm !== swarm) reason = `shared data-pool owner is ${owner.swarm}, not ${swarm || 'unknown'}`
  else if (owner.runRoot !== runRoot || owner.decisionFingerprint !== decisionFingerprint) {
    reason = 'selected standing decision changed while the upload was staged'
  }
} catch {
  reason = 'shared data-pool authority reader failed closed'
}

process.stdout.write(`${JSON.stringify({ authorized, reason: authorized ? null : reason })}\n`)
if (!authorized) process.exitCode = 75
