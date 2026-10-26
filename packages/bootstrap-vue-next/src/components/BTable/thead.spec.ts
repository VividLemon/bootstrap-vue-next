import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BThead from './BThead.vue'

describe('thead', () => {
  enableAutoUnmount(afterEach)

  it('renders a thead element', () => {
    const wrapper = mount(BThead)
    expect(wrapper.element.tagName).toBe('THEAD')
  })

  it('renders default slot content', () => {
    const wrapper = mount(BThead, {
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders HTML slot content', () => {
    const wrapper = mount(BThead, {
      slots: {default: '<tr><th>Header</th></tr>'},
    })
    expect(wrapper.find('tr').exists()).toBe(true)
    expect(wrapper.find('th').text()).toBe('Header')
  })

  it('renders empty when no slot is provided', () => {
    const wrapper = mount(BThead)
    expect(wrapper.text()).toBe('')
  })

  it('has class theme-{type} when prop theme is set', () => {
    const wrapper = mount(BThead, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
  })

  it('does not have theme class when theme is null', () => {
    const wrapper = mount(BThead, {
      props: {theme: null},
    })
    expect(wrapper.classes().join(' ')).not.toMatch(/theme-/)
  })

  it('does not have theme class by default', () => {
    const wrapper = mount(BThead)
    expect(wrapper.classes().join(' ')).not.toMatch(/theme-/)
  })

  it('theme class is reactive', async () => {
    const wrapper = mount(BThead, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
    await wrapper.setProps({theme: 'secondary'})
    expect(wrapper.classes()).not.toContain('theme-primary')
    expect(wrapper.classes()).toContain('theme-secondary')
  })

  it('theme class is removed when theme is set to undefined', async () => {
    const wrapper = mount(BThead, {
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
    const wrapper = mount(BThead, {
      props: {theme},
    })
    expect(wrapper.classes()).toContain(`theme-${theme}`)
  })
})
