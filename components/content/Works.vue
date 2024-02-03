<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  mode: {
    type: String as PropType<"home" | "works">,
    default: "works",
  },
})

type Work = {
  name: string;
  logo: string;
  image: string;
  description: string;
  link: string | "soon";
  tags: string[];
  release: string;
  featured: boolean;
};

const works: Work[] = [
  {
    name: "Mockline",
    logo: "SvgoMockline",
    image: "/projects/mockline.webp",
    description: "Next gen UI library",
    link: "https://mockline.dev/",
    release: "soon",
    featured: true,
    tags: ["Vue", "Nuxt"],
  },
  {
    name: "Sekoïa",
    logo: "SvgoSekoia",
    image: "/projects/sekoia.webp",
    description: "High-end furniture and decoration brand",
    link: "https://sekoia.studio/",
    release: "soon",
    featured: true,
    tags: [],
  },
  {
    name: "Helpr",
    logo: "SvgoHelpr",
    image: "/projects/helpr.webp",
    description: "Automation tools connecting various applications to create powerful workflows",
    link: "https://helpr.tech/",
    release: "2023",
    featured: true,
    tags: ["Nuxt"],
  },
  {
    name: "Maison Hochard",
    logo: "SvgoMaisonHochard",
    image: "/projects/maison-hochard.webp",
    description: "Graphic design and visual communication agency",
    link: "https://mh.hrcd.fr/",
    release: "2022",
    featured: true,
    tags: ["Design", "Graphic Design"],
  },
];
</script>

<template>
  <div class="flex w-fit flex-col gap-3">
    <NuxtLink
      v-for="(work, index) in works"
      :key="work.name"
      :to="work.link"
      class="link"
      data-animate
      :aria-label="`Open ${work.name}`"
      :style="{ '--stagger': index }"
    >
      {{ work.name }}
    </NuxtLink>
    <NuxtLink
      v-if="mode === 'home'"
      to="/works"
      class="link mt-2 font-newsreader font-medium"
      aria-label="See more, go to all my works, projects"
    >
      <span class="sr-only">More projects</span>
      More
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
