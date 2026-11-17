<template>
  <!-- #region template -->
  <BFormRadioGroup v-model="ends" :options="['loop', 'wrap', 'stop']" class="mb-2" />
  <BCarousel controls indicators :ends="ends">
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 1</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 2</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 3</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 4</div></BCarouselSlide>
  </BCarousel>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CarouselEnds } from 'bootstrap-vue-next'

const ends = ref<CarouselEnds>('loop')
</script>
