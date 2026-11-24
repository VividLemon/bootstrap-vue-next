import {mount} from '@vue/test-utils'
import {describe, expect, it, vi} from 'vitest'
import {defineComponent, h, nextTick, ref, type SlotsType, type VNode} from 'vue'
import {useHasSlot} from './useHasSlot'

const Child = defineComponent({
  slots: Object as SlotsType<{footer?: (props: {close: () => void}) => unknown}>,
  setup(_, {slots}) {
    const hasFooter = useHasSlot(slots, 'footer')
    return () =>
      h('div', [hasFooter.value ? h('footer', slots.footer?.({close: () => undefined})) : null])
  },
})

describe('useHasSlot', () => {
  it('is false without the slot and true with it', () => {
    expect(mount(Child).find('footer').exists()).toBe(false)
    const withSlot = mount(Child, {slots: {footer: () => 'F'}})
    expect(withSlot.find('footer').text()).toBe('F')
  })

  it('never calls the slot to decide, so a scoped slot is only called with its scope', () => {
    const footer = vi.fn<(scope: {close: () => void}) => VNode>(({close}) =>
      h('button', {onClick: close}, 'x')
    )
    mount(Child, {slots: {footer}})
    expect(footer).toHaveBeenCalledTimes(1)
    expect(footer.mock.calls[0]?.[0]).toHaveProperty('close')
  })

  it('follows a slot the parent adds and removes', async () => {
    const show = ref(false)
    const Parent = defineComponent({
      setup: () => () => h(Child, null, show.value ? {footer: () => 'F'} : {}),
    })
    const wrapper = mount(Parent)
    expect(wrapper.find('footer').exists()).toBe(false)
    show.value = true
    await nextTick()
    expect(wrapper.find('footer').exists()).toBe(true)
    show.value = false
    await nextTick()
    expect(wrapper.find('footer').exists()).toBe(false)
  })
})
