// main.ts
import { createApp } from 'vue'
import { createBootstrap } from 'bootstrap-vue-next'
import App from './App.vue'

const app = createApp(App)

app.use(
  createBootstrap({
    components: {
      BButton: {
        theme: 'primary',
      },
    },
  }),
)

app.mount('#app')
