<template>
  <div>
    <div class="d-flex gap-2">
      <BButton id="show-btn" @click="show">Open Dialog</BButton>
      <BButton id="toggle-btn" @click="toggle">Toggle Dialog</BButton>
    </div>
    <BDialog ref="my-dialog" title="Using Component Methods">
      <div class="d-block text-center">
        <h3>Hello From My Dialog!</h3>
      </div>
      <div class="d-flex justify-content-center gap-2 mt-3">
        <BButton variant="outline" :color="{ theme: 'danger' }" @click="hide">Close Me</BButton>
        <BButton variant="outline" :color="{ theme: 'warning' }" @click="toggle">
          Toggle Me
        </BButton>
      </div>
    </BDialog>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { BDialog } from 'bootstrap-vue-next/components/BDialog'
import { type ComponentExposed } from 'vue-component-type-helpers'

const myDialog = useTemplateRef<ComponentExposed<typeof BDialog>>('my-dialog')
const show = () => myDialog.value?.show()
const hide = () => myDialog.value?.hide('button')
const toggle = () => myDialog.value?.toggle()
</script>
