import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {h, nextTick} from 'vue'
import BAccordion from './BAccordion.vue'
import BAccordionItem from './BAccordionItem.vue'

const setOpen = async (el: Element, open: boolean) => {
  ;(el as HTMLDetailsElement).open = open
  el.dispatchEvent(new Event('toggle'))
  await nextTick()
}

describe('accordion', () => {
  enableAutoUnmount(afterEach)

  it('renders a div.accordion with an id', () => {
    const wrapper = mount(BAccordion)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('accordion')
    expect(wrapper.attributes('id')).toBeDefined()
  })

  it('uses the id prop', () => {
    const wrapper = mount(BAccordion, {props: {id: 'foo'}})
    expect(wrapper.attributes('id')).toBe('foo')
  })

  it('has accordion-flush class when flush', () => {
    const wrapper = mount(BAccordion, {props: {flush: true}})
    expect(wrapper.classes()).toContain('accordion-flush')
  })

  it('renders default slot', () => {
    const wrapper = mount(BAccordion, {slots: {default: '<span class="foo"></span>'}})
    expect(wrapper.find('.foo').exists()).toBe(true)
  })

  it('items share the accordion id as name when not free', () => {
    const wrapper = mount(BAccordion, {
      props: {id: 'acc'},
      slots: {default: () => [h(BAccordionItem, {id: 'a'}), h(BAccordionItem, {id: 'b'})]},
    })
    const items = wrapper.findAll('details')
    expect(items).toHaveLength(2)
    expect(items.every((i) => i.attributes('name') === 'acc')).toBe(true)
  })

  it('items have no name when free', () => {
    const wrapper = mount(BAccordion, {
      props: {free: true},
      slots: {default: () => [h(BAccordionItem, {id: 'a'})]},
    })
    expect(wrapper.find('details').attributes('name')).toBeUndefined()
  })

  it('opens the item matching modelValue', () => {
    const wrapper = mount(BAccordion, {
      props: {modelValue: 'b'},
      slots: {default: () => [h(BAccordionItem, {id: 'a'}), h(BAccordionItem, {id: 'b'})]},
    })
    const [a, b] = wrapper.findAll('details')
    expect(a!.element.open).toBe(false)
    expect(b!.element.open).toBe(true)
  })

  it('opens multiple items when free and modelValue is an array', () => {
    const wrapper = mount(BAccordion, {
      props: {free: true, modelValue: ['a', 'b']},
      slots: {default: () => [h(BAccordionItem, {id: 'a'}), h(BAccordionItem, {id: 'b'})]},
    })
    expect(wrapper.findAll('details').every((d) => d.element.open)).toBe(true)
  })

  it('emits update:modelValue when an item is toggled', async () => {
    const wrapper = mount(BAccordion, {
      slots: {default: () => [h(BAccordionItem, {id: 'a'}), h(BAccordionItem, {id: 'b'})]},
    })
    const [a, b] = wrapper.findAll('details')
    await setOpen(a!.element, true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a'])
    await setOpen(b!.element, true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
    await setOpen(b!.element, false)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
  })

  it('collects multiple open ids when free', async () => {
    const wrapper = mount(BAccordion, {
      props: {free: true},
      slots: {default: () => [h(BAccordionItem, {id: 'a'}), h(BAccordionItem, {id: 'b'})]},
    })
    const [a, b] = wrapper.findAll('details')
    await setOpen(a!.element, true)
    await wrapper.setProps({modelValue: ['a']})
    await setOpen(b!.element, true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'b']])
  })
})

describe('accordion-item', () => {
  it('renders details > summary + body', () => {
    const wrapper = mount(BAccordionItem, {props: {title: 'T'}, slots: {default: 'Body'}})
    expect(wrapper.element.tagName).toBe('DETAILS')
    expect(wrapper.classes()).toContain('accordion-item')
    const summary = wrapper.find('summary')
    expect(summary.classes()).toContain('accordion-header')
    expect(summary.text()).toBe('T')
    expect(summary.find('svg.accordion-icon').exists()).toBe(true)
    expect(wrapper.find('.accordion-body').text()).toBe('Body')
  })

  it('title slot takes precedence', () => {
    const wrapper = mount(BAccordionItem, {props: {title: 'T'}, slots: {title: 'Slot'}})
    expect(wrapper.find('summary').text()).toBe('Slot')
  })

  it('applies header and body class/attrs', () => {
    const wrapper = mount(BAccordionItem, {
      props: {
        headerClass: 'hc',
        headerAttrs: {'data-h': '1'},
        bodyClass: 'bc',
        bodyAttrs: {'data-b': '1'},
      },
    })
    expect(wrapper.find('summary').classes()).toContain('hc')
    expect(wrapper.find('summary').attributes('data-h')).toBe('1')
    expect(wrapper.find('.accordion-body').classes()).toContain('bc')
    expect(wrapper.find('.accordion-body').attributes('data-b')).toBe('1')
  })

  it('uses id prop', () => {
    const wrapper = mount(BAccordionItem, {props: {id: 'x'}})
    expect(wrapper.attributes('id')).toBe('x')
  })

  it('is open when modelValue is true (standalone)', () => {
    const wrapper = mount(BAccordionItem, {props: {modelValue: true}})
    expect(wrapper.element.open).toBe(true)
  })

  it('emits update:modelValue and toggle on native toggle', async () => {
    const wrapper = mount(BAccordionItem)
    await setOpen(wrapper.element, true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
    expect(wrapper.emitted('toggle')).toBeDefined()
  })

  it('opens the item in parent when modelValue is initially true', async () => {
    const wrapper = mount(BAccordion, {
      slots: {default: () => [h(BAccordionItem, {id: 'a', modelValue: true})]},
    })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a'])
  })
})
