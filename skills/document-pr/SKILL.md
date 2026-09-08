---
name: document-pr
description: Reviews and rewrites pull request descriptions so they are concise, natural, accurate, and supported by relevant before/after screenshots or videos. Use only when explicitly asked to document, review, improve, or prepare a PR description or its proof.
disable-model-invocation: true
---

# Document PR

Improve the PR description, not the implementation. Read code only to understand and verify behavior. Propose a complete replacement body and wait for approval before changing GitHub.

## Principles

- Explain what changed and why in natural, concrete language.
- Keep small PRs to a short paragraph. Use bullets only when they improve scanning.
- Remove template debris, release-note tone, hype, repeated commits, and implementation trivia.
- Never claim behavior, tests, or evidence that was not verified.
- Every independently reviewable behavior needs its own relevant before/after proof.
- A written explanation is not proof. Use it only after exhausting practical capture options.
- Source code is context, never behavioral proof. Reviewers can already read the diff.

## Temporary workspace

Before generating anything, create one OS-managed temporary root:

```bash
PR_PROOF_DIR="$(mktemp -d "${TMPDIR:-/tmp}/pr-proof-<repo>-<pr>.XXXXXX")"
```

Put disposable worktrees, raw output, HTML, screenshots, videos, and the draft body inside `$PR_PROOF_DIR`. Never create `artifacts/`, screenshots, recordings, or generated proof files in the repository. After capture, require `git status --short` to show no files created by this workflow.

Keep the temporary directory across the approval turn. Delete it after successful GitHub publication and verification. If work is abandoned or blocked, leave it only in the OS temporary location for automatic cleanup.

## 1. Inspect efficiently

1. Identify the PR or ask for its URL/number.
2. Run one `gh pr view --json ...` for title, body, base/head, URL, files, commits, checks, comments, reviews, and linked issues.
3. Inspect the changed-file list, then read only focused diffs and files needed to identify behavior.
4. Do not repeat checks already available in `statusCheckRollup`.
5. Inspect only the package scripts and narrow CLI help needed for reproduction.
6. For dynamic tools, inspect the exact tool schema, not the entire namespace.
7. Stop exploring when each behavior has a reproducible command or a concrete blocker.

Run independent read-only discovery in parallel. Run servers, browser sessions, recordings, and captures sequentially.

After a sandbox denial, retry the same sound command with the required permission. Do not improvise binary paths, repeat help calls, or reinstall dependencies solely because the first command was sandboxed.

Never read `.env`, deployment linkage files, tokens, or credentials into model context. Let processes consume existing configuration by path without printing it.

## 2. Build an evidence map

Split the PR into independently reviewable behaviors. For each, record privately:

- behavior or bug
- exact base reproduction
- exact head reproduction
- capture format
- temporary paths
- publication status

Two unrelated fixes require two distinct proof pairs. Do not use one generic capture for several bugs.

Existing PR reports count only when they directly demonstrate the changed behavior. Incidental bundle, coverage, build, or performance reports are irrelevant unless that metric is what the PR changes.

Prefer evidence in this order:

1. Same real end-to-end command, prompt, or interaction before and after
2. Same direct API, MCP, or protocol call before and after
3. Same discovery command showing changed tools or capabilities
4. Same focused integration test with meaningful runtime output
5. Minimal presentation of the real saved output
6. Text-only explanation with a concrete blocker

Never use a source excerpt, allowlist, config object, `git show`, or styled diff as proof.

For agent behavior, a natural-language answer is insufficient when it may come from model knowledge. Capture the actual tool call, trace, protocol response, or discovery result. Reject evidence that says “based on my knowledge” without showing an underlying call.

Keep one causal variable per proof. If an unrelated base failure masks the target behavior, isolate it with a fixture, focused command, minimal neutralization in a disposable worktree, or a closer protocol boundary. Do not present an earlier failure as proof of a later fix.

## 3. Reproduce honestly

Use the same input, environment, viewport, fixture, account state, command, arguments, and interaction sequence on base and head.

For a temporary worktree:

1. Create it from the existing repository directory inside `$PR_PROOF_DIR`.
2. Only then run commands with the worktree as `working_directory`.
3. Reuse compatible dependencies when safe; install only what is required.
4. Configure base and head with equivalent non-secret inputs.
5. Start the correct server and wait for readiness before invoking a client.
6. Capture exact stdout, stderr, exit status, tool calls, and protocol results.
7. Remove the worktree after evidence is verified.

Save raw results during execution to `$PR_PROOF_DIR/<behavior>/`. Never reconstruct them later with file patches or transcript copy/paste. Before publication, remove tokens, session/request IDs, and unrelated noise while preserving evidence-bearing lines. Mark any redaction.

## 4. Capture proof

Load the installed `before-and-after` skill. First produce real behavior, then use it to capture and format the result. Ignore its legacy 0x0.st or Gist publishers.

Check the capture command and help once. Never guess selector syntax. For HTML evidence, create separate `before.html` and `after.html`; do not hide states with fragments or fragile selectors.

Never run two `before-and-after` or `agent-browser` sessions concurrently because shared browser state can cross-contaminate captures. Capture one behavior at a time and inspect both images before continuing.

Store media only at:

```text
$PR_PROOF_DIR/<behavior>/before.<ext>
$PR_PROOF_DIR/<behavior>/after.<ext>
```

Use `agent-browser` for interaction and motion:

```bash
agent-browser doctor
agent-browser open "<url>"
agent-browser record start "$PR_PROOF_DIR/<behavior>/after.mp4"
agent-browser snapshot -i
# Perform the short deterministic interaction.
agent-browser record stop
```

Use 30 fps normally and 60 fps only for short motion-heavy proof. Always stop recording before closing.

## 5. Design output artifacts

When direct capture is unclear, generate self-contained HTML from the saved real output. Read [evidence-design.md](evidence-design.md) first. It distills https://vercel.com/design.md for this task; do not refetch the full external guide each run.

The artifact must:

- make the real command, prompt, tool call, or protocol output dominant
- clearly label before and after
- use comparable dimensions, wrapping, crop, and hierarchy
- escape untrusted output
- contain no fabricated or rewritten output
- contain no source diff or code representation as proof

Do not add Vercel branding or imply official Vercel authorship.

## 6. Draft the PR body

Use the lightest structure that fits:

```markdown
[One or two natural sentences explaining the outcome and motivation.]

## What changed

- [Only when multiple coherent changes need bullets]

## Before and after

### [First behavior]

[Its before/after media]

### [Second behavior]

[Its separate before/after media]

## Validation

- [Only checks and reproductions actually completed]
```

Omit empty headings. Keep each proof beside the behavior it demonstrates.

## 7. Approval and GitHub publication

### Draft

1. Capture and inspect every proof pair locally.
2. Prepare the proposed body with local media references.
3. Run `gh version`; require GitHub CLI 2.99.0 or newer.
4. Confirm `gh auth status`, repository write access, formats, and size limits.
5. Present the draft and local proof, then ask for approval.

If `gh` is older than 2.99.0, update it through the existing package manager before publication. Do not try 0x0.st, Gist, repository commits, or a description without captures as fallbacks.

### After approval

Write the approved body to `$PR_PROOF_DIR/body.md` with ordinary references to the exact local files, then run one native GitHub command:

```bash
gh pr edit <number> \
  --body-file "$PR_PROOF_DIR/body.md" \
  --attach "$PR_PROOF_DIR/<first>/before.png" \
  --attach "$PR_PROOF_DIR/<first>/after.png" \
  --attach "$PR_PROOF_DIR/<second>/before.png" \
  --attach "$PR_PROOF_DIR/<second>/after.png"
```

Repeat `--attach` for approved PNG, JPEG, GIF, WebP, SVG, MP4, MOV, or WebM files. GitHub CLI rewrites matching local references to attachment URLs.

Read the body back with `gh pr view`, verify every URL and placement, return the resulting body in one copyable Markdown block, then delete `$PR_PROOF_DIR`.

## Final check

- Opening is under three sentences and supported by the PR.
- Every independent behavior has a separate, causally relevant proof.
- Before and after are directly comparable and legible.
- All draft media exists only under `$PR_PROOF_DIR`.
- Evidence generation left the repository clean.
- Approved media URLs resolve and no local placeholders remain.
- The description is understandable without reading every commit.
