<template>
  <div
    v-if="renderRef || contentShowing"
    v-show="isAlertVisible"
    :id="props.id"
    ref="_element"
    class="alert"
    :class="[props.alertClass, computedClasses]"
    tabindex="0"
    :role="!isAlertVisible ? undefined : props.isStatus ? 'status' : 'alert'"
    :aria-live="!isAlertVisible ? undefined : props.isStatus ? 'polite' : 'assertive'"
    :aria-atomic="!isAlertVisible ? undefined : true"
  >
    <div v-if="contentShowing" class="d-flex flex-column flex-grow-1 gap-2">
      <component
        :is="props.headerTag"
        v-if="slots.title || props.title"
        class="alert-heading"
        :class="props.headerClass"
      >
        <slot name="title" v-bind="sharedSlots">
          <span>
            {{ props.title }}
          </span>
        </slot>
      </component>
      <component
        :is="computedTag"
        v-if="slots.default || props.body"
        class="alert-body"
        :class="props.bodyClass"
        v-bind="computedLinkProps"
        @click="computedLink && props.dismissible ? hide() : () => {}"
      >
        <slot v-bind="sharedSlots">
          {{ props.body }}
        </slot>
      </component>
      <BProgress
        v-if="typeof modelValue === 'number' && props.progressProps !== undefined"
        :animated="props.progressProps.animated"
        :precision="props.progressProps.precision"
        :show-progress="props.progressProps.showProgress"
        :show-value="props.progressProps.showValue"
        :striped="props.progressProps.striped"
        :variant="props.progressProps.variant"
        :max="modelValue"
        :value="remainingMs"
        height="4px"
      />
    </div>
    <template v-if="contentShowing && props.dismissible">
      <BButton
        v-if="slots.close || props.closeContent"
        :class="[props.closeClass]"
        class="ms-auto btn-close-custom"
        :variant="props.closeVariant"
        @click.stop.prevent="hide('close')"
      >
        <slot name="close" v-bind="sharedSlots">
          {{ props.closeContent }}
        </slot>
      </BButton>
      <BCloseButton
        v-else
        :aria-label="props.closeLabel"
        :class="[props.closeClass]"
        class="ms-auto"
        @click.stop.prevent="hide('close')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, type EmitFn, useTemplateRef, watch, watchEffect} from 'vue'
import {useBLinkHelper} from '../../composables/useBLinkHelper'
import type {BAlertEmits, BAlertProps, BAlertSlots, ShowHideSlotsData} from '../../types'
import BCloseButton from '../BButton/BCloseButton.vue'
import BLink from '../BLink/BLink.vue'
import BProgress from '../BProgress/BProgress.vue'
import {useCountdown} from '../../composables/useCountdown'
import {useDefaults} from '../../composables/useDefaults'
import {useCountdownHover} from '../../composables/useCountdownHover'
import {useId} from '../../composables/useId'
import {useShowHide} from '../../composables/useShowHide'
import BButton from '../BButton/BButton.vue'

const _props = withDefaults(defineProps<Omit<BAlertProps, 'modelValue'>>(), {
  bgVariant: null,
  body: undefined,
  bodyClass: undefined,
  closeClass: undefined,
  closeContent: undefined,
  closeLabel: 'Close',
  closeVariant: 'secondary',
  dismissible: false,
  headerClass: undefined,
  headerTag: 'div',
  id: undefined,
  initialAnimation: false,
  interval: 'requestAnimationFrame',
  isStatus: false,
  lazy: false,
  noFade: false,
  noHoverPause: false,
  noResumeOnHoverLeave: false,
  progressProps: undefined,
  unmountLazy: false,
  showOnPause: true,
  show: false,
  solid: false,
  textVariant: null,
  title: undefined,
  alertClass: undefined,
  visible: false,
  // Link props
  // All others use defaults
  noRel: undefined,
  active: undefined,
  activeClass: undefined,
  disabled: undefined,
  exactActiveClass: undefined,
  href: undefined,
  icon: undefined,
  opacity: undefined,
  opacityHover: undefined,
  stretched: false,
  rel: undefined,
  replace: undefined,
  routerComponentName: undefined,
  target: undefined,
  to: undefined,
  underlineOffset: undefined,
  underlineOffsetHover: undefined,
  underlineOpacity: undefined,
  underlineOpacityHover: undefined,
  underlineVariant: undefined,
  // End link props
  variant: 'info',
})
const props = useDefaults(_props, 'BAlert')
const emit = defineEmits<BAlertEmits>()
const slots = defineSlots<BAlertSlots>()

const element = useTemplateRef('_element')

const modelValue = defineModel<Exclude<BAlertProps['modelValue'], undefined>>({default: false})
const {computedLink, computedLinkProps} = useBLinkHelper(props)

const computedId = useId(() => props.id, 'alert')

const {
  showRef,
  renderRef,
  hide,
  toggle,
  show,
  buildTriggerableEvent,
  computedNoAnimation,
  isLeaving,
  contentShowing,
} = useShowHide({modelValue, props, emit: emit as EmitFn, element, id: computedId})

// TODO solid is never used
const countdownLength = computed(() =>
  typeof modelValue.value === 'boolean' ? 0 : modelValue.value
)

const {
  isActive,
  pause,
  restart,
  resume,
  stop,
  isPaused,
  value: remainingMs,
} = useCountdown(countdownLength, props.interval, {
  immediate: typeof modelValue.value === 'number' && !!modelValue.value,
})
useCountdownHover(
  element,
  {
    noHoverPause: () => props.noHoverPause || typeof modelValue.value !== 'number',
    noResumeOnHoverLeave: () => props.noResumeOnHoverLeave || typeof modelValue.value !== 'number',
    modelValueIgnoresHover: () => typeof modelValue.value === 'boolean',
  },
  {pause, resume}
)

watchEffect(() => {
  emit('close-countdown', remainingMs.value)
})

const computedTag = computed(() => (computedLink.value ? BLink : 'div'))

const isAlertVisible = computed(
  () => showRef.value || isActive.value || (props.showOnPause && isPaused.value)
)

// const colorClasses = useColorVariantClasses(props)
const computedClasses = computed(() => [
  // colorClasses.value,
  {
    [`theme-${props.variant}`]: props.variant !== null,
    'alert-instant': computedNoAnimation.value,
    'hiding': isLeaving.value,
  },
])

watch(modelValue, (newValue) => {
  if (typeof newValue === 'number') {
    const event = buildTriggerableEvent('show', {cancelable: true, trigger: 'model'})
    emit('show', event)
    if (event.defaultPrevented) {
      emit('show-prevented', buildTriggerableEvent('show-prevented'))
    } else {
      restart()
    }
  }
})

// isActive in the composable will cause the alert to hide when the countdown is done
watch(isActive, (newValue) => {
  if (newValue === false && isPaused.value === false) {
    hide()
    modelValue.value = 0
    stop()
  }
})
const sharedSlots = computed<ShowHideSlotsData>(() => ({
  toggle,
  show,
  hide,
  id: computedId.value,
  visible: showRef.value,
  active: isActive.value,
}))

defineExpose({
  show,
  hide,
  toggle,
  pause,
  restart,
  resume,
  stop,
})
</script>
