<template>
  <BTimeRangeField v-model="value" />
  <p class="mt-2">
    Start: {{ value?.start?.toString() ?? 'null' }} — End: {{ value?.end?.toString() ?? 'null' }}
  </p>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import type {Time} from '@internationalized/date'

const value = ref<{start: Time | undefined; end: Time | undefined} | null>(null)
</script>
