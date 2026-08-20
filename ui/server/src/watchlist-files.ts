// Watchlist thesis attachments on the LOCAL Drive mount.
//
// The cockpit's `data/` is a symlink into Google Drive for Desktop, which is how the engine has always
// read the pool: through the filesystem, with Drive syncing underneath. Uploads were built the other way
// — through the Drive API, gated on GDRIVE_ENABLED — and that gate was never satisfied here, so the
// feature read as "not built" when it was only pointed at the wrong mechanism.
//
// The API route could not have worked on this setup even fully configured: the mount is a **My Drive**
// folder, and a service account has no storage quota of its own, so it cannot write into personal Drive
// at all. Reaching the same folder through the filesystem needs no credential, no service account, no
// Shared Drive migration, and no administrator — the operator who can see the folder can write to it.
//
// Attachments live under DATA_DIR/<watchlist folder>/<entry_id>/, keyed by ENTRY ID and never by ticker:
// that is the difference between a note you wrote and evidence a run may cite (§4). The folder is in
// RESERVED_DATA_FOLDERS (config.isReservedDataFolder), so it is not listed as a company and the pool
// extractor — which runs per-ticker over data/<TICKER>/ — never walks it.
import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR, GDRIVE, isReservedDataFolder } from './config'

/** The attachment root on the mount, or null when it is not reachable (Drive not mounted, no permission). */
export function watchlistFilesRoot(dataDir: string = DATA_DIR): string | null {
  const folder = (GDRIVE.watchlistFolder || 'WATCHLIST').trim()
  // Refuse a name that would escape the data dir, and one the engine does not treat as reserved — an
  // unreserved ticker-shaped folder would be listed as a company and ingested as evidence, which is the
  // one outcome this whole layout exists to prevent.
  if (!folder || folder !== path.basename(folder) || folder.startsWith('.')) return null
  if (!isReservedDataFolder(folder, dataDir)) return null
  const root = path.join(dataDir, folder)
  try {
    fs.mkdirSync(root, { recursive: true })
    // realpath AFTER creating: the mount is a symlink, so the resolved path legitimately sits outside
    // dataDir. What matters is that the folder we just made is the one we asked for, not that it stays
    // inside the repo tree.
    return fs.statSync(root).isDirectory() ? root : null
  } catch {
    return null
  }
}

/** True when attachments can be stored without the Drive API — i.e. the mount is reachable and writable. */
export function watchlistFilesAvailable(dataDir: string = DATA_DIR): boolean {
  const root = watchlistFilesRoot(dataDir)
  if (!root) return false
  const probe = path.join(root, `.write-probe-${process.pid}`)
  try {
    fs.writeFileSync(probe, '')
    fs.rmSync(probe, { force: true })
    return true
  } catch {
    // A visible-but-read-only mount is a real state (Drive still syncing, or a shared folder with view
    // access): report it as unavailable rather than offering an upload that would fail on save.
    return false
  }
}

function entryDir(entryId: string, dataDir: string): string | null {
  const root = watchlistFilesRoot(dataDir)
  // entryId is validated by isWatchId at the route, but this module is the one touching the filesystem,
  // so it re-checks the only property that matters here: a single, non-traversing path segment.
  if (!root || !entryId || entryId !== path.basename(entryId) || entryId.startsWith('.')) return null
  return path.join(root, entryId)
}

/** Where one attachment lives. `attachmentId` is the stored filename, so it is containment-checked too. */
export function attachmentPath(entryId: string, attachmentId: string, dataDir: string = DATA_DIR): string | null {
  const dir = entryDir(entryId, dataDir)
  if (!dir || !attachmentId || attachmentId !== path.basename(attachmentId) || attachmentId.startsWith('.')) return null
  return path.join(dir, attachmentId)
}

/**
 * Save one PDF. Written to a temp name in the SAME directory and renamed over the target, so a failed or
 * interrupted write cannot leave a half-file that later reads as a valid attachment — and so Drive never
 * uploads a partial PDF and then syncs it back down as evidence of a document that does not exist.
 */
export function saveAttachment(
  entryId: string, attachmentId: string, body: Buffer, dataDir: string = DATA_DIR,
): { ok: true; bytes: number } | { ok: false; error: string } {
  const target = attachmentPath(entryId, attachmentId, dataDir)
  if (!target) return { ok: false, error: 'attachment storage is not reachable' }
  const tmp = `${target}.part-${process.pid}`
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(tmp, body)
    fs.renameSync(tmp, target)
    return { ok: true, bytes: body.length }
  } catch (e) {
    try { fs.rmSync(tmp, { force: true }) } catch { /* best-effort cleanup of the partial write */ }
    return { ok: false, error: e instanceof Error ? e.message : 'could not write the file' }
  }
}

/** Read one attachment back, or null when it is absent/unreadable. Never throws. */
export function readAttachment(entryId: string, attachmentId: string, dataDir: string = DATA_DIR): Buffer | null {
  const p = attachmentPath(entryId, attachmentId, dataDir)
  if (!p) return null
  try { return fs.readFileSync(p) } catch { return null }
}

/** Remove one attachment. Returns true when it is gone afterwards, including when it was already absent. */
export function deleteAttachment(entryId: string, attachmentId: string, dataDir: string = DATA_DIR): boolean {
  const p = attachmentPath(entryId, attachmentId, dataDir)
  if (!p) return false
  try {
    fs.rmSync(p, { force: true })
    // prune the entry folder when it empties, so the Drive folder does not accumulate empty directories
    try { fs.rmdirSync(path.dirname(p)) } catch { /* not empty, or already gone — both fine */ }
    return !fs.existsSync(p)
  } catch {
    return false
  }
}
