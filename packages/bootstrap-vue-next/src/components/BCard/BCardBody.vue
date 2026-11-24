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
      :color="props.subtitleColor"
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
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {computed} from 'vue'
import BCardTitle from './BCardTitle.vue'
import {useHasSlot} from '../../composables/useHasSlot'
import BCardSubtitle from './BCardSubtitle.vue'
import {useDefaults} from '../../composables/useDefaults'
import type {BCardBodyProps, BCardBodySlots} from '../../types'

const _props = withDefaults(defineProps<BCardBodyProps>(), {
  overlay: false,
  subtitle: undefined,
  subtitleColor: undefined,
  subtitleTag: 'h4',
  tag: 'div',
  text: undefined,
  title: undefined,
  titleTag: 'h4',
  color: undefined,
})
const props = useDefaults(_props, 'BCardBody')
const computedColor = computed(() => resolvePartColor(props.color, {}))
const slots = defineSlots<BCardBodySlots>()

const hasTitleSlot = useHasSlot(slots, 'title')
const hasSubtitleSlot = useHasSlot(slots, 'subtitle')

const {classes: colorClasses} = useThemeClasses(computedColor)
const computedClasses = computed(() => [
  colorClasses.value,
  props.overlay ? 'card-img-overlay' : 'card-body',
])
</script>
