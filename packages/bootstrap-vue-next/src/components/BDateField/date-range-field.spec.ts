import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BDateRangeField from './BDateRangeField.vue'

describe('bDateRangeField', () => {
  enableAutoUnmount(afterEach)

  it('renders with form-control class', () => {
    const wrapper = mount(BDateRangeField)
    expect(wrapper.classes()).toContain('form-control')
    expect(wrapper.classes()).toContain('b-date-range-field')
  })

  it('renders date range segments', () => {
    const wrapper = mount(BDateRangeField)
    const segments = wrapper.findAll('.b-date-range-field-segment, .b-date-range-field-literal')
    expect(segments.length).toBeGreaterThan(0)
  })

  it('renders a separator between start and end segments', () => {
    const wrapper = mount(BDateRangeField)
    const separator = wrapper.find('.b-date-range-field-separator')
    expect(separator.exists()).toBe(true)
  })

  it.each([
    {name: 'disabled', props: {disabled: true}, expectedClass: 'disabled'},
    {name: 'readonly', props: {readonly: true}, expectedClass: 'readonly'},
    {name: 'valid', props: {state: true}, expectedClass: 'is-valid'},
    {name: 'invalid', props: {state: false}, expectedClass: 'is-invalid'},
  ])('applies $expectedClass class for $name state', ({props, expectedClass}) => {
    const wrapper = mount(BDateRangeField, {props})
    expect(wrapper.classes()).toContain(expectedClass)
  })

  it.each([
    {name: 'small', size: 'sm', expectedClass: 'form-control-sm'},
    {name: 'large', size: 'lg', expectedClass: 'form-control-lg'},
    {name: 'undefined', size: undefined, expectedClass: undefined},
  ])('handles $name size', ({size, expectedClass}) => {
    const wrapper = mount(BDateRangeField, {props: {size}})
    for (const sizeClass of ['form-control-sm', 'form-control-lg']) {
      expect(wrapper.classes().includes(sizeClass)).toBe(sizeClass === expectedClass)
    }
  })

  it('passes id prop to the underlying DateRangeFieldRoot', () => {
    const wrapper = mount(BDateRangeField, {
      props: {id: 'my-date-range-field'},
    })
    expect(wrapper.html()).toContain('my-date-range-field')
  })

  it('passes disabled attribute to root element', () => {
    const wrapper = mount(BDateRangeField, {
      props: {disabled: true},
    })
    expect(wrapper.attributes('data-disabled')).toBeDefined()
  })

  it('passes readonly attribute to root element', () => {
    const wrapper = mount(BDateRangeField, {
      props: {readonly: true},
    })
    expect(wrapper.attributes('data-readonly')).toBeDefined()
  })
})
