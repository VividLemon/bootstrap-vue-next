<template>
  <BButton @click="showMe">Show</BButton>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { type ThemeColor, type ToastOrchestratorCreateParamBase } from 'bootstrap-vue-next'
import { BButton } from 'bootstrap-vue-next/components/BButton'
import { useToast } from 'bootstrap-vue-next/composables/useToast'

const { create } = useToast()

const body = ref('foo')

let intervalId: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  intervalId = setInterval(() => {
    body.value = body.value === 'foo' ? 'bar' : 'foo'
  }, 1000)
})

onUnmounted(() => {
  if (intervalId !== undefined) {
    clearInterval(intervalId)
  }
})

// `create()` needs a writable ref/plain object (it needs to control its own state),
// so `reactive()` is not used here. Instead, derive the reactive pieces with `computed()`,
// then sync them onto a plain ref via `watchEffect()`.
const derivedTheme = computed(() => (body.value === 'foo' ? 'danger' : 'info') as ThemeColor)
const myToast = ref<ToastOrchestratorCreateParamBase>({
  body: body.value,
  theme: derivedTheme.value,
})
watchEffect(() => {
  myToast.value.body = body.value
  myToast.value.theme = derivedTheme.value
})

const showMe = async () => {
  await using _ = await create(myToast).show()
}
</script>
