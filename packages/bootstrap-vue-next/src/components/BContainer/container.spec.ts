import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BContainer from './BContainer.vue'

describe('container', () => {
  enableAutoUnmount(afterEach)

  it('tag is default div', () => {
    const wrapper = mount(BContainer)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('tag is prop tag', () => {
    const wrapper = mount(BContainer, {
      props: {tag: 'small'},
    })
    expect(wrapper.element.tagName).toBe('SMALL')
  })

  it('renders default slot', () => {
    const wrapper = mount(BContainer, {
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('has class container when prop fluid is false', async () => {
    const wrapper = mount(BContainer, {
      props: {fluid: false},
    })
    expect(wrapper.classes()).toContain('container')
    await wrapper.setProps({fluid: true})
    expect(wrapper.classes()).not.toContain('container')
  })

  it('has class container-fluid when prop fluid is true', async () => {
    const wrapper = mount(BContainer, {
      props: {fluid: true},
    })
    expect(wrapper.classes()).toContain('container-fluid')
    await wrapper.setProps({fluid: false})
    expect(wrapper.classes()).not.toContain('container-fluid')
  })

  it('has class {breakpoint}:container when prop fluid is a breakpoint', async () => {
    const wrapper = mount(BContainer, {
      props: {fluid: '2xl'},
    })
    expect(wrapper.classes()).toContain('2xl:container')
    expect(wrapper.classes()).not.toContain('container')
    await wrapper.setProps({fluid: undefined})
    expect(wrapper.classes()).not.toContain('2xl:container')
    expect(wrapper.classes()).toContain('container')
  })

  it.each(['sm', 'md', 'lg', 'xl', '2xl'] as const)(
    'has class %s:container when prop fluid is %s',
    (value) => {
      const wrapper = mount(BContainer, {
        props: {fluid: value},
      })
      expect(wrapper.classes()).toEqual([`${value}:container`])
    }
  )

  it('has class container by default', () => {
    const wrapper = mount(BContainer)
    expect(wrapper.classes()).toEqual(['container'])
  })

  it('has class gx-{value} when prop gutterX', async () => {
    const wrapper = mount(BContainer, {
      props: {gutterX: {xs: 5}},
    })
    expect(wrapper.classes()).toContain('gx-5')
    await wrapper.setProps({gutterX: undefined})
    expect(wrapper.classes()).not.toContain('gx-5')
  })

  it('has class gy-{value} when prop gutterY', async () => {
    const wrapper = mount(BContainer, {
      props: {gutterY: {xs: 5}},
    })
    expect(wrapper.classes()).toContain('gy-5')
    await wrapper.setProps({gutterY: undefined})
    expect(wrapper.classes()).not.toContain('gy-5')
  })

  it('has responsive gutter classes', () => {
    const wrapper = mount(BContainer, {
      props: {gutterX: {'xs': 0, 'md': 3, '2xl': 12}, gutterY: {lg: 4}},
    })
    expect(wrapper.classes()).toEqual(['container', 'gx-0', 'md:gx-3', '2xl:gx-12', 'lg:gy-4'])
  })

  it('renders slot content with HTML', () => {
    const wrapper = mount(BContainer, {
      slots: {default: '<span class="test-child">content</span>'},
    })
    expect(wrapper.find('.test-child').exists()).toBe(true)
    expect(wrapper.find('.test-child').text()).toBe('content')
  })

  it('tag can be set to section', () => {
    const wrapper = mount(BContainer, {
      props: {tag: 'section'},
    })
    expect(wrapper.element.tagName).toBe('SECTION')
  })
})
