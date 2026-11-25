import {nextTick, type Ref} from 'vue'
import {getSafeWindow} from '../utils/dom'

const SELECTOR_ITEMS = '.menu-item:not(.disabled):not(:disabled)'

/**
 * The navigable items of a menu: its direct `.menu-item` children and the triggers of its direct
 * `.submenu`s, skipping disabled and hidden ones (Bootstrap v6 `_getItemsInMenu`)
 *
 * @internal
 */
export const getMenuItems = (menu: Element): HTMLElement[] => {
  const win = getSafeWindow()
  return Array.from(
    menu.querySelectorAll<HTMLElement>(
      `:scope > ${SELECTOR_ITEMS}, :scope > .submenu > ${SELECTOR_ITEMS}`
    )
  ).filter((el) => {
    const style = win?.getComputedStyle(el)
    return style?.display !== 'none' && style?.visibility !== 'hidden'
  })
}

/**
 * Bootstrap v6 `getNextActiveElement`: the next / previous item without wrapping, except that
 * entering the list from outside (`cycle`) goes to the first or the last item
 */
const getNext = (
  list: readonly HTMLElement[],
  active: HTMLElement,
  next: boolean,
  cycle: boolean
): HTMLElement | undefined => {
  const {length} = list
  let index = list.indexOf(active)
  if (index === -1) return !next && cycle ? list[length - 1] : list[0]
  index += next ? 1 : -1
  if (cycle) index = (index + length) % length
  return list[Math.max(0, Math.min(index, length - 1))]
}

export interface UseMenuKeyboardOptions {
  toggle: Readonly<Ref<HTMLElement | null>>
  menu: Readonly<Ref<HTMLElement | null>>
  visible: Readonly<Ref<boolean>>
  show: () => Promise<boolean | string>
  hide: (trigger?: string) => Promise<boolean | string>
}

/**
 * Bootstrap v6 `Menu.dataApiKeydownHandler`, scoped to one menu's toggle and `.menu` instead of
 * document delegation. Bind the returned handler to `keydown` on both.
 *
 * - ↑ / ↓ open the menu and move focus; entering the list from outside goes to the first (↓) or
 *   last (↑) item, inside the list there is no wrap
 * - Home / End go to the first / last item (inside the menu only, as v6 alpha.2)
 * - Escape closes the menu and returns focus to the toggle, also with `autoClose: false`
 * - Arrow keys are left alone in inputs, textareas and contenteditable hosts
 *
 * Submenu keys (← / → and Enter / Space on a submenu trigger) are not handled yet.
 *
 * @internal
 */
export const useMenuKeyboard = ({toggle, menu, visible, show, hide}: UseMenuKeyboardOptions) => {
  const selectItem = (event: KeyboardEvent) => {
    const menuEl = menu.value
    if (!menuEl) return
    const target = event.target as HTMLElement
    const currentMenu = target.closest('.menu') ?? menuEl
    const items = getMenuItems(currentMenu)
    if (!items.length) return
    getNext(items, target, event.key === 'ArrowDown', !items.includes(target))?.focus()
  }

  const onKeydown = async (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    if (!target) return
    const isInput = /input|textarea/i.test(target.tagName) || target.isContentEditable
    const isEscape = event.key === 'Escape'
    const isUpOrDown = event.key === 'ArrowUp' || event.key === 'ArrowDown'
    const isHomeOrEnd = event.key === 'Home' || event.key === 'End'
    if (!isUpOrDown && !isEscape && !isHomeOrEnd) return
    if (isInput && !isEscape) return

    if (isHomeOrEnd) {
      const currentMenu = target.closest('.menu')
      if (!currentMenu || !menu.value?.contains(currentMenu)) return
      event.preventDefault()
      event.stopPropagation()
      const items = getMenuItems(currentMenu)
      ;(event.key === 'Home' ? items[0] : items.at(-1))?.focus()
      return
    }

    if (isUpOrDown) {
      event.preventDefault()
      event.stopPropagation()
      if (!visible.value) {
        void show()
        // `visible` flips synchronously when the show is accepted; wait for the `.show` class
        // to be rendered so the items are visible
        await nextTick()
        if (!visible.value) return
      }
      selectItem(event)
      return
    }

    if (isEscape && visible.value) {
      event.preventDefault()
      event.stopPropagation()
      void hide('esc')
      toggle.value?.focus()
    }
  }

  return {onKeydown}
}
