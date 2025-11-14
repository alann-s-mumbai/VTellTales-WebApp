#!/usr/bin/env bash
set -euo pipefail

# Robust dotnet restore + build wrapper with retries and logs
# Usage: ./scripts/dotnet-build-retry.sh [solution-path]

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOLUTION_PATH="${1:-$ROOT_DIR/backend/VTellTalesCore/VTellTales_WA.sln}"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

MAX_ATTEMPTS=3
SLEEP_BASE=5

export DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1

echo "Solution: $SOLUTION_PATH"
echo "Logs: $LOG_DIR"

attempt=1
while [ $attempt -le $MAX_ATTEMPTS ]; do
  echo "[restore] attempt $attempt/$MAX_ATTEMPTS..."
  if dotnet restore "$SOLUTION_PATH" --disable-parallel > "$LOG_DIR/dotnet-restore.$attempt.log" 2>&1; then
    echo "[restore] succeeded on attempt $attempt"
    break
  else
    echo "[restore] failed on attempt $attempt — see $LOG_DIR/dotnet-restore.$attempt.log"
    attempt=$((attempt+1))
    sleep $((SLEEP_BASE * attempt))
  fi
done

if [ $attempt -gt $MAX_ATTEMPTS ]; then
  echo "dotnet restore failed after $MAX_ATTEMPTS attempts. Last logs:" >&2
  tail -n 200 "$LOG_DIR/dotnet-restore.$MAX_ATTEMPTS.log" >&2 || true
  exit 1
fi

echo "[build] starting build..."
if dotnet build "$SOLUTION_PATH" -clp:Summary > "$LOG_DIR/dotnet-build.log" 2>&1; then
  echo "[build] succeeded"
  echo "Build log: $LOG_DIR/dotnet-build.log"
  exit 0
else
  echo "[build] failed — see $LOG_DIR/dotnet-build.log" >&2
  tail -n 200 "$LOG_DIR/dotnet-build.log" >&2 || true
  exit 1
fi
