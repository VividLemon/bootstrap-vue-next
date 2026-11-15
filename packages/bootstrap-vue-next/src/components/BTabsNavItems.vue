<template>
  <li
    v-for="(tab, idx) in props.tabs()"
    :key="tab.id ?? tab.internalId"
    class="nav-item"
    role="presentation"
    v-bind="tab.titleItemAttrs"
  >
    <button
      :id="tab.buttonId"
      class="nav-link"
      :class="{
        active: tab.active,
        disabled: tab.disabled !== undefined && tab.disabled !== false,
      }"
      role="tab"
      :aria-controls="tab.id"
      :aria-selected="tab.active"
      :disabled="tab.disabled"
      :tabindex="props.noKeyNav ? undefined : tab.active ? undefined : -1"
      type="button"
      v-bind="tab.navItemAttrs"
      @keydown.left.exact="!props.vertical && emit('keynav', $event, -1)"
      @keydown.left.shift="!props.vertical && emit('keynav', $event, -999)"
      @keydown.up.exact="props.vertical && emit('keynav', $event, -1)"
      @keydown.up.shift="props.vertical && emit('keynav', $event, -999)"
      @keydown.right.exact="!props.vertical && emit('keynav', $event, 1)"
      @keydown.right.shift="!props.vertical && emit('keynav', $event, 999)"
      @keydown.down.exact="props.vertical && emit('keynav', $event, 1)"
      @keydown.down.shift="props.vertical && emit('keynav', $event, 999)"
      @keydown.page-up="emit('keynav', $event, -999)"
      @keydown.page-down="emit('keynav', $event, 999)"
      @keydown.home="emit('keynav', $event, -999)"
      @keydown.end="emit('keynav', $event, 999)"
      @click.stop="emit('tab-click', $event, idx)"
    >
      <component :is="tab.titleComponent" v-if="tab.titleComponent" />
      <template v-else>
        {{ tab.title }}
      </template>
    </button>
  </li>
</template>

<script setup lang="ts">
import type {Slot} from 'vue'
import type {AttrsValue} from '../types/AnyValuedAttributes'

/**
 * The nav items of BTabs (internal).
 *
 * BTabs renders its default slot, which creates the BTab children, and the nav items read what those
 * children registered (their attrs, title slot, click handler). Rendering the nav items in their own
 * component keeps those reads out of BTabs' render: a child prop that is a new object on every render
 * (common with render functions or JSX) then only re-renders this component, instead of re-rendering
 * BTabs, which would render the slot again and loop.
 */
export interface TabsNavItem {
  id?: string
  internalId: string
  buttonId?: string
  title?: string
  titleComponent?: Slot | unknown
  titleItemAttrs?: Readonly<AttrsValue>
  navItemAttrs?: Readonly<AttrsValue>
  disabled?: boolean
  active: boolean
}

const props = defineProps<{
  /** Read in this component's render, so BTabs' own render does not depend on the tabs */
  tabs: () => readonly TabsNavItem[]
  vertical: boolean
  noKeyNav: boolean
}>()

const emit = defineEmits<{
  'keynav': [event: KeyboardEvent, direction: number]
  'tab-click': [event: MouseEvent, index: number]
}>()
</script>
