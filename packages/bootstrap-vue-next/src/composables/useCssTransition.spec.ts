import {afterEach, describe, expect, it, vi} from 'vitest'
import {effectScope, nextTick, ref} from 'vue'
import {useCssTransition} from './useCssTransition'

interface FakeAnimation {
  animation: Animation
  resolve: () => void
  reject: (reason?: unknown) => void
}

const createAnimation = (endTime = 300): FakeAnimation => {
  let resolve!: () => void
  let reject!: (reason?: unknown) => void
  const finished = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  // Avoid unhandled rejection noise for animations that get cancelled
  finished.catch(() => {})
  const animation = {
    finished,
    effect: {getComputedTiming: () => ({endTime})},
  } as unknown as Animation
  return {animation, resolve, reject}
}

const createElement = (animations: () => Animation[] = () => []) => {
  const el = document.createElement('div')
  ;(el as unknown as {getAnimations: () => Animation[]}).getAnimations =
    vi.fn<() => Animation[]>(animations)
  return el
}

/** Let microtasks and a couple of animation frames run */
const flush = async (frames = 3) => {
  for (let i = 0; i < frames; i++) {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  }
}

const isSettled = async (promise: Promise<unknown>) => {
  let settled = false
  promise.then(
    () => (settled = true),
    () => (settled = true)
  )
  await flush()
  return settled
}

describe('useCssTransition', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves true on the next frame when the element has no animations', async () => {
    const el = createElement()
    const {run} = useCssTransition(el)
    await expect(run()).resolves.toBe(true)
    expect(el.getAnimations).toHaveBeenCalledTimes(1)
  })

  it('waits for a frame before reading animations', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame')
    const el = createElement()
    const {run} = useCssTransition(el)
    const promise = run()
    expect(el.getAnimations).not.toHaveBeenCalled()
    await promise
    expect(rafSpy).toHaveBeenCalled()
    expect(el.getAnimations).toHaveBeenCalledTimes(1)
  })

  it('calls apply synchronously before waiting', () => {
    const el = createElement()
    const {run} = useCssTransition(el)
    const apply = vi.fn<() => void>(() => el.classList.add('show'))
    run(apply)
    expect(apply).toHaveBeenCalledTimes(1)
    expect(el.classList.contains('show')).toBe(true)
  })

  it('reads animations after Vue has patched reactive class changes', async () => {
    const show = ref(false)
    const el = createElement(() => {
      // the class must already be in place when animations are read
      expect(el.classList.contains('show')).toBe(true)
      return []
    })
    const {run} = useCssTransition(el)
    // simulate Vue's scheduler patching the DOM on nextTick
    const promise = run(() => {
      show.value = true
      nextTick(() => el.classList.toggle('show', show.value))
    })
    await expect(promise).resolves.toBe(true)
  })

  it('resolves only after every animation of the element has finished', async () => {
    const a = createAnimation()
    const b = createAnimation()
    const el = createElement(() => [a.animation, b.animation])
    const {run} = useCssTransition(el)
    const promise = run()

    expect(await isSettled(promise)).toBe(false)
    a.resolve()
    expect(await isSettled(promise)).toBe(false)
    b.resolve()
    await expect(promise).resolves.toBe(true)
  })

  it('treats a cancelled (rejected) animation as settled', async () => {
    const a = createAnimation()
    const el = createElement(() => [a.animation])
    const {run} = useCssTransition(el)
    const promise = run()
    await flush()
    a.reject(new DOMException('cancelled', 'AbortError'))
    await expect(promise).resolves.toBe(true)
  })

  it('ignores infinite animations', async () => {
    const infinite = createAnimation(Infinity)
    const el = createElement(() => [infinite.animation])
    const {run} = useCssTransition(el)
    await expect(run()).resolves.toBe(true)
  })

  it('a newer run invalidates an older pending run', async () => {
    const first = createAnimation()
    const second = createAnimation()
    const queue = [first.animation, second.animation]
    const el = createElement(() => [queue.shift() as Animation])
    const {run} = useCssTransition(el)

    const p1 = run()
    await flush()
    const p2 = run()
    // the old transition gets cancelled by the browser when the class flips back
    first.reject(new DOMException('cancelled', 'AbortError'))
    await expect(p1).resolves.toBe(false)

    expect(await isSettled(p2)).toBe(false)
    second.resolve()
    await expect(p2).resolves.toBe(true)
  })

  it('a newer run invalidates an older run that is still waiting for its frame', async () => {
    const el = createElement()
    const {run} = useCssTransition(el)
    const p1 = run()
    const p2 = run()
    await expect(p1).resolves.toBe(false)
    await expect(p2).resolves.toBe(true)
  })

  it('an older run whose animation finishes after a newer call still resolves false', async () => {
    const first = createAnimation()
    const el = createElement(() => [first.animation])
    const {run} = useCssTransition(el)
    const p1 = run()
    await flush()
    const p2 = run()
    first.resolve()
    await expect(p1).resolves.toBe(false)
    await expect(p2).resolves.toBe(true)
  })

  it('cancel invalidates a pending run', async () => {
    const a = createAnimation()
    const el = createElement(() => [a.animation])
    const {run, cancel, isTransitioning} = useCssTransition(el)
    const promise = run()
    expect(isTransitioning.value).toBe(true)
    await flush()
    cancel()
    expect(isTransitioning.value).toBe(false)
    a.resolve()
    await expect(promise).resolves.toBe(false)
  })

  it('isTransitioning reflects the pending state', async () => {
    const el = createElement()
    const {run, isTransitioning} = useCssTransition(el)
    expect(isTransitioning.value).toBe(false)
    const promise = run()
    expect(isTransitioning.value).toBe(true)
    await promise
    expect(isTransitioning.value).toBe(false)
  })

  it('isTransitioning stays true while a newer run is pending', async () => {
    const second = createAnimation()
    let calls = 0
    const el = createElement(() => (calls++ === 0 ? [] : [second.animation]))
    const {run, isTransitioning} = useCssTransition(el)
    const p1 = run()
    const p2 = run()
    await p1
    expect(isTransitioning.value).toBe(true)
    second.resolve()
    await p2
    expect(isTransitioning.value).toBe(false)
  })

  it('accepts a ref and reads it after the frame', async () => {
    const a = createAnimation()
    const elRef = ref<HTMLElement | null>(null)
    const {run} = useCssTransition(elRef)
    const promise = run()
    elRef.value = createElement(() => [a.animation])
    expect(await isSettled(promise)).toBe(false)
    a.resolve()
    await expect(promise).resolves.toBe(true)
  })

  it('accepts a getter', async () => {
    const el = createElement()
    const {run} = useCssTransition(() => el)
    await expect(run()).resolves.toBe(true)
    expect(el.getAnimations).toHaveBeenCalled()
  })

  it('resolves true when the element is missing', async () => {
    const {run} = useCssTransition(null)
    await expect(run()).resolves.toBe(true)
  })

  it('resolves true when the element does not support getAnimations', async () => {
    const el = document.createElement('div')
    ;(el as unknown as {getAnimations?: unknown}).getAnimations = undefined
    const {run} = useCssTransition(el)
    await expect(run()).resolves.toBe(true)
  })

  it('falls back to a timeout when requestAnimationFrame is unavailable', async () => {
    const original = window.requestAnimationFrame
    ;(window as unknown as {requestAnimationFrame?: unknown}).requestAnimationFrame = undefined
    try {
      const el = createElement()
      const {run} = useCssTransition(el)
      await expect(run()).resolves.toBe(true)
    } finally {
      window.requestAnimationFrame = original
    }
  })

  it('does not stall when requestAnimationFrame never fires (background tab)', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0)
    const el = createElement()
    const {run} = useCssTransition(el)
    await expect(run()).resolves.toBe(true)
    expect(el.getAnimations).toHaveBeenCalledTimes(1)
  })

  it('does not stall when an animation never finishes (page not rendering)', async () => {
    vi.useFakeTimers()
    try {
      // Pending at time 0 with 150 ms left, as a transition is while the page does not render
      const stuck = createAnimation(150)
      const el = createElement(() => [stuck.animation])
      const {run} = useCssTransition(el)
      let result: boolean | undefined
      void run().then((v) => (result = v))

      await vi.advanceTimersByTimeAsync(200)
      expect(result).toBeUndefined()
      await vi.advanceTimersByTimeAsync(200)
      expect(result).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not wait for the fallback when the animations finish', async () => {
    const a = createAnimation(60_000)
    const el = createElement(() => [a.animation])
    const {run} = useCssTransition(el)
    const promise = run()
    expect(await isSettled(promise)).toBe(false)
    a.resolve()
    await expect(promise).resolves.toBe(true)
  })

  it('cancels pending runs when the owning effect scope is disposed', async () => {
    const a = createAnimation()
    const el = createElement(() => [a.animation])
    const scope = effectScope()
    const api = scope.run(() => useCssTransition(el))!
    const promise = api.run()
    await flush()
    scope.stop()
    a.resolve()
    await expect(promise).resolves.toBe(false)
  })

  it('can be called outside of a component or effect scope', () => {
    expect(() => useCssTransition(null)).not.toThrow()
  })
})
