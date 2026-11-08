#!/bin/bash
set -euo pipefail

# Compatibility entry point: this script has always built and packaged Firefox.
exec bash "$(dirname "$0")/package.sh" firefox
