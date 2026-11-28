<template>
  <!-- #region template -->
  <BMenu :text="`Status: ${status}`">
    <BMenuItem
      v-for="option in options"
      :key="option.value"
      :selected="status === option.value"
      :description="option.description"
      @click="status = option.value"
    >
      {{ option.value }}
    </BMenuItem>
  </BMenu>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const options = [
  { value: 'Published', description: 'Visible to everyone' },
  { value: 'Draft', description: 'Not yet published' },
  { value: 'Archived', description: 'Hidden from lists' },
]
const status = ref('Published')
</script>
