// Filesystem projection for the qualified 3-6 month Ideas board.
//
// Producers write one immutable `idea_3_6m.json` beside a research run's decision record. This
// reader discovers those artifacts generically, re-checks the run's CURRENT integrity/supersession state,
// evaluates every gate through qualified-ideas.ts, and keeps only the newest standing directional call
// per listing. It never promotes the news skim and never trusts a stored "qualified" flag.

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { z } from 'zod'
import { readActivity, type ActivityRow } from './activity-log'
import { inFlightRunsForTicker } from './registry'
import { readCorrections, resolveIntegrityStatus, supersededTarget } from './ledger-corrections'
import { qualifiedIdeaCalibrationStatusFor, summarizeQualifiedIdeaCalibration, type QualifiedIdeaCalibrationSummary } from './qualified-idea-calibration'
import { assessQualifiedIdeaOutcomeHealth, qualifiedIdeaOutcomeHealthPath, type QualifiedIdeaOutcomeHealth } from './qualified-idea-outcome-runner'
import { isRfc3339 } from './rfc3339'
import { canonicalJsonText } from './canonical-json'
import {
  DEFAULT_QUALIFICATION_POLICY,
  IDEA_ASSESSMENT_SCHEMA,
  QUALIFIED_IDEA_RANKING_POLICY_VERSION,
  QUALIFICATION_POLICY_VERSION,
  evaluateQualifiedIdea,
  ideaAssessmentRuntimeSchema,
  qualifiedIdeaCandidateRuntimeSchema,
  rankQualifiedIdeas,
  type IdeaAssessment,
  type QualifiedIdeaCandidate,
  type QualifiedIdeaEvaluation,
  type QualificationIssue,
  type QualificationPolicy,
} from './qualified-ideas'

// Additive rollout: keep the existing envelope version until older browser assets have aged out.
// The materially new ordering semantics are replay-safe through ranking_policy_version instead.
export const QUALIFIED_IDEAS_BOARD_SCHEMA = 'qualified-ideas-board/v1' as const
// Immutable projection/admission became a required producer contract for forward research runs on this
// date. Earlier completed runs are legacy data, not failed publications.
const IMMUTABLE_IDEA_PUBLICATION_REQUIRED_FROM = '2026-08-03'
const IDEA_PUBLICATION_GRACE_MS = 6 * 60 * 60_000
const IDEA_PUBLICATION_CLOCK_SKEW_MS = 5 * 60_000
const DIRECT_PUBLICATION_FILE_SKEW_MS = 15 * 60_000
const CURRENT_AUTHORITY_MISMATCH = 'The standing decision record no longer matches the frozen admission authority; a new run is required.'
const CURRENT_MARKET_EVIDENCE_MISMATCH = 'The current canonical market-evidence sidecar no longer matches the frozen admission; a new run is required.'

export interface QualifiedIdeasBoard {
  schema_version: typeof QUALIFIED_IDEAS_BOARD_SCHEMA
  generated_at: string
  policy_version: typeof QUALIFICATION_POLICY_VERSION
  ranking_policy_version: typeof QUALIFIED_IDEA_RANKING_POLICY_VERSION
  policy: QualificationPolicy
  health: {
    status: 'pre_data' | 'healthy' | 'degraded'
    outcome: 'no_artifacts' | 'publishing' | 'none_clear' | 'qualified' | 'invalid_artifacts' | 'storage_error'
    reason: string
    artifact_count: number
    assessment_count: number
    parsed_count: number
    invalid_count: number
    /** Completed research runs that did not finish the immutable idea-publication sequence. */
    incomplete_count: number
    /** Current research runs still inside the durable immutable-publication grace window. */
    publishing_count: number
    not_assessable_count: number
    qualified_count: number
    needs_research_count: number
    does_not_clear_count: number
    measured_count: number
  }
  outcome_health: QualifiedIdeaOutcomeHealth | null
  outcome_health_state: 'valid' | 'expired' | 'unknown'
  calibration: QualifiedIdeaCalibrationSummary
  qualified: QualifiedIdeaEvaluation[]
  needs_research: QualifiedIdeaEvaluation[]
  does_not_clear: QualifiedIdeaEvaluation[]
  not_assessable: Array<Pick<IdeaAssessment, 'assessment_id' | 'run_root' | 'created_at' | 'ticker' | 'company' | 'gaps'>>
}

interface Discovered {
  candidate: QualifiedIdeaCandidate
  runAbs: string
  mtimeMs: number
  corrected: boolean
  superseded: boolean
  admission: CandidateIdeaAdmission | null
  admissionError: string | null
}

type GapAssessment = Pick<IdeaAssessment, 'assessment_id' | 'run_root' | 'created_at' | 'ticker' | 'company' | 'gaps'>

function correctionsState(runAbs: string): { superseded: boolean; corrected: boolean } {
  const corrections = readCorrections(runAbs)
  return {
    superseded: supersededTarget(corrections) !== null,
    corrected: Array.isArray(corrections.errata) && corrections.errata.length > 0,
  }
}

function record(v: unknown): v is Record<string, any> { return !!v && typeof v === 'object' && !Array.isArray(v) }

const sha = z.string().regex(/^[a-f0-9]{64}$/)
const authorityFlag = z.object({
  id: z.string().min(1), severity: z.enum(['Critical', 'High', 'Medium', 'Low']), description: z.string().min(1),
}).strict()
const authorityScenario = z.object({
  scenario_id: z.string().min(1), label: z.string().min(1), probability_pct: z.number().finite().positive().max(100),
  source_price_target: z.number().finite().positive(), conditions: z.array(z.string().min(1)).min(1),
  source: z.string().min(1), joint_probability_basis: z.string().min(1).nullable(),
}).strict()
const authorityBridge = z.object({
  source_horizon_days: z.number().int().positive(),
  method: z.enum(['same_horizon', 'catalyst_partial_convergence', 'event_payoff', 'other']),
  convergence_fraction: z.number().finite().positive().max(1).nullable(), rationale: z.string().min(1), source: z.string().min(1),
}).strict()
const authorityForecast = z.object({
  forecast_id: z.string().min(1), prediction: z.string().min(1), window_start: z.string().min(1),
  window_end: z.string().min(1), status_as_of: z.string().min(1), source_citation: z.string().min(1),
  metric: z.string().min(1), threshold: z.string().min(1), confirmation_trigger: z.string().min(1),
  falsification_trigger: z.string().min(1), stock_bullish_trigger: z.string().min(1),
  stock_bearish_trigger: z.string().min(1), causal_steps: z.array(z.string().min(1)).min(2),
}).strict()
const postAuditSchema = z.object({
  pre_mortem: z.object({
    verdict: z.string().min(1), survives: z.boolean(), recommended_confidence: z.number().finite().min(0).max(100),
    recommended_rating_cap: z.string().min(1).nullable(),
  }).strict(),
  expectations_gap: z.object({
    variant_perception_quality: z.enum(['None', 'Weak', 'Moderate', 'Strong']), is_exploitable: z.boolean(),
    edge_score: z.number().finite().min(0).max(100),
  }).strict(),
}).strict()
const decisionAuthoritySchema = z.object({
  run_root: z.string().min(1), decision_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), ticker: z.string().min(1), company: z.string().min(1), exchange: z.string().min(1),
  currency: z.string().min(1), decision: z.string().min(1), data_sufficiency_score: z.number().finite().min(0).max(100),
  edge_score: z.number().finite().min(0).max(100), edge_proof: z.string().min(1), hard_cap_required: z.boolean(),
  rating_cap_reason: z.string().min(1).nullable(), red_flags: z.array(authorityFlag),
  scenario_horizon_days: z.number().int().positive().nullable(), scenarios: z.array(authorityScenario).min(3).max(7).nullable(),
  idea_valuation_bridge: authorityBridge.nullable(), selected_forecast: authorityForecast.nullable(),
  post_audit: postAuditSchema,
}).strict()
const integrityEvidenceSchema = z.object({
  status: z.enum(['verified', 'provisional']), verification_verdict: z.string().min(1).nullable(),
  verification_report_sha256: sha.nullable(), final_thesis_sha256: sha.nullable(),
}).strict()
const candidateIdeaAdmissionSchema = z.object({
  schema_version: z.literal('qualified-idea-admission/v1'), admission_id: z.string().min(1),
  status: z.enum(['admitted', 'not_admitted']), run_root: z.string().min(1), frozen_at: z.string().min(1),
  assessment: ideaAssessmentRuntimeSchema, assessment_sha256: sha,
  candidate: qualifiedIdeaCandidateRuntimeSchema, candidate_sha256: sha,
  decision_authority: decisionAuthoritySchema, decision_authority_sha256: sha,
  market_evidence_sha256: sha, market_evidence: z.record(z.any()), projection_manifest_sha256: sha,
  integrity_evidence: integrityEvidenceSchema,
  integrity_evidence_sha256: sha, gaps: z.array(z.string().min(1)), admission_sha256: sha,
}).strict()
const notApplicableIdeaAdmissionSchema = z.object({
  schema_version: z.literal('qualified-idea-admission/v1'), admission_id: z.string().min(1),
  status: z.literal('not_applicable'), run_root: z.string().min(1), frozen_at: z.string().min(1),
  assessment: ideaAssessmentRuntimeSchema, assessment_sha256: sha,
  candidate: z.null(), candidate_sha256: z.null(), decision_authority: z.null(), decision_authority_sha256: z.null(),
  market_evidence_sha256: z.null(), market_evidence: z.null(), projection_manifest_sha256: sha,
  integrity_evidence: z.null(), integrity_evidence_sha256: z.null(),
  gaps: z.array(z.string().min(1)).min(1), admission_sha256: sha,
}).strict()
const ideaAdmissionSchema = z.union([candidateIdeaAdmissionSchema, notApplicableIdeaAdmissionSchema])
type IdeaAdmission = z.infer<typeof ideaAdmissionSchema>
type CandidateIdeaAdmission = z.infer<typeof candidateIdeaAdmissionSchema>
type NotApplicableIdeaAdmission = z.infer<typeof notApplicableIdeaAdmissionSchema>

export function canonicalQualifiedIdeaJson(value: unknown): string {
  return canonicalJsonText(value)
}

export function qualifiedIdeaJsonSha256(value: unknown): string {
  return createHash('sha256').update(canonicalQualifiedIdeaJson(value), 'utf8').digest('hex')
}

function digest(value: unknown): string { return qualifiedIdeaJsonSha256(value) }

function candidateMatchesDecisionAuthority(
  candidate: QualifiedIdeaCandidate,
  authority: z.infer<typeof decisionAuthoritySchema>,
): boolean {
  const instrument = candidate.instrument
  const research = candidate.research
  if (
    instrument.ticker !== authority.ticker || instrument.company !== authority.company ||
    instrument.exchange !== authority.exchange || instrument.currency !== authority.currency ||
    research.decision !== authority.decision ||
    research.data_sufficiency_score !== authority.data_sufficiency_score ||
    research.edge_score !== authority.edge_score || research.edge_proof !== authority.edge_proof ||
    research.hard_cap_active !== authority.hard_cap_required ||
    research.hard_cap_reason !== authority.rating_cap_reason
  ) return false

  const candidateFlags = new Set(research.unresolved_red_flags.map((flag) => digest(flag)))
  if (authority.red_flags.some((flag) => !candidateFlags.has(digest(flag)))) return false

  const candidateScenarios = candidate.scenarios.map((scenario) => ({
    scenario_id: scenario.scenario_id,
    label: scenario.label,
    probability_pct: scenario.probability_pct,
    source_price_target: scenario.source_price_target,
    conditions: scenario.conditions,
    source: scenario.source,
    joint_probability_basis: scenario.joint_probability_basis ?? null,
  })).sort((left, right) => pythonTextCompare(left.scenario_id, right.scenario_id))
  if (digest(candidateScenarios) !== digest(authority.scenarios ?? [])) return false
  if (
    digest(candidate.valuation_bridge) !== digest(authority.idea_valuation_bridge) ||
    candidate.valuation_bridge.source_horizon_days !== authority.scenario_horizon_days
  ) return false

  const forecast = authority.selected_forecast
  if (!forecast) return false
  const expectedCatalyst = {
    forecast_id: forecast.forecast_id,
    name: forecast.prediction,
    window_start: forecast.window_start,
    window_end: forecast.window_end,
    source: forecast.source_citation,
    status_at_admission: 'scheduled_unresolved',
    status_as_of: forecast.status_as_of,
    causal_steps: forecast.causal_steps,
    bullish_trigger: forecast.stock_bullish_trigger,
    bearish_trigger: forecast.stock_bearish_trigger,
  }
  const expectedFalsifier = {
    condition: forecast.falsification_trigger,
    metric: forecast.metric,
    threshold: forecast.threshold,
    deadline: forecast.window_end,
    source: forecast.source_citation,
  }
  return digest(candidate.catalyst) === digest(expectedCatalyst) && digest(candidate.falsifier) === digest(expectedFalsifier)
}

function admittedIntegrityIsSelfConsistent(integrity: z.infer<typeof integrityEvidenceSchema>): boolean {
  return integrity.status === 'verified' &&
    ['clean', 'minor issues'].includes(String(integrity.verification_verdict || '').trim().toLowerCase()) &&
    typeof integrity.verification_report_sha256 === 'string' &&
    typeof integrity.final_thesis_sha256 === 'string'
}

function candidatePublicationOrderIsValid(
  expectedRoot: string,
  manifestCreatedAtText: unknown,
  candidateCreatedAtText: string,
  frozenAtText: string,
): boolean {
  const runDate = expectedRoot.match(/_(\d{4}-\d{2}-\d{2})$/)?.[1]
  if (!runDate || !isRfc3339(String(manifestCreatedAtText)) || !isRfc3339(candidateCreatedAtText) || !isRfc3339(frozenAtText)) return false
  const dayStart = Date.parse(`${runDate}T00:00:00Z`)
  const manifestCreatedAt = Date.parse(String(manifestCreatedAtText))
  const candidateCreatedAt = Date.parse(candidateCreatedAtText)
  const frozenAt = Date.parse(frozenAtText)
  if (![dayStart, manifestCreatedAt, candidateCreatedAt, frozenAt].every(Number.isFinite)) return false
  const runMin = dayStart - 14 * 60 * 60_000
  const runMax = dayStart + (24 + 14) * 60 * 60_000
  return runMin <= manifestCreatedAt && manifestCreatedAt <= candidateCreatedAt &&
    candidateCreatedAt <= frozenAt && frozenAt <= runMax
}

/** Replay the producer's immutable sidecar contract for the live card. The admission remains the
 * historical outcome witness if this later sidecar is missing or drifts; only the live projection is
 * quarantined. */
function currentMarketEvidenceMatchesAdmission(
  runAbs: string,
  expectedRoot: string,
  admission: CandidateIdeaAdmission,
): boolean {
  try {
    const validated = validateProjectionManifest(runAbs, expectedRoot)
    if (!validated || validated.manifest.manifest_sha256 !== admission.projection_manifest_sha256) return false
    const snapshot = JSON.parse(fs.readFileSync(path.join(runAbs, 'idea_market_evidence.json'), 'utf8'))
    if (!exactKeys(snapshot, ['schema_version', 'captured_at', 'projection_manifest_sha256', 'evidence', 'evidence_sha256'])) return false
    if (
      snapshot.schema_version !== 'idea-market-evidence-snapshot/v1' ||
      snapshot.projection_manifest_sha256 !== admission.projection_manifest_sha256 ||
      !isRfc3339(snapshot.captured_at)
    ) return false
    const capturedAt = Date.parse(snapshot.captured_at)
    const manifestCreatedAt = Date.parse(validated.manifest.created_at)
    const candidateCreatedAt = Date.parse(admission.candidate.created_at)
    if (
      ![capturedAt, manifestCreatedAt, candidateCreatedAt].every(Number.isFinite) ||
      manifestCreatedAt > capturedAt || capturedAt > candidateCreatedAt
    ) return false
    const evidence = snapshot.evidence
    return record(evidence) && snapshot.evidence_sha256 === digest(evidence) &&
      snapshot.evidence_sha256 === admission.market_evidence_sha256 &&
      digest(evidence) === digest(admission.market_evidence)
  } catch { return false }
}

function fileDigest(file: string): string {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function finiteScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

function finiteNonnegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function exactKeys(value: unknown, keys: string[]): value is Record<string, any> {
  return record(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort())
}

const AUDIT_PATTERNS = {
  verification: /^verification_report(?:_v(\d+))?\.json$/,
  pre_mortem: /^pre_mortem(?:_v(\d+))?\.json$/,
  expectations_gap: /^expectations_gap(?:_v(\d+))?\.json$/,
} as const
type AuditKind = keyof typeof AUDIT_PATTERNS
type BoundAudits = Record<AuditKind, Record<string, any>>

function latestAuditName(runAbs: string, kind: AuditKind): string | null {
  const matches: Array<{ version: number; name: string }> = []
  for (const name of fs.readdirSync(runAbs)) {
    const match = AUDIT_PATTERNS[kind].exec(name)
    if (match) matches.push({ version: Number(match[1] || 1), name })
  }
  if (!matches.length) return null
  matches.sort((a, b) => a.version - b.version || a.name.localeCompare(b.name))
  const highest = matches[matches.length - 1].version
  const top = matches.filter((row) => row.version === highest)
  return top.length === 1 ? top[0].name : null
}

interface ValidatedProjectionManifest {
  manifest: Record<string, any>
  decision: Record<string, any>
  audits: BoundAudits
}

/** Runtime mirror of create_idea_projection_manifest.py's complete trust boundary. */
function validateProjectionManifest(runAbs: string, expectedRoot: string): ValidatedProjectionManifest | null {
  try {
    const runIdentity = /^([-A-Z0-9.]{1,24})_(\d{4}-\d{2}-\d{2})$/.exec(path.posix.basename(expectedRoot))
    if (!runIdentity) return null
    const expectedTicker = runIdentity[1]
    const expectedDate = runIdentity[2]
    const expectedDateMs = Date.parse(`${expectedDate}T00:00:00Z`)
    if (!Number.isFinite(expectedDateMs) || new Date(expectedDateMs).toISOString().slice(0, 10) !== expectedDate) return null
    const manifest = JSON.parse(fs.readFileSync(path.join(runAbs, 'idea_projection_manifest.json'), 'utf8'))
    if (!record(manifest) || manifest.schema_version !== 'idea-projection-manifest/v1' || manifest.run_root !== expectedRoot) return null
    const manifestPayload = { ...manifest }
    delete manifestPayload.manifest_sha256
    if (!/^[a-f0-9]{64}$/.test(String(manifest.manifest_sha256 || '')) || manifest.manifest_sha256 !== digest(manifestPayload)) return null
    if (!isRfc3339(manifest.created_at)) return null
    const artifactNames = ['final_thesis', 'decision_record', 'verification', 'pre_mortem', 'expectations_gap'] as const
    if (!exactKeys(manifest.artifacts, [...artifactNames])) return null
    const expectedPaths: Record<(typeof artifactNames)[number], string | null> = {
      final_thesis: 'final_thesis.md',
      decision_record: 'decision_record.json',
      verification: latestAuditName(runAbs, 'verification'),
      pre_mortem: latestAuditName(runAbs, 'pre_mortem'),
      expectations_gap: latestAuditName(runAbs, 'expectations_gap'),
    }
    if (Object.values(expectedPaths).some((value) => value === null)) return null
    const paths = {} as Record<(typeof artifactNames)[number], string>
    for (const name of artifactNames) {
      const item = manifest.artifacts[name]
      if (!exactKeys(item, ['path', 'sha256'])) return null
      const rel = item.path
      if (typeof rel !== 'string' || path.basename(rel) !== rel || !/^[A-Za-z0-9_.-]+$/.test(rel) || rel !== expectedPaths[name]) return null
      const absolute = path.join(runAbs, rel)
      if (!fs.statSync(absolute).isFile() || item.sha256 !== fileDigest(absolute)) return null
      paths[name] = absolute
    }
    const decision = JSON.parse(fs.readFileSync(paths.decision_record, 'utf8'))
    if (
      !record(decision) || decision.run_root !== expectedRoot ||
      decision.ticker !== expectedTicker || decision.decision_date !== expectedDate
    ) return null
    const thesisSha = fileDigest(paths.final_thesis)
    const decisionSha = fileDigest(paths.decision_record)
    const expectedThesis = `${expectedRoot}/final_thesis.md`
    const expectedDecision = `${expectedRoot}/decision_record.json`
    const audits = {} as BoundAudits
    for (const name of ['verification', 'pre_mortem', 'expectations_gap'] as const) {
      const audit = JSON.parse(fs.readFileSync(paths[name], 'utf8'))
      if (
        !record(audit) || audit.schema_version !== '1.0' || audit.ticker !== decision.ticker || audit.run_root !== expectedRoot ||
        audit.final_thesis_path !== expectedThesis || audit.decision_record_path !== expectedDecision ||
        audit.final_thesis_sha256 !== thesisSha || audit.decision_record_sha256 !== decisionSha
      ) return null
      audits[name] = audit
    }
    const verification = audits.verification
    const blocking = verification.blocking_findings
    if (
      !isRfc3339(verification.verified_at) || verification.verifier !== 'verify-evidence' ||
      !['Clean', 'Minor issues', 'Material issues', 'Failed'].includes(verification.verdict) ||
      !finiteScore(verification.integrity_score) || !Array.isArray(blocking) ||
      (['Clean', 'Minor issues'].includes(verification.verdict) && blocking.length !== 0) ||
      (['Material issues', 'Failed'].includes(verification.verdict) && blocking.length === 0)
    ) return null
    const preMortem = audits.pre_mortem
    const preVerdicts = new Set(['Survives', 'Survives with haircut', 'Does not survive — downgrade', 'Thesis broken'])
    const expectedSurvival = preMortem.verdict === 'Survives' || preMortem.verdict === 'Survives with haircut'
    const originalConfidence = preMortem.original_confidence
    const confidenceHaircut = preMortem.confidence_haircut
    const recommendedConfidence = preMortem.recommended_confidence
    if (
      !isRfc3339(preMortem.performed_at) || preMortem.auditor !== 'pre-mortem' || !preVerdicts.has(preMortem.verdict) ||
      typeof preMortem.survives !== 'boolean' || preMortem.survives !== expectedSurvival ||
      !finiteScore(originalConfidence) || !finiteNonnegative(confidenceHaircut) || !finiteScore(recommendedConfidence) ||
      Math.abs(recommendedConfidence - Math.max(0, originalConfidence - confidenceHaircut)) > 0.05 ||
      typeof preMortem.recommended_rating_cap !== 'string' ||
      (!preMortem.survives && !preMortem.recommended_rating_cap.trim())
    ) return null
    const expectations = audits.expectations_gap
    const qualities = new Set(['None', 'Weak', 'Moderate', 'Strong'])
    if (
      !isRfc3339(expectations.performed_at) || expectations.analyst !== 'expectations-gap' ||
      !qualities.has(expectations.variant_perception_quality) || typeof expectations.is_exploitable !== 'boolean' ||
      !finiteScore(expectations.edge_score) ||
      (['None', 'Weak'].includes(expectations.variant_perception_quality) && expectations.is_exploitable) ||
      (!expectations.is_exploitable && expectations.edge_score >= 50)
    ) return null
    return { manifest, decision, audits }
  } catch {
    return null
  }
}

function readAdmission(runAbs: string, expectedRoot: string): { admission: IdeaAdmission | null; error: string | null } {
  const file = path.join(runAbs, 'idea_admission.json')
  if (!fs.existsSync(file)) return { admission: null, error: 'The post-audit admission snapshot is missing.' }
  try {
    const parsed = ideaAdmissionSchema.safeParse(JSON.parse(fs.readFileSync(file, 'utf8')))
    if (!parsed.success) return { admission: null, error: 'The post-audit admission snapshot is malformed.' }
    const admission = parsed.data
    const payload: any = { ...admission }
    delete payload.admission_sha256
    const frozenAt = Date.parse(admission.frozen_at)
    const runDate = expectedRoot.match(/_(\d{4}-\d{2}-\d{2})$/)?.[1]
    if (
      admission.run_root !== expectedRoot || admission.assessment.run_root !== expectedRoot ||
      admission.assessment_sha256 !== digest(admission.assessment) ||
      admission.admission_sha256 !== digest(payload) || !isRfc3339(admission.frozen_at) || !Number.isFinite(frozenAt)
    ) return { admission: null, error: 'The post-audit admission snapshot failed digest or state reconciliation.' }
    if (admission.status === 'not_applicable') {
      const createdAt = Date.parse(admission.assessment.created_at)
      if (
        admission.assessment.status !== 'not_assessable' || admission.assessment.candidate !== null ||
        admission.assessment.gaps.length === 0 || digest(admission.gaps) !== digest(admission.assessment.gaps) ||
        !Number.isFinite(createdAt) || createdAt > frozenAt
      ) return { admission: null, error: 'The frozen not-assessable result failed digest or state reconciliation.' }
      // Keep the immutable negative authoritative even when its mutable witnesses drift, but report the
      // drift so board health degrades. This mirrors the Python idempotent recovery checks without ever
      // allowing a later candidate rewrite to replace the first frozen result.
      const mismatch = 'The sealed not-assessable run no longer matches its assessment and projection authority.'
      const mutableAssessmentFile = path.join(runAbs, 'idea_3_6m.json')
      try {
        if (!fs.existsSync(mutableAssessmentFile)) return { admission, error: mismatch }
        const mutable = JSON.parse(fs.readFileSync(mutableAssessmentFile, 'utf8'))
        if (!ideaAssessmentRuntimeSchema.safeParse(mutable).success || digest(mutable) !== admission.assessment_sha256) {
          return { admission, error: mismatch }
        }
      } catch { return { admission, error: mismatch } }
      const current = validateProjectionManifest(runAbs, expectedRoot)
      const manifestCreatedAt = Date.parse(current?.manifest.created_at ?? '')
      const decisionCompany = typeof current?.decision.company_name === 'string' && current.decision.company_name.trim()
        ? current.decision.company_name.trim() : null
      if (
        !current || current.manifest.manifest_sha256 !== admission.projection_manifest_sha256 ||
        current.decision.ticker !== admission.assessment.ticker ||
        decisionCompany !== admission.assessment.company ||
        !Number.isFinite(manifestCreatedAt) || manifestCreatedAt > createdAt
      ) return { admission, error: mismatch }
      return { admission, error: null }
    }
    const evidence = admission.market_evidence as any
    const evidenceInstrument = record(evidence?.instrument) ? evidence.instrument : {}
    const createdAt = Date.parse(admission.candidate.created_at)
    const horizonStart = Date.parse(admission.candidate.horizon.start)
    const catalystStart = Date.parse(admission.candidate.catalyst.window_start)
    const wrapperMatchesCandidate = admission.assessment.status === 'candidate' && admission.assessment.gaps.length === 0 &&
      digest(admission.assessment.candidate) === digest(admission.candidate) &&
      admission.assessment.run_root === admission.candidate.run_root &&
      admission.assessment.ticker === admission.candidate.instrument.ticker &&
      admission.assessment.company === admission.candidate.instrument.company &&
      admission.assessment.created_at === admission.candidate.created_at
    if (
      !wrapperMatchesCandidate ||
      admission.candidate.run_root !== expectedRoot ||
      admission.candidate_sha256 !== digest(admission.candidate) ||
      admission.admission_id !== `${admission.candidate.idea_id}|${admission.candidate_sha256.slice(0, 16)}` ||
      admission.decision_authority_sha256 !== digest(admission.decision_authority) ||
      admission.integrity_evidence_sha256 !== digest(admission.integrity_evidence) ||
      admission.market_evidence_sha256 !== admission.candidate.market_evidence_sha256 || admission.market_evidence_sha256 !== digest(evidence) ||
      admission.projection_manifest_sha256 !== admission.candidate.projection_manifest_sha256 ||
      evidence?.schema_version !== 'idea-market-evidence/v1' || evidence?.available !== true || !Array.isArray(evidence?.gaps) || evidence.gaps.length !== 0 ||
      evidenceInstrument.ticker !== admission.candidate.instrument.ticker || evidenceInstrument.exchange !== admission.candidate.instrument.exchange ||
      evidenceInstrument.currency !== admission.candidate.instrument.currency || evidenceInstrument.asset_type !== 'equity' ||
      digest(evidence?.quote) !== digest(admission.candidate.quote) || digest(evidence?.liquidity) !== digest(admission.candidate.liquidity) ||
      digest(evidence?.market_risk) !== digest(admission.candidate.market_risk) ||
      admission.candidate.decision_date !== runDate || admission.decision_authority.decision_date !== runDate ||
      ![frozenAt, createdAt, horizonStart, catalystStart].every(Number.isFinite) || createdAt > frozenAt || frozenAt > horizonStart || frozenAt > catalystStart ||
      (admission.status === 'admitted' && (admission.gaps.length > 0 || admission.integrity_evidence.status !== 'verified' ||
        !admission.decision_authority.scenarios || !admission.decision_authority.scenario_horizon_days ||
        !admission.decision_authority.idea_valuation_bridge || !admission.decision_authority.selected_forecast ||
        !candidateMatchesDecisionAuthority(admission.candidate, admission.decision_authority) ||
        !admittedIntegrityIsSelfConsistent(admission.integrity_evidence))) ||
      (admission.status === 'not_admitted' && admission.gaps.length === 0)
    ) return { admission: null, error: 'The post-audit admission snapshot failed digest or state reconciliation.' }

    // If the pinned projection is still byte-for-byte valid, it is safe to replay the producer contract and
    // prove the embedded authority/integrity came from those exact files. If later research files drift, the
    // manifest stops validating: live projection quarantines that drift, while the original frozen outcome
    // cohort stays intact. This distinction blocks a fully rehashed forged admission without hindsight edits
    // selecting genuine historical admissions out of the denominator.
    if (admission.status === 'admitted') {
      const pinned = validateProjectionManifest(runAbs, expectedRoot)
      if (pinned?.manifest.manifest_sha256 === admission.projection_manifest_sha256) {
        if (!candidatePublicationOrderIsValid(
          expectedRoot, pinned.manifest.created_at, admission.candidate.created_at, admission.frozen_at,
        )) return { admission: null, error: 'The post-audit admission snapshot failed producer publication order.' }
        const current = currentDecisionAuthority(
          runAbs, expectedRoot, admission.candidate, admission.projection_manifest_sha256,
        )
        if (
          !current || digest(current.decision) !== admission.decision_authority_sha256 ||
          digest(current.integrity) !== admission.integrity_evidence_sha256
        ) return { admission: null, error: 'The post-audit admission snapshot failed pinned producer reconciliation.' }
      }
    }
    return { admission, error: null }
  } catch {
    return { admission: null, error: 'The post-audit admission snapshot is unreadable.' }
  }
}

// Keep corrupt or half-written producer output out of the evaluator. The evaluator still owns semantic
// gates, but it must receive the complete object graph its fail-closed checks inspect; one missing nested
// object must count as an invalid artifact, not crash the entire board projection.
function candidateEnvelope(v: unknown): v is QualifiedIdeaCandidate {
  return qualifiedIdeaCandidateRuntimeSchema.safeParse(v).success
}

interface PublicationProgress {
  lastProgressMs: number
  status: 'running' | 'terminal'
}

function publicationRunKind(kind: string, chained: boolean | undefined): boolean {
  return kind === 'full' || kind === 'rerun' || chained === true
}

function liveResearchPublicationRun(kind: string, chained: boolean | undefined, swarm: string | undefined): boolean {
  return (swarm === undefined || swarm === 'research') && publicationRunKind(kind, chained)
}

/**
 * Find a trustworthy, restart-safe clock for the short interval between the synthesizer writing its
 * terminal thesis/decision and writing the preliminary idea assessment. Filesystem mtimes are not a
 * clock here: a checkout rewrites them. The live registry is authoritative while this process owns the
 * run; after a restart, an unmatched launch in the append-only activity ledger supplies a durable clock.
 */
function publicationProgressForRun(
  expectedRoot: string,
  ticker: string,
  activityRows: () => ActivityRow[],
): PublicationProgress | null {
  const active = inFlightRunsForTicker(ticker)
    .filter((run) => run.runRoot === expectedRoot && liveResearchPublicationRun(run.kind, run.chained, run.swarmId))
    .filter((run) => Number.isFinite(run.startedAt))
    .sort((a, b) => b.startedAt - a.startedAt || b.runId.localeCompare(a.runId))
  const latestActive = active[0]

  // Choose the latest ATTEMPT before inspecting status. Filtering to `running` first would let an older
  // orphaned launch hold grace open after a newer retry for the same root had already ended.
  const latestDurable = activityRows()
    // Exact run-root identity is stronger than the optional legacy swarm label. Never let a malformed
    // foreign tag hide a terminal retry for this research folder.
    .filter((row) => Number.isFinite(row.launchedAt) && row.runRoot === expectedRoot && publicationRunKind(row.kind, row.chained))
    .sort((a, b) => b.launchedAt - a.launchedAt || b.runId.localeCompare(a.runId))[0]

  // A newly claimed in-memory attempt may precede its durable launch line by a few milliseconds. It is
  // authoritative only when it is strictly newer than every durable attempt; an older orphan cannot
  // override a newer terminal ledger row.
  if (latestActive && (!latestDurable || latestActive.startedAt > latestDurable.launchedAt)) {
    return {
      lastProgressMs: Math.max(latestActive.startedAt, latestActive.lastStdoutAt ?? -Infinity, latestActive.lastActivity?.ts ?? -Infinity),
      status: 'running',
    }
  }
  if (!latestDurable) return null
  if (latestDurable.status !== 'running') {
    return { lastProgressMs: latestDurable.finishedAt ?? latestDurable.launchedAt, status: 'terminal' }
  }
  const liveAttempt = active.find((run) => run.runId === latestDurable.runId)
  return {
    lastProgressMs: liveAttempt
      ? Math.max(latestDurable.launchedAt, liveAttempt.lastStdoutAt ?? -Infinity, liveAttempt.lastActivity?.ts ?? -Infinity)
      : latestDurable.launchedAt,
    status: 'running',
  }
}

/**
 * Return only run roots whose thesis and decision are both different from the Git index. This makes
 * the files' mtimes useful as a short-lived direct-producer clock without letting a clean checkout (or
 * merely touching already-committed files) manufacture a fresh publication window. One bounded Git
 * read covers the entire board projection; failure is deliberately an empty, fail-closed result.
 */
function readUncommittedPublicationRuns(repoRoot: string): ReadonlySet<string> {
  const result = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', 'analyses'], {
    cwd: repoRoot, encoding: 'utf8', timeout: 1_500, maxBuffer: 2 * 1024 * 1024,
  })
  if (result.status !== 0 || result.error) return new Set()
  const dirtyFiles = new Set<string>()
  for (const entry of result.stdout.split('\0')) {
    if (entry.length < 4) continue
    const rel = entry.slice(3).replaceAll('\\', '/')
    if (rel.startsWith('analyses/')) dirtyFiles.add(rel)
  }
  const witnesses = new Map<string, Set<string>>()
  for (const rel of dirtyFiles) {
    const match = /^(analyses\/[-A-Z0-9.]+_\d{4}-\d{2}-\d{2})\/(final_thesis\.md|decision_record\.json)$/.exec(rel)
    if (!match) continue
    const names = witnesses.get(match[1]) ?? new Set<string>()
    names.add(match[2])
    witnesses.set(match[1], names)
  }
  return new Set([...witnesses].filter(([, names]) => names.size === 2).map(([runRoot]) => runRoot))
}

function directPublicationClock(
  runAbs: string,
  expectedRoot: string,
  ticker: string,
  uncommittedRuns: ReadonlySet<string>,
): number | null {
  if (!uncommittedRuns.has(expectedRoot)) return null
  const thesis = path.join(runAbs, 'final_thesis.md')
  const decisionFile = path.join(runAbs, 'decision_record.json')
  try {
    const decision = JSON.parse(fs.readFileSync(decisionFile, 'utf8'))
    const runDate = expectedRunName(expectedRoot).slice(-10)
    if (
      !record(decision) || decision.run_root !== expectedRoot || decision.ticker !== ticker ||
      decision.decision_date !== runDate
    ) return null
    const thesisMtime = fs.statSync(thesis).mtimeMs
    const decisionMtime = fs.statSync(decisionFile).mtimeMs
    if (!Number.isFinite(thesisMtime) || !Number.isFinite(decisionMtime)) return null
    if (Math.abs(thesisMtime - decisionMtime) > DIRECT_PUBLICATION_FILE_SKEW_MS) return null
    return Math.max(thesisMtime, decisionMtime)
  } catch { return null }
}

function discover(
  repoRoot: string,
  nowMs = Date.now(),
  readActivityRows: typeof readActivity = readActivity,
  readUncommittedRuns: (repoRoot: string) => ReadonlySet<string> = readUncommittedPublicationRuns,
): {
  rows: Discovered[]
  gaps: GapAssessment[]
  artifacts: number
  assessments: number
  invalid: number
  incomplete: number
  incompleteRunRoots: Set<string>
  publishing: number
  discoveryError: string | null
  latestStandingRunByTicker: Map<string, string>
} {
  const analyses = path.resolve(repoRoot, 'analyses')
  let runNames: string[] = []
  try { runNames = fs.readdirSync(analyses).filter((x) => /_\d{4}-\d{2}-\d{2}$/.test(x)).sort() } catch (e: any) {
    if (e?.code === 'ENOENT') return { rows: [], gaps: [], artifacts: 0, assessments: 0, invalid: 0, incomplete: 0, incompleteRunRoots: new Set(), publishing: 0, discoveryError: null, latestStandingRunByTicker: new Map() }
    return {
      rows: [], gaps: [], artifacts: 0, assessments: 0, invalid: 0, incomplete: 0, incompleteRunRoots: new Set(), publishing: 0,
      discoveryError: `The analyses store cannot be read: ${String(e?.message || e).slice(0, 240)}`,
      latestStandingRunByTicker: new Map(),
    }
  }
  const rows: Discovered[] = []
  const gaps: GapAssessment[] = []
  const latestStandingRunByTicker = new Map<string, string>()
  const latestPublicationRunByTicker = new Map<string, string>()
  let artifacts = 0
  let assessments = 0
  const invalidRunRoots = new Set<string>()
  const incompleteRunRoots = new Set<string>()
  const publishingRunRoots = new Set<string>()
  const activityTickers = [...new Set(runNames
    .map((runName) => runName.slice(0, -11).toUpperCase())
    .filter((ticker) => /^[-A-Z0-9.]{1,24}$/.test(ticker)))]
  let activityRowsByTicker: Map<string, ActivityRow[]> | null = null
  let activityLedgerComplete = false
  const activityRowsFor = (ticker: string): ActivityRow[] => {
    if (!activityRowsByTicker) {
      activityRowsByTicker = new Map()
      // readActivity already parses/folds the ledger once. Filter that one pass to board tickers before
      // returning every matching row, so 5,000 unrelated runs cannot permanently disable publication
      // grace while terminal retries for a relevant ticker remain hidden beyond the global slice.
      const activity = readActivityRows({ tickers: activityTickers, limit: null })
      activityLedgerComplete = (activity.invalid_event_count ?? 0) === 0 && activity.total <= activity.rows.length
      for (const row of activity.rows) {
        // The append-only log is a runtime trust boundary: a syntactically valid legacy/corrupt JSON
        // line can fold into a row even when its ticker is absent or not a string. Never let one bad
        // historical row take down the board, and do not call the ledger complete after skipping it —
        // that row could otherwise conceal a terminal attempt and manufacture direct-producer grace.
        if (typeof row?.ticker !== 'string') {
          activityLedgerComplete = false
          continue
        }
        const key = row.ticker.toUpperCase()
        // Production validates this before folding, but keep the injected/test boundary defensive too.
        // A publication row with no canonical, ticker-matching run root could be a hidden terminal retry;
        // it must disable the weaker Git-mtime grace rather than let an older sealed call remain live.
        if (publicationRunKind(row.kind, row.chained)) {
          const root = typeof row.runRoot === 'string'
            ? /^analyses\/([-A-Z0-9.]+)_\d{4}-\d{2}-\d{2}$/.exec(row.runRoot)
            : null
          if (root) {
            if (root[1] !== key || (row.swarm !== undefined && row.swarm !== 'research')) {
              activityLedgerComplete = false
            }
          } else if (row.swarm === 'research' || row.runRoot === undefined) {
            // An explicitly research-tagged row with a foreign root, or a legacy publication row with
            // no root at all, may conceal a terminal attempt. It cannot authorize the weaker mtime clock.
            activityLedgerComplete = false
          }
        }
        const grouped = activityRowsByTicker.get(key) ?? []
        grouped.push(row)
        activityRowsByTicker.set(key, grouped)
      }
    }
    return activityRowsByTicker.get(ticker.toUpperCase()) ?? []
  }
  let uncommittedPublicationRuns: ReadonlySet<string> | null = null
  const directClockFor = (runAbs: string, expectedRoot: string, ticker: string): number | null => {
    uncommittedPublicationRuns ??= readUncommittedRuns(repoRoot)
    return directPublicationClock(runAbs, expectedRoot, ticker, uncommittedPublicationRuns)
  }
  for (const runName of runNames) {
    const runAbs = path.resolve(analyses, runName)
    if (!runAbs.startsWith(analyses + path.sep)) continue
    const corrections = correctionsState(runAbs)
    const inferredTicker = runName.slice(0, -11).toUpperCase()
    const expectedRoot = path.posix.join('analyses', runName)
    const assessmentFile = path.join(runAbs, 'idea_3_6m.json')
    const legacyFile = path.join(runAbs, 'qualified_idea.json')
    const file = fs.existsSync(assessmentFile) ? assessmentFile : legacyFile
    const admissionRead = readAdmission(runAbs, expectedRoot)
    const frozenNegative: NotApplicableIdeaAdmission | null = admissionRead.admission?.status === 'not_applicable'
      ? admissionRead.admission : null
    const candidateAdmission: CandidateIdeaAdmission | null = admissionRead.admission && admissionRead.admission.status !== 'not_applicable'
      ? admissionRead.admission : null
    const admissionFileExists = fs.existsSync(path.join(runAbs, 'idea_admission.json'))
    const projectionMarkerExists = fs.existsSync(path.join(runAbs, 'idea_projection_manifest.json'))
    const markInvalid = (): void => { invalidRunRoots.add(expectedRoot) }
    const advanceStanding = (): void => {
      if (corrections.superseded) return
      const prior = latestStandingRunByTicker.get(inferredTicker)
      if (!prior || expectedRunName(prior) < runName) latestStandingRunByTicker.set(inferredTicker, expectedRoot)
    }
    const pushFrozenFallback = (message: string): boolean => {
      if (!candidateAdmission) return false
      let mtimeMs = Date.parse(candidateAdmission.frozen_at)
      if (!Number.isFinite(mtimeMs)) mtimeMs = safeMtimeMs(path.join(runAbs, 'idea_admission.json'), nowMs)
      rows.push({
        candidate: candidateAdmission.candidate, runAbs, mtimeMs, corrected: corrections.corrected,
        superseded: corrections.superseded, admission: candidateAdmission, admissionError: message,
      })
      return true
    }
    const completed = fs.existsSync(path.join(runAbs, 'decision_record.json')) && fs.existsSync(path.join(runAbs, 'final_thesis.md'))
    const immutableRequired = runName.slice(-10) >= IMMUTABLE_IDEA_PUBLICATION_REQUIRED_FROM
    // Forward runs are terminal only when a complete admission parses and reconciles. A manifest is an
    // intermediate seal, not permission to evaluate mutable scenario bytes. Legacy pre-cutoff runs keep
    // their marker-only compatibility path.
    const finalized = !!admissionRead.admission || (!immutableRequired && completed && projectionMarkerExists)
    // A downstream publication marker proves this run entered the terminal sequence even if an earlier
    // witness was later deleted. Such a damaged run must quarantine the older card, never disappear.
    const publicationStarted = completed || admissionFileExists || projectionMarkerExists
    const publicationUnsealed = immutableRequired && publicationStarted && !admissionRead.admission
    if (!corrections.superseded && (finalized || publicationUnsealed)) {
      const prior = latestPublicationRunByTicker.get(inferredTicker)
      if (!prior || expectedRunName(prior) < runName) latestPublicationRunByTicker.set(inferredTicker, expectedRoot)
    }
    if (finalized) advanceStanding()
    if (publicationUnsealed) {
      if (!corrections.superseded) artifacts++
      let preliminary: IdeaAssessment | null = null
      let preliminaryError: string | null = null
      if (fs.existsSync(file)) {
        try {
          const parsed = ideaAssessmentRuntimeSchema.safeParse(JSON.parse(fs.readFileSync(file, 'utf8')))
          if (!parsed.success) throw new Error('invalid preliminary assessment')
          const assessment = parsed.data
          if (
            assessment.run_root !== expectedRoot || assessment.ticker !== inferredTicker ||
            !isRfc3339(assessment.created_at) || !nonEmpty(assessment.assessment_id)
          ) throw new Error('preliminary assessment identity mismatch')
          preliminary = assessment
        } catch (error: any) {
          preliminaryError = String(error?.message || error)
        }
      }
      // The assessment's canonical timestamp is the strongest publication clock. During the normal
      // producer interval before that file exists, use the cockpit's live run progress or its durable
      // activity ledger. A run with neither proof is not granted grace, and a future clock fails closed.
      const producerProgress = publicationProgressForRun(
        expectedRoot, inferredTicker, () => activityRowsFor(inferredTicker),
      )
      const preliminaryCreatedMs = preliminary ? Date.parse(preliminary.created_at) : NaN
      // If the one bounded ledger read was truncated, an omitted terminal retry may exist. In that
      // case artifact mtimes cannot safely overrule the unknown history, so direct grace fails closed.
      const directProducerMs = !producerProgress && !preliminary && activityLedgerComplete
        ? directClockFor(runAbs, expectedRoot, inferredTicker)
        : null
      const lastProgressMs = producerProgress?.status === 'running'
        ? Number.isFinite(preliminaryCreatedMs)
          ? Math.max(preliminaryCreatedMs, producerProgress.lastProgressMs)
          : producerProgress.lastProgressMs
        : Number.isFinite(preliminaryCreatedMs) ? preliminaryCreatedMs : (directProducerMs ?? NaN)
      const producerTerminated = producerProgress?.status === 'terminal'
      const publicationClockInvalid = Number.isFinite(lastProgressMs) && lastProgressMs > nowMs + IDEA_PUBLICATION_CLOCK_SKEW_MS
      const completionWitnessMissing = !completed && (admissionFileExists || projectionMarkerExists)
      const publicationFailed = completionWitnessMissing || admissionFileExists || preliminaryError !== null
        || producerTerminated || !Number.isFinite(lastProgressMs) || publicationClockInvalid
        || nowMs - lastProgressMs > IDEA_PUBLICATION_GRACE_MS
      if (publicationFailed) incompleteRunRoots.add(expectedRoot)
      if (admissionFileExists) markInvalid()
      const publicationGap = completionWitnessMissing
        ? 'Immutable idea publication is damaged: a downstream marker exists but the final thesis or decision record is missing.'
        : publicationClockInvalid
          ? `Immutable idea publication failed: the ${preliminary ? 'preliminary assessment' : 'producer progress'} timestamp is in the future.`
        : admissionFileExists
        ? `Immutable idea publication failed: ${admissionRead.error || 'the admission snapshot is invalid.'}`
        : producerTerminated
          ? 'Research stopped before immutable idea publication finished.'
        : publicationFailed
          ? 'Research finished, but immutable idea publication did not finish.'
          : 'Research finished and immutable idea publication is still in progress; no idea is shown until admission seals.'
      // A semantic preliminary result (or a failed terminal sequence) supersedes the older call. Merely
      // seeing final_thesis + decision_record while the same run is still producing its assessment does
      // not: keep the older sealed card live until the new result exists or the grace window expires.
      if (preliminary || publicationFailed) advanceStanding()
      if (!publicationFailed) {
        publishingRunRoots.add(expectedRoot)
        continue
      }
      if (!preliminary) {
        if (publicationFailed) markInvalid()
        gaps.push({
          assessment_id: `${inferredTicker}-${runName.slice(-10)}-3-6m-${preliminaryError ? 'incomplete' : 'missing'}`, run_root: expectedRoot,
          created_at: new Date(nowMs).toISOString(),
          ticker: inferredTicker, company: null,
          gaps: [
            preliminaryError
              ? 'The preliminary 3-6 month assessment is unreadable or does not match its run.'
              : 'The required 3-6 month assessment is not available.',
            publicationGap,
          ],
        })
        continue
      }
      if (!corrections.superseded) assessments++
      gaps.push({
        assessment_id: preliminary.assessment_id, run_root: preliminary.run_root,
        created_at: preliminary.created_at, ticker: preliminary.ticker, company: preliminary.company ?? null,
        gaps: [...new Set([...preliminary.gaps, publicationGap])],
      })
      continue
    }
    if (!finalized) {
      continue
    }
    if (!corrections.superseded) artifacts++
    if (frozenNegative) {
      if (!corrections.superseded) {
        assessments++
        const assessment = frozenNegative.assessment
        // The frozen first result remains authoritative. A mutable rewrite is surfaced as an integrity
        // defect, but can never turn this dated run into a retrospective candidate.
        if (admissionRead.error) markInvalid()
        gaps.push({
          assessment_id: assessment.assessment_id, run_root: assessment.run_root, created_at: assessment.created_at,
          ticker: assessment.ticker, company: assessment.company ?? null, gaps: assessment.gaps,
        })
      }
      continue
    }
    if (!fs.existsSync(file)) {
      if (pushFrozenFallback('The mutable assessment is missing; the admitted forecast remains frozen for outcomes but is quarantined live.')) {
        if (!corrections.superseded) markInvalid()
        continue
      }
      // The producer contract applies to forward runs. A completed newer run with no assessment is
      // authoritative and must shadow an older card instead of silently leaving it live.
      if (!corrections.superseded && completed && runName.slice(-10) >= IMMUTABLE_IDEA_PUBLICATION_REQUIRED_FROM) {
        markInvalid()
        let company: string | null = null
        try { company = nonEmpty(JSON.parse(fs.readFileSync(path.join(runAbs, 'decision_record.json'), 'utf8')).company_name) ? JSON.parse(fs.readFileSync(path.join(runAbs, 'decision_record.json'), 'utf8')).company_name : null } catch {}
        gaps.push({
          assessment_id: `${inferredTicker}-${runName.slice(-10)}-3-6m-missing`, run_root: expectedRoot,
          created_at: new Date(safeMtimeMs(path.join(runAbs, 'decision_record.json'), nowMs)).toISOString(),
          ticker: inferredTicker, company, gaps: ['Completed research run is missing the required 3–6 month assessment.'],
        })
      }
      continue
    }
    try {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as IdeaAssessment | QualifiedIdeaCandidate
      let candidate: QualifiedIdeaCandidate
      if ((raw as IdeaAssessment)?.schema_version === IDEA_ASSESSMENT_SCHEMA) {
        const parsedAssessment = ideaAssessmentRuntimeSchema.safeParse(raw)
        if (!parsedAssessment.success) {
          if (!corrections.superseded) markInvalid()
          pushFrozenFallback('The mutable assessment is malformed; the admitted forecast remains frozen for outcomes but is quarantined live.')
          continue
        }
        const assessment = parsedAssessment.data
        if (!corrections.superseded) assessments++
        if (
          assessment.run_root !== expectedRoot || !nonEmpty(assessment.assessment_id) ||
          !/^[-A-Z0-9.]{1,24}$/.test(String(assessment.ticker ?? '')) ||
          assessment.ticker !== inferredTicker ||
          !isRfc3339(assessment.created_at) ||
          !(assessment.company === null || nonEmpty(assessment.company))
        ) {
          if (!corrections.superseded) markInvalid()
          pushFrozenFallback('The mutable assessment wrapper no longer matches its run; the admitted forecast remains frozen for outcomes but is quarantined live.')
          continue
        }
        if (assessment.status === 'not_assessable') {
          if (candidateAdmission) {
            if (!corrections.superseded) markInvalid()
            pushFrozenFallback('The mutable assessment was changed to not_assessable after admission; the frozen outcome remains immutable.')
          } else if (!corrections.superseded) {
            gaps.push({ assessment_id: assessment.assessment_id, run_root: assessment.run_root, created_at: assessment.created_at, ticker: assessment.ticker, company: assessment.company ?? null, gaps: assessment.gaps })
          }
          continue
        }
        candidate = assessment.candidate!
        if (
          !candidateEnvelope(candidate) || assessment.ticker !== candidate.instrument.ticker ||
          assessment.company !== candidate.instrument.company || assessment.created_at !== candidate.created_at
        ) {
          if (!corrections.superseded) markInvalid()
          pushFrozenFallback('The mutable candidate wrapper no longer reconciles; the admitted forecast remains frozen for outcomes but is quarantined live.')
          continue
        }
      } else {
        if (!candidateEnvelope(raw)) {
          if (!corrections.superseded) markInvalid()
          pushFrozenFallback('The mutable legacy candidate is malformed; the admitted forecast remains frozen for outcomes but is quarantined live.')
          continue
        }
        candidate = raw // backward-compatible prototype artifact
      }
      if (!candidate || candidate.run_root !== expectedRoot || candidate.instrument.ticker !== inferredTicker || typeof candidate.idea_id !== 'string') {
        if (!corrections.superseded) markInvalid()
        pushFrozenFallback('The mutable candidate identity no longer matches its run; the admitted forecast remains frozen for outcomes but is quarantined live.')
        continue
      }
      const mtimeMs = safeMtimeMs(file, nowMs)
      let admissionError = admissionRead.error
      if (candidateAdmission) {
        if (digest(raw) !== candidateAdmission.assessment_sha256) {
          admissionError = 'The mutable assessment no longer matches its immutable admission snapshot.'
        }
        candidate = candidateAdmission.candidate
        if (!admissionError && candidateAdmission.status === 'admitted') {
          const current = currentDecisionAuthority(
            runAbs, candidate.run_root, candidate, candidateAdmission.projection_manifest_sha256,
          )
          if (
            !current || digest(current.decision) !== candidateAdmission.decision_authority_sha256 ||
            digest(current.integrity) !== candidateAdmission.integrity_evidence_sha256
          ) {
            admissionError = CURRENT_AUTHORITY_MISMATCH
          } else if (!currentMarketEvidenceMatchesAdmission(runAbs, candidate.run_root, candidateAdmission)) {
            admissionError = CURRENT_MARKET_EVIDENCE_MISMATCH
          }
        }
      }
      if (!corrections.superseded && admissionError && (completed || admissionFileExists)) markInvalid()
      rows.push({ candidate, runAbs, mtimeMs, corrected: corrections.corrected, superseded: corrections.superseded, admission: candidateAdmission, admissionError })
    } catch {
      if (!corrections.superseded) markInvalid()
      pushFrozenFallback('The mutable assessment is unreadable; the admitted forecast remains frozen for outcomes but is quarantined live.')
    }
  }
  const isCurrentRoot = (runRoot: string): boolean => {
    const name = expectedRunName(runRoot)
    const ticker = name.slice(0, -11).toUpperCase()
    return latestStandingRunByTicker.get(ticker) === runRoot
  }
  const currentIncompleteRunRoots = new Set([...incompleteRunRoots].filter(isCurrentRoot))
  const currentPublishingRunRoots = new Set([...publishingRunRoots].filter((runRoot) => {
    const name = expectedRunName(runRoot)
    const ticker = name.slice(0, -11).toUpperCase()
    return latestPublicationRunByTicker.get(ticker) === runRoot
  }))
  const invalid = [...invalidRunRoots].filter(isCurrentRoot).length
  return {
    rows, gaps, artifacts, assessments, invalid, incomplete: currentIncompleteRunRoots.size,
    incompleteRunRoots: currentIncompleteRunRoots, publishing: currentPublishingRunRoots.size,
    discoveryError: null, latestStandingRunByTicker,
  }
}

function expectedRunName(runRoot: string): string { return runRoot.split('/').pop() || '' }

function safeMtimeMs(file: string, fallback: number): number {
  try { return fs.statSync(file).mtimeMs } catch { return fallback }
}

function nonEmpty(v: unknown): v is string { return typeof v === 'string' && v.trim().length > 0 }

// Python's list/tuple sort compares Unicode code points. localeCompare is locale-dependent and JS's
// default UTF-16 sort differs for astral characters, so use an explicit comparator for authority rows
// whose list order is itself sealed by the Python producer.
function pythonTextCompare(left: string, right: string): number {
  const a = [...left]
  const b = [...right]
  const length = Math.min(a.length, b.length)
  for (let index = 0; index < length; index++) {
    const av = a[index].codePointAt(0)!
    const bv = b[index].codePointAt(0)!
    if (av !== bv) return av < bv ? -1 : 1
  }
  return a.length - b.length
}

function currentIntegrityEvidence(
  runAbs: string,
  validated: ValidatedProjectionManifest,
): z.infer<typeof integrityEvidenceSchema> | null {
  try {
    const verdict = validated.audits.verification.verdict
    const opening = fs.readFileSync(path.join(runAbs, 'final_thesis.md'), 'utf8')
      .slice(0, 4_096).split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? ''
    const upper = opening.toUpperCase()
    const provisional = upper.startsWith('> ⚠️ **PROVISIONAL —') || upper.startsWith('> **PROVISIONAL —')
    const evidence = {
      status: ['Clean', 'Minor issues'].includes(verdict) && !provisional ? 'verified' : 'provisional',
      verification_verdict: verdict,
      verification_report_sha256: validated.manifest.artifacts.verification.sha256,
      final_thesis_sha256: validated.manifest.artifacts.final_thesis.sha256,
    }
    const parsed = integrityEvidenceSchema.safeParse(evidence)
    return parsed.success ? parsed.data : null
  } catch { return null }
}

function readOutcomeHealth(repoRoot: string, nowMs: number): { health: QualifiedIdeaOutcomeHealth | null; state: 'valid' | 'expired' | 'unknown' } {
  try {
    const v = JSON.parse(fs.readFileSync(qualifiedIdeaOutcomeHealthPath(repoRoot), 'utf8'))
    const assessed = assessQualifiedIdeaOutcomeHealth(v, nowMs)
    if (assessed.state === 'invalid') return { health: null, state: 'unknown' }
    return { health: assessed.health, state: assessed.state }
  } catch { return { health: null, state: 'unknown' } }
}

function newestPerListing(rows: Discovered[]): Discovered[] {
  const out = new Map<string, Discovered>()
  for (const row of rows) {
    const c = row.candidate
    const key = `${String(c?.instrument?.exchange ?? '').toUpperCase()}|${String(c?.instrument?.ticker ?? '').toUpperCase()}|${String(c?.instrument?.direction ?? '')}`
    const created = Date.parse(c?.created_at || '')
    const stamp = Number.isFinite(created) ? created : row.mtimeMs
    const prior = out.get(key)
    if (!prior) { out.set(key, row); continue }
    const priorCreated = Date.parse(prior.candidate?.created_at || '')
    const priorStamp = Number.isFinite(priorCreated) ? priorCreated : prior.mtimeMs
    if (stamp > priorStamp || (stamp === priorStamp && c.run_root > prior.candidate.run_root)) out.set(key, row)
  }
  return [...out.values()]
}

function currentDecisionAuthority(
  runAbs: string,
  expectedRoot: string,
  candidate: QualifiedIdeaCandidate,
  expectedManifestSha: string,
): {
  decision: z.infer<typeof decisionAuthoritySchema>
  integrity: z.infer<typeof integrityEvidenceSchema>
} | null {
  try {
    const validated = validateProjectionManifest(runAbs, expectedRoot)
    if (!validated || validated.manifest.manifest_sha256 !== expectedManifestSha) return null
    const source = validated.decision
    const audits = validated.audits
    const clean = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null

    const original = clean(source.decision)
    const post = clean(source.post_mortem_decision)
    const decision = post || original
    const rawFlags = Array.isArray(source.red_flags) ? source.red_flags : null
    const redFlags = rawFlags?.map((flag: any) => ({
      id: clean(flag?.id), severity: flag?.severity, description: clean(flag?.description),
    })) ?? null
    const flagsValid = redFlags !== null && redFlags.every((flag) =>
      flag.id && ['Critical', 'High', 'Medium', 'Low'].includes(flag.severity) && flag.description)
    const normalizedFlags = flagsValid ? redFlags!.sort((a, b) =>
      pythonTextCompare(String(a.id), String(b.id)) || pythonTextCompare(String(a.severity), String(b.severity)) ||
      pythonTextCompare(String(a.description), String(b.description))) : null

    const rawScenarios = Array.isArray(source.scenarios) && Number.isInteger(source.scenario_horizon_days) &&
      source.scenario_horizon_days > 0 && source.scenarios.length >= 3 && source.scenarios.length <= 7
      ? source.scenarios : null
    let scenarios: Array<z.infer<typeof authorityScenario>> | null = null
    if (rawScenarios) {
      const normalized = rawScenarios.map((row: any) => ({
        scenario_id: clean(row?.scenario_id), label: clean(row?.label), probability_pct: row?.probability,
        source_price_target: row?.price_target,
        conditions: Array.isArray(row?.conditions) ? row.conditions.map(clean) : null,
        source: clean(row?.source), joint_probability_basis: clean(row?.joint_probability_basis),
      }))
      const valid = normalized.every((row) =>
        row.scenario_id && row.label && row.source && typeof row.probability_pct === 'number' &&
        Number.isFinite(row.probability_pct) && row.probability_pct > 0 &&
        typeof row.source_price_target === 'number' && Number.isFinite(row.source_price_target) && row.source_price_target > 0 &&
        Array.isArray(row.conditions) && row.conditions.length > 0 && row.conditions.every(Boolean))
      const ids = new Set(normalized.map((row) => row.scenario_id))
      const labels = new Set(normalized.map((row) => row.label))
      const probability = normalized.reduce((sum, row) => sum + (typeof row.probability_pct === 'number' ? row.probability_pct : 0), 0)
      if (valid && ids.size === normalized.length && labels.size === normalized.length && Math.abs(probability - 100) <= 0.05) {
        scenarios = normalized.sort((a, b) => pythonTextCompare(String(a.scenario_id), String(b.scenario_id))) as Array<z.infer<typeof authorityScenario>>
      }
    }

    const forecastMatches = Array.isArray(source.forecast_ledger)
      ? source.forecast_ledger.filter((row: any) => record(row) && row.forecast_id === candidate.catalyst.forecast_id)
      : []
    const forecast = forecastMatches.length === 1 && forecastMatches[0].status === 'open' ? forecastMatches[0] : null
    let selectedForecast: z.infer<typeof authorityForecast> | null = null
    if (forecast) {
      const normalized = {
        forecast_id: clean(forecast.forecast_id), prediction: clean(forecast.prediction),
        window_start: clean(forecast.window_start), window_end: clean(forecast.window_end),
        status_as_of: clean(forecast.status_as_of), source_citation: clean(forecast.source_citation),
        metric: clean(forecast.metric), threshold: clean(forecast.threshold),
        confirmation_trigger: clean(forecast.confirmation_trigger), falsification_trigger: clean(forecast.falsification_trigger),
        stock_bullish_trigger: clean(forecast.stock_bullish_trigger), stock_bearish_trigger: clean(forecast.stock_bearish_trigger),
        causal_steps: Array.isArray(forecast.causal_steps) ? forecast.causal_steps.map(clean) : null,
      }
      if (
        Object.entries(normalized).every(([key, value]) => key === 'causal_steps' || Boolean(value)) &&
        Array.isArray(normalized.causal_steps) && normalized.causal_steps.length >= 2 && normalized.causal_steps.every(Boolean) &&
        isRfc3339(normalized.window_start) && isRfc3339(normalized.window_end) && isRfc3339(normalized.status_as_of)
      ) selectedForecast = normalized as z.infer<typeof authorityForecast>
    }

    const confidence = record(source.confidence_inputs) ? source.confidence_inputs : {}
    const ceiling = confidence.rating_cap_ceiling
    const ratingCap = clean(source.rating_cap)
    const textualCap = Boolean(ratingCap && !['none', 'no binding', 'not binding'].some((prefix) => ratingCap.toLowerCase().startsWith(prefix)))
    const decisionCapRequired = (
      (typeof ceiling === 'number' && Number.isFinite(ceiling)) || confidence.critical_governance_unresolved === true ||
      (post !== null && original !== null && post !== original) || textualCap
    )
    const preMortem = audits.pre_mortem
    const expectations = audits.expectations_gap
    const preVerdict = clean(preMortem.verdict)
    const preCap = clean(preMortem.recommended_rating_cap)
    const expectationsQuality = clean(expectations.variant_perception_quality)
    const auditCapReasons: string[] = []
    if (preMortem.survives !== true || preCap) {
      auditCapReasons.push(`pre-mortem audit: ${preVerdict || 'did not survive'}${preCap ? ` (${preCap})` : ''}`)
    }
    if (expectations.is_exploitable !== true || !['Moderate', 'Strong'].includes(expectationsQuality || '')) {
      auditCapReasons.push(
        `expectations-gap audit found no proven exploitable edge (quality=${expectationsQuality || 'missing'}, is_exploitable=${String(expectations.is_exploitable).toLowerCase()})`,
      )
    }
    const reasons = [...(decisionCapRequired && ratingCap ? [ratingCap] : []), ...auditCapReasons]
    const edgeScore = finiteScore(source.edge_score) && finiteScore(expectations.edge_score)
      ? Math.min(source.edge_score, expectations.edge_score) : source.edge_score
    const bridge = record(source.idea_valuation_bridge) ? source.idea_valuation_bridge : null
    const authority = {
      run_root: clean(source.run_root), decision_date: clean(source.decision_date), ticker: clean(source.ticker),
      company: clean(source.company_name), exchange: clean(source.exchange), currency: clean(source.currency), decision,
      data_sufficiency_score: source.data_sufficiency_score, edge_score: edgeScore, edge_proof: clean(source.edge_proof),
      hard_cap_required: decisionCapRequired || auditCapReasons.length > 0,
      rating_cap_reason: reasons.length ? reasons.join('; ') : null,
      red_flags: normalizedFlags,
      scenario_horizon_days: Number.isInteger(source.scenario_horizon_days) && source.scenario_horizon_days > 0
        ? source.scenario_horizon_days : null,
      scenarios,
      idea_valuation_bridge: bridge,
      selected_forecast: selectedForecast,
      post_audit: {
        pre_mortem: {
          verdict: preVerdict, survives: preMortem.survives,
          recommended_confidence: preMortem.recommended_confidence, recommended_rating_cap: preCap,
        },
        expectations_gap: {
          variant_perception_quality: expectationsQuality,
          is_exploitable: expectations.is_exploitable, edge_score: expectations.edge_score,
        },
      },
    }
    const required = ['ticker', 'company', 'exchange', 'currency', 'decision', 'edge_proof'] as const
    if (
      authority.run_root !== expectedRoot || authority.decision_date !== expectedRoot.slice(-10) ||
      candidate.decision_date !== expectedRoot.slice(-10) || required.some((key) => !authority[key]) ||
      !finiteScore(authority.data_sufficiency_score) || !finiteScore(authority.edge_score) || normalizedFlags === null ||
      (decisionCapRequired && !ratingCap) || scenarios === null || selectedForecast === null || bridge === null
    ) return null
    const parsed = decisionAuthoritySchema.safeParse(authority)
    const integrity = currentIntegrityEvidence(runAbs, validated)
    return parsed.success && integrity ? { decision: parsed.data, integrity } : null
  } catch { return null }
}

function addExternalIssue(evaluation: QualifiedIdeaEvaluation, issue: QualificationIssue): QualifiedIdeaEvaluation {
  if (!evaluation.issues.some((row) => row.code === issue.code)) evaluation.issues.push(issue)
  const hasReject = evaluation.issues.some((row) => row.disposition === 'reject')
  evaluation.status = evaluation.issues.length === 0 ? 'qualified' : hasReject ? 'does_not_clear' : 'needs_research'
  evaluation.pareto_layer = null
  return evaluation
}

function evaluateRow(
  row: Discovered,
  nowMs: number,
  policyOverrides?: Partial<QualificationPolicy>,
  calibrationStatus?: QualifiedIdeaCalibrationSummary['status'],
  mode: 'live' | 'frozen' = 'live',
): QualifiedIdeaEvaluation {
  const candidate: QualifiedIdeaCandidate = JSON.parse(JSON.stringify(row.candidate))
  // Live cards are quarantined by later integrity/correction findings. Frozen outcomes retain the exact
  // ex-ante admission and cannot be selected into or out of the denominator after their result is known.
  candidate.research.integrity_status = mode === 'frozen'
    ? row.admission?.integrity_evidence.status === 'verified' ? 'verified' : 'provisional'
    : row.corrected ? 'provisional' : resolveIntegrityStatus(row.runAbs).status
  // Calibration belongs to the realised standing cohort, never to the artifact producer. This also
  // prevents a hand-authored `calibrated` label from bypassing the sample/diversity floor.
  if (calibrationStatus) candidate.research.calibration_status = calibrationStatus
  const evaluation = evaluateQualifiedIdea(candidate, { nowMs, policy: policyOverrides })
  if (row.admission) {
    evaluation.admission = {
      admission_id: row.admission.admission_id,
      admission_sha256: row.admission.admission_sha256,
      candidate_sha256: row.admission.candidate_sha256,
      frozen_at: row.admission.frozen_at,
    }
  }
  if (!row.admission || (mode === 'live' && row.admissionError)) {
    addExternalIssue(evaluation, {
      code: 'authoritative_research_mismatch',
      message: row.admissionError || 'This candidate has no immutable post-audit admission snapshot.',
      disposition: 'research',
    })
  } else if (row.admission.status !== 'admitted') {
    addExternalIssue(evaluation, {
      code: 'authoritative_research_mismatch',
      message: `Post-audit admission failed: ${row.admission.gaps.join('; ')}`,
      disposition: 'research',
    })
  }
  if (mode === 'live') {
    const liveReturnBar = policyOverrides?.minExpectedReturnPct ?? DEFAULT_QUALIFICATION_POLICY.minExpectedReturnPct
    if (
      evaluation.ranking && evaluation.ranking.conservative_expected_return_pct < liveReturnBar
    ) {
      addExternalIssue(evaluation, {
        code: 'conservative_return_below_bar',
        message: `Calibration-adjusted expected return ${evaluation.ranking.conservative_expected_return_pct}% is below the ${liveReturnBar}% live ranking bar; raw scenarios remain frozen for outcome grading.`,
        disposition: 'reject',
      })
    }
  }
  return evaluation
}

function frozenEvaluationTime(row: Discovered): number {
  // Reconstruct admission at the immutable artifact creation time. The holding-period start may legally
  // precede the quote/creation by up to the entry-skew allowance; evaluating at `horizon.start` would then
  // misclassify a valid source-bound quote as future data and silently drop the forecast from calibration.
  const admitted = Date.parse(row.admission?.frozen_at || '')
  return Number.isFinite(admitted) ? admitted : row.mtimeMs
}

/**
 * Reconstruct the cohort at each artifact's OWN timestamp. The live board intentionally ages stale
 * quotes out; the outcome loop must not do that or every 90-day winner/loser would disappear before it
 * could be graded. Supersession, corrections, or later mutable integrity drift end/quarantine a live
 * call but never erase a digest-valid ex-ante admission from the learning denominator. Only a malformed
 * immutable admission fails closed here; this prevents selecting winners or losers out after returns.
 */
export function listFrozenQualifiedIdeaEvaluations(
  repoRoot: string,
  opts: { policy?: Partial<QualificationPolicy> } = {},
): QualifiedIdeaEvaluation[] {
  return discover(repoRoot).rows
    .filter((row) => row.admission?.status === 'admitted')
    .map((row) => evaluateRow(row, frozenEvaluationTime(row), opts.policy, undefined, 'frozen'))
    .filter((x) => x.status === 'qualified')
}

export function buildQualifiedIdeasBoard(
  repoRoot: string,
  opts: {
    nowMs?: number
    policy?: Partial<QualificationPolicy>
    /** Deterministic test seam; production always uses the append-only cockpit activity reader. */
    readActivityRows?: typeof readActivity
    /** Deterministic test seam for direct producers whose terminal artifacts are still uncommitted. */
    readUncommittedPublicationRuns?: (repoRoot: string) => ReadonlySet<string>
  } = {},
): QualifiedIdeasBoard {
  const nowMs = opts.nowMs ?? Date.now()
  const policy: QualificationPolicy = { ...DEFAULT_QUALIFICATION_POLICY, ...(opts.policy ?? {}) }
  const found = discover(
    repoRoot, nowMs, opts.readActivityRows ?? readActivity,
    opts.readUncommittedPublicationRuns ?? readUncommittedPublicationRuns,
  )
  // Calibration is anchored to the immutable cohort ledger, not today's mutable analyses tree. A settled
  // winner or loser therefore remains in the denominator even if its original research folder is moved.
  const calibration = summarizeQualifiedIdeaCalibration(repoRoot, nowMs)
  // The newest full-run assessment for a ticker is authoritative even when it says not_assessable or is
  // malformed. Otherwise an old qualified card can survive behind a newer run that explicitly could not
  // support it. Invalid newest artifacts therefore hide that ticker and degrade health, rather than
  // silently reviving an older candidate.
  const currentRows = found.rows.filter((row) =>
    !row.superseded && found.latestStandingRunByTicker.get(row.candidate.instrument.ticker.toUpperCase()) === row.candidate.run_root,
  )
  const currentGaps = found.gaps.filter((gap) =>
    found.latestStandingRunByTicker.get(gap.ticker.toUpperCase()) === gap.run_root,
  )
  // Calibration transfers only within the same frozen policy, horizon bucket, and direction.
  const evaluations = newestPerListing(currentRows).map((row) => {
    const start = Date.parse(row.candidate.horizon.start)
    const end = Date.parse(row.candidate.horizon.end)
    const days = Number.isFinite(start) && Number.isFinite(end) ? Math.round((end - start) / 86_400_000) : NaN
    const status = qualifiedIdeaCalibrationStatusFor(calibration, row.candidate.policy_version, days, row.candidate.instrument.direction)
    return evaluateRow(row, nowMs, opts.policy, status)
  })
  const qualified = rankQualifiedIdeas(evaluations)
  const needsResearch = evaluations
    .filter((x) => x.status === 'needs_research')
    .sort((a, b) => (a.issues.length - b.issues.length) || b.candidate.research.edge_score - a.candidate.research.edge_score || a.candidate.idea_id.localeCompare(b.candidate.idea_id))
  const doesNotClear = evaluations
    .filter((x) => x.status === 'does_not_clear')
    .sort((a, b) => (a.issues.length - b.issues.length) || a.candidate.idea_id.localeCompare(b.candidate.idea_id))
  const measured = evaluations.filter((row) => row.candidate.research.calibration_status === 'measured').length
  const outcomeHealth = readOutcomeHealth(repoRoot, nowMs)
  const healthDefectSuffix = (): string => {
    const defects: string[] = []
    if (found.invalid > 0) defects.push(`${found.invalid} invalid current run${found.invalid === 1 ? '' : 's'}`)
    if (found.incomplete > 0) {
      defects.push(`${found.incomplete} completed run${found.incomplete === 1 ? '' : 's'} did not finish immutable publication`)
    }
    return defects.length > 0 ? ` Health degraded: ${defects.join('; ')}.` : ''
  }

  let status: QualifiedIdeasBoard['health']['status'] = 'pre_data'
  let outcome: QualifiedIdeasBoard['health']['outcome'] = 'no_artifacts'
  let reason = 'No qualified-idea artifacts have been produced yet. News leads are not investment ideas.'
  if (found.discoveryError) {
    status = 'degraded'; outcome = 'storage_error'; reason = found.discoveryError
  } else if (found.artifacts > 0 && evaluations.length === 0 && currentGaps.length === 0 && found.invalid > 0) {
    status = 'degraded'; outcome = 'invalid_artifacts'; reason = 'Qualified-idea artifacts exist, but none can be parsed as a standing candidate.'
  } else if (qualified.length > 0) {
    status = found.invalid > 0 || found.incomplete > 0 ? 'degraded' : 'healthy'; outcome = 'qualified'
    reason = `${qualified.length} standing 3-6 month idea${qualified.length === 1 ? '' : 's'} cleared every qualification gate.${healthDefectSuffix()}`
  } else if (evaluations.length > 0 || currentGaps.length > 0) {
    status = found.invalid > 0 || found.incomplete > 0 ? 'degraded' : 'healthy'; outcome = 'none_clear'
    reason = `${evaluations.length} standing candidate${evaluations.length === 1 ? '' : 's'} evaluated and ${currentGaps.length} run${currentGaps.length === 1 ? '' : 's'} marked not assessable; none cleared every 3-6 month gate.${healthDefectSuffix()}`
  } else if (found.publishing > 0) {
    status = 'healthy'; outcome = 'publishing'
    reason = `${found.publishing} research run${found.publishing === 1 ? ' is' : 's are'} finishing immutable publication; no result is shown until the seal completes.`
  }

  return {
    schema_version: QUALIFIED_IDEAS_BOARD_SCHEMA,
    generated_at: new Date(nowMs).toISOString(),
    policy_version: QUALIFICATION_POLICY_VERSION,
    ranking_policy_version: QUALIFIED_IDEA_RANKING_POLICY_VERSION,
    policy,
    health: {
      status, outcome, reason,
      artifact_count: found.artifacts,
      assessment_count: found.assessments,
      parsed_count: evaluations.length,
      invalid_count: found.invalid,
      incomplete_count: found.incomplete,
      publishing_count: found.publishing,
      not_assessable_count: currentGaps.length,
      qualified_count: qualified.length,
      needs_research_count: needsResearch.length,
      does_not_clear_count: doesNotClear.length,
      measured_count: measured,
    },
    outcome_health: outcomeHealth.health,
    outcome_health_state: outcomeHealth.state,
    calibration,
    qualified,
    needs_research: needsResearch,
    does_not_clear: doesNotClear,
    not_assessable: currentGaps.sort((a, b) => b.created_at.localeCompare(a.created_at) || a.ticker.localeCompare(b.ticker)),
  }
}
