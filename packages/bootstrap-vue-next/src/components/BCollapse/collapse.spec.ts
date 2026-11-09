import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {defineComponent, h, nextTick, Transition} from 'vue'
import BCollapse from './BCollapse.vue'
import type {BvTriggerableEvent} from '../../utils'
import {useToggle} from '../../composables/useToggle'
import {createBootstrap} from '../../plugins'

/** Let Vue patch and a few animation frames pass */
const flush = async (frames = 3) => {
  for (let i = 0; i < frames; i++) {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  }
  await nextTick()
}

/**
 * happy-dom has no Web Animations API. This installs a fake `getAnimations()` that reports one
 * running transition on every `.collapse` element without `transition-none`, finished only when
 * the test calls `finishAll()`. Superseded transitions are "cancelled" like a browser does.
 */
const installFakeAnimations = () => {
  const running: {el: Element; resolve: () => void; reject: (e: unknown) => void}[] = []
  const proto = HTMLElement.prototype as unknown as {getAnimations?: () => Animation[]}
  const original = proto.getAnimations
  proto.getAnimations = function (this: HTMLElement) {
    if (!this.classList.contains('collapse') || this.classList.contains('transition-none')) {
      return []
    }
    // a new transition on the same element cancels the old one
    running
      .filter((r) => r.el === this)
      .forEach((r) => r.reject(new DOMException('cancelled', 'AbortError')))
    let resolve!: () => void
    let reject!: (e: unknown) => void
    const finished = new Promise<void>((res, rej) => {
      resolve = res
      reject = rej
    })
    finished.catch(() => {})
    running.push({el: this, resolve, reject})
    return [{finished, effect: {getComputedTiming: () => ({endTime: 350})}} as unknown as Animation]
  }
  return {
    get count() {
      return running.length
    },
    finishAll: async () => {
      running.splice(0).forEach((r) => r.resolve())
      await flush()
    },
    restore: () => {
      if (original) proto.getAnimations = original
      else delete proto.getAnimations
    },
  }
}

const getCollapse = (wrapper: ReturnType<typeof mount>) => wrapper.get('.collapse')

describe('collapse', () => {
  enableAutoUnmount(afterEach)

  // --- Static structure ---
  it('has static class collapse', () => {
    const wrapper = mount(BCollapse)
    expect(wrapper.findAll('*')[0].classes()).toContain('collapse')
  })

  it('does not use a Vue Transition', () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true}})
    expect(wrapper.findComponent(Transition).exists()).toBe(false)
  })

  it('has default tag div', () => {
    const wrapper = mount(BCollapse)
    expect(getCollapse(wrapper).element.tagName).toBe('DIV')
  })

  it('is tag when prop tag', () => {
    const wrapper = mount(BCollapse, {props: {tag: 'span'}})
    expect(getCollapse(wrapper).element.tagName).toBe('SPAN')
  })

  // --- id prop ---
  it('has default id containing collapse', () => {
    const wrapper = mount(BCollapse)
    expect(getCollapse(wrapper).attributes('id')).toContain('collapse')
  })

  it('has id as prop id', () => {
    const wrapper = mount(BCollapse, {props: {id: 'foobar'}})
    expect(getCollapse(wrapper).attributes('id')).toBe('foobar')
  })

  // --- isNav prop ---
  it('has attribute is-nav when prop is nav', async () => {
    const wrapper = mount(BCollapse, {props: {isNav: true}})
    expect(getCollapse(wrapper).attributes('is-nav')).toBe('true')
    await wrapper.setProps({isNav: false})
    expect(getCollapse(wrapper).attributes('is-nav')).toBe('false')
  })

  it.each([
    {props: {isNav: true, modelValue: true}, className: 'navbar-collapse', expected: true},
    {props: {isNav: false, modelValue: true}, className: 'navbar-collapse', expected: false},
    {props: {horizontal: true, modelValue: true}, className: 'collapse-horizontal', expected: true},
    {
      props: {horizontal: true, modelValue: false},
      className: 'collapse-horizontal',
      expected: true,
    },
    {
      props: {horizontal: false, modelValue: true},
      className: 'collapse-horizontal',
      expected: false,
    },
    {props: {modelValue: true}, className: 'show', expected: true},
    {props: {modelValue: false}, className: 'show', expected: false},
    {props: {visible: true}, className: 'show', expected: true},
  ])('$className class with $props is $expected', ({props, className, expected}) => {
    const wrapper = mount(BCollapse, {props})
    expect(getCollapse(wrapper).classes().includes(className)).toBe(expected)
  })

  it('has only collapse class when modelValue false and no extra props', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: false}})
    await flush()
    expect(getCollapse(wrapper).classes()).toEqual(['collapse'])
  })

  // --- Native v6 mechanism: CSS owns the motion ---
  it('never sets inline size styles or the v5 collapsing class', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: false}})
    const $el = getCollapse(wrapper)
    expect($el.attributes('style')).toBeUndefined()
    await wrapper.setProps({modelValue: true})
    expect($el.classes()).not.toContain('collapsing')
    await flush()
    expect($el.attributes('style')).toBeUndefined()
    expect($el.classes()).not.toContain('collapsing')
    await wrapper.setProps({modelValue: false})
    await flush()
    expect($el.attributes('style')).toBeUndefined()
    expect($el.classes()).not.toContain('collapsing')
  })

  it('keeps the element mounted while hidden', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true}})
    await flush()
    await wrapper.setProps({modelValue: false})
    await flush()
    expect(wrapper.find('.collapse').exists()).toBe(true)
  })

  it('adds the show class as soon as a show starts', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: false}})
    wrapper.vm.show()
    await nextTick()
    expect(getCollapse(wrapper).classes()).toContain('show')
  })

  it('removes the show class as soon as a hide starts', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true}})
    await flush()
    wrapper.vm.hide()
    await nextTick()
    expect(getCollapse(wrapper).classes()).not.toContain('show')
  })

  // --- noTransition ---
  it('has class transition-none when noTransition', async () => {
    const wrapper = mount(BCollapse, {props: {noTransition: true}})
    await flush()
    expect(getCollapse(wrapper).classes()).toContain('transition-none')
  })

  it('zeroes the collapse duration token inline when noTransition (v6 alpha.1 layer workaround)', async () => {
    const wrapper = mount(BCollapse, {props: {noTransition: true}})
    await flush()
    expect(getCollapse(wrapper).attributes('style')).toContain(
      '--bs-transition-collapse-duration: 0s'
    )
    await wrapper.setProps({noTransition: false})
    expect(getCollapse(wrapper).attributes('style')).toBeFalsy()
  })

  it('does not have class transition-none by default', async () => {
    const wrapper = mount(BCollapse)
    await flush()
    expect(getCollapse(wrapper).classes()).not.toContain('transition-none')
  })

  it('renders an initially shown collapse with transition-none until mounted, then removes it', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true}})
    expect(getCollapse(wrapper).classes()).toContain('transition-none')
    await flush()
    expect(getCollapse(wrapper).classes()).not.toContain('transition-none')
    expect(getCollapse(wrapper).classes()).toContain('show')
  })

  describe('transition timing', () => {
    let animations: ReturnType<typeof installFakeAnimations>
    beforeEach(() => {
      animations = installFakeAnimations()
    })
    afterEach(() => {
      animations.restore()
    })

    it('emits shown only after the CSS transition finished', async () => {
      const wrapper = mount(BCollapse, {props: {modelValue: false}})
      await flush()
      wrapper.vm.show()
      await flush()
      expect(wrapper.emitted('show')).toHaveLength(1)
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
      expect(wrapper.emitted('shown')).toBeUndefined()
      expect(animations.count).toBe(1)
      await animations.finishAll()
      expect(wrapper.emitted('shown')).toHaveLength(1)
    })

    it('emits hidden only after the CSS transition finished', async () => {
      const wrapper = mount(BCollapse, {props: {modelValue: true}})
      await flush()
      wrapper.vm.hide()
      await flush()
      expect(wrapper.emitted('hide')).toHaveLength(1)
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
      expect(wrapper.emitted('hidden')).toBeUndefined()
      await animations.finishAll()
      expect(wrapper.emitted('hidden')).toHaveLength(1)
    })

    it('with noTransition emits shown on the next frame without waiting', async () => {
      const wrapper = mount(BCollapse, {props: {modelValue: false, noTransition: true}})
      await flush()
      wrapper.vm.show()
      await flush()
      expect(animations.count).toBe(0)
      expect(wrapper.emitted('shown')).toHaveLength(1)
    })

    it('rapid toggling never emits a stale shown and ends in the last state', async () => {
      const wrapper = mount(BCollapse, {props: {modelValue: false}})
      await flush()
      wrapper.vm.show()
      await flush()
      wrapper.vm.hide()
      await flush()
      wrapper.vm.show()
      await flush()
      wrapper.vm.hide()
      await flush()
      await animations.finishAll()

      expect(wrapper.emitted('shown')).toBeUndefined()
      expect(wrapper.emitted('hidden')).toHaveLength(1)
      expect(getCollapse(wrapper).classes()).not.toContain('show')
      expect(wrapper.vm.visible).toBe(false)
      const models = wrapper.emitted('update:modelValue')?.map((e) => e[0])
      expect(models).toEqual([true, false, true, false])
    })

    it('rapid toggling within one frame still settles in the last state', async () => {
      const wrapper = mount(BCollapse, {props: {modelValue: false}})
      await flush()
      wrapper.vm.toggle()
      wrapper.vm.toggle()
      wrapper.vm.toggle()
      await flush()
      await animations.finishAll()
      expect(getCollapse(wrapper).classes()).toContain('show')
      expect(wrapper.emitted('shown')).toHaveLength(1)
      // the hide in between was superseded before it finished
      expect(wrapper.emitted('hidden')).toBeUndefined()
    })

    it('resolves show() with true after shown and a superseded call with false', async () => {
      const wrapper = mount(BCollapse, {props: {modelValue: false}})
      await flush()
      const first = wrapper.vm.show()
      await flush()
      const second = wrapper.vm.hide()
      await flush()
      await expect(first).resolves.toBe(false)
      await animations.finishAll()
      await expect(second).resolves.toBe('')
      const third = wrapper.vm.show()
      await flush()
      await animations.finishAll()
      await expect(third).resolves.toBe(true)
    })

    it('lazy + unmountLazy unmounts content only after hidden', async () => {
      const wrapper = mount(BCollapse, {
        props: {modelValue: true, lazy: true, unmountLazy: true},
        slots: {default: 'lazy-content'},
      })
      await flush()
      expect(wrapper.text()).toContain('lazy-content')
      wrapper.vm.hide()
      await flush()
      // still transitioning out
      expect(wrapper.text()).toContain('lazy-content')
      await animations.finishAll()
      expect(wrapper.emitted('hidden')).toHaveLength(1)
      expect(wrapper.text()).not.toContain('lazy-content')
    })
  })

  // --- modelValue / v-model ---
  it('emits update:modelValue when toggled', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: false}})
    wrapper.vm.toggle()
    await flush()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('emits update:modelValue with false when hiding', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true}})
    await flush()
    wrapper.vm.toggle()
    await flush()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('shows and hides when modelValue changes', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: false}})
    await flush()
    await wrapper.setProps({modelValue: true})
    await flush()
    expect(getCollapse(wrapper).classes()).toContain('show')
    expect(wrapper.emitted('show')).toHaveLength(1)
    expect(wrapper.emitted('shown')).toHaveLength(1)
    await wrapper.setProps({modelValue: false})
    await flush()
    expect(getCollapse(wrapper).classes()).not.toContain('show')
    expect(wrapper.emitted('hide')).toHaveLength(1)
    const hidden = wrapper.emitted('hidden') as [BvTriggerableEvent][]
    expect(hidden).toHaveLength(1)
    expect(hidden[0][0].trigger).toBe('modelValue')
  })

  it.each([
    {method: 'show', modelValue: false, expected: true},
    {method: 'hide', modelValue: true, expected: false},
    {method: 'toggle', modelValue: false, expected: true},
    {method: 'toggle', modelValue: true, expected: false},
  ] as const)(
    '$method with modelValue $modelValue emits update:modelValue $expected',
    async ({method, modelValue, expected}) => {
      const wrapper = mount(BCollapse, {props: {modelValue}})
      await flush()
      wrapper.vm[method]()
      await flush()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([expected])
      expect(getCollapse(wrapper).classes().includes('show')).toBe(expected)
    }
  )

  // --- Events ---
  it('emits show and shown for an initially shown collapse', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true}})
    await flush()
    expect(wrapper.emitted('show')).toHaveLength(1)
    expect(wrapper.emitted('shown')).toHaveLength(1)
  })

  it('does not emit events for an initially hidden collapse', async () => {
    const wrapper = mount(BCollapse)
    await flush()
    expect(wrapper.emitted('show')).toBeUndefined()
    expect(wrapper.emitted('hide')).toBeUndefined()
  })

  it('emits toggle event when toggling', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: false}})
    wrapper.vm.toggle()
    await nextTick()
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('emits shown and hidden with a BvTriggerableEvent', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: false, id: 'evt'}})
    await flush()
    wrapper.vm.show()
    await flush()
    const [[shown]] = wrapper.emitted('shown') as [BvTriggerableEvent][]
    expect(shown.eventType).toBe('shown')
    expect(shown.componentId).toBe('evt')
    expect(shown.target).toBe(getCollapse(wrapper).element)
  })

  it('show can be prevented', async () => {
    const wrapper = mount(BCollapse, {
      props: {
        'modelValue': false,
        'onShow': (e: BvTriggerableEvent) => e.preventDefault(),
        'onUpdate:modelValue': () => {},
      },
    })
    await flush()
    const result = await wrapper.vm.show()
    await flush()
    expect(result).toBe('show-prevented')
    expect(wrapper.emitted('show-prevented')).toHaveLength(1)
    expect(wrapper.emitted('shown')).toBeUndefined()
    expect(getCollapse(wrapper).classes()).not.toContain('show')
  })

  it('a prevented show from v-model reverts modelValue', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false, onShow: (e: BvTriggerableEvent) => e.preventDefault()},
    })
    await flush()
    await wrapper.setProps({modelValue: true})
    await flush()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(getCollapse(wrapper).classes()).not.toContain('show')
  })

  it('an initially shown collapse whose show is prevented ends hidden', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true, onShow: (e: BvTriggerableEvent) => e.preventDefault()},
    })
    await flush()
    expect(wrapper.emitted('show-prevented')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(getCollapse(wrapper).classes()).not.toContain('show')
  })

  it('hide can be prevented', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true, onHide: (e: BvTriggerableEvent) => e.preventDefault()},
    })
    await flush()
    const result = await wrapper.vm.hide()
    await flush()
    expect(result).toBe('hide-prevented')
    expect(wrapper.emitted('hide-prevented')).toHaveLength(1)
    expect(wrapper.emitted('hidden')).toBeUndefined()
    expect(getCollapse(wrapper).classes()).toContain('show')
  })

  it('a prevented hide from v-model reverts modelValue', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true, onHide: (e: BvTriggerableEvent) => e.preventDefault()},
    })
    await flush()
    await wrapper.setProps({modelValue: false})
    await flush()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
    expect(getCollapse(wrapper).classes()).toContain('show')
  })

  it('toggle can be prevented', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false, onToggle: (e: BvTriggerableEvent) => e.preventDefault()},
    })
    await flush()
    const result = await wrapper.vm.toggle()
    expect(result).toBe('toggle-prevented')
    expect(wrapper.emitted('toggle-prevented')).toHaveLength(1)
    expect(wrapper.emitted('show')).toBeUndefined()
  })

  it('show() resolves true when already shown', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true}})
    await flush()
    await expect(wrapper.vm.show()).resolves.toBe(true)
  })

  it('hide() resolves empty string when already hidden', async () => {
    const wrapper = mount(BCollapse)
    await flush()
    await expect(wrapper.vm.hide()).resolves.toBe('')
  })

  it('useToggle().hide(trigger) does not emit the trigger event', async () => {
    let toggle!: ReturnType<typeof useToggle>
    const App = defineComponent({
      setup() {
        toggle = useToggle('toggle-collapse')
        return () => h(BCollapse, {id: 'toggle-collapse', modelValue: true})
      },
    })
    const wrapper = mount(App, {global: {plugins: [createBootstrap()]}})
    await flush()
    await expect(toggle.hide('foo')).resolves.toBe('foo')
    const $collapse = wrapper.findComponent(BCollapse)
    expect($collapse.emitted('foo')).toBeUndefined()
    expect($collapse.emitted('hidden')).toHaveLength(1)
  })

  it('useToggle().show(true) resolves with the trigger once hidden', async () => {
    let toggle!: ReturnType<typeof useToggle>
    const App = defineComponent({
      setup() {
        toggle = useToggle('resolve-collapse')
        return () => h(BCollapse, {id: 'resolve-collapse'})
      },
    })
    mount(App, {global: {plugins: [createBootstrap()]}})
    await flush()
    let resolved: boolean | string | undefined
    toggle.show(true).then((value) => (resolved = value))
    await flush()
    expect(resolved).toBeUndefined()
    await toggle.hide('done')
    await flush()
    expect(resolved).toBe('done')
  })

  // --- visible / show / initialAnimation props ---
  it('visible prop changes show and hide without transition', async () => {
    const wrapper = mount(BCollapse, {props: {visible: false}})
    await flush()
    await wrapper.setProps({visible: true})
    expect(getCollapse(wrapper).classes()).toContain('show')
    expect(getCollapse(wrapper).classes()).toContain('transition-none')
    await flush()
    expect(getCollapse(wrapper).classes()).not.toContain('transition-none')
    expect(wrapper.emitted('shown')).toHaveLength(1)
    await wrapper.setProps({visible: false})
    expect(getCollapse(wrapper).classes()).not.toContain('show')
    expect(getCollapse(wrapper).classes()).toContain('transition-none')
    await flush()
    expect(wrapper.emitted('hidden')).toHaveLength(1)
  })

  it('show prop shows on mount with a transition', async () => {
    const wrapper = mount(BCollapse, {props: {show: true}})
    expect(getCollapse(wrapper).classes()).not.toContain('show')
    await flush()
    expect(getCollapse(wrapper).classes()).toContain('show')
    expect(getCollapse(wrapper).classes()).not.toContain('transition-none')
    expect(wrapper.emitted('shown')).toHaveLength(1)
  })

  it('initialAnimation shows on mount with a transition', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true, initialAnimation: true}})
    expect(getCollapse(wrapper).classes()).not.toContain('show')
    await flush()
    expect(getCollapse(wrapper).classes()).toContain('show')
    expect(getCollapse(wrapper).classes()).not.toContain('transition-none')
    expect(wrapper.emitted('shown')).toHaveLength(1)
  })

  // --- Slot rendering ---
  it('renders default slot', () => {
    const wrapper = mount(BCollapse, {slots: {default: 'foobar'}, props: {modelValue: true}})
    expect(getCollapse(wrapper).text()).toBe('foobar')
  })

  it('renders all slots in order', () => {
    const wrapper = mount(BCollapse, {
      slots: {
        default: 'default',
        header: '<div>header</div>',
        footer: '<div>footer</div>',
      },
      props: {modelValue: true},
    })
    const els = wrapper.findAll('*')
    expect(els[0].text()).toBe('header')
    expect(els[1].text()).toBe('default')
    expect(els[2].text()).toBe('footer')
  })

  it('renders header and footer slots while hidden', () => {
    const wrapper = mount(BCollapse, {
      slots: {header: '<div>header</div>', footer: '<div>footer</div>'},
    })
    expect(wrapper.text()).toContain('header')
    expect(wrapper.text()).toContain('footer')
  })

  it('renders content when not lazy even if hidden', () => {
    const wrapper = mount(BCollapse, {
      props: {lazy: false, modelValue: false},
      slots: {default: 'not-lazy-content'},
    })
    expect(wrapper.text()).toContain('not-lazy-content')
  })

  it('does not render lazy content until shown, then keeps it', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false, lazy: true},
      slots: {default: 'lazy-content'},
    })
    expect(wrapper.text()).not.toContain('lazy-content')
    wrapper.vm.show()
    await nextTick()
    // mounted as soon as the show starts, so it can be measured by the transition
    expect(wrapper.text()).toContain('lazy-content')
    await flush()
    wrapper.vm.hide()
    await flush()
    expect(wrapper.text()).toContain('lazy-content')
  })

  it('unmounts lazy content after hidden when unmountLazy', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true, lazy: true, unmountLazy: true},
      slots: {default: 'lazy-content'},
    })
    await flush()
    expect(wrapper.text()).toContain('lazy-content')
    wrapper.vm.hide()
    await flush()
    expect(wrapper.emitted('hidden')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('lazy-content')
  })

  // --- Slot props ---
  it('slots receive id, visible, active and functions', async () => {
    const wrapper = mount(BCollapse, {
      props: {id: 'test-id', modelValue: true},
      slots: {
        header: ({id, visible, active, toggle, show, hide}) =>
          h('span', `${id},${visible},${active},${typeof toggle},${typeof show},${typeof hide}`),
        footer: ({id, visible}) => h('span', `footer:${id},${visible}`),
        default: ({id, visible}) => `default:${id},${visible}`,
      },
    })
    expect(wrapper.text()).toContain('test-id,true,true,function,function,function')
    expect(wrapper.text()).toContain('footer:test-id,true')
    expect(wrapper.text()).toContain('default:test-id,true')
  })

  it('slot visible is false when hidden', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false},
      slots: {header: ({visible}) => `visible:${visible}`},
    })
    expect(wrapper.text()).toContain('visible:false')
  })

  it('slot active stays true until hidden fires', async () => {
    const animations = installFakeAnimations()
    try {
      const wrapper = mount(BCollapse, {
        props: {modelValue: true},
        slots: {header: ({visible, active}) => `state:${visible},${active}`},
      })
      await flush()
      wrapper.vm.hide()
      await flush()
      expect(wrapper.text()).toContain('state:false,true')
      await animations.finishAll()
      expect(wrapper.text()).toContain('state:false,false')
    } finally {
      animations.restore()
    }
  })

  // --- defineExpose ---
  it('exposes toggle, show and hide', () => {
    const wrapper = mount(BCollapse)
    expect(typeof wrapper.vm.toggle).toBe('function')
    expect(typeof wrapper.vm.show).toBe('function')
    expect(typeof wrapper.vm.hide).toBe('function')
  })

  it('exposes visible', async () => {
    const wrapper = mount(BCollapse, {props: {modelValue: true}})
    expect(wrapper.vm.visible).toBe(true)
    await wrapper.setProps({modelValue: false})
    expect(wrapper.vm.visible).toBe(false)
  })

  it('exposes isNav', () => {
    expect(mount(BCollapse, {props: {isNav: true}}).vm.isNav).toBe(true)
    expect(mount(BCollapse).vm.isNav).toBe(false)
  })

  // --- inheritAttrs: false ---
  it('passes extra attrs to the collapse element', () => {
    const wrapper = mount(BCollapse, {attrs: {'data-testid': 'my-collapse'}})
    expect(getCollapse(wrapper).attributes('data-testid')).toBe('my-collapse')
  })

  it('has all expected classes when isNav and horizontal and modelValue true', async () => {
    const wrapper = mount(BCollapse, {props: {isNav: true, horizontal: true, modelValue: true}})
    await flush()
    expect(getCollapse(wrapper).classes()).toEqual(
      expect.arrayContaining(['collapse', 'show', 'navbar-collapse', 'collapse-horizontal'])
    )
  })
})
