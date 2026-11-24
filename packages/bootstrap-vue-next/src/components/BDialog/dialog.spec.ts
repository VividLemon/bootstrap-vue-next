import {enableAutoUnmount, mount} from '@vue/test-utils'
import {afterEach, beforeEach, describe, expect, it, onTestFinished, vi} from 'vitest'
import {h, nextTick} from 'vue'
import BDialog from './BDialog.vue'
import BDialogActions from './BDialogActions.vue'
import type {BvTriggerableEvent} from '../../utils'

/** Let Vue patch and a few animation frames pass */
const flush = async (frames = 3) => {
  for (let i = 0; i < frames; i++) {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  }
  await nextTick()
}

/**
 * happy-dom has no Web Animations API. This installs a fake `getAnimations()` that reports one
 * running transition on every `.dialog` without `.dialog-instant`, finished only when the test
 * calls `finishAll()`.
 */
const installFakeAnimations = () => {
  const running: (() => void)[] = []
  const proto = HTMLElement.prototype as unknown as {getAnimations?: () => Animation[]}
  const original = proto.getAnimations
  proto.getAnimations = function (this: HTMLElement) {
    if (!this.classList.contains('dialog') || this.classList.contains('dialog-instant')) return []
    let resolve!: () => void
    const finished = new Promise<void>((res) => {
      resolve = res
    })
    running.push(resolve)
    return [{finished, effect: {getComputedTiming: () => ({endTime: 300})}} as unknown as Animation]
  }
  return {
    finishAll: async () => {
      running.splice(0).forEach((resolve) => resolve())
      await flush()
    },
    restore: () => {
      if (original) proto.getAnimations = original
      else delete proto.getAnimations
    },
  }
}

type Wrapper = ReturnType<typeof mount>
const dialogOf = (wrapper: Wrapper) => wrapper.get('dialog').element as HTMLDialogElement
const events = (wrapper: Wrapper, name: string) =>
  (wrapper.emitted(name) ?? []).map(([event]) => event as BvTriggerableEvent)
/** The lifecycle events emitted so far, in the order each was first emitted */
const order = (wrapper: Wrapper) =>
  Object.keys(wrapper.emitted()).filter((name) => name !== 'update:modelValue')

const mountDialog = (
  props: Record<string, unknown> = {},
  slots: Record<string, unknown> = {default: 'Body'}
) => mount(BDialog, {props, slots: slots as never, attachTo: document.body})

/** A dialog that is open and settled, without a transition */
const mountOpen = async (
  props: Record<string, unknown> = {},
  slots: Record<string, unknown> = {default: 'Body'}
) => {
  const wrapper = mountDialog({modelValue: true, noTransition: true, ...props}, slots)
  await flush()
  return wrapper
}

const pressEscape = (el: Element) => {
  const event = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true})
  el.dispatchEvent(event)
  return event
}

const clickBackdrop = (el: Element) => {
  el.dispatchEvent(new Event('pointerdown', {bubbles: true}))
  el.dispatchEvent(new MouseEvent('click', {bubbles: true}))
}

enableAutoUnmount(afterEach)

describe('dialog', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dialog-open')
  })

  describe('markup', () => {
    it('renders a closed native dialog with the v6 parts', () => {
      const wrapper = mountDialog({title: 'Title', id: 'd'})
      const dialog = wrapper.get('dialog')
      expect(dialog.classes()).toEqual(['dialog'])
      expect(dialog.attributes('open')).toBeUndefined()
      expect(dialog.attributes('id')).toBe('d')
      expect(dialog.attributes('aria-labelledby')).toBe('d-label')
      expect(dialog.attributes('closedby')).toBeUndefined()
      const title = dialog.get('.dialog-header > .dialog-title')
      expect(title.element.tagName).toBe('H5')
      expect(title.attributes('id')).toBe('d-label')
      expect(title.text()).toBe('Title')
      expect(dialog.get('.dialog-header > .btn-close').attributes('aria-label')).toBe('Close')
      expect(dialog.get('.dialog-body').text()).toBe('Body')
      expect(dialog.find('.dialog-footer').exists()).toBe(false)
    })

    it('has none of the v5 wrappers, a backdrop element or a teleport', () => {
      const wrapper = mountDialog({modelValue: true})
      expect(wrapper.element.tagName).toBe('DIALOG')
      expect(document.querySelector('.modal, .modal-dialog, .modal-content, .modal-backdrop')).toBe(
        null
      )
    })

    it('renders the footer only when the footer slot has content', () => {
      const wrapper = mountDialog({}, {footer: 'Actions'})
      expect(wrapper.get('.dialog-footer').text()).toBe('Actions')
    })

    it('renders a scoped footer slot that destructures its scope', () => {
      // A compiled `#footer="{ close }"` destructures its argument: the content check must pass it
      const wrapper = mount(BDialog, {
        slots: {
          footer: ({close}: {close: () => void}) =>
            h('button', {class: 'close-footer', onClick: close}, 'Close'),
        },
      })
      expect(wrapper.find('.dialog-footer .close-footer').exists()).toBe(true)
    })

    it('renders the body prop', () => {
      const wrapper = mountDialog({body: 'From prop'}, {})
      expect(wrapper.get('.dialog-body').text()).toBe('From prop')
    })

    it.each([
      [{size: 'sm'}, 'dialog-sm'],
      [{size: 'lg'}, 'dialog-lg'],
      [{size: 'xl'}, 'dialog-xl'],
      [{fullscreen: true}, 'dialog-fullscreen'],
      [{fullscreen: 'md'}, 'md-down:dialog-fullscreen'],
      [{fullscreen: '2xl'}, '2xl-down:dialog-fullscreen'],
      [{scrollable: true}, 'dialog-scrollable'],
      [{slide: 'down'}, 'dialog-slide-down'],
      [{slide: 'up'}, 'dialog-slide-up'],
      [{modal: false}, 'dialog-nonmodal'],
      [{noTransition: true}, 'dialog-instant'],
    ])('%o adds %s', (props, expected) => {
      const wrapper = mountDialog(props)
      expect(wrapper.get('dialog').classes()).toEqual(['dialog', expected])
    })

    it('puts class and attrs on the dialog element', () => {
      const wrapper = mount(BDialog, {attrs: {'class': 'mine', 'data-x': '1'}})
      expect(wrapper.get('dialog').classes()).toContain('mine')
      expect(wrapper.get('dialog').attributes('data-x')).toBe('1')
    })

    it('renders the size, fullscreen, scrollable and slide classes', () => {
      const wrapper = mount(BDialog, {
        props: {size: 'xl', fullscreen: 'md', scrollable: true, slide: 'up'},
      })
      const classes = wrapper.get('dialog').classes()
      expect(classes).toEqual(
        expect.arrayContaining([
          'dialog-xl',
          'md-down:dialog-fullscreen',
          'dialog-scrollable',
          'dialog-slide-up',
        ])
      )
      const plain = mount(BDialog).get('dialog').classes()
      expect(plain.some((c) => c.startsWith('dialog-sm') || c.startsWith('dialog-slide'))).toBe(
        false
      )
    })

    it('merges part attrs with the part classes', () => {
      const wrapper = mountDialog(
        {
          title: 'T',
          headerAttrs: {'class': 'h', 'data-part': 'header'},
          titleAttrs: {class: 'visually-hidden'},
          bodyAttrs: {class: 'b'},
          footerAttrs: {class: 'f'},
        },
        {default: 'Body', footer: 'Footer'}
      )
      expect(wrapper.get('.dialog-header').classes()).toContain('h')
      expect(wrapper.get('.dialog-header').attributes('data-part')).toBe('header')
      expect(wrapper.get('.dialog-title').classes()).toContain('visually-hidden')
      expect(wrapper.get('.dialog-body').classes()).toContain('b')
      expect(wrapper.get('.dialog-footer').classes()).toContain('f')
    })

    it('applies the part color objects', () => {
      const wrapper = mountDialog(
        {
          headerColor: {theme: 'primary'},
          bodyColor: {bg: 'subtle-success'},
          footerColor: {theme: 'danger'},
        },
        {default: 'Body', footer: 'Footer'}
      )
      expect(wrapper.get('.dialog-header').classes()).toContain('theme-primary')
      expect(wrapper.get('.dialog-body').classes()).toContain('bg-subtle-success')
      expect(wrapper.get('.dialog-footer').classes()).toContain('theme-danger')
    })

    it('noHeader removes the header and aria-labelledby', () => {
      const wrapper = mountDialog({noHeader: true})
      expect(wrapper.find('.dialog-header').exists()).toBe(false)
      expect(wrapper.get('dialog').attributes('aria-labelledby')).toBeUndefined()
    })

    it('noHeaderClose removes the close button', () => {
      const wrapper = mountDialog({noHeaderClose: true})
      expect(wrapper.find('.btn-close').exists()).toBe(false)
    })

    it('headerClose sets the label and attrs of the close button', () => {
      const wrapper = mountDialog({headerClose: {label: 'Schließen', attrs: {class: 'x'}}})
      const button = wrapper.get('.btn-close')
      expect(button.attributes('aria-label')).toBe('Schließen')
      expect(button.classes()).toContain('x')
    })

    it('the header-close slot replaces the close button', () => {
      const wrapper = mountDialog(
        {},
        {'header-close': ({close}: {close: () => void}) => h('button', {onClick: close}, 'X')}
      )
      expect(wrapper.find('.btn-close').exists()).toBe(false)
      expect(wrapper.get('.dialog-header > button').text()).toBe('X')
    })

    it('titleTag changes the title element', () => {
      const wrapper = mountDialog({title: 'T', titleTag: 'h2'})
      expect(wrapper.get('.dialog-title').element.tagName).toBe('H2')
    })

    it("focus: 'close' puts autofocus on the close button", () => {
      const wrapper = mountDialog({focus: 'close'})
      expect(wrapper.get('.btn-close').attributes('autofocus')).toBeDefined()
    })

    it('lazy renders the content on first show and keeps the dialog element', async () => {
      const wrapper = mountDialog({lazy: true, noTransition: true})
      expect(wrapper.find('dialog').exists()).toBe(true)
      expect(wrapper.find('.dialog-body').exists()).toBe(false)
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(wrapper.find('.dialog-body').exists()).toBe(true)
    })
  })

  describe('opening and closing', () => {
    let animations: ReturnType<typeof installFakeAnimations>
    beforeEach(() => {
      animations = installFakeAnimations()
    })
    afterEach(() => {
      animations.restore()
    })

    it('opens with showModal(), locks page scroll and emits shown after the transition', async () => {
      const wrapper = mountDialog()
      const dialog = dialogOf(wrapper)
      const showModal = vi.spyOn(dialog, 'showModal')
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(showModal).toHaveBeenCalledTimes(1)
      expect(dialog.open).toBe(true)
      expect(document.documentElement.classList.contains('dialog-open')).toBe(true)
      expect(order(wrapper)).toEqual(['show'])
      await animations.finishAll()
      expect(order(wrapper)).toEqual(['show', 'shown'])
    })

    it('is visible at the moment it opens, so the browser can focus its content', async () => {
      // v6 transitions `visibility`: without this the content still computes to hidden inside
      // showModal() and the browser drops focus on <body> (checked in Chromium)
      const wrapper = mountDialog({noTransition: true})
      const dialog = dialogOf(wrapper)
      let visibilityAtOpen: string | undefined
      vi.spyOn(dialog, 'showModal').mockImplementation(() => {
        visibilityAtOpen = dialog.style.visibility
      })
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(visibilityAtOpen).toBe('visible')
      // and nothing is left behind
      expect(dialog.style.visibility).toBe('')
      expect(dialog.style.transition).toBe('')
    })

    it('never binds the open attribute itself', async () => {
      const wrapper = mountDialog({modelValue: true})
      // Rendered before mount: the open state only comes from showModal()
      expect(wrapper.html()).not.toMatch(/<dialog[^>]* open/)
      await flush()
      expect(dialogOf(wrapper).open).toBe(true)
    })

    it('adds .hiding and keeps the dialog open until the exit transition ended', async () => {
      const wrapper = mountDialog({modelValue: true})
      await flush()
      const dialog = dialogOf(wrapper)
      const close = vi.spyOn(dialog, 'close')
      await wrapper.setProps({modelValue: false})
      await flush()
      expect(dialog.classList.contains('hiding')).toBe(true)
      expect(dialog.open).toBe(true)
      expect(close).not.toHaveBeenCalled()
      expect(wrapper.emitted('hidden')).toBeUndefined()

      await animations.finishAll()
      expect(close).toHaveBeenCalledTimes(1)
      expect(dialog.open).toBe(false)
      expect(dialog.classList.contains('hiding')).toBe(false)
      expect(wrapper.emitted('hidden')).toHaveLength(1)
      expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
    })

    it('a show during the exit transition reverses it without reopening', async () => {
      const wrapper = mountDialog({modelValue: true})
      await flush()
      await animations.finishAll()
      const dialog = dialogOf(wrapper)
      const showModal = vi.spyOn(dialog, 'showModal')
      const close = vi.spyOn(dialog, 'close')
      await wrapper.setProps({modelValue: false})
      await flush()
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(dialog.classList.contains('hiding')).toBe(false)
      await animations.finishAll()
      expect(showModal).not.toHaveBeenCalled()
      expect(close).not.toHaveBeenCalled()
      expect(dialog.open).toBe(true)
      expect(wrapper.emitted('hidden')).toBeUndefined()
      expect(wrapper.emitted('shown')).toHaveLength(2)
    })

    it('noTransition closes at once', async () => {
      const wrapper = await mountOpen()
      const dialog = dialogOf(wrapper)
      expect(dialog.classList.contains('dialog-instant')).toBe(true)
      await wrapper.setProps({modelValue: false})
      await nextTick()
      expect(dialog.open).toBe(false)
      await flush()
      expect(wrapper.emitted('hidden')).toHaveLength(1)
    })

    it('an initially shown dialog opens instantly on mount', async () => {
      const wrapper = mountDialog({modelValue: true})
      expect(wrapper.get('dialog').classes()).toContain('dialog-instant')
      await flush()
      expect(dialogOf(wrapper).open).toBe(true)
      expect(order(wrapper)).toEqual(['show', 'shown'])
      expect(wrapper.get('dialog').classes()).not.toContain('dialog-instant')
    })

    it('modal: false opens with show() and does not lock page scroll', async () => {
      const wrapper = mountDialog({modal: false, noTransition: true})
      const dialog = dialogOf(wrapper)
      const show = vi.spyOn(dialog, 'show')
      const showModal = vi.spyOn(dialog, 'showModal')
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(show).toHaveBeenCalledTimes(1)
      expect(showModal).not.toHaveBeenCalled()
      expect(dialog.open).toBe(true)
      expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
    })

    it('keeps the page locked until the last stacked dialog closed', async () => {
      const first = await mountOpen()
      const second = await mountOpen()
      await second.setProps({modelValue: false})
      await flush()
      expect(document.documentElement.classList.contains('dialog-open')).toBe(true)
      await first.setProps({modelValue: false})
      await flush()
      expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
    })

    it('closes and unlocks the page when unmounted while open', async () => {
      const wrapper = await mountOpen()
      const dialog = dialogOf(wrapper)
      wrapper.unmount()
      expect(dialog.open).toBe(false)
      expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
      expect(wrapper.emitted('hide')).toBeUndefined()
    })

    it('a prevented show keeps the dialog closed', async () => {
      const wrapper = mount(BDialog, {
        props: {onShow: (event: BvTriggerableEvent) => event.preventDefault()},
        attachTo: document.body,
      })
      await wrapper.setProps({modelValue: true})
      await flush()
      expect(dialogOf(wrapper).open).toBe(false)
      expect(wrapper.emitted('show-prevented')).toHaveLength(1)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    })

    it('exposes show, hide, toggle, id and visible', async () => {
      const wrapper = mountDialog({id: 'd', noTransition: true})
      const vm = wrapper.vm as unknown as {
        show: () => Promise<boolean | string>
        hide: (trigger?: string, value?: unknown) => Promise<boolean | string>
        toggle: () => Promise<boolean | string>
        id: string
        visible: boolean
        returnValue: unknown
      }
      expect(vm.id).toBe('d')
      await expect(vm.show()).resolves.toBe(true)
      expect(vm.visible).toBe(true)
      await expect(vm.hide('done', {answer: 42})).resolves.toBe('done')
      expect(vm.visible).toBe(false)
      expect(vm.returnValue).toEqual({answer: 42})
      await vm.toggle()
      expect(vm.visible).toBe(true)
      // Shown again: the previous value is gone
      expect(vm.returnValue).toBeUndefined()
    })
  })

  describe('trigger events', () => {
    it('ok() emits a cancelable ok, then hide and hidden with trigger ok', async () => {
      let scope!: {ok: (value?: unknown) => void}
      const wrapper = await mountOpen(
        {},
        {
          default: (s: typeof scope) => {
            scope = s
            return 'Body'
          },
        }
      )
      scope.ok('saved')
      await flush()
      expect(events(wrapper, 'ok')).toHaveLength(1)
      expect(events(wrapper, 'ok')[0]?.cancelable).toBe(true)
      expect(events(wrapper, 'hide')[0]?.trigger).toBe('ok')
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('ok')
      expect((wrapper.vm as unknown as {returnValue: unknown}).returnValue).toBe('saved')
    })

    it('keeps the value of a hide an ok listener starts, not the outer hide', async () => {
      type DialogVm = {
        hide: (trigger?: string, value?: unknown) => Promise<unknown>
        returnValue: unknown
      }
      const dialog: {vm?: DialogVm} = {}
      const wrapper = await mountOpen({
        onOk: () => {
          void dialog.vm?.hide('saved', 'payload')
        },
      })
      dialog.vm = wrapper.vm as unknown as DialogVm
      void dialog.vm.hide('ok')
      await flush()
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('saved')
      expect(dialog.vm.returnValue).toBe('payload')
    })

    it('a prevented ok keeps the dialog open', async () => {
      let scope!: {ok: () => void}
      const wrapper = mount(BDialog, {
        props: {
          modelValue: true,
          noTransition: true,
          onOk: (event: BvTriggerableEvent) => event.preventDefault(),
        },
        slots: {
          default: (s: typeof scope) => {
            scope = s
            return 'Body'
          },
        },
        attachTo: document.body,
      })
      await flush()
      scope.ok()
      await flush()
      expect(dialogOf(wrapper).open).toBe(true)
      expect(wrapper.emitted('hide-prevented')).toHaveLength(1)
      expect(wrapper.emitted('hidden')).toBeUndefined()
    })

    it.each(['cancel', 'close'] as const)(
      '%s() hides with that trigger and has no event of its own',
      async (name) => {
        let scope!: Record<'cancel' | 'close', () => void>
        const wrapper = await mountOpen(
          {},
          {
            default: (s: typeof scope) => {
              scope = s
              return 'Body'
            },
          }
        )
        scope[name]()
        await flush()
        expect(events(wrapper, 'hide')[0]?.trigger).toBe(name)
        expect(events(wrapper, 'hidden')[0]?.trigger).toBe(name)
        // `cancel` is the Escape / close request event, not the Cancel button
        expect(wrapper.emitted('cancel')).toBeUndefined()
      }
    )

    it('the header close button hides with trigger close', async () => {
      const wrapper = await mountOpen()
      await wrapper.get('.btn-close').trigger('click')
      await flush()
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('close')
    })
  })

  describe('Escape', () => {
    it('emits cancel, then hides with trigger esc', async () => {
      const wrapper = await mountOpen()
      const event = pressEscape(dialogOf(wrapper))
      await flush()
      // The browser must not close the dialog itself: that would skip the exit transition
      expect(event.defaultPrevented).toBe(true)
      expect(events(wrapper, 'cancel')).toHaveLength(1)
      expect(events(wrapper, 'cancel')[0]?.trigger).toBe('esc')
      expect(events(wrapper, 'hide')[0]?.trigger).toBe('esc')
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('esc')
      expect(wrapper.emitted('esc')).toBeUndefined()
    })

    it('a prevented cancel keeps the dialog open', async () => {
      const wrapper = mount(BDialog, {
        props: {
          modelValue: true,
          noTransition: true,
          onCancel: (event: BvTriggerableEvent) => event.preventDefault(),
        },
        attachTo: document.body,
      })
      await flush()
      pressEscape(dialogOf(wrapper))
      await flush()
      expect(dialogOf(wrapper).open).toBe(true)
      expect(wrapper.emitted('hide-prevented')).toHaveLength(1)
    })

    it('handles a native cancel event (a close request without a key press)', async () => {
      const wrapper = await mountOpen()
      const event = new Event('cancel', {cancelable: true})
      dialogOf(wrapper).dispatchEvent(event)
      await flush()
      expect(event.defaultPrevented).toBe(true)
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('esc')
    })

    it('handles Escape once when the key press also causes a native cancel', async () => {
      const wrapper = await mountOpen({keyboard: false})
      const dialog = dialogOf(wrapper)
      pressEscape(dialog)
      dialog.dispatchEvent(new Event('cancel', {cancelable: true}))
      await flush()
      expect(wrapper.emitted('hide-prevented')).toHaveLength(1)
    })

    it('keyboard: false bounces instead and renders closedby="none"', async () => {
      const animations = installFakeAnimations()
      const wrapper = mountDialog({modelValue: true, keyboard: false})
      await flush()
      await animations.finishAll()
      const dialog = dialogOf(wrapper)
      expect(dialog.getAttribute('closedby')).toBe('none')
      pressEscape(dialog)
      await flush()
      expect(dialog.open).toBe(true)
      expect(events(wrapper, 'hide-prevented')[0]?.trigger).toBe('esc')
      expect(wrapper.emitted('cancel')).toBeUndefined()
      expect(wrapper.emitted('hide')).toBeUndefined()
      expect(dialog.classList.contains('dialog-static')).toBe(true)
      await animations.finishAll()
      expect(dialog.classList.contains('dialog-static')).toBe(false)
      animations.restore()
    })

    it('a prevented hide-prevented skips the bounce', async () => {
      const wrapper = mount(BDialog, {
        props: {
          'modelValue': true,
          'noTransition': true,
          'keyboard': false,
          'onHide-prevented': (event: BvTriggerableEvent) => event.preventDefault(),
        },
        attachTo: document.body,
      })
      await flush()
      pressEscape(dialogOf(wrapper))
      await nextTick()
      expect(dialogOf(wrapper).classList.contains('dialog-static')).toBe(false)
    })

    it('keeps Escape from a parent dialog while its exit transition runs', async () => {
      // Hold the child's exit transition, so it is still open while it hides
      const animations = installFakeAnimations()
      onTestFinished(() => animations.restore())
      const parent = mountDialog(
        {modelValue: true, id: 'parent'},
        {default: () => h(BDialog, {modelValue: true, id: 'child'}, () => 'child')}
      )
      await flush()
      const child = parent.get('#child').element as HTMLDialogElement
      pressEscape(child)
      await flush(1)
      // the child is hiding, still open: a second Escape is consumed by it
      const second = pressEscape(child)
      await flush()
      expect(child.open).toBe(true)
      expect(child.classList.contains('hiding')).toBe(true)
      expect(second.defaultPrevented).toBe(true)
      expect(events(parent, 'hide')).toHaveLength(0)
    })

    it('ignores Escape while closed', async () => {
      const wrapper = mountDialog()
      pressEscape(dialogOf(wrapper))
      await flush()
      expect(wrapper.emitted('cancel')).toBeUndefined()
    })
  })

  describe('backdrop', () => {
    it('a click on the dialog element itself (the backdrop) hides with trigger backdrop', async () => {
      const wrapper = await mountOpen()
      clickBackdrop(dialogOf(wrapper))
      await flush()
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('backdrop')
      expect(wrapper.emitted('backdrop')).toBeUndefined()
    })

    it('a click inside the dialog does nothing', async () => {
      const wrapper = await mountOpen()
      clickBackdrop(wrapper.get('.dialog-body').element)
      await flush()
      expect(wrapper.emitted('hide')).toBeUndefined()
    })

    it('a drag that starts inside and ends on the backdrop does nothing', async () => {
      const wrapper = await mountOpen()
      wrapper.get('.dialog-body').element.dispatchEvent(new Event('pointerdown', {bubbles: true}))
      dialogOf(wrapper).dispatchEvent(new MouseEvent('click', {bubbles: true}))
      await flush()
      expect(wrapper.emitted('hide')).toBeUndefined()
    })

    it("backdrop: 'static' bounces with hide-prevented", async () => {
      const wrapper = await mountOpen({backdrop: 'static'})
      clickBackdrop(dialogOf(wrapper))
      await nextTick()
      expect(events(wrapper, 'hide-prevented')[0]?.trigger).toBe('backdrop')
      expect(wrapper.emitted('hide')).toBeUndefined()
      expect(dialogOf(wrapper).open).toBe(true)
    })

    it('backdrop: false ignores the click', async () => {
      const wrapper = await mountOpen({backdrop: false})
      clickBackdrop(dialogOf(wrapper))
      await flush()
      expect(wrapper.emitted('hide')).toBeUndefined()
      expect(wrapper.emitted('hide-prevented')).toBeUndefined()
    })

    it('a non-modal dialog has no backdrop to click', async () => {
      const wrapper = await mountOpen({modal: false})
      clickBackdrop(dialogOf(wrapper))
      await flush()
      expect(wrapper.emitted('hide')).toBeUndefined()
    })
  })

  describe('closed by the browser', () => {
    it('syncs a native close: a hide that cannot be prevented, then hidden', async () => {
      const onHide = vi.fn<(event: BvTriggerableEvent) => void>((event) => event.preventDefault())
      const wrapper = mount(BDialog, {
        props: {modelValue: true, noTransition: true, onHide},
        attachTo: document.body,
      })
      await flush()
      const dialog = dialogOf(wrapper)
      dialog.close('from-browser')
      await flush()
      expect(onHide).toHaveBeenCalledTimes(1)
      expect(onHide.mock.calls[0]?.[0].cancelable).toBe(false)
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('native')
      expect(wrapper.emitted('hide-prevented')).toBeUndefined()
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
      expect((wrapper.vm as unknown as {returnValue: unknown}).returnValue).toBe('from-browser')
      expect(document.documentElement.classList.contains('dialog-open')).toBe(false)
    })

    it('ignores the close event of its own close()', async () => {
      const wrapper = await mountOpen()
      await wrapper.setProps({modelValue: false})
      await flush()
      expect(wrapper.emitted('hide')).toHaveLength(1)
      expect(wrapper.emitted('hidden')).toHaveLength(1)
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('modelValue')
    })

    it('routes a <form method="dialog"> submit through hide, with the submitter value', async () => {
      const wrapper = await mountOpen(
        {},
        {
          default: () =>
            h('form', {method: 'dialog'}, [h('button', {type: 'submit', value: 'yes'}, 'Yes')]),
        }
      )
      const form = wrapper.get('form').element as HTMLFormElement
      const event = new Event('submit', {bubbles: true, cancelable: true}) as SubmitEvent
      Object.defineProperty(event, 'submitter', {value: wrapper.get('button[value]').element})
      form.dispatchEvent(event)
      await flush()
      expect(event.defaultPrevented).toBe(true)
      expect(events(wrapper, 'hide')[0]?.cancelable).toBe(true)
      expect(events(wrapper, 'hidden')[0]?.trigger).toBe('submit')
      expect((wrapper.vm as unknown as {returnValue: unknown}).returnValue).toBe('yes')
    })

    it('leaves other form submits alone', async () => {
      const wrapper = await mountOpen({}, {default: () => h('form', {method: 'post'})})
      const event = new Event('submit', {bubbles: true, cancelable: true})
      wrapper.get('form').element.dispatchEvent(event)
      await flush()
      expect(event.defaultPrevented).toBe(false)
      expect(wrapper.emitted('hide')).toBeUndefined()
    })
  })
})

describe('dialog actions', () => {
  const mountWithActions = async (
    actionProps: Record<string, unknown> = {},
    dialogProps: Record<string, unknown> = {}
  ) => {
    const wrapper = mount(BDialog, {
      props: {modelValue: true, noTransition: true, ...dialogProps},
      slots: {footer: () => h(BDialogActions, actionProps)},
      attachTo: document.body,
    })
    await flush()
    return wrapper
  }

  it('renders Cancel and OK buttons in the footer', async () => {
    const wrapper = await mountWithActions()
    const buttons = wrapper.findAll('.dialog-footer > button')
    expect(buttons.map((button) => button.text())).toEqual(['Cancel', 'OK'])
    expect(buttons[0]?.classes()).toContain('theme-secondary')
    expect(buttons[1]?.classes()).toContain('theme-primary')
  })

  it('OK calls ok(): the ok event, then a hide with trigger ok', async () => {
    const wrapper = await mountWithActions()
    await wrapper.findAll('.dialog-footer > button')[1]?.trigger('click')
    await flush()
    expect(wrapper.emitted('ok')).toHaveLength(1)
    expect(events(wrapper, 'hidden')[0]?.trigger).toBe('ok')
  })

  it('Cancel hides with trigger cancel', async () => {
    const wrapper = await mountWithActions()
    await wrapper.findAll('.dialog-footer > button')[0]?.trigger('click')
    await flush()
    expect(wrapper.emitted('cancel')).toBeUndefined()
    expect(events(wrapper, 'hidden')[0]?.trigger).toBe('cancel')
  })

  it('okOnly, titles, disabled and attrs', async () => {
    const wrapper = await mountWithActions({
      okOnly: true,
      okTitle: 'Save',
      okDisabled: true,
      okAttrs: {class: 'mine', color: {theme: 'danger'}},
    })
    const buttons = wrapper.findAll('.dialog-footer > button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]?.text()).toBe('Save')
    expect(buttons[0]?.attributes('disabled')).toBeDefined()
    expect(buttons[0]?.classes()).toEqual(expect.arrayContaining(['mine', 'theme-danger']))
  })

  it.each(['ok', 'cancel'] as const)(
    "the dialog's focus: '%s' puts autofocus on that button",
    async (focus) => {
      const wrapper = await mountWithActions({}, {focus})
      const [cancel, ok] = wrapper.findAll('.dialog-footer > button')
      expect((focus === 'ok' ? ok : cancel)?.attributes('autofocus')).toBeDefined()
      expect((focus === 'ok' ? cancel : ok)?.attributes('autofocus')).toBeUndefined()
    }
  )

  it('outside a dialog, Vue warns about the missing injection', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(BDialogActions)
    expect(warn.mock.calls.some((args) => String(args[0]).includes('injection'))).toBe(true)
    warn.mockRestore()
  })
})
