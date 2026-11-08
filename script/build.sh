#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")/.."
browser="${1:-firefox}"
if [ "$#" -gt 0 ]; then shift; fi
case "$browser" in
    firefox|chrome) ;;
    *) echo "Usage: bash script/build.sh [firefox|chrome] [vite options]" >&2; exit 1 ;;
esac

echo "Building DevTab for $browser..."
VITE_BUILD_TARGET=extension VITE_BROWSER="$browser" npx --no-install vite build "$@"
