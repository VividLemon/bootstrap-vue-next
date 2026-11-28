import BootstrapVueNext from '../../../src/module'

export default defineNuxtConfig({
  modules: [BootstrapVueNext],
  compatibilityDate: 'latest',
  bootstrapVueNext: {
    composables: true,
    css: false,
  },
})
