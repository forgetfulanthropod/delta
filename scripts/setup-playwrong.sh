#!/usr/bin/env bash
# Build playwrong's mydotool helper and install Python deps for e2e.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PW="$ROOT/tools/playwrong"

if [[ ! -f "$PW/playwrong.py" ]]; then
  echo "playwrong submodule missing — run: git submodule update --init tools/playwrong"
  exit 1
fi

if command -v gcc >/dev/null 2>&1; then
  gcc -O2 -o "$PW/mydotool" "$PW/mydotool.c" -lX11 -lXtst
  chmod +x "$PW/mydotool"
  echo "built native mydotool with gcc"
else
  cat > "$PW/mydotool" <<EOF
#!/usr/bin/env bash
set -euo pipefail
ROOT="$ROOT"
VENV="\$ROOT/.venv-e2e"
if [[ ! -x "\$VENV/bin/python" ]]; then
  python3 -m venv "\$VENV"
  "\$VENV/bin/pip" install -r "\$ROOT/e2e/requirements.txt"
fi
exec "\$VENV/bin/python" "\$ROOT/scripts/mydotool.py" "\$@"
EOF
  chmod +x "$PW/mydotool"
  echo "gcc not found — installed Python mydotool fallback (pyautogui + X11)"
fi

VENV="$ROOT/.venv-e2e"
if python3 -m pip --version >/dev/null 2>&1; then
  python3 -m pip install --user -r "$ROOT/e2e/requirements.txt"
else
  if [[ ! -x "$VENV/bin/python" ]]; then
    python3 -m venv "$VENV"
  fi
  "$VENV/bin/pip" install -r "$ROOT/e2e/requirements.txt"
fi

echo "playwrong ready: $PW/mydotool"