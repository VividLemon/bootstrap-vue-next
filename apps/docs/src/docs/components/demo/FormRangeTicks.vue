<template>
  <!-- #region template -->
  <label for="range-ticks" class="form-label">Quality</label>
  <BFormRange
    id="range-ticks"
    v-model="value"
    :step="25"
    :ticks="[0, 25, { value: 50, label: 'Medium' }, 75, 100]"
  />
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref(50)
</script>
