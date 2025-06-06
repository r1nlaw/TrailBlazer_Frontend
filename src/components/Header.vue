<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <transition name="fade-slide">
    <header v-if="visible" class="header">
      <!-- Левая часть -->
      <div class="header-left ">
        <router-link to="/" class="logo" style="text-decoration: none;">
          <img :src="logoIcon" alt="Logo" class="logo-icon" />
          <span class="logo-text">путевод</span>
        </router-link>
      </div>

      <!-- Центр: навигация и поиск -->
      <div class="center ">
        <div class="nav-icons">
          <div class="icon-button active hide-on-mobile">
            <router-link to="/" class="logo" style="text-decoration: none;">
              <img :src="homeIcon" alt="Home" class="icon-img" />
            </router-link>
          </div>
          <div class="icon-button hide-on-mobile">
            <img :src="fireIcon" alt="Fire" class="icon-img" />
          </div>
          <div class="icon-button hide-on-mobile">
            <img :src="chatIcon" alt="Chat" class="icon-img" />
          </div>
          <div class="icon-button badge-button hide-on-mobile">
            <img :src="calendarIcon" alt="Calendar" class="icon-img" />
            <span class="badge">NEW</span>
          </div>
        </div>
        <div class="search-bar" ref="searchBarRef">
          <img :src="searchIcon" alt="Search" />
          <input
            type="text"
            placeholder="Найти"
            v-model="searchQuery"
            @input="handleSearch"
            @focus="showSearchResults = true"
          />
          <!-- Dropdown for search results -->
          <div v-if="showSearchResults && searchResults.length" class="search-results">
            <ul>
              <li
                v-for="landmark in searchResults"
                :key="landmark.id"
                @click="goToLandmark(landmark.translated_name)"
              >
                <div class="result-item">
                  <img
                    :src="`${domain}/images/` + landmark.image_path"
                    alt="Landmark"
                    class="result-image"
                    @error="handleImageError"
                  />
                  <div class="result-info">
                    <div class="result-name">{{ landmark.name }}</div>
                    <div class="result-address">{{ landmark.address }}</div>
                    <div class="result-category">{{ landmark.category }}</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
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


        <router-link to="/profile" class="avatar">
          <img :src="avatarImage" class="avatar" />
        </router-link>

        <div class="settings" @click.stop="toggleDropdown">
          <img :src="settingsIcon" class="icon-circle" />
          <div v-if="showDropdown" class="dropdown-menu" ref="dropdownRef">
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
import { ref, onMounted, onUnmounted } from 'vue'
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
const dropdownRef = ref(null)
const registerModalRef = ref(null)
const searchBarRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const domain = `${import.meta.env.VITE_BACKEND_URL}`

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function goToProfile() {
  router.push('/profile')
  showDropdown.value = false
}

function goToLogin() {
  showDropdown.value = false
  registerModalRef.value?.open()
}

function goToLandmark(nameTranslate) {
  router.push(`/landmark/${encodeURIComponent(nameTranslate)}`)
  showSearchResults.value = false
  searchQuery.value = ''
  searchResults.value = []
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  try {
    const response = await fetch(`${domain}/api/search?q=${encodeURIComponent(searchQuery.value)}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})


    if (!response.ok) {
      throw new Error('Ошибка при поиске')
    }

    const data = await response.json()
    searchResults.value = data
    showSearchResults.value = true
  } catch (error) {
    console.error('Ошибка поиска:', error)
    searchResults.value = []
    showSearchResults.value = false
  }
}

function handleClickOutside(event) {
  const dropdownEl = dropdownRef.value
  const searchBarEl = searchBarRef.value

  if (dropdownEl && !dropdownEl.contains(event.target)) {
    showDropdown.value = false
  }

  if (searchBarEl && !searchBarEl.contains(event.target)) {
    showSearchResults.value = false
  }
}

function handleRegister(userData) {
  console.log('Регистрация прошла:', userData)
}

function handleImageError(event) {
  event.target.src = '/placeholder-image.png' // Replace with your placeholder image path
}

const visible = ref(false)

function handleProfileClick() {
  const token = localStorage.getItem('authToken')
  if (token) {
    router.push('/profile')
  } else {
    registerModalRef.value?.open()
  }
}

onMounted(() => {
  setTimeout(() => {
    visible.value = true
  }, 50)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Mulish:wght@400;600&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

.header {
  z-index: 1000;
  width: 97%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  gap: 16px;
  padding-bottom: 20px;
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
  padding: 8px 12px;
  border-radius: 9999px;
  gap: 8px;
  max-width: 320px; /* Increased width */
  width: 100%;
  height: 40px; /* Slightly taller for better appearance */
  position: relative;
}

.search-bar img {
  width: 20px;
  height: 20px;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 15px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 400px; /* Wider dropdown */
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  margin-top: 6px;
  max-height: 360px; /* Slightly taller to show more results */
  overflow-y: auto;
  z-index: 10;
}

.search-results ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-results li {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-results li:hover {
  background: #f0f0f0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-image {
  width: 60px; /* Larger image for better visibility */
  height: 60px;
  object-fit: cover; /* Ensures aspect ratio is maintained */
  border-radius: 6px;
  flex-shrink: 0; /* Prevents image from shrinking */
}

.result-info {
  flex: 1;
  min-width: 0; /* Allows text to wrap properly */
}

.result-name {
  font-weight: 600;
  font-size: 16px; /* Slightly larger for readability */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-address,
.result-category {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  z-index: 1000;
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

.hide-on-mobile {
  display: flex;
}

.show-on-mobile {
  display: none;
}
@media (max-width: 1366px) {
  .header-right{
   margin-right: 60px;
  }
}

@media (max-width: 860px) {
  .header {
    margin-right: 10px;
  }

  .logo-text {
    font-size: 20px;
  }
  .hide-on-mobile {
    display: none !important;
  }
   .header-right {
    gap: 12px;
  }
   .icon-circle {
    width: 32px;
    height: 32px;
    padding: 3px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .hide-on-mobile {
    display: none !important;
  }

  .search-results {
    width: 90vw;
    left: 5%;
    transform: none;
  }

  .avatar {
    width: 32px;
    height: 32px;
  }


  .show-on-mobile {
    display: flex !important;
    flex-direction: column;
    width: 100%;
  }
}
@media (max-width: 768px){
  .header{
    max-width: 710px;
  }
}
@media (max-width: 548px) {
  .header{
    max-width: 490px;
  }
  .search-bar {
    position: absolute; /* убираем из потока */
    top: 70px; /* ниже header */
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    min-width: 100px;
    padding: 8px 12px;
    box-sizing: border-box;
    z-index: 1000; /* поверх других элементов */
    background-color: white; /* если фон прозрачный — будет перекрытие */
    border-radius: 50px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .search-results{
    transform: translateX(-7%);
  }

  .search-bar input {
    width: 100%;
    min-width: 150px;
    padding: 10px 14px;
    font-size: 16px;
    border-radius: 50px;
  }


}

@media (max-width: 430px) {
  .header{
    max-width: 100px;
  }
  .search-bar {
    position: absolute; /* убираем из потока */
    top: 70px; /* ниже header */
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    min-width: 100px;
    padding: 8px 12px;
    box-sizing: border-box;
    z-index: 1000; /* поверх других элементов */
    background-color: white; /* если фон прозрачный — будет перекрытие */
    border-radius: 50px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .search-results{
    transform: translateX(-7%);
  }

  .search-bar input {
    width: 100%;
    min-width: 150px;
    padding: 10px 14px;
    font-size: 16px;
    border-radius: 50px;
  }


}

@media (max-width: 414px) {
  .header{
    max-width: 100px;
  }
  .search-bar {
    position: absolute; /* убираем из потока */
    top: 70px; /* ниже header */
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    min-width: 100px;
    padding: 8px 12px;
    box-sizing: border-box;
    z-index: 1000; /* поверх других элементов */
    background-color: white; /* если фон прозрачный — будет перекрытие */
    border-radius: 50px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .search-results{
    transform: translateX(-7%);
  }

  .search-bar input {
    width: 100%;
    min-width: 150px;
    padding: 10px 14px;
    font-size: 16px;
    border-radius: 50px;
  }


}
@media (max-width: 390px) {
  .header{
    max-width: 10px;
  }
  .search-bar {
    position: absolute; /* убираем из потока */
    top: 70px; /* ниже header */
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    min-width: 100px;
    padding: 8px 12px;
    box-sizing: border-box;
    z-index: 1000; /* поверх других элементов */
    background-color: white; /* если фон прозрачный — будет перекрытие */
    border-radius: 50px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .search-results{
    transform: translateX(-7%);
  }

  .search-bar input {
    width: 100%;
    min-width: 150px;
    padding: 10px 14px;
    font-size: 16px;
    border-radius: 50px;
  }


}


@media (max-width: 375px) {
  .header{
    max-width: 10px;
  }
  .search-bar {
    position: absolute; /* убираем из потока */
    top: 70px; /* ниже header */
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    min-width: 100px;
    padding: 8px 12px;
    box-sizing: border-box;
    z-index: 1000; /* поверх других элементов */
    background-color: white; /* если фон прозрачный — будет перекрытие */
    border-radius: 50px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .search-results{
    transform: translateX(-7%);
  }

  .search-bar input {
    width: 100%;
    min-width: 150px;
    padding: 10px 14px;
    font-size: 16px;
    border-radius: 50px;
  }


}


@media (max-width: 344px) {
  .header{
    max-width: 10px;
  }
  .search-bar {
    position: absolute; /* убираем из потока */
    top: 70px; /* ниже header */
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    min-width: 100px;
    padding: 8px 12px;
    box-sizing: border-box;
    z-index: 1000; /* поверх других элементов */
    background-color: white; /* если фон прозрачный — будет перекрытие */
    border-radius: 50px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .search-results{
    transform: translateX(-7%);
  }

  .search-bar input {
    width: 100%;
    min-width: 150px;
    padding: 10px 14px;
    font-size: 16px;
    border-radius: 50px;
  }


}








</style>