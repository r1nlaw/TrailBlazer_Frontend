<template>
  <div class="landmark-page">
    <div v-if="loading" class="status-message">Загрузка...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <transition name="fade" appear>
      <div v-if="!loading && !error" class="landmark-card">
        <h1 class="landmark-title">{{ landmark.name }}</h1>

        <div class="landmark-main">
          <img
            :src="domain + '/images/' + landmark.image_path"
            :alt="landmark.name"
            class="landmark-image slide-left"
            @error="handleImageError"
          />

          <div class="landmark-info slide-right">
            <p><strong>📍 Адрес:</strong> {{ landmark.address }}</p>
            <p><strong>🏷 Категория:</strong> {{ landmark.category }}</p>
            <p><strong>ℹ️ Описание:</strong> {{ landmark.description }}</p>
            <p><strong>📖 История:</strong> {{ landmark.history }}</p>
          </div>
        </div>

        <div v-if="landmark.schedules && landmark.schedules.length" class="landmark-section">
          <h3>🕒 Расписание</h3>
          <ul>
            <li v-for="schedule in landmark.schedules" :key="schedule.start">
              {{ schedule.description }}: {{ formatDate(schedule.start) }} – {{ formatDate(schedule.end) }}
            </li>
          </ul>
        </div>

        <div v-if="landmark.prices && landmark.prices.length" class="landmark-section">
          <h3>💰 Цены</h3>
          <ul>
            <li v-for="price in landmark.prices" :key="price.description">
              {{ price.description }}: {{ price.value }} {{ price.currency }}
            </li>
          </ul>
        </div>

        <div class="landmark-section">
          <h3>🌍 Местоположение</h3>
          <p>Широта: {{ landmark.location.lat }}, Долгота: {{ landmark.location.lng }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'

const route = useRoute()
const domain = `${import.meta.env.VITE_BACKEND_URL}`
const landmark = ref({})
const loading = ref(true)
const error = ref('')

async function fetchLandmark() {
  try {
    loading.value = true
    const response = await fetch(`${domain}/api/landmark/${encodeURIComponent(route.params.name)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Достопримечательность не найдена')
    landmark.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function handleImageError(event) {
  event.target.src = '/placeholder-image.png'
}

watchEffect(() => {
  if (!loading.value && landmark.value?.name) {
    const name = landmark.value.name
    const address = landmark.value.address
    useHead({
      title: `${name} — достопримечательность Крыма`,
      meta: [
        {
          name: 'description',
          content: `${name} в Крыму по адресу ${address}. История, факты и фотографии.`,
        },
        {
          name: 'keywords',
          content: `${name},${address},Крым,Путевод,туризм,интересные места Крым,куда сходить в Крыму,достопримечательности`,
        },
      ],
    })
  }
})

onMounted(fetchLandmark)
watch(() => route.params.name, fetchLandmark)
</script>

<style scoped>
.landmark-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  overflow-y: scroll;
}

.status-message {
  text-align: center;
  font-size: 18px;
  padding: 40px 0;
  color: #666;
}

.status-message.error {
  color: #c00;
}

.landmark-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.landmark-title {
  font-size: 28px;
  margin-bottom: 16px;
  color: #2c3e50;
  text-align: center;
}

.landmark-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  margin: 0 auto 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.landmark-info p {
  margin: 12px 0;
  line-height: 1.5;
}

.landmark-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.landmark-section h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #34495e;
}

.landmark-section ul {
  list-style-type: disc;
  padding-left: 24px;
}

.landmark-section li {
  margin-bottom: 8px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

.landmark-main {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
}

.landmark-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  opacity: 0;
  transform: translateX(-50px);
  animation: slideInLeft 0.8s ease forwards;
}

.landmark-info {
  flex: 1;
  min-width: 250px;
  opacity: 0;
  transform: translateX(50px);
  animation: slideInRight 0.8s ease forwards;
}

@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}


</style>
