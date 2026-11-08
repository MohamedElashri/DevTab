#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
browser="${1:-firefox}"
case "$browser" in
    firefox|chrome) ;;
    *) echo "Usage: bash script/package.sh [firefox|chrome]" >&2; exit 1 ;;
esac

command -v zip >/dev/null || { echo 'Install zip to package extensions.' >&2; exit 1; }
bash script/build.sh "$browser"

# Build the ZIP from scratch so removed files cannot survive from an old release.
# Only replace the last package once the new archive passes its integrity check.
archive="$PWD/${browser}_extension.zip"
staging_dir="$(mktemp -d)"
trap 'rm -rf "$staging_dir"' EXIT
staging_archive="$staging_dir/${browser}_extension.zip"
(
    cd "dist/$browser"
    zip -qr "$staging_archive" . \
        -x '*.DS_Store' 'web_manifest.json' 'screenshots/*' 'images/*' 'robots.txt'
)
zip -T "$staging_archive"
mv "$staging_archive" "$archive"
echo "Packaged: $archive"
