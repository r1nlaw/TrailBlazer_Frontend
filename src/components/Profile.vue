<template>
  <transition name="fade-slide">
    <section v-if="visible" class="profile-section">
      <!-- Header -->
      <header class="profile-header">
        <img :src="profile.photo" alt="Фото профиля" class="avatar" />
        <div class="info">
          <h2 class="name">{{ profile.name }}</h2>
          <p class="bio">{{ profile.bio }}</p>

          <div class="stars">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ filled: n <= filledStars }"
            >
              ★
            </span>
            <span class="rating-number">{{ profile.rating.toFixed(1) }}</span>
          </div>
        </div>

        <button class="edit-button" @click="editProfile">
          ✏️ Редактировать
        </button>
      </header>

      <!-- Routes -->
      <section class="routes">
        <h3>Мои маршруты</h3>
        <ul>
          <li v-for="route in profile.routes" :key="route.id">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span>{{ route.name }}</span>
          </li>
        </ul>
      </section>
    </section>
  </transition>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import avatarImage from '@/assets/images/user_avatar.png'

const visible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true
  })
})

const profile = reactive({
  photo: avatarImage,
  name: 'Иван Иванов',
  bio: 'Люблю путешествовать и открывать новые маршруты!',
  rating: 4.7,
  routes: [
    { id: 1, name: 'Крымская тропа' },
    { id: 2, name: 'Пеший маршрут по горам' },
    { id: 3, name: 'Велоэкскурсия по городу' },
  ],
})

const filledStars = computed(() => Math.round(profile.rating))

function editProfile() {
  alert('Переход к редактированию профиля')
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

.profile-section {
  max-width: 780px;
  margin: 3.5rem auto 0;
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: space-between;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(39, 158, 58, 0.35);
  border: 3px solid #ffffff;
}

.info {
  flex: 1;
}

.name {
  margin: 0;
  font-size: 1.9rem;
  color: #0f172a;
}

.bio {
  margin: 0.35rem 0 0.75rem;
  color: #64748b;
  font-style: italic;
}

.stars {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.25rem;
}

.star {
  color: #e2e8f0;
  transition: color 0.3s;
}

.star.filled {
  color: #fbbf24;
}

.rating-number {
  margin-left: 0.25rem;
  font-weight: 600;
  color: #1e293b;
}

.edit-button {
  background: #0d3c2f;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.edit-button:hover {
  background: #135845;
}

.routes h3 {
  margin: 0 0 1rem;
  font-size: 1.35rem;
  color: #1e293b;
}

.routes ul {
  display: grid;
  gap: 0.75rem;
  padding-left: 0;
  list-style: none;
  margin: 0;
}

.routes li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.routes li svg {
  width: 18px;
  height: 18px;
  fill: #135845;
  flex-shrink: 0;
}

.routes li:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.fade-slide-enter-active {
  transition: all 0.45s ease;
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
