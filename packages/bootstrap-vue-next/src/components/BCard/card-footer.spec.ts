import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BCardFooter from './BCardFooter.vue'
import BCardHeadFoot from '../BCardHeadFoot.vue'

describe('card-footer', () => {
  enableAutoUnmount(afterEach)

  it('has static class card-footer', () => {
    const wrapper = mount(BCardFooter)
    expect(wrapper.classes()).toContain('card-footer')
  })

  it('has child of BCardHeadFoot', () => {
    const wrapper = mount(BCardFooter)
    const $headfoot = wrapper.findComponent(BCardHeadFoot)
    expect($headfoot.exists()).toBe(true)
  })

  it('tag is div by default', () => {
    const wrapper = mount(BCardFooter)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('tag is prop tag', () => {
    const wrapper = mount(BCardFooter, {
      props: {tag: 'footer'},
    })
    expect(wrapper.element.tagName).toBe('FOOTER')
  })

  it('tag reacts to prop changes', async () => {
    const wrapper = mount(BCardFooter, {
      props: {tag: 'div'},
    })
    expect(wrapper.element.tagName).toBe('DIV')
    await wrapper.setProps({tag: 'section'})
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('gives prop text to child', async () => {
    const wrapper = mount(BCardFooter, {
      props: {text: 'foobar'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('text')).toBe('foobar')
    await wrapper.setProps({text: 'baz'})
    expect($headfoot.props('text')).toBe('baz')
  })

  it('gives prop bg to child', async () => {
    const wrapper = mount(BCardFooter, {
      props: {color: {bg: 'danger'}},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('color')?.bg).toBe('danger')
    await wrapper.setProps({color: {bg: 'success'}})
    expect($headfoot.props('color')?.bg).toBe('success')
  })

  it('gives prop border to child', async () => {
    const wrapper = mount(BCardFooter, {
      props: {color: {border: 'danger'}},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('color')?.border).toBe('danger')
    await wrapper.setProps({color: {border: 'warning'}})
    expect($headfoot.props('color')?.border).toBe('warning')
  })

  it('gives prop tag to child', async () => {
    const wrapper = mount(BCardFooter, {
      props: {tag: 'span'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('tag')).toBe('span')
    await wrapper.setProps({tag: 'footer'})
    expect($headfoot.props('tag')).toBe('footer')
  })

  it('gives prop fg to child', async () => {
    const wrapper = mount(BCardFooter, {
      props: {color: {fg: 'danger'}},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('color')?.fg).toBe('danger')
    await wrapper.setProps({color: {fg: 'info'}})
    expect($headfoot.props('color')?.fg).toBe('info')
  })

  it('gives prop theme to child', async () => {
    const wrapper = mount(BCardFooter, {
      props: {color: {theme: 'primary'}},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.props('color')?.theme).toBe('primary')
    await wrapper.setProps({color: {theme: 'secondary'}})
    expect($headfoot.props('color')?.theme).toBe('secondary')
  })

  it('has class theme-{type} when prop theme', async () => {
    const wrapper = mount(BCardFooter, {
      props: {color: {theme: 'primary'}},
    })
    expect(wrapper.classes()).toContain('theme-primary')
    await wrapper.setProps({color: {theme: 'danger'}})
    expect(wrapper.classes()).toContain('theme-danger')
    expect(wrapper.classes()).not.toContain('theme-primary')
    await wrapper.setProps({color: {theme: undefined}})
    expect(wrapper.classes()).not.toContain('theme-danger')
  })

  it('has class fg-{type} when prop fg', async () => {
    const wrapper = mount(BCardFooter, {
      props: {color: {fg: 'primary'}},
    })
    expect(wrapper.classes()).toContain('fg-primary')
    await wrapper.setProps({color: {fg: 'danger'}})
    expect(wrapper.classes()).toContain('fg-danger')
    expect(wrapper.classes()).not.toContain('fg-primary')
    await wrapper.setProps({color: {fg: undefined}})
    expect(wrapper.classes()).not.toContain('fg-danger')
  })

  it('has class bg-{type} when prop bg', async () => {
    const wrapper = mount(BCardFooter, {
      props: {color: {bg: 'primary'}},
    })
    expect(wrapper.classes()).toContain('bg-primary')
    await wrapper.setProps({color: {bg: 'danger'}})
    expect(wrapper.classes()).toContain('bg-danger')
    expect(wrapper.classes()).not.toContain('bg-primary')
    await wrapper.setProps({color: {bg: undefined}})
    expect(wrapper.classes()).not.toContain('bg-danger')
  })

  it('has class border-{type} when prop border', async () => {
    const wrapper = mount(BCardFooter, {
      props: {color: {border: 'primary'}},
    })
    expect(wrapper.classes()).toContain('border-primary')
    await wrapper.setProps({color: {border: 'danger'}})
    expect(wrapper.classes()).toContain('border-danger')
    expect(wrapper.classes()).not.toContain('border-primary')
    await wrapper.setProps({color: {border: undefined}})
    expect(wrapper.classes()).not.toContain('border-danger')
  })

  it('card-footer class persists with color classes', () => {
    const wrapper = mount(BCardFooter, {
      props: {
        color: {theme: 'primary', fg: 'danger', bg: 'success', border: 'warning'},
      },
    })
    expect(wrapper.classes()).toContain('card-footer')
    expect(wrapper.classes()).toContain('theme-primary')
    expect(wrapper.classes()).toContain('fg-danger')
    expect(wrapper.classes()).toContain('bg-success')
    expect(wrapper.classes()).toContain('border-warning')
  })

  it('renders prop text', () => {
    const wrapper = mount(BCardFooter, {
      props: {text: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders prop text reactively', async () => {
    const wrapper = mount(BCardFooter, {
      props: {text: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
    await wrapper.setProps({text: 'changed'})
    expect(wrapper.text()).toBe('changed')
  })

  it('renders empty when no text or slot', () => {
    const wrapper = mount(BCardFooter)
    expect(wrapper.text()).toBe('')
  })

  it('renders default slot', () => {
    const wrapper = mount(BCardFooter, {
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders default slot with HTML content', () => {
    const wrapper = mount(BCardFooter, {
      slots: {default: '<span class="custom">footer content</span>'},
    })
    const $span = wrapper.find('.custom')
    expect($span.exists()).toBe(true)
    expect($span.text()).toBe('footer content')
  })

  it('renders default slot over prop text', () => {
    const wrapper = mount(BCardFooter, {
      props: {text: 'props'},
      slots: {default: 'slots'},
    })
    expect(wrapper.text()).toBe('slots')
  })

  it('renders slot content in BCardHeadFoot child', () => {
    const wrapper = mount(BCardFooter, {
      slots: {default: 'foobar'},
    })
    const $headfoot = wrapper.getComponent(BCardHeadFoot)
    expect($headfoot.text()).toBe('foobar')
  })
})
