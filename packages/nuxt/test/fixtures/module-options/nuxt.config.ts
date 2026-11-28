import BootstrapVueNext from '../../../src/module'

export default defineNuxtConfig({
  modules: [BootstrapVueNext],
  compatibilityDate: 'latest',
  bootstrapVueNext: {
    css: false,
    composables: {all: false, useToast: true},
    plugin: {
      components: {
        BDialog: {size: 'lg'},
        BLink: {routerComponentName: 'NuxtLink'},
      },
    },
  },
})
