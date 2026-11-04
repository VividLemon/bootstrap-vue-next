/**
 * A value per interaction state. Keys are Bootstrap v6 class prefixes:
 * `xs` renders the class without a prefix, `hover` renders it with the `hover:` prefix.
 *
 * `{xs: 50, hover: 100}` → `link-50 hover:link-100`
 */
export type HoverState<T> = Partial<Record<'xs' | 'hover', T>>
