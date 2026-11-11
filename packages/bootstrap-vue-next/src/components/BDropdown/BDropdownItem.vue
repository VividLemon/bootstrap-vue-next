<template>
  <li role="presentation" :class="processedAttrs.wrapperClass" v-bind="props.wrapperAttrs">
    <component
      :is="computedTag"
      class="dropdown-item"
      :class="computedClasses"
      :disabled="props.disabled"
      :aria-disabled="props.disabled ? true : null"
      :aria-current="props.active ? true : null"
      :href="computedTag === 'a' ? props.href : null"
      :rel="props.rel"
      role="menuitem"
      :type="computedTag === 'button' ? 'button' : null"
      :target="props.target"
      v-bind="{...computedLinkProps, ...processedAttrs.dropdownItemAttrs}"
      @click="clicked"
    >
      <slot />
    </component>
  </li>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import BLink from '../BLink/BLink.vue'
import {computed, inject, useAttrs} from 'vue'
import {useBLinkHelper} from '../../composables/useBLinkHelper'
import {collapseInjectionKey, dropdownInjectionKey, navbarInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import type {BDropdownItemEmits, BDropdownItemProps, BDropdownItemSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BDropdownItemProps>(), {
  wrapperAttrs: undefined,
  // Link props
  linkClass: undefined,
  // All others use defaults
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
  color: undefined,
})
const props = useDefaults(_props, 'BDropdownItem')
const computedColor = computed(() => resolvePartColor(props.color, {}))
const emit = defineEmits<BDropdownItemEmits>()
defineSlots<BDropdownItemSlots>()
const attrs = useAttrs()

const processedAttrs = computed(() => {
  const {class: wrapperClass, ...dropdownItemAttrs} = attrs
  return {wrapperClass, dropdownItemAttrs}
})

const {computedLink, computedLinkProps} = useBLinkHelper(props)

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
const computedClasses = computed(() => [
  props.linkClass,
  colorClasses.value,
  {
    active: props.active,
    disabled: props.disabled,
  },
])

const computedTag = computed(() => (computedLink.value ? BLink : props.href ? 'a' : 'button'))

const collapseData = inject(collapseInjectionKey, null)
const dropdownData = inject(dropdownInjectionKey, null)
const navbarData = inject(navbarInjectionKey, null)

// Pretty sure this emits if computedTag is not button and is disabled
const clicked = (e: Readonly<MouseEvent>): void => {
  emit('click', e)
  if (navbarData !== null && navbarData?.noAutoClose?.value !== true) {
    collapseData?.hide?.()
  }
  dropdownData?.hide?.()
}
</script>
