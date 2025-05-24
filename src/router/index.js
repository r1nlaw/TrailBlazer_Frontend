// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/Home.vue'
import Profile from '@/components/Profile.vue'
import LandmarkPage from '@/components/LandmarkPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'Главная — Маршруты и достопримечательности Крыма',
      description: 'Откройте лучшие маршруты и памятники Крыма. Планируйте путешествия по достопримечательностям полуострова.'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: 'Профиль пользователя — Ваши маршруты и достижения',
      description: 'Управляйте своими маршрутами, сохраняйте достопримечательности и делитесь с друзьями.'
    }
  },
  {
    path: '/landmark/:name',
    name: 'Landmark',
    component: LandmarkPage,
    props: true,
    meta: {
      title: 'Достопримечательность Крыма',
      description: 'Узнайте больше о достопримечательности Крыма: история, фото и маршрут на карте.'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const defaultTitle = 'Крым — Путеводитель по достопримечательностям'
  document.title = to.meta.title || defaultTitle

  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', to.meta.description || '')
  }

  next()
})

export default router
