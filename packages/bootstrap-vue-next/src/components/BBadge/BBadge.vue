<template>
  <component :is="computedTag" class="badge" :class="computedClasses" v-bind="computedLinkProps">
    <slot />
  </component>
</template>

<script setup lang="ts">
import {useBLinkHelper} from '../../composables/useBLinkHelper'
import {useColorVariantClasses} from '../../composables/useColorVariantClasses'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import BLink from '../BLink/BLink.vue'
import type {BBadgeProps, BBadgeSlots} from '../../types'

const _props = withDefaults(defineProps<BBadgeProps>(), {
  tag: 'span',
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
  'disabled',
  'exactActiveClass',
  'href',
  'icon',
  'noRel',
  'opacity',
  'opacityHover',
  'noPrefetch',
  'prefetch',
  'prefetchOn',
  'prefetchedClass',
  'rel',
  'replace',
  'routerComponentName',
  'stretched',
  'target',
  'to',
  'underlineOffset',
  'underlineOffsetHover',
  'underlineOpacity',
  'underlineOpacityHover',
  'underlineVariant',
])

const computedTag = computed(() => (computedLink.value ? BLink : props.tag))

const colorClasses = useColorVariantClasses(props)
const computedClasses = computed(() => [
  colorClasses.value,
  {
    'active': props.active,
    'disabled': props.disabled,
    'text-decoration-none': computedLink.value,
  },
])
</script>
