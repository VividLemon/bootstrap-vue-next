const shouldSpeak = process.env.NODE_ENV !== 'production'

const withKey = (key: string) => `[BootstrapVueNext:${key}]`

export const warn = (key: string, ...args: unknown[]) => {
  if (!shouldSpeak) return
  console.warn(withKey(key), ...args)
}

export const error = (key: string, ...args: unknown[]) => {
  if (!shouldSpeak) return
  console.error(withKey(key), ...args)
}
