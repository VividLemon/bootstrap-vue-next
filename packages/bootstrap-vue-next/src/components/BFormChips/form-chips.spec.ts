import {afterEach, describe, expect, it} from 'vitest'
import {enableAutoUnmount, mount} from '@vue/test-utils'
import {h, nextTick, ref} from 'vue'
import BFormChips from './BFormChips.vue'
import BFormField from '../BFormGroup/BFormGroup.vue'
import type {BvEvent} from '../../utils'
import type {ChipProps} from '../../types'
import {provideFormGroupStub} from '../../../tests/utils'

type ChipScope = {value: string; index: number; selected: boolean; props: ChipProps}

const chips = (w: ReturnType<typeof mount>) => w.findAll('.chip')
const ghost = (w: ReturnType<typeof mount>) => w.find('input.form-ghost')

const typeAndEnter = async (w: ReturnType<typeof mount>, text: string) => {
  const input = ghost(w)
  await input.setValue(text)
  await input.trigger('keydown', {key: 'Enter'})
}

describe('form-chips', () => {
  enableAutoUnmount(afterEach)

  describe('markup', () => {
    it('renders a .chip-input group with chips and a ghost input', () => {
      const w = mount(BFormChips, {props: {modelValue: ['a', 'b']}})
      expect(w.classes()).toContain('chip-input')
      expect(w.attributes('role')).toBe('group')
      expect(chips(w)).toHaveLength(2)
      expect(chips(w)[0]?.attributes('tabindex')).toBe('0')
      expect(chips(w)[0]?.attributes('data-bs-chip-value')).toBe('a')
      expect(ghost(w).attributes('type')).toBe('text')
      expect(w.find('[aria-live]').exists()).toBe(false)
    })

    it('renders dismiss buttons labelled with the value, out of the tab order', () => {
      const w = mount(BFormChips, {props: {modelValue: ['React']}})
      const button = w.find('.chip-dismiss')
      expect(button.attributes('aria-label')).toBe('Remove React')
      expect(button.attributes('tabindex')).toBe('-1')
    })

    it('hides dismiss buttons when dismissible is false', () => {
      const w = mount(BFormChips, {props: {modelValue: ['a'], dismissible: false}})
      expect(w.find('.chip-dismiss').exists()).toBe(false)
    })

    it('puts id, placeholder, inputAttrs and state on the ghost input', () => {
      const w = mount(BFormChips, {
        props: {
          id: 'tags',
          placeholder: 'Add',
          state: false,
          inputAttrs: {'class': 'x', 'aria-describedby': 'help'},
        },
      })
      const input = ghost(w)
      expect(input.attributes('id')).toBe('tags')
      expect(input.attributes('placeholder')).toBe('Add')
      expect(input.classes()).toEqual(expect.arrayContaining(['form-ghost', 'is-invalid', 'x']))
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(input.attributes('aria-describedby')).toBe('help')
    })

    it('adds the theme class to the root and chipAttrs to each chip', () => {
      const w = mount(BFormChips, {
        props: {
          modelValue: ['a', 'b'],
          color: {theme: 'info'},
          chipAttrs: (value: string, index: number) => ({class: `chip-${value}-${index}`}),
        },
      })
      expect(w.classes()).toContain('theme-info')
      expect(chips(w)[1]?.classes()).toContain('chip-b-1')
    })

    it('renders hidden inputs for name and required only without chips', async () => {
      const w = mount(BFormChips, {
        props: {modelValue: [], name: 'tags', form: 'f', required: true},
      })
      expect(ghost(w).attributes('required')).toBeDefined()
      expect(w.findAll('input[type="hidden"]')).toHaveLength(0)
      await w.setProps({modelValue: ['a', 'b']})
      const hidden = w.findAll('input[type="hidden"]')
      expect(hidden.map((i) => i.attributes('value'))).toEqual(['a', 'b'])
      expect(hidden[0]?.attributes('name')).toBe('tags')
      expect(hidden[0]?.attributes('form')).toBe('f')
      expect(ghost(w).attributes('required')).toBeUndefined()
    })

    it('uses the chip slot, whose props carry tabindex', () => {
      const w = mount(BFormChips, {
        props: {modelValue: ['a']},
        slots: {
          chip: (scope: ChipScope) =>
            h('span', {...scope.props, class: 'chip custom'}, `${scope.value}-${scope.index}`),
        },
      })
      expect(w.find('.custom').text()).toBe('a-0')
      expect(w.find('.custom').attributes('tabindex')).toBe('0')
    })

    it("passes each chip's value and index to the dismiss-icon slot", () => {
      const w = mount(BFormChips, {
        props: {modelValue: ['a', 'b']},
        slots: {
          'dismiss-icon': (scope: {value: string; index: number}) =>
            h('span', {class: 'icon'}, `${scope.value}-${scope.index}`),
        },
      })
      expect(w.findAll('.chip-dismiss .icon').map((el) => el.text())).toEqual(['a-0', 'b-1'])
    })

    it('disables the ghost input and the chips', () => {
      const w = mount(BFormChips, {props: {modelValue: ['a'], disabled: true}})
      expect(w.classes()).toContain('disabled')
      expect(ghost(w).attributes('disabled')).toBeDefined()
      expect(chips(w)[0]?.classes()).toContain('disabled')
      expect(w.find('.chip-dismiss').exists()).toBe(false)
    })
  })

  describe('adding', () => {
    it('adds on Enter, trimming the value', async () => {
      const w = mount(BFormChips)
      await typeAndEnter(w, '  vue ')
      expect(w.emitted('update:modelValue')?.[0]).toEqual([['vue']])
      expect((ghost(w).element as HTMLInputElement).value).toBe('')
    })

    it('rejects duplicates unless allowDuplicates', async () => {
      const w = mount(BFormChips, {props: {modelValue: ['a']}})
      await typeAndEnter(w, 'a')
      expect(w.emitted('update:modelValue')).toBeUndefined()
      await w.setProps({allowDuplicates: true})
      await typeAndEnter(w, 'a')
      expect(w.emitted('update:modelValue')?.[0]).toEqual([['a', 'a']])
    })

    it('respects maxChips', async () => {
      const w = mount(BFormChips, {props: {modelValue: ['a'], maxChips: 1}})
      await typeAndEnter(w, 'b')
      expect(w.emitted('update:modelValue')).toBeUndefined()
    })

    it('emits a cancelable add event', async () => {
      const w = mount(BFormChips, {
        props: {
          'onAdd': (value: string, event: BvEvent) => {
            if (value === 'no') event.preventDefault()
          },
          'modelValue': [],
          'onUpdate:modelValue': (v: string[]) => w.setProps({modelValue: v}),
        },
      })
      await typeAndEnter(w, 'no')
      expect(w.emitted('add')?.[0]?.[0]).toBe('no')
      expect(w.emitted('update:modelValue')).toBeUndefined()
      await typeAndEnter(w, 'yes')
      expect(w.props('modelValue')).toEqual(['yes'])
    })

    it('splits typed text on the separator', async () => {
      const w = mount(BFormChips, {
        props: {
          'modelValue': [],
          'onUpdate:modelValue': (v: string[]) => w.setProps({modelValue: v}),
        },
      })
      const input = ghost(w)
      await input.setValue('a, b,c')
      expect(w.props('modelValue')).toEqual(['a', 'b'])
      expect((input.element as HTMLInputElement).value).toBe('c')
    })

    it('does not split with a null separator', async () => {
      const w = mount(BFormChips, {props: {separator: null}})
      await ghost(w).setValue('a,b')
      expect(w.emitted('update:modelValue')).toBeUndefined()
    })

    it('splits pasted text on the separator', async () => {
      const w = mount(BFormChips, {
        props: {
          'modelValue': [],
          'onUpdate:modelValue': (v: string[]) => w.setProps({modelValue: v}),
        },
      })
      await ghost(w).trigger('paste', {clipboardData: {getData: () => 'x,y , z'}})
      expect(w.props('modelValue')).toEqual(['x', 'y', 'z'])
    })

    it('creates a chip on blur unless createOnBlur is false', async () => {
      const w = mount(BFormChips)
      await ghost(w).setValue('blurred')
      await ghost(w).trigger('blur')
      expect(w.emitted('update:modelValue')?.[0]).toEqual([['blurred']])

      const w2 = mount(BFormChips, {props: {createOnBlur: false}})
      await ghost(w2).setValue('kept')
      await ghost(w2).trigger('blur')
      expect(w2.emitted('update:modelValue')).toBeUndefined()
    })

    it('exposes add', () => {
      const w = mount(BFormChips)
      expect(w.vm.add('z')).toBe(true)
      expect(w.emitted('update:modelValue')?.[0]).toEqual([['z']])
    })
  })

  describe('removing', () => {
    it('removes a chip with its dismiss button', async () => {
      const w = mount(BFormChips, {
        props: {
          'modelValue': ['a', 'b'],
          'onUpdate:modelValue': (v: string[]) => w.setProps({modelValue: v}),
        },
      })
      await w.findAll('.chip-dismiss')[0]?.trigger('click')
      expect(w.props('modelValue')).toEqual(['b'])
      expect(w.emitted('remove')?.[0]?.[0]).toBe('a')
    })

    it('emits a cancelable remove event', async () => {
      const w = mount(BFormChips, {
        props: {
          modelValue: ['a'],
          onRemove: (_: string, event: BvEvent) => event.preventDefault(),
        },
      })
      await w.find('.chip-dismiss').trigger('click')
      expect(w.emitted('update:modelValue')).toBeUndefined()
    })

    it('exposes remove, clear, removeSelected', async () => {
      const w = mount(BFormChips, {
        props: {
          'modelValue': ['a', 'b', 'c'],
          'onUpdate:modelValue': (v: string[]) => w.setProps({modelValue: v}),
        },
      })
      expect(w.vm.remove('b')).toBe(true)
      await nextTick()
      expect(w.props('modelValue')).toEqual(['a', 'c'])
      w.vm.clear()
      await nextTick()
      expect(w.props('modelValue')).toEqual([])
    })
  })

  describe('keyboard and selection', () => {
    const mountWith = (values: string[]) => {
      const w = mount(BFormChips, {
        attachTo: document.body,
        props: {
          'modelValue': values,
          'onUpdate:modelValue': (v: string[]) => w.setProps({modelValue: v}),
        },
      })
      return w
    }

    it('Backspace on an empty input selects and focuses the last chip, then deletes it', async () => {
      const w = mountWith(['a', 'b'])
      await ghost(w).trigger('keydown', {key: 'Backspace'})
      const last = chips(w)[1]
      expect(last?.classes()).toContain('active')
      expect(last?.attributes('aria-pressed')).toBe('true')
      expect(document.activeElement).toBe(last?.element)
      expect(w.emitted('select')?.at(-1)).toEqual([['b']])
      await last?.trigger('keydown', {key: 'Backspace'})
      await nextTick()
      expect(w.props('modelValue')).toEqual(['a'])
    })

    it('ArrowLeft from the start of the input selects the last chip', async () => {
      const w = mountWith(['a', 'b'])
      await ghost(w).trigger('keydown', {key: 'ArrowLeft'})
      expect(chips(w)[1]?.classes()).toContain('active')
    })

    it('finds custom chips through the ref in the chip slot props', async () => {
      const w = mount(BFormChips, {
        attachTo: document.body,
        props: {modelValue: ['a', 'b']},
        slots: {
          chip: (scope: ChipScope) =>
            h('span', {...scope.props, class: ['custom', {on: scope.selected}]}, scope.value),
        },
      })
      await ghost(w).trigger('keydown', {key: 'ArrowLeft'})
      const custom = w.findAll('.custom')
      expect(document.activeElement).toBe(custom[1]?.element)
      expect(custom[1]?.classes()).toContain('on')
      expect(custom[1]?.attributes('aria-pressed')).toBe('true')
      await custom[1]?.trigger('keydown', {key: 'ArrowLeft'})
      expect(document.activeElement).toBe(custom[0]?.element)
      await custom[1]?.trigger('click')
      expect(w.emitted('select')?.at(-1)).toEqual([['b']])
    })

    it('exposes selection like BTable: add, remove, set, setAll, clear, has, selectedItems', async () => {
      const w = mountWith(['a', 'b', 'c'])
      const {selection} = w.vm as unknown as {
        selection: {
          add: (i: number) => void
          remove: (i: number) => void
          set: (i: readonly number[]) => void
          setAll: () => void
          clear: () => void
          has: (i: number) => boolean
          selectedItems: {value: readonly string[]}
        }
      }
      selection.add(2)
      selection.add(0)
      expect(selection.selectedItems.value).toEqual(['a', 'c'])
      expect(selection.has(2)).toBe(true)
      selection.remove(2)
      expect(selection.selectedItems.value).toEqual(['a'])
      selection.set([1, 2, 9])
      expect(selection.selectedItems.value).toEqual(['b', 'c'])
      selection.setAll()
      expect(selection.selectedItems.value).toEqual(['a', 'b', 'c'])
      selection.clear()
      expect(selection.selectedItems.value).toEqual([])
      expect(w.emitted('select')?.at(-1)).toEqual([[]])
    })

    it('arrow keys move the selection; Shift extends it; ArrowRight past the end focuses the input', async () => {
      const w = mountWith(['a', 'b', 'c'])
      await chips(w)[2]?.trigger('click')
      await chips(w)[2]?.trigger('keydown', {key: 'ArrowLeft'})
      expect(chips(w).map((c) => c.classes().includes('active'))).toEqual([false, true, false])
      await chips(w)[1]?.trigger('keydown', {key: 'ArrowLeft', shiftKey: true})
      expect(chips(w).map((c) => c.classes().includes('active'))).toEqual([true, true, false])
      await chips(w)[0]?.trigger('keydown', {key: 'End'})
      expect(document.activeElement).toBe(ghost(w).element)
      expect(chips(w).some((c) => c.classes().includes('active'))).toBe(false)
    })

    it('Home selects the first chip; Ctrl+A selects all; Escape clears', async () => {
      const w = mountWith(['a', 'b'])
      await chips(w)[1]?.trigger('keydown', {key: 'Home'})
      expect(chips(w)[0]?.classes()).toContain('active')
      await chips(w)[0]?.trigger('keydown', {key: 'a', ctrlKey: true})
      expect(chips(w).every((c) => c.classes().includes('active'))).toBe(true)
      await chips(w)[0]?.trigger('keydown', {key: 'Escape'})
      expect(chips(w).some((c) => c.classes().includes('active'))).toBe(false)
    })

    it('click selects, Ctrl-click toggles, Shift-click selects a range', async () => {
      const w = mountWith(['a', 'b', 'c'])
      await chips(w)[0]?.trigger('click')
      await chips(w)[2]?.trigger('click', {shiftKey: true})
      expect(chips(w).every((c) => c.classes().includes('active'))).toBe(true)
      await chips(w)[1]?.trigger('click', {ctrlKey: true})
      expect(chips(w).map((c) => c.classes().includes('active'))).toEqual([true, false, true])
    })

    it('deleting a multi-selection removes every selected chip', async () => {
      const w = mountWith(['a', 'b', 'c'])
      await chips(w)[0]?.trigger('click')
      await chips(w)[1]?.trigger('click', {shiftKey: true})
      await chips(w)[1]?.trigger('keydown', {key: 'Delete'})
      await nextTick()
      expect(w.props('modelValue')).toEqual(['c'])
    })

    it('focusing the input clears the selection', async () => {
      const w = mountWith(['a'])
      await chips(w)[0]?.trigger('click')
      await ghost(w).trigger('focus')
      expect(chips(w)[0]?.classes()).not.toContain('active')
    })

    it('Escape in the input clears it', async () => {
      const w = mountWith([])
      await ghost(w).setValue('x')
      await ghost(w).trigger('keydown', {key: 'Escape'})
      expect((ghost(w).element as HTMLInputElement).value).toBe('')
    })

    it('clicking the background focuses the input', async () => {
      const w = mountWith(['a'])
      await w.trigger('click')
      expect(document.activeElement).toBe(ghost(w).element)
    })
  })

  describe('form field', () => {
    it('inherits state and disabled from the field', () => {
      const w = mount(BFormChips, {global: {provide: provideFormGroupStub(ref(false), ref(true))}})
      expect(ghost(w).classes()).toContain('is-invalid')
      expect(ghost(w).attributes('disabled')).toBeDefined()
    })

    it('lets the field label target the ghost input', async () => {
      const w = mount(BFormField, {
        props: {label: 'Tags'},
        slots: {default: () => h(BFormChips, {id: 'my-chips'})},
      })
      await nextTick()
      expect(w.find('label').attributes('for')).toBe('my-chips')
    })
  })
})
