import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {customRef, defineComponent, type EmitFn, h, nextTick, ref, type Ref, watch} from 'vue'
import {useShowHide, type UseShowHideProps, type UseShowHideReturn} from './useShowHide'
import {
  createShowHideMachine,
  type ShowHideEventInit,
  type ShowHideMachineHost,
  type ShowHideRequest,
  type ShowHideState,
  showHideTransitions,
} from './showHideMachine'
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
    disabled,
  }: {
    modelValue?: Ref<boolean | number>
    transition?: (visible: boolean) => Promise<boolean>
    /** events whose BvTriggerableEvent gets preventDefault() called by the "listener" */
    prevent?: string[]
    /** called synchronously for every emitted event, like a listener on the component */
    onEmit?: (name: string, api: UseShowHideReturn, event: BvTriggerableEvent) => void
    disabled?: Ref<boolean>
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
      delay: {type: [Number, Object], default: undefined},
    },
    setup(p) {
      const element = ref<HTMLElement | null>(null)
      const emit = ((name: string, value: unknown) => {
        emitted.push([name, value])
        if (prevent.includes(name)) (value as BvTriggerableEvent).preventDefault()
        onEmit?.(name, api, value as BvTriggerableEvent)
      }) as EmitFn
      api = useShowHide(
        {
          modelValue,
          props: p as UseShowHideProps & Record<string, unknown>,
          emit,
          element,
          id: ref('host'),
        },
        {...(transition ? {transition} : {}), ...(disabled ? {disabled} : {})}
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

  it.each(['esc', 'backdrop'])(
    'treats hide(%s) like any other trigger (the component decides whether to ask)',
    async (trigger) => {
      const {api, names} = mountHost({}, {modelValue: ref(true)})
      await flush()
      await expect(api().hide(trigger)).resolves.toBe(trigger)
      expect(names()).toEqual(['show', 'shown', trigger, 'hide', 'hidden'])
    }
  )

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

  it('settles every waiter of a pending show on unmount', async () => {
    const transition = () => new Promise<boolean>(() => {})
    const {api, wrapper} = mountHost({}, {transition})
    await flush()
    const plain = api().show()
    const onHide = api().show(true)
    wrapper.unmount()
    expect(await plain).toBe(false)
    expect(await onHide).toBe('dispose')
  })

  it("show(true) resolves 'dispose' on unmount", async () => {
    const {api, wrapper} = mountHost()
    await flush()
    const promise = api().show(true)
    await flush()
    wrapper.unmount()
    await expect(promise).resolves.toBe('dispose')
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

  /**
   * Like `mountHost`, with a "CSS transition" the test finishes by hand. It follows
   * `useCssTransition`: a newer run makes an older one resolve `false`.
   */
  const mountControlled = (
    props: UseShowHideProps = {},
    options: Omit<NonNullable<Parameters<typeof mountHost>[1]>, 'transition'> = {}
  ) => {
    let generation = 0
    let waiting: (() => void)[] = []
    const transition = () => {
      const id = ++generation
      return new Promise<boolean>((resolve) => {
        waiting.push(() => resolve(id === generation))
      })
    }
    const host = mountHost(props, {...options, transition})
    /** Ends every running transition, including the ones listeners start meanwhile */
    const settle = async () => {
      await flush()
      while (waiting.length) {
        const current = waiting
        waiting = []
        current.forEach((finish) => finish())
        await flush()
      }
    }
    return {...host, settle}
  }

  /**
   * Brings a freshly mounted host into `state`. Returns the promise of the operation in flight,
   * wrapped so that awaiting `reach` does not wait for it
   */
  const reach = async (
    host: ReturnType<typeof mountControlled>,
    state: ShowHideState
  ): Promise<{inFlight: Promise<boolean | string> | undefined}> => {
    await flush()
    let inFlight: Promise<boolean | string> | undefined
    if (state !== 'hidden') inFlight = host.api().show()
    if (state === 'shown' || state === 'hiding') {
      await host.settle()
      inFlight = state === 'hiding' ? host.api().hide('first') : undefined
    }
    expect(host.api().state.value).toBe(state)
    return {inFlight}
  }

  describe('state', () => {
    it('goes hidden → showing → shown → hiding → hidden', async () => {
      const host = mountControlled()
      await flush()
      const {state, visible, isActive} = host.api()
      expect([state.value, visible.value, isActive.value]).toEqual(['hidden', false, false])
      void host.api().show()
      expect([state.value, visible.value, isActive.value]).toEqual(['showing', true, true])
      await host.settle()
      expect([state.value, visible.value, isActive.value]).toEqual(['shown', true, true])
      void host.api().hide()
      expect([state.value, visible.value, isActive.value]).toEqual(['hiding', false, true])
      await host.settle()
      expect([state.value, visible.value, isActive.value]).toEqual(['hidden', false, false])
    })

    it('is showing / hiding during the delay, while visible has not flipped yet', async () => {
      vi.useFakeTimers()
      const {api} = mountHost({delay: 100})
      await nextTick()
      void api().show()
      expect([api().state.value, api().visible.value, api().isActive.value]).toEqual([
        'showing',
        false,
        false,
      ])
      await vi.runAllTimersAsync()
      expect(api().state.value).toBe('shown')
      void api().hide()
      expect([api().state.value, api().visible.value]).toEqual(['hiding', true])
      await vi.runAllTimersAsync()
      expect(api().state.value).toBe('hidden')
    })

    it('an initially shown component is showing (instant) until shown fired', async () => {
      const {api, names} = mountHost({}, {modelValue: ref(true)})
      expect([api().state.value, api().visible.value, api().instant.value]).toEqual([
        'showing',
        true,
        true,
      ])
      expect(names()).toEqual(['show'])
      await flush()
      expect([api().state.value, api().instant.value]).toEqual(['shown', false])
      expect(names()).toEqual(['show', 'shown'])
    })

    it('is final when shown / hidden listeners run, and unchanged when request listeners run', async () => {
      const seen: [string, ShowHideState][] = []
      const host = mountControlled({}, {onEmit: (name, a) => void seen.push([name, a.state.value])})
      await flush()
      void host.api().show()
      await host.settle()
      void host.api().hide('close')
      await host.settle()
      expect(seen).toEqual([
        ['show', 'hidden'],
        ['shown', 'shown'],
        ['close', 'shown'],
        ['hide', 'shown'],
        ['hidden', 'hidden'],
      ])
    })

    it('a show during hiding reverses: the state class flips back and hidden never fires', async () => {
      const host = mountControlled()
      await reach(host, 'hiding')
      expect(host.api().visible.value).toBe(false)
      void host.api().show()
      expect([host.api().state.value, host.api().visible.value, host.api().isActive.value]).toEqual(
        ['showing', true, true]
      )
      await host.settle()
      expect(host.names()).not.toContain('hidden')
    })
  })

  /**
   * The transition table: every request in every state, with every way a listener of the
   * request's cancelable event can behave. `events` are the events from the request on, until
   * everything settled.
   */
  type Listener = 'none' | 'prevents' | 'nested show' | 'nested hide' | 'throws'
  interface Row {
    state: ShowHideState
    request: ShowHideRequest
    listener: Listener
    events: string[]
    final: ShowHideState
    /** What the request's promise resolves to */
    result?: boolean | string
    /** What the operation in flight before the request (the show / the `hide('first')`) resolves to */
    inFlight?: boolean | string
    /** What the listener's own `show()` / `hide('inner')` resolves to */
    nested?: boolean | string
    /** The request returns the promise of the operation in flight */
    joins?: boolean
  }
  // Requests are `show()`, `hide('x')` and unmounting. The operation in flight is `show()` in
  // `showing` and `hide('first')` in `hiding`
  // prettier-ignore
  const rows: Row[] = [
    // hidden
    {state: 'hidden', request: 'show', listener: 'none', events: ['show', 'shown'], final: 'shown', result: true},
    {state: 'hidden', request: 'show', listener: 'prevents', events: ['show', 'show-prevented'], final: 'hidden', result: 'show-prevented'},
    // The nested show is carried out, the outer one yields to it
    {state: 'hidden', request: 'show', listener: 'nested show', events: ['show', 'show', 'shown'], final: 'shown', result: true, nested: true},
    // Nothing to hide: the nested hide changes nothing and the show goes on
    {state: 'hidden', request: 'show', listener: 'nested hide', events: ['show', 'shown'], final: 'shown', result: true, nested: ''},
    {state: 'hidden', request: 'show', listener: 'throws', events: ['show'], final: 'hidden'},
    {state: 'hidden', request: 'hide', listener: 'none', events: [], final: 'hidden', result: ''},
    {state: 'hidden', request: 'dispose', listener: 'none', events: [], final: 'hidden'},

    // showing
    {state: 'showing', request: 'show', listener: 'none', events: ['shown'], final: 'shown', result: true, inFlight: true, joins: true},
    {state: 'showing', request: 'hide', listener: 'none', events: ['x', 'hide', 'hidden'], final: 'hidden', result: 'x', inFlight: false},
    {state: 'showing', request: 'hide', listener: 'prevents', events: ['x', 'hide', 'hide-prevented', 'shown'], final: 'shown', result: 'hide-prevented', inFlight: true},
    // The nested show joins the show in flight, which the hide then supersedes
    {state: 'showing', request: 'hide', listener: 'nested show', events: ['x', 'hide', 'hidden'], final: 'hidden', result: 'x', inFlight: false, nested: false},
    // The nested hide is carried out, the outer one yields to it
    {state: 'showing', request: 'hide', listener: 'nested hide', events: ['x', 'hide', 'inner', 'hide', 'hidden'], final: 'hidden', result: 'inner', inFlight: false, nested: 'inner'},
    {state: 'showing', request: 'hide', listener: 'throws', events: ['x', 'hide', 'shown'], final: 'shown', inFlight: true},
    {state: 'showing', request: 'dispose', listener: 'none', events: [], final: 'showing', inFlight: false},

    // shown
    {state: 'shown', request: 'show', listener: 'none', events: [], final: 'shown', result: true},
    {state: 'shown', request: 'hide', listener: 'none', events: ['x', 'hide', 'hidden'], final: 'hidden', result: 'x'},
    {state: 'shown', request: 'hide', listener: 'prevents', events: ['x', 'hide', 'hide-prevented'], final: 'shown', result: 'hide-prevented'},
    {state: 'shown', request: 'hide', listener: 'nested show', events: ['x', 'hide', 'hidden'], final: 'hidden', result: 'x', nested: true},
    {state: 'shown', request: 'hide', listener: 'nested hide', events: ['x', 'hide', 'inner', 'hide', 'hidden'], final: 'hidden', result: 'inner', nested: 'inner'},
    {state: 'shown', request: 'hide', listener: 'throws', events: ['x', 'hide'], final: 'shown'},
    {state: 'shown', request: 'dispose', listener: 'none', events: [], final: 'shown'},

    // hiding
    {state: 'hiding', request: 'show', listener: 'none', events: ['show', 'shown'], final: 'shown', result: true, inFlight: false},
    {state: 'hiding', request: 'show', listener: 'prevents', events: ['show', 'show-prevented', 'hidden'], final: 'hidden', result: 'show-prevented', inFlight: 'first'},
    {state: 'hiding', request: 'show', listener: 'nested show', events: ['show', 'show', 'shown'], final: 'shown', result: true, inFlight: false, nested: true},
    // The nested hide joins the hide in flight, which the show then supersedes
    {state: 'hiding', request: 'show', listener: 'nested hide', events: ['show', 'shown'], final: 'shown', result: true, inFlight: false, nested: false},
    {state: 'hiding', request: 'show', listener: 'throws', events: ['show', 'hidden'], final: 'hidden', inFlight: 'first'},
    // The hide in flight keeps its trigger
    {state: 'hiding', request: 'hide', listener: 'none', events: ['hidden'], final: 'hidden', result: 'first', inFlight: 'first', joins: true},
    {state: 'hiding', request: 'dispose', listener: 'none', events: [], final: 'hiding', inFlight: false},
  ]

  describe('transition table', () => {
    it('has a row for every cell, and every listener behavior where events are cancelable', () => {
      const listeners: Listener[] = ['none', 'prevents', 'nested show', 'nested hide', 'throws']
      const expected = (Object.keys(showHideTransitions) as ShowHideState[]).flatMap((state) =>
        (Object.keys(showHideTransitions[state]) as ShowHideRequest[]).flatMap((request) =>
          (showHideTransitions[state][request].action === 'start' ? listeners : ['none']).map(
            (listener) => `${state} ${request} ${listener}`
          )
        )
      )
      expect(rows.map((row) => `${row.state} ${row.request} ${row.listener}`)).toEqual(expected)
    })

    it.each(rows)('$state + $request, listener: $listener → $final', async (row) => {
      const prevent: string[] = []
      const requestEvent = row.request === 'show' ? 'show' : 'hide'
      let armed = false
      let nested: Promise<boolean | string> | undefined
      const host = mountControlled(
        {},
        {
          prevent,
          onEmit: (name, a) => {
            if (!armed || name !== requestEvent) return
            // Once: the nested request emits the same event again
            armed = false
            if (row.listener === 'nested show') nested = a.show()
            if (row.listener === 'nested hide') nested = a.hide('inner')
            if (row.listener === 'throws') throw new Error('listener')
          },
        }
      )
      const {inFlight} = await reach(host, row.state)
      const from = host.names().length
      armed = true
      if (row.listener === 'prevents') prevent.push(requestEvent)

      let result: Promise<boolean | string> | undefined
      let thrown: unknown
      try {
        if (row.request === 'show') result = host.api().show()
        else if (row.request === 'hide') result = host.api().hide('x')
        else host.wrapper.unmount()
      } catch (error) {
        thrown = error
      }
      expect(thrown instanceof Error).toBe(row.listener === 'throws')
      expect(result !== undefined && result === inFlight).toBe(row.joins === true)
      await host.settle()

      expect(host.names().slice(from)).toEqual(row.events)
      expect(host.api().state.value).toBe(row.final)
      // Every promise there is has settled by now; a row leaves out the ones that do not exist
      expect({result: await result, inFlight: await inFlight, nested: await nested}).toEqual({
        result: row.result,
        inFlight: row.inFlight,
        nested: row.nested,
      })
    })
  })

  describe('dispose', () => {
    it("resolves an open show(true) cycle with 'dispose', without events", async () => {
      const host = mountControlled()
      await flush()
      const cycle = host.api().show(true)
      await host.settle()
      const hiding = host.api().hide('x')
      const from = host.names().length
      host.wrapper.unmount()
      await expect(hiding).resolves.toBe(false)
      await expect(cycle).resolves.toBe('dispose')
      expect(host.names().slice(from)).toEqual([])
    })

    it('requests after unmount resolve false without events', async () => {
      const {api, names, wrapper} = mountHost({}, {modelValue: ref(true)})
      await flush()
      wrapper.unmount()
      const from = names().length
      await expect(api().hide('x')).resolves.toBe(false)
      await expect(api().show()).resolves.toBe(false)
      await expect(api().toggle()).resolves.toBe(false)
      expect(names().slice(from)).toEqual([])
    })

    it('cancels a delayed change', async () => {
      vi.useFakeTimers()
      const {api, names, wrapper} = mountHost({delay: 100})
      await nextTick()
      const promise = api().show()
      wrapper.unmount()
      await vi.runAllTimersAsync()
      await expect(promise).resolves.toBe(false)
      expect(names()).toEqual(['show'])
      expect(api().visible.value).toBe(false)
    })
  })

  describe('disabled', () => {
    it("resolves show() with 'show-prevented' and emits nothing", async () => {
      const {api, names} = mountHost({}, {disabled: ref(true)})
      await flush()
      await expect(api().show()).resolves.toBe('show-prevented')
      expect(names()).toEqual([])
      expect(api().state.value).toBe('hidden')
    })

    it('writes the model back when v-model asks for a show', async () => {
      const modelValue = ref<boolean | number>(false)
      const {api, names} = mountHost({}, {modelValue, disabled: ref(true)})
      await flush()
      modelValue.value = true
      await flush()
      expect(modelValue.value).toBe(false)
      expect(api().state.value).toBe('hidden')
      expect(names()).toEqual([])
    })

    it("hides with trigger 'disabled' when turned on while shown", async () => {
      const disabled = ref(false)
      const {api, names, event} = mountHost({}, {modelValue: ref(true), disabled})
      await flush()
      disabled.value = true
      await flush()
      expect(names()).toEqual(['show', 'shown', 'hide', 'hidden'])
      expect(event('hidden')?.trigger).toBe('disabled')
      expect(api().state.value).toBe('hidden')
    })

    it('shows again once enabled', async () => {
      const disabled = ref(true)
      const {api} = mountHost({}, {disabled})
      await flush()
      disabled.value = false
      await expect(api().show()).resolves.toBe(true)
    })
  })

  describe('toggle', () => {
    it('yields to a request made by a toggle listener', async () => {
      let listenerHide: Promise<boolean | string> | undefined
      const {api, names} = mountHost(
        {},
        {
          modelValue: ref(true),
          onEmit: (name, a) => {
            if (name === 'toggle') listenerHide = a.hide('inner')
          },
        }
      )
      await flush()
      const outer = api().toggle()
      expect(outer).toBe(listenerHide)
      await expect(outer).resolves.toBe('inner')
      expect(names()).toEqual(['show', 'shown', 'toggle', 'inner', 'hide', 'hidden'])
      expect(api().state.value).toBe('hidden')
    })

    it.each([
      {state: 'hidden', final: 'shown'},
      {state: 'showing', final: 'hidden'},
      {state: 'shown', final: 'hidden'},
      {state: 'hiding', final: 'shown'},
    ] as const)('from $state ends $final', async ({state, final}) => {
      const host = mountControlled()
      await reach(host, state)
      void host.api().toggle()
      await host.settle()
      expect(host.api().state.value).toBe(final)
    })
  })

  describe('cycles (show(true))', () => {
    it('joins the open cycle when already shown', async () => {
      const {api} = mountHost({}, {modelValue: ref(true)})
      await flush()
      const onHide = vi.fn<(v: boolean | string) => void>()
      void api().show(true).then(onHide)
      await flush()
      expect(onHide).not.toHaveBeenCalled()
      await api().hide('ok')
      await flush()
      expect(onHide).toHaveBeenCalledWith('ok')
    })

    it('survives a hide that is reversed', async () => {
      const host = mountControlled()
      await flush()
      const cycle = host.api().show(true)
      await host.settle()
      const reversed = host.api().hide('first')
      void host.api().show()
      await host.settle()
      await expect(reversed).resolves.toBe(false)
      void host.api().hide('second')
      await host.settle()
      await expect(cycle).resolves.toBe('second')
    })
  })

  // Rows of the edge-case catalog in architecture/BOOTSTRAP_V6_SHOW_HIDE_STATE_MACHINE.md that
  // the table above does not spell out. #2 / #3, #5 and #7 are further up in this file
  describe('catalog', () => {
    it('#1 hide() twice during the hide delay emits once and keeps the first trigger', async () => {
      vi.useFakeTimers()
      const {api, names, event} = mountHost({delay: {show: 0, hide: 100}}, {modelValue: ref(true)})
      await vi.runAllTimersAsync()
      const first = api().hide('ok')
      const second = api().hide('cancel')
      expect(second).toBe(first)
      await vi.runAllTimersAsync()
      await expect(first).resolves.toBe('ok')
      expect(names()).toEqual(['show', 'shown', 'ok', 'hide', 'hidden'])
      expect(event('hidden')?.trigger).toBe('ok')
    })

    it('#4 show() during a hide delay, then hide(): only the last call counts', async () => {
      vi.useFakeTimers()
      const {api, names, event} = mountHost({delay: 100}, {modelValue: ref(true)})
      await vi.runAllTimersAsync()
      const first = api().hide('first')
      const show = api().show()
      const second = api().hide('second')
      await vi.runAllTimersAsync()
      await expect(first).resolves.toBe(false)
      await expect(show).resolves.toBe(false)
      await expect(second).resolves.toBe('second')
      expect(names().filter((name) => name === 'hidden')).toHaveLength(1)
      expect(event('hidden')?.trigger).toBe('second')
    })

    it('#6 a hide listener that hides wins: one hidden, both calls get its trigger', async () => {
      let inner: Promise<boolean | string> | undefined
      let acted = false
      const {api, names, event} = mountHost(
        {},
        {
          modelValue: ref(true),
          onEmit: (name, a) => {
            if (name !== 'hide' || acted) return
            acted = true
            inner = a.hide('inner')
          },
        }
      )
      await flush()
      const outer = api().hide('outer')
      await expect(outer).resolves.toBe('inner')
      await expect(inner).resolves.toBe('inner')
      expect(names().filter((name) => name === 'hidden')).toHaveLength(1)
      expect(event('hidden')?.trigger).toBe('inner')
    })

    it('#8 a prevented hide does not settle a waiting show(true)', async () => {
      const prevent = ['hide']
      const {api} = mountHost({}, {prevent})
      await flush()
      const onHide = vi.fn<(v: boolean | string) => void>()
      void api().show(true).then(onHide)
      await flush()
      await expect(api().hide('ok')).resolves.toBe('hide-prevented')
      await flush()
      expect(onHide).not.toHaveBeenCalled()
      prevent.length = 0
      await api().hide('cancel')
      await flush()
      expect(onHide).toHaveBeenCalledWith('cancel')
    })

    it('#9 a prevented hide does not cancel a pending delayed show', async () => {
      vi.useFakeTimers()
      const {api, names} = mountHost({delay: 100}, {prevent: ['hide']})
      await nextTick()
      const show = api().show()
      await expect(api().hide()).resolves.toBe('hide-prevented')
      expect(api().state.value).toBe('showing')
      await vi.runAllTimersAsync()
      await expect(show).resolves.toBe(true)
      expect(names()).toEqual(['show', 'hide', 'hide-prevented', 'shown'])
    })

    it('#10 a hide after a prevented hide is a new request', async () => {
      const prevent = ['hide']
      const {api} = mountHost({}, {modelValue: ref(true), prevent})
      await flush()
      await expect(api().hide('ok')).resolves.toBe('hide-prevented')
      prevent.length = 0
      await expect(api().hide('cancel')).resolves.toBe('cancel')
    })

    it('#11 a hide listener that prevents and then hides: the nested hide counts', async () => {
      let inner: Promise<boolean | string> | undefined
      let acted = false
      const {api, names, event} = mountHost(
        {},
        {
          modelValue: ref(true),
          onEmit: (name, a, e) => {
            if (name !== 'hide' || acted) return
            acted = true
            e.preventDefault()
            inner = a.hide('cancel')
          },
        }
      )
      await flush()
      const outer = api().hide('ok')
      await expect(outer).resolves.toBe('cancel')
      await expect(inner).resolves.toBe('cancel')
      expect(names()).toEqual(['show', 'shown', 'ok', 'hide', 'cancel', 'hide', 'hidden'])
      expect(event('hidden')?.trigger).toBe('cancel')
    })

    it('#26 a trigger listener hides during a pending show and a hidden listener reopens', async () => {
      let reopened: Promise<boolean | string> | undefined
      let inner: Promise<boolean | string> | undefined
      const host = mountControlled(
        {},
        {
          onEmit: (name, a) => {
            if (name === 'ok') inner = a.hide('inner')
            if (name === 'hidden' && !reopened) reopened = a.show()
          },
        }
      )
      await reach(host, 'showing')
      const from = host.names().length
      const outer = host.api().hide('ok')
      expect(outer).toBe(inner)
      await host.settle()
      await expect(outer).resolves.toBe('inner')
      await expect(reopened).resolves.toBe(true)
      expect(host.names().slice(from)).toEqual(['ok', 'inner', 'hide', 'hidden', 'show', 'shown'])
      expect(host.api().state.value).toBe('shown')
    })
  })

  describe('invariants over generated request sequences', () => {
    // Small deterministic generator, so a failure names its seed
    const random = (seed: number) => () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    it.each(Array.from({length: 40}, (_, seed) => seed))('seed %i', async (seed) => {
      const next = random(seed + 1)
      const violations: string[] = []
      let prevented = 0
      const host = mountControlled(
        {},
        {
          onEmit: (name, a, e) => {
            const state = a.state.value
            // Finish events see the final state, request events the state before the request
            if (name === 'shown' && state !== 'shown') violations.push(`shown in ${state}`)
            if (name === 'hidden' && state !== 'hidden') violations.push(`hidden in ${state}`)
            if (name === 'show' && state !== 'hidden' && state !== 'hiding')
              violations.push(`show in ${state}`)
            if (name === 'hide' && state !== 'showing' && state !== 'shown')
              violations.push(`hide in ${state}`)
            if ((name === 'show' || name === 'hide') && next() < 0.2) {
              e.preventDefault()
              prevented++
            } else if (name === 'hide' && next() < 0.15) {
              void a.hide('listener')
            } else if (name === 'hidden' && next() < 0.15) {
              void a.show()
            }
          },
        }
      )
      await flush()
      const results: Promise<boolean | string>[] = []
      const consistent = () => {
        const {state, visible, isActive} = host.api()
        const expected = {
          hidden: [false, false],
          showing: [true, true],
          shown: [true, true],
          hiding: [false, true],
        }[state.value]
        if (visible.value !== expected[0] || isActive.value !== expected[1])
          violations.push(`${state.value}: visible ${visible.value}, active ${isActive.value}`)
      }
      for (let step = 0; step < 30; step++) {
        const pick = next()
        if (pick < 0.25) results.push(host.api().show())
        else if (pick < 0.35) results.push(host.api().show(true))
        else if (pick < 0.6) results.push(host.api().hide(`t${step}`))
        else if (pick < 0.75) results.push(host.api().toggle())
        else if (pick < 0.85) host.modelValue.value = !host.modelValue.value
        else await host.settle()
        consistent()
        if (next() < 0.3) await flush()
        consistent()
      }
      await host.settle()
      consistent()
      expect(['hidden', 'shown']).toContain(host.api().state.value)
      host.wrapper.unmount()
      // Every promise settles, with one of the documented results
      const settled = await Promise.race([
        Promise.all(results),
        flush().then(() => 'pending' as const),
      ])
      expect(settled).not.toBe('pending')
      for (const result of settled as (boolean | string)[]) {
        expect(
          typeof result === 'boolean' ||
            [
              '',
              'show-prevented',
              'hide-prevented',
              'dispose',
              'listener',
              'toggle-function',
              'modelValue',
            ].includes(result) ||
            /^t\d+$/.test(result)
        ).toBe(true)
      }
      const count = (name: string) => host.names().filter((n) => n === name).length
      // Every request is prevented, carried out or yields; `shown` / `hidden` need a carried out one
      expect(count('show-prevented') + count('hide-prevented')).toBeLessThanOrEqual(prevented)
      expect(count('shown')).toBeLessThanOrEqual(count('show'))
      expect(count('hidden')).toBeLessThanOrEqual(count('hide'))
      expect(violations).toEqual([])
    })
  })
})

describe('createShowHideMachine', () => {
  const createHost = (overrides: Partial<ShowHideMachineHost> = {}) => {
    const events: [string, ShowHideEventInit][] = []
    const prevent = new Set<string>()
    const machine = createShowHideMachine({
      initiallyShown: false,
      emit: (name, init) => {
        events.push([name, init])
        return prevent.has(name) && init.cancelable === true
      },
      getDelay: () => 0,
      transition: () => Promise.resolve(true),
      isDisabled: () => false,
      onChange: () => {},
      onCommit: () => {},
      onRefused: () => {},
      ...overrides,
    })
    return {machine, events, prevent, names: () => events.map(([name]) => name)}
  }

  it('needs no component, DOM or timers to run a whole cycle', async () => {
    const {machine, names} = createHost()
    await expect(machine.show()).resolves.toBe(true)
    expect(machine.snapshot().state).toBe('shown')
    await expect(machine.hide('close')).resolves.toBe('close')
    expect(machine.snapshot()).toEqual({
      state: 'hidden',
      phase: null,
      visible: false,
      active: false,
      instant: false,
    })
    expect(names()).toEqual(['show', 'shown', 'close', 'hide', 'hidden'])
  })

  it('a hide that already happened cannot be refused', async () => {
    const {machine, events, prevent} = createHost()
    await machine.show()
    prevent.add('hide')
    await expect(machine.hide('native', {cancelable: false, noTriggerEmit: true})).resolves.toBe(
      'native'
    )
    const hide = events.find(([name]) => name === 'hide')
    expect(hide?.[1].cancelable).toBe(false)
    expect(events.map(([name]) => name)).not.toContain('hide-prevented')
    expect(machine.snapshot().state).toBe('hidden')
  })

  it('an initially shown component hidden before mount never announces its show', async () => {
    const {machine, names} = createHost({initiallyShown: true})
    expect(machine.snapshot().state).toBe('showing')
    const joined = machine.show()
    const hidden = machine.hide('early')
    machine.mount()
    await expect(joined).resolves.toBe(false)
    await expect(hidden).resolves.toBe('early')
    expect(names()).toEqual(['early', 'hide', 'hidden'])
  })

  it('a refused initial show ends hidden and tells its callers', async () => {
    const onCommit = vi.fn<(visible: boolean) => void>()
    const {machine, names, prevent} = createHost({initiallyShown: true, onCommit})
    prevent.add('show')
    const joined = machine.show()
    const cycle = machine.show({resolveOnHide: true})
    machine.mount()
    await expect(joined).resolves.toBe('show-prevented')
    await expect(cycle).resolves.toBe('show-prevented')
    expect(machine.snapshot().state).toBe('hidden')
    expect(onCommit).toHaveBeenCalledWith(false)
    expect(names()).toEqual(['show', 'show-prevented'])
  })

  it('reports the delay as a phase', () => {
    vi.useFakeTimers()
    const {machine} = createHost({getDelay: () => 50})
    void machine.show()
    expect(machine.snapshot()).toMatchObject({state: 'showing', phase: 'delay', visible: false})
    vi.advanceTimersByTime(50)
    expect(machine.snapshot()).toMatchObject({state: 'showing', phase: 'transition', visible: true})
    machine.dispose()
    vi.useRealTimers()
  })
})
