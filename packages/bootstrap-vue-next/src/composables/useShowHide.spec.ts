import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {customRef, defineComponent, type EmitFn, h, nextTick, ref, type Ref, watch} from 'vue'
import {useShowHide, type UseShowHideProps, type UseShowHideReturn} from './useShowHide'
import type {BvTriggerableEvent} from '../utils'

const flush = async () => {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

/**
 * Minimal host component. `transition` lets a test control when the "CSS transition" ends.
 */
const mountHost = (
  props: UseShowHideProps = {},
  {
    modelValue = ref<boolean | number>(false),
    transition,
    prevent = [],
    onEmit,
  }: {
    modelValue?: Ref<boolean | number>
    transition?: (visible: boolean) => Promise<boolean>
    /** events whose BvTriggerableEvent gets preventDefault() called by the "listener" */
    prevent?: string[]
    /** called synchronously for every emitted event, like a listener on the component */
    onEmit?: (name: string, api: UseShowHideReturn) => void
  } = {}
) => {
  let api!: UseShowHideReturn
  const emitted: [string, unknown][] = []
  const Host = defineComponent({
    props: {
      visible: {type: Boolean, default: false},
      show: {type: Boolean, default: false},
      initialAnimation: {type: Boolean, default: false},
      lazy: {type: Boolean, default: false},
      unmountLazy: {type: Boolean, default: false},
      noCloseOnEsc: {type: Boolean, default: false},
      noCloseOnBackdrop: {type: Boolean, default: false},
      delay: {type: [Number, Object], default: undefined},
    },
    setup(p) {
      const element = ref<HTMLElement | null>(null)
      const emit = ((name: string, value: unknown) => {
        emitted.push([name, value])
        if (prevent.includes(name)) (value as BvTriggerableEvent).preventDefault()
        onEmit?.(name, api)
      }) as EmitFn
      api = useShowHide(
        {
          modelValue,
          props: p as UseShowHideProps & Record<string, unknown>,
          emit,
          element,
          id: ref('host'),
        },
        transition ? {transition} : {}
      )
      return () => h('div', {ref: element, class: {show: api.visible.value}})
    },
  })
  const wrapper = mount(Host, {props})
  const names = () => emitted.map(([name]) => name)
  const event = (name: string) =>
    emitted.find(([n]) => n === name)?.[1] as BvTriggerableEvent | undefined
  return {wrapper, api: () => api, names, event, modelValue}
}

describe('useShowHide', () => {
  enableAutoUnmount(afterEach)
  afterEach(() => {
    vi.useRealTimers()
  })

  it('emits show, flips state and model, then shown after the transition', async () => {
    let finish!: (v: boolean) => void
    const transition = vi.fn<(visible: boolean) => Promise<boolean>>(
      () => new Promise<boolean>((resolve) => (finish = resolve))
    )
    const {api, names, modelValue} = mountHost({}, {transition})
    await flush()
    api().show()
    expect(names()).toEqual(['show'])
    expect(api().visible.value).toBe(true)
    expect(api().isActive.value).toBe(true)
    expect(modelValue.value).toBe(true)
    expect(transition).toHaveBeenCalledWith(true)
    finish(true)
    await flush()
    expect(names()).toEqual(['show', 'shown'])
  })

  it('does not emit shown when the transition reports it was superseded', async () => {
    const {api, names} = mountHost({}, {transition: () => Promise.resolve(false)})
    await flush()
    await Promise.race([api().show(), flush()])
    expect(names()).toEqual(['show'])
  })

  it('emits the trigger event before hide, and passes the trigger to hidden', async () => {
    const {api, names, event} = mountHost({}, {modelValue: ref(true)})
    await flush()
    const result = await api().hide('close')
    expect(result).toBe('close')
    expect(names()).toEqual(['show', 'shown', 'close', 'hide', 'hidden'])
    expect(event('hidden')?.trigger).toBe('close')
  })

  it('does not emit the trigger event when noTriggerEmit', async () => {
    const {api, names} = mountHost({}, {modelValue: ref(true)})
    await flush()
    await api().hide('close', true)
    expect(names()).not.toContain('close')
  })

  it('a prevented trigger event prevents the hide', async () => {
    const modelValue = ref<boolean | number>(true)
    const {api, names} = mountHost({}, {modelValue, prevent: ['close']})
    await flush()
    await expect(api().hide('close')).resolves.toBe('hide-prevented')
    expect(names()).toContain('hide-prevented')
    expect(names()).not.toContain('hidden')
    expect(api().visible.value).toBe(true)
    expect(modelValue.value).toBe(true)
  })

  it('a prevented hide from v-model reverts the model', async () => {
    const modelValue = ref<boolean | number>(true)
    const {api} = mountHost({}, {modelValue, prevent: ['hide']})
    await flush()
    modelValue.value = false
    await flush()
    expect(modelValue.value).toBe(true)
    expect(api().visible.value).toBe(true)
  })

  it.each([
    {trigger: 'esc', prop: 'noCloseOnEsc'},
    {trigger: 'backdrop', prop: 'noCloseOnBackdrop'},
  ] as const)('prevents hide($trigger) with $prop', async ({trigger, prop}) => {
    const {api, names} = mountHost({[prop]: true}, {modelValue: ref(true)})
    await flush()
    await expect(api().hide(trigger)).resolves.toBe('hide-prevented')
    expect(names()).toContain('hide-prevented')
    expect(names()).not.toContain('hide')
    expect(api().visible.value).toBe(true)
  })

  it('ignores a non-string trigger (event objects from click handlers)', async () => {
    const {api, event} = mountHost({}, {modelValue: ref(true)})
    await flush()
    await api().hide(new MouseEvent('click') as unknown as string)
    expect(event('hide')?.trigger).toBeFalsy()
    expect(api().visible.value).toBe(false)
  })

  it('sets a numeric modelValue to 0 on hide', async () => {
    const modelValue = ref<boolean | number>(5000)
    const {api} = mountHost({}, {modelValue})
    await flush()
    expect(api().visible.value).toBe(true)
    await api().hide()
    expect(modelValue.value).toBe(0)
  })

  it('does not re-show when a numeric modelValue counts down', async () => {
    const modelValue = ref<boolean | number>(5000)
    const {names} = mountHost({}, {modelValue})
    await flush()
    modelValue.value = 4000
    await flush()
    expect(names().filter((n) => n === 'show')).toHaveLength(1)
  })

  it('waits for delay before flipping the state', async () => {
    vi.useFakeTimers()
    const {api, names} = mountHost({delay: {show: 100, hide: 50}})
    await nextTick()
    api().show()
    expect(names()).toEqual(['show'])
    expect(api().visible.value).toBe(false)
    vi.advanceTimersByTime(100)
    expect(api().visible.value).toBe(true)
    await vi.runAllTimersAsync()
    expect(names()).toEqual(['show', 'shown'])
    api().hide()
    expect(api().visible.value).toBe(true)
    vi.advanceTimersByTime(50)
    expect(api().visible.value).toBe(false)
  })

  it('a hide during the show delay cancels the pending show', async () => {
    vi.useFakeTimers()
    const {api, names} = mountHost({delay: 100})
    await nextTick()
    const showPromise = api().show()
    api().hide()
    await vi.runAllTimersAsync()
    await expect(showPromise).resolves.toBe(false)
    expect(api().visible.value).toBe(false)
    expect(names()).not.toContain('shown')
    expect(names()).toContain('hidden')
  })

  it('returns the pending promise for a repeated show', async () => {
    let finish!: (v: boolean) => void
    const {api} = mountHost(
      {},
      {transition: () => new Promise<boolean>((resolve) => (finish = resolve))}
    )
    await flush()
    const a = api().show()
    const b = api().show()
    expect(b).toBe(a)
    finish(true)
    await expect(a).resolves.toBe(true)
  })

  it('toggle hides with trigger toggle-function', async () => {
    const {api, event} = mountHost({}, {modelValue: ref(true)})
    await flush()
    await api().toggle()
    expect(event('hidden')?.trigger).toBe('toggle-function')
  })

  it('registered triggers get aria-expanded that follows the state', async () => {
    const {api, names} = mountHost()
    await flush()
    const button = document.createElement('button')
    api().registerTrigger('click', button)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    button.click()
    await flush()
    expect(names()).toContain('toggle')
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(button.classList.contains('not-collapsed')).toBe(false)
    expect(button.classList.contains('collapsed')).toBe(false)
    button.click()
    await flush()
    expect(button.getAttribute('aria-expanded')).toBe('false')
    api().unregisterTrigger('click', button, true)
    expect(button.hasAttribute('aria-expanded')).toBe(false)
  })

  it('unregisterTrigger with clean=false keeps aria-expanded', async () => {
    const {api} = mountHost()
    await flush()
    const button = document.createElement('button')
    api().registerTrigger('click', button)
    api().unregisterTrigger('click', button, false)
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('resolves a pending change with false on unmount and emits nothing more', async () => {
    const {api, names, wrapper} = mountHost({}, {transition: () => new Promise<boolean>(() => {})})
    await flush()
    const promise = api().show()
    wrapper.unmount()
    await expect(promise).resolves.toBe(false)
    expect(names()).toEqual(['show'])
  })

  it('contentShowing honours lazy and unmountLazy', async () => {
    const lazy = mountHost({lazy: true})
    await flush()
    expect(lazy.api().contentShowing.value).toBe(false)
    await lazy.api().show()
    await lazy.api().hide()
    expect(lazy.api().contentShowing.value).toBe(true)

    const unmount = mountHost({lazy: true, unmountLazy: true})
    await flush()
    await unmount.api().show()
    expect(unmount.api().contentShowing.value).toBe(true)
    await unmount.api().hide()
    expect(unmount.api().contentShowing.value).toBe(false)
  })
  it('a show() started from a hidden listener does not mix up the promises', async () => {
    let showPromise: Promise<boolean | string> | undefined
    const {api, names} = mountHost(
      {},
      {
        modelValue: ref(true),
        onEmit: (name, a) => {
          if (name === 'hidden' && !showPromise) showPromise = a.show()
        },
      }
    )
    await flush()
    await expect(api().hide('x')).resolves.toBe('x')
    expect(showPromise).toBeDefined()
    await expect(showPromise).resolves.toBe(true)
    expect(names()).toEqual(['show', 'shown', 'x', 'hide', 'hidden', 'show', 'shown'])
    expect(api().visible.value).toBe(true)
  })

  it('a hide() started from a shown listener does not mix up the promises', async () => {
    let hidePromise: Promise<boolean | string> | undefined
    const {api} = mountHost(
      {},
      {
        onEmit: (name, a) => {
          if (name === 'shown' && !hidePromise) hidePromise = a.hide('auto')
        },
      }
    )
    await flush()
    await expect(api().show()).resolves.toBe(true)
    await expect(hidePromise).resolves.toBe('auto')
    expect(api().visible.value).toBe(false)
    expect(api().isActive.value).toBe(false)
  })

  it('a hide() started synchronously while a show updates the model still finishes', async () => {
    // Same invalidation rule as useCssTransition: a newer run makes an older one resolve false
    let generation = 0
    const transition = async () => {
      const id = ++generation
      await nextTick()
      return id === generation
    }
    const modelValue = ref<boolean | number>(false)
    const {api, names} = mountHost({}, {modelValue, transition})
    await flush()
    let hidePromise: Promise<boolean | string> | undefined
    // defineModel emits update:modelValue synchronously
    const stop = watch(
      modelValue,
      (value) => {
        if (value && !hidePromise) hidePromise = api().hide('sync')
      },
      {flush: 'sync'}
    )
    const showPromise = api().show()
    await expect(showPromise).resolves.toBe(false)
    await expect(hidePromise).resolves.toBe('sync')
    stop()
    expect(names()).toEqual(['show', 'sync', 'hide', 'hidden'])
    expect(api().visible.value).toBe(false)
    expect(api().isActive.value).toBe(false)
  })

  it('a delayed hide in the same tick as a show is not cancelled by the model update', async () => {
    vi.useFakeTimers()
    const {api, names} = mountHost({delay: {show: 0, hide: 100}})
    await nextTick()
    api().show()
    const hidePromise = api().hide()
    await vi.runAllTimersAsync()
    await expect(hidePromise).resolves.toBe('')
    expect(api().visible.value).toBe(false)
    expect(names()).toEqual(['show', 'hide', 'hidden'])
  })

  it('still follows the model after its own model update was skipped', async () => {
    const modelValue = ref<boolean | number>(false)
    const {api} = mountHost({}, {modelValue})
    await flush()
    await api().show()
    expect(modelValue.value).toBe(true)
    modelValue.value = false
    await flush()
    expect(api().visible.value).toBe(false)
    modelValue.value = true
    await flush()
    expect(api().visible.value).toBe(true)
  })

  it('follows the model after a parent declined its own model update', async () => {
    // Like a parent that listens to `update:modelValue` without writing the value back
    let value = false
    let notify = () => {}
    const modelValue = customRef<boolean | number>((track, trigger) => {
      notify = trigger
      return {
        get: () => {
          track()
          return value
        },
        set: () => {},
      }
    })
    const {api} = mountHost({}, {modelValue})
    await flush()
    await api().show()
    await api().hide()
    await flush()
    expect(api().visible.value).toBe(false)

    value = true
    notify()
    await flush()
    expect(api().visible.value).toBe(true)
  })

  it('a superseded visible-prop change does not make the next change instant', async () => {
    vi.useFakeTimers()
    const {api, wrapper} = mountHost(
      {delay: 300},
      {transition: () => new Promise<boolean>(() => {})}
    )
    await nextTick()
    await wrapper.setProps({visible: true})
    expect(api().instant.value).toBe(true)
    expect(api().visible.value).toBe(true)
    api().hide()
    expect(api().instant.value).toBe(false)
    // the hide waits for its delay again
    expect(api().visible.value).toBe(true)
    vi.advanceTimersByTime(300)
    expect(api().visible.value).toBe(false)
  })

  it('show(true) resolves with the trigger once hidden', async () => {
    const {api, names} = mountHost()
    await flush()
    let resolved: boolean | string | undefined
    api()
      .show(true)
      .then((value) => (resolved = value))
    await flush()
    expect(names()).toEqual(['show', 'shown'])
    expect(resolved).toBeUndefined()
    await api().hide('ok')
    await flush()
    expect(resolved).toBe('ok')
  })

  it('show(true) still resolves on hidden when the hide starts before shown', async () => {
    let finish!: (v: boolean) => void
    const {api} = mountHost(
      {},
      {transition: () => new Promise<boolean>((resolve) => (finish = resolve))}
    )
    await flush()
    const showPromise = api().show(true)
    const hidePromise = api().hide('early')
    finish(true)
    await expect(hidePromise).resolves.toBe('early')
    await expect(showPromise).resolves.toBe('early')
  })

  it('a plain show() does not change what a pending show(true) waits for', async () => {
    let finish!: (v: boolean) => void
    const transition = () => new Promise<boolean>((resolve) => (finish = resolve))
    const {api} = mountHost({}, {transition})
    await flush()
    const onHide = vi.fn<(v: boolean | string) => void>()
    void api().show(true).then(onHide)
    const plain = api().show()
    finish(true)
    await flush()
    expect(await plain).toBe(true)
    expect(onHide).not.toHaveBeenCalled()

    const hidePromise = api().hide('esc')
    finish(true)
    await hidePromise
    await flush()
    expect(onHide).toHaveBeenCalledWith('esc')
  })

  it('a show(true) does not change what a pending plain show() waits for', async () => {
    let finish!: (v: boolean) => void
    const transition = () => new Promise<boolean>((resolve) => (finish = resolve))
    const {api} = mountHost({}, {transition})
    await flush()
    const plain = api().show()
    const onHide = vi.fn<(v: boolean | string) => void>()
    void api().show(true).then(onHide)
    expect(api().show(true)).toBe(api().show(true))
    finish(true)
    expect(await plain).toBe(true)
    await flush()
    expect(onHide).not.toHaveBeenCalled()
  })

  it('settles every waiter of a pending show that is superseded', async () => {
    const transition = () => new Promise<boolean>(() => {})
    const {api, wrapper} = mountHost({}, {transition})
    await flush()
    const plain = api().show()
    const onHide = api().show(true)
    wrapper.unmount()
    expect(await plain).toBe(false)
    expect(await onHide).toBe(false)
  })

  it('show(true) resolves false on unmount', async () => {
    const {api, wrapper} = mountHost()
    await flush()
    const promise = api().show(true)
    await flush()
    wrapper.unmount()
    await expect(promise).resolves.toBe(false)
  })

  it('treats an event object passed to show as no resolveOnHide', async () => {
    const {api} = mountHost()
    await flush()
    await expect(api().show(new Event('click') as unknown as boolean)).resolves.toBe(true)
  })

  describe('request signals', () => {
    it('gives show and hide requests a signal that aborts when the component commits', async () => {
      const {api, event} = mountHost()
      await flush()
      await api().show()
      const showSignal = event('show')?.signal
      expect(showSignal).toBeInstanceOf(AbortSignal)
      expect(showSignal?.aborted).toBe(true)

      await api().hide('close')
      expect(event('close')?.signal).toBe(event('hide')?.signal)
      expect(event('hide')?.signal?.aborted).toBe(true)
    })

    it('keeps a prevented request signal running until the next commit', async () => {
      const {api, event} = mountHost({}, {prevent: ['show']})
      await flush()
      await expect(api().show()).resolves.toBe('show-prevented')
      const signal = event('show')?.signal
      expect(signal?.aborted).toBe(false)
      expect(event('show-prevented')?.signal).toBe(signal)
    })

    it('aborts a pending request signal when the component unmounts', async () => {
      const {api, event, wrapper} = mountHost({}, {prevent: ['show']})
      await flush()
      await api().show()
      const signal = event('show')?.signal
      wrapper.unmount()
      expect(signal?.aborted).toBe(true)
    })
  })

  describe('listener-initiated changes', () => {
    it('lets a trigger listener that hides the component win, emitting hide once', async () => {
      const modelValue = ref<boolean | number>(true)
      let listenerHide: Promise<boolean | string> | undefined
      const {api, names} = mountHost(
        {},
        {
          modelValue,
          onEmit: (name, a) => {
            if (name === 'close') listenerHide = a.hide()
          },
        }
      )
      await flush()
      const outer = api().hide('close')
      expect(names().filter((n) => n === 'hide')).toHaveLength(1)
      expect(outer).toBe(listenerHide)
      await expect(outer).resolves.toBe('')
      expect(names().filter((n) => n === 'hidden')).toHaveLength(1)
    })
  })
})
