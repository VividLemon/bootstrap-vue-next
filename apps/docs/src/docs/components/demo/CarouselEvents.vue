<template>
  <!-- #region template -->
  <BFormCheckbox v-model="locked" class="mb-2">Prevent navigation</BFormCheckbox>
  <BCarousel controls indicators @slide="onSlide" @slid="onSlid">
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 1</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 2</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 3</div></BCarouselSlide>
  </BCarousel>
  <p class="mt-2">{{ log }}</p>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { BvCarouselEvent } from 'bootstrap-vue-next'

const locked = ref(false)
const log = ref('')

const onSlide = (event: BvCarouselEvent) => {
  if (locked.value) {
    event.preventDefault()
    log.value = `Prevented ${event.from} → ${event.to}`
  }
}
const onSlid = (event: BvCarouselEvent) => {
  log.value = `Slid ${event.from} → ${event.to} (${event.direction})`
}
</script>
