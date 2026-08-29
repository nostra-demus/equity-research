# Provider-Transparent Cockpit Contract

Contract version: `provider-transparent-ux/1`

This is the permanent product contract for every tracked cockpit run. Claude and Codex are execution
adapters behind one research product. Selecting a provider changes the execution profile; it does not
select a different workflow.

## One state machine

Every provider follows the same user-visible sequence:

1. Select the work and provider.
2. Freeze the subject, swarm, provider, model, reasoning level, catalogue generation, and profile key.
3. Price/preflight that exact selection.
4. Show the same confirmation for the same run kind. Every true full run requires the user to type the
   frozen subject, regardless of provider or entry point.
5. Submit one request carrying the frozen selection and compare-and-swap receipt.
6. On admission, open Activity immediately and show provider/profile on the run.
7. Stream the same normalized lifecycle: setup, agent progress, synthesis, publication, and terminal state.
8. Offer the same cancellation, interruption, and resume controls. A provider change on manual resume is
   explicit and recorded as mixed-provider provenance.
9. Validate and expose the same required artifacts. Filesystem artifacts, not provider prose, are completion
   truth.

## Provider-owned model profiles

Model choice is part of the same provider-transparent contract, not a second launch system:

- The server owns the finite list of reviewed profiles for each provider. The browser renders that list and
  may never invent a model slug, reasoning level, or nested specialist tier.
- The user can choose the provider and model profile at every tracked launch boundary. A profile change in
  a confirmation invalidates the old estimate and typed acknowledgement, then prices the exact new profile.
- The provider, parent model, reasoning level, nested specialist profile, and profile
  key are frozen together. They propagate unchanged through chained work, Activity, SSE, interruption,
  automatic continuation, resume metadata, artifacts, and execution provenance.
- Automatic continuation and ordinary resume use the exact frozen profile. A manual change is an explicit
  mixed-profile continuation and requires the same warning and provenance treatment as a provider change.
- Every manual Resume action opens the same provider/model chooser before any request is submitted. It may
  continue with the original profile or any other currently verified reviewed profile; completed work is
  retained, only unfinished work runs, and the resulting lineage is labelled exact, mixed-profile, or
  mixed-provider. A global provider preference or a native yes/no browser prompt may never force the choice.
- A saved partial does not expire at midnight. For each subject, the newest unfinished run remains available
  as **Complete old run** until a newer completed run supersedes it. The ordinary cockpit presents that next
  to **Run full**, so the user always chooses between explicitly completing saved work and requesting the
  ordinary full pipeline. The completion path rechecks data freshness and reruns stale gaps rather than
  blindly copying old work.
- **Continue names one exact saved run root.** That root must survive the Activity row, browser confirmation,
  versioned plan receipt, admission transaction, background supervisor, provider invocation, and artifact
  publication unchanged. Continue may reuse valid outputs and rerun missing, stale, or invalid orbs, but it
  may never call the generic full-run route, default to today's folder, or widen into Full. Reused artifact
  hashes are immutable evidence: if valid saved work changes, the continuation fails closed before spend.
- A profile name is a runtime promise. Every unpinned nested agent must use the selected specialist tier;
  canonical role pins may only make the tier stricter. Unsupported, stale, mismatched, or unavailable profiles
  fail before admission. There is no silent substitution.
- Provider and model choice may change execution quality, speed, and quota use. It must not change launch
  controls, workflow topology, completion truth, publication, Activity, cancellation, resume, or artifacts.

The server remains the hard gate. The browser may impose a stricter acknowledgement but may never weaken a
server rule because an estimate is stale, missing, malformed, or provider-specific. Confirmation compares
against the frozen subject, never the mutable ticker currently displayed in the cockpit.

## Required entry-point parity

The contract applies to ordinary full runs, individual agents/modules, reruns, thesis completion, manual and
automatic resume, screener signals and sweeps, intake analysis, decision reviews, tracking, handoffs,
event-to-research actions, mobile launches, chained work, and future manifest-discovered swarms. A new entry
point inherits this contract without adding provider-specific controls.

For every admitted tracked launch:

- Activity opens immediately; it cannot depend on a later poll or an SSE event.
- The activity row, live progress, cancel button, resume metadata, provider/profile, terminal status, and
  artifact links are present under both providers.
- A setup/admission failure is visible and actionable. No failure may leave a hidden run, permanent spinner,
  stale reservation, or ambiguous instruction to retry.
- Quota failure preserves completed artifacts and the frozen provider. Automatic continuation uses that
  provider; a human can explicitly choose a mixed-provider continuation.
- Background scanners cannot make provider availability depend on unrelated work. A pending reviewed deploy
  closes new background admission and makes an already-running abortable news cycle yield at its next safe
  boundary; the deployer never waits for the normal multi-minute scanner timeout.
- While a healthy engine waits for a reviewed update, Run or Continue creates one narrow durable admission,
  not a run folder and not a fake active run. Activity says **Waiting for update** across refresh and restart.
  After the exact new program is healthy, the engine recomputes the saved plan and starts the request at most
  once. A queued Continue may narrow or change its payable-orb list, and Activity records that difference,
  but it can never become Full. Provider unavailability, an unsafe source, or a failed/rolled-back update
  leaves the request waiting or marks it **Needs attention**; it never substitutes a provider or reports
  success. Cancellation is available only until admission begins.
- Provider isolation must accept the same sanctioned deployed repository topology. In particular, the
  configured repo-root `data/` projection may resolve to the owner-pinned external pool under both Claude
  and Codex, without becoming a provider write grant. An undeclared repository-root link is rejected, and a
  link change after the adapter binds its canonical target cannot redirect the process. These checks happen
  before provider spawn or spend.

## Allowed differences

Provider-specific presentation is limited to facts that truly differ:

- provider/model/reasoning labels;
- authentication and availability diagnostics;
- subscription quota versus Claude usage/cost display;
- low-level adapter diagnostics needed to explain a failure.

Provider-specific launch buttons, confirmations, navigation, Activity behavior, cancellation, resume,
completion criteria, artifact requirements, or recovery semantics are defects.

Release canaries, freeze receipts, and other operator-only calibration controls are not research-user
actions. They must not appear in the normal provider/model menu. If retained for engineering, they require
an authenticated operator-only entry point and must never compete with **Complete old run** or **Run full**.

## Enforcement

CI must exercise the launch matrix with both Claude and Codex receipts. A real browser runs the production
Run, Continue, confirmation, and Activity components against a throwaway control plane. Fake provider
binaries enter through `CLAUDE_BIN` and `CODEX_BIN`, and their native JSONL is normalized by the production
adapters. The identical matrix proves: full-run typing; durable queued admission and refresh/reconnect truth;
interruption; cross-midnight exact-root Continue; unchanged reusable-artifact hashes; terminal publication;
required artifacts; and provider/profile provenance. It also proves that Continue never reaches generic
`/api/launch`. No subscription credit, production data, or production engine is used.

The matrix also proves that a mismatched confirmation receipt fails closed, an admitted run opens Activity,
and the submitted subject/provider/profile remain the frozen values even if cockpit selection changes. Any
future provider joins the same matrix before it can be enabled. The matrix includes the deployed
external-data-root projection—not only a simplified checkout—plus undeclared-link and post-bind replacement
controls.
