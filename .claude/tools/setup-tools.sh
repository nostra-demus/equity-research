#!/usr/bin/env bash
# Create/repair the extractor's isolated venv (works around PEP-668 / externally-managed Python),
# and best-effort install the system tools it shells out to:
#   - poppler   -> pdftotext (PDF text) + pdftoppm (page rasteriser for OCR)
#   - tesseract -> OCR for image-only / scanned PDFs (the "needs OCR" pool files)
# The venv is REQUIRED. The system tools are BEST-EFFORT — extract_pool.py degrades
# gracefully (marks a scanned PDF "needs OCR" instead of reading it) when they're absent,
# so a machine without brew/apt still works, just without OCR.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
VENV="$DIR/.venv"
PYTHON_ONLY=0

case "${1:-}" in
  "") ;;
  --python-only) PYTHON_ONLY=1 ;;
  *) echo "usage: $0 [--python-only]" >&2; exit 2 ;;
esac
[ "$#" -le 1 ] || { echo "usage: $0 [--python-only]" >&2; exit 2; }

if [ -e "$VENV" ] || [ -L "$VENV" ]; then
  [ ! -L "$VENV" ] && [ -d "$VENV" ] && [ -O "$VENV" ] \
    || { echo "[setup-tools] unsafe managed venv path: $VENV" >&2; exit 1; }
fi

python_deps_ready() {
  [ -x "$VENV/bin/python" ] || return 1
  "$VENV/bin/python" - <<'PY' >/dev/null 2>&1
import openpyxl
import pypdf
import xlrd
from striprtf.striprtf import rtf_to_text
PY
}

# The import probe makes normal deploy ticks near-instant. Only a missing/broken dependency reaches pip.
# Pip is deliberately bounded: deploy.sh already owns the no-active-run barrier, and a dead package index
# must fail the release safely rather than hold new admissions forever.
if python_deps_ready; then
  echo "[setup-tools] python deps already ready in $VENV"
else
  [ -x "$VENV/bin/python" ] || python3 -m venv "$VENV"
  PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_DEFAULT_TIMEOUT=15 \
    "$VENV/bin/python" -m pip install --retries 1 -q -r "$DIR/requirements.txt"
  python_deps_ready || { echo "[setup-tools] python dependency verification failed" >&2; exit 1; }
  echo "[setup-tools] python deps installed and verified in $VENV"
fi

if [ "$PYTHON_ONLY" = 1 ]; then
  echo "[setup-tools] python-only repair complete"
  exit 0
fi

# ---- system tools for PDF text + OCR (best-effort; must never abort the venv setup) ----
install_ocr_tools() {
  if command -v brew >/dev/null 2>&1; then
    echo "[setup-tools] installing poppler + tesseract (+ language data) via Homebrew…"
    brew list poppler       >/dev/null 2>&1 || brew install poppler       || true
    brew list tesseract     >/dev/null 2>&1 || brew install tesseract     || true
    brew list tesseract-lang >/dev/null 2>&1 || brew install tesseract-lang || true  # multilingual OCR floor
  elif command -v apt-get >/dev/null 2>&1; then
    echo "[setup-tools] installing poppler-utils + tesseract-ocr (+ all languages) via apt…"
    sudo apt-get update -qq || true
    sudo apt-get install -y poppler-utils tesseract-ocr tesseract-ocr-all || true
  else
    echo "[setup-tools] no brew/apt found — install 'poppler' and 'tesseract' manually to OCR scanned PDFs."
  fi
}
install_ocr_tools || true

# report what's available so a missing tool is visible, not silent
for t in pdftotext pdftoppm tesseract; do
  if command -v "$t" >/dev/null 2>&1; then
    echo "[setup-tools] found: $t"
  else
    echo "[setup-tools] MISSING: $t — scanned-PDF OCR / PDF text extraction will degrade"
  fi
done
echo "[setup-tools] done"
