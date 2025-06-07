/**
 * Physics constants for drag and scroll behavior
 */
export const PHYSICS = {
  /** Minimum velocity threshold for momentum animation */
  MIN_VELOCITY: 0.1,
  /** Friction coefficient for momentum decay */
  FRICTION: 0.92,
  /** Minimum distance to register as drag (px) */
  DRAG_THRESHOLD: 5,
} as const

/**
 * Touch interaction constants
 */
export const TOUCH = {
  /** Minimum distance to register as pinch gesture (px) */
  PINCH_THRESHOLD: 10,
  /** Throttle delay for touch events at normal zoom (ms) */
  THROTTLE_MS: 16,
  /** Throttle delay for touch events at high zoom (ms) */
  THROTTLE_MS_HIGH_ZOOM: 32,
  /** Maximum tap duration (ms) */
  TAP_DURATION: 300,
  /** Maximum tap movement distance (px) */
  TAP_DISTANCE: 10,
} as const

/**
 * Viewport and performance constants
 */
export const VIEWPORT = {
  /** Base buffer around viewport for item culling (px) */
  BASE_BUFFER: 300,
  /** Minimum buffer size (px) */
  MIN_BUFFER: 100,
  /** Maximum visible items */
  MAX_VISIBLE_ITEMS: 100,
  /** Base visible items calculation factor */
  VISIBLE_ITEMS_FACTOR: 120,
} as const

/**
 * Default zoom configuration
 */
export const ZOOM_DEFAULTS = {
  /** Minimum zoom level (40%) */
  MIN: 0.4,
  /** Maximum zoom level (220%) */
  MAX: 2.2,
  /** Zoom factor per step */
  FACTOR: 1.08,
  /** High zoom threshold for performance optimizations */
  HIGH_ZOOM_THRESHOLD: 1.5,
} as const 
