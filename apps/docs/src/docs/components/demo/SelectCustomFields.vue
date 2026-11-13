<template>
  <BFormSelect
    v-model="selected"
    :options="exFieldNamesOptions"
    class="mb-3"
    :fields="{ value: 'item', text: 'name', disabled: 'notEnabled' }"
  />

  <div class="mt-3">
    Selected: <strong>{{ selected }}</strong>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const exFieldNamesOptions = [
  { item: 'A', name: 'Option A' },
  { item: 'B', name: 'Option B' },
  { item: 'D', name: 'Option C', notEnabled: true },
  { item: { d: 1 }, name: 'Option D' },
]

const selected = ref('A')
</script>
