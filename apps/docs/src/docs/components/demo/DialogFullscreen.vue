<template>
  <div class="d-flex gap-2">
    <BButton v-b-toggle.dialog-fullscreen>Fullscreen</BButton>
    <BButton v-b-toggle.dialog-fullscreen-md>Fullscreen below md</BButton>
  </div>

  <BDialog id="dialog-fullscreen" fullscreen title="Fullscreen dialog">
    This dialog always covers the viewport.
  </BDialog>
  <BDialog id="dialog-fullscreen-md" fullscreen="md" title="Fullscreen below md">
    This dialog covers the viewport on screens narrower than the <code>md</code> breakpoint.
  </BDialog>
</template>

<script setup lang="ts">
import { vBToggle } from 'bootstrap-vue-next/directives/BToggle'
</script>
