import {computed, type ComputedRef, type MaybeRefOrGetter, toValue} from 'vue'
import type {FormValidate} from '../types/CommonTypes'

/**
 * Resolves a `validate` prop to the value of Bootstrap's `data-bs-validate` attribute.
 * The attribute opts a form in to `:user-invalid` styling, and `="valid"` also shows `:user-valid`.
 *
 * `true` → `''`, `'valid'` → `'valid'`, `false` / `undefined` → `undefined` (attribute not rendered)
 *
 * @internal
 */
export const useFormValidate = (
  validate: MaybeRefOrGetter<FormValidate | undefined>
): ComputedRef<'' | 'valid' | undefined> =>
  computed(() => {
    const value = toValue(validate)
    return value === 'valid' ? 'valid' : value === true ? '' : undefined
  })
