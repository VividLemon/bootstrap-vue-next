<template>
  <!-- #region template -->
  <BCarousel>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 1</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 2</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 3</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 4</div></BCarouselSlide>
    <template #controls="{ prev, next, index, count, canPrev, canNext }">
      <div class="d-flex align-items-center justify-content-center gap-2">
        <BButton size="sm" :disabled="!canPrev" @click="prev">Back</BButton>
        <span>{{ index + 1 }} / {{ count }}</span>
        <BButton size="sm" :disabled="!canNext" @click="next">Forward</BButton>
      </div>
    </template>
  </BCarousel>
  <!-- #endregion template -->
</template>
