<template>
  <slot name="img">
    <BCardImg v-if="imgSrc" :src="imgSrc" :alt="imgAlt" :height="imgHeight" :width="imgWidth" :placement="imgPlacement" />
  </slot>
</template>

<script setup lang="ts">
import type {BCardProps} from '../../types/ComponentProps'
import BCardImg from './BCardImg.vue'

defineProps<{
  imgSrc?: BCardProps['imgSrc']
  imgAlt?: BCardProps['imgAlt']
  imgHeight?: BCardProps['imgHeight']
  imgWidth?: BCardProps['imgWidth']
  imgPlacement?: BCardProps['imgPlacement']
}>()

defineSlots<{
  img?: () => unknown
}>()
</script>
