export type RadiusElement =
  | 'circle'
  | 'pill'
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5

/** Per-side corner radius, rendered as `rounded-<side>` / `rounded-<side>-<value>` classes */
export type RadiusSides = Partial<
  Record<'top' | 'bottom' | 'start' | 'end', boolean | RadiusElement>
>

export type RadiusElementExtendables = {
  /** Rounds every corner. The common case; use `roundedSides` for per-side control */
  rounded?: boolean | RadiusElement
  roundedSides?: RadiusSides
}
