<template>
  <BOtpInput v-model="value" :length="4" @complete="onComplete" />
  <p class="mt-2">Value: {{ value }}</p>
  <p v-if="completed" class="text-success">All fields filled!</p>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const value = ref<string[]>([])
const completed = ref(false)

function onComplete(val: string[]) {
  completed.value = true
  setTimeout(() => {
    completed.value = false
  }, 2000)
}
</script>
