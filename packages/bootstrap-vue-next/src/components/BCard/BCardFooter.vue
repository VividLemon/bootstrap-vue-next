<template>
  <BCardHeadFoot class="card-footer" v-bind="props">
    <slot>
      {{ props.text }}
    </slot>
  </BCardHeadFoot>
</template>

<script setup lang="ts">
import type {BCardFooterSlots, BCardFooterProps} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import BCardHeadFoot from '../BCardHeadFoot.vue'

const _props = withDefaults(defineProps<BCardFooterProps>(), {
  tag: 'div',
  text: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BCardFooter')
defineSlots<BCardFooterSlots>()
</script>
