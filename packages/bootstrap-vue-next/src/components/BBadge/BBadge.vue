<template>
  <component :is="computedTag" class="badge" :class="computedClasses" v-bind="computedLinkProps">
    <ConditionalWrapper
      :skip="props.dotIndicator !== true"
      tag="span"
      v-bind="props.dotIndicator ? {class: 'visually-hidden'} : {}"
    >
      <slot />
    </ConditionalWrapper>
  </component>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {useBLinkHelper} from '../../composables/useBLinkHelper'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import BLink from '../BLink/BLink.vue'
import ConditionalWrapper from '../ConditionalWrapper.vue'
import type {BBadgeProps, BBadgeSlots} from '../../types'

const _props = withDefaults(defineProps<BBadgeProps>(), {
  dotIndicator: false,
  pill: false,
  tag: 'span',
  placement: undefined,
  variant: null,
  // Link props
  // All others use defaults
  active: undefined,
  activeClass: undefined,
  disabled: undefined,
  exactActiveClass: undefined,
  href: undefined,
  icon: undefined,
  opacity: undefined,
  rel: undefined,
  replace: undefined,
  routerComponentName: undefined,
  stretched: false,
  target: undefined,
  to: undefined,
  underline: undefined,
  // End link props
  // Theme is here as well
  color: undefined,
})
const props = useDefaults(_props, 'BBadge')
const computedColor = computed(() => resolvePartColor(props.color, {theme: 'secondary'}))
defineSlots<BBadgeSlots>()

const {computedLink, computedLinkProps} = useBLinkHelper(props, [
  'active',
  'activeClass',
  'disabled',
  'exactActiveClass',
  'href',
  'icon',
  'noRel',
  'opacity',
  'prefetch',
  'prefetchOn',
  'prefetchedClass',
  'rel',
  'replace',
  'routerComponentName',
  'stretched',
  'target',
  'to',
  'underline',
  'color',
])

const computedTag = computed(() => (computedLink.value ? BLink : props.tag))

const placementClasses = computed(() => {
  // dotindicator is implicitly top-end if no placement is set
  const pos = props.placement ?? (props.dotIndicator ? 'top-end' : undefined)
  return [
    'position-absolute',
    'translate-middle',
    {
      'start-0 top-0': pos === 'top-start',
      'start-0 top-50': pos === 'start',
      'start-0 top-100': pos === 'bottom-start',
      'start-50 top-0': pos === 'top',
      'start-50 top-100': pos === 'bottom',
      'start-100 top-0': pos === 'top-end',
      'start-100 top-50': pos === 'end',
      'start-100 top-100': pos === 'bottom-end',
    },
  ]
})

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
const computedClasses = computed(() => [
  colorClasses.value,
  props.placement !== undefined || props.dotIndicator ? placementClasses.value : undefined,
  {
    [`badge-${props.variant}`]: !!props.variant,
    'active': props.active,
    'disabled': props.disabled,
    'rounded-pill': props.pill,
    'p-2 min-h-0 border border-bg rounded-circle': props.dotIndicator,
    'text-decoration-none': computedLink.value,
  },
])
</script>
