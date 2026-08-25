#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$repo_root"
npm run build >/dev/null
npm pack --dry-run >/dev/null
npm pack --pack-destination "$tmp" >/dev/null

package_version="$(node -p "require('./package.json').version")"
package_name="$(node -p "require('./package.json').name.replace(/^@/, '').replace('/', '-')")"
package_tgz="$tmp/$package_name-$package_version.tgz"
test -s "$package_tgz"

mkdir -p "$tmp/app"
cd "$tmp/app"
npm init -y >/dev/null
npm install "$package_tgz" >/dev/null

./node_modules/.bin/logveil --help >/dev/null
version_output="$(./node_modules/.bin/logveil --version)"
test "$version_output" = "logveil $package_version"
node --input-type=module -e "const pkg = await import('@rogerchappel/logveil'); if (typeof pkg.buildBundle !== 'function') process.exit(1)"
installed_package="node_modules/@rogerchappel/logveil"
test "$(node -p "require('./$installed_package/package.json').name")" = '@rogerchappel/logveil'
./node_modules/.bin/logveil redact "$installed_package/examples/agent-session.log" --out "$tmp/repro-safe.md" --json-out "$tmp/evidence.json"
test -s "$tmp/repro-safe.md"
node -e "const fs=require('node:fs'); const data=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); if (data.generatedBy !== 'logveil@' + process.argv[2] || !data.summary || typeof data.summary.findings !== 'number' || !Array.isArray(data.files)) process.exit(1);" "$tmp/evidence.json" "$package_version"
./node_modules/.bin/logveil audit "$installed_package/examples/agent-session.log" --format json --fail-on none >"$tmp/audit.json"

echo '@rogerchappel/logveil package smoke passed'
