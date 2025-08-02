<script setup lang="ts">
import { ref } from 'vue'

const topFaderOpacity = ref(0)
const bottomFaderOpacity = ref(1)

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  
  // Top fader: appears progressively as we scroll down
  topFaderOpacity.value = clamp(scrollTop / 100, 0, 1)
  
  // Bottom fader: disappears progressively as we approach the bottom
  const distanceFromBottom = scrollHeight - clientHeight - scrollTop
  bottomFaderOpacity.value = clamp(distanceFromBottom / 100, 0, 1)
}
</script>

<template>
  <div 
    class="relative overflow-y-auto border border-default rounded-lg"
    style="height: 300px; width: 100%; max-width: 500px;"
    @scroll="handleScroll"
  >
    <Fader 
      side="top" 
      :height="100" 
      :style="{ opacity: topFaderOpacity }"
    />
    
    <div class="p-4 *:my-0">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      
      <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      
      <p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.</p>
      
      <p>Explicabo nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipiscing elit.</p>
      
      <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      
      <p>Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
      
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt neque porro quisquam est qui dolorem ipsum.</p>
    </div>
    
    <Fader 
      side="bottom" 
      :height="100" 
      :style="{ opacity: bottomFaderOpacity }"
    />
  </div>
</template>
