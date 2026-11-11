<template>
  <component :is="props.tag" :id="props.id" :class="computedClasses">
    <slot>
      {{ props.text }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {computed} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import type {BFormTextProps, BFormTextSlots} from '../../types'

const _props = withDefaults(defineProps<BFormTextProps>(), {
  id: undefined,
  inline: false,
  tag: 'small',
  text: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BFormText')
const computedColor = computed(() => resolvePartColor(props.color, {fg: '2'}))
defineSlots<BFormTextSlots>()

const {classes: colorClasses} = useThemeClasses(computed(() => ({fg: computedColor.value.fg})))
const computedClasses = computed(() => [
  colorClasses.value,
  {
    'form-text': !props.inline,
  },
])
</script>
