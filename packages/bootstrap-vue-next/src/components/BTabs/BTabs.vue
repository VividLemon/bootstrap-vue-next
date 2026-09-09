<template>
  <TabsRoot
    v-model="activeId"
    as-child
    :orientation="props.vertical ? 'vertical' : 'horizontal'"
  >
    <component :is="props.tag" :id="props.id" class="tabs" :class="computedClasses">
      <BTabsTabContent v-if="props.end" v-bind="tabContentProps">
        <slot />
        <template #empty>
          <slot name="empty" />
        </template>
      </BTabsTabContent>
      <div
        :class="[
          props.navWrapperClass,
          {'card-header': props.card, 'ms-auto': props.vertical && props.end},
        ]"
      >
        <ul
          class="nav"
          :class="[navTabsClasses, props.navClass]"
          role="tablist"
          :aria-orientation="props.vertical ? 'vertical' : 'horizontal'"
        >
          <slot name="tabs-start" />
          <li
            v-for="(tab, idx) in tabs"
            :key="tab.id ?? tab.internalId"
            class="nav-item"
            :class="tab.titleItemClass"
            role="presentation"
          >
            <button
              :id="tab.buttonId"
              class="nav-link"
              :class="[
                {
                  active: isTabActive(tab.id, tab.active, idx),
                  disabled: tab.disabled,
                },
                isTabActive(tab.id, tab.active, idx)
                  ? props.activeNavItemClass
                  : props.inactiveNavItemClass,
                props.navItemClass,
                tab.titleLinkClass,
                isTabActive(tab.id, tab.active, idx)
                  ? props.activeNavLinkClass
                  : props.inactiveNavLinkClass,
              ]"
              role="tab"
              :aria-controls="tab.id"
              :aria-selected="isTabActive(tab.id, tab.active, idx)"
              :disabled="tab.disabled"
              :tabindex="
                props.noKeyNav ? undefined : isTabActive(tab.id, tab.active, idx) ? undefined : -1
              "
              type="button"
              v-bind="tab.titleLinkAttrs"
              @keydown.left.exact="!props.vertical && keynav($event, -1)"
              @keydown.left.shift="!props.vertical && keynav($event, -999)"
              @keydown.up.exact="props.vertical && keynav($event, -1)"
              @keydown.up.shift="props.vertical && keynav($event, -999)"
              @keydown.right.exact="!props.vertical && keynav($event, 1)"
              @keydown.right.shift="!props.vertical && keynav($event, 999)"
              @keydown.down.exact="props.vertical && keynav($event, 1)"
              @keydown.down.shift="props.vertical && keynav($event, 999)"
              @keydown.page-up="keynav($event, -999)"
              @keydown.page-down="keynav($event, 999)"
              @keydown.home="keynav($event, -999)"
              @keydown.end="keynav($event, 999)"
              @click.stop="(e) => handleClick(e, idx)"
            >
              <component :is="tab.titleComponent" v-if="tab.titleComponent" />
              <template v-else>
                {{ tab.title }}
              </template>
            </button>
          </li>
          <slot name="tabs-end" />
        </ul>
      </div>
      <BTabsTabContent v-if="!props.end" v-bind="tabContentProps">
        <slot />
        <template #empty>
          <slot name="empty" />
        </template>
      </BTabsTabContent>
    </component>
  </TabsRoot>
</template>

<script setup lang="ts">
import {TabsRoot} from 'reka-ui'
import {
  computed,
  nextTick,
  onMounted,
  provide,
  type Ref,
  ref,
  toRef,
  unref,
  type VNode,
  watch,
} from 'vue'
import {BvEvent} from '../../utils/classes'
import {useAlignment} from '../../composables/useAlignment'
import {useId} from '../../composables/useId'
import type {TabType, BTabsProps, BTabsEmits, BTabsSlots} from '../../types'
import {tabsInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import {getSafeDocument, sortSlotElementsByPosition} from '../../utils/dom'
import {flattenFragments} from '../../utils/flattenFragments'
import BTab from './BTab.vue'
import BTabsTabContent from '../BTabsTabContent.vue'

const _props = withDefaults(defineProps<Omit<BTabsProps, 'modelValue'>>(), {
  activeNavItemClass: undefined,
  activeNavLinkClass: undefined,
  activeTabClass: undefined,
  align: undefined,
  card: false,
  contentClass: undefined,
  end: false,
  fill: false,
  id: undefined,
  inactiveNavItemClass: undefined,
  inactiveNavLinkClass: undefined,
  inactiveTabClass: undefined,
  justified: false,
  lazy: false,
  navClass: undefined,
  navItemClass: undefined,
  navWrapperClass: undefined,
  noFade: false,
  noKeyNav: false,
  noNavStyle: false,
  pills: false,
  small: false,
  tag: 'div',
  tabClass: undefined,
  underline: false,
  vertical: false,
})
const props = useDefaults(_props, 'BTabs')
const emit = defineEmits<BTabsEmits>()
const slots = defineSlots<BTabsSlots>()

const activeId = defineModel<BTabsProps['modelValue']>({
  default: undefined,
})

const tabsInternal = ref<Ref<TabType>[]>([])
const tabElementsArray = ref<VNode[]>([])
const initialized = ref(false)
const suppressActivateEvent = ref(false)
const initialIds = ref<string[]>([])
const initialModelValue = activeId.value

const updateTabElementsArray = () => {
  const tabElements = flattenFragments(slots.default?.({}) ?? [])
  tabElementsArray.value = (Array.isArray(tabElements) ? tabElements : [tabElements]).filter(
    (tab) => tab.type === BTab
  )

  initialIds.value = tabElementsArray.value.map(
    (tab, index) => initialIds.value[index] ?? unref(useId(() => tab.props?.id, 'tabpane'))
  )
}
updateTabElementsArray()

watch(
  () => slots.default?.({}),
  () => {
    updateTabElementsArray()
    nextTick(() => {
      sortTabs()
      normalizeActiveId()
    })
  }
)

const getActiveFallbackId = (nextTabs: Array<Pick<TabType, 'id' | 'active' | 'disabled'>>) => {
  const explicitActive = nextTabs.find(
    (tab) => tab.active !== undefined && tab.active !== false && !tab.disabled
  )?.id

  return explicitActive ?? nextTabs.find((tab) => !tab.disabled)?.id
}

const tabs = computed(() => {
  if (tabsInternal.value.length === 0) {
    const fallbackActiveIndex = tabElementsArray.value.findIndex(
      (tab) => tab.props?.active !== undefined && tab.props.active !== false && tab.props.disabled !== true
    )

    const firstEnabledIndex = tabElementsArray.value.findIndex((tab) => tab.props?.disabled !== true)

    return tabElementsArray.value.map((tab, index) => {
      const id = tab.props?.id ?? initialIds.value[index] ?? `premount-${index}`
      const active =
        activeId.value !== undefined
          ? id === activeId.value
          : fallbackActiveIndex !== -1
            ? index === fallbackActiveIndex
            : firstEnabledIndex !== -1
              ? index === firstEnabledIndex
              : index === 0

      return {
        id,
        internalId: `premount-${index}`,
        buttonId: tab.props?.buttonId,
        disabled: tab.props?.disabled === true,
        title: tab.props?.title,
        titleComponent: (tab.children as {title: unknown})?.title,
        titleItemClass: tab.props?.titleItemClass,
        titleLinkAttrs: tab.props?.titleLinkAttrs,
        titleLinkClass: tab.props?.titleLinkClass,
        onClick: tab.props?.onClick,
        active,
        navItemClasses: [
          {
            active,
            disabled: tab.props?.disabled === true,
          },
          active ? props.activeNavItemClass : props.inactiveNavItemClass,
          props.navItemClass,
        ],
      }
    })
  }

  const internalTabs = tabsInternal.value.map((_tab) => unref(_tab))
  const fallbackId = activeId.value ?? getActiveFallbackId(internalTabs)

  return internalTabs.map((tab) => {
    const active = tab.id === fallbackId

    return {
      ...tab,
      active,
      navItemClasses: [
        {
          active,
          disabled: tab.disabled,
        },
        active ? props.activeNavItemClass : props.inactiveNavItemClass,
        props.navItemClass,
      ],
    }
  })
})

const normalizeActiveId = () => {
  if (!initialized.value) return

  if (tabs.value.length === 0) {
    return
  }

  if (activeId.value !== undefined) {
    const activeTab = tabs.value.find((tab) => tab.id === activeId.value)
    if (activeTab && !activeTab.disabled) return
  }

  const fallbackId = getActiveFallbackId(tabs.value)
  if (fallbackId !== activeId.value) {
    activeId.value = fallbackId
  }
}

watch(
  tabs,
  () => {
    normalizeActiveId()
  },
  {deep: true, immediate: true}
)

const showEmpty = computed(() => !(tabs?.value && tabs.value.length > 0))

const tabContentProps = computed(() => ({
  contentClass: props.contentClass,
  showEmpty: showEmpty.value,
  card: props.card,
}))

const computedClasses = computed(() => ({
  'd-flex': props.vertical,
  'align-items-start': props.vertical,
}))

const alignment = useAlignment(() => props.align)

const navTabsClasses = computed(() => ({
  'nav-pills': props.pills,
  'nav-underline': props.underline,
  'flex-column me-3': props.vertical,
  [alignment.value]: props.align !== undefined,
  'nav-fill': props.fill,
  'card-header-tabs': props.card && !props.pills && !props.underline,
  'card-header-pills': props.card && props.pills,
  'nav-justified': props.justified,
  'nav-tabs': !props.noNavStyle && !props.pills && !props.underline,
  'small': props.small,
}))
const hasActiveTab = computed(() => tabs.value.some((tab) => tab.active))
const isTabActive = (id: string, active: boolean, index: number) =>
  active || id === activeId.value || (!hasActiveTab.value && index === 0)

const activeIndex = computed(() => tabs.value.findIndex((tab) => tab.id === activeId.value))

const handleClick = (event: Readonly<MouseEvent>, index: number) => {
  const tab = tabs.value[index]
  if (!tab || tab.disabled) return

  if (tab.onClick && typeof tab.onClick === 'function') {
    tab.onClick(event)
    if (event.defaultPrevented) {
      event.preventDefault()
      getSafeDocument()?.getElementById(tab.buttonId)?.blur()
      event.stopPropagation()
      return
    }
  }

  if (activeId.value !== tab.id) {
    activeId.value = tab.id
  }
}

const nextIndex = (start: number, direction: number) => {
  let index = start
  let minIdx = -1
  let maxIdx = -1

  for (let i = 0; i < tabs.value.length; i++) {
    if (!tabs.value[i]?.disabled) {
      if (minIdx === -1) minIdx = i
      maxIdx = i
    }
  }

  while (index >= minIdx && index <= maxIdx && tabs.value[index]?.disabled) {
    index += direction
  }

  if (index < minIdx) index = minIdx
  if (index > maxIdx) index = maxIdx

  return index
}

const keynav = (e: Event, direction: number) => {
  if (tabs.value.length <= 0 || props.noKeyNav) return
  e.preventDefault()
  e.stopPropagation()
  const next = nextIndex(activeIndex.value + direction, direction)
  if (next >= 0 && tabs.value[next] && tabs.value[next].id !== activeId.value) {
    activeId.value = tabs.value[next].id
  }
  nextTick(() => {
    if (next >= 0) {
      getSafeDocument()?.getElementById(tabs.value[next]?.buttonId)?.focus()
    }
  })
}

watch(activeId, (newValue, oldValue) => {
  if (suppressActivateEvent.value) {
    suppressActivateEvent.value = false
    return
  }

  if (tabs.value.length <= 0 || tabs.value.filter((t) => !t.disabled).length <= 0) return

  const index = tabs.value.findIndex((t) => t.id === newValue)
  if (index === -1 || tabs.value[index]?.disabled) {
    const fallback = getActiveFallbackId(tabs.value)
    if (fallback !== activeId.value) {
      if (initialized.value) suppressActivateEvent.value = true
      activeId.value = fallback
    }
    return
  }

  if (!initialized.value || newValue === oldValue) return

  const oldIndex =
    oldValue !== undefined
      ? tabs.value.findIndex((t) => t.id === oldValue)
      : tabs.value.findIndex((t) => !t.disabled)
  const tabEvent = new BvEvent('activate-tab', {cancelable: true})
  emit('activate-tab', {
    newTabId: tabs.value[index]?.id,
    prevTabId: oldIndex === -1 ? '' : tabs.value[oldIndex]?.id,
    newTabIndex: index,
    prevTabIndex: oldIndex,
    event: tabEvent,
  })

  if (tabEvent.defaultPrevented) {
    const fallback = oldValue ?? getActiveFallbackId(tabs.value)
    suppressActivateEvent.value = true
    activeId.value = fallback

    nextTick(() => {
      const fallbackTab = tabs.value.find((tab) => tab.id === fallback)
      if (fallbackTab) {
        getSafeDocument()?.getElementById(fallbackTab.buttonId)?.focus()
      }
    })
  }
})

const registerTab = (tab: Ref<TabType>) => {
  const idx = tabsInternal.value.findIndex((t) => t.value.internalId === tab.value.internalId)
  if (idx === -1) {
    tabsInternal.value.push(tab)
    if (activeId.value === undefined && tab.value.active && !tab.value.disabled) {
      activeId.value = tab.value.id
    }
    if (initialized.value) {
      nextTick(() => {
        sortTabs()
      })
    }
  } else {
    tabsInternal.value[idx] = tab
    if (initialized.value) {
      sortTabs()
    }
  }

  const idx2 = tabsInternal.value.findIndex((t) => t.value.internalId === tab.value.internalId)
  return tab.value.id ?? (!initialized.value ? initialIds.value[idx2] : tab.value.internalId)
}

onMounted(() => {
  initialized.value = true
  nextTick(() => {
    sortTabs()
    if (initialModelValue === undefined) {
      activeId.value = getActiveFallbackId(tabs.value)
    }
    normalizeActiveId()
  })
})

const sortTabs = () => {
  tabsInternal.value.sort((a, b) => sortSlotElementsByPosition(a.value.el.value, b.value.el.value))
}

const unregisterTab = (id: string) => {
  tabsInternal.value = tabsInternal.value.filter((t) => t.value.internalId !== id)
  normalizeActiveId()
}

provide(tabsInjectionKey, {
  lazy: toRef(() => props.lazy),
  card: toRef(() => props.card),
  noFade: toRef(() => props.noFade),
  activeTabClass: toRef(() => props.activeTabClass),
  inactiveTabClass: toRef(() => props.inactiveTabClass),
  tabClass: toRef(() => props.tabClass),
  registerTab,
  unregisterTab,
  activeId,
  activateTab: (internalId) => {
    const idx = tabs.value.findIndex((t) => t.internalId === internalId)
    if (internalId === undefined || idx === -1 || tabs.value[idx]?.disabled) {
      const fallback = getActiveFallbackId(tabs.value)
      if (fallback !== activeId.value) {
        activeId.value = fallback
      }
      return
    }
    if (tabs.value[idx]?.id !== activeId.value) {
      activeId.value = tabs.value[idx]?.id
    }
  },
})
</script>
