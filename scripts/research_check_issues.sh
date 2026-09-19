#!/usr/bin/env bash
# One issue per research run that fails its contract checks, closed again when the run passes.
#
# Called by .github/workflows/research-check.yml with the JSON scripts/research_check.py wrote. It needs the
# `gh` CLI (GH_TOKEN) and `issues: write`. It never fails the workflow: the check itself already reported the
# result, and an issue that could not be filed must not turn a research failure into a workflow error.
set -uo pipefail

result="${1:?usage: research_check_issues.sh <research-check.json>}"
[ -s "$result" ] || { echo "research-check: no result file at $result"; exit 0; }

label="research-eval"
gh label create "$label" --color "b27d1c" \
  --description "A committed research run fails scripts/eval.py" >/dev/null 2>&1 || true

# Fetch the open labelled issues ONCE, then match locally: one API call, not one per run — a push that
# closes many issues at once must not fan out into a request per run and trip rate limits (Gemini review).
open_issues=$(gh issue list --state open --label "$label" --limit 200 --json number,body 2>/dev/null || echo "[]")
[ -n "$open_issues" ] || open_issues="[]"

# The open issue for one run, found by the marker research_check.py writes into the body.
open_issue_for() {
  jq -r --arg m "research-eval:$1" '[.[] | select(.body | contains($m)) | .number][0] // empty' <<<"$open_issues"
}

jq -c '.issues[]' "$result" | while read -r row; do
  run=$(jq -r '.run' <<<"$row")
  state=$(jq -r '.state' <<<"$row")
  title=$(jq -r '.title' <<<"$row")
  body=$(jq -r '.body' <<<"$row")
  existing=$(open_issue_for "$run")

  if [ "$state" = "open" ]; then
    if [ -n "$existing" ]; then
      # Still failing, issue already open: refresh its body so the current failing checks, commit and check
      # URL replace the stale ones — an unchanged issue keeps pointing the owner at obsolete failures (Codex review).
      # The TITLE is refreshed too: both kinds of issue carry the same run marker, so a run whose contract
      # failure is followed by its record being deleted would otherwise keep a headline its body contradicts.
      if gh issue edit "$existing" --title "$title" --body "$body" >/dev/null 2>&1; then
        echo "research-check: refreshed #$existing for $run (current failing checks)"
      else
        echo "research-check: #$existing already open for $run (could not refresh its body)"
      fi
    elif gh issue create --title "$title" --label "$label" --body "$body" >/dev/null; then
      echo "research-check: opened an issue for $run"
    else
      echo "research-check: could not open an issue for $run (the result above still stands)"
    fi
  elif [ -n "$existing" ]; then
    if gh issue close "$existing" --comment "$body" >/dev/null; then
      echo "research-check: closed #$existing — $run passes again"
    else
      echo "research-check: could not close #$existing for $run"
    fi
  fi
done

exit 0
