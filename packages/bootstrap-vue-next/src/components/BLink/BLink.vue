<template>
  <component
    :is="routerComponent"
    v-if="strategy === 'router' || strategy === 'nuxt'"
    v-bind="routerProps"
    custom
  >
    <template #default="link">
      <a
        ref="anchor"
        v-bind="routedAnchorAttrs(link)"
        @click="clicked($event, link)"
        @pointerenter="prefetchOnInteraction"
        @focus="prefetchOnInteraction"
      >
        <slot />
      </a>
    </template>
  </component>
  <component
    :is="routerComponent"
    v-else-if="strategy === 'component'"
    v-bind="{...componentProps, ...anchorAttrs}"
    :class="anchorClasses"
    @click="clicked($event)"
  >
    <slot />
  </component>
  <a
    v-else
    :href="props.disabled ? undefined : nativeHref"
    v-bind="anchorAttrs"
    :class="anchorClasses"
    @click="clicked($event)"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'
import {
  type Component,
  computed,
  getCurrentInstance,
  inject,
  type UnwrapRef,
  useAttrs,
  useTemplateRef,
} from 'vue'
import type {RouteLocationRaw, Router, UseLinkReturn} from 'vue-router'
import {useDefaults} from '../../composables/useDefaults'
import {useLinkClasses} from '../../composables/useLinkClasses'
import {collapseInjectionKey, navbarInjectionKey} from '../../utils/keys'
import {toPascalCase} from '../../utils/stringUtils'
import {warn} from '../../utils/console'
import type {BLinkEmits, BLinkProps, BLinkSlots} from '../../types'

// The template has three branches and must keep exactly one root element (no comments between
// them), because BButton, BNavItem, BBadge and others render BLink as their own root:
//
// 1. vue-router and Nuxt: the documented "extending RouterLink" pattern. The router component
//    runs in `custom` mode and only supplies `href`, `navigate` and the active state through its
//    slot; the anchor itself is ours. With one element in the slot it stays single-root.
// 2. A component that is neither RouterLink nor NuxtLink: it gets `to` and renders itself.
// 3. A plain anchor: no router, VitePress, external URLs, `href` only, and disabled links.
//    A disabled link has no `href`, as Bootstrap recommends, so nothing can follow it. Preventing
//    the click is not enough: VitePress handles link clicks in the capture phase on `window`,
//    before this component's own listener runs.
defineOptions({
  inheritAttrs: false,
})

const defaultActiveClass = 'active'

const _props = withDefaults(defineProps<BLinkProps>(), {
  active: undefined,
  activeClass: 'router-link-active',
  disabled: false,
  exactActiveClass: 'router-link-exact-active',
  href: undefined,
  icon: false,
  opacity: undefined,
  prefetchOn: undefined,
  noRel: false,
  prefetchedClass: undefined,
  prefetch: undefined,
  rel: undefined,
  replace: false,
  routerComponentName: 'router-link',
  stretched: false,
  target: undefined,
  to: undefined,
  underline: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BLink')
const emit = defineEmits<BLinkEmits>()
defineSlots<BLinkSlots>()
const attrs = useAttrs()

const instance = getCurrentInstance()

/** What RouterLink passes to its default slot (vue-router types it as `UnwrapRef<UseLinkReturn>`) */
type RouterLinkSlotScope = UnwrapRef<UseLinkReturn>

/**
 * What NuxtLink passes to its default slot in `custom` mode. Nuxt does not export this type
 * (`NuxtLinkSlotProps<true>` in `nuxt/dist/app/components/nuxt-link.d.ts`), so it is copied here
 */
type NuxtLinkSlotScope = Omit<RouterLinkSlotScope, 'href' | 'route'> & {
  href: string | null
  prefetch: () => Promise<void>
  prefetched: boolean
  shouldPrefetch: (mode: 'visibility' | 'interaction') => boolean
}

// The slot scope comes from whatever component is registered under the router name, so it is
// checked before use instead of trusted
const isRouterLinkSlotScope = (value: unknown): value is RouterLinkSlotScope =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as {navigate?: unknown}).navigate === 'function'

const isNuxtLinkSlotScope = (value: unknown): value is NuxtLinkSlotScope =>
  isRouterLinkSlotScope(value) &&
  typeof (value as {prefetch?: unknown}).prefetch === 'function' &&
  typeof (value as {shouldPrefetch?: unknown}).shouldPrefetch === 'function'

/**
 * `vue-router` and `nuxt` are optional, so neither can be imported. The router component is
 * looked up among the app's globally registered components instead: vue-router registers
 * `RouterLink`, Nuxt keeps `NuxtLink` global when the BootstrapVueNext Nuxt module is installed
 */
const routerComponent = computed<Component | null>(() => {
  const name = props.routerComponentName
  if (typeof name !== 'string') return name
  const app = instance?.appContext.app
  return app?.component(toPascalCase(name)) ?? app?.component(name) ?? null
})

/**
 * Recognised by name: `RouterLink` / `router-link` and `NuxtLink` / `nuxt-link` (or a component
 * object with that `name`) get the `custom` slot. Anything else is an ordinary component
 */
const routerKind = computed<'router' | 'nuxt' | 'component' | null>(() => {
  const component = routerComponent.value
  if (!component) return null
  const name = props.routerComponentName
  const resolvedName = toPascalCase(
    typeof name === 'string' ? name : ((component as {name?: string}).name ?? '')
  )
  if (resolvedName === 'RouterLink') return 'router'
  if (resolvedName === 'NuxtLink') return 'nuxt'
  return 'component'
})

/** A URL with a protocol, or protocol-relative: never a route */
const isExternal = (to: RouteLocationRaw): boolean =>
  typeof to === 'string' && /^([a-z][a-z\d+\-.]*:|\/\/)/i.test(to)

const strategy = computed<'router' | 'nuxt' | 'component' | 'native'>(() => {
  const {to} = props
  const kind = routerKind.value
  if (props.disabled || !to || kind === null || isExternal(to)) return 'native'
  if (kind !== 'nuxt') return kind
  // In `custom` mode NuxtLink only renders through RouterLink (a single root) for plain route
  // links. For links with a target and for hash-only links it returns the slot content as a
  // fragment, which breaks directives and attributes on components that render BLink as root
  if (props.target || (typeof to === 'string' && to.startsWith('#'))) return 'native'
  return 'nuxt'
})

const routerProps = computed(() => ({
  to: props.to,
  replace: props.replace,
  ...(strategy.value === 'nuxt'
    ? {
        prefetch: props.prefetch,
        prefetchOn: props.prefetchOn,
      }
    : undefined),
}))

// Some other router system, or one we do not explicitly support: we do not know what it accepts,
// so it gets everything we have. Props it does not declare end up as attributes
const componentProps = computed(() => ({
  to: props.to,
  replace: props.replace,
  prefetch: props.prefetch,
  prefetchOn: props.prefetchOn,
  prefetchedClass: props.prefetchedClass,
}))

/**
 * The href when no router component renders the link. A router that is installed still resolves
 * `to` (base path, named routes); without one `to` is used as written, which is what VitePress
 * needs: its router picks up clicks on any same-origin `<a href>`
 */
const nativeHref = computed(() => {
  const {to} = props
  const fallback = '#'
  if (to && !isExternal(to)) {
    const router = instance?.appContext.config.globalProperties.$router as Router | undefined
    if (router) {
      try {
        return router.resolve(to).href
      } catch {
        // No such route: fall through to what was written
      }
    }
  }
  if (props.href) return props.href
  if (!to) return fallback
  if (typeof to === 'string') return to
  if ('path' in to && to.path !== undefined) {
    const query = to.query
      ? `?${Object.entries(to.query)
          .filter(([, value]) => value !== undefined)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(String(value ?? ''))}`
          )
          .join('&')}`
      : ''
    const hash = !to.hash || to.hash.charAt(0) === '#' ? to.hash || '' : `#${to.hash}`
    return `${to.path}${query}${hash}` || fallback
  }
  // A named route cannot be resolved without a router
  warn(
    'BLink',
    'The `to` prop is a named route, but no router is installed to resolve it. Rendering href="#".',
    to
  )
  return fallback
})

const collapseData = inject(collapseInjectionKey, null)
const navbarData = inject(navbarInjectionKey, null)

const {classes: linkValueClasses} = useLinkClasses(props)
const anchorClasses = computed(() => [
  linkValueClasses.value,
  attrs.class,
  {
    [defaultActiveClass]: props.active,
    'disabled': props.disabled,
    'stretched-link': props.stretched,
  },
])

const computedRel = computed(() =>
  props.target === '_blank' ? (!props.rel && props.noRel ? 'noopener' : props.rel) : undefined
)
const computedTabIndex = computed(() =>
  props.disabled ? '-1' : (attrs.tabindex as string | number | undefined)
)

/** Everything on the anchor that does not depend on the router. `class` is bound separately */
const anchorAttrs = computed(() => {
  const rest = Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class'))
  // An attribute the parent set stays unless this component has a value of its own for it
  return {
    // Without `href` an anchor is not a link to assistive technology, and `aria-disabled` needs a
    // role to apply to. A role the parent set (BButton's `button`) wins
    ...(props.disabled && {role: 'link'}),
    ...rest,
    ...(props.target !== undefined && {target: props.target}),
    ...(computedRel.value !== undefined && {rel: computedRel.value}),
    ...(computedTabIndex.value !== undefined && {tabindex: computedTabIndex.value}),
    ...(props.disabled && {'aria-disabled': true}),
  }
})

/** The latest slot scope of NuxtLink, for prefetching */
let nuxtLink: NuxtLinkSlotScope | undefined

const routedAnchorAttrs = (link: unknown) => {
  nuxtLink = strategy.value === 'nuxt' && isNuxtLinkSlotScope(link) ? link : undefined
  const scope = isRouterLinkSlotScope(link) ? link : undefined
  return {
    ...anchorAttrs.value,
    'href': scope?.href ?? nativeHref.value,
    'aria-current': scope?.isExactActive ? ('page' as const) : undefined,
    'class': [
      anchorClasses.value,
      {
        [props.activeClass]: scope?.isActive === true,
        [props.exactActiveClass]: scope?.isExactActive === true,
      },
      nuxtLink?.prefetched ? props.prefetchedClass : undefined,
    ],
  }
}

// In `custom` mode NuxtLink does not prefetch by itself (it has no element to watch), but hands
// out what is needed to do it: `shouldPrefetch()` applies `prefetch` /
// `prefetchOn` and the app defaults, `prefetch()` does the work once
const anchorElement = useTemplateRef<HTMLAnchorElement>('anchor')
const prefetchOnInteraction = () => {
  if (nuxtLink?.shouldPrefetch('interaction')) void nuxtLink.prefetch()
}
useIntersectionObserver(
  // Only Nuxt links are observed
  () => (strategy.value === 'nuxt' ? anchorElement.value : null),
  (entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    if (nuxtLink?.shouldPrefetch('visibility')) void nuxtLink.prefetch()
  }
)

const clicked = (e: MouseEvent, link?: unknown): void => {
  if (props.disabled) {
    e.preventDefault()
    e.stopImmediatePropagation()
    return
  }

  if (
    (collapseData?.isNav?.value === true && navbarData === null) ||
    (navbarData !== null && navbarData.noAutoClose?.value !== true)
  ) {
    collapseData?.hide?.()
  }

  emit('click', e)
  // The router skips the navigation itself when a listener prevented the event, a modifier key
  // is held, or the link has a `target`
  if (isRouterLinkSlotScope(link)) void link.navigate(e)
}
</script>
