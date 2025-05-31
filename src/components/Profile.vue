<template>
  <transition name="fade-slide">
    <section v-if="visible" class="profile-section">
      <header class="profile-header">
        <label v-if="isEditing" class="avatar-label" title="Нажмите, чтобы изменить аватар">
          <img
            :src="getAvatarSrc"
            alt="Фото профиля"
            class="avatar"
          />
          <input type="file" @change="onFileChange" class="file-input" />
        </label>
        <img
          v-else
          :src="getAvatarSrc"
          alt="Фото профиля"
          class="avatar"
          :class="{ 'avatar-editing': isEditing }"
        />

        <div class="info">
          <template v-if="isEditing">
            <input v-model="edited.name" placeholder="Введите имя" class="edit-input" />
            <textarea v-model="edited.bio" placeholder="Введите био" class="edit-textarea"></textarea>
            <!-- Кнопка выбора файла убрана, теперь через клик по аватару -->
          </template>
          <template v-else>
            <h2 class="name">{{ profile.name }}</h2>
            <p class="bio">{{ profile.bio }}</p>
          </template>

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

        <button class="edit-button" @click="toggleEdit">
          {{ isEditing ? ' Сохранить' : ' Редактировать' }}
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
const isEditing = ref(false)
const username = localStorage.getItem("username")

const profile = reactive({
  photo: '', // base64-строка
  name: username,
  bio: 'Люблю путешествовать и открывать новые маршруты!',
  rating: 4.7,
  routes: [
    { id: 1, name: 'Крымская тропа' },
    { id: 2, name: 'Пеший маршрут по горам' },
    { id: 3, name: 'Велоэкскурсия по городу' },
  ],
})

const edited = reactive({
  photo: '',
  name: profile.name,
  bio: profile.bio,
})
const domain = `${import.meta.env.VITE_BACKEND_URL}`

onMounted(async () => {

  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${domain}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ошибка загрузки профиля: ${errorText}`)
    }

    const data = await response.json()

    profile.name = data.username
    profile.bio = data.user_bio
    profile.photo = data.avatar 
    profile.rating = data.rating || 4.7
    profile.routes = data.routes || []

  } catch (err) {
    console.error(err)
    alert('Не удалось загрузить профиль: ' + err.message)
  }

  visible.value = true
})

const filledStars = computed(() => Math.round(profile.rating))

const getAvatarSrc = computed(() => {
  const base64 = edited.photo || profile.photo
  return base64 ? `data:image/jpeg;base64,${base64}` : avatarImage
})

async function toggleEdit() {
  if (isEditing.value) {
    try {
      const token = localStorage.getItem("token")

      let avatarData = null
      if (edited.photo) {
        avatarData = edited.photo
      }

      const payload = {
        username: edited.name,
        user_bio: edited.bio,
        avatar: avatarData,
      }

      const response = await fetch(`${domain}/user/changeProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ошибка при сохранении профиля: ${errorText}`)
      }

      profile.name = edited.name
      profile.bio = edited.bio
      if (edited.photo) profile.photo = edited.photo

    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  } else {
    edited.name = profile.name
    edited.bio = profile.bio
    edited.photo = profile.photo
  }

  isEditing.value = !isEditing.value
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      edited.photo = base64
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

.avatar-editing {
  cursor: pointer; 
}

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

.avatar-label {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.avatar-label .avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(39, 158, 58, 0.35);
  border: 3px solid #ffffff;
  display: block;
}

.file-input {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
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

.edit-input, .edit-textarea {
  width: 100%;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}
</style>
