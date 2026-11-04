import type {AriaInvalid} from '../types/AriaInvalid'
import {computed, type MaybeRef, readonly, toRef, toValue} from 'vue'
import {useAriaInvalid} from './useAriaInvalid'
import {useStateClass} from './useStateClass'
import type {Size} from '../types/Size'
import type {ButtonVariant, ColorExtendables} from '../types/ColorTypes'
import {useButtonThemeClasses} from './useThemeClasses'
import type {ValidationState} from '../types/CommonTypes'

interface ClassesItemsInput {
  plain?: boolean
  button?: boolean
  hasDefaultSlot?: boolean
}

/**
 * Classes for the `.form-field` wrapper that lays out a check/radio/switch next to its label.
 * Button mode has no wrapper (the `<label class="btn btn-check">` is the root).
 */
const useFormCheckClasses = (items: MaybeRef<ClassesItemsInput>) => {
  const classes = computed(() => {
    const resolvedItems = toValue(items)
    return {
      'form-field': !resolvedItems.plain && !resolvedItems.button && resolvedItems.hasDefaultSlot,
    }
  })

  return {classes}
}

interface InputClassesItemsInput {
  type: 'check' | 'radio'
  plain?: boolean
  button?: boolean
  switch?: boolean
  size?: Size
  state?: ValidationState
}

/**
 * Classes for the `<input>`: `.check` / `.radio` (+ `check-sm` / `radio-lg`) live on the input itself.
 * A switch input carries no class: the visuals are on its `.switch` wrapper.
 */
const useFormCheckInputClasses = (items: MaybeRef<InputClassesItemsInput>) => {
  const resolvedItems = readonly(toRef(items))

  const {stateClass} = useStateClass(() => resolvedItems.value.state ?? null)

  const classes = computed(() => {
    const {type, plain, button, switch: isSwitch, size} = resolvedItems.value
    const styled = !plain && !button && !isSwitch
    return [
      stateClass.value,
      {
        [type]: styled,
        [`${type}-${size}`]: styled && size !== undefined,
      },
    ]
  })

  return {classes}
}

interface SwitchClassesItemsInput {
  size?: Size
}

/**
 * Classes for the `<div class="switch">` that wraps a switch input
 */
const useFormCheckSwitchClasses = (items: MaybeRef<SwitchClassesItemsInput>) => {
  const classes = computed(() => {
    const resolvedItems = toValue(items)
    return {
      switch: true,
      [`switch-${resolvedItems.size}`]: resolvedItems.size !== undefined,
    }
  })

  return {classes}
}

interface LabelClasesItemsInput {
  button?: boolean
  buttonVariant?: ButtonVariant | null
  buttonColor?: ColorExtendables
  size?: Size
}

/**
 * Classes for the button-mode `<label class="btn btn-check …">` that wraps the input.
 * Non-button labels carry no class in Bootstrap v6.
 */
const useFormCheckLabelClasses = (items: MaybeRef<LabelClasesItemsInput>) => {
  const {classes: buttonThemeClasses} = useButtonThemeClasses(
    computed(() => {
      const resolvedItems = toValue(items)
      return {
        variant: resolvedItems.buttonVariant,
        theme: resolvedItems.buttonColor?.theme,
        bg: resolvedItems.buttonColor?.bg,
        fg: resolvedItems.buttonColor?.fg,
      }
    })
  )

  const classes = computed(() => {
    const resolvedItems = toValue(items)
    if (resolvedItems.button !== true) return {}
    return {
      'btn': true,
      'btn-check': true,
      ...buttonThemeClasses.value,
      [`btn-${resolvedItems.size}`]: resolvedItems.size !== undefined,
    }
  })

  return {classes}
}

interface GroupAttrItemsInput {
  required?: boolean
  ariaInvalid?: AriaInvalid
  state?: ValidationState
}

const useFormCheckGroupAttr = (items: MaybeRef<GroupAttrItemsInput>) => {
  const resolvedItems = readonly(toRef(items))
  const {ariaInvalid: computedAriaInvalid} = useAriaInvalid(
    () => resolvedItems.value.ariaInvalid,
    () => resolvedItems.value.state
  )
  const attrs = computed(() => ({
    'aria-invalid': computedAriaInvalid.value as Exclude<AriaInvalid, ''> | undefined,
    'aria-required': resolvedItems.value.required === true ? true : undefined,
  }))

  return {attrs}
}

interface GroupClassesItemsInput {
  buttons?: boolean
  stacked?: boolean
  size?: Size
}

/**
 * Group root classes. Bootstrap v6 has no inline check modifier, so a non-stacked group of
 * `.form-field`s is laid out with flex utilities instead.
 */
const useFormCheckGroupClasses = (items: MaybeRef<GroupClassesItemsInput>) => {
  const classes = computed(() => {
    const resolvedItems = toValue(items)
    const buttons = resolvedItems.buttons === true
    const stacked = resolvedItems.stacked === true
    return {
      'btn-group': buttons && !stacked,
      'btn-group-vertical': buttons && stacked,
      [`btn-group-${resolvedItems.size}`]: resolvedItems.size !== undefined,
      'd-flex flex-wrap column-gap-5': !buttons && !stacked,
    }
  })

  return {classes}
}

export {
  useFormCheckClasses,
  useFormCheckInputClasses,
  useFormCheckSwitchClasses,
  useFormCheckLabelClasses,
  useFormCheckGroupAttr,
  useFormCheckGroupClasses,
}
