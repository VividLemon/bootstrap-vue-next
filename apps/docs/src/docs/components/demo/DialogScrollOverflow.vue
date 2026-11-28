<template>
  <div>
    <BButton v-bind="dialogTallToggle">Launch overflowing dialog</BButton>

    <BDialog
      id="dialog-tall"
      title="Overflowing Content"
    >
      <p
        v-for="i in 20"
        :key="i"
        class="my-4"
      >
        Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in,
        egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
      </p>
    </BDialog>
  </div>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: dialogTallToggle} = useComponentToggle('dialog-tall')
</script>
