<template>
  <BContainer fluid>
    <BRow class="mb-4">
      <BCol>
        <p>v-model: {{ modelValue }} — last event: {{ lastEvent }}</p>
        <BCarousel
          v-model="modelValue"
          controls
          indicators
          play-pause
          autoplay
          :interval="8000"
          @slid="lastEvent = `slid ${$event.from} → ${$event.to}`"
        >
          <BCarouselSlide :interval="2000" img-src="https://picsum.photos/1024/480/?image=13" />
          <BCarouselSlide :interval="4000" img-src="https://picsum.photos/1024/480/?image=14" />
          <BCarouselSlide img-src="https://picsum.photos/1024/480/?image=15" />
        </BCarousel>
      </BCol>
    </BRow>
    <BRow class="mb-4">
      <BCol>
        <BCarousel controls indicators overlay fade>
          <BCarouselSlide img-src="https://picsum.photos/1024/480/?image=52" img-alt="First" />
          <BCarouselSlide img-src="https://picsum.photos/1024/480/?image=54" img-alt="Second" />
        </BCarousel>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BCarousel
          controls
          ends="stop"
          :style="{'--bs-carousel-items': 3, '--bs-carousel-items-gap': '1rem'}"
        >
          <BCarouselSlide v-for="n in 7" :key="n">
            <div class="p-5 text-center bg-2 rounded">Slide {{ n }}</div>
          </BCarouselSlide>
        </BCarousel>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const modelValue = ref(0)
const lastEvent = ref('')
</script>
