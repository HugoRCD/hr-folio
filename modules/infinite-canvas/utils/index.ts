/**
 * Calculates the distance between two touch points
 * @param touch1 First touch point
 * @param touch2 Second touch point
 * @returns Distance in pixels
 */
export function getTouchDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calculates the center point between two touches
 * @param touch1 First touch point
 * @param touch2 Second touch point
 * @returns Center coordinates
 */
export function getTouchCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }
}

/**
 * Creates a throttled version of a function
 * @param func Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends(...args: any[]) => any>(func: T, delay: number): T {
  let lastCall = 0
  return ((...args: any[]) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func(...args)
    }
  }) as T
}

/**
 * Determines if a file URL is a video based on its extension
 * @param url File URL to check
 * @returns True if the file is a video
 */
export function isVideo(url: string): boolean {
  const extension = url.split('.').pop()?.toLowerCase()
  return ['mp4', 'webm', 'mov'].includes(extension || '')
}

/**
 * Detects if the current device is mobile
 * @param userAgent Navigator user agent string
 * @param windowWidth Current window width
 * @returns True if device is mobile
 */
export function isMobileDevice(userAgent: string = '', windowWidth: number = 0): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
         windowWidth <= 768
}

/**
 * Clamps a value between min and max
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
} 
