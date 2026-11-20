import {afterEach, describe, expect, it} from 'vitest'
import {enableAutoUnmount, mount} from '@vue/test-utils'
import {ref} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {createSSRApp, h} from 'vue'
import BFormRange from './BFormRange.vue'
import {provideFormGroupStub} from '../../../tests/utils'

describe('form-range', () => {
  enableAutoUnmount(afterEach)

  describe('markup', () => {
    it('renders a .form-range wrapper around a .form-range-input range input', () => {
      const wrapper = mount(BFormRange)
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.classes()).toContain('form-range')
      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('range')
      expect(input.classes()).toContain('form-range-input')
    })

    it('defaults to min 0, max 100, step 1 and value 50', () => {
      const wrapper = mount(BFormRange)
      const input = wrapper.find('input')
      expect(input.attributes('min')).toBe('0')
      expect(input.attributes('max')).toBe('100')
      expect(input.attributes('step')).toBe('1')
      expect((input.element as HTMLInputElement).value).toBe('50')
    })

    it('sets --bs-range-fill on the wrapper from the value', () => {
      const wrapper = mount(BFormRange, {props: {modelValue: 25}})
      expect(wrapper.attributes('style')).toContain('--bs-range-fill: 0.25')
    })

    it('computes the fill against min and max and clamps it', async () => {
      const wrapper = mount(BFormRange, {props: {modelValue: 15, min: 10, max: 20}})
      expect(wrapper.attributes('style')).toContain('--bs-range-fill: 0.5')
      await wrapper.setProps({modelValue: 40})
      expect(wrapper.attributes('style')).toContain('--bs-range-fill: 1')
    })

    it('renders the fill on the server', async () => {
      const app = createSSRApp({render: () => h(BFormRange, {modelValue: 75})})
      const html = await renderToString(app)
      expect(html).toContain('--bs-range-fill:0.75')
    })

    it('puts attrs and class on the input and wrapperAttrs on the wrapper', () => {
      const wrapper = mount(BFormRange, {
        props: {wrapperAttrs: {'class': 'outer', 'data-x': 'y'}},
        attrs: {'class': 'inner', 'aria-label': 'Volume'},
      })
      expect(wrapper.classes()).toContain('outer')
      expect(wrapper.classes()).toContain('form-range')
      expect(wrapper.attributes('data-x')).toBe('y')
      expect(wrapper.classes()).not.toContain('inner')
      const input = wrapper.find('input')
      expect(input.classes()).toContain('inner')
      expect(input.classes()).toContain('form-range-input')
      expect(input.attributes('aria-label')).toBe('Volume')
    })

    it('adds the theme class to the wrapper from color.theme', () => {
      const wrapper = mount(BFormRange, {props: {color: {theme: 'success'}}})
      expect(wrapper.classes()).toContain('theme-success')
    })
  })

  describe('bubble', () => {
    it('renders no bubble by default', () => {
      const wrapper = mount(BFormRange)
      expect(wrapper.find('output').exists()).toBe(false)
    })

    it('renders the v6 bubble markup with the value', () => {
      const wrapper = mount(BFormRange, {props: {bubble: true, modelValue: 30}})
      const output = wrapper.find('output')
      expect(output.classes()).toEqual(
        expect.arrayContaining(['form-range-bubble', 'tooltip', 'bs-tooltip-top', 'show'])
      )
      expect(output.attributes('aria-hidden')).toBe('true')
      expect(output.find('.tooltip-arrow').exists()).toBe(true)
      expect(output.find('.tooltip-inner').text()).toBe('30')
    })

    it('formats the bubble and sets aria-valuetext with formatter', () => {
      const wrapper = mount(BFormRange, {
        props: {bubble: true, modelValue: 30, formatter: (v: number) => `${v}%`},
      })
      expect(wrapper.find('.tooltip-inner').text()).toBe('30%')
      expect(wrapper.find('input').attributes('aria-valuetext')).toBe('30%')
    })

    it('has no aria-valuetext without formatter', () => {
      const wrapper = mount(BFormRange)
      expect(wrapper.find('input').attributes('aria-valuetext')).toBeUndefined()
    })
  })

  describe('ticks', () => {
    it('renders no ticks or datalist by default', () => {
      const wrapper = mount(BFormRange)
      expect(wrapper.find('.form-range-ticks').exists()).toBe(false)
      expect(wrapper.find('datalist').exists()).toBe(false)
      expect(wrapper.find('input').attributes('list')).toBeUndefined()
    })

    it('renders ticks, labels and a linked datalist', () => {
      const wrapper = mount(BFormRange, {
        props: {id: 'r', ticks: [100, 0, {value: 50, label: 'Half'}, {value: 25, label: ''}]},
      })
      const ticks = wrapper.find('.form-range-ticks')
      expect(ticks.attributes('aria-hidden')).toBe('true')
      expect(ticks.attributes('style')).toContain(
        'grid-template-columns: 0fr 0.25fr 0.25fr 0.5fr 0fr'
      )
      const items = ticks.findAll('.form-range-tick')
      expect(items).toHaveLength(4)
      expect(items.map((i) => i.text())).toEqual(['0', '', 'Half', '100'])
      expect(items[1]?.find('.form-range-tick-label').exists()).toBe(false)
      expect(items[0]?.attributes('style')).toContain('grid-column-start: 2')
      const datalist = wrapper.find('datalist')
      expect(datalist.attributes('id')).toBe('r__ticks')
      expect(wrapper.find('input').attributes('list')).toBe('r__ticks')
      expect(datalist.findAll('option').map((o) => o.attributes('value'))).toEqual([
        '0',
        '25',
        '50',
        '100',
      ])
    })

    it('formats tick labels with formatter', () => {
      const wrapper = mount(BFormRange, {
        props: {ticks: [0, 100], formatter: (v: number) => `${v}%`},
      })
      expect(wrapper.findAll('.form-range-tick-label').map((l) => l.text())).toEqual(['0%', '100%'])
    })
  })

  describe('model and events', () => {
    it('emits a number on input', async () => {
      const wrapper = mount(BFormRange)
      const input = wrapper.find('input')
      ;(input.element as HTMLInputElement).value = '70'
      await input.trigger('input')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([70])
    })

    it('emits change with a number', async () => {
      const wrapper = mount(BFormRange)
      const input = wrapper.find('input')
      ;(input.element as HTMLInputElement).value = '20'
      await input.trigger('change')
      expect(wrapper.emitted('change')?.[0]).toEqual([20])
    })
  })

  describe('state and form field', () => {
    it('puts the state class on the input and aria-invalid', () => {
      const wrapper = mount(BFormRange, {props: {state: false}})
      const input = wrapper.find('input')
      expect(input.classes()).toContain('is-invalid')
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(wrapper.classes()).not.toContain('is-invalid')
    })

    it('inherits state and disabled from a form field', () => {
      const wrapper = mount(BFormRange, {
        global: {provide: provideFormGroupStub(ref(true), ref(true))},
      })
      const input = wrapper.find('input')
      expect(input.classes()).toContain('is-valid')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('passes name, form and required to the input', () => {
      const wrapper = mount(BFormRange, {props: {name: 'n', form: 'f', required: true}})
      const input = wrapper.find('input')
      expect(input.attributes('name')).toBe('n')
      expect(input.attributes('form')).toBe('f')
      expect(input.attributes('required')).toBeDefined()
    })
  })

  describe('expose', () => {
    it('exposes element, focus and blur', () => {
      const wrapper = mount(BFormRange, {attachTo: document.body})
      expect(wrapper.vm.element).toBeInstanceOf(HTMLInputElement)
      wrapper.vm.focus()
      expect(document.activeElement).toBe(wrapper.vm.element)
      wrapper.vm.blur()
      expect(document.activeElement).not.toBe(wrapper.vm.element)
    })
  })
})
