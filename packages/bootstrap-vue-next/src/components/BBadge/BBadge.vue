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
import {useBLinkHelper} from '../../composables/useBLinkHelper'
import {useColorVariantClasses} from '../../composables/useColorVariantClasses'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import type {BBadgeProps} from '../../types/ComponentProps'
import BLink from '../BLink/BLink.vue'
import ConditionalWrapper from '../ConditionalWrapper.vue'
import type {BBadgeSlots} from '../../types'

const _props = withDefaults(defineProps<BBadgeProps>(), {
  dotIndicator: false,
  pill: false,
  tag: 'span',
  placement: undefined,
  // Link props
  variant: 'secondary',
  // All others use defaults
  active: undefined,
  activeClass: undefined,
  disabled: undefined,
  exactActiveClass: undefined,
  href: undefined,
  icon: undefined,
  opacity: undefined,
  opacityHover: undefined,
  rel: undefined,
  replace: undefined,
  routerComponentName: undefined,
  stretched: false,
  target: undefined,
  to: undefined,
  underlineOffset: undefined,
  underlineOffsetHover: undefined,
  underlineOpacity: undefined,
  underlineOpacityHover: undefined,
  underlineVariant: undefined,
  // End link props
  // ColorExtendables props
  // Variant is here as well
  textVariant: null,
  bgVariant: null,
  // End ColorExtendables props
})
const props = useDefaults(_props, 'BBadge')
defineSlots<BBadgeSlots>()

const {computedLink, computedLinkProps} = useBLinkHelper(props, [
  'active',
  'activeClass',
  'append',
  'disabled',
  'href',
  'rel',
  'replace',
  'routerComponentName',
  'target',
  'to',
  'opacity',
  'opacityHover',
  'underlineVariant',
  'underlineOffset',
  'underlineOffsetHover',
  'underlineOpacity',
  'underlineOpacityHover',
  'icon',
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

const colorClasses = useColorVariantClasses(props)
const computedClasses = computed(() => [
  colorClasses.value,
  props.placement !== undefined || props.dotIndicator === true ? placementClasses.value : undefined,
  {
    'active': props.active,
    'disabled': props.disabled,
    'rounded-pill': props.pill,
    'p-2 border border-light rounded-circle': props.dotIndicator,
    'text-decoration-none': computedLink.value,
  },
])
</script>
