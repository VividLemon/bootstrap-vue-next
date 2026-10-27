import {describe, expect, it} from 'vitest'
import {ref} from 'vue'
import {getButtonThemeClasses, useThemeClasses} from './useThemeClasses'

describe('useThemeClasses', () => {
  it('returns class for theme', () => {
    const {classes} = useThemeClasses({theme: 'primary'})
    expect(classes.value['theme-primary']).toBe(true)
    expect(classes.value['bg-undefined']).toBe(false)
  })

  it.each([
    {prop: 'bg', value: 'subtle-danger', className: 'bg-subtle-danger'},
    {prop: 'fg', value: 'emphasis-success', className: 'fg-emphasis-success'},
    {prop: 'border', value: 'warning', className: 'border-warning'},
  ])('returns $className for $prop=$value', ({prop, value, className}) => {
    const {classes} = useThemeClasses({[prop]: value})
    expect(classes.value[className]).toBe(true)
  })

  it('returns layer colors', () => {
    const {classes} = useThemeClasses({bg: '2', fg: 'body', border: 'emphasized'})
    expect(classes.value['bg-2']).toBe(true)
    expect(classes.value['fg-body']).toBe(true)
    expect(classes.value['border-emphasized']).toBe(true)
  })

  it('returns color opacity utilities', () => {
    const {classes} = useThemeClasses({bg: 70, fg: '50', border: 30})
    expect(classes.value['bg-70']).toBe(true)
    expect(classes.value['fg-50']).toBe(true)
    expect(classes.value['border-30']).toBe(true)
  })

  it('returns all false classes when all values are null', () => {
    const {classes} = useThemeClasses({theme: null, bg: null, fg: null, border: null})
    expect(Object.values(classes.value).every((v) => v === false)).toBe(true)
  })

  it('is reactive', () => {
    const theme = ref<'primary' | 'danger'>('primary')
    const {classes} = useThemeClasses(() => ({theme: theme.value}))
    expect(classes.value['theme-primary']).toBe(true)
    theme.value = 'danger'
    expect(classes.value['theme-danger']).toBe(true)
  })
})

describe('getButtonThemeClasses', () => {
  it('returns variant and theme classes', () => {
    expect(getButtonThemeClasses('outline', 'danger')).toEqual({
      'btn-outline': true,
      'theme-danger': true,
      'bg-undefined': false,
      'fg-undefined': false,
      'btn-styled': false,
    })
  })

  it('omits null values', () => {
    const result = getButtonThemeClasses(null, null)
    expect(Object.values(result).every((v) => v === false)).toBe(true)
  })

  it('returns background, foreground, and styled button classes', () => {
    expect(
      getButtonThemeClasses('solid', 'primary', 'subtle-primary', 'emphasis-primary', true)
    ).toEqual({
      'btn-solid': true,
      'theme-primary': true,
      'bg-subtle-primary': true,
      'fg-emphasis-primary': true,
      'btn-styled': true,
    })
  })
})
