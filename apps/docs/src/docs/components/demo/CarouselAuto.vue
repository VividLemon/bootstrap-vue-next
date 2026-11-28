<template>
  <!-- #region template -->
  <BCarousel controls auto :style="{ '--bs-carousel-items-gap': '1rem' }">
    <BCarouselSlide style="width: 12rem"><div class="p-5 bg-2 rounded">Narrow</div></BCarouselSlide>
    <BCarouselSlide style="width: 24rem"
      ><div class="p-5 bg-2 rounded">Wide slide</div></BCarouselSlide
    >
    <BCarouselSlide style="width: 16rem"><div class="p-5 bg-2 rounded">Medium</div></BCarouselSlide>
    <BCarouselSlide style="width: 20rem"
      ><div class="p-5 bg-2 rounded">Another one</div></BCarouselSlide
    >
  </BCarousel>
  <!-- #endregion template -->
</template>
