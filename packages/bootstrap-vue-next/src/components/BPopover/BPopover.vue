<template>
  <span :id="computedId + '_placeholder'" ref="_placeholder" style="display: none" />
  <slot name="target" v-bind="sharedSlots" />
  <ConditionalTeleport
    :to="props.teleportTo"
    :disabled="!props.teleportTo || props.teleportDisabled"
  >
    <div
      v-if="contentShowing"
      v-show="isActive && !hidden"
      :id="computedId"
      v-bind="attrs"
      ref="_element"
      :class="computedClasses"
      role="tooltip"
      tabindex="-1"
      :style="floatingStyles"
    >
      <div
        ref="_arrow"
        :class="`${props.tooltip ? 'tooltip' : 'popover'}-arrow`"
        :style="arrowStyle"
        data-popper-arrow
      />
      <div ref="_content" class="overflow-auto b-floating-size" :style="sizeStyles">
        <template v-if="props.title || slots.title">
          <div
            class="position-sticky top-0"
            :class="props.tooltip ? 'tooltip-inner' : 'popover-header'"
            v-bind="props.titleAttrs"
          >
            <slot name="title" v-bind="sharedSlots">
              {{ props.title }}
            </slot>
          </div>
        </template>
        <template v-if="(props.tooltip && !slots.title && !props.title) || !props.tooltip">
          <div :class="props.tooltip ? 'tooltip-inner' : 'popover-body'" v-bind="props.bodyAttrs">
            <slot v-bind="sharedSlots">{{ props.body }}{{ attrs.content }}</slot>
          </div>
        </template>
      </div>
    </div>
  </ConditionalTeleport>
</template>

<script setup lang="ts">
import {
  type Alignment,
  arrow as arrowMiddleware,
  autoPlacement,
  autoUpdate,
  type Boundary,
  flip,
  hide as hideMiddleware,
  inline as inlineMiddleware,
  type Middleware,
  offset as offsetMiddleware,
  type Placement as FloatingPlacement,
  type ReferenceElement,
  type RootBoundary,
  shift,
  size as sizeMiddleware,
  useFloating,
} from '@floating-ui/vue'
import {onClickOutside, useEventListener, useThrottleFn, useToNumber} from '@vueuse/core'
import {
  computed,
  type ComputedRef,
  type CSSProperties,
  type EmitFn,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toValue,
  useAttrs,
  useTemplateRef,
  watch,
} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {useMouse} from '../../composables/useMouse'
import {useId} from '../../composables/useId'
import type {BPopoverEmits, BPopoverProps, BPopoverSlots, ShowHideSlotsData} from '../../types'
import {isBoundary, isRootBoundary, resolveBootstrapPlacement} from '../../utils/floatingUi'
import {getElement} from '../../utils/getElement'
import {warn} from '../../utils/console'
import ConditionalTeleport from '../ConditionalTeleport.vue'
import {useCssTransition} from '../../composables/useCssTransition'
import {useShowHide} from '../../composables/useShowHide'
import {getSafeDocument, getSafeWindow} from '../../utils/dom'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BPopoverProps, 'modelValue'>>(), {
  boundary: 'clippingAncestors',
  boundaryPadding: undefined,
  bodyAttrs: undefined,
  click: undefined,
  closeOnHide: false,
  focus: undefined,
  hover: undefined,
  teleportTo: undefined,
  teleportDisabled: false,
  body: undefined,
  delay: () => ({show: 100, hide: 300}),
  floatingMiddleware: undefined,
  hideMargin: 2,
  id: undefined,
  initialAnimation: false,
  inline: false,
  lazy: false,
  manual: false,
  noAutoClose: false,
  noTransition: false,
  noFlip: false,
  noHide: false,
  noShift: false,
  noSize: false,
  noninteractive: false,
  offset: null,
  unmountLazy: false,
  placement: 'top',
  realtime: false,
  reference: null,
  strategy: 'absolute',
  target: null,
  title: undefined,
  titleAttrs: undefined,
  show: false,
  tooltip: false,
  visible: false,
})
const props = useDefaults(_props, 'BPopover')
const emit = defineEmits<BPopoverEmits>()
const slots = defineSlots<BPopoverSlots>()
const attrs = useAttrs()

const modelValue = defineModel<Exclude<BPopoverProps['modelValue'], undefined>>({
  default: false,
})

const computedId = useId(() => props.id, 'popover')

const hidden = ref(false)

const floatingElement = useTemplateRef('_element')
const content = useTemplateRef('_content')
const arrow = useTemplateRef('_arrow')
const placeholder = useTemplateRef('_placeholder')

const referenceElement = ref<HTMLElement | null>(null)
const triggerElement = ref<HTMLElement | null>(null)

const isAutoPlacement = computed(() => props.placement.startsWith('auto'))
const offsetNumber = useToNumber(() => props.offset ?? Number.NaN)

const boundary = computed<Boundary | undefined>(() =>
  isBoundary(props.boundary) ? props.boundary : undefined
)
const rootBoundary = computed<RootBoundary | undefined>(() =>
  isRootBoundary(props.boundary) ? props.boundary : undefined
)

const sizeStyles = ref<CSSProperties>({})
const floatingMiddleware = computed<readonly Middleware[]>(() => {
  if (props.floatingMiddleware !== undefined) {
    return props.floatingMiddleware
  }
  const off = props.offset !== null ? offsetNumber.value : props.tooltip ? 6 : 8
  const arr: Middleware[] = [offsetMiddleware(off)]
  if (!props.noFlip && !isAutoPlacement.value) {
    arr.push(
      flip({
        boundary: boundary.value,
        rootBoundary: rootBoundary.value,
        padding: props.boundaryPadding,
      })
    )
  }
  if (isAutoPlacement.value) {
    arr.push(
      autoPlacement({
        alignment: (props.placement.split('-')[1] as Alignment) || undefined,
        boundary: boundary.value,
        rootBoundary: rootBoundary.value,
        padding: props.boundaryPadding,
      })
    )
  }
  if (!props.noShift) {
    arr.push(
      shift({
        boundary: boundary.value,
        rootBoundary: rootBoundary.value,
        padding: props.boundaryPadding,
      })
    )
  }
  if (!props.noHide) {
    arr.push(
      hideMiddleware({
        boundary: boundary.value,
        rootBoundary: rootBoundary.value,
        padding: props.boundaryPadding,
      })
    )
  }
  if (props.inline) {
    arr.push(inlineMiddleware())
  }
  arr.push(arrowMiddleware({element: arrow, padding: 10}))
  if (!props.noSize) {
    arr.push(
      sizeMiddleware({
        boundary: boundary.value,
        rootBoundary: rootBoundary.value,
        padding: props.boundaryPadding,
        apply({availableWidth, availableHeight}) {
          sizeStyles.value = {
            '--bv-floating-max-height':
              availableHeight >= (content.value?.scrollHeight ?? 0)
                ? undefined
                : availableHeight
                  ? `${Math.max(0, availableHeight)}px`
                  : undefined,
            '--bv-floating-max-width':
              availableWidth >= (content.value?.scrollWidth ?? 0)
                ? undefined
                : availableWidth
                  ? `${Math.max(0, availableWidth)}px`
                  : undefined,
          }
        },
      })
    )
  }
  return arr
})

const {floatingStyles, middlewareData, placement, update} = useFloating(
  referenceElement,
  floatingElement,
  {
    placement: computed(() =>
      isAutoPlacement.value ? undefined : (props.placement as FloatingPlacement)
    ),
    middleware: floatingMiddleware as ComputedRef<Middleware[]>,
    strategy: () => props.strategy,
  }
)

const arrowStyle = ref<CSSProperties>({position: 'absolute'})

// Keeps the position in sync with the reference while anything is on screen
let cleanup: ReturnType<typeof autoUpdate> | undefined
const stopAutoUpdate = () => {
  cleanup?.()
  cleanup = undefined
}
const startAutoUpdate = () => {
  update()
  void nextTick(() => {
    if (cleanup || !isActive.value || !referenceElement.value || !floatingElement.value) return
    cleanup = autoUpdate(
      referenceElement.value as ReferenceElement,
      floatingElement.value as HTMLElement,
      update,
      {animationFrame: props.realtime}
    )
  })
}

// Bootstrap v6 fades tooltips and popovers in CSS: `.show` is toggled and `shown` / `hidden`
// fire once the element's own transition ended. `.popover-instant` / `.tooltip-instant` skip it.
const {run} = useCssTransition(floatingElement)
const {state, visible, isActive, instant, contentShowing, show, hide, toggle} = useShowHide(
  {modelValue, props, emit: emit as EmitFn, element: floatingElement, id: computedId},
  {
    transition: (value) => {
      if (value) startAutoUpdate()
      return run()
    },
  }
)
watch(isActive, (value) => {
  if (!value) stopAutoUpdate()
})

/** Shown, or on its way to being shown (also during the show delay) */
const isShowing = () => state.value === 'showing' || state.value === 'shown'

const throttleHide = useThrottleFn((trigger?: string) => hide(trigger), 500)

watch(middlewareData, (newValue) => {
  if (!props.noHide) {
    if (newValue.hide?.referenceHidden && !hidden.value && visible.value) {
      if (props.closeOnHide && !props.noAutoClose && !props.manual) {
        void throttleHide('close-on-hide')
      } else {
        hidden.value = true
      }
    } else if (hidden.value && !newValue.hide?.referenceHidden) {
      hidden.value = false
    }
  }
  if (newValue.arrow) {
    const {x, y} = newValue.arrow
    arrowStyle.value = {
      position: 'absolute',
      top: y ? `${y}px` : '',
      left: x ? `${x}px` : '',
    }
  }
})

const computedClasses = computed(() => {
  const type = props.tooltip ? 'tooltip' : 'popover'
  return [
    type,
    `b-${type}`,
    {
      show: visible.value && !hidden.value,
      [`${type}-instant`]: props.noTransition || instant.value,
      [`bs-${type}-${resolveBootstrapPlacement(placement.value)}`]: placement.value !== undefined,
    },
  ]
})

const {x, y} = useMouse()

const isElementAndTriggerOutside = () => {
  const triggerRect = triggerElement.value?.getBoundingClientRect()
  const elementRect = floatingElement.value?.getBoundingClientRect()
  const margin = Number.parseInt(props.hideMargin as unknown as string, 10) || 0
  const offsetX = getSafeWindow()?.scrollX || 0
  const offsetY = getSafeWindow()?.scrollY || 0
  const triggerIsOutside =
    !triggerRect ||
    x.value < triggerRect.left + offsetX - margin ||
    x.value > triggerRect.right + offsetX + margin ||
    y.value < triggerRect.top + offsetY - margin ||
    y.value > triggerRect.bottom + offsetY + margin

  const isOutside =
    !elementRect ||
    x.value < elementRect.left + offsetX - margin ||
    x.value > elementRect.right + offsetX + margin ||
    y.value < elementRect.top + offsetY - margin ||
    y.value > elementRect.bottom + offsetY + margin

  return {triggerIsOutside, isOutside}
}

let looptimeout: ReturnType<typeof setTimeout> | undefined
const tryHide = (e?: Readonly<Event>) => {
  const {triggerIsOutside, isOutside} = isElementAndTriggerOutside()
  const doc = getSafeDocument()
  if (
    (!props.noninteractive &&
      isOutside &&
      triggerIsOutside &&
      doc &&
      !floatingElement.value?.contains(doc.activeElement) &&
      (!computedTriggers.value.focus || !triggerElement.value?.contains(doc.activeElement))) ||
    (props.noninteractive && triggerIsOutside)
  ) {
    void hide(e?.type)
  } else {
    if (looptimeout) clearTimeout(looptimeout)
    looptimeout = setTimeout(() => {
      tryHide(e)
    }, 50)
  }
}

watch(visible, () => {
  update()
})

defineExpose({
  hide,
  show,
  toggle,
})

const localToggle = (e: Event) => {
  if (isShowing()) {
    void hide(e.type === 'click' ? 'click' : 'toggle')
  } else {
    void show()
  }
}

const localShow = () => {
  void show()
}

// Compute final trigger configuration
const computedTriggers = computed(() => {
  // Manual mode disables all automatic triggers
  if (props.manual) {
    return {hover: false, focus: false, click: false}
  }

  // If explicit boolean props are set, use them
  if (props.hover !== undefined || props.focus !== undefined || props.click !== undefined) {
    return {
      hover: props.hover ?? false,
      focus: props.focus ?? false,
      click: props.click ?? false,
    }
  }

  // If no explicit props, use default behavior: hover + focus
  return {hover: true, focus: true, click: false}
})

const bind = () => {
  // TODO: is this the best way to bind the events?
  // we place a span and get the next element sibling for the listeners
  if (props.target) {
    const elem = getElement(toValue(props.target))
    if (elem) {
      triggerElement.value = elem
    } else {
      warn('BPopover', 'Target element not found', props.target)
    }
  } else {
    triggerElement.value = placeholder.value?.nextElementSibling as HTMLElement
  }
  if (props.reference) {
    const elem = getElement(toValue(props.reference))
    if (elem) {
      referenceElement.value = elem
    } else {
      warn('BPopover', 'Reference element not found', props.reference)
    }
  } else {
    referenceElement.value = triggerElement.value
  }
  if (!triggerElement.value || props.manual) {
    return
  }

  const triggers = computedTriggers.value

  if (triggers.click) {
    triggerElement.value.addEventListener('click', localToggle)
  }

  if (triggers.hover) {
    triggerElement.value.addEventListener('pointerenter', localShow)
    triggerElement.value.addEventListener('pointerleave', tryHide)
  }

  if (triggers.focus) {
    triggerElement.value.addEventListener('focus', localShow)
    triggerElement.value.addEventListener('blur', tryHide)
  }
}

const unbind = () => {
  if (triggerElement.value) {
    triggerElement.value.removeEventListener('click', localToggle)
    triggerElement.value.removeEventListener('pointerenter', localShow)
    triggerElement.value.removeEventListener('pointerleave', tryHide)
    triggerElement.value.removeEventListener('focus', localShow)
    triggerElement.value.removeEventListener('blur', tryHide)
  }
}

onClickOutside(
  floatingElement,
  () => {
    if (isShowing() && computedTriggers.value.click && !props.noAutoClose && !props.manual)
      void hide('click-outside')
  },
  {ignore: [triggerElement]}
)

watch(
  [
    () => props.click,
    () => props.hover,
    () => props.focus,
    () => props.manual,
    () => props.target,
    () => props.reference,
  ],
  () => {
    unbind()
    bind()
    // update()
  }
)

const sharedSlots = computed<ShowHideSlotsData>(() => ({
  toggle,
  show,
  hide,
  id: computedId.value,
  visible: visible.value,
  active: isActive.value,
}))

// Escape dismisses the tooltip or popover (WCAG 1.4.13), wherever focus is. The key press is
// consumed, so inside a dialog the first Escape closes this and the next one the dialog.
// Listening in the capture phase runs this before the dialog's own handler
useEventListener(
  () => getSafeDocument(),
  'keydown',
  (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !isShowing() || props.manual || props.noAutoClose) return
    event.preventDefault()
    event.stopPropagation()
    void hide('esc', true)
  },
  {capture: true}
)

// The trigger is described by the tooltip / popover while it is on screen
const describedBy = 'aria-describedby'
let describedElement: HTMLElement | null = null
const removeDescribedBy = () => {
  const el = describedElement
  describedElement = null
  if (!el) return
  const rest = (el.getAttribute(describedBy) ?? '')
    .split(/\s+/)
    .filter((token) => token && token !== computedId.value)
  if (rest.length > 0) {
    el.setAttribute(describedBy, rest.join(' '))
  } else {
    el.removeAttribute(describedBy)
  }
}
const addDescribedBy = () => {
  removeDescribedBy()
  const el = triggerElement.value
  if (!el) return
  const tokens = (el.getAttribute(describedBy) ?? '').split(/\s+/).filter(Boolean)
  if (!tokens.includes(computedId.value)) tokens.push(computedId.value)
  el.setAttribute(describedBy, tokens.join(' '))
  describedElement = el
}
watch(
  [isActive, triggerElement],
  ([active]) => {
    if (active) {
      addDescribedBy()
    } else {
      removeDescribedBy()
    }
  },
  {flush: 'post'}
)

onMounted(() => {
  bind()
  nextTick(() => {
    update()
  })
})

onBeforeUnmount(() => {
  unbind()
  stopAutoUpdate()
  removeDescribedBy()
})
</script>
