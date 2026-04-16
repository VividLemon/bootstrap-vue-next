<template>
  <BOtpInput v-model="value" otp :length="6" />
  <div class="mt-2">Value: {{ value }}</div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const value = ref<string[]>([])
</script>
