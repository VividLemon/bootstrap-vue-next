<template>
  <div
    :id="computedId"
    ref="_element"
    class="carousel slide pointer-event"
    :class="computedClasses"
  >
    <div
      v-if="props.indicators"
      class="carousel-indicators"
      :aria-label="props.labelIndicators"
      :aria-owns="buttonOwnership"
    >
      <!-- :data-bs-target="`#${computedId}`" is required since the classes target elems with that attr -->
      <button
        v-for="(_, i) in slides.length"
        :key="i"
        type="button"
        data-bs-target=""
        :class="i === modelValue ? 'active' : ''"
        :aria-current="i === modelValue ? true : undefined"
        :aria-label="`${props.indicatorsButtonLabel} ${i}`"
        :aria-controls="buttonOwnership"
        :aria-describedby="slides[i]?.id"
        @click="goToValue(i)"
      />
    </div>

    <div ref="_relatedTarget" class="carousel-inner">
      <TransitionGroup
        :enter-from-class="enterClasses"
        :enter-active-class="enterClasses"
        :enter-to-class="enterClasses"
        :leave-from-class="leaveClasses"
        :leave-active-class="leaveClasses"
        :leave-to-class="leaveClasses"
        @before-leave="onBeforeLeave"
        @after-leave="onAfterLeave"
        @after-enter="onAfterEnter"
      >
        <slot />
<!--        <component-->
<!--          :is="slide"-->
<!--          v-for="(slide, i) in slides"-->
<!--          v-show="i === modelValue"-->
<!--          :key="i"-->
<!--          ref="_slideValues"-->
<!--          :class="{active: i === modelValue && isTransitioning === false}"-->
<!--          :style="props.noAnimation && {transition: 'none'}"-->
<!--        />-->
      </TransitionGroup>
    </div>

    <template v-if="props.controls">
      <button class="carousel-control-prev" type="button" @click="onClickPrev">
        <span class="carousel-control-prev-icon" aria-hidden="true" />
        <span class="visually-hidden">{{ props.controlsPrevText }}</span>
      </button>
      <button class="carousel-control-next" type="button" @click="onClickNext">
        <span class="carousel-control-next-icon" aria-hidden="true" />
        <span class="visually-hidden">{{ props.controlsNextText }}</span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import {BvCarouselEvent} from '../../utils'
import {computed, type ComputedRef, provide, type Ref, ref, toRef, useTemplateRef, watch} from 'vue'
import {useId} from '../../composables/useId'
import {onKeyStroke, useElementHover, useIntervalFn, useSwipe, useToNumber} from '@vueuse/core'
import {useDefaults} from '../../composables/useDefaults'
import {carouselInjectionKey} from '../../utils/keys'
import type {BCarouselEmits, BCarouselSlots, BCarouselProps} from '../../types'

const _props = withDefaults(defineProps<Omit<BCarouselProps, 'modelValue'>>(), {
  background: undefined,
  controls: false,
  controlsNextText: 'Next',
  controlsPrevText: 'Previous',
  fade: false,
  id: undefined,
  imgHeight: undefined,
  imgWidth: undefined,
  indicators: false,
  indicatorsButtonLabel: 'Slide',
  interval: 5000,
  labelIndicators: 'Select a slide to display',
  keyboard: true,
  noAnimation: false,
  noHoverPause: false,
  noTouch: false,
  noWrap: false,
  ride: false,
  rideReverse: false,
  touchThreshold: 50,
})
const props = useDefaults(_props, 'BCarousel')
const emit = defineEmits<BCarouselEmits>()
defineSlots<BCarouselSlots>()

const computedId = useId(() => props.id, 'carousel')
const buttonOwnership = useId(undefined, 'carousel-button-ownership')

const modelValue = defineModel<Exclude<BCarouselProps['modelValue'], undefined>>({default: 0})

const slides = ref<{id: ComputedRef<string>; interval: Readonly<Ref<number | 'requestAnimationFrame' | null>>}[]>([])
const parentBackground = toRef(() => props.background)
const parentWidth = toRef(() => props.imgWidth)
const parentHeight = toRef(() => props.imgHeight)
const parentStyle = computed(() => props.noAnimation ? {transition: 'none'} : undefined)
provide(carouselInjectionKey, (obj) => {
  slides.value.push(obj)

  const index = computed(() => slides.value.findIndex((e) => e.id === obj.id.value))
  return {
    index,
    style: parentStyle,
    class: computed(() => ({
      active: index.value === modelValue.value,
    })),
    unregister: () => {
      slides.value.splice(index.value, 1)
    },
    background: parentBackground,
    width: parentWidth,
    height: parentHeight,
  }
})
const activeSlide = computed(() => slides.value[modelValue.value])
const slideInterval = computed(() => activeSlide.value?.interval ?? null)

const touchThresholdNumber = useToNumber(() => props.touchThreshold)
const intervalNumber = useToNumber(() => slideInterval.value ?? props.interval)

const isTransitioning = ref(false)
const rideStarted = ref(false)
const direction = ref(true)
const relatedTarget = useTemplateRef('_relatedTarget')
const element = useTemplateRef('_element')
const previousModelValue = ref(modelValue.value)

const isHovering = useElementHover(element)

// Class carousel-item is a static property
// If you make it static, the direction can be reversed -- properly (atm it does the carousel-item-${} logic backwards for entering, a weird hack)
// So all that would be great. However, when you do this, it will break the transition flow. Something about it breaks and I'm not sure why!
// Try it by removing carousel-item from below and making `!direction.value` => `direction.value` for enter
// Then reviewing the behavior
const enterClasses = computed(
  () =>
    `carousel-item carousel-item-${!direction.value ? 'next' : 'prev'} carousel-item-${
      !direction.value ? 'start' : 'end'
    }`
)
const leaveClasses = computed(
  () => `carousel-item active carousel-item-${direction.value ? 'start' : 'end'}`
)

const {pause, resume} = useIntervalFn(
  () => {
    if (props.rideReverse) {
      prev()
      return
    }
    next()
  },
  intervalNumber,
  {immediate: props.ride === 'carousel'}
)

const isRiding = computed(
  () => (props.ride === true && rideStarted.value === true) || props.ride === 'carousel'
)

// const slides = computed(() => getSlotElements(slots.default, 'BCarouselSlide'))
const computedClasses = computed(() => ({'carousel-fade': props.fade}))

const buildBvCarouselEvent = (event: 'slid' | 'slide') =>
  new BvCarouselEvent(event, {
    componentId: computedId.value,
    cancelable: false,
    target: element.value,
    direction: direction.value ? 'right' : 'left',
    from: previousModelValue.value,
    to: modelValue.value,
    relatedTarget: relatedTarget.value?.children[modelValue.value] ?? null,
  })

const goToValue = (value: number): void => {
  if (isTransitioning.value === true) return

  if (props.ride === true) {
    rideStarted.value = true
  }
  if (isRiding.value === true) {
    resume()
  }
  direction.value = value >= modelValue.value
  if (value >= slides.value.length) {
    if (props.noWrap) return
    modelValue.value = 0
    return
  }
  if (value < 0) {
    if (props.noWrap) return
    modelValue.value = slides.value.length - 1
    return
  }
  previousModelValue.value = modelValue.value
  modelValue.value = value
}

const prev = (): void => {
  goToValue(modelValue.value - 1)
}
const next = (): void => {
  goToValue(modelValue.value + 1)
}

const onKeydown = (fn: () => void) => {
  if (!props.keyboard) return
  fn()
}

const onMouseEnter = () => {
  if (props.noHoverPause) return
  pause()
}
const onMouseLeave = () => {
  if (!isRiding.value) return
  resume()
}

const {lengthX} = useSwipe(element, {
  passive: true,
  onSwipeStart() {
    if (props.noTouch) return
    pause()
  },
  onSwipeEnd() {
    if (props.noTouch) return
    const resumeRiding = () => {
      if (isRiding.value === false) return
      resume()
    }
    if (lengthX.value >= touchThresholdNumber.value) {
      next()
      resumeRiding()
      return
    }
    if (lengthX.value <= -touchThresholdNumber.value) {
      prev()
      resumeRiding()
    }
  },
})

const onBeforeLeave = () => {
  emit('slide', buildBvCarouselEvent('slide'))
  isTransitioning.value = true
}
const onAfterLeave = () => {
  emit('slid', buildBvCarouselEvent('slid'))
  isTransitioning.value = false
}
// carousel-item class is removed from the slide during the transition,
// as is included within enter classes.
// The first slide recovers carousel-item class,
const onAfterEnter = (el: Readonly<Element>) => {
  if (modelValue.value !== 0) {
    el.classList.add('carousel-item')
  }
}

onKeyStroke(
  'ArrowLeft',
  () => {
    onKeydown(prev)
  },
  {target: element}
)
onKeyStroke(
  'ArrowRight',
  () => {
    onKeydown(next)
  },
  {target: element}
)

watch(
  () => props.ride,
  () => {
    rideStarted.value = false
  }
)

watch(isHovering, (newValue) => {
  if (newValue) {
    onMouseEnter()
    return
  }
  onMouseLeave()
})

const onClickPrev = (event: MouseEvent) => {
  emit('prev-click', event)
  if (event.defaultPrevented) return
  prev()
}
const onClickNext = (event: MouseEvent) => {
  emit('next-click', event)
  if (event.defaultPrevented) return
  next()
}

defineExpose({
  next,
  pause,
  prev,
  resume,
})
</script>
