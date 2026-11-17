<template>
  <label for="range-overview" class="form-label">Volume</label>
  <BFormRange id="range-overview" v-model="value" />
  <div class="mt-2">Value: {{ value }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref(40)
</script>
