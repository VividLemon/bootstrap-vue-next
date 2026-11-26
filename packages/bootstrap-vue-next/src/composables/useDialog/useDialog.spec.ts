import {afterEach, describe, expect, it, vi} from 'vitest'
import {computed, defineComponent, h, nextTick, ref, watchEffect} from 'vue'
import {mount} from '@vue/test-utils'
import BApp from '../../components/BApp/BApp.vue'
import BOrchestrator from '../../components/BApp/BOrchestrator.vue'
import {orchestratorPlugin} from '../../plugins/orchestrator'
import {registryPlugin} from '../../plugins/registry'
import BDialog from '../../components/BDialog/BDialog.vue'
import {useDialog} from './index'
import {useOrchestratorRegistry} from '../orchestratorShared'
import {useToast} from '../useToast'

describe('useDialog', () => {
  it('create method accepts custom component props without TypeScript errors', async () => {
    // Define a custom modal component with custom props
    const CustomModal = defineComponent({
      name: 'CustomModal',
      props: {
        customProp: {
          type: String,
          required: true,
        },
        anotherProp: {
          type: Number,
          default: 42,
        },
      },
      setup(props) {
        return () =>
          h('div', {class: 'custom-modal'}, [
            h('p', `Custom Prop: ${props.customProp}`),
            h('p', `Another Prop: ${props.anotherProp}`),
          ])
      },
    })

    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()

        // This should not cause TypeScript errors
        const modal = create(
          {
            customProp: 'test value',
            anotherProp: 100,
          },
          {component: CustomModal}
        )

        return () =>
          h('div', [
            h(
              'button',
              {
                onClick: () => modal.show(),
              },
              'Show Modal'
            ),
          ])
      },
    })

    const wrapper = mount(BApp, {
      slots: {
        default: () => h(TestComponent),
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('create method accepts BDialog props', async () => {
    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()

        // Standard BModal props should still work
        const modal = create({
          title: 'Test Modal',
          body: 'Test body content',
          size: 'lg',
        })

        return () =>
          h('div', [
            h(
              'button',
              {
                onClick: () => modal.show(),
              },
              'Show Modal'
            ),
          ])
      },
    })

    const wrapper = mount(BApp, {
      slots: {
        default: () => h(TestComponent),
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('create method accepts both BModal props and custom props together', async () => {
    const CustomModal = defineComponent({
      name: 'CustomModalWithDefaults',
      props: {
        myCustomField: {
          type: String,
          default: 'default',
        },
      },
      setup(props) {
        return () => h('div', {class: 'custom'}, props.myCustomField)
      },
    })

    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()

        // Mix of standard and custom props
        const modal = create(
          {
            title: 'Standard Title',
            myCustomField: 'custom value',
            size: undefined,
          },
          {component: CustomModal}
        )

        return () =>
          h('div', [
            h(
              'button',
              {
                onClick: () => modal.show(),
              },
              'Show Modal'
            ),
          ])
      },
    })

    const wrapper = mount(BApp, {
      slots: {
        default: () => h(TestComponent),
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('create accepts a plain object and reads back the initial props', async () => {
    let modalRef: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()
        modalRef = create({title: 'Plain Object Title'})
        return () => h('div')
      },
    })

    mount(BApp, {slots: {default: () => h(TestComponent)}})
    await nextTick()

    expect(modalRef?.get()?.value.props.title).toBe('Plain Object Title')
  })

  it('create accepts a ref and stays reactive both ways (external ref -> internal state)', async () => {
    let modalRef: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    const myModal = ref({title: 'Initial Title', modelValue: false})
    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()
        modalRef = create(myModal)
        return () => h('div')
      },
    })

    mount(BApp, {slots: {default: () => h(TestComponent)}})
    await nextTick()

    expect(modalRef?.get()?.value.props.title).toBe('Initial Title')

    // Mutating the external ref should be reflected in the orchestrator's internal state
    myModal.value = {...myModal.value, title: 'Updated From External Ref'}
    await nextTick()

    expect(modalRef?.get()?.value.props.title).toBe('Updated From External Ref')
  })

  it('create accepts a ref and stays reactive both ways (controller.set -> external ref)', async () => {
    let modalRef: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    const myModal = ref({title: 'Initial Title', modelValue: false})
    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()
        modalRef = create(myModal)
        return () => h('div')
      },
    })

    mount(BApp, {slots: {default: () => h(TestComponent)}})
    await nextTick()

    modalRef?.set({title: 'Updated Via Controller'})
    await nextTick()

    // Because `create()` uses the identical ref instance passed in, controller.set()
    // mutations are visible on the caller's own ref too
    expect(myModal.value.title).toBe('Updated Via Controller')
  })

  it('supports the computed + watchEffect + ref pattern for derived reactive values', async () => {
    let modalRef: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    const title = ref('Hello')
    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()
        const derivedTitle = computed(() => title.value)
        const myModal = ref({title: derivedTitle.value, modelValue: false})
        watchEffect(() => {
          myModal.value.title = derivedTitle.value
        })
        modalRef = create(myModal)
        return () => h('div')
      },
    })

    mount(BApp, {slots: {default: () => h(TestComponent)}})
    await nextTick()

    expect(modalRef?.get()?.value.props.title).toBe('Hello')

    title.value = 'World'
    await nextTick()

    expect(modalRef?.get()?.value.props.title).toBe('World')
  })

  it('keeps instances in the store after hide and removes them only on destroy', async () => {
    let modalRef: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    let modalStore: ReturnType<typeof useOrchestratorRegistry>['store'] | undefined
    const modalId = 'lifecycle-modal'
    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()
        modalStore = useOrchestratorRegistry().store
        modalRef = create({id: modalId, title: 'Lifecycle Modal'})
        return () => h('div')
      },
    })

    mount(BApp, {slots: {default: () => h(TestComponent)}})
    await nextTick()

    expect(modalStore?.value.dialog.has(modalId)).toBe(true)

    modalRef?.hide()
    await nextTick()
    expect(modalStore?.value.dialog.has(modalId)).toBe(true)

    await modalRef?.destroy()
    expect(modalStore?.value.dialog.has(modalId)).toBe(false)
  })

  it('keeps the stored modelValue in step when the modal hides itself, so show() opens it again', async () => {
    let modal: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    const TestComponent = defineComponent({
      setup() {
        modal = useDialog().create({id: 'sync-modal', title: 'Sync'})
        return () => h('div')
      },
    })
    mount(BApp, {attachTo: document.body, slots: {default: () => h(TestComponent)}})
    await nextTick()
    const stored = () => modal?.get()?.value.props.modelValue

    modal?.show()
    await vi.waitFor(() => expect(stored()).toBe(true))

    // hidden through the component itself, not the controller
    const component = modal?.ref as unknown as {hide: (trigger?: string) => void} | null
    expect(component).not.toBeNull()
    component?.hide('close')
    await vi.waitFor(() => expect(stored()).toBe(false))

    modal?.show()
    await vi.waitFor(() => expect(stored()).toBe(true))
  })

  it('controller.hide() skips the trigger event and leaves the dialog returnValue unset', async () => {
    let modal: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    const onOk = vi.fn<() => void>()
    const TestComponent = defineComponent({
      setup() {
        modal = useDialog().create({id: 'controller-hide-modal', title: 'Hide', onOk})
        return () => h('div')
      },
    })
    mount(BApp, {attachTo: document.body, slots: {default: () => h(TestComponent)}})
    await nextTick()
    const stored = () => modal?.get()?.value.props.modelValue

    modal?.show()
    await vi.waitFor(() => expect(stored()).toBe(true))
    modal?.hide('ok')
    await vi.waitFor(() => expect(stored()).toBe(false))

    // BDialog's hide takes (trigger, value, noTriggerEmit): no `ok` event, no `true` return value
    expect(onOk).not.toHaveBeenCalled()
    const component = modal?.ref as unknown as {returnValue: unknown} | null
    expect(component?.returnValue).toBeUndefined()
  })

  it('destroy closes an open modal and settles its show()', async () => {
    let modal: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    const TestComponent = defineComponent({
      setup() {
        modal = useDialog().create({id: 'destroy-open-modal', title: 'Destroy'})
        return () => h('div')
      },
    })
    mount(BApp, {
      attachTo: document.body,
      // real transitions, so the modal emits hidden
      global: {stubs: {'transition': false, 'transition-group': false}},
      slots: {default: () => h(TestComponent)},
    })
    await nextTick()

    const shown = modal?.show()
    await vi.waitFor(() => expect(modal?.get()?.value.props.modelValue).toBe(true))
    await modal?.destroy()

    expect(modal?.get()).toBeUndefined()
    expect((await shown)?.trigger).toBe('destroy')
  })

  const mountApp = (setup: () => void, realTransitions = false) => {
    const TestComponent = defineComponent({
      setup() {
        setup()
        return () => h('div')
      },
    })
    return mount(BApp, {
      attachTo: document.body,
      global: realTransitions ? {stubs: {'transition': false, 'transition-group': false}} : {},
      slots: {default: () => h(TestComponent)},
    })
  }

  it('settles show() and destroy() when onShow prevents a modal that was not mounted yet', async () => {
    let modal: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    let shown: Promise<unknown> | undefined
    mountApp(() => {
      modal = useDialog().create({
        id: 'prevented-before-mount',
        onShow: (e: {preventDefault: () => void}) => e.preventDefault(),
      })
      shown = modal.show() // before the orchestrator mounts it
    })

    const result = await shown
    expect(result).toMatchObject({trigger: 'show-prevented', ok: null})
    expect(result).not.toHaveProperty('value')
    await modal?.destroy()
    expect(modal?.get()).toBeUndefined()
  })

  it('destroy() finishes right after a resolveOnHide show() resolved', async () => {
    let modal: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    mountApp(() => {
      modal = useDialog().create({id: 'resolve-on-hide-destroy'}, {resolveOnHide: true})
    }, true)
    await nextTick()

    const shown = modal?.show()
    await vi.waitFor(() => expect(modal?.get()?.value.props.modelValue).toBe(true))
    modal?.hide('ok')
    expect((await shown)?.trigger).toBe('ok')

    await modal?.destroy()
    expect(modal?.get()).toBeUndefined()
  })

  it('syncs the stored modelValue of the emitting item when a modal and a toast share an id', async () => {
    let modal: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    let toast: ReturnType<ReturnType<typeof useToast>['create']> | undefined
    mountApp(() => {
      modal = useDialog().create({id: 'shared-id'})
      toast = useToast().create({id: 'shared-id', modelValue: false})
    })
    await nextTick()

    toast?.show()
    await vi.waitFor(() => expect(toast?.get()?.value.props.modelValue).toBe(true))
    expect(modal?.get()?.value.props.modelValue).toBeFalsy()
  })

  it('hides a modal whose mount-time onShow aborts the show signal', async () => {
    let modal: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    let shown: Promise<{trigger: string | null}> | undefined
    const scope = new AbortController()
    mountApp(() => {
      modal = useDialog().create({id: 'abort-in-mount-show', onShow: () => scope.abort()})
      shown = modal.show({signal: scope.signal}) // before the orchestrator mounts it
    })

    expect((await shown)?.trigger).toBe('abort')
    await vi.waitFor(() => expect(modal?.get()?.value.props.modelValue).toBeFalsy())
  })

  it('shows again when show() is called right after a resolveOnHide show resolved', async () => {
    let modalRef: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    const hidden: unknown[] = []
    const TestComponent = defineComponent({
      setup() {
        const {create} = useDialog()
        modalRef = create(
          {
            title: 'Again',
            noTransition: true,
            onHidden: (e: unknown) => {
              hidden.push(e)
            },
          },
          {resolveOnHide: true}
        )
        return () => h('div')
      },
    })

    mount(BApp, {slots: {default: () => h(TestComponent)}})
    await nextTick()

    const first = modalRef?.show()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(modalRef?.get()?.value.props.modelValue).toBe(true)

    modalRef?.hide('ok')
    expect((await first)?.trigger).toBe('ok')

    let secondSettled = false
    void modalRef?.show().then(() => {
      secondSettled = true
    })
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(modalRef?.get()?.value.props.modelValue).toBe(true)
    expect(hidden).toHaveLength(0)
    expect(secondSettled).toBe(false)

    modalRef?.hide('cancel')
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(secondSettled).toBe(true)
    expect(modalRef?.get()?.value.props.modelValue).toBe(false)
  })

  describe('result', () => {
    const flush = () => new Promise((resolve) => setTimeout(resolve, 20))

    it('resolves with a plain {trigger, ok, value} object', async () => {
      let dialog: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
      mountApp(() => {
        dialog = useDialog().create({id: 'result-ok', title: 'Result', noTransition: true})
      })
      await nextTick()

      const shown = dialog?.show()
      await vi.waitFor(() => expect(dialog?.get()?.value.props.modelValue).toBe(true))
      const exposed = dialog?.ref as unknown as {hide: (trigger: string, value: unknown) => void}
      exposed.hide('ok', {saved: 1})

      const result = await shown
      expect(result).toMatchObject({trigger: 'ok', ok: true, value: {saved: 1}})
      expect(result).not.toHaveProperty('eventType')
      expect(typeof result?.[Symbol.asyncDispose]).toBe('function')
    })

    it('resolves ok: false for the default Cancel button and ok: null for other triggers', async () => {
      let dialog: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
      const wrapper = mountApp(() => {
        dialog = useDialog().create({id: 'result-cancel', title: 'Result', noTransition: true})
      })
      await nextTick()

      const first = dialog?.show()
      await flush()
      const cancel = wrapper.findAll('#result-cancel .dialog-footer button').at(0)
      expect(cancel?.text()).toBe('Cancel')
      await cancel?.trigger('click')
      expect(await first).toMatchObject({trigger: 'cancel', ok: false})

      const second = dialog?.show()
      await flush()
      dialog?.hide('custom')
      const result = await second
      expect(result).toMatchObject({trigger: 'custom', ok: null})
      expect(result).not.toHaveProperty('value')
    })

    it('leaves the default footer out for {slots: {footer: undefined}}', async () => {
      const wrapper = mountApp(() => {
        void useDialog()
          .create(
            {id: 'no-footer', title: 'None', noTransition: true},
            {slots: {footer: undefined}}
          )
          .show()
        void useDialog().create({id: 'with-footer', title: 'Default', noTransition: true}).show()
      })
      await flush()
      expect(wrapper.find('#no-footer .dialog-footer').exists()).toBe(false)
      expect(wrapper.find('#with-footer .dialog-footer').exists()).toBe(true)
    })
  })

  describe('helpers', () => {
    const flush = () => new Promise((resolve) => setTimeout(resolve, 20))

    const mountDeclared = (onReady: (api: ReturnType<typeof useDialog>) => void) => {
      const a = ref(false)
      const b = ref(false)
      const model = (state: typeof a) => ({
        'modelValue': state.value,
        'onUpdate:modelValue': (v: boolean) => {
          state.value = v
        },
      })
      const Root = defineComponent({
        setup() {
          onReady(useDialog())
          return () => [
            h(BDialog, {id: 'a', noTransition: true, ...model(a)}, () => 'A'),
            h(BDialog, {id: 'b', noTransition: true, ...model(b)}, () => 'B'),
          ]
        },
      })
      const wrapper = mount(BApp, {attachTo: document.body, slots: {default: () => h(Root)}})
      return {wrapper, a, b}
    }

    it('show(id), hide(trigger, id) and get(id) reach a declared dialog', async () => {
      let api: ReturnType<typeof useDialog> | undefined
      const {a} = mountDeclared((value) => {
        api = value
      })
      await flush()

      api?.show('a')
      await flush()
      expect(a.value).toBe(true)
      api?.hide('done', 'a')
      await flush()
      expect(a.value).toBe(false)

      const handle = api?.get('a')
      expect(handle?.id).toBe('a')
      handle?.show()
      await flush()
      expect(a.value).toBe(true)
      expect(api?.get('missing')).toBeNull()
    })

    it('hide() without an id hides the topmost open dialog, hideAll() hides every one', async () => {
      let api: ReturnType<typeof useDialog> | undefined
      const {a, b} = mountDeclared((value) => {
        api = value
      })
      await flush()
      api?.show('a')
      await flush()
      api?.show('b')
      await flush()
      expect([a.value, b.value]).toEqual([true, true])

      api?.hide()
      await flush()
      expect([a.value, b.value]).toEqual([true, false])

      api?.show('b')
      await flush()
      api?.hideAll('all')
      await flush()
      expect([a.value, b.value]).toEqual([false, false])
    })

    it('current() is the dialog the calling component is rendered in', async () => {
      let inside: ReturnType<ReturnType<typeof useDialog>['current']> | undefined
      let outside: ReturnType<ReturnType<typeof useDialog>['current']> | undefined
      const open = ref(true)
      const Child = defineComponent({
        setup() {
          inside = useDialog().current()
          return () => h('span', 'child')
        },
      })
      const Root = defineComponent({
        setup() {
          outside = useDialog().current()
          return () =>
            h(
              BDialog,
              {
                'id': 'host',
                'noTransition': true,
                'modelValue': open.value,
                'onUpdate:modelValue': (v: boolean) => {
                  open.value = v
                },
              },
              () => h(Child)
            )
        },
      })
      mount(BApp, {attachTo: document.body, slots: {default: () => h(Root)}})
      await flush()

      expect(outside).toBeNull()
      expect(inside?.id).toBe('host')
      inside?.hide('inner')
      await flush()
      expect(open.value).toBe(false)
    })
  })

  it('keeps the content and its state between shows until destroy()', async () => {
    let dialog: ReturnType<ReturnType<typeof useDialog>['create']> | undefined
    let setups = 0
    // inheritAttrs: false, the slot scope is bound on the slot component
    const Draft = defineComponent({
      inheritAttrs: false,
      setup() {
        setups++
        const text = ref('')
        return () =>
          h('input', {
            id: 'draft',
            value: text.value,
            onInput: (e: Event) => {
              text.value = (e.target as HTMLInputElement).value
            },
          })
      },
    })
    mountApp(() => {
      dialog = useDialog().create(
        {id: 'draft-dialog', noTransition: true},
        {slots: {default: Draft}}
      )
    })
    await nextTick()
    const flush = () => new Promise((resolve) => setTimeout(resolve, 20))
    const input = () => document.getElementById('draft') as HTMLInputElement | null

    void dialog?.show()
    await flush()
    input()!.value = 'half written'
    input()!.dispatchEvent(new Event('input'))
    dialog?.hide('later')
    await flush()
    expect(dialog?.get()?.value.props.modelValue).toBe(false)

    void dialog?.show()
    await flush()
    expect(input()?.value).toBe('half written')
    expect(setups).toBe(1)

    await dialog?.destroy()
    await flush()
    expect(input()).toBeNull()
  })

  describe('create before any orchestrator mounts', () => {
    // Restore even when a test fails partway, so its console spy can't leak into the next test
    afterEach(() => {
      vi.restoreAllMocks()
    })

    // The plugin provides the registry without rendering an orchestrator, so the host decides when
    // one mounts. That is the window a router guard running before the app's first render hits
    const mountWithoutOrchestrator = (setup: () => void) => {
      const showOrchestrator = ref(false)
      const Host = defineComponent({
        setup() {
          setup()
          return () => h('div', [showOrchestrator.value ? h(BOrchestrator) : null])
        },
      })
      const wrapper = mount(Host, {
        global: {plugins: [orchestratorPlugin, registryPlugin]},
        attachTo: document.body,
      })
      return {wrapper, showOrchestrator}
    }
    const isPreMountWarning = (args: unknown[]) =>
      String(args[1]).includes('before any BOrchestrator')
    // The warning fires once per module instance, so tests that count it need their own copy of
    // useDialog. The plugin and BApp are imported alongside it so they share its injection keys
    const importFresh = async () => {
      vi.resetModules()
      const [{useDialog}, {orchestratorPlugin}, {default: BApp}] = await Promise.all([
        import('./index'),
        import('../../plugins/orchestrator'),
        import('../../components/BApp/BApp.vue'),
      ])
      return {useDialog, orchestratorPlugin, BApp}
    }

    it('does not throw, and renders the dialog once an orchestrator mounts', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const {wrapper, showOrchestrator} = mountWithoutOrchestrator(() => {
        const {create} = useDialog()
        expect(() =>
          create({id: 'early', body: 'early body', modelValue: true, noTransition: true})
        ).not.toThrow()
      })
      await nextTick()
      expect(document.getElementById('early')).toBeNull()

      showOrchestrator.value = true
      await new Promise((resolve) => setTimeout(resolve, 20))

      const dialog = document.getElementById('early') as HTMLDialogElement | null
      expect(dialog?.textContent).toContain('early body')
      expect(dialog?.open).toBe(true)
      wrapper.unmount()
    })

    it('warns only once, even across apps', async () => {
      const fresh = await importFresh()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      // Each mount is its own app with its own registry, as each request is on an SSR server
      const mountApp = () =>
        mount(
          defineComponent({
            setup() {
              const {create} = fresh.useDialog()
              create({title: 'first'})
              create({title: 'second'})
              return () => h('div')
            },
          }),
          {global: {plugins: [fresh.orchestratorPlugin]}}
        )
      const first = mountApp()
      const second = mountApp()

      const preMountWarnings = warnSpy.mock.calls.filter(isPreMountWarning)
      expect(preMountWarnings).toHaveLength(1)
      expect(preMountWarnings[0]?.[0]).toBe('[BootstrapVueNext:useDialog]')
      first.unmount()
      second.unmount()
    })

    it('does not warn once an orchestrator has mounted', async () => {
      const fresh = await importFresh()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const TestComponent = defineComponent({
        setup() {
          fresh.useDialog().create({title: 'after mount'})
          return () => h('div')
        },
      })
      mount(fresh.BApp, {slots: {default: () => h(TestComponent)}})

      expect(warnSpy.mock.calls.some(isPreMountWarning)).toBe(false)
    })

    it('settles show() and destroy() for a dialog hidden before an orchestrator mounts', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      let dialogs: ReturnType<typeof useDialog> | undefined
      let dismissed: Promise<unknown> | undefined
      const {wrapper, showOrchestrator} = mountWithoutOrchestrator(() => {
        dialogs = useDialog()
        dismissed = dialogs
          .create({id: 'never-shown', body: 'never shown', modelValue: true})
          .show()
      })

      dialogs?.hide('route-change', 'never-shown')

      let disposed = false
      let result: unknown
      void dismissed?.then(async (value) => {
        result = value
        await (value as {[Symbol.asyncDispose]: () => Promise<void>})[Symbol.asyncDispose]()
        disposed = true
      })
      await new Promise((resolve) => setTimeout(resolve, 20))
      // The helper hides an unmounted item through its store entry, which carries no trigger
      expect(result).toMatchObject({trigger: null, ok: null})
      expect(disposed).toBe(true)
      expect(dialogs?.get('never-shown')).toBeNull()

      showOrchestrator.value = true
      await nextTick()
      expect(document.getElementById('never-shown')).toBeNull()
      wrapper.unmount()
    })
  })
})
