#!/usr/bin/env bash
# Builds the GitHub Pages site: the FCAF site with the Relying Party and the PID Provider test cases, as the FCAF would
# publish them, under this project's name. It
#  1. fetches the FCAF repository at the pinned `site` (MkDocs shell) and `submitted` (content) commits,
#  2. composes them as the FCAF's own Pages workflow does, and lays the Relying Party overlay (fcaf-overlay/docs/fcaf,
#     or OVERLAY_DIR) and then the issuer overlay (fcaf-overlay-issuer/docs/fcaf, or ISSUER_OVERLAY_DIR) over the
#     content,
#  3. adds website/: the configuration, which inherits the FCAF one and replaces the European Commission's name,
#     logo, navigation and copyright, the stylesheet that replaces its colours, the home page, the issuer suite page
#     and the "unofficial" banner,
#  4. adds the issuer suite's project documents (scripts/site-project-pages.py): the issuer catalogue, the issuer
#     harness design, and the EUDIPLO issuer adapter's README, ICS, known findings and upstream finding texts,
#  5. runs MkDocs (website/requirements.txt) into <work-dir>/public, or serves the site with SITE_SERVE=1.
#
#   scripts/site-build.sh [work-dir]
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/fcaf-upstream.sh"
work=${1:-$(mktemp -d)}
mkdir -p "$work"
work=$(cd "$work" && pwd)

fetch "$work/site" "$SITE"
fetch "$work/submitted" "$SUBMITTED"

compose="$work/compose"
rm -rf "$compose"
mkdir -p "$compose"
git -C "$work/site" archive --format=tar HEAD | tar -xf - -C "$compose"
git -C "$work/submitted" archive --format=tar HEAD docs/fcaf | tar -xf - -C "$compose"
cp -R "${OVERLAY_DIR:-$root/fcaf-overlay/docs/fcaf}/." "$compose/docs/fcaf/"
cp -R "${ISSUER_OVERLAY_DIR:-$root/fcaf-overlay-issuer/docs/fcaf}/." "$compose/docs/fcaf/"

# The configuration sits next to the FCAF one, so the paths it inherits (hooks, overrides, docs) resolve unchanged.
cp "$root/website/mkdocs.yml" "$compose/mkdocs.rp.yml"
cp -R "$root/website/overrides/." "$compose/overrides/"
cp "$root/website/rp.css" "$compose/docs/media/css/rp.css"
# The home page of this site replaces the FCAF one.
sed "s/@FCAF_SUBMITTED@/${SUBMITTED:0:7}/g" "$root/website/index.md" > "$compose/docs/index.md"
mkdir -p "$compose/docs/issuer"
cp "$root/website/issuer.md" "$compose/docs/issuer/index.md"
python3 "$root/scripts/site-project-pages.py" "$root" "$compose/docs"

cd "$compose"
if [ "${SITE_SERVE:-}" = 1 ]; then
  exec "${MKDOCS:-mkdocs}" serve -f mkdocs.rp.yml -a "${SITE_ADDR:-127.0.0.1:8000}"
fi
"${MKDOCS:-mkdocs}" build -f mkdocs.rp.yml --strict --site-dir "$work/public"
echo "site built in $work/public"
