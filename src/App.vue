<template>
  <div class="app-container">
    <Header />
    <div class="main-content">
      <Sidebar v-if="!isProfilePage && !isLandmarkPage"/>
      <MainMapAndList v-if="!isProfilePage && !isLandmarkPage" />
      <RegisterModal ref="registerModal" @register="handleRegister" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import MainMapAndList from './components/MainMapAndList.vue'
import RegisterModal from './components/RegisterModal.vue'

const registerModal = ref()
const route = useRoute()

const isProfilePage = computed(() => route.path === '/profile')
const isLandmarkPage = computed(() => /^\/landmark\/[^/]+$/.test(route.path))

function handleRegister(userData) {
  console.log('Зарегистрирован пользователь:', userData)
  // Здесь можно добавить API-запрос
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.register-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1000;
}

.register-button:hover {
  background-color: #0056b3;
}

html,
body,
#app {
  font-optical-sizing: auto;
  height: 100%;
  margin: 0;
}
</style>
