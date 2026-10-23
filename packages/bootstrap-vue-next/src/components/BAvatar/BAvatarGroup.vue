<template>
  <div class="avatar-stack">
    <slot :count="avatarCount" />
  </div>
</template>

<script setup lang="ts">
import {provide, ref, toRef} from 'vue'
import {avatarGroupInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import type {BAvatarGroupProps, BAvatarGroupSlots} from '../../types'

const _props = withDefaults(defineProps<BAvatarGroupProps>(), {
  size: undefined,
})
const props = useDefaults(_props, 'BAvatarGroup')
defineSlots<BAvatarGroupSlots>()

const avatarCount = ref(0)

provide(avatarGroupInjectionKey, {
  register: () => {
    avatarCount.value = avatarCount.value + 1
    return {
      unregister: () => {
        avatarCount.value = avatarCount.value - 1
      },
      size: toRef(() => props.size),
    }
  },
})
</script>
