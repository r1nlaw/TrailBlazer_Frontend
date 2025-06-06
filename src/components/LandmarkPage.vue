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
        <div v-if="landmark.weathers && landmark.weathers.length" class="landmark-section">
          <h3>🌤 Прогноз погоды</h3>
          <WeatherChart :weathers="landmark.weathers" />
        </div>

        <div class="landmark-section">
          <h3>🌍 Местоположение</h3>
          <div class="coordinates-container">
            <div class="coordinate-item">
              <span class="coordinate-label">Широта:</span>
              <div class="coordinate-value" @click="copyToClipboard(landmark.location.lat)">
                {{ landmark.location.lat }}
                <span class="copy-icon">📋</span>
              </div>
            </div>
            <div class="coordinate-item">
              <span class="coordinate-label">Долгота:</span>
              <div class="coordinate-value" @click="copyToClipboard(landmark.location.lng)">
                {{ landmark.location.lng }}
                <span class="copy-icon">📋</span>
              </div>
            </div>
            <div class="coordinate-item full-width">
              <span class="coordinate-label">Координаты:</span>
              <div class="coordinate-value" @click="copyToClipboard(`${landmark.location.lat}, ${landmark.location.lng}`)">
                {{ landmark.location.lat }}, {{ landmark.location.lng }}
                <span class="copy-icon">📋</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import WeatherChart from './WeatherChart.vue'

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

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    // Можно добавить уведомление об успешном копировании
  } catch (err) {
    console.error('Ошибка при копировании:', err)
  }
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

.weather-details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.weather-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.weather-icon {
  font-size: 2em;
  margin-bottom: 8px;
}

.weather-info {
  width: 100%;
}

.weather-date {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 4px;
}

.weather-temp {
  font-size: 1.5em;
  font-weight: bold;
  margin: 8px 0;
}

.weather-desc {
  color: #444;
  margin-bottom: 8px;
}

.weather-wind {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 0.9em;
  color: #666;
}

.coordinates-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.coordinate-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.coordinate-item:last-child {
  margin-bottom: 0;
}

.coordinate-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 100px;
}

.coordinate-value {
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.coordinate-value:hover {
  border-color: #2196f3;
  background: #e3f2fd;
}

.copy-icon {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.coordinate-value:hover .copy-icon {
  opacity: 1;
}

.full-width {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.full-width .coordinate-value {
  flex: 1;
}

@media (max-width: 480px) {
  .coordinate-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .coordinate-label {
    min-width: auto;
  }

  .coordinate-value {
    width: 100%;
  }
}

</style>
