<template>
  <BTimeField v-model="value" />
  <p class="mt-2">Value: {{ value?.toString() ?? 'null' }}</p>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import type {Time} from '@internationalized/date'

const value = ref<Time | null>(null)
</script>
