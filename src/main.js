import { createApp } from 'vue'
import App from './App.vue'
import './style.scss'
import router from '../router'
import env from './config/env'

// 在应用启动时加载环境变量配置
console.log('应用启动，环境配置:', env)

createApp(App).use(router).mount('#app')

