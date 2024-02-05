<script setup lang="ts">
type Work = {
  name: string;
  logo: string;
  image: string;
  description: string;
  link: string | "Soon";
  tags: string[];
  release: string;
};

const works: Work[] = [
  {
    name: "Mockline",
    logo: "SvgoMockline",
    image: "/projects/mockline.webp",
    description: "A components library to breathe new life and meaning into the web",
    link: "https://mockline.dev/",
    release: "Soon",
    tags: ["Vue", "Nuxt"],
  },
  {
    name: "Sekoïa",
    logo: "SvgoSekoia",
    image: "/projects/sekoia.webp",
    description: "High-end furniture and decoration brand",
    link: "https://sekoia.studio/",
    release: "Soon",
    tags: [],
  },
  {
    name: "Helpr",
    logo: "SvgoHelpr",
    image: "/projects/helpr.webp",
    description: "Automation tools connecting various applications to create powerful workflows",
    link: "https://helpr.tech/",
    release: "2023",
    tags: ["Nuxt"],
  },
  {
    name: "Maison Hochard",
    logo: "SvgoMaisonHochard",
    image: "/projects/maison-hochard.webp",
    description: "Graphic design and visual communication agency",
    link: "https://mh.hrcd.fr/",
    release: "2022",
    tags: ["Design", "Graphic Design"],
  },
];
</script>

<template>
  <div class="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
    <NuxtLink
      v-for="(work, index) in works"
      :key="work.name"
      :to="work.link"
      class="group relative"
      data-animate
      :aria-label="`Open ${work.name}`"
      :style="{ '--stagger': index }"
    >
      <div class="absolute right-0 top-0 font-newsreader text-5xl italic opacity-[9%] sm:text-3xl">
        {{ work.release }}
      </div>
      <h3 class="text-3xl font-medium italic decoration-accent group-hover:underline">
        {{ work.name }}<span class="text-accent">.</span>
      </h3>
      <p>
        {{ work.description }}
      </p>
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
