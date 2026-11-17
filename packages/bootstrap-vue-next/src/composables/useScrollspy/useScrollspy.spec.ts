import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {createSSRApp, defineComponent, h, nextTick, ref} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {useScrollspy} from './index'
import type {UseScrollspyOptions} from '../../types/Scrollspy'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  readonly observed = new Set<Element>()
  disconnected = false
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit = {}
  ) {
    MockIntersectionObserver.instances.push(this)
  }
  observe(el: Element) {
    this.observed.add(el)
  }
  unobserve(el: Element) {
    this.observed.delete(el)
  }
  disconnect() {
    this.disconnected = true
    this.observed.clear()
  }
  takeRecords() {
    return []
  }
  trigger(entries: {target: Element; isIntersecting: boolean}[]) {
    this.callback(
      entries as unknown as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver
    )
  }
}

const isSentinel = (el: Element) => el.getAttribute('aria-hidden') === 'true' && el.id === ''

const activeObservers = () => MockIntersectionObserver.instances.filter((o) => !o.disconnected)
const sectionObserver = () =>
  activeObservers()
    .filter((o) => [...o.observed].some((el) => !isSentinel(el)))
    .at(-1)!
const sentinelObserver = () =>
  activeObservers()
    .filter((o) => [...o.observed].some((el) => isSentinel(el)))
    .at(-1)!

const html = `
  <nav id="toc" class="nav flex-column">
    <a id="link-one" class="nav-link" href="#one">One</a>
    <nav class="nav flex-column">
      <a id="link-one-a" class="nav-link" href="#one-a">One A</a>
      <a id="link-one-b" class="nav-link" href="#one-b">One B</a>
    </nav>
    <a id="link-two" class="nav-link" href="#two">Two</a>
    <a id="link-disabled" class="nav-link disabled" href="#disabled">Disabled</a>
    <a id="link-missing" class="nav-link" href="#missing">Missing</a>
    <a id="link-outside" class="nav-link" href="#outside">Outside</a>
    <a class="nav-link" href="#">Empty hash</a>
  </nav>
  <div id="content" style="height: 200px; overflow-y: auto">
    <h2 id="one">One</h2>
    <h3 id="one-a">One A</h3>
    <h3 id="one-b">One B</h3>
    <h2 id="two">Two</h2>
    <h2 id="disabled">Disabled</h2>
  </div>
  <h2 id="outside">Outside</h2>
`

const byId = (id: string) => document.getElementById(id) as HTMLElement

const mountSpy = (options: UseScrollspyOptions | ReturnType<typeof ref> = {}) => {
  let result!: ReturnType<typeof useScrollspy>
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useScrollspy('#content', '#toc', options as UseScrollspyOptions)
        return () => h('div')
      },
    })
  )
  return {wrapper, spy: result}
}

describe('useScrollspy', () => {
  enableAutoUnmount(afterEach)

  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList)
    document.body.innerHTML = html
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  describe('sections', () => {
    it('collects sections from the target links, skipping disabled, missing and outside ones', async () => {
      const {spy} = mountSpy()
      await nextTick()
      expect(spy.sections.value.map((s) => s.id)).toEqual(['one', 'one-a', 'one-b', 'two'])
      expect(spy.sections.value[0]?.el).toBe(byId('one'))
      expect(spy.sections.value[0]?.link).toBe(byId('link-one'))
    })

    it('resolves the content and target elements', () => {
      const {spy} = mountSpy()
      expect(spy.content.value).toBe(byId('content'))
      expect(spy.target.value).toBe(byId('toc'))
    })

    it('skips sections that are not visible', () => {
      vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
        return (this.id === 'two' ? [] : [{}]) as unknown as DOMRectList
      })
      const {spy} = mountSpy()
      expect(spy.sections.value.map((s) => s.id)).toEqual(['one', 'one-a', 'one-b'])
    })

    it('resolves percent-encoded ids and ids with dots', () => {
      document.body.innerHTML = `
        <nav id="toc"><a href="#a.b">a</a><a href="#%C3%A9t%C3%A9">b</a></nav>
        <div id="content"><h2 id="a.b">a</h2><h2 id="été">b</h2></div>`
      const {spy} = mountSpy()
      expect(spy.sections.value.map((s) => s.id)).toEqual(['a.b', 'été'])
    })

    it('sorts sections top to bottom', () => {
      document.body.innerHTML = `
        <nav id="toc"><a href="#low">low</a><a href="#high">high</a></nav>
        <div id="content"><h2 id="low">low</h2><h2 id="high">high</h2></div>`
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: Element
      ) {
        return {top: this.id === 'low' ? 500 : 10} as DOMRect
      })
      const {spy} = mountSpy()
      expect(spy.sections.value.map((s) => s.id)).toEqual(['high', 'low'])
    })
  })

  describe('active section', () => {
    it('is null before any intersection', () => {
      const {spy} = mountSpy()
      expect(spy.current.value).toBeNull()
      expect(spy.activeIds.value).toEqual([])
    })

    it('falls back to the first section above the first one', () => {
      const {spy} = mountSpy()
      sectionObserver().trigger([{target: byId('one'), isIntersecting: false}])
      expect(spy.current.value).toBe('one')
    })

    it('picks the deepest section crossing the activation line', () => {
      const {spy} = mountSpy()
      sectionObserver().trigger([
        {target: byId('one'), isIntersecting: true},
        {target: byId('one-a'), isIntersecting: true},
      ])
      expect(spy.current.value).toBe('one-a')
    })

    it('keeps the last active section in a gap', () => {
      const {spy} = mountSpy()
      const observer = sectionObserver()
      observer.trigger([{target: byId('one-b'), isIntersecting: true}])
      expect(spy.current.value).toBe('one-b')
      observer.trigger([{target: byId('one-b'), isIntersecting: false}])
      expect(spy.current.value).toBe('one-b')
    })

    it('activates the last section when the bottom sentinel is visible and content overflows', () => {
      const content = byId('content')
      Object.defineProperty(content, 'scrollHeight', {value: 1000, configurable: true})
      Object.defineProperty(content, 'clientHeight', {value: 200, configurable: true})
      const {spy} = mountSpy()
      sectionObserver().trigger([{target: byId('one'), isIntersecting: true}])
      const sentinel = content.lastElementChild as HTMLElement
      sentinelObserver().trigger([{target: sentinel, isIntersecting: true}])
      expect(spy.current.value).toBe('two')
      sentinelObserver().trigger([{target: sentinel, isIntersecting: false}])
      expect(spy.current.value).toBe('one')
    })

    it('ignores the sentinel when content does not overflow', () => {
      const {spy} = mountSpy()
      sectionObserver().trigger([{target: byId('one'), isIntersecting: true}])
      const sentinel = byId('content').lastElementChild as HTMLElement
      sentinelObserver().trigger([{target: sentinel, isIntersecting: true}])
      expect(spy.current.value).toBe('one')
    })

    it('returns the parent chain for nested navs', () => {
      const {spy} = mountSpy()
      sectionObserver().trigger([{target: byId('one-b'), isIntersecting: true}])
      expect(spy.activeIds.value).toEqual(['one-b', 'one'])
      expect(spy.activeLinks.value).toEqual([byId('link-one-b'), byId('link-one')])
    })

    it('returns the parent chain for list groups and nav items', () => {
      document.body.innerHTML = `
        <div id="toc">
          <div class="list-group">
            <a id="lg-parent" class="list-group-item" href="#p">p</a>
            <div class="list-group"><a id="lg-child" class="list-group-item" href="#c">c</a></div>
          </div>
          <ul class="nav">
            <li class="nav-item"><a id="ni-parent" class="nav-link" href="#q">q</a>
              <ul class="nav"><li class="nav-item"><a id="ni-child" class="nav-link" href="#r">r</a></li></ul>
            </li>
          </ul>
        </div>
        <div id="content"><h2 id="p">p</h2><h3 id="c">c</h3><h2 id="q">q</h2><h3 id="r">r</h3></div>`
      const {spy} = mountSpy()
      sectionObserver().trigger([{target: byId('c'), isIntersecting: true}])
      expect(spy.activeIds.value).toEqual(['c', 'p'])
      sectionObserver().trigger([
        {target: byId('c'), isIntersecting: false},
        {target: byId('r'), isIntersecting: true},
      ])
      expect(spy.activeIds.value).toEqual(['r', 'q'])
      expect(spy.activeLinks.value).toEqual([byId('ni-child'), byId('ni-parent')])
    })

    it('returns the menu toggle for a menu item', () => {
      document.body.innerHTML = `
        <div id="toc">
          <button id="toggle" data-bs-toggle="menu">Menu</button>
          <div class="menu"><a id="mi" class="menu-item" href="#m">m</a></div>
        </div>
        <div id="content"><h2 id="m">m</h2></div>`
      const {spy} = mountSpy()
      sectionObserver().trigger([{target: byId('m'), isIntersecting: true}])
      expect(spy.activeIds.value).toEqual(['m'])
      expect(spy.activeLinks.value).toEqual([byId('mi'), byId('toggle')])
    })

    it('never writes the active state to the DOM', () => {
      mountSpy()
      sectionObserver().trigger([{target: byId('one-a'), isIntersecting: true}])
      expect(document.querySelectorAll('.active')).toHaveLength(0)
      expect(document.querySelectorAll('[aria-current]')).toHaveLength(0)
    })
  })

  describe('observer options', () => {
    it('uses the content as root when it scrolls', () => {
      mountSpy()
      expect(sectionObserver().options.root).toBe(byId('content'))
    })

    it('uses the viewport as root when the content does not scroll', () => {
      byId('content').style.overflowY = 'visible'
      mountSpy()
      expect(sectionObserver().options.root).toBeNull()
    })

    it('derives the rootMargin from the default 12% topMargin', () => {
      mountSpy()
      expect(sectionObserver().options.rootMargin).toBe('0px 0px -88% 0px')
      expect(sectionObserver().options.threshold).toEqual([0])
    })

    it('derives the rootMargin from a px topMargin and the root height', () => {
      Object.defineProperty(byId('content'), 'clientHeight', {value: 400, configurable: true})
      mountSpy({topMargin: '100px'})
      expect(sectionObserver().options.rootMargin).toBe('0px 0px -75% 0px')
    })

    it('rebuilds the observer on resize for a px topMargin', async () => {
      vi.useFakeTimers()
      const content = byId('content')
      Object.defineProperty(content, 'clientHeight', {value: 400, configurable: true})
      mountSpy({topMargin: '100px'})
      const first = sectionObserver()
      Object.defineProperty(content, 'clientHeight', {value: 200, configurable: true})
      window.dispatchEvent(new Event('resize'))
      vi.advanceTimersByTime(100)
      expect(first.disconnected).toBe(true)
      expect(sectionObserver().options.rootMargin).toBe('0px 0px -50% 0px')
    })

    it('does not listen to resize for a percent topMargin', () => {
      const add = vi.spyOn(window, 'addEventListener')
      mountSpy()
      expect(add.mock.calls.some(([type]) => type === 'resize')).toBe(false)
    })

    it('passes rootMargin and threshold straight through', () => {
      mountSpy({rootMargin: '0px 0px -40%', threshold: [0.5, 1]})
      expect(sectionObserver().options.rootMargin).toBe('0px 0px -40%')
      expect(sectionObserver().options.threshold).toEqual([0.5, 1])
    })

    it('refreshes when reactive options change', async () => {
      const options = ref<UseScrollspyOptions>({topMargin: '50%'})
      mountSpy(options)
      expect(sectionObserver().options.rootMargin).toBe('0px 0px -50% 0px')
      options.value = {topMargin: '20%'}
      await nextTick()
      expect(sectionObserver().options.rootMargin).toBe('0px 0px -80% 0px')
    })
  })

  describe('sentinel', () => {
    it('appends a hidden zero-size sentinel as the last child of the content', () => {
      mountSpy()
      const sentinel = byId('content').lastElementChild as HTMLElement
      expect(sentinel.tagName).toBe('DIV')
      expect(sentinel.getAttribute('aria-hidden')).toBe('true')
      expect(sentinel.style.visibility).toBe('hidden')
      expect(sentinel.style.height).toBe('0px')
      expect(byId('content').querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
    })

    it('re-appends a single sentinel on refresh', () => {
      const {spy} = mountSpy()
      byId('content').append(document.createElement('p'))
      spy.refresh()
      const content = byId('content')
      expect(content.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
      expect(content.lastElementChild?.getAttribute('aria-hidden')).toBe('true')
    })

    it('adds no sentinel without sections', () => {
      document.body.innerHTML = '<nav id="toc"></nav><div id="content"><p>x</p></div>'
      mountSpy()
      expect(byId('content').children).toHaveLength(1)
    })
  })

  describe('watchChanges', () => {
    it('picks up new links in the target', async () => {
      const {spy} = mountSpy()
      const link = document.createElement('a')
      link.href = '#disabled'
      byId('toc').append(link)
      await new Promise((resolve) => setTimeout(resolve))
      await nextTick()
      expect(spy.sections.value.map((s) => s.id)).toContain('disabled')
    })

    it('picks up new sections and changed ids in the content', async () => {
      const {spy} = mountSpy()
      byId('outside').remove()
      const section = document.createElement('h2')
      section.id = 'outside'
      byId('content').append(section)
      byId('one-a').id = 'renamed'
      await new Promise((resolve) => setTimeout(resolve))
      await nextTick()
      expect(spy.sections.value.map((s) => s.id)).toEqual(['one', 'one-b', 'two', 'outside'])
    })

    it('does not loop on its own sentinel', async () => {
      mountSpy()
      byId('content').append(document.createElement('p'))
      await new Promise((resolve) => setTimeout(resolve))
      await nextTick()
      const count = MockIntersectionObserver.instances.length
      await new Promise((resolve) => setTimeout(resolve))
      await nextTick()
      expect(MockIntersectionObserver.instances.length).toBe(count)
    })

    it('ignores changes when disabled', async () => {
      const {spy} = mountSpy({watchChanges: false})
      const link = document.createElement('a')
      link.href = '#disabled'
      byId('toc').append(link)
      await new Promise((resolve) => setTimeout(resolve))
      await nextTick()
      expect(spy.sections.value.map((s) => s.id)).not.toContain('disabled')
    })
  })

  describe('scrolling', () => {
    let scrollTo: ReturnType<typeof vi.fn<(options: ScrollToOptions) => void>>
    let replaceState: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      scrollTo = vi.fn<(options: ScrollToOptions) => void>()
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
        value: scrollTo,
        configurable: true,
        writable: true,
      })
      replaceState = vi.spyOn(window.history, 'replaceState')
      vi.stubGlobal('matchMedia', () => ({matches: false}))
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: Element
      ) {
        return {top: this.id === 'two' ? 600 : this.id === 'content' ? 100 : 0} as DOMRect
      })
    })

    it('scrollTo(id) scrolls the root, replaces the hash and focuses the section', () => {
      const {spy} = mountSpy()
      spy.scrollTo('two')
      expect(scrollTo).toHaveBeenCalledWith({top: 500, behavior: 'auto'})
      expect(replaceState).toHaveBeenCalledWith(window.history.state, '', '#two')
      expect(byId('two').getAttribute('tabindex')).toBe('-1')
      expect(document.activeElement).toBe(byId('two'))
    })

    it('scrollTo accepts a #hash', () => {
      const {spy} = mountSpy()
      spy.scrollTo('#two')
      expect(scrollTo).toHaveBeenCalledWith({top: 500, behavior: 'auto'})
    })

    it('scrollTo ignores unknown ids and sections outside the content', () => {
      const {spy} = mountSpy()
      spy.scrollTo('nope')
      spy.scrollTo('outside')
      expect(scrollTo).not.toHaveBeenCalled()
    })

    it('keeps an existing tabindex', () => {
      byId('two').setAttribute('tabindex', '0')
      const {spy} = mountSpy()
      spy.scrollTo('two')
      expect(byId('two').getAttribute('tabindex')).toBe('0')
    })

    it('scrollTo(event) uses the clicked link and prevents navigation', () => {
      const {spy} = mountSpy()
      const event = new MouseEvent('click', {cancelable: true})
      Object.defineProperty(event, 'target', {value: byId('link-two')})
      spy.scrollTo(event)
      expect(event.defaultPrevented).toBe(true)
      expect(scrollTo).toHaveBeenCalledWith({top: 500, behavior: 'auto'})
    })

    it('smoothScroll scrolls smoothly on link click and settles on scrollend', () => {
      mountSpy({smoothScroll: true})
      const event = new MouseEvent('click', {bubbles: true, cancelable: true})
      byId('link-two').dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      expect(scrollTo).toHaveBeenCalledWith({top: 500, behavior: 'smooth'})
      expect(replaceState).not.toHaveBeenCalled()
      byId('content').dispatchEvent(new Event('scrollend'))
      expect(replaceState).toHaveBeenCalledWith(window.history.state, '', '#two')
      expect(document.activeElement).toBe(byId('two'))
    })

    it('smoothScroll settles after scroll idle without scrollend', () => {
      vi.useFakeTimers()
      mountSpy({smoothScroll: true})
      byId('link-two').dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
      byId('content').dispatchEvent(new Event('scroll'))
      vi.advanceTimersByTime(99)
      expect(replaceState).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(replaceState).toHaveBeenCalledTimes(1)
    })

    it('smoothScroll scrolls instantly with reduced motion', () => {
      vi.stubGlobal('matchMedia', () => ({matches: true}))
      mountSpy({smoothScroll: true})
      byId('link-two').dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
      expect(scrollTo).toHaveBeenCalledWith({top: 500, behavior: 'auto'})
      expect(replaceState).toHaveBeenCalledTimes(1)
    })

    it('does not intercept clicks without smoothScroll', () => {
      mountSpy()
      const event = new MouseEvent('click', {bubbles: true, cancelable: true})
      byId('link-two').dispatchEvent(event)
      expect(event.defaultPrevented).toBe(false)
      expect(scrollTo).not.toHaveBeenCalled()
    })

    it('scrollTo uses smoothScroll as the default and can be overridden', () => {
      const {spy} = mountSpy({smoothScroll: true})
      spy.scrollTo('two', {smooth: false})
      expect(scrollTo).toHaveBeenLastCalledWith({top: 500, behavior: 'auto'})
      spy.scrollTo('one-a')
      expect(scrollTo).toHaveBeenLastCalledWith({top: -100, behavior: 'smooth'})
    })
  })

  describe('lifecycle', () => {
    it('dispose disconnects observers and removes the sentinel', () => {
      const {spy} = mountSpy()
      spy.dispose()
      expect(activeObservers()).toHaveLength(0)
      expect(byId('content').querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('disposes on unmount', () => {
      const {wrapper} = mountSpy()
      wrapper.unmount()
      expect(activeObservers()).toHaveLength(0)
      expect(byId('content').querySelector('[aria-hidden="true"]')).toBeNull()
    })

    it('re-resolves when the content source changes', async () => {
      document.body.innerHTML += `<div id="content2" style="overflow-y: auto"><h2 id="two2">t</h2></div>`
      byId('toc').insertAdjacentHTML('beforeend', '<a href="#two2">t</a>')
      const source = ref('#content')
      let spy!: ReturnType<typeof useScrollspy>
      mount(
        defineComponent({
          setup() {
            spy = useScrollspy(source, '#toc')
            return () => h('div')
          },
        })
      )
      source.value = '#content2'
      await nextTick()
      expect(spy.content.value).toBe(byId('content2'))
      expect(spy.sections.value.map((s) => s.id)).toEqual(['two2'])
    })

    it('renders on the server without touching the DOM', async () => {
      vi.unstubAllGlobals()
      const app = createSSRApp(
        defineComponent({
          setup() {
            const {current} = useScrollspy('#content', '#toc')
            return () => h('span', String(current.value))
          },
        })
      )
      expect(await renderToString(app)).toBe('<span>null</span>')
    })
  })
})
