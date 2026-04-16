<template>
  <BOtpInput v-model="value" :length="6" @complete="onComplete" />
  <BAlert v-if="completed" variant="success" :model-value="true" class="mt-2">
    OTP Complete: {{ value.join('') }}
  </BAlert>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const value = ref<string[]>([])
const completed = ref(false)

const onComplete = () => {
  completed.value = true
}
</script>
