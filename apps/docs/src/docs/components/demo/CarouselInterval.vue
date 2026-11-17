<template>
  <!-- #region template -->
  <BCarousel autoplay play-pause indicators :interval="4000">
    <BCarouselSlide
      img-src="https://picsum.photos/1024/480/?image=60"
      img-alt="Slide 1"
      :interval="1000"
    />
    <BCarouselSlide
      img-src="https://picsum.photos/1024/480/?image=61"
      img-alt="Slide 2"
      :interval="2000"
    />
    <BCarouselSlide img-src="https://picsum.photos/1024/480/?image=62" img-alt="Slide 3" />
  </BCarousel>
  <!-- #endregion template -->
</template>
