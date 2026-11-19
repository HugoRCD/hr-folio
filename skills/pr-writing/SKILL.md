---
name: pr-writing
description: Write pull request descriptions that are short, show the change works instead of only describing it, tell the reviewer how to try it in one step, and say who did what when an AI agent wrote the code. Use whenever you open a pull request, write or update its description, or prepare a change for someone else to review.
---

# PR writing

A reviewer should understand the change, see that it works, and be able to try it within a minute. Most of their time goes into picturing what the author already saw: the page they opened, the command they ran, the test that went green. Put that in the description. Prose that describes a change is a claim, not evidence.

This skill covers the description only. Prepare it, show it to the user, and wait for their go-ahead before opening or editing the pull request, unless they've told you otherwise.

## 1. Say who did what

When an AI agent wrote the change, start the description with one line that tells the reviewer how much a human is behind it. Ask the user for their handle. Use `gh api user -q .login` only after confirming that the signed-in GitHub account is theirs, not a bot or a shared account.

| What the user did | First line |
|---|---|
| Gave the task and approved the approach | `> Written by an AI agent on behalf of @handle. @handle has not reviewed it yet.` |
| Wrote a spec (an issue, a doc, a plan) that you implemented | `> Written by an AI agent on behalf of @handle, following their spec. @handle has not reviewed it yet.` |
| Worked out the design with you: the architecture, the API, the trade-offs | `> Written by an AI agent on behalf of @handle, who shaped the solution. @handle has not reviewed it yet.` |

- Picking one of your options is approving an approach, not shaping the solution. When in doubt, use the plainer line.
- The line only changes to `@handle has reviewed it.` when the user tells you they've reviewed it. Keep it first, and keep it unchanged otherwise.
- Use it instead of any default footer such as "Generated with…". No `Co-Authored-By` trailers in commits.
- If the repository has a pull request template, keep the template and put the line above it.

## 2. Write it in this order

Write the description the way you'd explain the work to a colleague. Don't label the parts ("Why:", "Proof:", "Checks:"): that reads like a form. Use a heading only where a section has real content, such as `### Before and after`. Skip what doesn't apply.

1. An opening paragraph: what was wrong or missing, for whom, the cause when it isn't obvious, and what changes. Real numbers when there are any.
2. Right after it, the fastest way to try the change, ready to copy and introduced by a plain sentence (section 3).
3. The evidence (section 4).
4. Anything a reviewer needs and can't get from the diff: a trade-off, a migration, what you tried that didn't work, what's left to do.
5. What CI doesn't show, in plain sentences: a check that failed, checks you ran yourself because the repository has no CI for them, manual checks (a real device, a real project, a browser), and what nobody verified yet. Don't restate checks CI runs and shows green, such as lint, typecheck or tests: the reviewer already sees them on the pull request.
6. An ELI5: two or three plain sentences someone outside the project would follow, in `<details><summary>ELI5</summary> … </details>` at the end. If you can't write it, the change probably isn't clear yet.

Keep the prose short. Length is fine when it explains something a reviewer needs, such as how a mechanism works or why this approach beats the obvious one. Never spend it on file lists, commit lists, a restatement of the diff, or sections that repeat each other. Snippets and captured output are evidence, not prose, and don't count against the length.

## 3. Say how to try it

Give the reviewer something they can paste or click, not a description of how to set things up.

- **Page or UI:** the preview deployment URL of the changed page itself, not the deployment root. Take it from the deployment bot comment or the deployment status, then add the path.
- **Package or CLI:** one command that runs the pull request build. Turn the bot's install comment (pkg.pr.new and similar) into `npx https://pkg.pr.new/<package>@<pr> <command>`; use install-then-run only when the package has no command to run.
- **API:** a snippet someone can paste.
- **No preview or PR build yet:** the local command, and say the link will follow.

Open each link once to check it serves the change.

## 4. Show it, with evidence that fits the change

| Change | Evidence |
|---|---|
| UI | Before and after screenshots of the same element, same viewport and crop. A short video for motion, hover, or a multi-step flow. A phone width when layout is involved. |
| CLI or build | The real output of the same command before and after, exit code included. Never retype or tidy it. |
| Bug fix | The input and the result before and after, and the regression test that failed first. |
| Performance | What you measured and how (machine, runs, inputs), the numbers on both sides, and how much they vary between runs. |
| AI or agent behaviour | The same set of real prompts on both sides, how answers were graded, time and cost per answer, and where the grading is unreliable. |
| New API or feature | The code someone would write to use it. A pure addition has no "before": show it on its own. |
| Anything else | A small table, a diagram, or an HTML page comparing both versions. |

For browser captures, `agent-browser` (github.com/vercel-labs/agent-browser) can open both versions, set the viewport, screenshot and record. `before-and-after` (github.com/vercel-labs/before-and-after) can attach the result to the pull request.

## 5. Keep it honest

- "After" is the current branch. "Before" is production, the base branch, or the last deploy. Never revert, stash, or switch branches to fake a "before".
- Look at every capture before using it, and check it shows what changed. Check that every image URL loads.
- Embed the evidence; never only describe it ("screenshots are attached"). Use only output you actually captured: never invent it or leave a placeholder to fill in later. A code or `diff` block holds real output only; when all you have is a summary ("31 passed"), write it as a sentence.
- Capture demo or sanitised data only: no real users, tokens, emails, or private messages.
- Report what went wrong too: a check that failed or couldn't run, a number that got worse, a part of the test plan nobody has done yet. Never drop a limit to keep the description short.
- Never commit screenshots or videos to the branch. Upload them to the pull request. If you can't host them, say so in the description.
- **Security fixes are the exception.** Don't publish a reproduction, a payload, or a step-by-step exploit in a public pull request. Describe the impact at a high level, follow the project's security policy, and keep the detailed evidence private until the fix is released.

## 6. Check before you hand it over

- The first line matches what the user actually did.
- It reads like someone explaining their work, not a filled-in form.
- Someone can try the change from the line after the opening, without asking anything.
- Nothing CI already shows green is restated, and every unverified part is stated.
- Every claim has evidence next to it, or says why there's none.
- Every paragraph explains something the diff doesn't.
- The ELI5 is there and makes sense on its own.
- Nothing in it was invented: no numbers, results, or test runs you didn't see.
