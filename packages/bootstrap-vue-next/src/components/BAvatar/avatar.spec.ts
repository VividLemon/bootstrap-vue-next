import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BAvatar from './BAvatar.vue'
import {h} from 'vue'

describe('avatar', () => {
  enableAutoUnmount(afterEach)

  describe('rendering', () => {
    it('renders a span with static class avatar', () => {
      const wrapper = mount(BAvatar)
      expect(wrapper.element.tagName).toBe('SPAN')
      expect(wrapper.classes()).toContain('avatar')
    })

    it('does not render v5 library classes', () => {
      const wrapper = mount(BAvatar, {props: {text: 'AB'}})
      expect(wrapper.html()).not.toContain('b-avatar')
      expect(wrapper.classes()).not.toContain('badge')
      expect(wrapper.classes()).not.toContain('rounded-circle')
    })

    it('renders nothing inside by default', () => {
      const wrapper = mount(BAvatar)
      expect(wrapper.element.children).toHaveLength(0)
      expect(wrapper.text()).toBe('')
    })

    it('has no theme class by default', () => {
      const wrapper = mount(BAvatar)
      expect(wrapper.classes().some((c) => c.startsWith('theme-'))).toBe(false)
    })

    it('has no inline style by default', () => {
      const wrapper = mount(BAvatar)
      expect(wrapper.attributes('style')).toBeUndefined()
    })
  })

  describe('content', () => {
    it('renders img.avatar-img when src is set', () => {
      const wrapper = mount(BAvatar, {props: {src: '/a.png'}})
      const img = wrapper.get('img')
      expect(img.classes()).toContain('avatar-img')
      expect(img.attributes('src')).toBe('/a.png')
      expect(img.attributes('alt')).toBe('avatar')
    })

    it('uses the alt prop', () => {
      const wrapper = mount(BAvatar, {props: {src: '/a.png', alt: 'mdo'}})
      expect(wrapper.get('img').attributes('alt')).toBe('mdo')
    })

    it('renders text directly inside .avatar', () => {
      const wrapper = mount(BAvatar, {props: {text: 'BV'}})
      expect(wrapper.text()).toBe('BV')
      expect(wrapper.find('span span').exists()).toBe(false)
    })

    it('src takes precedence over text', () => {
      const wrapper = mount(BAvatar, {props: {src: '/a.png', text: 'BV'}})
      expect(wrapper.find('img').exists()).toBe(true)
      expect(wrapper.text()).toBe('')
    })

    it('default slot takes precedence over src and text', () => {
      const wrapper = mount(BAvatar, {
        props: {src: '/a.png', text: 'BV'},
        slots: {default: () => h('i', {class: 'icon'})},
      })
      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.find('i.icon').exists()).toBe(true)
      expect(wrapper.text()).toBe('')
    })

    it('falls back to text and emits img-error when the image fails', async () => {
      const wrapper = mount(BAvatar, {props: {src: '/bad.png', text: 'BV'}})
      await wrapper.get('img').trigger('error')
      expect(wrapper.emitted('img-error')).toHaveLength(1)
      expect(wrapper.emitted('img-error')?.[0]?.[0]).toBeInstanceOf(Event)
      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.text()).toBe('BV')
    })

    it('renders a new image when src changes after an error', async () => {
      const wrapper = mount(BAvatar, {props: {src: '/bad.png'}})
      await wrapper.get('img').trigger('error')
      expect(wrapper.find('img').exists()).toBe(false)
      await wrapper.setProps({src: '/good.png'})
      expect(wrapper.get('img').attributes('src')).toBe('/good.png')
    })
  })

  describe('size', () => {
    it.each(['xs', 'sm', 'lg', 'xl'] as const)('size %s adds class avatar-%s', (size) => {
      const wrapper = mount(BAvatar, {props: {size}})
      expect(wrapper.classes()).toContain(`avatar-${size}`)
      expect(wrapper.attributes('style')).toBeUndefined()
    })

    it('size md adds no class', () => {
      const wrapper = mount(BAvatar, {props: {size: 'md'}})
      expect(wrapper.classes()).not.toContain('avatar-md')
      expect(wrapper.attributes('style')).toBeUndefined()
    })

    it('numeric size sets --bs-avatar-size in px', () => {
      const wrapper = mount(BAvatar, {props: {size: 64}})
      expect(wrapper.attributes('style')).toContain('--bs-avatar-size: 64px')
    })

    it('custom string size sets --bs-avatar-size as is', () => {
      const wrapper = mount(BAvatar, {props: {size: '5rem'}})
      expect(wrapper.attributes('style')).toContain('--bs-avatar-size: 5rem')
    })

    it('does not set inline width or height', () => {
      const wrapper = mount(BAvatar, {props: {size: '5rem'}})
      expect(wrapper.attributes('style')).not.toContain('width')
      expect(wrapper.attributes('style')).not.toContain('height')
    })
  })

  describe('color and variant', () => {
    it('color theme adds theme class', () => {
      const wrapper = mount(BAvatar, {props: {color: {theme: 'primary'}}})
      expect(wrapper.classes()).toContain('theme-primary')
    })

    it('color bg and fg add utility classes', () => {
      const wrapper = mount(BAvatar, {props: {color: {bg: 'subtle-primary', fg: 'primary'}}})
      expect(wrapper.classes()).toContain('bg-subtle-primary')
      expect(wrapper.classes()).toContain('fg-primary')
    })

    it('variant subtle adds avatar-subtle', () => {
      const wrapper = mount(BAvatar, {props: {variant: 'subtle'}})
      expect(wrapper.classes()).toContain('avatar-subtle')
    })

    it('variant null adds no variant class', () => {
      const wrapper = mount(BAvatar, {props: {variant: null}})
      expect(wrapper.classes()).toEqual(['avatar'])
    })
  })

  describe('status', () => {
    it('does not render a status by default', () => {
      const wrapper = mount(BAvatar)
      expect(wrapper.find('.avatar-status').exists()).toBe(false)
    })

    it.each(['online', 'offline', 'busy', 'away'] as const)('renders status %s', (status) => {
      const wrapper = mount(BAvatar, {props: {status}})
      const el = wrapper.get('.avatar-status')
      expect(el.element.tagName).toBe('SPAN')
      expect(el.classes()).toContain(`status-${status}`)
      expect(el.attributes('role')).toBe('img')
      expect(el.attributes('aria-label')).toBe(
        `${status.charAt(0).toUpperCase()}${status.slice(1)}`
      )
    })

    it('statusLabel overrides the label', () => {
      const wrapper = mount(BAvatar, {props: {status: 'busy', statusLabel: 'Beschäftigt'}})
      expect(wrapper.get('.avatar-status').attributes('aria-label')).toBe('Beschäftigt')
    })

    it('status renders after the content', () => {
      const wrapper = mount(BAvatar, {props: {src: '/a.png', status: 'online'}})
      const children = Array.from(wrapper.element.children)
      expect(children[0]?.tagName).toBe('IMG')
      expect(children[1]?.classList.contains('avatar-status')).toBe(true)
    })

    it('status renders with a default slot', () => {
      const wrapper = mount(BAvatar, {
        props: {status: 'away'},
        slots: {default: 'X'},
      })
      expect(wrapper.find('.avatar-status').exists()).toBe(true)
    })
  })

  describe('attrs', () => {
    it('passes attrs and classes to the root', () => {
      const wrapper = mount(BAvatar, {attrs: {'aria-label': 'User', 'class': 'foo'}})
      expect(wrapper.attributes('aria-label')).toBe('User')
      expect(wrapper.classes()).toContain('foo')
      expect(wrapper.classes()).toContain('avatar')
    })
  })
})
