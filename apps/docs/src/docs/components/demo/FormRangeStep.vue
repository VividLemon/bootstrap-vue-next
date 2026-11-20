<template>
  <!-- #region template -->
  <label for="range-step" class="form-label">Rating (0 to 5, step 0.5)</label>
  <BFormRange id="range-step" v-model="value" :min="0" :max="5" :step="0.5" />
  <div class="mt-2">Value: {{ value }}</div>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref(2.5)
</script>
