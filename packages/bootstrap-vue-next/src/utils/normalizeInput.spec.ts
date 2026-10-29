import {describe, expect, it} from 'vitest'
import {normalizeInput} from './normalizeInput'

describe('normalizeInput', () => {
  it('returns undefined for null value', () => {
    expect(
      normalizeInput(null, {number: undefined, lazy: undefined, trim: undefined})
    ).toBeUndefined()
  })

  it('returns string value as-is without modifiers', () => {
    expect(normalizeInput('hello', {number: undefined, lazy: undefined, trim: undefined})).toBe(
      'hello'
    )
  })

  it.each([
    {input: '42', expected: 42, description: 'numeric string'},
    {input: '3.14', expected: 3.14, description: 'float string'},
    {input: 'abc', expected: 'abc', description: 'unparseable string'},
    {input: '', expected: '', description: 'empty string'},
  ])('normalizes $description with the number modifier', ({input, expected}) => {
    expect(normalizeInput(input, {number: true, lazy: undefined, trim: undefined})).toBe(expected)
  })

  it('returns number value as-is', () => {
    expect(normalizeInput(99, {number: undefined, lazy: undefined, trim: undefined})).toBe(99)
  })

  it('handles number modifier with numeric value', () => {
    expect(normalizeInput(5, {number: true, lazy: undefined, trim: undefined})).toBe(5)
  })
})
