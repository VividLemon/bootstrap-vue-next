import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, getBrowser, url } from '@nuxt/test-utils/e2e'
import { componentsWithExternalPath } from 'bootstrap-vue-next/types'

type ComponentName = keyof typeof componentsWithExternalPath

type RenderScenario
  = | 'default'
    | 'accordion-item'
    | 'breadcrumb-item'
    | 'carousel-slide'
    | 'dropdown-child'
    | 'dropdown-form'
    | 'dropdown-header'
    | 'form-feedback'
    | 'form-select-option'
    | 'form-select-option-group'
    | 'form-tag'
    | 'input-group-text'
    | 'list-group-item'
    | 'nav-child'
    | 'nav-item-dropdown'
    | 'navbar-child'
    | 'progress-bar'
    | 'tab'
    | 'table-body'
    | 'table-cell'
    | 'table-foot'
    | 'table-head'
    | 'table-head-cell'
    | 'table-row'

const renderScenarios = {
  BAccordionItem: 'accordion-item',
  BBreadcrumbItem: 'breadcrumb-item',
  BCarouselSlide: 'carousel-slide',
  BDropdownDivider: 'dropdown-child',
  BDropdownGroup: 'dropdown-child',
  BDropdownItem: 'dropdown-child',
  BDropdownItemButton: 'dropdown-child',
  BDropdownText: 'dropdown-child',
  BDropdownForm: 'dropdown-form',
  BDropdownHeader: 'dropdown-header',
  BFormInvalidFeedback: 'form-feedback',
  BFormValidFeedback: 'form-feedback',
  BFormSelectOption: 'form-select-option',
  BFormSelectOptionGroup: 'form-select-option-group',
  BFormTag: 'form-tag',
  BInputGroupText: 'input-group-text',
  BListGroupItem: 'list-group-item',
  BNavForm: 'nav-child',
  BNavItem: 'nav-child',
  BNavText: 'nav-child',
  BNavItemDropdown: 'nav-item-dropdown',
  BNavbarBrand: 'navbar-child',
  BNavbarNav: 'navbar-child',
  BNavbarToggle: 'navbar-child',
  BProgressBar: 'progress-bar',
  BTab: 'tab',
  BTbody: 'table-body',
  BTd: 'table-cell',
  BTfoot: 'table-foot',
  BThead: 'table-head',
  BTh: 'table-head-cell',
  BTr: 'table-row',
} as const satisfies Partial<Record<ComponentName, RenderScenario>>

const allComponents = Object.keys(componentsWithExternalPath) as ComponentName[]

const componentMatrix = Object.freeze(
  allComponents
    .filter(componentName => componentName !== 'BOrchestrator')
    .map(componentName => ({
      componentName,
      scenario: renderScenarios[componentName] ?? 'default',
    })),
)

const knownHydrationFailures: Partial<Record<ComponentName, string>> = {
  // Known hydration mismatches currently exist for table structure atoms in Nuxt SSR.
  BTbody: 'Hydration completed but contains mismatches.',
  BTd: 'Hydration completed but contains mismatches.',
  BTh: 'Hydration completed but contains mismatches.',
  BThead: 'Hydration completed but contains mismatches.',
  BTfoot: 'Hydration completed but contains mismatches.',
  BTr: 'Hydration completed but contains mismatches.',
}

const knownHydrationFailureEntries = Object.entries(knownHydrationFailures).filter(
  (entry): entry is [ComponentName, string] => typeof entry[1] === 'string',
)

const HYDRATION_QUIET_WINDOW_MS = 200
const HYDRATION_QUIET_POLL_INTERVAL_MS = 20
const HYDRATION_QUIET_POLL_MAX_ITERATIONS = 20

const isHydrationIssue = (message: string): boolean =>
  /hydration/i.test(message)
  && /mismatch|node mismatch|children mismatch|text content does not match/i.test(message)

const collectHydrationIssues = async (urlPath: string, markerId: string): Promise<string[]> => {
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    const hydrationIssues: string[] = []
    let lastSignalAt = Date.now()

    page.on('console', (msg) => {
      if (msg.type() !== 'warning' && msg.type() !== 'error') return
      lastSignalAt = Date.now()
      const text = msg.text()
      if (isHydrationIssue(text)) hydrationIssues.push(`[console:${msg.type()}] ${text}`)
    })

    page.on('pageerror', (error) => {
      lastSignalAt = Date.now()
      if (isHydrationIssue(error.message)) hydrationIssues.push(`[pageerror] ${error.message}`)
    })

    await page.goto(url(urlPath), { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(id => document.getElementById(id) !== null, markerId)
    await page.waitForFunction(
      () => document.getElementById('hydration-mounted')?.textContent?.trim() === 'mounted',
    )
    await page.evaluate(
      () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    )
    for (let i = 0; i < HYDRATION_QUIET_POLL_MAX_ITERATIONS; i++) {
      if (Date.now() - lastSignalAt >= HYDRATION_QUIET_WINDOW_MS) break
      await page.waitForTimeout(HYDRATION_QUIET_POLL_INTERVAL_MS)
    }

    return hydrationIssues
  }
  finally {
    await page.close()
  }
}

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/components-hydration', import.meta.url)),
  browser: true,
})

describe('components hydration-only mismatches', () => {
  for (const { componentName, scenario } of componentMatrix) {
    const skipReason = knownHydrationFailures[componentName]
    const runTest = skipReason ? it.skip : it

    runTest(`${componentName} hydrates without mismatch`, async () => {
      if (skipReason) {
        // Skipped due to known hydration mismatch that should be tracked separately.
        return
      }

      const urlPath = `/${encodeURIComponent(componentName)}?scenario=${encodeURIComponent(scenario)}`
      const markerId = `hydration-case-${componentName}`

      const html = await $fetch(url(urlPath))
      expect(html).toContain(markerId)

      const hydrationIssues = await collectHydrationIssues(urlPath, markerId)
      expect(hydrationIssues, hydrationIssues.join('\n')).toEqual([])
    })
  }

  for (const [componentName, expectedIssue] of knownHydrationFailureEntries) {
    const scenario = renderScenarios[componentName] ?? 'default'
    const urlPath = `/${encodeURIComponent(componentName)}?scenario=${encodeURIComponent(scenario)}`
    const markerId = `hydration-case-${componentName}`

    it(`${componentName} currently emits known hydration mismatch`, async () => {
      const html = await $fetch(url(urlPath))
      expect(html).toContain(markerId)

      const hydrationIssues = await collectHydrationIssues(urlPath, markerId)
      expect(hydrationIssues.some(issue => issue.includes(expectedIssue))).toBe(true)
    })
  }
})
