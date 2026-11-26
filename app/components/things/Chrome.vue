<script setup lang="ts">
import { LayoutGroup, motion } from 'motion-v'
import { monogramPath, monogramViewBox } from '~/utils/signature'
import { THING_CATEGORIES, CATEGORY_LABEL, type ThingCategory } from '~/utils/things'

const { category, counts, total, filtered } = defineProps<{
  category: ThingCategory | 'all'
  counts: Record<ThingCategory | 'all', number>
  total: number
  filtered: number
}>()

const emit = defineEmits<{
  category: [next: ThingCategory | 'all']
}>()

const { arrive } = useThingMotion()
const categories: Array<ThingCategory | 'all'> = ['all', ...THING_CATEGORIES]
</script>

<template>
  <header class="chrome">
    <div class="left">
      <NuxtLink to="/" aria-label="Hugo Richard, home" class="mark">
        <svg :viewBox="monogramViewBox" class="sig" aria-hidden="true">
          <path :d="monogramPath" fill="currentColor" />
        </svg>
      </NuxtLink>
      <NuxtLink to="/" class="back">
        Index
      </NuxtLink>
    </div>

    <LayoutGroup>
      <nav class="cats" role="tablist" aria-label="Filter by use">
        <button
          v-for="c in categories"
          :key="c"
          type="button"
          role="tab"
          :aria-selected="category === c"
          class="tab"
          :class="{ active: category === c }"
          @click="emit('category', c)"
        >
          {{ CATEGORY_LABEL[c] }}
          <span class="n">{{ counts[c] }}</span>
          <motion.span
            v-if="category === c"
            layout-id="things-cat"
            class="line"
            :transition="arrive"
          />
        </button>
      </nav>
    </LayoutGroup>

    <div class="right">
      <p class="count">
        {{ filtered }}
        <span class="of">/ {{ total }}</span>
      </p>
      <p class="aff">
        Some links are affiliate links.
      </p>
    </div>
  </header>
</template>

<style scoped>
.chrome {
  position: sticky;
  top: 0;
  z-index: 40;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: minmax(7rem, 1fr) auto minmax(7rem, 1fr);
  align-items: center;
  gap: 16px 24px;
  padding: 18px 28px 16px;
  background: #FAF9F7;
  border-bottom: 1px solid #E8E6E1;
}
.left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.mark {
  display: flex;
  color: #901112;
  border: 0;
  box-shadow: none;
}
.sig {
  height: 36px;
  width: auto;
}
.back {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  text-decoration: none;
  border: 0;
  box-shadow: none;
}
.back:hover {
  color: #111111;
}
.cats {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 4px 22px;
}
.tab {
  position: relative;
  flex: 0 0 auto;
  padding: 4px 0 8px;
  border: 0;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 16px;
  color: var(--ui-text-dimmed);
  cursor: pointer;
  box-shadow: none;
  white-space: nowrap;
}
.tab:hover {
  color: #111111;
}
.tab.active {
  color: #111111;
}
.n {
  margin-left: 6px;
  opacity: 0.45;
}
.line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: #CD1919;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  justify-self: end;
  min-width: 0;
}
.count {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #111111;
  font-variant-numeric: tabular-nums;
}
.of {
  color: var(--ui-text-dimmed);
}
.aff {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.3;
  letter-spacing: 0.02em;
  color: #111111;
  text-align: right;
  white-space: nowrap;
  opacity: 0.35;
  transition: opacity 0.25s ease;
}
.aff:hover {
  opacity: 0.75;
}

@media (max-width: 899px) {
  .chrome {
    grid-template-columns: 1fr auto;
    gap: 8px 12px;
    padding: 10px 14px 8px;
  }
  .sig {
    height: 28px;
  }
  .left {
    gap: 10px;
  }
  .cats {
    grid-column: 1 / -1;
    order: 3;
    justify-content: flex-start;
    gap: 0 14px;
    padding-right: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .cats::-webkit-scrollbar {
    display: none;
  }
  .tab {
    font-size: 10px;
    letter-spacing: 0.1em;
    padding: 2px 0 6px;
  }
  .n {
    margin-left: 4px;
  }
  .right {
    order: 2;
    gap: 2px;
  }
  .count {
    font-size: 10px;
  }
  .aff {
    font-size: 9px;
    max-width: 7.2rem;
    white-space: normal;
  }
}
</style>
