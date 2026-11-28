import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {defineComponent, h, markRaw, ref, shallowReactive} from 'vue'
import BOrchestrator from './BOrchestrator.vue'
import {orchestratorRegistryKey} from '../../utils/keys'
import type {
  DialogOrchestratorArrayValue,
  ToastOrchestratorArrayValue,
} from '../../types/ComponentOrchestratorTypes'
import type {ContainerPosition} from '../../types/Alignment'

const DummyComponent = markRaw(
  defineComponent({
    name: 'DummyComponent',
    setup: () => () => h('div'),
  })
)

const buildItem = <T extends DialogOrchestratorArrayValue | ToastOrchestratorArrayValue>(
  id: string,
  props: T['props']
) =>
  ({
    component: DummyComponent,
    id,
    fns: {
      // The dummy renders no show/hide component; report a connection so no warning is logged
      link: {connect: () => ({}) as never, connected: () => true},
      setRef: () => {},
      destroy: async () => {},
      show: () => {},
      hide: () => {},
    },
    props,
  }) as T

const buildRegistry = (overrides: {
  dialog?: DialogOrchestratorArrayValue[]
  toast?: ToastOrchestratorArrayValue[]
}) => {
  // Shallow maps, like the registry's
  const dialogMap = shallowReactive(
    new Map((overrides.dialog ?? []).map((item) => [item.id, ref(item)]))
  )
  const toastMap = shallowReactive(
    new Map((overrides.toast ?? []).map((item) => [item.id, ref(item)]))
  )

  return {
    store: ref({
      dialog: dialogMap,
      tooltip: shallowReactive(new Map()),
      popover: shallowReactive(new Map()),
      toast: toastMap,
    }),
    _isOrchestratorInstalled: ref(true),
    _setOrchestratorInstalled: () => {},
    _isToastAppend: ref(false),
    _setToastAppend: () => {},
  }
}

enableAutoUnmount(afterEach)

describe('BOrchestrator TransitionGroup name conditional behavior', () => {
  it('renders dialog items without a TransitionGroup or wrapper span', () => {
    const registry = buildRegistry({
      dialog: [buildItem<DialogOrchestratorArrayValue>('dialog1', {modelValue: false})],
    })

    const wrapper = mount(BOrchestrator, {
      global: {
        provide: {
          [orchestratorRegistryKey]: registry,
        },
      },
    })

    expect(wrapper.findComponent({name: 'TransitionGroup'}).exists()).toBe(false)
    expect(wrapper.findComponent({name: 'DummyComponent'}).exists()).toBe(true)
    expect(wrapper.find('span').exists()).toBe(false)
  })

  it('applies b-list transition name when toast items are present', () => {
    const registry = buildRegistry({
      toast: [
        buildItem<ToastOrchestratorArrayValue>('toast1', {
          modelValue: false,
          position: 'top-end',
        }),
      ],
    })

    const wrapper = mount(BOrchestrator, {
      global: {
        provide: {
          [orchestratorRegistryKey]: registry,
        },
      },
    })

    const transitionGroup = wrapper.findComponent({name: 'TransitionGroup'})
    expect(transitionGroup.exists()).toBe(true)

    // Should have the b-list name for toast items
    expect(transitionGroup.props('name')).toBe('b-list')
  })

  it('applies b-list transition name when mixed items contain toasts', () => {
    const registry = buildRegistry({
      dialog: [buildItem<DialogOrchestratorArrayValue>('dialog1', {modelValue: false})],
      toast: [
        buildItem<ToastOrchestratorArrayValue>('toast1', {
          modelValue: false,
          position: 'top-end',
        }),
      ],
    })

    const wrapper = mount(BOrchestrator, {
      global: {
        provide: {
          [orchestratorRegistryKey]: registry,
        },
      },
    })

    // Only the toast container has a TransitionGroup, with the b-list transition
    const transitionGroups = wrapper.findAllComponents({name: 'TransitionGroup'})
    expect(transitionGroups).toHaveLength(1)
    expect(transitionGroups[0]?.props('name')).toBe('b-list')
    expect(wrapper.findAllComponents({name: 'DummyComponent'})).toHaveLength(2)
  })
})

describe('BOrchestrator group containers', () => {
  const mountWith = (registry: ReturnType<typeof buildRegistry>, filter?: () => boolean) =>
    mount(BOrchestrator, {
      props: filter ? {filter} : {},
      global: {provide: {[orchestratorRegistryKey]: registry}},
    })

  it('renders no group container while every group is empty', () => {
    const wrapper = mountWith(buildRegistry({}))
    expect(wrapper.find('.orchestrator-container').element.children).toHaveLength(0)
  })

  it('renders one container per group with items, and none for a group the filter empties', () => {
    const registry = buildRegistry({
      dialog: [buildItem<DialogOrchestratorArrayValue>('dialog1', {modelValue: false})],
      toast: [
        buildItem<ToastOrchestratorArrayValue>('toast1', {modelValue: false, position: 'top-end'}),
      ],
    })
    expect(mountWith(registry).find('.orchestrator-container').element.children).toHaveLength(2)

    const filtered = mountWith(registry, () => false)
    expect(filtered.find('.orchestrator-container').element.children).toHaveLength(0)
  })

  it('wraps toast items in a span and renders dialog items bare', () => {
    const registry = buildRegistry({
      dialog: [buildItem<DialogOrchestratorArrayValue>('dialog1', {modelValue: false})],
      toast: [
        buildItem<ToastOrchestratorArrayValue>('toast1', {modelValue: false, position: 'top-end'}),
      ],
    })
    const wrapper = mountWith(registry)
    expect(wrapper.findAll('span')).toHaveLength(1)
    expect(wrapper.findAllComponents({name: 'DummyComponent'})).toHaveLength(2)
  })
})

describe('BOrchestrator toast container position classes', () => {
  const mountWithToast = (position?: ContainerPosition) => {
    const registry = buildRegistry({
      toast: [
        buildItem<ToastOrchestratorArrayValue>('toast1', {
          modelValue: false,
          ...(position ? {position} : {}),
        }),
      ],
    })

    return mount(BOrchestrator, {
      global: {
        provide: {
          [orchestratorRegistryKey]: registry,
        },
      },
    })
  }

  // The semantic position must be mapped to Bootstrap position utilities. Emitting the raw
  // value instead yields e.g. `bottom-end`, which matches no stylesheet rule, leaving the
  // fixed container with auto offsets in the top-left corner.
  it.each([
    ['top-start', 'top-0 start-0'],
    ['top-center', 'top-0 start-50 translate-middle-x'],
    ['top-end', 'top-0 end-0'],
    ['middle-start', 'top-50 start-0 translate-middle-y'],
    ['middle-center', 'top-50 start-50 translate-middle'],
    ['middle-end', 'top-50 end-0 translate-middle-y'],
    ['bottom-start', 'bottom-0 start-0'],
    ['bottom-center', 'bottom-0 start-50 translate-middle-x'],
    ['bottom-end', 'bottom-0 end-0'],
  ] satisfies [ContainerPosition, string][])(
    'renders position %s as the utility classes %s',
    (position, expected) => {
      const wrapper = mountWithToast(position)

      const container = wrapper.find('.toast-container')
      expect(container.exists()).toBe(true)
      expect(container.attributes('class')).toBe(`${expected} toast-container position-fixed p-3`)
    }
  )

  it('falls back to the bottom-start utility classes when no position is given', () => {
    const wrapper = mountWithToast()

    const container = wrapper.find('.toast-container')
    expect(container.exists()).toBe(true)
    expect(container.attributes('class')).toBe(
      'bottom-0 start-0 toast-container position-fixed p-3'
    )
  })
})
