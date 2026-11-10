<template>
  <li role="presentation" :class="processedAttrs.wrapperClass" v-bind="wrapperAttrs">
    <component
      :is="props.tag"
      class="dropdown-header"
      :class="[colorClasses, props.headerClass]"
      v-bind="processedAttrs.headerAttrs"
    >
      <slot>
        {{ props.text }}
      </slot>
    </component>
  </li>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {computed, useAttrs} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import type {BDropdownHeaderProps, BDropdownHeaderSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BDropdownHeaderProps>(), {
  headerClass: undefined,
  tag: 'h6',
  text: undefined,
  wrapperAttrs: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BDropdownHeader')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BDropdownHeaderSlots>()
const attrs = useAttrs()

const processedAttrs = computed(() => {
  const {class: wrapperClass, ...headerAttrs} = attrs
  return {wrapperClass, headerAttrs}
})

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
</script>
