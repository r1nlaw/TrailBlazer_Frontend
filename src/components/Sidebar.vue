<template>
  <button class="sidebar-toggle" @click="visible = !visible">
    ☰
  </button>
  <transition name="fade-slide">
    <aside :class="['sidebar', { open: visible }]">
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
          <div class="filter-item filter-gray">
            <img :src="zamkiIcon" class="filter-icon" />
            <span>Замки</span>
          </div>
          <div class="filter-item filter-green">
            <img :src="religionIcon" class="filter-icon" />
            <span>Религиозное</span>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-item filter-blue">
            <img :src="museumIcon" class="filter-icon" />
            <span>Музеи</span>
          </div>
          <div class="filter-item filter-gray">
            <img :src="cryptIcon" class="filter-icon" />
            <span>Склепы</span>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-item filter-pink">
            <img :src="zooIcon" class="filter-icon" />
            <span>Зоопарк</span>
          </div>
          <div class="filter-item filter-green">
            <img :src="parkIcon" class="filter-icon" />
            <span>Парки</span>
          </div>
        </div>
      </div>
    </aside>
  </transition>
</template>
<script setup>
import { ref, onMounted } from 'vue'

import russiaFlag from '@/assets/icons/russia_flag.png'
import zamkiIcon from '@/assets/emoji/zamki.png'
import religionIcon from '@/assets/emoji/religion.png'
import museumIcon from '@/assets/emoji/museum.png'
import cryptIcon from '@/assets/emoji/crypt.png'
import zooIcon from '@/assets/emoji/zoo.png'
import parkIcon from '@/assets/emoji/park.png'

import route1 from '@/assets/images/route1.png'
import route2 from '@/assets/images/route2.png'
import route3 from '@/assets/images/route3.png'
import route4 from '@/assets/images/route4.png'
import route5 from '@/assets/images/route5.png'


const activeRoute = ref(0)
const routes = [route1, route2, route3, route4, route5]

const visible = ref(false)
onMounted(() => {
  setTimeout(() => {
    visible.value = true
  }, 100) 
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 9%; 
  left: 0;
  height: calc(100vh - 70px); 
  overflow-y: auto; 
  padding: 24px;
  width: 250px;
  font-family: 'Montserrat', sans-serif;
  background: white;  
  z-index: 1000; 

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

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.filter-icon {
  width: 20px;
  height: 20px;
}

/* Цветовые стили */
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
@media (max-width: 375px) {
  .sidebar {
    top: 0;
    height: 100vh;
    width: 320px;
    left: -380px; /* скрыт по умолчанию */
    transition: left 0.3s ease;
  }
  .region{
    margin-top: 20%;
  }

  .sidebar.open {
    left: 0;
  }

  .sidebar-toggle {
    display: flex;
  }
}



</style>
