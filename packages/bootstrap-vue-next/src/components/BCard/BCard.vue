<template>
  <component :is="props.tag" class="card" :class="computedClasses">
    <template v-if="props.imgPlacement !== 'bottom'">
      <slot name="img">
        <BCardImg v-if="props.imgSrc" v-bind="imgAttr" />
      </slot>
    </template>
    <BCardHeader
      v-if="props.header || hasHeaderSlot"
      :bg="props.headerBg"
      :theme="props.headerTheme"
      :border="props.headerBorder"
      :tag="props.headerTag"
      :fg="props.headerFg"
      :class="props.headerClass"
    >
      <slot name="header">
        {{ props.header }}
      </slot>
    </BCardHeader>
    <BCardBody
      v-if="!props.noBody"
      :overlay="props.imgPlacement === 'overlay'"
      :bg="props.bodyBg"
      :border="props.bodyBorder"
      :tag="props.bodyTag"
      :fg="props.bodyFg"
      :subtitle="props.subtitle"
      :subtitle-tag="props.subtitleTag"
      :subtitle-fg="props.subtitleFg"
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
      :bg="props.footerBg"
      :border="props.footerBorder"
      :theme="props.footerTheme"
      :tag="props.footerTag"
      :fg="props.footerFg"
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
  bodyBg: undefined,
  bodyBorder: undefined,
  bodyClass: undefined,
  bodyTag: 'div',
  bodyText: '',
  bodyFg: undefined,
  border: null,
  footer: undefined,
  footerBg: undefined,
  footerBorder: undefined,
  footerClass: undefined,
  footerTag: 'div',
  footerFg: undefined,
  footerTheme: null,
  header: undefined,
  headerBg: undefined,
  headerBorder: undefined,
  headerClass: undefined,
  headerTag: 'div',
  headerFg: undefined,
  headerTheme: null,
  imgAlt: undefined,
  imgAttrs: undefined,
  imgPlacement: 'top',
  imgHeight: undefined,
  imgSrc: undefined,
  imgWidth: undefined,
  noBody: false,
  subtitle: undefined,
  subtitleTag: 'h6',
  subtitleFg: '2',
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
