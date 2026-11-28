import {defineNuxtModule, createResolver, addImports, addPlugin, hasNuxtModule} from '@nuxt/kit'
import {composableNames, composablesWithExternalPath} from 'bootstrap-vue-next'
import {useComponents} from './composables/useComponents'
import type {ModuleDependencies} from '@nuxt/schema'
import type {ModuleOptions} from './types/ModuleOptions'
import type {ModuleOptions as NuxtColorModeConfigOptions} from '@nuxtjs/color-mode'
import {parseActiveImports} from './utils/parseActiveImports'
import {normalizeConfigurationValue} from './utils/normalizeConfigurationValue'

const nuxtColorModeDefaults = {
  dataValue: 'bs-theme',
} satisfies Partial<NuxtColorModeConfigOptions>

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'bootstrap-vue-next',
    configKey: 'bootstrapVueNext',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    composables: true,
    css: true,
    autoUseNuxtImage: true,
    autoConfigureNuxtColorMode: true,
    plugin: {},
  },
  moduleDependencies: (nuxt): ModuleDependencies => {
    const moduleOptions = (nuxt.options.bootstrapVueNext ?? {}) as Partial<ModuleOptions>
    const shouldConfigureColorMode = moduleOptions.autoConfigureNuxtColorMode ?? true

    return {
      '@nuxtjs/color-mode': {
        optional: true,
        defaults: shouldConfigureColorMode
          ? nuxtColorModeDefaults
          : ({} satisfies Partial<NuxtColorModeConfigOptions>),
      },
    }
  },
  setup(options, nuxt) {
    const {resolve} = createResolver(import.meta.url)

    nuxt.options.build.transpile.push(resolve('./runtime'))
    nuxt.hook('components:extend', (components) => {
      for (const component of components) {
        if (
          component.pascalName === 'NuxtLink' ||
          component.kebabName === 'nuxt-link' ||
          component.export === 'NuxtLink'
        ) {
          component.global = true
        }
      }
    })

    if (options.css === true) {
      nuxt.options.css.push('bootstrap-vue-next/dist/bootstrap-vue-next.css')
    }

    const normalizedComposableOptions = normalizeConfigurationValue(options.composables)

    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}
    nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || []
    nuxt.options.vite.optimizeDeps.include.push('bootstrap-vue-next')

    // Add the base runtime plugin
    addPlugin(resolve('./runtime/createBootstrap'))

    // Set transformAssetUrls
    const transformAssetUrls = {
      BImg: ['src'],
    }

    nuxt.options.vite.vue = nuxt.options.vite.vue || {}
    nuxt.options.vite.vue.template = nuxt.options.vite.vue.template || {}
    nuxt.options.vite.vue.template.transformAssetUrls =
      nuxt.options.vite.vue.template.transformAssetUrls ?? {}

    if (
      typeof nuxt.options.vite.vue.template.transformAssetUrls !== 'boolean' &&
      !(
        'BImg' in nuxt.options.vite.vue.template.transformAssetUrls ||
        'b-img' in nuxt.options.vite.vue.template.transformAssetUrls
      )
    ) {
      nuxt.options.vite.vue.template.transformAssetUrls = {
        ...nuxt.options.vite.vue.template.transformAssetUrls,
        ...transformAssetUrls,
      }
    }

    // Add components
    useComponents()

    // Auto-detect @nuxt/image and configure BImg to use NuxtImg
    if (options.autoUseNuxtImage && hasNuxtModule('@nuxt/image')) {
      options.plugin = {
        ...options.plugin,
        components: {
          ...options.plugin?.components,
          BImg: {
            tag: 'NuxtImg',
            ...options.plugin?.components?.BImg,
          },
        },
      }

      // `NuxtImg` is only auto-registered by `@nuxt/image` as a locally scoped auto-import,
      // not as a globally registered component. Since `BImg` swaps its underlying element via
      // a dynamic `:is="tag"` binding, `NuxtImg` must be globally registered for that
      // resolution to work, so we register it globally ourselves here.
      addPlugin(resolve('./runtime/registerNuxtImage'))
    }

    // Expose the plugin options for the runtime to use in createBootstrap
    nuxt.options.runtimeConfig.public.bootstrapVueNext = {
      plugin: options.plugin,
    }

    // Add composables
    if (Object.values(normalizedComposableOptions).includes(true)) {
      // No exception is needed for `@nuxtjs/color-mode`: its `useColorMode` and ours
      // (`useBootstrapColorMode` / `useBvColorMode`) no longer share a name
      const activeComposables = parseActiveImports(normalizedComposableOptions, composableNames)

      activeComposables.forEach((name) => {
        const from = `bootstrap-vue-next${composablesWithExternalPath[name]}`
        addImports({
          from,
          name,
        })
      })
    }
  },
})
