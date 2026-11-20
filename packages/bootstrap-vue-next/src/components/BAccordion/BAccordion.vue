<template>
  <div :id="computedId" class="accordion" :class="computedClasses" :style="computedStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import {computed, type CSSProperties, provide, readonly, toRef, watch} from 'vue'
import {accordionInjectionKey} from '../../utils/keys'
import {useId} from '../../composables/useId'
import {useDefaults} from '../../composables/useDefaults'
import {useThemeClasses} from '../../composables/useThemeClasses'
import type {BAccordionProps, BAccordionSlots} from '../../types'
import {isReadOnlyArray} from '../../utils/object'
import {accordionNoTransitionStyle} from './accordionNoTransitionStyle'

const _props = withDefaults(defineProps<Omit<BAccordionProps, 'modelValue'>>(), {
  color: undefined,
  flush: false,
  free: false,
  gap: false,
  id: undefined,
  lazy: false,
  name: undefined,
  noTransition: false,
  size: 'md',
})
const props = useDefaults(_props, 'BAccordion')
defineSlots<BAccordionSlots>()

const modelValue = defineModel<BAccordionProps['modelValue']>({
  default: undefined,
})

const computedId = useId(() => props.id, 'accordion')

// Items sharing a `name` are exclusive natively ("one open"); `free` omits it ("always open")
const computedName = computed(() => (props.free ? undefined : (props.name ?? computedId.value)))

const {classes: colorClasses} = useThemeClasses(() => ({theme: props.color?.theme}))

const computedClasses = computed(() => [
  colorClasses.value,
  {
    'accordion-flush': props.flush,
    'accordion-gap': props.gap,
    'accordion-sm': props.size === 'sm',
  },
])

const computedStyle = computed<CSSProperties | undefined>(() =>
  props.noTransition ? accordionNoTransitionStyle : undefined
)

watch(
  () => props.free,
  (free) => {
    if (modelValue.value === undefined) return
    if (!free && isReadOnlyArray(modelValue.value)) {
      modelValue.value = modelValue.value[0]
    } else if (free && !isReadOnlyArray(modelValue.value)) {
      modelValue.value = [modelValue.value]
    }
  }
)

const setItemOpen = (id: string, open: boolean) => {
  const current = modelValue.value
  if (props.free) {
    const list = isReadOnlyArray(current) ? current : current !== undefined ? [current] : []
    if (open && !list.includes(id)) {
      modelValue.value = [...list, id]
    } else if (!open && list.includes(id)) {
      const next = list.filter((item) => item !== id)
      modelValue.value = next.length ? next : undefined
    }
    return
  }
  const currentId = isReadOnlyArray(current) ? current[0] : current
  if (open) {
    if (currentId !== id || isReadOnlyArray(current)) modelValue.value = id
  } else if (currentId === id) {
    modelValue.value = undefined
  }
}

provide(accordionInjectionKey, {
  openItem: readonly(modelValue),
  name: computedName,
  lazy: toRef(() => props.lazy),
  setItemOpen,
})
</script>
