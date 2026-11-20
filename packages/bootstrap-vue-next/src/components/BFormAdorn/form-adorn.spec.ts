import {afterEach, describe, expect, it} from 'vitest'
import {enableAutoUnmount, mount} from '@vue/test-utils'
import {h} from 'vue'
import BFormAdorn from './BFormAdorn.vue'
import BFormInput from '../BFormInput/BFormInput.vue'

describe('form-adorn', () => {
  enableAutoUnmount(afterEach)

  it('renders a label.form-control.form-adorn by default', () => {
    const wrapper = mount(BFormAdorn)
    expect(wrapper.element.tagName).toBe('LABEL')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['form-control', 'form-adorn']))
    expect(wrapper.classes()).not.toContain('form-adorn-end')
  })

  it('uses the tag prop', () => {
    const wrapper = mount(BFormAdorn, {props: {tag: 'div'}})
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('adds form-control-{size}', () => {
    const wrapper = mount(BFormAdorn, {props: {size: 'sm'}})
    expect(wrapper.classes()).toContain('form-control-sm')
  })

  it('renders BFormInput as a .form-ghost without .form-control or size classes', () => {
    const wrapper = mount(BFormAdorn, {
      slots: {default: () => h(BFormInput, {size: 'lg', state: false})},
    })
    const input = wrapper.find('input')
    expect(input.classes()).toContain('form-ghost')
    expect(input.classes()).toContain('is-invalid')
    expect(input.classes()).not.toContain('form-control')
    expect(input.classes()).not.toContain('form-control-lg')
  })

  it('wraps the start slot in an aria-hidden .form-adorn-icon before the control', () => {
    const wrapper = mount(BFormAdorn, {
      slots: {start: () => h('svg', {class: 'icon'}), default: () => h(BFormInput)},
    })
    const children = wrapper.element.children
    expect(children[0]?.classList.contains('form-adorn-icon')).toBe(true)
    expect(children[0]?.getAttribute('aria-hidden')).toBe('true')
    expect(children[0]?.querySelector('svg.icon')).not.toBeNull()
    expect(children[1]?.tagName).toBe('INPUT')
    expect(wrapper.classes()).not.toContain('form-adorn-end')
  })

  it('renders startText / endText as .form-adorn-text', () => {
    const wrapper = mount(BFormAdorn, {
      props: {startText: '$', endText: 'USD'},
      slots: {default: () => h(BFormInput)},
    })
    const children = wrapper.element.children
    expect(children[0]?.className).toBe('form-adorn-text')
    expect(children[0]?.textContent).toBe('$')
    expect(children[1]?.tagName).toBe('INPUT')
    expect(children[2]?.className).toBe('form-adorn-text')
    expect(children[2]?.textContent).toBe('USD')
    expect(children[2]?.getAttribute('aria-hidden')).toBe('true')
    expect(wrapper.classes()).not.toContain('form-adorn-end')
  })

  it('puts an end-only adornment first in the DOM with .form-adorn-end', () => {
    const wrapper = mount(BFormAdorn, {
      props: {endText: '@example.com'},
      slots: {default: () => h(BFormInput)},
    })
    expect(wrapper.classes()).toContain('form-adorn-end')
    const children = wrapper.element.children
    expect(children[0]?.textContent).toBe('@example.com')
    expect(children[1]?.tagName).toBe('INPUT')
  })

  it('prefers the slot over the text prop', () => {
    const wrapper = mount(BFormAdorn, {
      props: {startText: 'text'},
      slots: {start: () => 'icon'},
    })
    expect(wrapper.find('.form-adorn-icon').text()).toBe('icon')
    expect(wrapper.find('.form-adorn-text').exists()).toBe(false)
  })
})
