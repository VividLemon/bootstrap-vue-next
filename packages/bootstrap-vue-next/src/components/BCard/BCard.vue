<template>
  <component :is="props.tag" class="card" :class="computedClasses">
    <template v-if="props.imgPlacement !== 'bottom'">
      <slot name="img">
        <BCardImg v-if="props.imgSrc" v-bind="imgAttr" />
      </slot>
    </template>
    <BCardHeader
      v-if="props.header || hasHeaderSlot"
      :color="props.headerColor"
      :tag="props.headerTag"
      :class="props.headerClass"
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
      :class="props.bodyClass"
    >
      <slot>
        {{ props.bodyText }}
      </slot>
    </BCardBody>
    <slot v-else>
      {{ props.bodyText }}
    </slot>
    <BCardFooter
      v-if="props.footer || hasFooterSlot"
      :color="props.footerColor"
      :tag="props.footerTag"
      :class="props.footerClass"
    >
      <slot name="footer">
        {{ props.footer }}
      </slot>
    </BCardFooter>
    <template v-if="props.imgPlacement === 'bottom'">
      <slot name="img">
        <BCardImg v-if="props.imgSrc" v-bind="imgAttr" />
      </slot>
    </template>
  </component>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {isEmptySlot} from '../../utils/dom'
import {computed} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import BCardImg from './BCardImg.vue'
import BCardHeader from './BCardHeader.vue'
import BCardBody from './BCardBody.vue'
import BCardFooter from './BCardFooter.vue'
import type {BCardProps, BCardSlots} from '../../types'

const _props = withDefaults(defineProps<BCardProps>(), {
  align: undefined,
  bodyClass: undefined,
  bodyColor: undefined,
  bodyTag: 'div',
  bodyText: '',
  footer: undefined,
  footerClass: undefined,
  footerColor: undefined,
  footerTag: 'div',
  header: undefined,
  headerClass: undefined,
  headerColor: undefined,
  headerTag: 'div',
  imgAlt: undefined,
  imgAttrs: undefined,
  imgPlacement: 'top',
  imgHeight: undefined,
  imgSrc: undefined,
  imgWidth: undefined,
  noBody: false,
  subtitle: undefined,
  subtitleColor: undefined,
  subtitleTag: 'h6',
  tag: 'div',
  title: undefined,
  titleTag: 'h4',
  color: undefined,
})
const props = useDefaults(_props, 'BCard')
const computedColor = computed(() => resolvePartColor(props.color, {}))
const slots = defineSlots<BCardSlots>()

const hasHeaderSlot = computed(() => !isEmptySlot(slots.header))
const hasFooterSlot = computed(() => !isEmptySlot(slots.footer))

const {classes: colorClasses} = useThemeClasses(computedColor)
const computedClasses = computed(() => [
  colorClasses.value,
  {
    [`text-${props.align}`]: props.align !== undefined,
    'card-row': props.imgPlacement === 'start' || props.imgPlacement === 'end',
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
