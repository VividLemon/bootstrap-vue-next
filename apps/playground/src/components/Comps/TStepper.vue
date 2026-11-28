<template>
  <BContainer fluid>
    <BRow class="mb-3">
      <BCol>
        <BButton class="me-2" :disabled="step === 0" @click="step--">Back</BButton>
        <BButton :disabled="step === labels.length - 1" @click="step++">Next</BButton>
        <span class="ms-3">step: {{ step }}</span>
      </BCol>
    </BRow>
    <BRow class="mb-3">
      <BCol>
        <BStepper v-model="step" horizontal>
          <BStepperItem v-for="label in labels" :key="label">{{ label }}</BStepperItem>
        </BStepper>
      </BCol>
    </BRow>
    <BRow class="mb-3">
      <BCol class="contains-inline">
        <BStepper v-model="step" horizontal="md" tag="div">
          <BStepperItem
            v-for="(label, i) in labels"
            :key="label"
            button
            :color="i === 1 ? {theme: 'success'} : undefined"
            @click="step = i"
          >
            {{ label }}
          </BStepperItem>
        </BStepper>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const labels = ['Create account', 'Confirm email', 'Profile', 'Finish']
const step = ref(1)
</script>
