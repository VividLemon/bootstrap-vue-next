import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {nextTick} from 'vue'
import BTooltip from './BTooltip.vue'

/** Let Vue patch and a few animation frames pass */
const flush = async (frames = 3) => {
  for (let i = 0; i < frames; i++) {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  }
  await nextTick()
}
import BPopover from '../BPopover/BPopover.vue'

describe('tooltip', () => {
  enableAutoUnmount(afterEach)

  it('forwards the trigger through its exposed hide', () => {
    const wrapper = mount(BTooltip, {props: {modelValue: true}})
    ;(wrapper.vm as unknown as {hide: (trigger?: string, noTriggerEmit?: boolean) => void}).hide(
      'abort',
      true
    )
    const hide = wrapper.emitted('hide')?.[0]?.[0] as {trigger: string | null} | undefined
    expect(hide?.trigger).toBe('abort')
    expect(wrapper.emitted('abort')).toBeUndefined()
  })

  it('renders BPopover child component', () => {
    const wrapper = mount(BTooltip, {props: {modelValue: true}})
    expect(wrapper.findComponent(BPopover).exists()).toBe(true)
  })

  it('passes tooltip prop to BPopover', () => {
    const wrapper = mount(BTooltip, {props: {modelValue: true}})
    const popover = wrapper.findComponent(BPopover)
    expect(popover.props('tooltip')).toBe(true)
  })

  it('has tooltip class', () => {
    const wrapper = mount(BTooltip, {props: {modelValue: true}})
    const $div = wrapper.find('div.tooltip')
    expect($div.exists()).toBe(true)
  })

  it('has b-tooltip class', () => {
    const wrapper = mount(BTooltip, {props: {modelValue: true}})
    const $div = wrapper.get('div.tooltip')
    expect($div.classes()).toContain('b-tooltip')
  })

  it('does not have popover class', () => {
    const wrapper = mount(BTooltip, {props: {modelValue: true}})
    const $div = wrapper.get('div.tooltip')
    expect($div.classes()).not.toContain('popover')
    expect($div.classes()).not.toContain('b-popover')
  })

  it('has role tooltip', () => {
    const wrapper = mount(BTooltip, {props: {modelValue: true}})
    const $div = wrapper.get('div.tooltip')
    expect($div.attributes('role')).toBe('tooltip')
  })

  it('has tabindex -1', () => {
    const wrapper = mount(BTooltip, {props: {modelValue: true}})
    const $div = wrapper.get('div.tooltip')
    expect($div.attributes('tabindex')).toBe('-1')
  })

  describe('title rendering', () => {
    it('renders title from title prop', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, title: 'my tooltip'},
      })
      const $inner = wrapper.find('.tooltip-inner')
      expect($inner.exists()).toBe(true)
      expect($inner.text()).toBe('my tooltip')
    })

    it('renders title from title slot', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true},
        slots: {title: 'slot tooltip'},
      })
      const $inner = wrapper.find('.tooltip-inner')
      expect($inner.exists()).toBe(true)
      expect($inner.text()).toBe('slot tooltip')
    })

    it('title slot takes precedence over title prop', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, title: 'prop title'},
        slots: {title: 'slot title'},
      })
      const $inner = wrapper.find('.tooltip-inner')
      expect($inner.text()).toBe('slot title')
    })

    it('renders title slot with HTML content', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true},
        slots: {title: '<strong>Bold</strong>'},
      })
      const $inner = wrapper.find('.tooltip-inner')
      expect($inner.find('strong').exists()).toBe(true)
      expect($inner.text()).toBe('Bold')
    })
  })

  describe('default slot', () => {
    it('renders content from default slot', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true},
        slots: {default: 'tooltip body'},
      })
      expect(wrapper.text()).toContain('tooltip body')
    })

    it('renders default slot with HTML content', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true},
        slots: {default: '<em>italic content</em>'},
      })
      expect(wrapper.find('em').exists()).toBe(true)
      expect(wrapper.find('em').text()).toBe('italic content')
    })
  })

  describe('target slot', () => {
    it('renders target slot content', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true},
        slots: {target: '<button class="target-btn">Hover me</button>'},
      })
      const $btn = wrapper.find('.target-btn')
      expect($btn.exists()).toBe(true)
      expect($btn.text()).toBe('Hover me')
    })
  })

  describe('arrow element', () => {
    it('has tooltip-arrow class', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      const $arrow = wrapper.find('.tooltip-arrow')
      expect($arrow.exists()).toBe(true)
    })

    it('does not have popover-arrow class', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      expect(wrapper.find('.popover-arrow').exists()).toBe(false)
    })

    it('has data-popper-arrow attribute', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      const $arrow = wrapper.find('[data-popper-arrow]')
      expect($arrow.exists()).toBe(true)
    })
  })

  describe('interactive and noninteractive props', () => {
    it('defaults to noninteractive=true on BPopover', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      const popover = wrapper.findComponent(BPopover)
      expect(popover.props('noninteractive')).toBe(true)
    })

    it('sets noninteractive=false when interactive=true', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, interactive: true},
      })
      const popover = wrapper.findComponent(BPopover)
      expect(popover.props('noninteractive')).toBe(false)
    })

    it('sets noninteractive=true when interactive=false', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, interactive: false},
      })
      const popover = wrapper.findComponent(BPopover)
      expect(popover.props('noninteractive')).toBe(true)
    })

    it('noninteractive prop takes precedence over interactive', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, interactive: true, noninteractive: true},
      })
      const popover = wrapper.findComponent(BPopover)
      expect(popover.props('noninteractive')).toBe(true)
    })
  })

  describe('id', () => {
    it('generates an id when id prop is not provided', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      const $div = wrapper.get('div.tooltip')
      expect($div.attributes('id')).toBeDefined()
      expect($div.attributes('id')).not.toBe('')
    })

    it('uses provided id prop', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true, id: 'custom-id'}})
      const $div = wrapper.get('div.tooltip')
      expect($div.attributes('id')).toBe('custom-id')
    })
  })

  describe('expose', () => {
    it('exposes hide method', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      expect(typeof wrapper.vm.hide).toBe('function')
    })

    it('exposes show method', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      expect(typeof wrapper.vm.show).toBe('function')
    })

    it('exposes toggle method', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      expect(typeof wrapper.vm.toggle).toBe('function')
    })
  })

  describe('events', () => {
    it('forwards show event', async () => {
      const wrapper = mount(BTooltip, {
        props: {body: 'test'},
        slots: {target: '<button>Test</button>'},
        attachTo: document.body,
      })

      const button = wrapper.find('button')
      await button.trigger('pointerenter')
      expect(wrapper.emitted('show')).toBeTruthy()

      wrapper.unmount()
    })

    it('forwards show event on focus trigger', async () => {
      const wrapper = mount(BTooltip, {
        props: {body: 'test'},
        slots: {target: '<button>Test</button>'},
        attachTo: document.body,
      })

      const button = wrapper.find('button')
      await button.trigger('focus')
      expect(wrapper.emitted('show')).toBeTruthy()

      wrapper.unmount()
    })
  })

  describe('triggers', () => {
    it('defaults to hover and focus triggers', async () => {
      const wrapper = mount(BTooltip, {
        props: {body: 'test'},
        slots: {target: '<button>Test</button>'},
        attachTo: document.body,
      })

      const button = wrapper.find('button')

      await button.trigger('pointerenter')
      expect(wrapper.emitted('show')).toBeTruthy()

      // Already showing: a second trigger joins the show in progress
      await button.trigger('focus')
      expect(wrapper.emitted('show')).toHaveLength(1)

      wrapper.unmount()
    })

    it('respects click prop', async () => {
      const wrapper = mount(BTooltip, {
        props: {click: true, body: 'test'},
        slots: {target: '<button>Test</button>'},
        attachTo: document.body,
      })

      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.emitted('show')).toBeTruthy()

      wrapper.unmount()
    })

    it('respects manual prop to disable all triggers', async () => {
      const wrapper = mount(BTooltip, {
        props: {manual: true, body: 'test'},
        slots: {target: '<button>Test</button>'},
        attachTo: document.body,
      })

      const button = wrapper.find('button')
      await button.trigger('click')
      await button.trigger('pointerenter')
      await button.trigger('focus')
      expect(wrapper.emitted('show')).toBeFalsy()

      wrapper.unmount()
    })
  })

  describe('classes', () => {
    it('has the tooltip-instant class when noTransition is true', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true, noTransition: true}})
      const $div = wrapper.get('div.tooltip')
      expect($div.classes()).toContain('tooltip-instant')
    })

    it('is instant on initial mount with modelValue true, then animates', async () => {
      // When modelValue is true on mount and initialAnimation is false (default),
      // the transition is skipped for the initial render
      // happy-dom has no layout, so the reference always counts as hidden: skip that check
      const wrapper = mount(BTooltip, {props: {modelValue: true, noHide: true}})
      const $div = wrapper.get('div.tooltip')
      expect($div.classes()).toEqual(expect.arrayContaining(['show', 'tooltip-instant']))
      await flush()
      expect($div.classes()).toContain('show')
      expect($div.classes()).not.toContain('tooltip-instant')
    })

    it('shows with a transition on mount when initialAnimation is true', async () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, initialAnimation: true, delay: 0},
      })
      const $div = wrapper.get('div.tooltip')
      expect($div.classes()).not.toContain('tooltip-instant')
      await nextTick()
      expect($div.classes()).toContain('show')
      expect($div.classes()).not.toContain('tooltip-instant')
    })

    it('never has the v5 fade class', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true, initialAnimation: true}})
      expect(wrapper.get('div.tooltip').classes()).not.toContain('fade')
    })
  })

  describe('content div', () => {
    it('has b-floating-size class', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      const $div = wrapper.find('.b-floating-size')
      expect($div.exists()).toBe(true)
    })

    it('has overflow-auto class', () => {
      const wrapper = mount(BTooltip, {props: {modelValue: true}})
      const $div = wrapper.find('.b-floating-size')
      expect($div.classes()).toContain('overflow-auto')
    })
  })

  describe('prop pass-through', () => {
    it('passes placement prop to BPopover', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, placement: 'bottom'},
      })
      const popover = wrapper.findComponent(BPopover)
      expect(popover.props('placement')).toBe('bottom')
    })

    it('passes noFlip prop to BPopover', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, noFlip: true},
      })
      const popover = wrapper.findComponent(BPopover)
      expect(popover.props('noFlip')).toBe(true)
    })

    it('passes noShift prop to BPopover', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, noShift: true},
      })
      const popover = wrapper.findComponent(BPopover)
      expect(popover.props('noShift')).toBe(true)
    })

    it('passes title prop to BPopover', () => {
      const wrapper = mount(BTooltip, {
        props: {modelValue: true, title: 'test title'},
      })
      const popover = wrapper.findComponent(BPopover)
      expect(popover.props('title')).toBe('test title')
    })
  })

  describe('native transition path', () => {
    const mountWithTarget = (props: Record<string, unknown> = {}) =>
      mount(BTooltip, {
        // happy-dom has no layout, so the reference always counts as hidden: skip that check
        props: {body: 'test', delay: 0, id: 'tip', noHide: true, ...props},
        slots: {target: '<button>Test</button>'},
        attachTo: document.body,
      })

    it('renders no Vue transition and toggles only the show class', async () => {
      const wrapper = mountWithTarget()
      const $div = wrapper.get('div.tooltip')
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
        if (!this.classList.contains('tooltip') || this.classList.contains('tooltip-instant'))
          return []
        const finished = new Promise<void>((resolve) => {
          finish = resolve
        })
        return [
          {finished, effect: {getComputedTiming: () => ({endTime: 150})}} as unknown as Animation,
        ]
      }
      try {
        const wrapper = mountWithTarget()
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
      const wrapper = mountWithTarget({modelValue: true})
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
      const wrapper = mountWithTarget()
      const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
      document.body.dispatchEvent(event)
      await flush()
      expect(event.defaultPrevented).toBe(false)
      expect(wrapper.emitted('hide')).toBeUndefined()
    })

    it.each(['manual', 'noAutoClose'])('Escape does not hide with %s', async (prop) => {
      const wrapper = mountWithTarget({modelValue: true, [prop]: true})
      await flush()
      const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
      document.body.dispatchEvent(event)
      await flush()
      expect(event.defaultPrevented).toBe(false)
      expect(wrapper.emitted('hide')).toBeUndefined()
    })

    it('sets aria-describedby on the trigger while shown and keeps other ids', async () => {
      const wrapper = mountWithTarget()
      const button = wrapper.get('button').element
      button.setAttribute('aria-describedby', 'help')
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(button.getAttribute('aria-describedby')).toBe('help tip')
      await wrapper.setProps({modelValue: false})
      await flush()
      expect(button.getAttribute('aria-describedby')).toBe('help')
    })

    it('removes aria-describedby again when it added the attribute', async () => {
      const wrapper = mountWithTarget({modelValue: true})
      const button = wrapper.get('button').element
      await flush()
      expect(button.getAttribute('aria-describedby')).toBe('tip')
      wrapper.unmount()
      expect(button.hasAttribute('aria-describedby')).toBe(false)
    })

    it('forwards every argument of the exposed methods', async () => {
      const wrapper = mountWithTarget({modelValue: true})
      await flush()
      const vm = wrapper.vm as unknown as {
        hide: (trigger?: string, noTriggerEmit?: boolean) => Promise<boolean | string>
        show: (resolveOnHide?: boolean) => Promise<boolean | string>
      }
      await expect(vm.hide('custom', true)).resolves.toBe('custom')
      const hidden = wrapper.emitted('hidden') as [{trigger: string | null}][]
      expect(hidden[0]?.[0].trigger).toBe('custom')
      // show(true) resolves with the trigger of the hide that follows
      const cycle = vm.show(true)
      await flush()
      void vm.hide('again', true)
      await expect(cycle).resolves.toBe('again')
    })
  })
})
