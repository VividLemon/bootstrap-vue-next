<template>
  <!-- #region template -->
  <BStepper v-model="step" horizontal tag="div">
    <BStepperItem v-for="(label, i) in labels" :key="label" button @click="step = i">
      {{ label }}
    </BStepperItem>
  </BStepper>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const labels = ['Cart', 'Shipping', 'Payment', 'Review']
const step = ref(0)
</script>
