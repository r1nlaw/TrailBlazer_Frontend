<template>
  <div class="landmark-page">
    <!-- Модальное окно для просмотра изображений -->
    <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
      <div class="modal-content">
        <img :src="selectedImage" alt="Увеличенное изображение" />
        <button class="modal-close" @click="closeImageModal">×</button>
      </div>
    </div>

    <!-- Уведомление -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <div class="notification-content">
        <span class="notification-icon">{{ notification.type === 'error' ? '❌' : '✅' }}</span>
        <span class="notification-message">{{ notification.message }}</span>
      </div>
      <button class="notification-close" @click="notification.show = false">×</button>
    </div>

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

        <div class="landmark-section reviews-section">
          <h3>⭐ Путевые заметки </h3>
          
          <!-- Форма для добавления отзыва -->
          <div class="review-form">
            <h4>Оставить отзыв</h4>
            <div class="rating-input">
              <label>Оценка (1-10):</label>
              <input 
                type="number" 
                v-model.number="newReview.rating" 
                min="1" 
                max="10" 
                required 
                class="rating-field"
              />
            </div>
            <div class="review-text-input">
              <label>Ваш отзыв (до 1500 символов):</label>
              <textarea 
                v-model="newReview.text" 
                maxlength="1500" 
                placeholder="Напишите ваш отзыв здесь..." 
                class="review-textarea"
              ></textarea>
              <p class="char-count">{{ newReview.text.length }}/1500</p>
            </div>
            <div class="review-photos-input">
              <label>Фотографии (до 5):</label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                @change="handlePhotoUpload" 
                class="photo-upload"
              />
              <div class="photo-preview">
                <div v-for="(photo, index) in newReview.photos" :key="index" class="photo-preview-item">
                  <img :src="photo.url" :alt="'Фото ' + (index + 1)" />
                  <button @click="removePhoto(index)" class="remove-photo">✖</button>
                </div>
              </div>
            </div>
            <button 
              @click="submitReview" 
              :disabled="!isReviewValid || submitting" 
              class="submit-review-button"
            >
              {{ submitting ? 'Отправка...' : 'Отправить отзыв' }}
            </button>
          </div>

          <!-- Кнопка фильтрации -->
          <div class="reviews-filter">
            <button 
              class="filter-button" 
              :class="{ active: onlyPhotos }"
              @click="togglePhotoFilter"
            >
              <span class="filter-icon">📸</span>
              {{ onlyPhotos ? 'Показать все отзывы' : 'Только с фото' }}
            </button>
          </div>

          <!-- Список отзывов -->
          <div v-if="reviews && reviews.reviews && Object.keys(reviews.reviews).length" class="reviews-list">
            <div v-for="(review, index) in Object.values(reviews.reviews)" :key="index" class="card review-card" :style="{ animationDelay: (index * 100) + 'ms' }">
              <div class="review-content">
                <div class="title-row">
                  <h3 class="review-title">{{ review.username }}</h3>
                  <div class="rating">
                    <span class="star-icon">★</span>
                    <span>{{ review.rating }}/10</span>
                  </div>
                </div>
                <p class="review-text">{{ review.review }}</p>
                <div v-if="review.images && Object.keys(review.images).length" class="review-photos">
                  <img 
                    v-for="(imageData, imageName) in review.images" 
                    :key="imageName" 
                    :src="'data:image/png;base64,' + imageData" 
                    :alt="'Фото отзыва ' + imageName" 
                    class="review-photo"
                    @click="openImageModal('data:image/png;base64,' + imageData)"
                  />
                </div>
              </div>
              <div class="img" v-if="review.avatar && review.avatar !== ''">
                <img :src="review.avatar" class="avatar-image" :alt="review.username" />
              </div>
            </div>
          </div>
          <div v-else class="no-reviews">
            Пока нет отзывов. Будьте первым!
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
import {  computed } from 'vue'

const route = useRoute()
const domain = `${import.meta.env.VITE_BACKEND_URL}`
const landmark = ref({})
const loading = ref(true)
const error = ref('')
const reviews = ref([])
const newReview = ref({
  rating: null,
  text: '',
  photos: []
})
const submitting = ref(false)
const notification = ref({
  show: false,
  message: '',
  type: 'success'
})
const selectedImage = ref(null)
const onlyPhotos = ref(false)

async function fetchLandmark() {
  try {
    loading.value = true
    const response = await fetch(`${domain}/api/landmark/${encodeURIComponent(route.params.name)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Достопримечательность не найдена')
    landmark.value = await response.json()
    await fetchReviews()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function fetchReviews() {
  try {
    const response = await fetch(`${domain}/user/review/get/${encodeURIComponent(route.params.name)}${onlyPhotos.value ? '?only_photo=true' : ''}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Не удалось загрузить отзывы')
    reviews.value = await response.json()
  } catch (err) {
    console.error('Ошибка загрузки отзывов:', err)
  }
}

function showNotification(message, type = 'success') {
  notification.value = {
    show: true,
    message,
    type
  }
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

async function submitReview() {
  if (!isReviewValid.value) {
    showNotification('Пожалуйста, заполните все поля корректно', 'error')
    return
  }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append("user_id", localStorage.getItem("user_id"))
    formData.append("landmark_id", landmark.value.id)
    formData.append('rating', newReview.value.rating)
    formData.append('review', newReview.value.text)
    newReview.value.photos.forEach((photo, index) => {
      const filename = photo.file.name || `photo_${index}_${Date.now()}.jpg`
      formData.append(`images[${filename}]`, photo.file)
    })
    const token = localStorage.getItem("token")

    const response = await fetch(`${domain}/user/review/add/${encodeURIComponent(route.params.name)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Не удалось отправить отзыв')
    }

    const newReviewData = await response.json()
    showNotification('Отзыв успешно добавлен!')
  } catch (err) {
    console.error('Ошибка при отправке отзыва:', err)
    showNotification(err.message || 'Не удалось отправить отзыв. Попробуйте снова.', 'error')
  } finally {
    submitting.value = false
  }
}

function handlePhotoUpload(event) {
  const files = Array.from(event.target.files).slice(0, 5 - newReview.value.photos.length)
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      newReview.value.photos.push({
        file,
        url: URL.createObjectURL(file)
      })
    }
  })
}

function removePhoto(index) {
  newReview.value.photos.splice(index, 1)
}

const isReviewValid = computed(() => {
  return newReview.value.rating >= 1 && 
         newReview.value.rating <= 10 && 
         newReview.value.text.trim().length > 0 && 
         newReview.value.text.length <= 1500
})

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

function openImageModal(imageSrc) {
  selectedImage.value = imageSrc
  document.body.style.overflow = 'hidden'
}

function closeImageModal() {
  selectedImage.value = null
  document.body.style.overflow = 'auto'
}

function togglePhotoFilter() {
  onlyPhotos.value = !onlyPhotos.value
  fetchReviews()
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
  width: 100%;
  margin: 0;
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
  max-width: 1400px;
  margin: 0 auto;
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

.reviews-section {
  margin-top: 32px;
}

.review-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.review-form h4 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #2c3e50;
}

.rating-input, .review-text-input, .review-photos-input {
  margin-bottom: 16px;
}

.rating-input label, .review-text-input label, .review-photos-input label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #34495e;
}

.rating-field {
  width: 100px;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.review-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
}

.char-count {
  font-size: 14px;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.photo-upload {
  padding: 8px;
}

.photo-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.photo-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.photo-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.remove-photo {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #c00;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

.submit-review-button {
  background: #2196f3;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.submit-review-button:disabled {
  background: #90caf9;
  cursor: not-allowed;
}

.submit-review-button:hover:not(:disabled) {
  background: #1976d2;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 32px;
}

.review-card {
  display: flex;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease forwards;
  opacity: 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.review-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.review-content {
  flex: 1;
  padding: 24px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.review-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff9800;
  font-weight: 600;
  background: rgba(255, 152, 0, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
}

.star-icon {
  font-size: 18px;
}

.review-text {
  color: #4a4a4a;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 15px;
}

.review-photos {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.review-photo {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.review-photo:hover {
  transform: scale(1.05);
}

.img {
  width: 140px;
  min-width: 140px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
}

.avatar-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.no-reviews {
  text-align: center;
  color: #666;
  font-style: italic;
}

@media (max-width: 768px) {
  .review-card {
    flex-direction: column;
  }

  .img {
    width: 100%;
    height: 160px;
    border-left: none;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .avatar-image {
    width: 120px;
    height: 120px;
  }

  .review-photo {
    width: 100px;
    height: 100px;
  }

  .review-content {
    padding: 20px;
  }

  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .rating {
    align-self: flex-start;
  }
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background-color: #4caf50;
  color: white;
}

.notification.error {
  background-color: #f44336;
  color: white;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
}

.notification-message {
  font-size: 14px;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  cursor: pointer;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
  margin: auto;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 8px;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.modal-close:hover {
  opacity: 1;
}

.reviews-filter {
  margin: 20px 0;
  display: flex;
  justify-content: flex-end;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #2196f3;
  border-radius: 25px;
  background: transparent;
  color: #2196f3;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background: rgba(33, 150, 243, 0.1);
}

.filter-button.active {
  background: #2196f3;
  color: white;
}

.filter-icon {
  font-size: 18px;
}
</style>