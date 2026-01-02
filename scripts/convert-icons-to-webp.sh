#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ICON_DIR="${PLUGIN_ROOT}/assets/img"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "Error: cwebp is required but not installed."
  echo "Install via: sudo apt-get install webp"
  exit 1
fi

icons=(
  "bonus.png"
  "peeks.png"
  "deal.png"
  "roses.png"
  "value.png"
)

for icon in "${icons[@]}"; do
  input="${ICON_DIR}/${icon}"
  output="${input%.png}.webp"
  if [[ ! -f "${input}" ]]; then
    echo "Skipping missing file: ${input}"
    continue
  fi
  cwebp -q 82 "${input}" -o "${output}"
  echo "Converted ${input} -> ${output}"
done
