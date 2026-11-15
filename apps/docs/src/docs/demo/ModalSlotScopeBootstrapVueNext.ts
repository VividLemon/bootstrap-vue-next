// #region snippet
interface BDialogSlotsData {
  id: string
  visible: boolean
  active: boolean // also true while the dialog hides
  cancel: () => void
  close: () => void
  ok: (value?: unknown) => void
  show: () => void
  hide: (trigger?: string, value?: unknown) => void
  toggle: () => void
}
// #endregion snippet
