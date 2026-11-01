import {enableAutoUnmount, flushPromises, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {nextTick} from 'vue'
import {vBToggle as VBToggle} from './BToggle'
import {asyncTimeout} from '../../tests/utils'
import BCollapse from '../components/BCollapse/BCollapse.vue'
import {createBootstrap} from '../plugins'

// Bootstrap v6 has no trigger state classes: only aria-expanded reflects the state
const expectNoStateClasses = (classes: string[]) => {
  expect(classes).not.toContain('collapsed')
  expect(classes).not.toContain('not-collapsed')
}

describe('toggle directive', () => {
  enableAutoUnmount(afterEach)
  it('works with multiple targets, and updates when targets change', async () => {
    const spy1 = vi.fn<() => void>()
    const spy2 = vi.fn<() => void>()
    const App = {
      directives: {
        bToggle: VBToggle,
      },
      components: {BCollapse},
      props: {
        target: {
          type: [String, Array],
          default: null,
        },
      },
      methods: {
        spy1,
        spy2,
      },
      template: `<button v-b-toggle="target">button</button><BCollapse @toggle="spy1" id="test1">collapse 1</BCollapse><BCollapse @toggle="spy2" id="test2">collapse 2</BCollapse>`,
    }

    const wrapper = mount(App, {
      attachTo: document.body,
      props: {
        target: 'test1',
      },
      global: {
        plugins: [createBootstrap()],
      },
    })

    await flushPromises()
    await nextTick()

    expect(wrapper.vm).toBeDefined()
    expect(spy1).not.toHaveBeenCalled()
    expect(spy2).not.toHaveBeenCalled()

    const $button = wrapper.find('button')
    expect($button.attributes('aria-controls')).toBe('test1')
    expect($button.attributes('aria-expanded')).toBe('false')
    expectNoStateClasses($button.classes())

    await wrapper.setProps({target: ['test1', 'test2']})
    expect($button.attributes('aria-controls')).toBe('test1 test2')
    expect($button.attributes('aria-expanded')).toBe('false')
    expectNoStateClasses($button.classes())
    expect(spy1).not.toHaveBeenCalled()
    expect(spy2).not.toHaveBeenCalled()

    await asyncTimeout(1)
    await $button.trigger('click')
    await asyncTimeout(50)
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)

    expect($button.attributes('aria-controls')).toBe('test1 test2')
    expect($button.attributes('aria-expanded')).toBe('true')
    expectNoStateClasses($button.classes())

    await wrapper.setProps({target: ['test2']})
    expect($button.attributes('aria-controls')).toBe('test2')
    expect($button.attributes('aria-expanded')).toBe('true')
    expectNoStateClasses($button.classes())
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)

    await asyncTimeout(1)
    await $button.trigger('click')
    await asyncTimeout(50)
    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(2)

    // test2 closed again
    expect($button.attributes('aria-controls')).toBe('test2')
    expect($button.attributes('aria-expanded')).toBe('false')
    expectNoStateClasses($button.classes())
  })

  it('removes aria-expanded and aria-controls when the trigger unmounts', async () => {
    const App = {
      directives: {bToggle: VBToggle},
      components: {BCollapse},
      props: {showTrigger: {type: Boolean, default: true}},
      template: `<div><button v-if="showTrigger" v-b-toggle.unmount-collapse>button</button></div><BCollapse id="unmount-collapse" :model-value="true">collapse</BCollapse>`,
    }
    const wrapper = mount(App, {attachTo: document.body, global: {plugins: [createBootstrap()]}})
    await flushPromises()
    await nextTick()
    const el = wrapper.find('button').element
    expect(el.getAttribute('aria-expanded')).toBe('true')
    expect(el.getAttribute('aria-controls')).toBe('unmount-collapse')
    await wrapper.setProps({showTrigger: false})
    await flushPromises()
    expect(el.hasAttribute('aria-expanded')).toBe(false)
    expect(el.hasAttribute('aria-controls')).toBe(false)
  })

  it('does not log findProvides error when unmounted quickly', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const App = {
        directives: {
          bToggle: VBToggle,
        },
        components: {BCollapse},
        props: {
          showTrigger: {
            type: Boolean,
            default: true,
          },
        },
        template: `
          <button
            v-if="showTrigger"
            v-b-toggle.test-collapse
          >
            button
          </button>
          <BCollapse id="test-collapse">collapse</BCollapse>
        `,
      }

      const wrapper = mount(App, {
        attachTo: document.body,
        global: {
          plugins: [createBootstrap()],
        },
      })

      await flushPromises()
      await nextTick()

      await wrapper.setProps({showTrigger: false})
      await flushPromises()
      await nextTick()

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Could not find original vnode')
      )
    } finally {
      errorSpy.mockRestore()
    }
  })
})
