import { defineNuxtPlugin } from '#app'
import { defineComponent } from 'vue'

// A stand-in for NuxtLink in `custom` mode: it renders nothing of its own and hands BLink the slot
// scope. `isActive: true` marks every link, so the test can tell the anchor came through it
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component(
    'NuxtLink',
    defineComponent({
      name: 'NuxtLink',
      props: {
        to: {
          type: [String, Object],
          required: true,
        },
        custom: {
          type: Boolean,
          default: false,
        },
      },
      setup(props, { slots }) {
        return () =>
          slots.default?.({
            href: typeof props.to === 'string' ? props.to : '#',
            navigate: () => Promise.resolve(),
            isActive: true,
            isExactActive: false,
            prefetch: () => Promise.resolve(),
            prefetched: false,
            shouldPrefetch: () => false,
          })[0]
      },
    }),
  )
})
