import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {defineComponent, h, nextTick, ref} from 'vue'
import {renderToString} from 'vue/server-renderer'
import BAccordion from './BAccordion.vue'
import BAccordionItem from './BAccordionItem.vue'

const nativeToggle = async (el: Element, open: boolean) => {
  // happy-dom dispatches `toggle` synchronously when `open` changes (browsers do it async)
  ;(el as HTMLDetailsElement).open = open
  await nextTick()
}

const items = (ids: string[] = ['a', 'b', 'c']) =>
  ids.map((id) => h(BAccordionItem, {id, title: id}, {default: () => `body ${id}`}))

const isOpen = (wrapper: ReturnType<typeof mount>, id: string) =>
  (wrapper.get(`#${id}`).element as HTMLDetailsElement).open

describe('accordion', () => {
  enableAutoUnmount(afterEach)

  describe('markup', () => {
    it('renders div.accordion', () => {
      const wrapper = mount(BAccordion)
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.classes()).toEqual(['accordion'])
    })

    it('uses the id prop', () => {
      const wrapper = mount(BAccordion, {props: {id: 'acc'}})
      expect(wrapper.attributes('id')).toBe('acc')
    })

    it('flush adds accordion-flush', () => {
      const wrapper = mount(BAccordion, {props: {flush: true}})
      expect(wrapper.classes()).toContain('accordion-flush')
    })

    it('gap adds accordion-gap', () => {
      const wrapper = mount(BAccordion, {props: {gap: true}})
      expect(wrapper.classes()).toContain('accordion-gap')
    })

    it('size sm adds accordion-sm, md adds nothing', async () => {
      const wrapper = mount(BAccordion, {props: {size: 'sm'}})
      expect(wrapper.classes()).toContain('accordion-sm')
      await wrapper.setProps({size: 'md'})
      expect(wrapper.classes()).toEqual(['accordion'])
    })

    it('color theme adds theme class', () => {
      const wrapper = mount(BAccordion, {props: {color: {theme: 'primary'}}})
      expect(wrapper.classes()).toContain('theme-primary')
    })

    it('noTransition sets the transition tokens inline', () => {
      const wrapper = mount(BAccordion, {props: {noTransition: true}})
      expect(wrapper.attributes('style')).toContain('--bs-accordion-panel-transition-duration: 0s')
    })
  })

  describe('name', () => {
    it('items share the accordion id as name', () => {
      const wrapper = mount(BAccordion, {props: {id: 'acc'}, slots: {default: () => items()}})
      const names = wrapper.findAll('details').map((d) => d.attributes('name'))
      expect(names).toEqual(['acc', 'acc', 'acc'])
    })

    it('name prop overrides the generated name', () => {
      const wrapper = mount(BAccordion, {
        props: {id: 'acc', name: 'group'},
        slots: {default: () => items()},
      })
      expect(wrapper.get('details').attributes('name')).toBe('group')
    })

    it('free omits the name', () => {
      const wrapper = mount(BAccordion, {props: {free: true}, slots: {default: () => items()}})
      expect(wrapper.get('details').attributes('name')).toBeUndefined()
    })
  })

  describe('exclusive v-model', () => {
    it('opens the item matching modelValue', () => {
      const wrapper = mount(BAccordion, {props: {modelValue: 'b'}, slots: {default: () => items()}})
      expect(isOpen(wrapper, 'a')).toBe(false)
      expect(isOpen(wrapper, 'b')).toBe(true)
      expect(isOpen(wrapper, 'c')).toBe(false)
    })

    it('changing modelValue moves the open item', async () => {
      const wrapper = mount(BAccordion, {props: {modelValue: 'a'}, slots: {default: () => items()}})
      await wrapper.setProps({modelValue: 'c'})
      expect(isOpen(wrapper, 'a')).toBe(false)
      expect(isOpen(wrapper, 'c')).toBe(true)
      await wrapper.setProps({modelValue: undefined})
      expect(isOpen(wrapper, 'c')).toBe(false)
    })

    it('a native toggle updates the model', async () => {
      const wrapper = mount(BAccordion, {slots: {default: () => items()}})
      await nativeToggle(wrapper.get('#b').element, true)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
    })

    it('native exclusivity closing a sibling keeps a single id', async () => {
      const wrapper = mount(BAccordion, {props: {modelValue: 'a'}, slots: {default: () => items()}})
      // The browser closes "a" and opens "b"; both toggle events arrive in either order
      await nativeToggle(wrapper.get('#a').element, false)
      await nativeToggle(wrapper.get('#b').element, true)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
    })

    it('closing the open item clears the model', async () => {
      const wrapper = mount(BAccordion, {props: {modelValue: 'a'}, slots: {default: () => items()}})
      await nativeToggle(wrapper.get('#a').element, false)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
    })

    it('opening an item while another is open replaces the id', async () => {
      const Parent = defineComponent({
        setup() {
          const open = ref<string | readonly string[] | undefined>('a')
          return () =>
            h(
              BAccordion,
              {
                'modelValue': open.value,
                'onUpdate:modelValue': (v: typeof open.value) => (open.value = v),
              },
              {default: () => items()}
            )
        },
      })
      const wrapper = mount(Parent)
      await nativeToggle(wrapper.get('#c').element, true)
      await nextTick()
      expect(isOpen(wrapper, 'c')).toBe(true)
      expect(isOpen(wrapper, 'a')).toBe(false)
    })

    it('an item with v-model true opens in the parent', () => {
      const wrapper = mount(BAccordion, {
        slots: {
          default: () => [
            h(BAccordionItem, {id: 'a'}),
            h(BAccordionItem, {id: 'b', modelValue: true}),
          ],
        },
      })
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
    })
  })

  describe('free v-model', () => {
    it('opens every listed item', () => {
      const wrapper = mount(BAccordion, {
        props: {free: true, modelValue: ['a', 'c']},
        slots: {default: () => items()},
      })
      expect(isOpen(wrapper, 'a')).toBe(true)
      expect(isOpen(wrapper, 'b')).toBe(false)
      expect(isOpen(wrapper, 'c')).toBe(true)
    })

    it('native toggles add and remove ids', async () => {
      const wrapper = mount(BAccordion, {
        props: {free: true, modelValue: ['a']},
        slots: {default: () => items()},
      })
      await nativeToggle(wrapper.get('#b').element, true)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'b']])
    })

    it('removing the last id clears the model', async () => {
      const wrapper = mount(BAccordion, {
        props: {free: true, modelValue: ['a']},
        slots: {default: () => items()},
      })
      await nativeToggle(wrapper.get('#a').element, false)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
    })

    it('switching free on wraps the id in an array', async () => {
      const wrapper = mount(BAccordion, {props: {modelValue: 'a'}, slots: {default: () => items()}})
      await wrapper.setProps({free: true})
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a']])
    })

    it('switching free off keeps the first id', async () => {
      const wrapper = mount(BAccordion, {
        props: {free: true, modelValue: ['b', 'c']},
        slots: {default: () => items()},
      })
      await wrapper.setProps({free: false})
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['b'])
    })
  })

  describe('lazy', () => {
    it('lazy is inherited by items', async () => {
      const wrapper = mount(BAccordion, {props: {lazy: true}, slots: {default: () => items()}})
      expect(wrapper.get('#a .accordion-body').text()).toBe('')
      await nativeToggle(wrapper.get('#a').element, true)
      expect(wrapper.get('#a .accordion-body').text()).toBe('body a')
    })
  })

  describe('ssr', () => {
    it('renders exactly one open item for an exclusive model', async () => {
      const html = await renderToString(
        h(BAccordion, {id: 'acc', modelValue: 'b'}, {default: () => items()})
      )
      expect(html.match(/<details[^>]*\sopen/g)).toHaveLength(1)
      expect(html).toMatch(/<details[^>]*id="b"[^>]*\sopen|<details[^>]*\sopen[^>]*id="b"/)
      expect(html).toContain('name="acc"')
    })
  })
})
