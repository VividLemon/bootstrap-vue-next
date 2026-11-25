<template>
  <component
    :is="computedLink ? BLink : 'button'"
    class="menu-item"
    :class="computedClasses"
    v-bind="computedLink ? computedLinkProps : {type: 'button', disabled: props.disabled || null}"
    :aria-disabled="props.disabled ? 'true' : null"
    :aria-current="props.active ? 'true' : null"
    @click="clicked"
  >
    <slot name="icon" />
    <span v-if="props.description || slots.description" class="menu-item-content">
      <slot>{{ props.text }}</slot>
      <small class="menu-item-description">
        <slot name="description">{{ props.description }}</slot>
      </small>
    </span>
    <slot v-else>{{ props.text }}</slot>
    <svg
      v-if="props.selected !== undefined"
      class="menu-item-check"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="m2 7 4 5 8-8" />
    </svg>
  </component>
</template>

<script setup lang="ts">
import {computed, inject} from 'vue'
import BLink from '../BLink/BLink.vue'
import {useBLinkHelper} from '../../composables/useBLinkHelper'
import {useDefaults} from '../../composables/useDefaults'
import {useThemeClasses} from '../../composables/useThemeClasses'
import {collapseInjectionKey, menuInjectionKey, navbarInjectionKey} from '../../utils/keys'
import type {BMenuItemEmits, BMenuItemProps, BMenuItemSlots} from '../../types'

const _props = withDefaults(defineProps<BMenuItemProps>(), {
  color: undefined,
  description: undefined,
  selected: undefined,
  text: undefined,
  // Link props
  active: undefined,
  activeClass: undefined,
  disabled: undefined,
  exactActiveClass: undefined,
  href: undefined,
  icon: undefined,
  opacity: undefined,
  stretched: false,
  rel: undefined,
  replace: undefined,
  routerComponentName: undefined,
  target: undefined,
  to: undefined,
  underline: undefined,
  // End link props
})
const props = useDefaults(_props, 'BMenuItem')
const emit = defineEmits<BMenuItemEmits>()
const slots = defineSlots<BMenuItemSlots>()

// `color` is the item's `theme-*`, not a link color, so it is not passed on to BLink
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
])

const {classes: colorClasses} = useThemeClasses(() => ({theme: props.color?.theme}))
const computedClasses = computed(() => [
  colorClasses.value,
  {
    active: props.active,
    disabled: props.disabled,
    selected: props.selected,
  },
])

const collapseData = inject(collapseInjectionKey, null)
const menuData = inject(menuInjectionKey, null)
const navbarData = inject(navbarInjectionKey, null)

const clicked = (e: MouseEvent): void => {
  if (props.disabled) {
    e.preventDefault()
    return
  }
  emit('click', e)
  if (navbarData !== null && navbarData?.noAutoClose?.value !== true) {
    collapseData?.hide?.()
  }
  const autoClose = menuData?.autoClose.value
  if (autoClose === true || autoClose === 'inside') void menuData?.hide('item')
}
</script>
