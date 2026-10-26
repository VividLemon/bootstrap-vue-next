import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BCardHeader from './BCardHeader.vue'
import BCardHeadFoot from '../BCardHeadFoot.vue'

describe('card-header', () => {
  enableAutoUnmount(afterEach)

  it('has static class card-header', () => {
    const wrapper = mount(BCardHeader)
    expect(wrapper.classes()).toContain('card-header')
  })

  it('has child of BCardHeadFoot', () => {
    const wrapper = mount(BCardHeader)
    const $headfoot = wrapper.findComponent(BCardHeadFoot)
    expect($headfoot.exists()).toBe(true)
  })

  it('tag is div by default', () => {
    const wrapper = mount(BCardHeader)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('tag is prop tag', () => {
    const wrapper = mount(BCardHeader, {
      props: {tag: 'header'},
    })
    expect(wrapper.element.tagName).toBe('HEADER')
  })

  it('gives prop text to child', () => {
    const wrapper = mount(BCardHeader, {
      props: {text: 'foobar'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('text')).toBe('foobar')
  })

  it('gives prop bg to child', () => {
    const wrapper = mount(BCardHeader, {
      props: {bg: 'danger'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('bg')).toBe('danger')
  })

  it('gives prop border to child', () => {
    const wrapper = mount(BCardHeader, {
      props: {border: 'danger'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('border')).toBe('danger')
  })

  it('gives prop tag to child', () => {
    const wrapper = mount(BCardHeader, {
      props: {tag: 'span'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('tag')).toBe('span')
  })

  it('gives prop fg to child', () => {
    const wrapper = mount(BCardHeader, {
      props: {fg: 'danger'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('fg')).toBe('danger')
  })

  it('gives prop theme to child', () => {
    const wrapper = mount(BCardHeader, {
      props: {theme: 'primary'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('theme')).toBe('primary')
  })

  it('renders default slot', () => {
    const wrapper = mount(BCardHeader, {
      slots: {default: 'foobar'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.text()).toBe('foobar')
  })

  it('renders prop text', () => {
    const wrapper = mount(BCardHeader, {
      props: {text: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders default slot over prop text', () => {
    const wrapper = mount(BCardHeader, {
      props: {text: 'props'},
      slots: {default: 'slots'},
    })
    expect(wrapper.text()).toBe('slots')
  })

  it('has class fg-{type} when prop fg', async () => {
    const wrapper = mount(BCardHeader, {
      props: {fg: 'primary'},
    })
    expect(wrapper.classes()).toContain('fg-primary')
    await wrapper.setProps({fg: undefined})
    expect(wrapper.classes()).not.toContain('fg-primary')
  })

  it('has class bg-{type} when prop bg', async () => {
    const wrapper = mount(BCardHeader, {
      props: {bg: 'primary'},
    })
    expect(wrapper.classes()).toContain('bg-primary')
    await wrapper.setProps({bg: undefined})
    expect(wrapper.classes()).not.toContain('bg-primary')
  })

  it('has class border-{type} when prop border', async () => {
    const wrapper = mount(BCardHeader, {
      props: {border: 'primary'},
    })
    expect(wrapper.classes()).toContain('border-primary')
    await wrapper.setProps({border: undefined})
    expect(wrapper.classes()).not.toContain('border-primary')
  })
})
