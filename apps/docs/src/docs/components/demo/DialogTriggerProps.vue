<template>
  <div>
    <BButton v-bind="dialogToggle">Show Dialog</BButton>
    <BDialog
      id="trigger-props-dialog"
      title="Opened by its trigger"
      >Hello From My Dialog!</BDialog
    >
  </div>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: dialogToggle} = useComponentToggle('trigger-props-dialog')
</script>
