import type {TeleportProps} from 'vue'

export type Numberish = string | number

export type TeleporterProps = {
  teleportDisabled?: TeleportProps['disabled']
  teleportTo?: TeleportProps['to']
}

export type ValidationState = boolean | null

/**
 * A form's `validate` prop: `true` renders `data-bs-validate` (`:user-invalid` styling),
 * `'valid'` renders `data-bs-validate="valid"` (also `:user-valid` styling)
 */
export type FormValidate = boolean | 'valid'

export type ValueOrCallBack<T> = T | (() => T)
