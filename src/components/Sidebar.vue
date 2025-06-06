<template>
  <button class="sidebar-toggle" @click="visible = !visible">☰</button>
  <transition name="fade-slide">
    <aside :class="['sidebar', { open: visible }]">
      <div class="sidebar-content">
        <div class="region">
          <img :src="russiaFlag" alt="Флаг" class="flag" />
          <span>Республика Крым</span>
        </div>

        <h2>Маршруты</h2>
        <div class="routes">
          <div
            v-for="(route, index) in routes"
            :key="index"
            :class="['route-circle', { active: activeRoute === index }]"
            @click="activeRoute = index"
          >
            <img :src="route" alt="Маршрут" />
          </div>
        </div>

        <h2>Фильтры</h2>
        <div class="filters">
          <div class="filter-row">
            <div
              class="filter-item filter-gray"
              :class="{ active: isActiveCategory('Замки') }"
              @click="toggleCategory('Замки')"
            >
              <img :src="zamkiIcon" class="filter-icon" />
              <span>Храм</span>
            </div>
            <div
              class="filter-item filter-green"
              :class="{ active: isActiveCategory('Религия') }"
              @click="toggleCategory('Религия')"
            >
              <img :src="religionIcon" class="filter-icon" />
              <span>Религиозное</span>
            </div>
          </div>
          <div class="filter-row">
            <div
              class="filter-item filter-blue"
              :class="{ active: isActiveCategory('Музей') }"
              @click="toggleCategory('Музей')"
            >
              <img :src="museumIcon" class="filter-icon" />
              <span>Музеи</span>
            </div>
            <div
              class="filter-item filter-gray"
              :class="{ active: isActiveCategory('Склепы') }"
              @click="toggleCategory('Склепы')"
            >
              <img :src="cryptIcon" class="filter-icon" />
              <span>Склепы</span>
            </div>
          </div>
          <div class="filter-row">
            <div
              class="filter-item filter-pink"
              :class="{ active: isActiveCategory('Зоопарк') }"
              @click="toggleCategory('Зоопарк')"
            >
              <img :src="zooIcon" class="filter-icon" />
              <span>Зоопарк</span>
            </div>
            <div
              class="filter-item filter-green"
              :class="{ active: isActiveCategory('Парк') }"
              @click="toggleCategory('Парк')"
            >
              <img :src="parkIcon" class="filter-icon" />
              <span>Парки</span>
            </div>
          </div>
          <button class="apply-button" @click="applyFilters">Применить фильтры</button>
        </div>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import russiaFlag from '@/assets/icons/russia_flag.png'
import zamkiIcon from '@/assets/emoji/zamki.png'
import religionIcon from '@/assets/emoji/religion.png'
import museumIcon from '@/assets/emoji/museum.png'
import cryptIcon from '@/assets/emoji/crypt.png'
import zooIcon from '@/assets/emoji/zoo.png'
import parkIcon from '@/assets/emoji/park.png'

const props = defineProps({
  selectedCategories: {
    type: Array,
    default: () => []
  },
  routes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['toggle-category'])

const visible = ref(false)
const activeRoute = ref(null)

const router = useRouter()
const route = useRoute()

function toggleCategory(category) {
  const current = [...props.selectedCategories]

  const index = current.indexOf(category)
  if (index !== -1) {
    current.splice(index, 1)
  } else {
    current.push(category)
  }

  // Обновляем query параметр в URL
  router.replace({
    query: {
      ...route.query,
      categories: current.join(',')
    }
  })

  emit('toggle-category', category)
}

function isActiveCategory(category) {
  return props.selectedCategories.includes(category)
}

function applyFilters() {
  emit('apply-filters', props.selectedCategories)
  visible.value = false
  location.reload() // Полная перезагрузка страницы
}


</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 90px;
  left: 0;
  width: 30%;
  height: 100vh;
  min-height: 100vh;
  overflow-y: auto;
  padding: 24px;
  font-family: 'Montserrat', sans-serif;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  top: 89px;
}
.sidebar.open {
  transform: translateX(0);
}

.apply-button {
  margin-top: 16px;
  padding: 10px 20px;
  background-color: #3478f6;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.apply-button:hover {
  background-color: #245dc1;
}


.sidebar-content {
    margin-top: 10%;
}
.region {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.flag {
  width: 20px;
  height: auto;
}

.routes {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.route-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
}

.route-circle.active {
  border-color: green;
}

.route-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;
}

.filter-item.active {
  outline: 2px solid #555;
  background-color: #b3d4fc !important;
  transition: 0.3s ease;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  margin-bottom: 6px;
  flex: 0 1 auto;
}

.filter-icon {
  width: 20px;
  height: 20px;
}

.filter-gray {
  background: #e0e0e0;
}

.filter-green {
  background: #cce5cc;
}

.filter-blue {
  background: #dcebf7;
}

.filter-pink {
  background: #fddcdc;
}

.fade-slide-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.sidebar-toggle {
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 1%;
  left: 2%;
  z-index: 2001;
  background: rgba(51, 51, 51, 0.85);
  color: white;
  padding: 12px;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(44,71,58,0.15);
  margin-top: 80px;
  display: flex;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 30%;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    top: 89px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    margin-top: 80px;
    display: flex;
  }
  .sidebar-content {
    margin-top: 10%;
  }
}

@media (max-width: 853px) {
  .sidebar {
    
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    top: 88px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    margin-top: 80px;
    display: flex;
  }
  .sidebar-content {
    margin-top: 10%;
  }
}

@media (max-width: 820px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    top: 89px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    margin-top: 80px;
    display: flex;
  }
  .sidebar-content {
    margin-top: 10%;
  }
}

@media (max-width: 548px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    top: 72px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    margin-top: 80px;
    display: flex;
  }
  .sidebar-content {
    margin-top: 10%;
  }
}

@media (max-width: 440px) {
  .sidebar {
    width: 50%;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    top: 75px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    margin-top: 100px;
    display: flex;
  }
}

@media (max-width: 412px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    top: 70px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    margin-top: 100px;
    display: flex;
  }
}

@media (max-width: 375px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    top: 70px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    margin-top: 100px;
    display: flex;
  }
}

@media (max-width: 600px) {
  .filter-row {
    gap: 6px;
  }
  .filter-item {
    flex: 1 1 100%;
    min-width: 120px;
    justify-content: flex-start;
  }
}
</style>
