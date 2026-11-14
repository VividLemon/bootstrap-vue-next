import {describe, expect, it} from 'vitest'
import {ref} from 'vue'
import {useFormValidate} from './useFormValidate'

describe('useFormValidate', () => {
  it('maps true to an empty attribute value', () => {
    expect(useFormValidate(true).validateAttr.value).toBe('')
  })

  it("maps 'valid' to 'valid'", () => {
    expect(useFormValidate('valid').validateAttr.value).toBe('valid')
  })

  it('omits the attribute for false and undefined', () => {
    expect(useFormValidate(false).validateAttr.value).toBeUndefined()
    expect(useFormValidate(undefined).validateAttr.value).toBeUndefined()
  })

  it('follows a ref', () => {
    const validate = ref<boolean | 'valid'>(false)
    const {validateAttr} = useFormValidate(validate)
    expect(validateAttr.value).toBeUndefined()
    validate.value = 'valid'
    expect(validateAttr.value).toBe('valid')
  })
})
