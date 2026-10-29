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
      const wrapper = mount(BBadge, {
        slots: {default: 'badge text'},
      })
      expect(wrapper.text()).toBe('badge text')
    })

    it('renders HTML content in default slot', () => {
      const wrapper = mount(BBadge, {
        slots: {default: '<strong>bold</strong>'},
      })
      expect(wrapper.find('strong').exists()).toBe(true)
      expect(wrapper.find('strong').text()).toBe('bold')
    })

    it('renders empty when no slot content', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.text()).toBe('')
    })
  })

  describe('tag', () => {
    it('is span by default', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('renders custom tag from prop', () => {
      const wrapper = mount(BBadge, {
        props: {tag: 'div'},
      })
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('tag prop is reactive', async () => {
      const wrapper = mount(BBadge, {
        props: {tag: 'div'},
      })
      expect(wrapper.element.tagName).toBe('DIV')
      await wrapper.setProps({tag: 'h1'})
      expect(wrapper.element.tagName).toBe('H1')
    })

    it('retains badge class when tag changes', async () => {
      const wrapper = mount(BBadge, {
        props: {tag: 'div'},
      })
      expect(wrapper.classes()).toContain('badge')
      await wrapper.setProps({tag: 'h1'})
      expect(wrapper.classes()).toContain('badge')
    })
  })

  describe('link behavior', () => {
    it('renders as BLink when prop to is set', () => {
      const wrapper = mount(BBadge, {
        props: {to: '/abc'},
      })
      const $blink = wrapper.findComponent(BLink)
      expect($blink.exists()).toBe(true)
    })

    it('renders as BLink when prop href is set', () => {
      const wrapper = mount(BBadge, {
        props: {href: '/abc'},
      })
      const $blink = wrapper.findComponent(BLink)
      expect($blink.exists()).toBe(true)
    })

    it('does not render as BLink by default', () => {
      const wrapper = mount(BBadge)
      const $blink = wrapper.findComponent(BLink)
      expect($blink.exists()).toBe(false)
    })

    it('renders as BLink even when tag prop is also set', () => {
      const wrapper = mount(BBadge, {
        props: {href: '/abc', tag: 'div'},
      })
      const $blink = wrapper.findComponent(BLink)
      expect($blink.exists()).toBe(true)
      expect(wrapper.element.tagName).toBe('A')
    })

    it('renders as a element when href is set', () => {
      const wrapper = mount(BBadge, {
        props: {href: '/abc'},
      })
      expect(wrapper.element.tagName).toBe('A')
    })

    it('has class text-decoration-none when prop to is set', async () => {
      const wrapper = mount(BBadge, {
        props: {to: '/abc'},
      })
      expect(wrapper.classes()).toContain('text-decoration-none')
      await wrapper.setProps({to: undefined})
      expect(wrapper.classes()).not.toContain('text-decoration-none')
    })

    it('has class text-decoration-none when prop href is set', async () => {
      const wrapper = mount(BBadge, {
        props: {href: '/abc'},
      })
      expect(wrapper.classes()).toContain('text-decoration-none')
      await wrapper.setProps({href: undefined})
      expect(wrapper.classes()).not.toContain('text-decoration-none')
    })

    it('does not have class text-decoration-none when not a link', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).not.toContain('text-decoration-none')
    })

    it('passes href prop to BLink', () => {
      const wrapper = mount(BBadge, {
        props: {href: '/test'},
      })
      const $blink = wrapper.findComponent(BLink)
      expect($blink.props('href')).toBe('/test')
    })

    it('passes to prop to BLink', () => {
      const wrapper = mount(BBadge, {
        props: {to: '/test'},
      })
      const $blink = wrapper.findComponent(BLink)
      expect($blink.props('to')).toBe('/test')
    })

    it('passes rel prop to BLink', () => {
      const wrapper = mount(BBadge, {
        props: {href: '/abc', rel: 'noopener'},
      })
      const $blink = wrapper.findComponent(BLink)
      expect($blink.props('rel')).toBe('noopener')
    })

    it('passes target prop to BLink', () => {
      const wrapper = mount(BBadge, {
        props: {href: '/abc', target: '_blank'},
      })
      const $blink = wrapper.findComponent(BLink)
      expect($blink.props('target')).toBe('_blank')
    })

    it.each([
      {name: 'active', props: {href: '/abc', active: true}, expected: true},
      {name: 'disabled', props: {href: '/abc', disabled: true}, expected: true},
      {name: 'replace', props: {to: '/abc', replace: true}, expected: true},
      {name: 'stretched', props: {href: '/abc', stretched: true}, expected: true},
      {name: 'opacity', props: {href: '/abc', opacity: '70'}, expected: '70'},
      {name: 'opacityHover', props: {href: '/abc', opacityHover: '100'}, expected: '100'},
    ] as const)('passes $name prop to BLink', ({name, props, expected}) => {
      const wrapper = mount(BBadge, {
        props: {...props},
      })
      const $blink = wrapper.findComponent(BLink)
      expect($blink.props(name)).toBe(expected)
    })
  })

  describe('theme classes', () => {
    it('has class theme-secondary by default', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).toContain('theme-secondary')
    })

    it('has class theme-{type} when prop theme is set', async () => {
      const wrapper = mount(BBadge, {
        props: {theme: 'primary'},
      })
      expect(wrapper.classes()).toContain('theme-primary')
      await wrapper.setProps({theme: 'danger'})
      expect(wrapper.classes()).toContain('theme-danger')
      expect(wrapper.classes()).not.toContain('theme-primary')
    })

    it('does not have theme-{type} class when theme is null', () => {
      const wrapper = mount(BBadge, {
        props: {theme: null},
      })
      expect(wrapper.classes().some((c) => c.startsWith('theme-'))).toBe(false)
    })

    it('has class fg-{type} when prop fg is set', async () => {
      const wrapper = mount(BBadge, {
        props: {fg: 'white'},
      })
      expect(wrapper.classes()).toContain('fg-white')
      await wrapper.setProps({fg: 'black'})
      expect(wrapper.classes()).toContain('fg-black')
      expect(wrapper.classes()).not.toContain('fg-white')
    })

    it('does not have fg-{type} class when fg is null', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes().some((c) => c.startsWith('fg-'))).toBe(false)
    })

    it('has class bg-{type} when prop bg is set', async () => {
      const wrapper = mount(BBadge, {
        props: {bg: 'primary'},
      })
      expect(wrapper.classes()).toContain('bg-primary')
      await wrapper.setProps({bg: 'subtle-warning'})
      expect(wrapper.classes()).toContain('bg-subtle-warning')
      expect(wrapper.classes()).not.toContain('bg-primary')
    })

    it('does not have bg-{type} class when bg is null', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes().some((c) => c.startsWith('bg-'))).toBe(false)
    })

    // Tests that all color classes are applied; CSS precedence is handled by Bootstrap
    it('can combine theme with fg and bg', () => {
      const wrapper = mount(BBadge, {
        props: {theme: 'primary', fg: 'white', bg: 'black'},
      })
      expect(wrapper.classes()).toContain('theme-primary')
      expect(wrapper.classes()).toContain('fg-white')
      expect(wrapper.classes()).toContain('bg-black')
    })

    it('retains badge class with all color combinations', () => {
      const wrapper = mount(BBadge, {
        props: {theme: 'primary', fg: 'white', bg: 'black'},
      })
      expect(wrapper.classes()).toContain('badge')
    })
  })

  describe('active and disabled', () => {
    it('has class active when prop active is true', async () => {
      const wrapper = mount(BBadge, {
        props: {active: true},
      })
      expect(wrapper.classes()).toContain('active')
      await wrapper.setProps({active: false})
      expect(wrapper.classes()).not.toContain('active')
    })

    it('does not have class active by default', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).not.toContain('active')
    })

    it('has class disabled when prop disabled is true', async () => {
      const wrapper = mount(BBadge, {
        props: {disabled: true},
      })
      expect(wrapper.classes()).toContain('disabled')
      await wrapper.setProps({disabled: false})
      expect(wrapper.classes()).not.toContain('disabled')
    })

    it('does not have class disabled by default', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).not.toContain('disabled')
    })
  })

  describe('pill', () => {
    it('has class rounded-pill when prop pill is true', async () => {
      const wrapper = mount(BBadge, {
        props: {pill: true},
      })
      expect(wrapper.classes()).toContain('rounded-pill')
      await wrapper.setProps({pill: false})
      expect(wrapper.classes()).not.toContain('rounded-pill')
    })

    it('does not have class rounded-pill by default', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).not.toContain('rounded-pill')
    })
  })

  describe('dotIndicator', () => {
    it('has dot indicator classes when dotIndicator is true', () => {
      const wrapper = mount(BBadge, {
        props: {dotIndicator: true},
      })
      expect(wrapper.classes()).toContain('p-2')
      expect(wrapper.classes()).toContain('border')
      expect(wrapper.classes()).toContain('border-bg')
      expect(wrapper.classes()).toContain('rounded-circle')
    })

    it('removes dot indicator classes when dotIndicator becomes false', async () => {
      const wrapper = mount(BBadge, {
        props: {dotIndicator: true},
      })
      expect(wrapper.classes()).toContain('p-2')
      await wrapper.setProps({dotIndicator: false})
      expect(wrapper.classes()).not.toContain('p-2')
      expect(wrapper.classes()).not.toContain('border')
      expect(wrapper.classes()).not.toContain('border-bg')
      expect(wrapper.classes()).not.toContain('rounded-circle')
    })

    it('does not have dot indicator classes by default', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).not.toContain('p-2')
      expect(wrapper.classes()).not.toContain('rounded-circle')
    })

    it('has position classes when dotIndicator is true', () => {
      const wrapper = mount(BBadge, {
        props: {dotIndicator: true},
      })
      expect(wrapper.classes()).toContain('position-absolute')
      expect(wrapper.classes()).toContain('translate-middle')
    })

    it('defaults to top-end placement when dotIndicator is true without placement', () => {
      const wrapper = mount(BBadge, {
        props: {dotIndicator: true},
      })
      expect(wrapper.classes()).toContain('start-100')
      expect(wrapper.classes()).toContain('top-0')
    })

    it('removes position classes when dotIndicator becomes false', async () => {
      const wrapper = mount(BBadge, {
        props: {dotIndicator: true},
      })
      expect(wrapper.classes()).toContain('position-absolute')
      await wrapper.setProps({dotIndicator: false})
      expect(wrapper.classes()).not.toContain('position-absolute')
      expect(wrapper.classes()).not.toContain('translate-middle')
    })

    it('wraps slot content in span with visually-hidden class', () => {
      const wrapper = mount(BBadge, {
        props: {dotIndicator: true},
        slots: {default: 'hidden text'},
      })
      const span = wrapper.find('span.visually-hidden')
      expect(span.exists()).toBe(true)
      expect(span.text()).toBe('hidden text')
    })

    it('does not wrap slot content when dotIndicator is false', () => {
      const wrapper = mount(BBadge, {
        slots: {default: 'visible text'},
      })
      const span = wrapper.find('span.visually-hidden')
      expect(span.exists()).toBe(false)
      expect(wrapper.text()).toBe('visible text')
    })

    it('uses explicit placement when both dotIndicator and placement are set', () => {
      const wrapper = mount(BBadge, {
        props: {dotIndicator: true, placement: 'bottom-start'},
      })
      expect(wrapper.classes()).toContain('start-0')
      expect(wrapper.classes()).toContain('top-100')
      expect(wrapper.classes()).not.toContain('start-100')
    })
  })

  describe('placement', () => {
    it('does not have position classes by default', () => {
      const wrapper = mount(BBadge)
      expect(wrapper.classes()).not.toContain('position-absolute')
      expect(wrapper.classes()).not.toContain('translate-middle')
    })

    it('has position-absolute and translate-middle when placement is set', () => {
      const wrapper = mount(BBadge, {
        props: {placement: 'top-end'},
      })
      expect(wrapper.classes()).toContain('position-absolute')
      expect(wrapper.classes()).toContain('translate-middle')
    })

    it.each([
      {placement: 'top-start', start: 'start-0', top: 'top-0'},
      {placement: 'start', start: 'start-0', top: 'top-50'},
      {placement: 'bottom-start', start: 'start-0', top: 'top-100'},
      {placement: 'top', start: 'start-50', top: 'top-0'},
      {placement: 'bottom', start: 'start-50', top: 'top-100'},
      {placement: 'top-end', start: 'start-100', top: 'top-0'},
      {placement: 'end', start: 'start-100', top: 'top-50'},
      {placement: 'bottom-end', start: 'start-100', top: 'top-100'},
    ] as const)('has correct classes for placement $placement', ({placement, start, top}) => {
      const wrapper = mount(BBadge, {
        props: {placement},
      })
      expect(wrapper.classes()).toContain(start)
      expect(wrapper.classes()).toContain(top)
    })

    it('placement is reactive', async () => {
      const wrapper = mount(BBadge, {
        props: {placement: 'top-start'},
      })
      expect(wrapper.classes()).toContain('start-0')
      expect(wrapper.classes()).toContain('top-0')
      await wrapper.setProps({placement: 'bottom-end'})
      expect(wrapper.classes()).toContain('start-100')
      expect(wrapper.classes()).toContain('top-100')
      expect(wrapper.classes()).not.toContain('start-0')
    })

    it('retains badge class with placement', () => {
      const wrapper = mount(BBadge, {
        props: {placement: 'top-end'},
      })
      expect(wrapper.classes()).toContain('badge')
    })
  })

  describe('combined props', () => {
    it('supports pill and theme together', () => {
      const wrapper = mount(BBadge, {
        props: {pill: true, theme: 'danger'},
      })
      expect(wrapper.classes()).toContain('rounded-pill')
      expect(wrapper.classes()).toContain('theme-danger')
      expect(wrapper.classes()).toContain('badge')
    })

    it('supports dotIndicator with theme', () => {
      const wrapper = mount(BBadge, {
        props: {dotIndicator: true, theme: 'danger'},
      })
      expect(wrapper.classes()).toContain('p-2')
      expect(wrapper.classes()).toContain('rounded-circle')
      expect(wrapper.classes()).toContain('theme-danger')
      expect(wrapper.classes()).toContain('position-absolute')
    })

    it('supports link with pill and theme', () => {
      const wrapper = mount(BBadge, {
        props: {href: '/abc', pill: true, theme: 'info'},
      })
      expect(wrapper.classes()).toContain('rounded-pill')
      expect(wrapper.classes()).toContain('theme-info')
      expect(wrapper.classes()).toContain('text-decoration-none')
      expect(wrapper.classes()).toContain('badge')
      const $blink = wrapper.findComponent(BLink)
      expect($blink.exists()).toBe(true)
    })

    it('supports placement with theme and pill', () => {
      const wrapper = mount(BBadge, {
        props: {placement: 'top-end', theme: 'primary', pill: true},
      })
      expect(wrapper.classes()).toContain('position-absolute')
      expect(wrapper.classes()).toContain('translate-middle')
      expect(wrapper.classes()).toContain('start-100')
      expect(wrapper.classes()).toContain('top-0')
      expect(wrapper.classes()).toContain('theme-primary')
      expect(wrapper.classes()).toContain('rounded-pill')
      expect(wrapper.classes()).toContain('badge')
    })
  })
})
