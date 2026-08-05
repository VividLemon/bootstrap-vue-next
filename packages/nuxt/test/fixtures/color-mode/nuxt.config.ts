import BootstrapVueNext from '../../../src/module'

export default defineNuxtConfig({
  compatibilityDate: 'latest',
  modules: ['@nuxtjs/color-mode', BootstrapVueNext],
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
