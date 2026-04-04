<script setup lang="ts">
interface TimelineEvent {
  year: number
  icon: string
  title: string
  description:string
  active?: boolean
}

const props = withDefaults(defineProps<{
  events: TimelineEvent[]
  tickThicknessBase?: string
  tickThicknessActive?: string
  intermediateTickHeight?: string
  mainTickHeightBase?: string
  mainTickHeightHover?: string
  mainTickHeightActive?: string
  showHorizontalLines?: boolean
  itemWidth?: number
}>(), {
  tickThicknessBase: 'w-0.5',
  tickThicknessActive: 'w-0.5',
  intermediateTickHeight: 'h-2',
  mainTickHeightBase: 'h-6',
  mainTickHeightHover: 'h-8',
  mainTickHeightActive: 'h-12',
  showHorizontalLines: false,
  itemWidth: 60,
})

const initialActivePropIndex = computed(() => {
  const idx = props.events.findIndex(event => event.active === true)
  return idx !== -1 ? idx : -1
})

const hoveredIndex = ref(-1)

const displayAsActiveIndex = computed(() => {
  return hoveredIndex.value !== -1 ? hoveredIndex.value : initialActivePropIndex.value
})

function handlePointerEnterItem(index: number) {
  hoveredIndex.value = index
}

function handlePointerLeaveItem() {
  hoveredIndex.value = -1
}

const shouldDisplayYear = (eventYear: number, index: number): boolean => {
  if (index === 0) return true
  if (index > 0 && props.events[index - 1]) {
    return eventYear !== props.events[index - 1]?.year
  }
  return true
}

const detailsContainerWidthClass = 'w-[240px]'
const timelineTrackHeightClass = 'h-55'
const numberOfIntermediateTicks = 7

const timelineInnerWidth = computed(() => {
  return props.events.length * props.itemWidth
})

const timelineHorizontalLineTop = '1.5rem'

const iconDefaultTop = computed(() => `calc(${timelineHorizontalLineTop} + 1rem + 0.5rem)`)
const iconActivePushedTop = computed(() => `calc(${timelineHorizontalLineTop} + 2.5rem + 0.5rem)`)

const detailsDefaultTop = computed(() => `calc(${iconDefaultTop.value} + 2.5rem)`)
const detailsActivePushedTop = computed(() => `calc(${iconActivePushedTop.value} + 2.5rem)`)
</script>

<template>
  <div class="py-16">
    <div class="max-w-full mx-auto overflow-x-auto overflow-y-hidden select-none px-6" :class="[timelineTrackHeightClass]" style="padding-bottom: 10rem;">
      <div class="relative mx-auto" :class="[timelineTrackHeightClass]" :style="{ width: `${timelineInnerWidth}px` }">
        <template v-if="props.showHorizontalLines">
          <div
            v-if="props.events.length > 1"
            class="absolute left-0 h-px bg-neutral-700"
            :style="{ top: timelineHorizontalLineTop, width: `calc(${timelineInnerWidth}px - ${props.itemWidth}px)` }"
          />
          <div
            v-if="props.events.length > 0 && displayAsActiveIndex >= 0"
            class="absolute left-0 h-px bg-primary transition-all duration-400 ease-out"
            :style="{ top: timelineHorizontalLineTop, width: `${displayAsActiveIndex * props.itemWidth}px` }"
          />
        </template>

        <div
          v-for="(event, index) in props.events"
          :key="`event-node-${index}`"
          class="absolute top-0 group isolate"
          :class="[displayAsActiveIndex === index ? 'z-30' : 'z-0']"
          :style="{ left: `${index * props.itemWidth}px`, width: `${props.itemWidth}px`, height: '100%' }"
          tabindex="0"
          @mouseenter="handlePointerEnterItem(index)"
          @mouseleave="handlePointerLeaveItem()"
          @focusin="handlePointerEnterItem(index)"
          @focusout="handlePointerLeaveItem()"
        >
          <span
            v-if="shouldDisplayYear(event.year, index)"
            class="absolute top-0 left-0 font-serif italic -translate-x-1/2 text-xs font-medium text-muted whitespace-nowrap"
          >
            {{ event.year }}
          </span>

          <div
            class="absolute left-0 transition-all duration-300 ease-out transform origin-top"
            :style="{ top: timelineHorizontalLineTop }"
            :class="[
              displayAsActiveIndex === index
                ? `${props.mainTickHeightActive} ${props.tickThicknessActive} bg-primary`
                : `${props.mainTickHeightBase} group-hover:${props.mainTickHeightHover}`,
              index <= displayAsActiveIndex
                ? `${props.tickThicknessActive} bg-primary`
                : `${props.tickThicknessBase} bg-accented`
            ]"
          />

          <div v-if="index < props.events.length -1">
            <div
              v-for="tickNumber in numberOfIntermediateTicks"
              :key="`subtick-${index}-${tickNumber}`"
              class="absolute transition-colors duration-300 ease-out"
              :class="[
                props.intermediateTickHeight,
                index < displayAsActiveIndex ? `${props.tickThicknessActive} bg-primary group-hover:bg-primary` : `${props.tickThicknessBase} bg-accented`
              ]"
              :style="{ top: timelineHorizontalLineTop, left: `${(tickNumber * props.itemWidth / (numberOfIntermediateTicks + 1))}px` }"
            />
          </div>

          <div
            class="absolute left-0 -translate-x-1/2 flex items-center justify-center size-10 transition-all duration-300 ease-out"
            :style="{ top: displayAsActiveIndex === index ? iconActivePushedTop : iconDefaultTop }"
            :class="[
              displayAsActiveIndex === index ? 'text-highlighted' :
              index < displayAsActiveIndex ? 'text-muted' :
              'text-muted/50'
            ]"
          >
            <UIcon :name="event.icon" class="text-xl size-5" />
          </div>

          <div
            class="absolute transition-all duration-300 ease-out z-20"
            :class="[
              detailsContainerWidthClass,
              displayAsActiveIndex === index ? 'opacity-100' : 'opacity-0',
              props.events.length === 1 ? 'left-0 -translate-x-1/2 text-center' :
              index === 0 ? 'left-0 text-left' :
              index === 1 ? (props.events.length === 2 ? 'left-0 -translate-x-full text-right' : 'left-0 text-left') :
              index === props.events.length - 1 ? 'left-0 -translate-x-full text-right' :
              index === props.events.length - 2 ? 'left-0 -translate-x-full text-right' :
              'left-0 -translate-x-1/2 text-center'
            ]"
            :style="{ top: displayAsActiveIndex === index ? detailsActivePushedTop : detailsDefaultTop }"
          >
            <h4 class="mb-1 text-base font-semibold text-highlighted">
              {{ event.title }}
            </h4>
            <p class="text-sm leading-snug text-muted">
              {{ event.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group:focus {
    outline: none;
}
</style>
