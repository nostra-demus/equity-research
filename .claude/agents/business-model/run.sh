#!/usr/bin/env bash
# run.sh — Orchestrator for the BUSINESS-MODEL MODULE of the equity research system.
#
# This is NOT the master orchestrator. This script runs only the 14 sub-agents
# of the business-model module and writes outputs to:
#     analyses/{TICKER}_{DATE}/business-model/
#
# The repo's master /research:full TICKER calls this module (and other module
# orchestrators as they are added) before invoking the master synthesizer at
# .claude/agents/synthesizer.md
#
# Usage:   ./run.sh TICKER
# Example: ./run.sh AAPL
#
# Run from the repo root, OR call directly — the script cd's to the repo root
# (assumed to be three levels up from this file at .claude/agents/business-model/).
#
# Replace `invoke_agent` below with whatever invocation your Claude Code setup uses.
# This script gives you the dependency graph and parallelism plan; the invocation
# itself is environment-specific.

set -euo pipefail

# Resolve repo root (assumes this script lives at .claude/agents/business-model/run.sh)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "${SCRIPT_DIR}/../../.." && pwd )"
cd "${REPO_ROOT}"

TICKER="${1:?Usage: $0 TICKER}"
DATE="$(date +%Y-%m-%d)"
DATA_PATH="data/${TICKER}"
OUTPUT_DIR="analyses/${TICKER}_${DATE}/business-model"

mkdir -p "${OUTPUT_DIR}"

# ────────────────────────────────────────────────────────────────────────────
# Adapt this function to your Claude Code subagent invocation.
# It should call the named subagent with TICKER, DATA_PATH, OUTPUT_PATH, DATE,
# and (if applicable) UPSTREAM_INPUTS, and write to the OUTPUT_PATH given.
# ────────────────────────────────────────────────────────────────────────────
invoke_agent() {
    local agent_name="$1"
    local output_file="$2"
    shift 2
    local upstream_inputs=("$@")

    echo ">>> Running ${agent_name} → ${output_file}"

    # Replace this line with your actual Claude Code CLI invocation.
    # Example shape:
    # claude code agent "${agent_name}" \
    #     --input "TICKER=${TICKER}" \
    #     --input "DATA_PATH=${DATA_PATH}" \
    #     --input "OUTPUT_PATH=${output_file}" \
    #     --input "DATE=${DATE}" \
    #     --input "UPSTREAM_INPUTS=${upstream_inputs[*]}"

    echo "    [stub] would invoke ${agent_name} with upstream: ${upstream_inputs[*]:-none}"
}

# ────────────────────────────────────────────────────────────────────────────
# Layer 0: Data triage (sequential, fail-fast)
# ────────────────────────────────────────────────────────────────────────────
echo "=== Layer 0: data-triage ==="
TRIAGE_OUT="${OUTPUT_DIR}/00_data-triage.md"
invoke_agent "data-triage" "${TRIAGE_OUT}"

# Fail-fast check
if [[ -f "${TRIAGE_OUT}" ]] && grep -q "Verdict: Insufficient data" "${TRIAGE_OUT}"; then
    echo "!!! Data pool insufficient. Aborting business-model module run."
    exit 1
fi

# ────────────────────────────────────────────────────────────────────────────
# Layer 1: Independent specialists (run in parallel)
# ────────────────────────────────────────────────────────────────────────────
echo "=== Layer 1: independent specialists ==="
invoke_agent "disqualifier-scan"               "${OUTPUT_DIR}/01_disqualifier-scan.md"               &
invoke_agent "business-identity"               "${OUTPUT_DIR}/02_business-identity.md"               &
invoke_agent "segment-map"                     "${OUTPUT_DIR}/03_segment-map.md"                     &
invoke_agent "customer-geography"              "${OUTPUT_DIR}/05_customer-geography.md"              &
invoke_agent "external-dependency"             "${OUTPUT_DIR}/10_external-dependency.md"             &
invoke_agent "capital-allocation-governance"   "${OUTPUT_DIR}/11_capital-allocation-governance.md"   &
wait

# ────────────────────────────────────────────────────────────────────────────
# Layer 2: Specialists that depend on Layer 1
# ────────────────────────────────────────────────────────────────────────────
echo "=== Layer 2: dependent specialists ==="
invoke_agent "unit-economics"     "${OUTPUT_DIR}/04_unit-economics.md" \
    "${OUTPUT_DIR}/03_segment-map.md" &

invoke_agent "value-chain"        "${OUTPUT_DIR}/06_value-chain.md" \
    "${OUTPUT_DIR}/02_business-identity.md" &

invoke_agent "competitive-map"    "${OUTPUT_DIR}/08_competitive-map.md" \
    "${OUTPUT_DIR}/02_business-identity.md" \
    "${OUTPUT_DIR}/03_segment-map.md" &

invoke_agent "business-quality"   "${OUTPUT_DIR}/07_business-quality.md" \
    "${OUTPUT_DIR}/03_segment-map.md" \
    "${OUTPUT_DIR}/05_customer-geography.md" &
wait

# ────────────────────────────────────────────────────────────────────────────
# Layer 3: Moat (depends on competitive-map)
# ────────────────────────────────────────────────────────────────────────────
echo "=== Layer 3: moat ==="
invoke_agent "moat" "${OUTPUT_DIR}/09_moat.md" \
    "${OUTPUT_DIR}/08_competitive-map.md"

# ────────────────────────────────────────────────────────────────────────────
# Layer 4: Red-flags catch-all sweep
# ────────────────────────────────────────────────────────────────────────────
echo "=== Layer 4: red-flags-sweep ==="
invoke_agent "red-flags-sweep" "${OUTPUT_DIR}/12_red-flags-sweep.md" \
    "${OUTPUT_DIR}/01_disqualifier-scan.md" \
    "${OUTPUT_DIR}/03_segment-map.md" \
    "${OUTPUT_DIR}/05_customer-geography.md" \
    "${OUTPUT_DIR}/07_business-quality.md" \
    "${OUTPUT_DIR}/10_external-dependency.md" \
    "${OUTPUT_DIR}/11_capital-allocation-governance.md"

# ────────────────────────────────────────────────────────────────────────────
# Layer 5: Module synthesizer (reads all module outputs)
# ────────────────────────────────────────────────────────────────────────────
echo "=== Layer 5: business-model-synthesis ==="
invoke_agent "business-model-synthesis" "${OUTPUT_DIR}/99_business-model-synthesis.md" \
    "${OUTPUT_DIR}"/*.md

echo "=== Business-model module complete ==="
echo "Output directory: ${OUTPUT_DIR}"
ls -la "${OUTPUT_DIR}"
