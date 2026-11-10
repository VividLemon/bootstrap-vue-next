<template>
  <component :is="props.tag" class="navbar" :class="computedClasses" :role="computedRole">
    <div v-if="props.container !== false" :class="containerClass">
      <slot />
    </div>
    <slot v-else />
  </component>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {computed, provide, toRef} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {useContainerClasses} from '../../composables/useContainerClasses'
import {navbarInjectionKey} from '../../utils/keys'
import type {BNavbarProps, BNavbarSlots} from '../../types'

const _props = withDefaults(defineProps<BNavbarProps>(), {
  container: 'fluid',
  fixed: undefined,
  noAutoClose: false,
  print: false,
  sticky: undefined,
  tag: 'nav',
  toggleable: false,
  color: undefined,
})
const props = useDefaults(_props, 'BNavbar')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BNavbarSlots>()

const computedRole = computed(() => (props.tag === 'nav' ? undefined : 'navigation'))

const {classes: containerClass} = useContainerClasses(() => props.container)

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
    'd-print': props.print,
    [`sticky-${props.sticky}`]: props.sticky !== undefined,
    [`fixed-${props.fixed}`]: props.fixed !== undefined,
    'navbar-expand': props.toggleable === false,
    [`navbar-expand-${props.toggleable}`]: typeof props.toggleable === 'string',
  },
])

provide(navbarInjectionKey, {
  tag: toRef(() => props.tag),
  noAutoClose: toRef(() => props.noAutoClose),
})
</script>
