// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/Home.vue'
import Profile from '@/components/Profile.vue' // импортируй профиль

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/profile', name: 'Profile', component: Profile }, 
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
