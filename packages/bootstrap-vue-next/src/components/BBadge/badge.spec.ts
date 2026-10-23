import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BBadge from './BBadge.vue'
import BLink from '../BLink/BLink.vue'

describe('badge', () => {
  enableAutoUnmount(afterEach)

  describe('rendering', () => {
    it('has static class badge', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).toContain('badge')
    })

    it('renders default slot content', () => {
      const wrapper = mount(BBadge, {slots: {default: 'badge text'}})
      expect(wrapper.text()).toBe('badge text')
    })

    it('renders HTML content in default slot', () => {
      const wrapper = mount(BBadge, {slots: {default: '<strong>bold</strong>'}})
      expect(wrapper.find('strong').text()).toBe('bold')
    })

    it('renders empty when no slot content', () => {
      expect(mount(BBadge).text()).toBe('')
    })
  })

  describe('tag', () => {
    it('is span by default', () => {
      expect(mount(BBadge).element.tagName).toBe('SPAN')
    })

    it('renders a reactive custom tag', async () => {
      const wrapper = mount(BBadge, {props: {tag: 'div'}})
      expect(wrapper.element.tagName).toBe('DIV')
      await wrapper.setProps({tag: 'h1'})
      expect(wrapper.element.tagName).toBe('H1')
      expect(wrapper.classes()).toContain('badge')
    })
  })

  describe('link behavior', () => {
    it.each([{href: '/abc'}, {to: '/abc'}])('renders as BLink when link prop is set', (props) => {
      expect(mount(BBadge, {props}).findComponent(BLink).exists()).toBe(true)
    })

    it('does not render as BLink by default', () => {
      expect(mount(BBadge).findComponent(BLink).exists()).toBe(false)
    })

    it('renders as BLink even when tag prop is also set', () => {
      const wrapper = mount(BBadge, {props: {href: '/abc', tag: 'div'}})
      expect(wrapper.findComponent(BLink).exists()).toBe(true)
      expect(wrapper.element.tagName).toBe('A')
    })

    it('applies text-decoration-none only while rendered as a link', async () => {
      const wrapper = mount(BBadge, {props: {href: '/abc'}})
      expect(wrapper.classes()).toContain('text-decoration-none')
      await wrapper.setProps({href: undefined})
      expect(wrapper.classes()).not.toContain('text-decoration-none')
    })

    it('passes link props to BLink', () => {
      const wrapper = mount(BBadge, {
        props: {
          href: '/test',
          rel: 'noopener',
          target: '_blank',
          active: true,
          disabled: true,
          opacity: '75',
          opacityHover: '100',
        },
      })
      const link = wrapper.getComponent(BLink)
      expect(link.props()).toMatchObject({
        href: '/test',
        rel: 'noopener',
        target: '_blank',
        active: true,
        disabled: true,
        opacity: '75',
        opacityHover: '100',
      })
    })

    it('passes router props to BLink', () => {
      const wrapper = mount(BBadge, {props: {to: '/test', replace: true, stretched: true}})
      expect(wrapper.getComponent(BLink).props()).toMatchObject({
        to: '/test',
        replace: true,
        stretched: true,
      })
    })
  })

  describe('variant classes', () => {
    it('has class text-bg-secondary by default', () => {
      expect(mount(BBadge).classes()).toContain('text-bg-secondary')
    })

    it('updates text-bg-{type} when prop variant changes', async () => {
      const wrapper = mount(BBadge, {props: {variant: 'primary'}})
      expect(wrapper.classes()).toContain('text-bg-primary')
      await wrapper.setProps({variant: 'danger'})
      expect(wrapper.classes()).toContain('text-bg-danger')
      expect(wrapper.classes()).not.toContain('text-bg-primary')
    })

    it('does not have text-bg class when variant is null', () => {
      const wrapper = mount(BBadge, {props: {variant: null}})
      expect(wrapper.classes().some((className) => className.startsWith('text-bg-'))).toBe(false)
    })

    it('applies text and background variant classes', async () => {
      const wrapper = mount(BBadge, {props: {textVariant: 'white', bgVariant: 'primary'}})
      expect(wrapper.classes()).toContain('text-white')
      expect(wrapper.classes()).toContain('bg-primary')
      await wrapper.setProps({textVariant: 'dark', bgVariant: 'warning'})
      expect(wrapper.classes()).toContain('text-dark')
      expect(wrapper.classes()).toContain('bg-warning')
      expect(wrapper.classes()).not.toContain('text-white')
      expect(wrapper.classes()).not.toContain('bg-primary')
    })

    it('can combine variant, textVariant, and bgVariant', () => {
      const wrapper = mount(BBadge, {
        props: {variant: 'primary', textVariant: 'white', bgVariant: 'dark'},
      })
      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['badge', 'text-bg-primary', 'text-white', 'bg-dark'])
      )
    })
  })

  describe('active and disabled', () => {
    it('reactively applies active and disabled classes', async () => {
      const wrapper = mount(BBadge, {props: {active: true, disabled: true}})
      expect(wrapper.classes()).toEqual(expect.arrayContaining(['active', 'disabled']))
      await wrapper.setProps({active: false, disabled: false})
      expect(wrapper.classes()).not.toContain('active')
      expect(wrapper.classes()).not.toContain('disabled')
    })

    it('does not have active or disabled classes by default', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).not.toContain('active')
      expect(wrapper.classes()).not.toContain('disabled')
    })
  })

  describe('Bootstrap utility classes', () => {
    it('does not add pill, positioning, or dot-indicator styles itself', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).not.toContain('rounded-pill')
      expect(wrapper.classes()).not.toContain('position-absolute')
      expect(wrapper.classes()).not.toContain('rounded-circle')
    })

    it('forwards utility classes supplied by the consumer', () => {
      const wrapper = mount(BBadge, {
        attrs: {class: 'rounded-pill position-absolute top-0 start-100 translate-middle'},
      })
      expect(wrapper.classes()).toEqual(
        expect.arrayContaining([
          'rounded-pill',
          'position-absolute',
          'top-0',
          'start-100',
          'translate-middle',
        ])
      )
    })
  })
})
