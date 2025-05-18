// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/Home.vue'
import Profile from '@/components/Profile.vue' // импортируй профиль
import LandmarkPage from '@/components/LandmarkPage.vue' // You'll create this
const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/profile', name: 'Profile', component: Profile }, 
  { path: '/landmark/:name', name: "Landmark", component: LandmarkPage, props: true}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
