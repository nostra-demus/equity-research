import { Worker } from 'node:worker_threads'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

// Existing snapshot writers use synchronous repository leases. Keep asynchronous archive leases on
// their own event loop so a snapshot writer can wait without preventing an archive from releasing.
let worker: Worker | null = null
let sequence = 0
const pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>()
export function runDiscoveryInWorker<T>(method: string, args: unknown[]): Promise<T> {
  if (!worker) {
    const current = new Worker(`
      const { parentPort, workerData } = require('node:worker_threads');
      require(workerData.loader);
      const operations = require(workerData.module);
      parentPort.on('message', async ({ id, method, args }) => {
        try { parentPort.postMessage({ id, value: await operations[method](...args) }); }
        catch (error) { parentPort.postMessage({ id, error: { message: error.message, code: error.code, statusCode: error.statusCode } }); }
      });
    `, { eval: true, workerData: {
      loader: createRequire(import.meta.url).resolve('tsx/cjs'),
      module: fileURLToPath(new URL('./ideas-workspace.ts', import.meta.url)),
    } })
    worker = current
    current.on('message', ({ id, value, error }) => {
      const call = pending.get(id)
      pending.delete(id)
      if (error) call?.reject(Object.assign(new Error(error.message), error))
      else call?.resolve(value)
      if (!pending.size) current.unref()
    })
    const fail = (error: Error) => {
      if (worker !== current) return
      worker = null
      for (const call of pending.values()) call.reject(error)
      pending.clear()
      void current.terminate()
    }
    current.on('error', fail)
    current.on('exit', (code) => fail(new Error(`Idea archive worker stopped (${code}). Please retry.`)))
  }
  const active = worker
  return new Promise<T>((resolve, reject) => {
    const id = ++sequence
    pending.set(id, { resolve, reject })
    active.ref()
    active.postMessage({ id, method, args })
  })
}
