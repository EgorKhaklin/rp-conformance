#!/usr/bin/env bash
# Runs the FCAF lint on the rendered test cases of both overlays, as CI does:
#  1. fetches the FCAF repository at the pinned `submitted` (content) and `site` (lint tool) commits,
#  2. checks that the vendored base pages in packages/fcaf-render/upstream equal the `submitted` commit,
#  3. lays the Relying Party overlay (fcaf-overlay/docs/fcaf, or OVERLAY_DIR) and then the issuer overlay
#     (fcaf-overlay-issuer/docs/fcaf, or ISSUER_OVERLAY_DIR) over the `submitted` content,
#  4. applies fcaf-overlay/fcaf_lint-rp.patch and fcaf-overlay-issuer/fcaf_lint-issuer.patch to tools/fcaf_lint.py and
#     lints every RP_* and PP_* test case; any finding fails, except those of the checks in ISSUER_LINT_WARN on the
#     PID Provider test cases, which are reported as warnings (fcaf-overlay-issuer/README.md says why).
#
#   scripts/fcaf-lint.sh [work-dir]
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/fcaf-upstream.sh"
work=${1:-$(mktemp -d)}
mkdir -p "$work"

fetch "$work/submitted" "$SUBMITTED"
fetch "$work/site" "$SITE"

for page in defaults.md references.md .nav.yml suts/index.md; do
  if ! cmp -s "$root/packages/fcaf-render/upstream/$page" "$work/submitted/docs/fcaf/$page"; then
    echo "packages/fcaf-render/upstream/$page differs from docs/fcaf/$page at $SUBMITTED" >&2
    exit 1
  fi
done

cp -R "${OVERLAY_DIR:-$root/fcaf-overlay/docs/fcaf}/." "$work/submitted/docs/fcaf/"
cp -R "${ISSUER_OVERLAY_DIR:-$root/fcaf-overlay-issuer/docs/fcaf}/." "$work/submitted/docs/fcaf/"
git -C "$work/site" apply "$root/fcaf-overlay/fcaf_lint-rp.patch"
git -C "$work/site" apply "$root/fcaf-overlay-issuer/fcaf_lint-issuer.patch"

cd "$work/submitted"
lint() { python3 "$work/site/tools/fcaf_lint.py" --root docs/fcaf --format "${FCAF_LINT_FORMAT:-text}" "$@"; }
# The paths contain no spaces; bash 3 (macOS) has no mapfile.
rp=($(find docs/fcaf/suts/relying_party -name 'RP_*.md' | sort))
issuer=($(find docs/fcaf/suts/pid_provider -name 'PP_*.md' | sort))
echo "linting ${#rp[@]} Relying Party test cases"
status=0
lint --enforce-all "${rp[@]}" || status=1
# Every check the lint has, except those the issuer definitions do not satisfy yet.
warn=${ISSUER_LINT_WARN-FC071,FC100}
enforce=$(grep -o '"FC[0-9]*"' "$work/site/tools/fcaf_lint.py" | tr -d '"' | sort -u | grep -vxE "${warn//,/|}" | paste -sd, -)
echo "linting ${#issuer[@]} PID Provider test cases${warn:+ (warnings only: $warn)}"
lint --enforce "$enforce" "${issuer[@]}" || status=1
exit $status
