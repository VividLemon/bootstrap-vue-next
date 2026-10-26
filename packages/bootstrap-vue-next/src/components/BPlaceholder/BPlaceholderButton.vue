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
import BPlaceholder from './BPlaceholder.vue'
import type {BPlaceholderButtonProps} from '../../types'
import {computed} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {getButtonThemeClasses} from '../../composables/useThemeClasses'

const _props = withDefaults(defineProps<BPlaceholderButtonProps>(), {
  animation: undefined,
  cols: undefined,
  tag: 'div',
  theme: 'primary',
  width: undefined,
})
const props = useDefaults(_props, 'BPlaceholderButton')

const computedClasses = computed(() => getButtonThemeClasses('solid', props.theme))
</script>
