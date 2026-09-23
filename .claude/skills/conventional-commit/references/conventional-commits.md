# Conventional Commits v1.0.0 — cheat sheet

Full spec: https://www.conventionalcommits.org/en/v1.0.0/

## Format

```
<type>[(scope)][!]: <description>

[optional body]

[optional footer(s)]
```

- `type`: what kind of change this is (see table below).
- `scope` (optional): the part of the codebase affected, in parentheses, e.g. `feat(auth): ...`.
- `!` right before the `:`: marks a breaking change (alternative or addition to a
  `BREAKING CHANGE:` footer).
- `description`: short summary, imperative mood ("add", not "added"/"adds"), no
  capital first letter required, no trailing period.
- `body` (optional): free-form, explains motivation/contrast with previous behavior.
- `footer(s)` (optional): `token: value` or `token #value` lines, e.g. `Refs: #42`,
  `Reviewed-by: ...`. `BREAKING CHANGE: <description>` is a reserved footer that
  documents a breaking API change (token is the two words `BREAKING CHANGE`, the
  only footer token allowed to contain a space).

## Types

| type       | when to use |
|------------|-------------|
| `feat`     | a new capability for the end user |
| `fix`      | a bug fix for the end user |
| `docs`     | documentation only |
| `style`    | formatting, whitespace, missing semicolons — no code behavior change |
| `refactor` | code change that neither fixes a bug nor adds a feature |
| `perf`     | a code change that improves performance |
| `test`     | adding or correcting tests, no production code change |
| `build`    | build system or external dependencies (npm, Maven/pom.xml, mvnw, webpack...) |
| `ci`       | CI configuration/scripts (GitHub Actions, etc.) |
| `chore`    | maintenance that doesn't fit the above and doesn't touch src or tests |
| `revert`   | reverts a previous commit |

Only `fix` and `feat` carry spec-mandated semantic-versioning meaning (patch and
minor respectively); a `!` or `BREAKING CHANGE:` footer signals a major bump
regardless of type.

## Examples

Simple:
```
fix(frontend): correct date range validation on the event dialog
```

With scope and body:
```
feat(backend): add DELETE /api/events/{id} endpoint

Allows removing a single event by id. Returns 404 when the event
does not exist or does not belong to the caller.
```

Breaking change via `!` and footer:
```
refactor(backend)!: rename EventDto.date to EventDto.startDate

BREAKING CHANGE: clients must update payloads to use `startDate`
instead of `date`; the old field is no longer accepted.
```

Revert:
```
revert: feat(frontend): add recurring event support

Refs: a1b2c3d
```

## This repo's constraint

Never add a `Co-Authored-By` (or any other AI-attribution) trailer to the commit
message — this repo's `CLAUDE.md`/user preferences forbid it regardless of what
generated the commit message.
