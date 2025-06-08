/**
 * @fileoverview Type definitions for the Infinite Canvas module
 */

/**
 * Basic item that can be displayed on the canvas
 */
export interface CanvasItem {
  /** URL to the image or video */
  image: string
  /** Display title */
  title: string
  /** External link URL */
  link: string
  /** Item width in pixels (optional, defaults to 300) */
  width?: number
  /** Item height in pixels (optional, defaults to 300) */
  height?: number
  /** Additional properties */
  [key: string]: any
}

/**
 * 2D coordinate position
 */
export interface Position {
  /** X coordinate */
  x: number
  /** Y coordinate */
  y: number
}

/**
 * Grid item with position and dimensions
 */
export interface GridItem {
  /** Position on the canvas */
  position: Position
  /** Index in the original items array */
  index: number
  /** Item width in pixels */
  width: number
  /** Item height in pixels */
  height: number
  /** Whether the item is currently visible (computed) */
  isVisible?: boolean
}

/**
 * Zoom configuration options
 */
export interface ZoomOptions {
  /** Minimum zoom level (default: 0.4) */
  minZoom?: number
  /** Maximum zoom level (default: 2.2) */
  maxZoom?: number
  /** Zoom factor per step (default: 1.08) */
  zoomFactor?: number
  /** Enable Ctrl key for zooming (default: true) */
  enableCtrl?: boolean
  /** Enable Meta key for zooming (default: true) */
  enableMeta?: boolean
  /** Enable Alt key for zooming (default: true) */
  enableAlt?: boolean
}

/**
 * Canvas boundaries and dimensions
 */
export interface CanvasBounds {
  /** Canvas width in pixels */
  width: number
  /** Canvas height in pixels */
  height: number
  /** Center X coordinate (computed) */
  centerX?: number
  /** Center Y coordinate (computed) */
  centerY?: number
}

/**
 * Container dimensions
 */
export interface ContainerDimensions {
  /** Container width in pixels */
  width: number
  /** Container height in pixels */
  height: number
}

/**
 * Options for the useInfiniteCanvas composable
 */
export interface UseInfiniteCanvasOptions {
  /** Array of items to display */
  items: CanvasItem[]
  /** Minimum gap between items in pixels (default: 40) */
  baseGap?: number
  /** Zoom configuration */
  zoomOptions?: ZoomOptions
  /** Reference to the container element */
  containerRef: Ref<HTMLElement | null>
}

/**
 * Return type of the useInfiniteCanvas composable
 */
export interface UseInfiniteCanvasReturn {
  /** Current canvas offset */
  offset: Readonly<Ref<Position>>
  /** Current zoom level */
  zoom: Readonly<Ref<number>>
  /** Currently visible items */
  visibleItems: ComputedRef<GridItem[]>
  /** All positioned grid items */
  gridItems: ComputedRef<GridItem[]>
  /** Container dimensions */
  containerDimensions: Readonly<Ref<ContainerDimensions>>
  /** Canvas boundaries */
  canvasBounds: Readonly<Ref<CanvasBounds>>
  /** Whether clicks are allowed (not dragging) */
  canClick: Readonly<Ref<boolean>>
  /** Update container dimensions */
  updateDimensions: () => void
  /** Handle pointer down events */
  handlePointerDown: (clientX: number, clientY: number) => void
  /** Handle pointer move events */
  handlePointerMove: (clientX: number, clientY: number) => void
  /** Handle pointer up events */
  handlePointerUp: (clientX: number, clientY: number) => void
  /** Handle wheel events */
  handleWheel: (event: WheelEvent) => void
  /** Handle touch start events */
  handleTouchStart: (event: TouchEvent) => void
  /** Handle touch move events */
  handleTouchMove: (event: TouchEvent) => void
  /** Handle touch end events */
  handleTouchEnd: (event: TouchEvent) => void
  /** Navigate to a specific position */
  navigateTo: (position: Position) => void
}

/**
 * Options for the image preloader
 */
export interface ImagePreloaderOptions {
  /** Array of image/video URLs to preload */
  images: string[]
  /** Progress callback (0-1) */
  onProgress?: (progress: number) => void
  /** Completion callback */
  onComplete?: () => void
}

/**
 * Return type of the useImagePreloader composable
 */
export interface UseImagePreloaderReturn {
  /** Loading progress (0-1) */
  progress: Readonly<Ref<number>>
  /** Number of loaded items */
  loadedCount: Readonly<Ref<number>>
  /** Whether currently loading */
  isLoading: Readonly<Ref<boolean>>
  /** Whether loading is complete */
  isComplete: Readonly<Ref<boolean>>
  /** Start the preloading process */
  startPreloading: () => Promise<void>
}

/**
 * Props for the minimap component
 */
export interface MinimapProps {
  /** Canvas items */
  items: CanvasItem[]
  /** Grid items with positions */
  gridItems: GridItem[]
  /** Current canvas offset */
  offset: Position
  /** Current zoom level */
  zoom: number
  /** Container dimensions */
  containerDimensions: ContainerDimensions
  /** Canvas boundaries */
  canvasBounds: CanvasBounds
}

/**
 * Props for the loader component
 */
export interface LoaderProps {
  /** Loading progress (0-1) */
  progress: number
  /** Whether the loader is visible */
  isVisible: boolean
  /** Optional title */
  title?: string
  /** Optional description */
  description?: string
}

/**
 * Props for the InfiniteCanvas component
 */
export interface InfiniteCanvasProps<T = any> {
  /** Array of items to display */
  items: T[]
  /** Minimum gap between items (default: 40) */
  baseGap?: number
  /** Zoom configuration */
  zoomOptions?: ZoomOptions
}

/**
 * Events emitted by the InfiniteCanvas component
 */
export interface InfiniteCanvasEmits<T = any> {
  /** Emitted when an item is clicked */
  itemClick: [item: T, index: number]
} 
