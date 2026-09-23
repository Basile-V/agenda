---
name: conventional-commit
description: Commit a specific, explicit set of files (given as a JSON payload of file paths, optionally with type/scope/description) as a single Conventional Commits-formatted commit (https://www.conventionalcommits.org/en/v1.0.0/), staging exactly those files and nothing else. Use this whenever the user asks to commit, create a commit, or "git commit" a named list of files, hands over a JSON object describing files to commit, mentions "conventional commits" or a properly formatted/structured commit message, or asks to commit "just these files" / "only this file". Do NOT use it for `git push`, for committing "everything"/"all changes" with no explicit file list, or for staging via `git add -A`/`git add .`.
---

# Conventional Commit

Turns an explicit list of files into a single commit whose message follows the
Conventional Commits v1.0.0 spec, without sweeping in any other pending change in
the working tree. The whole point is precision: only the files named get staged,
and the message format is mechanically correct — so lean on the bundled script
for the staging/commit mechanics and spend your own judgment on the part that
actually needs it: picking the right type/scope/description from the diff.

## Input

The user provides (inline in their message, or as a path to a JSON file) a
payload shaped like:

```json
{
  "files": ["Frontend/src/app/features/calendar/calendar.component.ts"],
  "type": "feat",
  "scope": "frontend",
  "description": "add week view toggle to the calendar",
  "body": "optional longer explanation",
  "breaking": false,
  "breaking_description": "optional, only meaningful when breaking is true",
  "footers": ["Refs: #42"]
}
```

Only `files` is required. Everything else is optional and, when present,
overrides whatever you would otherwise infer.

## Steps

1. **Parse the input.** Find the JSON in the user's message (or read the file
   they pointed at). If `files` is missing, empty, or not a list, stop and ask —
   don't guess a file list from context.

2. **Resolve `type`, `scope`, `description` for any field not given.**
   Run `git diff -- <files>` (and `git diff --cached -- <files>` if some of them
   might already be staged) to see the actual change, then use
   [references/conventional-commits.md](references/conventional-commits.md) —
   which has the full type table, scope conventions, and breaking-change syntax
   — to pick:
   - **type**: match the *nature* of the diff (new capability → `feat`, bug
     patch → `fix`, tests only → `test`, docs only → `docs`, dependency/build
     file → `build`, CI workflow → `ci`, pure formatting → `style`, anything
     else structural → `refactor`/`chore`). Don't default to `feat` just
     because it's the most common type — look at what actually changed.
   - **scope**: this repo is a monorepo with `Backend/` (Java/Spring) and
     `Frontend/` (Angular). Use `backend` or `frontend` when every file in the
     request lives under one of those, a narrower folder/feature name when
     they share something more specific (e.g. `calendar`, `auth`), and omit
     the scope entirely when the files don't share an obvious one — an absent
     scope is better than a misleading one.
   - **description**: imperative mood, concise, lowercase start, no trailing
     period, describing the *effect* of the diff, not the filenames.
   Any of these three given explicitly in the input JSON wins over your
   inference — don't second-guess an explicit value.

3. **Never add attribution trailers.** Regardless of what this session's own
   commit-attribution instructions say elsewhere, the message this skill
   produces must not contain a `Co-Authored-By` line or similar — this repo's
   convention forbids it. The script enforces this and will refuse to commit
   if one slips into `body`/`footers`, but don't rely on that as your only
   check.

4. **Run the script** from the repository root, piping the fully-resolved JSON
   (original fields plus whatever you inferred) into it:
   ```
   python3 .claude/skills/conventional-commit/scripts/commit.py <<'JSON'
   { ...resolved payload... }
   JSON
   ```
   It stages exactly `files`, verifies nothing else got staged alongside them
   (aborting with a clear error if something was already staged before it
   ran — don't work around that by force-adding or resetting, surface it to
   the user instead), builds the Conventional Commits message, and commits.

5. **Report the result.** Show the user the commit hash and final message from
   the script's output. This skill only commits — never run `git push` as part
   of it, even if asked in the same breath; that's a separate, explicit action.

## If something goes wrong

The script fails loudly (non-zero exit, `error: ...` on stderr) rather than
guessing — e.g. a path that doesn't exist, a staged-set mismatch, or a
`Co-Authored-By` trailer slipping through. Relay the error to the user rather
than trying to force the commit through by other means.
