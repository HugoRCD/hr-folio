<script setup lang="ts">
import { AnimateNumber } from 'motion-plus-vue'
import type { ThingPrice } from '~/utils/things'

const { price } = defineProps<{
  price: ThingPrice
}>()

const { spring, reduced } = useThingMotion()

const whole = computed(() => Number.isInteger(price.amount))
const format = computed(() => ({
  style: 'currency' as const,
  currency: price.currency,
  minimumFractionDigits: whole.value ? 0 : 2,
  maximumFractionDigits: whole.value ? 0 : 2,
}))
</script>

<template>
  <ClientOnly>
    <AnimateNumber
      v-if="!reduced"
      :value="price.amount"
      locales="en-GB"
      :format
      :transition="spring"
    />
    <span v-else>{{ formatPrice(price) }}</span>
    <template #fallback>
      {{ formatPrice(price) }}
    </template>
  </ClientOnly>
</template>
