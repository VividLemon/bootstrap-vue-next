<template>
  <BFormCheckboxGroup
    v-model="checked"
    :options="options"
    class="mb-3"
    :fields="{ value: 'item', text: 'name', disabled: 'notEnabled' }"
  />
  <div class="mt-3">
    Selected: <strong>{{ checked }}</strong>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const checked = ref(['A'])

const options = [
  { item: 'A', name: 'Option A' },
  { item: 'B', name: 'Option B' },
  { item: 'D', name: 'Option C', notEnabled: true },
  { item: { d: 1 }, name: 'Option D' },
]
</script>
