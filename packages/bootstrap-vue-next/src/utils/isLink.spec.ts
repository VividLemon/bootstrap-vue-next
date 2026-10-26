import {describe, expect, it} from 'vitest'
import {isLink} from './isLink'

describe('isLink', () => {
  it.each([
    {options: {href: '/path'}, description: 'href'},
    {options: {to: '/route'}, description: 'string to'},
    {options: {to: {name: 'home'}}, description: 'object to'},
    {options: {href: '/path', to: '/route'}, description: 'href and to'},
  ])('returns true when $description is provided', ({options}) => {
    expect(isLink(options)).toBe(true)
  })

  it('returns false when neither href nor to is provided', () => {
    expect(isLink({})).toBe(false)
  })

  it('returns false when href is empty string', () => {
    expect(isLink({href: ''})).toBe(false)
  })
})
