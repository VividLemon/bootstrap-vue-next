<template>
  <!-- #region template -->
  <BFormRadioGroup
    v-model="selected"
    :options="items"
    :fields="{ value: 'id', text: 'name', disabled: 'inactive' }"
  />
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const items = [
  { id: 1, name: 'Option A', inactive: false },
  { id: 2, name: 'Option B', inactive: false },
  { id: 3, name: 'Option C', inactive: true },
]

const selected = ref<number>()
</script>
