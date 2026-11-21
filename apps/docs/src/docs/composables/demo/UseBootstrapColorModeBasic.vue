<template>
  <ClientOnly>
    <BCard ref="target">
      <BButton @click="changeColor"> Current color: {{ mode }} </BButton>
    </BCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import {useTemplateRef} from 'vue'
import {useBootstrapColorMode} from 'bootstrap-vue-next'
import {type BCard} from 'bootstrap-vue-next/components/BCard'

const target = useTemplateRef('target')

const mode = useBootstrapColorMode({
  selector: target,
})

const changeColor = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}
</script>
