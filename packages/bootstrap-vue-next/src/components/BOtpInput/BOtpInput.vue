<template>
  <div :id="computedId" :class="containerClasses" :dir="props.dir || undefined" role="group">
    <input
      v-for="(_, index) in inputCount"
      :key="index"
      :ref="(el) => setInputRef(el as HTMLInputElement | null, index)"
      :aria-label="`${props.name || 'OTP'} digit ${index + 1} of ${inputCount}`"
      :autocomplete="props.otp ? 'one-time-code' : undefined"
      :class="inputClasses"
      :disabled="props.disabled"
      :name="props.name ? `${props.name}-${index}` : undefined"
      :placeholder="props.placeholder || undefined"
      :required="props.required || undefined"
      :type="inputType"
      :value="currentValue[index] ?? ''"
      inputmode="numeric"
      maxlength="1"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste(index, $event)"
      @focus="onFocus(index)"
    />
    <slot :model-value="currentValue" />
  </div>
</template>

<script setup lang="ts">
import {computed, ref, toRef, watch} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {useStateClass} from '../../composables/useStateClass'
import type {BOtpInputProps} from '../../types/ComponentProps'
import {useToNumber} from '@vueuse/core'

const _props = withDefaults(defineProps<BOtpInputProps>(), {
  defaultValue: undefined,
  dir: undefined,
  disabled: false,
  id: undefined,
  length: 6,
  mask: false,
  modelValue: null,
  name: undefined,
  otp: false,
  placeholder: '',
  required: false,
  size: undefined,
  state: undefined,
  type: 'text',
})
const props = useDefaults(_props, 'BOtpInput')

const emit = defineEmits<{
  'complete': [value: string[]]
  'update:model-value': [value: string[]]
}>()

const computedId = useId(() => props.id, 'otp-input')
const stateClass = useStateClass(toRef(() => props.state ?? null))
const inputCount = useToNumber(() => props.length ?? 6, {nanToZero: true})

const inputRefs = ref<(HTMLInputElement | null)[]>([])

const setInputRef = (el: HTMLInputElement | null, index: number) => {
  inputRefs.value[index] = el
}

const internalValue = ref<string[]>(props.defaultValue ?? [])

const isControlled = computed(() => props.modelValue !== null)
const currentValue = computed(() => (isControlled.value ? props.modelValue! : internalValue.value))

const containerClasses = computed(() => ['bvn-otp-input', stateClass.value])

const inputClasses = computed(() => [
  'form-control',
  'bvn-otp-input-field',
  stateClass.value,
  {
    [`form-control-${props.size}`]: !!props.size,
  },
])

const inputType = computed(() => {
  if (props.mask) return 'password'
  return props.type === 'number' ? 'text' : 'text'
})

const updateValue = (newValue: string[]) => {
  if (!isControlled.value) {
    internalValue.value = newValue
  }
  emit('update:model-value', newValue)
  if (newValue.length >= inputCount.value && newValue.every((v) => v !== '')) {
    emit('complete', newValue)
  }
}

const focusInput = (index: number) => {
  const input = inputRefs.value[index]
  if (input) {
    input.focus()
  }
}

const onInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  let val = target.value

  if (props.type === 'number') {
    val = val.replace(/\D/g, '')
  }

  // Take only the last character if multiple were entered
  val = val.slice(-1)
  target.value = val

  const newValue = [...currentValue.value]
  // Ensure array is long enough
  while (newValue.length < inputCount.value) {
    newValue.push('')
  }
  newValue[index] = val
  updateValue(newValue)

  // Auto-advance to next input
  if (val && index < inputCount.value - 1) {
    focusInput(index + 1)
  }
}

const onKeydown = (index: number, event: KeyboardEvent) => {
  switch (event.key) {
    case 'Backspace': {
      event.preventDefault()
      const newValue = [...currentValue.value]
      while (newValue.length < inputCount.value) {
        newValue.push('')
      }
      if (newValue[index]) {
        newValue[index] = ''
        updateValue(newValue)
      } else if (index > 0) {
        newValue[index - 1] = ''
        updateValue(newValue)
        focusInput(index - 1)
      }
      break
    }
    case 'Delete': {
      event.preventDefault()
      const newValue = [...currentValue.value]
      while (newValue.length < inputCount.value) {
        newValue.push('')
      }
      newValue[index] = ''
      updateValue(newValue)
      break
    }
    case 'ArrowLeft': {
      event.preventDefault()
      if (index > 0) {
        focusInput(index - 1)
      }
      break
    }
    case 'ArrowRight': {
      event.preventDefault()
      if (index < inputCount.value - 1) {
        focusInput(index + 1)
      }
      break
    }
    case 'Home': {
      event.preventDefault()
      focusInput(0)
      break
    }
    case 'End': {
      event.preventDefault()
      focusInput(inputCount.value - 1)
      break
    }
  }
}

const onPaste = (index: number, event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') ?? ''
  let chars = pastedData.split('')

  if (props.type === 'number') {
    chars = chars.filter((c) => /\d/.test(c))
  }

  if (chars.length === 0) return

  const newValue = [...currentValue.value]
  while (newValue.length < inputCount.value) {
    newValue.push('')
  }

  // If pasted content length >= number of inputs, start from first input
  const startIndex = chars.length >= inputCount.value ? 0 : index

  for (let i = 0; i < chars.length && startIndex + i < inputCount.value; i++) {
    newValue[startIndex + i] = chars[i]!
  }

  updateValue(newValue)

  // Focus the next empty input or the last filled one
  const nextEmpty = newValue.findIndex((v, i) => i >= startIndex && v === '')
  if (nextEmpty !== -1) {
    focusInput(nextEmpty)
  } else {
    focusInput(Math.min(startIndex + chars.length - 1, inputCount.value - 1))
  }
}

const onFocus = (index: number) => {
  // Select the value in the input when focused
  const input = inputRefs.value[index]
  if (input) {
    input.select()
  }
}

const focus = () => {
  focusInput(0)
}

const blur = () => {
  inputRefs.value.forEach((input) => input?.blur())
}

// Watch for external modelValue changes to sync internal refs
watch(
  () => props.defaultValue,
  (newVal) => {
    if (!isControlled.value && newVal) {
      internalValue.value = [...newVal]
    }
  }
)

defineExpose({
  focus,
  blur,
})
</script>
