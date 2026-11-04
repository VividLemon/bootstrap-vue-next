<template>
  <BAlert v-model="showFadingAlert" theme="success" dismissible>
    Dismissing this alert fades it out.
  </BAlert>

  <BAlert v-model="showInstantAlert" theme="danger" dismissible no-transition>
    Dismissing this alert removes it at once.
  </BAlert>

  <BAlert
    v-model="dismissCountDown"
    dismissible
    theme="warning"
    :progress-props="{ theme: 'warning' }"
    @close-countdown="countdown = $event"
  >
    <p>This alert fades out after {{ Math.ceil(countdown / 1000) }} seconds...</p>
  </BAlert>

  <BButton theme="info" class="m-1" @click="showAll"> Show the alerts again </BButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showFadingAlert = ref(true)
const showInstantAlert = ref(true)

const dismissCountDown = ref(5000)
const countdown = ref(0)

const showAll = () => {
  showFadingAlert.value = true
  showInstantAlert.value = true
  dismissCountDown.value = 5000
}
</script>
