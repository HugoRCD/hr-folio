---
title: How I Redrew My Portfolio
description: I've just redesigned my portfolio. Here is every detail on it, where
  it comes from, and why it's there.
date: 2026-10-18
tags: [design, personal]
sheet: true
---

::sheet-head
# How I Redrew My Portfolio

I've just redesigned my portfolio. It used to be blue. It's red now, and almost everything around that red changed too.

Today we can make almost anything. Code is nearly free, and AI does the rest. I wrote about how I use it in [How I Work With Agents Right Now](/writing/how-i-work-with-agents-right-now). So what matters is what we choose not to make, and why we make the rest. Intention comes first.

I wanted this site to be beautiful: simple, not overdone, harmonious, made with taste. In [How a Tweet Changed My Life](/writing/how-a-tweet-changed-my-life), I wrote that every detail counts, including the ones nobody will consciously notice. So here is every detail of this one: what it is, where it comes from, and why it's there.
::

::sheet-section{id="red" numeral="I" label="The red"}
The site has one colour, and I wanted it to be my own: a red. The two reds I love most are Cartier's and Ferrari's, so I made mine from both.

:::sheet-entries
::::sheet-entry{term="Cartier" font="redaction"}
To me, Cartier is French excellence. Behind the name there's an amazing atelier, with the same idea of craft I try to put into my work. They make beautiful jewellery, and especially beautiful watches.

I love watches, and for years my dream watch was a Cartier: the Santos-Dumont. Louis Cartier made the first one in 1904 for his friend Alberto Santos-Dumont, an aviator who needed to read the time without letting go of the controls. It's one of the first wristwatches made for a man, with a square case and Roman numerals on the dial.

I bought mine when I joined Vercel. That role means a lot to me, and I wanted to mark it with something just as meaningful.

And Cartier's red is one of the most beautiful there is. You recognise it at a glance.
::::

::::sheet-entry{term="Ferrari" font="redaction"}
Ferrari is Italy, and passion. The factory, the speed, the most beautiful engines and cars. Its red is passion too, and you recognise it everywhere.

My father showed me Formula 1 on the weekends I spent at his place. It was the time of Michael Schumacher, already a legend. When you're a kid and you see those cars, fast and beautiful, you want them. That's how a passion starts.

I stopped watching during high school and my studies. I came back a few years ago, following Charles Leclerc, and Lewis Hamilton, at Mercedes and now at Ferrari. A lot came back with it. Ferrari is almost a religion: look at how many people gather for it. It's the F40. It's memories, desire, and a longing for the future.
::::
:::

The two reds have almost the same hue and the same intensity. Only the lightness is different: Cartier's is just a bit darker. So I mixed them in OKLab and kept the point halfway. Drag the needle, and the page's red follows.

:::red-viewer
:::

Halfway passes AA contrast on white and on black. Cartier's red alone doesn't, on black. It also has the same lightness as my old blue, so nothing on the pages looks heavier or lighter than before.

I use it like Cartier uses theirs, as a line: a rule, an underline, a numeral, a title, the ink of the signature. Never as a background.

:::sheet-note
Measured from the CSS each site ships: cartier.com, 11 Oct 2026; ferrari.com, 17 Oct 2026.

[OKLab](https://bottosson.github.io/posts/oklab/) is a colour space built around how we see colour.

On black, each red is lifted a little, as Ferrari lifts its own.

[Santos-Dumont](https://int.cartier.com/en/collections/watches/all-watches/santos-de-cartier-all/wssa0022-santos-dumont-watch.html), large model, steel. [Alberto Santos-Dumont](https://en.wikipedia.org/wiki/Alberto_Santos-Dumont), aviator.

[Michael Schumacher](https://en.wikipedia.org/wiki/Michael_Schumacher), [F40](https://en.wikipedia.org/wiki/Ferrari_F40).
:::
::

::sheet-section{id="type" numeral="II" label="The type"}
:::sheet-entries
::::sheet-entry{term="Redaction" font="redaction"}
Titles and numerals. It was inspired by legal briefs, and it gives these pages the voice of a document.
::::

::::sheet-entry{term="Geist" font="sans"}
The text.
::::

::::sheet-entry{term="Geist Mono" font="mono"}
Measurements, labels and code.
::::

::::sheet-entry{term="Hugo" font="signature"}
Mrs Saint Delafield, for the signature at the end of a page. A signature is a stamp, like on a document: it says I made this, and I stand behind it. AI is part of how I work now, so I want the human behind it to show.

I sign Hugo, not Hugo Richard. A surname puts a bit of distance. A first name is how you sign a letter to someone you know.
::::
:::

:::sheet-note
[Redaction](https://www.redaction.us): Jeremy Mickel and Forest Young, MCKL.

[Geist](https://vercel.com/font): Vercel.

[Mrs Saint Delafield](https://fonts.google.com/specimen/Mrs+Saint+Delafield): SIL Open Font License.
:::
::

::sheet-section{id="sheet" numeral="III" label="The sheet"}
The site is two things at once: a letter, and a drawing sheet.

:::sheet-entries
::::sheet-entry{term="The letter"}
A letter opens with where and when it was written, and it ends with a signature. This site does the same.

I don't write letters, and I think it's a shame we're losing them. Everything is instant now, there's no waiting, and text can be generated without end. A letter is the answer to that. You write it with an intention, you take your time, you send it, and you wait. It teaches you to care about how you write, and to be patient.

There's also something romantic about letters, like in a story. They run all through history, they've changed a lot of things, started passions and romances. I find that a very strong symbol.

When you visit this site, I'd like it to feel like receiving a beautiful letter: a good moment, a few things to take away from what I write, and the feeling that it was well made.
::::

::::sheet-entry{term="The sheet"}
A drawing sheet is where things are designed, measured, and redrawn until they're right. It's the workshop side of the site: craft and iteration. So every page is laid out like one, on the same plate of five columns.
::::
:::

:::sheet-plate
:::

:::sheet-entries
::::sheet-entry{term="The columns"}
On the left, the index, where the section numbers sit. In the middle, the text, never more than about 65 characters a line, so it stays easy to read. On the right, the notes and sources, like the margin of a drawing. Between them, two gutters of 48px.
::::

::::sheet-entry{term="The spacing"}
Ferrari's website spaces everything on one scale: 4, 8, 16, 24, 32, 48, 64, 96, 128. I took it as it is. Lines are 24px, gutters 48px, and sections sit 96px apart, which is four lines. Because every space is one of these steps, the page keeps the same rhythm from top to bottom.
::::

::::sheet-entry{term="The numbers"}
In the footer, or with the D key, you choose how far the drawing has gone: Fair copy, Scale, Grid, or Drawing, from a first sketch to a finished, measured sheet. The site opens at Drawing, because that's where there's the most to see.

At that level the measurements appear in the margins, the way they would on a real drawing: the width of each column, the size of each type, the 96 = 4 × 24 between two sections, the equation the ∞ is drawn from. Every size on the page was calculated, and these notes show the numbers.
::::
:::
::

::sheet-section{id="light" numeral="IV" label="The light"}
A letter is written somewhere, at some hour. So is this page: it's lit by the sun over wherever I am.

The light comes from photography. Light is what makes a good photo: on leaves, on flowers, on anything that reflects it. And time passing reminds me of the watch.

So the page keeps its time the way a watch does, with a movement. Pull the crown and turn it: the hands move, and the whole page takes the light of that hour.

:::crown-viewer
:::

Through the afternoon, the white turns to parchment. After sunset, the page becomes a violet dusk that gets darker until it's black. Before sunrise, the same in blue. Drag the needle, or run the whole day.

:::sun-viewer
:::

:::sheet-entries
::::sheet-entry{term="Contrast"}
Everything moves with the light. Each grey keeps the contrast it has at noon. The red moves along its band: towards Cartier's as the light falls, towards Ferrari's at dusk, back to halfway by day and by night.
::::

::::sheet-entry{term="The place"}
The city in the corner is real. I change it when I travel. A letter has to come from somewhere, and knowing where brings you a bit closer.
::::

::::sheet-entry{term="By hand"}
The dot in the footer switches to light or dark by hand. Press it again, and the page follows the sun. Under the page, the dot moves a lever in the mechanism, as the other buttons in the footer move their own parts.
::::
:::

:::sheet-note
[Photography](https://en.wikipedia.org/wiki/Photography#Etymology) means drawing with light.

The red never drops under 4.6&nbsp;:&nbsp;1, nor the text under 4.5&nbsp;:&nbsp;1.

The movement is drawn, not copied: a train of 80/10 · 75/10 · 84/7 and a 15-tooth escape wheel, for 21,600 beats an hour, the beat of the hand-wound 430 MC in my Santos-Dumont. Its 24-hour wheel carries the sun.
:::
::

::sheet-section{id="marks" numeral="V" label="The marks"}
:::sheet-entries
::::sheet-entry{term="I – VII" font="redaction-italic" red="true"}
Sections are numbered in Roman numerals, like the hours on my Santos-Dumont.
::::

::::sheet-entry{term="London," font="redaction-italic"}
A letter opens with where and when. Here the line is true: the date and hour are local to where I am, and that same place lights the page (IV).
::::

::::sheet-entry{term="H" font="signature" red="true"}
The H that opens my signature, alone at the top of every page.
::::

:::

:::sheet-note
[Gazette du Bon Ton](https://en.wikipedia.org/wiki/Gazette_du_Bon_Ton), nº 9, May 1924: the date comes first. Rijksmuseum, CC0.

A hand turned into a mark, as Ferrari's [Dino](https://en.wikipedia.org/wiki/Ferrari_Dino) badge was drawn from Alfredo Ferrari's signature.
:::
::

::sheet-section{id="underneath" numeral="VI" label="Underneath"}
Lift any corner of the page and it folds back. On a phone, tap the corner and the page turns over. Underneath is the working drawing of the page you were reading, and the mechanism that runs it. The idea comes from a page Vercel made, where you could peel back the surface and see the machinery.

:::sheet-entries
::::sheet-entry{term="The mechanism"}
Everything on the page that moves on its own sits over the part that moves it. The movement under the hour beats 21,600 times an hour, like the 430 MC in the Santos-Dumont I wear, so the page keeps time with a real watch. The buttons in the footer move their own parts. Under the ∞ is the barrel, which holds the mainspring and can only turn one way.
::::

::::sheet-entry{term="Fig. 1"}
The request. The page was rendered on a Vercel server and sent to you over the network. Your city, the edge that answered, the region that rendered it, and the shortest time light needs for the trip.
::::

::::sheet-entry{term="Title block"}
The sheet, the place, the time, and the revision.
::::

::::sheet-entry{term="Revisions"}
The last changes to the site, numbered from the first one.
::::
:::
::

::sheet-section{id="infinity" numeral="VII" label="Infinity"}
On the home page, my role at Vercel reads 2025, and then, where the end date would be, an infinity sign. It's the mark I care about most.

:::sheet-entries
::::sheet-entry{font="infinity"}
A commitment. I joined Vercel in 2025, and it's where I want to stay. I don't want to change companies.
::::

::::sheet-entry{term="Vercel"}
Vercel has a lot in common with Cartier and Ferrari: excellence, design, and speed. It's what I love in them, but in my world, in tech, today.
::::

::::sheet-entry{term="Iterate to Greatness"}
One of Vercel's values. Ship fast rather than wait for perfect, make sure everything works, then keep making it better. evlog grew up that way, and it's how I want to work. I don't drop projects: I give them time and push them all the way, so the people using them know someone is behind them.
::::

::::sheet-entry{term="The impact"}
What I build at Vercel, like what I built at NuxtLabs before, is used by hundreds of thousands of people, sometimes millions. Each time, I'm adding my stone to a building that's still going up. That's why I want to stay, and keep adding to it.
::::
:::

This site works the same way. It isn't finished, and it won't be. I'll keep iterating on it.

:::sheet-note
The mark is drawn, not typed: a [lemniscate of Bernoulli](https://en.wikipedia.org/wiki/Lemniscate_of_Bernoulli), tilted 12° like a hand would write it.

[Iterate to Greatness](https://vercel.notion.site/Vercel-s-Values-Interview-e24f2ffeea734e6eade4569e46ba2573): "Iterate" is not launching late, "to Greatness" is uncompromising quality.
:::
::
