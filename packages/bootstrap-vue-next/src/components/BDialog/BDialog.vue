<template>
  <dialog
    :id="computedId"
    ref="_element"
    class="dialog"
    :class="computedClasses"
    :aria-labelledby="!props.noHeader ? `${computedId}-label` : undefined"
    v-bind="nativeAttrs"
  >
    <template v-if="contentShowing">
      <div
        v-if="!props.noHeader"
        class="dialog-header"
        :class="headerColorClasses"
        v-bind="props.headerAttrs"
      >
        <slot name="header" v-bind="sharedSlots">
          <component
            :is="props.titleTag"
            :id="`${computedId}-label`"
            class="dialog-title"
            v-bind="props.titleAttrs"
          >
            <slot name="title" v-bind="sharedSlots">
              {{ props.title }}
            </slot>
          </component>
          <template v-if="!props.noHeaderClose">
            <slot name="header-close" v-bind="sharedSlots">
              <BCloseButton
                :aria-label="props.headerClose?.label ?? 'Close'"
                :autofocus="props.focus === 'close' ? true : undefined"
                v-bind="props.headerClose?.attrs"
                @click="hide('close')"
              />
            </slot>
          </template>
        </slot>
      </div>
      <div class="dialog-body" :class="bodyColorClasses" v-bind="props.bodyAttrs">
        <slot v-bind="sharedSlots">
          {{ props.body }}
        </slot>
      </div>
      <div
        v-if="hasFooterSlot"
        class="dialog-footer"
        :class="footerColorClasses"
        v-bind="props.footerAttrs"
      >
        <slot name="footer" v-bind="sharedSlots" />
      </div>
    </template>
  </dialog>
</template>

<script setup lang="ts">
import {computed, type EmitFn, provide, toRef, useTemplateRef} from 'vue'
import type {BDialogEmits, BDialogProps, BDialogSlots, BDialogSlotsData} from '../../types'
import BCloseButton from '../BButton/BCloseButton.vue'
import {useDefaults} from '../../composables/useDefaults'
import {useDialogBase} from '../../composables/useDialogBase'
import {useId} from '../../composables/useId'
import {useModalManager} from '../../composables/useModalManager'
import {useThemeClasses} from '../../composables/useThemeClasses'
import {isEmptySlot} from '../../utils/dom'
import {dialogInjectionKey} from '../../utils/keys'

const _props = withDefaults(defineProps<Omit<BDialogProps, 'modelValue'>>(), {
  backdrop: true,
  body: undefined,
  bodyAttrs: undefined,
  bodyColor: undefined,
  focus: undefined,
  footerAttrs: undefined,
  footerColor: undefined,
  fullscreen: false,
  headerAttrs: undefined,
  headerClose: undefined,
  headerColor: undefined,
  id: undefined,
  initialAnimation: false,
  keyboard: true,
  lazy: false,
  modal: true,
  noHeader: false,
  noHeaderClose: false,
  noTransition: false,
  scrollable: false,
  show: false,
  size: undefined,
  slide: undefined,
  title: undefined,
  titleAttrs: undefined,
  titleTag: 'h5',
  unmountLazy: false,
  visible: false,
})
const props = useDefaults(_props, 'BDialog')
const emit = defineEmits<BDialogEmits>()
const slots = defineSlots<BDialogSlots>()

const computedId = useId(() => props.id, 'dialog')
const modelValue = defineModel<Exclude<BDialogProps['modelValue'], undefined>>({default: false})

const element = useTemplateRef<HTMLDialogElement | null>('_element')

// Bootstrap v6 Dialog is a native `<dialog>`: the top layer, the `::backdrop`, focus containment
// and the inert page are the browser's. The CSS animates `[open]` / `.hiding`; the element is
// closed once its exit transition ended.
const {
  visible,
  isActive,
  isInstant,
  isHiding,
  bouncing,
  closedby,
  contentShowing,
  returnValue,
  show,
  hide,
  toggle,
} = useDialogBase(
  {modelValue, props, emit: emit as EmitFn, element, id: computedId},
  {
    modal: () => props.modal,
    lockScroll: () => props.modal,
    backdrop: () => props.backdrop,
    keyboard: () => props.keyboard,
    noTransition: () => props.noTransition,
    deferClose: true,
    // `ok()` and Escape announce themselves before `hide`; every other trigger is read from
    // the `hide` event
    triggerEvent: (trigger) => (trigger === 'ok' ? 'ok' : trigger === 'esc' ? 'cancel' : undefined),
  }
)

useModalManager(visible, modelValue.value)

const computedClasses = computed(() => ({
  [`dialog-${props.size}`]: props.size !== undefined,
  'dialog-fullscreen': props.fullscreen === true,
  [`${props.fullscreen}-down:dialog-fullscreen`]: typeof props.fullscreen === 'string',
  'dialog-scrollable': props.scrollable,
  [`dialog-slide-${props.slide}`]: props.slide !== undefined,
  'dialog-nonmodal': !props.modal,
  'dialog-instant': isInstant.value,
  'hiding': isHiding.value,
  'dialog-static': bouncing.value,
}))

// `closedby` is not in Vue's `<dialog>` attribute types yet
const nativeAttrs = computed(() => ({closedby: closedby.value}))

const {classes: headerColorClasses} = useThemeClasses(computed(() => props.headerColor ?? {}))
const {classes: bodyColorClasses} = useThemeClasses(computed(() => props.bodyColor ?? {}))
const {classes: footerColorClasses} = useThemeClasses(computed(() => props.footerColor ?? {}))

const hasFooterSlot = computed(() => !isEmptySlot(slots.footer))

const ok = (value?: unknown) => {
  void hide('ok', value)
}
const cancel = () => {
  void hide('cancel')
}
const close = () => {
  void hide('close')
}

provide(dialogInjectionKey, {
  ok,
  cancel,
  hide: (trigger, value) => {
    void hide(trigger, value)
  },
  focus: toRef(() => props.focus),
})

const sharedSlots = computed<BDialogSlotsData>(() => ({
  id: computedId.value,
  cancel,
  close,
  hide: (trigger, value) => {
    void hide(trigger, value)
  },
  show,
  toggle,
  ok,
  active: isActive.value,
  visible: visible.value,
}))

defineExpose({
  hide,
  id: computedId,
  returnValue,
  show,
  toggle,
  visible,
})
</script>
