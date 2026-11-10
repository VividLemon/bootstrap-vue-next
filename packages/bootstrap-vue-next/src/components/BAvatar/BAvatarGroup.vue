<template>
  <component :is="props.tag" class="b-avatar-group" role="group">
    <div class="b-avatar-group-inner" :style="paddingStyle">
      <slot />
    </div>
  </component>
</template>

<script setup lang="ts">
import {resolvePartColor} from '../../composables/useThemeClasses'
import {computed, provide, type StyleValue, toRef} from 'vue'
import {avatarGroupInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import {useToNumber} from '@vueuse/core'
import {useNumberishToStyle} from '../../composables/useNumberishToStyle'
import type {BAvatarGroupProps, BAvatarGroupSlots} from '../../types'

const _props = withDefaults(defineProps<BAvatarGroupProps>(), {
  overlap: 0.3,
  size: undefined,
  square: false,
  tag: 'div',
  // RadiusElementExtendables props
  rounded: 'circle',
  roundedBottom: undefined,
  roundedEnd: undefined,
  roundedStart: undefined,
  roundedTop: undefined,
  // End RadiusElementExtendables props
  color: undefined,
})
const props = useDefaults(_props, 'BAvatarGroup')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BAvatarGroupSlots>()

const overlapNumber = useToNumber(() => props.overlap)

const {style: computedSize} = useNumberishToStyle(() => props.size)
const overlapScale = computed(() => Math.min(Math.max(overlapNumber.value, 0), 1) / 2)

const paddingStyle = computed<StyleValue>(() => {
  const value = computedSize.value ? `calc(${computedSize.value} * ${overlapScale.value})` : null
  return value ? {paddingLeft: value, paddingRight: value} : {}
})

provide(avatarGroupInjectionKey, {
  overlapScale,
  size: toRef(() => props.size),
  square: toRef(() => props.square),
  roundedProps: computed(() => ({
    rounded: props.rounded,
    roundedTop: props.roundedTop,
    roundedBottom: props.roundedBottom,
    roundedStart: props.roundedStart,
    roundedEnd: props.roundedEnd,
  })),
  theme: toRef(() => computedColor.value.theme ?? null),
  bg: toRef(() => computedColor.value.bg ?? null),
  fg: toRef(() => computedColor.value.fg ?? null),
})
</script>
