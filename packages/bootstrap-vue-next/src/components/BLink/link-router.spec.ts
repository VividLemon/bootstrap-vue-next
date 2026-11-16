import {enableAutoUnmount, flushPromises, mount} from '@vue/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {
  computed,
  defineComponent,
  type Directive,
  h,
  nextTick,
  type PropType,
  ref,
  resolveComponent,
} from 'vue'
import {
  createMemoryHistory,
  createRouter,
  type RouteLocationRaw,
  type Router,
  RouterLink,
} from 'vue-router'
import BLink from './BLink.vue'
import BButton from '../BButton/BButton.vue'
import BNavItem from '../BNav/BNavItem.vue'

enableAutoUnmount(afterEach)

const page = {template: '<div />'}
const makeRouter = async (base?: string): Promise<Router> => {
  const router = createRouter({
    history: createMemoryHistory(base),
    routes: [
      {path: '/', component: page},
      {path: '/about', component: page},
      // A nested route: the parent link is active, but not exact, on the child page
      {
        path: '/users/:id',
        name: 'user',
        component: page,
        children: [{path: 'posts', component: page}],
      },
    ],
  })
  await router.push('/')
  await router.isReady()
  return router
}

/** No Vue warning (missing route, fragment root, extraneous attrs, ...) may show up */
const expectNoWarnings = (warn: ReturnType<typeof vi.spyOn>) => {
  expect(warn.mock.calls.map((call) => String(call[0]))).toEqual([])
}

describe('link with vue-router', () => {
  let router: Router
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(async () => {
    router = await makeRouter()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  const mountLink = (props: Record<string, unknown>, attrs: Record<string, unknown> = {}) =>
    mount(BLink, {props, attrs, slots: {default: 'Link'}, global: {plugins: [router]}})

  it('renders one anchor through RouterLink in custom mode', () => {
    const wrapper = mountLink({to: '/about'})
    expect(wrapper.findComponent(RouterLink).exists()).toBe(true)
    expect(wrapper.findComponent(RouterLink).props('custom')).toBe(true)
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.text()).toBe('Link')
    expect(wrapper.attributes('href')).toBe('/about')
    // Only real attributes reach the DOM
    expect(wrapper.attributes('to')).toBeUndefined()
    expect(wrapper.attributes('custom')).toBeUndefined()
    expect(wrapper.attributes('replace')).toBeUndefined()
    expectNoWarnings(warn)
  })

  it('takes href from the router: named routes, params, query, hash and the base path', async () => {
    const wrapper = mountLink({
      to: {name: 'user', params: {id: '7'}, query: {tab: 'a b', page: '2'}, hash: '#top'},
    })
    expect(wrapper.attributes('href')).toBe('/users/7?tab=a+b&page=2#top')

    const based = await makeRouter('/app/')
    const withBase = mount(BLink, {props: {to: '/about'}, global: {plugins: [based]}})
    expect(withBase.attributes('href')).toBe('/app/about')
  })

  it('prefers to over href when a router renders the link', () => {
    const wrapper = mountLink({to: '/about', href: '/elsewhere'})
    expect(wrapper.attributes('href')).toBe('/about')
  })

  it('applies the active classes and aria-current from the slot state', async () => {
    const parent = mountLink({to: '/users/7'})
    const exact = mountLink({to: '/users/7/posts'})
    expect(parent.classes()).not.toContain('router-link-active')

    await router.push('/users/7/posts')
    await nextTick()
    expect(parent.classes()).toContain('router-link-active')
    expect(parent.classes()).not.toContain('router-link-exact-active')
    expect(parent.attributes('aria-current')).toBeUndefined()
    expect(exact.classes()).toEqual(
      expect.arrayContaining(['router-link-active', 'router-link-exact-active'])
    )
    expect(exact.attributes('aria-current')).toBe('page')
    // Each class once: the router component does not add its own copy
    expect(exact.classes().filter((name) => name === 'router-link-active')).toHaveLength(1)

    await router.push('/')
    await nextTick()
    expect(exact.classes()).not.toContain('router-link-active')
    expect(exact.attributes('aria-current')).toBeUndefined()
  })

  it('uses activeClass and exactActiveClass', async () => {
    const wrapper = mountLink({to: '/about', activeClass: 'on', exactActiveClass: 'exactly-on'})
    await router.push('/about')
    await nextTick()
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['on', 'exactly-on']))
    expect(wrapper.classes()).not.toContain('router-link-active')
  })

  it('navigates on click and emits click', async () => {
    const wrapper = mountLink({to: '/about'})
    await wrapper.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/about')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('replaces instead of pushing with replace', async () => {
    const replace = vi.spyOn(router, 'replace')
    const push = vi.spyOn(router, 'push')
    const wrapper = mountLink({to: '/about', replace: true})
    await wrapper.trigger('click')
    await flushPromises()
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('does not navigate when a click listener prevents the event', async () => {
    const wrapper = mountLink({to: '/about', onClick: (e: MouseEvent) => e.preventDefault()})
    await wrapper.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('leaves modified clicks to the browser', async () => {
    const wrapper = mountLink({to: '/about'})
    await wrapper.trigger('click', {ctrlKey: true})
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('a disabled link is a plain anchor that keeps its resolved href and does not navigate', async () => {
    const wrapper = mountLink({to: {name: 'user', params: {id: '7'}}, disabled: true})
    expect(wrapper.findComponent(RouterLink).exists()).toBe(false)
    expect(wrapper.attributes('href')).toBe('/users/7')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    await wrapper.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('switches between the router and the plain anchor when disabled changes', async () => {
    const wrapper = mountLink({to: '/about', disabled: true})
    await wrapper.setProps({disabled: false})
    expect(wrapper.findComponent(RouterLink).exists()).toBe(true)
    expect(wrapper.element.tagName).toBe('A')
    await wrapper.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/about')
  })

  it.each(['https://example.com/x', '//example.com/x', 'mailto:a@example.com'])(
    'renders the external URL %s as a plain anchor, without asking the router',
    (to) => {
      const wrapper = mountLink({to})
      expect(wrapper.findComponent(RouterLink).exists()).toBe(false)
      expect(wrapper.attributes('href')).toBe(to)
      expectNoWarnings(warn)
    }
  )

  it('does not involve the router for href-only links', async () => {
    const wrapper = mountLink({href: '/about'})
    expect(wrapper.findComponent(RouterLink).exists()).toBe(false)
    await wrapper.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('puts class, style, attributes and the link attributes on the anchor', () => {
    const wrapper = mountLink(
      {to: '/about', target: '_blank', rel: 'nofollow', stretched: true, color: {theme: 'primary'}},
      {'class': 'mine', 'style': 'color: red', 'data-x': '1', 'id': 'the-link', 'tabindex': '3'}
    )
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['mine', 'stretched-link', 'theme-primary'])
    )
    expect(wrapper.attributes()).toMatchObject({
      'style': 'color: red;',
      'data-x': '1',
      'id': 'the-link',
      'tabindex': '3',
      'target': '_blank',
      'rel': 'nofollow',
      'href': '/about',
    })
    expectNoWarnings(warn)
  })

  it('a directive on BLink reaches the anchor (single root, not a fragment)', () => {
    const mounted = vi.fn<(el: Element) => void>()
    const vProbe: Directive = {mounted}
    const wrapper = mount(
      defineComponent({
        components: {BLink},
        directives: {probe: vProbe},
        template: '<BLink v-probe to="/about">Link</BLink>',
      }),
      {global: {plugins: [router]}}
    )
    expect(mounted).toHaveBeenCalledTimes(1)
    expect(mounted.mock.calls[0]?.[0]).toBe(wrapper.get('a').element)
    expectNoWarnings(warn)
  })

  it('components that render BLink as their root stay single-root with a router', async () => {
    const mounted = vi.fn<(el: Element) => void>()
    const vProbe: Directive = {mounted}
    const wrapper = mount(
      defineComponent({
        components: {BButton, BNavItem},
        directives: {probe: vProbe},
        template: `<div>
          <BButton v-probe id="button" to="/about" variant="primary">Button</BButton>
          <ul><BNavItem to="/about" :link-attrs="{id: 'nav'}">Nav</BNavItem></ul>
        </div>`,
      }),
      {global: {plugins: [router]}}
    )
    const button = wrapper.get('#button')
    expect(button.element.tagName).toBe('A')
    expect(button.classes()).toEqual(expect.arrayContaining(['btn', 'btn-primary']))
    expect(button.attributes('href')).toBe('/about')
    expect(mounted.mock.calls[0]?.[0]).toBe(button.element)
    expect(wrapper.get('#nav').classes()).toContain('nav-link')
    await wrapper.get('#nav').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/about')
    await nextTick()
    expect(wrapper.get('#nav').classes()).toContain('router-link-active')
    expectNoWarnings(warn)
  })

  it('follows a reactive to', async () => {
    const wrapper = mountLink({to: '/about'})
    await wrapper.setProps({to: {name: 'user', params: {id: '3'}}})
    expect(wrapper.attributes('href')).toBe('/users/3')
  })
})

/**
 * A stand-in with the shape of Nuxt's NuxtLink in `custom` mode: a static `useLink`, the
 * prefetch props, plain route links delegated to RouterLink, and the slot props NuxtLink adds
 * (`prefetch`, `prefetched`, `shouldPrefetch`). The real component is covered by the Nuxt module's
 * e2e tests.
 */
const makeNuxtLink = () => {
  const prefetch = vi.fn<() => void>()
  const received = ref<Record<string, unknown>>({})
  const NuxtLink = defineComponent({
    name: 'NuxtLink',
    inheritAttrs: false,
    props: {
      to: {type: [String, Object] as PropType<RouteLocationRaw>, default: undefined},
      href: {type: [String, Object] as PropType<RouteLocationRaw>, default: undefined},
      replace: {type: Boolean, default: undefined},
      custom: {type: Boolean, default: undefined},
      prefetch: {type: Boolean, default: undefined},
      noPrefetch: {type: Boolean, default: undefined},
      prefetchOn: {type: Object as PropType<Record<string, boolean>>, default: undefined},
      prefetchedClass: {type: String, default: undefined},
    },
    setup(props, {slots, attrs}) {
      const prefetched = ref(false)
      const shouldPrefetch = (mode: 'visibility' | 'interaction') =>
        !prefetched.value &&
        props.prefetch !== false &&
        props.noPrefetch !== true &&
        (props.prefetchOn?.[mode] ?? mode === 'visibility')
      const run = () => {
        prefetched.value = true
        prefetch()
      }
      const extras = computed(() => ({prefetch: run, prefetched: prefetched.value, shouldPrefetch}))
      return () => {
        received.value = {...props, ...attrs}
        return h(
          resolveComponent('RouterLink'),
          {to: props.to, replace: props.replace, custom: true},
          {default: (link: Record<string, unknown>) => slots.default?.({...link, ...extras.value})}
        )
      }
    },
  })
  return {NuxtLink: Object.assign(NuxtLink, {useLink: () => ({})}), prefetch, received}
}

describe('link with NuxtLink', () => {
  let router: Router
  let warn: ReturnType<typeof vi.spyOn>
  let intersect: (isIntersecting: boolean) => void
  let observed: Element[]
  beforeEach(async () => {
    router = await makeRouter()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    observed = []
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: (entries: {isIntersecting: boolean}[]) => void) {
          intersect = (isIntersecting) => callback([{isIntersecting}])
        }
        observe(el: Element) {
          observed.push(el)
        }
        disconnect() {}
        unobserve() {}
      }
    )
  })
  afterEach(() => {
    warn.mockRestore()
    vi.unstubAllGlobals()
  })

  const mountNuxt = (props: Record<string, unknown>) => {
    const nuxt = makeNuxtLink()
    const wrapper = mount(BLink, {
      props: {routerComponentName: 'NuxtLink', ...props},
      slots: {default: 'Link'},
      attachTo: document.body,
      global: {plugins: [router], components: {NuxtLink: nuxt.NuxtLink}},
    })
    return {wrapper, ...nuxt}
  }

  it('renders one anchor through NuxtLink in custom mode and never passes it href', async () => {
    const {wrapper, received} = mountNuxt({to: '/about', href: '/ignored'})
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.findAll('a')).toHaveLength(1)
    expect(wrapper.attributes('href')).toBe('/about')
    expect(received.value.custom).toBe(true)
    expect(received.value.to).toBe('/about')
    // `to` and `href` together make NuxtLink warn
    expect(received.value.href).toBeUndefined()
    await wrapper.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/about')
    expectNoWarnings(warn)
  })

  it('prefetches when the link becomes visible', async () => {
    const {wrapper, prefetch} = mountNuxt({to: '/about', prefetchedClass: 'was-prefetched'})
    await nextTick()
    expect(observed).toEqual([wrapper.element])
    intersect(false)
    expect(prefetch).not.toHaveBeenCalled()
    intersect(true)
    expect(prefetch).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(wrapper.classes()).toContain('was-prefetched')
    // Once is enough
    intersect(true)
    expect(prefetch).toHaveBeenCalledTimes(1)
  })

  it('prefetches on pointer enter or focus with prefetchOn interaction', async () => {
    const {wrapper, prefetch} = mountNuxt({
      to: '/about',
      prefetchOn: {interaction: true, visibility: false},
    })
    await nextTick()
    intersect(true)
    expect(prefetch).not.toHaveBeenCalled()
    await wrapper.trigger('pointerenter')
    expect(prefetch).toHaveBeenCalledTimes(1)
    await wrapper.trigger('focus')
    expect(prefetch).toHaveBeenCalledTimes(1)
  })

  it('does not prefetch with prefetch false', async () => {
    const {wrapper, prefetch, received} = mountNuxt({
      to: '/about',
      prefetchOn: {interaction: true, visibility: true},
      prefetch: false,
    })
    await nextTick()
    intersect(true)
    await wrapper.trigger('pointerenter')
    expect(prefetch).not.toHaveBeenCalled()
    expect(received.value.prefetch).toBe(false)
  })

  it.each([
    ['a target', {to: '/about', target: '_blank'}, '/about'],
    // Resolved against the current route, which is `/` here
    ['a hash-only to', {to: '#section'}, '/#section'],
    ['an external to', {to: 'https://example.com'}, 'https://example.com'],
  ])('renders a plain anchor for %s, where NuxtLink would return a fragment', (_, props, href) => {
    const {wrapper, received} = mountNuxt(props)
    expect(received.value).toEqual({})
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe(href)
    expect(observed).toEqual([])
  })

  it('does not observe links outside Nuxt', async () => {
    mount(BLink, {props: {to: '/about'}, global: {plugins: [router]}})
    await nextTick()
    expect(observed).toEqual([])
  })
})

describe('link without a router (plain anchor, also VitePress)', () => {
  let warn: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  it('renders to as href and leaves the click alone', async () => {
    // VitePress has no link component: its router picks up clicks on any same-origin <a href>
    // that nobody prevented, so this is all it needs
    const wrapper = mount(BLink, {props: {to: '/guide/'}, attachTo: document.body})
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/guide/')
    const event = new MouseEvent('click', {bubbles: true, cancelable: true})
    wrapper.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.emitted('click')).toHaveLength(1)
    expectNoWarnings(warn)
  })

  it('prevents the click of a disabled link, so nothing navigates', () => {
    const wrapper = mount(BLink, {props: {to: '/guide/', disabled: true}, attachTo: document.body})
    const event = new MouseEvent('click', {bubbles: true, cancelable: true})
    wrapper.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('prefers href over to', () => {
    const wrapper = mount(BLink, {props: {to: '/to', href: '/href'}})
    expect(wrapper.attributes('href')).toBe('/href')
  })

  it('builds href from a path object, with an encoded query and the hash', () => {
    const wrapper = mount(BLink, {
      props: {to: {path: '/search', query: {q: 'a b&c', page: '2'}, hash: 'top'}},
    })
    expect(wrapper.attributes('href')).toBe('/search?q=a%20b%26c&page=2#top')
  })

  it('renders # and warns for a named route, which only a router can resolve', () => {
    const wrapper = mount(BLink, {props: {to: {name: 'user', params: {id: '7'}}}})
    expect(wrapper.attributes('href')).toBe('#')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[1])).toContain('named route')
  })

  it('ignores a router component name that is not registered', () => {
    const wrapper = mount(BLink, {props: {to: '/x', routerComponentName: 'NuxtLink'}})
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/x')
  })
})
