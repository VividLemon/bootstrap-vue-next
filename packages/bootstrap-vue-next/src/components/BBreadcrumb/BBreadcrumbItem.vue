<template>
  <li class="breadcrumb-item" :aria-current="computedAriaCurrent">
    <component
      :is="computedTag"
      class="breadcrumb-link"
      :class="{active: props.active}"
      v-bind="computedLinkProps"
      @click="clicked"
    >
      <slot>
        {{ props.text }}
      </slot>
    </component>
  </li>
</template>

<script setup lang="ts">
import {pick} from '../../utils/object'
import {computed} from 'vue'
import BLink from '../BLink/BLink.vue'
import {useDefaults} from '../../composables/useDefaults'
import type {BBreadcrumbItemEmits, BBreadcrumbItemProps, BBreadcrumbItemSlots} from '../../types'

const _props = withDefaults(defineProps<BBreadcrumbItemProps>(), {
  ariaCurrent: 'page',
  text: undefined,
  // Link props
  active: false, // Why is this active: false?
  // All others use defaults
  activeClass: undefined,
  disabled: undefined,
  exactActiveClass: undefined,
  href: undefined,
  icon: undefined,
  opacity: undefined,
  opacityHover: undefined,
  stretched: false,
  rel: undefined,
  replace: undefined,
  routerComponentName: undefined,
  routerTag: undefined,
  target: undefined,
  to: undefined,
  underlineOffset: undefined,
  underlineOffsetHover: undefined,
  underlineOpacity: undefined,
  underlineOpacityHover: undefined,
  underlineVariant: undefined,
  variant: undefined,
  // End link props
})
const props = useDefaults(_props, 'BBreadcrumbItem')
const emit = defineEmits<BBreadcrumbItemEmits>()
defineSlots<BBreadcrumbItemSlots>()

const computedTag = computed(() => (props.active ? 'span' : BLink))

const computedAriaCurrent = computed(() =>
  props.active ? (props.ariaCurrent as never) : undefined
)

const computedLinkProps = computed(() =>
  computedTag.value !== 'span'
    ? pick(props, [
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
        'variant',
      ])
    : {}
)

const clicked = (e: Readonly<MouseEvent>): void => {
  if (props.disabled || props.active) {
    e.preventDefault()
    e.stopImmediatePropagation()
    return
  }
  if (!props.disabled) emit('click', e)
}
</script>
