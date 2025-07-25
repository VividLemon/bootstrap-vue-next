<template>
  <component
    :is="computedTag"
    class="b-avatar"
    :class="computedClasses"
    :style="computedStyle"
    v-bind="computedLinkProps"
    :type="props.button && !computedLink ? props.buttonType : undefined"
    :disabled="props.disabled || null"
    :variant="null"
    @click="clicked"
  >
    <span v-if="hasDefaultSlot" class="b-avatar-custom">
      <slot />
    </span>
    <span v-else-if="!!localSrc" class="b-avatar-img">
      <img :src="localSrc" :alt="props.alt" @error="onImgError" />
    </span>
    <span v-else-if="!!props.text" class="b-avatar-text" :style="textFontStyle">
      {{ props.text }}
    </span>
    <span v-else class="b-avatar-img"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        width="80%"
        height="80%"
        fill="currentColor"
        class="bi bi-person-fill"
        viewBox="0 0 16 16"
      >
        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
      </svg>
    </span>
    <BBadge
      v-if="showBadge"
      :pill="props.badgePill"
      :dot-indicator="props.badgeDotIndicator || badgeImplicitlyDot"
      :variant="props.badgeVariant"
      :bg-variant="props.badgeBgVariant"
      :text-variant="props.badgeTextVariant"
      :style="badgeStyle"
      :placement="props.badgePlacement"
    >
      <slot name="badge">
        {{ badgeText }}
      </slot>
    </BBadge>
  </component>
</template>

<script setup lang="ts">
import {avatarGroupInjectionKey} from '../../utils/keys'
import {computed, type CSSProperties, inject, ref, type StyleValue, watch} from 'vue'
import type {BAvatarProps} from '../../types/ComponentProps'
import BLink from '../BLink/BLink.vue'
import BBadge from '../BBadge/BBadge.vue'
import {useBLinkHelper} from '../../composables/useBLinkHelper'
import {isEmptySlot} from '../../utils/dom'
import {useNumberishToStyle} from '../../composables/useNumberishToStyle'
import {useRadiusElementClasses} from '../../composables/useRadiusElementClasses'
import {useColorVariantClasses} from '../../composables/useColorVariantClasses'
import type {BAvatarEmits, BAvatarSlots, Size} from '../../types'
import {useDefaults} from '../../composables/useDefaults'

const _props = withDefaults(defineProps<BAvatarProps>(), {
  alt: 'avatar',
  badge: false,
  badgeBgVariant: null,
  badgeTextVariant: null,
  badgeVariant: 'primary',
  badgePlacement: 'bottom-end',
  badgeDotIndicator: false,
  badgePill: false,
  button: false,
  buttonType: 'button',
  size: undefined,
  square: false,
  src: undefined,
  text: undefined,
  // Link props
  variant: 'secondary',
  // All others use defaults
  active: undefined,
  activeClass: undefined,
  disabled: undefined,
  exactActiveClass: undefined,
  href: undefined,
  opacity: undefined,
  opacityHover: undefined,
  rel: undefined,
  replace: undefined,
  stretched: false,
  routerComponentName: undefined,
  target: undefined,
  underlineOffset: undefined,
  underlineOffsetHover: undefined,
  underlineOpacity: undefined,
  underlineOpacityHover: undefined,
  underlineVariant: undefined,
  // End link props
  // ColorExtendables props
  // Variant is here as well
  bgVariant: null,
  textVariant: null,
  // End ColorExtendables props
  // RadiusElementExtendables props
  rounded: 'circle',
  roundedBottom: undefined,
  roundedEnd: undefined,
  roundedStart: undefined,
  roundedTop: undefined,
  // End RadiusElementExtendables props
})
const props = useDefaults(_props, 'BAvatar')
const emit = defineEmits<BAvatarEmits>()
const slots = defineSlots<BAvatarSlots>()

const localSrc = ref(props.src)
watch(
  () => props.src,
  (value) => {
    localSrc.value = value
  }
)

const {computedLink, computedLinkProps} = useBLinkHelper(props)

const parentData = inject(avatarGroupInjectionKey, null)

const SIZES = Object.freeze([
  null,
  ...Object.keys({
    lg: null,
    md: null,
    sm: null,
  } satisfies Record<Size, null>),
] as (string | null)[])
const FONT_SIZE_SCALE = 0.4
const BADGE_FONT_SIZE_SCALE = FONT_SIZE_SCALE * 0.7

const hasDefaultSlot = computed(() => !isEmptySlot(slots.default))
const hasBadgeSlot = computed(() => !isEmptySlot(slots.badge))

const showBadge = computed(() => !!props.badge || props.badge === '' || hasBadgeSlot.value)
const computedSquare = computed(() => parentData?.square.value || props.square)

// const computedPropSize = useNumberishToStyle(() => props.size)
// const propSizeIsLiteralSize = (val: unknown): val is Size =>
//   !!val && typeof val === 'string' && SIZES.includes(val)
// const computedParentSize = useNumberishToStyle(() => parentData?.size.value)
// const computedSize = computed(() => computedParentSize.value ?? computedPropSize.value)
// const computedPropSizeIsLiteralSize = computed(() => propSizeIsLiteralSize(computedSize.value))

const computedSize = useNumberishToStyle(() => parentData?.size.value ?? props.size)
const computedSizeIsLiteralSize = computed(
  () => !!computedSize.value && SIZES.includes(computedSize.value)
)

const computedVariant = computed(() => parentData?.variant.value ?? props.variant)
const computedRounded = computed(() => parentData?.rounded.value ?? props.rounded)
const computedRoundedTop = computed(() => parentData?.roundedTop.value ?? props.roundedTop)
const computedRoundedBottom = computed(() => parentData?.roundedBottom.value ?? props.roundedBottom)
const computedRoundedStart = computed(() => parentData?.roundedStart.value ?? props.roundedStart)
const computedRoundedEnd = computed(() => parentData?.roundedEnd.value ?? props.roundedEnd)

const radiusElementClasses = useRadiusElementClasses(() => ({
  rounded: computedRounded.value,
  roundedTop: computedRoundedTop.value,
  roundedBottom: computedRoundedBottom.value,
  roundedStart: computedRoundedStart.value,
  roundedEnd: computedRoundedEnd.value,
}))

const badgeText = computed(() => (props.badge === true ? '' : props.badge))
const badgeImplicitlyDot = computed(() => !badgeText.value && !hasBadgeSlot.value)

const colorClasses = useColorVariantClasses(() => ({
  bgVariant: parentData?.bgVariant.value ?? props.bgVariant,
  textVariant: parentData?.textVariant.value ?? props.textVariant,
  variant: computedVariant.value,
}))
const computedClasses = computed(() => [
  colorClasses.value,
  // Square overwrites all else
  computedSquare.value === true ? undefined : radiusElementClasses.value,
  {
    [`b-avatar-${computedSize.value}`]:
      computedSizeIsLiteralSize.value && computedSize.value !== 'md',
    [`btn-${computedVariant.value}`]: props.button ? computedVariant.value !== null : false,
    'badge': !props.button && computedVariant.value !== null && hasDefaultSlot.value,
    'btn': props.button,
    // Square is the same as rounded-0 class
    'rounded-0': computedSquare.value === true,
  },
])

const badgeStyle = computed<StyleValue>(() => ({
  fontSize:
    (!computedSizeIsLiteralSize.value
      ? `calc(${computedSize.value} * ${BADGE_FONT_SIZE_SCALE})`
      : '') || '',
}))

const textFontStyle = computed<StyleValue>(() => {
  const fontSize = !computedSizeIsLiteralSize.value
    ? `calc(${computedSize.value} * ${FONT_SIZE_SCALE})`
    : null
  return fontSize ? {fontSize} : {}
})

const marginStyle = computed(() => {
  const overlapScale = parentData?.overlapScale?.value || 0

  const value =
    computedSize.value && overlapScale ? `calc(${computedSize.value} * -${overlapScale})` : null
  return value ? {marginLeft: value, marginRight: value} : {}
})

const computedTag = computed(() => (computedLink.value ? BLink : props.button ? 'button' : 'span'))

const computedStyle = computed<CSSProperties>(() => ({
  ...marginStyle.value,
  ...(!computedSizeIsLiteralSize.value
    ? {
        width: computedSize.value,
        height: computedSize.value,
      }
    : undefined),
}))

const clicked = (e: Readonly<MouseEvent>): void => {
  if (!props.disabled && (computedLink.value || props.button)) emit('click', e)
}

const onImgError = (e: Readonly<Event>) => {
  localSrc.value = undefined
  emit('img-error', e)
}
</script>
