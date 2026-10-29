import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BDateRangePicker from './BDateRangePicker.vue'

describe('bDateRangePicker', () => {
  enableAutoUnmount(afterEach)

  it('renders with form-control class on the field', () => {
    const wrapper = mount(BDateRangePicker)
    const field = wrapper.find('.b-date-range-picker-field')
    expect(field.exists()).toBe(true)
    expect(field.classes()).toContain('form-control')
  })

  it('renders date range segments', () => {
    const wrapper = mount(BDateRangePicker)
    const segments = wrapper.findAll('.b-date-range-picker-segment, .b-date-range-picker-literal')
    expect(segments.length).toBeGreaterThan(0)
  })

  it('renders a separator between start and end segments', () => {
    const wrapper = mount(BDateRangePicker)
    const separator = wrapper.find('.b-date-range-picker-separator')
    expect(separator.exists()).toBe(true)
  })

  it('renders a trigger button', () => {
    const wrapper = mount(BDateRangePicker)
    const trigger = wrapper.find('.b-date-range-picker-trigger')
    expect(trigger.exists()).toBe(true)
  })

  it.each([
    {name: 'disabled', props: {disabled: true}, expectedClass: 'disabled'},
    {name: 'valid', props: {state: true}, expectedClass: 'is-valid'},
    {name: 'invalid', props: {state: false}, expectedClass: 'is-invalid'},
    {name: 'small', props: {size: 'sm'}, expectedClass: 'form-control-sm'},
    {name: 'large', props: {size: 'lg'}, expectedClass: 'form-control-lg'},
  ])('applies $expectedClass class for $name props', ({props, expectedClass}) => {
    const wrapper = mount(BDateRangePicker, {props})
    const field = wrapper.find('.b-date-range-picker-field')
    expect(field.classes()).toContain(expectedClass)
  })
})
