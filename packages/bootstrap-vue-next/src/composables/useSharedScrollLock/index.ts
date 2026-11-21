import {useScrollLock as _useScrollLock, createSharedComposable} from '@vueuse/core'

export const useSharedScrollLock = createSharedComposable(_useScrollLock)
