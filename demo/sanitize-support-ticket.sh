#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/logveil-support-ticket"
MARKDOWN_OUT="$OUT_DIR/support-ticket-safe.md"
JSON_OUT="$OUT_DIR/support-ticket-evidence.json"
AUDIT_OUT="$OUT_DIR/support-ticket-audit.json"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
npm run build >/dev/null

node dist/cli.js redact examples/support-ticket.log \
  --out "$MARKDOWN_OUT" \
  --json-out "$JSON_OUT"

node dist/cli.js audit examples/support-ticket.log \
  --format json \
  --fail-on none > "$AUDIT_OUT"

test -s "$MARKDOWN_OUT"
test -s "$JSON_OUT"
test -s "$AUDIT_OUT"
grep -Fq "REDACTED" "$MARKDOWN_OUT"
grep -Fq "findings" "$AUDIT_OUT"
if grep -Fq "alex" "$MARKDOWN_OUT"; then
  echo "expected support contact to be redacted" >&2
  exit 1
fi

printf 'Sanitized ticket: %s\n' "$MARKDOWN_OUT"
printf 'Evidence JSON: %s\n' "$JSON_OUT"
printf 'Audit JSON: %s\n' "$AUDIT_OUT"
