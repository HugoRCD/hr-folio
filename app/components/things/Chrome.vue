<script setup lang="ts">
import { LayoutGroup, motion } from 'motion-v'
import { monogramPath, monogramViewBox } from '~/utils/signature'
import {
  THING_CATEGORIES,
  THING_SORTS,
  CATEGORY_LABEL,
  SORT_LABEL,
  SORT_SHORT,
  type ThingCategory,
  type ThingSort,
  type ThingView,
} from '~/utils/things'

const { category, counts, view, sort } = defineProps<{
  category: ThingCategory | 'all'
  counts: Record<ThingCategory | 'all', number>
  view: ThingView
  sort: ThingSort
}>()

const emit = defineEmits<{
  category: [next: ThingCategory | 'all']
  view: [next: ThingView]
  sort: [next: ThingSort]
}>()

const { arrive } = useThingMotion()
const categories: Array<ThingCategory | 'all'> = ['all', ...THING_CATEGORIES]
const sortOpen = ref(false)
const sortRoot = useTemplateRef<HTMLElement>('sortRoot')

onClickOutside(sortRoot, () => {
  sortOpen.value = false
})

function pickSort(next: ThingSort) {
  sortOpen.value = false
  emit('sort', next)
}
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

    <div class="tools">
      <div ref="sortRoot" class="sort">
        <button
          type="button"
          class="sort-btn"
          :aria-expanded="sortOpen"
          aria-haspopup="listbox"
          aria-label="Sort"
          @click="sortOpen = !sortOpen"
        >
          {{ SORT_SHORT[sort] }}
          <UIcon name="i-lucide-chevron-down" class="chev" />
        </button>
        <div
          v-if="sortOpen"
          class="menu"
          role="listbox"
          aria-label="Sort"
        >
          <button
            v-for="s in THING_SORTS"
            :key="s"
            type="button"
            role="option"
            class="opt"
            :class="{ on: sort === s }"
            :aria-selected="sort === s"
            @click="pickSort(s)"
          >
            {{ SORT_LABEL[s] }}
          </button>
        </div>
      </div>

      <div class="views" role="group" aria-label="Layout">
        <button
          type="button"
          class="view"
          :class="{ on: view === 'lookbook' }"
          :aria-pressed="view === 'lookbook'"
          @click="emit('view', 'lookbook')"
        >
          <UIcon name="i-lucide-layout-grid" class="ico" />
          Lookbook
        </button>
        <button
          type="button"
          class="view"
          :class="{ on: view === 'list' }"
          :aria-pressed="view === 'list'"
          @click="emit('view', 'list')"
        >
          <UIcon name="i-lucide-list" class="ico" />
          List
        </button>
      </div>
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
  view-transition-name: things-header;
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
.tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  justify-self: end;
  min-width: 0;
}
.sort {
  position: relative;
}
.sort-btn,
.opt,
.view {
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-dimmed);
  cursor: pointer;
  box-shadow: none;
  background: transparent;
  border: 0;
}
.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 2px;
  font-size: 10px;
  white-space: nowrap;
}
.sort-btn:hover,
.opt:hover,
.view:hover {
  color: #111111;
}
.chev,
.ico {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
}
.menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  min-width: 14.5rem;
  padding: 6px;
  background: #FAF9F7;
  border: 1px solid #E8E6E1;
  box-shadow: 0 12px 32px rgb(17 17 17 / 0.08);
}
.opt {
  padding: 8px 10px;
  font-size: 10px;
  text-align: left;
  white-space: nowrap;
}
.opt.on {
  color: #111111;
  background: #F7F6F3;
}
.views {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid #E8E6E1;
  border-radius: 999px;
  background: #F7F6F3;
}
.view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 10px;
  white-space: nowrap;
}
.view.on {
  background: #111111;
  color: #FAF9F7;
}

@media (max-width: 899px) {
  .chrome {
    grid-template-columns: 1fr auto;
    gap: 8px 10px;
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
  .tools {
    order: 2;
    gap: 8px;
  }
  .sort-btn {
    padding: 4px 0;
    font-size: 10px;
  }
  .view {
    gap: 4px;
    padding: 5px 8px;
  }
}
</style>
