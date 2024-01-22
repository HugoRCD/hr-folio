<script setup lang="ts">
</script>

<template>
  <div class="relative h-full flex flex-col justify-center items-center gap-3">
    <div class="noise z-50 pointer-events-none absolute inset-[-200%] h-[400%] w-[400%] bg-[url('/noise.png')] opacity-[5%]" />
    <div class="size-52 bg-white blur-[200px] rounded-full  z-40 absolute -top-56" />
    <h1 class="text-4xl font-bold">
      Hi i'm Hugo
    </h1>
    <p class="text-balance max-w-md text-center">
      Developer and designer, i like to make things, lots of things and i'm pretty good at it
    </p>
    <p class="blurred">
      But also a fucking genius
    </p>
  </div>
</template>

<style scoped>
.blurred {
  @apply blur-[10px] hover:blur-[0px] transition-all duration-500 ;
}

  .noise {
    animation: noise 2s steps(10) infinite;
  }

  @keyframes noise {
    0%, 20%, 40%, 60%, 80%, 100% {
      transform: translate(0, 0);
    }
    10% {
      transform: translate(-5%, -10%);
    }
    30% {
      transform: translate(5%, 10%);
    }
    50% {
      transform: translate(-15%, 5%);
    }
    70% {
      transform: translate(10%, -5%);
    }
    90% {
      transform: translate(5%, -10%);
    }
  }
</style>
