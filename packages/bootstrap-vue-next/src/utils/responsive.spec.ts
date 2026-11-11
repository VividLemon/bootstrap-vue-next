import {describe, expect, it} from 'vitest'
import {breakpointWidths, getResponsiveClasses} from './responsive'

describe('getResponsiveClasses', () => {
  it('returns an empty array for undefined or null', () => {
    expect(getResponsiveClasses(undefined, 'col')).toEqual([])
    expect(getResponsiveClasses(null, 'col')).toEqual([])
  })

  it('returns an empty array for an empty object', () => {
    expect(getResponsiveClasses({}, 'col')).toEqual([])
  })

  it('returns an empty array for non object values', () => {
    expect(getResponsiveClasses(6 as never, 'col')).toEqual([])
    expect(getResponsiveClasses('md' as never, 'col')).toEqual([])
  })

  it('renders xs without a prefix', () => {
    expect(getResponsiveClasses({xs: 12}, 'col')).toEqual(['col-12'])
  })

  it('renders breakpoints with a v6 prefix', () => {
    expect(getResponsiveClasses({xs: 12, md: 6}, 'col')).toEqual(['col-12', 'md:col-6'])
  })

  it('renders the 2xl prefix', () => {
    expect(getResponsiveClasses({'2xl': 4}, 'col')).toEqual(['2xl:col-4'])
  })

  it('renders true as the bare base class', () => {
    expect(getResponsiveClasses({xs: true, md: true}, 'col')).toEqual(['col', 'md:col'])
  })

  it('skips false, null, undefined and empty string values', () => {
    expect(
      getResponsiveClasses({xs: false, sm: null, md: undefined, lg: '', xl: 3}, 'col')
    ).toEqual(['xl:col-3'])
  })

  it('renders 0 values', () => {
    expect(getResponsiveClasses({xs: 0, md: 0}, 'gx')).toEqual(['gx-0', 'md:gx-0'])
  })

  it('renders string values', () => {
    expect(getResponsiveClasses({xs: 'auto', lg: 'first'}, 'order')).toEqual([
      'order-auto',
      'lg:order-first',
    ])
  })

  it('handles multi-part bases', () => {
    expect(getResponsiveClasses({md: 'between'}, 'justify-content')).toEqual([
      'md:justify-content-between',
    ])
  })

  it('outputs classes in breakpoint order regardless of key order', () => {
    expect(
      getResponsiveClasses({'2xl': 1, 'md': 2, 'xs': 3, 'sm': 4, 'xl': 5, 'lg': 6}, 'col')
    ).toEqual(['col-3', 'sm:col-4', 'md:col-2', 'lg:col-6', 'xl:col-5', '2xl:col-1'])
  })

  it('ignores unknown keys', () => {
    expect(getResponsiveClasses({xxl: 4, md: 6} as never, 'col')).toEqual(['md:col-6'])
  })
})

describe('breakpointWidths', () => {
  it('matches the Bootstrap v6 breakpoints', () => {
    expect(breakpointWidths).toEqual({
      'xs': 0,
      'sm': 576,
      'md': 768,
      'lg': 1024,
      'xl': 1280,
      '2xl': 1536,
    })
  })
})
