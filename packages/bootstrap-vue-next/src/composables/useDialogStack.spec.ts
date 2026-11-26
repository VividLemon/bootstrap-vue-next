import {mount} from '@vue/test-utils'
import {describe, expect, it, vi} from 'vitest'
import {defineComponent, h, inject, nextTick, ref, withDirectives} from 'vue'
import BApp from '../components/BApp/BApp.vue'
import BDialog from '../components/BDialog/BDialog.vue'
import type {BvTriggerableEvent} from '../utils'
import {dialogStackKey} from '../utils/keys'
import {vBToggle} from '../directives/BToggle'

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
      const dialogStack = inject(dialogStackKey, null)
      count = () => dialogStack?.stack.value.length ?? -1
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

describe('useDialogStack', () => {
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

  it('removes a dialog from the registry and the stack when it unmounts', async () => {
    const show = ref(true)
    let registered = () => -1
    let open = () => -1
    const Probe = defineComponent({
      setup() {
        const dialogStack = inject(dialogStackKey, null)
        registered = () => dialogStack?.registry.value.length ?? -1
        open = () => dialogStack?.stack.value.length ?? -1
        return () => null
      },
    })
    const wrapper = mount(BApp, {
      attachTo: document.body,
      slots: {
        default: () => [
          show.value ? h(BDialog, {noTransition: true, modelValue: true}, () => 'Body') : null,
          h(Probe),
        ],
      },
    })
    await flush()
    expect([registered(), open()]).toEqual([1, 1])
    show.value = false
    await flush()
    expect([registered(), open()]).toEqual([0, 0])
    wrapper.unmount()
  })
})

describe('useDialogSwap (v-b-toggle inside an open dialog)', () => {
  const mountSwap = async (
    firstProps: Record<string, unknown> = {},
    secondProps: Record<string, unknown> = {}
  ) => {
    const first = ref(true)
    const second = ref(false)
    const Root = defineComponent({
      setup() {
        return () => [
          h(
            BDialog,
            {
              'id': 'first',
              'noTransition': true,
              'modelValue': first.value,
              'onUpdate:modelValue': (v: boolean) => {
                first.value = v
              },
              ...firstProps,
            },
            {
              default: () =>
                withDirectives(h('button', {id: 'next', type: 'button'}, 'Next'), [
                  [vBToggle, 'second'],
                ]),
            }
          ),
          h(
            BDialog,
            {
              'id': 'second',
              'noTransition': true,
              'modelValue': second.value,
              'onUpdate:modelValue': (v: boolean) => {
                second.value = v
              },
              ...secondProps,
            },
            () => 'Second'
          ),
        ]
      },
    })
    const wrapper = mount(BApp, {attachTo: document.body, slots: {default: () => h(Root)}})
    await flush()
    // v-b-toggle looks its target up in the registry
    await new Promise((resolve) => setTimeout(resolve, 150))
    return {wrapper, first, second}
  }

  const dialog = (id: string) => document.getElementById(id) as HTMLDialogElement

  it('opens the target and hides the dialog the trigger sits in', async () => {
    const onHide = vi.fn<(e: BvTriggerableEvent) => void>()
    const {wrapper, first, second} = await mountSwap({onHide})
    expect(dialog('first').open).toBe(true)

    document.getElementById('next')?.click()
    await flush()

    expect(second.value).toBe(true)
    expect(first.value).toBe(false)
    expect(dialog('second').open).toBe(true)
    expect(dialog('first').open).toBe(false)
    expect(onHide.mock.calls[0]?.[0].trigger).toBe('swap')
    wrapper.unmount()
  })

  it('changes neither dialog when the current one prevents its hide', async () => {
    const {wrapper, first, second} = await mountSwap({
      onHide: (e: BvTriggerableEvent) => e.preventDefault(),
    })
    document.getElementById('next')?.click()
    await flush()

    expect(first.value).toBe(true)
    expect(second.value).toBe(false)
    expect(dialog('second').open).toBe(false)
    expect(dialog('second').classList.contains('dialog-swap-in')).toBe(false)
    wrapper.unmount()
  })

  it('changes neither dialog when the target prevents its show', async () => {
    const onHide = vi.fn<() => void>()
    const {wrapper, first, second} = await mountSwap(
      {onHide},
      {onShow: (e: BvTriggerableEvent) => e.preventDefault()}
    )
    document.getElementById('next')?.click()
    await flush()

    expect(first.value).toBe(true)
    expect(second.value).toBe(false)
    expect(onHide).not.toHaveBeenCalled()
    expect(dialog('second').classList.contains('dialog-swap-in')).toBe(false)
    wrapper.unmount()
  })

  it('marks the new dialog with dialog-swap-in until it is shown', async () => {
    const {wrapper} = await mountSwap()
    document.getElementById('next')?.click()
    await nextTick()
    expect(dialog('second').classList.contains('dialog-swap-in')).toBe(true)
    await flush()
    expect(dialog('second').classList.contains('dialog-swap-in')).toBe(false)
    wrapper.unmount()
  })
})
