import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {h, nextTick} from 'vue'
import {renderToString} from 'vue/server-renderer'
import BCarousel from './BCarousel.vue'
import BCarouselSlide from './BCarouselSlide.vue'
import type {BvCarouselEvent} from '../../utils/classes'
import type {CarouselControlsSlotProps} from '../../types'

const slides = (n = 3) =>
  Array.from({length: n}, (_, i) =>
    h(BCarouselSlide, {key: i, id: `s${i}`}, {default: () => `Slide ${i}`})
  )

const activeSlide = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('.carousel-item').findIndex((s) => s.classes().includes('active'))

// No layout in happy-dom: drive the engine's no-observer / no-animation path
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', undefined)
  vi.stubGlobal('requestAnimationFrame', undefined)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('carousel', () => {
  enableAutoUnmount(afterEach)

  describe('markup', () => {
    it('renders v6 markup without v5 classes', () => {
      const wrapper = mount(BCarousel, {slots: {default: () => slides()}})
      expect(wrapper.classes()).toEqual(['carousel'])
      const inner = wrapper.get('.carousel-inner')
      expect(inner.attributes('tabindex')).toBe('0')
      expect(wrapper.findAll('.carousel-inner > .carousel-item')).toHaveLength(3)
      const html = wrapper.html()
      for (const cls of ['slide', 'pointer-event', 'carousel-control-prev', 'carousel-caption']) {
        expect(html).not.toContain(`class="${cls}`)
      }
    })

    it('marks the modelValue slide active', async () => {
      const wrapper = mount(BCarousel, {props: {modelValue: 1}, slots: {default: () => slides()}})
      await nextTick()
      expect(activeSlide(wrapper)).toBe(1)
    })

    it('renders no control bar by default', () => {
      const wrapper = mount(BCarousel, {slots: {default: () => slides()}})
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it.each([
      ['fade', 'carousel-fade'],
      ['center', 'carousel-center'],
      ['auto', 'carousel-auto'],
      ['overlay', 'carousel-overlay'],
    ] as const)('%s adds %s', (prop, cls) => {
      const wrapper = mount(BCarousel, {props: {[prop]: true}})
      expect(wrapper.classes()).toContain(cls)
    })

    it('noTransition sets the fade duration to 0s', () => {
      const wrapper = mount(BCarousel, {props: {noTransition: true}})
      expect(wrapper.attributes('style')).toContain('--bs-carousel-fade-duration: 0s')
    })
  })

  describe('indicators', () => {
    it('renders one 1-based labelled button per slide', () => {
      const wrapper = mount(BCarousel, {
        props: {indicators: true, id: 'c1'},
        slots: {default: () => slides()},
      })
      const group = wrapper.get('.carousel-indicators')
      expect(group.attributes('aria-label')).toBe('Select a slide to display')
      const buttons = group.findAll('button')
      expect(buttons.map((b) => b.attributes('aria-label'))).toEqual([
        'Slide 1',
        'Slide 2',
        'Slide 3',
      ])
      expect(buttons.every((b) => b.attributes('data-bs-target') === '#c1')).toBe(true)
      expect(buttons[0]?.classes()).toContain('active')
      expect(buttons[0]?.attributes('aria-current')).toBe('true')
      expect(buttons[1]?.attributes('aria-current')).toBeUndefined()
    })

    it('clicking an indicator moves to that slide and emits slide/slid', async () => {
      const wrapper = mount(BCarousel, {
        props: {indicators: true},
        slots: {default: () => slides()},
      })
      await wrapper.findAll('.carousel-indicators button')[2]?.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
      const slide = wrapper.emitted<[BvCarouselEvent]>('slide')?.[0]?.[0]
      expect(slide?.from).toBe(0)
      expect(slide?.to).toBe(2)
      expect(slide?.direction).toBe('left')
      expect(slide?.cancelable).toBe(true)
      expect(wrapper.emitted('slid')).toHaveLength(1)
      expect(activeSlide(wrapper)).toBe(2)
    })
  })

  describe('controls', () => {
    it('renders prev/next icon buttons with hidden labels in a bar below the slides', () => {
      const wrapper = mount(BCarousel, {props: {controls: true}, slots: {default: () => slides()}})
      const bar = wrapper.element.lastElementChild as HTMLElement
      expect(bar.className).toBe('d-flex justify-content-between align-items-center')
      const buttons = wrapper.findAll('button.btn-icon')
      expect(buttons).toHaveLength(2)
      expect(buttons[0]?.find('.carousel-icon-prev').exists()).toBe(true)
      expect(buttons[0]?.get('.visually-hidden').text()).toBe('Previous')
      expect(buttons[1]?.find('.carousel-icon-next').exists()).toBe(true)
      expect(buttons[1]?.get('.visually-hidden').text()).toBe('Next')
    })

    it('overlay uses the overlay bar and subtle buttons', () => {
      const wrapper = mount(BCarousel, {
        props: {controls: true, overlay: true},
        slots: {default: () => slides()},
      })
      expect(wrapper.find('.carousel-overlay-controls').exists()).toBe(true)
      expect(wrapper.get('button.btn-icon').classes()).toEqual(
        expect.arrayContaining(['btn-subtle', 'theme-secondary'])
      )
    })

    it('next and prev move the model', async () => {
      const wrapper = mount(BCarousel, {props: {controls: true}, slots: {default: () => slides()}})
      const [prev, next] = wrapper.findAll('button.btn-icon')
      await next?.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
      await prev?.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    })

    it('ends wrap jumps from the first slide to the last', async () => {
      const wrapper = mount(BCarousel, {
        props: {controls: true, ends: 'wrap'},
        slots: {default: () => slides()},
      })
      await wrapper.findAll('button.btn-icon')[0]?.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
    })

    it('ends loop continues from the last slide to the first through a clone', async () => {
      const wrapper = mount(BCarousel, {
        props: {controls: true, modelValue: 2},
        slots: {default: () => slides()},
        attachTo: document.body,
      })
      await wrapper.findAll('button.btn-icon')[1]?.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
      expect(wrapper.emitted<[BvCarouselEvent]>('slid')?.[0]?.[0]?.to).toBe(0)
      expect(wrapper.find('.carousel-item-clone').exists()).toBe(false)
    })

    it('ends stop disables prev at the start and next at the end', async () => {
      const wrapper = mount(BCarousel, {
        props: {controls: true, ends: 'stop'},
        slots: {default: () => slides(2)},
      })
      await nextTick()
      const [prev, next] = wrapper.findAll('button.btn-icon')
      expect(prev?.attributes('disabled')).toBeDefined()
      expect(next?.attributes('disabled')).toBeUndefined()
      await next?.trigger('click')
      await nextTick()
      expect(prev?.attributes('disabled')).toBeUndefined()
      expect(next?.attributes('disabled')).toBeDefined()
    })

    it('a prevented slide event cancels navigation', async () => {
      const wrapper = mount(BCarousel, {
        props: {controls: true, onSlide: (e: BvCarouselEvent) => e.preventDefault()},
        slots: {default: () => slides()},
      })
      await wrapper.findAll('button.btn-icon')[1]?.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(wrapper.emitted('slid')).toBeUndefined()
      expect(activeSlide(wrapper)).toBe(0)
    })

    it('does not emit prev-click / next-click any more', async () => {
      const wrapper = mount(BCarousel, {props: {controls: true}, slots: {default: () => slides()}})
      await wrapper.findAll('button.btn-icon')[1]?.trigger('click')
      expect(wrapper.emitted('next-click')).toBeUndefined()
    })
  })

  describe('v-model', () => {
    it('a model change navigates and emits slide', async () => {
      const wrapper = mount(BCarousel, {props: {modelValue: 0}, slots: {default: () => slides()}})
      await wrapper.setProps({modelValue: 2})
      expect(activeSlide(wrapper)).toBe(2)
      expect(wrapper.emitted('slide')).toHaveLength(1)
    })

    it('a prevented model change reverts the model', async () => {
      const wrapper = mount(BCarousel, {
        props: {modelValue: 0, onSlide: (e: BvCarouselEvent) => e.preventDefault()},
        slots: {default: () => slides()},
      })
      await wrapper.setProps({modelValue: 1})
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
      expect(activeSlide(wrapper)).toBe(0)
    })
  })

  describe('keyboard', () => {
    it('ArrowRight / ArrowLeft navigate', async () => {
      const wrapper = mount(BCarousel, {slots: {default: () => slides()}})
      await wrapper.trigger('keydown', {key: 'ArrowRight'})
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
      await wrapper.trigger('keydown', {key: 'ArrowLeft'})
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    })

    it('keyboard false ignores arrows', async () => {
      const wrapper = mount(BCarousel, {props: {keyboard: false}, slots: {default: () => slides()}})
      await wrapper.trigger('keydown', {key: 'ArrowRight'})
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  describe('autoplay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
        {} as DOMRect,
      ] as unknown as DOMRectList)
    })

    it('advances after the interval and marks the root playing', async () => {
      const wrapper = mount(BCarousel, {
        props: {autoplay: true, interval: 1000, indicators: true},
        slots: {default: () => slides()},
      })
      await nextTick()
      expect(wrapper.classes()).toContain('carousel-playing')
      expect(wrapper.attributes('style')).toContain('--bs-carousel-interval: 1000ms')
      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
    })

    it('uses the slide interval', async () => {
      const wrapper = mount(BCarousel, {
        props: {autoplay: true, interval: 1000},
        slots: {
          default: () => [
            h(BCarouselSlide, {interval: 3000}, () => 'A'),
            h(BCarouselSlide, () => 'B'),
          ],
        },
      })
      await nextTick()
      expect(wrapper.get('.carousel-item').attributes('data-bs-interval')).toBe('3000')
      vi.advanceTimersByTime(1000)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      vi.advanceTimersByTime(2000)
      await nextTick()
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
    })

    it('stops for good when a control is used', async () => {
      const wrapper = mount(BCarousel, {
        props: {autoplay: true, interval: 1000, controls: true},
        slots: {default: () => slides()},
      })
      await nextTick()
      await wrapper.findAll('button.btn-icon')[1]?.trigger('click')
      expect(wrapper.classes()).not.toContain('carousel-playing')
      vi.advanceTimersByTime(5000)
      expect(wrapper.emitted('update:modelValue')).toEqual([[1]])
    })

    it('pauses on hover and resumes on leave', async () => {
      const wrapper = mount(BCarousel, {
        props: {autoplay: true, interval: 1000},
        slots: {default: () => slides()},
      })
      await nextTick()
      await wrapper.trigger('mouseenter')
      expect(wrapper.classes()).not.toContain('carousel-playing')
      await wrapper.trigger('mouseleave')
      expect(wrapper.classes()).toContain('carousel-playing')
    })

    it('pause false does not pause on hover', async () => {
      const wrapper = mount(BCarousel, {
        props: {autoplay: true, pause: false},
        slots: {default: () => slides()},
      })
      await nextTick()
      await wrapper.trigger('mouseenter')
      expect(wrapper.classes()).toContain('carousel-playing')
    })

    it('playPause toggles with labels and the paused class', async () => {
      const wrapper = mount(BCarousel, {
        props: {autoplay: true, playPause: true},
        slots: {default: () => slides()},
      })
      await nextTick()
      const button = wrapper.get('.carousel-control-play-pause')
      expect(button.attributes('aria-label')).toBe('Pause')
      expect(button.classes()).not.toContain('paused')
      await button.trigger('click')
      expect(button.attributes('aria-label')).toBe('Play')
      expect(button.classes()).toContain('paused')
      expect(wrapper.classes()).not.toContain('carousel-playing')
      await button.trigger('click')
      expect(wrapper.classes()).toContain('carousel-playing')
    })
  })

  describe('controls slot and exposed', () => {
    it('the controls slot replaces the bar and receives navigation props', async () => {
      let scope: CarouselControlsSlotProps | undefined
      const wrapper = mount(BCarousel, {
        props: {controls: true, indicators: true},
        slots: {
          default: () => slides(),
          controls: (p: CarouselControlsSlotProps) => {
            scope = p
            return h('button', {class: 'custom', onClick: p.next}, 'Go')
          },
        },
      })
      expect(wrapper.find('.carousel-indicators').exists()).toBe(false)
      expect(scope?.count).toBe(3)
      expect(scope?.index).toBe(0)
      await wrapper.get('.custom').trigger('click')
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
    })

    it('exposes to, next, prev', async () => {
      const wrapper = mount(BCarousel, {slots: {default: () => slides()}})
      const vm = wrapper.vm as unknown as {
        to: (i: number) => void
        next: () => void
        prev: () => void
      }
      vm.to(2)
      await nextTick()
      expect(activeSlide(wrapper)).toBe(2)
      vm.prev()
      await nextTick()
      expect(activeSlide(wrapper)).toBe(1)
      vm.next()
      await nextTick()
      expect(activeSlide(wrapper)).toBe(2)
    })
  })

  describe('ssr', () => {
    it('renders the active slide and indicator on the server', async () => {
      const html = await renderToString(
        h(BCarousel, {id: 'c', modelValue: 1, indicators: true}, {default: () => slides()})
      )
      expect(html.match(/class="carousel-item active"/g)).toHaveLength(1)
      expect(html).toContain('id="s1" class="carousel-item active"')
      expect(html.match(/aria-current="true"/g)).toHaveLength(1)
      expect(html).toContain('aria-label="Slide 2"')
    })
  })
})
