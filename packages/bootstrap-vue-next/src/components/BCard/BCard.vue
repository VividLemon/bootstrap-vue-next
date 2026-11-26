<template>
  <component :is="props.tag" class="card" :class="computedClasses">
    <template v-if="!imgAfterContent">
      <slot name="img">
        <BCardImg v-if="props.imgSrc" v-bind="imgAttr" />
      </slot>
    </template>
    <BCardHeader
      v-if="props.header || slots.header"
      :color="props.headerColor"
      :tag="props.headerTag"
      v-bind="props.headerAttrs"
    >
      <slot name="header">
        {{ props.header }}
      </slot>
    </BCardHeader>
    <BCardBody
      v-if="!props.noBody"
      :overlay="props.imgPlacement === 'overlay'"
      :color="props.bodyColor"
      :tag="props.bodyTag"
      :subtitle="props.subtitle"
      :subtitle-tag="props.subtitleTag"
      :subtitle-color="props.subtitleColor"
      :title="props.title"
      :title-tag="props.titleTag"
      v-bind="props.bodyAttrs"
    >
      <slot>
        {{ props.bodyText }}
      </slot>
    </BCardBody>
    <slot v-else>
      {{ props.bodyText }}
    </slot>
    <BCardFooter
      v-if="props.footer || slots.footer"
      :color="props.footerColor"
      :tag="props.footerTag"
      v-bind="props.footerAttrs"
    >
      <slot name="footer">
        {{ props.footer }}
      </slot>
    </BCardFooter>
    <template v-if="imgAfterContent">
      <slot name="img">
        <BCardImg v-if="props.imgSrc" v-bind="imgAttr" />
      </slot>
    </template>
  </component>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {computed} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import BCardImg from './BCardImg.vue'
import BCardHeader from './BCardHeader.vue'
import BCardBody from './BCardBody.vue'
import BCardFooter from './BCardFooter.vue'
import type {BCardProps, BCardSlots} from '../../types'

const _props = withDefaults(defineProps<BCardProps>(), {
  align: undefined,
  bodyAttrs: undefined,
  bodyColor: undefined,
  bodyTag: 'div',
  bodyText: '',
  footer: undefined,
  footerAttrs: undefined,
  footerColor: undefined,
  footerTag: 'div',
  header: undefined,
  headerAttrs: undefined,
  headerColor: undefined,
  headerTag: 'div',
  hoverLift: false,
  imgAlt: undefined,
  imgAttrs: undefined,
  imgPlacement: 'top',
  imgHeight: undefined,
  imgSrc: undefined,
  imgWidth: undefined,
  noBody: false,
  subtle: false,
  subtitle: undefined,
  subtitleColor: undefined,
  subtitleTag: 'h6',
  tag: 'div',
  title: undefined,
  titleTag: 'h4',
  translucent: false,
  color: undefined,
})
const props = useDefaults(_props, 'BCard')
const computedColor = computed(() => resolvePartColor(props.color, {}))
const slots = defineSlots<BCardSlots>()

// Bootstrap v6 puts a bottom or end image after the content (`.card-body + .card-img-end`)
const imgAfterContent = computed(
  () => props.imgPlacement === 'bottom' || props.imgPlacement === 'end'
)

const {classes: colorClasses} = useThemeClasses(computedColor)
const computedClasses = computed(() => [
  colorClasses.value,
  {
    [`text-${props.align}`]: props.align !== undefined,
    'card-row': props.imgPlacement === 'start' || props.imgPlacement === 'end',
    'hover-lift': props.hoverLift,
    'card-subtle': props.subtle,
    'card-translucent': props.translucent,
  },
])

const imgAttr = computed(() => ({
  src: props.imgSrc,
  alt: props.imgAlt,
  height: props.imgHeight,
  width: props.imgWidth,
  placement: props.imgPlacement,
  ...props.imgAttrs,
}))
</script>
