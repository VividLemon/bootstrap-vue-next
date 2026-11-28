import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {nextTick} from 'vue'
import BNavItemDropdown from './BNavItemDropdown.vue'
import BMenu from '../BMenu/BMenu.vue'

const flush = async () => {
  await nextTick()
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  await nextTick()
}

describe('nav-item-dropdown', () => {
  enableAutoUnmount(afterEach)

  it('renders li.nav-item without v5 dropdown classes', () => {
    const wrapper = mount(BNavItemDropdown)
    expect(wrapper.element.tagName).toBe('LI')
    expect(wrapper.classes()).toEqual(['nav-item'])
  })

  it('renders BMenu with a button.nav-link toggle and a sibling .menu', () => {
    const wrapper = mount(BNavItemDropdown, {props: {id: 'n', text: 'Nav'}})
    expect(wrapper.findComponent(BMenu).exists()).toBe(true)
    const toggle = wrapper.get('button#n')
    expect(toggle.classes()).toEqual(['nav-link'])
    expect(toggle.text()).toBe('Nav')
    expect(toggle.attributes('aria-controls')).toBe('n-menu')
    expect(toggle.element.nextElementSibling?.classList.contains('menu')).toBe(true)
  })

  it('puts fallthrough attrs and toggleAttrs on the toggle', () => {
    const wrapper = mount(BNavItemDropdown, {
      props: {toggleAttrs: {class: 'from-toggle-attrs'}},
      attrs: {class: 'from-attrs'},
    })
    const toggle = wrapper.get('button')
    expect(toggle.classes()).toContain('nav-link')
    expect(toggle.classes()).toContain('from-toggle-attrs')
    expect(toggle.classes()).toContain('from-attrs')
  })

  it('renders the toggle slot', () => {
    const wrapper = mount(BNavItemDropdown, {slots: {toggle: 'Custom'}})
    expect(wrapper.get('button').text()).toBe('Custom')
  })

  it('passes props on to BMenu', () => {
    const wrapper = mount(BNavItemDropdown, {
      props: {placement: 'bottom-end', autoClose: 'outside', disabled: true},
    })
    const menu = wrapper.findComponent(BMenu)
    expect(menu.props('placement')).toBe('bottom-end')
    expect(menu.props('autoClose')).toBe('outside')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('adds .show to the li, the toggle and the menu while open', async () => {
    const wrapper = mount(BNavItemDropdown, {attachTo: document.body})
    await wrapper.get('button').trigger('click')
    await flush()
    expect(wrapper.classes()).toContain('show')
    expect(wrapper.get('button').classes()).toContain('show')
    expect(wrapper.get('.menu').classes()).toContain('show')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('renders the default slot with the show/hide scope', () => {
    const wrapper = mount(BNavItemDropdown, {
      slots: {default: `<template #default="{id}">content {{ id }}</template>`},
      props: {id: 'x'},
    })
    expect(wrapper.get('.menu').text()).toBe('content x')
  })

  it('exposes show, hide, toggle and update', () => {
    const wrapper = mount(BNavItemDropdown)
    expect(typeof wrapper.vm.show).toBe('function')
    expect(typeof wrapper.vm.hide).toBe('function')
    expect(typeof wrapper.vm.toggle).toBe('function')
    expect(typeof wrapper.vm.update).toBe('function')
  })
})
