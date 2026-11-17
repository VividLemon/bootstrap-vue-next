<template>
  <component :is="props.tag" class="avatar-stack" :class="computedClasses" role="group">
    <slot />
  </component>
</template>

<script setup lang="ts">
import {computed, provide, toRef} from 'vue'
import {avatarGroupInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import {useToNumber} from '@vueuse/core'
import type {AvatarSize, BAvatarGroupProps, BAvatarGroupSlots} from '../../types'

const _props = withDefaults(defineProps<BAvatarGroupProps>(), {
  overlap: 0.3,
  size: undefined,
  tag: 'div',
})
const props = useDefaults(_props, 'BAvatarGroup')
defineSlots<BAvatarGroupSlots>()

const STACK_SIZES: ReadonlySet<unknown> = new Set(
  Object.keys({xs: null, sm: null, lg: null, xl: null} satisfies Record<
    Exclude<AvatarSize, 'md'>,
    null
  >)
)

const overlapNumber = useToNumber(() => props.overlap)

const computedClasses = computed(() => ({
  [`avatar-stack-${props.size}`]: STACK_SIZES.has(props.size),
}))

provide(avatarGroupInjectionKey, {
  overlap: overlapNumber,
  size: toRef(() => props.size),
})
</script>
