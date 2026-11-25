import {
  breadcrumbGlobalIndexKey,
  breadcrumbRegistryKey,
  dialogStackKey,
  showHideRegistryKey,
} from '../../utils/keys'
import {_newShowHideRegistry} from '../../composables/useRegistry'
import type {BreadcrumbItemRaw} from '../../types/BreadcrumbTypes'
import {_newDialogStack} from '../../composables/useDialogStack'
import {type Plugin, ref} from 'vue'

export const registryPlugin: Plugin = {
  install(app) {
    // Provide global showHide registry
    const {register, values} = _newShowHideRegistry()
    app.provide(showHideRegistryKey, {register, values})

    // Provide global breadcrumb registry
    const items = ref<Record<string, BreadcrumbItemRaw[]>>({
      [breadcrumbGlobalIndexKey]: [],
    })
    const reset = (key: string = breadcrumbGlobalIndexKey) => {
      items.value[key] = []
    }
    app.provide(breadcrumbRegistryKey, {items, reset})

    // Provide the global registry of dialogs and stack of open ones
    app.provide(dialogStackKey, _newDialogStack())
  },
}
