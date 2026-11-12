/* eslint-disable @typescript-eslint/no-explicit-any */
// #region snippet
const fields = [
  {
    key: 'status',
    formatter: (value: any, key: string, item: any) => String(value).toUpperCase(),
    tdAttr: (value: any, key: string, item: any) => ({
      class: value === 'active' ? 'text-success' : '',
    }),
  },
]
// #endregion snippet
