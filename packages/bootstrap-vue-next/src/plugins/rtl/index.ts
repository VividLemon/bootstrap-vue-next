import {type Plugin, ref} from 'vue'
import {rtlPluginKey} from '../../utils/keys'
import type {BootstrapVueOptions} from '../../types/BootstrapVueOptions'

export const rtlPlugin: Plugin = {
  install(app, options: BootstrapVueOptions) {
    const rtlDefault = false
    const localeDefault = undefined

    const rtlInitial =
      typeof options?.rtl === 'boolean' ? rtlDefault : (options?.rtl?.rtlInitial ?? rtlDefault)

    const localeInitial =
      typeof options?.rtl === 'boolean'
        ? localeDefault
        : (options?.rtl?.localeInitial ?? localeDefault)

    const isRtl = ref(rtlInitial)
    const locale = ref(localeInitial)

    app.provide(rtlPluginKey, {isRtl, locale})
  },
}
