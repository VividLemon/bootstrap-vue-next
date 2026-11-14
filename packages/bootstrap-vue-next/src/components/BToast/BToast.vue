<template>
  <div
    v-if="isToastMounted"
    :id="props.id"
    ref="_element"
    class="toast"
    :class="computedClasses"
    tabindex="0"
    :role="props.isStatus ? 'status' : 'alert'"
    :aria-live="props.isStatus ? 'polite' : 'assertive'"
    aria-atomic="true"
    v-bind="props.toastAttrs"
  >
    <component
      :is="props.headerTag"
      v-if="contentShowing && (slots.title || props.title)"
      class="toast-header"
      v-bind="props.headerAttrs"
    >
      <slot name="title" v-bind="sharedSlots">
        <strong>
          {{ props.title }}
        </strong>
      </slot>
      <template v-if="!props.noCloseButton">
        <BButton
          v-if="slots.close || props.close?.content"
          class="ms-auto"
          :variant="closeVariant"
          :color="computedCloseColor"
          v-bind="props.close?.attrs"
          @click.stop.prevent="hide('close')"
        >
          <slot name="close" v-bind="sharedSlots">
            {{ props.close?.content }}
          </slot>
        </BButton>
        <BCloseButton
          v-else
          :aria-label="props.close?.label ?? 'Close'"
          class="ms-auto"
          v-bind="props.close?.attrs"
          @click.stop.prevent="hide('close')"
        />
      </template>
    </component>
    <template v-if="contentShowing && (slots.default || props.body)">
      <div class="d-flex">
        <component
          :is="computedTag"
          class="toast-body"
          v-bind="computedBodyAttrs"
          @click="computedLink ? hide() : () => {}"
        >
          <slot v-bind="sharedSlots">
            {{ props.body }}
          </slot>
        </component>

        <template v-if="!props.noCloseButton && !(slots.title || props.title)">
          <BButton
            v-if="slots.close || props.close?.content"
            class="ms-auto btn-close-custom"
            :variant="closeVariant"
            :color="computedCloseColor"
            v-bind="props.close?.attrs"
            @click.stop.prevent="hide('close')"
          >
            <slot name="close" v-bind="sharedSlots">
              {{ props.close?.content }}
            </slot>
          </BButton>
          <BCloseButton
            v-else
            :aria-label="props.close?.label ?? 'Close'"
            class="ms-auto btn-close-custom"
            v-bind="props.close?.attrs"
            @click.stop.prevent="hide('close')"
          />
        </template>
      </div>
    </template>
    <BProgress
      v-if="typeof modelValue === 'number' && progressOptions !== undefined"
      v-bind="progressOptions"
      :max="modelValue"
      :value="remainingMs"
      height="4px"
    />
  </div>
</template>

<script setup lang="ts">
import {computed, type EmitFn, useTemplateRef, watch, watchEffect} from 'vue'
import {useBLinkHelper} from '../../composables/useBLinkHelper'
import type {BToastEmits, BToastProps, BToastSlots, ShowHideSlotsData} from '../../types'
import BCloseButton from '../BButton/BCloseButton.vue'
import BLink from '../BLink/BLink.vue'
import BProgress from '../BProgress/BProgress.vue'
import {useCountdown} from '../../composables/useCountdown'
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import {useCountdownHover} from '../../composables/useCountdownHover'
import {useId} from '../../composables/useId'
import {useShowHide} from '../../composables/useShowHide'
import {useCssTransition} from '../../composables/useCssTransition'
import BButton from '../BButton/BButton.vue'

const _props = withDefaults(defineProps<Omit<BToastProps, 'modelValue'>>(), {
  body: undefined,
  bodyAttrs: undefined,
  close: undefined,
  headerAttrs: undefined,
  headerTag: 'div',
  id: undefined,
  initialAnimation: false,
  interval: 'requestAnimationFrame',
  isStatus: false,
  lazy: false,
  noCloseButton: false,
  noTransition: false,
  noHoverPause: false,
  noResumeOnHoverLeave: false,
  progress: false,
  unmountLazy: false,
  showOnPause: true,
  show: false,
  title: undefined,
  toastAttrs: undefined,
  translucent: false,
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
const props = useDefaults(_props, 'BToast')

const progressOptions = computed(() =>
  props.progress === false ? undefined : props.progress === true ? {} : props.progress
)
const computedColor = computed(() => resolvePartColor(props.color, {}))
const computedCloseColor = computed(() =>
  resolvePartColor(props.close?.color, {theme: 'secondary'})
)
// Only an unset variant falls back to 'solid'; `null` clears it
const closeVariant = computed(() =>
  props.close?.variant === undefined ? 'solid' : props.close.variant
)
const emit = defineEmits<BToastEmits>()
const slots = defineSlots<BToastSlots>()

const element = useTemplateRef<HTMLElement | null>('_element')

const modelValue = defineModel<Exclude<BToastProps['modelValue'], undefined>>({default: false})
const {computedLink, computedLinkProps} = useBLinkHelper(props)

const computedId = useId(() => props.id, 'toast')

// Bootstrap v6 fades the toast in and out with `.show` (`@starting-style` covers the fade-in
// of a freshly mounted toast). `.toast-instant` skips the transition.
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

// Mounted from the start of a show until `hidden`, so the fade-out can run
const isToastMounted = computed(() => isActive.value || (props.showOnPause && isPaused.value))

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
const computedClasses = computed(() => [
  colorClasses.value,
  {
    'show': visible.value,
    'toast-instant': props.noTransition || instant.value,
    'toast-translucent': props.translucent,
  },
])

// The countdown runs while the toast is shown and restarts each time it is shown again
watch(visible, (newValue) => {
  if (newValue && countdownLength.value > 0) {
    restart()
  } else if (!newValue) {
    stop()
  }
})

// The countdown ran out: hide the toast (a numeric `v-model` becomes `0`)
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
