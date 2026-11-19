---
name: document-pr
description: Reviews and rewrites pull request descriptions so they are short, accurate, easy to test, and backed by real before/after evidence. Use only when explicitly asked to document, review, improve, or prepare a PR description or its proof.
disable-model-invocation: true
---

# Document PR

Improve the description, not the code. Read code only to understand and verify behavior. Propose a full replacement body and wait for approval before changing anything on GitHub.

The `pr-writing` skill defines the shape (Why, Try it, Proof, Notes, Checks, ELI5). This skill is how to fill it honestly.

## 1. Inspect

1. Get the PR number or URL, then one `gh pr view --json title,body,baseRefName,headRefName,url,files,commits,statusCheckRollup,comments,reviews,closingIssuesReferences`.
2. Read only the diffs and files needed to understand each behavior. Don't rerun checks already in `statusCheckRollup`.
3. Find the test links now: the preview deployment URL (bot comment or deployment status) plus the path of the changed page, and the PR build install command from its bot comment (pkg.pr.new and similar). Open each link once to confirm it serves the change.
4. Never read `.env`, tokens or deployment linkage files into context.

Stop exploring when each behavior has a way to reproduce it or a concrete blocker.

## 2. Plan the proof

Split the PR into behaviors a reviewer would check separately. Each gets its own before/after; two unrelated fixes need two pairs.

Prefer, in order: the same real command, prompt or interaction before and after; the same API or protocol call; the same discovery call showing changed capabilities; a focused test with meaningful output; text with a stated blocker. Source code, configs, allowlists and styled diffs are never proof: the reviewer already has the diff.

For agent behavior, show the actual tool call, trace or protocol result, not a natural-language answer the model could have produced from memory.

Keep one variable per proof. If an unrelated failure on base hides the target behavior, isolate it (fixture, narrower command, disposable worktree) rather than presenting the earlier failure as proof.

## 3. Reproduce and capture

Work in one temporary folder outside the repo:

```bash
PR_PROOF_DIR="$(mktemp -d "${TMPDIR:-/tmp}/pr-proof-<repo>-<pr>.XXXXXX")"
```

Worktrees, raw output, media and the draft body go there; `git status --short` must stay clean. Run base in a temporary `git worktree` inside it. Use the same input, viewport, fixture and steps on both sides. Save stdout, stderr and exit codes as they happen; never reconstruct them later. Redact tokens and IDs, and say where you did.

Capture screenshots and recordings with `agent-browser` (github.com/vercel-labs/agent-browser), one session at a time; `before-and-after` (github.com/vercel-labs/before-and-after) can format them as a table. When raw output reads badly, build a small HTML artifact from the saved output following [evidence-design.md](evidence-design.md).

Look at every capture and check it shows the change.

## 4. Draft

```markdown
> [the disclosure line from `pr-writing`, when an agent wrote the change]

[Why: one or two sentences.]

**Try it:** [preview URL of the changed page / `npx https://pkg.pr.new/<package>@<pr> <command>` / snippet]

### [Behavior]

[Its before/after]

[Notes, only if a reviewer needs them]

**Checks:** [one line]

<details><summary>ELI5</summary>

[Two or three plain sentences.]

</details>
```

- Keep each proof next to the behavior it shows. Omit empty parts.
- Don't list files, commits or tests. Explain a mechanism only when a reviewer would otherwise be lost.
- Claim only what you verified. A check that couldn't run goes in **Checks**.

## 5. Approval and publication

1. Present the draft and the local proof. Ask for approval.
2. Check `gh version` (2.99.0+ for native `--attach`) and `gh auth status`. If either fails, report it and keep the proof.
3. After approval, refresh the body to keep concurrent edits, write it to `$PR_PROOF_DIR/body.md` with relative media paths, and publish from that folder:

   ```bash
   cd "$PR_PROOF_DIR"
   gh pr edit <number> --repo owner/repo --body-file body.md \
     --attach ./<behavior>/before.png --attach ./<behavior>/after.png
   ```

4. Read the body back, confirm every URL loads and sits in the right place, return the final body in one Markdown block, then delete `$PR_PROOF_DIR`.

## Final check

- Someone can test the change from the **Try it** line without asking.
- Every behavior has its own comparable before/after.
- No prose a reviewer would skip: every paragraph explains something the diff doesn't.
- No media in the repo, no local paths left in the published body.
