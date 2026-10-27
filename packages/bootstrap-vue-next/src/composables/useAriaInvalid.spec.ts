import {describe, expect, it} from 'vitest'
import {ref} from 'vue'
import {useAriaInvalid} from './useAriaInvalid'

describe('useAriaInvalid', () => {
  it('returns "true" when ariaInvalid is true', () => {
    const {ariaInvalid: result} = useAriaInvalid(true, null)
    expect(result.value).toBe('true')
  })

  it('returns the string value when ariaInvalid is a string', () => {
    const {ariaInvalid: result} = useAriaInvalid('grammar', null)
    expect(result.value).toBe('grammar')
  })

  it('returns "true" when state is false and ariaInvalid is undefined', () => {
    const {ariaInvalid: result} = useAriaInvalid(undefined, false)
    expect(result.value).toBe('true')
  })

  it('returns "false" when ariaInvalid is explicitly false', () => {
    const {ariaInvalid: result} = useAriaInvalid(false, null)
    expect(result.value).toBe('false')
  })

  it('returns undefined when ariaInvalid is undefined and state is null', () => {
    const {ariaInvalid: result} = useAriaInvalid(undefined, null)
    expect(result.value).toBeUndefined()
  })

  it('returns undefined when ariaInvalid is undefined and state is true', () => {
    const {ariaInvalid: result} = useAriaInvalid(undefined, true)
    expect(result.value).toBeUndefined()
  })

  it('is reactive to ref changes', () => {
    const ariaInvalid = ref<boolean | string | undefined>(undefined)
    const state = ref<boolean | null>(null)

    const {ariaInvalid: result} = useAriaInvalid(ariaInvalid, state)
    expect(result.value).toBeUndefined()

    state.value = false
    expect(result.value).toBe('true')

    ariaInvalid.value = true
    expect(result.value).toBe('true')

    ariaInvalid.value = 'spelling'
    expect(result.value).toBe('spelling')
  })
})
