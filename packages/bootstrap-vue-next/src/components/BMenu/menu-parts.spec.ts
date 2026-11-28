import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BMenuDivider from './BMenuDivider.vue'
import BMenuHeader from './BMenuHeader.vue'
import BMenuText from './BMenuText.vue'

describe('menu parts', () => {
  enableAutoUnmount(afterEach)

  describe('BMenuHeader', () => {
    it('renders h6.menu-header with the text prop or slot', () => {
      const wrapper = mount(BMenuHeader, {props: {text: 'Header'}})
      expect(wrapper.element.tagName).toBe('H6')
      expect(wrapper.classes()).toEqual(['menu-header'])
      expect(wrapper.text()).toBe('Header')
      expect(mount(BMenuHeader, {slots: {default: 'Slot'}}).text()).toBe('Slot')
    })

    it('uses tag and fallthrough attrs, without li or role', () => {
      const wrapper = mount(BMenuHeader, {props: {tag: 'div'}, attrs: {class: 'x'}})
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.classes()).toContain('x')
      expect(wrapper.attributes('role')).toBeUndefined()
    })
  })

  describe('BMenuText', () => {
    it('renders span.menu-text with the text prop or slot', () => {
      const wrapper = mount(BMenuText, {props: {text: 'Text'}})
      expect(wrapper.element.tagName).toBe('SPAN')
      expect(wrapper.classes()).toEqual(['menu-text'])
      expect(wrapper.text()).toBe('Text')
      expect(mount(BMenuText, {slots: {default: 'Slot'}}).text()).toBe('Slot')
    })

    it('uses tag and fallthrough attrs', () => {
      const wrapper = mount(BMenuText, {props: {tag: 'p'}, attrs: {class: 'x'}})
      expect(wrapper.element.tagName).toBe('P')
      expect(wrapper.classes()).toContain('x')
    })
  })

  describe('BMenuDivider', () => {
    it('renders hr.menu-divider without role', () => {
      const wrapper = mount(BMenuDivider, {attrs: {class: 'x'}})
      expect(wrapper.element.tagName).toBe('HR')
      expect(wrapper.classes()).toContain('menu-divider')
      expect(wrapper.classes()).toContain('x')
      expect(wrapper.attributes('role')).toBeUndefined()
    })
  })
})
