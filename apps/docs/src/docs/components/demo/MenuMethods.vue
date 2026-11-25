<template>
  <div class="d-flex gap-2 mb-2">
    <BButton :color="{ theme: 'success' }" @click="show">Show</BButton>
    <BButton :color="{ theme: 'danger' }" @click="hide">Hide</BButton>
    <BButton @click="toggle">Toggle</BButton>
  </div>

  <BMenu ref="menu" text="Menu" :auto-close="false">
    <BMenuItem>Action</BMenuItem>
    <BMenuItem>Another action</BMenuItem>
  </BMenu>
</template>

<script setup lang="ts">
import { BMenu } from 'bootstrap-vue-next/components/BMenu'
import { useTemplateRef } from 'vue'

const menu = useTemplateRef<InstanceType<typeof BMenu>>('menu')

const show = () => menu.value?.show()
const hide = () => menu.value?.hide()
const toggle = () => menu.value?.toggle()
</script>
