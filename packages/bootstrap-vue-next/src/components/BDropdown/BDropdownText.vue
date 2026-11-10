<template>
  <li role="presentation" :class="processedAttrs.wrapperClass" v-bind="wrapperAttrs">
    <component
      :is="props.tag"
      class="dropdown-item-text"
      :class="[colorClasses, props.textClass]"
      v-bind="processedAttrs.textAttrs"
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
import type {BDropdownTextProps, BDropdownTextSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BDropdownTextProps>(), {
  textClass: undefined,
  tag: 'span',
  text: undefined,
  wrapperAttrs: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BDropdownText')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BDropdownTextSlots>()
const attrs = useAttrs()

const processedAttrs = computed(() => {
  const {class: wrapperClass, ...textAttrs} = attrs
  return {wrapperClass, textAttrs}
})

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
</script>
