import {describe, expect, it} from 'vitest'
import {ref} from 'vue'
import {getButtonThemeClasses, useThemeClasses} from './useThemeClasses'

describe('useThemeClasses', () => {
  it('returns class for theme', () => {
    const result = useThemeClasses({theme: 'primary'})
    expect(result.value['theme-primary']).toBe(true)
    expect(result.value['bg-undefined']).toBe(false)
  })

  it('returns class for bg', () => {
    const result = useThemeClasses({bg: 'subtle-danger'})
    expect(result.value['bg-subtle-danger']).toBe(true)
  })

  it('returns class for fg', () => {
    const result = useThemeClasses({fg: 'emphasis-success'})
    expect(result.value['fg-emphasis-success']).toBe(true)
  })

  it('returns class for border', () => {
    const result = useThemeClasses({border: 'warning'})
    expect(result.value['border-warning']).toBe(true)
  })

  it('returns layer colors', () => {
    const result = useThemeClasses({bg: '2', fg: 'body', border: 'emphasized'})
    expect(result.value['bg-2']).toBe(true)
    expect(result.value['fg-body']).toBe(true)
    expect(result.value['border-emphasized']).toBe(true)
  })

  it('returns all false classes when all values are null', () => {
    const result = useThemeClasses({theme: null, bg: null, fg: null, border: null})
    expect(Object.values(result.value).every((v) => v === false)).toBe(true)
  })

  it('is reactive', () => {
    const theme = ref<'primary' | 'danger'>('primary')
    const result = useThemeClasses(() => ({theme: theme.value}))
    expect(result.value['theme-primary']).toBe(true)
    theme.value = 'danger'
    expect(result.value['theme-danger']).toBe(true)
  })
})

describe('getButtonThemeClasses', () => {
  it('returns variant and theme classes', () => {
    expect(getButtonThemeClasses('outline', 'danger')).toEqual({
      'btn-outline': true,
      'theme-danger': true,
    })
  })

  it('omits null values', () => {
    const result = getButtonThemeClasses(null, null)
    expect(Object.values(result).every((v) => v === false)).toBe(true)
  })
})
