import BootstrapVueNext from '../../../src/module'

export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode', BootstrapVueNext],
  compatibilityDate: 'latest',
  bootstrapVueNext: {
    composables: true,
    directives: false,
    css: false,
  },
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },
})
