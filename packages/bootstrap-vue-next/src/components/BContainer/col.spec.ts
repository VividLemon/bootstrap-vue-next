import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BCol from './BCol.vue'

describe('col', () => {
  enableAutoUnmount(afterEach)

  it('tag is default div', () => {
    const wrapper = mount(BCol)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('tag is prop tag', () => {
    const wrapper = mount(BCol, {
      props: {tag: 'span'},
    })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('renders default slot', () => {
    const wrapper = mount(BCol, {
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  describe('col fallback', () => {
    it('has class col by default', () => {
      const wrapper = mount(BCol)
      expect(wrapper.classes()).toEqual(['col'])
    })

    it('has class col when cols is an empty object', () => {
      const wrapper = mount(BCol, {props: {cols: {}}})
      expect(wrapper.classes()).toEqual(['col'])
    })

    it('has class col when every cols value is false', () => {
      const wrapper = mount(BCol, {props: {cols: {xs: false, md: false}}})
      expect(wrapper.classes()).toEqual(['col'])
    })

    it('does not add a stray col when only a breakpoint col is set', () => {
      const wrapper = mount(BCol, {props: {cols: {md: 6}}})
      expect(wrapper.classes()).toEqual(['md:col-6'])
    })

    it('does not add a stray col when only a breakpoint equal-width col is set', () => {
      const wrapper = mount(BCol, {props: {cols: {md: true}}})
      expect(wrapper.classes()).toEqual(['md:col'])
    })

    it('does not add col when cols is auto', () => {
      const wrapper = mount(BCol, {props: {cols: {lg: 'auto'}}})
      expect(wrapper.classes()).toEqual(['lg:col-auto'])
    })

    it('keeps col alongside offset, order and alignSelf', () => {
      const wrapper = mount(BCol, {
        props: {offset: {md: 2}, order: {xs: 1}, alignSelf: {xs: 'center'}},
      })
      expect(wrapper.classes()).toEqual(['col', 'md:offset-2', 'order-1', 'align-self-center'])
    })

    it('removes col when cols is set and adds it back when unset', async () => {
      const wrapper = mount(BCol)
      expect(wrapper.classes()).toContain('col')
      await wrapper.setProps({cols: {sm: 4}})
      expect(wrapper.classes()).not.toContain('col')
      await wrapper.setProps({cols: undefined})
      expect(wrapper.classes()).toContain('col')
    })
  })

  describe('prop cols', () => {
    it('has class col-{value} for xs', async () => {
      const wrapper = mount(BCol, {props: {cols: {xs: '6'}}})
      expect(wrapper.classes()).toContain('col-6')
      await wrapper.setProps({cols: undefined})
      expect(wrapper.classes()).not.toContain('col-6')
    })

    it('has class col-auto for xs auto', () => {
      const wrapper = mount(BCol, {props: {cols: {xs: 'auto'}}})
      expect(wrapper.classes()).toEqual(['col-auto'])
    })

    it('has class col for xs true', () => {
      const wrapper = mount(BCol, {props: {cols: {xs: true}}})
      expect(wrapper.classes()).toEqual(['col'])
    })

    it.each(['sm', 'md', 'lg', 'xl', '2xl'] as const)('has class %s:col-{value}', (bp) => {
      const wrapper = mount(BCol, {props: {cols: {[bp]: 6}}})
      expect(wrapper.classes()).toEqual([`${bp}:col-6`])
    })

    it.each(['sm', 'md', 'lg', 'xl', '2xl'] as const)('has class %s:col for true', (bp) => {
      const wrapper = mount(BCol, {props: {cols: {[bp]: true}}})
      expect(wrapper.classes()).toEqual([`${bp}:col`])
    })

    it('renders multiple breakpoints in breakpoint order', () => {
      const wrapper = mount(BCol, {props: {cols: {'2xl': 4, 'xs': 12, 'md': 6}}})
      expect(wrapper.classes()).toEqual(['col-12', 'md:col-6', '2xl:col-4'])
    })

    it('does not emit v5 infix classes', () => {
      const wrapper = mount(BCol, {props: {cols: {md: 6}}})
      expect(wrapper.classes()).not.toContain('col-md-6')
    })
  })

  describe('prop offset', () => {
    it('has class offset-{value} for xs', async () => {
      const wrapper = mount(BCol, {props: {offset: {xs: '6'}}})
      expect(wrapper.classes()).toContain('offset-6')
      await wrapper.setProps({offset: undefined})
      expect(wrapper.classes()).not.toContain('offset-6')
    })

    it('has responsive offset classes including 0', () => {
      const wrapper = mount(BCol, {
        props: {offset: {'xs': 1, 'sm': 2, 'md': 0, 'lg': 4, 'xl': 5, '2xl': 11}},
      })
      expect(wrapper.classes()).toEqual([
        'col',
        'offset-1',
        'sm:offset-2',
        'md:offset-0',
        'lg:offset-4',
        'xl:offset-5',
        '2xl:offset-11',
      ])
    })
  })

  describe('prop order', () => {
    it('has class order-{value} for xs', async () => {
      const wrapper = mount(BCol, {props: {order: {xs: '5'}}})
      expect(wrapper.classes()).toContain('order-5')
      await wrapper.setProps({order: undefined})
      expect(wrapper.classes()).not.toContain('order-5')
    })

    it('has class order-0', () => {
      const wrapper = mount(BCol, {props: {order: {xs: 0}}})
      expect(wrapper.classes()).toContain('order-0')
    })

    it.each(['first', 'last'] as const)('has class lg:order-%s', (value) => {
      const wrapper = mount(BCol, {props: {order: {lg: value}}})
      expect(wrapper.classes()).toContain(`lg:order-${value}`)
    })
  })

  describe('prop alignSelf', () => {
    it.each(['auto', 'start', 'end', 'center', 'baseline', 'stretch'] as const)(
      'has class align-self-%s',
      (value) => {
        const wrapper = mount(BCol, {props: {alignSelf: {xs: value}}})
        expect(wrapper.classes()).toContain(`align-self-${value}`)
      }
    )

    it('has responsive align-self classes', async () => {
      const wrapper = mount(BCol, {props: {alignSelf: {xs: 'start', md: 'end'}}})
      expect(wrapper.classes()).toContain('align-self-start')
      expect(wrapper.classes()).toContain('md:align-self-end')
      await wrapper.setProps({alignSelf: undefined})
      expect(wrapper.classes()).toEqual(['col'])
    })
  })

  it('combines cols, offset, order and alignSelf', () => {
    const wrapper = mount(BCol, {
      props: {
        cols: {'xs': 12, 'md': 6, '2xl': 4},
        offset: {md: 2},
        order: {lg: 'first'},
        alignSelf: {md: 'center'},
      },
    })
    expect(wrapper.classes()).toEqual([
      'col-12',
      'md:col-6',
      '2xl:col-4',
      'md:offset-2',
      'lg:order-first',
      'md:align-self-center',
    ])
  })
})
