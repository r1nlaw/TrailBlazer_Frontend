<template>
  <transition name="fade-slide">
    <header v-if="visible" class="header">
      <!-- Левая часть -->
      <div class="header-left">
        <router-link to="/" class="logo" style="text-decoration: none;">
          <img :src="logoIcon" alt="Logo" class="logo-icon" />
          <span class="logo-text">путевод</span>
        </router-link>
      </div>

      <!-- Центр: навигация и поиск -->
      <div class="center">
        <div class="nav-icons">
          <div class="icon-button active">
            <img :src="homeIcon" alt="Home" class="icon-img" />
          </div>
          <div class="icon-button">
            <img :src="fireIcon" alt="Fire" class="icon-img" />
          </div>
          <div class="icon-button">
            <img :src="chatIcon" alt="Chat" class="icon-img" />
          </div>
          <div class="icon-button badge-button">
            <img :src="calendarIcon" alt="Calendar" class="icon-img" />
            <span class="badge">NEW</span>
          </div>
        </div>
        <div class="search-bar">
          <img :src="searchIcon" alt="Search" />
          <input type="text" placeholder="Найти" />
        </div>
      </div>

      <!-- Правая часть -->
      <div class="header-right">
        <div class="weather">
          <div class="weather-icon">
            <img :src="sunIcon" alt="Sun" />
          </div>
          <div class="weather-text">
            <div class="label">Погода</div>
            <div class="temp">17 °C</div>
          </div>
        </div>

        <div class="history">
          <img :src="historyIcon" class="icon-circle" />
        </div>

        <div class="avatar">
          <img :src="avatarImage" class="avatar" />
        </div>

        <div class="settings" @click="toggleDropdown">
          <img :src="settingsIcon" class="icon-circle" />
          <div v-if="showDropdown" class="dropdown-menu">
            <ul>
              <li @click="goToProfile">Профиль</li>
              <li @click="goToLogin">Вход</li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  </transition>
  

  <!-- Модальное окно регистрации -->
  <RegisterModal ref="registerModalRef" @register="handleRegister" />

  <router-view />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import RegisterModal from '@/components/RegisterModal.vue'

import logoIcon from '@/assets/logo.png'
import homeIcon from '@/assets/icons/home.png'
import fireIcon from '@/assets/icons/fire.png'
import chatIcon from '@/assets/icons/chat.png'
import calendarIcon from '@/assets/icons/calendar.png'
import searchIcon from '@/assets/icons/search.png'
import sunIcon from '@/assets/icons/sun.png'
import historyIcon from '@/assets/icons/history.png'
import settingsIcon from '@/assets/icons/settings.png'
import avatarImage from '@/assets/images/user_avatar.png'

const router = useRouter()
const showDropdown = ref(false)
const registerModalRef = ref(null)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function goToProfile() {
  showDropdown.value = false
  router.push('/profile')
}

function goToLogin() {
  showDropdown.value = false
  registerModalRef.value?.open()
}

function handleRegister(userData) {
  console.log('Регистрация прошла:', userData)
  // Добавь POST-запрос, обработку токена и т.д.
}

const visible = ref(false)

onMounted(() => {
  setTimeout(() => {
    visible.value = true
  }, 50) 
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Mulish:wght@400;600&display=swap');
* {
  font-family: 'Montserrat', sans-serif;
}
.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  gap: 16px;
}
.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-icon {
  width: 36px;
  height: 36px;
}
.logo-text {
  font-family: 'Mulish', sans-serif;
  font-weight: 800;
  font-size: 27px;
  color: #0d3c2f;
}
.nav-icons {
  display: flex;
  gap: 12px;
}
.icon-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f3f3f3;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.icon-img {
  width: 22px;
  height: 22px;
}
.icon-button.active {
  background: #0d3c2f;
}
.icon-button.active .icon-img {
  filter: brightness(0) invert(1);
}
.badge-button .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff7a00;
  color: white;
  font-size: 8px;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: bold;
}
.search-bar {
  display: flex;
  align-items: center;
  background: #fafafa;
  padding: 6px 10px;
  border-radius: 9999px;
  gap: 6px;
  max-width: 240px;
  height: 36px;
}
.search-bar img {
  width: 18px;
  height: 18px;
}
.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 14px;
}
.weather {
  display: flex;
  align-items: center;
  background: #f6f4eb;
  padding: 6px 10px;
  border-radius: 9999px;
  gap: 6px;
}
.weather-icon img {
  width: 20px;
  height: 20px;
}
.weather-text {
  font-size: 12px;
  line-height: 1.2;
}
.weather-text .label {
  color: #666;
}
.weather-text .temp {
  font-weight: 600;
}
.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  padding: 4px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.settings {
  position: relative;
  cursor: pointer;
}
.dropdown-menu {
  position: absolute;
  top: 42px;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  z-index: 10;
}
.dropdown-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.dropdown-menu li {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.dropdown-menu li:hover {
  background: #f0f0f0;
}

.fade-slide-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

</style>
