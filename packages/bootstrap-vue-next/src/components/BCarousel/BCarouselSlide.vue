<template>
  <div
    :id="computedId"
    ref="_el"
    class="carousel-item"
    :class="{active: isActive}"
    :data-bs-interval="props.interval"
  >
    <slot name="img">
      <BImg
        v-if="props.imgSrc || props.imgSrcset"
        class="d-block w-100"
        :alt="props.imgAlt"
        :srcset="props.imgSrcset"
        :src="props.imgSrc"
      />
    </slot>
    <slot />
  </div>
</template>

<script setup lang="ts">
import {computed, inject, onBeforeUnmount, useTemplateRef} from 'vue'
import {carouselInjectionKey} from '../../utils/keys'
import BImg from '../BImg/BImg.vue'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import type {BCarouselSlideProps, BCarouselSlideSlots} from '../../types'

const _props = withDefaults(defineProps<BCarouselSlideProps>(), {
  id: undefined,
  imgAlt: undefined,
  imgSrc: undefined,
  imgSrcset: undefined,
  interval: undefined,
})
const props = useDefaults(_props, 'BCarouselSlide')
defineSlots<BCarouselSlideSlots>()

const computedId = useId(() => props.id, 'carousel-slide')
const parentData = inject(carouselInjectionKey, null)

const el = useTemplateRef<HTMLElement>('_el')
const key = Symbol('carouselSlide')
parentData?.register(key, el)
onBeforeUnmount(() => parentData?.unregister(key))

const isActive = computed(
  () => !!parentData && parentData.indexOf(key) === parentData.activeIndex.value
)
</script>
