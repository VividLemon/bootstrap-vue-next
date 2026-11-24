import {mount} from '@vue/test-utils'
import {describe, expect, it} from 'vitest'
import {defineComponent, h, inject, nextTick, ref} from 'vue'
import BApp from '../components/BApp/BApp.vue'
import BDialog from '../components/BDialog/BDialog.vue'
import type {BvTriggerableEvent} from '../utils'
import {modalManagerKey} from '../utils/keys'

const flush = async (frames = 3) => {
  for (let i = 0; i < frames; i++) {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  }
  await nextTick()
}

/** Mounts a dialog in a BApp and returns the size of the open-dialog stack */
const mountWithStack = async (dialogProps: Record<string, unknown>) => {
  let count = () => -1
  const Probe = defineComponent({
    setup() {
      const manager = inject(modalManagerKey, null)
      count = () => manager?.countStack.value ?? -1
      return () => null
    },
  })
  const wrapper = mount(BApp, {
    attachTo: document.body,
    slots: {
      default: () => [h(BDialog, {noTransition: true, ...dialogProps}, () => 'Body'), h(Probe)],
    },
  })
  await flush()
  return {wrapper, count: () => count()}
}

describe('useModalManager', () => {
  it('keeps a dialog shown on mount in the stack', async () => {
    const {wrapper, count} = await mountWithStack({modelValue: true})
    expect(count()).toBe(1)
    wrapper.unmount()
  })

  it('leaves out a dialog whose initial show is prevented', async () => {
    const {wrapper, count} = await mountWithStack({
      modelValue: true,
      onShow: (event: BvTriggerableEvent) => event.preventDefault(),
    })
    expect(count()).toBe(0)
    wrapper.unmount()
  })

  it('follows the dialog opening and closing', async () => {
    const open = ref(false)
    const {wrapper, count} = await mountWithStack({
      get modelValue() {
        return open.value
      },
    })
    expect(count()).toBe(0)
    open.value = true
    await flush()
    expect(count()).toBe(1)
    open.value = false
    await flush()
    expect(count()).toBe(0)
    wrapper.unmount()
  })
})
