<template>
  <slot name="activator" v-bind="activatorSlotData" />
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
  type ComponentPublicInstance,
  computed,
  type ComputedRef,
  type CSSProperties,
  type EmitFn,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  toValue,
  useAttrs,
  useTemplateRef,
  watch,
} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {useMouse} from '../../composables/useMouse'
import {useId} from '../../composables/useId'
import type {
  ActivatorProps,
  ActivatorSlotsData,
  BPopoverEmits,
  BPopoverProps,
  BPopoverSlots,
  ShowHideSlotsData,
} from '../../types'
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
  activator: null,
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
// The activator is the element that opens the popover: the one the `activator` slot renders
// (it binds `props`, so we get it through a function ref) or the `activator` prop's element
const slotActivatorElement = shallowRef<HTMLElement | null>(null)
const propActivatorElement = shallowRef<HTMLElement | null>(null)
const triggerElement = computed(() =>
  props.activator ? propActivatorElement.value : slotActivatorElement.value
)
const propReferenceElement = shallowRef<HTMLElement | null>(null)
/** Positioning anchor: the `reference` prop, else the activator */
const referenceElement = computed(() =>
  props.reference ? propReferenceElement.value : triggerElement.value
)
const setSlotActivator = (el: Element | ComponentPublicInstance | null) => {
  const node = el === null || el instanceof Element ? el : (el.$el as Node | null)
  slotActivatorElement.value = node instanceof HTMLElement ? node : null
}

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

// Listeners for the `activator` prop's element. The slot's element gets the same handlers
// declaratively through `props` (see `activatorProps`)
let boundElement: HTMLElement | null = null
const bind = () => {
  if (props.activator) {
    const elem = getElement(toValue(props.activator))
    if (elem) {
      propActivatorElement.value = elem
    } else {
      warn('BPopover', 'Activator element not found', props.activator)
    }
  }
  if (props.reference) {
    const elem = getElement(toValue(props.reference))
    if (elem) {
      propReferenceElement.value = elem
    } else {
      warn('BPopover', 'Reference element not found', props.reference)
    }
  }
  const el = propActivatorElement.value
  if (!props.activator || !el || props.manual) return

  const triggers = computedTriggers.value
  if (triggers.click) {
    el.addEventListener('click', localToggle)
  }
  if (triggers.hover) {
    el.addEventListener('pointerenter', localShow)
    el.addEventListener('pointerleave', tryHide)
  }
  if (triggers.focus) {
    el.addEventListener('focus', localShow)
    el.addEventListener('blur', tryHide)
  }
  boundElement = el
}

const unbind = () => {
  const el = boundElement
  boundElement = null
  if (!el) return
  el.removeEventListener('click', localToggle)
  el.removeEventListener('pointerenter', localShow)
  el.removeEventListener('pointerleave', tryHide)
  el.removeEventListener('focus', localShow)
  el.removeEventListener('blur', tryHide)
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
    () => props.activator,
    () => props.reference,
  ],
  () => {
    unbind()
    if (!props.activator) propActivatorElement.value = null
    if (!props.reference) propReferenceElement.value = null
    bind()
  }
)

const sharedSlots = computed<ShowHideSlotsData>(() => ({
  toggle: () => toggle(),
  show: () => show(),
  hide,
  id: computedId.value,
  visible: visible.value,
  active: isActive.value,
}))

// What the `activator` slot binds on its element: the ref, the trigger listeners and
// `aria-describedby` while the popover is on screen. With an `activator` prop, that element is
// the activator, so the slot's element gets nothing to act on
const activatorProps = computed<ActivatorProps>(() => {
  if (props.activator) return {ref: setSlotActivator}
  const triggers = computedTriggers.value
  return {
    'ref': setSlotActivator,
    'aria-describedby': isActive.value ? computedId.value : undefined,
    ...(triggers.click ? {onClick: localToggle} : {}),
    ...(triggers.hover ? {onPointerenter: localShow, onPointerleave: tryHide} : {}),
    ...(triggers.focus ? {onFocus: localShow, onBlur: tryHide} : {}),
  }
})
const activatorSlotData = computed<ActivatorSlotsData>(() => ({
  ...sharedSlots.value,
  props: activatorProps.value,
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

// The `activator` prop's element is described by the tooltip / popover while it is on screen.
// It isn't rendered by us, so the id is added to (and later removed from) its own
// `aria-describedby` list. The slot's element gets it through `activatorProps` instead
const describedBy = 'aria-describedby'
const removeDescribedBy = (el: HTMLElement) => {
  const rest = (el.getAttribute(describedBy) ?? '')
    .split(/\s+/)
    .filter((token) => token && token !== computedId.value)
  if (rest.length > 0) {
    el.setAttribute(describedBy, rest.join(' '))
  } else {
    el.removeAttribute(describedBy)
  }
}
const addDescribedBy = (el: HTMLElement) => {
  const tokens = (el.getAttribute(describedBy) ?? '').split(/\s+/).filter(Boolean)
  if (!tokens.includes(computedId.value)) tokens.push(computedId.value)
  el.setAttribute(describedBy, tokens.join(' '))
}
const describedElement = computed(() =>
  isActive.value && props.activator ? propActivatorElement.value : null
)
watch(
  describedElement,
  (el, oldEl) => {
    if (oldEl) removeDescribedBy(oldEl)
    if (el) addDescribedBy(el)
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
  if (describedElement.value) removeDescribedBy(describedElement.value)
})
</script>
