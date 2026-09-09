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
        <TabsList as-child>
          <ul
            class="nav"
            :class="[navTabsClasses, props.navClass]"
            role="tablist"
            :aria-orientation="props.vertical ? 'vertical' : 'horizontal'"
          >
            <slot name="tabs-start" />
            <li
              v-for="tab in tabs"
              :key="tab.id ?? tab.internalId"
              class="nav-item"
              :class="tab.titleItemClass"
              role="presentation"
            >
              <TabsTrigger :value="tab.id" :disabled="tab.disabled" as-child>
                <button
                  :id="tab.buttonId"
                  class="nav-link"
                  :class="[
                    tab.navItemClasses,
                    tab.titleLinkClass,
                    tab.active ? props.activeNavLinkClass : props.inactiveNavLinkClass,
                  ]"
                  role="tab"
                  :aria-controls="tab.id"
                  :aria-selected="tab.active"
                  :disabled="tab.disabled"
                  :tabindex="props.noKeyNav ? undefined : tab.active ? undefined : -1"
                  type="button"
                  v-bind="tab.titleLinkAttrs"
                  @click.capture="(e) => handleClick(e, tab.id)"
                >
                  <component :is="tab.titleComponent" v-if="tab.titleComponent" />
                  <template v-else>
                    {{ tab.title }}
                  </template>
                </button>
              </TabsTrigger>
            </li>
            <slot name="tabs-end" />
          </ul>
        </TabsList>
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
import {TabsList, TabsRoot, TabsTrigger} from 'reka-ui'
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
const isReverting = ref(false)
const initialIds = ref<string[]>([])

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

const getActiveFallbackId = (nextTabs: TabType[]) => {
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

  return tabsInternal.value.map((_tab) => {
    const tab = unref(_tab)
    const active = tab.id === activeId.value

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
  if (tabs.value.length === 0) {
    if (activeId.value !== undefined) {
      isReverting.value = true
      activeId.value = undefined
    }
    return
  }

  if (activeId.value !== undefined) {
    const activeTab = tabs.value.find((tab) => tab.id === activeId.value)
    if (activeTab && !activeTab.disabled) return
  }

  const fallbackId = getActiveFallbackId(tabs.value)
  if (fallbackId !== activeId.value) {
    isReverting.value = true
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

const handleClick = (event: Readonly<MouseEvent>, id: string) => {
  const tab = tabs.value.find((value) => value.id === id)
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
}

watch(activeId, (newValue, oldValue) => {
  if (isReverting.value) {
    isReverting.value = false
    return
  }

  if (tabs.value.length <= 0 || tabs.value.filter((t) => !t.disabled).length <= 0) return

  const index = tabs.value.findIndex((t) => t.id === newValue)
  if (index === -1 || tabs.value[index]?.disabled) {
    const fallback = getActiveFallbackId(tabs.value)
    if (fallback !== activeId.value) {
      isReverting.value = true
      activeId.value = fallback
    }
    return
  }

  if (!initialized.value || newValue === oldValue) return

  const oldIndex = tabs.value.findIndex((t) => t.id === oldValue)
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
    isReverting.value = true
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
  sortTabs()
  normalizeActiveId()
  initialized.value = true
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
