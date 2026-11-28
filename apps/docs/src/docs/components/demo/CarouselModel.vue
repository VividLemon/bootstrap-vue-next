<template>
  <!-- #region template -->
  <BCarousel v-model="slide" controls indicators>
    <BCarouselSlide img-src="https://picsum.photos/1024/480/?image=70" img-alt="Slide 1" />
    <BCarouselSlide img-src="https://picsum.photos/1024/480/?image=71" img-alt="Slide 2" />
    <BCarouselSlide img-src="https://picsum.photos/1024/480/?image=72" img-alt="Slide 3" />
  </BCarousel>
  <p class="mt-2">Slide: {{ slide }}</p>
  <BButton size="sm" @click="slide = 2">Go to the third slide</BButton>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const slide = ref(1)
</script>
