<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2 v-if="!isRegistering">Вход</h2>
      <h2 v-else>Создание аккаунта</h2>

      <form @submit.prevent="handleSubmit">
        <div v-if="isRegistering" class="form-group">
          <label for="name">Имя</label>
          <input id="name" v-model="name" type="text" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input id="password" v-model="password" type="password" required minlength="6" />
        </div>

        <div class="modal-actions">
          <button type="submit" class="primary-btn">
            {{ isRegistering ? 'Зарегистрироваться' : 'Войти' }}
          </button>
          <button type="button" class="secondary-btn" @click="close">Отмена</button>
        </div>
      </form>

      <div class="toggle-section">
        <span v-if="!isRegistering">Нет аккаунта?</span>
        <span v-else>Уже есть аккаунт?</span>
        <button class="link-btn" @click="toggleMode">
          {{ isRegistering ? 'Войти' : 'Создать аккаунт' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue'

const isOpen = ref(false)
const isRegistering = ref(false)

const name = ref('')
const email = ref('')
const password = ref('')

const emit = defineEmits(['register', 'login'])

function open() {
  isOpen.value = true
  isRegistering.value = false
}
function close() {
  isOpen.value = false
  isRegistering.value = false
  name.value = ''
  email.value = ''
  password.value = ''
}

function toggleMode() {
  isRegistering.value = !isRegistering.value
}

function handleSubmit() {
  if (!email.value || !password.value || (isRegistering.value && !name.value)) return

  if (isRegistering.value) {
    emit('register', {
      name: name.value,
      email: email.value,
      password: password.value,
    })
  } else {
    emit('login', {
      email: email.value,
      password: password.value,
    })
  }
  close()
}

defineExpose({ open, close })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 3rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #444;
}

input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: bold;
  margin: 0 4px;
}

.primary-btn {
  background-color: #0d3c2f;
  color: white;
  border: none;
}

.primary-btn:hover {
  background-color: #125341;
}

.secondary-btn {
  background-color: #f0f0f0;
  color: #333;
  border: none;
}

.secondary-btn:hover {
  background-color: #ddd;
}

.toggle-section {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #555;
}

.link-btn {
  background: none;
  border: none;
  color: #125341;
  cursor: pointer;
  font-weight: 600;
  margin-left: 6px;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

/* Animations */
@keyframes fadeIn {
  from {
    background-color: rgba(0, 0, 0, 0);
  }
  to {
    background-color: rgba(0, 0, 0, 0.6);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
