<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <!-- Ошка-модалка -->
    <div v-if="errorModal" class="error-modal">
      <div class="error-box">
        <h3>Ошибка</h3>
        <p>{{ errorMessage }}</p>
        <button @click="errorModal = false" class="primary-btn">Закрыть</button>
      </div>
    </div>

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

        <div class="form-group password-group">
        <label for="password">Пароль</label>
        <div class="password-wrapper">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
          />
          <button
            type="button"
            class="toggle-password"
            @click="togglePassword"
            :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
          >
            <img
              :src="showPassword ? eyeOffIcon : eyeIcon"
              alt="toggle password visibility"
              class="toggle-icon"
            />
          </button>
        </div>
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
import eyeIcon from '@/assets/icons/eye.png'
import eyeOffIcon from '@/assets/icons/eye-off.png'

const isOpen = ref(false)
const isRegistering = ref(false)

const name = ref('')
const email = ref('')
const password = ref('')

const showPassword = ref(false)

const errorModal = ref(false)
const errorMessage = ref('')

function togglePassword() {
  showPassword.value = !showPassword.value
}

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
  showPassword.value = false 
}

function toggleMode() {
  isRegistering.value = !isRegistering.value
}

function showError(message) {
  errorMessage.value = message
  errorModal.value = true
}

async function handleSubmit() {
  if (!email.value || !password.value || (isRegistering.value && !name.value)) {
    showError('Пожалуйста, заполните все поля формы.')
    return
  }

  try {
    const endpoint = isRegistering.value
      ? `${import.meta.env.VITE_BACKEND_URL}/user/signUp`
      : `${import.meta.env.VITE_BACKEND_URL}/user/signIn`

    const payload = isRegistering.value
      ? { username: name.value, email: email.value, password_hash: password.value }
      : { email: email.value, password_hash: password.value }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      let message = 'Неизвестная ошибка'

      switch (response.status) {
        case 400:
          message = 'Неверно введена электронная почта'
          break
        case 401:
          message = 'Недопустимый никнейм'
          break
        case 402:
          message = 'Имя должно состоять только из латиницы или кириллицы'
          break
        case 403:
          message = 'Пароль должен содержать больше 6 символов'
          break
        case 405:
          message = 'Неверный email или пароль'
          break
        default:
          message = await response.text()
      }

      showError(`Ошибка: ${message}`)
      return
    }
    if (isRegistering.value==true){
      isRegistering.value = false;
      handleSubmit()

    }
    const data = await response.json()
    if (data.user!=null){
      localStorage.setItem("username",data.user.username);
      localStorage.setItem("user_id",data.user.id);
    }
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    window.location.reload();

    close()
  } catch (error) {
    console.error('Ошибка при отправке запроса:', error)
    showError('Не удалось подключиться к серверу. Проверьте соединение.')
  }
}

defineExpose({ open, close })
</script>


<style scoped>
input{
  max-width: 475px;
}
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

.error-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1600;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-box {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.error-box h3 {
  color: #b00020;
  margin-bottom: 1rem;
}

.error-box p {
  color: #333;
  margin-bottom: 1.5rem;
}

.password-group {
  position: relative;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.toggle-icon {
  width: 20px;
  height: 20px;
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
