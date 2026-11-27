<template>
  <component
    :is="props.tag"
    :id="props.id"
    class="chip"
    :class="computedClasses"
    :data-bs-chip-value="props.value"
    :aria-disabled="props.disabled || undefined"
  >
    <slot name="img" :props="{class: 'chip-img'}" />
    <span v-if="slots.icon" class="chip-icon" aria-hidden="true"><slot name="icon" /></span>
    <slot>{{ props.value }}</slot>
    <button
      v-if="props.dismissible"
      type="button"
      class="chip-dismiss"
      :aria-label="props.dismissLabel"
      :tabindex="inChipInput ? -1 : undefined"
      :disabled="props.disabled"
      @click.stop="onDismiss"
    >
      <slot name="dismiss-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </svg>
      </slot>
    </button>
  </component>
</template>

<script setup lang="ts">
import {computed, inject} from 'vue'
import type {BChipEmits, BChipProps, BChipSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {chipInputKey} from '../../utils/keys'

const _props = withDefaults(defineProps<BChipProps>(), {
  active: false,
  color: undefined,
  disabled: false,
  dismissLabel: 'Remove',
  dismissible: false,
  id: undefined,
  tag: 'span',
  value: undefined,
})
const props = useDefaults(_props, 'BChip')
const emit = defineEmits<BChipEmits>()
const slots = defineSlots<BChipSlots>()

// Inside BFormChips the chip itself handles the keyboard, so its dismiss button leaves the tab order
const inChipInput = inject(chipInputKey, false)

const computedColor = computed(() => resolvePartColor(props.color, {}))
const {classes: colorClasses} = useThemeClasses(computedColor)

const computedClasses = computed(() => [
  colorClasses.value,
  {
    active: props.active,
    disabled: props.disabled,
  },
])

const onDismiss = (event: MouseEvent) => {
  if (props.disabled) return
  emit('remove', props.value ?? '', event)
}
</script>
