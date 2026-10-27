<template>
  <component :is="props.tag" :class="computedClasses">
    <BCardTitle v-if="!!props.title || hasTitleSlot" :tag="props.titleTag">
      <slot name="title">
        {{ props.title }}
      </slot>
    </BCardTitle>

    <BCardSubtitle
      v-if="!!props.subtitle || hasSubtitleSlot"
      :tag="props.subtitleTag"
      :fg="props.subtitleFg"
    >
      <slot name="subtitle">
        {{ props.subtitle }}
      </slot>
    </BCardSubtitle>

    <slot>
      {{ props.text }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import BCardTitle from './BCardTitle.vue'
import {isEmptySlot} from '../../utils/dom'
import BCardSubtitle from './BCardSubtitle.vue'
import {useThemeClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import type {BCardBodyProps, BCardBodySlots} from '../../types'

const _props = withDefaults(defineProps<BCardBodyProps>(), {
  border: null,
  overlay: false,
  subtitle: undefined,
  subtitleTag: 'h4',
  subtitleFg: undefined,
  tag: 'div',
  text: undefined,
  title: undefined,
  titleTag: 'h4',
  // ColorExtendables props
  bg: null,
  fg: null,
  theme: null,
  // End ColorExtendables props
})
const props = useDefaults(_props, 'BCardBody')
const slots = defineSlots<BCardBodySlots>()

const hasTitleSlot = computed(() => !isEmptySlot(slots.title))
const hasSubtitleSlot = computed(() => !isEmptySlot(slots.subtitle))

const {classes: colorClasses} = useThemeClasses(props)
const computedClasses = computed(() => [
  colorClasses.value,
  props.overlay ? 'card-img-overlay' : 'card-body',
])
</script>
