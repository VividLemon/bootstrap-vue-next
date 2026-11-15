/**
 * The show/hide lifecycle as an explicit state machine. Internal: components use `useShowHide`,
 * which owns one machine and translates `v-model`, props, triggers and exposed methods into
 * requests to it.
 *
 * No Vue and no browser globals in here. Everything the machine needs from the outside (emitting
 * events, the delay, the transition, writing `modelValue`) comes in through `ShowHideMachineHost`.
 *
 * Rules the code below keeps (see `architecture/ARIA_VISIBILITY.md`):
 *
 * - Request phase: cancelable events are emitted with the state unchanged. When a listener makes
 *   a request that is carried out, the outer request yields to it: it emits nothing more and
 *   returns the listener's result.
 * - Commit phase: the state changes first, then `update:modelValue`. `shown` / `hidden` are
 *   emitted after the state is final and the operation's promise is settled, so a listener that
 *   calls `show()` / `hide()` starts a clean new operation.
 * - Every operation settles exactly once: finished (`true` / the trigger), superseded or disposed
 *   (`false`).
 *
 * @internal
 */

/**
 * `hidden` → `showing` → `shown` → `hiding` → `hidden`. `showing` and `hiding` last from the
 * accepted request (including a configured `delay`) until `shown` / `hidden` is emitted.
 */
export type ShowHideState = 'hidden' | 'showing' | 'shown' | 'hiding'

export type ShowHideRequest = 'show' | 'hide' | 'dispose'

export type ShowHideResult = boolean | string

/**
 * What a request does in a state:
 *
 * - `start`: emits the cancelable request events, then starts an operation and moves to `to`. An
 *   operation in progress is superseded (its promise resolves `false`)
 * - `join`: returns the promise of the operation in progress. No events
 * - `settled`: nothing to do, resolves `result`. No events
 * - `abort`: resolves the operation in progress with `false`. No events
 * - `end`: nothing in progress to settle. No events
 *
 * `abort` and `end` also resolve an open `show(true)` cycle with `'dispose'`.
 */
export type ShowHideTransition =
  | {readonly action: 'start'; readonly to: 'showing' | 'hiding'; readonly supersedes: boolean}
  | {readonly action: 'join'}
  | {readonly action: 'settled'; readonly result: ShowHideResult}
  | {readonly action: 'abort'}
  | {readonly action: 'end'}

/**
 * The transition table: one defined outcome for every request in every state. The machine looks
 * requests up here, and `useShowHide.spec.ts` generates its cases from the same cells.
 */
export const showHideTransitions = {
  hidden: {
    show: {action: 'start', to: 'showing', supersedes: false},
    hide: {action: 'settled', result: ''},
    dispose: {action: 'end'},
  },
  showing: {
    show: {action: 'join'},
    hide: {action: 'start', to: 'hiding', supersedes: true},
    dispose: {action: 'abort'},
  },
  shown: {
    show: {action: 'settled', result: true},
    hide: {action: 'start', to: 'hiding', supersedes: false},
    dispose: {action: 'end'},
  },
  hiding: {
    // Reverses: the state class flips back and the CSS transition runs back from where it is
    show: {action: 'start', to: 'showing', supersedes: true},
    hide: {action: 'join'},
    dispose: {action: 'abort'},
  },
} as const satisfies Record<ShowHideState, Record<ShowHideRequest, ShowHideTransition>>

export interface ShowHideSnapshot {
  readonly state: ShowHideState
  /**
   * Sub-phase of `showing` / `hiding`: `delay` while the operation waits for its configured delay
   * (nothing changed on screen yet), `transition` once the state class flipped. `null` at rest
   */
  readonly phase: 'delay' | 'transition' | null
  /**
   * The state class is applied. Follows the state (`showing` / `shown`) except during a `delay`
   * phase, where it keeps the value it had when the operation started
   */
  readonly visible: boolean
  /** Something is on screen: from the moment a show flips `visible` until `hidden` */
  readonly active: boolean
  /** The operation in progress skips its delay and transition */
  readonly instant: boolean
}

export interface ShowHideEventInit {
  cancelable?: boolean
  trigger?: string
  signal?: AbortSignal
}

export interface ShowHideMachineHost {
  /** Starts in `showing` (instant), already rendered as shown. `mount()` then announces it */
  initiallyShown: boolean
  /**
   * Emits a `BvTriggerableEvent` and returns whether a listener prevented it. Listeners run
   * synchronously and may call back into the machine
   */
  emit: (name: string, init: ShowHideEventInit) => boolean
  /** Milliseconds to wait before the state class flips */
  getDelay: (visible: boolean) => number
  /**
   * Called right after `visible` flipped. Resolves `true` when the transition ended and `false`
   * when something else took it over
   */
  transition: (visible: boolean) => Promise<boolean>
  /** While `true`, show requests resolve `'show-prevented'` without events */
  isDisabled: () => boolean
  /** Called with every new snapshot, before any event that follows from it */
  onChange: (snapshot: ShowHideSnapshot) => void
  /** The state class flipped: write `modelValue`. A listener may call back into the machine */
  onCommit: (visible: boolean) => void
  /** A request was refused: write `modelValue` back if it asked for the change */
  onRefused: () => void
}

export interface ShowRequestOptions {
  /** The promise resolves with the trigger once hidden again, not with `true` after `shown` */
  resolveOnHide?: boolean
  /** Skip the delay and the transition (`visible` prop) */
  instant?: boolean
}

export interface HideRequestOptions {
  /** Do not emit the trigger's own event (`ok`, `close`, ...) before `hide` */
  noTriggerEmit?: boolean
  /** Skip the delay and the transition (`visible` prop) */
  instant?: boolean
  /**
   * `false` when the change already happened and cannot be refused (a native `<dialog>` that the
   * browser closed). The events are still emitted, with `cancelable: false`
   */
  cancelable?: boolean
}

interface Deferred {
  readonly promise: Promise<ShowHideResult>
  readonly resolve: (value: ShowHideResult) => void
}

const createDeferred = (): Deferred => {
  let resolve!: (value: ShowHideResult) => void
  const promise = new Promise<ShowHideResult>((res) => {
    resolve = res
  })
  return {promise, resolve}
}

interface Operation {
  readonly kind: 'show' | 'hide'
  readonly trigger: string | undefined
  readonly instant: boolean
  readonly deferred: Deferred
}

export interface ShowHideMachine {
  readonly snapshot: () => ShowHideSnapshot
  /** `showing` or `shown`: where the component is heading */
  readonly targetVisible: () => boolean
  readonly show: (options?: ShowRequestOptions) => Promise<ShowHideResult>
  readonly hide: (trigger?: string, options?: HideRequestOptions) => Promise<ShowHideResult>
  /**
   * Runs `request` unless a listener of an event emitted by `emitRequest` already made a request
   * that was carried out; then it returns that request's result. For request events owned by the
   * caller (`toggle`)
   */
  readonly guarded: (
    emitRequest: () => boolean,
    refused: () => Promise<ShowHideResult>,
    request: () => Promise<ShowHideResult>
  ) => Promise<ShowHideResult>
  /** Announces an initially shown component (`show`, then `shown`). Call once the element exists */
  readonly mount: () => void
  /** The component unmounts: settles everything silently. Later requests resolve `false` */
  readonly dispose: () => void
}

export const createShowHideMachine = (host: ShowHideMachineHost): ShowHideMachine => {
  let snapshot: ShowHideSnapshot = host.initiallyShown
    ? {state: 'showing', phase: 'transition', visible: true, active: true, instant: true}
    : {state: 'hidden', phase: null, visible: false, active: false, instant: false}

  /** The operation in progress. Set exactly while the state is `showing` or `hiding` */
  let operation: Operation | undefined
  /** The show of an initially shown component, until `mount()` announced it */
  let unannounced: Operation | undefined
  if (host.initiallyShown) {
    operation = unannounced = {
      kind: 'show',
      trigger: undefined,
      instant: true,
      deferred: createDeferred(),
    }
  }
  /** `show(true)` callers: resolved with the trigger at the next `hidden` */
  let cycle: Deferred | undefined
  /** Counts carried out requests, so a request can tell that one of its listeners made another */
  let revision = 0
  let delayTimer: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  /**
   * Backs `event.signal` on request events. Requests share it until the machine commits to a
   * show or hide, or is disposed, which aborts it. A refused request leaves it running, so async
   * work started for it stops only once the component actually changes state
   */
  let requestScope: AbortController | undefined
  const requestSignal = (): AbortSignal => (requestScope ??= new AbortController()).signal
  const endRequests = () => {
    requestScope?.abort()
    requestScope = undefined
  }

  const set = (next: ShowHideSnapshot) => {
    snapshot = next
    host.onChange(next)
  }

  const transition = (request: ShowHideRequest): ShowHideTransition =>
    showHideTransitions[snapshot.state][request]

  const targetVisible = () => snapshot.state === 'showing' || snapshot.state === 'shown'

  const cyclePromise = () => (cycle ??= createDeferred()).promise

  const settleCycle = (result: ShowHideResult) => {
    const current = cycle
    cycle = undefined
    current?.resolve(result)
  }

  /** The outcome of a request a listener made: its operation's promise, or where it ended */
  const listenerResult = (): Promise<ShowHideResult> =>
    operation ? operation.deferred.promise : Promise.resolve(snapshot.state === 'shown' ? true : '')

  const finish = (op: Operation) => {
    operation = undefined
    if (op.kind === 'show') {
      set({state: 'shown', phase: null, visible: true, active: true, instant: false})
      op.deferred.resolve(true)
      host.emit('shown', {})
    } else {
      set({state: 'hidden', phase: null, visible: false, active: false, instant: false})
      const result = op.trigger ?? ''
      op.deferred.resolve(result)
      settleCycle(result)
      host.emit('hidden', {trigger: op.trigger})
    }
  }

  /** Flips the state class, writes the model and waits for the transition */
  const apply = async (op: Operation) => {
    delayTimer = undefined
    if (op !== operation) return
    const visible = op.kind === 'show'
    set({
      state: visible ? 'showing' : 'hiding',
      phase: 'transition',
      visible,
      active: visible || snapshot.active,
      instant: op.instant,
    })
    host.onCommit(visible)
    // An `update:modelValue` listener may have made a newer request. Starting this transition
    // now would take over the newer one's
    if (op !== operation) return
    const finished = await host.transition(visible)
    if (op !== operation || !finished) return
    finish(op)
  }

  /** Carries a request out: from here on it cannot be refused */
  const commit = (
    kind: 'show' | 'hide',
    trigger: string | undefined,
    instant: boolean
  ): Promise<ShowHideResult> => {
    endRequests()
    revision++
    clearTimeout(delayTimer)
    delayTimer = undefined
    // A superseded operation never emits its `shown` / `hidden`
    operation?.deferred.resolve(false)
    const op: Operation = {kind, trigger, instant, deferred: createDeferred()}
    operation = op
    unannounced = undefined

    const delay = instant ? 0 : host.getDelay(kind === 'show')
    if (delay > 0) {
      set({...snapshot, state: kind === 'show' ? 'showing' : 'hiding', phase: 'delay', instant})
      delayTimer = setTimeout(() => {
        void apply(op)
      }, delay)
    } else {
      void apply(op)
    }
    return op.deferred.promise
  }

  const show = ({resolveOnHide = false, instant = false}: ShowRequestOptions = {}): Promise<
    boolean | string
  > => {
    if (disposed) return Promise.resolve(false)
    const cell = transition('show')
    if (cell.action === 'settled') {
      return resolveOnHide ? cyclePromise() : Promise.resolve(cell.result)
    }
    if (cell.action === 'join') {
      return resolveOnHide ? cyclePromise() : (operation as Operation).deferred.promise
    }
    if (cell.action !== 'start') return Promise.resolve(false)

    if (host.isDisabled()) {
      host.onRefused()
      return Promise.resolve('show-prevented')
    }
    const signal = requestSignal()
    const before = revision
    const prevented = host.emit('show', {cancelable: true, signal})
    // A `show` listener made a request itself (for example `@show="hide()"`): that one wins
    if (revision !== before || disposed) return listenerResult()
    if (prevented) {
      host.emit('show-prevented', {signal})
      host.onRefused()
      return Promise.resolve('show-prevented')
    }
    const promise = commit('show', undefined, instant)
    return resolveOnHide ? cyclePromise() : promise
  }

  const hide = (
    trigger?: string,
    {noTriggerEmit = false, instant = false, cancelable = true}: HideRequestOptions = {}
  ): Promise<ShowHideResult> => {
    if (disposed) return Promise.resolve(false)
    const cell = transition('hide')
    if (cell.action === 'settled') return Promise.resolve(cell.result)
    // The hide in progress keeps its trigger
    if (cell.action === 'join') return (operation as Operation).deferred.promise
    if (cell.action !== 'start') return Promise.resolve(false)

    const signal = requestSignal()
    // A listener may make a request itself (for example `@close="hide()"`). That request is the
    // one that counts: emitting `hide` again or starting another hide would supersede it
    const before = revision
    let prevented = false
    if (trigger && !noTriggerEmit) {
      prevented = host.emit(trigger, {cancelable, trigger, signal})
      if (revision !== before || disposed) return listenerResult()
    }
    prevented = host.emit('hide', {cancelable, trigger, signal}) || prevented
    if (revision !== before || disposed) return listenerResult()
    if (prevented && cancelable) {
      host.emit('hide-prevented', {trigger, signal})
      host.onRefused()
      return Promise.resolve('hide-prevented')
    }
    return commit('hide', trigger, instant)
  }

  const guarded: ShowHideMachine['guarded'] = (emitRequest, refused, request) => {
    if (disposed) return Promise.resolve(false)
    const before = revision
    const prevented = emitRequest()
    if (revision !== before || disposed) return listenerResult()
    return prevented ? refused() : request()
  }

  /** Ends the unannounced initial show as if it had been refused */
  const refuseInitialShow = (op: Operation) => {
    operation = unannounced = undefined
    set({state: 'hidden', phase: null, visible: false, active: false, instant: false})
    op.deferred.resolve('show-prevented')
    settleCycle('show-prevented')
    host.onCommit(false)
  }

  const mount = () => {
    const op = unannounced
    unannounced = undefined
    // Hidden again before it was mounted: that request already replaced the initial show
    if (!op || op !== operation || disposed) return
    if (host.isDisabled()) {
      refuseInitialShow(op)
      return
    }
    // Already rendered as shown: announce it, then let the instant "transition" settle
    const signal = requestSignal()
    const before = revision
    const prevented = host.emit('show', {cancelable: true, signal})
    if (revision !== before || disposed) return
    if (prevented) {
      host.emit('show-prevented', {signal})
      if (op === operation) refuseInitialShow(op)
      return
    }
    endRequests()
    revision++
    void apply(op)
  }

  const dispose = () => {
    if (disposed) return
    const cell = transition('dispose')
    disposed = true
    endRequests()
    revision++
    clearTimeout(delayTimer)
    delayTimer = undefined
    if (cell.action === 'abort') operation?.deferred.resolve(false)
    operation = unannounced = undefined
    settleCycle('dispose')
  }

  return {snapshot: () => snapshot, targetVisible, show, hide, guarded, mount, dispose}
}
