import {describe, expect, it} from 'vitest'
import {mount} from '@vue/test-utils'
import {h, nextTick, ref} from 'vue'
import BAvatar from './BAvatar.vue'
import BAvatarGroup from './BAvatarGroup.vue'

describe('avatar', () => {
  it('renders a span with the avatar class', () => {
    const wrapper = mount(BAvatar)
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('avatar')
  })

  it('renders default slot content', () => {
    const wrapper = mount(BAvatar, {slots: {default: 'JD'}})
    expect(wrapper.text()).toBe('JD')
  })

  it('renders an img with avatar-img and alt', () => {
    const wrapper = mount(BAvatar, {props: {img: '/a.png', imgAlt: 'Jane'}})
    const img = wrapper.get('img')
    expect(img.classes()).toContain('avatar-img')
    expect(img.attributes('src')).toBe('/a.png')
    expect(img.attributes('alt')).toBe('Jane')
  })

  it('slot content overrides the img', () => {
    const wrapper = mount(BAvatar, {props: {img: '/a.png'}, slots: {default: 'JD'}})
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('JD')
  })

  it('does not render img without img prop', () => {
    expect(mount(BAvatar).find('img').exists()).toBe(false)
  })

  it.each(['xs', 'sm', 'lg', 'xl'] as const)('applies size class %s', (size) => {
    expect(mount(BAvatar, {props: {size}}).classes()).toContain(`avatar-${size}`)
  })

  it('applies no size class by default', () => {
    expect(mount(BAvatar).classes()).toStrictEqual(['avatar'])
  })

  it('applies avatar-subtle', () => {
    expect(mount(BAvatar, {props: {subtle: true}}).classes()).toContain('avatar-subtle')
  })

  it('does not apply avatar-subtle by default', () => {
    expect(mount(BAvatar).classes()).not.toContain('avatar-subtle')
  })

  it('maps variant to theme class', () => {
    expect(mount(BAvatar, {props: {variant: 'success'}}).classes()).toContain('theme-success')
  })

  it('renders status indicator', () => {
    const wrapper = mount(BAvatar, {props: {status: 'online'}})
    const status = wrapper.get('.avatar-status')
    expect(status.classes()).toContain('status-online')
    expect(status.attributes('role')).toBe('img')
    expect(status.attributes('aria-label')).toBe('Online')
  })

  it('uses statusLabel for the aria-label', () => {
    const wrapper = mount(BAvatar, {props: {status: 'away', statusLabel: 'Be right back'}})
    expect(wrapper.get('.avatar-status').attributes('aria-label')).toBe('Be right back')
  })

  it('does not render status by default', () => {
    expect(mount(BAvatar).find('.avatar-status').exists()).toBe(false)
  })
})

describe('avatar-group', () => {
  it('renders div.avatar-stack', () => {
    const wrapper = mount(BAvatarGroup)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toStrictEqual(['avatar-stack'])
  })

  it('renders avatars from the default slot', () => {
    const wrapper = mount(BAvatarGroup, {
      slots: {default: () => [h(BAvatar, null, () => 'A'), h(BAvatar, null, () => 'B')]},
    })
    expect(wrapper.findAll('.avatar')).toHaveLength(2)
  })

  it('passes size to child avatars', () => {
    const wrapper = mount(BAvatarGroup, {
      props: {size: 'sm'},
      slots: {default: () => h(BAvatar)},
    })
    expect(wrapper.get('.avatar').classes()).toContain('avatar-sm')
  })

  it('exposes the avatar count in the slot scope', async () => {
    const wrapper = mount(BAvatarGroup, {
      slots: {
        default: (scope: {count: number}) => [
          h('span', {class: 'count'}, String(scope.count)),
          h(BAvatar),
          h(BAvatar),
        ],
      },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.get('.count').text()).toBe('2')
  })

  it('decrements count when an avatar unmounts', async () => {
    const show = ref(true)
    const wrapper = mount({
      render: () =>
        h(BAvatarGroup, null, {
          default: ({count}: {count: number}) => [
            h('span', {class: 'count'}, String(count)),
            h(BAvatar),
            show.value ? h(BAvatar) : null,
          ],
        }),
    })
    await nextTick()
    expect(wrapper.get('.count').text()).toBe('2')
    show.value = false
    await nextTick()
    expect(wrapper.get('.count').text()).toBe('1')
  })
})
