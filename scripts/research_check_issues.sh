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

# The open issue for one run, found by the marker research_check.py writes into the body.
open_issue_for() {
  gh issue list --state open --label "$label" --limit 200 --json number,body \
    --jq "[.[] | select(.body | contains(\"research-eval:$1\")) | .number][0] // empty" 2>/dev/null
}

jq -c '.issues[]' "$result" | while read -r row; do
  run=$(jq -r '.run' <<<"$row")
  state=$(jq -r '.state' <<<"$row")
  title=$(jq -r '.title' <<<"$row")
  body=$(jq -r '.body' <<<"$row")
  existing=$(open_issue_for "$run")

  if [ "$state" = "open" ]; then
    if [ -n "$existing" ]; then
      echo "research-check: #$existing is already open for $run"
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
