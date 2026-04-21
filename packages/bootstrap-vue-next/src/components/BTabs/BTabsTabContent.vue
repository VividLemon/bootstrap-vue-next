<template>
  <div class="tab-content" :class="contentClass">
    <slot />
    <div
      v-if="showEmpty"
      key="bv-empty-tab"
      class="tab-pane active"
      :class="{'card-body': card}"
    >
      <slot name="empty" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {ClassValue} from '../../types/AnyValuedAttributes'

defineProps<{
  contentClass?: ClassValue
  showEmpty: boolean
  card: boolean
}>()

defineSlots<{
  default?: () => unknown
  empty?: () => unknown
}>()
</script>
