import {describe, expect, it, vi} from 'vitest'
import {type Ref, ref, shallowReactive, shallowRef} from 'vue'
import {buildController} from '.'
import type {
  ControllerKey,
  DialogOrchestratorArrayValue,
  OrchestratorItemConnection,
  OrchestratorItemFns,
} from '../../types/ComponentOrchestratorTypes'
import {BvTriggerableEvent} from '../../utils'
import {createShowHideMachine, type ShowHideState} from '../showHideMachine'

type DialogStore = Map<ControllerKey, Ref<DialogOrchestratorArrayValue>>

// Like the registry's maps
const newStore = (): DialogStore => shallowReactive(new Map())

const build = (
  props: DialogOrchestratorArrayValue['props'] = {},
  options: Parameters<typeof buildController>[2] = {},
  {id = 'item', store = newStore()}: {id?: ControllerKey; store?: DialogStore} = {}
) => {
  const built = buildController<unknown, DialogStore>(id, store, options)
  store.set(
    id,
    ref({component: {} as never, id, fns: built.fns, props} as DialogOrchestratorArrayValue)
  )
  return {...built, store}
}

type Listener = (event: BvTriggerableEvent) => void

/**
 * A stand-in for the show/hide component an item renders: a real state machine, connected to the
 * controller the way `useShowHide` does it
 */
const connect = (
  fns: OrchestratorItemFns,
  {
    listeners = {},
    holdTransitions = false,
    disabled = false,
  }: {listeners?: Record<string, Listener>; holdTransitions?: boolean; disabled?: boolean} = {}
) => {
  const events: BvTriggerableEvent[] = []
  const state = shallowRef<ShowHideState>('hidden')
  let model: boolean | number = false
  let connection: OrchestratorItemConnection | undefined
  /** Finishes the transitions in progress, when they are held */
  const pending: ((finished: boolean) => void)[] = []
  const machine = createShowHideMachine({
    initiallyShown: false,
    emit: (name, init) => {
      const event = new BvTriggerableEvent(name, {cancelable: false, ...init})
      events.push(event)
      listeners[name]?.(event)
      connection?.onEvent(event)
      return event.defaultPrevented
    },
    getDelay: () => 0,
    transition: () =>
      holdTransitions
        ? new Promise<boolean>((resolve) => {
            pending.push(resolve)
          })
        : Promise.resolve(true),
    isDisabled: () => disabled,
    onChange: (next) => {
      state.value = next.state
      connection?.onState(next.state)
    },
    onCommit: (visible) => {
      if (visible && !model) model = true
      else if (!visible && model) model = typeof model === 'number' ? 0 : false
    },
    onRefused: () => {},
  })
  connection = fns.link.connect({
    state,
    show: () => machine.show(),
    hide: (trigger) => machine.hide(trigger, {noTriggerEmit: true}),
    toggle: () =>
      machine.targetVisible()
        ? machine.hide('toggle-function', {noTriggerEmit: true})
        : machine.show(),
    model: () => model,
    setModel: (value) => {
      model = value
    },
  })
  return {
    machine,
    state,
    events,
    names: () => events.map((event) => event.eventType),
    model: () => model,
    setModel: (value: boolean | number) => {
      model = value
    },
    /** Emits an event as if another entry point of the component had */
    emitExternal: (name: string) => {
      const event = new BvTriggerableEvent(name)
      events.push(event)
      connection?.onEvent(event)
    },
    mount: () => connection?.mounted(),
    unmount: () => {
      connection?.disconnect()
      connection = undefined
      machine.dispose()
    },
    finishTransitions: () => {
      pending.splice(0).forEach((resolve) => {
        resolve(true)
      })
    },
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

/** Resolves `true` once `promise` settled, `false` if it is still pending after a flush */
const isSettled = async (promise: Promise<unknown> | undefined) => {
  let settled = false
  void promise?.then(() => {
    settled = true
  })
  await flush()
  return settled
}

const stateOf = (controller: unknown) => (controller as {state: ShowHideState}).state

describe('buildController', () => {
  describe('store item', () => {
    it('set method does not add undefined title and body when they are not in the value', () => {
      const {controller, store} = build({modelValue: false})
      controller.set({modelValue: true})
      const props = store.get('item')?.value.props
      expect(props).not.toHaveProperty('title')
      expect(props).not.toHaveProperty('body')
    })

    it('set method preserves title and body when they are defined', () => {
      const {controller, store} = build({title: 'Test Title', body: 'Test Body'})
      controller.set({modelValue: true})
      expect(store.get('item')?.value.props).toMatchObject({title: 'Test Title', body: 'Test Body'})
    })

    it('set method handles undefined title explicitly passed', () => {
      const {controller, store} = build({title: 'Original'})
      controller.set({title: undefined})
      const props = store.get('item')?.value.props
      expect(props).toHaveProperty('title')
      expect(props?.title).toBeUndefined()
    })

    it('get returns the current store item', () => {
      const {controller, store} = build({title: 'Hello'})
      expect(controller.get()).toBe(store.get('item'))
    })

    it('controller implements AsyncDisposable', () => {
      const {controller} = build()
      expect(typeof controller[Symbol.asyncDispose]).toBe('function')
    })
  })

  describe('one owner of visibility', () => {
    it('shows through the component state machine and never writes the store', async () => {
      const {controller, fns, store} = build()
      const item = connect(fns)
      item.mount()

      const shown = controller.show()
      expect(item.names()).toEqual(['show'])
      await flush()
      expect(stateOf(controller)).toBe('shown')
      expect(store.get('item')?.value.props).not.toHaveProperty('modelValue')

      controller.hide('close')
      await flush()
      expect(stateOf(controller)).toBe('hidden')
      expect(store.get('item')?.value.props).not.toHaveProperty('modelValue')
      const result = await shown
      expect(result).toBeInstanceOf(BvTriggerableEvent)
      expect(result.eventType).toBe('hidden')
      expect(result.trigger).toBe('close')
    })

    it('state follows the machine, and is `showing` while a show waits for the component', async () => {
      const {controller, fns} = build()
      expect(stateOf(controller)).toBe('hidden')
      void controller.show()
      expect(stateOf(controller)).toBe('showing')

      const item = connect(fns, {holdTransitions: true})
      item.mount()
      expect(stateOf(controller)).toBe('showing')
      item.finishTransitions()
      await flush()
      expect(stateOf(controller)).toBe('shown')
    })

    it('joins a show the component started itself, without a second show request', async () => {
      const {controller, fns} = build()
      const item = connect(fns, {holdTransitions: true})
      item.mount()
      void item.machine.show()

      const shown = controller.show()
      expect(item.names()).toEqual(['show'])
      item.finishTransitions()
      await flush()
      expect(await isSettled(shown)).toBe(false)

      void item.machine.hide('esc', {noTriggerEmit: true})
      item.finishTransitions()
      expect((await shown).trigger).toBe('esc')
    })

    it('reverses a hide in progress', async () => {
      const {controller, fns} = build()
      const item = connect(fns, {holdTransitions: true})
      item.mount()
      void controller.show()
      item.finishTransitions()
      await flush()

      controller.hide('close')
      expect(stateOf(controller)).toBe('hiding')
      void controller.show()
      expect(stateOf(controller)).toBe('showing')
      expect(item.names()).toEqual(['show', 'shown', 'hide', 'show'])
    })

    it('a controller sees only its own component, when another item has the same id (#23)', async () => {
      const dialogs = build({}, {}, {id: 'shared-id'})
      const toasts = build({}, {}, {id: 'shared-id'})
      const dialog = connect(dialogs.fns)
      const toast = connect(toasts.fns)
      dialog.mount()
      toast.mount()

      void toasts.controller.show()
      await flush()
      expect(stateOf(toasts.controller)).toBe('shown')
      expect(stateOf(dialogs.controller)).toBe('hidden')
      expect(dialog.events).toHaveLength(0)
    })

    it('a show requested before the component mounts is made once it mounts', async () => {
      const {controller, fns} = build()
      const shown = controller.show()
      const item = connect(fns)
      expect(item.names()).toEqual([])
      item.mount()
      expect(item.names()).toEqual(['show'])
      await flush()
      expect(stateOf(controller)).toBe('shown')
      controller.hide('x')
      expect((await shown).trigger).toBe('x')
    })

    it('a hide of an unmounted item clears a modelValue it would mount shown with', () => {
      const {controller, store} = build({modelValue: true})
      controller.hide()
      expect(store.get('item')?.value.props.modelValue).toBe(false)
    })
  })

  describe('results', () => {
    it('maps the settling event through toResult, reading the component after its hide returned', async () => {
      const {controller, fns} = build(
        {},
        {toResult: (event, instance) => ({trigger: event.trigger, instance})}
      )
      const item = connect(fns)
      controller.ref = {returnValue: 'saved'} as never
      item.mount()
      const shown = controller.show()
      await flush()
      controller.hide('ok')
      const result = await shown
      expect(result).toMatchObject({trigger: 'ok', instance: {returnValue: 'saved'}})
      expect(result).not.toBeInstanceOf(BvTriggerableEvent)
    })

    it('settles on hide only with resolveOnHide, from create() or overridden per show()', async () => {
      const {controller, fns} = build({}, {createOptions: {resolveOnHide: true}})
      const item = connect(fns, {holdTransitions: true})
      item.mount()

      const first = controller.show()
      item.finishTransitions()
      await flush()
      controller.hide('ok')
      // Still hiding: the transition is held
      expect(stateOf(controller)).toBe('hiding')
      const firstResult = await first
      expect(firstResult.eventType).toBe('hide')
      expect(firstResult.trigger).toBe('ok')
      item.finishTransitions()
      await flush()

      const second = controller.show({resolveOnHide: false})
      item.finishTransitions()
      await flush()
      controller.hide('cancel')
      expect(await isSettled(second)).toBe(false)
      item.finishTransitions()
      expect((await second).eventType).toBe('hidden')
    })

    it('resolveOnHide settles with the hide that was carried out, not an outer one it yielded to', async () => {
      const {controller, fns} = build({}, {createOptions: {resolveOnHide: true}})
      let nested = false
      const item = connect(fns, {
        listeners: {
          hide: () => {
            if (nested) return
            nested = true
            void item.machine.hide('inner', {noTriggerEmit: true})
          },
        },
      })
      item.mount()
      const shown = controller.show()
      await flush()
      controller.hide('outer')
      expect((await shown).trigger).toBe('inner')
    })

    it('show result has Symbol.asyncDispose that calls destroy', async () => {
      const {controller, fns, store} = build()
      connect(fns).mount()
      const shown = controller.show()
      await flush()
      controller.hide()
      const result = await shown
      expect(typeof result[Symbol.asyncDispose]).toBe('function')
      await result[Symbol.asyncDispose]()
      expect(store.has('item')).toBe(false)
    })

    it('a show refused by a disabled component resolves show-prevented without events', async () => {
      const {controller, fns} = build()
      const item = connect(fns, {disabled: true})
      item.mount()
      const result = await controller.show()
      expect(result.eventType).toBe('show-prevented')
      expect(item.events).toHaveLength(0)
    })

    it('the component unmounting while shown settles the cycle with trigger dispose', async () => {
      const {controller, fns} = build()
      const item = connect(fns)
      item.mount()
      const shown = controller.show()
      await flush()
      item.unmount()
      const result = await shown
      expect(result.trigger).toBe('dispose')
      expect(stateOf(controller)).toBe('hidden')
    })
  })

  describe('catalog regressions (BOOTSTRAP_V6_SHOW_HIDE_STATE_MACHINE.md)', () => {
    it('#12: shows again after the component closed itself', async () => {
      const {controller, fns} = build()
      const item = connect(fns)
      item.mount()
      void controller.show()
      await flush()
      void item.machine.hide('esc', {noTriggerEmit: true})
      await flush()
      expect(stateOf(controller)).toBe('hidden')

      void controller.show()
      await flush()
      expect(stateOf(controller)).toBe('shown')
    })

    it('#13: each show waits for the hide that ends its own cycle', async () => {
      const {controller, fns} = build()
      connect(fns).mount()
      const first = controller.show()
      await flush()
      controller.hide('a')
      expect((await first).trigger).toBe('a')

      const second = controller.show()
      expect(await isSettled(second)).toBe(false)
      controller.hide('b')
      expect((await second).trigger).toBe('b')
    })

    it('#14: an item dismissed before it mounts settles with the trigger used', async () => {
      const {controller, fns} = build()
      const shown = controller.show()
      controller.hide('route-change')
      expect((await shown).trigger).toBe('route-change')
      const item = connect(fns)
      item.mount()
      expect(item.events).toHaveLength(0)
    })

    it('#15: an onShow listener aborting the signal prevents the show', async () => {
      const {controller, fns} = build()
      const scope = new AbortController()
      const item = connect(fns, {listeners: {show: () => scope.abort()}})
      item.mount()
      const result = await controller.show({signal: scope.signal})
      expect(result.trigger).toBe('abort')
      expect(item.names()).toEqual(['show', 'show-prevented'])
      expect(stateOf(controller)).toBe('hidden')
    })

    it('#16: an already aborted signal hides a component shown through its own show()', async () => {
      const {controller, fns} = build()
      const item = connect(fns)
      item.mount()
      void item.machine.show()
      await flush()
      const result = await controller.show({signal: AbortSignal.abort()})
      expect(result.trigger).toBe('abort')
      expect(stateOf(controller)).toBe('hidden')
    })

    it('#17: destroy() while a show is in progress hides, settles show() and removes the item', async () => {
      const {controller, fns, store} = build()
      const item = connect(fns, {holdTransitions: true})
      item.mount()
      const shown = controller.show()
      expect(stateOf(controller)).toBe('showing')

      const destroyed = controller.destroy()
      expect(stateOf(controller)).toBe('hiding')
      item.finishTransitions()
      await destroyed
      expect((await shown).trigger).toBe('destroy')
      expect(store.has('item')).toBe(false)
    })

    it('#17: destroy() while the item waits to mount settles show() with destroy', async () => {
      const {controller, store} = build()
      const shown = controller.show()
      await controller.destroy()
      expect((await shown).trigger).toBe('destroy')
      expect(store.has('item')).toBe(false)
    })

    it('#20: onShow prevents the show, then destroy() settles and removes the item', async () => {
      const {controller, fns, store} = build()
      connect(fns, {listeners: {show: (event) => event.preventDefault()}}).mount()
      const result = await controller.show()
      expect(result.eventType).toBe('show-prevented')
      await controller.destroy()
      expect(store.has('item')).toBe(false)
    })

    it('#21: a show-prevented from another entry point does not settle an accepted show', async () => {
      const {controller, fns} = build()
      const item = connect(fns, {holdTransitions: true})
      item.mount()
      const shown = controller.show()
      item.emitExternal('show-prevented')
      expect(await isSettled(shown)).toBe(false)
      item.finishTransitions()
      await flush()
      controller.hide('done')
      item.finishTransitions()
      expect((await shown).trigger).toBe('done')
    })

    it('#22: destroy() right after a resolveOnHide show() resolved finishes', async () => {
      const {controller, fns, store} = build({}, {createOptions: {resolveOnHide: true}})
      const item = connect(fns, {holdTransitions: true})
      item.mount()
      const shown = controller.show()
      item.finishTransitions()
      await flush()
      controller.hide('ok')
      expect((await shown).trigger).toBe('ok')

      const destroyed = controller.destroy()
      item.finishTransitions()
      await destroyed
      expect(store.has('item')).toBe(false)
    })

    it('#24: show(); hide(); show() on an unmounted item gives the second show its own cycle', async () => {
      const {controller} = build()
      const first = controller.show()
      controller.hide('cancel')
      const second = controller.show()
      expect((await first).trigger).toBe('cancel')
      expect(await isSettled(second)).toBe(false)
      expect(stateOf(controller)).toBe('showing')
      controller.hide('later')
      expect((await second).trigger).toBe('later')
    })

    it('#25: a mount-time onShow that aborts the signal keeps the item hidden', async () => {
      const {controller, fns} = build()
      const scope = new AbortController()
      const shown = controller.show({signal: scope.signal})
      const item = connect(fns, {listeners: {show: () => scope.abort()}})
      item.mount()
      expect((await shown).trigger).toBe('abort')
      await flush()
      expect(stateOf(controller)).toBe('hidden')
      expect(item.names()).not.toContain('shown')
    })
  })

  describe('show({signal})', () => {
    it('does not show and resolves with trigger abort when the signal is already aborted', async () => {
      const {controller, fns} = build()
      const item = connect(fns)
      item.mount()
      const result = await controller.show({signal: AbortSignal.abort()})
      expect(result.trigger).toBe('abort')
      expect(item.events).toHaveLength(0)
    })

    it('hides the component with trigger abort when the signal aborts', async () => {
      const {controller, fns} = build()
      connect(fns).mount()
      const scope = new AbortController()
      const shown = controller.show({signal: scope.signal})
      await flush()
      scope.abort()
      expect((await shown).trigger).toBe('abort')
      expect(stateOf(controller)).toBe('hidden')
    })

    it('settles when the signal aborts before the component mounts', async () => {
      const {controller} = build()
      const scope = new AbortController()
      const shown = controller.show({signal: scope.signal})
      scope.abort()
      expect((await shown).trigger).toBe('abort')
      expect(stateOf(controller)).toBe('hidden')
    })

    it('stops listening once the promise settles', async () => {
      const {controller, fns} = build()
      const item = connect(fns)
      item.mount()
      const scope = new AbortController()
      const shown = controller.show({signal: scope.signal})
      await flush()
      controller.hide('done')
      await shown
      void controller.show()
      await flush()
      scope.abort()
      await flush()
      expect(stateOf(controller)).toBe('shown')
    })
  })

  describe('countdown', () => {
    it('puts a toast countdown the component ran down to 0 back before showing again', async () => {
      const {controller, fns} = build({modelValue: 5000} as never)
      const item = connect(fns)
      item.setModel(5000)
      item.mount()
      void controller.show()
      await flush()
      void item.machine.hide()
      await flush()
      expect(item.model()).toBe(0)

      void controller.show()
      expect(item.model()).toBe(5000)
    })

    it('puts the countdown back on toggle', async () => {
      const {controller, fns} = build({modelValue: 5000} as never)
      const item = connect(fns)
      item.mount()
      controller.toggle()
      expect(item.model()).toBe(5000)
      await flush()
      expect(stateOf(controller)).toBe('shown')
    })

    it('leaves a boolean modelValue alone', async () => {
      const {controller, fns} = build({modelValue: true})
      const item = connect(fns)
      item.mount()
      void controller.show()
      await flush()
      expect(item.model()).toBe(true)
    })
  })

  describe('toggle', () => {
    it('toggles the mounted component', async () => {
      const {controller, fns} = build()
      const item = connect(fns)
      item.mount()
      controller.toggle()
      await flush()
      expect(stateOf(controller)).toBe('shown')
      controller.toggle()
      await flush()
      expect(stateOf(controller)).toBe('hidden')
    })

    it('toggles a show waiting for the component to mount', () => {
      const {controller} = build()
      controller.toggle()
      expect(stateOf(controller)).toBe('showing')
      controller.toggle()
      expect(stateOf(controller)).toBe('hidden')
    })
  })

  describe('destroy', () => {
    it('removes a hidden item at once', async () => {
      const {controller, fns, store} = build()
      const item = connect(fns)
      item.mount()
      await controller.destroy()
      expect(store.has('item')).toBe(false)
      expect(item.events).toHaveLength(0)
    })

    it('removes the item even when its hide is prevented', async () => {
      const {controller, fns, store} = build()
      const item = connect(fns, {listeners: {hide: (event) => event.preventDefault()}})
      item.mount()
      void controller.show()
      await flush()
      await controller.destroy()
      expect(store.has('item')).toBe(false)
    })

    it('fns.show and fns.hide reach the controller', async () => {
      const {fns, controller} = build()
      const spy = vi.fn<(event: BvTriggerableEvent) => void>()
      connect(fns, {listeners: {hidden: spy}}).mount()
      fns.show()
      await flush()
      expect(stateOf(controller)).toBe('shown')
      fns.hide('helper')
      await flush()
      expect(spy.mock.calls[0]?.[0].trigger).toBe('helper')
    })
  })
})
