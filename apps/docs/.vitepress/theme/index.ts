// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import type { EnhanceAppContext, Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { appInfoKey } from './keys'
import { vBColorMode } from 'bootstrap-vue-next/directives/BColorMode'
import { vBModal } from 'bootstrap-vue-next/directives/BModal'
import { vBPopover } from 'bootstrap-vue-next/directives/BPopover'
import { vBScrollspy } from 'bootstrap-vue-next/directives/BScrollspy'
import { vBToggle } from 'bootstrap-vue-next/directives/BToggle'
import { vBTooltip } from 'bootstrap-vue-next/directives/BTooltip'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

let scrollTimer: ReturnType<typeof setTimeout> | undefined

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }: EnhanceAppContext) {
    // After client-side route changes, re-scroll to the hash anchor once the
    // page content has finished rendering. VitePress's SPA router scrolls
    // before layout shifts settle, causing anchors to land off-screen.
    const originalOnAfterRouteChange: typeof router.onAfterRouteChange = router.onAfterRouteChange
    router.onAfterRouteChange = (...args) => {
      if (originalOnAfterRouteChange) {
        originalOnAfterRouteChange(
          ...(args as Parameters<NonNullable<typeof originalOnAfterRouteChange>>),
        )
      }
      if (typeof window === 'undefined') return
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        const hash = (typeof window !== 'undefined' ? window.location : undefined)?.hash
        if (!hash) return
        const decodedId = decodeURIComponent(hash.slice(1))
        if (!decodedId) return
        const el = document.getElementById(decodedId)
        if (el) el.scrollIntoView()
      }, 300)
    }

    const githubMainBranch = 'main'
    const base = `tree/${githubMainBranch}`
    const githubUrl = 'https://github.com/bootstrap-vue-next/bootstrap-vue-next'
    const githubPackageDirectory = `${githubUrl}/${base}/packages/bootstrap-vue-next`
    const githubComponentsDirectory = `${githubPackageDirectory}/src/components`
    const githubComposablesDirectory = `${githubPackageDirectory}/src/composables`
    const githubDirectivesDirectory = `${githubPackageDirectory}/src/directives`
    const githubDocsDirectory = `${githubUrl}/${base}/apps/docs/src`
    app.provide(appInfoKey, {
      githubMainBranch,
      githubUrl,
      githubDocsDirectory,
      githubPackageDirectory,
      githubComponentsDirectory,
      githubComposablesDirectory,
      githubDirectivesDirectory,
      discordUrl: 'https://discord.gg/j2Mtcny',
      opencollectiveUrl: 'https://opencollective.com/bootstrap-vue-next',
    })

    app.directive('b-color-mode', vBColorMode)
    app.directive('b-modal', vBModal)
    app.directive('b-popover', vBPopover)
    app.directive('b-scrollspy', vBScrollspy)
    app.directive('b-toggle', vBToggle)
    app.directive('b-tooltip', vBTooltip)
  },
} satisfies Theme
