<script setup lang="ts">
interface TimelineEvent {
  year: number
  icon: string
  title: string
  description: string
  active?: boolean
}

const props = defineProps<{
  events: TimelineEvent[]
}>()

const initialActivePropIndex = computed(() => {
  const idx = props.events.findIndex(event => event.active === true)
  return idx !== -1 ? idx : -1
})

const displayAsActiveIndex = ref(-1)

onMounted(() => {
  displayAsActiveIndex.value = initialActivePropIndex.value
})

function handlePointerEnterItem(index: number) {
  displayAsActiveIndex.value = index
}

function handlePointerLeaveItem() {
  displayAsActiveIndex.value = initialActivePropIndex.value
}

const shouldDisplayYear = (eventYear: number, index: number): boolean => {
  if (index === 0) return true
  if (index > 0 && props.events[index - 1]) {
    return eventYear !== props.events[index - 1]?.year
  }
  return true
}

const eventItemWidth = ref(80)
const detailsContainerWidthClass = 'w-[240px]'
const timelineTrackHeightClass = 'h-24'
const numberOfIntermediateTicks = 3

const timelineInnerWidth = computed(() => {
  return props.events.length * eventItemWidth.value
})

const mainTickBaseHeightClass = 'h-4'
const mainTickHoverHeightClass = 'h-6'
const mainTickActiveHeightClass = 'h-10'

const yearBottomOffset = computed(() => 'calc(50% + 20px)')
const iconDefaultTop = 'calc(50% + 8px)'
const iconActivePushedTop = 'calc(50% + 24px)'
const detailsDefaultTop = 'calc(50% + 36px)'
const detailsActivePushedTop = 'calc(50% + 52px)'

</script>

<template>
  <div class="py-16">
    <div class="max-w-full mx-auto overflow-x-auto overflow-y-hidden select-none px-6" :class="[timelineTrackHeightClass]" style="padding-bottom: 16rem;">
      <div class="relative mx-auto" :class="[timelineTrackHeightClass]" :style="{ width: `${timelineInnerWidth}px` }">
        <div
          v-if="props.events.length > 1"
          class="absolute top-1/2 left-0 h-px bg-neutral-700 -translate-y-1/2"
          :style="{ width: `calc(${timelineInnerWidth}px - ${eventItemWidth}px)` }"
        />
        <div
          v-if="props.events.length > 0 && displayAsActiveIndex >= 0"
          class="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-primary transition-all duration-400 ease-out"
          :style="{ width: `${displayAsActiveIndex * eventItemWidth}px` }"
        />

        <div
          v-for="(event, index) in props.events"
          :key="`event-node-${index}`"
          class="absolute top-0 group isolate"
          :class="[displayAsActiveIndex === index ? 'z-30' : 'z-0']"
          :style="{ left: `${index * eventItemWidth}px`, width: `${eventItemWidth}px`, height: '100%' }"
          tabindex="0"
          @mouseenter="handlePointerEnterItem(index)"
          @mouseleave="handlePointerLeaveItem()"
          @focusin="handlePointerEnterItem(index)"
          @focusout="handlePointerLeaveItem()"
        >
          <span
            v-if="shouldDisplayYear(event.year, index)"
            class="absolute left-0 -translate-x-1/2 text-xs font-medium text-neutral-500 whitespace-nowrap"
            :style="{ bottom: yearBottomOffset }"
          >
            {{ event.year }}
          </span>

          <div
            class="absolute top-1/2 left-0 w-px -translate-y-1/2
                        transition-all duration-300 ease-out transform origin-center"
            :class="[
              displayAsActiveIndex === index
                ? `${mainTickActiveHeightClass} bg-primary`
                : `${mainTickBaseHeightClass} group-hover:${mainTickHoverHeightClass} group-focus:${mainTickHoverHeightClass}`,
              index <= displayAsActiveIndex
                ? 'bg-primary'
                : 'bg-neutral-600 group-hover:bg-neutral-400 group-focus:bg-neutral-400'
            ]"
          />

          <div v-if="index < props.events.length -1">
            <div
              v-for="tickNumber in numberOfIntermediateTicks"
              :key="`subtick-${index}-${tickNumber}`"
              class="absolute top-1/2 -translate-y-1/2 w-px h-2 transition-colors duration-300 ease-out"
              :class="[
                index < displayAsActiveIndex ? 'bg-primary group-hover:bg-primary group-focus:bg-primary' : 'bg-neutral-700 group-hover:bg-neutral-500 group-focus:bg-neutral-500'
              ]"
              :style="{ left: `${(tickNumber * eventItemWidth / (numberOfIntermediateTicks + 1))}px` }"
            />
          </div>

          <div
            class="absolute left-0 -translate-x-1/2 flex items-center justify-center w-10 h-10 transition-all duration-300 ease-out"
            :style="{ top: displayAsActiveIndex === index ? iconActivePushedTop : iconDefaultTop }"
            :class="[
              displayAsActiveIndex === index ? '!text-neutral-100' :
              index < displayAsActiveIndex ? 'text-neutral-400 group-hover:text-neutral-200 group-focus:text-neutral-200' :
              'text-neutral-600 group-hover:text-neutral-300 group-focus:text-neutral-300'
            ]"
          >
            <UIcon :name="event.icon" class="text-xl" />
          </div>

          <div
            class="absolute transition-all duration-300 ease-out pointer-events-none z-20"
            :class="[
              detailsContainerWidthClass,
              displayAsActiveIndex === index ? 'opacity-100' : 'opacity-0',
              index === 0 && props.events.length > 1 ? 'left-0 text-left' :
              (index === props.events.length - 1 && props.events.length > 1 && index !== 0) ? 'left-0 -translate-x-full text-right' :
              'left-0 -translate-x-1/2 text-center'
            ]"
            :style="{ top: displayAsActiveIndex === index ? detailsActivePushedTop : detailsDefaultTop }"
          >
            <h4 class="mb-1 text-base font-semibold text-neutral-100">
              {{ event.title }}
            </h4>
            <p class="text-sm leading-snug text-neutral-400">
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
