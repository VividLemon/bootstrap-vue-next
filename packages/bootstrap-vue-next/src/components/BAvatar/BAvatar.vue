<template>
  <span class="avatar" :class="computedClasses" :style="computedStyle">
    <slot>
      <img
        v-if="!!localSrc"
        class="avatar-img"
        :src="localSrc"
        :alt="props.alt"
        @error="onImgError"
      />
      <template v-else-if="!!props.text">{{ props.text }}</template>
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
import {avatarGroupInjectionKey} from '../../utils/keys'
import {computed, type CSSProperties, inject, ref, watch} from 'vue'
import {useNumberishToStyle} from '../../composables/useNumberishToStyle'
import {useThemeClasses} from '../../composables/useThemeClasses'
import type {AvatarSize, BAvatarEmits, BAvatarProps, BAvatarSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'

const _props = withDefaults(defineProps<BAvatarProps>(), {
  alt: 'avatar',
  color: undefined,
  size: undefined,
  src: undefined,
  status: undefined,
  statusLabel: undefined,
  text: undefined,
  variant: null,
})
const props = useDefaults(_props, 'BAvatar')
const emit = defineEmits<BAvatarEmits>()
defineSlots<BAvatarSlots>()

const parentData = inject(avatarGroupInjectionKey, null)

/** Default `--bs-avatar-stack-spacing` overlap in Bootstrap's CSS */
const DEFAULT_OVERLAP = 0.3

const AVATAR_SIZES: ReadonlySet<string> = new Set(
  Object.keys({xs: null, sm: null, md: null, lg: null, xl: null} satisfies Record<AvatarSize, null>)
)

const localSrc = ref(props.src)
watch(
  () => props.src,
  (value) => {
    localSrc.value = value
  }
)

// The group's size wins over the avatar's own size, as before
const {style: computedSize} = useNumberishToStyle(() => parentData?.size.value ?? props.size)
const computedSizeIsLiteral = computed(
  () => computedSize.value !== undefined && AVATAR_SIZES.has(computedSize.value)
)

const computedStatusLabel = computed(
  () =>
    props.statusLabel ??
    (props.status ? `${props.status.charAt(0).toUpperCase()}${props.status.slice(1)}` : undefined)
)

const {classes: colorClasses} = useThemeClasses(() => props.color ?? {})

const computedClasses = computed(() => [
  colorClasses.value,
  {
    [`avatar-${computedSize.value}`]: computedSizeIsLiteral.value && computedSize.value !== 'md',
    [`avatar-${props.variant}`]: !!props.variant,
  },
])

const computedStyle = computed<CSSProperties | undefined>(() => {
  const style: Record<string, string> = {}
  if (computedSize.value && !computedSizeIsLiteral.value) {
    // `.avatar` declares `--bs-avatar-size` itself, so it must be set on the avatar
    style['--bs-avatar-size'] = computedSize.value
  }
  const overlap = parentData?.overlap.value
  if (overlap !== undefined && Number.isFinite(overlap) && overlap !== DEFAULT_OVERLAP) {
    // `.avatar` declares `--bs-avatar-stack-spacing` itself too, a value on the stack never reaches it
    style['--bs-avatar-stack-spacing'] = `${-overlap}`
  }
  return Object.keys(style).length ? (style as CSSProperties) : undefined
})

const onImgError = (e: Readonly<Event>) => {
  localSrc.value = undefined
  emit('img-error', e)
}
</script>
