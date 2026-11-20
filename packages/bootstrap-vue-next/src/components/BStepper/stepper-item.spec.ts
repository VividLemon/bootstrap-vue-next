import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BStepperItem from './BStepperItem.vue'

describe('stepper-item', () => {
  enableAutoUnmount(afterEach)

  it('renders li.stepper-item with slot content', () => {
    const wrapper = mount(BStepperItem, {slots: {default: 'Step'}})
    expect(wrapper.element.tagName).toBe('LI')
    expect(wrapper.classes()).toEqual(['stepper-item'])
    expect(wrapper.text()).toBe('Step')
  })

  it('tag changes the element', () => {
    const wrapper = mount(BStepperItem, {props: {tag: 'div'}})
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('works without a parent stepper', () => {
    const wrapper = mount(BStepperItem)
    expect(wrapper.classes()).not.toContain('active')
    expect(wrapper.attributes('aria-current')).toBeUndefined()
  })

  it('active adds the active class', () => {
    const wrapper = mount(BStepperItem, {props: {active: true}})
    expect(wrapper.classes()).toContain('active')
  })

  it('current adds aria-current="step"', () => {
    const wrapper = mount(BStepperItem, {props: {current: true}})
    expect(wrapper.attributes('aria-current')).toBe('step')
  })

  it('color theme adds the theme class', () => {
    const wrapper = mount(BStepperItem, {props: {color: {theme: 'success'}}})
    expect(wrapper.classes()).toContain('theme-success')
  })

  it('passes attrs and classes to the root', () => {
    const wrapper = mount(BStepperItem, {attrs: {'class': 'foo', 'data-x': '1'}})
    expect(wrapper.classes()).toEqual(['stepper-item', 'foo'])
    expect(wrapper.attributes('data-x')).toBe('1')
  })

  describe('interactive', () => {
    it('button renders button.stepper-item with type button and emits click', async () => {
      const wrapper = mount(BStepperItem, {props: {button: true}})
      expect(wrapper.element.tagName).toBe('BUTTON')
      expect(wrapper.attributes('type')).toBe('button')
      expect(wrapper.classes()).toContain('stepper-item')
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('disabled button does not emit click', async () => {
      const wrapper = mount(BStepperItem, {props: {button: true, disabled: true}})
      expect(wrapper.attributes('disabled')).toBeDefined()
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('href renders a.stepper-item and emits click', async () => {
      const wrapper = mount(BStepperItem, {props: {href: '#step'}})
      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.attributes('href')).toBe('#step')
      expect(wrapper.classes()).toContain('stepper-item')
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('a plain item does not emit click', async () => {
      const wrapper = mount(BStepperItem)
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })
})
