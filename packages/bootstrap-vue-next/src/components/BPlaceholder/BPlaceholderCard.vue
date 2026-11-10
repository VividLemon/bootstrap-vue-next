<template>
  <BCard :img-placement="props.imgPlacement">
    <template v-if="!props.noImg" #img>
      <slot name="img">
        <BCardImg
          :blank="!props.imgSrc"
          :blank-color="props.imgBlankColor"
          :height="!props.imgSrc ? props.imgHeight : undefined"
          :src="props.imgSrc"
          :placement="props.imgPlacement"
          :style="{cursor: 'wait'}"
        />
      </slot>
    </template>

    <template v-if="!props.noHeader" #header>
      <slot name="header">
        <BPlaceholder
          :width="props.headerWidth"
          :color="{
            bg: props.headerColor?.bg ?? getThemeColor(props.headerColor?.theme),
            fg: props.headerColor?.fg,
          }"
          :animation="props.headerAnimation"
          :size="props.headerSize"
        />
      </slot>
    </template>
    <slot>
      <BPlaceholder cols="7" v-bind="defaultAttrs" />
      <BPlaceholder cols="4" v-bind="defaultAttrs" />
      <BPlaceholder cols="4" v-bind="defaultAttrs" />
      <BPlaceholder cols="6" v-bind="defaultAttrs" />
      <BPlaceholder cols="8" v-bind="defaultAttrs" />
    </slot>
    <template v-if="!props.noFooter" #footer>
      <slot name="footer">
        <component
          :is="footerComponent"
          :width="props.footerWidth"
          :animation="props.footerAnimation"
          :size="props.noButton ? props.footerSize : undefined"
          v-bind="footerColorAttrs"
        />
      </slot>
    </template>
  </BCard>
</template>

<script setup lang="ts">
import {getThemeColor, resolvePartColor} from '../../composables/useThemeClasses'
import BCard from '../BCard/BCard.vue'
import BCardImg from '../BCard/BCardImg.vue'
import BPlaceholder from './BPlaceholder.vue'
import BPlaceholderButton from './BPlaceholderButton.vue'
import {computed} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import type {BPlaceholderCardProps, BPlaceholderCardSlots} from '../../types'

const _props = withDefaults(defineProps<BPlaceholderCardProps>(), {
  animation: undefined,
  footerAnimation: undefined,
  footerColor: undefined,
  footerSize: undefined,
  footerWidth: 100,
  headerAnimation: undefined,
  headerColor: undefined,
  headerSize: undefined,
  headerWidth: 100,
  imgBlankColor: '#868e96',
  imgPlacement: 'top',
  imgHeight: 100,
  imgSrc: undefined,
  noButton: false,
  noFooter: false,
  noHeader: false,
  noImg: false,
  size: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BPlaceholderCard')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BPlaceholderCardSlots>()

const defaultAttrs = computed(() => ({
  animation: props.animation,
  size: props.size,
  color: {
    bg: computedColor.value.bg ?? getThemeColor(computedColor.value.theme),
    fg: computedColor.value.fg,
  },
}))

const footerComponent = computed(() => (!props.noButton ? BPlaceholderButton : BPlaceholder))
const footerColorAttrs = computed(() =>
  props.noButton
    ? {
        color: {
          bg: props.footerColor?.bg ?? getThemeColor(props.footerColor?.theme),
          fg: props.footerColor?.fg,
        },
      }
    : {color: props.footerColor}
)
</script>
