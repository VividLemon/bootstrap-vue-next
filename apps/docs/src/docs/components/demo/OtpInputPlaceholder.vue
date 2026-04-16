<template>
  <BOtpInput v-model="value" placeholder="○" />
  <div class="mt-2">Value: {{ value }}</div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const value = ref<string[]>([])
</script>
