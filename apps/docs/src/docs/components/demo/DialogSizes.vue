<template>
  <div>
    <div class="d-flex gap-2 mb-3">
      <BButton
        v-bind="dialogXlToggle"
        :color="{theme: 'primary'}"
        >xl dialog</BButton
      >
      <BButton
        v-bind="dialogLgToggle"
        :color="{theme: 'primary'}"
        >lg dialog</BButton
      >
      <BButton
        v-bind="dialogSmToggle"
        :color="{theme: 'primary'}"
        >sm dialog</BButton
      >
    </div>

    <BDialog
      id="dialog-xl"
      size="xl"
      title="Extra Large Dialog"
      >Hello Extra Large Dialog!</BDialog
    >
    <BDialog
      id="dialog-lg"
      size="lg"
      title="Large Dialog"
      >Hello Large Dialog!</BDialog
    >
    <BDialog
      id="dialog-sm"
      size="sm"
      title="Small Dialog"
      >Hello Small Dialog!</BDialog
    >
  </div>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: dialogXlToggle} = useComponentToggle('dialog-xl')
const {props: dialogLgToggle} = useComponentToggle('dialog-lg')
const {props: dialogSmToggle} = useComponentToggle('dialog-sm')
</script>
