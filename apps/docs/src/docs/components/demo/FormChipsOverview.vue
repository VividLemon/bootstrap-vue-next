<template>
  <label for="chips-overview" class="form-label">Frameworks</label>
  <BFormChips id="chips-overview" v-model="value" placeholder="Add a framework..." />
  <p class="mt-2">Value: {{ value }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref(['Vue', 'Bootstrap'])
</script>
