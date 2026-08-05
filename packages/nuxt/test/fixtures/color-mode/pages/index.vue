<template>
  <div id="color-mode-page">
    <span id="theme-mode">{{ colorMode }}</span>
    <button
      id="toggle-theme"
      type="button"
      @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'"
    >
      Toggle
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'NuxtColorModePage' })

const mode = useColorMode()
const colorMode = computed({
  get: () => mode.value,
  set: (value) => {
    mode.value = value
  },
})
</script>
