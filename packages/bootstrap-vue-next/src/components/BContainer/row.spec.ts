import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BRow from './BRow.vue'

describe('row', () => {
  enableAutoUnmount(afterEach)

  it('has static class row', () => {
    const wrapper = mount(BRow)
    expect(wrapper.classes()).toEqual(['row'])
  })

  it('tag is div by default', () => {
    const wrapper = mount(BRow)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('tag is prop tag', () => {
    const wrapper = mount(BRow, {
      props: {tag: 'span'},
    })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('has class gx-{value} when prop gutterX', async () => {
    const wrapper = mount(BRow, {
      props: {gutterX: {xs: '3'}},
    })
    expect(wrapper.classes()).toContain('gx-3')
    await wrapper.setProps({gutterX: undefined})
    expect(wrapper.classes()).not.toContain('gx-3')
  })

  it('has class gy-{value} when prop gutterY', async () => {
    const wrapper = mount(BRow, {
      props: {gutterY: {xs: 3}},
    })
    expect(wrapper.classes()).toContain('gy-3')
    await wrapper.setProps({gutterY: undefined})
    expect(wrapper.classes()).not.toContain('gy-3')
  })

  it('passes gutters 0 to 12 straight through', () => {
    const wrapper = mount(BRow, {
      props: {gutterX: {xs: 0, md: 12}, gutterY: {sm: 8}},
    })
    expect(wrapper.classes()).toContain('gx-0')
    expect(wrapper.classes()).toContain('md:gx-12')
    expect(wrapper.classes()).toContain('sm:gy-8')
  })

  it('has class g-0 when prop noGutters', async () => {
    const wrapper = mount(BRow, {
      props: {noGutters: true},
    })
    expect(wrapper.classes()).toContain('g-0')
    await wrapper.setProps({noGutters: false})
    expect(wrapper.classes()).not.toContain('g-0')
  })

  it('has class row-cols-{value} when prop cols', async () => {
    const wrapper = mount(BRow, {
      props: {cols: {xs: 2}},
    })
    expect(wrapper.classes()).toContain('row-cols-2')
    await wrapper.setProps({cols: undefined})
    expect(wrapper.classes()).not.toContain('row-cols-2')
  })

  it('has responsive row-cols classes', () => {
    const wrapper = mount(BRow, {
      props: {cols: {'xs': 1, 'sm': 2, 'md': 3, 'lg': 4, 'xl': 5, '2xl': 6}},
    })
    expect(wrapper.classes()).toEqual([
      'row',
      'row-cols-1',
      'sm:row-cols-2',
      'md:row-cols-3',
      'lg:row-cols-4',
      'xl:row-cols-5',
      '2xl:row-cols-6',
    ])
  })

  it('has class row-cols-auto when cols is auto', () => {
    const wrapper = mount(BRow, {
      props: {cols: {md: 'auto'}},
    })
    expect(wrapper.classes()).toContain('md:row-cols-auto')
  })

  describe.each([
    {
      prop: 'alignV',
      prefix: 'align-items',
      values: ['start', 'center', 'end', 'baseline', 'stretch'],
    },
    {
      prop: 'alignH',
      prefix: 'justify-content',
      values: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    {
      prop: 'alignContent',
      prefix: 'align-content',
      values: ['start', 'center', 'end', 'between', 'around', 'stretch'],
    },
  ])('prop $prop', ({prop, prefix, values}) => {
    it.each(values)(`has class ${prefix}-%s when prop ${prop} is {xs: %s}`, (value) => {
      const wrapper = mount(BRow, {
        props: {[prop]: {xs: value}},
      })
      expect(wrapper.classes()).toContain(`${prefix}-${value}`)
    })

    it.each(values)(`has class md:${prefix}-%s when prop ${prop} is {md: %s}`, (value) => {
      const wrapper = mount(BRow, {
        props: {[prop]: {md: value}},
      })
      expect(wrapper.classes()).toContain(`md:${prefix}-${value}`)
    })

    it(`removes the ${prefix} class when ${prop} is unset`, async () => {
      const wrapper = mount(BRow, {
        props: {[prop]: {xs: values[0]}},
      })
      await wrapper.setProps({[prop]: undefined})
      expect(wrapper.classes()).toEqual(['row'])
    })
  })

  it('combines alignment and cols classes', () => {
    const wrapper = mount(BRow, {
      props: {alignH: {xs: 'center', lg: 'between'}, alignV: {xs: 'end'}, cols: {xs: 4}},
    })
    expect(wrapper.classes()).toContain('justify-content-center')
    expect(wrapper.classes()).toContain('lg:justify-content-between')
    expect(wrapper.classes()).toContain('align-items-end')
    expect(wrapper.classes()).toContain('row-cols-4')
  })

  it('always has row class even with other props', () => {
    const wrapper = mount(BRow, {
      props: {noGutters: true, alignH: {xs: 'center'}, cols: {xs: 2}},
    })
    expect(wrapper.classes()).toContain('row')
  })
})
