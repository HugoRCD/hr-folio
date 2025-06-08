/**
 * @fileoverview Main composable for infinite canvas functionality
 */

import type { 
  CanvasItem, 
  Position, 
  GridItem,
  UseInfiniteCanvasOptions,
  UseInfiniteCanvasReturn 
} from '../types'
import { PHYSICS, TOUCH, VIEWPORT, ZOOM_DEFAULTS } from '../constants'
import { getTouchDistance, getTouchCenter, clamp } from '../utils'

/**
 * Creates an infinite canvas with drag, zoom, and virtualization support
 * @param options Configuration options
 * @returns Canvas state and event handlers
 */
export function useInfiniteCanvas(options: UseInfiniteCanvasOptions): UseInfiniteCanvasReturn {
  const { items, baseGap = 40, zoomOptions, containerRef } = options

  // Canvas state
  const offset = ref<Position>({ x: 0, y: 0 })
  const velocity = ref<Position>({ x: 0, y: 0 })
  const zoom = ref(1)
  const containerDimensions = ref({ width: 0, height: 0 })

  // Interaction state
  const isDragging = ref(false)
  const justFinishedDragging = ref(false)
  const dragStart = ref<Position>({ x: 0, y: 0 })
  const dragStartOffset = ref<Position>({ x: 0, y: 0 })
  const totalDragDistance = ref(0)
  const dragStartTime = ref(0)

  // Touch state
  const isPinching = ref(false)
  const initialPinchDistance = ref(0)
  const initialPinchZoom = ref(1)
  const pinchCenter = ref<Position & { canvasX?: number; canvasY?: number }>({ x: 0, y: 0 })
  const touchStartTime = ref(0)
  const wasPinching = ref(false)

  /**
   * Calculate canvas bounds based on item count
   */
  const canvasBounds = computed(() => {
    const canvasSize = Math.max(4000, items.length * 100)
    return { 
      width: canvasSize, 
      height: canvasSize, 
      centerX: canvasSize / 2,
      centerY: canvasSize / 2
    }
  })

  /**
   * Check collision between two positioned items
   */
  const checkCollision = (
    pos1: Position, 
    size1: { width: number; height: number },
    pos2: Position, 
    size2: { width: number; height: number }
  ): boolean => {
    const gap = baseGap
    return !(
      pos1.x + size1.width + gap < pos2.x ||
      pos2.x + size2.width + gap < pos1.x ||
      pos1.y + size1.height + gap < pos2.y ||
      pos2.y + size2.height + gap < pos1.y
    )
  }

  /**
   * Find a valid position for an item using spiral placement
   */
  const findValidPosition = (index: number, placedItems: GridItem[]): Position => {
    const { centerX = 0, centerY = 0 } = canvasBounds.value
    const itemWidth = items[index]?.width || 300
    const itemHeight = items[index]?.height || 300
    
    if (index === 0) {
      return { 
        x: centerX - itemWidth / 2, 
        y: centerY - itemHeight / 2 
      }
    }

    let radius = 200
    const maxRadius = 2000
    const angleStep = 0.5
    
    while (radius < maxRadius) {
      for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
        const x = centerX + Math.cos(angle) * radius - itemWidth / 2
        const y = centerY + Math.sin(angle) * radius - itemHeight / 2
        const newPosition = { x, y }
        
        const hasCollision = placedItems.some(placedItem =>
          checkCollision(
            newPosition,
            { width: itemWidth, height: itemHeight },
            placedItem.position,
            { width: placedItem.width, height: placedItem.height }
          )
        )
        
        if (!hasCollision) {
          return newPosition
        }
      }
      radius += 150
    }
    
    return { x: centerX, y: centerY }
  }

  /**
   * Calculate positions for all grid items
   */
  const gridItems = computed<GridItem[]>(() => {
    const placedItems: GridItem[] = []
    
    return items.map((item, index) => {
      const position = findValidPosition(index, placedItems)
      const gridItem: GridItem = { 
        position, 
        index,
        width: item.width || 300,
        height: item.height || 300
      }
      placedItems.push(gridItem)
      return gridItem
    })
  })

  /**
   * Constrain offset to canvas bounds
   */
  const constrainOffset = (newOffset: Position): Position => {
    const { width, height } = containerDimensions.value
    const { width: canvasWidth, height: canvasHeight } = canvasBounds.value
    const currentZoom = zoom.value
    
    const maxOffsetX = width - canvasWidth * currentZoom
    const maxOffsetY = height - canvasHeight * currentZoom
    
    return {
      x: clamp(newOffset.x, maxOffsetX, 0),
      y: clamp(newOffset.y, maxOffsetY, 0)
    }
  }

  /**
   * Throttled visible items calculation to reduce flickering during zoom
   */
  const _visibleItemsCache = ref<GridItem[]>([])
  let _lastVisibleItemsUpdate = 0
  
  const calculateVisibleItems = () => {
    const { width, height } = containerDimensions.value
    const currentZoom = zoom.value
    
    // Increase buffer during pinching to reduce flickering
    const baseBuffer = isPinching.value 
      ? VIEWPORT.BASE_BUFFER * 1.5 
      : VIEWPORT.BASE_BUFFER
    
    const buffer = Math.max(
      VIEWPORT.MIN_BUFFER, 
      baseBuffer / Math.max(currentZoom, 1)
    )
    
    const viewportLeft = (-offset.value.x) / currentZoom - buffer
    const viewportRight = (-offset.value.x + width) / currentZoom + buffer
    const viewportTop = (-offset.value.y) / currentZoom - buffer
    const viewportBottom = (-offset.value.y + height) / currentZoom + buffer
    
    const maxVisibleItems = Math.min(
      VIEWPORT.MAX_VISIBLE_ITEMS, 
      Math.ceil(VIEWPORT.VISIBLE_ITEMS_FACTOR / currentZoom)
    )
    
    const visibleItemsList = gridItems.value.filter(gridItem => {
      const itemRight = gridItem.position.x + gridItem.width
      const itemBottom = gridItem.position.y + gridItem.height
      
      return (
        gridItem.position.x < viewportRight &&
        itemRight > viewportLeft &&
        gridItem.position.y < viewportBottom &&
        itemBottom > viewportTop
      )
    })
    
    if (visibleItemsList.length > maxVisibleItems) {
      const centerX = (-offset.value.x + width / 2) / currentZoom
      const centerY = (-offset.value.y + height / 2) / currentZoom
      
      return visibleItemsList
        .map(item => ({
          ...item,
          distanceToCenter: Math.sqrt(
            Math.pow(item.position.x + item.width / 2 - centerX, 2) +
            Math.pow(item.position.y + item.height / 2 - centerY, 2)
          )
        }))
        .sort((a, b) => a.distanceToCenter - b.distanceToCenter)
        .slice(0, maxVisibleItems)
    }
    
    return visibleItemsList
  }

  const visibleItems = computed(() => {
    const now = Date.now()
    const updateDelay = isPinching.value ? 50 : 16 // Throttle more during pinching for stability
    
    // Throttle updates during rapid changes to reduce flickering
    if (now - _lastVisibleItemsUpdate > updateDelay || !isPinching.value) {
      _lastVisibleItemsUpdate = now
      const newVisibleItems = calculateVisibleItems()
      
      // During pinching, only update if there's a significant change
      if (isPinching.value) {
        const currentCount = _visibleItemsCache.value.length
        const newCount = newVisibleItems.length
        const changeThreshold = Math.max(2, Math.floor(currentCount * 0.1))
        
        if (Math.abs(newCount - currentCount) >= changeThreshold) {
          _visibleItemsCache.value = newVisibleItems
        }
      } else {
        _visibleItemsCache.value = newVisibleItems
      }
    }
    
    return _visibleItemsCache.value
  })

  /**
   * Update container dimensions and center view if needed
   */
  const updateDimensions = () => {
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect()
      containerDimensions.value = { width: rect.width, height: rect.height }
      
      if (offset.value.x === 0 && offset.value.y === 0 && rect.width > 0) {
        centerView()
      }
    }
  }

  /**
   * Center the view on the canvas
   */
  const centerView = () => {
    const { width, height } = containerDimensions.value
    const { centerX = 0, centerY = 0 } = canvasBounds.value
    
    offset.value = {
      x: -centerX + width / 2,
      y: -centerY + height / 2
    }
  }

  /**
   * Animation loop for momentum
   */
  const animate = () => {
    if (Math.abs(velocity.value.x) > PHYSICS.MIN_VELOCITY || 
        Math.abs(velocity.value.y) > PHYSICS.MIN_VELOCITY) {
      offset.value = constrainOffset({
        x: offset.value.x + velocity.value.x,
        y: offset.value.y + velocity.value.y
      })
      
      velocity.value.x *= PHYSICS.FRICTION
      velocity.value.y *= PHYSICS.FRICTION
      
      requestAnimationFrame(animate)
    }
  }

  // Event handlers
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

    if (totalDragDistance.value > PHYSICS.DRAG_THRESHOLD) {
      isDragging.value = true
      
      offset.value = constrainOffset({
        x: dragStartOffset.value.x + deltaX,
        y: dragStartOffset.value.y + deltaY
      })
      
      velocity.value = { x: 0, y: 0 }
    }
  }

  const handlePointerUp = (clientX: number, clientY: number) => {
    if (isDragging.value) {
      const deltaTime = Date.now() - dragStartTime.value
      const deltaX = clientX - dragStart.value.x
      const deltaY = clientY - dragStart.value.y
      
      if (deltaTime > 0 && totalDragDistance.value > PHYSICS.DRAG_THRESHOLD) {
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

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    
    const opts = zoomOptions || {}
    const minZoom = opts.minZoom ?? ZOOM_DEFAULTS.MIN
    const maxZoom = opts.maxZoom ?? ZOOM_DEFAULTS.MAX
    const zoomFactor = opts.zoomFactor ?? ZOOM_DEFAULTS.FACTOR
    const zoomFactorOut = 1 / zoomFactor
    
    const isZoomModifier = (
      (opts.enableCtrl !== false && event.ctrlKey) ||
      (opts.enableMeta !== false && event.metaKey) ||
      (opts.enableAlt !== false && event.altKey)
    )
    
    if (isZoomModifier) {
      const newZoom = clamp(
        zoom.value * (event.deltaY > 0 ? zoomFactorOut : zoomFactor),
        minZoom,
        maxZoom
      )
      
      const rect = containerRef.value?.getBoundingClientRect()
      if (rect) {
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top
        
        const oldZoom = zoom.value
        const pointX = (mouseX - offset.value.x) / oldZoom
        const pointY = (mouseY - offset.value.y) / oldZoom
        
        zoom.value = newZoom
        
        offset.value = constrainOffset({
          x: mouseX - pointX * newZoom,
          y: mouseY - pointY * newZoom
        })
      } else {
        zoom.value = newZoom
      }
    } else {
      offset.value = constrainOffset({
        x: offset.value.x - event.deltaX,
        y: offset.value.y - event.deltaY
      })
    }
    
    velocity.value = { x: 0, y: 0 }
  }

  const navigateTo = (position: Position) => {
    const { width, height } = containerDimensions.value
    offset.value = constrainOffset({
      x: -position.x + width / 2,
      y: -position.y + height / 2
    })
    velocity.value = { x: 0, y: 0 }
  }

  // Touch handlers
  const handleTouchStart = (event: TouchEvent) => {
    // Only prevent default for multi-touch to allow single touch scrolling
    if (event.touches.length > 1) {
      event.preventDefault()
    }
    
    const touches = Array.from(event.touches)
    touchStartTime.value = Date.now()
    wasPinching.value = false
    
    if (touches.length === 1 && touches[0]) {
      const [touch] = touches
      handlePointerDown(touch.clientX, touch.clientY)
      isPinching.value = false
    } else if (touches.length === 2 && touches[0] && touches[1]) {
      const [touch1, touch2] = touches
      isPinching.value = true
      wasPinching.value = true
      initialPinchDistance.value = getTouchDistance(touch1, touch2)
      initialPinchZoom.value = zoom.value
      
      const rect = containerRef.value?.getBoundingClientRect()
      if (rect) {
        const center = getTouchCenter(touch1, touch2)
        // Store the center in canvas coordinates (accounting for current transform)
        const canvasX = (center.x - rect.left - offset.value.x) / zoom.value
        const canvasY = (center.y - rect.top - offset.value.y) / zoom.value
        pinchCenter.value = {
          x: center.x - rect.left,
          y: center.y - rect.top,
          canvasX,
          canvasY
        }
      }
      
      isDragging.value = false
      velocity.value = { x: 0, y: 0 }
    }
  }

  let lastTouchMoveCall = 0
  const handleTouchMove = (event: TouchEvent) => {
    // Prevent default only for multi-touch (pinch/zoom)
    if (event.touches.length > 1) {
      event.preventDefault()
    }
    
    const now = Date.now()
    // Reduce throttling during pinch for smoother zoom
    const throttleDelay = isPinching.value 
      ? 8 // More frequent updates during pinch
      : (zoom.value > ZOOM_DEFAULTS.HIGH_ZOOM_THRESHOLD 
        ? TOUCH.THROTTLE_MS_HIGH_ZOOM 
        : TOUCH.THROTTLE_MS)
    
    if (now - lastTouchMoveCall < throttleDelay) return
    lastTouchMoveCall = now
    
    const touches = Array.from(event.touches)
    
    if (touches.length === 1 && !isPinching.value && touches[0]) {
      const [touch] = touches
      handlePointerMove(touch.clientX, touch.clientY)
    } else if (touches.length === 2 && isPinching.value && touches[0] && touches[1]) {
      const [touch1, touch2] = touches
      const currentDistance = getTouchDistance(touch1, touch2)
      const distanceChange = currentDistance - initialPinchDistance.value
      
      if (Math.abs(distanceChange) > TOUCH.PINCH_THRESHOLD) {
        const opts = zoomOptions || {}
        const minZoom = opts.minZoom ?? ZOOM_DEFAULTS.MIN
        const maxZoom = opts.maxZoom ?? ZOOM_DEFAULTS.MAX
        
        const zoomFactor = 1 + (distanceChange / initialPinchDistance.value) * 1.2
        const newZoom = clamp(initialPinchZoom.value * zoomFactor, minZoom, maxZoom)
        
        // Use the stored canvas coordinates if available for more stable zooming
        let pointX, pointY
        if (pinchCenter.value.canvasX !== undefined && pinchCenter.value.canvasY !== undefined) {
          pointX = pinchCenter.value.canvasX
          pointY = pinchCenter.value.canvasY
        } else {
          // Fallback to the old method
          const oldZoom = zoom.value
          pointX = (pinchCenter.value.x - offset.value.x) / oldZoom
          pointY = (pinchCenter.value.y - offset.value.y) / oldZoom
        }
        
        // Batch zoom and offset updates to reduce flickering
        const newOffset = constrainOffset({
          x: pinchCenter.value.x - pointX * newZoom,
          y: pinchCenter.value.y - pointY * newZoom
        })
        
        // Apply changes in a single frame
        requestAnimationFrame(() => {
          zoom.value = newZoom
          offset.value = newOffset
        })
      }
    }
  }

  const handleTouchEnd = (event: TouchEvent) => {
    // Only prevent default if we were handling multi-touch
    if (wasPinching.value || isPinching.value) {
      event.preventDefault()
    }
    
    const touches = Array.from(event.touches)
    const touchDuration = Date.now() - touchStartTime.value
    
    if (touches.length === 0) {
      if (isPinching.value || wasPinching.value) {
        isPinching.value = false
        wasPinching.value = false
        // Force a clean update of visible items after pinching ends
        setTimeout(() => {
          _visibleItemsCache.value = calculateVisibleItems()
        }, 100)
      } else {
        const changedTouches = Array.from(event.changedTouches)
        const [touch] = changedTouches
        if (touch) {
          if (touchDuration < TOUCH.TAP_DURATION && 
              totalDragDistance.value <= TOUCH.TAP_DISTANCE) {
            isDragging.value = false
            justFinishedDragging.value = false
            totalDragDistance.value = 0
          }
          handlePointerUp(touch.clientX, touch.clientY)
        }
      }
    } else if (touches.length === 1 && isPinching.value && touches[0]) {
      isPinching.value = false
      const [touch] = touches
      handlePointerDown(touch.clientX, touch.clientY)
    }
  }

  const canClick = computed(() => 
    !justFinishedDragging.value && 
    !isPinching.value && 
    totalDragDistance.value <= PHYSICS.DRAG_THRESHOLD
  )

  return {
    offset: readonly(offset),
    zoom: readonly(zoom),
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
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    navigateTo
  }
} 
