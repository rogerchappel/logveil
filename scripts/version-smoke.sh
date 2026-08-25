#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git -C "$repo_root" archive HEAD | tar -x -C "$tmp"
cd "$tmp"
npm pkg set version=9.8.7
npm install --ignore-scripts --no-audit --no-fund >/dev/null
npm run check >/dev/null
npm run build >/dev/null
test "$(node dist/cli.js --version)" = "logveil 9.8.7"
node --input-type=module -e "import { buildBundle } from './dist/index.js'; if (buildBundle([]).generatedBy !== 'logveil@9.8.7') process.exit(1)"
bash scripts/package-smoke.sh >/dev/null

echo 'disposable bumped-version smoke passed'
