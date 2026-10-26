import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BDatePicker from './BDatePicker.vue'

describe('bDatePicker', () => {
  enableAutoUnmount(afterEach)

  it('renders with form-control class on the field', () => {
    const wrapper = mount(BDatePicker)
    const field = wrapper.find('.b-date-picker-field')
    expect(field.exists()).toBe(true)
    expect(field.classes()).toContain('form-control')
  })

  it('renders date segments', () => {
    const wrapper = mount(BDatePicker)
    const segments = wrapper.findAll('.b-date-picker-segment, .b-date-picker-literal')
    expect(segments.length).toBeGreaterThan(0)
  })

  it('renders a trigger button', () => {
    const wrapper = mount(BDatePicker)
    const trigger = wrapper.find('.b-date-picker-trigger')
    expect(trigger.exists()).toBe(true)
  })

  it.each([
    {name: 'disabled', props: {disabled: true}, expectedClass: 'disabled'},
    {name: 'valid', props: {state: true}, expectedClass: 'is-valid'},
    {name: 'invalid', props: {state: false}, expectedClass: 'is-invalid'},
    {name: 'small', props: {size: 'sm'}, expectedClass: 'form-control-sm'},
    {name: 'large', props: {size: 'lg'}, expectedClass: 'form-control-lg'},
  ])('applies $expectedClass class for $name props', ({props, expectedClass}) => {
    const wrapper = mount(BDatePicker, {props})
    const field = wrapper.find('.b-date-picker-field')
    expect(field.classes()).toContain(expectedClass)
  })
})
