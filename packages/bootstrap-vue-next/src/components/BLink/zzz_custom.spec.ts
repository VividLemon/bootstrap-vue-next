import {mount} from '@vue/test-utils'
import {describe, expect, it} from 'vitest'
import BLink from '/home/runner/work/bootstrap-vue-next/bootstrap-vue-next/packages/bootstrap-vue-next/src/components/BLink/BLink.vue'
import {createRouter, createWebHistory} from 'vue-router'

describe('link custom class test', () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {path: '/', component: {template: '<div>Home</div>'}},
      {path: '/about', component: {template: '<div>About</div>'}},
    ],
  })

  it('uses custom activeClass only, no default router-link-active leak', async () => {
    router.push('/about')
    await router.isReady()
    const wrapper = mount(BLink, {
      props: {to: '/about', activeClass: 'my-active'},
      global: {plugins: [router]},
    })
    console.log('CLASSES:', wrapper.classes())
  })
})
