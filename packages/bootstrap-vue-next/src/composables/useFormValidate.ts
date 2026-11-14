import {computed, type ComputedRef, type MaybeRefOrGetter, toValue} from 'vue'
import type {FormValidate} from '../types/CommonTypes'

export interface UseFormValidateReturn {
  /**
   * The value of Bootstrap's `data-bs-validate` attribute: `''` for `true`, `'valid'` for `'valid'`,
   * `undefined` (attribute not rendered) otherwise
   */
  validateAttr: ComputedRef<'' | 'valid' | undefined>
}

/**
 * Resolves a form's `validate` prop to the value of Bootstrap's `data-bs-validate` attribute.
 * The attribute opts a form in to `:user-invalid` styling, and `="valid"` also shows `:user-valid`.
 *
 * @internal
 */
export const useFormValidate = (
  validate: MaybeRefOrGetter<FormValidate | undefined>
): UseFormValidateReturn => {
  const validateAttr = computed(() => {
    const value = toValue(validate)
    return value === 'valid' ? 'valid' : value === true ? '' : undefined
  })

  return {validateAttr}
}
