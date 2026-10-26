import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BTfoot from './BTfoot.vue'

describe('tfoot', () => {
  enableAutoUnmount(afterEach)

  it('renders a tfoot element', () => {
    const wrapper = mount(BTfoot)
    expect(wrapper.element.tagName).toBe('TFOOT')
  })

  it('renders default slot content', () => {
    const wrapper = mount(BTfoot, {
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders HTML slot content', () => {
    const wrapper = mount(BTfoot, {
      slots: {default: '<tr><td>Footer</td></tr>'},
    })
    expect(wrapper.find('tr').exists()).toBe(true)
    expect(wrapper.find('td').text()).toBe('Footer')
  })

  it('renders empty when no slot is provided', () => {
    const wrapper = mount(BTfoot)
    expect(wrapper.text()).toBe('')
  })

  it('has class theme-{type} when prop theme is set', () => {
    const wrapper = mount(BTfoot, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
  })

  it('does not have theme class when theme is null', () => {
    const wrapper = mount(BTfoot, {
      props: {theme: null},
    })
    expect(wrapper.classes().join(' ')).not.toMatch(/theme-/)
  })

  it('does not have theme class by default', () => {
    const wrapper = mount(BTfoot)
    expect(wrapper.classes().join(' ')).not.toMatch(/theme-/)
  })

  it('theme class is reactive', async () => {
    const wrapper = mount(BTfoot, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
    await wrapper.setProps({theme: 'secondary'})
    expect(wrapper.classes()).not.toContain('theme-primary')
    expect(wrapper.classes()).toContain('theme-secondary')
  })

  it('theme class is removed when theme is set to undefined', async () => {
    const wrapper = mount(BTfoot, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
    await wrapper.setProps({theme: undefined})
    expect(wrapper.classes()).not.toContain('theme-primary')
  })

  it('supports different theme values', () => {
    const themes = [
      'primary',
      'secondary',
      'success',
      'danger',
      'warning',
      'info',
      'accent',
      'inverse',
    ] as const
    themes.forEach((theme) => {
      const wrapper = mount(BTfoot, {
        props: {theme},
      })
      expect(wrapper.classes()).toContain(`theme-${theme}`)
    })
  })
})
