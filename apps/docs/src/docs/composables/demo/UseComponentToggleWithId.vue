<template>
  <BButton @click="show()">Click me</BButton>
  <BDialog v-if="someConditions" id="my-modal" v-model="programmaticModal">
    <BButton @click="hide()">Hide me</BButton>
  </BDialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BButton, BDialog, useComponentToggle } from 'bootstrap-vue-next'

const someConditions = ref(false)
const programmaticModal = ref(false)

onMounted(() => {
  someConditions.value = true
})

const { show, hide } = useComponentToggle('my-modal')
</script>
