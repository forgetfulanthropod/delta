#!/usr/bin/env bash
# Build web, start preview + backend, run playwrong e2e suite.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

pick_port() {
  python3 - <<'PY'
import os
import socket

preferred = int(os.environ.get("DELTA_E2E_PORT", "3000"))
for port in [preferred, *range(3000, 3100)]:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
        except OSError:
            continue
        print(port)
        break
else:
    raise SystemExit("no free port in 3000-3099")
PY
}

PORT="$(pick_port)"
export DELTA_E2E_URL="http://127.0.0.1:${PORT}"
echo "e2e using ${DELTA_E2E_URL}"

if [[ ! -x tools/playwrong/mydotool ]]; then
  bash scripts/setup-playwrong.sh
fi

if ! command -v google-chrome >/dev/null 2>&1; then
  echo "google-chrome (or chromium) required for playwrong e2e"
  exit 1
fi

pnpm build:web

PREVIEW_PID=""
BACKEND_PID=""
cleanup() {
  [[ -n "$PREVIEW_PID" ]] && kill "$PREVIEW_PID" 2>/dev/null || true
  [[ -n "$BACKEND_PID" ]] && kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

pnpm exec vite preview --host 127.0.0.1 --port "$PORT" --strictPort &
PREVIEW_PID=$!
node backend/server.js &
BACKEND_PID=$!

python3 - <<PY
import time, urllib.request, os
url = os.environ["DELTA_E2E_URL"]
marker = "Transform the built environment"
for _ in range(200):
    try:
        with urllib.request.urlopen(url, timeout=1) as r:
            body = r.read().decode("utf-8", "replace")
            if r.status == 200 and ("Rivur" in body or marker in body or "/assets/" in body):
                print(f"e2e target ready: {url}")
                break
    except Exception:
        time.sleep(0.1)
else:
    raise SystemExit(f"delta preview not ready: {url}")
PY

if [[ -x "$ROOT/.venv-e2e/bin/python" ]]; then
  E2E_PYTHON="$ROOT/.venv-e2e/bin/python"
else
  E2E_PYTHON="python3"
fi

PYTHONPATH="$ROOT/tools/playwrong" "$E2E_PYTHON" e2e/run_all.py