import BootstrapVueNext from '../../../src/module'

export default defineNuxtConfig({
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },
  modules: ['@nuxtjs/color-mode', BootstrapVueNext],
  compatibilityDate: 'latest',
  bootstrapVueNext: {
    composables: true,
    directives: false,
    css: false,
  },
})
