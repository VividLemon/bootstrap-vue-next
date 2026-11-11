<template>
  <component :is="props.tag" class="card-subtitle" :class="computedClasses">
    <slot>
      {{ props.text }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {computed} from 'vue'
import type {BCardSubtitleProps, BCardSubtitleSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'

const _props = withDefaults(defineProps<BCardSubtitleProps>(), {
  tag: 'h6',
  text: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BCardSubtitle')
const computedColor = computed(() => resolvePartColor(props.color, {fg: '2'}))
defineSlots<BCardSubtitleSlots>()

const {classes: computedClasses} = useThemeClasses(computed(() => ({fg: computedColor.value.fg})))
</script>
