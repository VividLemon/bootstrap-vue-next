import {describe, expect, it} from 'vitest'
import {
  escapeRegExp,
  escapeRegExpChars,
  startCase,
  titleCase,
  toPascalCase,
  upperFirst,
} from './stringUtils'

describe('stringUtils', () => {
  describe('startCase', () => {
    it.each([
      {input: 'helloWorld', expected: 'Hello World', description: 'camelCase'},
      {input: 'hello_world', expected: 'Hello world', description: 'snake_case'},
      {input: 'hello', expected: 'Hello', description: 'a single word'},
      {input: '', expected: '', description: 'an empty string'},
      {input: 'hello world foo', expected: 'Hello world foo', description: 'only the first word'},
    ])('converts $description to start case', ({input, expected}) => {
      expect(startCase(input)).toBe(expected)
    })
  })

  describe('titleCase', () => {
    it.each([
      {input: 'helloWorld', expected: 'Hello World', description: 'camelCase'},
      {input: 'hello_world', expected: 'Hello World', description: 'snake_case'},
      {input: 'hello world foo', expected: 'Hello World Foo', description: 'multiple words'},
      {input: 'hello', expected: 'Hello', description: 'a single word'},
      {input: '', expected: '', description: 'an empty string'},
    ])('converts $description to title case', ({input, expected}) => {
      expect(titleCase(input)).toBe(expected)
    })
  })

  describe('upperFirst', () => {
    it.each([
      {input: 'hello', expected: 'Hello', description: 'a lowercase word'},
      {input: 'Hello', expected: 'Hello', description: 'an already capitalized word'},
      {input: '', expected: '', description: 'an empty string'},
      {input: '  hello', expected: 'Hello', description: 'leading whitespace'},
      {input: 'a', expected: 'A', description: 'a single character'},
    ])('handles $description', ({input, expected}) => {
      expect(upperFirst(input)).toBe(expected)
    })
  })

  describe('escapeRegExp', () => {
    it.each([
      {input: 'hello.world', expected: 'hello\\.world', description: 'a period'},
      {input: '[test]', expected: '\\[test\\]', description: 'brackets'},
      {input: 'a*b+c?d', expected: 'a\\*b\\+c\\?d', description: 'multiple special characters'},
      {input: 'hello', expected: 'hello', description: 'a plain string'},
      {input: '', expected: '', description: 'an empty string'},
    ])('escapes regex input containing $description', ({input, expected}) => {
      expect(escapeRegExp(input)).toBe(expected)
    })
  })

  describe('escapeRegExpChars', () => {
    it.each([
      {input: 'hello world', expected: 'hello\\sworld', description: 'a single space'},
      {input: 'hello   world', expected: 'hello\\sworld', description: 'multiple spaces'},
      {input: 'a.b c', expected: 'a\\.b\\sc', description: 'regex characters and spaces'},
    ])('escapes $description', ({input, expected}) => {
      expect(escapeRegExpChars(input)).toBe(expected)
    })
  })

  describe('toPascalCase', () => {
    it.each([
      {input: 'hello-world', expected: 'HelloWorld', description: 'kebab-case'},
      {input: 'hello', expected: 'Hello', description: 'a single word'},
      {input: 'HelloWorld', expected: 'HelloWorld', description: 'already PascalCase'},
      {
        input: 'my-component-name',
        expected: 'MyComponentName',
        description: 'multi-segment kebab-case',
      },
      {input: '', expected: '', description: 'an empty string'},
    ])('handles $description input', ({input, expected}) => {
      expect(toPascalCase(input)).toBe(expected)
    })
  })
})
