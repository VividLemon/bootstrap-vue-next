<template>
  <BButton v-bind="step1Toggle">Start</BButton>

  <BDialog
    id="swap-step-1"
    title="Step 1"
  >
    <p>The next button sits inside this dialog, so this dialog is swapped for step 2.</p>
    <template #footer>
      <BButton
        v-bind="step2Toggle"
        :color="{theme: 'primary'}"
        >Next</BButton
      >
    </template>
  </BDialog>

  <BDialog
    id="swap-step-2"
    title="Step 2"
  >
    <p>Step 1 closed at once, without its exit transition.</p>
    <template #footer>
      <BButton v-bind="step1Toggle">Back</BButton>
    </template>
  </BDialog>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: step1Toggle} = useComponentToggle('swap-step-1')
const {props: step2Toggle} = useComponentToggle('swap-step-2')
</script>
