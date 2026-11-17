import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BAvatarGroup from './BAvatarGroup.vue'
import BAvatar from './BAvatar.vue'
import {h} from 'vue'

describe('avatar-group', () => {
  enableAutoUnmount(afterEach)

  describe('rendering', () => {
    it('has static class avatar-stack', () => {
      const wrapper = mount(BAvatarGroup)
      expect(wrapper.classes()).toContain('avatar-stack')
      expect(wrapper.html()).not.toContain('b-avatar')
    })

    it('has role group', () => {
      const wrapper = mount(BAvatarGroup)
      expect(wrapper.attributes('role')).toBe('group')
    })

    it('tag is div by default', () => {
      const wrapper = mount(BAvatarGroup)
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('tag changes with prop tag', () => {
      const wrapper = mount(BAvatarGroup, {props: {tag: 'span'}})
      expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('renders avatars as direct children (no inner wrapper)', () => {
      const wrapper = mount(BAvatarGroup, {
        slots: {default: () => [h(BAvatar, {text: 'A'}), h(BAvatar, {text: 'B'})]},
      })
      const children = Array.from(wrapper.element.children)
      expect(children).toHaveLength(2)
      expect(children.every((c) => c.classList.contains('avatar'))).toBe(true)
    })

    it('passes attrs such as aria-label to the root', () => {
      const wrapper = mount(BAvatarGroup, {attrs: {'aria-label': 'Team'}})
      expect(wrapper.attributes('aria-label')).toBe('Team')
    })
  })

  describe('size', () => {
    it.each(['xs', 'sm', 'lg', 'xl'] as const)('size %s adds avatar-stack-%s', (size) => {
      const wrapper = mount(BAvatarGroup, {props: {size}})
      expect(wrapper.classes()).toContain(`avatar-stack-${size}`)
    })

    it('size md adds no stack size class', () => {
      const wrapper = mount(BAvatarGroup, {props: {size: 'md'}})
      expect(wrapper.classes()).toEqual(['avatar-stack'])
    })

    it('custom size adds no class and is set on each child avatar', () => {
      const wrapper = mount(BAvatarGroup, {
        props: {size: '5rem'},
        slots: {default: () => [h(BAvatar, {text: 'A', size: 'sm'})]},
      })
      expect(wrapper.classes()).toEqual(['avatar-stack'])
      const avatar = wrapper.get('.avatar')
      expect(avatar.attributes('style')).toContain('--bs-avatar-size: 5rem')
      expect(avatar.classes()).not.toContain('avatar-sm')
    })

    it('numeric size is converted to px on children', () => {
      const wrapper = mount(BAvatarGroup, {
        props: {size: 40},
        slots: {default: () => h(BAvatar)},
      })
      expect(wrapper.get('.avatar').attributes('style')).toContain('--bs-avatar-size: 40px')
    })

    it('literal group size wins over the child size', () => {
      const wrapper = mount(BAvatarGroup, {
        props: {size: 'lg'},
        slots: {default: () => h(BAvatar, {size: 'sm'})},
      })
      const avatar = wrapper.get('.avatar')
      expect(avatar.classes()).toContain('avatar-lg')
      expect(avatar.classes()).not.toContain('avatar-sm')
    })

    it('child keeps its own size when the group has none', () => {
      const wrapper = mount(BAvatarGroup, {slots: {default: () => h(BAvatar, {size: 'xl'})}})
      expect(wrapper.get('.avatar').classes()).toContain('avatar-xl')
    })
  })

  describe('overlap', () => {
    it('default overlap sets no inline spacing on children', () => {
      const wrapper = mount(BAvatarGroup, {slots: {default: () => h(BAvatar)}})
      expect(wrapper.get('.avatar').attributes('style')).toBeUndefined()
    })

    it('custom overlap sets --bs-avatar-stack-spacing on children', () => {
      const wrapper = mount(BAvatarGroup, {
        props: {overlap: 0.5},
        slots: {default: () => h(BAvatar)},
      })
      expect(wrapper.get('.avatar').attributes('style')).toContain(
        '--bs-avatar-stack-spacing: -0.5'
      )
    })

    it('string overlap is converted to a number', () => {
      const wrapper = mount(BAvatarGroup, {
        props: {overlap: '0'},
        slots: {default: () => h(BAvatar)},
      })
      expect(wrapper.get('.avatar').attributes('style')).toContain('--bs-avatar-stack-spacing: 0')
    })

    it('overlap is reactive', async () => {
      const wrapper = mount(BAvatarGroup, {
        props: {overlap: 0.5},
        slots: {default: () => h(BAvatar)},
      })
      await wrapper.setProps({overlap: 0.1})
      expect(wrapper.get('.avatar').attributes('style')).toContain(
        '--bs-avatar-stack-spacing: -0.1'
      )
    })

    it('avatars outside a group get no spacing', () => {
      const wrapper = mount(BAvatar)
      expect(wrapper.attributes('style')).toBeUndefined()
    })
  })
})
