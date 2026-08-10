// Plain-English labels for the machine enums the decision_record and connector manifests carry.
// Shared by the Data-needs dock and the Data Library so the two surfaces can never drift.
// `unrecognized` is the server reader's closed sentinel for an off-enum acquisition (data-needs.ts
// keeps the card and labels the defect instead of dropping the demand signal).
export const ACQ_LABEL: Record<string, string> = {
  official_api: 'official API', free_key_api: 'free API', paid_api: 'paid API', scrape: 'web scrape', manual: 'manual',
  unrecognized: 'source t.b.d.',
}
export const CADENCE_LABEL: Record<string, string> = {
  twelve_hourly: 'twice daily', daily: 'daily', weekly: 'weekly', monthly: 'monthly',
  quarterly: 'quarterly', semiannual: 'twice yearly', annual: 'annual', event_driven: 'per release',
}
