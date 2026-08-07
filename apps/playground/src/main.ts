import {createApp} from 'vue'
import type {Plugin} from 'vue'
import App from './App.vue'
import router from './router'
import {createBootstrap} from 'bootstrap-vue-next/plugins/createBootstrap'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

const app = createApp(App)
const bootstrapPlugin = createBootstrap() as unknown as Plugin

app.use(router)
app.use(bootstrapPlugin)
app.mount('#app')
