import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './src/views/Home.vue'
import KeyGenProgress from './src/views/KeyGenProgress.vue'
import BackendOutputPage from './src/views/BackendOutputPage.vue'
import TrainingChart from './src/views/TrainingChart.vue'

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  { path: '/keygen-progress', component: KeyGenProgress },
  { path: '/backend-output', component: BackendOutputPage },
  { path: '/training-chart', component: TrainingChart },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
