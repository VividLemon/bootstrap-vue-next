import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, describe, expect, it} from 'vitest'
import {h} from 'vue'
import BCarouselSlide from './BCarouselSlide.vue'

describe('carousel-slide', () => {
  enableAutoUnmount(afterEach)

  it('renders div.carousel-item', () => {
    const wrapper = mount(BCarouselSlide)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toEqual(['carousel-item'])
  })

  it('has no inline background and no caption markup', () => {
    const wrapper = mount(BCarouselSlide, {slots: {default: 'Text'}})
    expect(wrapper.attributes('style')).toBeUndefined()
    expect(wrapper.find('.carousel-caption').exists()).toBe(false)
    expect(wrapper.text()).toBe('Text')
  })

  it('uses the id prop', () => {
    const wrapper = mount(BCarouselSlide, {props: {id: 'foo'}})
    expect(wrapper.attributes('id')).toBe('foo')
  })

  it('renders no image without imgSrc', () => {
    const wrapper = mount(BCarouselSlide)
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('renders img.d-block.w-100 with imgSrc, imgAlt and imgSrcset', () => {
    const wrapper = mount(BCarouselSlide, {
      props: {imgSrc: '/a.png', imgAlt: 'A', imgSrcset: '/a.png 1x, /a2.png 2x'},
    })
    const img = wrapper.get('img')
    expect(img.classes()).toEqual(expect.arrayContaining(['d-block', 'w-100']))
    expect(img.attributes('src')).toBe('/a.png')
    expect(img.attributes('alt')).toBe('A')
    expect(img.attributes('srcset')).toBe('/a.png 1x, /a2.png 2x')
  })

  it('img slot replaces the image', () => {
    const wrapper = mount(BCarouselSlide, {
      props: {imgSrc: '/a.png'},
      slots: {img: () => h('picture', {class: 'custom'})},
    })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('picture.custom').exists()).toBe(true)
  })

  it('interval renders data-bs-interval', () => {
    const wrapper = mount(BCarouselSlide, {props: {interval: 2000}})
    expect(wrapper.attributes('data-bs-interval')).toBe('2000')
  })

  it('is not active outside a carousel', () => {
    const wrapper = mount(BCarouselSlide)
    expect(wrapper.classes()).not.toContain('active')
  })
})
