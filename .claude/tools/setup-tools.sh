#!/usr/bin/env bash
# Create the extractor's isolated venv (works around PEP-668 / externally-managed Python).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
python3 -m venv "$DIR/.venv"
"$DIR/.venv/bin/pip" install -q -r "$DIR/requirements.txt"
echo "extract_pool.py deps installed in $DIR/.venv"
