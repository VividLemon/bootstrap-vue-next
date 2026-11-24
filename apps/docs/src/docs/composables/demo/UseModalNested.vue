<template>
  <BButton @click="nestedModal1 = !nestedModal1">Open First Dialog</BButton>

  <BDialog v-model="nestedModal1" title="First Dialog">
    <p class="my-2">First Dialog</p>
    <BButtonGroup>
      <BButton @click="nestedModal2 = !nestedModal2">Open Second Dialog</BButton>
      <BButton @click="() => hide()">Hide Last</BButton>
      <BButton @click="() => hideAll()">Hide All</BButton>
    </BButtonGroup>
  </BDialog>
  <BDialog v-model="nestedModal2" title="Second Dialog">
    <p class="my-2">Second Dialog</p>
    <BButtonGroup>
      <BButton size="sm" @click="nestedModal3 = !nestedModal3">Open Third Dialog</BButton>
      <BButton @click="() => hide()">Hide Last</BButton>
      <BButton @click="() => hideAll()">Hide All</BButton>
    </BButtonGroup>
  </BDialog>
  <BDialog v-model="nestedModal3" title="Third Dialog">
    <p class="my-1">Third Dialog</p>
    <BButtonGroup>
      <BButton @click="() => hide()">Hide Last</BButton>
      <BButton @click="() => hideAll()">Hide All</BButton>
    </BButtonGroup>
  </BDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BButton, BButtonGroup, BDialog, useModal } from 'bootstrap-vue-next'

const nestedModal1 = ref(false)
const nestedModal2 = ref(false)
const nestedModal3 = ref(false)

const { hide, hideAll } = useModal()
</script>
