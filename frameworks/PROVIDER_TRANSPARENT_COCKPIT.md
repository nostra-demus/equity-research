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

## Allowed differences

Provider-specific presentation is limited to facts that truly differ:

- provider/model/reasoning labels;
- authentication and availability diagnostics;
- subscription quota versus Claude usage/cost display;
- low-level adapter diagnostics needed to explain a failure.

Provider-specific launch buttons, confirmations, navigation, Activity behavior, cancellation, resume,
completion criteria, artifact requirements, or recovery semantics are defects.

## Enforcement

CI must exercise the launch matrix with both Claude and Codex receipts. It must prove that full-run typing is
derived from run kind, a mismatched confirmation receipt fails closed, an admitted run opens Activity, and
the submitted subject/provider/profile remain the frozen values even if cockpit selection changes. Any future
provider joins the same matrix before it can be enabled.
