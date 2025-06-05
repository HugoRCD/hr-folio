interface ImagePreloaderOptions {
  images: string[]
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export function useImagePreloader(options: ImagePreloaderOptions) {
  const { images, onProgress, onComplete } = options
  
  const progress = ref(0)
  const loadedCount = ref(0)
  const isLoading = ref(true)
  const isComplete = ref(false)

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        loadedCount.value++
        const newProgress = loadedCount.value / images.length
        progress.value = newProgress
        onProgress?.(newProgress)
        
        if (loadedCount.value === images.length) {
          isComplete.value = true
          isLoading.value = false
          onComplete?.()
        }
        
        resolve()
      }
      
      img.onerror = () => {
        // Even on error, continue loading other images
        loadedCount.value++
        const newProgress = loadedCount.value / images.length
        progress.value = newProgress
        onProgress?.(newProgress)
        
        if (loadedCount.value === images.length) {
          isComplete.value = true
          isLoading.value = false
          onComplete?.()
        }
        
        resolve() // Don't reject to avoid breaking the flow
      }
      
      img.src = src
    })
  }

  const startPreloading = async () => {
    if (images.length === 0) {
      progress.value = 1
      isComplete.value = true
      isLoading.value = false
      onComplete?.()
      return
    }

    // Preload all images in parallel
    await Promise.all(images.map(preloadImage))
  }

  return {
    progress: readonly(progress),
    loadedCount: readonly(loadedCount),
    isLoading: readonly(isLoading),
    isComplete: readonly(isComplete),
    startPreloading
  }
} 
