<template>
  <div class="tab-content" v-bind="contentAttrs">
    <slot />
    <div v-if="showEmpty" key="bv-empty-tab" class="tab-pane active" :class="{'card-body': card}">
      <slot name="empty" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {AttrsValue} from '../types/AnyValuedAttributes'

defineProps<{
  contentAttrs: Readonly<AttrsValue> | undefined
  showEmpty: boolean
  card: boolean
}>()

/* eslint-disable @typescript-eslint/no-explicit-any */
defineSlots<{
  default?: (props: Record<string, never>) => any
  empty?: (props: Record<string, never>) => any
}>()
/* eslint-enable @typescript-eslint/no-explicit-any */
</script>
