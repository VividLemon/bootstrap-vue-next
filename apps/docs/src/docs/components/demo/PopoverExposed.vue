<template>
  <div class="d-flex flex-column text-md-center">

    <div class="p-2">
      <BButton class="mx-2" @click="show">Show</BButton>
      <BButton class="mx-2" @click="hide">Hide</BButton>
      <BButton class="mx-2" @click="toggle">Toggle</BButton>

      <BPopover ref="myPopover" v-model="model" title="Popover">
        <template #activator="{ props }">
          <BButton v-bind="props" :color="{ theme: 'primary' }">I have a popover</BButton>
        </template>
        Hello <strong>World!</strong>
      </BPopover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { BPopover } from 'bootstrap-vue-next/components/BPopover'

const myPopover = useTemplateRef('myPopover')
const show = () => myPopover.value?.show()
const hide = () => myPopover.value?.hide()
const toggle = () => myPopover.value?.toggle()
const model = ref(false)
</script>
