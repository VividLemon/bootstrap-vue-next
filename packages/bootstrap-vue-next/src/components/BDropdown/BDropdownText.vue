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
import {computed, useAttrs} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {useThemeClasses} from '../../composables/useThemeClasses'
import type {BDropdownTextProps, BDropdownTextSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BDropdownTextProps>(), {
  textClass: undefined,
  tag: 'span',
  text: undefined,
  theme: null,
  bg: null,
  fg: null,
  wrapperAttrs: undefined,
})
const props = useDefaults(_props, 'BDropdownText')
defineSlots<BDropdownTextSlots>()
const attrs = useAttrs()

const processedAttrs = computed(() => {
  const {class: wrapperClass, ...textAttrs} = attrs
  return {wrapperClass, textAttrs}
})

const {classes: colorClasses} = useThemeClasses(() => ({
  theme: props.theme,
  bg: props.bg,
  fg: props.fg,
}))
</script>
