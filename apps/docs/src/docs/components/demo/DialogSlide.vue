<template>
  <div class="d-flex gap-2">
    <BButton v-b-toggle.dialog-slide-down>Slide down</BButton>
    <BButton v-b-toggle.dialog-slide-up>Slide up</BButton>
    <BButton v-b-toggle.dialog-no-transition>No transition</BButton>
  </div>

  <BDialog id="dialog-slide-down" slide="down" title="Slide down">
    Fades in while sliding down.
  </BDialog>
  <BDialog id="dialog-slide-up" slide="up" title="Slide up">Fades in while sliding up.</BDialog>
  <BDialog id="dialog-no-transition" no-transition title="No transition">
    Opens and closes at once.
  </BDialog>
</template>

<script setup lang="ts">
import { vBToggle } from 'bootstrap-vue-next/directives/BToggle'
</script>
