import { selectedProviderProfile, type ProviderStatus } from '../lib/provider'

export function ProviderProfileSelector({
  status,
  profileKey,
  disabled = false,
  compact = false,
  onChange,
}: {
  status: ProviderStatus
  profileKey?: string
  disabled?: boolean
  compact?: boolean
  onChange: (profileKey: string) => void
}) {
  const selected = selectedProviderProfile(status, profileKey)
  if (!selected || !status.profiles?.length) return null
  return (
    <label className={`profilepick${compact ? ' profilepick--compact' : ''}`}>
      <span className="sr-only">Execution model</span>
      <select
        aria-label={`${status.provider === 'claude' ? 'Claude' : 'Codex'} execution model`}
        value={selected.key}
        disabled={disabled}
        title={selected.description}
        onChange={(event) => onChange(event.target.value)}
      >
        {status.profiles.map((profile) => (
          <option key={profile.key} value={profile.key}>{profile.label}</option>
        ))}
      </select>
      <span className="profilepick__hint">{selected.description}</span>
    </label>
  )
}
