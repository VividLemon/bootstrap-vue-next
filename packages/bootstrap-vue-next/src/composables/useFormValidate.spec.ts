import {describe, expect, it} from 'vitest'
import {ref} from 'vue'
import {useFormValidate} from './useFormValidate'

describe('useFormValidate', () => {
  it('maps true to an empty attribute value', () => {
    expect(useFormValidate(true).value).toBe('')
  })

  it("maps 'valid' to 'valid'", () => {
    expect(useFormValidate('valid').value).toBe('valid')
  })

  it('omits the attribute for false and undefined', () => {
    expect(useFormValidate(false).value).toBeUndefined()
    expect(useFormValidate(undefined).value).toBeUndefined()
  })

  it('follows a ref', () => {
    const validate = ref<boolean | 'valid'>(false)
    const result = useFormValidate(validate)
    expect(result.value).toBeUndefined()
    validate.value = 'valid'
    expect(result.value).toBe('valid')
  })
})
