import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import BCard from './BCard.vue'
import BCardImg from './BCardImg.vue'
import BCardHeader from './BCardHeader.vue'
import BCardBody from './BCardBody.vue'
import BCardFooter from './BCardFooter.vue'

describe('card', () => {
  enableAutoUnmount(afterEach)

  it('tag is div by default', () => {
    const wrapper = mount(BCard)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('tag is prop tag', () => {
    const wrapper = mount(BCard, {
      props: {tag: 'span'},
    })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('has static class card', () => {
    const wrapper = mount(BCard)
    expect(wrapper.classes()).toContain('card')
  })

  it('has class text-{type} when prop align', async () => {
    const wrapper = mount(BCard, {
      props: {align: 'start'},
    })
    expect(wrapper.classes()).toContain('text-start')
    await wrapper.setProps({align: undefined})
    expect(wrapper.classes()).not.toContain('text-start')
  })

  it('has class fg-{type} when prop fg', async () => {
    const wrapper = mount(BCard, {
      props: {fg: 'primary'},
    })
    expect(wrapper.classes()).toContain('fg-primary')
    await wrapper.setProps({fg: undefined})
    expect(wrapper.classes()).not.toContain('fg-primary')
  })

  it('has class bg-{type} when prop bg', async () => {
    const wrapper = mount(BCard, {
      props: {bg: 'primary'},
    })
    expect(wrapper.classes()).toContain('bg-primary')
    await wrapper.setProps({bg: undefined})
    expect(wrapper.classes()).not.toContain('bg-primary')
  })

  it('has class border-{type} when prop border', async () => {
    const wrapper = mount(BCard, {
      props: {border: 'primary'},
    })
    expect(wrapper.classes()).toContain('border-primary')
    await wrapper.setProps({border: undefined})
    expect(wrapper.classes()).not.toContain('border-primary')
  })

  it.each(['start', 'end'] as const)(
    'has class card-row and card-img-%s when imgPlacement',
    (placement) => {
      const wrapper = mount(BCard, {
        props: {imgPlacement: placement, imgSrc: '/a.png'},
      })
      expect(wrapper.classes()).toContain('card-row')
      expect(wrapper.find('img').classes()).toContain(`card-img-${placement}`)
      expect(wrapper.classes()).not.toContain('flex-row')
      expect(wrapper.classes()).not.toContain('flex-row-reverse')
    }
  )

  it.each(['top', 'bottom', 'overlay'] as const)(
    'does not have card-row when imgPlacement %s',
    (placement) => {
      const wrapper = mount(BCard, {props: {imgPlacement: placement, imgSrc: '/a.png'}})
      expect(wrapper.classes()).not.toContain('card-row')
    }
  )

  it('renders image, header, body and footer in order within the card', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/a.png', header: 'H', title: 'T', footer: 'F'},
      slots: {default: 'Body'},
    })
    const children = Array.from(wrapper.element.children).map((e) => e.className)
    expect(children[0]).toContain('card-img-top')
    expect(children[1]).toContain('card-header')
    expect(children[2]).toContain('card-body')
    expect(children[3]).toContain('card-footer')
  })

  it('renders overlay image with card-img and card-img-overlay body', () => {
    const wrapper = mount(BCard, {props: {imgPlacement: 'overlay', imgSrc: '/a.png'}})
    expect(wrapper.find('img').classes()).toContain('card-img')
    expect(wrapper.find('.card-img-overlay').exists()).toBe(true)
  })

  it('renders img slot', () => {
    const wrapper = mount(BCard, {
      slots: {img: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders img in correct order when not prop imgBottom', () => {
    const wrapper = mount(BCard, {
      props: {header: 'header', bodyText: 'bodyText', footer: 'footer', imgBottom: false},
      slots: {img: 'img'},
    })
    expect(wrapper.text()).toBe('imgheaderbodyTextfooter')
  })

  it('does not render b-card-img when slot img', () => {
    const wrapper = mount(BCard, {
      slots: {img: 'img'},
    })
    const $cardimg = wrapper.findComponent(BCardImg)
    expect($cardimg.exists()).toBe(false)
  })

  it('renders img in correct order when prop imgBottom', () => {
    const wrapper = mount(BCard, {
      props: {header: 'header', bodyText: 'bodyText', footer: 'footer', imgPlacement: 'bottom'},
      slots: {img: 'img'},
    })
    expect(wrapper.text()).toBe('headerbodyTextfooterimg')
  })

  it('does not have child BCardImg by default', () => {
    const wrapper = mount(BCard)
    const $img = wrapper.findComponent(BCardImg)
    expect($img.exists()).toBe(false)
  })

  it('has child BCardImg when prop imgSrc', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc'},
    })
    const $img = wrapper.findComponent(BCardImg)
    expect($img.exists()).toBe(true)
  })

  it('child BCardImg has its prop src as imgSrc', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc'},
    })
    const $img = wrapper.getComponent(BCardImg)
    expect($img.props('src')).toBe('/abc')
  })

  it('child BCardImg has its prop width as imgWidth string', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc', imgWidth: '100'},
    })
    const $img = wrapper.getComponent(BCardImg)
    expect($img.props('width')).toBe('100')
  })

  it('child BCardImg has its prop height as imgHeight', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc', imgHeight: 100},
    })
    const $img = wrapper.getComponent(BCardImg)
    expect($img.props('height')).toBe(100)
  })

  it('child BCardImg has its prop height as imgHeight string', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc', imgHeight: '100'},
    })
    const $img = wrapper.getComponent(BCardImg)
    expect($img.props('height')).toBe('100')
  })

  it('does not have child BCardHeader by default', () => {
    const wrapper = mount(BCard)
    const $header = wrapper.findComponent(BCardHeader)
    expect($header.exists()).toBe(false)
  })

  it('has child BCardHeader when prop header', () => {
    const wrapper = mount(BCard, {
      props: {header: 'foobar'},
    })
    const $header = wrapper.findComponent(BCardHeader)
    expect($header.exists()).toBe(true)
  })

  it('has child BCardHeader when slot header', () => {
    const wrapper = mount(BCard, {
      slots: {header: 'foobar'},
    })
    const $header = wrapper.findComponent(BCardHeader)
    expect($header.exists()).toBe(true)
  })

  it('child BCardHeader is given class of headerClass', () => {
    const wrapper = mount(BCard, {
      props: {header: 'foobar', headerClass: ['foobar']},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.classes()).toContain('foobar')
  })

  it('child BCardHeader has internal prop bg as prop headerBg', () => {
    const wrapper = mount(BCard, {
      props: {header: 'foobar', headerBg: 'danger'},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.props('bg')).toBe('danger')
  })

  it('child BCardHeader has internal prop border as prop headerBorder', () => {
    const wrapper = mount(BCard, {
      props: {header: 'foobar', headerBorder: 'danger'},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.props('border')).toBe('danger')
  })

  it('child BCardHeader has internal prop tag as prop headerTag', () => {
    const wrapper = mount(BCard, {
      props: {header: 'foobar', headerTag: 'span'},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.props('tag')).toBe('span')
  })

  it('child BCardHeader has internal prop fg as prop headerFg', () => {
    const wrapper = mount(BCard, {
      props: {header: 'foobar', headerFg: 'danger'},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.props('fg')).toBe('danger')
  })

  it('child BCardHeader text is prop header', () => {
    const wrapper = mount(BCard, {
      props: {header: 'foobar'},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.text()).toBe('foobar')
  })

  it('child BCardHeader text is slot header', () => {
    const wrapper = mount(BCard, {
      slots: {header: 'foobar'},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.text()).toBe('foobar')
  })

  it('child BCardHeader text prefers slot header over prop header', () => {
    const wrapper = mount(BCard, {
      slots: {header: 'slots'},
      props: {header: 'props'},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.text()).toBe('slots')
  })

  it('has child BCardBody by default', () => {
    const wrapper = mount(BCard)
    const $body = wrapper.findComponent(BCardBody)
    expect($body.exists()).toBe(true)
  })

  it('does not have child BCardBody when prop noBdoy', () => {
    const wrapper = mount(BCard, {
      props: {noBody: true},
    })
    const $body = wrapper.findComponent(BCardBody)
    expect($body.exists()).toBe(false)
  })

  it('child BCardBody text is prop bodyText', () => {
    const wrapper = mount(BCard, {
      props: {bodyText: 'foobar'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.text()).toBe('foobar')
  })

  it('child BCardBody text is slot default', () => {
    const wrapper = mount(BCard, {
      slots: {default: 'foobar'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.text()).toBe('foobar')
  })

  it('child BCardBody text prefers slot default over prop bodyText', () => {
    const wrapper = mount(BCard, {
      slots: {default: 'slots'},
      props: {bodyText: 'props'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.text()).toBe('slots')
  })

  it('renders default slot when prop noBody', () => {
    const wrapper = mount(BCard, {
      props: {noBody: true},
      slots: {default: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders prop bodyText when prop noBody', () => {
    const wrapper = mount(BCard, {
      props: {noBody: true, bodyText: 'foobar'},
    })
    expect(wrapper.text()).toBe('foobar')
  })

  it('renders default slot over prop bodyText when prop noBody', () => {
    const wrapper = mount(BCard, {
      props: {noBody: true, bodyText: 'props'},
      slots: {default: 'slots'},
    })
    expect(wrapper.text()).toBe('slots')
  })

  it('child BCardBody is given prop bodyClass', () => {
    const wrapper = mount(BCard, {
      props: {bodyClass: ['foobar']},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.classes()).toContain('foobar')
  })

  it('child BCardBody has internal prop bg as prop bodyBg', () => {
    const wrapper = mount(BCard, {
      props: {bodyBg: 'danger'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('bg')).toBe('danger')
  })

  it('child BCardBody has internal prop border as prop bodyBorder', () => {
    const wrapper = mount(BCard, {
      props: {bodyBorder: 'danger'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('border')).toBe('danger')
  })

  it('child BCardHeader has internal prop bodyTag as prop bodyTag', () => {
    const wrapper = mount(BCard, {
      props: {bodyTag: 'span'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('tag')).toBe('span')
  })

  it('child BCardBody has internal prop fg as prop bodyFg', () => {
    const wrapper = mount(BCard, {
      props: {bodyFg: 'danger'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('fg')).toBe('danger')
  })

  it('child BCardHeader has internal prop subtitle as prop subtitle', () => {
    const wrapper = mount(BCard, {
      props: {subtitle: 'foobar'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('subtitle')).toBe('foobar')
  })

  it('child BCardHeader has internal prop subtitleTag as prop subtitleTag', () => {
    const wrapper = mount(BCard, {
      props: {subtitleTag: 'span'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('subtitleTag')).toBe('span')
  })

  it('child BCardBody has internal prop subtitleFg as prop subtitleFg', () => {
    const wrapper = mount(BCard, {
      props: {subtitleFg: 'danger'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('subtitleFg')).toBe('danger')
  })

  it('child BCardHeader has internal prop title as prop title', () => {
    const wrapper = mount(BCard, {
      props: {title: 'foobar'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('title')).toBe('foobar')
  })

  it('child BCardHeader has internal prop titleTag as prop titleTag', () => {
    const wrapper = mount(BCard, {
      props: {titleTag: 'span'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('titleTag')).toBe('span')
  })

  it('does not have child BCardFooter by default', () => {
    const wrapper = mount(BCard)
    const $footer = wrapper.findComponent(BCardFooter)
    expect($footer.exists()).toBe(false)
  })

  it('has child BCardFooter when prop footer', () => {
    const wrapper = mount(BCard, {
      props: {footer: 'foobar'},
    })
    const $footer = wrapper.findComponent(BCardFooter)
    expect($footer.exists()).toBe(true)
  })

  it('has child BCardFooter when slot footer', () => {
    const wrapper = mount(BCard, {
      slots: {footer: 'foobar'},
    })
    const $footer = wrapper.findComponent(BCardFooter)
    expect($footer.exists()).toBe(true)
  })

  it('child BCardFooter contains class prop footerClass', () => {
    const wrapper = mount(BCard, {
      props: {footer: 'foobar', footerClass: ['foobar']},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.classes()).toContain('foobar')
  })

  it('child BCardFooter has internal prop bg as prop footerBg', () => {
    const wrapper = mount(BCard, {
      props: {footer: 'foobar', footerBg: 'danger'},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.props('bg')).toBe('danger')
  })

  it('child BCardFooter has internal prop border as prop footerBorder', () => {
    const wrapper = mount(BCard, {
      props: {footer: 'foobar', footerBorder: 'danger'},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.props('border')).toBe('danger')
  })

  it('child BCardFooter has internal prop tag as prop footerTag', () => {
    const wrapper = mount(BCard, {
      props: {footer: 'foobar', footerTag: 'span'},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.props('tag')).toBe('span')
  })

  it('child BCardFooter has internal prop fg as prop footerFg', () => {
    const wrapper = mount(BCard, {
      props: {footer: 'foobar', footerFg: 'danger'},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.props('fg')).toBe('danger')
  })

  it('child BCardFooter has renders text as slot footer', () => {
    const wrapper = mount(BCard, {
      slots: {footer: 'foobar'},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.text()).toBe('foobar')
  })

  it('child BCardFooter has renders text as prop footer', () => {
    const wrapper = mount(BCard, {
      props: {footer: 'foobar'},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.text()).toBe('foobar')
  })

  it('child BCardFooter prefers to render slot footer over prop footer', () => {
    const wrapper = mount(BCard, {
      slots: {footer: 'slots'},
      props: {footer: 'props'},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.text()).toBe('slots')
  })

  it('renders in correct order', () => {
    const wrapper = mount(BCard, {
      props: {header: 'header', bodyText: 'bodyText', footer: 'footer'},
    })
    expect(wrapper.text()).toBe('headerbodyTextfooter')
  })

  it('renders img in correct order', () => {
    const wrapper = mount(BCard, {
      props: {header: 'header', headerTag: 'img', imgSrc: '/abc'},
    })
    const [$first, $second] = wrapper.findAll('img')
    expect($first.exists()).toBe(true)
    expect($second.exists()).toBe(true)
    expect($first.attributes('src')).toBe('/abc')
  })

  it('renders img in correct order when imgPlacement', () => {
    const wrapper = mount(BCard, {
      props: {header: 'header', headerTag: 'img', imgSrc: '/abc', imgPlacement: 'bottom'},
    })
    const [$first, $second] = wrapper.findAll('img')
    expect($first.exists()).toBe(true)
    expect($second.exists()).toBe(true)
    expect($second.attributes('src')).toBe('/abc')
  })

  it('child BCardImg has its alt attribute as imgAlt', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc', imgAlt: 'foobar'},
    })
    const $img = wrapper.find('img')
    expect($img.attributes('alt')).toBe('foobar')
  })

  it('child BCardImg has its prop width as imgWidth number', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc', imgWidth: 100},
    })
    const $img = wrapper.getComponent(BCardImg)
    expect($img.props('width')).toBe(100)
  })

  it('child BCardImg has its prop placement as imgPlacement', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc', imgPlacement: 'top'},
    })
    const $img = wrapper.getComponent(BCardImg)
    expect($img.props('placement')).toBe('top')
  })

  it('child BCardImg has its prop lazy as imgAttrs', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc', imgAttrs: {lazy: true}},
    })
    const $img = wrapper.find('img')
    expect($img.attributes('loading')).toBe('lazy')
  })

  it('child BCardImg has its attributes as imgAttrs', () => {
    const wrapper = mount(BCard, {
      props: {imgSrc: '/abc', imgAttrs: {'data-testid': 'foobar'}},
    })
    const $img = wrapper.find('img')
    expect($img.attributes('data-testid')).toBe('foobar')
  })

  it('child BCardHeader has internal prop theme as prop headerTheme', () => {
    const wrapper = mount(BCard, {
      props: {header: 'foobar', headerTheme: 'danger'},
    })
    const $header = wrapper.getComponent(BCardHeader)
    expect($header.props('theme')).toBe('danger')
  })

  it('child BCardFooter has internal prop theme as prop footerTheme', () => {
    const wrapper = mount(BCard, {
      props: {footer: 'foobar', footerTheme: 'danger'},
    })
    const $footer = wrapper.getComponent(BCardFooter)
    expect($footer.props('theme')).toBe('danger')
  })

  it('child BCardBody has overlay false by default', () => {
    const wrapper = mount(BCard)
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('overlay')).toBe(false)
  })

  it('child BCardBody has overlay true when imgPlacement is overlay', () => {
    const wrapper = mount(BCard, {
      props: {imgPlacement: 'overlay'},
    })
    const $body = wrapper.getComponent(BCardBody)
    expect($body.props('overlay')).toBe(true)
  })
})
