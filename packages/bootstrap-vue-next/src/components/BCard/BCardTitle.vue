<template>
  <component :is="props.tag" class="card-title">
    <slot>
      {{ props.text }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import type {BCardTitleSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import type {BCardTitleProps} from '../../types/ComponentProps'

const _props = withDefaults(defineProps<BCardTitleProps>(), {
  tag: 'h4',
  text: undefined,
})
const props = useDefaults(_props, 'BCardTitle')
defineSlots<BCardTitleSlots>()
</script>
