<template>
  <!-- #region template -->
  <BCarousel
    controls
    :style="{
      '--bs-carousel-items': 3,
      '--bs-carousel-items-gap': '1rem',
      '--bs-carousel-items-peek': '2rem',
    }"
  >
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 1</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 2</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 3</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 4</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 5</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 6</div></BCarouselSlide>
  </BCarousel>
  <!-- #endregion template -->
</template>
