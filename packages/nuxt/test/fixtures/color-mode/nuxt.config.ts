import BootstrapVueNext from '../../../src/module'

export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode', BootstrapVueNext],
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },
  compatibilityDate: 'latest',
  bootstrapVueNext: {
    composables: true,
    directives: false,
    css: false,
  },
})
