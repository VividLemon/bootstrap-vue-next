import {useColorMode as useVueuseColorMode, type UseColorModeOptions} from '@vueuse/core'

export interface ColorModeOptions extends UseColorModeOptions {
  /**
   * When set to true, useBootstrapColorMode will automatically store itself and persist (default localstorage).
   * @default false
   */
  persist?: boolean
}

export const useBootstrapColorMode = (opts: Readonly<ColorModeOptions> = {}) => {
  const persist = opts.persist ?? false
  const attribute = 'data-bs-theme'
  const selector = 'html'
  return useVueuseColorMode({
    attribute,
    selector,
    storageKey: persist
      ? `bv-color-${opts.attribute ?? attribute}-${opts.selector ?? selector}`
      : null,
    ...opts,
  })
}

/** Short alias of `useBootstrapColorMode` */
export const useBvColorMode = useBootstrapColorMode
