// In-app upload path: write a company's documents into the shared Google Drive folder using ONE app
// credential (a service account, or one connected account's OAuth refresh token). The engine keeps
// READING the local Drive-for-Desktop mount — these uploads sync back DOWN to it, so a freshly uploaded
// file appears in the cockpit a few seconds after it lands in Drive. See GDRIVE in config.ts.
//
// SETUP NOTE: a service account has no personal storage quota, so it can only create files inside a SHARED
// DRIVE it's a member of (set GDRIVE_SHARED_DRIVE_ID). Writing into a plain My Drive folder fails with a
// quota error — use an OAuth refresh token for a real account in that case. Every call passes
// supportsAllDrives so Shared Drives work.
import type { Readable } from 'node:stream'
import { drive, auth, type drive_v3 } from '@googleapis/drive'
import { GDRIVE, GDRIVE_ENABLED } from './config'

const FOLDER_MIME = 'application/vnd.google-apps.folder'
// Drive query strings are single-quoted; escape backslash + quote. (Tickers are A–Z/0–9/.-, so this is
// belt-and-braces, but keeps the helper safe if it's ever fed a freer string.)
const escapeQ = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

let _client: drive_v3.Drive | null = null
function client(): drive_v3.Drive {
  if (_client) return _client
  // Build auth from @googleapis/drive's own `auth` (AuthPlus) so the GoogleAuth/OAuth2 types match the
  // version drive() expects — importing google-auth-library directly pulls a SECOND copy whose nominal
  // types TS then rejects. ONE app credential: a service account (Shared-Drive write) OR an OAuth refresh
  // token for a real account (no per-user sign-in either way).
  let authClient
  if (GDRIVE.saJson || GDRIVE.saKeyFile) {
    authClient = new auth.GoogleAuth({
      ...(GDRIVE.saJson ? { credentials: JSON.parse(GDRIVE.saJson) } : { keyFile: GDRIVE.saKeyFile }),
      scopes: ['https://www.googleapis.com/auth/drive'],
    })
  } else if (GDRIVE.oauthRefreshToken) {
    const o = new auth.OAuth2(GDRIVE.oauthClientId, GDRIVE.oauthClientSecret)
    o.setCredentials({ refresh_token: GDRIVE.oauthRefreshToken })
    authClient = o
  } else {
    throw new Error('Drive uploads not configured')
  }
  _client = drive({ version: 'v3', auth: authClient })
  return _client
}

// Shared-Drive params: scope list/search to the configured Shared Drive so SA-owned files land there.
function sharedDriveListParams(): Record<string, unknown> {
  return GDRIVE.sharedDriveId
    ? { supportsAllDrives: true, includeItemsFromAllDrives: true, corpora: 'drive', driveId: GDRIVE.sharedDriveId }
    : { supportsAllDrives: true, includeItemsFromAllDrives: true }
}

async function findCompanyFolder(ticker: string): Promise<string | null> {
  const r = await client().files.list({
    q: `name='${escapeQ(ticker)}' and '${GDRIVE.dataFolderId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`,
    fields: 'files(id,name,createdTime)',
    orderBy: 'createdTime', // prefer the EARLIEST if a race ever produced duplicate same-name folders
    pageSize: 10,
    ...sharedDriveListParams(),
  })
  return r.data.files?.[0]?.id ?? null
}

/** Does the company's Drive folder already exist? (drives the create route's 409.) */
export async function companyFolderExists(ticker: string): Promise<boolean> {
  return (await findCompanyFolder(ticker)) !== null
}

const folderCache = new Map<string, string>() // ticker -> folderId
const inflight = new Map<string, Promise<string>>() // per-ticker lock — no duplicate-create race

/** Find-or-create the <TICKER> sub-folder under the shared data folder; returns its Drive id. */
export async function ensureCompanyFolder(ticker: string): Promise<string> {
  const cached = folderCache.get(ticker)
  if (cached) return cached
  const pending = inflight.get(ticker)
  if (pending) return pending
  const p = (async () => {
    const existing = await findCompanyFolder(ticker)
    if (existing) return existing
    const created = await client().files.create({
      requestBody: { name: ticker, parents: [GDRIVE.dataFolderId], mimeType: FOLDER_MIME },
      fields: 'id',
      supportsAllDrives: true,
    })
    const id = created.data.id
    if (!id) throw new Error('Drive did not return a folder id')
    return id
  })()
    .then((id) => {
      folderCache.set(ticker, id)
      return id
    })
    .finally(() => inflight.delete(ticker))
  inflight.set(ticker, p)
  return p
}

/** Stream one file into the company's Drive folder. Returns the new file's id + final name. */
export async function uploadToCompany(ticker: string, filename: string, mimeType: string, body: Readable): Promise<{ id: string; name: string }> {
  const folderId = await ensureCompanyFolder(ticker)
  const res = await client().files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType: mimeType || 'application/octet-stream', body },
    fields: 'id,name',
    supportsAllDrives: true,
  })
  if (!res.data.id) throw new Error('Drive did not return a file id')
  return { id: res.data.id, name: res.data.name || filename }
}

/** Best-effort delete (used to clean up a partial/truncated upload). Never throws. */
export async function deleteDriveFile(id: string): Promise<void> {
  try {
    await client().files.delete({ fileId: id, supportsAllDrives: true })
  } catch {
    /* best-effort cleanup */
  }
}

/** Turn a raw Drive error into a short, human message (the SA-quota case is the common gotcha). */
export function driveErrorMessage(e: any): string {
  const msg = String(e?.errors?.[0]?.message || e?.message || e || 'Drive error')
  if (/quota|storageQuotaExceeded|service accounts do not have storage/i.test(msg)) {
    return 'upload failed — the Drive folder must be a Shared Drive (a service account has no personal storage). Set GDRIVE_SHARED_DRIVE_ID.'
  }
  return `Drive error: ${msg}`
}

export { GDRIVE_ENABLED }
