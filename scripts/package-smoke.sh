#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$repo_root"
npm run build >/dev/null
npm pack --dry-run >/dev/null
npm pack --pack-destination "$tmp" >/dev/null

package_tgz="$(find "$tmp" -maxdepth 1 -name 'logveil-*.tgz' -print -quit)"
test -n "$package_tgz"

mkdir -p "$tmp/app"
cd "$tmp/app"
npm init -y >/dev/null
npm install "$package_tgz" >/dev/null

./node_modules/.bin/logveil --help >/dev/null
version_output="$(./node_modules/.bin/logveil --version)"
grep -q '0.1.0' <<<"$version_output"
./node_modules/.bin/logveil redact node_modules/logveil/examples/agent-session.log --out "$tmp/repro-safe.md" --json-out "$tmp/evidence.json"
test -s "$tmp/repro-safe.md"
node -e "const fs=require('node:fs'); const data=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); if (!data.summary || typeof data.summary.findings !== 'number' || !Array.isArray(data.files)) process.exit(1);" "$tmp/evidence.json"
./node_modules/.bin/logveil audit node_modules/logveil/examples/agent-session.log --format json --fail-on none >"$tmp/audit.json"

echo 'logveil package smoke passed'
