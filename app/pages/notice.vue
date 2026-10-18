<script setup lang="ts">
// Sheet 2: the notice that comes with the drawing. What each mark on the first sheet is, where it
// comes from and why it is there. Reached from the title block under the page, not from the nav.

useSeoMeta({
  title: 'Notice',
  description: 'How this sheet is drawn, and why.',
})
defineOgImage(false)
useRobotsRule(false)

const COLUMNS = [
  { w: 224, name: 'Index' },
  { w: 48 },
  { w: 528, name: 'Measure' },
  { w: 48 },
  { w: 176, name: 'Notes' },
]
const SHEET = COLUMNS.reduce((sum, c) => sum + c.w, 0)
</script>

<template>
  <div class="flex flex-col gap-12 sm:gap-16 lg:gap-24">
    <header class="flex flex-col gap-4">
      <div class="flex flex-col gap-0.5">
        <h1 class="font-redaction text-lg">
          Notice
        </h1>
        <p class="font-serif text-xl font-medium text-primary">
          How this sheet is drawn
        </p>
      </div>
      <p class="copy">
        Sheet 2 of the drawing: what each mark on the first sheet is, where it comes from, and why it is there.
      </p>
      <p class="copy">
        Hugo designs and he builds. The sheet borrows from two houses known for both: Cartier for the hand, the drawing and its restraint; Ferrari for the machine, its precision and measure.
        Nothing is copied. What is taken is how each holds back, read from their own websites: Cartier's red is almost never text, it draws rules and underlines; Ferrari sets its type in two weights and spaces everything on one scale.
      </p>
    </header>

    <section id="red" class="relative">
      <SectionMark numeral="I" label="The red" />
      <p class="copy lead">
        One red, made from both. Cartier's and Ferrari's share a hue and a chroma; only their lightness differs. Mixed in OKLab, halfway between them is the red of this site.
      </p>
      <NoticeRed />
      <p class="copy mt-8">
        Halfway passes AA on white and on black, and weighs what the blue it replaced weighed (OKLab L 0.54). Cartier's red alone falls short on black.
        It is used as a line: a rule, an underline, a numeral, the ink of the signature. Never as a ground, except underneath the page.
      </p>
      <aside class="in-note note">
        <p>Drag the needle: the page's red follows.</p>
        <p>On black each red is lifted by 0.054 L, as Ferrari lifts its own.</p>
        <p>Measured from shipped CSS: cartier.com, 11 Oct 2026; ferrari.com, 17 Oct 2026.</p>
      </aside>
    </section>

    <section id="type" class="relative">
      <SectionMark numeral="II" label="The type" />
      <dl class="entries">
        <div class="entry">
          <dt class="font-redaction text-base text-highlighted">
            Redaction
          </dt>
          <dd>Titles and numerals. Drawn for legal briefs, it gives the sheet a documentary voice.</dd>
        </div>
        <div class="entry">
          <dt class="font-sans text-base text-highlighted">
            Geist
          </dt>
          <dd>The text.</dd>
        </div>
        <div class="entry">
          <dt class="font-mono text-sm text-highlighted">
            Geist Mono
          </dt>
          <dd>Measurements, labels and code.</dd>
        </div>
        <div class="entry">
          <dt class="font-signature text-3xl leading-6 text-[#901112] dark:text-[#E1342D]">
            Hugo
          </dt>
          <dd>Mrs Saint Delafield. The signature, once per page, at the close.</dd>
        </div>
      </dl>
      <aside class="in-note note">
        <p>Redaction: MCKL, 2019.</p>
        <p>Mrs Saint Delafield: SIL Open Font License.</p>
      </aside>
    </section>

    <section id="sheet" class="relative">
      <SectionMark numeral="III" label="The sheet" />
      <p class="copy lead">
        A drawing plate in five columns: the index, a gutter, the measure, a gutter, the notes. Every page is laid on it.
      </p>
      <figure class="plate" aria-label="The five columns of the sheet">
        <div class="dim">
          <span>{{ SHEET }}</span>
        </div>
        <div class="flex">
          <div v-for="(c, i) in COLUMNS" :key="i" class="col" :class="{ gutter: !c.name }" :style="{ flex: c.w }">
            <span class="w">{{ c.w }}</span>
            <span v-if="c.name" class="name">{{ c.name }}</span>
          </div>
        </div>
      </figure>
      <dl class="entries mt-8">
        <div class="entry">
          <dt>Rhythm</dt>
          <dd>Lines of 24px. Sections stand 96 = 4 × 24 apart; both are steps on Ferrari's spacing scale.</dd>
        </div>
        <div class="entry">
          <dt>Detail</dt>
          <dd>Fair copy, Scale, Grid, Drawing: how much of the construction shows. In the footer, or the D key.</dd>
        </div>
      </dl>
    </section>

    <section id="light" class="relative">
      <SectionMark numeral="IV" label="The light" />
      <p class="copy lead">
        A letter is written somewhere, at some hour. So is this sheet: it is lit by the sun over the place in its dateline.
        It dims as the sun goes down: through the afternoon the white turns to parchment, and after sunset the page is a violet dusk that deepens into black. Before sunrise the same in blue, the other way.
      </p>
      <ClientOnly>
        <NoticeSun />
        <template #fallback>
          <div class="sun-space" />
        </template>
      </ClientOnly>
      <p class="formula mt-10">
        sin <i>h</i> = sin <i>φ</i> sin <i>δ</i> + cos <i>φ</i> cos <i>δ</i> cos <i>H</i>
      </p>
      <p class="copy mt-3 text-xs/5 text-muted/70">
        The sun's height <i>h</i>, from the latitude <i>φ</i>, the season <i>δ</i> and the hour <i>H</i>.
      </p>
      <dl class="entries mt-8">
        <div class="entry">
          <dt>Contrast</dt>
          <dd>Everything on the page moves with its ground. Each grey keeps the contrast it has at noon, or at midnight. The red slides along its band (I): towards Cartier's as the light falls, towards Ferrari's in the dusk, back to halfway by day and by night.</dd>
        </div>
        <div class="entry">
          <dt>By hand</dt>
          <dd>The dot in the footer sets the other mode by hand, for the rest of the visit. Pressed again, the page follows the sun. While the sun is in charge, the dot is ringed.</dd>
        </div>
      </dl>
      <aside class="in-note note">
        <p>Drag the needle, or run the day: the whole page takes that hour's light.</p>
        <p>Dark text has to become light text at some point: that happens at the horizon, from parchment to dusk.</p>
        <p>The red never drops under 4.6&nbsp;:&nbsp;1, nor the text under 4.5&nbsp;:&nbsp;1.</p>
      </aside>
    </section>

    <section id="marks" class="relative">
      <SectionMark numeral="V" label="The marks" />
      <dl class="entries">
        <div class="entry">
          <dt class="font-redaction italic text-primary">
            I – V
          </dt>
          <dd>Sections are numbered in Roman numerals, as the hours are on the dial of Cartier's Tank.</dd>
        </div>
        <div class="entry">
          <dt class="font-redaction italic text-highlighted">
            London,
          </dt>
          <dd>
            A letter opens with where and when it was written; the Gazette du Bon Ton put its date first. Here the line is true: the place is where Hugo is, set by him when he travels,
            the date and hour are local to it, and the same place lights the page (IV).
          </dd>
        </div>
        <div class="entry">
          <dt class="font-signature text-2xl leading-6 text-primary">
            H
          </dt>
          <dd>The H that opens the signature, used alone at the head of every sheet: a hand turned into a mark, as Ferrari's Dino badge was drawn from Alfredo Ferrari's signature.</dd>
        </div>
        <div class="entry">
          <dt class="flex items-center">
            <InfinityMark />
          </dt>
          <dd>It stands where a role's end date would be: Hugo joined Vercel in 2025 and means to stay as long as he can. Redaction has no infinity sign, so this one is drawn, a lemniscate.</dd>
        </div>
      </dl>
      <aside class="in-note note">
        <p>Tank Américaine, Louis Cartier, 1917. Design Museum, London.</p>
        <p>Gazette du Bon Ton, nº 9, May 1924. Rijksmuseum, CC0.</p>
        <p>Dino badge, from Alfredo Ferrari's signature.</p>
      </aside>
    </section>

    <section id="underneath" class="relative">
      <SectionMark numeral="VI" label="Underneath" />
      <p class="copy lead">
        Any corner of the page lifts. Underneath is the working drawing of this visit, drawn once, the first time it is seen.
      </p>
      <dl class="entries mt-8">
        <div class="entry">
          <dt>Fig. 1</dt>
          <dd>The request: your city, the Vercel edge that answered and the region that rendered the page, then how the first load went.</dd>
        </div>
        <div class="entry">
          <dt>Fig. 2</dt>
          <dd>The sun: today's curve, and where it is now.</dd>
        </div>
        <div class="entry">
          <dt>Title block</dt>
          <dd>The sheet, the place, the revision. It leads here.</dd>
        </div>
        <div class="entry">
          <dt>The last corner</dt>
          <dd>The page itself, as a drawing.</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.copy {
  max-width: 65ch;
  text-wrap: pretty;
  font-size: 14px;
  line-height: 24px;
  color: var(--ui-text-muted);
}
/* a section that opens with prose starts where an entry would, level with its mark */
.lead {
  padding-top: 8px;
}
.note {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 15px;
  color: var(--ui-text-dimmed);
}
@media (min-width: 1024px) {
  .note {
    top: 9px;
    margin-top: 0;
  }
}

/* term and definition: a fixed column for the term, so every definition starts on the same line */
.entries {
  display: flex;
  flex-direction: column;
}
.entry {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 8px 0;
}
.entry + .entry {
  border-top: 1px solid color-mix(in oklab, var(--ui-text) 6%, transparent);
}
.entry dt {
  width: 128px;
  flex: none;
}
.entry dt:not([class]) {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted);
}
.entry dd {
  font-size: 14px;
  line-height: 24px;
  color: var(--ui-text-muted);
  text-wrap: pretty;
}
@media (max-width: 639px) {
  .entry {
    flex-direction: column;
    gap: 2px;
  }
}

section {
  scroll-margin-top: 48px;
}
.sun-space {
  height: 299px;
  margin-top: 32px;
}

.formula {
  font-family: var(--font-redaction);
  font-size: 18px;
  color: var(--ui-text-highlighted);
}

/* the sheet in miniature, to scale */
.plate {
  margin: 32px 0 0;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--ui-text-muted);
}
.dim {
  position: relative;
  height: 14px;
  margin-bottom: 6px;
  border-inline: 1px solid color-mix(in oklab, var(--ui-text) 35%, transparent);
  text-align: center;
}
.dim::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 7px;
  height: 1px;
  background: color-mix(in oklab, var(--ui-text) 25%, transparent);
}
.dim span {
  position: relative;
  padding: 0 6px;
  background: var(--ui-bg);
}
.col {
  display: flex;
  min-width: 0;
  height: 72px;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px;
  box-shadow: inset 0 0 0 0.5px color-mix(in oklab, var(--ui-text) 30%, transparent);
}
.col.gutter {
  padding-inline: 0;
  align-items: center;
  background: repeating-linear-gradient(135deg, transparent 0 4px, color-mix(in oklab, var(--ui-text) 8%, transparent) 4px 5px);
}
.col .name {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-text-highlighted);
}
</style>
