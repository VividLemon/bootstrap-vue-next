// @vitest-environment node
import {describe, it, expect} from 'vitest'
import {createSSRApp, h} from 'vue'
import {renderToString} from 'vue/server-renderer'
import BFormInput from '../src/components/BFormInput/BFormInput.vue'
import BFormTextarea from '../src/components/BFormTextarea/BFormTextarea.vue'
import BFormField from '../src/components/BFormField/BFormField.vue'

describe('SSR BFormTextarea in BFormField', () => {
  it('renders BFormTextarea alone without error', async () => {
    const app = createSSRApp({
      render() {
        return h(BFormTextarea)
      },
    })
    const html = await renderToString(app)
    expect(html).toContain('textarea')
  })

  it('renders BFormTextarea inside BFormField without error', async () => {
    const app = createSSRApp({
      render() {
        return h(BFormField, null, {
          default: () => h(BFormTextarea),
        })
      },
    })
    const html = await renderToString(app)
    expect(html).toContain('textarea')
  })
})

describe('SSR BFormField floating label', () => {
  it('renders a label element (never a legend) in floating mode so hydration matches', async () => {
    const app = createSSRApp({
      render() {
        return h(BFormField, {floating: true, label: 'Email'}, () =>
          h(BFormInput, {id: 'email-input'})
        )
      },
    })
    const html = await renderToString(app)
    expect(html).toContain('<label')
    expect(html).not.toContain('<legend')
  })
})
