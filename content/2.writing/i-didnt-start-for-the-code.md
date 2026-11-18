---
title: I Didn't Start for the Code
description: A thought from the other evening about AI, the fear that comes with
  it, and the page of HTML experiments that got me started when I was thirteen.
date: 2026-11-18
tags: [personal, career, ai]
---

# I Didn't Start for the Code

I've been thinking about AI a lot lately, like most developers I know, and mostly about the fear that comes with it: that we'll lose our jobs, that we won't really write code anymore, that this job won't be what it used to be. I feel some of that too.

But the other evening, my mind went somewhere else. I was thinking back to the first thing I ever put on the internet, and I realised that typing lines of code was never really why I started.

## A page of experiments

I was somewhere around thirteen. It wasn't really a website, just a page where I tried things: every HTML tag I could find, one after the other, just to see what each one did, too many images, and a lot of CSS, mostly for small effects.

When I opened it in Chrome, it did more or less what I wanted, which already felt like a lot. Then I managed to put it online, and it was just there, at a URL anyone could open, with all its images and all its pointless effects.

I still don't know how to describe that feeling properly. I tried once, in [How a Tweet Changed My Life](/writing/how-a-tweet-changed-my-life), and didn't really manage it then either. The closest I can get is that for the first time, something I'd made existed outside of my computer. Nobody had asked for it and it served no purpose, but it was mine.

That feeling is what made me keep going. Then came my first Python script, my first portfolio, the first things I automated with code, and with them a constant stream of ideas: things I wanted to try and tools I wanted to build, far more than I could ever finish. Most of them stayed ideas, because each one meant learning something new first, and there was always more to learn than time to learn it.

When I look at the road from that page to today, I'm really proud of it. I've made things I never thought I'd be able to make, like [Shelve](https://shelve.cloud) and [evlog](https://evlog.dev), and some of what I've built is used by tens of thousands of people, maybe more. I also get to work on [Nuxt](https://nuxt.com) and on a lot of projects at [Vercel](https://vercel.com), which reach far more people than anything I'd build on my own.

I love code. I like reading it, I like it when it's well made, and I still care about the details nobody will consciously notice. But I didn't start for the code. At thirteen, what I loved was that the page existed, that anyone could open it, and that everything on it was there because I'd put it there.

## What AI changed

AI has changed a lot about how I work. I write much less code by hand than I used to, and most of my work is now closer to deciding, reviewing and checking: what should exist, whether the agent understood it, and whether the result is actually good. I've written about how that works day to day in [How I Work With Agents Right Now](/writing/how-i-work-with-agents-right-now) and [What My Pull Requests Look Like Now](/writing/what-my-pull-requests-look-like-now), so I won't go through it again here.

evlog is the clearest example. I started it in January, and its scope today is enormous: integrations for most of the frameworks people actually use, a CLI, a GitHub Action, audit logs, and an agent, Evi, that helps maintain it. Part of that comes from the people who contribute to it. But a big part comes from working with a lot of agents. I couldn't have built all of that on my own in ten months, at the quality I wanted.

What I didn't expect is how much it would teach me. When I started evlog, observability was mostly new to me. I had a vision, a lot of experience building developer tools, and a bunch of tokens.

Building it with agents, I learned how tracing works, what tools like Datadog and Sentry actually do, the problems they solve, where they fall short and what they've struggled with over the years, and how the whole OpenTelemetry stack fits together, down to OTLP. It also pushed things I already knew well, like `AsyncLocalStorage` and `waitUntil`, much further than an app ever needs to, because a library has to make them work on every runtime it supports. Today I know far more about observability than I did in January.

And it's more than just volume or learning. Agents let me iterate. I can try several versions of something instead of keeping the first one that works, throw away what isn't good enough, and keep going until it is. The quality of what I ship has gone up.

I keep thinking about that pile of ideas from when I was a kid, the ones that stayed ideas because there was too much to learn first. A lot of them would take a weekend today.

## Making things

Some of the fear is fair, and I don't want to wave it away. Jobs are changing, some of them a lot, and I don't think anyone knows yet how it will land for people who are just starting. But the part that made me start doesn't seem to be going anywhere. Someone still has to decide what's worth making, care about the details, and understand the code well enough to see when an agent gets it wrong. In [How I Redrew My Portfolio](/writing/how-i-redrew-my-portfolio), I wrote that when almost anything can be made, intention comes first. I think that's the part of this job that stays.

[Guillermo](https://x.com/rauchg) has written about this a lot, and this one is close to what I mean:

::quote{author="Guillermo Rauch"}
The coolest thing about the recent wave of AI is that everyone is excited about building. […] The people want to create and ship, not just consume.
::

I think about the kids who are thirteen right now. Most of them will never type every HTML tag by hand just to see what it does, and that's fine. They'll describe what they want, watch it appear, and put it online at a URL anyone can open. I hope it feels the way my page did.

So I'm choosing to be optimistic. I wanted to make things when I was thirteen, I still do, and these days I can make more of them than I ever could.
