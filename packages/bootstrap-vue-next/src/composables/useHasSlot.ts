import {onBeforeUpdate, readonly, type Ref, ref} from 'vue'

/**
 * Whether the parent passed the slot `name`, as a ref, for script code that depends on it (a
 * `computed` such as a class list). In a template, check `slots.name` directly instead: the
 * template runs on every render, so it is always current and needs no helper.
 *
 * Slots are not reactive, so a `computed(() => !!slots.name)` would never update when the parent
 * adds or removes the slot. This keeps the answer in a ref refreshed before every update (the
 * parent's change re-renders this component), so computeds reading it follow. It checks presence
 * only and never calls the slot: leave a slot out with `<template v-if="…" #name>`.
 */
export const useHasSlot = <S extends object>(
  slots: Readonly<S>,
  name: keyof S & string
): Readonly<Ref<boolean>> => {
  const isPassed = () => (slots as Readonly<Record<string, unknown>>)[name] !== undefined
  const has = ref(isPassed())
  onBeforeUpdate(() => {
    has.value = isPassed()
  })
  return readonly(has)
}
