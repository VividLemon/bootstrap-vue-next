<template>
  <BButton @click="show()">Click me</BButton>
  <BDialog id="toggle-dialog" title="Dialog Controlled by useComponentToggle">
    <BButton @click="hide()">Hide me</BButton>
  </BDialog>
</template>

<script setup lang="ts">
import { useComponentToggle } from 'bootstrap-vue-next'

const { show, hide } = useComponentToggle('toggle-dialog')
</script>
