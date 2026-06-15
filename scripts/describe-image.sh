#!/usr/bin/env bash
# Wrapper for ~/bin/describeimages (Gemini vision captions).
set -euo pipefail

BIN="${DESCRIBE_IMAGES_BIN:-${HOME}/bin/describeimages}"
if [[ ! -x "$BIN" ]]; then
  echo "describeimages not found at $BIN — set DESCRIBE_IMAGES_BIN" >&2
  exit 1
fi
exec "$BIN" "$@"