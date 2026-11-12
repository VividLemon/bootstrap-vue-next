import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import BAlert from './BAlert.vue'
import BCloseButton from '../BButton/BCloseButton.vue'
import BButton from '../BButton/BButton.vue'
import BLink from '../BLink/BLink.vue'
import BProgress from '../BProgress/BProgress.vue'

describe('alert', () => {
  enableAutoUnmount(afterEach)

  it('renders nothing by default', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('stacks its content vertically', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('flex-column')
    expect($div.classes()).toContain('align-items-stretch')
  })

  it('there is a div when modelValue true', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    await wrapper.vm.$nextTick()
    // await new Promise((resolve) => setTimeout(resolve, 3000))
    const $div = wrapper.find('div')
    expect($div.exists()).toBe(true)
    expect($div.attributes().style).toBeUndefined()
  })

  it('there is a nested div when modelValue number > 0', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5},
    })
    const $div = wrapper.find('div')
    expect($div.exists()).toBe(true)
    expect($div.attributes().style).toBeUndefined()
  })

  it('nested div has static class alert', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('alert')
  })

  it('nested div has attr role alert', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    await wrapper.vm.$nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('role')).toBe('alert')
  })

  it('nested div has attr aria-live assertive', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    await wrapper.vm.$nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('aria-live')).toBe('assertive')
  })
  it('nested div has attr role status when isStatus is true', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, isStatus: true},
    })
    await wrapper.vm.$nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('role')).toBe('status')
  })

  it('nested div has attr aria-live polite when isStatus is true', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, isStatus: true},
    })
    await wrapper.vm.$nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('aria-live')).toBe('polite')
  })

  it('nested div has static attr aria-atomic true', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    await wrapper.vm.$nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('aria-atomic')).toBe('true')
  })

  it('nested div has class theme-info by default', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('theme-info')
  })

  it('nested div has class theme-{type} when prop theme', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, color: {theme: 'danger'}},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('theme-danger')
  })

  it('nested div has bg and fg classes when props bg and fg', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, color: {bg: 'subtle-danger', fg: 'emphasis-danger'}},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('bg-subtle-danger')
    expect($div.classes()).toContain('fg-emphasis-danger')
  })

  it('nested div does not have class alert-dismissible when prop dismissible', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).not.toContain('alert-dismissible')
  })

  it('nested div does not have class alert-dismissible when not prop dismissible', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: false},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).not.toContain('alert-dismissible')
  })

  it('nested div renders default slot', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('nested div has BCloseButton by default when prop dismissible', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(true)
  })

  it('nested div does not have BCloseButton when not prop dismissible', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: false},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(false)
  })

  it('nested div does not have BCloseButton when prop dismissible but also slot close', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {close: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(false)
  })

  it('nested div does not have BCloseButton when prop dismissible but also prop closeContent', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, close: {content: 'foobar'}},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(false)
  })

  it('nested div has BButton when prop dismissible but also prop closeContent', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, close: {content: 'foobar'}},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.findComponent(BButton)
    expect($bbutton.exists()).toBe(true)
  })

  it('nested div has BButton when prop dismissible but also slot close', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {close: 'foobar', default: 'content'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.findComponent(BButton)
    expect($bbutton.exists()).toBe(true)
  })

  it('nested div does not have BButton when prop dismissible and nothing else', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.findComponent(BButton)
    expect($bbutton.exists()).toBe(false)
  })

  it('nested div BButton renders slot close', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {close: 'foobar', default: 'content'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    expect($bbutton.text()).toBe('foobar')
  })

  it('nested div BCloseButton has aria-label to be Close by default', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    expect($bclosebutton.attributes('aria-label')).toBe('Close')
  })

  it('nested div BCloseButton has aria-label to be prop closeLabel', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, close: {label: 'foobar'}},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    expect($bclosebutton.attributes('aria-label')).toBe('foobar')
  })

  // BCloseButton variant
  it('nested div BCloseButton emits update:modelValue when clicked when modelValue boolean', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, noTransition: true},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  it('nested div BCloseButton clicked update:modelValue emits arg false when modelValue boolean', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, noTransition: true},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))

    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted[0][0]).toBe(false)
  })

  it('nested div BCloseButton emits update:modelValue when clicked when modelValue number > 0', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5, dismissible: true},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  it('nested div BCloseButton clicked update:modelValue emits arg 0 when modelValue number > 0', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5, dismissible: true},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted[0][0]).toBe(0)
  })

  it('nested div BCloseButton clicked emits close', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5, dismissible: true},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('close')
  })

  it('nested div BCloseButton merges closeAttrs', () => {
    const wrapper = mount(BAlert, {
      props: {
        modelValue: true,
        dismissible: true,
        close: {attrs: {'class': 'foobar', 'data-foo': 'bar'}},
      },
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    expect($bclosebutton.classes()).toContain('foobar')
    expect($bclosebutton.classes()).toContain('btn-close')
    expect($bclosebutton.classes()).toContain('ms-auto')
    expect($bclosebutton.attributes('data-foo')).toBe('bar')
  })

  it('nested div BCloseButton has class ms-auto', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, title: 'Title'},
      slots: {default: 'foobar'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    expect($bclosebutton.classes()).toContain('ms-auto')
  })

  it('nested div BCloseButton has no class when no slot close', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    expect($bclosebutton.classes()).not.toContain('btn-close-custom')
  })

  it('nested div BCloseButton has no variant class when closeColor.theme', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, close: {color: {theme: 'warning'}}},
      slots: {default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bclosebutton = $div.getComponent(BCloseButton)
    expect($bclosebutton.classes()).not.toContain('theme-warning')
  })
  // BButton variant
  it('nested div BButton emits update:modelValue when clicked when modelValue boolean', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    await $bbutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  it('nested div BButton clicked update:modelValue emits arg false when modelValue boolean', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    await $bbutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted[0][0]).toBe(false)
  })

  it('nested div BButton emits update:modelValue when clicked when modelValue number > 0', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5, dismissible: true},
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    await $bbutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  it('nested div BButton clicked update:modelValue emits arg 0 when modelValue number > 0', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5, dismissible: true},
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    await $bbutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted[0][0]).toBe(0)
  })

  it('nested div BButton clicked emits close', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5, dismissible: true},
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    await $bbutton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('close')
  })

  it('nested div BButton merges closeAttrs', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, close: {attrs: {class: 'foobar'}}},
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    expect($bbutton.classes()).toContain('foobar')
    expect($bbutton.classes()).toContain('btn-close-custom')
    expect($bbutton.classes()).toContain('ms-auto')
  })

  it('nested div BButton has class when slot close', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    expect($bbutton.classes()).toContain('btn-close-custom')
  })

  it('nested div BButton has variant and theme classes when closeVariant and closeColor.theme', () => {
    const wrapper = mount(BAlert, {
      props: {
        modelValue: true,
        dismissible: true,
        close: {variant: 'outline', color: {theme: 'warning'}},
      },
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $div = wrapper.get('div')
    const $bbutton = $div.getComponent(BButton)
    expect($bbutton.classes()).toContain('btn-outline')
    expect($bbutton.classes()).toContain('theme-warning')
  })

  it('nested div BButton has no variant class when close.variant is null', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, close: {variant: null}},
      slots: {close: 'foobar', default: 'foobar'},
    })
    const $bbutton = wrapper.get('div').getComponent(BButton)
    expect($bbutton.classes().some((c) => c.startsWith('btn-solid'))).toBe(false)
    expect($bbutton.props('variant')).toBeNull()
  })

  // id prop
  it('nested div has id when prop id is set', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, id: 'my-alert'},
    })
    const $div = wrapper.get('div')
    expect($div.attributes('id')).toBe('my-alert')
  })

  it('nested div does not have explicit id when prop id is not set', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    const $div = wrapper.get('div')
    // When id is not provided, it should not be set (or auto-generated)
    expect($div.attributes('id')).toBeUndefined()
  })

  // alertAttrs prop
  it('nested div merges alertAttrs', () => {
    const wrapper = mount(BAlert, {
      props: {
        modelValue: true,
        alertAttrs: {'class': 'custom-alert-class', 'style': 'color: red;', 'data-foo': 'bar'},
      },
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('custom-alert-class')
    expect($div.classes()).toContain('alert')
    expect($div.classes()).toContain('theme-info')
    expect($div.attributes('style')).toContain('color: red;')
    expect($div.attributes('data-foo')).toBe('bar')
  })

  it('nested div does not have extra class when alertAttrs not set', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('alert')
    expect($div.classes()).toContain('theme-info')
  })

  // tabindex
  it('nested div has tabindex 0', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    const $div = wrapper.get('div')
    expect($div.attributes('tabindex')).toBe('0')
  })

  // theme null
  it('nested div does not have theme class when theme is null', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, color: {theme: null}},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('alert')
    expect($div.classes()).not.toContain('theme-null')
    expect($div.classes()).not.toContain('theme-info')
  })

  // noTransition prop
  it('nested div has class alert-instant when prop noTransition is true', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: false, noTransition: true},
    })
    await wrapper.setProps({modelValue: true})
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('alert-instant')
    expect($div.classes()).not.toContain('fade')
  })

  it('nested div does not have class alert-instant after a show when noTransition is false', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: false},
    })
    await wrapper.setProps({modelValue: true})
    const $div = wrapper.get('div')
    expect($div.classes()).not.toContain('alert-instant')
  })

  it('adds class hiding while hiding, then removes the alert after hidden', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {default: 'content'},
    })
    await vi.waitFor(() => expect(wrapper.emitted('shown')).toBeDefined())
    await wrapper.getComponent(BCloseButton).trigger('click')
    expect(wrapper.get('div').classes()).toContain('hiding')
    await vi.waitFor(() => expect(wrapper.emitted('hidden')).toBeDefined())
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div').exists()).toBe(false)
  })

  // body prop
  it('renders body prop text when no default slot', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, body: 'Alert body text'},
    })
    expect(wrapper.text()).toContain('Alert body text')
  })

  it('default slot overrides body prop', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, body: 'body prop'},
      slots: {default: 'slot content'},
    })
    expect(wrapper.text()).toContain('slot content')
    expect(wrapper.text()).not.toContain('body prop')
  })

  // bodyClass prop
  it('body element merges bodyAttrs', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, bodyAttrs: {'class': 'custom-body', 'data-foo': 'bar'}},
      slots: {default: 'content'},
    })
    const $body = wrapper.find('.alert-body')
    expect($body.exists()).toBe(true)
    expect($body.classes()).toContain('custom-body')
    expect($body.attributes('data-foo')).toBe('bar')
  })

  // alert-body class
  it('body element has static class alert-body', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $body = wrapper.find('.alert-body')
    expect($body.exists()).toBe(true)
  })

  // title prop
  it('renders title when prop title is set', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Alert Title'},
      slots: {default: 'content'},
    })
    expect(wrapper.text()).toContain('Alert Title')
  })

  it('title header has class alert-heading', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Alert Title'},
      slots: {default: 'content'},
    })
    const $heading = wrapper.find('.alert-heading')
    expect($heading.exists()).toBe(true)
  })

  // title slot
  it('renders title slot content', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
      slots: {title: 'Custom Title', default: 'content'},
    })
    expect(wrapper.text()).toContain('Custom Title')
  })

  it('title slot overrides title prop', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Prop Title'},
      slots: {title: 'Slot Title', default: 'content'},
    })
    expect(wrapper.text()).toContain('Slot Title')
    expect(wrapper.text()).not.toContain('Prop Title')
  })

  // headerTag prop
  it('title header uses headerTag prop', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Title', headerTag: 'h4'},
      slots: {default: 'content'},
    })
    const $heading = wrapper.find('h4.alert-heading')
    expect($heading.exists()).toBe(true)
  })

  it('title header defaults to div tag', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Title'},
      slots: {default: 'content'},
    })
    const $heading = wrapper.find('div.alert-heading')
    expect($heading.exists()).toBe(true)
  })

  // headerClass prop
  it('title header merges headerAttrs', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Title', headerAttrs: {class: 'custom-header'}},
      slots: {default: 'content'},
    })
    const $heading = wrapper.find('.alert-heading')
    expect($heading.classes()).toContain('custom-header')
    expect($heading.classes()).toContain('alert-heading')
    expect($heading.classes()).toContain('d-flex')
  })

  // closeContent prop rendering
  it('renders closeContent text in BButton', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, close: {content: 'X'}},
      slots: {default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    expect($bbutton.text()).toBe('X')
  })

  // close button in header (with title)
  it('shows close button in header when both title and dismissible', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Title', dismissible: true},
      slots: {default: 'content'},
    })
    const $heading = wrapper.find('.alert-heading')
    const $closeBtn = $heading.findComponent(BCloseButton)
    expect($closeBtn.exists()).toBe(true)
  })

  it('shows BButton close in header when title, dismissible, and close slot', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Title', dismissible: true},
      slots: {default: 'content', close: 'close text'},
    })
    const $heading = wrapper.find('.alert-heading')
    const $btn = $heading.findComponent(BButton)
    expect($btn.exists()).toBe(true)
    expect($btn.text()).toBe('close text')
  })

  it('close button in header emits update:modelValue when clicked', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, title: 'Title', dismissible: true, noTransition: true},
      slots: {default: 'content'},
    })
    const $heading = wrapper.find('.alert-heading')
    const $closeBtn = $heading.getComponent(BCloseButton)
    await $closeBtn.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  // BProgress
  it('does not render BProgress when modelValue is boolean', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, progressProps: {}},
      slots: {default: 'content'},
    })
    const $progress = wrapper.findComponent(BProgress)
    expect($progress.exists()).toBe(false)
  })

  it('renders BProgress when modelValue is number and progressProps provided', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5000, progressProps: {}},
      slots: {default: 'content'},
    })
    const $progress = wrapper.findComponent(BProgress)
    expect($progress.exists()).toBe(true)
  })

  it('does not render BProgress when modelValue is number but no progressProps', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5000},
      slots: {default: 'content'},
    })
    const $progress = wrapper.findComponent(BProgress)
    expect($progress.exists()).toBe(false)
  })

  // close-countdown emit
  it('emits close-countdown', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5000},
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted()).toHaveProperty('close-countdown')
  })

  // show prop
  it('show prop triggers show event emission', async () => {
    const wrapper = mount(BAlert, {
      props: {show: true, noTransition: true},
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted()).toHaveProperty('show')
  })

  // visible prop
  it('visible prop makes the component render', async () => {
    const wrapper = mount(BAlert, {
      props: {visible: true, noTransition: true},
    })
    await wrapper.vm.$nextTick()
    const $div = wrapper.find('div')
    expect($div.exists()).toBe(true)
  })

  // exposed methods
  it('exposes show method', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.vm.show).toBeDefined()
    expect(typeof wrapper.vm.show).toBe('function')
  })

  it('exposes hide method', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.vm.hide).toBeDefined()
    expect(typeof wrapper.vm.hide).toBe('function')
  })

  it('exposes toggle method', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.vm.toggle).toBeDefined()
    expect(typeof wrapper.vm.toggle).toBe('function')
  })

  it('exposes pause method', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.vm.pause).toBeDefined()
    expect(typeof wrapper.vm.pause).toBe('function')
  })

  it('exposes restart method', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.vm.restart).toBeDefined()
    expect(typeof wrapper.vm.restart).toBe('function')
  })

  it('exposes resume method', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.vm.resume).toBeDefined()
    expect(typeof wrapper.vm.resume).toBe('function')
  })

  it('exposes stop method', () => {
    const wrapper = mount(BAlert)
    expect(wrapper.vm.stop).toBeDefined()
    expect(typeof wrapper.vm.stop).toBe('function')
  })

  // d-flex wrapper around body content
  it('body content is wrapped in d-flex div', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $flex = wrapper.find('.d-flex')
    expect($flex.exists()).toBe(true)
  })

  // alert-dismissible class not added when close slot or closeContent is provided
  it('does not have alert-dismissible class when dismissible with close slot', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true},
      slots: {default: 'content', close: 'X'},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).not.toContain('alert-dismissible')
  })

  it('does not have alert-dismissible class when dismissible with closeContent', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, dismissible: true, close: {content: 'X'}},
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).not.toContain('alert-dismissible')
  })

  // show class behavior
  it('nested div has neither show nor hiding when visible', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
    })
    await wrapper.vm.$nextTick()
    const $div = wrapper.get('div')
    expect($div.classes()).not.toContain('show')
    expect($div.classes()).not.toContain('hiding')
  })

  // BLink rendering
  it('renders BLink when href prop is provided', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, href: 'https://example.com'},
      slots: {default: 'link content'},
    })
    const $link = wrapper.findComponent(BLink)
    expect($link.exists()).toBe(true)
  })

  it('renders div instead of BLink when no href or to prop', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $link = wrapper.findComponent(BLink)
    expect($link.exists()).toBe(false)
    const $body = wrapper.find('.alert-body')
    expect($body.element.tagName).toBe('DIV')
  })

  // Multiple themes
  it('nested div has class theme-success when theme is success', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, color: {theme: 'success'}},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('theme-success')
  })

  it('nested div has class theme-warning when theme is warning', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: true, color: {theme: 'warning'}},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('theme-warning')
  })

  it('hides itself when a numeric modelValue counts down', async () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 50, interval: 10},
      slots: {default: 'content'},
    })
    expect(wrapper.find('div').exists()).toBe(true)
    await vi.waitFor(() => expect(wrapper.emitted('hidden')).toBeDefined(), {timeout: 1000})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('renders the countdown progress bar full width', () => {
    const wrapper = mount(BAlert, {
      props: {modelValue: 5000, progressProps: {}},
      slots: {default: 'content'},
    })
    // the progress is a direct child of the column flex container
    const $progress = wrapper.get('.alert > .progress')
    expect($progress.exists()).toBe(true)
  })
})
