<template>
  <div class="landmark-page">
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <h1>{{ landmark.name }}</h1>
      <img
        :src="domain + '/images/' + landmark.image_path"
        :alt="landmark.name"
        class="landmark-image"
        @error="handleImageError"
      />
      <p><strong>Адрес:</strong> {{ landmark.address }}</p>
      <p><strong>Категория:</strong> {{ landmark.category }}</p>
      <p><strong>Описание:</strong> {{ landmark.description }}</p>
      <p><strong>История:</strong> {{ landmark.history }}</p>

      <div class="schedules">
        <h3>Расписание</h3>
        <ul>
          <li v-for="schedule in landmark.schedules" :key="schedule.start">
            {{ schedule.description }}: {{ formatDate(schedule.start) }} - {{ formatDate(schedule.end) }}
          </li>
        </ul>
      </div>

      <div class="prices">
        <h3>Цены</h3>
        <ul>
          <li v-for="price in landmark.prices" :key="price.description">
            {{ price.description }}: {{ price.value }} {{ price.currency }}
          </li>
        </ul>
      </div>

      <div class="location">
        <h3>Местоположение</h3>
        <p>Широта: {{ landmark.location.lat }}, Долгота: {{ landmark.location.lng }}</p>
      </div>
    </div>
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
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Достопримечательность не найдена')
    }

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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.landmark-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 16px;
}

h1 {
  font-size: 24px;
  margin-bottom: 16px;
}

h3 {
  font-size: 18px;
  margin-top: 16px;
}

p,
ul {
  margin-bottom: 12px;
}

ul {
  padding-left: 20px;
}
</style>
