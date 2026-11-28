import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {h} from 'vue'
import BGrid from './BGrid.vue'
import BGridItem from './BGridItem.vue'

enableAutoUnmount(afterEach)

describe('grid', () => {
  it('renders a div with class grid by default', () => {
    const wrapper = mount(BGrid)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toEqual(['grid'])
  })

  it('renders the tag prop', () => {
    const wrapper = mount(BGrid, {props: {tag: 'section'}})
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('renders the default slot', () => {
    const wrapper = mount(BGrid, {slots: {default: 'foobar'}})
    expect(wrapper.text()).toBe('foobar')
  })

  it('has no inline style by default', () => {
    const wrapper = mount(BGrid)
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  it('sets --bs-columns from columns', () => {
    const wrapper = mount(BGrid, {props: {columns: 4}})
    expect(wrapper.element.style.getPropertyValue('--bs-columns')).toBe('4')
  })

  it('accepts a string columns value', () => {
    const wrapper = mount(BGrid, {props: {columns: '18'}})
    expect(wrapper.element.style.getPropertyValue('--bs-columns')).toBe('18')
  })

  it('sets --bs-rows from rows', () => {
    const wrapper = mount(BGrid, {props: {rows: 3}})
    expect(wrapper.element.style.getPropertyValue('--bs-rows')).toBe('3')
  })

  it('sets --bs-gap from gap, including a row column pair', () => {
    const wrapper = mount(BGrid, {props: {gap: '.25rem 1rem'}})
    expect(wrapper.element.style.getPropertyValue('--bs-gap')).toBe('.25rem 1rem')
  })

  it('does not set --bs-gap for an empty string', () => {
    const wrapper = mount(BGrid, {props: {gap: ''}})
    expect(wrapper.element.style.getPropertyValue('--bs-gap')).toBe('')
  })

  it('renders flow as responsive grid-auto-flow classes', () => {
    const wrapper = mount(BGrid, {props: {flow: {xs: 'dense', md: 'column'}}})
    expect(wrapper.classes()).toEqual(['grid', 'grid-auto-flow-dense', 'md:grid-auto-flow-column'])
  })

  it('merges class and style attributes', () => {
    const wrapper = mount(BGrid, {
      props: {columns: 3},
      attrs: {class: 'md:gap-3', style: 'color: red;'},
    })
    expect(wrapper.classes()).toEqual(['grid', 'md:gap-3'])
    expect(wrapper.element.style.getPropertyValue('--bs-columns')).toBe('3')
    expect(wrapper.element.style.color).toBe('red')
  })

  it('renders plain children for auto columns', () => {
    const wrapper = mount(BGrid, {
      slots: {default: () => [h('div', {class: 'auto'}, 'a'), h(BGridItem, {cols: {xs: 4}})]},
    })
    expect(wrapper.find('.auto').exists()).toBe(true)
    expect(wrapper.find('.g-col-4').exists()).toBe(true)
  })

  it('renders a nested grid', () => {
    const wrapper = mount(BGrid, {
      slots: {default: () => h(BGridItem, {cols: {xs: 6}}, () => h(BGrid, {columns: 3}))},
    })
    const nested = wrapper.find('.g-col-6 > .grid')
    expect(nested.exists()).toBe(true)
    expect((nested.element as HTMLElement).style.getPropertyValue('--bs-columns')).toBe('3')
  })
})

describe('grid-item', () => {
  it('renders a div with no class by default', () => {
    const wrapper = mount(BGridItem)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toEqual([])
  })

  it('renders the tag prop', () => {
    const wrapper = mount(BGridItem, {props: {tag: 'article'}})
    expect(wrapper.element.tagName).toBe('ARTICLE')
  })

  it('renders the default slot', () => {
    const wrapper = mount(BGridItem, {slots: {default: 'foobar'}})
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders cols per breakpoint', () => {
    const wrapper = mount(BGridItem, {
      props: {cols: {'xs': 6, 'sm': 5, 'md': 4, 'lg': 3, 'xl': 2, '2xl': 1}},
    })
    expect(wrapper.classes()).toEqual([
      'g-col-6',
      'sm:g-col-5',
      'md:g-col-4',
      'lg:g-col-3',
      'xl:g-col-2',
      '2xl:g-col-1',
    ])
  })

  it('renders start per breakpoint', () => {
    const wrapper = mount(BGridItem, {props: {start: {xs: 2, lg: '4'}}})
    expect(wrapper.classes()).toEqual(['g-start-2', 'lg:g-start-4'])
  })

  it('renders fill per breakpoint', () => {
    const wrapper = mount(BGridItem, {props: {fill: {xs: true, md: false, lg: true}}})
    expect(wrapper.classes()).toEqual(['grid-cols-fill', 'lg:grid-cols-fill'])
  })

  it('combines cols, start and fill in order', () => {
    const wrapper = mount(BGridItem, {
      props: {cols: {xs: 4, md: 2}, start: {md: 3}, fill: {sm: true}},
    })
    expect(wrapper.classes()).toEqual([
      'g-col-4',
      'md:g-col-2',
      'md:g-start-3',
      'sm:grid-cols-fill',
    ])
  })

  it('merges class and style attributes', () => {
    const wrapper = mount(BGridItem, {
      props: {cols: {xs: 3}},
      attrs: {class: 'p-2', style: 'grid-column: span 14;'},
    })
    expect(wrapper.classes()).toEqual(['g-col-3', 'p-2'])
    expect(wrapper.element.style.gridColumn).toBe('span 14')
  })
})
