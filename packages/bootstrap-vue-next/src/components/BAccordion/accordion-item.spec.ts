import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {h, nextTick} from 'vue'
import {renderToString} from 'vue/server-renderer'
import BAccordionItem from './BAccordionItem.vue'

/** Simulates the browser toggling a `<details>` (click, keyboard, find-in-page, `name` exclusivity) */
const nativeToggle = async (el: Element, open: boolean) => {
  // happy-dom dispatches `toggle` synchronously when `open` changes (browsers do it async)
  ;(el as HTMLDetailsElement).open = open
  await nextTick()
}

describe('accordion-item', () => {
  enableAutoUnmount(afterEach)

  describe('markup', () => {
    it('renders details.accordion-item as root', () => {
      const wrapper = mount(BAccordionItem)
      expect(wrapper.element.tagName).toBe('DETAILS')
      expect(wrapper.classes()).toEqual(['accordion-item'])
    })

    it('renders summary.accordion-header and div.accordion-body', () => {
      const wrapper = mount(BAccordionItem, {props: {title: 'Title'}, slots: {default: 'Body'}})
      const summary = wrapper.get('summary')
      expect(summary.classes()).toEqual(['accordion-header'])
      expect(summary.text()).toBe('Title')
      expect(wrapper.get('div.accordion-body').text()).toBe('Body')
    })

    it('does not render v5 accordion markup', () => {
      const wrapper = mount(BAccordionItem, {props: {title: 'Title'}})
      const html = wrapper.html()
      expect(html).not.toContain('accordion-button')
      expect(html).not.toContain('accordion-collapse')
      expect(html).not.toContain('collapse')
      expect(html).not.toContain('aria-expanded')
      expect(html).not.toContain('aria-controls')
      expect(wrapper.find('h2').exists()).toBe(false)
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('renders the default icon with aria-hidden', () => {
      const wrapper = mount(BAccordionItem)
      const icon = wrapper.get('summary svg.accordion-icon')
      expect(icon.attributes('aria-hidden')).toBe('true')
    })

    it('title slot overrides title prop and receives open', () => {
      const wrapper = mount(BAccordionItem, {
        props: {title: 'Prop', modelValue: true},
        slots: {title: (p: {open: boolean}) => h('b', `Slot ${p.open}`)},
      })
      expect(wrapper.get('summary b').text()).toBe('Slot true')
      expect(wrapper.get('summary').text()).not.toContain('Prop')
    })

    it('icon slot replaces the default icon', () => {
      const wrapper = mount(BAccordionItem, {slots: {icon: () => h('i', {class: 'my-icon'})}})
      expect(wrapper.find('svg.accordion-icon').exists()).toBe(false)
      expect(wrapper.find('summary i.my-icon').exists()).toBe(true)
    })

    it('uses the id prop', () => {
      const wrapper = mount(BAccordionItem, {props: {id: 'foo'}})
      expect(wrapper.attributes('id')).toBe('foo')
    })

    it('generates an id when none is given', () => {
      const wrapper = mount(BAccordionItem)
      expect(wrapper.attributes('id')).toBeTruthy()
    })

    it('has no name outside an accordion', () => {
      const wrapper = mount(BAccordionItem)
      expect(wrapper.attributes('name')).toBeUndefined()
    })

    it('passes attrs to the details root', () => {
      const wrapper = mount(BAccordionItem, {attrs: {'class': 'foo', 'data-x': '1'}})
      expect(wrapper.classes()).toContain('foo')
      expect(wrapper.classes()).toContain('accordion-item')
      expect(wrapper.attributes('data-x')).toBe('1')
    })
  })

  describe('part attrs', () => {
    it('headerAttrs merge into the summary', () => {
      const wrapper = mount(BAccordionItem, {
        props: {headerAttrs: {'class': 'h-extra', 'data-h': 'y'}},
      })
      const summary = wrapper.get('summary')
      expect(summary.classes()).toEqual(['accordion-header', 'h-extra'])
      expect(summary.attributes('data-h')).toBe('y')
    })

    it('bodyAttrs merge into the body', () => {
      const wrapper = mount(BAccordionItem, {
        props: {bodyAttrs: {class: 'b-extra', style: 'color: red;'}},
      })
      const body = wrapper.get('.accordion-body')
      expect(body.classes()).toEqual(['accordion-body', 'b-extra'])
      expect(body.attributes('style')).toContain('color: red')
    })
  })

  describe('open state', () => {
    it('is closed by default', () => {
      const wrapper = mount(BAccordionItem)
      expect((wrapper.element as HTMLDetailsElement).open).toBe(false)
    })

    it('modelValue true opens the details', () => {
      const wrapper = mount(BAccordionItem, {props: {modelValue: true}})
      expect((wrapper.element as HTMLDetailsElement).open).toBe(true)
    })

    it('reacts to modelValue changes', async () => {
      const wrapper = mount(BAccordionItem, {props: {modelValue: false}})
      await wrapper.setProps({modelValue: true})
      expect((wrapper.element as HTMLDetailsElement).open).toBe(true)
      await wrapper.setProps({modelValue: false})
      expect((wrapper.element as HTMLDetailsElement).open).toBe(false)
    })

    it('syncs a native toggle into v-model and emits toggle', async () => {
      const wrapper = mount(BAccordionItem)
      await nativeToggle(wrapper.element, true)
      expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
      expect(wrapper.emitted('toggle')).toHaveLength(1)
      await nativeToggle(wrapper.element, false)
      expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
      expect(wrapper.emitted('toggle')).toHaveLength(2)
    })

    it('does not emit update:modelValue when the toggle matches the model', async () => {
      const wrapper = mount(BAccordionItem, {props: {modelValue: true}})
      wrapper.element.dispatchEvent(new Event('toggle'))
      await nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(wrapper.emitted('toggle')).toHaveLength(1)
    })

    it('does not emit show/hide lifecycle events', async () => {
      const wrapper = mount(BAccordionItem)
      await nativeToggle(wrapper.element, true)
      for (const name of ['show', 'shown', 'hide', 'hidden', 'show-prevented', 'hide-prevented']) {
        expect(wrapper.emitted(name)).toBeUndefined()
      }
    })
  })

  describe('lazy', () => {
    it('renders the body content by default while closed', () => {
      const wrapper = mount(BAccordionItem, {slots: {default: 'Body'}})
      expect(wrapper.get('.accordion-body').text()).toBe('Body')
    })

    it('lazy keeps the body empty until first opened, then keeps it', async () => {
      const wrapper = mount(BAccordionItem, {props: {lazy: true}, slots: {default: 'Body'}})
      const body = wrapper.get('.accordion-body')
      expect(body.text()).toBe('')
      await nativeToggle(wrapper.element, true)
      expect(wrapper.get('.accordion-body').text()).toBe('Body')
      await nativeToggle(wrapper.element, false)
      expect(wrapper.get('.accordion-body').text()).toBe('Body')
    })

    it('lazy renders immediately when initially open', () => {
      const wrapper = mount(BAccordionItem, {
        props: {lazy: true, modelValue: true},
        slots: {default: 'Body'},
      })
      expect(wrapper.get('.accordion-body').text()).toBe('Body')
    })
  })

  describe('noTransition', () => {
    it('sets no inline style by default', () => {
      const wrapper = mount(BAccordionItem)
      expect(wrapper.attributes('style')).toBeUndefined()
    })

    it('sets the transition tokens to zero inline', () => {
      const wrapper = mount(BAccordionItem, {props: {noTransition: true}})
      const style = wrapper.attributes('style')
      expect(style).toContain('--bs-accordion-panel-transition-duration: 0s')
      expect(style).toContain('--bs-accordion-transition-duration: 0s')
      expect(style).toContain('--bs-accordion-btn-icon-transition: none')
    })
  })

  describe('ssr', () => {
    it('renders the open attribute on the server', async () => {
      const html = await renderToString(
        h(BAccordionItem, {id: 'x', modelValue: true, title: 'T'}, {default: () => 'B'})
      )
      expect(html).toMatch(/<details[^>]*\sopen/)
    })

    it('does not render open when closed', async () => {
      const html = await renderToString(h(BAccordionItem, {id: 'x', title: 'T'}))
      expect(html).not.toMatch(/<details[^>]*\sopen/)
    })
  })
})
