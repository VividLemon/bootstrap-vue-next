import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {h, ref} from 'vue'
import BMenuItem from './BMenuItem.vue'
import BLink from '../BLink/BLink.vue'
import {menuInjectionKey} from '../../utils/keys'
import type {MenuAutoClose} from '../../types'

const provideMenu = (autoClose: MenuAutoClose = true) => {
  const hide = vi.fn<(trigger?: string) => Promise<string>>(() => Promise.resolve(''))
  return {
    hide,
    provide: {
      [menuInjectionKey as symbol]: {
        id: ref('m'),
        show: () => Promise.resolve(true),
        hide,
        toggle: () => Promise.resolve(true),
        visible: ref(true),
        autoClose: ref(autoClose),
      },
    },
  }
}

describe('menu-item', () => {
  enableAutoUnmount(afterEach)

  it('renders button.menu-item with type button and no li or role', () => {
    const wrapper = mount(BMenuItem, {slots: {default: 'Action'}})
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toContain('menu-item')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.text()).toBe('Action')
  })

  it('renders the text prop', () => {
    const wrapper = mount(BMenuItem, {props: {text: 'From prop'}})
    expect(wrapper.text()).toBe('From prop')
  })

  it('renders a link with href or to', () => {
    const wrapper = mount(BMenuItem, {props: {href: '/x'}})
    expect(wrapper.findComponent(BLink).exists()).toBe(true)
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/x')
    expect(wrapper.classes()).toContain('menu-item')
    expect(wrapper.attributes('type')).toBeUndefined()
  })

  it('puts fallthrough attrs on the item', () => {
    const wrapper = mount(BMenuItem, {attrs: {'class': 'custom', 'data-x': '1'}})
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.classes()).toContain('menu-item')
    expect(wrapper.attributes('data-x')).toBe('1')
  })

  it('marks active items with .active and aria-current', () => {
    const wrapper = mount(BMenuItem, {props: {active: true}})
    expect(wrapper.classes()).toContain('active')
    expect(wrapper.attributes('aria-current')).toBe('true')
  })

  it('disables a button item', () => {
    const wrapper = mount(BMenuItem, {props: {disabled: true}})
    expect(wrapper.classes()).toContain('disabled')
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('adds the theme class from color', () => {
    const wrapper = mount(BMenuItem, {props: {color: {theme: 'danger'}}})
    expect(wrapper.classes()).toContain('theme-danger')
  })

  it('renders the check mark only when selected is set, and .selected when true', () => {
    expect(mount(BMenuItem).find('.menu-item-check').exists()).toBe(false)
    const unselected = mount(BMenuItem, {props: {selected: false}})
    expect(unselected.find('svg.menu-item-check').exists()).toBe(true)
    expect(unselected.classes()).not.toContain('selected')
    const selected = mount(BMenuItem, {props: {selected: true}})
    expect(selected.classes()).toContain('selected')
    expect(selected.get('svg.menu-item-check').attributes('aria-hidden')).toBe('true')
  })

  it('wraps content and description in .menu-item-content', () => {
    const wrapper = mount(BMenuItem, {
      props: {description: 'Details'},
      slots: {default: 'Label'},
    })
    const content = wrapper.get('.menu-item-content')
    expect(content.text()).toContain('Label')
    expect(content.get('small.menu-item-description').text()).toBe('Details')
  })

  it('uses the description slot', () => {
    const wrapper = mount(BMenuItem, {slots: {description: 'Slot details'}})
    expect(wrapper.get('.menu-item-description').text()).toBe('Slot details')
  })

  it('renders the icon slot before the content', () => {
    const wrapper = mount(BMenuItem, {
      slots: {icon: () => h('svg', {class: 'menu-item-icon'}), default: 'Label'},
    })
    expect(wrapper.element.firstElementChild?.classList.contains('menu-item-icon')).toBe(true)
  })

  it('emits click and hides the menu with trigger item', async () => {
    const {hide, provide} = provideMenu()
    const wrapper = mount(BMenuItem, {global: {provide}})
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(hide).toHaveBeenCalledWith('item')
  })

  it.each([false, 'outside'] as const)('does not hide with autoClose %s', async (autoClose) => {
    const {hide, provide} = provideMenu(autoClose)
    const wrapper = mount(BMenuItem, {global: {provide}})
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(hide).not.toHaveBeenCalled()
  })

  it('does not emit or hide when a disabled link is clicked', async () => {
    const {hide, provide} = provideMenu()
    const wrapper = mount(BMenuItem, {props: {href: '/x', disabled: true}, global: {provide}})
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
    expect(hide).not.toHaveBeenCalled()
  })
})
