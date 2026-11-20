<template>
  <component
    :is="computedTag"
    ref="_el"
    class="stepper-item"
    :class="computedClasses"
    :aria-current="isCurrent ? 'step' : undefined"
    v-bind="computedTagAttrs"
    @click="onClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import {type ComponentPublicInstance, computed, inject, onBeforeUnmount, useTemplateRef} from 'vue'
import BLink from '../BLink/BLink.vue'
import {stepperInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import {useThemeClasses} from '../../composables/useThemeClasses'
import type {BStepperItemEmits, BStepperItemProps, BStepperItemSlots} from '../../types'

const _props = withDefaults(defineProps<BStepperItemProps>(), {
  active: undefined,
  button: false,
  color: undefined,
  current: undefined,
  disabled: false,
  href: undefined,
  tag: 'li',
  to: undefined,
})
const props = useDefaults(_props, 'BStepperItem')
const emit = defineEmits<BStepperItemEmits>()
defineSlots<BStepperItemSlots>()

const parentData = inject(stepperInjectionKey, null)

const rootRef = useTemplateRef<HTMLElement | ComponentPublicInstance>('_el')
const el = computed<HTMLElement | null>(() => {
  const value = rootRef.value
  if (!value) return null
  return '$el' in value ? (value.$el as HTMLElement | null) : value
})

const key = Symbol('stepperItem')
parentData?.register(key, el)
onBeforeUnmount(() => parentData?.unregister(key))

const index = computed(() => parentData?.indexOf(key) ?? -1)
const step = computed(() => parentData?.step.value)

// Bootstrap marks every completed step and the current one `.active`
const isActive = computed(
  () =>
    props.active ?? (step.value !== undefined && index.value !== -1 && index.value <= step.value)
)
const isCurrent = computed(
  () => props.current ?? (step.value !== undefined && index.value === step.value)
)

const isLink = computed(() => !props.button && (!!props.href || props.to !== undefined))
const isInteractive = computed(() => props.button || isLink.value)

const computedTag = computed(() => (props.button ? 'button' : isLink.value ? BLink : props.tag))

const computedTagAttrs = computed(() =>
  props.button
    ? {type: 'button', disabled: props.disabled || undefined}
    : isLink.value
      ? {href: props.href, to: props.to, disabled: props.disabled || undefined}
      : {}
)

const {classes: colorClasses} = useThemeClasses(() => ({theme: props.color?.theme}))

const computedClasses = computed(() => [
  colorClasses.value,
  {
    'active': isActive.value,
    // Bootstrap has no button reset for stepper items; utilities strip the native button look
    'p-0 border-0 bg-transparent text-start fg-body': props.button,
  },
])

const onClick = (event: MouseEvent) => {
  if (!isInteractive.value || props.disabled) return
  emit('click', event)
}
</script>
