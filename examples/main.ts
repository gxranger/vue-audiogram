import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import AudiogramCanvas from '../packages/index'
createApp(App).use(AudiogramCanvas)
createApp(App).mount('#app')
