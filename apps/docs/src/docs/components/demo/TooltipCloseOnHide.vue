<template>
  <div class="d-flex gap-2">
    <BTooltip
      :click="true"
      :close-on-hide="true"
      :delay="{show: 0, hide: 0}"
    >
      <template #activator="{ props }">
        <BButton v-bind="props">Click me. Tooltip closes when clipped</BButton>
      </template>
      Scroll me out of view
    </BTooltip>
    <BTooltip
      :click="true"
      :close-on-hide="true"
      :delay="{show: 0, hide: 0}"
      :boundary-padding="{top: navHeight}"
    >
      <template #title>Scroll me out of view</template>
      <template #activator="{ props }">
        <BButton v-bind="props">This tooltip gets hidden by the top nav</BButton>
      </template>
    </BTooltip>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'

const navRef = ref<Element | null>(null)
onMounted(() => {
  navRef.value = document.body.querySelector('#app > nav')
})
const navHeight = computed(() => navRef.value?.clientHeight)
</script>
