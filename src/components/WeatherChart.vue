<template>
  <div class="weather-container">
    <div class="day-selector">
      <button 
        v-for="day in availableDays" 
        :key="day.date"
        :class="['day-button', { active: selectedDay === day.date }]"
        @click="selectedDay = day.date"
      >
        {{ day.label }}
      </button>
    </div>
    <div class="weather-grid">
      <div v-for="(weather, index) in filteredWeathers" 
           :key="index" 
           class="weather-card"
           :class="{ 'highlight': isCurrentHour(weather.date) }">
        <div class="weather-time">{{ formatTime(weather.date) }}</div>
        <div class="weather-temp">{{ Math.round(weather.temperature) }}°</div>
        <div class="weather-desc">{{ weather.description }}</div>
        <div class="weather-details">
          <span class="wind">💨 {{ Math.round(weather.wind_speed) }} м/с</span>
          <span v-if="weather.rain > 0" class="rain">🌧 {{ Math.round(weather.rain) }} мм</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  weathers: {
    type: Array,
    required: true
  }
})

const selectedDay = ref(new Date().toISOString().split('T')[0])

const availableDays = computed(() => {
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    let label
    if (i === 0) {
      label = 'Сегодня'
    } else if (i === 1) {
      label = 'Завтра'
    } else {
      label = date.toLocaleString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      })
    }
    
    days.push({
      date: date.toISOString().split('T')[0],
      label
    })
  }
  
  return days
})

const filteredWeathers = computed(() => {
  return props.weathers
    .filter(weather => {
      const weatherDate = new Date(weather.date).toISOString().split('T')[0]
      return weatherDate === selectedDay.value
    })
    .slice(0, 8) // Показываем 8 точек для каждого дня
})

const formatTime = (date) => {
  return new Date(date).toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isCurrentHour = (date) => {
  const now = new Date()
  const weatherDate = new Date(date)
  return now.getHours() === weatherDate.getHours() && 
         now.getDate() === weatherDate.getDate()
}
</script>

<style scoped>
.weather-container {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.day-selector {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.day-button {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.day-button:hover {
  border-color: #2196f3;
  color: #2196f3;
}

.day-button.active {
  background: #2196f3;
  border-color: #2196f3;
  color: white;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.weather-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.weather-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.weather-card.highlight {
  background: #e3f2fd;
  border-color: #90caf9;
}

.weather-time {
  font-size: 1.2em;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.weather-temp {
  font-size: 2em;
  font-weight: 700;
  color: #2196f3;
  margin: 8px 0;
}

.weather-desc {
  color: #333;
  margin: 8px 0;
  font-size: 1.1em;
}

.weather-details {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.9em;
  color: #666;
}

.wind, .rain {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .weather-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .weather-card {
    padding: 12px;
  }
  
  .weather-temp {
    font-size: 1.5em;
  }
  
  .weather-time {
    font-size: 1em;
  }

  .day-selector {
    gap: 6px;
  }
  
  .day-button {
    padding: 6px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .weather-grid {
    grid-template-columns: 1fr;
  }

  .day-selector {
    flex-direction: row;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 8px;
    margin: 0 -20px 20px -20px;
    padding: 0 20px 8px 20px;
  }

  .day-button {
    flex: 0 0 auto;
  }
}
</style> 