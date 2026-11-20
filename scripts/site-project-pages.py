"""Copies the project documents of the issuer suite into the site (scripts/site-build.sh): the issuer catalogue and
harness design, and the EUDIPLO issuer adapter's README, ICS, known findings and upstream finding texts, below
docs/issuer/. YAML files become pages with the file in a code block. A relative link to a document that is copied
points to its copy; any other relative link points to the file on GitHub, so MkDocs finds no broken link.

    python3 scripts/site-project-pages.py <repository root> <docs dir>
"""

import pathlib
import posixpath
import re
import sys

REPOSITORY = "https://github.com/cre8/rp-conformance"
BRANCH = "main"
LINK = re.compile(r"\]\((?!https?:|mailto:|#)([^)\s]+)\)")


def pages(root: pathlib.Path) -> dict[str, str]:
    """Repository path -> site path below docs/, for every page copied."""
    out = {
        "issuer-test-catalogue.md": "issuer/issuer-test-catalogue.md",
        "issuer-harness-design.md": "issuer/issuer-harness-design.md",
        "adapters/issuer-eudiplo/README.md": "issuer/eudiplo/index.md",
        "adapters/issuer-eudiplo/ics.yaml": "issuer/eudiplo/ics.md",
        "adapters/issuer-eudiplo/known-findings.yaml": "issuer/eudiplo/known-findings.md",
        # The directory, linked from the README, becomes a generated list of its pages.
        "adapters/issuer-eudiplo/upstream-findings": "issuer/eudiplo/upstream-findings/index.md",
    }
    for finding in sorted((root / "adapters/issuer-eudiplo/upstream-findings").glob("*.md")):
        out[f"adapters/issuer-eudiplo/upstream-findings/{finding.name}"] = f"issuer/eudiplo/upstream-findings/{finding.name}"
    return out


YAML_TITLES = {
    "adapters/issuer-eudiplo/ics.yaml": (
        "EUDIPLO ICS",
        "The Implementation Conformance Statement of EUDIPLO as PID Provider, as the issuer adapter configures the "
        "reference image: the file the issuer suite runs with (`--ics adapters/issuer-eudiplo/ics.yaml`).",
    ),
    "adapters/issuer-eudiplo/known-findings.yaml": (
        "EUDIPLO known findings",
        "The FAILs of the issuer suite against EUDIPLO that are analysed and reported upstream: the reference run and "
        "the nightly run report them as known findings (`--known-findings adapters/issuer-eudiplo/known-findings.yaml`).",
    ),
}


def rewrite_links(text: str, source: str, mapping: dict[str, str]) -> str:
    """Rewrites the relative links of `source` (a repository path) for its copy at `mapping[source]`."""
    here = posixpath.dirname(mapping[source])

    def replace(match: re.Match) -> str:
        target, _, fragment = match.group(1).partition("#")
        resolved = posixpath.normpath(posixpath.join(posixpath.dirname(source), target)).rstrip("/")
        anchor = f"#{fragment}" if fragment else ""
        if resolved in mapping:
            return f"]({posixpath.relpath(mapping[resolved], here)}{anchor})"
        kind = "blob" if posixpath.splitext(resolved)[1] else "tree"
        return f"]({REPOSITORY}/{kind}/{BRANCH}/{resolved}{anchor})"

    return LINK.sub(replace, text)


def main(root: pathlib.Path, docs: pathlib.Path) -> None:
    mapping = pages(root)
    for source, target in mapping.items():
        path = root / source
        if path.is_dir():
            items = [
                f"- [{p.read_text(encoding='utf-8').splitlines()[0].lstrip('# ').strip()}]({p.name})"
                for p in sorted(path.glob("*.md"))
            ]
            text = (
                "# EUDIPLO upstream findings\n\n"
                "Issue texts prepared for the known findings of the issuer suite against EUDIPLO. They are not filed by "
                "this project; each names the test cases that show the finding.\n\n" + "\n".join(items) + "\n"
            )
        elif source in YAML_TITLES:
            title, intro = YAML_TITLES[source]
            link = f"{REPOSITORY}/blob/{BRANCH}/{source}"
            text = f"# {title}\n\n{intro} Source: [`{source}`]({link}).\n\n```yaml\n{path.read_text(encoding='utf-8').rstrip()}\n```\n"
        else:
            text = rewrite_links(path.read_text(encoding="utf-8"), source, mapping)
        out = docs / target
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main(pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]))
