"""Lays the site-only layer (website/fcaf) over the composed FCAF content (scripts/site-build.sh).

The overlays in fcaf-overlay and fcaf-overlay-issuer stay a clean diff against the FCAF, so they can be contributed
upstream. This site presents only the Systems Under Test of this project, the Relying Party, the PID Provider and the
Attestation Provider, so this step
  1. removes the FCAF pages that concern the Wallet Solution or the FCAF project itself: the Wallet Solution SUT,
     the shared test cases (no test case here invokes them), the templates, the Wallet ICS, the changelog and the
     roadmap,
  2. copies the rewritten general pages of website/fcaf over docs/fcaf,
  3. replaces the Wallet Unit part at the top of defaults.md with website/fcaf/defaults-head.md, and keeps the
     generated sections from "## Relying Party testing" on,
  4. points the links to the Wallet ICS at the official FCAF.
Every rewrite fails loudly when the text it expects is gone, so a change upstream or in the renderer is noticed.

    python3 scripts/site-layer.py <repository root> <docs dir>
"""

import pathlib
import shutil
import sys

FCAF_ICS = "https://conformance.eudi.dev/latest/fcaf/ics/"
REMOVED = [
    "fcaf/suts/wallet_solution",
    "fcaf/suts/shared",
    "fcaf/templates",
    "fcaf/ics.md",
    "fcaf/CHANGELOG.md",
    "fcaf/.nav.yml",
    "roadmap.md",
]
DEFAULTS_SPLIT = "## Relying Party testing\n"
ICS_LINK = "[Wallet ICS](ics.md)"


def main(root: pathlib.Path, docs: pathlib.Path) -> None:
    for name in REMOVED:
        path = docs / name
        if not path.exists():
            sys.exit(f"site-layer: {path} is missing; the FCAF content has changed")
        shutil.rmtree(path) if path.is_dir() else path.unlink()

    layer = root / "website" / "fcaf"
    for source in sorted(layer.rglob("*.md")):
        if source.name == "defaults-head.md":
            continue
        target = docs / "fcaf" / source.relative_to(layer)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)

    defaults = docs / "fcaf" / "defaults.md"
    text = defaults.read_text(encoding="utf-8")
    if text.count(DEFAULTS_SPLIT) != 1:
        sys.exit(f"site-layer: {defaults} has no single {DEFAULTS_SPLIT.strip()!r} section")
    head = (layer / "defaults-head.md").read_text(encoding="utf-8")
    defaults.write_text(head.rstrip("\n") + "\n\n" + DEFAULTS_SPLIT + text.split(DEFAULTS_SPLIT, 1)[1], encoding="utf-8")

    for name in ("ics-rp.md", "ics-issuer.md"):
        page = docs / "fcaf" / name
        text = page.read_text(encoding="utf-8")
        if ICS_LINK not in text:
            sys.exit(f"site-layer: {page} has no link {ICS_LINK!r}")
        page.write_text(text.replace(ICS_LINK, f"[Wallet ICS of the FCAF]({FCAF_ICS})"), encoding="utf-8")


if __name__ == "__main__":
    main(pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]))
