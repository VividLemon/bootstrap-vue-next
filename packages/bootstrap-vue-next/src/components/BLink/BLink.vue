<template>
  <component
    :is="routerComponent"
    v-if="strategy === 'router' || strategy === 'nuxt'"
    v-bind="routerProps"
    custom
  >
    <template #default="link">
      <a
        :ref="setAnchor"
        v-bind="routedAnchorAttrs(link)"
        @click="clicked($event, link.navigate)"
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
  <a v-else :href="nativeHref" v-bind="anchorAttrs" :class="anchorClasses" @click="clicked($event)">
    <slot />
  </a>
</template>

<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'
import {
  type Component,
  computed,
  type ComponentPublicInstance,
  getCurrentInstance,
  inject,
  shallowRef,
  useAttrs,
} from 'vue'
import type {RouteLocationRaw, Router} from 'vue-router'
import {useDefaults} from '../../composables/useDefaults'
import {useLinkClasses} from '../../composables/useLinkClasses'
import {collapseInjectionKey, navbarInjectionKey} from '../../utils/keys'
import {toPascalCase} from '../../utils/stringUtils'
import type {BLinkEmits, BLinkProps, BLinkSlots} from '../../types'

// The template has three branches and must keep exactly one root element (no comments between
// them), because BButton, BNavItem, BBadge and others render BLink as their own root:
//
// 1. vue-router and Nuxt: the documented "extending RouterLink" pattern. The router component
//    runs in `custom` mode and only supplies `href`, `navigate` and the active state through its
//    slot; the anchor itself is ours. With one element in the slot it stays single-root.
// 2. A component that is neither RouterLink nor NuxtLink: it gets `to` and renders itself.
// 3. A plain anchor: no router, VitePress, external URLs, `href` only, and disabled links.
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
  opacityHover: undefined,
  noPrefetch: undefined,
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
  underlineOffset: undefined,
  underlineOffsetHover: undefined,
  underlineOpacity: undefined,
  underlineOpacityHover: undefined,
  underlineVariant: null,
  variant: null,
})
const props = useDefaults(_props, 'BLink')
const emit = defineEmits<BLinkEmits>()
defineSlots<BLinkSlots>()
const attrs = useAttrs()

const instance = getCurrentInstance()

/**
 * What RouterLink and NuxtLink pass to their default slot in `custom` mode. The prefetch members
 * are NuxtLink's.
 */
interface RouterLinkSlotProps {
  href?: string | null
  navigate: (e?: MouseEvent) => unknown
  isActive?: boolean
  isExactActive?: boolean
  prefetch?: () => unknown
  prefetched?: boolean
  shouldPrefetch?: (mode: 'visibility' | 'interaction') => boolean
}

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
 * Recognised by shape, not by name: both real components carry a static `useLink`, and only
 * NuxtLink has the prefetch props. Anything else registered under the same name (a stub, a
 * wrapper) is treated as an ordinary component, because it cannot be trusted to implement the
 * `custom` slot
 */
const routerKind = computed<'router' | 'nuxt' | 'component' | null>(() => {
  const component = routerComponent.value
  if (!component) return null
  if (typeof component !== 'object' || !('useLink' in component)) return 'component'
  const componentProps = (component as {props?: Record<string, unknown>}).props
  return componentProps && 'prefetchOn' in componentProps ? 'nuxt' : 'router'
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
        ...(props.noPrefetch ? {noPrefetch: true} : {prefetch: props.prefetch}),
        prefetchOn: props.prefetchOn,
      }
    : undefined),
}))

// We do not know what this component accepts. Props it does not declare end up as attributes
const componentProps = computed(() => ({
  to: props.to,
  replace: props.replace,
  ...(props.noPrefetch ? {noPrefetch: props.noPrefetch} : {prefetch: props.prefetch}),
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
  return fallback
})

const collapseData = inject(collapseInjectionKey, null)
const navbarData = inject(navbarInjectionKey, null)

const linkValueClasses = useLinkClasses(props)
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
    ...rest,
    ...(props.target !== undefined && {target: props.target}),
    ...(computedRel.value !== undefined && {rel: computedRel.value}),
    ...(computedTabIndex.value !== undefined && {tabindex: computedTabIndex.value}),
    ...(props.disabled && {'aria-disabled': true}),
  }
})

/** The latest slot props of NuxtLink, for prefetching */
let nuxtLink: RouterLinkSlotProps | undefined

const routedAnchorAttrs = (link: RouterLinkSlotProps) => {
  nuxtLink = strategy.value === 'nuxt' ? link : undefined
  return {
    ...anchorAttrs.value,
    'href': link.href ?? nativeHref.value,
    'aria-current': link.isExactActive ? ('page' as const) : undefined,
    'class': [
      anchorClasses.value,
      {
        [props.activeClass]: link.isActive === true,
        [props.exactActiveClass]: link.isExactActive === true,
      },
      link.prefetched ? props.prefetchedClass : undefined,
    ],
  }
}

// In `custom` mode NuxtLink does not prefetch by itself (it has no element to watch), but hands
// out what is needed to do it: `shouldPrefetch()` applies `prefetch` / `noPrefetch` /
// `prefetchOn` and the app defaults, `prefetch()` does the work once
const anchor = shallowRef<HTMLElement | null>(null)
const setAnchor = (el: Element | ComponentPublicInstance | null) => {
  anchor.value = el instanceof HTMLElement ? el : null
}
const prefetchOnInteraction = () => {
  if (nuxtLink?.shouldPrefetch?.('interaction')) void nuxtLink.prefetch?.()
}
useIntersectionObserver(
  // Only Nuxt links are observed
  () => (strategy.value === 'nuxt' ? anchor.value : null),
  (entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    if (nuxtLink?.shouldPrefetch?.('visibility')) void nuxtLink.prefetch?.()
  }
)

const clicked = (e: MouseEvent, navigate?: RouterLinkSlotProps['navigate']): void => {
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
  void navigate?.(e)
}
</script>
