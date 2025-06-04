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
  gridIndex: number
}

interface ItemConfig {
  isMoving: boolean
  position: Position
  gridIndex: number
}

interface UseInfiniteCanvasOptions {
  gridSize: number
  initialPosition?: Position
}

// Custom debounce implementation
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

// Custom throttle implementation
function throttle<T extends(...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
) {
  let lastCall = 0
  let timeoutId: NodeJS.Timeout | undefined = undefined
  const { leading = true, trailing = true } = options

  const throttledFn = function(...args: Parameters<T>) {
    const now = Date.now()

    if (!lastCall && !leading) {
      lastCall = now
    }

    const remaining = limit - (now - lastCall)

    if (remaining <= 0 || remaining > limit) {
      clearTimeout(timeoutId)
      timeoutId = undefined
      lastCall = now
      func(...args)
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        lastCall = leading ? Date.now() : 0
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

function getDistance(p1: Position, p2: Position) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function useInfiniteCanvas(options: UseInfiniteCanvasOptions) {
  const { gridSize, initialPosition = { x: 0, y: 0 } } = options

  // Reactive state
  const offset = ref<Position>({ ...initialPosition })
  const restPos = ref<Position>({ ...initialPosition })
  const startPos = ref<Position>({ ...initialPosition })
  const velocity = ref<Position>({ x: 0, y: 0 })
  const isDragging = ref(false)
  const gridItems = ref<GridItem[]>([])
  const isMoving = ref(false)
  const lastMoveTime = ref(0)
  const velocityHistory = ref<Position[]>([])

  // Internal state
  const containerRef = ref<HTMLElement>()
  const lastPos = ref<Position>({ x: 0, y: 0 })
  const animationFrame = ref<number | null>(null)
  const lastUpdateTime = ref(0)

  const calculateVisiblePositions = (): Position[] => {
    if (!containerRef.value) return []

    const rect = containerRef.value.getBoundingClientRect()
    const { width } = rect
    const { height } = rect

    // Calculate grid cells needed to fill container
    const cellsX = Math.ceil(width / gridSize)
    const cellsY = Math.ceil(height / gridSize)

    // Calculate center position based on offset
    const centerX = -Math.round(offset.value.x / gridSize)
    const centerY = -Math.round(offset.value.y / gridSize)

    const positions: Position[] = []
    const halfCellsX = Math.ceil(cellsX / 2)
    const halfCellsY = Math.ceil(cellsY / 2)

    for (let y = centerY - halfCellsY; y <= centerY + halfCellsY; y++) {
      for (let x = centerX - halfCellsX; x <= centerX + halfCellsX; x++) {
        positions.push({ x, y })
      }
    }

    return positions
  }

  const getItemIndexForPosition = (x: number, y: number): number => {
    // Special case for center
    if (x === 0 && y === 0) return 0

    // Determine which layer of the spiral we're in
    const layer = Math.max(Math.abs(x), Math.abs(y))

    // Calculate the size of all inner layers
    const innerLayersSize = Math.pow(2 * layer - 1, 2)

    // Calculate position within current layer
    let positionInLayer = 0

    if (y === 0 && x === layer) {
      // Starting position (middle right)
      positionInLayer = 0
    } else if (y < 0 && x === layer) {
      // Right side, bottom half
      positionInLayer = -y
    } else if (y === -layer && x > -layer) {
      // Bottom side
      positionInLayer = layer + (layer - x)
    } else if (x === -layer && y < layer) {
      // Left side
      positionInLayer = 3 * layer + (layer + y)
    } else if (y === layer && x < layer) {
      // Top side
      positionInLayer = 5 * layer + (layer + x)
    } else {
      // Right side, top half (y > 0 && x === layer)
      positionInLayer = 7 * layer + (layer - y)
    }

    const index = innerLayersSize + positionInLayer
    return index
  }

  const debouncedStopMoving = debounce(() => {
    isMoving.value = false
    restPos.value = { ...offset.value }
  }, 200)

  const updateGridItems = () => {
    const positions = calculateVisiblePositions()
    const newItems = positions.map((position) => {
      const gridIndex = getItemIndexForPosition(position.x, position.y)
      return {
        position,
        gridIndex,
      }
    })

    const distanceFromRest = getDistance(offset.value, restPos.value)

    gridItems.value = newItems
    isMoving.value = distanceFromRest > 5

    debouncedStopMoving()
  }

  const debouncedUpdateGridItems = throttle(updateGridItems, UPDATE_INTERVAL, {
    leading: true,
    trailing: true,
  })

  const animate = () => {
    const currentTime = performance.now()
    const deltaTime = currentTime - lastUpdateTime.value

    if (deltaTime >= UPDATE_INTERVAL) {
      const speed = Math.sqrt(
        velocity.value.x * velocity.value.x + velocity.value.y * velocity.value.y
      )

      if (speed < MIN_VELOCITY) {
        velocity.value = { x: 0, y: 0 }
        return
      }

      // Apply non-linear deceleration based on speed
      let deceleration = FRICTION
      if (speed < VELOCITY_THRESHOLD) {
        // Apply stronger deceleration at lower speeds for more natural stopping
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

      debouncedUpdateGridItems()
      lastUpdateTime.value = currentTime
    }

    animationFrame.value = requestAnimationFrame(animate)
  }

  const handleDown = (p: Position) => {
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value)
    }

    isDragging.value = true
    startPos.value = {
      x: p.x - offset.value.x,
      y: p.y - offset.value.y,
    }
    velocity.value = { x: 0, y: 0 }
    lastPos.value = { x: p.x, y: p.y }
  }

  const handleMove = (p: Position) => {
    if (!isDragging.value) return

    const currentTime = performance.now()
    const timeDelta = currentTime - lastMoveTime.value

    // Calculate raw velocity based on position and time
    const rawVelocity = {
      x: (p.x - lastPos.value.x) / (timeDelta || 1),
      y: (p.y - lastPos.value.y) / (timeDelta || 1),
    }

    // Add to velocity history and maintain fixed size
    const newVelocityHistory = [...velocityHistory.value, rawVelocity]
    if (newVelocityHistory.length > VELOCITY_HISTORY_SIZE) {
      newVelocityHistory.shift()
    }

    // Calculate smoothed velocity using moving average
    const smoothedVelocity = newVelocityHistory.reduce(
      (acc, vel) => ({
        x: acc.x + vel.x / newVelocityHistory.length,
        y: acc.y + vel.y / newVelocityHistory.length,
      }),
      { x: 0, y: 0 }
    )

    velocity.value = smoothedVelocity
    offset.value = {
      x: p.x - startPos.value.x,
      y: p.y - startPos.value.y,
    }
    lastMoveTime.value = currentTime
    velocityHistory.value = newVelocityHistory
    
    updateGridItems()
    lastPos.value = { x: p.x, y: p.y }
  }

  const handleUp = () => {
    isDragging.value = false
    animationFrame.value = requestAnimationFrame(animate)
  }

  const handleMouseDown = (e: MouseEvent) => {
    handleDown({
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    handleMove({
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleMouseUp = () => {
    handleUp()
  }

  const handleTouchStart = (e: TouchEvent) => {
    const [touch] = e.touches
    if (!touch) return

    handleDown({
      x: touch.clientX,
      y: touch.clientY,
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    const [touch] = e.touches
    if (!touch) return

    handleMove({
      x: touch.clientX,
      y: touch.clientY,
    })
  }

  const handleTouchEnd = () => {
    handleUp()
  }

  const handleWheel = (e: WheelEvent) => {
    // Get the scroll deltas
    const { deltaX } = e
    const { deltaY } = e

    offset.value = {
      x: offset.value.x - deltaX,
      y: offset.value.y - deltaY,
    }
    velocity.value = { x: 0, y: 0 } // Reset velocity when scrolling
    
    debouncedUpdateGridItems()
  }

  // Initialize grid items on mount
  onMounted(() => {
    updateGridItems()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value)
    }
    debouncedUpdateGridItems.cancel()
    debouncedStopMoving.cancel()
  })

  const getCurrentPosition = () => {
    return offset.value
  }

  return {
    // Refs
    containerRef,
    
    // State
    offset: readonly(offset),
    isDragging: readonly(isDragging),
    gridItems: readonly(gridItems),
    isMoving: readonly(isMoving),
    
    // Event handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
    
    // Methods
    getCurrentPosition,
  }
}

export type { Position, GridItem, ItemConfig } 
