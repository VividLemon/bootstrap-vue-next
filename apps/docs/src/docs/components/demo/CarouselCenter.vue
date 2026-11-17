<template>
  <!-- #region template -->
  <BCarousel
    controls
    center
    :style="{ '--bs-carousel-items': 2, '--bs-carousel-items-gap': '1rem' }"
  >
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 1</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 2</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 3</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 4</div></BCarouselSlide>
    <BCarouselSlide><div class="p-5 text-center bg-2 rounded">Slide 5</div></BCarouselSlide>
  </BCarousel>
  <!-- #endregion template -->
</template>
