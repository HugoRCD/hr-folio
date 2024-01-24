<template>
  <div class="flex flex-col h-full justify-center items-center p-6 sm:p-12">
    <LetterCard>
      <ThemeSelector class="w-full justify-end" />
      <NuxtPage class="flex-1 flex flex-col justify-center" />
      <div class="flex justify-end">
        <Signature class="flex justify-end h-16 sm:h-20 fill-black dark:fill-white" />
      </div>
    </LetterCard>
  </div>
</template>
