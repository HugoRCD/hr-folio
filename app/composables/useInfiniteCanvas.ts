// Grid physics constants
const MIN_VELOCITY = 0.2
const UPDATE_INTERVAL = 16
const VELOCITY_HISTORY_SIZE = 5
const FRICTION = 0.9
const VELOCITY_THRESHOLD = 0.3

interface Position {
  x: number
  y: number
}

interface GridItem {
  position: Position
  index: number
  isVisible: boolean
}

interface UseInfiniteCanvasOptions {
  itemSize: number
  gap?: number
  items: Array<any>
  initialPosition?: Position
  overscan?: number // How many items to render outside viewport
}

// Debounce utility
function debounce<T extends(...args: unknown[]) => unknown>(
  func: T,
  wait: number
) {
  let timeoutId: NodeJS.Timeout | undefined = undefined

  const debouncedFn = function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = undefined
    }, wait)
  }

  debouncedFn.cancel = function() {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }

  return debouncedFn
}

// Throttle utility
function throttle<T extends(...args: unknown[]) => unknown>(
  func: T,
  limit: number
) {
  let lastCall = 0
  let timeoutId: NodeJS.Timeout | undefined = undefined

  const throttledFn = function(...args: Parameters<T>) {
    const now = Date.now()
    const remaining = limit - (now - lastCall)

    if (remaining <= 0) {
      clearTimeout(timeoutId)
      timeoutId = undefined
      lastCall = now
      func(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = undefined
        func(...args)
      }, remaining)
    }
  }

  throttledFn.cancel = function() {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return throttledFn
}

export function useInfiniteCanvas(options: UseInfiniteCanvasOptions) {
  const { 
    itemSize,
    gap = 0,
    items,
    initialPosition = { x: 0, y: 0 },
    overscan = 2
  } = options

  const effectiveItemSize = itemSize + gap

  // Reactive state
  const offset = ref<Position>({ ...initialPosition })
  const velocity = ref<Position>({ x: 0, y: 0 })
  const isDragging = ref(false)
  const gridItems = ref<GridItem[]>([])
  const isMoving = ref(false)

  // Internal state
  const containerRef = ref<HTMLElement>()
  const lastPos = ref<Position>({ x: 0, y: 0 })
  const animationFrame = ref<number | null>(null)
  const lastUpdateTime = ref(0)
  const lastMoveTime = ref(0)
  const velocityHistory = ref<Position[]>([])

  // Drag detection state
  const dragStartTime = ref(0)
  const dragStartPosition = ref<Position>({ x: 0, y: 0 })
  const hasMoved = ref(false)
  const justFinishedDragging = ref(false)
  const DRAG_THRESHOLD = 5 // pixels
  const DRAG_TIME_THRESHOLD = 100 // milliseconds

  const containerDimensions = computed(() => {
    if (!containerRef.value) return { width: 0, height: 0 }
    const rect = containerRef.value.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  })

  // Check if user is actually dragging (moved enough distance/time)
  const isActuallyDragging = computed(() => {
    return (isDragging.value && hasMoved.value) || justFinishedDragging.value
  })

  const calculateVisibleItems = (): GridItem[] => {
    const { width, height } = containerDimensions.value
    if (!width || !height) return []

    // Calculate visible grid bounds
    const startX = Math.floor((-offset.value.x - effectiveItemSize * overscan) / effectiveItemSize)
    const endX = Math.ceil((-offset.value.x + width + effectiveItemSize * overscan) / effectiveItemSize)
    const startY = Math.floor((-offset.value.y - effectiveItemSize * overscan) / effectiveItemSize)
    const endY = Math.ceil((-offset.value.y + height + effectiveItemSize * overscan) / effectiveItemSize)

    const visibleItems: GridItem[] = []

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const index = Math.abs((x * 31 + y * 17) % items.length) // Simple but deterministic distribution
        
        visibleItems.push({
          position: { x, y },
          index,
          isVisible: true
        })
      }
    }

    return visibleItems
  }

  const debouncedStopMoving = debounce(() => {
    isMoving.value = false
  }, 150)

  const updateGridItems = () => {
    gridItems.value = calculateVisibleItems()
    
    const speed = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2)
    isMoving.value = speed > 0.1

    debouncedStopMoving()
  }

  const throttledUpdate = throttle(updateGridItems, UPDATE_INTERVAL)

  const animate = () => {
    const currentTime = performance.now()
    const deltaTime = currentTime - lastUpdateTime.value

    if (deltaTime >= UPDATE_INTERVAL) {
      const speed = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2)

      if (speed < MIN_VELOCITY) {
        velocity.value = { x: 0, y: 0 }
        return
      }

      let deceleration = FRICTION
      if (speed < VELOCITY_THRESHOLD) {
        deceleration = FRICTION * (speed / VELOCITY_THRESHOLD)
      }

      offset.value = {
        x: offset.value.x + velocity.value.x,
        y: offset.value.y + velocity.value.y,
      }
      velocity.value = {
        x: velocity.value.x * deceleration,
        y: velocity.value.y * deceleration,
      }

      throttledUpdate()
      lastUpdateTime.value = currentTime
    }

    animationFrame.value = requestAnimationFrame(animate)
  }

  const handleDown = (clientX: number, clientY: number) => {
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value)
    }

    isDragging.value = true
    hasMoved.value = false
    dragStartTime.value = Date.now()
    dragStartPosition.value = { x: clientX, y: clientY }
    lastPos.value = { x: clientX - offset.value.x, y: clientY - offset.value.y }
    velocity.value = { x: 0, y: 0 }
    velocityHistory.value = []
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.value) return

    // Check if we've moved enough to consider it a drag
    const deltaX = Math.abs(clientX - dragStartPosition.value.x)
    const deltaY = Math.abs(clientY - dragStartPosition.value.y)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const timeDelta = Date.now() - dragStartTime.value

    if (distance > DRAG_THRESHOLD || timeDelta > DRAG_TIME_THRESHOLD) {
      hasMoved.value = true
    }

    const currentTime = performance.now()
    const newOffset = {
      x: clientX - lastPos.value.x,
      y: clientY - lastPos.value.y,
    }

    const deltaTime = currentTime - lastMoveTime.value
    if (deltaTime > 0) {
      const rawVelocity = {
        x: (newOffset.x - offset.value.x) / deltaTime,
        y: (newOffset.y - offset.value.y) / deltaTime,
      }

      velocityHistory.value.push(rawVelocity)
      if (velocityHistory.value.length > VELOCITY_HISTORY_SIZE) {
        velocityHistory.value.shift()
      }

      // Smooth velocity
      velocity.value = velocityHistory.value.reduce(
        (acc, vel) => ({
          x: acc.x + vel.x / velocityHistory.value.length,
          y: acc.y + vel.y / velocityHistory.value.length,
        }),
        { x: 0, y: 0 }
      )
    }

    offset.value = newOffset
    lastMoveTime.value = currentTime
    updateGridItems()
  }

  const handleUp = () => {
    if (hasMoved.value) {
      justFinishedDragging.value = true
      // Keep the "just finished dragging" state for longer to prevent accidental clicks
      setTimeout(() => {
        justFinishedDragging.value = false
      }, 300)
    }
    
    isDragging.value = false
    hasMoved.value = false
    animationFrame.value = requestAnimationFrame(animate)
  }

  // Event handlers
  const handleMouseDown = (e: MouseEvent) => {
    handleDown(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    handleMove(e.clientX, e.clientY)
  }

  const handleTouchStart = (e: TouchEvent) => {
    const [touch] = e.touches
    if (touch) {
      handleDown(touch.clientX, touch.clientY)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    const [touch] = e.touches
    if (touch) {
      handleMove(touch.clientX, touch.clientY)
    }
  }

  const handleWheel = (e: WheelEvent) => {
    offset.value = {
      x: offset.value.x - e.deltaX,
      y: offset.value.y - e.deltaY,
    }
    velocity.value = { x: 0, y: 0 }
    throttledUpdate()
  }

  // Initialize
  onMounted(() => {
    nextTick(updateGridItems)
  })

  // Cleanup
  onUnmounted(() => {
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value)
    }
    throttledUpdate.cancel()
    debouncedStopMoving.cancel()
  })

  return {
    containerRef,
    offset: readonly(offset),
    isDragging: readonly(isDragging),
    isActuallyDragging: readonly(isActuallyDragging),
    gridItems: readonly(gridItems),
    isMoving: readonly(isMoving),
    containerDimensions: readonly(containerDimensions),
    itemSize,
    gap,
    items,
    
    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: handleUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd: handleUp,
    handleWheel,
  }
}

export type { Position, GridItem, UseInfiniteCanvasOptions } 
