// subject-lock.ts — the in-process per-key mutex `thesis-plan/run` uses to close the concurrent-carry race.
// Run: npx tsx test/subject-lock.test.ts
import assert from 'node:assert/strict'
import { SubjectBusyError, withSubjectLock } from '../src/subject-lock'

function deferred<T>(): { promise: Promise<T>; resolve: (v: T) => void } {
  let resolve!: (v: T) => void
  const promise = new Promise<T>((r) => { resolve = r })
  return { promise, resolve }
}

// ---- 1. a second call for the SAME key while the first is in flight is rejected, not interleaved -------
{
  const gate = deferred<void>()
  let firstStarted = false
  let firstFinished = false

  const first = withSubjectLock('AMZN', async () => {
    firstStarted = true
    await gate.promise
    firstFinished = true
    return 'first'
  })

  // The first call's synchronous prefix (check-and-set) has already run by the time `withSubjectLock`
  // returns a pending promise, so a second call issued right away must see the key held.
  assert.ok(firstStarted, 'first call entered its critical section synchronously')
  await assert.rejects(() => withSubjectLock('AMZN', async () => 'second'), SubjectBusyError, 'a concurrent call for the same key is rejected')

  gate.resolve()
  const result = await first
  assert.equal(result, 'first')
  assert.ok(firstFinished)
  console.log('✅ concurrent calls for the same key never interleave — the second is rejected outright')
}

// ---- 2. the key is released once the holder settles, and a later call can then acquire it --------------
{
  await withSubjectLock('MSFT', async () => 'done')
  const second = await withSubjectLock('MSFT', async () => 'also fine')
  assert.equal(second, 'also fine')
  console.log('✅ the lock releases on success — a later call for the same key succeeds')
}

// ---- 3. the key releases even when the holder THROWS — a failure must never wedge the lock forever ------
{
  await assert.rejects(() => withSubjectLock('TSLA', async () => { throw new Error('boom') }), /boom/)
  const after = await withSubjectLock('TSLA', async () => 'recovered')
  assert.equal(after, 'recovered', 'a thrown error releases the lock — it does not wedge the key forever')
  console.log('✅ a thrown error still releases the lock')
}

// ---- 4. different keys never contend with each other ----------------------------------------------------
{
  const gate = deferred<void>()
  const a = withSubjectLock('GOOG', async () => { await gate.promise; return 'a' })
  const b = await withSubjectLock('NFLX', async () => 'b') // different key — must not be rejected
  assert.equal(b, 'b')
  gate.resolve()
  assert.equal(await a, 'a')
  console.log('✅ distinct keys never block one another')
}
