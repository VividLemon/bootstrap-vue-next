<template>
  <BFormDatalistBase v-bind="forwardedProps" :options="normalizedOptions as any">
    <!-- Forward all slots -->
    <template #first>
      <slot name="first" />
    </template>

    <template #option="slotProps">
      <slot name="option" v-bind="slotProps as any" />
    </template>

    <slot />
  </BFormDatalistBase>
</template>

<script
  setup
  lang="ts"
  generic="
    Item = Record<string, unknown> | string | number | boolean,
    ValueKey extends (Item extends Record<string, unknown> ? keyof Item : string) =
      Item extends Record<string, unknown> ? keyof Item : never
  "
>
import {resolveOptionFields} from '../../composables/useFormSelect'
import {computed} from 'vue'
import BFormDatalistBase from './BFormDatalistBase.vue'
import type {
  BFormDatalistProps,
  BFormDatalistSlots,
  GroupedOptionFields,
  SelectOption,
} from '../../types'

/**
 * Type-safe wrapper component for BFormDatalist.
 * Provides generic type safety for options and field names.
 * Normalizes typed options and forwards to BFormDatalistBase for rendering.
 * Supports both complex objects and simple scalar types (string, number).
 */
const props = withDefaults(defineProps<BFormDatalistProps<Item, ValueKey>>(), {
  fields: undefined,
  disabled: false,
  id: undefined,
  options: () => [],
})
// ValueKey is a key of Item, which may not be a string; the fields hold plain key names at runtime
const optionFields = computed(() =>
  resolveOptionFields(props.fields as GroupedOptionFields | undefined)
)
defineSlots<
  BFormDatalistSlots<Item extends Record<string, unknown> ? Item[ValueKey & keyof Item] : Item>
>()

// Type-safe normalization of options
const normalizedOptions = computed(() =>
  props.options.map((el) => {
    if (typeof el === 'string') {
      return el
    }
    if (typeof el === 'number') {
      return String(el)
    }
    if (typeof el === 'boolean') {
      return String(el)
    }
    return {
      value: (el as Record<string, unknown>)[optionFields.value.valueField],
      text:
        ((el as Record<string, unknown>)[optionFields.value.textField] as string | undefined) ?? '',
      disabled:
        ((el as Record<string, unknown>)[optionFields.value.disabledField] as
          boolean | undefined) ?? false,
    } as SelectOption
  })
)

// Forward all props except options (which we normalize) and field mappings (already used)
const forwardedProps = computed(() => ({
  disabled: props.disabled,
  id: props.id,
}))
</script>
