<template>
  <transition name="fade-slide">
    <div class="profile" v-if="visible">
      <div class="profile-header">
        <img :src="profile.photo" alt="Profile photo" class="profile-photo" />
        <div class="profile-info">
          <h2>{{ profile.name }}</h2>
          <p class="bio">{{ profile.bio }}</p>
          <div class="rating">
            Рейтинг: <strong>{{ profile.rating.toFixed(1) }}</strong> ⭐
          </div>
        </div>
      </div>

      <div class="routes">
        <h3>Мои маршруты</h3>
        <ul>
          <li v-for="route in profile.routes" :key="route.id">
            {{ route.name }}
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>


<script setup>
import { reactive, ref, onMounted } from 'vue'
import avatarImage from '@/assets/images/user_avatar.png'
const visible = ref(false)

onMounted(() => {
  setTimeout(() => {
    visible.value = true
  }, 50) 
})

const profile = reactive({
  photo: avatarImage,
  name: 'Иван Иванов',
  bio: 'Люблю путешествовать и открывать новые маршруты!',
  rating: 2150,
  routes: [
    { id: 1, name: 'Крымская тропа' },
    { id: 2, name: 'Пеший маршрут по горам' },
    { id: 3, name: 'Велоэкскурсия по городу' },
  ],
})

</script>

<style scoped>
.profile {
  max-width: 1000px;
  margin-top: 100px;
  padding: 30px;
  background: #ffffff;
  border: 1px solid;
  box-shadow: 2px 6px 20px rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  font-family: 'Montserrat', sans-serif;
  transition: 0.3s ease;

}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 30px;
}

.profile-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 4px #3b82f6;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #0f172a;
}

.bio {
  margin-top: 8px;
  color: #64748b;
  font-style: italic;
}

.rating {
  margin-top: 10px;
  color: #f59e0b;
  font-weight: 600;
}

.routes h3 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #1e293b;
}

.routes ul {
  padding-left: 20px;
  list-style: disc;
  color: #334155;
}

.routes li {
  margin-bottom: 8px;
  transition: color 0.2s;
}

.routes li:hover {
  color: #3b82f6;
  cursor: pointer;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-enter-active {
  transition: all 0.6s ease;
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

</style>
