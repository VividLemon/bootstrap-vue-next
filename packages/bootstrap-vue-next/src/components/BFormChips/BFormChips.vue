<template>
  <div
    ref="root"
    class="chip-input"
    :class="rootClasses"
    role="group"
    @click="onRootClick"
    @keydown="onChipKeydown"
  >
    <template v-for="(value, index) in modelValue" :key="`${index}-${value}`">
      <slot
        name="chip"
        :value
        :index
        :selected="selection.has(index)"
        :remove="() => removeAt(index)"
      >
        <BChip
          :value="value"
          :active="selection.has(index)"
          :aria-pressed="selection.has(index) ? 'true' : undefined"
          :disabled="isDisabled"
          :dismissible="props.dismissible && !isDisabled"
          :dismiss-label="`${props.dismissLabel} ${value}`"
          tabindex="0"
          v-bind="props.chipAttrs?.(value, index)"
          @remove="onDismiss(index)"
        >
          {{ value }}
          <template v-if="slots['dismiss-icon']" #dismiss-icon>
            <slot name="dismiss-icon" :value :index />
          </template>
        </BChip>
      </slot>
    </template>
    <input
      :id="computedId"
      ref="input"
      v-model="inputValue"
      type="text"
      v-bind="props.inputAttrs"
      class="form-ghost"
      :class="stateClass"
      :placeholder="props.placeholder"
      :disabled="isDisabled"
      :required="props.required && modelValue.length === 0 ? true : undefined"
      :aria-invalid="computedAriaInvalid"
      @keydown="onInputKeydown"
      @input="onInput"
      @paste="onPaste"
      @focus="clearSelection"
      @blur="onInputBlur"
    />
    <template v-if="props.name">
      <input
        v-for="(value, index) in modelValue"
        :key="`hidden-${index}`"
        type="hidden"
        :name="props.name"
        :form="props.form"
        :value="value"
      />
    </template>
    <span class="visually-hidden" aria-live="polite" aria-atomic="true">{{ announcement }}</span>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, nextTick, onMounted, provide, ref, shallowRef, useTemplateRef} from 'vue'
import type {BFormChipsEmits, BFormChipsProps, BFormChipsSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {useAriaInvalid} from '../../composables/useAriaInvalid'
import {useStateClass} from '../../composables/useStateClass'
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {chipInputKey, formGroupKey} from '../../utils/keys'
import {BvEvent} from '../../utils'
import BChip from './BChip.vue'

const _props = withDefaults(defineProps<Omit<BFormChipsProps, 'modelValue'>>(), {
  allowDuplicates: false,
  ariaInvalid: undefined,
  autofocus: false,
  chipAttrs: undefined,
  color: undefined,
  createOnBlur: true,
  disabled: false,
  dismissLabel: 'Remove',
  dismissible: true,
  form: undefined,
  id: undefined,
  inputAttrs: undefined,
  maxChips: null,
  name: undefined,
  placeholder: undefined,
  removedLabel: 'Removed',
  required: false,
  separator: ',',
  state: undefined,
})
const props = useDefaults(_props, 'BFormChips')
const emit = defineEmits<BFormChipsEmits>()
const slots = defineSlots<BFormChipsSlots>()

const modelValue = defineModel<Exclude<BFormChipsProps['modelValue'], undefined>>({
  default: () => [],
})

provide(chipInputKey, true)

const root = useTemplateRef<HTMLElement>('root')
const input = useTemplateRef<HTMLInputElement>('input')
const inputValue = ref('')
const announcement = ref('')

const computedId = useId(() => props.id, 'chips')
const formGroupData = inject(formGroupKey, null)?.()
formGroupData?.track(computedId)
const computedState = computed(() =>
  props.state !== undefined ? props.state : (formGroupData?.state.value ?? null)
)
const isDisabled = computed(() => props.disabled || (formGroupData?.disabled.value ?? false))
const {ariaInvalid: computedAriaInvalid} = useAriaInvalid(() => props.ariaInvalid, computedState)
const {stateClass} = useStateClass(computedState)

const computedColor = computed(() => resolvePartColor(props.color, {}))
const {classes: colorClasses} = useThemeClasses(() => ({theme: computedColor.value.theme}))
const rootClasses = computed(() => [colorClasses.value, {disabled: isDisabled.value}])

// Selection by index, so duplicate values stay distinguishable
const selection = shallowRef<ReadonlySet<number>>(new Set())
let anchor: number | null = null

const setSelection = (next: ReadonlySet<number>) => {
  selection.value = next
  emit(
    'select',
    [...next].sort((a, b) => a - b).map((i) => modelValue.value[i] ?? '')
  )
}

const clearSelection = () => {
  anchor = null
  if (selection.value.size === 0) return
  setSelection(new Set())
}

const selectChip = (
  index: number,
  {
    addToSelection = false,
    rangeSelect = false,
  }: {addToSelection?: boolean; rangeSelect?: boolean} = {}
) => {
  if (index < 0 || index >= modelValue.value.length) return
  if (rangeSelect && anchor !== null) {
    const next = new Set(addToSelection ? selection.value : [])
    for (let i = Math.min(anchor, index); i <= Math.max(anchor, index); i++) next.add(i)
    setSelection(next)
  } else if (addToSelection) {
    const next = new Set(selection.value)
    if (next.has(index)) {
      next.delete(index)
    } else {
      next.add(index)
      anchor = index
    }
    setSelection(next)
  } else {
    anchor = index
    setSelection(new Set([index]))
  }
}

const chipElements = (): HTMLElement[] =>
  root.value ? [...root.value.querySelectorAll<HTMLElement>(':scope > .chip')] : []

const focusChip = (index: number) => {
  chipElements()[index]?.focus()
}

const focus = () => {
  input.value?.focus()
}

const blur = () => {
  input.value?.blur()
}

// The model only updates after the parent re-renders, so several changes in one go (paste,
// separator split, multi-delete) are applied to a working copy and committed once
const tryAdd = (list: string[], raw: string): boolean => {
  const value = String(raw).trim()
  if (!value) return false
  if (!props.allowDuplicates && list.includes(value)) return false
  if (props.maxChips !== null && props.maxChips !== undefined && list.length >= props.maxChips)
    return false
  const event = new BvEvent('add', {cancelable: true, target: input.value})
  emit('add', value, event)
  if (event.defaultPrevented) return false
  list.push(value)
  return true
}

const addAll = (values: readonly string[]): boolean => {
  const list = [...modelValue.value]
  let changed = false
  for (const value of values) changed = tryAdd(list, value) || changed
  if (changed) modelValue.value = list
  return changed
}

const add = (value: string): boolean => addAll([value])

const removeIndices = (indices: readonly number[]): boolean => {
  const removed = new Set<number>()
  for (const index of indices) {
    const value = modelValue.value[index]
    if (value === undefined || removed.has(index)) continue
    const event = new BvEvent('remove', {cancelable: true, target: input.value})
    emit('remove', value, event)
    if (!event.defaultPrevented) removed.add(index)
  }
  if (removed.size === 0) return false
  const removedValues = [...removed].sort((a, b) => a - b).map((i) => modelValue.value[i])
  modelValue.value = modelValue.value.filter((_, i) => !removed.has(i))
  // Shift the remaining selection past the removed chips
  const shift = (i: number) => i - [...removed].filter((r) => r < i).length
  const next = new Set<number>()
  for (const i of selection.value) if (!removed.has(i)) next.add(shift(i))
  anchor = anchor === null || removed.has(anchor) ? null : shift(anchor)
  if (next.size !== selection.value.size || [...next].some((i) => !selection.value.has(i))) {
    setSelection(next)
  }
  announcement.value = `${props.removedLabel} ${removedValues.join(', ')}`
  return true
}

const removeAt = (index: number): boolean => removeIndices([index])

const onDismiss = (index: number) => {
  removeAt(index)
  focus()
}

const remove = (value: string): boolean => {
  const index = modelValue.value.indexOf(value)
  return index === -1 ? false : removeAt(index)
}

const removeSelected = () => {
  removeIndices([...selection.value])
  clearSelection()
  focus()
}

const clear = () => {
  modelValue.value = []
  selection.value = new Set()
  anchor = null
}

const createFromInput = () => {
  const value = inputValue.value.trim()
  if (!value) return
  add(value)
  inputValue.value = ''
}

const onInput = () => {
  const {separator} = props
  if (!separator || !inputValue.value.includes(separator)) return
  const parts = inputValue.value.split(separator)
  addAll(parts.slice(0, -1))
  inputValue.value = parts.at(-1) ?? ''
}

const onPaste = (event: ClipboardEvent) => {
  const {separator} = props
  if (!separator) return
  const pasted = event.clipboardData?.getData('text') ?? ''
  if (!pasted.includes(separator)) return
  event.preventDefault()
  addAll(pasted.split(separator))
}

const onInputBlur = (event: FocusEvent) => {
  if (!props.createOnBlur) return
  // Don't create a chip when focus moves to a chip
  const related = event.relatedTarget as Element | null
  if (related?.closest('.chip')) return
  createFromInput()
}

const onInputKeydown = (event: KeyboardEvent) => {
  const el = input.value
  if (!el) return
  const last = modelValue.value.length - 1
  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      createFromInput()
      break
    case 'Backspace':
    case 'Delete':
      if (el.value === '' && last >= 0) {
        event.preventDefault()
        selectChip(last)
        focusChip(last)
      }
      break
    case 'ArrowLeft':
      if (el.selectionStart === 0 && el.selectionEnd === 0 && last >= 0) {
        event.preventDefault()
        selectChip(last, event.shiftKey ? {addToSelection: true} : {})
        focusChip(last)
      }
      break
    case 'Escape':
      inputValue.value = ''
      clearSelection()
      el.blur()
      break
  }
}

const chipIndexOf = (target: EventTarget | null): number => {
  const chip = (target as Element | null)?.closest?.('.chip')
  return chip ? chipElements().indexOf(chip as HTMLElement) : -1
}

const navigate = (index: number, direction: -1 | 1, shiftKey: boolean) => {
  const target = index + direction
  if (target >= 0 && target < modelValue.value.length) {
    selectChip(target, shiftKey ? {addToSelection: true, rangeSelect: true} : {})
    focusChip(target)
  } else if (direction > 0) {
    clearSelection()
    focus()
  }
}

const onChipKeydown = (event: KeyboardEvent) => {
  if (event.target === input.value) return
  const index = chipIndexOf(event.target)
  if (index === -1) return
  switch (event.key) {
    case 'Backspace':
    case 'Delete': {
      event.preventDefault()
      if (selection.value.size === 0 || isDisabled.value) return
      const nextIndex = Math.min(index, modelValue.value.length - selection.value.size - 1)
      removeSelected()
      nextTick(() => {
        const remaining = modelValue.value.length
        if (remaining > 0) {
          const focusIndex = Math.max(0, Math.min(nextIndex, remaining - 1))
          focusChip(focusIndex)
          selectChip(focusIndex)
        }
      })
      break
    }
    case 'ArrowLeft':
      event.preventDefault()
      navigate(index, -1, event.shiftKey)
      break
    case 'ArrowRight':
      event.preventDefault()
      navigate(index, 1, event.shiftKey)
      break
    case 'Home':
      event.preventDefault()
      selectChip(0, event.shiftKey ? {rangeSelect: true} : {})
      focusChip(0)
      break
    case 'End':
      event.preventDefault()
      clearSelection()
      focus()
      break
    case 'a':
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault()
        setSelection(new Set(modelValue.value.map((_, i) => i)))
      }
      break
    case 'Escape':
      event.preventDefault()
      clearSelection()
      focus()
      break
  }
}

const onRootClick = (event: MouseEvent) => {
  if (isDisabled.value) return
  if (event.target === root.value) {
    clearSelection()
    focus()
    return
  }
  const target = event.target as Element
  if (target.closest('.chip-dismiss')) return
  const index = chipIndexOf(target)
  if (index === -1) return
  event.preventDefault()
  selectChip(index, {addToSelection: event.metaKey || event.ctrlKey, rangeSelect: event.shiftKey})
  focusChip(index)
}

onMounted(() => {
  if (props.autofocus && !isDisabled.value) nextTick(focus)
})

defineExpose({
  add,
  blur,
  clear,
  clearSelection,
  element: root,
  focus,
  remove,
  removeSelected,
})
</script>
