<template>
  <li role="presentation">
    <component
      :is="props.headerTag"
      :id="headerId"
      class="dropdown-header"
      :class="computedClasses"
      :role="headerRole"
    >
      <slot name="header">
        {{ props.header }}
      </slot>
    </component>
    <ul
      :id="props.id"
      role="group"
      class="list-unstyled"
      v-bind="$attrs"
      :aria-describedby="props.ariaDescribedby || headerId"
    >
      <slot />
    </ul>
  </li>
</template>

<script setup lang="ts">
import {useThemeClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import type {BDropdownGroupProps, BDropdownGroupSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BDropdownGroupProps>(), {
  ariaDescribedby: undefined,
  header: undefined,
  headerClass: undefined,
  headerTag: 'header',
  headerTheme: null,
  id: undefined,
})
const props = useDefaults(_props, 'BDropdownGroup')
defineSlots<BDropdownGroupSlots>()

const headerId = computed(() => (props.id ? `${props.id}_group_dd_header` : undefined))
const headerRole = computed(() => (props.headerTag === 'header' ? undefined : 'heading'))

const {classes: colorClasses} = useThemeClasses(() => ({theme: props.headerTheme}))
const computedClasses = computed(() => [props.headerClass, colorClasses.value])
</script>
