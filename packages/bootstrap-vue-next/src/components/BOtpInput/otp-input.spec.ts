import {afterEach, describe, expect, it} from 'vitest'
import {enableAutoUnmount, mount} from '@vue/test-utils'
import {nextTick} from 'vue'
import BOtpInput from './BOtpInput.vue'

describe('otp-input', () => {
  enableAutoUnmount(afterEach)

  const getInputs = (wrapper: ReturnType<typeof mount>) =>
    wrapper.findAll('input') as ReturnType<ReturnType<typeof mount>['findAll']>

  describe('rendering', () => {
    it('renders a div container element', () => {
      const wrapper = mount(BOtpInput)
      expect(wrapper.element.tagName).toBe('DIV')
    })

    it('renders 6 input fields by default', () => {
      const wrapper = mount(BOtpInput)
      expect(getInputs(wrapper)).toHaveLength(6)
    })

    it('renders the specified number of inputs via length prop', () => {
      const wrapper = mount(BOtpInput, {props: {length: 4}})
      expect(getInputs(wrapper)).toHaveLength(4)
    })

    it('renders 3 inputs when length is 3', () => {
      const wrapper = mount(BOtpInput, {props: {length: 3}})
      expect(getInputs(wrapper)).toHaveLength(3)
    })

    it('accepts string length prop', () => {
      const wrapper = mount(BOtpInput, {props: {length: '8'}})
      expect(getInputs(wrapper)).toHaveLength(8)
    })

    it('has role="group" on the container', () => {
      const wrapper = mount(BOtpInput)
      expect(wrapper.attributes('role')).toBe('group')
    })

    it('has auto-generated id on the container', () => {
      const wrapper = mount(BOtpInput)
      expect(wrapper.attributes('id')).toBeDefined()
    })

    it('uses custom id when prop id is set', () => {
      const wrapper = mount(BOtpInput, {props: {id: 'my-otp'}})
      expect(wrapper.attributes('id')).toBe('my-otp')
    })

    it('each input has maxlength="1"', () => {
      const wrapper = mount(BOtpInput)
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('maxlength')).toBe('1')
      }
    })

    it('each input has inputmode="numeric"', () => {
      const wrapper = mount(BOtpInput)
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('inputmode')).toBe('numeric')
      }
    })
  })

  describe('CSS classes', () => {
    it('has bvn-otp-input class on container', () => {
      const wrapper = mount(BOtpInput)
      expect(wrapper.classes()).toContain('bvn-otp-input')
    })

    it('each input has form-control class', () => {
      const wrapper = mount(BOtpInput)
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.classes()).toContain('form-control')
      }
    })

    it('each input has bvn-otp-input-field class', () => {
      const wrapper = mount(BOtpInput)
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.classes()).toContain('bvn-otp-input-field')
      }
    })
  })

  describe('size prop', () => {
    it('applies form-control-sm class when size is sm', () => {
      const wrapper = mount(BOtpInput, {props: {size: 'sm'}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.classes()).toContain('form-control-sm')
      }
    })

    it('applies form-control-lg class when size is lg', () => {
      const wrapper = mount(BOtpInput, {props: {size: 'lg'}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.classes()).toContain('form-control-lg')
      }
    })

    it('does not apply size class when size is not set', () => {
      const wrapper = mount(BOtpInput)
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.classes().some((c) => c.startsWith('form-control-sm'))).toBe(false)
        expect(input.classes().some((c) => c.startsWith('form-control-lg'))).toBe(false)
      }
    })

    it('updates size class reactively', async () => {
      const wrapper = mount(BOtpInput, {props: {size: 'sm'}})
      const inputs = getInputs(wrapper)
      expect(inputs[0]!.classes()).toContain('form-control-sm')
      await wrapper.setProps({size: 'lg'})
      const updatedInputs = getInputs(wrapper)
      expect(updatedInputs[0]!.classes()).toContain('form-control-lg')
      expect(updatedInputs[0]!.classes()).not.toContain('form-control-sm')
    })
  })

  describe('state prop', () => {
    it('applies is-valid class when state is true', () => {
      const wrapper = mount(BOtpInput, {props: {state: true}})
      expect(wrapper.classes()).toContain('is-valid')
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.classes()).toContain('is-valid')
      }
    })

    it('applies is-invalid class when state is false', () => {
      const wrapper = mount(BOtpInput, {props: {state: false}})
      expect(wrapper.classes()).toContain('is-invalid')
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.classes()).toContain('is-invalid')
      }
    })

    it('does not apply state class when state is null', () => {
      const wrapper = mount(BOtpInput, {props: {state: null}})
      expect(wrapper.classes()).not.toContain('is-valid')
      expect(wrapper.classes()).not.toContain('is-invalid')
    })

    it('does not apply state class when state is undefined', () => {
      const wrapper = mount(BOtpInput)
      expect(wrapper.classes()).not.toContain('is-valid')
      expect(wrapper.classes()).not.toContain('is-invalid')
    })

    it('updates state class reactively', async () => {
      const wrapper = mount(BOtpInput, {props: {state: true}})
      expect(wrapper.classes()).toContain('is-valid')
      await wrapper.setProps({state: false})
      expect(wrapper.classes()).toContain('is-invalid')
      expect(wrapper.classes()).not.toContain('is-valid')
      await wrapper.setProps({state: null})
      expect(wrapper.classes()).not.toContain('is-valid')
      expect(wrapper.classes()).not.toContain('is-invalid')
    })
  })

  describe('disabled prop', () => {
    it('sets disabled attribute on all inputs when disabled is true', () => {
      const wrapper = mount(BOtpInput, {props: {disabled: true}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('disabled')).toBeDefined()
      }
    })

    it('does not set disabled attribute when disabled is false', () => {
      const wrapper = mount(BOtpInput, {props: {disabled: false}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('disabled')).toBeUndefined()
      }
    })

    it('updates disabled reactively', async () => {
      const wrapper = mount(BOtpInput, {props: {disabled: false}})
      let inputs = getInputs(wrapper)
      expect(inputs[0]!.attributes('disabled')).toBeUndefined()
      await wrapper.setProps({disabled: true})
      inputs = getInputs(wrapper)
      expect(inputs[0]!.attributes('disabled')).toBeDefined()
    })
  })

  describe('placeholder prop', () => {
    it('sets placeholder on all inputs', () => {
      const wrapper = mount(BOtpInput, {props: {placeholder: '○'}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('placeholder')).toBe('○')
      }
    })

    it('does not set placeholder when prop is empty string', () => {
      const wrapper = mount(BOtpInput, {props: {placeholder: ''}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('placeholder')).toBeUndefined()
      }
    })
  })

  describe('name prop', () => {
    it('sets name attribute with index suffix on each input', () => {
      const wrapper = mount(BOtpInput, {props: {name: 'otp', length: 3}})
      const inputs = getInputs(wrapper)
      expect(inputs[0]!.attributes('name')).toBe('otp-0')
      expect(inputs[1]!.attributes('name')).toBe('otp-1')
      expect(inputs[2]!.attributes('name')).toBe('otp-2')
    })

    it('does not set name attribute when name prop is not provided', () => {
      const wrapper = mount(BOtpInput)
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('name')).toBeUndefined()
      }
    })
  })

  describe('required prop', () => {
    it('sets required attribute on all inputs when required is true', () => {
      const wrapper = mount(BOtpInput, {props: {required: true}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('required')).toBeDefined()
      }
    })

    it('does not set required attribute when required is false', () => {
      const wrapper = mount(BOtpInput, {props: {required: false}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('required')).toBeUndefined()
      }
    })
  })

  describe('mask prop', () => {
    it('sets type="password" on inputs when mask is true', () => {
      const wrapper = mount(BOtpInput, {props: {mask: true}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('type')).toBe('password')
      }
    })

    it('sets type="text" on inputs when mask is false', () => {
      const wrapper = mount(BOtpInput, {props: {mask: false}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('type')).toBe('text')
      }
    })
  })

  describe('type prop', () => {
    it('renders type="text" by default', () => {
      const wrapper = mount(BOtpInput)
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('type')).toBe('text')
      }
    })

    it('renders type="text" when type is "number" (uses inputmode for numeric)', () => {
      const wrapper = mount(BOtpInput, {props: {type: 'number'}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('type')).toBe('text')
        expect(input.attributes('inputmode')).toBe('numeric')
      }
    })
  })

  describe('otp prop', () => {
    it('sets autocomplete="one-time-code" when otp is true', () => {
      const wrapper = mount(BOtpInput, {props: {otp: true}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('autocomplete')).toBe('one-time-code')
      }
    })

    it('does not set autocomplete when otp is false', () => {
      const wrapper = mount(BOtpInput, {props: {otp: false}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect(input.attributes('autocomplete')).toBeUndefined()
      }
    })
  })

  describe('dir prop', () => {
    it('sets dir attribute on container when dir is provided', () => {
      const wrapper = mount(BOtpInput, {props: {dir: 'rtl'}})
      expect(wrapper.attributes('dir')).toBe('rtl')
    })

    it('sets dir="ltr" when specified', () => {
      const wrapper = mount(BOtpInput, {props: {dir: 'ltr'}})
      expect(wrapper.attributes('dir')).toBe('ltr')
    })

    it('does not set dir attribute when dir is not provided', () => {
      const wrapper = mount(BOtpInput)
      expect(wrapper.attributes('dir')).toBeUndefined()
    })
  })

  describe('accessibility', () => {
    it('sets aria-label on each input with position info', () => {
      const wrapper = mount(BOtpInput, {props: {length: 4}})
      const inputs = getInputs(wrapper)
      expect(inputs[0]!.attributes('aria-label')).toBe('OTP digit 1 of 4')
      expect(inputs[1]!.attributes('aria-label')).toBe('OTP digit 2 of 4')
      expect(inputs[2]!.attributes('aria-label')).toBe('OTP digit 3 of 4')
      expect(inputs[3]!.attributes('aria-label')).toBe('OTP digit 4 of 4')
    })

    it('uses name prop in aria-label when provided', () => {
      const wrapper = mount(BOtpInput, {props: {name: 'pin', length: 3}})
      const inputs = getInputs(wrapper)
      expect(inputs[0]!.attributes('aria-label')).toBe('pin digit 1 of 3')
      expect(inputs[1]!.attributes('aria-label')).toBe('pin digit 2 of 3')
      expect(inputs[2]!.attributes('aria-label')).toBe('pin digit 3 of 3')
    })
  })

  describe('modelValue and v-model', () => {
    it('renders empty inputs when modelValue is null', () => {
      const wrapper = mount(BOtpInput, {props: {modelValue: null}})
      const inputs = getInputs(wrapper)
      for (const input of inputs) {
        expect((input.element as HTMLInputElement).value).toBe('')
      }
    })

    it('renders values from modelValue array', () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '2', '3', '', '', ''], length: 6},
      })
      const inputs = getInputs(wrapper)
      expect((inputs[0]!.element as HTMLInputElement).value).toBe('1')
      expect((inputs[1]!.element as HTMLInputElement).value).toBe('2')
      expect((inputs[2]!.element as HTMLInputElement).value).toBe('3')
      expect((inputs[3]!.element as HTMLInputElement).value).toBe('')
    })

    it('emits update:model-value when input changes', async () => {
      const wrapper = mount(BOtpInput, {props: {modelValue: ['', '', '', '', '', '']}})
      const inputs = getInputs(wrapper)
      const input = inputs[0]!
      const el = input.element as HTMLInputElement
      el.value = '5'
      await input.trigger('input')
      expect(wrapper.emitted('update:model-value')).toBeDefined()
      expect(wrapper.emitted('update:model-value')![0]).toEqual([
        ['5', '', '', '', '', ''],
      ])
    })

    it('updates displayed value when modelValue prop changes', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', '', '', '']},
      })
      await wrapper.setProps({modelValue: ['a', 'b', 'c', 'd', 'e', 'f']})
      const inputs = getInputs(wrapper)
      expect((inputs[0]!.element as HTMLInputElement).value).toBe('a')
      expect((inputs[5]!.element as HTMLInputElement).value).toBe('f')
    })
  })

  describe('defaultValue prop', () => {
    it('uses defaultValue for initial render when modelValue is null', () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: null, defaultValue: ['a', 'b', 'c'], length: 3},
      })
      const inputs = getInputs(wrapper)
      expect((inputs[0]!.element as HTMLInputElement).value).toBe('a')
      expect((inputs[1]!.element as HTMLInputElement).value).toBe('b')
      expect((inputs[2]!.element as HTMLInputElement).value).toBe('c')
    })

    it('modelValue takes precedence over defaultValue', () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['x', 'y', 'z'], defaultValue: ['a', 'b', 'c'], length: 3},
      })
      const inputs = getInputs(wrapper)
      expect((inputs[0]!.element as HTMLInputElement).value).toBe('x')
      expect((inputs[1]!.element as HTMLInputElement).value).toBe('y')
      expect((inputs[2]!.element as HTMLInputElement).value).toBe('z')
    })
  })

  describe('input handling', () => {
    it('takes only last character when multiple characters are entered', async () => {
      const wrapper = mount(BOtpInput, {props: {modelValue: ['', '', '', '', '', '']}})
      const inputs = getInputs(wrapper)
      const el = inputs[0]!.element as HTMLInputElement
      el.value = 'ab'
      await inputs[0]!.trigger('input')
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['b', '', '', '', '', ''])
    })

    it('filters non-numeric characters when type is number', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', '', '', ''], type: 'number'},
      })
      const inputs = getInputs(wrapper)
      const el = inputs[0]!.element as HTMLInputElement
      el.value = 'a'
      await inputs[0]!.trigger('input')
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['', '', '', '', '', ''])
    })

    it('accepts numeric input when type is number', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', '', '', ''], type: 'number'},
      })
      const inputs = getInputs(wrapper)
      const el = inputs[0]!.element as HTMLInputElement
      el.value = '5'
      await inputs[0]!.trigger('input')
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['5', '', '', '', '', ''])
    })
  })

  describe('complete event', () => {
    it('emits complete when all fields are filled', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '2', '3', '4', '5', ''], length: 6},
      })
      const inputs = getInputs(wrapper)
      const el = inputs[5]!.element as HTMLInputElement
      el.value = '6'
      await inputs[5]!.trigger('input')
      expect(wrapper.emitted('complete')).toBeDefined()
      expect(wrapper.emitted('complete')![0]).toEqual([['1', '2', '3', '4', '5', '6']])
    })

    it('does not emit complete when not all fields are filled', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '', '', '', '', ''], length: 6},
      })
      const inputs = getInputs(wrapper)
      const el = inputs[1]!.element as HTMLInputElement
      el.value = '2'
      await inputs[1]!.trigger('input')
      expect(wrapper.emitted('complete')).toBeUndefined()
    })

    it('emits complete with correct values for shorter length', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '2', ''], length: 3},
      })
      const inputs = getInputs(wrapper)
      const el = inputs[2]!.element as HTMLInputElement
      el.value = '3'
      await inputs[2]!.trigger('input')
      expect(wrapper.emitted('complete')).toBeDefined()
      expect(wrapper.emitted('complete')![0]).toEqual([['1', '2', '3']])
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowRight focuses the next input', async () => {
      const wrapper = mount(BOtpInput, {
        props: {length: 4},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      await inputs[0]!.trigger('focus')
      await inputs[0]!.trigger('keydown', {key: 'ArrowRight'})
      await nextTick()
      expect(document.activeElement).toBe(inputs[1]!.element)
    })

    it('ArrowLeft focuses the previous input', async () => {
      const wrapper = mount(BOtpInput, {
        props: {length: 4},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      await inputs[2]!.trigger('focus')
      await inputs[2]!.trigger('keydown', {key: 'ArrowLeft'})
      await nextTick()
      expect(document.activeElement).toBe(inputs[1]!.element)
    })

    it('ArrowLeft does not move past the first input', async () => {
      const wrapper = mount(BOtpInput, {
        props: {length: 4},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      ;(inputs[0]!.element as HTMLInputElement).focus()
      await inputs[0]!.trigger('keydown', {key: 'ArrowLeft'})
      await nextTick()
      expect(document.activeElement).toBe(inputs[0]!.element)
    })

    it('ArrowRight does not move past the last input', async () => {
      const wrapper = mount(BOtpInput, {
        props: {length: 4},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      ;(inputs[3]!.element as HTMLInputElement).focus()
      await inputs[3]!.trigger('keydown', {key: 'ArrowRight'})
      await nextTick()
      expect(document.activeElement).toBe(inputs[3]!.element)
    })

    it('Home key focuses the first input', async () => {
      const wrapper = mount(BOtpInput, {
        props: {length: 4},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      ;(inputs[3]!.element as HTMLInputElement).focus()
      await inputs[3]!.trigger('keydown', {key: 'Home'})
      await nextTick()
      expect(document.activeElement).toBe(inputs[0]!.element)
    })

    it('End key focuses the last input', async () => {
      const wrapper = mount(BOtpInput, {
        props: {length: 4},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      ;(inputs[0]!.element as HTMLInputElement).focus()
      await inputs[0]!.trigger('keydown', {key: 'End'})
      await nextTick()
      expect(document.activeElement).toBe(inputs[3]!.element)
    })
  })

  describe('backspace handling', () => {
    it('clears current input value on backspace', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '2', '3', '', '', ''], length: 6},
      })
      const inputs = getInputs(wrapper)
      await inputs[1]!.trigger('keydown', {key: 'Backspace'})
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['1', '', '3', '', '', ''])
    })

    it('moves to previous input and clears it when current is already empty', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '', '', '', '', ''], length: 6},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      ;(inputs[1]!.element as HTMLInputElement).focus()
      await inputs[1]!.trigger('keydown', {key: 'Backspace'})
      await nextTick()
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['', '', '', '', '', ''])
      expect(document.activeElement).toBe(inputs[0]!.element)
    })

    it('does not move past first input on backspace', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', '', '', ''], length: 6},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      ;(inputs[0]!.element as HTMLInputElement).focus()
      await inputs[0]!.trigger('keydown', {key: 'Backspace'})
      await nextTick()
      // No emit because value is already empty and no previous input
      expect(wrapper.emitted('update:model-value')).toBeUndefined()
    })
  })

  describe('delete handling', () => {
    it('clears current input value on delete', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '2', '3', '', '', ''], length: 6},
      })
      const inputs = getInputs(wrapper)
      await inputs[1]!.trigger('keydown', {key: 'Delete'})
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['1', '', '3', '', '', ''])
    })

    it('delete on empty input emits update with empty value', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', '', '', ''], length: 6},
      })
      const inputs = getInputs(wrapper)
      await inputs[0]!.trigger('keydown', {key: 'Delete'})
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['', '', '', '', '', ''])
    })
  })

  describe('paste handling', () => {
    const createPasteEvent = (data: string) => {
      const event = new Event('paste', {bubbles: true, cancelable: true}) as ClipboardEvent
      Object.defineProperty(event, 'clipboardData', {
        value: {
          getData: () => data,
        },
      })
      return event
    }

    it('distributes pasted characters across inputs from first when pasted content length >= input count', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', '', '', ''], length: 6},
      })
      const inputs = getInputs(wrapper)
      const event = createPasteEvent('123456')
      inputs[2]!.element.dispatchEvent(event)
      await nextTick()
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['1', '2', '3', '4', '5', '6'])
    })

    it('distributes pasted characters from current input when pasted content length < input count', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', '', '', ''], length: 6},
      })
      const inputs = getInputs(wrapper)
      const event = createPasteEvent('12')
      inputs[2]!.element.dispatchEvent(event)
      await nextTick()
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['', '', '1', '2', '', ''])
    })

    it('truncates pasted content that exceeds remaining inputs', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', ''], length: 4},
      })
      const inputs = getInputs(wrapper)
      const event = createPasteEvent('abc')
      inputs[2]!.element.dispatchEvent(event)
      await nextTick()
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['', '', 'a', 'b'])
    })

    it('filters non-numeric characters when type is number', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', ''], length: 4, type: 'number'},
      })
      const inputs = getInputs(wrapper)
      const event = createPasteEvent('1a2b')
      inputs[0]!.element.dispatchEvent(event)
      await nextTick()
      const emitted = wrapper.emitted('update:model-value')
      expect(emitted).toBeDefined()
      expect(emitted![0]![0] as string[]).toEqual(['1', '2', '', ''])
    })

    it('does not emit when pasted content is empty', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', ''], length: 4},
      })
      const inputs = getInputs(wrapper)
      const event = createPasteEvent('')
      inputs[0]!.element.dispatchEvent(event)
      await nextTick()
      expect(wrapper.emitted('update:model-value')).toBeUndefined()
    })

    it('emits complete when paste fills all fields', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', ''], length: 4},
      })
      const inputs = getInputs(wrapper)
      const event = createPasteEvent('abcd')
      inputs[0]!.element.dispatchEvent(event)
      await nextTick()
      expect(wrapper.emitted('complete')).toBeDefined()
      expect(wrapper.emitted('complete')![0]).toEqual([['a', 'b', 'c', 'd']])
    })
  })

  describe('auto-advance', () => {
    it('auto-advances focus to next input after entering a character', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['', '', '', '', '', ''], length: 6},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      const el = inputs[0]!.element as HTMLInputElement
      el.value = '1'
      await inputs[0]!.trigger('input')
      await nextTick()
      expect(document.activeElement).toBe(inputs[1]!.element)
    })

    it('does not auto-advance from the last input', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '2', '3', '4', '5', ''], length: 6},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      ;(inputs[5]!.element as HTMLInputElement).focus()
      const el = inputs[5]!.element as HTMLInputElement
      el.value = '6'
      await inputs[5]!.trigger('input')
      await nextTick()
      expect(document.activeElement).toBe(inputs[5]!.element)
    })

    it('does not auto-advance when input is cleared', async () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['1', '', '', '', '', ''], length: 6},
        attachTo: document.body,
      })
      const inputs = getInputs(wrapper)
      ;(inputs[0]!.element as HTMLInputElement).focus()
      const el = inputs[0]!.element as HTMLInputElement
      el.value = ''
      await inputs[0]!.trigger('input')
      await nextTick()
      expect(document.activeElement).toBe(inputs[0]!.element)
    })
  })

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(BOtpInput, {
        slots: {
          default: '<div class="custom-content">Custom</div>',
        },
      })
      expect(wrapper.find('.custom-content').exists()).toBe(true)
      expect(wrapper.find('.custom-content').text()).toBe('Custom')
    })

    it('provides modelValue in slot scope', () => {
      const wrapper = mount(BOtpInput, {
        props: {modelValue: ['a', 'b', 'c'], length: 3},
        slots: {
          default: (props: {modelValue: string[]}) =>
            `Values: ${props.modelValue.join(',')}`,
        },
      })
      expect(wrapper.text()).toContain('Values: a,b,c')
    })
  })

  describe('expose', () => {
    it('exposes focus method', () => {
      const wrapper = mount(BOtpInput, {attachTo: document.body})
      const vm = wrapper.vm as unknown as {focus: () => void}
      expect(typeof vm.focus).toBe('function')
    })

    it('exposes blur method', () => {
      const wrapper = mount(BOtpInput, {attachTo: document.body})
      const vm = wrapper.vm as unknown as {blur: () => void}
      expect(typeof vm.blur).toBe('function')
    })

    it('focus method focuses the first input', async () => {
      const wrapper = mount(BOtpInput, {attachTo: document.body})
      const vm = wrapper.vm as unknown as {focus: () => void}
      vm.focus()
      await nextTick()
      const inputs = getInputs(wrapper)
      expect(document.activeElement).toBe(inputs[0]!.element)
    })
  })

  describe('length prop reactivity', () => {
    it('updates the number of inputs when length changes', async () => {
      const wrapper = mount(BOtpInput, {props: {length: 4}})
      expect(getInputs(wrapper)).toHaveLength(4)
      await wrapper.setProps({length: 8})
      expect(getInputs(wrapper)).toHaveLength(8)
    })

    it('reduces the number of inputs when length decreases', async () => {
      const wrapper = mount(BOtpInput, {props: {length: 6}})
      expect(getInputs(wrapper)).toHaveLength(6)
      await wrapper.setProps({length: 3})
      expect(getInputs(wrapper)).toHaveLength(3)
    })
  })
})
