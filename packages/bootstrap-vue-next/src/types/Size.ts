export interface BaseSize {
  sm: unknown
  lg: unknown
}

export type Size = keyof BaseSize

/**
 * Button sizes. `xs` only exists for buttons and button groups (`.btn-xs`, `.btn-group-xs`):
 * Bootstrap has no extra small form control
 */
export type ButtonSize = Size | 'xs'
