<template>
  <div
    :id="computedId"
    ref="root"
    class="carousel"
    :class="computedClasses"
    :style="computedStyle"
    @keydown="engine.onKeydown"
    @mouseenter="engine.onMouseenter"
    @mouseleave="engine.onMouseleave"
  >
    <div ref="viewport" class="carousel-inner" tabindex="0" @pointerdown="engine.onPointerdown">
      <slot />
    </div>
    <slot name="controls" v-bind="controlsSlotProps">
      <div
        v-if="hasBar"
        :class="
          props.overlay
            ? 'carousel-overlay-controls'
            : 'd-flex justify-content-between align-items-center'
        "
      >
        <div
          v-if="props.indicators"
          class="carousel-indicators"
          :aria-label="props.labelIndicators"
        >
          <button
            v-for="i in slideCount"
            :key="i"
            type="button"
            :data-bs-target="`#${computedId}`"
            :class="{active: i - 1 === activeIndex}"
            :aria-current="i - 1 === activeIndex ? 'true' : undefined"
            :aria-label="`${props.indicatorsButtonLabel} ${i}`"
            @click="onIndicator(i - 1)"
          />
        </div>
        <span v-else />
        <div v-if="props.playPause || props.controls" class="d-flex gap-1">
          <button
            v-if="props.playPause"
            type="button"
            class="btn-icon btn-sm carousel-control-play-pause"
            :class="[buttonClasses, {paused: !engine.playing.value}]"
            :aria-label="engine.playing.value ? props.pauseLabel : props.playLabel"
            @click="engine.togglePlay"
          >
            <span class="carousel-icon-pause" aria-hidden="true" />
            <span class="carousel-icon-play" aria-hidden="true" />
          </button>
          <template v-if="props.controls">
            <button
              ref="prev"
              type="button"
              class="btn-icon btn-sm"
              :class="buttonClasses"
              :disabled="!engine.canPrev.value || undefined"
              @click="onControl(engine.prev)"
            >
              <span class="carousel-icon-prev" aria-hidden="true" />
              <span class="visually-hidden">{{ props.controlsPrevText }}</span>
            </button>
            <button
              ref="next"
              type="button"
              class="btn-icon btn-sm"
              :class="buttonClasses"
              :disabled="!engine.canNext.value || undefined"
              @click="onControl(engine.next)"
            >
              <span class="carousel-icon-next" aria-hidden="true" />
              <span class="visually-hidden">{{ props.controlsNextText }}</span>
            </button>
          </template>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  type CSSProperties,
  nextTick,
  provide,
  readonly,
  ref,
  type Ref,
  shallowRef,
  useTemplateRef,
  watch,
  onUpdated,
} from 'vue'
import {BvCarouselEvent} from '../../utils/classes'
import {useId} from '../../composables/useId'
import {useDefaults} from '../../composables/useDefaults'
import {getSlotElements} from '../../utils/getSlotElements'
import {carouselInjectionKey} from '../../utils/keys'
import {sortSlotElementsByPosition} from '../../utils/dom'
import type {
  BCarouselEmits,
  BCarouselProps,
  BCarouselSlots,
  CarouselControlsSlotProps,
} from '../../types'
import {type CarouselSlideDetail, useCarouselEngine} from './useCarouselEngine'

const _props = withDefaults(defineProps<Omit<BCarouselProps, 'modelValue'>>(), {
  auto: false,
  autoplay: false,
  center: false,
  controls: false,
  controlsNextText: 'Next',
  controlsPrevText: 'Previous',
  ends: 'loop',
  fade: false,
  id: undefined,
  indicators: false,
  indicatorsButtonLabel: 'Slide',
  interval: 5000,
  keyboard: true,
  labelIndicators: 'Select a slide to display',
  noTransition: false,
  overlay: false,
  pause: 'hover',
  pauseLabel: 'Pause',
  playLabel: 'Play',
  playPause: false,
})
const props = useDefaults(_props, 'BCarousel')
const emit = defineEmits<BCarouselEmits>()
const slots = defineSlots<BCarouselSlots>()

const modelValue = defineModel<Exclude<BCarouselProps['modelValue'], undefined>>({default: 0})

const computedId = useId(() => props.id, 'carousel')

const root = useTemplateRef<HTMLElement>('root')
const viewport = useTemplateRef<HTMLElement>('viewport')
const prevControl = useTemplateRef<HTMLElement>('prev')
const nextControl = useTemplateRef<HTMLElement>('next')

// Counted from the slot vnodes so server and client render the same indicators
const slideCount = computed(() => getSlotElements(slots.default, 'BCarouselSlide').length)

/** The slide the carousel rests on. The model follows it; the model drives navigation */
const activeIndex = ref(modelValue.value)

const buildEvent = (type: 'slide' | 'slid', detail: CarouselSlideDetail) =>
  new BvCarouselEvent(type, {
    componentId: computedId.value,
    cancelable: type === 'slide',
    target: root.value,
    relatedTarget: detail.relatedTarget,
    direction: detail.direction,
    from: detail.from,
    to: detail.to,
  })

const engine = useCarouselEngine({
  root,
  viewport,
  prevControl,
  nextControl,
  activeIndex,
  count: slideCount,
  autoplay: () => props.autoplay,
  ends: () => props.ends,
  fade: () => props.fade,
  center: () => props.center,
  auto: () => props.auto,
  interval: () => props.interval,
  keyboard: () => props.keyboard,
  pauseOnHover: () => props.pause === 'hover',
  noTransition: () => props.noTransition,
  onSlide: (detail) => {
    const event = buildEvent('slide', detail)
    emit('slide', event)
    return !event.defaultPrevented
  },
  onSlid: (detail) => {
    emit('slid', buildEvent('slid', detail))
  },
})

watch(activeIndex, (value) => {
  if (modelValue.value !== value) modelValue.value = value
})
watch(modelValue, (value) => {
  if (value === activeIndex.value) return
  const result = engine.to(value)
  // A prevented or impossible change caused by `v-model` reverts the model
  if (result === 'prevented' || result === 'invalid') modelValue.value = activeIndex.value
})

watch(
  () => props.autoplay,
  (value) => engine.setPlaying(value)
)
watch(
  () => [slideCount.value, props.fade] as const,
  () => nextTick(() => engine.refresh())
)

const computedClasses = computed(() => ({
  'carousel-fade': props.fade,
  'carousel-center': props.center,
  'carousel-auto': props.auto,
  'carousel-overlay': props.overlay,
  'carousel-playing': engine.cycling.value,
}))

const computedStyle = computed<CSSProperties | undefined>(() => {
  const style: Record<string, string> = {}
  if (engine.cycling.value) style['--bs-carousel-interval'] = `${engine.currentInterval.value}ms`
  if (props.noTransition) style['--bs-carousel-fade-duration'] = '0s'
  return Object.keys(style).length ? (style as CSSProperties) : undefined
})

const hasBar = computed(() => props.indicators || props.controls || props.playPause)
const buttonClasses = computed(() => (props.overlay ? 'btn-subtle theme-secondary' : undefined))

// Every control is an explicit interaction: it stops autoplay for good (WCAG 2.2.2)
const onControl = (action: () => void) => {
  engine.pauseFromInteraction()
  action()
}
const onIndicator = (index: number) => {
  engine.pauseFromInteraction()
  engine.to(index)
}

// Slides register to learn their index: render order during setup, DOM order after updates
interface CarouselItem {
  key: symbol
  el: Readonly<Ref<HTMLElement | null>>
}
const items = shallowRef<readonly CarouselItem[]>([])
const sortItems = () => {
  const sorted = [...items.value].sort((a, b) => sortSlotElementsByPosition(a.el.value, b.el.value))
  if (sorted.some((item, i) => item !== items.value[i])) items.value = sorted
}
onUpdated(sortItems)

provide(carouselInjectionKey, {
  activeIndex: readonly(activeIndex),
  register: (key, el) => {
    items.value = [...items.value, {key, el}]
  },
  unregister: (key) => {
    items.value = items.value.filter((item) => item.key !== key)
  },
  indexOf: (key) => items.value.findIndex((item) => item.key === key),
})

const controlsSlotProps = computed<CarouselControlsSlotProps>(() => ({
  prev: () => onControl(engine.prev),
  next: () => onControl(engine.next),
  to: (index: number) => onIndicator(index),
  cycle: () => engine.setPlaying(true),
  pause: engine.pause,
  togglePlay: engine.togglePlay,
  playing: engine.playing.value,
  index: activeIndex.value,
  count: slideCount.value,
  canPrev: engine.canPrev.value,
  canNext: engine.canNext.value,
}))

defineExpose({
  next: engine.next,
  prev: engine.prev,
  to: (index: number) => {
    engine.to(index)
  },
  cycle: () => engine.setPlaying(true),
  pause: engine.pause,
  nextWhenVisible: engine.nextWhenVisible,
  playing: engine.playing,
})
</script>
