/**
 * Characterization of how a created orchestrator item stays in sync with the object passed to
 * `create()`. Each scenario runs the same sequence of changes made from the outside (the caller's
 * object) and from the inside (controller, composable methods, the component itself) and records
 * the store, the caller's object and the DOM after every step.
 *
 * The snapshot was recorded with `resolvedProps = ref(obj)`. Any change to how the composables
 * normalize their input (for example `shallowRef(obj)`) must keep it identical.
 */
import {appendFileSync} from 'node:fs'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {defineComponent, h, isProxy, isRef, nextTick, reactive, ref, type Ref, toRaw} from 'vue'
import {enableAutoUnmount, mount} from '@vue/test-utils'
import BApp from '../../components/BApp/BApp.vue'
import {useModal} from '../useModal'
import {useToast} from '../useToast'
import {usePopover} from '../usePopover'

enableAutoUnmount(afterEach)

type Kind = 'plain' | 'ref' | 'reactive'
type Patch = {title?: string; modelValue?: boolean}
type Controller = {
  show: () => Promise<unknown>
  hide: (trigger?: string) => void
  toggle: () => void
  set: (v: Patch) => void
  get: () => {value: {component: unknown; props: Record<string, unknown>}} | undefined
}
type ComposableName = 'modal' | 'toast' | 'popover'

const flush = async () => {
  for (let i = 0; i < 6; i++) {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

const base: Record<ComposableName, Record<string, unknown>> = {
  modal: {id: 'subject', noFade: true},
  toast: {id: 'subject', noFade: true},
  popover: {id: 'subject', noFade: true, delay: 0, target: 'popover-target', body: 'body'},
}

/** Where the item renders, and how it is closed from inside the component */
const dom: Record<ComposableName, {selector: string; closeFromComponent: (c: Controller) => void}> =
  {
    modal: {
      selector: '.modal#subject',
      closeFromComponent: () => {
        document.querySelector<HTMLElement>('.modal#subject .btn-close')?.click()
      },
    },
    toast: {
      selector: '.toast#subject',
      closeFromComponent: () => {
        document.querySelector<HTMLElement>('.toast#subject .btn-close')?.click()
      },
    },
    popover: {
      selector: '.popover#subject',
      // A popover has no close button: call the component's own exposed hide
      closeFromComponent: (c) => {
        ;(c as unknown as {ref: {hide: (t: string) => void} | null}).ref?.hide('component')
      },
    },
  }

const makeInput = (kind: Kind, composable: ComposableName, extra: Record<string, unknown> = {}) => {
  const initial = {...base[composable], title: 'T0', modelValue: false, ...extra}
  const source = kind === 'ref' ? ref(initial) : kind === 'reactive' ? reactive(initial) : initial
  /** The caller's current view of their own object */
  const read = (): Patch => {
    const v = isRef(source) ? (source as Ref<Patch>).value : (source as Patch)
    const raw = toRaw(v)
    return {title: raw.title, modelValue: raw.modelValue}
  }
  /** Change a field in place, the way a caller holding the object would */
  const mutate = (patch: Patch) => {
    Object.assign(isRef(source) ? (source as Ref<Patch>).value : (source as Patch), patch)
  }
  /** Replace the whole value. Only a ref can do this; others fall back to mutate */
  const replace = (patch: Patch) => {
    if (isRef(source)) {
      const r = source as Ref<Patch>
      r.value = {...r.value, ...patch}
    } else mutate(patch)
  }
  return {source, read, mutate, replace}
}

const setup = async (
  composable: ComposableName,
  kind: Kind,
  extra: Record<string, unknown> = {}
) => {
  const input = makeInput(kind, composable, extra)
  let controller!: Controller
  let modalApi!: ReturnType<typeof useModal>
  const TestComponent = defineComponent({
    setup() {
      if (composable === 'modal') {
        modalApi = useModal()
        controller = modalApi.create(input.source as never) as unknown as Controller
      } else if (composable === 'toast') {
        controller = useToast().create(input.source as never) as unknown as Controller
      } else {
        controller = usePopover().popover(input.source as never) as unknown as Controller
      }
      return () => h('button', {id: 'popover-target'}, 'target')
    },
  })
  mount(BApp, {attachTo: document.body, slots: {default: () => h(TestComponent)}})
  await flush()

  const observe = () => {
    const props = controller.get()?.value.props ?? {}
    const el = document.querySelector<HTMLElement>(dom[composable].selector)
    const instance = (controller as unknown as {ref: {$props: Record<string, unknown>} | null}).ref
    return {
      store: {title: props.title, modelValue: props.modelValue},
      caller: input.read(),
      component: {title: instance?.$props.title, modelValue: instance?.$props.modelValue},
      // happy-dom has no layout, so a popover never becomes visible: only its props are recorded
      dom:
        composable === 'popover'
          ? null
          : {
              shown: el !== null && el.style.display !== 'none',
              title: el?.textContent?.includes(String(props.title)) ?? false,
            },
    }
  }
  return {input, controller, observe, modalApi: () => modalApi}
}

const kinds: Kind[] = ['plain', 'ref', 'reactive']
const composables: ComposableName[] = ['modal', 'toast', 'popover']

describe('orchestrator input reactivity', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe.each(composables)('%s', (composable) => {
    it.each(kinds)('%s input: outside and inside changes', async (kind) => {
      const {input, controller, observe, modalApi} = await setup(composable, kind)
      const log: Record<string, unknown>[] = []
      const step = async (name: string, action: () => unknown) => {
        void action()
        await flush()
        log.push({step: name, ...observe()})
      }

      log.push({step: 'initial', ...observe()})
      await step('outside: mutate title', () => input.mutate({title: 'T1'}))
      await step('outside: replace title', () => input.replace({title: 'T2'}))
      await step('inside: controller.set title', () => controller.set({title: 'T3'}))
      await step('outside: mutate modelValue true', () => input.mutate({modelValue: true}))
      await step('inside: close from component', () =>
        dom[composable].closeFromComponent(controller)
      )
      await step('inside: controller.show()', () => {
        void controller.show()
      })
      await step('outside: mutate modelValue false', () => input.mutate({modelValue: false}))
      await step('outside: replace modelValue true', () => input.replace({modelValue: true}))
      await step('inside: controller.hide()', () => controller.hide('inside'))
      await step('inside: controller.toggle() (open)', () => controller.toggle())
      await step('inside: controller.toggle() (close)', () => controller.toggle())
      await step('inside: controller.set modelValue true', () => controller.set({modelValue: true}))
      await step('outside: replace modelValue false', () => input.replace({modelValue: false}))
      if (composable === 'modal') {
        await step('inside: useModal().show(id)', () => modalApi().show('subject'))
        await step('inside: useModal().hide(id)', () => modalApi().hide('inside', 'subject'))
      }

      expect(log).toMatchSnapshot()
    })
  })

  /**
   * Not part of the snapshot: this is what a different normalization is expected to change
   */
  describe('component proxying', () => {
    it.each(composables.flatMap((c) => kinds.map((k) => [c, k] as const)))(
      '%s / %s',
      async (composable, kind) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        // A slot component the caller did not markRaw, as users write it
        const SlotContent = defineComponent({setup: () => () => h('span', 'slot content')})
        const {controller} = await setup(composable, kind, {slots: {default: SlotContent}})
        void controller.show()
        await flush()
        const reactiveWarnings = warn.mock.calls.filter((c) =>
          String(c[0]).includes('made a reactive object')
        ).length
        warn.mockRestore()
        // Test output does not show console output, so set ORCHESTRATOR_PROXY_LOG to a file path to
        // collect these
        const out = process.env.ORCHESTRATOR_PROXY_LOG
        if (out)
          appendFileSync(
            out,
            `${composable}/${kind}: componentIsProxy=${isProxy(controller.get()?.value.component)} slotIsProxy=${isProxy((controller.get()?.value as unknown as {slots?: {default?: unknown}}).slots?.default)} warnings=${reactiveWarnings}\n`
          )
      }
    )
  })
})
