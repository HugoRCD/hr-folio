---
title: How a Tweet Changed My Life
description: From a layoff in Nice to Vercel in London, by way of Nuxt. The story
  of a tweet posted on a Tuesday morning in December, and of everything that
  made it work.
date: 2026-09-01
tags: [career, personal, nuxt, open-source]
---

# How a Tweet Changed My Life

On December 17, 2024, at 10:12 in the morning, I posted a tweet.

Nothing special. Three sentences, a sweating emoji, a green heart. I was looking for a Nuxt internship to finish my degree, I couldn't find one, and a friend had just told me over coffee: "Why don't you just post something on Twitter?"

Two weeks later, I was working on Nuxt. Six months later, I was joining Vercel. A year later, I was living in London.

## One week, at fourteen

It starts with a work-experience week. In France, around fourteen, you spend a week shadowing an adult at their job. A family friend was a developer, so I spent mine with him. That's where I wrote my first HTML pages.

I don't know how to explain what it does to you, at that age, to watch something appear on a screen that you built out of lines of text. You type, and something exists that didn't before. I never really stopped after that.

As a teenager I touched a bit of everything. A lot of cyber-security at first. Then, like a lot of people, I wanted to make some money. The year I turned eighteen, in 2019, I started building websites as a freelancer. WordPress first, then hand-coded sites, in almost pure HTML, with a bit of PHP for templating so I could reuse chunks of pages. I didn't have the word for it yet, but I was already looking for components.

## A coding school, a company, and Vue

After high school I knew I wanted to be a developer, so I went to [Epitech](https://www.epitech.eu), a coding school in France. Internships start in year one, and I landed at a company running on PHP and [Vue](https://vuejs.org).

It was the first time I saw real PHP, MVC, a production codebase. But mostly, it was the first time I saw Vue. This was the Options API era, the [Composition API](https://vuejs.org/guide/extras/composition-api-faq) didn't exist yet. And still, it was completely obvious. The way code *should* be written was right there in front of me. I wanted to rewrite everything in the company. I didn't have the skills yet, but I'd fallen in love with the ideas.

I stayed at that company for a little over three years, on a work-study program alongside school.

## Nuxt 3, or: Lego

I'd tried Nuxt before version 3, and I didn't get it. Why was there a dev server *and* my app? What was it giving me? I gave up and stayed on Vue.

Then [Nuxt 3](https://nuxt.com/blog/v3) came out. [Modules](https://nuxt.com/modules), [layers](https://nuxt.com/docs/getting-started/layers), composability, the new branding. Everything fit together, and it was beautiful. And something clicked that goes back way before code.

As a kid I spent years on Lego. I still love it. I've always been someone who likes to build, and to build *well*. Nuxt is exactly that: bricks. You make a module, a composable, a layer, and you reuse it in the next project. After one project, the second one goes faster. After ten small projects, you can build a big one much faster. Nuxt is Lego. That's why I never left.

From that moment on, I built every school project in Nuxt, whenever I could. School often wanted us to try different languages, different stacks, so I asked. Explicitly, every time: can I do this one in Nuxt? I wanted to get better at it, and I already knew it was what I wanted to do later. It became an obsession.

And I loved going further than the brief. More concepts, more features, more bricks I could reuse in the next project. One of the first was [Helpr](https://helpr.hrcd.fr), a full-stack [Zapier](https://zapier.com)-like. You create triggers, you chain reactions, you build workflows. It was a big application for the level I had at the time, and I poured hours and days into it.

But the ambitious part was somewhere else. This was the very beginning of ChatGPT, the [OpenAI API](https://platform.openai.com) meant the davinci models, and there was no such thing as structured output. Today, with the [AI SDK](https://ai-sdk.dev), you hand the model a [Zod](https://zod.dev) schema and say "give me exactly this back". Back then, none of that existed. And I still got it to work, more or less: you described the workflow you wanted, in plain English, and Helpr generated it for you. Trigger, reactions, the whole thing.

Then there were the small AI touches sprinkled on top. The one that impressed people most, and me, was this: an email lands in your Gmail, and Helpr drafts the reply. Nothing special today. But it needed a prompt so the system knew what kind of draft to write, and I'd even added a button to improve that prompt for you. Small things, and every one of them felt like *this is the future*.

An AI-native Zapier, in 2023. Looking back, it was ahead of its time. Maybe I should have kept going, actually.

## Selling, then giving

Towards the end of my freelance years I had the idea everyone has: build templates and sell them. A little store, a few products, passive income.

It didn't work, and more importantly it wasn't what I wanted. I was getting closer and closer to the Nuxt ecosystem, which has this philosophy where you *give* the code away. So I tried.

I built my first modules. Then I built [Canvas](https://canvas.hrcd.fr), my first Nuxt portfolio template. It did well, it got listed on [nuxt.com](https://nuxt.com/templates) and then on [Nuxt Studio](https://nuxt.studio). And it's the first time [Sébastien](https://x.com/Atinux), the creator of Nuxt, sent me a DM.

You have to understand where I was at that point. I was a fan. Not a casual one. And here was the person who built the thing I'd been obsessing over for two years, writing to me about something I'd made.

It's only later that I understood what that moment really was: a foot in the door. The first time I felt like I was starting to belong to something. I think almost everyone in the Vue and Nuxt community has a version of that moment, and I don't think it's a coincidence.

Two months later, at the end of February, I started [Shelve](https://shelve.cloud).

Originally Shelve was tiny. [Vercel](https://vercel.com) was too expensive for me to use with a team, and I just wanted the equivalent of [`env pull` / `env push`](https://vercel.com/docs/cli/env) to share environment variables. A weekend project, on paper.

But every time I start something, I go too far. And this time, I went further than ever, because something else was happening at the same time.

I was arriving on [Twitter](https://x.com/hugorcd). Not just to post, but to watch. I'd started following design Twitter, the people who ship screen recordings of a hover state, a transition, a loading animation, and get thousands of likes for it. [Fey](https://fey.com) was the one that stuck with me. The level of detail in that app was absurd, and I couldn't look away. [Linear](https://linear.app) was the other obvious one, the reference everyone was chasing for design. And [Raycast](https://www.raycast.com), for something different: not how it looked, but how it felt to use. The interactions, the speed, the DX.

That's the first time I understood the word *craft*. Until then, code was lines and ideas. Something works or it doesn't, and you move on. Suddenly it was closer to sculpture. You're carving something out of rock, and every detail counts, including the ones nobody will consciously notice.

Shelve is where I put all of that. A full-stack Nuxt app with [Nitro](https://nitro.build) behind it. Branding I did by hand. A caching layer I actually thought about. A CLI. GitHub sync. Every empty state, every transition, every error message, considered. I gave myself to that project in a way I hadn't before, and over time it became my reference for what a good Nuxt project looks like. A blueprint I still hand to people who want to build good apps.

And I was showing it. That's the other thing that started with Shelve. I posted everything: screenshots, animations, modules, templates, my first npm packages. Every small win, every new brick. [Daniel](https://bsky.app/profile/danielroe.dev) started following me. Sébastien too. He'd like a post here and there, and every time, it felt like a lot.

And of course, nothing took off. Ten likes, sometimes fewer. It's hard to keep posting when nobody answers. I kept going anyway.

## September 2024

A little over three years after I joined, the company let me go. It's September 2024.

I find myself with a bit of money, because in France you get support in that situation, a lot of time, and a school telling me it's fine if I don't find a new placement right away.

So for four months I work flat out. On Shelve, on my side projects, and I post everything I make. I push hard, because I tell myself I might never get a window like this again, at this age, to do it.

But you can't live on severance forever. At some point money has to come from somewhere, and I could see it getting complicated. And I like working with a team, being around people.

So I look. Companies doing Vue, doing Nuxt, doing what I love, in France. And I find nothing. LinkedIn goes nowhere. Everyone is hiring [React](https://react.dev) developers. A month and a half goes by like that.

## The coffee

One day I'm at a café with a friend. He's talking about everything I'm doing on Twitter, and he says: "Why don't you just post something on Twitter?"

Writing it down, I realise how dumb it sounds. But that's what happened. I hadn't thought of it, or hadn't dared, I don't remember. I tell myself: either way, I've got nothing to lose.

So I post [this](https://x.com/hugorcd/status/1868962514861785234):

::screenshot
---
src: /images/writing/tweet-nuxt-internship.png
alt: "The tweet: Looking for a @nuxt_js position for my final internship and wow - they're hard to find! Feels like everyone's hiring React devs. Curious: how many of you are actually using Nuxt at work?"
href: https://x.com/hugorcd/status/1868962514861785234
---
::

And then I get a message from Sébastien.

One question: "What are the dates of your internship?"

I answer right away, without really understanding what's happening. I give him the dates. He replies with a Google Meet link.

My hands were shaking when I clicked it. The creator of Nuxt, the person whose work I'd been studying for two years, was about to get on a call with me. I had no idea, that day, that I was looking at the moment my life would split in two.

We talk for an hour. The kind of call where everything makes sense, where you feel like the person in front of you already knows what you're about. And at the end, he says it: "OK, you're in."

On January 6, 2025, I start at [NuxtLabs](https://nuxtlabs.com).

## Six months at NuxtLabs

I meet the team. I start by working only on [Nuxt UI](https://ui.nuxt.com), and a good part of what I did in those first months ended up in [Nuxt UI v4](https://nuxt.com/blog/nuxt-ui-v4), the release that merged Nuxt UI and Nuxt UI Pro into a single library.

Getting paid to do open source is the best job in the world. I mean it. You build things that have impact, people take you seriously, they give you feedback. And for a developer, feedback is everything: being told whether what you make is good or not. So when on top of that the feedback is "I love what you're doing", it's a kind of fuel I'd never felt before.

Then, at the end of February, NuxtLabs' designer left. Suddenly there was no designer, and I stepped into the gap. Figma, the brand, the landing pages, everything visual on the Nuxt front. I loved every second of it. I was the one implementing [the new nuxt.com landing page](https://nuxt.com), and I remember the feeling of shipping something that millions of people would see. This wasn't a side project anymore. This was the front door of Nuxt.

In March, [Vue.js Amsterdam](https://vuejs.amsterdam). I see the whole team in person for the first time. It's also my first tech conference, and I find myself speaking English, surrounded by the Vue and Nuxt community I've loved for years. I'd been calling this a dream for years. It stopped being the right word around then.

And Twitter, meanwhile, starts to take off. More and more people know what I do, like it, support me. Some of them were there when my posts got six likes, and they're still here today. I notice. Thank you.

Over the months that followed, my role kept drifting outward. AI was becoming impossible to ignore, and I was getting pulled towards it: agent workflows, [MCP](https://modelcontextprotocol.io), what it means for a framework to be usable by an AI. I did less Nuxt UI and more of everything else. [Nuxt Studio](https://nuxt.studio), [Docus](https://docus.dev), the overall story of Nuxt and AI. A satellite role, in a way, and one I only got because the team trusted me to go and find the next thing.

## "We're joining Vercel"

A month or two after Amsterdam, Sébastien talks to us. Privately first, then all of us: Vercel is acquiring NuxtLabs, and we're joining Vercel.

I need to explain what that meant to me.

During my studies, when I imagined what came next, there were three branches. Start my own project, my own company. Join a product I love, at the time [Linear](https://linear.app), [Raycast](https://www.raycast.com), [Vercel](https://vercel.com), the kind of company that makes a developer dream with its design and its DX, and that I'd been using for years. Or the one I wanted in my gut: work on Nuxt.

And right there, two of those three branches had just merged. I was going to work on Nuxt, *at* Vercel.

I'd already run out of the word "dream" in Amsterdam. I still don't have a better one for this.

The months that followed were a lot. Contracts, visas, paperwork, and one decision bigger than the rest: joining Vercel meant leaving Nice and starting everything over in London. I'd wanted to live abroad for a long time, so it wasn't a sacrifice. It was the excuse I'd been waiting for. I don't regret it for a second.

At the end of June, I graduate. On July 8, 2025, ten days later, [the announcement goes public](https://vercel.com/blog/nuxtlabs-joins-vercel), and I walk into Vercel. I finished school one week and started at Vercel the next.

## Making your own luck

So yes, a tweet changed my life. But if you take one thing away from all this, I'd like it to be this.

It was luck. I'm not going to pretend otherwise. But I think everything in life rests a little on luck, and that's not a bad thing. It doesn't mean you're *a lucky person*. It means you have to make your luck.

If you want to go far, you have to multiply the entry points. The more you post, the more you show, the more you build in public, the more doors you create that luck can walk through. For years, every one of those doors stayed shut. Ten likes. Six likes. And one day, everything lines up.

Jason Roberts has a name for this, and [his post about it](https://www.codusoperandi.com/posts/increasing-your-luck-surface-area) is worth five minutes of your time.

::quote{author="Jason Roberts"}
Luck surface area: the amount of luck you get is proportional to what you do, multiplied by how many people you tell about it.
::

The December tweet didn't work because it was well written. It worked because Sébastien and Daniel were already following me. Because they'd seen Canvas, Shelve, the modules, the screenshots, the animations, the hundred posts with six likes. By the time I asked, the answer had been building for two years.

You can be the best developer on the planet (not saying I am, but you get the idea). If nobody sees your work, it doesn't exist. Not to the people who could change something for you.

What happened after that deserves its own article. It's called *One year at Vercel*, and it's coming next.
