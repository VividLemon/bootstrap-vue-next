<template>
  <BButton @click="show()">Click me</BButton>
  <BModal
    id="toggle-modal"
    title="Modal Controlled by useComponentToggle"
  >
    <BButton @click="hide()">Hide me</BButton>
  </BModal>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next'

const {show, hide} = useComponentToggle('toggle-modal')
</script>
