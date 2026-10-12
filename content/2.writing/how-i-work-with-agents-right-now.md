---
title: How I Work With Agents Right Now
date: 2026-10-12
description: Which agents I use in October 2026 and for what, the skills they share, and the few rules that keep them from acting in my name.
tags:
  - agents
  - ai
  - workflow
  - open-source
---

# How I Work With Agents Right Now

About once a month, someone asks me which agent I use. Codex or Claude Code? Which model? What does my setup look like?

The honest answer is "several, and it changes". Here's what it looks like in October 2026. It isn't a recommendation, just what's on my machine, why it's there, and the few rules that held up.

## Why I use so many

I work at [Vercel](https://vercel.com) and spend a lot of my time on [Nuxt](https://nuxt.com) and its ecosystem. In both, a growing part of the job is agents: the ones developers code with, and the ones that run on their own.

That means checking that Nuxt works well with agents, whether a developer writes Nuxt with one or an agent writes it alone. It means building with what Vercel ships for agents, like the [AI SDK](https://ai-sdk.dev), [Workflow](https://useworkflow.dev), [Sandbox](https://vercel.com/docs/vercel-sandbox) and [eve](https://eve.dev), and sending feedback on it. And it means my own open source, mostly [evlog](https://evlog.dev) and the [MCP Toolkit](https://github.com/nuxt-modules/mcp-toolkit), plus smaller packages like [GitHub Tools](https://github-tools.com).

None of that works if I only know one agent. I have to use the ones people actually use, with the models they actually pick. So I try a lot, and I keep what earns its place.

## The terminal

[Starship](https://starship.rs) for the prompt: branch, runtime version, how long the last command took, and nothing more. [Vite+](https://viteplus.dev) for global tools, agents included, so there are no more two copies of the same CLI fighting over my `PATH`:

```bash
vp install -g @openai/codex@latest
```

And [Rex](https://www.superlogical.com/rex), the new terminal from [Superlogical](https://www.superlogical.com), Mitchell Hashimoto's company, which I'm trying right now. It's instant, and when I quit and reopen it, my sessions are still there, which matters a lot with agents that run for a long time. Its [Program Status Protocol](https://www.superlogical.com/rex/docs/build/program-status) also lets an agent tell the terminal it's working, waiting for me or done.

## The orchestrators

Strictly speaking, these aren't agents. They're where I run them: the app or CLI around the model, with its tools, its context and the loop. That's the part I actually choose.

When I'm building a feature, I still use **[Cursor](https://cursor.com)**. I need an editor for that: see the generated code, move around the files, fix small things by hand. Ask mode is great for prototyping before I pick an approach.

**[Codex](https://developers.openai.com/codex/app)** is what I'm testing most right now. The app is very well made, and its [computer use](https://www.macstories.net/notes/openais-new-codex-app-has-the-best-computer-use-feature-ive-ever-tested/) is the best I've tried. I use **[Claude Code](https://claude.com/claude-code)** a little, with a subscription from the [Claude for Open Source](https://claude.com/open-source-max) programme, mostly from Raycast.

Because **[Raycast AI](https://www.raycast.com/ai)** is where I spend most of my time. After almost five years of Raycast, it already matches my shortcuts and the way I think. When an idea comes up in Slack or I need a quick fix, I open a chat and start there. I won't spoil the rest, but something might be coming on [Raycast's YouTube channel](https://www.youtube.com/@raycastapp) soon.

And when I'm already in the terminal, **[fx](https://fx.sh)**. I press ⌘D to split the terminal, start fx in the new pane right next to what I'm doing, ask for what I need, and the agent is on it a few seconds later. It's minimal, it looks good, it's simple to use, and the connectors just work. It's just very practical.

So there's no single answer to "which agent?". It depends on the task, and on where I already am.

## Cleaning up

A few weeks ago I realised I had config files everywhere: one instruction file per tool, skills copied into a dozen folders, old rules contradicting newer ones, and folders left over from before the skills CLI. I no longer knew what my agents were reading.

So I deleted most of it and started again. I do that now and then, and I think it's worth doing. These files are real technical debt: a rule written for last year's model is still loaded into every request, and newer models need far less guidance than the ones we wrote it for. Anthropic [removed over 80% of Claude Code's system prompt](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models) for its latest models, and found its own `CLAUDE.md` files and skills were overconstraining Claude, sometimes with rules that contradicted each other. An [ETH Zurich study](https://arxiv.org/abs/2602.11988) found that context files don't generally make agents more successful, and add over 20% to the cost. Addy Osmani makes a similar case in [Stop Using /init for AGENTS.md](https://addyosmani.com/blog/agents-md/).

What's left is one folder, `~/.agents`. It holds a single `AGENTS.md` with my rules, plus every skill, and it's the only place I edit. The rules file comes from a private git repo, so every change has a history.

[AGENTS.md](https://agents.md) is the format most agents read now, but each tool looks for its instructions somewhere else. So instead of a copy per tool, each one points back to that file:

```bash
~/.claude/CLAUDE.md   # Claude Code: one line, @~/.agents/AGENTS.md, which imports it
~/.codex/AGENTS.md    # Codex: a symlink to ~/.agents/AGENTS.md
Cursor, Raycast       # one line in their user rules: "read ~/.agents/AGENTS.md and follow it"
```

I change a rule once, and every agent picks it up in its next session.

A Raycast automation runs every Monday to keep it that way. It updates third-party skills, flags broken links and duplicates, and over time shows me which skills I, or my agents, actually use.

## Skills

They live in `~/.agents/skills`, installed with the [skills CLI](https://skills.sh), and come from two places.

**From the people who build the tools.** That's what I like most about the [open skills ecosystem](https://vercel.com/blog/introducing-skills): the best skill for a library is usually written by its maintainers. I use pretty much all of [Vercel's skills](https://github.com/vercel-labs/agent-skills), quite a few Nuxt ones, and the [evlog skills](https://evlog.dev/getting-started/agent-skills), since I wrote them. I also really like what [Emil Kowalski](https://emilkowal.ski) does with his [design engineering skill](https://github.com/emilkowalski/skill).

For me, that's what a skill is: taste in a file. How someone who knows a tool well would use it, written down so an agent can follow along.

**My own**, and there are a lot of them. Some are public in [my portfolio repo](https://github.com/HugoRCD/hr-folio/tree/main/skills), most are private. The private ones I find most interesting are voice skills for X, mail, Slack and long-form, built from things I actually wrote. They're not there to write and publish for me. What I like is what they unlock. First, iterating: I can get a lot of versions of an idea, which inspires me far more than a blank page, as long as I don't just take what's offered. Then, stepping back. When you work alone, it's hard to look at what you're doing from the outside, and agents are very good at giving you that distance. And when a new model comes out, I give it the same early prompts, like a long-form post I'll never publish, just to see how it reacts. You get a real feel for each model, which ones you click with, and how far they've come since what you tried a year ago.

One detail: Claude Code gets one symlink per skill, not one for the whole folder, so the skills the Claude app writes into `~/.claude/skills` don't leak into every other agent.

## Nothing in my name

Agents acting on their own are fine. [Evi](https://github.com/evloghq/evlog) maintains evlog, I'm testing [Grok Bot](https://x.com/bot) for background work, and everyone can see an agent did it.

Local work is different. When I'm talking to an agent in an editor or a chat, anything it does on GitHub or Slack looks like it came from me. So the first rule is:

> Don't commit, push or post anything in my name unless I ask for it in the current conversation.

Agents prepare everything, then show it to me and stop. And "commit" doesn't mean "push".

When a PR goes out, the description starts with:

> Written by an AI agent on behalf of @HugoRCD. @HugoRCD has not reviewed it yet.

The middle of that line changes: "following his spec" if I wrote the spec, "who shaped the solution" if we worked out the design together, nothing if I only gave the task. A reviewer knows straight away whether it's a prompt turned into code or a design someone thought through. Once I've reviewed it, it becomes "Written with an AI agent. Reviewed by @HugoRCD." No `Co-Authored-By` trailers, no footers.

A lot of this comes from [Daniel Roe](https://roe.dev)'s [Using AI in open source](https://roe.dev/blog/using-ai-in-open-source), which has aged very well: "never let an LLM speak for you" and "never let an LLM think for you".

## Amend, don't push

I work in monorepos a lot, and many of them deploy several apps on Vercel. Every push can start a build per app, and with loose build settings it rebuilds apps the change never touched. An agent that pushes after every small fix turns one PR into dozens of builds, and you find out on the bill.

So my agents commit locally, amend as they go, and push once when it's ready, with `--force-with-lease`, never `--force`. For bigger tasks, I'd rather get [stacked PRs](https://docs.github.com/en/pull-requests/tutorials/stack-code-changes-in-pull-requests): small layers that I, or another agent, can review one at a time.

## Show me, don't tell me

This is where I want my setup to go next. It's only partly there today.

When an agent says it fixed something, I want to see it. Most of my review time goes into picturing what the agent already saw. So every PR should come with evidence that fits the change:

- **UI:** screenshots before and after, or a short video for an interaction.
- **CLI:** the real output of the same command, before and after.
- **A feature or a proposal:** the API it adds, written as the code someone would use, before any implementation.
- **Anything else:** a small HTML page comparing both versions, a diagram, a table.
- **Always:** a short ELI5 at the end.

:link-card{description="24 September 2026" title="Ending every PR with an ELI5" url="https://x.com/hugorcd/status/2103190158053151108"}

Some of it already works. [Evi](https://github.com/evloghq/evlog), built on [eve](https://eve.dev), captures production and the preview whenever it touches the docs, and puts both in the PR with [before-and-after](https://github.com/vercel-labs/before-and-after) from Vercel Labs. What I want now is for that to be what every agent in my setup does by default.

:link-card{description="25 September 2026" title="Evi opening a PR with a before/after" url="https://x.com/hugorcd/status/2103530137321189532"}

## For now

So, Codex or Claude Code? Whichever fits what I'm doing, and the answer will keep changing. What lasts is everything around them: one file of rules, skills written by people with taste, and agents that show their work instead of describing it.

None of it makes agents smarter. It makes them predictable, and that's most of what I want: work I can trust without redoing it.

Keep it small, delete what you stop using, and look at it again when a new model lands. Ask me in six months and half of this will have changed. I hope so.
