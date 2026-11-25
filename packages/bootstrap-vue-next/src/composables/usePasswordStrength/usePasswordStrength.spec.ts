import {describe, expect, it} from 'vitest'
import {computed, ref} from 'vue'
import {usePasswordStrength} from './index'
import type {PasswordStrengthOptions} from '../../types/PasswordStrength'

describe('usePasswordStrength', () => {
  it('scores an empty password as 0 with no strength', () => {
    const {score, strength} = usePasswordStrength('')
    expect(score.value).toBe(0)
    expect(strength.value).toBeNull()
  })

  it.each([
    ['abc', 1, 'weak'],
    ['abcdefgh', 2, 'weak'],
    ['abcdefgH', 3, 'fair'],
    ['abcdefgH1', 4, 'fair'],
    ['abcdefgH1!', 5, 'good'],
    ['abcdefgH1!!', 6, 'good'],
    ['abcdefgH1!!xyz', 7, 'strong'],
    ['abcdefgH1!!xyzabc', 8, 'strong'],
  ] as const)(
    'scores %s as %i (%s) like Bootstrap',
    (password, expectedScore, expectedStrength) => {
      const {score, strength} = usePasswordStrength(password)
      expect(score.value).toBe(expectedScore)
      expect(strength.value).toBe(expectedStrength)
    }
  )

  it('reacts to a ref password', () => {
    const password = ref('')
    const {strength} = usePasswordStrength(password)
    expect(strength.value).toBeNull()
    password.value = 'abcdefgH1!!xyz'
    expect(strength.value).toBe('strong')
  })

  it('accepts a getter password', () => {
    const source = ref({pw: 'a'})
    const {score} = usePasswordStrength(() => source.value.pw)
    expect(score.value).toBe(1)
    source.value = {pw: 'aB'}
    expect(score.value).toBe(2)
  })

  it('uses minLength', () => {
    const {score} = usePasswordStrength('abcd', {minLength: 4})
    expect(score.value).toBe(2)
  })

  it('merges weights with the defaults', () => {
    const {score} = usePasswordStrength('abc', {weights: {lowercase: 5}})
    expect(score.value).toBe(5)
  })

  it('merges partial thresholds with the defaults key by key', () => {
    // 'abc' scores 1 (lowercase): weak by default; with weak: 0 it falls to fair (default 4)
    expect(usePasswordStrength('abc', {thresholds: {weak: 0}}).strength.value).toBe('fair')
  })

  it('follows options given as a computed', async () => {
    const minLength = ref(8)
    const options = computed(() => ({minLength: minLength.value}))
    const {score} = usePasswordStrength('abcd', options)
    expect(score.value).toBe(1)
    minLength.value = 4
    expect(score.value).toBe(2)
  })

  it('uses thresholds', () => {
    const {strength} = usePasswordStrength('abc', {thresholds: {weak: 0, fair: 1, good: 2}})
    expect(strength.value).toBe('fair')
  })

  it('uses a custom scorer, but not for an empty password', () => {
    const options = ref<PasswordStrengthOptions>({scorer: () => 10})
    const password = ref('x')
    const {score, strength} = usePasswordStrength(password, options)
    expect(score.value).toBe(10)
    expect(strength.value).toBe('strong')
    password.value = ''
    expect(score.value).toBe(0)
  })

  it('reacts to options changes', () => {
    const options = ref<PasswordStrengthOptions>({})
    const {score} = usePasswordStrength('abc', options)
    expect(score.value).toBe(1)
    options.value = {weights: {lowercase: 3}}
    expect(score.value).toBe(3)
  })
})
