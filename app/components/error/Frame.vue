<script setup lang="ts">
import { monogramPath, monogramViewBox } from '~/utils/signature'

// The room the error page is set in (<ErrorFrame>): the monogram and the dateline at the top, the
// way back at the foot, and the scene in between, on the cream of a watch box.
const daylight = useState<{ time: string, date: string, phase: string, place: { city: string } } | undefined>('daylight')
</script>

<template>
  <div class="frame">
    <header class="top">
      <NuxtLink to="/" aria-label="Hugo Richard, home" class="home">
        <svg :viewBox="monogramViewBox" aria-hidden="true"><path :d="monogramPath" /></svg>
      </NuxtLink>
      <!-- held at its height, so nothing moves when it arrives -->
      <p class="dateline">
        <ClientOnly>
          <template v-if="daylight?.date">
            <span class="serif">From {{ daylight.place.city }},</span>
            <span class="serif dim">{{ daylight.date }}</span>
            <span class="hour">{{ daylight.time }} · {{ daylight.phase }}</span>
          </template>
        </ClientOnly>
      </p>
    </header>

    <main class="stage">
      <slot />
    </main>

    <footer class="bottom">
      <span>hugorcd.com</span>
      <NuxtLink to="/" class="back">
        Back to the index
        <!-- drawn, not set: the font's arrow sits at the height of small letters, below the middle of capitals -->
        <svg class="arrow" viewBox="0 0 8 7.2" aria-hidden="true"><path d="M0.4 3.6H7.1M4.7 1.3L7.1 3.6L4.7 5.9" /></svg>
      </NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
.frame {
  --ground: #efe9de;
  --fg: #1c1917;
  /* as light as it can be and still read: 4.5:1 on the cream, at the size of the dateline and the footer */
  --muted: rgb(28 25 23 / 0.64);
  --mark: #901112;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
  padding: 40px;
  overflow: hidden;
  background-color: var(--ground);
  color: var(--fg);
}
.top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.home svg {
  height: 44px;
  width: auto;
  fill: var(--mark);
  transition: opacity 0.2s ease;
}
.home:hover svg {
  opacity: 0.75;
}
.dateline {
  display: flex;
  min-height: 62px;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}
.serif {
  font-family: var(--font-redaction);
  font-style: italic;
  font-size: 15px;
  line-height: 20px;
}
.serif.dim,
.hour {
  color: var(--muted);
}
.hour {
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
}
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-block: 24px 72px;
  min-width: 0;
}
.bottom {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.back {
  transition: color 0.2s ease;
}
/* as tall as the capitals and standing on their baseline, so its shaft is at their middle */
.arrow {
  display: inline-block;
  height: 0.72em;
  width: auto;
  margin-left: 0.15em;
  vertical-align: baseline;
  overflow: visible;
}
.arrow path {
  fill: none;
  stroke: currentColor;
  stroke-width: 0.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.back:hover {
  color: var(--fg);
}
@media (max-width: 639px) {
  .frame {
    padding: 24px;
  }
  .stage {
    padding-block: 32px 64px;
  }
}
</style>
