import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BTableSimple from './BTableSimple.vue'

describe('BTableSimple', () => {
  enableAutoUnmount(afterEach)

  describe('default structure', () => {
    it('renders a table element by default', () => {
      const wrapper = mount(BTableSimple, {
        slots: {default: 'foo'},
      })
      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('does not wrap in a div by default', () => {
      const wrapper = mount(BTableSimple, {
        slots: {default: 'foo'},
      })
      expect(wrapper.find('div').exists()).toBe(false)
    })

    it('renders default slot content', () => {
      const wrapper = mount(BTableSimple, {
        slots: {default: 'foo'},
      })
      const $table = wrapper.find('table')
      expect($table.text()).toBe('foo')
    })

    it('renders HTML slot content', () => {
      const wrapper = mount(BTableSimple, {
        slots: {default: '<tbody><tr><td>cell</td></tr></tbody>'},
      })
      expect(wrapper.find('tbody').exists()).toBe(true)
      expect(wrapper.find('td').text()).toBe('cell')
    })
  })

  describe('responsive structure', () => {
    it('wraps a stacked table in a table-responsive query container', () => {
      const wrapper = mount(BTableSimple, {
        props: {stacked: 'md'},
      })
      const div = wrapper.get('div')
      expect(div.classes()).toContain('table-responsive')
      expect(div.get('table').classes()).toContain('md:table-stacked')
    })

    it('wraps an always-stacked table in a table-responsive query container', () => {
      const wrapper = mount(BTableSimple, {
        props: {stacked: true},
      })
      expect(wrapper.get('div').classes()).toContain('table-responsive')
    })

    it('uses the responsive class as the query container when stacked and responsive', () => {
      const wrapper = mount(BTableSimple, {
        props: {stacked: 'md', responsive: 'lg'},
      })
      const div = wrapper.get('div')
      expect(div.classes()).toContain('lg:table-responsive')
      expect(div.classes()).not.toContain('table-responsive')
    })

    it('adds table-responsive to the sticky header wrapper when stacked', () => {
      const wrapper = mount(BTableSimple, {
        props: {stacked: 'md', stickyHeader: true},
      })
      const div = wrapper.get('div')
      expect(div.classes()).toContain('b-table-sticky-header')
      expect(div.classes()).toContain('table-responsive')
    })

    it('wraps table in a div when responsive is true', () => {
      const wrapper = mount(BTableSimple, {
        props: {responsive: true},
        slots: {default: 'foo'},
      })
      const $div = wrapper.find('div')
      expect($div.exists()).toBe(true)
      const $table = $div.find('table')
      expect($table.exists()).toBe(true)
      expect($table.text()).toBe('foo')
    })

    it('wraps table in a div when responsive is a breakpoint string', () => {
      const wrapper = mount(BTableSimple, {
        props: {responsive: 'lg'},
        slots: {default: 'foo'},
      })
      const $div = wrapper.find('div')
      expect($div.exists()).toBe(true)
      expect($div.find('table').exists()).toBe(true)
    })

    it('has table-responsive class on wrapper div when responsive is true', () => {
      const wrapper = mount(BTableSimple, {
        props: {responsive: true},
      })
      expect(wrapper.get('div').classes()).toContain('table-responsive')
    })

    it('has {breakpoint}:table-responsive class on wrapper div when responsive is a string', () => {
      const wrapper = mount(BTableSimple, {
        props: {responsive: 'md'},
      })
      expect(wrapper.get('div').classes()).toContain('md:table-responsive')
      expect(wrapper.get('div').classes()).not.toContain('table-responsive')
    })

    it('responsive class is reactive', async () => {
      const wrapper = mount(BTableSimple, {
        props: {responsive: true},
      })
      expect(wrapper.get('div').classes()).toContain('table-responsive')
      await wrapper.setProps({responsive: 'sm'})
      expect(wrapper.get('div').classes()).not.toContain('table-responsive')
      expect(wrapper.get('div').classes()).toContain('sm:table-responsive')
    })

    it.each(['sm', 'md', 'lg', 'xl', '2xl'] as const)(
      'has %s:table-responsive class and no v5 infix class',
      (bp) => {
        const wrapper = mount(BTableSimple, {
          props: {responsive: bp},
        })
        expect(wrapper.get('div').classes()).toContain(`${bp}:table-responsive`)
        expect(wrapper.get('div').classes()).not.toContain(`table-responsive-${bp}`)
      }
    )
  })

  describe('stickyHeader', () => {
    it('wraps table in a div when stickyHeader is true', () => {
      const wrapper = mount(BTableSimple, {
        props: {stickyHeader: true},
        slots: {default: 'foo'},
      })
      const $div = wrapper.find('div')
      expect($div.exists()).toBe(true)
      const $table = $div.find('table')
      expect($table.exists()).toBe(true)
      expect($table.text()).toBe('foo')
    })

    it('has b-table-sticky-header class on wrapper div when stickyHeader is true', () => {
      const wrapper = mount(BTableSimple, {
        props: {stickyHeader: true},
      })
      expect(wrapper.get('div').classes()).toContain('b-table-sticky-header')
    })

    it('has default maxHeight of 300px when stickyHeader is true', () => {
      const wrapper = mount(BTableSimple, {
        props: {stickyHeader: true},
      })
      expect(wrapper.get('div').attributes('style')).toBe('max-height: 300px;')
    })

    it('accepts custom maxHeight as number', () => {
      const wrapper = mount(BTableSimple, {
        props: {stickyHeader: 200},
      })
      expect(wrapper.get('div').attributes('style')).toBe('max-height: 200px;')
    })

    it('accepts custom maxHeight as string', () => {
      const wrapper = mount(BTableSimple, {
        props: {stickyHeader: '400px'},
      })
      expect(wrapper.get('div').attributes('style')).toBe('max-height: 400px;')
    })

    it('removes maxHeight style when stickyHeader is set to false', async () => {
      const wrapper = mount(BTableSimple, {
        props: {stickyHeader: true, responsive: true},
      })
      expect(wrapper.get('div').attributes('style')).toBe('max-height: 300px;')
      await wrapper.setProps({stickyHeader: false})
      expect(wrapper.get('div').attributes('style')).toBeFalsy()
    })

    it('stickyHeader maxHeight is reactive', async () => {
      const wrapper = mount(BTableSimple, {
        props: {stickyHeader: true, responsive: true},
      })
      expect(wrapper.get('div').attributes('style')).toBe('max-height: 300px;')
      await wrapper.setProps({stickyHeader: 200})
      expect(wrapper.get('div').attributes('style')).toBe('max-height: 200px;')
      await wrapper.setProps({stickyHeader: '400px'})
      expect(wrapper.get('div').attributes('style')).toBe('max-height: 400px;')
    })
  })

  describe('id prop', () => {
    it('sets id on the table element', () => {
      const wrapper = mount(BTableSimple, {
        props: {id: 'my-table'},
      })
      expect(wrapper.get('table').attributes('id')).toBe('my-table')
    })

    it('sets id on table when responsive', () => {
      const wrapper = mount(BTableSimple, {
        props: {id: 'my-table', responsive: true},
      })
      expect(wrapper.get('table').attributes('id')).toBe('my-table')
    })

    it('generates an id when none is provided', () => {
      const wrapper = mount(BTableSimple)
      const id = wrapper.get('table').attributes('id')
      expect(id).toBeTruthy()
    })
  })

  describe('tableAttrs prop', () => {
    it('passes extra attributes to the table element', () => {
      const wrapper = mount(BTableSimple, {
        props: {tableAttrs: {'aria-label': 'My table', 'role': 'grid'}},
      })
      const table = wrapper.get('table')
      expect(table.attributes('aria-label')).toBe('My table')
      expect(table.attributes('role')).toBe('grid')
    })

    it('passes attributes to table when responsive', () => {
      const wrapper = mount(BTableSimple, {
        props: {responsive: true, tableAttrs: {'aria-label': 'My table'}},
      })
      expect(wrapper.get('table').attributes('aria-label')).toBe('My table')
    })
  })

  describe('table classes', () => {
    describe('static classes', () => {
      it('always has class table', () => {
        const wrapper = mount(BTableSimple)
        expect(wrapper.get('table').classes()).toContain('table')
      })

      it('always has class b-table', () => {
        const wrapper = mount(BTableSimple)
        expect(wrapper.get('table').classes()).toContain('b-table')
      })
    })

    it('has class border when outlined prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {outlined: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('border')
      await wrapper.setProps({outlined: false})
      expect(table.classes()).not.toContain('border')
    })

    it('has class table-bordered when bordered prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {bordered: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('table-bordered')
      await wrapper.setProps({bordered: false})
      expect(table.classes()).not.toContain('table-bordered')
    })

    it('has class table-borderless when borderless prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {borderless: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('table-borderless')
      await wrapper.setProps({borderless: false})
      expect(table.classes()).not.toContain('table-borderless')
    })

    it('has class caption-top when captionTop prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {captionTop: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('caption-top')
      await wrapper.setProps({captionTop: false})
      expect(table.classes()).not.toContain('caption-top')
    })

    it('has class table-hover when hover prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {hover: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('table-hover')
      await wrapper.setProps({hover: false})
      expect(table.classes()).not.toContain('table-hover')
    })

    it('has class table-stacked when stacked prop set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {stacked: true},
      })
      expect(wrapper.get('table').classes()).toContain('table-stacked')
      await wrapper.setProps({stacked: 'lg'})
      expect(wrapper.get('table').classes()).toContain('lg:table-stacked')
      expect(wrapper.get('table').classes()).not.toContain('table-stacked')
      await wrapper.setProps({stacked: false})
      expect(wrapper.get('table').classes()).not.toContain('table-stacked')
      expect(wrapper.get('table').classes()).not.toContain('lg:table-stacked')
    })

    it.each(['sm', 'md', 'lg', 'xl', '2xl'] as const)(
      'has %s:table-stacked class and no v5 b-table-stacked class',
      (bp) => {
        const wrapper = mount(BTableSimple, {
          props: {stacked: bp},
        })
        const table = wrapper.get('table')
        expect(table.classes()).toContain(`${bp}:table-stacked`)
        expect(table.classes()).not.toContain(`b-table-stacked-${bp}`)
        expect(table.classes()).not.toContain('b-table-stacked')
      }
    )

    it('has class table-striped when striped prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {striped: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('table-striped')
      await wrapper.setProps({striped: false})
      expect(table.classes()).not.toContain('table-striped')
    })

    it('has class table-sm when small prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {small: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('table-sm')
      await wrapper.setProps({small: false})
      expect(table.classes()).not.toContain('table-sm')
    })

    it('has class theme-x when theme prop set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {color: {theme: 'primary'}},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('theme-primary')
      await wrapper.setProps({color: {theme: 'secondary'}})
      expect(table.classes()).toContain('theme-secondary')
    })

    it('has class border-x when border prop set', () => {
      const wrapper = mount(BTableSimple, {
        props: {color: {border: 'danger'}},
      })
      expect(wrapper.get('table').classes()).toContain('border-danger')
    })

    it('has class table-striped-columns when striped-columns prop set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {stripedColumns: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('table-striped-columns')
      await wrapper.setProps({stripedColumns: false})
      expect(table.classes()).not.toContain('table-striped-columns')
    })

    it('has class b-table-fixed when fixed prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {fixed: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('b-table-fixed')
      await wrapper.setProps({fixed: false})
      expect(table.classes()).not.toContain('b-table-fixed')
    })

    it('has class b-table-no-border-collapse when noBorderCollapse prop is set', async () => {
      const wrapper = mount(BTableSimple, {
        props: {noBorderCollapse: true},
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('b-table-no-border-collapse')
      await wrapper.setProps({noBorderCollapse: false})
      expect(table.classes()).not.toContain('b-table-no-border-collapse')
    })

    it('merges tableAttrs class and style with its own classes', () => {
      const wrapper = mount(BTableSimple, {
        props: {
          striped: true,
          tableAttrs: {'class': ['class-a', 'class-b'], 'style': {color: 'red'}, 'data-foo': 'bar'},
        },
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('table')
      expect(table.classes()).toContain('table-striped')
      expect(table.classes()).toContain('class-a')
      expect(table.classes()).toContain('class-b')
      expect(table.attributes('style')).toContain('color: red')
      expect(table.attributes('data-foo')).toBe('bar')
    })

    it('supports multiple boolean classes at once', () => {
      const wrapper = mount(BTableSimple, {
        props: {
          bordered: true,
          hover: true,
          striped: true,
          small: true,
        },
      })
      const table = wrapper.get('table')
      expect(table.classes()).toContain('table-bordered')
      expect(table.classes()).toContain('table-hover')
      expect(table.classes()).toContain('table-striped')
      expect(table.classes()).toContain('table-sm')
    })
  })
})
