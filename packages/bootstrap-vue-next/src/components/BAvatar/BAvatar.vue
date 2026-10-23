<template>
  <span class="avatar" :class="computedClasses">
    <slot>
      <img v-if="props.img" class="avatar-img" :src="props.img" :alt="props.imgAlt" />
    </slot>
    <span
      v-if="props.status"
      class="avatar-status"
      :class="`status-${props.status}`"
      role="img"
      :aria-label="computedStatusLabel"
    />
  </span>
</template>

<script setup lang="ts">
import {computed, inject, onBeforeUnmount} from 'vue'
import {avatarGroupInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import type {BAvatarProps, BAvatarSlots} from '../../types'

const _props = withDefaults(defineProps<BAvatarProps>(), {
  img: undefined,
  imgAlt: undefined,
  size: undefined,
  status: undefined,
  statusLabel: undefined,
  subtle: false,
  variant: null,
})
const props = useDefaults(_props, 'BAvatar')
defineSlots<BAvatarSlots>()

const registration = inject(avatarGroupInjectionKey, null)?.register()
onBeforeUnmount(() => registration?.unregister())

const computedSize = computed(() => registration?.size.value ?? props.size)

const computedStatusLabel = computed(
  () =>
    props.statusLabel ??
    (props.status ? `${props.status[0]?.toUpperCase()}${props.status.slice(1)}` : undefined)
)

const computedClasses = computed(() => [
  computedSize.value ? `avatar-${computedSize.value}` : null,
  props.variant ? `theme-${props.variant}` : null,
  {'avatar-subtle': props.subtle},
])
</script>
