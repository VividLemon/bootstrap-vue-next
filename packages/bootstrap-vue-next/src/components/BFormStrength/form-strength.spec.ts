import {afterEach, describe, expect, it} from 'vitest'
import {enableAutoUnmount, mount} from '@vue/test-utils'
import {createSSRApp, h} from 'vue'
import {renderToString} from 'vue/server-renderer'
import BFormStrength from './BFormStrength.vue'

describe('form-strength', () => {
  enableAutoUnmount(afterEach)

  it('renders a .strength meter with four segments, hidden from assistive technology', () => {
    const wrapper = mount(BFormStrength)
    const meter = wrapper.find('.strength')
    expect(meter.exists()).toBe(true)
    expect(meter.attributes('aria-hidden')).toBe('true')
    expect(meter.findAll('.strength-segment')).toHaveLength(4)
    expect(meter.attributes('data-bs-strength')).toBeUndefined()
    expect(meter.findAll('.strength-segment.active')).toHaveLength(0)
  })

  it.each([
    ['abc', 'weak', 1],
    ['abcdefgH', 'fair', 2],
    ['abcdefgH1!', 'good', 3],
    ['abcdefgH1!!xyz', 'strong', 4],
  ] as const)('marks %s as %s with %i active segments', (value, level, active) => {
    const wrapper = mount(BFormStrength, {props: {value}})
    const meter = wrapper.find('.strength')
    expect(meter.attributes('data-bs-strength')).toBe(level)
    expect(meter.findAll('.strength-segment.active')).toHaveLength(active)
  })

  it('renders a .strength-bar without segments when bar is set', () => {
    const wrapper = mount(BFormStrength, {props: {bar: true, value: 'abc'}})
    const bar = wrapper.find('.strength-bar')
    expect(bar.exists()).toBe(true)
    expect(bar.attributes('data-bs-strength')).toBe('weak')
    expect(bar.find('.strength-segment').exists()).toBe(false)
    expect(wrapper.find('.strength').exists()).toBe(false)
  })

  it('renders no text unless showText is set', () => {
    const wrapper = mount(BFormStrength, {props: {value: 'abc'}})
    expect(wrapper.find('.strength-text').exists()).toBe(false)
  })

  it('renders the text as a polite live region with the level color', () => {
    const wrapper = mount(BFormStrength, {props: {value: 'abc', showText: true}})
    const text = wrapper.find('.strength-text')
    expect(text.attributes('aria-live')).toBe('polite')
    expect(text.text()).toBe('Weak')
    expect(text.attributes('data-bs-strength')).toBe('weak')
    expect(text.attributes('style')).toContain('--bs-strength-color: var(--bs-danger-fg)')
  })

  it('renders an empty text without a level', () => {
    const wrapper = mount(BFormStrength, {props: {value: '', showText: true}})
    const text = wrapper.find('.strength-text')
    expect(text.text()).toBe('')
    expect(text.attributes('style')).toBeUndefined()
  })

  it('uses custom messages, falling back per level', () => {
    const wrapper = mount(BFormStrength, {
      props: {value: 'abc', showText: true, messages: {fair: 'OK'}},
    })
    expect(wrapper.find('.strength-text').text()).toBe('Weak')
  })

  it('passes scoring options through', async () => {
    const wrapper = mount(BFormStrength, {
      props: {value: 'abc', showText: true, scorer: () => 7, messages: {strong: 'Great'}},
    })
    expect(wrapper.find('.strength').attributes('data-bs-strength')).toBe('strong')
    expect(wrapper.find('.strength-text').text()).toBe('Great')
    await wrapper.setProps({scorer: undefined, thresholds: [0, 0, 0]})
    expect(wrapper.find('.strength').attributes('data-bs-strength')).toBe('strong')
    await wrapper.setProps({thresholds: undefined, minLength: 3})
    expect(wrapper.find('.strength').attributes('data-bs-strength')).toBe('weak')
    await wrapper.setProps({weights: {lowercase: 4}})
    expect(wrapper.find('.strength').attributes('data-bs-strength')).toBe('good')
  })

  it('emits change when the level changes', async () => {
    const wrapper = mount(BFormStrength, {props: {value: ''}})
    await wrapper.setProps({value: 'a'})
    expect(wrapper.emitted('change')).toEqual([[{strength: 'weak', score: 1}]])
    await wrapper.setProps({value: 'b'})
    expect(wrapper.emitted('change')).toHaveLength(1)
    await wrapper.setProps({value: 'abcdefgH1!'})
    expect(wrapper.emitted('change')?.[1]).toEqual([{strength: 'good', score: 5}])
  })

  it('puts attrs on the meter and part attrs on segments and text', () => {
    const wrapper = mount(BFormStrength, {
      props: {
        showText: true,
        value: 'abc',
        segmentAttrs: {'class': 'seg', 'data-s': '1'},
        textAttrs: {class: 'txt'},
      },
      attrs: {'class': 'meter', 'data-m': '1'},
    })
    const meter = wrapper.find('.strength')
    expect(meter.classes()).toContain('meter')
    expect(meter.attributes('data-m')).toBe('1')
    const segment = wrapper.find('.strength-segment')
    expect(segment.classes()).toEqual(expect.arrayContaining(['seg', 'active']))
    expect(segment.attributes('data-s')).toBe('1')
    expect(wrapper.find('.strength-text').classes()).toEqual(
      expect.arrayContaining(['txt', 'strength-text'])
    )
  })

  it('renders the level on the server', async () => {
    const app = createSSRApp({
      render: () => h(BFormStrength, {value: 'abcdefgH1!!xyz', showText: true}),
    })
    const html = await renderToString(app)
    expect(html).toContain('data-bs-strength="strong"')
    expect(html).toContain('Strong')
  })
})
