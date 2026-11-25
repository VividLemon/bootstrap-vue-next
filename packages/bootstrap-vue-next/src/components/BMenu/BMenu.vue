<template>
  <ConditionalWrapper :skip="!props.split || inGroup" class="btn-group" :class="{show: visible}">
    <BButton
      v-if="props.split"
      v-bind="props.splitAttrs"
      :variant="props.splitVariant ?? props.variant"
      :color="computedSplitColor"
      :size="props.size"
      :disabled="props.splitDisabled || props.disabled"
      :type="props.splitButtonType"
      :href="props.splitHref"
      :to="props.splitTo"
      @click="onSplitClick"
    >
      <slot name="toggle">{{ props.text }}</slot>
    </BButton>
    <slot name="activator" v-bind="activatorSlotData">
      <BButton
        v-bind="toggleAttrs"
        :ref="toggleProps.ref"
        :variant="props.variant"
        :color="computedColor"
        :size="props.size"
        :disabled="props.disabled"
        :class="[toggleProps.class, {'menu-toggle-split': props.split}]"
        :aria-expanded="toggleProps['aria-expanded']"
        :aria-controls="toggleProps['aria-controls']"
        @click="toggleProps.onClick"
        @keydown="toggleProps.onKeydown"
      >
        <slot v-if="props.split" name="split-toggle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M3.646 9.146a.5.5 0 0 1 .708 0L8 12.793l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708m0-2.292a.5.5 0 0 0 .708 0L8 3.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708"
            />
          </svg>
          <span class="visually-hidden">{{ props.toggleText }}</span>
        </slot>
        <slot v-else name="toggle">{{ props.text }}</slot>
      </BButton>
    </slot>
    <ConditionalTeleport :to="props.teleportTo" :disabled="!props.teleportTo">
      <div
        :id="menuId"
        ref="menu"
        v-bind="props.menuAttrs"
        class="menu"
        :class="menuClasses"
        :style="finalPlacement ? floatingStyles : undefined"
        :data-bs-placement="finalPlacement"
        :data-bs-display="isStatic ? 'static' : undefined"
        @keydown="onKeydown"
      >
        <slot v-if="contentShowing" v-bind="sharedSlots" />
      </div>
    </ConditionalTeleport>
  </ConditionalWrapper>
</template>

<script setup lang="ts">
import {useEventListener} from '@vueuse/core'
import {
  type ComponentPublicInstance,
  computed,
  type EmitFn,
  inject,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  provide,
  readonly,
  shallowRef,
  toRef,
  useAttrs,
  useTemplateRef,
  watch,
} from 'vue'
import BButton from '../BButton/BButton.vue'
import ConditionalTeleport from '../ConditionalTeleport.vue'
import ConditionalWrapper from '../ConditionalWrapper.vue'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {resolvePartColor} from '../../composables/useThemeClasses'
import {useCssTransition} from '../../composables/useCssTransition'
import {useShowHide} from '../../composables/useShowHide'
import {useMenuPosition} from '../../composables/useMenuPosition'
import {useMenuKeyboard} from '../../composables/useMenuKeyboard'
import {buttonGroupKey, inputGroupKey, menuInjectionKey} from '../../utils/keys'
import {getSafeDocument} from '../../utils/dom'
import type {
  BMenuActivatorSlotsData,
  BMenuEmits,
  BMenuProps,
  BMenuSlots,
  BMenuToggleProps,
  ShowHideSlotsData,
} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BMenuProps, 'modelValue'>>(), {
  autoClose: true,
  boundary: 'clippingParents',
  color: undefined,
  disabled: false,
  display: 'dynamic',
  floatingConfig: undefined,
  id: undefined,
  initialAnimation: false,
  lazy: false,
  menuAttrs: undefined,
  noTransition: false,
  offset: () => [0, 2] as const,
  placement: 'bottom-start',
  reference: 'toggle',
  responsivePlacement: undefined,
  scrollable: false,
  show: false,
  size: undefined,
  split: false,
  splitAttrs: undefined,
  splitButtonType: 'button',
  splitColor: undefined,
  splitDisabled: false,
  splitHref: undefined,
  splitTo: undefined,
  splitVariant: undefined,
  strategy: 'absolute',
  teleportTo: undefined,
  text: undefined,
  toggleAttrs: undefined,
  toggleText: 'Toggle menu',
  translucent: false,
  unmountLazy: false,
  variant: 'solid',
  visible: false,
})
const props = useDefaults(_props, 'BMenu')
const emit = defineEmits<BMenuEmits>()
defineSlots<BMenuSlots>()
const attrs = useAttrs()

const modelValue = defineModel<Exclude<BMenuProps['modelValue'], undefined>>({default: false})

const computedId = useId(() => props.id, 'menu')
const menuId = computed(() => `${computedId.value}-menu`)

// Inside a button or input group the toggle and the `.menu` must be direct children of the group
// (v6 `:has(+ .menu)` and `.input-group > .menu` rules), so split mode renders no `.btn-group`
const inGroup = inject(buttonGroupKey, false) || inject(inputGroupKey, false)

const computedColor = computed(() => resolvePartColor(props.color, {theme: 'secondary'}))
const computedSplitColor = computed(() =>
  resolvePartColor(props.splitColor, {
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  })
)

const menuElement = useTemplateRef<HTMLElement>('menu')
const toggleElement = shallowRef<HTMLElement | null>(null)
const setToggle = (el: Element | ComponentPublicInstance | null) => {
  const node = el instanceof Element ? el : ((el?.$el as Element | null | undefined) ?? null)
  toggleElement.value = node instanceof HTMLElement ? node : null
}

const {run} = useCssTransition(menuElement)
const {visible, isActive, instant, contentShowing, show, hide, toggle} = useShowHide(
  {modelValue, props, emit: emit as EmitFn, element: menuElement, id: computedId},
  {
    transition: () => run(),
    // A disabled menu can't be opened by `show()`, `v-model` or an injected `show`, and closes
    // when it becomes disabled
    disabled: () => props.disabled,
    // The triggers (`'esc'`, `'click-outside'`, ...) are reported on `hide` / `hidden` only
    triggerEvent: () => undefined,
  }
)

const {floatingStyles, finalPlacement, isStatic, start, update, reset} = useMenuPosition({
  toggle: toggleElement,
  menu: menuElement,
  placement: () => props.placement,
  responsivePlacement: () => props.responsivePlacement,
  offset: () => props.offset,
  boundary: () => props.boundary,
  strategy: () => props.strategy,
  reference: () => props.reference,
  display: () => props.display,
  floatingConfig: () => props.floatingConfig,
})

const {onKeydown} = useMenuKeyboard({
  toggle: toggleElement,
  menu: menuElement,
  visible,
  show,
  hide,
})

const menuClasses = computed(() => ({
  'show': visible.value,
  'transition-none': props.noTransition || instant.value,
  'menu-translucent': props.translucent,
  'menu-scrollable': props.scrollable,
}))

const onToggleClick = () => {
  void (visible.value ? hide('toggle') : show())
}

const onSplitClick = (event: MouseEvent) => {
  emit('split-click', event)
}

const toggleProps = computed<BMenuToggleProps>(() => ({
  'ref': setToggle,
  'id': computedId.value,
  'class': {show: visible.value},
  'aria-expanded': visible.value ? 'true' : 'false',
  'aria-controls': menuId.value,
  'onClick': onToggleClick,
  'onKeydown': onKeydown,
}))

// Fallthrough attrs go to the toggle (fragment root), together with `toggleAttrs`
const toggleAttrs = computed(() =>
  mergeProps(attrs, props.toggleAttrs ?? {}, {id: computedId.value})
)

const sharedSlots = computed<ShowHideSlotsData>(() => ({
  id: computedId.value,
  show: () => show(),
  hide,
  toggle: () => toggle(),
  visible: visible.value,
  active: isActive.value,
}))

const activatorSlotData = computed<BMenuActivatorSlotsData>(() => ({
  ...sharedSlots.value,
  props: toggleProps.value,
}))

// Touch devices: iOS only delegates clicks to the document (for auto-close) on elements with a
// mouse listener, so v6 adds no-op `mouseover` listeners to the body's children while open
const noop = () => {}
let touchTargets: Element[] = []
const addTouchWorkaround = () => {
  const doc = getSafeDocument()
  if (!doc || !('ontouchstart' in doc.documentElement)) return
  if (toggleElement.value?.closest('.navbar-nav')) return
  touchTargets = Array.from(doc.body.children)
  touchTargets.forEach((el) => el.addEventListener('mouseover', noop))
}
const removeTouchWorkaround = () => {
  touchTargets.forEach((el) => el.removeEventListener('mouseover', noop))
  touchTargets = []
}

const onShowStarted = () => {
  start()
  toggleElement.value?.focus({focusVisible: false} as FocusOptions)
  addTouchWorkaround()
}

watch(
  visible,
  (value) => {
    if (value) {
      onShowStarted()
    } else {
      removeTouchWorkaround()
    }
  },
  {flush: 'post'}
)
// v6 keeps positioning during the exit transition and clears `data-bs-placement` after `hidden`
watch(isActive, (value) => {
  if (!value) reset()
})

onMounted(() => {
  if (visible.value) start()
})
onBeforeUnmount(removeTouchWorkaround)

// Auto-close: a port of v6 `Menu.clearMenus`, listening on the document only while open
const onDocumentEvent = (event: Event) => {
  if (!visible.value || props.autoClose === false) return
  const isKeyup = event.type === 'keyup'
  if ((event as MouseEvent).button === 2 || (isKeyup && (event as KeyboardEvent).key !== 'Tab')) {
    return
  }
  const menu = menuElement.value
  const toggleEl = toggleElement.value
  const path = event.composedPath()
  const isMenuTarget = !!menu && path.includes(menu)
  if (
    (toggleEl && path.includes(toggleEl)) ||
    (props.autoClose === 'inside' && !isMenuTarget) ||
    (props.autoClose === 'outside' && isMenuTarget)
  ) {
    return
  }
  // Interacting with form controls, or with anything inside a form in the menu, keeps it open,
  // and so does tabbing between its items
  const target = event.target as HTMLElement
  const form = target.closest?.('form')
  if (
    menu?.contains(target) &&
    (isKeyup ||
      /input|select|option|textarea|form/i.test(target.tagName) ||
      (!!form && menu.contains(form)))
  ) {
    return
  }
  void hide(isKeyup ? 'tab' : isMenuTarget ? 'click-inside' : 'click-outside')
}
useEventListener(() => (visible.value ? getSafeDocument() : null), 'click', onDocumentEvent)
useEventListener(() => (visible.value ? getSafeDocument() : null), 'keyup', onDocumentEvent)

provide(menuInjectionKey, {
  id: computedId,
  show,
  hide,
  toggle,
  visible: readonly(visible),
  autoClose: toRef(() => props.autoClose),
})

defineExpose({
  hide,
  show,
  toggle,
  /** Recomputes the menu's position */
  update,
})
</script>
