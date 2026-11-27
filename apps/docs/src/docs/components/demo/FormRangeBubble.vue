<template>
  <label for="range-bubble" class="form-label mt-4">Discount</label>
  <BFormRange id="range-bubble" v-model="value" bubble :formatter="formatPercent" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref(25)
const formatPercent = (v: number) => `${v}%`
</script>
