<template>
  <div class="d-flex gap-2">
    <BButton v-bind="dialogFullscreenToggle">Fullscreen</BButton>
    <BButton v-bind="dialogFullscreenMdToggle">Fullscreen below md</BButton>
  </div>

  <BDialog
    id="dialog-fullscreen"
    fullscreen
    title="Fullscreen dialog"
  >
    This dialog always covers the viewport.
  </BDialog>
  <BDialog
    id="dialog-fullscreen-md"
    fullscreen="md"
    title="Fullscreen below md"
  >
    This dialog covers the viewport on screens narrower than the <code>md</code> breakpoint.
  </BDialog>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: dialogFullscreenToggle} = useComponentToggle('dialog-fullscreen')
const {props: dialogFullscreenMdToggle} = useComponentToggle('dialog-fullscreen-md')
</script>
