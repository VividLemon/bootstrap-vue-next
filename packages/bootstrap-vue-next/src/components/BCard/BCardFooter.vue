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
  border: undefined,
  tag: 'div',
  text: undefined,
  // ColorExtendables props
  bg: undefined,
  fg: undefined,
  theme: undefined,
  // End ColorExtendables props
})
const props = useDefaults(_props, 'BCardFooter')
defineSlots<BCardFooterSlots>()
</script>
