#!/usr/bin/env bash
# Create the extractor's isolated venv (works around PEP-668 / externally-managed Python),
# and best-effort install the system tools it shells out to:
#   - poppler   -> pdftotext (PDF text) + pdftoppm (page rasteriser for OCR)
#   - tesseract -> OCR for image-only / scanned PDFs (the "needs OCR" pool files)
# The venv is REQUIRED. The system tools are BEST-EFFORT — extract_pool.py degrades
# gracefully (marks a scanned PDF "needs OCR" instead of reading it) when they're absent,
# so a machine without brew/apt still works, just without OCR.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"

python3 -m venv "$DIR/.venv"
"$DIR/.venv/bin/pip" install -q -r "$DIR/requirements.txt"
echo "[setup-tools] python deps installed in $DIR/.venv"

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
