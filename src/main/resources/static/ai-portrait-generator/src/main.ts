import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import '@/styles/global.scss'

const app = createApp(App)

// 使用 Pinia 状态管理
app.use(createPinia())

// 使用 Element Plus UI 组件库
app.use(ElementPlus)

// 挂载应用
app.mount('#app')

console.log('✨ AI 人物立绘生成器应用已启动')

