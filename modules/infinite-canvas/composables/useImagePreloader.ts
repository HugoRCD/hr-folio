/**
 * @fileoverview Composable for preloading images and videos
 */

import type { ImagePreloaderOptions, UseImagePreloaderReturn } from '../types'
import { isVideo } from '../utils'

/**
 * Preloads a single media file (image or video)
 * @param src Media URL to preload
 * @returns Promise that resolves when loaded
 */
function preloadMedia(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (isVideo(src)) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      
      const handleLoad = () => {
        video.removeEventListener('loadedmetadata', handleLoad)
        video.removeEventListener('error', handleError)
        resolve()
      }
      
      const handleError = () => {
        video.removeEventListener('loadedmetadata', handleLoad)
        video.removeEventListener('error', handleError)
        resolve() // Don't reject to avoid breaking the flow
      }
      
      video.addEventListener('loadedmetadata', handleLoad)
      video.addEventListener('error', handleError)
      video.src = src
    } else {
      const img = new Image()
      
      const handleLoad = () => {
        img.removeEventListener('load', handleLoad)
        img.removeEventListener('error', handleError)
        resolve()
      }
      
      const handleError = () => {
        img.removeEventListener('load', handleLoad)
        img.removeEventListener('error', handleError)
        resolve() // Don't reject to avoid breaking the flow
      }
      
      img.addEventListener('load', handleLoad)
      img.addEventListener('error', handleError)
      img.src = src
    }
  })
}

/**
 * Composable for preloading multiple media files with progress tracking
 * @param options Configuration options
 * @returns Preloader state and controls
 */
export function useImagePreloader(options: ImagePreloaderOptions): UseImagePreloaderReturn {
  const { images, onProgress, onComplete } = options
  
  const progress = ref(0)
  const loadedCount = ref(0)
  const isLoading = ref(true)
  const isComplete = ref(false)

  /**
   * Updates progress and triggers callbacks
   */
  const updateProgress = () => {
    const newProgress = loadedCount.value / images.length
    progress.value = newProgress
    onProgress?.(newProgress)
    
    if (loadedCount.value === images.length) {
      isComplete.value = true
      isLoading.value = false
      onComplete?.()
    }
  }

  /**
   * Starts the preloading process for all media files
   */
  const startPreloading = async () => {
    if (images.length === 0) {
      progress.value = 1
      isComplete.value = true
      isLoading.value = false
      onComplete?.()
      return
    }

    // Preload all media in parallel with individual progress tracking
    const preloadPromises = images.map(async (src) => {
      await preloadMedia(src)
      loadedCount.value++
      updateProgress()
    })

    await Promise.all(preloadPromises)
  }

  return {
    progress: readonly(progress),
    loadedCount: readonly(loadedCount),
    isLoading: readonly(isLoading),
    isComplete: readonly(isComplete),
    startPreloading
  }
} 
