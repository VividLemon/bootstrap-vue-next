<template>
  <component :is="tag" v-bind="isOfRouterType ? routerLinkProps : computedSpecificProps">
    <template #default="scope">
      <a
        v-if="isOfRouterType"
        :class="computedClasses(scope?.isActive, scope?.isExactActive)"
        :target="props.target"
        :href="scope?.href"
        :rel="computedRel"
        :tabindex="computedTabIndex"
        :aria-disabled="props.disabled ? true : undefined"
        @click="
          (e: MouseEvent) => {
            clicked(e)
            scope?.navigate?.(e)
          }
        "
      >
        <slot />
      </a>
      <slot v-else />
    </template>
  </component>
</template>

<script setup lang="ts">
import {useDefaults} from '../../composables/useDefaults'
import {useLinkClasses} from '../../composables/useLinkClasses'
import {collapseInjectionKey, navbarInjectionKey} from '../../utils/keys'
import {computed, getCurrentInstance, inject, useAttrs} from 'vue'
import {toPascalCase} from '../../utils/stringUtils'
import type {BLinkEmits, BLinkProps, BLinkSlots} from '../../types'

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
  routerTag: 'a',
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
// Explicit check for a real Nuxt runtime -- used to avoid treating an unrelated, user-registered
// "NuxtLink" component (e.g. in tests, or non-Nuxt apps) as if it supports the custom/v-slot API.
const isNuxtEnvironment = computed(
  // @ts-expect-error we're doing an explicit check for Nuxt, so we can safely ignore this
  () => typeof instance?.appContext?.app?.$nuxt !== 'undefined'
)

const resolvedTo = computed(() => props.to || '')

const routerName = computed(() =>
  typeof props.routerComponentName === 'string'
    ? toPascalCase(props.routerComponentName)
    : props.routerComponentName
)
const isRouterLinkName = computed(() => routerName.value === 'RouterLink')
const isNuxtLinkName = computed(() => routerName.value === 'NuxtLink' && isNuxtEnvironment.value)

const tag = computed(() => {
  // If is disabled or there is no `to` prop, render a simple `<a>` tag
  if (props.disabled || !resolvedTo.value) {
    return 'a'
  }

  // Is it actually a component? Use that
  if (typeof routerName.value !== 'string') {
    return routerName.value
  }

  // routerName is a string, so we need to look it up in the app's registered components.
  // Fall back to a plain `<a>` tag if it can't be resolved (e.g. vue-router/Nuxt isn't installed).
  return instance?.appContext?.app?.component(routerName.value) || 'a'
})

// True only when `tag` is the real vue-router RouterLink, or the real Nuxt NuxtLink -- both of which
// support the `custom` prop and expose `{href, navigate, isActive, isExactActive}` through their
// default scoped slot. Any other component/tag is rendered directly instead (see `isNonStandardTag`).
const isOfRouterType = computed(
  () => tag.value !== 'a' && (isRouterLinkName.value || isNuxtLinkName.value)
)
const isNonStandardTag = computed(() => tag.value !== 'a' && !isOfRouterType.value)
const routerLinkProps = computed(() => ({
  to: resolvedTo.value,
  replace: props.replace,
  custom: true,
}))

const collapseData = inject(collapseInjectionKey, null)
const navbarData = inject(navbarInjectionKey, null)

/**
 * Not to be confused with computedLinkClasses
 */
const linkValueClasses = useLinkClasses(props)
const computedClasses = (isActive = false, isExactActive = false) => [
  linkValueClasses.value,
  attrs.class,
  computedLinkClasses.value,
  {
    [defaultActiveClass]: props.active,
    [props.activeClass]: isActive,
    [props.exactActiveClass]: isExactActive,
    'stretched-link': props.stretched,
  },
]
const computedLinkClasses = computed(() => ({
  [defaultActiveClass]: props.active,
  disabled: props.disabled,
}))

const clicked = (e: Readonly<MouseEvent>): void => {
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
}

const computedRel = computed(() =>
  props.target === '_blank' ? (!props.rel && props.noRel ? 'noopener' : props.rel) : undefined
)
const computedTabIndex = computed(() =>
  props.disabled
    ? '-1'
    : typeof attrs.tabindex === 'undefined'
      ? undefined
      : (attrs.tabindex as string | number)
)

// Only used outside of the real RouterLink/NuxtLink case (e.g. non-standard/custom
// `routerComponentName` components), so that they can still resolve their own href from `to`.
const nuxtSpecificProps = computed(() => ({
  ...(props.noPrefetch ? {noPrefetch: props.noPrefetch} : {prefetch: props.prefetch}),
  prefetchOn: props.prefetchOn,
  prefetchedClass: props.prefetchedClass,
  to: resolvedTo.value,
  replace: props.replace,
}))

// computedHref is only used for the non-router-type fallback rendering (plain `<a>`, disabled links,
// or arbitrary custom `routerComponentName` components), since real RouterLink/NuxtLink provide their
// own `href` through their scoped slot.
const computedHref = computed(() => {
  const toFallback = '#'
  const resolvedHref = props.href
  if (resolvedHref) return resolvedHref

  if (typeof resolvedTo.value === 'string') return resolvedTo.value || toFallback

  // Stabilize the `to` prop for the callback functions
  const stableTo = resolvedTo.value

  if (stableTo !== undefined && 'path' in stableTo) {
    const path = stableTo.path || ''
    const query = stableTo.query
      ? `?${Object.keys(stableTo.query)
          .map((e) => `${e}=${stableTo.query?.[e]}`)
          .join('=')}`
      : ''
    const hash =
      !stableTo.hash || stableTo.hash.charAt(0) === '#' ? stableTo.hash || '' : `#${stableTo.hash}`
    return `${path}${query}${hash}` || toFallback
  }
  // There is no resolver for `RouteLocationNamedRaw`. Which, I'm not sure there can be one in this context.

  return toFallback
})

const computedSpecificProps = computed(() => ({
  ...(isNonStandardTag.value || (isRouterLinkName.value && resolvedTo.value)
    ? nuxtSpecificProps.value
    : {}),
  class: computedClasses(),
  target: props.target,
  href: computedHref.value,
  rel: computedRel.value,
  tabindex: computedTabIndex.value,
  'aria-disabled': props.disabled ? true : undefined,
  onClick: clicked,
}))
</script>
