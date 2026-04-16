<template>
  <BOtpInput v-model="value" :length="6" @complete="onComplete" />
  <div class="mt-2">Value (v-model): {{ value }}</div>
  <div v-if="completedValue" class="mt-1">Completed (event): {{ completedValue }}</div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const value = ref<string[]>([])
const completedValue = ref<string[] | null>(null)

const onComplete = (val: string[]) => {
  completedValue.value = val
}
</script>
