import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BTh from './BTh.vue'

describe('th', () => {
  enableAutoUnmount(afterEach)

  it('renders a th element', () => {
    const wrapper = mount(BTh)
    expect(wrapper.element.tagName).toBe('TH')
  })

  it('renders default slot content', () => {
    const wrapper = mount(BTh, {
      slots: {default: 'header content'},
    })
    expect(wrapper.text()).toBe('header content')
  })

  it('renders HTML slot content', () => {
    const wrapper = mount(BTh, {
      slots: {default: '<span class="custom">inner</span>'},
    })
    expect(wrapper.find('span.custom').exists()).toBe(true)
    expect(wrapper.find('span.custom').text()).toBe('inner')
  })

  it('renders empty when no slot is provided', () => {
    const wrapper = mount(BTh)
    expect(wrapper.text()).toBe('')
  })

  describe('colspan prop', () => {
    it('has colspan attribute when prop is set', () => {
      const wrapper = mount(BTh, {
        props: {colspan: 6},
      })
      expect(wrapper.attributes('colspan')).toBe('6')
    })

    it('does not have colspan attribute when not set', () => {
      const wrapper = mount(BTh)
      expect(wrapper.attributes('colspan')).toBeUndefined()
    })

    it('colspan is reactive', async () => {
      const wrapper = mount(BTh, {
        props: {colspan: 3},
      })
      expect(wrapper.attributes('colspan')).toBe('3')
      await wrapper.setProps({colspan: 5})
      expect(wrapper.attributes('colspan')).toBe('5')
    })
  })

  describe('rowspan prop', () => {
    it('has rowspan attribute when prop is set', () => {
      const wrapper = mount(BTh, {
        props: {rowspan: 6},
      })
      expect(wrapper.attributes('rowspan')).toBe('6')
    })

    it('does not have rowspan attribute when not set', () => {
      const wrapper = mount(BTh)
      expect(wrapper.attributes('rowspan')).toBeUndefined()
    })

    it('rowspan is reactive', async () => {
      const wrapper = mount(BTh, {
        props: {rowspan: 2},
      })
      expect(wrapper.attributes('rowspan')).toBe('2')
      await wrapper.setProps({rowspan: 4})
      expect(wrapper.attributes('rowspan')).toBe('4')
    })
  })

  describe('stacked mode', () => {
    it('passes a data-cell attribute through to the cell', () => {
      const wrapper = mount(BTh, {
        attrs: {'data-cell': 'Label'},
        slots: {default: 'content'},
      })
      expect(wrapper.attributes('data-cell')).toBe('Label')
    })

    it('does not render data-label or wrap slot content in a div', () => {
      const wrapper = mount(BTh, {
        attrs: {'data-cell': 'Label'},
        slots: {default: 'content'},
      })
      expect(wrapper.attributes('data-label')).toBeUndefined()
      expect(wrapper.find('div').exists()).toBe(false)
      expect(wrapper.text()).toBe('content')
    })
  })

  describe('theme prop', () => {
    it('has class theme-{type} when theme is set', () => {
      const wrapper = mount(BTh, {
        props: {color: {theme: 'primary'}},
      })
      expect(wrapper.classes()).toContain('theme-primary')
    })

    it('does not have theme class by default', () => {
      const wrapper = mount(BTh)
      expect(wrapper.classes().join(' ')).not.toMatch(/theme-/)
    })

    it('theme class is reactive', async () => {
      const wrapper = mount(BTh, {
        props: {color: {theme: 'primary'}},
      })
      expect(wrapper.classes()).toContain('theme-primary')
      await wrapper.setProps({color: {theme: 'danger'}})
      expect(wrapper.classes()).not.toContain('theme-primary')
      expect(wrapper.classes()).toContain('theme-danger')
    })

    it('theme class is removed when theme is set to undefined', async () => {
      const wrapper = mount(BTh, {
        props: {color: {theme: 'primary'}},
      })
      expect(wrapper.classes()).toContain('theme-primary')
      await wrapper.setProps({color: {theme: undefined}})
      expect(wrapper.classes()).not.toContain('theme-primary')
    })
  })

  describe('stickyColumn prop', () => {
    it('has class b-table-sticky-column when stickyColumn is true', () => {
      const wrapper = mount(BTh, {
        props: {stickyColumn: true},
      })
      expect(wrapper.classes()).toContain('b-table-sticky-column')
    })

    it('does not have b-table-sticky-column class when stickyColumn is false', () => {
      const wrapper = mount(BTh, {
        props: {stickyColumn: false},
      })
      expect(wrapper.classes()).not.toContain('b-table-sticky-column')
    })

    it('does not have b-table-sticky-column class by default', () => {
      const wrapper = mount(BTh)
      expect(wrapper.classes()).not.toContain('b-table-sticky-column')
    })

    it('stickyColumn class is reactive', async () => {
      const wrapper = mount(BTh, {
        props: {stickyColumn: true},
      })
      expect(wrapper.classes()).toContain('b-table-sticky-column')
      await wrapper.setProps({stickyColumn: false})
      expect(wrapper.classes()).not.toContain('b-table-sticky-column')
    })

    it('never adds the removed table-b-table-default class', async () => {
      const wrapper = mount(BTh, {
        props: {stickyColumn: true},
      })
      expect(wrapper.classes()).toContain('b-table-sticky-column')
      expect(wrapper.classes()).not.toContain('table-b-table-default')
      await wrapper.setProps({color: {theme: 'secondary'}})
      expect(wrapper.classes()).toContain('theme-secondary')
      expect(wrapper.classes()).not.toContain('table-b-table-default')
    })
  })

  describe('scope prop', () => {
    it('has scope col by default', () => {
      const wrapper = mount(BTh)
      expect(wrapper.attributes('scope')).toBe('col')
    })

    it('has scope colgroup when colspan is set', () => {
      const wrapper = mount(BTh, {
        props: {colspan: '6'},
      })
      expect(wrapper.attributes('scope')).toBe('colgroup')
    })

    it('has scope rowgroup when rowspan is set', () => {
      const wrapper = mount(BTh, {
        props: {rowspan: '6'},
      })
      expect(wrapper.attributes('scope')).toBe('rowgroup')
    })

    it('has scope colgroup when both colspan and rowspan are set', () => {
      const wrapper = mount(BTh, {
        props: {colspan: 6, rowspan: 5},
      })
      expect(wrapper.attributes('scope')).toBe('colgroup')
    })

    it('can override scope via prop', () => {
      const wrapper = mount(BTh, {
        props: {scope: 'row'},
      })
      expect(wrapper.attributes('scope')).toBe('row')
    })

    it('scope prop takes precedence over colspan', () => {
      const wrapper = mount(BTh, {
        props: {scope: 'row', colspan: '5'},
      })
      expect(wrapper.attributes('scope')).toBe('row')
    })

    it('scope prop takes precedence over rowspan', () => {
      const wrapper = mount(BTh, {
        props: {scope: 'row', rowspan: '5'},
      })
      expect(wrapper.attributes('scope')).toBe('row')
    })

    it('scope is reactive when colspan changes', async () => {
      const wrapper = mount(BTh)
      expect(wrapper.attributes('scope')).toBe('col')
      await wrapper.setProps({colspan: 3})
      expect(wrapper.attributes('scope')).toBe('colgroup')
    })

    it('scope is reactive when rowspan changes', async () => {
      const wrapper = mount(BTh)
      expect(wrapper.attributes('scope')).toBe('col')
      await wrapper.setProps({rowspan: 3})
      expect(wrapper.attributes('scope')).toBe('rowgroup')
    })

    it('scope prop is reactive', async () => {
      const wrapper = mount(BTh, {
        props: {scope: 'row'},
      })
      expect(wrapper.attributes('scope')).toBe('row')
      await wrapper.setProps({scope: 'col'})
      expect(wrapper.attributes('scope')).toBe('col')
    })
  })

  describe('multiple props combined', () => {
    it('supports colspan, rowspan, and theme together', () => {
      const wrapper = mount(BTh, {
        props: {colspan: 3, rowspan: 2, color: {theme: 'success'}},
      })
      expect(wrapper.attributes('colspan')).toBe('3')
      expect(wrapper.attributes('rowspan')).toBe('2')
      expect(wrapper.classes()).toContain('theme-success')
      expect(wrapper.attributes('scope')).toBe('colgroup')
    })

    it('supports data-cell with stickyColumn and theme', () => {
      const wrapper = mount(BTh, {
        props: {stickyColumn: true, color: {theme: 'info'}},
        attrs: {'data-cell': 'Label'},
        slots: {default: 'value'},
      })
      expect(wrapper.attributes('data-cell')).toBe('Label')
      expect(wrapper.classes()).toContain('b-table-sticky-column')
      expect(wrapper.classes()).toContain('theme-info')
      expect(wrapper.text()).toBe('value')
    })
  })
})
