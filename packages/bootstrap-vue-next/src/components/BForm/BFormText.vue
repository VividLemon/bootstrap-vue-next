<template>
  <component :is="props.tag" :id="props.id" :class="computedClasses">
    <slot>
      {{ props.text }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {useThemeClasses} from '../../composables/useThemeClasses'
import type {BFormTextProps, BFormTextSlots} from '../../types'

const _props = withDefaults(defineProps<BFormTextProps>(), {
  id: undefined,
  inline: false,
  tag: 'small',
  text: undefined,
  fg: '2',
})
const props = useDefaults(_props, 'BFormText')
defineSlots<BFormTextSlots>()

const {classes: colorClasses} = useThemeClasses(computed(() => ({fg: props.fg})))
const computedClasses = computed(() => [
  colorClasses.value,
  {
    'form-text': !props.inline,
  },
])
</script>
