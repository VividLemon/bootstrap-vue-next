import type {AriaInvalid} from '../types/AriaInvalid'
import {computed, type MaybeRef, readonly, toRef, toValue} from 'vue'
import {useAriaInvalid} from './useAriaInvalid'
import {useStateClass} from './useStateClass'
import type {Size} from '../types/Size'
import type {BgColor, ButtonVariant, FgColor, MaybeArray, ThemeProp} from '../types/ColorTypes'
import {useButtonThemeClasses} from './useThemeClasses'
import type {ValidationState} from '../types/CommonTypes'

interface ClassesItemsInput {
  plain?: boolean
  button?: boolean
  inline?: boolean
  reverse?: boolean
  switch?: boolean
  size?: Size
  hasDefaultSlot?: boolean
}

const useFormCheckClasses = (items: MaybeRef<ClassesItemsInput>) => {
  const classes = computed(() => {
    const resolvedItems = toValue(items)
    return {
      'form-check': !resolvedItems.plain && !resolvedItems.button && resolvedItems.hasDefaultSlot,
      'form-check-reverse': resolvedItems.reverse === true,
      'form-check-inline': resolvedItems.inline === true,
      'form-switch': resolvedItems.switch === true,
      [`form-control-${resolvedItems.size}`]:
        resolvedItems.size !== undefined && !resolvedItems.button,
    }
  })

  return {classes}
}

interface InputClassesItemsInput {
  plain?: boolean
  button?: boolean
  state?: ValidationState
}

const useFormCheckInputClasses = (items: MaybeRef<InputClassesItemsInput>) => {
  const resolvedItems = readonly(toRef(items))

  const {stateClass} = useStateClass(() => resolvedItems.value.state ?? null)

  const classes = computed(() => [
    stateClass.value,
    {
      'form-check-input': !resolvedItems.value.plain && !resolvedItems.value.button,
      'btn-check': resolvedItems.value.button === true,
    },
  ])

  return {classes}
}

interface LabelClasesItemsInput {
  plain?: boolean
  button?: boolean
  buttonVariant?: ButtonVariant | null
  buttonTheme?: ThemeProp | null
  buttonBg?: MaybeArray<BgColor> | null
  buttonFg?: MaybeArray<FgColor> | null
  size?: Size
}

const useFormCheckLabelClasses = (items: MaybeRef<LabelClasesItemsInput>) => {
  const {classes: buttonThemeClasses} = useButtonThemeClasses(
    computed(() => {
      const resolvedItems = toValue(items)
      return {
        variant: resolvedItems.buttonVariant,
        theme: resolvedItems.buttonTheme,
        bg: resolvedItems.buttonBg,
        fg: resolvedItems.buttonFg,
      }
    })
  )

  const classes = computed(() => {
    const resolvedItems = toValue(items)
    return {
      'form-check-label': !resolvedItems.plain && !resolvedItems.button,
      'btn': resolvedItems.button === true,
      ...(resolvedItems.button === true ? buttonThemeClasses.value : {}),
      [`btn-${resolvedItems.size}`]: resolvedItems.button && resolvedItems.size !== undefined,
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
  validated?: boolean
  buttons?: boolean
  stacked?: boolean
  size?: Size
}

const useFormCheckGroupClasses = (items: MaybeRef<GroupClassesItemsInput>) => {
  const classes = computed(() => {
    const resolvedItems = toValue(items)
    return {
      'was-validated': resolvedItems.validated === true,
      'btn-group': resolvedItems.buttons === true && resolvedItems.stacked === false,
      'btn-group-vertical': resolvedItems.stacked === true && resolvedItems.buttons === true,
      [`btn-group-${resolvedItems.size}`]: resolvedItems.size !== undefined,
    }
  })

  return {classes}
}

export {
  useFormCheckClasses,
  useFormCheckInputClasses,
  useFormCheckLabelClasses,
  useFormCheckGroupAttr,
  useFormCheckGroupClasses,
}
