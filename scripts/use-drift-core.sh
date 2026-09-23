#!/usr/bin/env bash
# Replace Clash Verge Rev sidecars with the local Drift-enabled mihomo core.
# Prefer running this AFTER `pnpm prebuild` (or instead of downloading Meta for smoke).
#
# Usage:
#   ./scripts/use-drift-core.sh
#   DRIFT_CORE=/path/to/mihomo-drift ./scripts/use-drift-core.sh
#   ./scripts/use-drift-core.sh --also-alpha   # also overwrite verge-mihomo-alpha
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SIDECAR_DIR="${ROOT}/src-tauri/sidecar"
DRIFT_CORE="${DRIFT_CORE:-/workspace/mihomo-drift/bin/mihomo-drift}"
ALSO_ALPHA=0
for arg in "$@"; do
  case "$arg" in
    --also-alpha) ALSO_ALPHA=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
  esac
done

if [[ ! -x "$DRIFT_CORE" ]]; then
  echo "error: Drift core not found or not executable: $DRIFT_CORE" >&2
  echo "Build it first:" >&2
  echo "  cd /workspace/mihomo-drift && go build -o bin/mihomo-drift ." >&2
  exit 1
fi

HOST="$(rustc -vV | awk '/^host:/{print $2}')"
if [[ -z "$HOST" ]]; then
  echo "error: could not detect rustc host triple" >&2
  exit 1
fi

mkdir -p "$SIDECAR_DIR"
STABLE="${SIDECAR_DIR}/verge-mihomo-${HOST}"
cp -f "$DRIFT_CORE" "$STABLE"
chmod 755 "$STABLE"
echo "Installed Drift core -> $STABLE"
"$STABLE" -v 2>&1 | head -1 || true

if [[ "$ALSO_ALPHA" -eq 1 ]]; then
  ALPHA="${SIDECAR_DIR}/verge-mihomo-alpha-${HOST}"
  cp -f "$DRIFT_CORE" "$ALPHA"
  chmod 755 "$ALPHA"
  echo "Installed Drift core -> $ALPHA"
fi

echo "Done. Verge will use this binary as the mihomo sidecar for host ${HOST}."
