// Grid physics constants
const MIN_VELOCITY = 0.1
const UPDATE_INTERVAL = 16
const VELOCITY_HISTORY_SIZE = 5
const FRICTION = 0.92
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

interface CanvasItem {
  width?: number
  height?: number
  [key: string]: any
}

export function useInfiniteCanvas(props: {
  items: CanvasItem[]
  baseGap?: number
  containerRef: Ref<HTMLElement | null>
}) {
  // Physics constants
  const MIN_VELOCITY = 0.1
  const FRICTION = 0.92
  const DRAG_THRESHOLD = 5

  // Canvas state - start at center
  const offset = ref({ x: 0, y: 0 })
  const velocity = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const justFinishedDragging = ref(false)
  const containerDimensions = ref({ width: 0, height: 0 })

  // Drag state
  const dragStart = ref({ x: 0, y: 0 })
  const dragStartOffset = ref({ x: 0, y: 0 })
  const totalDragDistance = ref(0)
  const dragStartTime = ref(0)

  // Calculate canvas dimensions for scattered layout
  const canvasBounds = computed(() => {
    // Create a larger canvas area for scattered items
    const canvasSize = Math.max(4000, props.items.length * 100)
    
    return { 
      width: canvasSize, 
      height: canvasSize, 
      centerX: canvasSize / 2,
      centerY: canvasSize / 2
    }
  })

  // Generate scattered positions around center with collision avoidance
  const gridItems = computed(() => {
    const { centerX, centerY } = canvasBounds.value
    const maxRadius = Math.min(centerX, centerY) * 0.8
    const baseGap = props.baseGap || 40
    
    const placedItems: Array<{ 
      position: { x: number; y: number }
      index: number
      width: number
      height: number
    }> = []
    
    // Check if two items collide with their actual dimensions
    const checkCollision = (
      pos1: { x: number; y: number }, 
      size1: { width: number; height: number },
      pos2: { x: number; y: number }, 
      size2: { width: number; height: number }
    ) => {
      const left1 = pos1.x - baseGap
      const right1 = pos1.x + size1.width + baseGap
      const top1 = pos1.y - baseGap
      const bottom1 = pos1.y + size1.height + baseGap
      
      const left2 = pos2.x
      const right2 = pos2.x + size2.width
      const top2 = pos2.y
      const bottom2 = pos2.y + size2.height
      
      return !(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2)
    }
    
    // Simplified positioning algorithm
    const findValidPosition = (index: number) => {
      const item = props.items[index]
      if (!item) return { x: centerX, y: centerY }
        
      const itemWidth = item.width || 300
      const itemHeight = item.height || 300
      const maxDimension = Math.max(itemWidth, itemHeight)
      
      let attempts = 0
      const maxAttempts = 200
      
      while (attempts < maxAttempts) {
        // Start from center and spiral outward
        const radiusStep = maxDimension + baseGap
        const currentRadius = Math.sqrt(attempts) * radiusStep * 0.6
        const angle = index * 137.508 + attempts * 13.7
        
        // Add variation
        const variation = Math.sin(index * 17.3 + attempts * 5.7) * radiusStep * 0.3
        const finalRadius = Math.min(currentRadius + variation, maxRadius)
        
        const x = centerX + Math.cos(angle) * finalRadius - itemWidth / 2
        const y = centerY + Math.sin(angle) * finalRadius - itemHeight / 2
        
        const newPosition = { x, y }
        const newSize = { width: itemWidth, height: itemHeight }
        
        // Check collision with all placed items
        const hasCollision = placedItems.some(placedItem => 
          checkCollision(newPosition, newSize, placedItem.position, placedItem)
        )
        
        if (!hasCollision) {
          return newPosition
        }
        
        attempts++
      }
      
      // Emergency spiral fallback
      const emergencyAngle = index * 2.4
      const emergencyRadius = Math.sqrt(index) * (maxDimension + baseGap)
      
      return {
        x: centerX + Math.cos(emergencyAngle) * emergencyRadius - itemWidth / 2,
        y: centerY + Math.sin(emergencyAngle) * emergencyRadius - itemHeight / 2
      }
    }
    
    // Place all items one by one
    return props.items.map((item, index) => {
      const position = findValidPosition(index)
      const itemWidth = item.width || 300
      const itemHeight = item.height || 300
      
      const gridItem = { 
        position, 
        index,
        width: itemWidth,
        height: itemHeight
      }
      placedItems.push(gridItem)
      return gridItem
    })
  })

  // Get visible items based on viewport
  const visibleItems = computed(() => {
    const { width, height } = containerDimensions.value
    const buffer = 500
    
    const viewportLeft = -offset.value.x - buffer
    const viewportRight = -offset.value.x + width + buffer
    const viewportTop = -offset.value.y - buffer
    const viewportBottom = -offset.value.y + height + buffer
    
    return gridItems.value.filter(gridItem => {
      const itemRight = gridItem.position.x + gridItem.width
      const itemBottom = gridItem.position.y + gridItem.height
      
      return (
        gridItem.position.x < viewportRight &&
        itemRight > viewportLeft &&
        gridItem.position.y < viewportBottom &&
        itemBottom > viewportTop
      )
    })
  })

  // Constrain offset to canvas bounds
  const constrainOffset = (newOffset: { x: number; y: number }) => {
    const { width: containerWidth, height: containerHeight } = containerDimensions.value
    const { width: canvasWidth, height: canvasHeight } = canvasBounds.value
    
    // Calculate limits
    const maxOffsetX = 0
    const minOffsetX = Math.min(0, containerWidth - canvasWidth)
    const maxOffsetY = 0
    const minOffsetY = Math.min(0, containerHeight - canvasHeight)
    
    return {
      x: Math.max(minOffsetX, Math.min(maxOffsetX, newOffset.x)),
      y: Math.max(minOffsetY, Math.min(maxOffsetY, newOffset.y))
    }
  }

  // Update container dimensions
  const updateDimensions = () => {
    if (props.containerRef.value) {
      const rect = props.containerRef.value.getBoundingClientRect()
      containerDimensions.value = { width: rect.width, height: rect.height }
      
      // Initialize position at center if this is the first time
      if (offset.value.x === 0 && offset.value.y === 0 && rect.width > 0) {
        centerView()
      }
    }
  }

  // Center the view on the canvas
  const centerView = () => {
    const { width, height } = containerDimensions.value
    const { centerX, centerY } = canvasBounds.value
    
    offset.value = {
      x: -centerX + width / 2,
      y: -centerY + height / 2
    }
  }

  // Animation loop
  const animate = () => {
    if (Math.abs(velocity.value.x) > MIN_VELOCITY || Math.abs(velocity.value.y) > MIN_VELOCITY) {
      const newOffset = {
        x: offset.value.x + velocity.value.x,
        y: offset.value.y + velocity.value.y
      }
      
      offset.value = constrainOffset(newOffset)
      
      velocity.value.x *= FRICTION
      velocity.value.y *= FRICTION
      
      requestAnimationFrame(animate)
    }
  }

  // Mouse/touch event handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    dragStart.value = { x: clientX, y: clientY }
    dragStartOffset.value = { ...offset.value }
    totalDragDistance.value = 0
    dragStartTime.value = Date.now()
    isDragging.value = false
    justFinishedDragging.value = false
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (dragStart.value.x === 0 && dragStart.value.y === 0) return

    const deltaX = clientX - dragStart.value.x
    const deltaY = clientY - dragStart.value.y
    
    totalDragDistance.value = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (totalDragDistance.value > DRAG_THRESHOLD) {
      isDragging.value = true
      
      const newOffset = {
        x: dragStartOffset.value.x + deltaX,
        y: dragStartOffset.value.y + deltaY
      }
      
      offset.value = constrainOffset(newOffset)
      velocity.value = { x: 0, y: 0 }
    }
  }

  const handlePointerUp = (clientX: number, clientY: number) => {
    if (isDragging.value) {
      const deltaTime = Date.now() - dragStartTime.value
      const deltaX = clientX - dragStart.value.x
      const deltaY = clientY - dragStart.value.y
      
      if (deltaTime > 0 && totalDragDistance.value > DRAG_THRESHOLD) {
        const velocityMultiplier = Math.min(deltaTime, 100) / 100
        velocity.value = {
          x: (deltaX / deltaTime) * 16 * velocityMultiplier,
          y: (deltaY / deltaTime) * 16 * velocityMultiplier
        }
        animate()
      }
      
      justFinishedDragging.value = true
      setTimeout(() => {
        justFinishedDragging.value = false
      }, 300)
    }
    
    isDragging.value = false
    dragStart.value = { x: 0, y: 0 }
  }

  // Wheel handler
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    
    const newOffset = {
      x: offset.value.x - event.deltaX,
      y: offset.value.y - event.deltaY
    }
    
    offset.value = constrainOffset(newOffset)
    velocity.value = { x: 0, y: 0 }
  }

  // Navigation function for minimap
  const navigateTo = (position: { x: number; y: number }) => {
    const { width, height } = containerDimensions.value
    const newOffset = {
      x: -position.x + width / 2,
      y: -position.y + height / 2
    }
    
    offset.value = constrainOffset(newOffset)
    velocity.value = { x: 0, y: 0 }
  }

  // Check if user can click (not dragging)
  const canClick = computed(() => !justFinishedDragging.value && totalDragDistance.value <= DRAG_THRESHOLD)

  return {
    offset: readonly(offset),
    visibleItems,
    gridItems,
    containerDimensions: readonly(containerDimensions),
    canvasBounds: readonly(canvasBounds),
    canClick: readonly(canClick),
    updateDimensions,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    navigateTo
  }
}

export type { Position, GridItem, UseInfiniteCanvasOptions } 
