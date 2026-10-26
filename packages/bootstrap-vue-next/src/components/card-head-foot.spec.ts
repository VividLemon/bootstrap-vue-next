import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BCardHeadFoot from './BCardHeadFoot.vue'

describe('card-head-foot', () => {
  enableAutoUnmount(afterEach)

  it('tag is div by default', () => {
    const wrapper = mount(BCardHeadFoot)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('tag is prop tag', () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {tag: 'span'},
    })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('tag reacts to prop changes', async () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {tag: 'div'},
    })
    expect(wrapper.element.tagName).toBe('DIV')
    await wrapper.setProps({tag: 'section'})
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('has class theme-{type} when prop theme', async () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {theme: 'primary'},
    })
    expect(wrapper.classes()).toContain('theme-primary')
    await wrapper.setProps({theme: 'danger'})
    expect(wrapper.classes()).toContain('theme-danger')
    expect(wrapper.classes()).not.toContain('theme-primary')
    await wrapper.setProps({theme: undefined})
    expect(wrapper.classes()).not.toContain('theme-danger')
  })

  it('has class fg-{type} when prop fg', async () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {fg: 'primary'},
    })
    expect(wrapper.classes()).toContain('fg-primary')
    await wrapper.setProps({fg: 'emphasis-danger'})
    expect(wrapper.classes()).toContain('fg-emphasis-danger')
    expect(wrapper.classes()).not.toContain('fg-primary')
    await wrapper.setProps({fg: undefined})
    expect(wrapper.classes()).not.toContain('fg-emphasis-danger')
  })

  it('has class bg-{type} when prop bg', async () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {bg: 'primary'},
    })
    expect(wrapper.classes()).toContain('bg-primary')
    await wrapper.setProps({bg: 'subtle-danger'})
    expect(wrapper.classes()).toContain('bg-subtle-danger')
    expect(wrapper.classes()).not.toContain('bg-primary')
    await wrapper.setProps({bg: undefined})
    expect(wrapper.classes()).not.toContain('bg-subtle-danger')
  })

  it('has class border-{type} when prop border', async () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {border: 'primary'},
    })
    expect(wrapper.classes()).toContain('border-primary')
    await wrapper.setProps({border: 'danger'})
    expect(wrapper.classes()).toContain('border-danger')
    expect(wrapper.classes()).not.toContain('border-primary')
    await wrapper.setProps({border: undefined})
    expect(wrapper.classes()).not.toContain('border-danger')
  })

  it('all color classes can coexist', () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {
        theme: 'primary',
        fg: 'danger',
        bg: 'success',
        border: 'warning',
      },
    })
    expect(wrapper.classes()).toContain('theme-primary')
    expect(wrapper.classes()).toContain('fg-danger')
    expect(wrapper.classes()).toContain('bg-success')
    expect(wrapper.classes()).toContain('border-warning')
  })

  it('renders default slot', () => {
    const wrapper = mount(BCardHeadFoot, {
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders default slot with HTML content', () => {
    const wrapper = mount(BCardHeadFoot, {
      slots: {default: '<span class="custom">head foot content</span>'},
    })
    const $span = wrapper.find('.custom')
    expect($span.exists()).toBe(true)
    expect($span.text()).toBe('head foot content')
  })

  it('renders prop text', () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {text: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders prop text reactively', async () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {text: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
    await wrapper.setProps({text: 'changed'})
    expect(wrapper.text()).toBe('changed')
  })

  it('renders default slot over prop text', () => {
    const wrapper = mount(BCardHeadFoot, {
      props: {text: 'props'},
      slots: {default: 'slots'},
    })
    expect(wrapper.text()).toBe('slots')
  })

  it('renders empty when no text or slot', () => {
    const wrapper = mount(BCardHeadFoot)
    expect(wrapper.text()).toBe('')
  })
})
