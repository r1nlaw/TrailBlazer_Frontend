<template>
  <transition name="fade-slide">
    <section v-if="visible" class="profile-section">
      <header class="profile-header">
        <img
          :src="getAvatarSrc"
          alt="Фото профиля"
          class="avatar"
        />
        <div class="info">
          <h2 class="name">{{ profile.name || 'Гость' }}</h2>
          <p class="bio">{{ profile.bio || 'Пожалуйста, зарегистрируйтесь, чтобы настроить профиль' }}</p>
          <div class="stars" v-if="isAuthenticated">
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
        <button v-if="isAuthenticated" class="edit-button" @click="toggleEdit">
          {{ isEditing ? ' Сохранить' : ' Редактировать' }}
        </button>
        <button v-else class="edit-button" @click="openRegisterModal">
          Зарегистрироваться
        </button>
      </header>

      <!-- Routes -->
      <section class="routes" v-if="isAuthenticated">
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

      <!-- Modal -->
      <RegisterModal ref="registerModalRef" @register="handleRegister" />
    </section>
  </transition>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import avatarImage from '@/assets/images/user_avatar.png'
import RegisterModal from '@/components/RegisterModal.vue'

const visible = ref(false)
const isEditing = ref(false)
const registerModalRef = ref(null)
const isAuthenticated = ref(false)
const router = useRouter()

const profile = reactive({
  photo: '',
  name: '',
  bio: '',
  rating: 0,
  routes: [],
})

const edited = reactive({
  photo: '',
  name: '',
  bio: '',
})

const domain = `${import.meta.env.VITE_BACKEND_URL}`

onMounted(async () => {
  const token = localStorage.getItem("token")
  isAuthenticated.value = !!token

  if (isAuthenticated.value) {
    try {
      const response = await fetch(`${domain}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        isAuthenticated.value=false;
        visible.value = true
        return;
      }

      const data = await response.json()
      profile.name = data.username || localStorage.getItem("username") || ''
      profile.bio = data.user_bio || 'Люблю путешествовать и открывать новые маршруты!'
      profile.photo = data.avatar || ''
      profile.rating = data.rating || 4.7
      profile.routes = data.routes || [
        { id: 1, name: 'Крымская тропа' },
        { id: 2, name: 'Пеший маршрут по горам' },
        { id: 3, name: 'Велоэкскурсия по городу' },
      ]
      localStorage.setItem("user_id", data.user_id)

      edited.name = profile.name
      edited.bio = profile.bio
      edited.photo = profile.photo
    } catch (err) {
      console.error(err)
      alert('Не удалось загрузить профиль: ' + err.message)
    }
  }

  visible.value = true
})

const filledStars = computed(() => Math.round(profile.rating))

const getAvatarSrc = computed(() => {
  const base64 = edited.photo || profile.photo
  return base64 ? `data:image/jpeg;base64,${base64}` : avatarImage
})

async function toggleEdit() {
  if (!isAuthenticated.value) {
    showModal.value = true
    return
  }

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
  if (!isAuthenticated.value) {
    showModal.value = true
    return
  }

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
function openRegisterModal() {
  registerModalRef.value?.open()
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

.edit-input,
.edit-textarea {
  width: 100%;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  color: #1e293b;
}

.modal p {
  margin: 0 0 1.5rem;
  color: #64748b;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-button {
  background: #0d3c2f;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.modal-button:hover {
  background: #135845;
}

.modal-button.cancel {
  background: #64748b;
}

.modal-button.cancel:hover {
  background: #7f8c9e;
}
</style>