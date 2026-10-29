import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BTd from './BTd.vue'

describe('td', () => {
  enableAutoUnmount(afterEach)

  it('renders a td element', () => {
    const wrapper = mount(BTd)
    expect(wrapper.element.tagName).toBe('TD')
  })

  it('renders default slot content', () => {
    const wrapper = mount(BTd, {
      slots: {default: 'cell content'},
    })
    expect(wrapper.text()).toBe('cell content')
  })

  it('renders HTML slot content', () => {
    const wrapper = mount(BTd, {
      slots: {default: '<span class="custom">inner</span>'},
    })
    expect(wrapper.find('span.custom').exists()).toBe(true)
    expect(wrapper.find('span.custom').text()).toBe('inner')
  })

  it('renders empty when no slot is provided', () => {
    const wrapper = mount(BTd)
    expect(wrapper.text()).toBe('')
  })

  describe('colspan prop', () => {
    it('has colspan attribute when prop is set', () => {
      const wrapper = mount(BTd, {
        props: {colspan: 6},
      })
      expect(wrapper.attributes('colspan')).toBe('6')
    })

    it('does not have colspan attribute when not set', () => {
      const wrapper = mount(BTd)
      expect(wrapper.attributes('colspan')).toBeUndefined()
    })

    it('colspan is reactive', async () => {
      const wrapper = mount(BTd, {
        props: {colspan: 3},
      })
      expect(wrapper.attributes('colspan')).toBe('3')
      await wrapper.setProps({colspan: 5})
      expect(wrapper.attributes('colspan')).toBe('5')
    })
  })

  describe('rowspan prop', () => {
    it('has rowspan attribute when prop is set', () => {
      const wrapper = mount(BTd, {
        props: {rowspan: 6},
      })
      expect(wrapper.attributes('rowspan')).toBe('6')
    })

    it('does not have rowspan attribute when not set', () => {
      const wrapper = mount(BTd)
      expect(wrapper.attributes('rowspan')).toBeUndefined()
    })

    it('rowspan is reactive', async () => {
      const wrapper = mount(BTd, {
        props: {rowspan: 2},
      })
      expect(wrapper.attributes('rowspan')).toBe('2')
      await wrapper.setProps({rowspan: 4})
      expect(wrapper.attributes('rowspan')).toBe('4')
    })
  })

  describe('stackedHeading prop', () => {
    it('has data-label attribute when stackedHeading is set', () => {
      const wrapper = mount(BTd, {
        props: {stackedHeading: '5'},
      })
      expect(wrapper.attributes('data-label')).toBe('5')
    })

    it('does not have data-label attribute when stackedHeading is not set', () => {
      const wrapper = mount(BTd)
      expect(wrapper.attributes('data-label')).toBeUndefined()
    })

    it('wraps slot content in a div when stackedHeading is set', () => {
      const wrapper = mount(BTd, {
        props: {stackedHeading: 'Heading'},
        slots: {default: 'content'},
      })
      const $div = wrapper.find('div')
      expect($div.exists()).toBe(true)
      expect($div.text()).toBe('content')
    })

    it('does not wrap slot content in a div when stackedHeading is not set', () => {
      const wrapper = mount(BTd, {
        slots: {default: 'content'},
      })
      expect(wrapper.find('div').exists()).toBe(false)
      expect(wrapper.text()).toBe('content')
    })

    it('stackedHeading is reactive', async () => {
      const wrapper = mount(BTd, {
        props: {stackedHeading: 'first'},
        slots: {default: 'content'},
      })
      expect(wrapper.attributes('data-label')).toBe('first')
      expect(wrapper.find('div').exists()).toBe(true)
      await wrapper.setProps({stackedHeading: 'second'})
      expect(wrapper.attributes('data-label')).toBe('second')
      expect(wrapper.find('div').exists()).toBe(true)
    })
  })

  describe('theme prop', () => {
    it('has class theme-{type} when theme is set', () => {
      const wrapper = mount(BTd, {
        props: {theme: 'primary'},
      })
      expect(wrapper.classes()).toContain('theme-primary')
    })

    it('does not have theme class by default', () => {
      const wrapper = mount(BTd)
      expect(wrapper.classes().join(' ')).not.toMatch(/theme-/)
    })

    it('theme class is reactive', async () => {
      const wrapper = mount(BTd, {
        props: {theme: 'primary'},
      })
      expect(wrapper.classes()).toContain('theme-primary')
      await wrapper.setProps({theme: 'danger'})
      expect(wrapper.classes()).not.toContain('theme-primary')
      expect(wrapper.classes()).toContain('theme-danger')
    })

    it('theme class is removed when theme is set to undefined', async () => {
      const wrapper = mount(BTd, {
        props: {theme: 'primary'},
      })
      expect(wrapper.classes()).toContain('theme-primary')
      await wrapper.setProps({theme: undefined})
      expect(wrapper.classes()).not.toContain('theme-primary')
    })
  })

  describe('stickyColumn prop', () => {
    it('has class b-table-sticky-column when stickyColumn is true', () => {
      const wrapper = mount(BTd, {
        props: {stickyColumn: true},
      })
      expect(wrapper.classes()).toContain('b-table-sticky-column')
    })

    it('does not have b-table-sticky-column class when stickyColumn is false', () => {
      const wrapper = mount(BTd, {
        props: {stickyColumn: false},
      })
      expect(wrapper.classes()).not.toContain('b-table-sticky-column')
    })

    it('does not have b-table-sticky-column class by default', () => {
      const wrapper = mount(BTd)
      expect(wrapper.classes()).not.toContain('b-table-sticky-column')
    })

    it('stickyColumn class is reactive', async () => {
      const wrapper = mount(BTd, {
        props: {stickyColumn: true},
      })
      expect(wrapper.classes()).toContain('b-table-sticky-column')
      await wrapper.setProps({stickyColumn: false})
      expect(wrapper.classes()).not.toContain('b-table-sticky-column')
    })

    it('has class table-b-table-default when stickyColumn is true and no theme', () => {
      const wrapper = mount(BTd, {
        props: {stickyColumn: true},
      })
      expect(wrapper.classes()).toContain('table-b-table-default')
    })

    it('does not have table-b-table-default when stickyColumn is false', () => {
      const wrapper = mount(BTd, {
        props: {stickyColumn: false},
      })
      expect(wrapper.classes()).not.toContain('table-b-table-default')
    })

    it('does not have table-b-table-default when stickyColumn is true but theme is set', () => {
      const wrapper = mount(BTd, {
        props: {stickyColumn: true, theme: 'secondary'},
      })
      expect(wrapper.classes()).not.toContain('table-b-table-default')
      expect(wrapper.classes()).toContain('theme-secondary')
      expect(wrapper.classes()).toContain('b-table-sticky-column')
    })

    it('table-b-table-default appears when theme is removed from sticky column', async () => {
      const wrapper = mount(BTd, {
        props: {stickyColumn: true, theme: 'primary'},
      })
      expect(wrapper.classes()).not.toContain('table-b-table-default')
      await wrapper.setProps({theme: undefined})
      expect(wrapper.classes()).toContain('table-b-table-default')
    })
  })

  describe('multiple props combined', () => {
    it('supports colspan, rowspan, and theme together', () => {
      const wrapper = mount(BTd, {
        props: {colspan: 3, rowspan: 2, theme: 'success'},
      })
      expect(wrapper.attributes('colspan')).toBe('3')
      expect(wrapper.attributes('rowspan')).toBe('2')
      expect(wrapper.classes()).toContain('theme-success')
    })

    it('supports stackedHeading with stickyColumn and theme', () => {
      const wrapper = mount(BTd, {
        props: {stackedHeading: 'Label', stickyColumn: true, theme: 'info'},
        slots: {default: 'value'},
      })
      expect(wrapper.attributes('data-label')).toBe('Label')
      expect(wrapper.classes()).toContain('b-table-sticky-column')
      expect(wrapper.classes()).toContain('theme-info')
      expect(wrapper.classes()).not.toContain('table-b-table-default')
      expect(wrapper.find('div').text()).toBe('value')
    })
  })
})
