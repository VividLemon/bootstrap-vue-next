import {afterEach, describe, expect, it, vi} from 'vitest'
import {type Component, createSSRApp, defineComponent, h, type VNode} from 'vue'
import {renderToString, type SSRContext} from 'vue/server-renderer'
import * as Components from './components'
import {componentsWithExternalPath, type ComponentType} from './types/BootstrapVueOptions'
import {createBootstrap} from './plugins/createBootstrap'
import {getSafeWindow} from './utils/dom'

/**
 * Hydration smoke test: every component, with default props, renders on the server and hydrates
 * on the client without a hydration warning.
 *
 * Server: `createSSRApp` + Vue's `renderToString(app, ssrContext)`. (Vue Test Utils'
 * `renderToString` passes no SSR context, so teleported content would be lost and every
 * teleporting component would mismatch against an empty target.) While it runs, `window` and
 * `document` are removed, so code that goes through `getSafeWindow()` / `getSafeDocument()` takes
 * its server branch. Values captured when a module loads (VueUse's `defaultWindow`) still see the
 * test DOM.
 *
 * Client: the HTML goes into the document (teleports into their targets, as Nuxt does), then
 * `createSSRApp(...).mount()` hydrates it. Development builds report each mismatch with the node
 * and the reason.
 */

type Render = (component: Component) => VNode

const content = () => 'Content'

/** The component inside `parent` (with the parent's own content around it, if any) */
const inside =
  (parent: Component, parentProps: Record<string, unknown> = {}): Render =>
  (component) =>
    h(parent, parentProps, () => h(component, null, content))

/** Table parts need a valid table around them: the HTML parser drops a `<tr>` outside a table */
const inTable =
  (...wrappers: Component[]): Render =>
  (component) =>
    h(Components.BTableSimple, null, () =>
      wrappers.reduceRight<() => VNode>(
        (child, wrapper) => () => h(wrapper, null, child),
        () => h(component, null, content)
      )()
    )

// How to render the components that only make sense inside a parent. Everything else renders on
// its own with a default slot
const renders: Partial<Record<ComponentType, Render>> = {
  BAccordionItem: inside(Components.BAccordion),
  BBreadcrumbItem: inside(Components.BBreadcrumb),
  BBreadcrumbDivider: inside(Components.BBreadcrumb),
  BCarouselSlide: inside(Components.BCarousel),
  BDropdownDivider: inside(Components.BDropdown),
  BDropdownForm: inside(Components.BDropdown),
  BDropdownGroup: inside(Components.BDropdown),
  BDropdownHeader: inside(Components.BDropdown),
  BDropdownItem: inside(Components.BDropdown),
  BDropdownItemButton: inside(Components.BDropdown),
  BDropdownText: inside(Components.BDropdown),
  BFormSelectOption: inside(Components.BFormSelect),
  BFormSelectOptionGroup: inside(Components.BFormSelect),
  BListGroupItem: inside(Components.BListGroup),
  BNavForm: inside(Components.BNav),
  BNavItem: inside(Components.BNav),
  BNavItemDropdown: inside(Components.BNav),
  BNavText: inside(Components.BNav),
  BNavbarBrand: inside(Components.BNavbar),
  BNavbarNav: inside(Components.BNavbar),
  BNavbarToggle: inside(Components.BNavbar),
  BProgressBar: inside(Components.BProgress),
  BTab: inside(Components.BTabs),
  BTbody: inTable(),
  BTfoot: inTable(),
  BThead: inTable(),
  BTr: inTable(Components.BTbody),
  BTd: inTable(Components.BTbody, Components.BTr),
  BTh: inTable(Components.BThead, Components.BTr),
}

// Not rendered by users directly: BApp renders it
const skipped = new Set<ComponentType>(['BOrchestrator'])

// Real mismatches, not yet fixed. These run with `it.fails`, so a fix turns them red until the
// entry is removed
const knownIssues: Partial<Record<ComponentType, string>> = {
  // Vue can't hydrate a Teleport to `body`: body holds other server-rendered content, so the
  // teleported nodes have no known start. Vue's SSR guide says to teleport to a dedicated
  // container instead. The Nuxt module sets `#teleports`, so only other SSR setups see this
  BOffcanvas: "default `teleportTo: 'body'`",
}

const hydrate = async (render: () => VNode) => {
  const Root = defineComponent({render})

  const server = createSSRApp(Root).use(createBootstrap())
  const ssrContext: SSRContext = {}
  vi.stubGlobal('window', undefined)
  vi.stubGlobal('document', undefined)
  let html: string
  try {
    html = await renderToString(server, ssrContext)
  } finally {
    vi.unstubAllGlobals()
  }

  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  for (const [target, teleported] of Object.entries(ssrContext.teleports ?? {})) {
    document.querySelector(target)?.insertAdjacentHTML('beforeend', teleported)
  }

  const warnings: string[] = []
  const client = createSSRApp(Root).use(createBootstrap())
  client.config.warnHandler = (msg) => warnings.push(msg)
  // Vue also logs "Hydration completed but contains mismatches." through console.error
  const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    warnings.push(args.map(String).join(' '))
  })
  try {
    client.mount(container)
  } finally {
    errorSpy.mockRestore()
  }
  return {client, warnings}
}

const apps: {unmount: () => void}[] = []
afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.innerHTML = ''
})

const hydrationWarnings = (warnings: readonly string[]) =>
  warnings.filter((warning) => /hydrat|mismatch/i.test(warning))

describe('hydration harness', () => {
  it('reports a mismatch when the server and client render differently', async () => {
    const {client, warnings} = await hydrate(() => h('span', getSafeWindow() ? 'client' : 'server'))
    apps.push(client)
    expect(hydrationWarnings(warnings)).not.toEqual([])
  })
})

describe('hydration with default props', () => {
  const names = (Object.keys(componentsWithExternalPath) as ComponentType[]).filter(
    (name) => !skipped.has(name) && !knownIssues[name]
  )

  it.each(names)('%s hydrates without a mismatch', async (name) => {
    expect(await hydrationWarningsFor(name)).toEqual([])
  })

  it.fails.each(Object.keys(knownIssues) as ComponentType[])(
    '%s hydrates without a mismatch (known issue)',
    async (name) => {
      expect(await hydrationWarningsFor(name)).toEqual([])
    }
  )
})

/** Hydrates the component's case and returns the hydration warnings it produced */
async function hydrationWarningsFor(name: ComponentType) {
  const component = (Components as unknown as Record<string, Component | undefined>)[name]
  if (!component) throw new Error(`${name} is not exported from ./components`)

  const render = renders[name]
  const {client, warnings} = await hydrate(() =>
    render ? render(component) : h(component, null, content)
  )
  apps.push(client)
  return hydrationWarnings(warnings)
}
