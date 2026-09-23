---
name: split-commits
description: Split the working tree's pending changes (staged, unstaged, and untracked files) into several separate, logically-scoped Conventional Commits instead of one big commit. Use this whenever the user wants to "split my changes into commits", "segment this into several commits", "clean up my working tree into atomic commits", commit "in logical chunks", or otherwise commit everything pending but organized into more than one commit. Do NOT use this when the user already hands over one explicit list of files to commit as a single commit -- that's the conventional-commit skill's job directly. This skill plans the batches and then calls conventional-commit's script per batch.
---

# Split Commits

Takes everything pending in the working tree and turns it into a sequence of
small, coherent Conventional Commits instead of one undifferentiated commit.
The hard part here is entirely judgment (which files belong together); the
mechanical part (staging exactly a batch's files, formatting the message,
never leaking a `Co-Authored-By` trailer) is already solved by the
[conventional-commit](../conventional-commit/SKILL.md) skill's script — reuse
it per batch rather than re-implementing staging/commit logic here. That
script's safety checks (staged-set verification, trailer rejection) are the
"garde-fous" this skill relies on, so always go through it rather than
running `git add`/`git commit` directly.

## Steps

1. **Inventory the changes.** Run `git status --porcelain` to list every
   staged, unstaged, and untracked file. For each one, look at its actual
   diff (`git diff -- <file>` for unstaged, `git diff --cached -- <file>` for
   already-staged, and just read the content for new untracked files) — you
   need to understand *what* changed, not just *which* files changed, to
   group them sensibly.

2. **Propose batches.** Group files by logical concern, not by mechanical
   rules like "one batch per directory". A new component plus its spec plus
   the service it consumes is typically one batch; an unrelated fix elsewhere
   is a separate one. For each batch, resolve `type`/`scope`/`description`
   the same way conventional-commit does — see
   [../conventional-commit/references/conventional-commits.md](../conventional-commit/references/conventional-commits.md)
   for the type table and scope conventions (`backend`/`frontend`/narrower
   feature name).

   **Known limit:** batches are whole-file, not per-hunk. If a single file
   mixes two unrelated changes, it can't be split between two commits (that
   would need `git add -p`-style patch staging, which this skill doesn't do).
   When you hit that, keep the file in whichever batch its change most
   belongs to and say so explicitly in the plan rather than silently
   picking one.

3. **Show the plan and wait for approval.** Present the batches as a numbered
   list (files + inferred type/scope/description each) before touching git at
   all. Splitting history is easy to get wrong and mildly annoying to undo,
   so don't stage or commit anything until the user has confirmed the plan or
   edited it. If they just say "looks good", proceed; if they rename/merge/
   drop batches, use their version.

4. **Execute batch by batch**, in an order where earlier batches don't leave
   later ones in a confusing partial state (usually the order you listed them
   in is fine). For each batch, run the conventional-commit script from the
   repository root — do not duplicate its logic, and do not pre-stage files
   yourself:
   ```
   python3 .claude/skills/conventional-commit/scripts/commit.py <<'JSON'
   { "files": [...batch files...], "type": "...", "scope": "...", "description": "..." }
   JSON
   ```
   It stages exactly that batch, verifies nothing extra got staged, builds
   the message, and commits. If it errors on a batch (e.g. an unexpected
   staged-set mismatch), stop and report rather than continuing to the next
   batch — the repo state no longer matches your plan's assumptions.

5. **Report the outcome**: the list of commits created (hash + subject each).
   Never `git push` as part of this — that stays a separate, explicit action.
