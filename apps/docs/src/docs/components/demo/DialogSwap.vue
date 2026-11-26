<template>
  <BButton v-b-toggle.swap-step-1>Start</BButton>

  <BDialog id="swap-step-1" title="Step 1">
    <p>The next button sits inside this dialog, so this dialog is swapped for step 2.</p>
    <template #footer>
      <BButton v-b-toggle.swap-step-2 :color="{ theme: 'primary' }">Next</BButton>
    </template>
  </BDialog>

  <BDialog id="swap-step-2" title="Step 2">
    <p>Step 1 closed at once, without its exit transition.</p>
    <template #footer>
      <BButton v-b-toggle.swap-step-1>Back</BButton>
    </template>
  </BDialog>
</template>

<script setup lang="ts">
import { vBToggle } from 'bootstrap-vue-next/directives/BToggle'
</script>
