<template>
  <BButton @click="show()">Click me</BButton>
  <BDialog id="toggle-dialog" title="Dialog Controlled by useToggle">
    <BButton @click="hide()">Hide me</BButton>
  </BDialog>
</template>

<script setup lang="ts">
import { useToggle } from 'bootstrap-vue-next'

const { show, hide } = useToggle('toggle-dialog')
</script>
