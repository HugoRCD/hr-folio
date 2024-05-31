<script setup lang="ts">
const { data } = await useAsyncData('quotes', () =>
  queryContent('quotes')
    .where({ _type: 'json' })
    .findOne()
)
</script>

<template>
        <div class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div
            v-for="(quote, index) in data!.quotes"
                :key="quote._id"
            class="mb-4"
            data-animate
            :style="{ '--stagger': index }"
            >
                <h4 class="font-newsreader text-lg italic ">
                "{{ quote.text }}"
                </h4>
                <p class="text-sm text-gray-500">
                {{ quote.author }}
                </p>
            </div>
        </div>
</template>
