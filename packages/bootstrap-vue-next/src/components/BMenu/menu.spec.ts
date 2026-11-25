import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {defineComponent, h, inject, nextTick} from 'vue'
import BMenu from './BMenu.vue'
import BMenuItem from './BMenuItem.vue'
import BButtonGroup from '../BButton/BButtonGroup.vue'
import BInputGroup from '../BInputGroup/BInputGroup.vue'
import {menuInjectionKey} from '../../utils/keys'
import type {BvTriggerableEvent} from '../../utils'

/** Let Vue patch and a few animation frames pass */
const flush = async (frames = 3) => {
  for (let i = 0; i < frames; i++) {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  }
  await nextTick()
}

const items = () => [
  h(BMenuItem, null, () => 'One'),
  h(BMenuItem, {disabled: true}, () => 'Disabled'),
  h(BMenuItem, null, () => 'Two'),
  h(BMenuItem, null, () => 'Three'),
]

const mountMenu = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
  mount(BMenu, {
    props: {id: 'm', text: 'Menu', ...props},
    slots: {default: items, ...slots},
    attachTo: document.body,
  })

describe('menu', () => {
  enableAutoUnmount(afterEach)

  describe('markup', () => {
    it('renders the toggle and the .menu as siblings without a wrapper', () => {
      const wrapper = mountMenu()
      const root = wrapper.element.parentElement as HTMLElement
      const toggle = root.querySelector('button#m') as HTMLElement
      const menu = root.querySelector('div.menu') as HTMLElement
      expect(toggle).not.toBeNull()
      expect(menu).not.toBeNull()
      expect(toggle.parentElement).toBe(menu.parentElement)
      expect(root.querySelector('.btn-group')).toBeNull()
      expect(root.querySelector('.dropdown, .dropdown-menu, .dropdown-toggle')).toBeNull()
    })

    it('styles the toggle as a secondary solid button with the text', () => {
      const wrapper = mountMenu()
      const toggle = wrapper.get('#m')
      expect(toggle.classes()).toContain('btn-solid')
      expect(toggle.classes()).toContain('theme-secondary')
      expect(toggle.text()).toBe('Menu')
      expect(toggle.attributes('type')).toBe('button')
    })

    it('links the toggle and the menu with aria-expanded and aria-controls', () => {
      const wrapper = mountMenu()
      const toggle = wrapper.get('#m')
      expect(toggle.attributes('aria-expanded')).toBe('false')
      expect(toggle.attributes('aria-controls')).toBe('m-menu')
      expect(wrapper.get('.menu').attributes('id')).toBe('m-menu')
    })

    it('sets no menu roles and no aria-haspopup by default', () => {
      const wrapper = mountMenu()
      expect(wrapper.get('.menu').attributes('role')).toBeUndefined()
      expect(wrapper.get('#m').attributes('aria-haspopup')).toBeUndefined()
      expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
    })

    it('renders no caret class', () => {
      const wrapper = mountMenu()
      expect(
        wrapper
          .get('#m')
          .classes()
          .some((c) => c.includes('caret'))
      ).toBe(false)
    })

    it('uses the toggle slot for the toggle content', () => {
      const wrapper = mountMenu({}, {toggle: () => 'Custom'})
      expect(wrapper.get('#m').text()).toBe('Custom')
    })

    it('renders the items as direct children of .menu', () => {
      const wrapper = mountMenu()
      const menu = wrapper.get('.menu').element
      expect(menu.querySelectorAll(':scope > .menu-item')).toHaveLength(4)
    })

    it('has no inline position and no data-bs-placement while hidden', () => {
      const wrapper = mountMenu()
      const menu = wrapper.get('.menu')
      expect(menu.attributes('style')).toBeUndefined()
      expect(menu.attributes('data-bs-placement')).toBeUndefined()
    })
  })

  describe('part attrs', () => {
    it('puts fallthrough attrs on the toggle', () => {
      const wrapper = mount(BMenu, {
        props: {id: 'm'},
        attrs: {'class': 'from-attrs', 'data-x': '1'},
      })
      const toggle = wrapper.get('#m')
      expect(toggle.classes()).toContain('from-attrs')
      expect(toggle.classes()).toContain('btn-solid')
      expect(toggle.attributes('data-x')).toBe('1')
      expect(wrapper.get('.menu').classes()).not.toContain('from-attrs')
    })

    it('merges toggleAttrs into the toggle', () => {
      const wrapper = mountMenu({toggleAttrs: {'class': 'custom-toggle', 'aria-label': 'Open'}})
      const toggle = wrapper.get('#m')
      expect(toggle.classes()).toContain('custom-toggle')
      expect(toggle.classes()).toContain('btn-solid')
      expect(toggle.attributes('aria-label')).toBe('Open')
    })

    it('merges menuAttrs into the menu', () => {
      const wrapper = mountMenu({menuAttrs: {class: 'custom-menu', role: 'menu'}})
      const menu = wrapper.get('.menu')
      expect(menu.classes()).toContain('custom-menu')
      expect(menu.classes()).toContain('menu')
      expect(menu.attributes('role')).toBe('menu')
    })

    it('merges splitAttrs into the main split button', () => {
      const wrapper = mountMenu({split: true, splitAttrs: {class: 'custom-split'}})
      const buttons = wrapper.findAll('button')
      expect(buttons[0].classes()).toContain('custom-split')
      expect(buttons[0].classes()).toContain('btn-solid')
      expect(buttons[1].classes()).not.toContain('custom-split')
    })
  })

  describe('classes', () => {
    it('adds menu-translucent and menu-scrollable', () => {
      const wrapper = mountMenu({translucent: true, scrollable: true})
      const menu = wrapper.get('.menu')
      expect(menu.classes()).toContain('menu-translucent')
      expect(menu.classes()).toContain('menu-scrollable')
    })

    it('adds transition-none with noTransition', () => {
      const wrapper = mountMenu({noTransition: true})
      expect(wrapper.get('.menu').classes()).toContain('transition-none')
    })

    it('uses variant, size and color on the toggle', () => {
      const wrapper = mountMenu({variant: 'outline', size: 'lg', color: {theme: 'primary'}})
      const toggle = wrapper.get('#m')
      expect(toggle.classes()).toContain('btn-outline')
      expect(toggle.classes()).toContain('btn-lg')
      expect(toggle.classes()).toContain('theme-primary')
    })
  })

  describe('show and hide', () => {
    it('opens on toggle click and closes on the next one', async () => {
      const wrapper = mountMenu()
      const toggle = wrapper.get('#m')
      await toggle.trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      expect(toggle.classes()).toContain('show')
      expect(toggle.attributes('aria-expanded')).toBe('true')
      expect(wrapper.emitted('shown')).toHaveLength(1)
      await toggle.trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(toggle.attributes('aria-expanded')).toBe('false')
      const hidden = wrapper.emitted('hidden') as [BvTriggerableEvent][]
      expect(hidden[0][0].trigger).toBe('toggle')
    })

    it('follows v-model', async () => {
      const wrapper = mountMenu({modelValue: false})
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      await wrapper.setProps({modelValue: false})
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
    })

    it('emits update:modelValue', async () => {
      const wrapper = mountMenu()
      await wrapper.get('#m').trigger('click')
      await flush()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    })

    it('writes data-bs-placement and the inline position once shown', async () => {
      const wrapper = mountMenu({modelValue: true})
      await flush(5)
      const menu = wrapper.get('.menu')
      expect(menu.attributes('data-bs-placement')).toBe('bottom-start')
      const style = (menu.element as HTMLElement).style
      expect(style.position).toBe('absolute')
      expect(style.margin).toBe('0px')
      expect(style.transform).toBe('')
    })

    it('resolves logical placements', async () => {
      const wrapper = mountMenu({modelValue: true, placement: 'end'})
      await flush(5)
      expect(wrapper.get('.menu').attributes('data-bs-placement')).toBe('right')
    })

    it('skips positioning with display static', async () => {
      const wrapper = mountMenu({modelValue: true, display: 'static'})
      await flush(5)
      const menu = wrapper.get('.menu')
      expect(menu.attributes('data-bs-display')).toBe('static')
      expect(menu.attributes('data-bs-placement')).toBeUndefined()
    })

    it('exposes show, hide, toggle and update', async () => {
      const wrapper = mountMenu()
      const vm = wrapper.vm as unknown as {
        show: () => Promise<unknown>
        hide: () => Promise<unknown>
        toggle: () => Promise<unknown>
        update: () => Promise<void>
      }
      expect(typeof vm.update).toBe('function')
      await vm.show()
      expect(wrapper.get('.menu').classes()).toContain('show')
      await vm.toggle()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
    })

    it('renders lazy content only once shown', async () => {
      const wrapper = mountMenu({lazy: true})
      expect(wrapper.findAll('.menu-item')).toHaveLength(0)
      await wrapper.get('#m').trigger('click')
      await flush()
      expect(wrapper.findAll('.menu-item')).toHaveLength(4)
    })

    it('teleports the menu only with teleportTo', async () => {
      const target = document.createElement('div')
      target.id = 'menu-target'
      document.body.appendChild(target)
      const wrapper = mountMenu({teleportTo: '#menu-target'})
      await nextTick()
      expect(target.querySelector('.menu')).not.toBeNull()
      wrapper.unmount()
      target.remove()
    })
  })

  describe('disabled guard', () => {
    it('disables the toggle', () => {
      const wrapper = mountMenu({disabled: true})
      expect(wrapper.get('#m').attributes('disabled')).toBeDefined()
    })

    it('cannot be opened by show()', async () => {
      const wrapper = mountMenu({disabled: true})
      const result = await (wrapper.vm as unknown as {show: () => Promise<unknown>}).show()
      expect(result).toBe('show-prevented')
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(wrapper.emitted('show')).toBeUndefined()
    })

    it('cannot be opened by v-model and writes it back', async () => {
      const wrapper = mountMenu({disabled: true, modelValue: false})
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      const updates = wrapper.emitted('update:modelValue')
      expect(updates?.at(-1)).toEqual([false])
    })

    it('cannot be opened by an injected show', async () => {
      let injected: {show: () => Promise<boolean | string>} | null = null
      const Child = defineComponent({
        setup() {
          injected = inject(menuInjectionKey, null)
          return () => h('span')
        },
      })
      const wrapper = mountMenu({disabled: true}, {default: () => h(Child)})
      const result = await injected!.show()
      expect(result).toBe('show-prevented')
      expect(wrapper.get('.menu').classes()).not.toContain('show')
    })

    it('closes when it becomes disabled', async () => {
      const wrapper = mountMenu({modelValue: true})
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      await wrapper.setProps({disabled: true})
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      const hidden = wrapper.emitted('hidden') as [BvTriggerableEvent][]
      expect(hidden[0][0].trigger).toBe('disabled')
    })
  })

  describe('auto-close', () => {
    const open = async (
      props: Record<string, unknown> = {},
      slots: Record<string, unknown> = {}
    ) => {
      const wrapper = mountMenu(props, slots)
      await wrapper.get('#m').trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      return wrapper
    }
    const lastTrigger = (wrapper: ReturnType<typeof mountMenu>) =>
      (wrapper.emitted('hidden') as [BvTriggerableEvent][] | undefined)?.at(-1)?.[0].trigger

    it('closes on an outside click', async () => {
      const wrapper = await open()
      document.body.click()
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(lastTrigger(wrapper)).toBe('click-outside')
    })

    it('ignores right clicks', async () => {
      const wrapper = await open()
      document.body.dispatchEvent(new MouseEvent('click', {bubbles: true, button: 2}))
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
    })

    it('closes on an item click with trigger item', async () => {
      const wrapper = await open()
      await wrapper.findAll('.menu-item')[0].trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(lastTrigger(wrapper)).toBe('item')
    })

    it('closes on another click inside the menu', async () => {
      const wrapper = await open({}, {default: () => h('span', {class: 'menu-text'}, 'Text')})
      ;(wrapper.get('.menu-text').element as HTMLElement).click()
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(lastTrigger(wrapper)).toBe('click-inside')
    })

    it('stays open with autoClose false, except for Escape', async () => {
      const wrapper = await open({autoClose: false})
      document.body.click()
      await wrapper.findAll('.menu-item')[0].trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      await wrapper.get('.menu').trigger('keydown', {key: 'Escape'})
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(lastTrigger(wrapper)).toBe('esc')
    })

    it('autoClose inside closes only on inside clicks', async () => {
      const wrapper = await open({autoClose: 'inside'})
      document.body.click()
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      await wrapper.findAll('.menu-item')[0].trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
    })

    it('autoClose outside closes only on outside clicks', async () => {
      const wrapper = await open({autoClose: 'outside'})
      await wrapper.findAll('.menu-item')[0].trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      document.body.click()
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
    })

    it('stays open for clicks in a form inside the menu', async () => {
      const wrapper = await open(
        {},
        {
          default: () =>
            h('form', null, [h('label', {id: 'lbl'}, 'Label'), h('input', {id: 'inp'})]),
        }
      )
      ;(wrapper.get('#lbl').element as HTMLElement).click()
      ;(wrapper.get('#inp').element as HTMLElement).click()
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
    })

    it('closes on Tab keyup outside the menu, not inside', async () => {
      const wrapper = await open()
      wrapper
        .findAll('.menu-item')[0]
        .element.dispatchEvent(new KeyboardEvent('keyup', {key: 'Tab', bubbles: true}))
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      document.body.dispatchEvent(new KeyboardEvent('keyup', {key: 'Tab', bubbles: true}))
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(lastTrigger(wrapper)).toBe('tab')
    })
  })

  describe('keyboard', () => {
    const focused = () => document.activeElement?.textContent

    it('ArrowDown on the toggle opens and focuses the first item', async () => {
      const wrapper = mountMenu()
      await wrapper.get('#m').trigger('keydown', {key: 'ArrowDown'})
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      expect(focused()).toBe('One')
    })

    it('ArrowUp on the toggle opens and focuses the last item', async () => {
      const wrapper = mountMenu()
      await wrapper.get('#m').trigger('keydown', {key: 'ArrowUp'})
      await flush()
      expect(focused()).toBe('Three')
    })

    it('moves between items, skipping disabled ones, without wrapping', async () => {
      const wrapper = mountMenu({modelValue: true})
      await flush()
      const menuItems = wrapper.findAll('.menu-item')
      ;(menuItems[0].element as HTMLElement).focus()
      await menuItems[0].trigger('keydown', {key: 'ArrowDown'})
      expect(focused()).toBe('Two')
      await menuItems[2].trigger('keydown', {key: 'ArrowDown'})
      await menuItems[3].trigger('keydown', {key: 'ArrowDown'})
      expect(focused()).toBe('Three')
      await menuItems[0].trigger('keydown', {key: 'ArrowUp'})
      expect(focused()).toBe('One')
    })

    it('Home and End go to the first and last item', async () => {
      const wrapper = mountMenu({modelValue: true})
      await flush()
      const menuItems = wrapper.findAll('.menu-item')
      await menuItems[2].trigger('keydown', {key: 'End'})
      expect(focused()).toBe('Three')
      await menuItems[3].trigger('keydown', {key: 'Home'})
      expect(focused()).toBe('One')
    })

    it('Escape closes and focuses the toggle', async () => {
      const wrapper = mountMenu({modelValue: true})
      await flush()
      await wrapper.findAll('.menu-item')[0].trigger('keydown', {key: 'Escape'})
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(document.activeElement).toBe(wrapper.get('#m').element)
    })

    it('leaves arrow keys alone in inputs', async () => {
      const wrapper = mountMenu({modelValue: true}, {default: () => h('input', {id: 'inp'})})
      await flush()
      const input = wrapper.get('#inp')
      ;(input.element as HTMLElement).focus()
      await input.trigger('keydown', {key: 'ArrowDown'})
      expect(document.activeElement).toBe(input.element)
    })

    it('does not open a disabled menu with the arrow keys', async () => {
      const wrapper = mountMenu({disabled: true})
      await wrapper.get('#m').trigger('keydown', {key: 'ArrowDown'})
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
    })
  })

  describe('split', () => {
    it('renders a .btn-group with the main button, the split toggle and the menu', () => {
      const wrapper = mountMenu({split: true})
      const group = wrapper.get('.btn-group')
      const children = Array.from(group.element.children)
      expect(children).toHaveLength(3)
      expect(children[1].classList.contains('menu-toggle-split')).toBe(true)
      expect(children[2].classList.contains('menu')).toBe(true)
    })

    it('puts the id and aria on the split toggle', () => {
      const wrapper = mountMenu({split: true})
      const toggle = wrapper.get('.menu-toggle-split')
      expect(toggle.attributes('id')).toBe('m')
      expect(toggle.attributes('aria-expanded')).toBe('false')
      expect(toggle.attributes('aria-controls')).toBe('m-menu')
      expect(toggle.find('svg[aria-hidden="true"]').exists()).toBe(true)
      expect(toggle.get('.visually-hidden').text()).toBe('Toggle menu')
    })

    it('emits split-click from the main button without opening', async () => {
      const wrapper = mountMenu({split: true})
      await wrapper.findAll('button')[0].trigger('click')
      await flush()
      expect(wrapper.emitted('split-click')).toHaveLength(1)
      expect(wrapper.get('.menu').classes()).not.toContain('show')
    })

    it('opens from the split toggle', async () => {
      const wrapper = mountMenu({split: true})
      await wrapper.get('.menu-toggle-split').trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      expect(wrapper.get('.btn-group').classes()).toContain('show')
    })

    it('renders the main button as a link with splitHref', () => {
      const wrapper = mountMenu({split: true, splitHref: '/foo'})
      expect(wrapper.get('a').attributes('href')).toBe('/foo')
    })

    it('uses toggleText and the split-toggle slot', () => {
      const wrapper = mountMenu({split: true, toggleText: 'More'})
      expect(wrapper.get('.menu-toggle-split .visually-hidden').text()).toBe('More')
      const custom = mountMenu({split: true}, {'split-toggle': () => 'Chevron'})
      expect(custom.get('.menu-toggle-split').text()).toBe('Chevron')
    })

    it('renders no .btn-group inside BButtonGroup or BInputGroup', () => {
      for (const Group of [BButtonGroup, BInputGroup]) {
        const wrapper = mount(Group, {
          slots: {default: () => h(BMenu, {id: 'g', split: true})},
        })
        const group = wrapper.element as HTMLElement
        // The group itself is the root; the menu renders no `.btn-group` of its own inside it
        expect(group.querySelectorAll('.btn-group')).toHaveLength(0)
        const menu = group.querySelector('.menu') as HTMLElement
        expect(menu.previousElementSibling?.classList.contains('menu-toggle-split')).toBe(true)
        wrapper.unmount()
      }
    })
  })

  describe('activator slot', () => {
    it('replaces the toggle with the slot element bound to props', async () => {
      const wrapper = mount(BMenu, {
        props: {id: 'a'},
        slots: {
          activator: `<template #activator="{props}"><span class="opener" v-bind="props">Open</span></template>`,
          default: items,
        },
        attachTo: document.body,
      })
      expect(wrapper.find('button#a').exists()).toBe(false)
      const opener = wrapper.get('.opener')
      expect(opener.attributes('id')).toBe('a')
      expect(opener.attributes('aria-controls')).toBe('a-menu')
      expect(opener.attributes('aria-expanded')).toBe('false')
      await opener.trigger('click')
      await flush()
      expect(wrapper.get('.menu').classes()).toContain('show')
      expect(opener.classes()).toContain('show')
      await opener.trigger('keydown', {key: 'Escape'})
      await flush()
      expect(wrapper.get('.menu').classes()).not.toContain('show')
      expect(document.activeElement).toBe(opener.element)
    })
  })

  describe('default slot', () => {
    it('passes the show/hide scope', async () => {
      let scope: Record<string, unknown> | undefined
      const wrapper = mountMenu(
        {},
        {
          default: (s: Record<string, unknown>) => {
            scope = s
            return h('span')
          },
        }
      )
      expect(scope?.id).toBe('m')
      expect(scope?.visible).toBe(false)
      expect(typeof scope?.show).toBe('function')
      expect(typeof scope?.hide).toBe('function')
      expect(typeof scope?.toggle).toBe('function')
      expect(scope).not.toHaveProperty('click')
      await (scope!.show as () => Promise<unknown>)()
      await nextTick()
      expect(wrapper.get('.menu').classes()).toContain('show')
    })
  })
})
