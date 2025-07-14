import { createRouter, createWebHistory } from 'vue-router'
import Home from './src/views/Home.vue'
import OnlineStatusPage from './src/views/OnlineStatusPage.vue'
import CollaborativeDecrypt from './src/views/CollaborativeDecrypt.vue'
import KeyGenProgress from './src/views/KeyGenProgress.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/online-status', component: OnlineStatusPage },
  { path: '/collaborative-decrypt', component: CollaborativeDecrypt },
  { path: '/keygen-progress', component: KeyGenProgress },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
