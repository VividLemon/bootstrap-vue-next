type T = {
  titleField: string
}
/* #region snippet */
const removeArticles = (str: string) => str.replace(/^(a |the )/i, '')
const titleFieldDefinition = {
  key: 'titleField',
  sort: {
    compare: (a: T, b: T, key: string) =>
      removeArticles(a.titleField).localeCompare(removeArticles(b.titleField)),
  },
}
/* #endregion snippet */
