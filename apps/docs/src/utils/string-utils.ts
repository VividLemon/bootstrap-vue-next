// Converts PascalCase or camelCase to kebab-case
export const kebabCase = (str: string) => str.replace(/\B([A-Z])/g, '-$1').toLowerCase()

export const capitalizeWords = (input: string): string =>
  input.replace(/\b\w/g, (char) => char.toUpperCase())
