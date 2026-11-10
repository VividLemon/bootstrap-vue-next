import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {nextTick} from 'vue'
import BToast from './BToast.vue'
import BCloseButton from '../BButton/BCloseButton.vue'
import BButton from '../BButton/BButton.vue'
import BLink from '../BLink/BLink.vue'
import BProgress from '../BProgress/BProgress.vue'

describe('toast', () => {
  enableAutoUnmount(afterEach)

  it('has expected structure', async () => {
    const wrapper = mount(BToast, {
      attachTo: document.body,
      props: {
        modelValue: true,
        visible: true,
        title: 'title',
      },
      slots: {
        default: 'content',
      },
    })

    expect(wrapper.vm).toBeDefined()
    await nextTick()
    await nextTick()

    expect(wrapper.element.tagName).toBe('DIV')

    expect(wrapper.find('.toast').exists()).toBe(true)

    const $toast = wrapper.find('.toast')
    expect($toast.element.tagName).toBe('DIV')
    expect($toast.classes()).toContain('toast')
    expect($toast.classes()).toContain('show')
    expect($toast.attributes('role')).toEqual('alert')
    expect($toast.attributes('aria-live')).toEqual('assertive')
    expect($toast.attributes('aria-atomic')).toEqual('true')
    expect($toast.attributes('tabindex')).toEqual('0')

    expect($toast.find('.toast-header').exists()).toBe(true)
    const $header = $toast.find('.toast-header')
    expect($header.element.tagName).toBe('DIV')
    expect($header.classes().length).toBe(1)
    expect($header.find('strong').exists()).toBe(true)
    expect($header.find('strong').text()).toEqual('title')
    expect($header.find('button').classes()).toContain('ms-auto')
    expect($header.find('button').exists()).toBe(true)
    expect($header.find('button').classes()).toContain('btn-close')

    expect($toast.find('.toast-body').exists()).toBe(true)
    const $body = $toast.find('.toast-body')
    expect($body.element.tagName).toBe('DIV')
    expect($body.classes().length).toBe(1)
    expect($body.text()).toEqual('content')

    wrapper.unmount()
  })

  // Static class and element
  it('nested div has static class toast', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('toast')
  })

  it('renders nothing by default', () => {
    const wrapper = mount(BToast)
    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('there is a div when modelValue true', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    await nextTick()
    const $div = wrapper.find('div')
    expect($div.exists()).toBe(true)
    expect($div.classes()).toContain('show')
    expect($div.attributes('style')).toBeUndefined()
  })

  it('there is a div when modelValue is number > 0', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: 5000},
      slots: {default: 'content'},
    })
    const $div = wrapper.find('div')
    expect($div.exists()).toBe(true)
  })

  // tabindex
  it('nested div has tabindex 0', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.attributes('tabindex')).toBe('0')
  })

  // ARIA attributes
  it('nested div has attr role alert', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    await nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('role')).toBe('alert')
  })

  it('nested div has attr aria-live assertive', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    await nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('aria-live')).toBe('assertive')
  })

  it('nested div has attr role status when isStatus is true', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, isStatus: true},
      slots: {default: 'content'},
    })
    await nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('role')).toBe('status')
  })

  it('nested div has attr aria-live polite when isStatus is true', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, isStatus: true},
      slots: {default: 'content'},
    })
    await nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('aria-live')).toBe('polite')
  })

  it('nested div has static attr aria-atomic true', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    await nextTick()
    const $div = wrapper.get('div')
    expect($div.attributes('aria-atomic')).toBe('true')
  })

  // toastAttrs prop
  it('nested div merges toastAttrs', () => {
    const wrapper = mount(BToast, {
      props: {
        modelValue: true,
        toastAttrs: {'class': 'custom-toast-class', 'style': 'color: red;', 'data-foo': 'bar'},
      },
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('custom-toast-class')
    expect($div.classes()).toContain('toast')
    expect($div.classes()).toContain('show')
    expect($div.attributes('style')).toContain('color: red;')
    expect($div.attributes('data-foo')).toBe('bar')
  })

  it('nested div does not have extra class when toastAttrs not set', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('toast')
  })

  // ID prop
  it('nested div has id when prop id is set', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, id: 'my-toast'},
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.attributes('id')).toBe('my-toast')
  })

  it('nested div does not have explicit id when prop id is not set', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.attributes('id')).toBeUndefined()
  })

  // noTransition prop
  it('nested div has class toast-instant when prop noTransition is true', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: false, noTransition: true},
      slots: {default: 'content'},
    })
    await wrapper.setProps({modelValue: true})
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('toast-instant')
    expect($div.classes()).not.toContain('fade')
  })

  it('nested div does not have class toast-instant after a show when noTransition is false', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: false},
      slots: {default: 'content'},
    })
    await wrapper.setProps({modelValue: true})
    const $div = wrapper.get('div')
    expect($div.classes()).not.toContain('toast-instant')
    expect($div.classes()).toContain('show')
  })

  it('removes class show on hide, then unmounts after hidden', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    await vi.waitFor(() => expect(wrapper.emitted('shown')).toBeDefined())
    await wrapper.getComponent(BCloseButton).trigger('click')
    expect(wrapper.get('div').classes()).not.toContain('show')
    await vi.waitFor(() => expect(wrapper.emitted('hidden')).toBeDefined())
    await nextTick()
    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('hides itself when a numeric modelValue counts down', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: 50, interval: 10},
      slots: {default: 'content'},
    })
    expect(wrapper.get('div').classes()).toContain('show')
    await vi.waitFor(() => expect(wrapper.emitted('hidden')).toBeDefined(), {timeout: 1000})
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  // translucent prop
  it('nested div has class toast-translucent when prop translucent', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, translucent: true},
      slots: {default: 'content'},
    })
    expect(wrapper.get('div').classes()).toContain('toast-translucent')
  })

  it('nested div does not have class toast-translucent by default', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    expect(wrapper.get('div').classes()).not.toContain('toast-translucent')
  })

  // body prop
  it('renders body prop text when no default slot', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, body: 'Toast body text'},
    })
    expect(wrapper.text()).toContain('Toast body text')
  })

  it('default slot overrides body prop', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, body: 'body prop'},
      slots: {default: 'slot content'},
    })
    expect(wrapper.text()).toContain('slot content')
    expect(wrapper.text()).not.toContain('body prop')
  })

  // bodyClass prop
  it('body element merges bodyAttrs', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, bodyAttrs: {'class': 'custom-body', 'data-foo': 'bar'}},
      slots: {default: 'content'},
    })
    const $body = wrapper.find('.toast-body')
    expect($body.exists()).toBe(true)
    expect($body.classes()).toContain('custom-body')
    expect($body.classes()).toContain('toast-body')
    expect($body.attributes('data-foo')).toBe('bar')
  })

  // toast-body class
  it('body element has static class toast-body', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $body = wrapper.find('.toast-body')
    expect($body.exists()).toBe(true)
  })

  // title prop
  it('renders title when prop title is set', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Toast Title'},
      slots: {default: 'content'},
    })
    expect(wrapper.text()).toContain('Toast Title')
  })

  it('title header has class toast-header', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Toast Title'},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    expect($header.exists()).toBe(true)
  })

  it('title text is wrapped in strong tag', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Toast Title'},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    const $strong = $header.find('strong')
    expect($strong.exists()).toBe(true)
    expect($strong.text()).toBe('Toast Title')
  })

  // title slot
  it('renders title slot content', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {title: 'Custom Title', default: 'content'},
    })
    expect(wrapper.text()).toContain('Custom Title')
  })

  it('title slot overrides title prop', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Prop Title'},
      slots: {title: 'Slot Title', default: 'content'},
    })
    expect(wrapper.text()).toContain('Slot Title')
    expect(wrapper.text()).not.toContain('Prop Title')
  })

  it('no header rendered when no title prop or title slot', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    expect($header.exists()).toBe(false)
  })

  // headerTag prop
  it('has correct header tag when headerTag prop is set', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title', headerTag: 'h4'},
      slots: {default: 'content'},
    })
    const $heading = wrapper.find('h4.toast-header')
    expect($heading.exists()).toBe(true)
  })

  it('title header defaults to div tag', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title'},
      slots: {default: 'content'},
    })
    const $heading = wrapper.find('div.toast-header')
    expect($heading.exists()).toBe(true)
  })

  // headerClass prop
  it('title header merges headerAttrs', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title', headerAttrs: {class: 'custom-header'}},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    expect($header.classes()).toContain('custom-header')
    expect($header.classes()).toContain('toast-header')
  })

  // Close button (BCloseButton variant - default behavior)
  it('has BCloseButton by default when content is shown', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(true)
  })

  it('has BCloseButton in header when title is shown', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title'},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    const $closeBtn = $header.findComponent(BCloseButton)
    expect($closeBtn.exists()).toBe(true)
  })

  it('does not have BCloseButton when noCloseButton is true', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, noCloseButton: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(false)
  })

  it('does not have BCloseButton when close slot is provided', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {close: 'close text', default: 'content'},
    })
    const $bclosebutton = wrapper.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(false)
  })

  it('does not have BCloseButton when closeContent prop is provided', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {content: 'X'}},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(false)
  })

  // Close button (BButton variant - when closeContent or close slot)
  it('has BButton when closeContent prop is provided', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {content: 'X'}},
      slots: {default: 'content'},
    })
    const $bbutton = wrapper.findComponent(BButton)
    expect($bbutton.exists()).toBe(true)
  })

  it('has BButton when close slot is provided', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {close: 'close text', default: 'content'},
    })
    const $bbutton = wrapper.findComponent(BButton)
    expect($bbutton.exists()).toBe(true)
  })

  it('BButton renders closeContent text', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {content: 'X'}},
      slots: {default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    expect($bbutton.text()).toBe('X')
  })

  it('BButton renders close slot content', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {close: 'close text', default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    expect($bbutton.text()).toBe('close text')
  })

  // closeLabel prop
  it('BCloseButton has aria-label Close by default', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    expect($bclosebutton.attributes('aria-label')).toBe('Close')
  })

  it('BCloseButton has aria-label from closeLabel prop', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {label: 'Dismiss'}},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    expect($bclosebutton.attributes('aria-label')).toBe('Dismiss')
  })

  // closeClass prop
  it('BCloseButton merges closeAttrs', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {attrs: {'class': 'custom-close', 'data-foo': 'bar'}}},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    expect($bclosebutton.classes()).toContain('custom-close')
    expect($bclosebutton.classes()).toContain('btn-close')
    expect($bclosebutton.classes()).toContain('ms-auto')
    expect($bclosebutton.attributes('data-foo')).toBe('bar')
  })

  it('BButton merges closeAttrs', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {attrs: {class: 'custom-close'}, content: 'X'}},
      slots: {default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    expect($bbutton.classes()).toContain('custom-close')
    expect($bbutton.classes()).toContain('ms-auto')
  })

  // closeVariant prop
  it('BButton has theme class from closeColor.theme prop', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {color: {theme: 'warning'}, content: 'X'}},
      slots: {default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    expect($bbutton.classes()).toContain('theme-warning')
    expect($bbutton.classes()).toContain('btn-solid')
  })

  it('BButton has variant class from closeVariant prop', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {variant: 'outline', content: 'X'}},
      slots: {default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    expect($bbutton.classes()).toContain('btn-outline')
  })

  // Close button click events
  it('BCloseButton emits update:modelValue when clicked', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, noTransition: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  it('BCloseButton clicked emits arg false when modelValue boolean', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, noTransition: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted[0][0]).toBe(false)
  })

  it('BCloseButton emits update:modelValue when clicked with number modelValue', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: 5000},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  it('BCloseButton clicked emits arg 0 when modelValue number', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: 5000},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted[0][0]).toBe(0)
  })

  it('BCloseButton clicked emits close event', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    await $bclosebutton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('close')
  })

  it('BButton emits update:modelValue when clicked', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, noTransition: true},
      slots: {close: 'close text', default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    await $bbutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  it('BButton clicked emits arg false when modelValue boolean', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, noTransition: true},
      slots: {close: 'close text', default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    await $bbutton.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted[0][0]).toBe(false)
  })

  it('BButton clicked emits close event', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {close: 'close text', default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    await $bbutton.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('close')
  })

  // Close button in header (with title)
  it('shows close button in header when title is set', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title'},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    const $closeBtn = $header.findComponent(BCloseButton)
    expect($closeBtn.exists()).toBe(true)
  })

  it('shows BButton close in header when title and close slot', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title'},
      slots: {default: 'content', close: 'close text'},
    })
    const $header = wrapper.find('.toast-header')
    const $btn = $header.findComponent(BButton)
    expect($btn.exists()).toBe(true)
    expect($btn.text()).toBe('close text')
  })

  it('close button in header emits update:modelValue when clicked', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title', noTransition: true},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    const $closeBtn = $header.getComponent(BCloseButton)
    await $closeBtn.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
  })

  // Close button not duplicated: when title is provided, close button
  // should be in header only, not in body area
  it('close button is only in header when title is present', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title'},
      slots: {default: 'content'},
    })
    const allCloseButtons = wrapper.findAllComponents(BCloseButton)
    expect(allCloseButtons.length).toBe(1)
    const $header = wrapper.find('.toast-header')
    expect($header.findComponent(BCloseButton).exists()).toBe(true)
  })

  // Close button is in body area when no title
  it('close button is in body area when no title', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(true)
    const $header = wrapper.find('.toast-header')
    expect($header.exists()).toBe(false)
  })

  // BProgress rendering
  it('renders BProgress when modelValue is number and noProgress is false', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: 5000},
      slots: {default: 'content'},
    })
    const $progress = wrapper.findComponent(BProgress)
    expect($progress.exists()).toBe(true)
  })

  it('does not render BProgress when modelValue is boolean', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $progress = wrapper.findComponent(BProgress)
    expect($progress.exists()).toBe(false)
  })

  it('does not render BProgress when noProgress is true', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: 5000, noProgress: true},
      slots: {default: 'content'},
    })
    const $progress = wrapper.findComponent(BProgress)
    expect($progress.exists()).toBe(false)
  })

  // close-countdown emit
  it('emits close-countdown', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: 5000},
    })
    await nextTick()
    expect(wrapper.emitted()).toHaveProperty('close-countdown')
  })

  // show prop
  it('show prop triggers show event emission', async () => {
    const wrapper = mount(BToast, {
      props: {show: true, noTransition: true},
    })
    await nextTick()
    expect(wrapper.emitted()).toHaveProperty('show')
  })

  // visible prop
  it('visible prop makes the component render', async () => {
    const wrapper = mount(BToast, {
      props: {visible: true, noTransition: true},
    })
    await nextTick()
    const $div = wrapper.find('div')
    expect($div.exists()).toBe(true)
  })

  // show class behavior
  it('nested div has class show when visible', async () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    await nextTick()
    const $div = wrapper.get('div')
    expect($div.classes()).toContain('show')
  })

  // exposed methods
  it('exposes show method', () => {
    const wrapper = mount(BToast)
    expect(wrapper.vm.show).toBeDefined()
    expect(typeof wrapper.vm.show).toBe('function')
  })

  it('exposes hide method', () => {
    const wrapper = mount(BToast)
    expect(wrapper.vm.hide).toBeDefined()
    expect(typeof wrapper.vm.hide).toBe('function')
  })

  it('exposes toggle method', () => {
    const wrapper = mount(BToast)
    expect(wrapper.vm.toggle).toBeDefined()
    expect(typeof wrapper.vm.toggle).toBe('function')
  })

  it('exposes pause method', () => {
    const wrapper = mount(BToast)
    expect(wrapper.vm.pause).toBeDefined()
    expect(typeof wrapper.vm.pause).toBe('function')
  })

  it('exposes restart method', () => {
    const wrapper = mount(BToast)
    expect(wrapper.vm.restart).toBeDefined()
    expect(typeof wrapper.vm.restart).toBe('function')
  })

  it('exposes resume method', () => {
    const wrapper = mount(BToast)
    expect(wrapper.vm.resume).toBeDefined()
    expect(typeof wrapper.vm.resume).toBe('function')
  })

  it('exposes stop method', () => {
    const wrapper = mount(BToast)
    expect(wrapper.vm.stop).toBeDefined()
    expect(typeof wrapper.vm.stop).toBe('function')
  })

  // d-flex wrapper around body content
  it('body content is wrapped in d-flex div', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $flex = wrapper.find('.d-flex')
    expect($flex.exists()).toBe(true)
  })

  // BLink rendering
  it('renders BLink when href prop is provided', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, href: 'https://example.com'},
      slots: {default: 'link content'},
    })
    const $link = wrapper.findComponent(BLink)
    expect($link.exists()).toBe(true)
  })

  it('renders div instead of BLink when no href or to prop', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $link = wrapper.findComponent(BLink)
    expect($link.exists()).toBe(false)
    const $body = wrapper.find('.toast-body')
    expect($body.element.tagName).toBe('DIV')
  })

  // closeContent rendering in header (with title)
  it('renders closeContent in header BButton when title is set', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title', close: {content: 'X'}},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    const $btn = $header.findComponent(BButton)
    expect($btn.exists()).toBe(true)
    expect($btn.text()).toBe('X')
  })

  // BCloseButton ms-auto class
  it('BCloseButton has ms-auto class', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    expect($bclosebutton.classes()).toContain('ms-auto')
  })

  // BButton ms-auto class
  it('BButton has ms-auto class when closeContent provided', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, close: {content: 'X'}},
      slots: {default: 'content'},
    })
    const $bbutton = wrapper.getComponent(BButton)
    expect($bbutton.classes()).toContain('ms-auto')
  })

  // BCloseButton btn-close-custom class in body area
  it('BCloseButton has btn-close-custom class in body area (no title)', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.getComponent(BCloseButton)
    expect($bclosebutton.classes()).toContain('btn-close-custom')
  })

  it('BCloseButton does not have btn-close-custom in header (with title)', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title'},
      slots: {default: 'content'},
    })
    const $header = wrapper.find('.toast-header')
    const $bclosebutton = $header.getComponent(BCloseButton)
    expect($bclosebutton.classes()).not.toContain('btn-close-custom')
  })

  // Color variant classes
  it.each([
    {prop: 'theme', value: 'success', expectedClass: 'theme-success'},
    {prop: 'bg', value: 'primary', expectedClass: 'bg-primary'},
    {prop: 'fg', value: 'white', expectedClass: 'fg-white'},
  ])('applies $prop color class to toast', ({prop, value, expectedClass}) => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, color: {[prop]: value}},
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.classes()).toContain(expectedClass)
  })

  // Default slot renders content
  it('renders default slot content', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  // No content without body or default slot
  it('does not render toast-body when no body prop or default slot', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title'},
    })
    const $body = wrapper.find('.toast-body')
    expect($body.exists()).toBe(false)
  })

  // noCloseButton hides all close buttons
  it('noCloseButton hides close button even with title', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true, title: 'Title', noCloseButton: true},
      slots: {default: 'content'},
    })
    const $bclosebutton = wrapper.findComponent(BCloseButton)
    expect($bclosebutton.exists()).toBe(false)
    const $bbutton = wrapper.findComponent(BButton)
    expect($bbutton.exists()).toBe(false)
  })

  // display is owned by Bootstrap's `.toast` / `.toast.show` CSS
  it('nested div has no inline display style', () => {
    const wrapper = mount(BToast, {
      props: {modelValue: true},
      slots: {default: 'content'},
    })
    const $div = wrapper.get('div')
    expect($div.attributes('style')).toBeUndefined()
  })
})
