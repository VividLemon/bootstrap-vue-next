<template>
  <component :is="props.tag" class="nav" :class="computedClasses">
    <slot />
  </component>
</template>

<script setup lang="ts">
import type {BNavProps} from '../../types/ComponentProps'
import {useAlignment} from '../../composables/useAlignment'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import type {BNavSlots} from '../../types'

const _props = withDefaults(defineProps<BNavProps>(), {
  align: undefined,
  cardHeader: false,
  fill: false,
  justified: false,
  pills: false,
  small: false,
  tabs: false,
  tag: 'ul',
  underline: false,
  vertical: false,
})
const props = useDefaults(_props, 'BNav')
defineSlots<BNavSlots>()

const alignment = useAlignment(() => props.align)

const computedClasses = computed(() => ({
  'nav-tabs': props.tabs,
  'nav-pills': props.pills && !props.tabs,
  'card-header-tabs': !props.vertical && props.cardHeader && props.tabs,
  'card-header-pills': !props.vertical && props.cardHeader && props.pills && !props.tabs,
  'flex-column': props.vertical,
  'nav-fill': !props.vertical && props.fill,
  'nav-justified': !props.vertical && props.justified,
  [alignment.value]: !props.vertical && props.align !== undefined,
  'small': props.small,
  'nav-underline': props.underline,
}))
</script>
