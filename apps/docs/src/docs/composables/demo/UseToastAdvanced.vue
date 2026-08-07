<template>
  <BButton @click="showMe">Show</BButton>
</template>

<script setup lang="ts">
import {h, onMounted, onUnmounted, ref} from 'vue'
import {BButton, useToast} from 'bootstrap-vue-next'

const {create} = useToast()

const body = ref(`${Math.random()}`)

let intervalId: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  intervalId = setInterval(() => {
    body.value = `${Math.random()}`
  }, 1000)
})

onUnmounted(() => {
  if (intervalId !== undefined) {
    clearInterval(intervalId)
  }
})

const showMe = () => {
  create({
    body: body.value,
    slots: {default: () => h('div', null, `custom! ${body.value}`)},
  }).show()
  // Demonstration pseudocode, you can also import a component and use it
  // const importedComponent = () => {
  //   create({
  //     component: import('./MyToastComponent.vue'),
  //   })
  // }
}
</script>
