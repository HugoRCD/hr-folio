---
title: What My Pull Requests Look Like Now
date: 2026-10-27
description: As we read less of the code agents write, the pull request becomes what we judge a change by. Mine now say who did what and show that the change works. Here are real ones, what they don't fix, and a skill to do the same.
tags:
  - agents
  - open-source
  - workflow
---

# What My Pull Requests Look Like Now

You've probably received one by now. Forty files, a title like "refactor auth", and a description an agent wrote in about three seconds: "This PR improves the authentication flow and fixes several issues." Call it a slop grenade. Someone pulled the pin, rolled it into your review queue and walked away. Defusing it is now your job.

The problem isn't that an agent wrote the code. It's that nothing in the PR helps you trust it.

And that part matters more every month. Agents write more of our code, and I think we'll read less and less of it, maybe one day almost none. When you stop reading every line, you judge a change by what's around it: what it was meant to do, who decided how, and proof that it does it. So that's the part of my agents' output I've been working on: the pull request itself.

Mine now do three things. The first line says who did what. The body shows the change with the evidence that fits it: before and after captures for a page, both outputs for a bug, measured numbers for a speed-up. The last lines explain it in plain words.

It doesn't solve everything, and I'll come back to what it doesn't. But it's the biggest gain in confidence I've found for the least effort. Below are three real PRs, what each part gives the reviewer, and a skill you can install so your agents write PRs the same way.

## Why describing isn't enough

"Fixed the layout on mobile" tells the reviewer what the author believes happened. To check it, they have to rebuild what the author already saw: find the page, open both versions, resize the window to the same width. Most of my review time goes into exactly that.

The paragraph is usually honest, but it isn't evidence. The same page at the same phone width, before and after, would be.

We skipped that part for years because it took time: matching the viewport, cropping the same element twice, recording a hover, running a benchmark more than once. An agent does all of that in a few minutes, and it doesn't get bored on the fourth screenshot, so there's no reason to skip it anymore.

It also matters more now. If you're not going to read every line of a change, the description is most of what you have to judge it by.

## The first line

Every PR I open starts with one line. It answers the question everyone has about code an agent wrote: is this a prompt turned into code, or did someone think it through? And it tells the reviewer what to look at.

::screenshot
---
src: /images/writing/prs/who-did-what.webp
alt: "The first line of four real pull requests, annotated in red. Each starts with 'Written by an AI agent on behalf of @HugoRCD'. The middle says what Hugo did: nothing added when he gave the task, 'following his spec', or 'who shaped the solution'. The end says '@HugoRCD has reviewed it', except the last, which says 'has not reviewed it yet'."
---
::

The middle changes with what I actually did. Nothing is added when I gave the task and approved the approach. "Following his spec" means I wrote the plan first, as an issue or a doc, so the spec deserves a review too. "Who shaped the solution" means we worked out the architecture and the trade-offs together, so the decisions are mine to defend.

The end says whether I've read it: "has not reviewed it yet" when it goes up, "has reviewed it" once I have. If it says I haven't, you're the first person to look at it, and you should review it that way.

It started with [Daniel Roe](https://roe.dev)'s [Using AI in open source](https://roe.dev/blog/using-ai-in-open-source): never let an LLM speak for you. The line is how I keep to that when it writes the PR.

## Evidence that fits the change

I keep my rules for agents in an `AGENTS.md` file. It's plain Markdown that most coding agents read before they start, either in a project or, for rules that apply everywhere, in your home folder. I covered how mine is organised in [How I Work With Agents Right Now](/writing/how-i-work-with-agents-right-now). The part about PRs starts with one sentence: a PR shows that the change works, it doesn't only say so.

What counts as showing depends on the change. A screenshot proves a layout and nothing about speed. A benchmark proves speed and nothing about a layout. So the rule is a table, not a template:

- **Something you can see:** the same page before and after, at the same size and the same crop. A short video when it moves.
- **A bug:** the same input on both sides, and what came out each time.
- **Faster or cheaper:** the same workload measured on both sides, more than once.
- **A command or a build:** its real output before and after, not retyped.
- **A new API:** the code someone would write to use it.

Here's what that gives on three PRs from October.

### A page

[nuxt.com #2502](https://github.com/nuxt/nuxt.com/pull/2502) turned the Nuxt showcase from a wall of website screenshots into a wall of logos, so you can tell at a glance which brands use Nuxt. The PR has eleven screenshots and two videos.

::screenshot
---
src: /images/writing/prs/ui.webp
alt: "The description of nuxt.com pull request 2502, annotated in red: the first line, a one-paragraph problem statement, the showcase page before and after at the same crop, the homepage logo row, and the page at phone width."
href: https://github.com/nuxt/nuxt.com/pull/2502
---
::

What makes it useful is that both sides of every pair are framed the same way: same section of the page, same size, same crop. When nothing else differs, the only change you see is the PR's. Then the homepage gets its own pair because the change reaches it, a phone width because that's where layouts break, and a video because a screenshot can't show a hover. Someone reviewing it can judge the design without checking out the branch.

### A bug

Nuxi, the assistant on nuxt.com, couldn't read what people pasted into it. Long pastes became attachments, the model only received a file path, and the tools that could open that path were turned off. So the most common debugging question, "here's my stack trace, what's wrong?", got an apology.

[nuxt.com #2501](https://github.com/nuxt/nuxt.com/pull/2501) fixes that. To show it, the PR asks both versions the same question about the same paste, and puts the two answers next to each other, copied word for word.

::screenshot
---
src: /images/writing/prs/bug.webp
alt: "The description of nuxt.com pull request 2501, annotated in red: the cause traced to the disabled tools, the same paste and question on both sides, the two real answers as a diff, a second bug visible in the same output, screenshots of both chats, and a testing note saying the tests were not run against the old code first."
href: https://github.com/nuxt/nuxt.com/pull/2501
---
::

Showing the real output pays off twice. You can check the fix yourself instead of trusting a summary. And the same output shows a second bug: production also labelled the stack trace as a YAML file. A paragraph saying "Nuxi can read pastes now" would have hidden both.

### Faster and cheaper

[nuxt.com #2521](https://github.com/nuxt/nuxt.com/pull/2521) moved Nuxi from Claude Sonnet 4.6 to Claude Haiku 5.5. Changing the model behind an assistant is the kind of change that's easy to make and hard to judge, so the PR measures it: the real agent, with its real tools, answering six typical questions, each answer graded against a rubric.

::screenshot
---
src: /images/writing/prs/faster.webp
alt: "The description of nuxt.com pull request 2521, annotated in red: a setting the gateway dropped silently, each fallback model tested on its own with one failing, the benchmark method, two runs of the new model, the result of 2.6 times faster and 12 times cheaper at the same quality, a second comparison of thinking effort, the limits of the test, and the ELI5."
href: https://github.com/nuxt/nuxt.com/pull/2521
---
::

The result is in one sentence: about 2.6× faster and 12× cheaper per answer, at the same quality. What makes it believable is around it. The new model runs twice, because one run can be luck. Each fallback model was also called on its own, and the old first fallback turned out to reject the new settings, so it would have failed the day it was needed. And a "Limits" section says what wasn't tested and what to watch after the deploy. Six questions is a small sample, and the PR says so before anyone has to ask.

## The ELI5

Every PR ends with an ELI5, short for "explain like I'm five": two or three sentences someone outside the project would follow. This is the one from [evlog #937](https://github.com/evloghq/evlog/pull/937), which removed duplicate fields from evlog's error responses:

> When a request fails, evlog sends a small JSON note back. It used to write the status number twice and the message three times under different names. Now it writes each one once.

The technical body is for the reviewer. The ELI5 is for everyone else: the person skimming the changelog, the maintainer of another project, me in six months. It's also a decent check. If the ELI5 doesn't make sense, the change usually doesn't either.

:link-card{description="24 September 2026" title="Ending every PR with an ELI5" url="https://x.com/hugorcd/status/2103190158053151108"}

## Keeping it honest

Evidence is only worth something if you can trust it, and an agent will happily produce something that looks like evidence. So a few rules sit next to the ones above:

- **"Before" is what's live.** Production, the base branch or the last deploy. Never a reverted or stashed copy made to look like it.
- **Look at every capture.** An agent can screenshot the wrong page with total confidence. It checks each image shows the change before using it.
- **No real data.** Demo or sanitised content only: no users, tokens or private messages in a screenshot.
- **Say what didn't happen.** #2501 says its tests were written with the fix and not run against the old code first. [#2523](https://github.com/nuxt/nuxt.com/pull/2523) says of its own result: "it hasn't been checked in a browser yet." It's one sentence, and it tells the reviewer exactly what to check themselves.
- **Security fixes are the exception.** A public PR is the wrong place for a working exploit. For those, the description stays short and the details wait until the fix is released.

## What it doesn't fix

A good description can sit on top of bad code. Evidence shows the cases someone thought to capture, not the ones nobody thought of. It doesn't replace tests, types, or someone who knows the codebase reading the parts that matter. And an agent that's confidently wrong in the code can be confidently wrong in the description too, which is why the honesty rules above exist.

What it does is move the PR from "trust me" to "check this". You know what was intended, who decided it, and what was actually seen working. That's enough to decide where to spend your attention, which is most of what reviewing becomes when you can't read everything.

It has a cost. The descriptions are longer, and most people won't read all of one, so the order matters: who did what, the problem in one paragraph, the evidence, then the details. Stop wherever you like, and you'll still know more than a title would tell you. The agent spends a few more minutes per PR, and I spend less of my review rebuilding what it already saw.

## Do the same

I didn't want to hand out my `AGENTS.md`. It's full of things that only make sense for me. So I turned the parts that work for anyone into a skill: a short file that tells an agent how to do one job, here writing a PR description. It covers the first line, the order of the description, the evidence for each kind of change, the honesty rules, and it shows you the description before anything is posted.

Install it with the [skills CLI](https://skills.sh):

```bash
npx skills add https://hugorcd.com --skill pr-writing
```

Add `-g` to install it for every project instead of only the current one.

An agent loads a skill when it decides the skill is relevant, which isn't always. To make sure it's used every time, add this to your `AGENTS.md`:

```md
## Pull requests

Before you open a pull request or write its description,
load the `pr-writing` skill and follow it.
```

Then read the skill and change what doesn't fit. It's a starting point, not a standard. If your team reviews differently, or your project has a PR template, adjust it until it describes how you want to work.

And if you don't use agents at all, the same checklist works by hand. It just takes longer.
