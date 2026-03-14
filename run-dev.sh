#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/Backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn | awk '{print $4}' | grep -Eq "(^|:)${port}$"
    return $?
  fi
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  return 1
}

if [ ! -d "$BACKEND_DIR/.venv" ]; then
  echo "Backend virtualenv missing at Backend/.venv"
  echo "Create it with: cd Backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "frontend/node_modules missing"
  echo "Install it with: cd frontend && npm install"
  exit 1
fi

if port_in_use 8000; then
  echo "Port 8000 is already in use. Stop the existing process and rerun ./run-dev.sh"
  exit 1
fi

if port_in_use 8080; then
  echo "Port 8080 is already in use. Stop the existing process and rerun ./run-dev.sh"
  exit 1
fi

cleanup() {
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

cd "$BACKEND_DIR"
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

cd "$FRONTEND_DIR"
npm run dev -- --host 127.0.0.1 --port 8080 &
FRONTEND_PID=$!

echo "Backend running on http://127.0.0.1:8000"
echo "Frontend running on http://127.0.0.1:8080"
echo "Press Ctrl+C to stop both services"

wait -n "$BACKEND_PID" "$FRONTEND_PID"
