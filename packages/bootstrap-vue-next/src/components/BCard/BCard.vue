<template>
  <component :is="props.tag" class="card" :class="computedClasses">
    <template v-if="props.imgPlacement !== 'bottom'">
      <slot name="img">
        <BCardImg v-if="props.imgSrc" v-bind="imgAttr" />
      </slot>
    </template>
    <BCardHeader
      v-if="props.header || hasHeaderSlot"
      :theme="props.headerColor?.theme"
      :bg="props.headerColor?.bg"
      :fg="props.headerColor?.fg"
      :border="props.headerColor?.border"
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
      :theme="props.bodyColor?.theme"
      :bg="props.bodyColor?.bg"
      :fg="props.bodyColor?.fg"
      :border="props.bodyColor?.border"
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
      :theme="props.footerColor?.theme"
      :bg="props.footerColor?.bg"
      :fg="props.footerColor?.fg"
      :border="props.footerColor?.border"
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
import {isEmptySlot} from '../../utils/dom'
import {computed} from 'vue'
import {useThemeClasses} from '../../composables/useThemeClasses'
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
  border: null,
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
  // ColorExtendables props
  bg: null,
  fg: null,
  theme: null,
  // End ColorExtendables props
})
const props = useDefaults(_props, 'BCard')
const slots = defineSlots<BCardSlots>()

const hasHeaderSlot = computed(() => !isEmptySlot(slots.header))
const hasFooterSlot = computed(() => !isEmptySlot(slots.footer))

const {classes: colorClasses} = useThemeClasses(props)
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
