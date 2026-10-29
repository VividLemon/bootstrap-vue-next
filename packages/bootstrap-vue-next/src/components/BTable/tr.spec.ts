import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BTr from './BTr.vue'

describe('tr', () => {
  enableAutoUnmount(afterEach)

  it('renders a tr element', () => {
    const wrapper = mount(BTr)
    expect(wrapper.element.tagName).toBe('TR')
  })

  it('renders default slot content', () => {
    const wrapper = mount(BTr, {
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders HTML slot content', () => {
    const wrapper = mount(BTr, {
      slots: {default: '<td>cell content</td>'},
    })
    expect(wrapper.find('td').exists()).toBe(true)
    expect(wrapper.find('td').text()).toBe('cell content')
  })

  it('renders empty when no slot is provided', () => {
    const wrapper = mount(BTr)
    expect(wrapper.text()).toBe('')
  })

  it('has class theme-{type} when prop theme is set', () => {
    const wrapper = mount(BTr, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
  })

  it('does not have theme class when theme is null', () => {
    const wrapper = mount(BTr, {
      props: {theme: null},
    })
    expect(wrapper.classes().join(' ')).not.toMatch(/theme-/)
  })

  it('does not have theme class by default', () => {
    const wrapper = mount(BTr)
    expect(wrapper.classes().join(' ')).not.toMatch(/theme-/)
  })

  it('theme class is reactive', async () => {
    const wrapper = mount(BTr, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
    await wrapper.setProps({theme: 'secondary'})
    expect(wrapper.classes()).not.toContain('theme-primary')
    expect(wrapper.classes()).toContain('theme-secondary')
  })

  it('theme class is removed when theme is set to undefined', async () => {
    const wrapper = mount(BTr, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
    await wrapper.setProps({theme: undefined})
    expect(wrapper.classes()).not.toContain('theme-primary')
  })

  it.each([
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'accent',
    'inverse',
  ] as const)('has class theme-%s when theme is set', (theme) => {
    const wrapper = mount(BTr, {
      props: {theme},
    })
    expect(wrapper.classes()).toContain(`theme-${theme}`)
  })
})
