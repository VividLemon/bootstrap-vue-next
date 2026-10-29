import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BTimeField from './BTimeField.vue'

describe('bTimeField', () => {
  enableAutoUnmount(afterEach)

  it('renders with form-control class', () => {
    const wrapper = mount(BTimeField)
    expect(wrapper.classes()).toContain('form-control')
    expect(wrapper.classes()).toContain('b-time-field')
  })

  it('renders time segments', () => {
    const wrapper = mount(BTimeField)
    const segments = wrapper.findAll('.b-time-field-segment, .b-time-field-literal')
    expect(segments.length).toBeGreaterThan(0)
  })

  it.each([
    {name: 'disabled', props: {disabled: true}, expectedClass: 'disabled'},
    {name: 'readonly', props: {readonly: true}, expectedClass: 'readonly'},
    {name: 'valid', props: {state: true}, expectedClass: 'is-valid'},
    {name: 'invalid', props: {state: false}, expectedClass: 'is-invalid'},
  ])('applies $expectedClass class for $name state', ({props, expectedClass}) => {
    const wrapper = mount(BTimeField, {props})
    expect(wrapper.classes()).toContain(expectedClass)
  })

  it.each([
    {name: 'small', size: 'sm', expectedClass: 'form-control-sm'},
    {name: 'large', size: 'lg', expectedClass: 'form-control-lg'},
    {name: 'undefined', size: undefined, expectedClass: undefined},
  ])('handles $name size', ({size, expectedClass}) => {
    const wrapper = mount(BTimeField, {props: {size}})
    for (const sizeClass of ['form-control-sm', 'form-control-lg']) {
      expect(wrapper.classes().includes(sizeClass)).toBe(sizeClass === expectedClass)
    }
  })

  it('passes id prop to the underlying TimeFieldRoot', () => {
    const wrapper = mount(BTimeField, {
      props: {id: 'my-time-field'},
    })
    expect(wrapper.html()).toContain('my-time-field')
  })

  it('passes disabled attribute to root element', () => {
    const wrapper = mount(BTimeField, {
      props: {disabled: true},
    })
    expect(wrapper.attributes('data-disabled')).toBeDefined()
  })

  it('passes readonly attribute to root element', () => {
    const wrapper = mount(BTimeField, {
      props: {readonly: true},
    })
    expect(wrapper.attributes('data-readonly')).toBeDefined()
  })
})
