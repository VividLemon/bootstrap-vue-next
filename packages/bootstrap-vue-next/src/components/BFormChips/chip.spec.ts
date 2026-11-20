import {afterEach, describe, expect, it} from 'vitest'
import {enableAutoUnmount, mount} from '@vue/test-utils'
import BChip from './BChip.vue'
import {chipInputKey} from '../../utils/keys'

describe('chip', () => {
  enableAutoUnmount(afterEach)

  it('renders a span.chip with the default slot', () => {
    const wrapper = mount(BChip, {slots: {default: 'React'}})
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toEqual(['chip'])
    expect(wrapper.text()).toBe('React')
  })

  it('falls back to value for the text and sets data-bs-chip-value', () => {
    const wrapper = mount(BChip, {props: {value: 'Vue'}})
    expect(wrapper.text()).toBe('Vue')
    expect(wrapper.attributes('data-bs-chip-value')).toBe('Vue')
  })

  it('uses the tag prop', () => {
    const wrapper = mount(BChip, {props: {tag: 'button'}})
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('adds active, disabled and color classes', () => {
    const wrapper = mount(BChip, {
      props: {active: true, disabled: true, color: {theme: 'success'}},
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['chip', 'active', 'disabled', 'theme-success'])
    )
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('renders the icon and img slots in their v6 wrappers', () => {
    const wrapper = mount(BChip, {slots: {icon: '<svg />', img: '<img src="a.png" alt="" />'}})
    expect(wrapper.find('.chip-icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.chip-icon svg').exists()).toBe(true)
    expect(wrapper.find('.chip-img img').exists()).toBe(true)
    expect(wrapper.element.firstElementChild?.className).toBe('chip-img')
  })

  it('is not dismissible by default', () => {
    const wrapper = mount(BChip)
    expect(wrapper.find('.chip-dismiss').exists()).toBe(false)
  })

  it('renders a dismiss button that emits remove', async () => {
    const wrapper = mount(BChip, {props: {dismissible: true, value: 'x', dismissLabel: 'Delete x'}})
    const button = wrapper.find('button.chip-dismiss')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('Delete x')
    expect(button.attributes('tabindex')).toBeUndefined()
    expect(button.find('svg').exists()).toBe(true)
    await button.trigger('click')
    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe('x')
  })

  it('uses the dismiss-icon slot', () => {
    const wrapper = mount(BChip, {
      props: {dismissible: true},
      slots: {'dismiss-icon': '<i class="my-x" />'},
    })
    expect(wrapper.find('.chip-dismiss .my-x').exists()).toBe(true)
  })

  it('does not emit remove while disabled', async () => {
    const wrapper = mount(BChip, {props: {dismissible: true, disabled: true}})
    await wrapper.find('.chip-dismiss').trigger('click')
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('takes the dismiss button out of the tab order inside a chip input', () => {
    const wrapper = mount(BChip, {
      props: {dismissible: true},
      global: {provide: {[chipInputKey as unknown as symbol]: true}},
    })
    expect(wrapper.find('.chip-dismiss').attributes('tabindex')).toBe('-1')
  })
})
