import type { BLinkProps } from 'bootstrap-vue-next'
import type { PropRecord, PropRecordWithOptions } from '../types'

export const linkTo = '/docs/components/link'

export const linkProps = {
  active: {
    type: 'boolean',
    default: undefined,
    description: 'When set to `true`, places the component in the active state with active styling',
  },
  activeClass: {
    type: 'string',
    default: 'router-link-active',
    description: 'Configure the active CSS class applied when the link is active.',
  },
  color: {
    type: 'LinkColorExtendables | null',
    default: undefined,
    description:
      'Colors the link with one object: `theme` renders `theme-*`, `bg` renders `bg-*`, `fg` renders `fg-*` and `underline` sets the underline color (`underline-*`) independently of the link text',
  },
  disabled: {
    type: 'boolean',
    default: false,
    description:
      "When set to `true`, disables the link's functionality. See above for details and limitations",
  },
  exactActiveClass: {
    type: 'string',
    default: 'router-link-exact-active',
    description: 'Configure the active CSS class applied when the link is active with exact match.',
  },
  href: {
    type: 'string',
    default: undefined,
    description: 'Denotes the target URL of the link for standard a links',
  },
  icon: {
    type: 'boolean',
    default: false,
    description: 'When set to `true`, styles an icon at the beginning or end of the link text',
  },
  noPrefetch: {
    type: 'boolean',
    default: false,
    description:
      'To improve the responsiveness of your Nuxt.js applications, when the link will be displayed within the viewport, Nuxt.js will automatically prefetch the code splitted page. Setting `no-prefetch` will disabled this feature for the specific link',
  },
  opacity: {
    type: 'HoverState<LinkOpacity>',
    default: undefined,
    description:
      'Change the alpha opacity of the link color. `xs` renders `link-*`, `hover` renders `hover:link-*`, e.g. `{ xs: 50, hover: 100 }`. Values are `10` to `100` in steps of 10',
  },
  prefetch: {
    type: 'boolean',
    default: undefined,
    description:
      'To improve the responsiveness of your Nuxt.js applications, when the link will be displayed within the viewport, Nuxt.js will automatically prefetch the code splitted page. Setting `prefetch` to `true` or `false` will overwrite the default value of `router.prefetchLinks`',
  },
  prefetchedClass: {
    type: 'string',
    default: undefined,
    description: 'Not Yet Implmented: A class to apply to links that have been prefetched.',
  },
  prefetchOn: {
    type: 'Partial<{visibility: boolean, interaction: boolean}>',
    default: undefined,
    description:
      "Allows custom control of when to prefetch links. Possible options are 'interaction' and 'visibility' (default).",
  },
  noRel: {},
  rel: {
    type: 'string',
    default: undefined,
    description: "Sets the 'rel' attribute on the rendered link",
  },
  replace: {
    type: 'boolean',
    default: false,
    description:
      'Setting replace prop will call router.replace() instead of router.push() when clicked',
  },
  routerComponentName: {
    type: 'string',
    default: 'router-link',
    description:
      'BootstrapVue auto detects between `<router-link>` and `<nuxt-link>`. Set this this property to explicity set the name of the router component.',
  },
  routerTag: {
    type: 'string',
    default: 'a',
    description: 'Set the tag type for the link',
  },
  stretched: {
    type: 'boolean',
    default: false,
    description:
      "When set to `true`, makes the link's `containing block` clickable via an `::after` pseudo element",
  },
  target: {
    type: 'LinkTarget',
    default: undefined,
    description: "Sets the 'target' attribute on the rendered link",
  },
  to: {
    type: 'RouteLocationRaw',
    default: undefined,
    description:
      'Denotes the target route of the link. When clicked, the value of the to prop will be passed to `router.push()` internally',
  },
  underlineOffset: {
    type: 'HoverState<UnderlineOffset>',
    default: undefined,
    description:
      'Change the distance of the underline from the bottom of the link text. `xs` renders `underline-offset-*`, `hover` renders `hover:underline-offset-*`. Values are `1` to `3`',
  },
  underlineOpacity: {
    type: 'HoverState<UnderlineOpacity>',
    default: undefined,
    description:
      "Set the opacity of the link's underline. `xs` renders `underline-*`, `hover` renders `hover:underline-*`. Values are `10` to `100` in steps of 10",
  },
  // TODO: remove the hard-coded NYI props below when they are implemented
} as const satisfies PropRecord<keyof BLinkProps | 'noPrefetch' | 'prefetch' | 'prefetchedClass'>

export const linkedBLinkSection = {
  _opts: {
    linkTo,
  },
  _data: linkProps,
} as const satisfies PropRecordWithOptions
