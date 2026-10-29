import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BDateField from './BDateField.vue'

describe('bDateField', () => {
  enableAutoUnmount(afterEach)

  it('renders with form-control class', () => {
    const wrapper = mount(BDateField)
    expect(wrapper.classes()).toContain('form-control')
    expect(wrapper.classes()).toContain('b-date-field')
  })

  it('renders date segments', () => {
    const wrapper = mount(BDateField)
    const segments = wrapper.findAll('.b-date-field-segment, .b-date-field-literal')
    expect(segments.length).toBeGreaterThan(0)
  })

  it.each([
    {name: 'disabled', props: {disabled: true}, expectedClass: 'disabled'},
    {name: 'readonly', props: {readonly: true}, expectedClass: 'readonly'},
    {name: 'valid', props: {state: true}, expectedClass: 'is-valid'},
    {name: 'invalid', props: {state: false}, expectedClass: 'is-invalid'},
  ])('applies $expectedClass class for $name state', ({props, expectedClass}) => {
    const wrapper = mount(BDateField, {props})
    expect(wrapper.classes()).toContain(expectedClass)
  })

  it.each([
    {name: 'small', size: 'sm', expectedClass: 'form-control-sm'},
    {name: 'large', size: 'lg', expectedClass: 'form-control-lg'},
    {name: 'undefined', size: undefined, expectedClass: undefined},
  ])('handles $name size', ({size, expectedClass}) => {
    const wrapper = mount(BDateField, {props: {size}})
    for (const sizeClass of ['form-control-sm', 'form-control-lg']) {
      expect(wrapper.classes().includes(sizeClass)).toBe(sizeClass === expectedClass)
    }
  })

  it('passes id prop to the underlying DateFieldRoot', () => {
    const wrapper = mount(BDateField, {
      props: {id: 'my-date-field'},
    })
    expect(wrapper.html()).toContain('my-date-field')
  })

  it('passes disabled attribute to root element', () => {
    const wrapper = mount(BDateField, {
      props: {disabled: true},
    })
    expect(wrapper.attributes('data-disabled')).toBeDefined()
  })

  it('passes readonly attribute to root element', () => {
    const wrapper = mount(BDateField, {
      props: {readonly: true},
    })
    expect(wrapper.attributes('data-readonly')).toBeDefined()
  })
})
