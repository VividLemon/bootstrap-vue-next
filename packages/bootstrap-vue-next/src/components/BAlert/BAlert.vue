<template>
  <div
    v-if="isAlertMounted"
    :id="props.id"
    ref="_element"
    class="alert"
    :class="computedClasses"
    tabindex="0"
    :role="props.isStatus ? 'status' : 'alert'"
    :aria-live="props.isStatus ? 'polite' : 'assertive'"
    aria-atomic="true"
    v-bind="props.alertAttrs"
  >
    <template v-if="contentShowing && (slots.title || props.title || slots.default || props.body)">
      <div class="d-flex flex-column gap-2 flex-grow-1">
        <component
          :is="props.headerTag"
          v-if="slots.title || props.title"
          class="alert-heading"
          v-bind="props.headerAttrs"
        >
          <slot name="title" v-bind="sharedSlots">
            {{ props.title }}
          </slot>
        </component>
        <component
          :is="computedTag"
          v-if="slots.default || props.body"
          class="alert-body"
          v-bind="computedBodyAttrs"
          @click="computedLink && props.dismissible ? hide() : () => {}"
        >
          <slot v-bind="sharedSlots">
            {{ props.body }}
          </slot>
        </component>
      </div>
      <template v-if="props.dismissible">
        <BButton
          v-if="slots.close || props.close?.content"
          class="ms-auto btn-close-custom"
          :color="computedCloseColor"
          :variant="closeVariant"
          v-bind="props.close?.attrs"
          @click.stop.prevent="hide('close')"
        >
          <slot name="close" v-bind="sharedSlots">
            {{ props.close?.content }}
          </slot>
        </BButton>
        <BCloseButton
          v-else
          class="ms-auto"
          :aria-label="props.close?.label ?? 'Close'"
          v-bind="props.close?.attrs"
          @click.stop.prevent="hide('close')"
        />
      </template>
    </template>
    <BProgress
      v-if="showProgress"
      class="w-100"
      v-bind="progressOptions"
      :max="modelValue as number"
      :value="remainingMs"
      height="4px"
    />
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
import {useCssTransition} from '../../composables/useCssTransition'
import BButton from '../BButton/BButton.vue'
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'

const _props = withDefaults(defineProps<Omit<BAlertProps, 'modelValue'>>(), {
  alertAttrs: undefined,
  body: undefined,
  bodyAttrs: undefined,
  close: undefined,
  dismissible: false,
  headerAttrs: undefined,
  headerTag: 'div',
  id: undefined,
  initialAnimation: false,
  interval: 'requestAnimationFrame',
  isStatus: false,
  lazy: false,
  noTransition: false,
  noHoverPause: false,
  noResumeOnHoverLeave: false,
  progress: false,
  unmountLazy: false,
  showOnPause: true,
  show: false,
  title: undefined,
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
  stretched: false,
  rel: undefined,
  replace: undefined,
  routerComponentName: undefined,
  target: undefined,
  to: undefined,
  underline: undefined,
  // End link props
  color: undefined,
})
const props = useDefaults(_props, 'BAlert')

const progressOptions = computed(() =>
  props.progress === false ? undefined : props.progress === true ? {} : props.progress
)
const computedColor = computed(() => resolvePartColor(props.color, {theme: 'info'}))
const computedCloseColor = computed(() =>
  resolvePartColor(props.close?.color, {theme: 'secondary'})
)
// Only an unset variant falls back to 'solid'; `null` clears it
const closeVariant = computed(() =>
  props.close?.variant === undefined ? 'solid' : props.close.variant
)
const emit = defineEmits<BAlertEmits>()
const slots = defineSlots<BAlertSlots>()

const element = useTemplateRef<HTMLElement | null>('_element')

const modelValue = defineModel<Exclude<BAlertProps['modelValue'], undefined>>({default: false})
const {computedLink, computedLinkProps} = useBLinkHelper(props)

const computedId = useId(() => props.id, 'alert')

// Bootstrap v6 alerts only animate their exit: `.hiding` fades the alert out, then it is
// removed from the DOM. `.alert-instant` removes it at once.
const {run} = useCssTransition(element)

const {visible, isActive, instant, contentShowing, show, hide, toggle} = useShowHide(
  {modelValue, props, emit: emit as EmitFn, element, id: computedId},
  {transition: () => run()}
)

const countdownLength = computed(() =>
  typeof modelValue.value === 'boolean' ? 0 : modelValue.value
)

const {
  isActive: isCountdownActive,
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
const computedBodyAttrs = computed(() => ({...props.bodyAttrs, ...computedLinkProps.value}))

// Mounted from the start of a show until `hidden`, so the `.hiding` exit transition can run
const isAlertMounted = computed(() => isActive.value || (props.showOnPause && isPaused.value))

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
const showProgress = computed(
  () => typeof modelValue.value === 'number' && progressOptions.value !== undefined
)

const computedClasses = computed(() => [
  colorClasses.value,
  {
    // the countdown bar wraps onto its own full-width line below the content
    'flex-wrap': showProgress.value,
    'hiding': !visible.value,
    'alert-instant': props.noTransition || instant.value,
  },
])

// The countdown runs while the alert is shown and restarts each time it is shown again
watch(visible, (newValue) => {
  if (newValue && countdownLength.value > 0) {
    restart()
  } else if (!newValue) {
    stop()
  }
})

// The countdown ran out: hide the alert (a numeric `v-model` becomes `0`)
watch(isCountdownActive, (newValue) => {
  if (
    newValue === false &&
    isPaused.value === false &&
    typeof modelValue.value === 'number' &&
    visible.value
  ) {
    hide()
  }
})

const sharedSlots = computed<ShowHideSlotsData>(() => ({
  toggle,
  show,
  hide,
  id: computedId.value,
  visible: visible.value,
  active: isCountdownActive.value,
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
