import {onBeforeUpdate, readonly, type Ref, ref} from 'vue'

/**
 * Whether the parent passed the slot `name`. Use it to skip a slot's wrapper element when the
 * slot is not given.
 *
 * It checks presence only and never calls the slot, so it renders nothing extra, needs no slot
 * scope, and is not fooled by a slot whose content is all `v-if`'d away (that is the parent's
 * call: `<template v-if="…" #name>` leaves the slot out). Slots are not reactive, so the value is
 * kept in a ref, refreshed before every update: a parent that adds or removes a slot re-renders
 * this component, and computeds reading the ref follow.
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
