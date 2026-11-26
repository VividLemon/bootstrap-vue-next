import { useDialog } from 'bootstrap-vue-next/composables/useDialog'
import { onBeforeUnmount } from 'vue'

const discard = () => {}

export const confirmDiscard = async () => {
  const { create } = useDialog()

  // #region snippet
  const scope = new AbortController()
  onBeforeUnmount(() => scope.abort())

  const result = await create({ title: 'Discard changes?' }).show({ signal: scope.signal })
  if (result.trigger === 'ok') discard()
  // #endregion snippet
}
