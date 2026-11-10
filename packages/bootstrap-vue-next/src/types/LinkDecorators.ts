import type {ColorOpacity, ThemeColor} from './ColorTypes'
import type {HoverState} from './HoverState'

export type LinkOpacity = ColorOpacity
export type UnderlineOpacity = ColorOpacity
export type UnderlineOffset = 1 | 2 | 3 | '1' | '2' | '3'

/** A link's underline: its color (`.underline-<theme>`), offset and opacity */
export interface LinkUnderline {
  color?: ThemeColor | null
  offset?: HoverState<UnderlineOffset>
  opacity?: HoverState<UnderlineOpacity>
}
