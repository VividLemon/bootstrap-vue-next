import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BLink from './BLink.vue'
import {createRouter, createWebHistory} from 'vue-router'
import {defineComponent, h, markRaw} from 'vue'

describe('link', () => {
  enableAutoUnmount(afterEach)

  const router = createRouter({
    history: createWebHistory(),
    routes: [],
  })

  it('has correct href when using just href', () => {
    const wrapper = mount(BLink, {
      props: {
        href: 'https://www.google.com',
      },
      global: {
        plugins: [router],
      },
    })
    expect(wrapper.attributes('href')).toBe('https://www.google.com')
  })

  it('has correct href when using just to', () => {
    const wrapper = mount(BLink, {
      props: {
        to: '/',
      },
      global: {
        plugins: [router],
      },
    })
    expect(wrapper.attributes('href')).toBe('/')
  })

  it('accepts custom component for routerComponentName', () => {
    // Create a mock router component
    const CustomRouterLink = defineComponent({
      name: 'CustomRouterLink',
      props: {
        to: {type: [String, Object], required: true},
      },
      setup(props, {slots}) {
        return () => h('a', {href: String(props.to)}, slots.default?.())
      },
    })

    const wrapper = mount(BLink, {
      props: {
        to: '/custom',
        routerComponentName: markRaw(CustomRouterLink),
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.attributes('href')).toBe('/custom')
  })

  it('renders NuxtLink when routerComponentName is set to "NuxtLink"', () => {
    // Mock NuxtLink component
    const NuxtLink = defineComponent({
      name: 'NuxtLink',
      props: {
        to: {type: [String, Object], required: true},
      },
      setup(props, {slots}) {
        return () => h('a', {'href': String(props.to), 'data-nuxt-link': 'true'}, slots.default?.())
      },
    })

    // Register NuxtLink globally
    const wrapper = mount(BLink, {
      props: {
        to: '/nuxt-page',
        routerComponentName: 'NuxtLink',
      },
      global: {
        plugins: [router],
        components: {
          NuxtLink,
        },
      },
    })

    expect(wrapper.attributes('href')).toBe('/nuxt-page')
    expect(wrapper.attributes('data-nuxt-link')).toBe('true')
  })

  it('does not apply router active class to href-only link when router is present', () => {
    const wrapper = mount(BLink, {
      props: {
        href: '/external-page',
      },
      global: {
        plugins: [router],
      },
    })
    expect(wrapper.classes()).not.toContain('router-link-active')
    expect(wrapper.classes()).not.toContain('router-link-exact-active')
  })

  it('does not call router navigate on click for href-only link', async () => {
    const wrapper = mount(BLink, {
      props: {
        href: 'https://www.example.com',
      },
      global: {
        plugins: [router],
      },
    })
    // The link should render as a plain <a> tag with the href
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('https://www.example.com')
  })

  it('passes prefetch props to custom router component', () => {
    const receivedProps = {} as Record<string, unknown>
    const CustomRouterLink = defineComponent({
      name: 'CustomRouterLink',
      props: {
        to: {type: [String, Object], required: true},
        custom: {type: Boolean, default: false},
        prefetch: {type: Boolean, default: undefined},
        noPrefetch: {type: Boolean, default: undefined},
        prefetchedClass: {type: String, default: undefined},
      },
      setup(props, {slots}) {
        Object.assign(receivedProps, {
          prefetch: props.prefetch,
          noPrefetch: props.noPrefetch,
          prefetchedClass: props.prefetchedClass,
        })
        return () => h('a', {href: String(props.to)}, slots.default?.())
      },
    })

    mount(BLink, {
      props: {
        to: '/test',
        routerComponentName: markRaw(CustomRouterLink),
        prefetch: false,
        prefetchedClass: 'my-prefetched',
      },
      global: {
        plugins: [router],
      },
    })

    expect(receivedProps.prefetch).toBe(false)
    expect(receivedProps.prefetchedClass).toBe('my-prefetched')
  })

  it('renders NuxtLink without custom mode in Nuxt environment', () => {
    const receivedProps = {} as Record<string, unknown>
    const MockNuxtLink = defineComponent({
      name: 'MockNuxtLink',
      props: {
        to: {type: [String, Object], required: true},
        prefetch: {type: Boolean, default: undefined},
        prefetchedClass: {type: String, default: undefined},
        custom: {type: Boolean, default: false},
      },
      setup(props, {slots}) {
        Object.assign(receivedProps, {
          prefetch: props.prefetch,
          prefetchedClass: props.prefetchedClass,
          custom: props.custom,
        })
        return () => h('a', {href: String(props.to)}, slots.default?.())
      },
    })

    const nuxtPlugin = {
      install(app: ReturnType<typeof import('vue').createApp>) {
        ;(app as unknown as Record<string, unknown>).$nuxt = {}
      },
    }

    mount(BLink, {
      props: {
        to: '/test',
        routerComponentName: markRaw(MockNuxtLink),
        prefetchedClass: 'is-prefetched',
      },
      global: {
        plugins: [router, nuxtPlugin],
      },
    })

    // NuxtLink should receive prefetchedClass and not be in custom mode
    expect(receivedProps.prefetchedClass).toBe('is-prefetched')
    expect(receivedProps.custom).toBe(false)
  })
})
