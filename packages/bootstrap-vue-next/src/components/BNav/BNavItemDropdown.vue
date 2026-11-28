<template>
  <li class="nav-item" :class="{show: !!modelValue}">
    <BMenu
      ref="menu"
      v-bind="props"
      v-model="modelValue"
      @show="emit('show', $event)"
      @shown="emit('shown', $event)"
      @hide="emit('hide', $event)"
      @hidden="emit('hidden', $event)"
      @hide-prevented="emit('hide-prevented', $event)"
      @show-prevented="emit('show-prevented', $event)"
      @toggle-prevented="emit('toggle-prevented', $event)"
      @toggle="emit('toggle', $event)"
      @split-click="emit('split-click', $event)"
    >
      <template #activator="{props: toggleProps}">
        <button
          type="button"
          class="nav-link"
          v-bind="mergeProps(attrs, props.toggleAttrs ?? {}, toggleProps)"
          :disabled="props.disabled"
        >
          <slot name="toggle">{{ props.text }}</slot>
        </button>
      </template>
      <template #default="scope">
        <slot v-bind="scope" />
      </template>
    </BMenu>
  </li>
</template>

<script setup lang="ts">
import {mergeProps, useAttrs, useTemplateRef} from 'vue'
import BMenu from '../BMenu/BMenu.vue'
import {useDefaults} from '../../composables/useDefaults'
import type {BMenuEmits, BMenuProps, BNavItemDropdownSlots} from '../../types'

// Interim: renders the v6 nav menu markup (`li.nav-item` > `button.nav-link` + `.menu`) on top of
// BMenu until `BNavItemMenu` replaces this component (G2 step 3)
defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BMenuProps, 'modelValue'>>(), {
  autoClose: true,
  boundary: 'clippingParents',
  color: undefined,
  disabled: false,
  display: 'dynamic',
  floatingConfig: undefined,
  id: undefined,
  initialAnimation: false,
  lazy: false,
  menuAttrs: undefined,
  noTransition: false,
  offset: () => [0, 2] as const,
  placement: 'bottom-start',
  reference: 'toggle',
  responsivePlacement: undefined,
  scrollable: false,
  show: false,
  size: undefined,
  split: false,
  splitAttrs: undefined,
  splitButtonType: 'button',
  splitColor: undefined,
  splitDisabled: false,
  splitHref: undefined,
  splitTo: undefined,
  splitVariant: undefined,
  strategy: 'absolute',
  teleportTo: undefined,
  text: undefined,
  toggleAttrs: undefined,
  toggleText: 'Toggle menu',
  translucent: false,
  unmountLazy: false,
  variant: 'solid',
  visible: false,
})
const props = useDefaults(_props, 'BNavItemDropdown')
const emit = defineEmits<BMenuEmits>()
defineSlots<BNavItemDropdownSlots>()
const attrs = useAttrs()

const modelValue = defineModel<Exclude<BMenuProps['modelValue'], undefined>>({default: false})

const menu = useTemplateRef('menu')

defineExpose({
  hide: (trigger?: string) => menu.value?.hide(trigger),
  show: () => menu.value?.show(),
  toggle: () => menu.value?.toggle(),
  update: () => menu.value?.update(),
})
</script>
