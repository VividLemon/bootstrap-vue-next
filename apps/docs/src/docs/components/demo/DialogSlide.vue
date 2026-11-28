<template>
  <div class="d-flex gap-2">
    <BButton v-bind="dialogSlideDownToggle">Slide down</BButton>
    <BButton v-bind="dialogSlideUpToggle">Slide up</BButton>
    <BButton v-bind="dialogNoTransitionToggle">No transition</BButton>
  </div>

  <BDialog
    id="dialog-slide-down"
    slide="down"
    title="Slide down"
  >
    Fades in while sliding down.
  </BDialog>
  <BDialog
    id="dialog-slide-up"
    slide="up"
    title="Slide up"
    >Fades in while sliding up.</BDialog
  >
  <BDialog
    id="dialog-no-transition"
    no-transition
    title="No transition"
  >
    Opens and closes at once.
  </BDialog>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: dialogSlideDownToggle} = useComponentToggle('dialog-slide-down')
const {props: dialogSlideUpToggle} = useComponentToggle('dialog-slide-up')
const {props: dialogNoTransitionToggle} = useComponentToggle('dialog-no-transition')
</script>
