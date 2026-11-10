<template>
  <BPlaceholder
    class="btn disabled"
    :class="computedClasses"
    :animation="props.animation"
    :width="props.width"
    :cols="props.cols"
    :tag="props.tag"
    :style="{'cursor': 'wait', 'pointer-events': 'auto'}"
  />
</template>

<script setup lang="ts">
import {resolvePartColor, useButtonThemeClasses} from '../../composables/useThemeClasses'
import {computed} from 'vue'
import BPlaceholder from './BPlaceholder.vue'
import type {BPlaceholderButtonProps} from '../../types'
import {useDefaults} from '../../composables/useDefaults'

const _props = withDefaults(defineProps<BPlaceholderButtonProps>(), {
  animation: undefined,
  cols: undefined,
  tag: 'div',
  width: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BPlaceholderButton')
const computedColor = computed(() => resolvePartColor(props.color, {theme: 'primary'}))

const {classes: computedClasses} = useButtonThemeClasses(
  computed(() => ({
    variant: 'solid',
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
</script>
