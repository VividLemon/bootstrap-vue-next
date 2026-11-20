import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {defineComponent, h, nextTick, ref} from 'vue'
import {renderToString} from 'vue/server-renderer'
import BStepper from './BStepper.vue'
import BStepperItem from './BStepperItem.vue'

const steps = (labels: string[] = ['One', 'Two', 'Three']) =>
  labels.map((label) => h(BStepperItem, {key: label}, {default: () => label}))

const states = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('.stepper-item').map((item) => ({
    text: item.text(),
    active: item.classes().includes('active'),
    current: item.attributes('aria-current') === 'step',
  }))

describe('stepper', () => {
  enableAutoUnmount(afterEach)

  describe('markup', () => {
    it('renders ol.stepper with li.stepper-item children', () => {
      const wrapper = mount(BStepper, {slots: {default: () => steps()}})
      expect(wrapper.element.tagName).toBe('OL')
      expect(wrapper.classes()).toEqual(['stepper'])
      const items = wrapper.findAll('.stepper-item')
      expect(items).toHaveLength(3)
      expect(items.every((item) => item.element.tagName === 'LI')).toBe(true)
    })

    it('tag changes the root element', () => {
      const wrapper = mount(BStepper, {props: {tag: 'div'}})
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('horizontal true adds stepper-horizontal', () => {
      const wrapper = mount(BStepper, {props: {horizontal: true}})
      expect(wrapper.classes()).toContain('stepper-horizontal')
    })

    it('horizontal breakpoint adds the prefix class', () => {
      const wrapper = mount(BStepper, {props: {horizontal: 'md'}})
      expect(wrapper.classes()).toContain('md:stepper-horizontal')
      expect(wrapper.classes()).not.toContain('stepper-horizontal')
    })

    it('horizontal false adds nothing', () => {
      const wrapper = mount(BStepper, {props: {horizontal: false}})
      expect(wrapper.classes()).toEqual(['stepper'])
    })

    it('overflow wraps the stepper in div.stepper-overflow', () => {
      const wrapper = mount(BStepper, {props: {overflow: true}, attrs: {class: 'foo'}})
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.classes()).toEqual(['stepper-overflow'])
      const stepper = wrapper.get('.stepper')
      expect(stepper.element.tagName).toBe('OL')
      expect(stepper.classes()).toContain('foo')
    })

    it('passes attrs to the stepper', () => {
      const wrapper = mount(BStepper, {attrs: {'class': 'foo', 'aria-label': 'Progress'}})
      expect(wrapper.classes()).toContain('foo')
      expect(wrapper.attributes('aria-label')).toBe('Progress')
    })
  })

  describe('v-model', () => {
    it('marks no item without a model', () => {
      const wrapper = mount(BStepper, {slots: {default: () => steps()}})
      expect(states(wrapper).every((s) => !s.active && !s.current)).toBe(true)
    })

    it('marks completed and current steps active, the current with aria-current', async () => {
      const wrapper = mount(BStepper, {props: {modelValue: 1}, slots: {default: () => steps()}})
      await nextTick()
      expect(states(wrapper)).toEqual([
        {text: 'One', active: true, current: false},
        {text: 'Two', active: true, current: true},
        {text: 'Three', active: false, current: false},
      ])
    })

    it('reacts to model changes', async () => {
      const wrapper = mount(BStepper, {props: {modelValue: 0}, slots: {default: () => steps()}})
      await wrapper.setProps({modelValue: 2})
      expect(states(wrapper).map((s) => s.active)).toEqual([true, true, true])
      expect(states(wrapper).map((s) => s.current)).toEqual([false, false, true])
    })

    it('item active and current props override the derived state', () => {
      const wrapper = mount(BStepper, {
        props: {modelValue: 0},
        slots: {
          default: () => [
            h(BStepperItem, {active: false}, () => 'One'),
            h(BStepperItem, {active: true}, () => 'Two'),
            h(BStepperItem, {current: true}, () => 'Three'),
          ],
        },
      })
      expect(states(wrapper)).toEqual([
        {text: 'One', active: false, current: true},
        {text: 'Two', active: true, current: false},
        {text: 'Three', active: false, current: true},
      ])
    })

    it('follows the DOM order after a v-for reorder', async () => {
      const Parent = defineComponent({
        setup() {
          const labels = ref(['A', 'B', 'C'])
          return {labels}
        },
        render() {
          return h(BStepper, {modelValue: 0}, {default: () => steps(this.labels)})
        },
      })
      const wrapper = mount(Parent)
      await nextTick()
      ;(wrapper.vm as unknown as {labels: string[]}).labels = ['C', 'A', 'B']
      await nextTick()
      await nextTick()
      expect(states(wrapper).map((s) => `${s.text}${s.current ? '*' : ''}`)).toEqual([
        'C*',
        'A',
        'B',
      ])
    })

    it('updates indexes when an item is removed', async () => {
      const Parent = defineComponent({
        setup() {
          const labels = ref(['A', 'B', 'C'])
          return {labels}
        },
        render() {
          return h(BStepper, {modelValue: 1}, {default: () => steps(this.labels)})
        },
      })
      const wrapper = mount(Parent)
      ;(wrapper.vm as unknown as {labels: string[]}).labels = ['B', 'C']
      await nextTick()
      await nextTick()
      expect(states(wrapper).map((s) => s.current)).toEqual([false, true])
    })
  })

  describe('ssr', () => {
    it('renders active and aria-current on the server', async () => {
      const html = await renderToString(h(BStepper, {modelValue: 1}, {default: () => steps()}))
      expect(html.match(/class="stepper-item active"/g)).toHaveLength(2)
      expect(html.match(/aria-current="step"/g)).toHaveLength(1)
    })
  })
})
