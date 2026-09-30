<template>
  <BDateRangePicker v-model="value" />
  <p class="mt-2">
    Start: {{ value?.start?.toString() ?? 'null' }} — End: {{ value?.end?.toString() ?? 'null' }}
  </p>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import type {DateValue} from '@internationalized/date'

const value = ref<{start: DateValue | undefined; end: DateValue | undefined} | null>(null)
</script>
