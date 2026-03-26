<template>
  <b-container>
    <b-row>
      <b-col>
        {{secondSlide}}
        <BButton @click="secondSlide--">Minus</BButton>
        <BButton @click="secondSlide++">Plus</BButton>
        <b-carousel
:model-value="secondSlide" indicators controls @update:model-value="(e) => {
          console.log('updating first', e)
          secondSlide = e
        }">
          <b-carousel-slide
            v-for="el in ['https://picsum.photos/1024/480/?image=34','https://picsum.photos/1024/480/?image=35','https://picsum.photos/1024/480/?image=36']"
            :key="el"
            :img-src="el"
          />

        </b-carousel>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-carousel :model-value="secondSlide" indicators controls>
          <b-carousel-slide img-src="https://picsum.photos/1024/480/?image=1" />
          <b-carousel-slide img-src="https://picsum.photos/1024/480/?image=2" />
          <b-carousel-slide img-src="https://picsum.photos/1024/480/?image=3" />
        </b-carousel>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const secondSlide = ref(0)
</script>