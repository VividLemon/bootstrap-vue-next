<template>
  <!-- #region template -->
  <BCarousel ref="carousel" indicators>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 1</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 2</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 3</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 4</div></BCarouselSlide>
  </BCarousel>
  <div class="d-flex gap-2 mt-2">
    <BButton size="sm" @click="carousel?.prev()">Prev</BButton>
    <BButton size="sm" @click="carousel?.next()">Next</BButton>
    <BButton size="sm" @click="carousel?.to(3)">Last</BButton>
    <BButton size="sm" @click="carousel?.cycle()">Cycle</BButton>
    <BButton size="sm" @click="carousel?.pause()">Pause</BButton>
  </div>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

const carousel = useTemplateRef('carousel')
</script>
