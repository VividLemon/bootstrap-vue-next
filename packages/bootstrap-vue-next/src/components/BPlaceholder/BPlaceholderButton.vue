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
import {computed} from 'vue'
import BPlaceholder from './BPlaceholder.vue'
import type {BPlaceholderButtonProps} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {useButtonThemeClasses} from '../../composables/useThemeClasses'

const _props = withDefaults(defineProps<BPlaceholderButtonProps>(), {
  animation: undefined,
  cols: undefined,
  tag: 'div',
  theme: 'primary',
  bg: null,
  fg: null,
  width: undefined,
})
const props = useDefaults(_props, 'BPlaceholderButton')

const {classes: computedClasses} = useButtonThemeClasses(
  computed(() => ({
    variant: 'solid',
    theme: props.theme,
    bg: props.bg,
    fg: props.fg,
  }))
)
</script>
