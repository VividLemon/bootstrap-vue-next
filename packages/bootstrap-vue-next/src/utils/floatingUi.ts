import type {Boundary, Placement, RootBoundary} from '@floating-ui/vue'
export {autoUpdate} from '@floating-ui/vue'

export const resolveBootstrapPlacement = (placement: Placement): string => {
  const [_placement] = placement.split('-')
  switch (_placement) {
    case 'left':
      return 'start'
    case 'right':
      return 'end'
    default:
      return _placement || 'start'
  }
}
export const resolveBootstrapCaret = (placement: Placement): string => {
  const [_placement] = placement.split('-')
  switch (_placement) {
    case 'left':
      return 'start'
    case 'right':
      return 'end'
    case 'top':
      return 'up'
    case 'bottom':
      return 'down'
    default:
      return _placement || 'start'
  }
}

export const isBoundary = (input: unknown): input is Boundary =>
  input === 'clippingAncestors' || input instanceof Element || Array.isArray(input)

export const isRootBoundary = (input: Boundary | RootBoundary): input is RootBoundary =>
  !isBoundary(input)
