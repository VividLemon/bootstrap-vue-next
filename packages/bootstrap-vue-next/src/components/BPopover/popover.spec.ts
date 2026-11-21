import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {h, nextTick} from 'vue'
import BPopover from './BPopover.vue'

// The activator slot binds its `props` (ref, listeners, aria-describedby) on the trigger
const activatorButton =
  '<template #activator="{props}"><button v-bind="props">Test</button></template>'

/** Let Vue patch and a few animation frames pass */
const flush = async (frames = 3) => {
  for (let i = 0; i < frames; i++) {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  }
  await nextTick()
}

describe('popover', () => {
  enableAutoUnmount(afterEach)

  it('has div.popover', () => {
    const wrapper = mount(BPopover, {props: {modelValue: true}})
    const $div = wrapper.find('div.popover')
    expect($div.exists()).toBe(true)
  })

  it('has static class popover', () => {
    const wrapper = mount(BPopover, {props: {modelValue: true}})
    const $div = wrapper.get('div.popover')

    expect($div.classes()).toContain('popover')
  })

  it('has static class b-popover', () => {
    const wrapper = mount(BPopover, {
      props: {modelValue: true},
    })
    const $div = wrapper.get('div.popover')

    expect($div.classes()).toContain('b-popover')
  })

  it('has role tooltip', () => {
    const wrapper = mount(BPopover, {props: {modelValue: true}})
    const $div = wrapper.get('div.popover')
    expect($div.attributes('role')).toBe('tooltip')
  })

  it('has tabindex -1', () => {
    const wrapper = mount(BPopover, {props: {modelValue: true}})
    const $div = wrapper.get('div.popover')

    expect($div.attributes('tabindex')).toBe('-1')
  })

  it('is tag div', () => {
    const wrapper = mount(BPopover)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('has prop id', async () => {
    const wrapper = mount(BPopover, {props: {id: 'abc', modelValue: true}})
    const $div = wrapper.get('div.popover')

    expect($div.attributes('id')).toBe('abc')
    await wrapper.setProps({id: undefined})
    expect($div.attributes('id')).toBeDefined()
  })

  it('first child contains slot title', () => {
    const wrapper = mount(BPopover, {
      props: {modelValue: true},
      slots: {title: 'foobar'},
    })
    const $div = wrapper.get('div.popover-header')
    expect($div.text()).toBe('foobar')
  })

  it('first child contains prop title', () => {
    const wrapper = mount(BPopover, {
      props: {title: 'foobar', modelValue: true},
    })
    const $div = wrapper.get('div.popover-header')
    expect($div.text()).toBe('foobar')
  })

  it('first child contains slot title if both slot and prop exists', () => {
    const wrapper = mount(BPopover, {
      props: {title: 'propbar', modelValue: true},
      slots: {title: 'slotbar'},
    })
    const $div = wrapper.get('div.popover-header')
    expect($div.text()).toBe('slotbar')
  })

  it('contains slot default', () => {
    const wrapper = mount(BPopover, {
      props: {modelValue: true},
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toContain('foobar')
  })

  it('second child contains prop content', () => {
    const wrapper = mount(BPopover, {
      props: {body: 'foobar', modelValue: true},
    })
    const $div = wrapper.get('div.popover-body')
    expect($div.text()).toBe('foobar')
  })

  it('contains slot default if both slot and prop exists', () => {
    const wrapper = mount(BPopover, {
      props: {body: 'propbar', modelValue: true},
      slots: {default: '<div class="trigger">slotbar</div>'},
    })
    const $div = wrapper.get('div.trigger')
    expect($div.text()).toBe('slotbar')
  })

  // Test new trigger props
  it('defaults to hover and focus triggers', async () => {
    const wrapper = mount(BPopover, {
      props: {body: 'test'},
      slots: {activator: activatorButton},
      attachTo: document.body,
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    // Test hover trigger
    await button.trigger('pointerenter')
    expect(wrapper.emitted('show')).toBeTruthy()

    // Test focus trigger
    // Already showing: a second trigger joins the show in progress
    await button.trigger('focus')
    expect(wrapper.emitted('show')).toHaveLength(1)

    wrapper.unmount()
  })

  it('respects click prop for backward compatibility', async () => {
    const wrapper = mount(BPopover, {
      props: {click: true, body: 'test'},
      slots: {activator: activatorButton},
      attachTo: document.body,
    })

    const button = wrapper.find('button')

    // Click should trigger show
    await button.trigger('click')
    expect(wrapper.emitted('show')).toBeTruthy()

    // Hover should not trigger (since click=true overrides defaults)
    const showEvents = wrapper.emitted('show')?.length || 0
    await button.trigger('pointerenter')
    expect((wrapper.emitted('show')?.length || 0) - showEvents).toBe(0)

    wrapper.unmount()
  })

  it('respects hover=false to disable hover trigger', async () => {
    const wrapper = mount(BPopover, {
      props: {hover: false, focus: true, body: 'test'},
      slots: {activator: activatorButton},
      attachTo: document.body,
    })

    const button = wrapper.find('button')

    // Hover should not trigger
    await button.trigger('pointerenter')
    expect(wrapper.emitted('show')).toBeFalsy()

    // Focus should trigger
    await button.trigger('focus')
    expect(wrapper.emitted('show')).toBeTruthy()

    wrapper.unmount()
  })

  it('respects focus=false to disable focus trigger', async () => {
    const wrapper = mount(BPopover, {
      props: {focus: false, hover: true, body: 'test'},
      slots: {activator: activatorButton},
      attachTo: document.body,
    })

    const button = wrapper.find('button')

    // Focus should not trigger
    await button.trigger('focus')
    expect(wrapper.emitted('show')).toBeFalsy()

    // Hover should trigger
    await button.trigger('pointerenter')
    expect(wrapper.emitted('show')).toBeTruthy()

    wrapper.unmount()
  })

  it('allows combining click with hover/focus', async () => {
    const wrapper = mount(BPopover, {
      props: {click: true, hover: true, focus: true, body: 'test'},
      slots: {activator: activatorButton},
      attachTo: document.body,
    })

    const button = wrapper.find('button')

    // All triggers should work
    await button.trigger('click')
    expect(wrapper.emitted('show')).toBeTruthy()

    // Already showing: further triggers join the show in progress
    await button.trigger('pointerenter')
    await button.trigger('focus')
    expect(wrapper.emitted('show')).toHaveLength(1)

    wrapper.unmount()
  })

  it('respects manual prop to disable all automatic triggers', async () => {
    const wrapper = mount(BPopover, {
      props: {manual: true, body: 'test'},
      slots: {activator: activatorButton},
      attachTo: document.body,
    })

    const button = wrapper.find('button')

    // No triggers should work
    await button.trigger('click')
    await button.trigger('pointerenter')
    await button.trigger('focus')

    expect(wrapper.emitted('show')).toBeFalsy()

    wrapper.unmount()
  })

  it('content div has class b-floating-size', () => {
    const wrapper = mount(BPopover, {
      props: {modelValue: true},
    })
    const $div = wrapper.find('.b-floating-size')
    expect($div.exists()).toBe(true)
    expect($div.classes()).toContain('overflow-auto')
  })

  describe('tooltip mode', () => {
    it('has tooltip class instead of popover when tooltip prop is true', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, tooltip: true},
      })
      const $div = wrapper.find('div.tooltip')
      expect($div.exists()).toBe(true)
      expect($div.classes()).not.toContain('popover')
    })

    it('has b-tooltip class instead of b-popover when tooltip prop is true', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, tooltip: true},
      })
      const $div = wrapper.get('div.tooltip')
      expect($div.classes()).toContain('b-tooltip')
      expect($div.classes()).not.toContain('b-popover')
    })

    it('arrow has tooltip-arrow class when tooltip prop is true', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, tooltip: true},
      })
      const $arrow = wrapper.find('.tooltip-arrow')
      expect($arrow.exists()).toBe(true)
      expect(wrapper.find('.popover-arrow').exists()).toBe(false)
    })

    it('arrow has popover-arrow class by default', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true},
      })
      const $arrow = wrapper.find('.popover-arrow')
      expect($arrow.exists()).toBe(true)
      expect(wrapper.find('.tooltip-arrow').exists()).toBe(false)
    })

    it('title uses tooltip-inner class when tooltip prop is true', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, tooltip: true, title: 'test'},
      })
      const $header = wrapper.find('.tooltip-inner')
      expect($header.exists()).toBe(true)
      expect(wrapper.find('.popover-header').exists()).toBe(false)
    })

    it('body uses tooltip-inner class when tooltip prop is true', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, tooltip: true, body: 'test body'},
      })
      const $body = wrapper.find('.tooltip-inner')
      expect($body.exists()).toBe(true)
      expect(wrapper.find('.popover-body').exists()).toBe(false)
    })

    it('only renders body when no title in tooltip mode', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, tooltip: true, body: 'body content'},
      })
      const $inner = wrapper.findAll('.tooltip-inner')
      expect($inner.length).toBe(1)
      expect($inner[0].text()).toBe('body content')
    })

    it('only renders title when title is provided in tooltip mode', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, tooltip: true, title: 'title content'},
      })
      // In tooltip mode with title, body is not rendered
      const $inner = wrapper.findAll('.tooltip-inner')
      expect($inner.length).toBe(1)
      expect($inner[0].text()).toBe('title content')
    })
  })

  describe('classes and styling', () => {
    it('has the popover-instant class when noTransition is true', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true, noTransition: true}})
      const $div = wrapper.get('div.popover')
      expect($div.classes()).toContain('popover-instant')
    })

    it('is instant on initial mount with modelValue true, then animates', async () => {
      // When modelValue is true on mount and initialAnimation is false (default),
      // the transition is skipped for the initial render
      // happy-dom has no layout, so the reference always counts as hidden: skip that check
      const wrapper = mount(BPopover, {props: {modelValue: true, noHide: true}})
      const $div = wrapper.get('div.popover')
      expect($div.classes()).toEqual(expect.arrayContaining(['show', 'popover-instant']))
      await flush()
      expect($div.classes()).toContain('show')
      expect($div.classes()).not.toContain('popover-instant')
    })

    it('shows with a transition on mount when initialAnimation is true', async () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, initialAnimation: true, delay: 0},
      })
      const $div = wrapper.get('div.popover')
      expect($div.classes()).not.toContain('popover-instant')
      await nextTick()
      expect($div.classes()).toContain('show')
      expect($div.classes()).not.toContain('popover-instant')
    })

    it('never has the v5 fade class', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true, initialAnimation: true}})
      expect(wrapper.get('div.popover').classes()).not.toContain('fade')
    })

    it('merges bodyAttrs with the popover-body div', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, body: 'test', bodyAttrs: {'class': 'custom-body', 'data-x': '1'}},
      })
      const $body = wrapper.get('div.popover-body')
      expect($body.classes()).toEqual(expect.arrayContaining(['popover-body', 'custom-body']))
      expect($body.attributes('data-x')).toBe('1')
    })

    it('merges titleAttrs with the popover-header div', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, title: 'test', titleAttrs: {class: ['class-a', 'class-b']}},
      })
      const $header = wrapper.get('div.popover-header')
      expect($header.classes()).toEqual(
        expect.arrayContaining(['popover-header', 'position-sticky', 'class-a', 'class-b'])
      )
    })

    it('merges titleAttrs and bodyAttrs with tooltip-inner in tooltip mode', () => {
      const withTitle = mount(BPopover, {
        props: {modelValue: true, tooltip: true, title: 'test', titleAttrs: {class: 'custom'}},
      })
      expect(withTitle.get('div.tooltip-inner').classes()).toContain('custom')
      const withBody = mount(BPopover, {
        props: {modelValue: true, tooltip: true, body: 'test', bodyAttrs: {class: 'custom'}},
      })
      expect(withBody.get('div.tooltip-inner').classes()).toContain('custom')
    })
  })

  describe('arrow element', () => {
    it('has data-popper-arrow attribute', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true}})
      const $arrow = wrapper.find('[data-popper-arrow]')
      expect($arrow.exists()).toBe(true)
    })
  })

  describe('activator', () => {
    it('renders no placeholder element', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true, id: 'test-id'}})
      expect(wrapper.find('span[style="display: none;"]').exists()).toBe(false)
      expect(document.getElementById('test-id_placeholder')).toBeNull()
    })

    it('renders activator slot content', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true},
        slots: {activator: '<button class="activator-btn">Click me</button>'},
      })
      const $btn = wrapper.find('.activator-btn')
      expect($btn.exists()).toBe(true)
      expect($btn.text()).toBe('Click me')
    })

    it('activator slot receives the show/hide scope and props', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, id: 'test-popover'},
        slots: {
          activator: `<template #activator="scope"><span class="activator-scope">{{ scope.id }} {{ typeof scope.props.ref }}</span></template>`,
        },
      })
      expect(wrapper.get('.activator-scope').text()).toBe('test-popover function')
    })

    it('slot props carry only the listeners of the active triggers', () => {
      let captured: Record<string, unknown> = {}
      const wrapper = mount(BPopover, {
        props: {click: true},
        slots: {
          activator: (scope: {props: Record<string, unknown>}) => {
            captured = scope.props
            return h('button', scope.props, 'Test')
          },
        },
      })
      expect(Object.keys(captured).sort()).toEqual(['aria-describedby', 'onClick', 'ref'])
      wrapper.unmount()
    })

    it('slot props set aria-describedby on the slot element while active', async () => {
      const wrapper = mount(BPopover, {
        props: {id: 'pop', delay: 0, noHide: true},
        slots: {activator: activatorButton},
        attachTo: document.body,
      })
      const $btn = wrapper.get('button')
      expect($btn.attributes('aria-describedby')).toBeUndefined()
      await wrapper.setProps({modelValue: true})
      await flush()
      expect($btn.attributes('aria-describedby')).toBe('pop')
      await wrapper.setProps({modelValue: false})
      await flush()
      expect($btn.attributes('aria-describedby')).toBeUndefined()
      wrapper.unmount()
    })

    it('binds the listeners on an element given through the activator prop', async () => {
      const button = document.createElement('button')
      button.id = 'outside-activator'
      document.body.appendChild(button)
      const wrapper = mount(BPopover, {
        props: {activator: 'outside-activator', click: true},
        attachTo: document.body,
      })
      button.click()
      await flush()
      expect(wrapper.emitted('show')).toHaveLength(1)
      wrapper.unmount()
      button.remove()
    })
  })

  describe('content rendering', () => {
    it('popover-header has position-sticky and top-0 classes', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, title: 'test'},
      })
      const $header = wrapper.get('div.popover-header')
      expect($header.classes()).toContain('position-sticky')
      expect($header.classes()).toContain('top-0')
    })

    it('does not render popover-header when no title prop or slot', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, body: 'just body'},
      })
      const $header = wrapper.find('.popover-header')
      expect($header.exists()).toBe(false)
    })

    it('renders both popover-header and popover-body when both title and body are set', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, title: 'my title', body: 'my body'},
      })
      expect(wrapper.find('.popover-header').exists()).toBe(true)
      expect(wrapper.find('.popover-body').exists()).toBe(true)
      expect(wrapper.get('.popover-header').text()).toBe('my title')
      expect(wrapper.get('.popover-body').text()).toBe('my body')
    })

    it('renders title slot with HTML content', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true},
        slots: {title: '<strong>Bold Title</strong>'},
      })
      const $header = wrapper.get('.popover-header')
      expect($header.find('strong').exists()).toBe(true)
      expect($header.text()).toBe('Bold Title')
    })

    it('renders default slot with HTML content', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true},
        slots: {default: '<em>Italic body</em>'},
      })
      expect(wrapper.find('em').exists()).toBe(true)
      expect(wrapper.find('em').text()).toBe('Italic body')
    })

    it('title slot provides scoped data', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, id: 'scoped-test'},
        slots: {
          title: `<template #title="scope"><span class="scoped">{{ scope.id }}</span></template>`,
        },
      })
      const $scoped = wrapper.find('.scoped')
      expect($scoped.exists()).toBe(true)
      expect($scoped.text()).toBe('scoped-test')
    })

    it('default slot provides scoped data', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, id: 'scoped-body'},
        slots: {
          default: `<template #default="scope"><span class="scoped">{{ scope.id }}</span></template>`,
        },
      })
      const $scoped = wrapper.find('.scoped')
      expect($scoped.exists()).toBe(true)
      expect($scoped.text()).toBe('scoped-body')
    })
  })

  describe('noSize prop', () => {
    it('b-floating-size class is always present on content div regardless of noSize', () => {
      const wrapper = mount(BPopover, {
        props: {modelValue: true, noSize: true},
      })
      // b-floating-size is a static class on the content div;
      // noSize controls whether the sizeMiddleware is included, not this class
      const $div = wrapper.find('.b-floating-size')
      expect($div.exists()).toBe(true)
    })
  })

  describe('expose', () => {
    it('exposes hide method', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true}})
      expect(typeof wrapper.vm.hide).toBe('function')
    })

    it('exposes show method', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true}})
      expect(typeof wrapper.vm.show).toBe('function')
    })

    it('exposes toggle method', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true}})
      expect(typeof wrapper.vm.toggle).toBe('function')
    })
  })

  describe('id generation', () => {
    it('generates an id when id prop is not provided', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true}})
      const $div = wrapper.get('div.popover')
      expect($div.attributes('id')).toBeDefined()
      expect($div.attributes('id')).not.toBe('')
    })

    it('uses provided id prop', () => {
      const wrapper = mount(BPopover, {props: {modelValue: true, id: 'custom-id'}})
      const $div = wrapper.get('div.popover')
      expect($div.attributes('id')).toBe('custom-id')
    })

    it('id is reactive', async () => {
      const wrapper = mount(BPopover, {props: {modelValue: true, id: 'first-id'}})
      const $div = wrapper.get('div.popover')
      expect($div.attributes('id')).toBe('first-id')
      await wrapper.setProps({id: 'second-id'})
      expect($div.attributes('id')).toBe('second-id')
    })
  })

  describe('native transition path', () => {
    const mountWithActivator = (props: Record<string, unknown> = {}) =>
      mount(BPopover, {
        // happy-dom has no layout, so the reference always counts as hidden: skip that check
        props: {body: 'test', delay: 0, id: 'tip', noHide: true, ...props},
        slots: {activator: activatorButton},
        attachTo: document.body,
      })

    it('renders no Vue transition and toggles only the show class', async () => {
      const wrapper = mountWithActivator()
      const $div = wrapper.get('div.popover')
      expect($div.classes()).not.toContain('show')
      expect(($div.element as HTMLElement).style.display).toBe('none')

      await wrapper.setProps({modelValue: true})
      expect($div.classes()).toContain('show')
      expect(($div.element as HTMLElement).style.display).not.toBe('none')
      await flush()
      expect(wrapper.emitted('shown')).toHaveLength(1)

      await wrapper.setProps({modelValue: false})
      expect($div.classes()).not.toContain('show')
      // Still displayed until the fade ended
      expect(($div.element as HTMLElement).style.display).not.toBe('none')
      await flush()
      expect(wrapper.emitted('hidden')).toHaveLength(1)
      expect(($div.element as HTMLElement).style.display).toBe('none')
    })

    it('waits for the element transition before shown', async () => {
      let finish!: () => void
      const proto = HTMLElement.prototype as unknown as {getAnimations?: () => Animation[]}
      const original = proto.getAnimations
      proto.getAnimations = function (this: HTMLElement) {
        if (!this.classList.contains('popover') || this.classList.contains('popover-instant'))
          return []
        const finished = new Promise<void>((resolve) => {
          finish = resolve
        })
        return [
          {finished, effect: {getComputedTiming: () => ({endTime: 150})}} as unknown as Animation,
        ]
      }
      try {
        const wrapper = mountWithActivator()
        await wrapper.setProps({modelValue: true})
        await flush()
        expect(wrapper.emitted('show')).toHaveLength(1)
        expect(wrapper.emitted('shown')).toBeUndefined()
        finish()
        await flush()
        expect(wrapper.emitted('shown')).toHaveLength(1)
      } finally {
        if (original) proto.getAnimations = original
        else delete proto.getAnimations
      }
    })

    it('Escape hides it with trigger esc and consumes the key press', async () => {
      const wrapper = mountWithActivator({modelValue: true})
      await flush()
      const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
      const stop = vi.spyOn(event, 'stopPropagation')
      document.body.dispatchEvent(event)
      await flush()
      expect(event.defaultPrevented).toBe(true)
      expect(stop).toHaveBeenCalled()
      const hidden = wrapper.emitted('hidden') as [{trigger: string | null}][]
      expect(hidden).toHaveLength(1)
      expect(hidden[0]?.[0].trigger).toBe('esc')
      expect(wrapper.emitted('esc')).toBeUndefined()
    })

    it('Escape is left alone while hidden', async () => {
      const wrapper = mountWithActivator()
      const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
      document.body.dispatchEvent(event)
      await flush()
      expect(event.defaultPrevented).toBe(false)
      expect(wrapper.emitted('hide')).toBeUndefined()
    })

    it.each(['manual', 'noAutoClose'])('Escape does not hide with %s', async (prop) => {
      const wrapper = mountWithActivator({modelValue: true, [prop]: true})
      await flush()
      const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
      document.body.dispatchEvent(event)
      await flush()
      expect(event.defaultPrevented).toBe(false)
      expect(wrapper.emitted('hide')).toBeUndefined()
    })

    it('sets aria-describedby on the slot activator while shown', async () => {
      const wrapper = mountWithActivator()
      const button = wrapper.get('button')
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(button.attributes('aria-describedby')).toBe('tip')
      await wrapper.setProps({modelValue: false})
      await flush()
      expect(button.attributes('aria-describedby')).toBeUndefined()
    })

    it("adds to an activator prop element's own aria-describedby and removes only its id", async () => {
      const button = document.createElement('button')
      button.id = 'pop-activator'
      button.setAttribute('aria-describedby', 'help')
      document.body.appendChild(button)
      const wrapper = mount(BPopover, {
        props: {body: 'test', delay: 0, id: 'tip', noHide: true, activator: 'pop-activator'},
        attachTo: document.body,
      })
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(button.getAttribute('aria-describedby')).toBe('help tip')
      await wrapper.setProps({modelValue: false})
      await flush()
      expect(button.getAttribute('aria-describedby')).toBe('help')
      await wrapper.setProps({modelValue: true})
      await flush()
      wrapper.unmount()
      expect(button.getAttribute('aria-describedby')).toBe('help')
      button.remove()
    })
  })
})
