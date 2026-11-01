<template>
  <div
    v-if="isAlertMounted"
    :id="props.id"
    ref="_element"
    class="alert flex-column align-items-stretch"
    :class="computedClasses"
    tabindex="0"
    :role="props.isStatus ? 'status' : 'alert'"
    :aria-live="props.isStatus ? 'polite' : 'assertive'"
    aria-atomic="true"
    v-bind="props.alertAttrs"
  >
    <component
      :is="props.headerTag"
      v-if="contentShowing && (slots.title || props.title)"
      class="alert-heading d-flex gap-2"
      v-bind="props.headerAttrs"
    >
      <slot name="title" v-bind="sharedSlots">
        <span>
          {{ props.title }}
        </span>
      </slot>
      <template v-if="props.dismissible">
        <BButton
          v-if="slots.close || props.closeContent"
          class="ms-auto ps-1 btn-close-custom"
          :theme="closeColor.theme"
          :bg="closeColor.bg"
          :fg="closeColor.fg"
          :variant="props.closeVariant"
          v-bind="props.closeAttrs"
          @click.stop.prevent="hide('close')"
        >
          <slot name="close" v-bind="sharedSlots">
            {{ props.closeContent }}
          </slot>
        </BButton>
        <BCloseButton
          v-else
          class="ms-auto"
          :aria-label="props.closeLabel"
          v-bind="props.closeAttrs"
          @click.stop.prevent="hide('close')"
        />
      </template>
    </component>
    <template v-if="contentShowing && (slots.default || props.body)">
      <div class="d-flex gap-2">
        <component
          :is="computedTag"
          class="alert-body"
          v-bind="computedBodyAttrs"
          @click="computedLink && props.dismissible ? hide() : () => {}"
        >
          <slot v-bind="sharedSlots">
            {{ props.body }}
          </slot>
        </component>

        <template v-if="props.dismissible && !(slots.title || props.title)">
          <BButton
            v-if="slots.close || props.closeContent"
            class="ms-auto btn-close-custom"
            :theme="closeColor.theme"
            :bg="closeColor.bg"
            :fg="closeColor.fg"
            :variant="props.closeVariant"
            v-bind="props.closeAttrs"
            @click.stop.prevent="hide('close')"
          >
            <slot name="close" v-bind="sharedSlots">
              {{ props.closeContent }}
            </slot>
          </BButton>
          <BCloseButton
            v-else
            class="ms-auto"
            :aria-label="props.closeLabel"
            v-bind="props.closeAttrs"
            @click.stop.prevent="hide('close')"
          />
        </template>
      </div>
    </template>
    <BProgress
      v-if="typeof modelValue === 'number' && props.progressProps !== undefined"
      :animated="props.progressProps.animated"
      :precision="props.progressProps.precision"
      :show-progress="props.progressProps.showProgress"
      :show-value="props.progressProps.showValue"
      :striped="props.progressProps.striped"
      :theme="props.progressProps.theme"
      :max="modelValue"
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
  bg: null,
  body: undefined,
  bodyAttrs: undefined,
  closeAttrs: undefined,
  closeContent: undefined,
  closeLabel: 'Close',
  closeColor: undefined,
  closeVariant: 'solid',
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
  progressProps: undefined,
  unmountLazy: false,
  showOnPause: true,
  show: false,
  fg: null,
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
  underlineOffset: undefined,
  underlineOpacity: undefined,
  underlineTheme: undefined,
  // End link props
  theme: 'info',
})
const props = useDefaults(_props, 'BAlert')
const closeColor = computed(() => resolvePartColor(props.closeColor, {theme: 'secondary'}))
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
    theme: props.theme,
    bg: props.bg,
    fg: props.fg,
  }))
)
const computedClasses = computed(() => [
  colorClasses.value,
  {
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
