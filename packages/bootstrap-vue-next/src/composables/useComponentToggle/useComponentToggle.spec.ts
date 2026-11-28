import {afterEach, describe, expect, it} from 'vitest'
import {enableAutoUnmount, mount} from '@vue/test-utils'
import {defineComponent, h, nextTick, ref} from 'vue'
import BApp from '../../components/BApp/BApp.vue'
import BButton from '../../components/BButton/BButton.vue'
import BCollapse from '../../components/BCollapse/BCollapse.vue'
import {useComponentToggle} from './index'

enableAutoUnmount(afterEach)

const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

describe('useComponentToggle trigger props', () => {
  const mountWith = (
    targetIds: string | readonly string[] | (() => string | readonly string[]),
    {asComponent = false, showCollapses = ref(['a', 'b'])} = {}
  ) => {
    let toggle: ReturnType<typeof useComponentToggle> | undefined
    const Trigger = defineComponent({
      setup() {
        toggle = useComponentToggle(targetIds)
        return () =>
          asComponent
            ? h(BButton, {id: 'trigger', ...toggle!.props.value}, () => 'Toggle')
            : h('button', {id: 'trigger', type: 'button', ...toggle!.props.value}, 'Toggle')
      },
    })
    const wrapper = mount(BApp, {
      attachTo: document.body,
      slots: {
        default: () => [
          h(Trigger),
          ...showCollapses.value.map((id) =>
            h(BCollapse, {id, key: id, noTransition: true}, () => id)
          ),
        ],
      },
    })
    const trigger = () => wrapper.find('#trigger')
    return {wrapper, trigger, toggle: () => toggle!, showCollapses}
  }

  it('sets aria-controls and keeps aria-expanded in step with the target', async () => {
    const {wrapper, trigger} = mountWith('a')
    await flush()
    expect(trigger().attributes('aria-controls')).toBe('a')
    expect(trigger().attributes('aria-expanded')).toBe('false')

    await trigger().trigger('click')
    await flush()
    expect(wrapper.find('#a').classes()).toContain('show')
    expect(trigger().attributes('aria-expanded')).toBe('true')

    await trigger().trigger('click')
    await flush()
    expect(wrapper.find('#a').classes()).not.toContain('show')
    expect(trigger().attributes('aria-expanded')).toBe('false')
  })

  it('toggles every target, from an array or a space-separated string', async () => {
    for (const ids of [['a', 'b'], 'a b'] as const) {
      const {wrapper, trigger} = mountWith(ids)
      await flush()
      expect(trigger().attributes('aria-controls')).toBe('a b')
      await trigger().trigger('click')
      await flush()
      expect(wrapper.find('#a').classes()).toContain('show')
      expect(wrapper.find('#b').classes()).toContain('show')
      wrapper.unmount()
    }
  })

  it('works on a component trigger (BButton)', async () => {
    const {wrapper, trigger} = mountWith('a', {asComponent: true})
    await flush()
    expect(trigger().element.tagName).toBe('BUTTON')
    await trigger().trigger('click')
    await flush()
    expect(wrapper.find('#a').classes()).toContain('show')
    expect(trigger().attributes('aria-expanded')).toBe('true')
  })

  it('picks up a target that mounts later, and follows changed ids', async () => {
    const showCollapses = ref<string[]>([])
    const ids = ref('a')
    const {wrapper, trigger} = mountWith(() => ids.value, {showCollapses})
    await flush()
    expect(trigger().attributes('aria-expanded')).toBeUndefined()

    showCollapses.value = ['a', 'b']
    await flush()
    expect(trigger().attributes('aria-expanded')).toBe('false')

    ids.value = 'b'
    await flush()
    expect(trigger().attributes('aria-controls')).toBe('b')
    await trigger().trigger('click')
    await flush()
    expect(wrapper.find('#b').classes()).toContain('show')
    expect(wrapper.find('#a').classes()).not.toContain('show')
  })

  it('stops toggling and removes aria-expanded once the trigger unmounts', async () => {
    const visible = ref(true)
    let toggle: ReturnType<typeof useComponentToggle> | undefined
    const Root = defineComponent({
      setup() {
        toggle = useComponentToggle('a')
        return () => [
          visible.value
            ? h('button', {id: 'trigger', type: 'button', ...toggle!.props.value}, 'Toggle')
            : null,
          h(BCollapse, {id: 'a', noTransition: true}, () => 'a'),
        ]
      },
    })
    const wrapper = mount(BApp, {attachTo: document.body, slots: {default: () => h(Root)}})
    await flush()
    const button = wrapper.find('#trigger').element as HTMLButtonElement
    expect(button.getAttribute('aria-expanded')).toBe('false')

    visible.value = false
    await flush()
    expect(button.hasAttribute('aria-expanded')).toBe(false)
    button.click()
    await flush()
    expect(wrapper.find('#a').classes()).not.toContain('show')
  })

  it('still shows, hides and toggles the target programmatically', async () => {
    const {wrapper, toggle} = mountWith('a')
    await flush()
    void toggle().show()
    await flush()
    expect(wrapper.find('#a').classes()).toContain('show')
    void toggle().hide()
    await flush()
    expect(wrapper.find('#a').classes()).not.toContain('show')
  })
})
