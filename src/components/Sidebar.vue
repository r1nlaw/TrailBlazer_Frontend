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
              :class="{ active: isActiveCategory('Храм') }"
              @click="toggleCategory('Замки')"
            >
              <img :src="zamkiIcon" class="filter-icon" />
              <span>Храм</span>
            </div>
            <div
              class="filter-item filter-green"
              :class="{ active: isActiveCategory('Религия') }"
              @click="toggleCategory('Религиозное')"
            >
              <img :src="religionIcon" class="filter-icon" />
              <span>Религиозное</span>
            </div>
          </div>
          <div class="filter-row">
            <div
              class="filter-item filter-blue"
              :class="{ active: isActiveCategory('Музей') }"
              @click="toggleCategory('Музеи')"
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
              @click="toggleCategory('Парки')"
            >
              <img :src="parkIcon" class="filter-icon" />
              <span>Парки</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

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

function toggleCategory(category) {
  emit('toggle-category', category)
}

function isActiveCategory(category) {
  return props.selectedCategories.includes(category)
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 90px;
  left: 0;
  width: 250px;
  height: 100vh;
  min-height: 100vh;
  overflow-y: auto;
  padding: 24px;
  font-family: 'Montserrat', sans-serif;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
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
  justify-content: flex-start;
  gap: 10px;
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
  display: none;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 16px;
  left: 16px;
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease, transform 0.2s ease;
}
.sidebar-toggle:hover {
  background: rgba(51, 51, 51, 1);
  transform: scale(1.05);
}
.sidebar-toggle:active {
  transform: scale(0.95);
}

@media (max-width: 1024px) {
  .sidebar {
    width: 420px;
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
    width: 420px;
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
    width: 420px;
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
    width: 420px;
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
</style>
