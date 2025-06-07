import type { ImagePreloaderOptions, UseImagePreloaderReturn } from '../types'

// Utility function to determine media type
const getMediaType = (url: string) => {
  const extension = url.split('.').pop()?.toLowerCase()
  if (extension === 'mp4' || extension === 'webm' || extension === 'mov') {
    return 'video'
  }
  return 'image'
}

export function useImagePreloader(options: ImagePreloaderOptions): UseImagePreloaderReturn {
  const { images, onProgress, onComplete } = options
  
  const progress = ref(0)
  const loadedCount = ref(0)
  const isLoading = ref(true)
  const isComplete = ref(false)

  const preloadMedia = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const mediaType = getMediaType(src)
      
      if (mediaType === 'video') {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.muted = true
        
        video.onloadedmetadata = () => {
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
        
        video.onerror = () => {
          // Even on error, continue loading other media
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
        
        video.src = src
      } else {
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
      }
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

    // Preload all media in parallel
    await Promise.all(images.map(preloadMedia))
  }

  return {
    progress: readonly(progress),
    loadedCount: readonly(loadedCount),
    isLoading: readonly(isLoading),
    isComplete: readonly(isComplete),
    startPreloading
  }
} 
