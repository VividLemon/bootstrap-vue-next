<template>
  <!-- #region template -->
  <BStepper v-model="step" class="mb-3">
    <BStepperItem>Create account</BStepperItem>
    <BStepperItem>Confirm email</BStepperItem>
    <BStepperItem>Update profile</BStepperItem>
    <BStepperItem>Finish</BStepperItem>
  </BStepper>
  <BButton class="me-2" :disabled="step === 0" @click="step--">Back</BButton>
  <BButton :disabled="step === 3" @click="step++">Next</BButton>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const step = ref(1)
</script>
