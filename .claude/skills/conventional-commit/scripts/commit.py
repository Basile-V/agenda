#!/usr/bin/env python3
"""Stage an exact set of files and create a Conventional Commits-formatted commit.

Reads a JSON payload (see references/conventional-commits.md for the fields) either
from a file given as argv[1] or from stdin, then:
  1. Stages exactly the listed files (never a blanket `git add -A`/`.`).
  2. Verifies nothing else ended up staged (protects against pre-existing staged
     changes silently riding along in the commit).
  3. Builds a Conventional Commits message and commits (never pushes).

Required fields by the time this script runs: files, type, description.
Type/scope/description inference from the diff is done by the caller (Claude),
not here -- this script only assembles and applies an already-decided message.
"""
import json
import subprocess
import sys

RECOMMENDED_TYPES = {
    "feat", "fix", "docs", "style", "refactor",
    "perf", "test", "build", "ci", "chore", "revert",
}


def fail(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def run(cmd, **kwargs):
    return subprocess.run(cmd, text=True, **kwargs)


def load_payload():
    if len(sys.argv) > 1:
        with open(sys.argv[1], encoding="utf-8") as f:
            raw = f.read()
    else:
        raw = sys.stdin.read()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        fail(f"invalid JSON input: {e}")


def main():
    payload = load_payload()

    files = payload.get("files")
    if not files or not isinstance(files, list):
        fail("'files' must be a non-empty list of paths")

    commit_type = payload.get("type")
    description = payload.get("description")
    if not commit_type or not description:
        fail("'type' and 'description' are required -- resolve them (from the JSON "
             "input or by inspecting the diff) before calling this script")

    if commit_type not in RECOMMENDED_TYPES:
        print(
            f"warning: '{commit_type}' is not one of the common Conventional Commits "
            f"types ({', '.join(sorted(RECOMMENDED_TYPES))}); proceeding anyway",
            file=sys.stderr,
        )

    scope = payload.get("scope") or ""
    body = (payload.get("body") or "").strip()
    breaking = bool(payload.get("breaking", False))
    breaking_description = (payload.get("breaking_description") or "").strip()
    footers = payload.get("footers") or []

    header = commit_type
    if scope:
        header += f"({scope})"
    if breaking:
        header += "!"
    header += f": {description}"

    if len(header) > 100:
        print(f"warning: commit subject is {len(header)} chars, consider shortening", file=sys.stderr)

    parts = [header]
    if body:
        parts.append(body)

    footer_lines = list(footers)
    if breaking and breaking_description:
        footer_lines.append(f"BREAKING CHANGE: {breaking_description}")
    if footer_lines:
        parts.append("\n".join(footer_lines))

    for part in parts:
        if "co-authored-by" in part.lower():
            fail("commit message must not include a Co-Authored-By trailer (repo convention)")

    message = "\n\n".join(parts) + "\n"

    # Message is fully validated -- only now touch the index, so an invalid
    # payload never leaves stray staged changes behind.
    if run(["git", "rev-parse", "--is-inside-work-tree"],
           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode != 0:
        fail("not inside a git repository")

    add = run(["git", "add", "--"] + files)
    if add.returncode != 0:
        fail("git add failed -- check that every path in 'files' exists and is spelled correctly")

    staged = run(["git", "diff", "--cached", "--name-only"], capture_output=True).stdout.splitlines()
    expected, actual = set(files), set(staged)
    if actual != expected:
        details = []
        extra = actual - expected
        missing = expected - actual
        if extra:
            details.append(f"staged but not requested: {sorted(extra)} (already staged before this ran?)")
        if missing:
            details.append(f"requested but not staged: {sorted(missing)} (no changes on disk?)")
        fail("staged file set does not match the requested files -- " + "; ".join(details))

    commit = run(["git", "commit", "-F", "-"], input=message)
    if commit.returncode != 0:
        fail("git commit failed")

    log = run(["git", "log", "-1", "--format=%H%n%s%n%n%b"], capture_output=True)
    print(log.stdout.strip())


if __name__ == "__main__":
    main()
