import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {nextTick, Transition} from 'vue'
import BCollapse from './BCollapse.vue'

describe('collapse', () => {
  enableAutoUnmount(afterEach)

  // --- Static structure ---
  it('has static class collapse', () => {
    const wrapper = mount(BCollapse)
    expect(wrapper.findAll('*')[1].classes()).toContain('collapse')
  })

  it('has Transition component', () => {
    const wrapper = mount(BCollapse)
    const $transition = wrapper.findComponent(Transition)
    expect($transition.exists()).toBe(true)
  })

  it('has default tag TRANSITION', () => {
    const wrapper = mount(BCollapse)
    expect(wrapper.findAll('*')[0].element.tagName).toBe('TRANSITION-STUB')
  })

  it('has default tag div', () => {
    const wrapper = mount(BCollapse)
    expect(wrapper.findAll('*')[1].element.tagName).toBe('DIV')
  })

  it('is tag when prop tag', () => {
    const wrapper = mount(BCollapse, {
      props: {tag: 'span'},
    })
    expect(wrapper.findAll('*')[1].element.tagName).toBe('SPAN')
  })

  // --- id prop ---
  it('has default id', () => {
    const wrapper = mount(BCollapse)
    expect(wrapper.findAll('*')[1].attributes('id')).toBeDefined()
  })

  it('has id as prop id', () => {
    const wrapper = mount(BCollapse, {
      props: {id: 'foobar'},
    })
    expect(wrapper.findAll('*')[1].attributes?.('id')).toBe('foobar')
  })

  it('default id contains collapse', () => {
    const wrapper = mount(BCollapse)
    const id = wrapper.findAll('*')[1].attributes('id')
    expect(id).toContain('collapse')
  })

  // --- isNav prop ---
  it('has attribute is-nav when prop is nav', async () => {
    const wrapper = mount(BCollapse, {
      props: {isNav: true},
    })
    expect(wrapper.findAll('*')[1].attributes('is-nav')).toBe('true')
    await wrapper.setProps({isNav: false})
    expect(wrapper.findAll('*')[1].attributes('is-nav')).toBe('false')
  })

  it.each([
    {
      caseName: 'navbar-collapse',
      props: {isNav: true, modelValue: true},
      className: 'navbar-collapse',
      expected: true,
    },
    {
      caseName: 'navbar-collapse',
      props: {isNav: false, modelValue: true},
      className: 'navbar-collapse',
      expected: false,
    },
    {
      caseName: 'collapse-horizontal',
      props: {horizontal: true, modelValue: true},
      className: 'collapse-horizontal',
      expected: true,
    },
    {
      caseName: 'collapse-horizontal',
      props: {horizontal: false, modelValue: true},
      className: 'collapse-horizontal',
      expected: false,
    },
    {caseName: 'show', props: {modelValue: true}, className: 'show', expected: true},
    {caseName: 'show', props: {modelValue: false}, className: 'show', expected: false},
  ])('$caseName class reflects its prop value ($expected)', ({props, className, expected}) => {
    const wrapper = mount(BCollapse, {props})
    expect(wrapper.findAll('*')[1].classes().includes(className)).toBe(expected)
  })

  // --- visibility / v-show ---
  it('is hidden by default (no modelValue)', () => {
    const wrapper = mount(BCollapse)
    const [, $el] = wrapper.findAll('*')
    expect($el.attributes('style')).toContain('display: none')
  })

  it('is visible when modelValue is true', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true},
    })
    const [$el] = wrapper.findAll('*')
    expect($el.attributes('style')).toBeUndefined()
  })

  // --- visible prop ---
  it('is visible when visible prop is true', () => {
    const wrapper = mount(BCollapse, {
      props: {visible: true},
    })
    const [, $el] = wrapper.findAll('*')
    expect($el.classes()).toContain('show')
  })

  // --- modelValue updates ---
  it('becomes visible when modelValue changes to true', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false},
    })
    expect(wrapper.findAll('*')[1].attributes('style')).toContain('display: none')
    await wrapper.setProps({modelValue: true})
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 30))
    await nextTick()
    const [$el] = wrapper.findAll('*')
    expect($el.attributes('style')).toBeUndefined()
  })

  it('emits update:modelValue when toggled', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false, noAnimation: true},
    })
    wrapper.vm.toggle()
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted.length).toBeGreaterThan(0)
    expect(emitted[0][0]).toBe(true)
  })

  it('emits update:modelValue with false when hiding', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true, noAnimation: true},
    })
    wrapper.vm.toggle()
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted.length).toBeGreaterThan(0)
    expect(emitted[0][0]).toBe(false)
  })

  // --- Slot rendering ---
  it('renders default slot', () => {
    const wrapper = mount(BCollapse, {
      slots: {default: 'foobar'},
      props: {modelValue: true},
    })
    expect(wrapper.findAll('*')[1].text()).toBe('foobar')
  })

  it('renders all slots', () => {
    const wrapper = mount(BCollapse, {
      slots: {
        default: 'default',
        header: '<div>header</div>',
        footer: '<div>footer</div>',
      },
      props: {modelValue: true},
    })

    expect(wrapper.findAll('*')[0].text()).toBe('header')
    expect(wrapper.findAll('*')[1].text()).toBe('default')
    expect(wrapper.findAll('*')[2].text()).toBe('footer')
  })

  it('renders header slot without modelValue', () => {
    const wrapper = mount(BCollapse, {
      slots: {
        header: '<div>header</div>',
      },
    })
    expect(wrapper.findAll('*')[0].text()).toBe('header')
  })

  it('renders footer slot without modelValue', () => {
    const wrapper = mount(BCollapse, {
      slots: {
        footer: '<div>footer</div>',
      },
    })
    expect(wrapper.text()).toContain('footer')
  })

  it('does not render default slot content when modelValue is false and lazy', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false, lazy: true},
      slots: {default: 'lazy-content'},
    })
    expect(wrapper.text()).not.toContain('lazy-content')
  })

  // --- Slot props ---
  it('header slot receives id prop', () => {
    const wrapper = mount(BCollapse, {
      props: {id: 'test-id', modelValue: true},
      slots: {
        header: ({id}: {id: string}) => `id:${id}`,
      },
    })
    expect(wrapper.text()).toContain('id:test-id')
  })

  it('header slot receives visible prop', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true},
      slots: {
        header: ({visible}: {visible: boolean}) => `visible:${visible}`,
      },
    })
    expect(wrapper.text()).toContain('visible:true')
  })

  it('header slot receives visible as false when collapsed', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false},
      slots: {
        header: ({visible}: {visible: boolean}) => `visible:${visible}`,
      },
    })
    expect(wrapper.text()).toContain('visible:false')
  })

  it('header slot receives toggle function', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true},
      slots: {
        header: ({toggle}: {toggle: () => void}) => `hasToggle:${typeof toggle === 'function'}`,
      },
    })
    expect(wrapper.text()).toContain('hasToggle:true')
  })

  it('header slot receives show function', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true},
      slots: {
        header: ({show}: {show: () => void}) => `hasShow:${typeof show === 'function'}`,
      },
    })
    expect(wrapper.text()).toContain('hasShow:true')
  })

  it('header slot receives hide function', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true},
      slots: {
        header: ({hide}: {hide: () => void}) => `hasHide:${typeof hide === 'function'}`,
      },
    })
    expect(wrapper.text()).toContain('hasHide:true')
  })

  it('footer slot receives same slot props as header', () => {
    const wrapper = mount(BCollapse, {
      props: {id: 'test-footer', modelValue: true},
      slots: {
        footer: ({id, visible}: {id: string; visible: boolean}) => `id:${id},visible:${visible}`,
      },
    })
    expect(wrapper.text()).toContain('id:test-footer,visible:true')
  })

  it('default slot receives same slot props as header', () => {
    const wrapper = mount(BCollapse, {
      props: {id: 'test-default', modelValue: true},
      slots: {
        default: ({id, visible}: {id: string; visible: boolean}) => `id:${id},visible:${visible}`,
      },
    })
    expect(wrapper.text()).toContain('id:test-default,visible:true')
  })

  // --- defineExpose ---
  it('exposes toggle method', () => {
    const wrapper = mount(BCollapse)
    expect(typeof wrapper.vm.toggle).toBe('function')
  })

  it('exposes show method', () => {
    const wrapper = mount(BCollapse)
    expect(typeof wrapper.vm.show).toBe('function')
  })

  it('exposes hide method', () => {
    const wrapper = mount(BCollapse)
    expect(typeof wrapper.vm.hide).toBe('function')
  })

  it('exposes visible ref', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true},
    })
    expect(wrapper.vm.visible).toBe(true)
  })

  it('exposes visible as false when collapsed', () => {
    const wrapper = mount(BCollapse)
    expect(wrapper.vm.visible).toBe(false)
  })

  it('exposes isNav property', () => {
    const wrapper = mount(BCollapse, {
      props: {isNav: true},
    })
    expect(wrapper.vm.isNav).toBe(true)
  })

  it('exposes isNav as false by default', () => {
    const wrapper = mount(BCollapse)
    expect(wrapper.vm.isNav).toBe(false)
  })

  // --- show/hide/toggle via exposed methods ---
  it.each([
    {
      caseName: 'show method makes content visible',
      method: 'show',
      modelValue: false,
      expected: true,
    },
    {caseName: 'hide method hides content', method: 'hide', modelValue: true, expected: false},
    {
      caseName: 'toggle method shows hidden content',
      method: 'toggle',
      modelValue: false,
      expected: true,
    },
    {
      caseName: 'toggle method hides visible content',
      method: 'toggle',
      modelValue: true,
      expected: false,
    },
  ])('$caseName', async ({method, modelValue, expected}) => {
    const wrapper = mount(BCollapse, {
      props: {modelValue, noAnimation: true},
    })
    wrapper.vm[method]()
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 30))
    const emitted = wrapper.emitted('update:modelValue') ?? []
    expect(emitted.length).toBeGreaterThan(0)
    expect(emitted[0][0]).toBe(expected)
  })

  // --- Events ---
  it('emits show event when showing', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false, noAnimation: true},
    })
    wrapper.vm.show()
    await nextTick()
    expect(wrapper.emitted()).toHaveProperty('show')
  })

  it('emits hide event when hiding', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: true, noAnimation: true},
    })
    wrapper.vm.hide()
    await nextTick()
    expect(wrapper.emitted()).toHaveProperty('hide')
  })

  it('emits toggle event when toggling', async () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false, noAnimation: true},
    })
    wrapper.vm.toggle()
    await nextTick()
    expect(wrapper.emitted()).toHaveProperty('toggle')
  })

  // --- Transition enter/leave classes ---
  it.each([
    {
      caseName: 'enter-active class when animation enabled',
      props: {noAnimation: false},
      attribute: 'enteractiveclass',
      expectedClass: 'collapsing',
    },
    {
      caseName: 'leave-active class when animation enabled',
      props: {noAnimation: false},
      attribute: 'leaveactiveclass',
      expectedClass: 'collapsing',
    },
    {
      caseName: 'empty enter-active class when noAnimation is true',
      props: {noAnimation: true},
      attribute: 'enteractiveclass',
      expectedClass: '',
    },
    {
      caseName: 'empty leave-active class when noAnimation is true',
      props: {noAnimation: true},
      attribute: 'leaveactiveclass',
      expectedClass: '',
    },
  ])('uses $caseName', ({props, attribute, expectedClass}) => {
    const wrapper = mount(BCollapse, {props})
    const $transition = wrapper.findComponent(Transition)
    expect($transition.attributes(attribute)).toBe(expectedClass)
  })

  // --- inheritAttrs: false ---
  it('passes extra attrs to the inner component', () => {
    const wrapper = mount(BCollapse, {
      attrs: {'data-testid': 'my-collapse'},
    })
    const [, $el] = wrapper.findAll('*')
    expect($el.attributes('data-testid')).toBe('my-collapse')
  })

  // --- lazy prop ---
  it('does not render transition when lazy and modelValue false', () => {
    const wrapper = mount(BCollapse, {
      props: {lazy: true, modelValue: false},
    })
    const $transition = wrapper.findComponent(Transition)
    expect($transition.exists()).toBe(false)
  })

  it('renders transition when lazy and modelValue true', () => {
    const wrapper = mount(BCollapse, {
      props: {lazy: true, modelValue: true},
    })
    const $transition = wrapper.findComponent(Transition)
    expect($transition.exists()).toBe(true)
  })

  it('renders content when not lazy even if modelValue is false', () => {
    const wrapper = mount(BCollapse, {
      props: {lazy: false, modelValue: false},
      slots: {default: 'not-lazy-content'},
    })
    const $transition = wrapper.findComponent(Transition)
    expect($transition.exists()).toBe(true)
  })

  // --- noAnimation prop ---
  it('uses empty enter-active-class when noAnimation is true', () => {
    const wrapper = mount(BCollapse, {
      props: {noAnimation: true},
    })
    const $transition = wrapper.findComponent(Transition)
    expect($transition.attributes('enteractiveclass')).toBe('')
  })

  it('uses empty leave-active-class when noAnimation is true', () => {
    const wrapper = mount(BCollapse, {
      props: {noAnimation: true},
    })
    const $transition = wrapper.findComponent(Transition)
    expect($transition.attributes('leaveactiveclass')).toBe('')
  })

  // --- Multiple computed classes ---
  it('has all expected classes when isNav and horizontal and modelValue true', () => {
    const wrapper = mount(BCollapse, {
      props: {isNav: true, horizontal: true, modelValue: true},
    })
    const [, $el] = wrapper.findAll('*')
    expect($el.classes()).toContain('collapse')
    expect($el.classes()).toContain('show')
    expect($el.classes()).toContain('navbar-collapse')
    expect($el.classes()).toContain('collapse-horizontal')
  })

  it('has only collapse class when modelValue false and no extra props', () => {
    const wrapper = mount(BCollapse, {
      props: {modelValue: false},
    })
    const [, $el] = wrapper.findAll('*')
    expect($el.classes()).toContain('collapse')
    expect($el.classes()).not.toContain('show')
    expect($el.classes()).not.toContain('navbar-collapse')
    expect($el.classes()).not.toContain('collapse-horizontal')
  })
})
