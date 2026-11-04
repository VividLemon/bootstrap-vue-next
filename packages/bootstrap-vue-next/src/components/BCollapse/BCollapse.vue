<template>
  <slot name="header" v-bind="sharedSlots" />
  <component
    :is="props.tag"
    :id="computedId"
    ref="_element"
    class="collapse"
    :class="computedClasses"
    :style="computedStyle"
    :is-nav="props.isNav"
    v-bind="$attrs"
  >
    <slot v-if="contentShowing" v-bind="sharedSlots" />
  </component>
  <slot name="footer" v-bind="sharedSlots" />
</template>

<script setup lang="ts">
import {computed, type EmitFn, provide, toRef, useTemplateRef} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {collapseInjectionKey} from '../../utils/keys'
import type {BCollapseEmits, BCollapseProps, BCollapseSlots, ShowHideSlotsData} from '../../types'
import {useShowHide} from '../../composables/useShowHide'
import {useCssTransition} from '../../composables/useCssTransition'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BCollapseProps, 'modelValue'>>(), {
  horizontal: false,
  id: undefined,
  initialAnimation: false,
  isNav: false,
  lazy: false,
  noTransition: false,
  unmountLazy: false,
  tag: 'div',
  show: false,
  visible: false,
})
const props = useDefaults(_props, 'BCollapse')
const emit = defineEmits<BCollapseEmits>()
defineSlots<BCollapseSlots>()

const modelValue = defineModel<Exclude<BCollapseProps['modelValue'], undefined>>({
  default: false,
})

const computedId = useId(() => props.id, 'collapse')

const element = useTemplateRef<HTMLElement | null>('_element')

// Bootstrap v6 animates the collapse purely in CSS: the element always keeps `.collapse` and
// only `.show` is toggled. `shown` / `hidden` fire once the element's own transition ended.
const {run} = useCssTransition(element)

const {visible, isActive, instant, contentShowing, show, hide, toggle} = useShowHide(
  {modelValue, props, emit: emit as EmitFn, element, id: computedId},
  {transition: () => run()}
)

const isInstant = computed(() => props.noTransition || instant.value)

const computedClasses = computed(() => ({
  'show': visible.value,
  'navbar-collapse': props.isNav,
  'collapse-horizontal': props.horizontal,
  // Bootstrap v6 has no `collapse-instant` class; its collapse JS treats `transition-none`
  // (zero computed duration) as "no transition"
  'transition-none': isInstant.value,
}))

// Bootstrap 6.0.0-alpha.1 ships the `.collapse` transition outside any cascade layer, so it
// beats the layered `transition-none` utility. Zeroing v6's own duration token inline works
// regardless of layers. Remove once upstream layers `_transitions.scss`.
const computedStyle = computed(() =>
  isInstant.value ? {'--bs-transition-collapse-duration': '0s'} : undefined
)

const sharedSlots = computed<ShowHideSlotsData>(() => ({
  toggle,
  show,
  hide,
  id: computedId.value,
  visible: visible.value,
  active: isActive.value,
}))

defineExpose({
  hide,
  isNav: props.isNav,
  show,
  toggle,
  visible,
})

provide(collapseInjectionKey, {
  id: computedId,
  hide,
  show,
  toggle,
  visible,
  isNav: toRef(() => props.isNav),
})
</script>
