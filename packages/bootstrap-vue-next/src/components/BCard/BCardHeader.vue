<template>
  <BCardHeadFoot class="card-header" v-bind="props">
    <slot />
  </BCardHeadFoot>
</template>

<script setup lang="ts">
import type {BCardHeaderSlots, BCardHeadFootProps} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import BCardHeadFoot from '../BCardHeadFoot.vue'

const _props = withDefaults(defineProps<BCardHeadFootProps>(), {
  tag: 'div',
  text: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BCardHeader')
defineSlots<BCardHeaderSlots>()
</script>
