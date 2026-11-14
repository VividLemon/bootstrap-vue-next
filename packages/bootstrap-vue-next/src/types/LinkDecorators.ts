import type {ColorOpacity, ThemeColor} from './ColorTypes'
import type {HoverState} from './HoverState'

export type LinkOpacity = ColorOpacity
export type UnderlineOpacity = ColorOpacity
type UnderlineOffsetNumber = 1 | 2 | 3
export type UnderlineOffset = UnderlineOffsetNumber | `${UnderlineOffsetNumber}`

/** A link's underline: its color (`.underline-<theme>`), offset and opacity */
export interface LinkUnderline {
  color?: ThemeColor | null
  offset?: HoverState<UnderlineOffset>
  opacity?: HoverState<UnderlineOpacity>
}
