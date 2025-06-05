export interface CanvasItem {
  image: string
  title: string
  link: string
  width?: number
  height?: number
  [key: string]: any
}

export interface Position {
  x: number
  y: number
}

export interface GridItem {
  position: Position
  index: number
  width: number
  height: number
  isVisible?: boolean
}

export interface ZoomOptions {
  minZoom?: number
  maxZoom?: number
  zoomFactor?: number
  enableCtrl?: boolean
  enableMeta?: boolean
  enableAlt?: boolean
}

export interface CanvasBounds {
  width: number
  height: number
  centerX?: number
  centerY?: number
}

export interface ContainerDimensions {
  width: number
  height: number
}

export interface UseInfiniteCanvasOptions {
  items: CanvasItem[]
  baseGap?: number
  zoomOptions?: ZoomOptions
  containerRef: Ref<HTMLElement | null>
}

export interface UseInfiniteCanvasReturn {
  offset: Readonly<Ref<Position>>
  zoom: Readonly<Ref<number>>
  visibleItems: ComputedRef<GridItem[]>
  gridItems: ComputedRef<GridItem[]>
  containerDimensions: Readonly<Ref<ContainerDimensions>>
  canvasBounds: Readonly<Ref<CanvasBounds>>
  canClick: Readonly<Ref<boolean>>
  updateDimensions: () => void
  handlePointerDown: (clientX: number, clientY: number) => void
  handlePointerMove: (clientX: number, clientY: number) => void
  handlePointerUp: (clientX: number, clientY: number) => void
  handleWheel: (event: WheelEvent) => void
  navigateTo: (position: Position) => void
}

export interface ImagePreloaderOptions {
  images: string[]
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export interface UseImagePreloaderReturn {
  progress: Readonly<Ref<number>>
  loadedCount: Readonly<Ref<number>>
  isLoading: Readonly<Ref<boolean>>
  isComplete: Readonly<Ref<boolean>>
  startPreloading: () => Promise<void>
}

export interface MinimapProps {
  items: CanvasItem[]
  gridItems: GridItem[]
  offset: Position
  zoom: number
  containerDimensions: ContainerDimensions
  canvasBounds: CanvasBounds
}

export interface LoaderProps {
  progress: number
  isVisible: boolean
}

export interface InfiniteCanvasProps<T = any> {
  items: T[]
  baseGap?: number
  zoomOptions?: ZoomOptions
}

export interface InfiniteCanvasEmits<T = any> {
  itemClick: [item: T, index: number]
} 
